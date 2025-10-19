import { Request } from 'express';
import { Document } from 'mongoose';

// User interface - extends Document for Mongoose methods
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
  passwordHash: string;
  password: string; // For compatibility with new auth system
  name: string; // For compatibility with new auth system
  isVerified: boolean;
  role: 'customer' | 'admin';
  lastLogin?: Date;
  verificationToken?: string;
  verificationTokenExpiresAt?: Date;
  // Addresses moved to Order model
  // addresses: {
  //   label: string;
  //   street: string;
  //   city: string;
  //   state: string;
  //   postalCode: string;
  //   country: string;
  //   isDefault: boolean;
  // }[];
  // billingAddress?: {
  //   companyName?: string;
  //   street?: string;
  //   city?: string;
  //   state?: string;
  //   country?: string;
  //   zipCode?: string;
  // };
  // shippingAddress?: {
  //   companyName?: string;
  //   street?: string;
  //   city?: string;
  //   state?: string;
  //   country?: string;
  //   zipCode?: string;
  //   sameAsBilling?: boolean;
  // };
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
  referralCount: number;
  totalReferralEarnings: number;
  usedPromoCodes: string[];
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
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
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
  status: 'pending' | 'accepted' | 'expired';
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
