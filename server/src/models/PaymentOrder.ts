import mongoose, { Document, Schema } from 'mongoose';

/**
 * Order Status Enum
 */
export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

/**
 * Payment Response Interface
 */
export interface IPaymentResponse {
  orderId?: string;
  trackingId?: string;
  bankRefNo?: string;
  orderStatus?: string;
  failureMessage?: string;
  paymentMode?: string;
  cardName?: string;
  statusCode?: string;
  statusMessage?: string;
  currency?: string;
  amount?: string;
  billingName?: string;
  billingAddress?: string;
  billingCity?: string;
  billingState?: string;
  billingZip?: string;
  billingCountry?: string;
  billingTel?: string;
  billingEmail?: string;
  deliveryName?: string;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryState?: string;
  deliveryZip?: string;
  deliveryCountry?: string;
  deliveryTel?: string;
  merchantParam1?: string;
  merchantParam2?: string;
  merchantParam3?: string;
  merchantParam4?: string;
  merchantParam5?: string;
  vault?: string;
  offerType?: string;
  offerCode?: string;
  discountValue?: string;
  merAmount?: string;
  eciValue?: string;
  retry?: string;
  responseCode?: string;
  transDate?: string;
}

/**
 * Order Interface
 */
export interface IOrder extends Document {
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  status: OrderStatus;
  paymentResponse?: IPaymentResponse;
  billingInfo: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone: string;
    email: string;
  };
  redirectUrl: string;
  cancelUrl: string;
  createdAt: Date;
  updatedAt: Date;
  updateStatus(newStatus: OrderStatus, paymentResponse?: IPaymentResponse): Promise<IOrder>;
  isSuccessful(): boolean;
  isFailed(): boolean;
}

/**
 * Order Model Interface
 */
export interface IOrderModel extends mongoose.Model<IOrder> {
  findByOrderId(orderId: string): Promise<IOrder | null>;
  findByUserId(userId: string, limit?: number): Promise<IOrder[]>;
  findByStatus(status: OrderStatus, limit?: number): Promise<IOrder[]>;
}

/**
 * Billing Info Schema
 */
const billingInfoSchema = new Schema({
  name: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  zip: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true }
}, { _id: false });

/**
 * Payment Response Schema
 */
const paymentResponseSchema = new Schema({
  orderId: { type: String },
  trackingId: { type: String },
  bankRefNo: { type: String },
  orderStatus: { type: String },
  failureMessage: { type: String },
  paymentMode: { type: String },
  cardName: { type: String },
  statusCode: { type: String },
  statusMessage: { type: String },
  currency: { type: String },
  amount: { type: String },
  billingName: { type: String },
  billingAddress: { type: String },
  billingCity: { type: String },
  billingState: { type: String },
  billingZip: { type: String },
  billingCountry: { type: String },
  billingTel: { type: String },
  billingEmail: { type: String },
  deliveryName: { type: String },
  deliveryAddress: { type: String },
  deliveryCity: { type: String },
  deliveryState: { type: String },
  deliveryZip: { type: String },
  deliveryCountry: { type: String },
  deliveryTel: { type: String },
  merchantParam1: { type: String },
  merchantParam2: { type: String },
  merchantParam3: { type: String },
  merchantParam4: { type: String },
  merchantParam5: { type: String },
  vault: { type: String },
  offerType: { type: String },
  offerCode: { type: String },
  discountValue: { type: String },
  merAmount: { type: String },
  eciValue: { type: String },
  retry: { type: String },
  responseCode: { type: String },
  transDate: { type: String }
}, { _id: false });

/**
 * Order Schema
 */
const orderSchema = new Schema<IOrder>({
  orderId: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true,
    index: true
  },
  userId: { 
    type: String, 
    required: true, 
    trim: true,
    index: true
  },
  amount: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  currency: { 
    type: String, 
    required: true, 
    default: 'INR',
    uppercase: true
  },
  status: { 
    type: String, 
    enum: Object.values(OrderStatus), 
    default: OrderStatus.PENDING,
    index: true
  },
  paymentResponse: { 
    type: paymentResponseSchema, 
    default: null 
  },
  billingInfo: { 
    type: billingInfoSchema, 
    required: true 
  },
  redirectUrl: { 
    type: String, 
    required: true, 
    trim: true 
  },
  cancelUrl: { 
    type: String, 
    required: true, 
    trim: true 
  }
}, {
  timestamps: true,
  collection: 'orders'
});

// Indexes for better query performance
orderSchema.index({ orderId: 1, userId: 1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'billingInfo.email': 1 });

// Pre-save middleware to generate orderId if not provided
orderSchema.pre('save', function(next) {
  if (!this.orderId) {
    this.orderId = `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

// Instance methods
orderSchema.methods.updateStatus = function(newStatus: OrderStatus, paymentResponse?: IPaymentResponse) {
  this.status = newStatus;
  if (paymentResponse) {
    this.paymentResponse = paymentResponse;
  }
  return this.save();
};

orderSchema.methods.isSuccessful = function(): boolean {
  return this.status === OrderStatus.SUCCESS;
};

orderSchema.methods.isFailed = function(): boolean {
  return this.status === OrderStatus.FAILED;
};

// Static methods
orderSchema.statics.findByOrderId = function(orderId: string) {
  return this.findOne({ orderId });
};

orderSchema.statics.findByUserId = function(userId: string, limit: number = 10) {
  return this.find({ userId }).sort({ createdAt: -1 }).limit(limit);
};

orderSchema.statics.findByStatus = function(status: OrderStatus, limit: number = 10) {
  return this.find({ status }).sort({ createdAt: -1 }).limit(limit);
};

const PaymentOrder = mongoose.model<IOrder, IOrderModel>('PaymentOrder', orderSchema);

export default PaymentOrder;
