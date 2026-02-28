import prisma from "../config/prisma.js";
import jwt from "jsonwebtoken";
import { notifyUser } from "../services/socketManager.js";

const signRoomToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" });

const assertParticipant = (deal, userId) =>
  deal.lenderId === userId || deal.msmeId === userId;

// -------------------------------------------------------------------
// POST /api/call/:dealId/initiate
// -------------------------------------------------------------------
export const initiateCall = async (req, res) => {
  try {
    const { dealId } = req.params;
    const callerId = req.user.id;

    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: {
        lender: { select: { id: true, kycStatus: true, name: true } },
        msme:   { select: { id: true, kycStatus: true } },
      },
    });

    if (!deal)
      return res.status(404).json({ success: false, message: "Deal not found." });

    if (!assertParticipant(deal, callerId))
      return res.status(403).json({ success: false, message: "You are not a participant of this deal." });

    if (deal.status !== "ACTIVE")
      return res.status(400).json({ success: false, message: "Video call is only allowed on ACTIVE deals." });

    if (deal.lender.kycStatus !== "VERIFIED")
      return res.status(403).json({ success: false, message: "Lender KYC is not approved." });

    if (deal.msme.kycStatus !== "VERIFIED")
      return res.status(403).json({ success: false, message: "MSME KYC is not approved." });

    // Helper to send notification if caller is Lender
    const triggerNotificationIfNeeded = () => {
      if (req.user.role === 'LENDER') {
        const io = req.app.locals.io;
        if (io) {
          notifyUser(io, deal.msmeId, "meeting:started", {
            dealId,
            lenderName: deal.lender.name || "Your Lender"
          });
        }
      }
    };

    // If a session is already live, let the second participant join it
    const existing = await prisma.callSession.findUnique({ where: { dealId } });
    if (existing && ["INITIATED", "ONGOING"].includes(existing.status)) {
      const roomToken = signRoomToken({
        sessionId: existing.id, dealId, lenderId: deal.lenderId, msmeId: deal.msmeId,
      });
      
      triggerNotificationIfNeeded();
      
      return res.status(200).json({
        success: true,
        message: "Joining existing call session.",
        data: { sessionId: existing.id, dealId, status: existing.status, roomToken, socketRoom: `call:${dealId}` },
      });
    }

    // Upsert session
    const session = await prisma.callSession.upsert({
      where: { dealId },
      create: { dealId, lenderId: deal.lenderId, msmeId: deal.msmeId, status: "INITIATED", roomToken: null },
      update: { status: "INITIATED", startedAt: null, endedAt: null, durationSec: null, roomToken: null },
    });

    const roomToken = signRoomToken({
      sessionId: session.id, dealId, lenderId: deal.lenderId, msmeId: deal.msmeId,
    });

    const updated = await prisma.callSession.update({
      where: { id: session.id },
      data: { roomToken },
    });

    triggerNotificationIfNeeded();

    return res.status(201).json({
      success: true,
      message: "Call session initiated.",
      data: { sessionId: updated.id, dealId, status: updated.status, roomToken, socketRoom: `call:${dealId}` },
    });
  } catch (error) {
    console.error("[initiateCall]", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// -------------------------------------------------------------------
// PATCH /api/call/:dealId/end
// -------------------------------------------------------------------
export const endCall = async (req, res) => {
  try {
    const { dealId } = req.params;
    const callerId = req.user.id;

    const session = await prisma.callSession.findUnique({ where: { dealId } });
    if (!session)
      return res.status(404).json({ success: false, message: "No call session found." });

    if (session.lenderId !== callerId && session.msmeId !== callerId)
      return res.status(403).json({ success: false, message: "Access denied." });

    if (session.status === "ENDED")
      return res.status(400).json({ success: false, message: "Call has already ended." });

    const now = new Date();
    const durationSec = session.startedAt
      ? Math.round((now - new Date(session.startedAt)) / 1000)
      : null;

    const updated = await prisma.callSession.update({
      where: { id: session.id },
      data: { status: "ENDED", endedAt: now, durationSec, roomToken: null },
    });

    return res.status(200).json({
      success: true,
      message: "Call ended.",
      data: { sessionId: updated.id, status: updated.status, durationSec: updated.durationSec },
    });
  } catch (error) {
    console.error("[endCall]", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// -------------------------------------------------------------------
// GET /api/call/:dealId/status
// -------------------------------------------------------------------
export const getCallStatus = async (req, res) => {
  try {
    const { dealId } = req.params;
    const callerId = req.user.id;

    const deal = await prisma.deal.findUnique({ where: { id: dealId } });
    if (!deal || !assertParticipant(deal, callerId)) {
      console.log(`[getCallStatus] Access denied for user ${callerId} on deal ${dealId}`);
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    const session = await prisma.callSession.findUnique({ where: { dealId } });
    console.log(`[getCallStatus] Deal ${dealId} has session status:`, session?.status);
    
    if (!session) return res.status(200).json({ success: true, data: null });

    return res.status(200).json({
      success: true,
      data: { sessionId: session.id, status: session.status, startedAt: session.startedAt, endedAt: session.endedAt, durationSec: session.durationSec },
    });
  } catch (error) {
    console.error("[getCallStatus]", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// -------------------------------------------------------------------
// POST /api/call/:dealId/recording
// -------------------------------------------------------------------
export const uploadRecording = async (req, res) => {
  try {
    const { dealId } = req.params;
    const callerId = req.user.id;

    if (!req.file)
      return res.status(400).json({ success: false, message: "No file uploaded." });

    const session = await prisma.callSession.findUnique({ where: { dealId } });
    if (!session)
      return res.status(404).json({ success: false, message: "Session not found." });

    let updateData = {};
    if (session.lenderId === callerId) {
      updateData = { recordingUrl: `/uploads/recordings/${req.file.filename}` };
    } else if (session.msmeId === callerId) {
      updateData = { recordingUrl2: `/uploads/recordings/${req.file.filename}` };
    } else {
      return res.status(403).json({ success: false, message: "Not a participant." });
    }

    await prisma.callSession.update({ where: { id: session.id }, data: updateData });

    return res.status(200).json({
      success: true,
      message: "Recording saved.",
      data: { recordingUrl: updateData.recordingUrl || updateData.recordingUrl2 },
    });
  } catch (error) {
    console.error("[uploadRecording]", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// -------------------------------------------------------------------
// GET /api/call/:dealId/recordings
// -------------------------------------------------------------------
export const getRecordings = async (req, res) => {
  try {
    const { dealId } = req.params;
    const callerId = req.user.id;

    const deal = await prisma.deal.findUnique({ where: { id: dealId } });
    if (!deal || !assertParticipant(deal, callerId))
      return res.status(403).json({ success: false, message: "Access denied." });

    const session = await prisma.callSession.findUnique({ where: { dealId } });
    if (!session) return res.status(404).json({ success: false, message: "Session not found." });

    return res.status(200).json({
      success: true,
      data: { lenderRecordingUrl: session.recordingUrl, msmeRecordingUrl: session.recordingUrl2 },
    });
  } catch (error) {
    console.error("[getRecordings]", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};
