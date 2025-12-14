import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../../types';
import * as eventsService from './events.service';
import { EventType } from '@prisma/client';

const createEventSchema = z.object({
  employeeId: z.number().int().positive(),
  type: z.enum(['IN', 'OUT']),
  timestamp: z.string().datetime().optional(),
  cameraId: z.number().int().positive().optional(),
});

export async function createEventHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = createEventSchema.parse(req.body);
    
    const input: eventsService.CreateEventInput = {
      employeeId: body.employeeId,
      type: body.type as EventType,
      timestamp: body.timestamp ? new Date(body.timestamp) : undefined,
      cameraId: body.cameraId,
    };
    
    const result = await eventsService.createEvent(input);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getEventsHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const companyId = req.user!.companyId!;
    
    const query: eventsService.GetEventsQuery = {
      companyId,
      employeeId: req.query.employeeId ? parseInt(req.query.employeeId as string, 10) : undefined,
      type: req.query.type as EventType | undefined,
      dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
      dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
    };
    
    const result = await eventsService.getEvents(query);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
}







