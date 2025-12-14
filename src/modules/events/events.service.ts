import { prisma } from '../../prismaClient';
import { Event, EventType } from '@prisma/client';
import { logger } from '../../logger';
import { config } from '../../config';
import { broadcastEvent } from '../../realtime';

export interface CreateEventInput {
  employeeId: number;
  type: EventType;
  timestamp?: Date;
  cameraId?: number;
}

export interface GetEventsQuery {
  companyId: number;
  employeeId?: number;
  type?: EventType;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}

export interface EventsResponse {
  events: Event[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export async function createEvent(input: CreateEventInput): Promise<{ ok: boolean; skipped?: boolean; reason?: string }> {
  // Get employee to determine companyId
  const employee = await prisma.employee.findUnique({
    where: { id: input.employeeId },
  });
  
  if (!employee) {
    throw new Error('Employee not found');
  }
  
  const timestamp = input.timestamp || new Date();
  
  // Check for duplicate events (anti-spam)
  const lastEvent = await prisma.event.findFirst({
    where: { employeeId: input.employeeId },
    orderBy: { timestamp: 'desc' },
  });
  
  if (lastEvent && lastEvent.type === input.type) {
    const timeDiff = timestamp.getTime() - lastEvent.timestamp.getTime();
    
    if (timeDiff < config.eventDeduplicationWindowMs) {
      logger.info(`Skipping duplicate ${input.type} event for employee ${input.employeeId}`);
      return { ok: true, skipped: true, reason: 'duplicate' };
    }
  }
  
  // Create event
  await prisma.event.create({
    data: {
      companyId: employee.companyId,
      employeeId: input.employeeId,
      type: input.type,
      timestamp,
      cameraId: input.cameraId || null,
    },
  });
  
  logger.info(`Event ${input.type} created for employee ${input.employeeId}` + (input.cameraId ? ` from camera ${input.cameraId}` : ''));
  broadcastEvent('event:created', {
    employeeId: input.employeeId,
    companyId: employee.companyId,
    type: input.type,
    timestamp,
    cameraId: input.cameraId,
  });
  
  return { ok: true };
}

export async function getEvents(query: GetEventsQuery): Promise<EventsResponse> {
  const page = query.page || 1;
  const limit = Math.min(query.limit || 50, 200);
  const offset = (page - 1) * limit;
  
  const where: any = {
    companyId: query.companyId,
  };
  
  if (query.employeeId) {
    where.employeeId = query.employeeId;
  }
  
  if (query.type) {
    where.type = query.type;
  }
  
  if (query.dateFrom || query.dateTo) {
    where.timestamp = {};
    if (query.dateFrom) {
      where.timestamp.gte = query.dateFrom;
    }
    if (query.dateTo) {
      where.timestamp.lte = query.dateTo;
    }
  }
  
  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      include: {
        employee: true,
        camera: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
      skip: offset,
      take: limit,
    }),
    prisma.event.count({ where }),
  ]);
  
  const totalPages = Math.ceil(total / limit);
  
  // Transform employee data to match public format
  const formattedEvents = events.map(event => ({
    ...event,
    employee: {
      name: event.employee.name,
      role: event.employee.roleTitle,
    },
  }));
  
  return {
    events: formattedEvents,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}





