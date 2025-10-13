import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuditLogParams {
  adminUserId: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  details?: object;
}

export async function logAdminActivity({
  adminUserId,
  action,
  resourceType,
  resourceId,
  details,
}: AuditLogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        adminUserId,
        action,
        resourceType,
        resourceId,
        details,
      },
    });
  } catch (error) {
    console.error('Failed to log admin activity:', error);
  }
}
