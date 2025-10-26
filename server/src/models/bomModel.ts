import mongoose, { Schema, Document } from 'mongoose';

/**
 * BOM (Bill of Materials) Interface
 * This model stores the detailed product specifications from the Excel BOM
 */
export interface IBOM extends Document {
  // Product Identifiers
  productId: string;                    // e.g., "GR47", "ENG5", "SR1"
  uniqueVariantId: string;             // e.g., "GR47-MF-SLV-LGEFVS-7"
  
  // Category Information
  category: string;                     // e.g., "RINGS", "BRACELET", "EARRINGS"
  subCategory: string;                  // e.g., "Men's Rings", "Women's Rings"
  parentSku: string;                    // e.g., "GR47"
  
  // Physical Specifications
  bandWidth?: number;                   // Critical for gents rings - determines with/without diamond
  finish: string;                       // e.g., "MATT FINISH"
  
  // Metal Information
  metalType: string;                    // e.g., "SILVER", "GOLD"
  metalKt: string;                      // e.g., "925", "18kt", "14kt"
  netWeightGrams: number;               // Weight in grams
  perGrams?: number;                    // Price per gram
  metalValue?: number;                  // Total metal value
  
  // Diamond Information
  centerStoneSize?: number;             // Diamond size in carats
  centerStoneShape?: string;            // Diamond shape
  diamondOrigin: string;                // "LAB GROWN DIAMONDS" or "NATURAL DIAMONDS"
  diamond?: string;                     // Additional diamond specifications
  
  // Pricing
  basePrice?: number;                   // Base price for the variant
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * BOM Schema
 */
const bomSchema = new Schema<IBOM>({
  productId: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  uniqueVariantId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  subCategory: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  parentSku: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  bandWidth: {
    type: Number,
    min: 0,
    index: true
  },
  finish: {
    type: String,
    required: true,
    trim: true
  },
  metalType: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  metalKt: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  netWeightGrams: {
    type: Number,
    required: true,
    min: 0
  },
  perGrams: {
    type: Number,
    min: 0
  },
  metalValue: {
    type: Number,
    min: 0
  },
  centerStoneSize: {
    type: Number,
    min: 0
  },
  centerStoneShape: {
    type: String,
    trim: true
  },
  diamondOrigin: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  diamond: {
    type: String,
    trim: true
  },
  basePrice: {
    type: Number,
    min: 0
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
bomSchema.index({ category: 1, subCategory: 1 });
bomSchema.index({ productId: 1, bandWidth: 1 });
bomSchema.index({ metalType: 1, metalKt: 1 });
bomSchema.index({ diamondOrigin: 1, centerStoneSize: 1 });

export default mongoose.model<IBOM>('BOM', bomSchema);
