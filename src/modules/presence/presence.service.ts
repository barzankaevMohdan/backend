import { prisma } from '../../prismaClient';

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








