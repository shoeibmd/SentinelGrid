import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import apiRouter from './routes/api.js';
import { PingService } from './services/ping.service.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Allows flexible dashboard integration
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: '*', // In production, restrict to configured dashboard origins
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '2mb' }));

// Request Logging
app.use((req, _res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// Mount Centralized API
app.use('/api', apiRouter);

// Root Welcome & Health
app.get('/', (_req, res) => {
  res.json({
    platform: 'SentinelGrid',
    tagline: 'Unified Infrastructure Monitoring & Cyber Defense',
    version: '1.0.0',
    status: 'operational',
    docs: '/api/health'
  });
});

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found on SentinelGrid Control Plane.' });
});

// Start Server & Background Services if executed directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🛡️ SentinelGrid Core API running on port ${PORT}`);
    console.log(`📊 Initializing Network Ping probe scheduler...`);
    PingService.startBackgroundScheduler();
  });
}

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  PingService.stopBackgroundScheduler();
  process.exit(0);
});

export default app;
