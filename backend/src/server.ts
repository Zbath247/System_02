import app from './app';
import { config } from './config/env';

const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 University Attendance System Backend API`);
  console.log(`📡 Listening on: http://localhost:${config.port}`);
  console.log(`🌐 Public Attendance URL: ${config.publicAttendanceUrl}`);
  console.log(`🔒 Environment: ${config.nodeEnv}`);
  console.log(`=======================================================`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
