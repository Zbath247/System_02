import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config/env';
import { authenticateSession } from './middlewares/authMiddleware';
import { generalLimiter } from './middlewares/rateLimiter';
import { errorHandler } from './middlewares/errorHandler';
import prisma from './prisma';

import authRoutes from './routes/authRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import locationRoutes from './routes/locationRoutes';
import adminRoutes from './routes/adminRoutes';
import reportRoutes from './routes/reportRoutes';

const app = express();

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration (Permits localhost and local Wi-Fi LAN requests)
app.use(
  cors({
    origin: (requestOrigin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman) or any origin in dev/LAN
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Token', 'X-Idempotency-Key'],
  })
);

// Body parsing with size limits
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

// Session Authenticator (populates req.user & req.session if cookie is present)
app.use(authenticateSession);

// General Rate Limiter for API endpoints
app.use('/api', generalLimiter);

// Health Check Endpoint
app.get('/api/health', async (req: Request, res: Response) => {
  let dbStatus = 'connected';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    dbStatus = 'disconnected';
  }

  res.json({
    status: 'ok',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
  });
});

// Public Config Endpoint (returns LAN IP for phone scanning)
app.get('/api/config/public', (req: Request, res: Response) => {
  // Detect local IPv4 addresses
  const os = require('os');
  const localIps: string[] = [];
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        localIps.push(iface.address);
      }
    }
  }

  // Exclude virtual adapters (Hyper-V vEthernet, VMware VMnet, VirtualBox)
  const physicalIps = localIps.filter(
    (ip) =>
      !ip.startsWith('172.23.') &&
      !ip.startsWith('192.168.68.') &&
      !ip.startsWith('192.168.198.') &&
      !ip.startsWith('192.168.56.')
  );

  const primaryIp = physicalIps[0] || localIps[localIps.length - 1] || 'localhost';

  res.json({
    success: true,
    publicAttendanceUrl: config.publicAttendanceUrl,
    localIps,
    primaryIp,
    lanAttendanceUrl: `http://${primaryIp}:5173/scan`,
    systemNameKh: 'ប្រព័ន្ធគ្រប់គ្រងវត្តមានសាកលវិទ្យាល័យ',
    systemNameEn: 'University Attendance Management System',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);

// 404 Route Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    code: 'ROUTE_NOT_FOUND',
    message: `API route "${req.method} ${req.path}" not found.`,
    messageKh: `មិនមានផ្លូវ API "${req.method} ${req.path}" នេះទេ។`,
  });
});

// Centralized Error Handling
app.use(errorHandler);

export default app;
