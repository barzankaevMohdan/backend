import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { getMetrics } from './metrics.service';

export async function getMetricsHandler(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    let companyScope: number | null | undefined = req.user?.companyId ?? null;

    if (req.user?.role === 'SUPERADMIN') {
      if (req.query.companyId) {
        const parsed = parseInt(req.query.companyId as string, 10);
        if (!isNaN(parsed)) {
          companyScope = parsed;
        }
      }
    }

    const metrics = await getMetrics(companyScope);
    res.json(metrics);
  } catch (error) {
    next(error);
  }
}




