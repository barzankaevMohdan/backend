import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import * as presenceService from './presence.service';

export async function getPresenceHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const companyId = req.user!.companyId!;
    
    const presence = await presenceService.getPresence(companyId);
    
    res.json(presence);
  } catch (error) {
    next(error);
  }
}








