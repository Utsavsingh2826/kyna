import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  entityType: 'order' | 'tracking' | 'user' | 'product';
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'status_change' | 'ship' | 'cancel' | 'deliver';
  previousData?: any;
  newData?: any;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  performedBy: {
    userId?: string;
    userEmail?: string;
    userRole?: string;
    system?: boolean;
  };
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  metadata?: {
    orderNumber?: string;
    docketNumber?: string;
    trackingStatus?: string;
    orderStatus?: string;
    [key: string]: any;
  };
}

export interface IAuditLogModel extends mongoose.Model<IAuditLog> {
  findByEntity(entityType: string, entityId: string, limit?: number): Promise<IAuditLog[]>;
  findByOrderNumber(orderNumber: string, limit?: number): Promise<IAuditLog[]>;
  findByUser(userId: string, limit?: number): Promise<IAuditLog[]>;
  getAuditStats(): Promise<any[]>;
}

const AuditLogSchema = new Schema<IAuditLog>({
  entityType: {
    type: String,
    required: true,
    enum: ['order', 'tracking', 'user', 'product'],
    index: true
  },
  entityId: {
    type: String,
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: ['create', 'update', 'delete', 'status_change', 'ship', 'cancel', 'deliver'],
    index: true
  },
  previousData: {
    type: Schema.Types.Mixed
  },
  newData: {
    type: Schema.Types.Mixed
  },
  changes: [{
    field: { type: String, required: true },
    oldValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed }
  }],
  performedBy: {
    userId: { type: String },
    userEmail: { type: String },
    userRole: { type: String },
    system: { type: Boolean, default: false }
  },
  reason: { type: String },
  ipAddress: { type: String },
  userAgent: { type: String },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  metadata: {
    orderNumber: { type: String, index: true },
    docketNumber: { type: String, index: true },
    trackingStatus: { type: String },
    orderStatus: { type: String }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better query performance
AuditLogSchema.index({ entityType: 1, entityId: 1, timestamp: -1 });
AuditLogSchema.index({ 'performedBy.userId': 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ 'metadata.orderNumber': 1, timestamp: -1 });
AuditLogSchema.index({ 'metadata.docketNumber': 1, timestamp: -1 });

// Static methods
AuditLogSchema.statics.findByEntity = function(entityType: string, entityId: string, limit: number = 50) {
  return this.find({ entityType, entityId })
    .sort({ timestamp: -1 })
    .limit(limit);
};

AuditLogSchema.statics.findByOrderNumber = function(orderNumber: string, limit: number = 50) {
  return this.find({ 'metadata.orderNumber': orderNumber })
    .sort({ timestamp: -1 })
    .limit(limit);
};

AuditLogSchema.statics.findByUser = function(userId: string, limit: number = 50) {
  return this.find({ 'performedBy.userId': userId })
    .sort({ timestamp: -1 })
    .limit(limit);
};

AuditLogSchema.statics.findByAction = function(action: string, limit: number = 50) {
  return this.find({ action })
    .sort({ timestamp: -1 })
    .limit(limit);
};

AuditLogSchema.statics.getAuditStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: {
          entityType: '$entityType',
          action: '$action'
        },
        count: { $sum: 1 },
        lastActivity: { $max: '$timestamp' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

export const AuditLog = mongoose.model<IAuditLog, IAuditLogModel>('AuditLog', AuditLogSchema);
