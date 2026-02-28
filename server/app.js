import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import authRoutes from './routes/auth.routes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import kycRoutes from './routes/kyc.routes.js';
import lenderRoutes from './routes/lender.routes.js';
import adminRoutes from './routes/admin.routes.js';
import featureRoutes from './routes/feature.routes.js';
import offerRoutes from './routes/offerRoutes.js';
import dealRoutes from './routes/dealRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import callRoutes from './routes/callRoutes.js';
import errorHandler from './middleware/error.middleware.js';
import cookieParser from 'cookie-parser';

const app = express();

// Serve uploaded recordings statically
const uploadPath = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
app.use('/uploads', express.static(uploadPath));

// Middleware
app.set("trust proxy", 1); // 🔥 Required for Render
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://algorithm-addicts.vercel.app",
        process.env.CLIENT_URL
    ].filter(Boolean), // Allow localhost, vercel, and any custom env URL
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Debug Middleware to log request details
app.use((req, res, next) => {
    console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', req.body);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/lender', lenderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/features', featureRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/deal', dealRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/call', callRoutes);

// Root route
app.get('/', (req, res) => {
    res.send('API is running...');
});
app.get("/health", (req, res) => {
    res.status(200).json({ status: "running" });
});

app.use(errorHandler);

export default app;
