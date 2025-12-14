import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../../types';
import * as authService from './auth.service';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const refreshSchema = z.object({
  refreshToken: z.string(),
});

export async function loginHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = loginSchema.parse(req.body);
    
    const result = await authService.login(input);
    
    if (!result) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function refreshHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = refreshSchema.parse(req.body);
    
    const result = await authService.refresh(input.refreshToken);
    
    if (!result) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }
    
    res.json(result);
  } catch (error) {
    next(error);
  }
}








