import { prisma } from "@/lib/db";
import { logger } from "@/lib/utils/logger";

export interface AuditLogParams {
  actorId: string;
  actorRole: string;
  action: string;
  tableName: string;
  recordId: string;
  oldValues?: any;
  newValues?: any;
  reason?: string;
}

export class AuditService {
  /**
   * Records an immutable entry in the AuditLog table.
   */
  static async log(params: AuditLogParams) {
    try {
      const oldValuesJson = params.oldValues ? JSON.stringify(params.oldValues) : null;
      const newValuesJson = params.newValues
        ? JSON.stringify({
            ...params.newValues,
            ...(params.reason ? { _overrideReason: params.reason } : {}),
          })
        : null;

      const audit = await prisma.auditLog.create({
        data: {
          actorId: params.actorId,
          actorRole: params.actorRole,
          action: params.action,
          tableName: params.tableName,
          recordId: params.recordId,
          oldValuesJson,
          newValuesJson,
        },
      });

      logger.info(
        `Audit Log Recorded: [${params.action}] by ${params.actorRole} (${params.actorId}) on ${params.tableName}:${params.recordId}`
      );
      return audit;
    } catch (err) {
      logger.error("Failed to write audit log entry:", err);
      // Non-fatal logging failure fallback
    }
  }
}
