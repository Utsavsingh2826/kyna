import mongoose, { Schema } from 'mongoose';
import { ICart } from '../types';

const cartSchema = new Schema<ICart>({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true // One cart per user
  },
  items: [{
    product: { 
      type: Schema.Types.ObjectId, 
      ref: 'Product', 
      required: true 
    },
    quantity: { 
      type: Number, 
      required: true, 
      min: 1,
      default: 1
    },
    price: { 
      type: Number, 
      required: true,
      min: 0
    }
  }],
  totalAmount: { 
    type: Number, 
    required: true, 
    default: 0,
    min: 0
  },
  // Optional applied promo code stored on the cart for tracking usage during order creation
  appliedPromoCode: {
    type: String,
    trim: true,
    default: null,
  },
  // Optional applied referral code stored on the cart for tracking usage during order creation
  appliedReferralCode: {
    type: String,
    trim: true,
    default: null,
  },
  // Referral discount percentage (e.g., 5 for 5%)
  referralDiscount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Calculate total amount before saving
cartSchema.pre('save', function(next) {
  this.totalAmount = this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  next();
});

// Index for faster user lookup
cartSchema.index({ user: 1 });

export default mongoose.model<ICart>('Cart', cartSchema);