import mongoose, { Document, Schema } from 'mongoose';
import { TrackingOrder as ITrackingOrder, OrderStatus, OrderItem, Address, TrackingEvent } from '../types/tracking';

const TrackingEventSchema = new Schema<TrackingEvent>({
  status: { 
    type: String, 
    enum: Object.values(OrderStatus), 
    required: true 
  },
  description: { type: String, required: true },
  location: { type: String },
  timestamp: { type: Date, required: true, default: Date.now },
  code: { type: String, required: true }
}, { _id: false });

const TrackingOrderSchema = new Schema<TrackingOrderDocument>({
  // Core References - Links to other models
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    index: true
  },
  orderModel: {
    type: String,
    enum: ['Order', 'PaymentOrder'],
    default: 'Order'
  },
  order: { 
    type: Schema.Types.ObjectId, 
    refPath: 'orderModel', // Polymorphic reference - can be Order or PaymentOrder
    required: true,
    index: true
  },
  
  // Tracking-Specific Fields ONLY
  orderNumber: {
    type: String,
    required: true,
    index: true,
    trim: true
  },
  customerEmail: {
    type: String,
    required: true,
    index: true,
    trim: true,
    lowercase: true
  },
  status: { 
    type: String, 
    enum: Object.values(OrderStatus), 
    default: OrderStatus.ORDER_PLACED,
    index: true
  },
  orderType: {
    type: String,
    enum: ['normal', 'customized'],
    default: 'normal',
    required: true
  }, // Order type for cancellation policy
  docketNumber: { 
    type: String, 
    sparse: true,
    index: true,
    trim: true
  },
  estimatedDelivery: { type: Date },
  deliveredAt: { type: Date },
  podLink: { 
    type: String,
    trim: true
  },
  returnRequest: {
    requested: { type: Boolean, default: false },
    reason: String,
    hasManufacturerFault: { type: Boolean, default: false },
    requestedAt: Date
  },
  trackingHistory: [TrackingEventSchema]
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
TrackingOrderSchema.index({ userId: 1, createdAt: -1 }); // Primary index for fetching user's orders
TrackingOrderSchema.index({ order: 1 }); // Index for querying by order reference
TrackingOrderSchema.index({ status: 1, createdAt: -1 }); // Index for filtering by status
TrackingOrderSchema.index({ docketNumber: 1 }); // Index for courier tracking queries

// Virtual for progress calculation
TrackingOrderSchema.virtual('progress').get(function(this: TrackingOrderDocument) {
  const statusProgressMap: Record<OrderStatus, number> = {
    [OrderStatus.ORDER_PLACED]: 20,
    [OrderStatus.PROCESSING]: 40,
    [OrderStatus.PACKAGING]: 60,
    [OrderStatus.IN_TRANSIT]: 70,
    [OrderStatus.ON_THE_ROAD]: 80,
    [OrderStatus.DELIVERED]: 100,
    [OrderStatus.CANCELLED]: 0
  };
  
  return statusProgressMap[this.status] || 0;
});

// Methods
TrackingOrderSchema.methods.addTrackingEvent = function(
  status: OrderStatus, 
  description: string, 
  location?: string, 
  code?: string
): void {
  this.trackingHistory.push({
    status,
    description,
    location,
    timestamp: new Date(),
    code: code || status
  });
  
  this.status = status;
  this.updatedAt = new Date();
};

TrackingOrderSchema.methods.updateFromSequelTracking = function(sequelData: any): void {
  if (sequelData.docket_no) {
    this.docketNumber = sequelData.docket_no;
  }
  
  // Parse estimated_delivery date (format: "DD-MM-YYYY HH:MM" or "DD-MM-YYYY")
  if (sequelData.estimated_delivery) {
    try {
      // Parse Sequel247 date format: "DD-MM-YYYY HH:MM" or "DD-MM-YYYY"
      const dateStr = sequelData.estimated_delivery.trim();
      const parts = dateStr.split(' ');
      const datePart = parts[0]; // "DD-MM-YYYY"
      const [day, month, year] = datePart.split('-');
      
      // Create date in ISO format: YYYY-MM-DD
      const isoDate = `${year}-${month}-${day}`;
      this.estimatedDelivery = new Date(isoDate);
    } catch (error) {
      console.warn(`Failed to parse estimated_delivery date: ${sequelData.estimated_delivery}`, error);
    }
  }
  
  // Update shipment status if provided
  if (sequelData.shipment_status) {
    const mappedStatus = this.mapSequelStatus(sequelData.shipment_status);
    if (mappedStatus) {
      this.status = mappedStatus;
    }
  }
  
  // Clear existing tracking history and rebuild from Sequel data
  // This ensures we have the latest tracking information
  if (sequelData.tracking && Array.isArray(sequelData.tracking)) {
    // Only add new events that don't already exist (based on code and timestamp)
    const existingCodes = new Set(
      this.trackingHistory.map((e: any) => `${e.code}_${e.timestamp}`)
    );
    
    sequelData.tracking.forEach((event: any) => {
      const eventKey = `${event.code}_${event.date_time}`;
      if (!existingCodes.has(eventKey)) {
        // Parse event timestamp (format: "YYYY-MM-DD HH:MM:SS")
        let eventTimestamp = new Date();
        try {
          eventTimestamp = new Date(event.date_time);
        } catch (error) {
          console.warn(`Failed to parse event timestamp: ${event.date_time}`, error);
        }
        
        this.trackingHistory.push({
          status: this.mapSequelStatus(event.code),
          description: event.description || '',
          location: event.location || undefined,
          timestamp: eventTimestamp,
          code: event.code || ''
        });
        
        // Update current status to the latest event status
        if (event.code) {
          const mappedStatus = this.mapSequelStatus(event.code);
          if (mappedStatus) {
            this.status = mappedStatus;
            
            // If order is delivered (SDELVD), set deliveredAt timestamp
            if (event.code === 'SDELVD') {
              this.deliveredAt = eventTimestamp;
            }
          }
        }
      }
    });
    
    // Sort tracking history by timestamp
    this.trackingHistory.sort((a: any, b: any) => {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
  }
  
  this.updatedAt = new Date();
};

TrackingOrderSchema.methods.mapSequelStatus = function(sequelCode: string): OrderStatus {
  const statusMap: Record<string, OrderStatus> = {
    'SCREATED': OrderStatus.ORDER_PLACED,
    'SCHECKIN': OrderStatus.PROCESSING,
    'SPU': OrderStatus.PACKAGING,
    'SLINORIN': OrderStatus.ON_THE_ROAD,
    'SLINDEST': OrderStatus.ON_THE_ROAD,
    'SDELASN': OrderStatus.ON_THE_ROAD,
    'SDELVD': OrderStatus.DELIVERED,
    'SCANCELLED': OrderStatus.CANCELLED
  };
  
  return statusMap[sequelCode] || OrderStatus.ORDER_PLACED;
};

// Static methods
TrackingOrderSchema.statics.findByOrderNumberAndEmail = async function(orderNumber: string, email: string) {
  // Since orderNumber and customerEmail are now in the Order/PaymentOrder model,
  // we need to first find the order, then find the tracking order
  const OrderModel = require('./orderModel').default;
  const PaymentOrder = require('./PaymentOrder').default;
  const UserModel = require('./userModel').default;
  
  console.log('🔍 findByOrderNumberAndEmail called:');
  console.log('   Order Number:', orderNumber);
  console.log('   Email:', email);
  
  // Find user by email
  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user) {
    console.log('   ❌ User not found');
    return null;
  }
  console.log('   ✅ User found:', user._id);
  
  // Try to find in regular orders first (case-insensitive search)
  let order = await OrderModel.findOne({ 
    orderNumber: new RegExp(`^${orderNumber}$`, 'i'),
    user: user._id
  });

  // If not found, try PaymentOrder
  if (!order) {
    order = await PaymentOrder.findOne({ 
      orderNumber: new RegExp(`^${orderNumber}$`, 'i'),
      userId: user._id.toString()
    });
  }
  
  if (!order) {
    console.log('   ❌ Order not found in either collection');
    return null;
  }
  console.log('   ✅ Order found:', order._id);
  
  // First, try to find tracking order by order reference
  let trackingOrder = await this.findOne({ order: order._id });
  
  // If not found by order reference, try to find by orderNumber and customerEmail directly
  // This handles cases where TrackingOrder exists but order reference might be different
  if (!trackingOrder) {
    console.log('   ⚠️ Tracking order not found by order reference, trying by orderNumber and email...');
    trackingOrder = await this.findOne({ 
      orderNumber: new RegExp(`^${orderNumber}$`, 'i'),
      customerEmail: email.toLowerCase()
    });
    
    if (trackingOrder) {
      console.log('   ✅ Tracking order found by orderNumber and email:', trackingOrder._id);
      // Update the order reference if it's different (fix data inconsistency)
      if (trackingOrder.order.toString() !== order._id.toString()) {
        console.log('   🔧 Fixing order reference mismatch...');
        trackingOrder.order = order._id;
        trackingOrder.orderModel = order.constructor.modelName || 'Order';
        await trackingOrder.save();
        console.log('   ✅ Order reference updated');
      }
    }
  }
  
  if (!trackingOrder) {
    console.log('   ❌ Tracking order not found for order:', order._id);
    console.log('   💡 Creating TrackingOrder automatically...');
    
    // Auto-create TrackingOrder if it doesn't exist
    // OrderStatus is already imported at the top of the file
    const orderType = order.orderType || (order.customizations ? 'customized' : 'normal');
    
    trackingOrder = new this({
      userId: user._id,
      orderModel: order.constructor.modelName || 'Order',
      order: order._id,
      orderNumber: order.orderNumber,
      customerEmail: email.toLowerCase(),
      orderType: orderType,
      status: OrderStatus.ORDER_PLACED,
      trackingHistory: [{
        status: OrderStatus.ORDER_PLACED,
        description: 'Order placed successfully',
        timestamp: new Date(),
        code: OrderStatus.ORDER_PLACED
      }]
    });
    
    await trackingOrder.save();
    console.log('   ✅ TrackingOrder auto-created:', trackingOrder._id);
  } else {
    console.log('   ✅ Tracking order found:', trackingOrder._id);
  }
  
  // Manually attach order data to avoid populate issues
  trackingOrder.order = order;
  
  return trackingOrder;
};

TrackingOrderSchema.statics.findByDocketNumber = function(docketNumber: string) {
  return this.findOne({ docketNumber });
};

TrackingOrderSchema.statics.findByCustomerEmail = function(email: string, limit: number = 10) {
  return this.find({ customerEmail: email.toLowerCase() })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Add static methods to the interface
export interface TrackingOrderModel extends mongoose.Model<TrackingOrderDocument> {
  findByOrderNumberAndEmail(orderNumber: string, email: string): Promise<TrackingOrderDocument | null>;
  findByDocketNumber(docketNumber: string): Promise<TrackingOrderDocument | null>;
  findByCustomerEmail(email: string, limit?: number): Promise<TrackingOrderDocument[]>;
}

// Add instance methods to the interface
export interface TrackingOrderDocument extends Omit<ITrackingOrder, '_id'>, Document {
  addTrackingEvent(status: OrderStatus, description: string, location?: string, code?: string): void;
  updateFromSequelTracking(sequelData: any): void;
  mapSequelStatus(sequelCode: string): OrderStatus;
}

// Pre-save middleware
TrackingOrderSchema.pre('save', function(next) {
  // No pre-save transformations needed since we removed orderNumber and customerEmail
  // These fields are now in the Order model
  next();
});

export const TrackingOrder = mongoose.model<TrackingOrderDocument, TrackingOrderModel>('TrackingOrder', TrackingOrderSchema);
