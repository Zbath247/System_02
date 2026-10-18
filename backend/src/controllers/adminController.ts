import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../prisma';
import { logAuditEvent } from '../utils/auditLogger';

const updateUserStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'PENDING_APPROVAL', 'SUSPENDED']),
  reason: z.string().trim().optional(),
});

const updateUserRoleSchema = z.object({
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STAFF', 'STUDENT']),
});

const locationSchema = z.object({
  code: z.string().trim().min(2).toUpperCase(),
  nameKh: z.string().trim().min(2),
  nameEn: z.string().trim().min(2),
  description: z.string().trim().optional().nullable(),
  category: z.enum(['CAMPUS', 'BUILDING', 'HALL', 'ROOM', 'LAB', 'GATE', 'LIBRARY']),
  canCheckIn: z.boolean().default(true),
  canCheckOut: z.boolean().default(true),
  isActive: z.boolean().default(true),
  openTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().nullable().or(z.literal('')),
  closeTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().nullable().or(z.literal('')),
});

/**
 * Overview statistics and aggregated metrics for Admin Dashboard
 */
export async function getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      activeUsers,
      pendingApprovals,
      suspendedUsers,
      todayCheckIns,
      todayCheckOuts,
      recentActivity,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { status: 'PENDING_APPROVAL' } }),
      prisma.user.count({ where: { status: 'SUSPENDED' } }),
      prisma.attendanceEvent.count({
        where: {
          eventType: 'CHECK_IN',
          timestamp: { gte: today },
        },
      }),
      prisma.attendanceEvent.count({
        where: {
          eventType: 'CHECK_OUT',
          timestamp: { gte: today },
        },
      }),
      prisma.attendanceEvent.findMany({
        take: 10,
        orderBy: { timestamp: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              identifier: true,
              nameKh: true,
              nameEn: true,
              category: true,
              faculty: true,
            },
          },
          location: true,
        },
      }),
    ]);

    const currentlyOpenSessions = Math.max(0, todayCheckIns - todayCheckOuts);

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        pendingApprovals,
        suspendedUsers,
        todayCheckIns,
        todayCheckOuts,
        currentlyOpenSessions,
      },
      recentActivity,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * List all users with filtering, search, and pagination
 */
export async function getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || '15', 10)));
    const skip = (page - 1) * limit;

    const search = ((req.query.search as string) || '').trim();
    const role = (req.query.role as string) || undefined;
    const status = (req.query.status as string) || undefined;
    const category = (req.query.category as string) || undefined;
    const faculty = (req.query.faculty as string) || undefined;

    const where: any = {};

    if (search) {
      where.OR = [
        { identifier: { contains: search } },
        { nameEn: { contains: search } },
        { nameKh: { contains: search } },
        { email: { contains: search } },
      ];
    }

    if (role) where.role = role;
    if (status) where.status = status;
    if (category) where.category = category;
    if (faculty) where.faculty = faculty;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
          email: true,
          phone: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      users,
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
 * Get detailed profile for a specific user
 */
export async function getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        sessions: {
          where: { isRevoked: false, expiresAt: { gt: new Date() } },
          orderBy: { createdAt: 'desc' },
        },
        attendances: {
          take: 10,
          orderBy: { timestamp: 'desc' },
          include: { location: true },
        },
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found.',
        messageKh: 'រកមិនឃើញអ្នកប្រើប្រាស់នេះទេ។',
      });
      return;
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update user status (Approve, Suspend, Reactivate)
 */
export async function updateUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { status, reason } = updateUserStatusSchema.parse(req.body);
    const adminUser = req.user!;

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    // If target is super admin, protect against accidental demotion/suspension
    if (targetUser.role === 'SUPER_ADMIN' && adminUser.role !== 'SUPER_ADMIN') {
      res.status(403).json({
        success: false,
        message: 'Only Super Administrators can modify Super Admin accounts.',
      });
      return;
    }

    // Update status
    const updated = await prisma.user.update({
      where: { id },
      data: { status },
    });

    // If suspended, revoke all active sessions immediately
    if (status === 'SUSPENDED') {
      await prisma.session.updateMany({
        where: { userId: id, isRevoked: false },
        data: { isRevoked: true },
      });
    }

    await logAuditEvent({
      action: `USER_STATUS_${status}`,
      actorId: adminUser.id,
      targetId: targetUser.id,
      targetType: 'USER',
      details: {
        oldStatus: targetUser.status,
        newStatus: status,
        reason: reason || null,
        targetIdentifier: targetUser.identifier,
      },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `User status successfully updated to ${status}.`,
      messageKh: `ស្ថានភាពអ្នកប្រើប្រាស់ត្រូវបានកែប្រែទៅជា ${status} ដោយជោគជ័យ។`,
      user: updated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Revoke all active sessions for a user
 */
export async function revokeUserSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const adminUser = req.user!;

    const result = await prisma.session.updateMany({
      where: { userId: id, isRevoked: false },
      data: { isRevoked: true },
    });

    await logAuditEvent({
      action: 'ADMIN_REVOKED_USER_SESSIONS',
      actorId: adminUser.id,
      targetId: id,
      targetType: 'USER',
      details: { revokedCount: result.count },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `Successfully revoked ${result.count} active session(s).`,
      messageKh: `បានលុបចោលសម័យប្រជុំសកម្មចំនួន ${result.count} ដោយជោគជ័យ។`,
      revokedCount: result.count,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update user role (RBAC) - Super Admin only
 */
export async function updateUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { role } = updateUserRoleSchema.parse(req.body);
    const adminUser = req.user!;

    if (adminUser.role !== 'SUPER_ADMIN') {
      res.status(403).json({
        success: false,
        message: 'Only Super Administrators can modify user roles.',
      });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
    });

    await logAuditEvent({
      action: 'USER_ROLE_CHANGED',
      actorId: adminUser.id,
      targetId: id,
      targetType: 'USER',
      details: { newRole: role },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `User role updated to ${role}.`,
      user: updated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Locations Management - Get all locations
 */
export async function getAllLocations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const locations = await prisma.location.findMany({
      orderBy: [{ isActive: 'desc' }, { code: 'asc' }],
    });

    res.json({
      success: true,
      locations,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new location
 */
export async function createLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validated = locationSchema.parse(req.body);
    const adminUser = req.user!;

    const existing = await prisma.location.findUnique({
      where: { code: validated.code },
    });

    if (existing) {
      res.status(409).json({
        success: false,
        code: 'LOCATION_CODE_EXISTS',
        message: `A location with code "${validated.code}" already exists.`,
      });
      return;
    }

    const location = await prisma.location.create({
      data: {
        code: validated.code,
        nameKh: validated.nameKh,
        nameEn: validated.nameEn,
        description: validated.description || null,
        category: validated.category,
        canCheckIn: validated.canCheckIn,
        canCheckOut: validated.canCheckOut,
        isActive: validated.isActive,
        openTime: validated.openTime || null,
        closeTime: validated.closeTime || null,
      },
    });

    await logAuditEvent({
      action: 'LOCATION_CREATED',
      actorId: adminUser.id,
      targetId: location.id,
      targetType: 'LOCATION',
      details: { code: location.code, nameEn: location.nameEn },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Location created successfully.',
      messageKh: 'ទីតាំងត្រូវបានបង្កើតដោយជោគជ័យ។',
      location,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update an existing location (or toggle active status)
 */
export async function updateLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const validated = locationSchema.partial().parse(req.body);
    const adminUser = req.user!;

    const existing = await prisma.location.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Location not found.' });
      return;
    }

    const updated = await prisma.location.update({
      where: { id },
      data: {
        ...validated,
        openTime: validated.openTime !== undefined ? (validated.openTime || null) : existing.openTime,
        closeTime: validated.closeTime !== undefined ? (validated.closeTime || null) : existing.closeTime,
      },
    });

    await logAuditEvent({
      action: 'LOCATION_UPDATED',
      actorId: adminUser.id,
      targetId: updated.id,
      targetType: 'LOCATION',
      details: { code: updated.code, changes: validated },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Location updated successfully.',
      messageKh: 'ទីតាំងត្រូវបានកែប្រែដោយជោគជ័យ។',
      location: updated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Audit Logs Retrieval
 */
export async function getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || '20', 10)));
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: { id: true, identifier: true, nameEn: true, role: true },
          },
        },
      }),
      prisma.auditLog.count(),
    ]);

    res.json({
      success: true,
      logs,
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
 * System Settings
 */
export async function getSystemSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const settings = await prisma.systemSetting.findMany();
    res.json({ success: true, settings });
  } catch (error) {
    next(error);
  }
}

export async function updateSystemSetting(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { key } = req.params;
    const { value } = req.body;

    const updated = await prisma.systemSetting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });

    res.json({ success: true, setting: updated });
  } catch (error) {
    next(error);
  }
}
