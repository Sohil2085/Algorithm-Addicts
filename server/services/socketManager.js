import jwt from "jsonwebtoken";

const connectedUsers = new Map(); // Maps userId -> socketId

export function initGlobalSocket(io) {
  io.on("connection", (socket) => {
    // Authenticate globally using handshake query or auth token
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      console.log(`[GlobalSocket] Connection rejected - No token provided: ${socket.id}`);
      return socket.disconnect(true);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;
      
      socket.userId = userId;
      connectedUsers.set(userId, socket.id);
      
      console.log(`[GlobalSocket] User ${userId} connected payload listener on socket: ${socket.id}`);
      console.log(`[GlobalSocket] Active connections tracker:`, Array.from(connectedUsers.keys()));
      
      socket.on("disconnect", () => {
        if (connectedUsers.get(userId) === socket.id) {
          connectedUsers.delete(userId);
          console.log(`[GlobalSocket] User ${userId} disconnected payload listener.`);
        }
      });
    } catch (error) {
      console.error(`[GlobalSocket] Auth error for socket ${socket.id}:`, error.message);
      return socket.disconnect(true);
    }
  });
}

/**
 * Emit an event to a specific online user.
 * @param {import('socket.io').Server} io - Full IO instance
 * @param {string} userId - Target user's DB ID
 * @param {string} eventName - Socket event to emit
 * @param {any} payload - Data payload
 */
export function notifyUser(io, userId, eventName, payload) {
  const socketId = connectedUsers.get(userId);
  console.log(`[GlobalSocket] Attempting to notify user ${userId} with event ${eventName}...`);
  if (socketId) {
    console.log(`[GlobalSocket] Success - user ${userId} found at socket ${socketId}. Emitting payload.`);
    io.to(socketId).emit(eventName, payload);
    return true;
  }
  console.log(`[GlobalSocket] Failed - user ${userId} is not currently tracked as online.`);
  return false;
}
