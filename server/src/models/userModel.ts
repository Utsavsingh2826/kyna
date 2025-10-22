import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../types';

// Extend the IUser interface for internal use
interface IUserInternal extends IUser {
  _skipPasswordHashing?: boolean;
  profileImage?: string;
}

const userSchema = new Schema<IUserInternal>({
  // Basic info
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, trim: true },
  displayName: { type: String, trim: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  secondaryEmail: { 
    type: String, 
    lowercase: true, 
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  phone: { 
    type: String, 
    trim: true, 
    match: [/^[\+]?[0-9\s\-\(\)]{7,20}$/, 'Please enter a valid phone number']
  },
  phoneNumber: { 
    type: String, 
    trim: true, 
    match: [/^[\+]?[0-9\s\-\(\)]{7,20}$/, 'Please enter a valid phone number']
  },
  country: { type: String, trim: true },
  state: { type: String, trim: true },
  city: { type: String, trim: true },
  zipCode: { type: String, trim: true },
  profileImage: { type: String, trim: true },

  // Authentication
  password: { type: String, required: true }, // Contains hashed password for security
  name: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  otp: { type: String },
  otpExpires: { type: Date },
  lastLogin: { type: Date, default: Date.now },
  
  // Email verification
  verificationToken: String,
  verificationTokenExpiresAt: Date,

  // Address information
  address: {
    billingAddress: {
      companyName: { type: String, trim: true },
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true },
      zipCode: { type: String, trim: true }
    },
    shippingAddress: {
      companyName: { type: String, trim: true },
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      sameAsBilling: { type: Boolean, default: true }
    }
  },

  // Orders reference
  orders: [{ type: Schema.Types.ObjectId, ref: 'Order' }],

  // Wishlist reference
  wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],

  // Gifts reference
  gifts: [{ type: Schema.Types.ObjectId, ref: 'GiftCard' }],

  // Account status
  isActive: { type: Boolean, default: true },

  // Security
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  resetPasswordExpiresAt: Date, // For compatibility with new auth system

  // Rewards and offers
  availableOffers: { type: Number, default: 0 },
  
  // Referral system
  referralCode: { 
    type: String, 
    unique: true, 
    sparse: true,
    uppercase: true,
    trim: true
  },
  // The code of the user who referred this user (stored at signup if present in URL)
  referredBy: { type: String, trim: true, uppercase: true, default: null },
  // Simple referral discount percent reserved for this user (e.g., 5 for 5%)
  refDiscount: { type: Number, default: 0 },
  referralCount: { type: Number, default: 0 },
  totalReferralEarnings: { type: Number, default: 0 },
  
  // Promo code tracking
  usedPromoCodes: [{ type: Schema.Types.ObjectId, ref: "PromoCode" }],
  usedReferralCodes: [{ type: String }]

}, {
  timestamps: true
});

// Pre-save: hash password if modified
userSchema.pre('save', async function(this: IUserInternal, next) {
  // Skip hashing if the internal flag is set
  if (this._skipPasswordHashing) {
    delete this._skipPasswordHashing; // Remove the flag
    return next();
  }
  
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err as Error);
  }
});

// Pre-save: generate referral code for new users
userSchema.pre('save', async function(this: IUserInternal, next) {
  if (this.isNew && !this.referralCode) {
    try {
      // Generate unique referral code based on user's name and random string
      const namePart = this.firstName?.substring(0, 3).toUpperCase() || 'USR';
      const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
      let referralCode = `${namePart}${randomPart}`;
      
      // Ensure uniqueness
      let counter = 1;
      while (await mongoose.model('User').findOne({ referralCode })) {
        referralCode = `${namePart}${randomPart}${counter}`;
        counter++;
      }
      
      this.referralCode = referralCode;
    } catch (err) {
      console.error('Error generating referral code:', err);
    }
  }
  next();
});

// Pre-save: set shipping address same as billing address by default
userSchema.pre('save', function(this: IUserInternal, next) {
  // Only process if address object exists and has both billing and shipping addresses
  if (this.address && 
      this.address.billingAddress && 
      this.address.shippingAddress &&
      // Check if billing address has all required fields
      this.address.billingAddress.street &&
      this.address.billingAddress.city &&
      this.address.billingAddress.state &&
      this.address.billingAddress.country &&
      this.address.billingAddress.zipCode) {
    
    // If shipping address is set to same as billing, copy billing address to shipping
    if (this.address.shippingAddress.sameAsBilling) {
      this.address.shippingAddress = {
        ...this.address.billingAddress,
        sameAsBilling: true
      };
    }
  }
  next();
});

// Method: check password validity
userSchema.methods.comparePassword = async function(this: IUser, candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Add a static method to set password correctly
userSchema.statics.setPassword = async function(userId: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);
  return this.findByIdAndUpdate(userId, { password: hashedPassword });
};

// Index for faster email search
userSchema.index({ email: 1 });

const UserModel = mongoose.model<IUserInternal, mongoose.Model<IUserInternal> & { setPassword: (userId: string, password: string) => Promise<IUserInternal | null> }>('User', userSchema);

export { UserModel };
export default UserModel;
