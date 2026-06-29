import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { initializeDatabaseSchema } from './db/db.js';
import authRoutes from './routes/auth.js';
import syncRoutes from './routes/sync.js';
import paymentRoutes from './routes/payment.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Dynamic CORS check to allow any localhost port during local development
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:3004',
  'http://localhost:3005'
];

if (process.env.ALLOWED_ORIGINS) {
  const customOrigins = process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
  allowedOrigins.push(...customOrigins);
}

app.use(cors({
  origin: function (origin, callback) {
    console.log(`🔍 CORS origin check: ${origin}`);
    if (!origin) return callback(null, true);
    
    const isLocalhost = origin.startsWith('http://localhost:') || 
                        origin.startsWith('http://127.0.0.1:') || 
                        origin === 'http://localhost' || 
                        origin === 'http://127.0.0.1';
                        
    const isVercelDomain = origin.endsWith('.vercel.app');
    
    if (isLocalhost || isVercelDomain || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());

// Prefix endpoints as per API spec
app.use('/v1/auth', authRoutes);
app.use('/v1/sync', syncRoutes);
app.use('/v1/payment', paymentRoutes);

// General health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Start Express server and initialize database tables
async function startServer() {
  try {
    await initializeDatabaseSchema();
    app.listen(PORT, () => {
      console.log(`📡 CineVerse API Server running on port ${PORT}`);
      console.log(`🔑 Auth Base Endpoint: http://localhost:${PORT}/v1/auth`);
      console.log(`🎬 Sync Base Endpoint: http://localhost:${PORT}/v1/sync`);
    });
  } catch (err) {
    console.error('❌ Failed to start CineVerse API Server:', err);
    process.exit(1);
  }
}

startServer();
