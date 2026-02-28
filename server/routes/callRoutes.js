import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { protect } from "../middleware/authMiddleware.js";
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

// Multer: store recordings as named .webm files
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (req, _file, cb) =>
    cb(null, `${req.params.dealId}-${req.user.id}-${Date.now()}.webm`),
});
const upload = multer({ storage });

// Initiate call
router.post("/:dealId/initiate", protect, initiateCall);

// End call
router.patch("/:dealId/end", protect, endCall);

// Get status
router.get("/:dealId/status", protect, getCallStatus);

// Upload recording
router.post("/:dealId/recording", protect, upload.single("recording"), uploadRecording);

// Get recordings
router.get("/:dealId/recordings", protect, getRecordings);

export default router;
