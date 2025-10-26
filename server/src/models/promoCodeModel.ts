import mongoose, { Schema, Document } from 'mongoose';

export interface IPromoCode extends Document {
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number; // 20 for 20% or 100 for ₹100
  minPurchase: number;
  expiresAt?: Date;
  usageLimit: number;
  usedCount: number;
  usedBy: mongoose.Types.ObjectId[];
  isActive: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  isValid(): boolean;
  canBeUsedBy(userId: mongoose.Types.ObjectId): boolean;
  calculateDiscount(subtotal: number): number;
}

const promoCodeSchema = new Schema<IPromoCode>({
  code: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true,
    trim: true 
  },
  discountType: { 
    type: String, 
    enum: ['percentage', 'flat'], 
    default: 'flat' 
  },
  discountValue: { 
    type: Number, 
    required: true,
    min: 0
  },
  minPurchase: { 
    type: Number, 
    default: 0,
    min: 0
  },
  expiresAt: { 
    type: Date 
  },
  usageLimit: { 
    type: Number, 
    default: 1,
    min: 1
  },
  usedCount: {
    type: Number,
    default: 0,
    min: 0
  },
  usedBy: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for faster lookups
promoCodeSchema.index({ code: 1 });
promoCodeSchema.index({ isActive: 1 });
promoCodeSchema.index({ expiresAt: 1 });

// Method to check if promo code is valid
promoCodeSchema.methods.isValid = function(): boolean {
  if (!this.isActive) return false;
  if (this.expiresAt && this.expiresAt < new Date()) return false;
  if (this.usedCount >= this.usageLimit) return false;
  return true;
};

// Method to check if user can use this promo code
promoCodeSchema.methods.canBeUsedBy = function(userId: mongoose.Types.ObjectId): boolean {
  return !this.usedBy.includes(userId);
};

// Method to calculate discount amount
promoCodeSchema.methods.calculateDiscount = function(subtotal: number): number {
  if (!this.isValid()) return 0;
  if (subtotal < this.minPurchase) return 0;
  
  if (this.discountType === 'percentage') {
    return Math.min(subtotal * (this.discountValue / 100), subtotal);
  } else {
    return Math.min(this.discountValue, subtotal);
  }
};

export default mongoose.model<IPromoCode>('PromoCode', promoCodeSchema);
