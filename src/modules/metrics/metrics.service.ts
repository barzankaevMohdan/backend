import { prisma } from '../../prismaClient';

const startedAt = Date.now();

export async function getMetrics(companyId?: number | null) {
  const companyScope = companyId ?? null;

  const companyCount = companyScope ? 1 : await prisma.company.count({ where: { isActive: true } });

  const [users, employees, cameras, events, lastEvent] = await prisma.$transaction([
    prisma.user.count(companyScope ? { where: { companyId: companyScope } } : undefined),
    prisma.employee.count(companyScope ? { where: { companyId: companyScope } } : undefined),
    prisma.camera.count(companyScope ? { where: { companyId: companyScope } } : undefined),
    prisma.event.count(companyScope ? { where: { companyId: companyScope } } : undefined),
    prisma.event.findFirst({
      where: companyScope ? { companyId: companyScope } : undefined,
      orderBy: { timestamp: 'desc' },
    }),
  ]);

  return {
    uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
    companies: companyCount,
    users,
    employees,
    cameras,
    events,
    lastEventAt: lastEvent?.timestamp ?? null,
  };
}




