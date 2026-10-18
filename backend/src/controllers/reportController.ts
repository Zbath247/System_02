import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
import { buildCsv } from '../utils/csvExporter';

interface AttendanceFilterQuery {
  startDate?: string;
  endDate?: string;
  userId?: string;
  faculty?: string;
  category?: string;
  locationId?: string;
  eventType?: string;
  search?: string;
}

function buildWhereClause(query: AttendanceFilterQuery) {
  const where: any = {};

  if (query.userId) {
    where.userId = query.userId;
  }

  if (query.eventType) {
    where.eventType = query.eventType;
  }

  if (query.locationId) {
    where.locationId = query.locationId;
  }

  if (query.startDate || query.endDate) {
    where.timestamp = {};
    if (query.startDate) {
      const start = new Date(query.startDate);
      start.setHours(0, 0, 0, 0);
      where.timestamp.gte = start;
    }
    if (query.endDate) {
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      where.timestamp.lte = end;
    }
  }

  const userWhere: any = {};
  if (query.faculty) {
    userWhere.faculty = query.faculty;
  }
  if (query.category) {
    userWhere.category = query.category;
  }
  if (query.search) {
    const s = query.search.trim();
    userWhere.OR = [
      { identifier: { contains: s } },
      { nameEn: { contains: s } },
      { nameKh: { contains: s } },
    ];
  }

  if (Object.keys(userWhere).length > 0) {
    where.user = userWhere;
  }

  return where;
}

/**
 * Filtered attendance reports with pagination
 */
export async function getAttendanceReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || '20', 10)));
    const skip = (page - 1) * limit;

    const where = buildWhereClause(req.query as AttendanceFilterQuery);

    const [records, total] = await Promise.all([
      prisma.attendanceEvent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              identifier: true,
              nameKh: true,
              nameEn: true,
              category: true,
              role: true,
              faculty: true,
              major: true,
              classGroup: true,
            },
          },
          location: true,
        },
      }),
      prisma.attendanceEvent.count({ where }),
    ]);

    res.json({
      success: true,
      records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Export filtered attendance records directly to CSV
 */
export async function exportAttendanceCsv(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const where = buildWhereClause(req.query as AttendanceFilterQuery);

    const records = await prisma.attendanceEvent.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 5000, // Export up to 5000 rows
      include: {
        user: true,
        location: true,
      },
    });

    const headers = [
      'Event ID',
      'Student/Staff ID',
      'Khmer Name',
      'English Name',
      'Category',
      'Faculty/Department',
      'Major',
      'Class/Group',
      'Event Type',
      'Location Code',
      'Location (EN)',
      'Location (KH)',
      'Timestamp (UTC)',
      'Local Time (ICT/UTC+7)',
      'Duration (Minutes)',
      'Note',
    ];

    const rows = records.map((r) => {
      const utcDate = new Date(r.timestamp);
      // Format local Cambodian time (UTC+7)
      const localTimeStr = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Phnom_Penh',
        dateStyle: 'medium',
        timeStyle: 'medium',
      }).format(utcDate);

      return [
        r.id,
        r.user.identifier,
        r.user.nameKh,
        r.user.nameEn,
        r.user.category,
        r.user.faculty,
        r.user.major || '',
        r.user.classGroup || '',
        r.eventType,
        r.location.code,
        r.location.nameEn,
        r.location.nameKh,
        r.timestamp.toISOString(),
        localTimeStr,
        r.durationMinutes !== null ? r.durationMinutes : '',
        r.note || '',
      ];
    });

    const csvContent = buildCsv(headers, rows);
    const filename = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    // Prepend UTF-8 BOM so Excel opens Khmer characters correctly
    res.send('\uFEFF' + csvContent);
  } catch (error) {
    next(error);
  }
}
