import { prisma } from '../../prismaClient';

export interface StatisticsQuery {
  companyId: number;
  dateFrom: Date;
  dateTo: Date;
}

export interface StatisticsResponse {
  period: {
    from: string;
    to: string;
  };
  summary: {
    totalEvents: number;
    uniqueEmployees: number;
    avgEventsPerDay: string;
  };
  eventsByDay: Array<{
    date: string;
    count: number;
    ins: number;
    outs: number;
  }>;
  topEmployees: Array<{
    id: number;
    name: string;
    eventCount: number;
  }>;
}

export async function getStatistics(query: StatisticsQuery): Promise<StatisticsResponse> {
  const { companyId, dateFrom, dateTo } = query;
  
  // Events by day
  const eventsByDayRaw = await prisma.$queryRaw<Array<{
    date: Date;
    count: bigint;
    ins: bigint;
    outs: bigint;
  }>>`
    SELECT 
      DATE(timestamp) as date,
      COUNT(*) as count,
      SUM(CASE WHEN type = 'IN' THEN 1 ELSE 0 END) as ins,
      SUM(CASE WHEN type = 'OUT' THEN 1 ELSE 0 END) as outs
    FROM events
    WHERE "companyId" = ${companyId}
      AND DATE(timestamp) BETWEEN DATE(${dateFrom}) AND DATE(${dateTo})
    GROUP BY DATE(timestamp)
    ORDER BY date DESC
  `;
  
  const eventsByDay = eventsByDayRaw.map((row) => ({
    date: row.date.toISOString().split('T')[0],
    count: Number(row.count),
    ins: Number(row.ins),
    outs: Number(row.outs),
  }));
  
  // Top employees
  const topEmployeesRaw = await prisma.$queryRaw<Array<{
    id: number;
    name: string;
    eventCount: bigint;
  }>>`
    SELECT 
      e.id,
      e.name,
      COUNT(*) as "eventCount"
    FROM events ev
    JOIN employees e ON ev."employeeId" = e.id
    WHERE ev."companyId" = ${companyId}
      AND DATE(ev.timestamp) BETWEEN DATE(${dateFrom}) AND DATE(${dateTo})
    GROUP BY e.id, e.name
    ORDER BY "eventCount" DESC
    LIMIT 10
  `;
  
  const topEmployees = topEmployeesRaw.map((row) => ({
    id: row.id,
    name: row.name,
    eventCount: Number(row.eventCount),
  }));
  
  // Total events
  const totalEvents = await prisma.event.count({
    where: {
      companyId,
      timestamp: {
        gte: dateFrom,
        lte: dateTo,
      },
    },
  });
  
  // Unique employees
  const uniqueEmployees = await prisma.event.findMany({
    where: {
      companyId,
      timestamp: {
        gte: dateFrom,
        lte: dateTo,
      },
    },
    select: {
      employeeId: true,
    },
    distinct: ['employeeId'],
  });
  
  const avgEventsPerDay = eventsByDay.length > 0
    ? (totalEvents / eventsByDay.length).toFixed(1)
    : '0';
  
  return {
    period: {
      from: dateFrom.toISOString().split('T')[0],
      to: dateTo.toISOString().split('T')[0],
    },
    summary: {
      totalEvents,
      uniqueEmployees: uniqueEmployees.length,
      avgEventsPerDay,
    },
    eventsByDay,
    topEmployees,
  };
}








