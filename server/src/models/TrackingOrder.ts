import mongoose, { Document, Schema } from 'mongoose';
import { TrackingOrder as ITrackingOrder, OrderStatus, OrderItem, Address, TrackingEvent } from '../types/tracking';

const OrderItemSchema = new Schema<OrderItem>({
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  image: { type: String }
}, { _id: false });

const AddressSchema = new Schema<Address>({
  name: { type: String, required: true, trim: true },
  line1: { type: String, required: true, trim: true },
  line2: { type: String, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  pincode: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true }
}, { _id: false });

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
  orderNumber: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true,
    uppercase: true,
    trim: true
  },
  customerEmail: { 
    type: String, 
    required: true, 
    index: true,
    lowercase: true,
    trim: true
  },
  customerName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  totalAmount: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  status: { 
    type: String, 
    enum: Object.values(OrderStatus), 
    default: OrderStatus.ORDER_PLACED,
    index: true
  },
  items: [OrderItemSchema],
  shippingAddress: { type: AddressSchema, required: true },
  billingAddress: { type: AddressSchema, required: true },
  docketNumber: { 
    type: String, 
    sparse: true,
    index: true,
    trim: true
  },
  estimatedDelivery: { type: Date },
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
TrackingOrderSchema.index({ orderNumber: 1, customerEmail: 1 });
TrackingOrderSchema.index({ status: 1, createdAt: -1 });
TrackingOrderSchema.index({ docketNumber: 1 });
TrackingOrderSchema.index({ customerEmail: 1, createdAt: -1 });

// Virtual for progress calculation
TrackingOrderSchema.virtual('progress').get(function() {
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
  
  if (sequelData.estimated_delivery) {
    this.estimatedDelivery = new Date(sequelData.estimated_delivery);
  }
  
  // Update tracking history from Sequel data
  if (sequelData.tracking && Array.isArray(sequelData.tracking)) {
    sequelData.tracking.forEach((event: any) => {
      this.addTrackingEvent(
        this.mapSequelStatus(event.code),
        event.description,
        event.location,
        event.code
      );
    });
  }
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
TrackingOrderSchema.statics.findByOrderNumberAndEmail = function(orderNumber: string, email: string) {
  return this.findOne({ 
    orderNumber: orderNumber.toUpperCase(), 
    customerEmail: email.toLowerCase() 
  });
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
  // Ensure order number is uppercase
  if (this.isModified('orderNumber')) {
    this.orderNumber = this.orderNumber.toUpperCase();
  }
  
  // Ensure email is lowercase
  if (this.isModified('customerEmail')) {
    this.customerEmail = this.customerEmail.toLowerCase();
  }
  
  next();
});

export const TrackingOrder = mongoose.model<TrackingOrderDocument, TrackingOrderModel>('TrackingOrder', TrackingOrderSchema);
