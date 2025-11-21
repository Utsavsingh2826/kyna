import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "../types";

// Order interface
export interface IOrder extends Document {
  user: Schema.Types.ObjectId | IUser;
  orderNumber?: string; // Made optional to avoid unique constraint issues
  estimatedDeliveryDate?: Date;
  orderType: "normal" | "customized"; // Order type for cancellation policy
  statusHistory?: {
    status: string;
    date: Date;
    note?: string;
  }[]; // ✅ Added

  items: {
    product: Schema.Types.ObjectId;
    productModel: "Pendant" | "Earring" | "Bracelet" | "Ring" | "Product";
    productTitle?: string;
    productSku?: string;
    variantSku?: string;
    variantConfig?: any;
    quantity: number;
    price: number;
    total: number;
    metalDetails?: {
      type?: string;
      color?: string;
      karat?: string;
    };
    diamondDetails?: {
      shape?: string;
      size?: string;
      origin?: string;
      carat?: string;
    };
    ringDetails?: {
      size?: string;
    };
    priceBreakdown?: any;
  }[];
  billingAddress: {
    companyName?: string;
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  shippingAddress: {
    companyName?: string;
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    sameAsBilling: boolean;
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
  // Product details with complete specifications
  productDetails?: {
    jewelryType?: string;
    description?: string;
    sku?: string;
    variantSku?: string;
    isDirectPurchase?: boolean;
    product?: {
      modelSku?: string;
      title?: string;
      price?: number;
      priceBreakdown?: any;
      sku?: string;
    };
    customization?: {
      metalColor?: string;
      metalType?: string;
      goldKarat?: string;
      diamondShape?: string;
      diamondSize?: string;
      diamondOrigin?: string;
      size?: string; // generic size
      ringSize?: string;
      engraving?: string;
      engravingImageUrl?: string;
      hasEngraving?: boolean;
    };
    diamondDetails?: {
      shape?: string;
      size?: string;
      origin?: string;
      carat?: string;
    };
    metalDetails?: {
      type?: string;
      color?: string;
      karat?: string;
    };
    ringDetails?: {
      size?: string;
    };
    engravingDetails?: {
      text?: string;
      imageUrl?: string;
      hasEngraving?: boolean;
    };
    priceBreakdown?: any;
    productSpecs?: {
      modelSku?: string;
      variantSku?: string;
      variant?: string;
      title?: string;
      sellingPrice?: number;
    };
    cartItems?: Array<{
      productId?: mongoose.Types.ObjectId;
      productTitle?: string;
      productSku?: string;
      variantSku?: string;
      variantConfig?: any;
      quantity?: number;
      price?: number;
      sellingPrice?: number;
      priceBreakdown?: any;
      metalDetails?: {
        type?: string;
        color?: string;
        karat?: string;
      };
      diamondDetails?: {
        shape?: string;
        size?: string;
        origin?: string;
        carat?: string;
      };
      ringDetails?: {
        size?: string;
      };
    }>;
  };
  promoSummary?: {
    code: string;
    discountPercent: number;
    discountValue: number;
    appliedOn?: string;
  };
  referralSummary?: {
    credits?: {
      referrerId?: string;
      code: string;
      amount: number;
    };
    walletRedemption?: {
      amount: number;
    };
  };
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
    orderNumber: {
      type: String,
      // Removed default function to avoid upsert issues - handle in route instead
    },
    estimatedDeliveryDate: { type: Date }, // ✅ Added
    orderType: {
      type: String,
      enum: ["normal", "customized"],
      default: "normal",
      required: true,
    }, // Order type for cancellation policy
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
          enum: ["Pendant", "Earring", "Bracelet", "Ring", "Product"],
        },
        productTitle: { type: String },
        productSku: { type: String },
        variantSku: { type: String },
        variantConfig: { type: Schema.Types.Mixed },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true }, // price at purchase time
        total: { type: Number, required: true },
        metalDetails: {
          type: { type: String },
          color: { type: String },
          karat: { type: String },
        },
        diamondDetails: {
          shape: { type: String },
          size: { type: String },
          origin: { type: String },
          carat: { type: String },
        },
        ringDetails: {
          size: { type: String },
        },
        priceBreakdown: { type: Schema.Types.Mixed },
      },
    ],

    // Billing details
    billingAddress: {
      companyName: { type: String, trim: true },
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
      zipCode: { type: String, required: true, trim: true },
    },

    // Shipping details
    shippingAddress: {
      companyName: { type: String, trim: true },
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
      zipCode: { type: String, required: true, trim: true },
      sameAsBilling: { type: Boolean, default: false },
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

    // Product details with complete specifications
    productDetails: {
      jewelryType: { type: String },
      description: { type: String },
      isDirectPurchase: { type: Boolean },
      product: {
        modelSku: { type: String },
        title: { type: String },
        price: { type: Number },
        priceBreakdown: { type: Schema.Types.Mixed },
        sku: { type: String },
      },
      customization: {
        metalColor: { type: String },
        metalType: { type: String },
        goldKarat: { type: String },
        diamondShape: { type: String },
        diamondSize: { type: String },
        diamondOrigin: { type: String },
        size: { type: String },
        ringSize: { type: String },
        engraving: { type: String },
        engravingImageUrl: { type: String },
        hasEngraving: { type: Boolean },
      },
      diamondDetails: {
        shape: { type: String },
        size: { type: String },
        origin: { type: String },
        carat: { type: String },
      },
      metalDetails: {
        type: { type: String },
        color: { type: String },
        karat: { type: String },
      },
      ringDetails: {
        size: { type: String },
      },
      engravingDetails: {
        text: { type: String },
        imageUrl: { type: String },
        hasEngraving: { type: Boolean },
      },
      priceBreakdown: { type: Schema.Types.Mixed },
      productSpecs: {
        modelSku: { type: String },
        variantSku: { type: String },
        variant: { type: String },
        title: { type: String },
        sellingPrice: { type: Number },
      },
      cartItems: [
        {
          productId: { type: Schema.Types.ObjectId, ref: "Product" },
          productTitle: { type: String },
          productSku: { type: String },
          variantSku: { type: String },
          variantConfig: { type: Schema.Types.Mixed },
          quantity: { type: Number },
          price: { type: Number },
          sellingPrice: { type: Number },
          priceBreakdown: { type: Schema.Types.Mixed },
          metalDetails: {
            type: { type: String },
            color: { type: String },
            karat: { type: String },
          },
          diamondDetails: {
            shape: { type: String },
            size: { type: String },
            origin: { type: String },
            carat: { type: String },
          },
          ringDetails: {
            size: { type: String },
          },
        },
      ],
    },
    promoSummary: {
      code: { type: String, uppercase: true, trim: true },
      discountPercent: { type: Number },
      discountValue: { type: Number },
      appliedOn: { type: String },
    },
    referralSummary: {
      credits: {
        referrerId: { type: Schema.Types.ObjectId, ref: "User" },
        code: { type: String, uppercase: true, trim: true },
        amount: { type: Number },
      },
      walletRedemption: {
        amount: { type: Number },
      },
    },

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
orderSchema.pre("save", function (next) {
  try {
    if (!this.orderNumber) {
      if (this && this._id) {
        this.orderNumber = this._id.toString();
      } else {
        this.orderNumber = new mongoose.Types.ObjectId().toString();
      }
    }
  } catch (e) {
    // Fallback: generate a fresh ObjectId string to avoid save-time crash
    if (!this.orderNumber)
      this.orderNumber = new mongoose.Types.ObjectId().toString();
  }
  next();
});

const OrderModel = mongoose.model<IOrder>("Order", orderSchema);

export { OrderModel };
export default OrderModel;
