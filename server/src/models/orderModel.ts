import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "../types";

// Order interface
export interface IOrder extends Document {
  user: Schema.Types.ObjectId | IUser;
  orderNumber?: string; // Made optional to avoid unique constraint issues
  estimatedDeliveryDate?: Date;
  statusHistory?: {
    status: string;
    date: Date;
    note?: string;
  }[]; // ✅ Added

  items: {
    product: Schema.Types.ObjectId;
    productModel: "Pendant" | "Earring" | "Bracelet" | "Ring";
    quantity: number;
    price: number;
    total: number;
  }[];
  shippingAddress: {
    label: string;
    street: string;
    city: string;
    state: string;
    ZipCode: string;
    country: string;
  };
  paymentMethod: "Credit Card" | "Debit Card" | "Net Banking" | "UPI";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  transactionId?: string;
  // CCAvenue specific fields
  ccavenueOrderId?: string;
  paymentGatewayResponse?: {
    order_status?: string;
    tracking_id?: string;
    bank_ref_no?: string;
    failure_message?: string;
    payment_mode?: string;
    card_name?: string;
    status_code?: string;
    status_message?: string;
    currency?: string;
    amount?: string;
  };
  redirectUrls?: {
    success: string;
    failure: string;
    cancel: string;
  };
  orderStatus:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "returned";
  subtotal: number;
  gst: number;
  shippingCharge: number;
  totalAmount: number;
  trackingNumber?: string;
  courierService?: string;
  trackingInfo?: {
    docketNumber?: string;
    status?: string;
    lastUpdated?: Date;
    estimatedDelivery?: string;
    hasTracking?: boolean;
    error?: string;
    trackingHistory?: any[];
    events?: Array<{
      status: string;
      timestamp: Date;
      location?: string;
      note?: string;
    }>;
  };
  // Optional images uploaded to Cloudinary or other storage
  images?: Array<{
    url: string;
    publicId?: string;
    uploadedAt?: Date;
    source?: string; // e.g., 'cloudinary', 'local'
    alt?: string;
  }>;
  orderedAt: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  returnedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    // Link to the customer placing the order
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orderNumber: { type: String, default: function() { return this._id.toString(); } }, // Default to _id to avoid null values
    estimatedDeliveryDate: { type: Date }, // ✅ Added
    statusHistory: [
      {
        status: { type: String, required: true },
        date: { type: Date, required: true },
        note: { type: String },
      },
    ],

    // Ordered items
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          refPath: "items.productModel",
          required: true,
        },
        productModel: {
          type: String,
          required: true,
          enum: ["Pendant", "Earring", "Bracelet", "Ring"],
        },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true }, // price at purchase time
        total: { type: Number, required: true },
      },
    ],

    // Shipping details
    shippingAddress: {
      label: { type: String, default: "Home" },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },

    // Payment info
    paymentMethod: {
      type: String,
      enum: ["Credit Card", "Debit Card", "Net Banking", "UPI"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    transactionId: { type: String },

    // CCAvenue specific fields
    ccavenueOrderId: { type: String },
    paymentGatewayResponse: {
      order_status: { type: String },
      tracking_id: { type: String },
      bank_ref_no: { type: String },
      failure_message: { type: String },
      payment_mode: { type: String },
      card_name: { type: String },
      status_code: { type: String },
      status_message: { type: String },
      currency: { type: String },
      amount: { type: String },
    },
    redirectUrls: {
      success: { type: String },
      failure: { type: String },
      cancel: { type: String },
    },

    // Order status
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "pending",
    },

    // Pricing breakdown
    subtotal: { type: Number, required: true },
    gst: { type: Number, default: 0 },
    shippingCharge: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    // Tracking info
    trackingNumber: { type: String },
    courierService: { type: String },
    trackingInfo: {
      docketNumber: { type: String },
      status: { type: String },
      lastUpdated: { type: Date },
      estimatedDelivery: { type: String },
      hasTracking: { type: Boolean },
      error: { type: String },
      trackingHistory: [{ type: Schema.Types.Mixed }],
      events: [
        {
          status: { type: String },
          timestamp: { type: Date },
          location: { type: String },
          note: { type: String },
        },
      ],
    },

    // Optional images uploaded to Cloudinary or other storage
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
        uploadedAt: { type: Date },
        source: { type: String },
        alt: { type: String },
      },
    ],

    // Important dates
    orderedAt: { type: Date, default: Date.now },
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
    returnedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries by user and order date
orderSchema.index({ user: 1, orderedAt: -1 });

// Pre-save hook to ensure orderNumber is set to avoid duplicate key errors
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    this.orderNumber = this._id.toString();
  }
  next();
});

const OrderModel = mongoose.model<IOrder>("Order", orderSchema);

export { OrderModel };
export default OrderModel;
