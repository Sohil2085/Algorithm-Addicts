import 'dotenv/config';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app.js';
import { registerCallSocket } from './services/callSignalingService.js';

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Register global notifications namespace
import { initGlobalSocket } from './services/socketManager.js';
initGlobalSocket(io);

// Expose io object to all routes (app.locals)
app.locals.io = io;

// Register WebRTC signaling namespace
registerCallSocket(io);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (HTTP + Socket.IO)`);
});
