import mongoose, { Schema, Document } from 'mongoose';

export interface IEarring extends Document {
  // Product identification
  category: string;
  subCategory: string;
  parentSku: string;
  uniqueVariantId: string;

  // Metal info
  metalType: 'Gold' | 'Silver' | 'Platinum' | 'Other';
  metalKt: string;
  netWeightGrams: number;
  perGramRate?: number;

  // Center Stone / Diamond info
  centerStoneSize?: string;
  centerStoneShape?: string;
  diamondOrigin: 'Natural Diamond' | 'Lab Grown Diamond' | '';
  diamondColorClarity?: string;

  // Optional Gemstone info
  gemstoneOrigin?: string;
  gemstoneColor?: string;
  gemstoneClarity?: string;

  // Other metadata
  sequenceForPricing?: string;
  diamondOrGemstoneShapes?: string;
  certifiedOrUncertified: 'CERTIFIED' | 'UNCERTIFIED' | '';

  // Sieve / size info
  pointerRangeSieveSize?: string;
  mm?: string;
  pcs?: number;
  pts?: number;
  cts?: number;

  // Dynamic Fields (pricing & weights)
  metalValue?: number | null;
  sellingPricePerCts?: number | null;
  salesValue?: number | null;
  approxTotalDiamondValue?: number | null;
  approxTotalGemstoneValue?: number | null;
  approxTotalDiamondWeight?: number | null;
  approxTotalGemstoneWeight?: number | null;
  makingChargesPerGram?: number | null;
  makingChargesTotalValue?: number | null;
  sellingPrice?: number | null;
  gstPercent?: number | null;
  sellingPriceWithGst?: number | null;
  deliveryDays?: number | null;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const earringSchema = new Schema<IEarring>({
  // Product identification
  category: { type: String, required: true, trim: true, default: 'Jewelry' },
  subCategory: { type: String, trim: true, default: 'Earring', index: true },
  parentSku: { type: String, required: true, trim: true, index: true },
  uniqueVariantId: { type: String, required: true, unique: true, trim: true },

  // Metal info
  metalType: { 
    type: String, 
    required: true, 
    trim: true,
    enum: ['Gold', 'Silver', 'Platinum', 'Other']
  },
  metalKt: { 
    type: String, 
    required: true, 
    trim: true,
    match: /^[0-9]{2}kt$|^925$/ // Validates formats like "18kt", "14kt", "925"
  },
  netWeightGrams: { type: Number, required: true, min: 0 },
  perGramRate: { type: Number, min: 0 },

  // Center Stone / Diamond info
  centerStoneSize: { type: String, trim: true },
  centerStoneShape: { type: String, trim: true },
  diamondOrigin: { 
    type: String, 
    enum: ['Natural Diamond', 'Lab Grown Diamond', ''], 
    default: '' 
  },
  diamondColorClarity: { type: String, trim: true },

  // Optional Gemstone info
  gemstoneOrigin: { type: String, trim: true },
  gemstoneColor: { type: String, trim: true },
  gemstoneClarity: { type: String, trim: true },

  // Other metadata
  sequenceForPricing: { type: String, trim: true },
  diamondOrGemstoneShapes: { type: String, trim: true },
  certifiedOrUncertified: { 
    type: String, 
    enum: ['CERTIFIED', 'UNCERTIFIED', ''], 
    default: '' 
  },

  // Sieve / size info
  pointerRangeSieveSize: { type: String, trim: true },
  mm: { type: String, trim: true },
  pcs: { type: Number, min: 0 },
  pts: { type: Number, min: 0 },
  cts: { type: Number, min: 0 },

  // 🔄 Dynamic Fields (pricing & weights)
  metalValue: { type: Number, min: 0, default: null },
  sellingPricePerCts: { type: Number, min: 0, default: null },
  salesValue: { type: Number, min: 0, default: null },
  approxTotalDiamondValue: { type: Number, min: 0, default: null },
  approxTotalGemstoneValue: { type: Number, min: 0, default: null },
  approxTotalDiamondWeight: { type: Number, min: 0, default: null },
  approxTotalGemstoneWeight: { type: Number, min: 0, default: null },
  makingChargesPerGram: { type: Number, min: 0, default: null },
  makingChargesTotalValue: { type: Number, min: 0, default: null },
  sellingPrice: { type: Number, min: 0, default: null },
  gstPercent: { type: Number, min: 0, max: 100, default: null },
  sellingPriceWithGst: { type: Number, min: 0, default: null },
  deliveryDays: { type: Number, min: 0, default: null }

}, {
  timestamps: true
});

// Indexes for better query performance
earringSchema.index({ subCategory: 1, sellingPrice: 1 });
earringSchema.index({ diamondOrigin: 1 });
earringSchema.index({ certifiedOrUncertified: 1 });

export default mongoose.model<IEarring>('Earring', earringSchema);
