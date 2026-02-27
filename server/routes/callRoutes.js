import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { protect } from "../middleware/authMiddleware.js";
import { requireFeatureEnabled } from "../middleware/feature.middleware.js";
import {
  initiateCall,
  endCall,
  getCallStatus,
  uploadRecording,
  getRecordings,
} from "../controllers/callController.js";

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), "uploads", "recordings");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config for storing .webm recordings
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // e.g. deal123-lender456-169876543210.webm
    cb(null, `${req.params.dealId}-${req.user.id}-${Date.now()}.webm`);
  },
});
const upload = multer({ storage });

/**
 * All call routes require:
 *  1. Valid JWT (protect)
 *  2. VIDEO_CALL feature flag enabled (requireFeatureEnabled)
 *
 * Business rules (KYC, Deal ownership, Deal status) are enforced
 * inside the controller to keep responses precise.
 */

// Initiate a new call session for a deal
router.post(
  "/:dealId/initiate",
  protect,
  requireFeatureEnabled("VIDEO_CALL"),
  initiateCall,
);

// End an in-progress call session
router.patch(
  "/:dealId/end",
  protect,
  requireFeatureEnabled("VIDEO_CALL"),
  endCall,
);

// Get current call session status for a deal
router.get(
  "/:dealId/status",
  protect,
  requireFeatureEnabled("VIDEO_CALL"),
  getCallStatus,
);

// Upload a recording for a deal
router.post(
  "/:dealId/recording",
  protect,
  requireFeatureEnabled("VIDEO_CALL"),
  upload.single("recording"),
  uploadRecording,
);

// Get recordings for a deal
router.get(
  "/:dealId/recordings",
  protect,
  requireFeatureEnabled("VIDEO_CALL"),
  getRecordings,
);

export default router;
