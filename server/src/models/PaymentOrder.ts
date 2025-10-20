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
 * Order Details Interface - Contains all user customization data
 */
export interface IOrderDetails {
  // Basic jewelry information
  jewelryType?: string;
  description?: string;
  
  // Images from all steps
  images?: Array<{
    url: string;
    publicId?: string;
    source?: string;
    step?: string; // Which step the image was uploaded in
    alt?: string;
    uploadedAt?: string | Date;
  }>;
  
  // Diamond selection details
  diamond?: {
    carat?: number;
    cut?: string;
    color?: string;
    clarity?: string;
    shape?: string;
    certification?: string;
    price?: number;
    imageUrls?: string[];
  };
  
  // Metal and setting details
  metal?: {
    type?: string; // gold, platinum, silver
    karat?: string; // 14k, 18k, 22k
    color?: string; // yellow, white, rose
    finish?: string; // polished, matte
  };
  
  // Ring specific details
  ringDetails?: {
    size?: string | number;
    width?: string;
    setting?: string;
    prongs?: number;
    style?: string;
  };
  
  // Customization steps data
  stepData?: {
    step1?: any; // Basic info and jewelry type
    step2?: any; // Diamond selection
    step3?: any; // Metal and setting
    step4?: any; // Final customization
    step5?: any; // Review and images
  };
  
  // Additional customization
  engraving?: {
    text?: string;
    font?: string;
    position?: string;
  };
  
  // Special requests
  specialRequests?: string;
  notes?: string;
  
  // Completion status
  customizationComplete?: boolean;
  completedSteps?: string[];
  
  // Reference IDs
  backendJewelryId?: string;
  designId?: string;
  
  // Pricing breakdown
  priceBreakdown?: {
    basePrice?: number;
    diamondPrice?: number;
    metalPrice?: number;
    customizationFee?: number;
    engraving?: number;
    gst?: number;
    total?: number;
  };
}

/**
 * Order Interface
 */
export interface IOrder extends Document {
  orderId: string;
  orderNumber: string;
  orderCategory: 'design-your-own' | 'build-your-own' | 'products';
  orderType: 'customized' | 'normal';
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
  // Order details with all customization data
  orderDetails?: IOrderDetails;
  // Razorpay fields
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paidAt?: Date;
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
 * Order Details Schema - Contains all user customization data
 */
const orderDetailsSchema = new Schema({
  // Basic jewelry information
  jewelryType: { type: String, trim: true },
  description: { type: String, trim: true },
  
  // Images from all steps
  images: [{
    url: { type: String, required: true },
    publicId: { type: String },
    source: { type: String, default: 'upload' },
    step: { type: String }, // Which step the image was uploaded in
    alt: { type: String },
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Diamond selection details
  diamond: {
    carat: { type: Number },
    cut: { type: String },
    color: { type: String },
    clarity: { type: String },
    shape: { type: String },
    certification: { type: String },
    price: { type: Number },
    imageUrls: [{ type: String }]
  },
  
  // Metal and setting details
  metal: {
    type: { type: String }, // gold, platinum, silver
    karat: { type: String }, // 14k, 18k, 22k
    color: { type: String }, // yellow, white, rose
    finish: { type: String } // polished, matte
  },
  
  // Ring specific details
  ringDetails: {
    size: { type: Schema.Types.Mixed }, // string or number
    width: { type: String },
    setting: { type: String },
    prongs: { type: Number },
    style: { type: String }
  },
  
  // Customization steps data (flexible schema)
  stepData: {
    step1: { type: Schema.Types.Mixed },
    step2: { type: Schema.Types.Mixed },
    step3: { type: Schema.Types.Mixed },
    step4: { type: Schema.Types.Mixed },
    step5: { type: Schema.Types.Mixed }
  },
  
  // Additional customization
  engraving: {
    text: { type: String },
    font: { type: String },
    position: { type: String }
  },
  
  // Special requests
  specialRequests: { type: String },
  notes: { type: String },
  
  // Completion status
  customizationComplete: { type: Boolean, default: false },
  completedSteps: [{ type: String }],
  
  // Reference IDs
  backendJewelryId: { type: String },
  designId: { type: String },
  
  // Pricing breakdown
  priceBreakdown: {
    basePrice: { type: Number },
    diamondPrice: { type: Number },
    metalPrice: { type: Number },
    customizationFee: { type: Number },
    engraving: { type: Number },
    gst: { type: Number },
    total: { type: Number }
  }
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
  orderNumber: { 
    type: String, 
    required: true, 
    trim: true,
    index: true
  },
  orderCategory: { 
    type: String, 
    enum: ['design-your-own', 'build-your-own', 'products'],
    required: true,
    index: true
  },
  orderType: { 
    type: String, 
    enum: ['customized', 'normal'],
    required: true,
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
  },
  // Razorpay fields
  razorpayOrderId: { 
    type: String, 
    trim: true,
    index: true
  },
  razorpayPaymentId: { 
    type: String, 
    trim: true 
  },
  razorpaySignature: { 
    type: String, 
    trim: true 
  },
  paidAt: { 
    type: Date 
  },
  // Order details with all customization data
  orderDetails: { 
    type: orderDetailsSchema, 
    default: null 
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
