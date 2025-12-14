import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
  companyId: number | null;
}

export function generateAccessToken(payload: JWTPayload): string {
  const options: SignOptions = {
    expiresIn: config.jwtAccessExpiry as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, config.jwtAccessSecret, options);
}

export function generateRefreshToken(payload: JWTPayload): string {
  const options: SignOptions = {
    expiresIn: config.jwtRefreshExpiry as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, config.jwtRefreshSecret, options);
}

export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, config.jwtAccessSecret) as JWTPayload;
}

export function verifyRefreshToken(token: string): JWTPayload {
  return jwt.verify(token, config.jwtRefreshSecret) as JWTPayload;
}


