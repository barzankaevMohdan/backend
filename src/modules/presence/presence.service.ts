import { prisma } from '../../prismaClient';
import * as eventsService from '../events/events.service';

export interface PresenceStatus {
  id: number;
  name: string;
  roleTitle: string | null;
  photoUrl: string | null;
  present: boolean;
  lastEventType: string | null;
  lastEventTime: Date | null;
}

export async function getPresence(companyId: number): Promise<PresenceStatus[]> {
  // Get all employees with their last event
  const employees = await prisma.employee.findMany({
    where: { companyId },
    include: {
      events: {
        orderBy: { timestamp: 'desc' },
        take: 1,
      },
    },
  });
  
  return employees.map((employee) => {
    const lastEvent = employee.events[0] || null;
    
    return {
      id: employee.id,
      name: employee.name,
      roleTitle: employee.roleTitle,
      photoUrl: employee.photoFilename ? `/uploads/employees/${employee.photoFilename}` : null,
      present: lastEvent?.type === 'IN',
      lastEventType: lastEvent?.type || null,
      lastEventTime: lastEvent?.timestamp || null,
    };
  });
}

export async function resetPresence(
  companyId: number,
  olderThanMinutes?: number
): Promise<number> {
  const olderThanDate =
    olderThanMinutes && olderThanMinutes > 0
      ? new Date(Date.now() - olderThanMinutes * 60 * 1000)
      : null;

  // Fetch employees with their latest event
  const employees = await prisma.employee.findMany({
    where: { companyId },
    include: {
      events: {
        orderBy: { timestamp: 'desc' },
        take: 1,
      },
    },
  });

  const targets = employees.filter((employee) => {
    const lastEvent = employee.events[0];
    if (!lastEvent) return false;
    if (lastEvent.type !== 'IN') return false;
    if (olderThanDate && lastEvent.timestamp > olderThanDate) return false;
    return true;
  });

  for (const employee of targets) {
    await eventsService.createEvent({
      employeeId: employee.id,
      type: 'OUT',
    });
  }

  return targets.length;
}

export async function resetPresenceByCompanySlug(
  companySlug: string,
  olderThanMinutes?: number
): Promise<{ count: number }> {
  const company = await prisma.company.findUnique({
    where: { slug: companySlug },
  });

  if (!company) {
    throw new Error('Company not found');
  }

  const count = await resetPresence(company.id, olderThanMinutes);
  return { count };
}








