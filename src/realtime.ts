import { Server } from 'socket.io';
import http from 'http';
import { config } from './config';
import { logger } from './logger';

let io: Server | null = null;

export function initRealtime(server: http.Server): Server {
  io = new Server(server, {
    path: config.socketPath,
    cors: {
      origin: config.corsOrigin,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    logger.info({ socketId: socket.id }, 'Socket client connected');

    socket.on('disconnect', () => {
      logger.info({ socketId: socket.id }, 'Socket client disconnected');
    });
  });

  return io;
}

export function broadcastEvent(eventType: string, payload: unknown): void {
  if (!io) {
    logger.warn({ eventType }, 'Attempted to broadcast without initialized Socket.IO');
    return;
  }
  io.emit(eventType, payload);
}




