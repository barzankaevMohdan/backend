import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import * as presenceService from './presence.service';
import { z } from 'zod';
import { config } from '../../config';

const resetSchema = z.object({
  olderThanMinutes: z.number().int().min(0).optional(),
});

function assertResetToken(req: AuthRequest): void {
  const headerToken = (req.headers['x-reset-token'] as string | undefined) || '';
  if (!config.presenceResetToken || headerToken !== config.presenceResetToken) {
    const err: any = new Error('Invalid reset token');
    err.status = 401;
    throw err;
  }
}

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

export async function resetPresenceHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const companyId = req.user!.companyId!;
    const body = resetSchema.parse(req.body ?? {});

    const count = await presenceService.resetPresence(companyId, body.olderThanMinutes);

    res.json({ ok: true, reset: count });
  } catch (error) {
    next(error);
  }
}

export async function resetPresencePublicHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    assertResetToken(req);
    const { companySlug } = req.params as { companySlug: string };
    const body = resetSchema.parse(req.body ?? {});

    const result = await presenceService.resetPresenceByCompanySlug(companySlug, body.olderThanMinutes);

    res.json({ ok: true, reset: result.count });
  } catch (error) {
    next(error);
  }
}








