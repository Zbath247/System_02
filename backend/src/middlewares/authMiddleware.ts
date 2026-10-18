import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';

export interface AuthenticatedUser {
  id: string;
  identifier: string;
  nameKh: string;
  nameEn: string;
  category: string;
  role: string;
  faculty: string;
  major: string | null;
  classGroup: string | null;
  email: string | null;
  phone: string | null;
  status: string;
}

export interface AuthenticatedSession {
  id: string;
  token: string;
  expiresAt: Date;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      session?: AuthenticatedSession;
    }
  }
}

export const SESSION_COOKIE_NAME = 'uni_auth_session';

/**
 * Authenticates the request via persistent server-managed HTTP-only session cookie.
 */
export async function authenticateSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.[SESSION_COOKIE_NAME] || req.headers['x-session-token'];

    if (!token || typeof token !== 'string') {
      return next();
    }

    const sessionRecord = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!sessionRecord) {
      res.clearCookie(SESSION_COOKIE_NAME);
      return next();
    }

    // Check user account status first
    if (sessionRecord.user.status === 'SUSPENDED') {
      await prisma.session.updateMany({
        where: { id: sessionRecord.id, isRevoked: false },
        data: { isRevoked: true },
      });
      res.clearCookie(SESSION_COOKIE_NAME);
      res.status(403).json({
        success: false,
        code: 'ACCOUNT_SUSPENDED',
        message: 'Your account has been suspended by administration.',
        messageKh: 'គណនីរបស់អ្នកត្រូវបានផ្អាកដំណើរការដោយរដ្ឋបាល។',
      });
      return;
    }

    // Check expiration or revocation
    if (new Date(sessionRecord.expiresAt) <= new Date() || sessionRecord.isRevoked) {
      res.clearCookie(SESSION_COOKIE_NAME);
      return next();
    }

    req.user = {
      id: sessionRecord.user.id,
      identifier: sessionRecord.user.identifier,
      nameKh: sessionRecord.user.nameKh,
      nameEn: sessionRecord.user.nameEn,
      category: sessionRecord.user.category,
      role: sessionRecord.user.role,
      faculty: sessionRecord.user.faculty,
      major: sessionRecord.user.major,
      classGroup: sessionRecord.user.classGroup,
      email: sessionRecord.user.email,
      phone: sessionRecord.user.phone,
      status: sessionRecord.user.status,
    };

    req.session = {
      id: sessionRecord.id,
      token: sessionRecord.token,
      expiresAt: sessionRecord.expiresAt,
    };

    next();
  } catch (error) {
    console.error('Session authentication error:', error);
    next(error);
  }
}

/**
 * Ensures user is authenticated.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user || !req.session) {
    res.status(401).json({
      success: false,
      code: 'UNAUTHORIZED',
      message: 'Authentication session required. Please scan System QR Code or identify your account.',
      messageKh: 'ត្រូវការការផ្ទៀងផ្ទាត់។ សូមស្កេន QR Code ឬសម្គាល់គណនីរបស់អ្នក។',
    });
    return;
  }
  next();
}

/**
 * Ensures user has ACTIVE status (approved) to record attendance.
 */
export function requireActiveAccount(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      code: 'UNAUTHORIZED',
      message: 'Authentication required.',
      messageKh: 'ត្រូវការការផ្ទៀងផ្ទាត់។',
    });
    return;
  }

  if (req.user.status === 'PENDING_APPROVAL') {
    res.status(403).json({
      success: false,
      code: 'PENDING_APPROVAL',
      message: 'Your account is pending administrator approval before you can record attendance.',
      messageKh: 'គណនីរបស់អ្នកកំពុងរង់ចាំការអនុម័តពីរដ្ឋបាល មុនពេលអាចកត់ត្រាវត្តមានបាន។',
    });
    return;
  }

  if (req.user.status === 'SUSPENDED') {
    res.status(403).json({
      success: false,
      code: 'ACCOUNT_SUSPENDED',
      message: 'Your account has been suspended by administration.',
      messageKh: 'គណនីរបស់អ្នកត្រូវបានផ្អាកដំណើរការដោយរដ្ឋបាល។',
    });
    return;
  }

  next();
}

/**
 * Ensures user has one of the required roles (e.g. ['ADMIN', 'SUPER_ADMIN']).
 */
export function requireRoles(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Authentication required.',
        messageKh: 'ត្រូវការការផ្ទៀងផ្ទាត់។',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        code: 'FORBIDDEN',
        message: 'Access denied. You do not have permission to perform this administrative operation.',
        messageKh: 'ការចូលប្រើប្រាស់ត្រូវបានបដិសេធ។ អ្នកមិនមានសិទ្ធិអនុវត្តប្រតិបត្តិការនេះទេ។',
      });
      return;
    }

    next();
  };
}
