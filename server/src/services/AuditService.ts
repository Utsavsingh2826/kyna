import { AuditLog, IAuditLog } from '../models/AuditLog';
import { logInfo, logError } from '../utils/tracking';

export interface AuditContext {
  userId?: string;
  userEmail?: string;
  userRole?: string;
  ipAddress?: string;
  userAgent?: string;
  reason?: string;
}

export class AuditService {
  /**
   * Log order status change
   */
  async logOrderStatusChange(
    orderId: string,
    orderNumber: string,
    previousStatus: string,
    newStatus: string,
    context: AuditContext
  ): Promise<void> {
    try {
      const auditLog = new AuditLog({
        entityType: 'order',
        entityId: orderId,
        action: 'status_change',
        changes: [{
          field: 'orderStatus',
          oldValue: previousStatus,
          newValue: newStatus
        }],
        performedBy: {
          userId: context.userId,
          userEmail: context.userEmail,
          userRole: context.userRole,
          system: !context.userId
        },
        reason: context.reason,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        metadata: {
          orderNumber,
          orderStatus: newStatus
        }
      });

      await auditLog.save();
      logInfo(`Audit log created for order ${orderNumber} status change: ${previousStatus} → ${newStatus}`, 'AuditService');

    } catch (error) {
      logError(error as Error, 'logOrderStatusChange');
    }
  }

  /**
   * Log tracking status change
   */
  async logTrackingStatusChange(
    trackingId: string,
    orderNumber: string,
    docketNumber: string,
    previousStatus: string,
    newStatus: string,
    context: AuditContext
  ): Promise<void> {
    try {
      const auditLog = new AuditLog({
        entityType: 'tracking',
        entityId: trackingId,
        action: 'status_change',
        changes: [{
          field: 'status',
          oldValue: previousStatus,
          newValue: newStatus
        }],
        performedBy: {
          userId: context.userId,
          userEmail: context.userEmail,
          userRole: context.userRole,
          system: !context.userId
        },
        reason: context.reason,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        metadata: {
          orderNumber,
          docketNumber,
          trackingStatus: newStatus
        }
      });

      await auditLog.save();
      logInfo(`Audit log created for tracking ${docketNumber} status change: ${previousStatus} → ${newStatus}`, 'AuditService');

    } catch (error) {
      logError(error as Error, 'logTrackingStatusChange');
    }
  }

  /**
   * Log order shipped
   */
  async logOrderShipped(
    orderId: string,
    orderNumber: string,
    docketNumber: string,
    context: AuditContext
  ): Promise<void> {
    try {
      const auditLog = new AuditLog({
        entityType: 'order',
        entityId: orderId,
        action: 'ship',
        changes: [{
          field: 'orderStatus',
          oldValue: 'processing',
          newValue: 'shipped'
        }, {
          field: 'trackingNumber',
          oldValue: null,
          newValue: docketNumber
        }],
        performedBy: {
          userId: context.userId,
          userEmail: context.userEmail,
          userRole: context.userRole,
          system: !context.userId
        },
        reason: context.reason,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        metadata: {
          orderNumber,
          docketNumber,
          orderStatus: 'shipped'
        }
      });

      await auditLog.save();
      logInfo(`Audit log created for order ${orderNumber} shipped with docket ${docketNumber}`, 'AuditService');

    } catch (error) {
      logError(error as Error, 'logOrderShipped');
    }
  }

  /**
   * Log order delivered
   */
  async logOrderDelivered(
    orderId: string,
    orderNumber: string,
    docketNumber: string,
    context: AuditContext
  ): Promise<void> {
    try {
      const auditLog = new AuditLog({
        entityType: 'order',
        entityId: orderId,
        action: 'deliver',
        changes: [{
          field: 'orderStatus',
          oldValue: 'shipped',
          newValue: 'delivered'
        }],
        performedBy: {
          userId: context.userId,
          userEmail: context.userEmail,
          userRole: context.userRole,
          system: !context.userId
        },
        reason: context.reason,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        metadata: {
          orderNumber,
          docketNumber,
          orderStatus: 'delivered'
        }
      });

      await auditLog.save();
      logInfo(`Audit log created for order ${orderNumber} delivered`, 'AuditService');

    } catch (error) {
      logError(error as Error, 'logOrderDelivered');
    }
  }

  /**
   * Log order cancelled
   */
  async logOrderCancelled(
    orderId: string,
    orderNumber: string,
    reason: string,
    context: AuditContext
  ): Promise<void> {
    try {
      const auditLog = new AuditLog({
        entityType: 'order',
        entityId: orderId,
        action: 'cancel',
        changes: [{
          field: 'orderStatus',
          oldValue: 'pending',
          newValue: 'cancelled'
        }],
        performedBy: {
          userId: context.userId,
          userEmail: context.userEmail,
          userRole: context.userRole,
          system: !context.userId
        },
        reason: reason,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        metadata: {
          orderNumber,
          orderStatus: 'cancelled'
        }
      });

      await auditLog.save();
      logInfo(`Audit log created for order ${orderNumber} cancelled`, 'AuditService');

    } catch (error) {
      logError(error as Error, 'logOrderCancelled');
    }
  }

  /**
   * Log bulk operation
   */
  async logBulkOperation(
    action: string,
    entityType: 'order' | 'tracking',
    entityIds: string[],
    results: any[],
    context: AuditContext
  ): Promise<void> {
    try {
      const successCount = results.filter(r => r.success).length;
      const errorCount = results.filter(r => !r.success).length;

      const auditLog = new AuditLog({
        entityType,
        entityId: 'bulk_operation',
        action: action as any,
        changes: [{
          field: 'bulk_operation',
          oldValue: null,
          newValue: {
            totalItems: entityIds.length,
            successCount,
            errorCount,
            entityIds
          }
        }],
        performedBy: {
          userId: context.userId,
          userEmail: context.userEmail,
          userRole: context.userRole,
          system: !context.userId
        },
        reason: context.reason,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        metadata: {
          bulkOperation: true,
          totalItems: entityIds.length,
          successCount,
          errorCount
        }
      });

      await auditLog.save();
      logInfo(`Audit log created for bulk ${action}: ${successCount} successful, ${errorCount} failed`, 'AuditService');

    } catch (error) {
      logError(error as Error, 'logBulkOperation');
    }
  }

  /**
   * Get audit trail for an entity
   */
  async getAuditTrail(entityType: string, entityId: string, limit: number = 50): Promise<IAuditLog[]> {
    try {
      return await AuditLog.findByEntity(entityType, entityId, limit);
    } catch (error) {
      logError(error as Error, 'getAuditTrail');
      return [];
    }
  }

  /**
   * Get audit trail for an order by order number
   */
  async getOrderAuditTrail(orderNumber: string, limit: number = 50): Promise<IAuditLog[]> {
    try {
      return await AuditLog.findByOrderNumber(orderNumber, limit);
    } catch (error) {
      logError(error as Error, 'getOrderAuditTrail');
      return [];
    }
  }

  /**
   * Get audit trail for a user
   */
  async getUserAuditTrail(userId: string, limit: number = 50): Promise<IAuditLog[]> {
    try {
      return await AuditLog.findByUser(userId, limit);
    } catch (error) {
      logError(error as Error, 'getUserAuditTrail');
      return [];
    }
  }

  /**
   * Get audit statistics
   */
  async getAuditStats(): Promise<any[]> {
    try {
      return await AuditLog.getAuditStats();
    } catch (error) {
      logError(error as Error, 'getAuditStats');
      return [];
    }
  }

  /**
   * Search audit logs
   */
  async searchAuditLogs(filters: {
    entityType?: string;
    action?: string;
    userId?: string;
    orderNumber?: string;
    docketNumber?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<IAuditLog[]> {
    try {
      const query: any = {};

      if (filters.entityType) query.entityType = filters.entityType;
      if (filters.action) query.action = filters.action;
      if (filters.userId) query['performedBy.userId'] = filters.userId;
      if (filters.orderNumber) query['metadata.orderNumber'] = filters.orderNumber;
      if (filters.docketNumber) query['metadata.docketNumber'] = filters.docketNumber;

      if (filters.startDate || filters.endDate) {
        query.timestamp = {};
        if (filters.startDate) query.timestamp.$gte = filters.startDate;
        if (filters.endDate) query.timestamp.$lte = filters.endDate;
      }

      return await AuditLog.find(query)
        .sort({ timestamp: -1 })
        .limit(filters.limit || 100);

    } catch (error) {
      logError(error as Error, 'searchAuditLogs');
      return [];
    }
  }
}

export const createAuditService = (): AuditService => {
  return new AuditService();
};
