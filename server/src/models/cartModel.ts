import mongoose, { Schema } from "mongoose";
import { ICart } from "../types";

const cartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One cart per user
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        variantSku: {
          type: String,
          required: true, // Specific variant SKU
        },
        variantConfig: {
          metalColor: { type: String }, // e.g., 'WG', 'YG', 'RG'
          metalType: { type: String }, // e.g., 'GOLD', 'PLATINUM'
          goldKarat: { type: String }, // e.g., '18kt', '14kt'
          diamondShape: { type: String }, // e.g., 'ROUND', 'CUSHION'
          diamondSize: { type: String }, // e.g., '1.0', '0.5'
          diamondOrigin: { type: String }, // e.g., 'NATURAL', 'LAB'
          diamondColor: { type: String },
          diamondClarity: { type: String },
          ringSize: { type: String },
          centerStoneShape: { type: String },
          centerStoneSize: { type: String },
          variantImages: [{ type: String }], // Array of variant image URLs
          sellingPrice: { type: Number }, // Variant-specific selling price
          priceBreakdown: {
            // Variant price breakdown
            metalCost: { type: Number },
            diamondCost: { type: Number },
            labourCost: { type: Number },
            expense: { type: Number },
            gstPercent: { type: Number },
            gstAmount: { type: Number },
            totalBeforeGst: { type: Number },
            totalWithGst: { type: Number },
          },
          // Engraving support
          hasEngraving: { type: Boolean },
          engravingText: { type: String },
          engravingMotifPath: { type: String },
          engravingImageUrl: { type: String },
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total amount before saving
cartSchema.pre("save", function (next) {
  this.totalAmount = this.items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
  next();
});

// Index for faster user lookup
cartSchema.index({ user: 1 });

export default mongoose.model<ICart>("Cart", cartSchema);
