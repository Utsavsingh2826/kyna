import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPromoCode extends Document {
  code: string;
  discountPercent: number;
  isActive: boolean;
  description?: string;
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const promoCodeSchema = new Schema<IPromoCode>(
  {
    code: {
      type: String,
      required: [true, "Promo code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [3, "Promo code must be at least 3 characters"],
      maxlength: [20, "Promo code cannot exceed 20 characters"],
      match: [/^[A-Z0-9]+$/, "Promo code must contain only uppercase letters and numbers"],
      index: true,
    },
    discountPercent: {
      type: Number,
      required: [true, "Discount percent is required"],
      min: [1, "Discount percent must be at least 1"],
      max: [100, "Discount percent cannot exceed 100"],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

promoCodeSchema.index({ isActive: 1, code: 1 });

const PromoCode: Model<IPromoCode> = mongoose.model<IPromoCode, Model<IPromoCode>>(
  "PromoCode",
  promoCodeSchema
);

export default PromoCode;
