import mongoose, { Schema } from 'mongoose';
import { ISettings } from '../types';

const settingsSchema = new Schema<ISettings>({
  referralRewardFriend: { 
    type: Number, 
    required: true, 
    min: 0,
    default: 10 // Default $10 reward for friend
  },
  referralRewardReferrer: { 
    type: Number, 
    required: true, 
    min: 0,
    default: 10 // Default $10 reward for referrer
  },
  promoExpiryDays: { 
    type: Number, 
    required: true, 
    min: 1,
    max: 365,
    default: 30 // Default 30 days expiry
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true
});

// Ensure only one active settings document
settingsSchema.index({ isActive: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

export default mongoose.model<ISettings>('Settings', settingsSchema);
