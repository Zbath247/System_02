import prisma from '../prisma';

export interface AuditLogOptions {
  action: string;
  actorId?: string | null;
  targetId?: string | null;
  targetType?: string | null;
  details?: Record<string, any> | string | null;
  ipAddress?: string | null;
}

/**
 * Logs important security and administrative operations into the database AuditLog table.
 * Fails gracefully without breaking the request workflow.
 */
export async function logAuditEvent(options: AuditLogOptions): Promise<void> {
  try {
    const detailsStr =
      typeof options.details === 'object' && options.details !== null
        ? JSON.stringify(options.details)
        : options.details || null;

    await prisma.auditLog.create({
      data: {
        action: options.action,
        actorId: options.actorId || null,
        targetId: options.targetId || null,
        targetType: options.targetType || null,
        details: detailsStr,
        ipAddress: options.ipAddress || null,
      },
    });
  } catch (error) {
    console.error('⚠️ Failed to write audit log:', error);
  }
}
