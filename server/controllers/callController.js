import prisma from "../config/prisma.js";
import jwt from "jsonwebtoken";

// -------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------

/**
 * Sign a short-lived room token so Socket.IO can verify the caller
 * without re-querying the DB on every WS event.
 */
const signRoomToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" });

/**
 * Ensure caller is a participant of the deal.
 */
const assertParticipant = (deal, userId) => {
  if (deal.lenderId !== userId && deal.msmeId !== userId) {
    return false;
  }
  return true;
};

// -------------------------------------------------------------------
// POST /api/call/:dealId/initiate
// -------------------------------------------------------------------
export const initiateCall = async (req, res) => {
  try {
    const { dealId } = req.params;
    const callerId = req.user.id;

    // 1. Load Deal with participants
    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: {
        lender: { select: { id: true, kycStatus: true } },
        msme: { select: { id: true, kycStatus: true } },
      },
    });

    if (!deal) {
      return res
        .status(404)
        .json({ success: false, message: "Deal not found." });
    }

    // 2. Caller must be a participant
    if (!assertParticipant(deal, callerId)) {
      return res
        .status(403)
        .json({
          success: false,
          message: "You are not a participant of this deal.",
        });
    }

    // 3. Deal must be ACTIVE
    if (deal.status !== "ACTIVE") {
      return res
        .status(400)
        .json({
          success: false,
          message: "Video call is only allowed on ACTIVE deals.",
        });
    }

    // 4. Both sides must have VERIFIED KYC
    if (deal.lender.kycStatus !== "VERIFIED") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Lender KYC is not approved. Call not permitted.",
        });
    }
    if (deal.msme.kycStatus !== "VERIFIED") {
      return res
        .status(403)
        .json({
          success: false,
          message: "MSME KYC is not approved. Call not permitted.",
        });
    }

    // 5. Check for existing session
    const existingSession = await prisma.callSession.findUnique({
      where: { dealId },
    });

    if (
      existingSession &&
      ["INITIATED", "ONGOING"].includes(existingSession.status)
    ) {
      // Second participant joining the existing session — issue them a token too
      const roomToken = signRoomToken({
        sessionId: existingSession.id,
        dealId,
        lenderId: deal.lenderId,
        msmeId: deal.msmeId,
      });

      return res.status(200).json({
        success: true,
        message: "Joining existing call session.",
        data: {
          sessionId: existingSession.id,
          dealId: existingSession.dealId,
          status: existingSession.status,
          roomToken,
          socketRoom: `call:${dealId}`,
        },
      });
    }

    // 6. Create / re-create session
    const session = await prisma.callSession.upsert({
      where: { dealId },
      create: {
        dealId,
        lenderId: deal.lenderId,
        msmeId: deal.msmeId,
        status: "INITIATED",
        roomToken: null,
      },
      update: {
        status: "INITIATED",
        startedAt: null,
        endedAt: null,
        durationSec: null,
        roomToken: null,
      },
    });

    // 7. Sign room token
    const roomToken = signRoomToken({
      sessionId: session.id,
      dealId,
      lenderId: deal.lenderId,
      msmeId: deal.msmeId,
    });

    const updated = await prisma.callSession.update({
      where: { id: session.id },
      data: { roomToken },
    });

    return res.status(201).json({
      success: true,
      message: "Call session initiated.",
      data: {
        sessionId: updated.id,
        dealId: updated.dealId,
        status: updated.status,
        roomToken,
        socketRoom: `call:${dealId}`,
      },
    });

  } catch (error) {
    console.error("[initiateCall]", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
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

    if (!session) {
      return res
        .status(404)
        .json({
          success: false,
          message: "No call session found for this deal.",
        });
    }

    if (session.lenderId !== callerId && session.msmeId !== callerId) {
      return res
        .status(403)
        .json({
          success: false,
          message: "You are not a participant of this call.",
        });
    }

    if (session.status === "ENDED") {
      return res
        .status(400)
        .json({ success: false, message: "Call has already ended." });
    }

    const now = new Date();
    const durationSec = session.startedAt
      ? Math.round((now - new Date(session.startedAt)) / 1000)
      : null;

    const updated = await prisma.callSession.update({
      where: { id: session.id },
      data: {
        status: "ENDED",
        endedAt: now,
        durationSec,
        roomToken: null, // invalidate the token on close
      },
    });

    return res.status(200).json({
      success: true,
      message: "Call ended.",
      data: {
        sessionId: updated.id,
        status: updated.status,
        durationSec: updated.durationSec,
        endedAt: updated.endedAt,
      },
    });
  } catch (error) {
    console.error("[endCall]", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

// -------------------------------------------------------------------
// GET /api/call/:dealId/status
// -------------------------------------------------------------------
export const getCallStatus = async (req, res) => {
  try {
    const { dealId } = req.params;
    const callerId = req.user.id;

    // Quick participant check via deal
    const deal = await prisma.deal.findUnique({ where: { id: dealId } });
    if (!deal) {
      return res
        .status(404)
        .json({ success: false, message: "Deal not found." });
    }
    if (!assertParticipant(deal, callerId)) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied." });
    }

    const session = await prisma.callSession.findUnique({ where: { dealId } });

    if (!session) {
      return res.status(200).json({ success: true, data: null });
    }

    return res.status(200).json({
      success: true,
      data: {
        sessionId: session.id,
        status: session.status,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        durationSec: session.durationSec,
        createdAt: session.createdAt,
      },
    });
  } catch (error) {
    console.error("[getCallStatus]", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

// -------------------------------------------------------------------
// POST /api/call/:dealId/recording
// -------------------------------------------------------------------
export const uploadRecording = async (req, res) => {
  try {
    const { dealId } = req.params;
    const callerId = req.user.id;
    
    // Caller must have uploaded a file
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No recording file uploaded." });
    }

    const session = await prisma.callSession.findUnique({ where: { dealId } });
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found." });
    }

    // Determine if caller is lender or msme
    let updateData = {};
    if (session.lenderId === callerId) {
      updateData = { recordingUrl: `/uploads/recordings/${req.file.filename}` };
    } else if (session.msmeId === callerId) {
      updateData = { recordingUrl2: `/uploads/recordings/${req.file.filename}` };
    } else {
      return res.status(403).json({ success: false, message: "You are not a participant." });
    }

    const updated = await prisma.callSession.update({
      where: { id: session.id },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      message: "Recording uploaded successfully.",
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

    // Must be participant
    const deal = await prisma.deal.findUnique({ where: { id: dealId } });
    if (!deal || !assertParticipant(deal, callerId)) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    const session = await prisma.callSession.findUnique({ where: { dealId } });
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found." });
    }

    return res.status(200).json({
      success: true,
      data: {
        lenderRecordingUrl: session.recordingUrl,
        msmeRecordingUrl: session.recordingUrl2,
      },
    });
  } catch (error) {
    console.error("[getRecordings]", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};
