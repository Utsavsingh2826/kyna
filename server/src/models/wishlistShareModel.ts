import mongoose, { Schema, Document } from 'mongoose';

export interface IWishlistShare extends Document {
  shareId: string;
  userId: mongoose.Types.ObjectId;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const wishlistShareSchema = new Schema<IWishlistShare>({
  shareId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster lookups
wishlistShareSchema.index({ shareId: 1 });
wishlistShareSchema.index({ userId: 1 });
wishlistShareSchema.index({ expiresAt: 1 });

export default mongoose.model<IWishlistShare>('WishlistShare', wishlistShareSchema);
