import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/attendance',
  
  // JWT
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'change-me-access-secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'change-me-refresh-secret',
  jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  
  // Encryption (for camera passwords)
  encryptionKey: process.env.ENCRYPTION_KEY || 'change-me-32-char-encryption-key',
  
  // File uploads
  uploadsDir: process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads'),
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || '*',
  
  // Socket.IO
  socketPath: process.env.SOCKET_PATH || '/ws',

  // Camera gateway integration
  cameraGatewayPublicUrl: process.env.CAMERA_GATEWAY_PUBLIC_URL || 'http://localhost:4000',
  cameraGatewayInternalUrl: process.env.CAMERA_GATEWAY_INTERNAL_URL || 'http://camera-gateway:4000',

  // Recognition service defaults
  publicEmployeesCompanySlug: process.env.PUBLIC_COMPANY_SLUG || null,

  // Presence reset token (for recognition_service reset hook)
  presenceResetToken: process.env.PRESENCE_RESET_TOKEN || '',
  
  // Rate limiting
  rateLimitWindowMs: 60 * 1000, // 1 minute
  rateLimitMaxRequests: 100,
  
  // Event deduplication
  eventDeduplicationWindowMs: 60 * 1000, // 1 minute
} as const;





