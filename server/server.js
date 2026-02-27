import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import path from "path";
import fs from "fs";

import authRoutes from "./routes/auth.routes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import kycRoutes from "./routes/kyc.routes.js";
import lenderRoutes from "./routes/lender.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import featureRoutes from "./routes/feature.routes.js";
import offerRoutes from "./routes/offerRoutes.js";
import dealRoutes from "./routes/dealRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import callRoutes from "./routes/callRoutes.js";
import agreementRoutes from "./routes/agreementRoutes.js";
import errorHandler from "./middleware/error.middleware.js";
import { registerCallSocket } from "./services/callSignalingService.js";

const PORT = process.env.PORT || 5000;

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.set("trust proxy", 1);
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' not allowed`));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Request logger (dev)
app.use((req, res, next) => {
  console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Serve static uploads
const uploadPath = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
app.use("/uploads", express.static(uploadPath));

// ─── REST Routes ─────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/lender", lenderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/features", featureRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/deal", dealRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/call", callRoutes);
app.use("/api/agreement", agreementRoutes);

// Health checks
app.get("/", (req, res) => res.send("API is running..."));
app.get("/health", (req, res) => res.status(200).json({ status: "running" }));

app.use(errorHandler);

// ─── HTTP + Socket.IO ────────────────────────────────────────────────────────
const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// Register WebRTC signaling namespace
registerCallSocket(io);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (HTTP + Socket.IO)`);
});
