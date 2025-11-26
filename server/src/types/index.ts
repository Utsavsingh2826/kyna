import { Request } from "express";
import { Document } from "mongoose";

// User interface - extends Document for Mongoose methods
export interface ReferralEarningHistoryEntry {
  type: "credit" | "debit";
  amount: number;
  orderId?: string;
  note?: string;
  createdAt: Date;
  status?: "pending" | "available" | "redeemed";
  redeemableAt?: Date;
  releasedAt?: Date;
  redeemedAt?: Date;
  redeemedAmount?: number;
}

export interface IUser extends Document {
  firstName: string;
  lastName?: string;
  displayName?: string;
  email: string;
  secondaryEmail?: string;
  phone?: string;
  phoneNumber?: string;
  country?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  profileImage?: string;
  password: string; // Contains hashed password for security
  name: string; // For compatibility with new auth system
  isVerified: boolean;
  role: "customer" | "admin";
  lastLogin?: Date;
  verificationToken?: string;
  verificationTokenExpiresAt?: Date;
  // Address information
  address: {
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
  };
  orders: string[] | IOrder[];
  wishlist: string[] | IProduct[];
  gifts: string[] | IGiftCard[];
  isActive: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  resetPasswordExpiresAt?: Date; // For compatibility with new auth system
  otp?: string;
  otpExpires?: Date;
  availableOffers: number;
  referralCode?: string;
  referredBy?: string | null; // public referral code of the referrer stored at signup
  refDiscount?: number; // percentage discount available to user (e.g., 5 for 5%)
  referralCount: number;
  totalReferralEarnings: number;
  referralPendingBalance: number;
  referralAvailableBalance: number;
  referralRewardIssued?: boolean;
  referralEarningsHistory?: ReferralEarningHistoryEntry[];
  usedPromoCodes: Array<{
    code: string;
    orderId?: string;
    discountValue?: number;
    appliedAt?: Date;
  }>;
  usedReferralCodes: string[];
  comparePassword(candidatePassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

// Order interface
export interface IOrder extends Document {
  user: string | IUser;
  orderNumber: string;
  items: {
    product: string | IProduct;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
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
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: string;
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
  trackingNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Product interface
export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Pendant interface
export interface IPendant extends Document {
  // Add pendant specific fields here
}

// Earing interface
export interface IEaring extends Document {
  // Add earing specific fields here
}

// Cart interface
export interface ICart extends Document {
  user: string | IUser;
  items: {
    product: string | IProduct;
    variantSku: string; // Specific variant SKU (e.g., ENG1-CUS-30-18-LGEFVVS)
    variantConfig: {
      metalColor?: string; // e.g., 'WG' (White Gold)
      metalType?: string; // e.g., 'GOLD', 'PLATINUM'
      goldKarat?: string; // e.g., '18kt', '14kt'
      diamondShape?: string; // e.g., 'ROUND', 'CUSHION'
      diamondSize?: string; // e.g., '1.0', '0.5'
      diamondOrigin?: string; // e.g., 'NATURAL', 'LAB'
      diamondColor?: string;
      diamondClarity?: string;
      ringSize?: string;
      centerStoneShape?: string;
      centerStoneSize?: string;
      variantImages?: string[]; // Array of variant image URLs
      sellingPrice?: number; // Variant-specific selling price
      priceBreakdown?: {
        // Variant price breakdown
        metalCost?: number;
        diamondCost?: number;
        labourCost?: number;
        expense?: number;
        gstPercent?: number;
        gstAmount?: number;
        totalBeforeGst?: number;
        totalWithGst?: number;
      };
    };
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Extend Express Request to include user
export interface AuthRequest extends Request {
  user?: IUser;
  userId?: string;
}

// Gift Card interface
export interface IGiftCard extends Document {
  from: string;
  to: string;
  amount: number;
}

// Referral interface
export interface IReferral extends Document {
  referFrdId: string;
  fromUserId: string | IUser;
  toEmails: string[];
  note?: string;
  sendReminder: boolean;
  status: "pending" | "accepted" | "expired";
  redeemedBy?: string | IUser;
  redeemedAt?: Date;
  expiresAt: Date;
  reminderSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Settings interface for dynamic configuration
export interface ISettings extends Document {
  referralRewardFriend: number;
  referralRewardReferrer: number;
  promoExpiryDays: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Environment variables
export interface EnvVariables {
  PORT: string | number;
  MONGO_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_COOKIE_SECURE: string;
  EMAIL_HOST?: string;
  EMAIL_PORT?: string;
  EMAIL_USER?: string;
  EMAIL_PASS?: string;
  EMAIL_FROM?: string;
  OTP_EXPIRY_MINUTES?: string;
  RESET_TOKEN_EXPIRY_HOURS?: string;
  BCRYPT_SALT_ROUNDS?: string;
}
