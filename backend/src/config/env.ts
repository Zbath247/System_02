import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
  sessionSecret: process.env.SESSION_SECRET || 'university-attendance-system-dev-secret-key-12345',
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  cookieDomain: process.env.COOKIE_DOMAIN || undefined,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  publicAttendanceUrl: process.env.PUBLIC_ATTENDANCE_URL || 'http://localhost:5173/scan',
  autoApproveStudents: process.env.AUTO_APPROVE_STUDENTS === 'true',
  sessionExpiryDays: 30, // 30-day persistent session
};
