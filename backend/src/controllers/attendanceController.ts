import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../prisma';

const checkInSchema = z.object({
  locationId: z.string().uuid('Invalid location ID'),
  note: z.string().trim().max(500).optional().nullable(),
  idempotencyKey: z.string().trim().optional().nullable(),
});

const checkOutSchema = z.object({
  locationId: z.string().uuid('Invalid location ID'),
  note: z.string().trim().max(500).optional().nullable(),
  idempotencyKey: z.string().trim().optional().nullable(),
});

/**
 * Validates if current time falls within location's configured operating hours.
 */
function isWithinOperatingHours(openTime?: string | null, closeTime?: string | null): boolean {
  if (!openTime || !closeTime) return true;

  // Local Phnom Penh / Cambodia time (UTC+7)
  const now = new Date();
  const utcHours = now.getUTCHours();
  const utcMinutes = now.getUTCMinutes();
  const localMinutes = (utcHours * 60 + utcMinutes + 7 * 60) % 1440;

  const [openH, openM] = openTime.split(':').map(Number);
  const [closeH, closeM] = closeTime.split(':').map(Number);

  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  return localMinutes >= openMinutes && localMinutes <= closeMinutes;
}

/**
 * Check-in workflow
 */
export async function checkIn(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const validated = checkInSchema.parse(req.body);

    // 1. Validate location
    const location = await prisma.location.findUnique({
      where: { id: validated.locationId },
    });

    if (!location || !location.isActive) {
      res.status(400).json({
        success: false,
        code: 'LOCATION_INACTIVE',
        message: 'The selected location is currently inactive or does not exist.',
        messageKh: 'ទីតាំងដែលបានជ្រើសរើសមិនសកម្ម ឬមិនមានក្នុងប្រព័ន្ធឡើយ។',
      });
      return;
    }

    if (!location.canCheckIn) {
      res.status(400).json({
        success: false,
        code: 'CHECK_IN_NOT_ALLOWED',
        message: 'Check-in is not permitted at this location.',
        messageKh: 'ការកត់ត្រាវត្តមានចូលមិនត្រូវបានអនុញ្ញាតនៅទីតាំងនេះទេ។',
      });
      return;
    }

    if (!isWithinOperatingHours(location.openTime, location.closeTime)) {
      res.status(400).json({
        success: false,
        code: 'OUTSIDE_OPERATING_HOURS',
        message: `This location operates between ${location.openTime} and ${location.closeTime}. Currently closed.`,
        messageKh: `ទីតាំងនេះបើកដំណើរការចន្លោះម៉ោង ${location.openTime} ដល់ ${location.closeTime}។ បច្ចុប្បន្នត្រូវបានបិទ។`,
      });
      return;
    }

    // 2. Check Idempotency Key
    if (validated.idempotencyKey) {
      const existing = await prisma.attendanceEvent.findUnique({
        where: { idempotencyKey: validated.idempotencyKey },
        include: { location: true },
      });
      if (existing) {
        res.json({
          success: true,
          message: 'Check-in already registered (idempotent submission).',
          messageKh: 'ការកត់ត្រាវត្តមានចូលត្រូវបានកត់ត្រារួចរាល់ហើយ។',
          attendance: existing,
        });
        return;
      }
    }

    // 3. Check Consecutive Check-In Rule
    // A user cannot check-in twice consecutively without a check-out
    const latestEvent = await prisma.attendanceEvent.findFirst({
      where: { userId: user.id },
      orderBy: { timestamp: 'desc' },
      include: { location: true },
    });

    if (latestEvent && latestEvent.eventType === 'CHECK_IN') {
      res.status(400).json({
        success: false,
        code: 'ALREADY_CHECKED_IN',
        message: `You are already checked in at "${latestEvent.location.nameEn}". Please check out first before checking in again.`,
        messageKh: `អ្នកបានកត់ត្រាវត្តមានចូលនៅ "${latestEvent.location.nameKh}" រួចហើយ។ សូមកត់ត្រាចេញជាមុនសិន។`,
        currentSession: latestEvent,
      });
      return;
    }

    // 4. Create Check-In Event using Server Timestamp
    const serverTimestamp = new Date();

    const event = await prisma.attendanceEvent.create({
      data: {
        userId: user.id,
        eventType: 'CHECK_IN',
        locationId: location.id,
        timestamp: serverTimestamp,
        note: validated.note || null,
        idempotencyKey: validated.idempotencyKey || null,
      },
      include: { location: true },
    });

    res.status(201).json({
      success: true,
      message: `Check-in recorded successfully at ${location.nameEn}!`,
      messageKh: `ការកត់ត្រាវត្តមានចូលទទួលបានជោគជ័យនៅ ${location.nameKh}!`,
      attendance: event,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Check-out workflow
 */
export async function checkOut(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const validated = checkOutSchema.parse(req.body);

    // 1. Validate location
    const location = await prisma.location.findUnique({
      where: { id: validated.locationId },
    });

    if (!location || !location.isActive) {
      res.status(400).json({
        success: false,
        code: 'LOCATION_INACTIVE',
        message: 'The selected location is currently inactive or does not exist.',
        messageKh: 'ទីតាំងដែលបានជ្រើសរើសមិនសកម្ម ឬមិនមានក្នុងប្រព័ន្ធឡើយ។',
      });
      return;
    }

    if (!location.canCheckOut) {
      res.status(400).json({
        success: false,
        code: 'CHECK_OUT_NOT_ALLOWED',
        message: 'Check-out is not permitted at this location.',
        messageKh: 'ការកត់ត្រាវត្តមានចេញមិនត្រូវបានអនុញ្ញាតនៅទីតាំងនេះទេ។',
      });
      return;
    }

    if (!isWithinOperatingHours(location.openTime, location.closeTime)) {
      res.status(400).json({
        success: false,
        code: 'OUTSIDE_OPERATING_HOURS',
        message: `This location operates between ${location.openTime} and ${location.closeTime}. Currently closed.`,
        messageKh: `ទីតាំងនេះបើកដំណើរការចន្លោះម៉ោង ${location.openTime} ដល់ ${location.closeTime}។ បច្ចុប្បន្នត្រូវបានបិទ។`,
      });
      return;
    }

    // 2. Check Idempotency Key
    if (validated.idempotencyKey) {
      const existing = await prisma.attendanceEvent.findUnique({
        where: { idempotencyKey: validated.idempotencyKey },
        include: { location: true },
      });
      if (existing) {
        res.json({
          success: true,
          message: 'Check-out already registered (idempotent submission).',
          messageKh: 'ការកត់ត្រាវត្តមានចេញត្រូវបានកត់ត្រារួចរាល់ហើយ។',
          attendance: existing,
        });
        return;
      }
    }

    // 3. Check Consecutive Rule: User cannot check-out without an active check-in
    const latestEvent = await prisma.attendanceEvent.findFirst({
      where: { userId: user.id },
      orderBy: { timestamp: 'desc' },
      include: { location: true },
    });

    if (!latestEvent || latestEvent.eventType !== 'CHECK_IN') {
      res.status(400).json({
        success: false,
        code: 'NO_ACTIVE_CHECK_IN',
        message: 'No open check-in session found. You must check in before checking out.',
        messageKh: 'មិនមានវគ្គចូលវត្តមានដែលបើកចំហឡើយ។ អ្នកត្រូវកត់ត្រាចូលជាមុនសិន។',
      });
      return;
    }

    // 4. Calculate duration in minutes
    const serverTimestamp = new Date();
    const durationMinutes = Math.max(
      0,
      Math.round((serverTimestamp.getTime() - new Date(latestEvent.timestamp).getTime()) / 60000)
    );

    const event = await prisma.attendanceEvent.create({
      data: {
        userId: user.id,
        eventType: 'CHECK_OUT',
        locationId: location.id,
        timestamp: serverTimestamp,
        note: validated.note || null,
        idempotencyKey: validated.idempotencyKey || null,
        durationMinutes,
      },
      include: { location: true },
    });

    res.status(201).json({
      success: true,
      message: `Check-out recorded successfully at ${location.nameEn}! Duration: ${durationMinutes} minutes.`,
      messageKh: `ការកត់ត្រាវត្តមានចេញទទួលបានជោគជ័យនៅ ${location.nameKh}! រយៈពេល៖ ${durationMinutes} នាទី។`,
      attendance: event,
      durationMinutes,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Returns user's current attendance status for today
 */
export async function getMeStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;

    const latestEvent = await prisma.attendanceEvent.findFirst({
      where: { userId: user.id },
      orderBy: { timestamp: 'desc' },
      include: { location: true },
    });

    let currentStatus: 'CHECKED_IN' | 'CHECKED_OUT' | 'NO_RECORD' = 'NO_RECORD';

    if (latestEvent) {
      currentStatus = latestEvent.eventType === 'CHECK_IN' ? 'CHECKED_IN' : 'CHECKED_OUT';
    }

    res.json({
      success: true,
      user,
      currentStatus,
      latestEvent,
      serverTime: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Returns personal attendance history for the logged-in user
 */
export async function getMyHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt((req.query.limit as string) || '10', 10)));
    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      prisma.attendanceEvent.findMany({
        where: { userId: user.id },
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
        include: { location: true },
      }),
      prisma.attendanceEvent.count({
        where: { userId: user.id },
      }),
    ]);

    res.json({
      success: true,
      events,
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
