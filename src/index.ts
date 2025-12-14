import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import { config } from './config';
import { logger } from './logger';
import { connectDatabase, disconnectDatabase } from './prismaClient';
import { errorHandler } from './middleware/errorHandler';
import { initRealtime } from './realtime';

// Routes
import authRoutes from './modules/auth/auth.routes';
import companiesRoutes from './modules/companies/companies.routes';
import usersRoutes from './modules/users/users.routes';
import employeesRoutes from './modules/employees/employees.routes';
import camerasRoutes from './modules/cameras/cameras.routes';
import eventsRoutes from './modules/events/events.routes';
import presenceRoutes from './modules/presence/presence.routes';
import statisticsRoutes from './modules/statistics/statistics.routes';
import metricsRoutes from './modules/metrics/metrics.routes';

const app = express();
const server = http.createServer(app);
initRealtime(server);

// Middleware
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (uploads)
app.use('/uploads', express.static(path.join(config.uploadsDir)));

// Request logging
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/cameras', camerasRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/presence', presenceRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/metrics', metricsRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
async function start(): Promise<void> {
  try {
    // Connect to database
    await connectDatabase();
    
    // Start server
    server.listen(config.port, () => {
      logger.info(`Backend server running on port ${config.port}`);
      logger.info(`Health check: http://localhost:${config.port}/api/health`);
      logger.info(`Socket.IO path: ${config.socketPath}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdown(signal: string): Promise<void> {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  
  server.close(() => {
    logger.info('HTTP server closed');
  });
  
  io.close(() => {
    logger.info('Socket.IO server closed');
  });
  
  await disconnectDatabase();
  
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Start
start();

