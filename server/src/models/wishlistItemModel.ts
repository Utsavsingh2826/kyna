import mongoose, { Schema, Document } from 'mongoose';

export interface IWishlistEngraving {
  text?: string;
  motif?: string;
  imageUrl?: string;
}

export interface IWishlistItem extends Document {
  user: mongoose.Types.ObjectId;
  productId: string;
  productRef?: mongoose.Types.ObjectId;
  modelSku: string;
  category: string;
  categorySlug: string;
  titleSnapshot?: string;
  priceSnapshot?: number | null;
  imageSnapshot?: string | null;
  ratingSnapshot?: {
    score?: number;
    reviews?: number;
  };
  variantSku?: string | null;
  metalColorName?: string | null;
  metalColorCode?: string | null;
  engraving?: IWishlistEngraving;
  isEngraving?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ratingSnapshotSchema = new Schema(
  {
    score: { type: Number },
    reviews: { type: Number },
  },
  { _id: false }
);

const engravingSchema = new Schema<IWishlistEngraving>(
  {
    text: { type: String, trim: true },
    motif: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
  },
  { _id: false }
);

const wishlistItemSchema = new Schema<IWishlistItem>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    productId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    productRef: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
    modelSku: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    categorySlug: {
      type: String,
      required: true,
      trim: true,
    },
    titleSnapshot: { type: String, trim: true },
    priceSnapshot: { type: Number },
    imageSnapshot: { type: String, trim: true },
    ratingSnapshot: ratingSnapshotSchema,
    variantSku: { type: String, trim: true, default: null },
    metalColorName: { type: String, trim: true, default: null },
    metalColorCode: { type: String, trim: true, default: null },
    engraving: engravingSchema,
    isEngraving: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

wishlistItemSchema.index({ user: 1, createdAt: -1 });
wishlistItemSchema.index(
  {
    user: 1,
    productId: 1,
    variantSku: 1,
    metalColorCode: 1,
  },
  {
    unique: true,
    name: 'wishlist_unique_variant_per_user',
    partialFilterExpression: {
      user: { $exists: true },
      productId: { $exists: true },
    },
  }
);

export default mongoose.model<IWishlistItem>('WishlistItem', wishlistItemSchema);

