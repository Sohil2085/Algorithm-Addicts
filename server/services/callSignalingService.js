import jwt from "jsonwebtoken";

/**
 * Socket.IO signaling service for WebRTC.
 * Registered on the "/call" namespace.
 *
 * Events relayed: call:offer, call:answer, call:ice-candidate
 * Chat relay:     call:chat-message
 * Lifecycle:      call:join, call:leave
 */

export function registerCallSocket(io) {
  const callNs = io.of("/call");

  // Active room tracking: dealId → { participants: { userId: socketId } }
  const rooms = {};

  callNs.use((socket, next) => {
    const { roomToken, userToken } = socket.handshake.auth;
    if (!roomToken) return next(new Error("Missing room token"));

    try {
      const payload = jwt.verify(roomToken, process.env.JWT_SECRET);
      socket.dealId = payload.dealId;
      socket.lenderId = payload.lenderId;
      socket.msmeId = payload.msmeId;
    } catch {
      return next(new Error("Invalid room token"));
    }

    try {
      if (userToken) {
        const u = jwt.verify(userToken, process.env.JWT_SECRET);
        socket.userId = u.id;
      }
    } catch { /* best effort */ }

    next();
  });

  callNs.on("connection", (socket) => {
    const roomId = `call:${socket.dealId}`;

    // ─── JOIN ─────────────────────────────────────────────
    socket.on("call:join", () => {
      if (!rooms[roomId]) rooms[roomId] = { participants: {} };
      const room = rooms[roomId];

      // fallback to socket.id if userId isn't available
      const userId = socket.userId || socket.id;

      const activeUsers = Object.keys(room.participants);
      
      if (activeUsers.length >= 2 && !room.participants[userId]) {
        socket.emit("call:error", { message: "Room is full." });
        return;
      }

      // If this user already has an active socket, kick the old one
      const oldSocketId = room.participants[userId];
      if (oldSocketId && oldSocketId !== socket.id) {
        const oldSocket = callNs.sockets.get(oldSocketId);
        if (oldSocket) {
          oldSocket.leave(roomId);
          oldSocket.currentRoom = null;
          oldSocket.emit("call:error", { message: "Joined from another tab/device. Disconnected." });
          oldSocket.disconnect(true);
        }
      }

      room.participants[userId] = socket.id;
      socket.join(roomId);
      socket.currentRoom = roomId;
      socket.roomUserId = userId; // To make cleanup easier

      const currentUsersCount = Object.keys(room.participants).length;

      if (currentUsersCount === 1) {
        // First person → waiting
        socket.emit("call:joined");
      } else {
        // Second person → both are ready
        socket.emit("call:joined");
        
        const otherSocketId = Object.values(room.participants).find(id => id !== socket.id);
        if (otherSocketId) {
          // Tell the peer who was already here to create the offer
          callNs.to(otherSocketId).emit("call:peer-joined");
          // Tell the newly joined peer to wait for the offer
          socket.emit("call:peer-ready");
        }
      }
    });

    // ─── SDP OFFER ────────────────────────────────────────
    socket.on("call:offer", ({ offer }) => {
      socket.to(socket.currentRoom).emit("call:offer", { offer });
    });

    // ─── SDP ANSWER ───────────────────────────────────────
    socket.on("call:answer", ({ answer }) => {
      socket.to(socket.currentRoom).emit("call:answer", { answer });
    });

    // ─── ICE CANDIDATES ──────────────────────────────────
    socket.on("call:ice-candidate", ({ candidate }) => {
      socket.to(socket.currentRoom).emit("call:ice-candidate", { candidate });
    });

    // ─── CHAT ─────────────────────────────────────────────
    socket.on("call:chat-message", ({ text }) => {
      if (!text || typeof text !== "string" || !text.trim()) return;
      const msg = {
        text: text.trim().slice(0, 1000),
        senderId: socket.userId || socket.id,
        timestamp: new Date().toISOString(),
      };
      // Echo own message back
      socket.emit("call:chat-message", { ...msg, own: true });
      // Send to other peer
      socket.to(socket.currentRoom).emit("call:chat-message", { ...msg, own: false });
    });

    // ─── LEAVE ────────────────────────────────────────────
    socket.on("call:leave", () => cleanup(socket));
    socket.on("disconnect", () => cleanup(socket));

    function cleanup(s) {
      if (s.currentRoom) {
        s.to(s.currentRoom).emit("call:peer-left");
        const room = rooms[s.currentRoom];
        if (room && s.roomUserId) {
          // Only delete if the disconnected socket is still the active one for this user
          if (room.participants[s.roomUserId] === s.id) {
             delete room.participants[s.roomUserId];
             if (Object.keys(room.participants).length === 0) {
               delete rooms[s.currentRoom];
             }
          }
        }
        s.leave(s.currentRoom);
        s.currentRoom = null;
      }
    }
  });
}
