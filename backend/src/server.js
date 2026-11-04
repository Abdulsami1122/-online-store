import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import { validateEnv } from './utils/validateEnv.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

// Middleware imports
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// ── 1. Load & validate environment ──────────────────────────────────────────
dotenv.config();
validateEnv();

// ── 2. Connect to MongoDB ────────────────────────────────────────────────────
connectDB();

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// ── 3. CORS ──────────────────────────────────────────────────────────────────
// In production, only allow requests from your own frontend domain.
// In development, allow any origin (Vite dev server).
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : [];

app.use(
  cors({
    origin: isProduction
      ? (origin, callback) => {
          // Allow requests with no origin (mobile apps, curl) or whitelisted origins
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error(`CORS: origin ${origin} not allowed`));
          }
        }
      : true, // allow all in development
    credentials: true,
  })
);

// ── 4. Body parsers ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// ── 5. Logging (dev only) ────────────────────────────────────────────────────
if (!isProduction) {
  app.use(morgan('dev'));
}

// ── 6. Rate limiting ─────────────────────────────────────────────────────────
// Auth endpoints: max 20 attempts per 15 min per IP (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again in 15 minutes.' },
});

// General API: max 200 requests per 15 min per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please slow down.' },
});

// AI chat: max 50 messages per 15 min per IP
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many AI requests. Please wait a moment.' },
});

app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/ai', aiLimiter);

// ── 7. Health check ──────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    app: 'AI Order Assistant API',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── 8. API Routes ────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/upload', uploadRoutes);

// ── 9. Error Handling ────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── 10. Start Server ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 AI Order Assistant Server running on port ${PORT} [${process.env.NODE_ENV}]`);
});
