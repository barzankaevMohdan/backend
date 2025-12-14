import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import * as statisticsService from './statistics.service';

export async function getStatisticsHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const companyId = req.user!.companyId!;
    
    const dateFrom = req.query.dateFrom
      ? new Date(req.query.dateFrom as string)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const dateTo = req.query.dateTo
      ? new Date(req.query.dateTo as string)
      : new Date();
    
    const statistics = await statisticsService.getStatistics({
      companyId,
      dateFrom,
      dateTo,
    });
    
    res.json(statistics);
  } catch (error) {
    next(error);
  }
}








