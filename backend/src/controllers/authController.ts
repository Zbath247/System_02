import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../prisma';
import { normalizeIdentifier, compareNames } from '../utils/idNormalizer';
import { logAuditEvent } from '../utils/auditLogger';
import { SESSION_COOKIE_NAME } from '../middlewares/authMiddleware';
import { config } from '../config/env';

const registerSchema = z.object({
  nameKh: z.string().trim().min(2, 'Khmer name must be at least 2 characters'),
  nameEn: z.string().trim().min(2, 'English name must be at least 2 characters'),
  identifier: z.string().trim().min(3, 'Student or Staff ID must be at least 3 characters'),
  category: z.enum(['STUDENT', 'TEACHER', 'STAFF']).default('STUDENT'),
  gender: z.string().trim().optional().nullable(),
  building: z.string().trim().optional().nullable(),
  faculty: z.string().trim().min(1, 'Faculty / Department is required'),
  major: z.string().trim().optional().nullable(),
  classGroup: z.string().trim().optional().nullable(),
  phone: z.string().trim().optional().nullable(),
  telegram: z.string().trim().optional().nullable(),
  email: z.string().trim().email('Invalid email address').optional().nullable().or(z.literal('')),
  photoUrl: z.string().trim().optional().nullable(),
});

const identifySchema = z.object({
  identifier: z.string().trim().min(1, 'Student ID / Staff ID is required'),
  name: z.string().trim().min(1, 'Full name is required'),
});

const adminLoginSchema = z.object({
  identifier: z.string().trim().min(1, 'Email or Staff ID is required'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Creates a server-side session and configures the HTTP-only cookie.
 */
async function createServerSession(userId: string, req: Request, res: Response) {
  const token = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + config.sessionExpiryDays);

  await prisma.session.create({
    data: {
      token,
      userId,
      userAgent: req.headers['user-agent'] || null,
      ipAddress: req.ip || null,
      expiresAt,
    },
  });

  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: config.cookieSecure ? 'none' : 'lax',
    domain: config.cookieDomain,
    expires: expiresAt,
  });

  return token;
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validated = registerSchema.parse(req.body);
    const normalizedId = normalizeIdentifier(validated.identifier);

    // Check if ID already exists
    const existingUser = await prisma.user.findUnique({
      where: { identifier: normalizedId },
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        code: 'IDENTIFIER_ALREADY_EXISTS',
        message: `An account with ID "${normalizedId}" is already registered. Please use Option B to identify your account.`,
        messageKh: `គណនីដែលមានលេខសម្គាល់ "${normalizedId}" ត្រូវបានចុះឈ្មោះរួចហើយ។ សូមប្រើប្រាស់ជម្រើសសម្គាល់គណនី។`,
      });
      return;
    }

    // Check email uniqueness if provided
    if (validated.email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: validated.email },
      });
      if (existingEmail) {
        res.status(409).json({
          success: false,
          code: 'EMAIL_ALREADY_EXISTS',
          message: 'This email address is already associated with another account.',
          messageKh: 'អ៊ីមែលនេះត្រូវបានប្រើប្រាស់ដោយគណនីផ្សេងរួចហើយ។',
        });
        return;
      }
    }

    // Determine approval status
    const autoApproveSetting = await prisma.systemSetting.findUnique({
      where: { key: 'AUTO_APPROVE_STUDENTS' },
    });
    const autoApprove = autoApproveSetting ? autoApproveSetting.value === 'true' : config.autoApproveStudents;

    // Students are auto-approved if setting is enabled; Teachers/Staff can also follow policy
    let initialStatus = 'ACTIVE';
    if (!autoApprove && validated.category === 'STUDENT') {
      initialStatus = 'PENDING_APPROVAL';
    }

    // Explicitly restrict role to non-privileged roles:
    const assignedRole = validated.category === 'TEACHER' ? 'TEACHER' : validated.category === 'STAFF' ? 'STAFF' : 'STUDENT';

    const user = await prisma.user.create({
      data: {
        identifier: normalizedId,
        nameKh: validated.nameKh.trim(),
        nameEn: validated.nameEn.trim(),
        category: validated.category,
        role: assignedRole,
        gender: validated.gender?.trim() || null,
        building: validated.building?.trim() || null,
        faculty: validated.faculty.trim(),
        major: validated.major?.trim() || null,
        classGroup: validated.classGroup?.trim() || null,
        phone: validated.phone?.trim() || null,
        telegram: validated.telegram?.trim() || null,
        email: validated.email?.trim() || null,
        photoUrl: validated.photoUrl || null,
        status: initialStatus,
      },
    });

    await logAuditEvent({
      action: 'USER_REGISTERED',
      actorId: user.id,
      targetId: user.id,
      targetType: 'USER',
      details: { identifier: user.identifier, status: user.status, category: user.category },
      ipAddress: req.ip,
    });

    // If active, issue persistent session immediately
    let sessionToken: string | null = null;
    if (user.status === 'ACTIVE') {
      sessionToken = await createServerSession(user.id, req, res);
    }

    res.status(201).json({
      success: true,
      token: sessionToken,
      message:
        user.status === 'ACTIVE'
          ? 'Registration successful! Welcome to the University Attendance System.'
          : 'Registration submitted! Your account is pending administrator approval before recording attendance.',
      messageKh:
        user.status === 'ACTIVE'
          ? 'ការចុះឈ្មោះជោគជ័យ! សូមស្វាគមន៍មកកាន់ប្រព័ន្ធវត្តមានសាកលវិទ្យាល័យ។'
          : 'ការចុះឈ្មោះទទួលបានជោគជ័យ! គណនីរបស់អ្នកកំពុងរង់ចាំការអនុម័តពីរដ្ឋបាល។',
      user: {
        id: user.id,
        identifier: user.identifier,
        nameKh: user.nameKh,
        nameEn: user.nameEn,
        category: user.category,
        role: user.role,
        faculty: user.faculty,
        major: user.major,
        classGroup: user.classGroup,
        status: user.status,
      },
      isPending: user.status === 'PENDING_APPROVAL',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Option B: Identify account on a new phone/browser using Student ID + Registered Full Name.
 */
export async function identify(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validated = identifySchema.parse(req.body);
    const normalizedId = normalizeIdentifier(validated.identifier);

    const user = await prisma.user.findUnique({
      where: { identifier: normalizedId },
    });

    // Generic error to prevent account enumeration
    const genericAuthError = {
      success: false,
      code: 'INVALID_CREDENTIALS',
      message: 'Verification failed. Please check your Student/Staff ID and Full Name (Khmer or English).',
      messageKh: 'ការផ្ទៀងផ្ទាត់មិនត្រឹមត្រូវ។ សូមពិនិត្យលេខសម្គាល់ និងឈ្មោះពេញ (ខ្មែរ ឬ អង់គ្លេស) របស់អ្នកឡើងវិញ។',
    };

    if (!user) {
      await logAuditEvent({
        action: 'IDENTIFY_FAILED_UNKNOWN_ID',
        details: { attemptedId: normalizedId },
        ipAddress: req.ip,
      });
      res.status(401).json(genericAuthError);
      return;
    }

    // Verify name match
    const isNameMatch = compareNames(validated.name, user.nameKh, user.nameEn);
    if (!isNameMatch) {
      await logAuditEvent({
        action: 'IDENTIFY_FAILED_NAME_MISMATCH',
        targetId: user.id,
        targetType: 'USER',
        details: { identifier: user.identifier },
        ipAddress: req.ip,
      });
      res.status(401).json(genericAuthError);
      return;
    }

    // Check account status
    if (user.status === 'SUSPENDED') {
      res.status(403).json({
        success: false,
        code: 'ACCOUNT_SUSPENDED',
        message: 'This account has been suspended by university administration.',
        messageKh: 'គណនីនេះត្រូវបានផ្អាកដំណើរការដោយរដ្ឋបាលសាកលវិទ្យាល័យ។',
      });
      return;
    }

    if (user.status === 'PENDING_APPROVAL') {
      res.status(403).json({
        success: false,
        code: 'PENDING_APPROVAL',
        message: 'This account is pending administrator approval.',
        messageKh: 'គណនីនេះកំពុងរង់ចាំការអនុម័តពីរដ្ឋបាល។',
      });
      return;
    }

    // Successful match -> Issue new persistent session
    const sessionToken = await createServerSession(user.id, req, res);

    await logAuditEvent({
      action: 'IDENTIFY_SUCCESS',
      actorId: user.id,
      targetId: user.id,
      targetType: 'USER',
      details: { identifier: user.identifier },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      token: sessionToken,
      message: 'Account verified successfully. Welcome back!',
      messageKh: 'ការសម្គាល់គណនីទទួលបានជោគជ័យ! សូមស្វាគមន៍ការត្រឡប់មកវិញ។',
      user: {
        id: user.id,
        identifier: user.identifier,
        nameKh: user.nameKh,
        nameEn: user.nameEn,
        category: user.category,
        role: user.role,
        faculty: user.faculty,
        major: user.major,
        classGroup: user.classGroup,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Admin Login via email or staff ID + password.
 */
export async function adminLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validated = adminLoginSchema.parse(req.body);
    const identifierOrEmail = validated.identifier.trim();

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { identifier: { equals: normalizeIdentifier(identifierOrEmail), mode: 'insensitive' } },
          { identifier: { equals: identifierOrEmail, mode: 'insensitive' } },
          { email: { equals: identifierOrEmail.toLowerCase(), mode: 'insensitive' } },
        ],
      },
    });

    if (!user || !user.passwordHash) {
      res.status(401).json({
        success: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid administrative credentials.',
        messageKh: 'ព័ត៌មានសម្ងាត់អ្នកគ្រប់គ្រងមិនត្រឹមត្រូវទេ។',
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(validated.password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid administrative credentials.',
        messageKh: 'ព័ត៌មានសម្ងាត់អ្នកគ្រប់គ្រងមិនត្រឹមត្រូវទេ។',
      });
      return;
    }

    if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      res.status(403).json({
        success: false,
        code: 'FORBIDDEN',
        message: 'This account does not have administrative privileges.',
        messageKh: 'គណនីនេះមិនមានសិទ្ធិជាអ្នកគ្រប់គ្រងទេ។',
      });
      return;
    }

    if (user.status !== 'ACTIVE') {
      res.status(403).json({
        success: false,
        code: 'ACCOUNT_NOT_ACTIVE',
        message: 'Administrator account is inactive or suspended.',
        messageKh: 'គណនីអ្នកគ្រប់គ្រងនេះមិនសកម្ម ឬត្រូវបានផ្អាក។',
      });
      return;
    }

    const sessionToken = await createServerSession(user.id, req, res);

    await logAuditEvent({
      action: 'ADMIN_LOGIN_SUCCESS',
      actorId: user.id,
      targetId: user.id,
      targetType: 'USER',
      details: { identifier: user.identifier, role: user.role },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      token: sessionToken,
      message: 'Administrator sign in successful.',
      messageKh: 'ការចូលប្រើប្រាស់របស់អ្នកគ្រប់គ្រងជោគជ័យ។',
      user: {
        id: user.id,
        identifier: user.identifier,
        nameKh: user.nameKh,
        nameEn: user.nameEn,
        category: user.category,
        role: user.role,
        faculty: user.faculty,
        email: user.email,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Returns currently active session and user info.
 */
export async function getSession(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.json({
      success: true,
      authenticated: false,
      user: null,
    });
    return;
  }

  res.json({
    success: true,
    authenticated: true,
    user: req.user,
  });
}

/**
 * Logs out and revokes the active session.
 */
export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.session) {
      await prisma.session.update({
        where: { id: req.session.id },
        data: { isRevoked: true },
      });
    }

    res.clearCookie(SESSION_COOKIE_NAME, {
      httpOnly: true,
      secure: config.cookieSecure,
      sameSite: config.cookieSecure ? 'none' : 'lax',
      domain: config.cookieDomain,
    });

    res.json({
      success: true,
      message: 'Logged out successfully.',
      messageKh: 'បានចាកចេញដោយជោគជ័យ។',
    });
  } catch (error) {
    next(error);
  }
}
