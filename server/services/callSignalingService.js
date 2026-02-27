/**
 * Socket.IO signaling handler for WebRTC video calls.
 *
 * Key fix: activeRooms tracks by userId (not socketId) so React StrictMode's
 * double-mount doesn't fill up the room before the second participant joins.
 */

import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

// active rooms: dealId → Map<userKey, socketId>
const activeRooms = new Map();

const ROOM = (dealId) => `call:${dealId}`;

export const registerCallSocket = (io) => {
  const callNS = io.of("/call");

  // ──────────────────────────────────────────────────────────────
  // Auth middleware
  // ──────────────────────────────────────────────────────────────
  callNS.use(async (socket, next) => {
    try {
      const { roomToken, userToken } = socket.handshake.auth;

      if (!roomToken) {
        return next(new Error("UNAUTHORIZED: roomToken missing"));
      }

      let decoded;
      try {
        decoded = jwt.verify(roomToken, process.env.JWT_SECRET);
      } catch {
        return next(new Error("UNAUTHORIZED: invalid or expired roomToken"));
      }

      const { sessionId, dealId, lenderId, msmeId } = decoded;

      // Decode the user's own JWT to get their userId (sent from client)
      let callerId = null;
      if (userToken) {
        try {
          const u = jwt.verify(userToken, process.env.JWT_SECRET);
          callerId = u.id || u.userId || u.sub || null;
        } catch {
          /* ignore — fall back to socket.id as key */
        }
      }

      // Validate session still exists and is INITIATED / ONGOING
      const session = await prisma.callSession.findUnique({
        where: { id: sessionId },
      });

      if (!session) return next(new Error("SESSION_NOT_FOUND"));
      if (!["INITIATED", "ONGOING"].includes(session.status)) {
        return next(new Error("SESSION_ALREADY_ENDED"));
      }

      // Verify caller is a participant (if we know their userId)
      if (callerId && callerId !== lenderId && callerId !== msmeId) {
        return next(new Error("UNAUTHORIZED: not a deal participant"));
      }

      socket.callContext = { sessionId, dealId, lenderId, msmeId, callerId };
      next();
    } catch (err) {
      console.error("[callSocket:auth]", err);
      next(new Error("INTERNAL_ERROR"));
    }
  });

  // ──────────────────────────────────────────────────────────────
  // Connection handler
  // ──────────────────────────────────────────────────────────────
  callNS.on("connection", async (socket) => {
    const { sessionId, dealId, lenderId, msmeId, callerId } = socket.callContext;
    const room = ROOM(dealId);

    // Use userId as the stable key so StrictMode re-mounts don't add an extra slot
    const userKey = callerId || socket.id;

    console.log(`[callSocket] user ${userKey} → room ${room}`);

    // Init room map if absent
    if (!activeRooms.has(dealId)) {
      activeRooms.set(dealId, new Map());
    }
    const roomUsers = activeRooms.get(dealId);

    // If same user already has a slot (StrictMode re-mount), replace it
    if (roomUsers.has(userKey) && roomUsers.get(userKey) !== socket.id) {
      console.log(`[callSocket] replacing stale socket for user ${userKey}`);
      roomUsers.delete(userKey);
    }

    roomUsers.set(userKey, socket.id);
    socket.join(room);

    const uniqueCount = roomUsers.size;

    // Tell this socket it joined successfully
    socket.emit("call:joined", { sessionId, dealId, room });

    // Reject if somehow a 3rd unique user tries to join
    if (uniqueCount > 2) {
      socket.emit("call:error", {
        message: "Room is full. Only 1-to-1 calls are supported.",
      });
      socket.leave(room);
      roomUsers.delete(userKey);
      return;
    }

    // Both unique participants present → mark ONGOING
    if (uniqueCount === 2) {
      try {
        await prisma.callSession.update({
          where: { id: sessionId },
          data: { status: "ONGOING", startedAt: new Date() },
        });
      } catch (e) {
        console.error("[callSocket] failed to mark ONGOING", e);
      }

      // Tell the FIRST peer (initiator — already waiting) to create the offer.
      // Tell the SECOND peer (current socket) to wait for the incoming offer.
      const initiatorKey = [...roomUsers.keys()].find((k) => k !== userKey);
      const initiatorSocketId = roomUsers.get(initiatorKey);

      // Initiator: create and send offer
      callNS.to(initiatorSocketId).emit("call:peer-joined", {
        message: "Peer connected. Please create and send your offer.",
        dealId,
        role: "initiator",
      });

      // Joiner: wait for the offer — no action needed
      socket.emit("call:peer-ready", {
        message: "Connected. Waiting for the other peer to send an offer.",
        dealId,
        role: "receiver",
      });
    }

    // ──────────────────────────────────────────────────────────
    // WebRTC signaling relay
    // ──────────────────────────────────────────────────────────
    socket.on("call:offer", ({ offer }) => {
      socket.to(room).emit("call:offer", { offer });
    });

    socket.on("call:answer", ({ answer }) => {
      socket.to(room).emit("call:answer", { answer });
    });

    socket.on("call:ice-candidate", ({ candidate }) => {
      socket.to(room).emit("call:ice-candidate", { candidate });
    });

    // ──────────────────────────────────────────────────────────
    // In-call chat
    // ──────────────────────────────────────────────────────────
    socket.on("call:chat-message", ({ text }) => {
      if (!text || typeof text !== "string") return;
      const trimmed = text.trim().slice(0, 1000); // cap message length
      if (!trimmed) return;
      const payload = {
        senderId: userKey,
        text: trimmed,
        timestamp: new Date().toISOString(),
      };
      // Echo back to sender (so their chat shows immediately with server timestamp)
      socket.emit("call:chat-message", { ...payload, own: true });
      // Relay to the other peer
      socket.to(room).emit("call:chat-message", { ...payload, own: false });
    });

    socket.on("call:leave", () =>
      handleLeave(socket, userKey, sessionId, dealId, room, callNS)
    );
    socket.on("disconnect", () =>
      handleLeave(socket, userKey, sessionId, dealId, room, callNS)
    );
  });
};

// ──────────────────────────────────────────────────────────────────
// Shared teardown
// ──────────────────────────────────────────────────────────────────
const handleLeave = async (socket, userKey, sessionId, dealId, room, callNS) => {
  console.log(`[callSocket] user ${userKey} left room ${room}`);

  if (activeRooms.has(dealId)) {
    const roomUsers = activeRooms.get(dealId);
    // Only remove if this socket is still the registered one for this user
    if (roomUsers.get(userKey) === socket.id) {
      roomUsers.delete(userKey);
    }
    if (roomUsers.size === 0) {
      activeRooms.delete(dealId);
    }
  }

  // Notify remaining participant
  socket.to(room).emit("call:peer-left", {
    message: "The other participant has left the call.",
    dealId,
  });

  // End session in DB
  try {
    const session = await prisma.callSession.findUnique({
      where: { id: sessionId },
    });
    if (session && ["INITIATED", "ONGOING"].includes(session.status)) {
      const now = new Date();
      const durationSec = session.startedAt
        ? Math.round((now - new Date(session.startedAt)) / 1000)
        : null;
      await prisma.callSession.update({
        where: { id: sessionId },
        data: { status: "ENDED", endedAt: now, durationSec, roomToken: null },
      });
    }
  } catch (e) {
    console.error("[callSocket:handleLeave]", e);
  }
};
