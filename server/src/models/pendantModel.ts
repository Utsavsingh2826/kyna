import mongoose, { Schema, Document } from 'mongoose';

export interface IPendant extends Document {
  // Basic product identification
  category: string;
  subCategory: string;
  parentSku: string;
  uniqueVariantId: string;

  // Chain details
  withChain: 'With Chain' | 'Without Chain';
  chainLengthInches?: number;

  // Metal details
  metalType: 'Gold' | 'Silver' | 'Platinum' | 'Other';
  metalKt: string;
  netWeightGrams: number;
  perGramRate?: number;
  metalValue?: number;

  // Center stone / Diamond
  centerStoneSize?: string;
  centerStoneShape?: string;
  diamondOrigin: 'Natural Diamond' | 'Lab Grown Diamond' | '';
  diamondColorClarity?: string;

  // Gemstone info
  gemstoneOrigin?: string;
  gemstoneColor?: string;
  gemstoneClarity?: string;

  // Additional product attributes
  priceSequence?: string;
  diamondOrGemstoneShapes?: string;
  certifiedOrUncertified: 'CERTIFIED' | 'UNCERTIFIED' | '';

  // Size, sieve info
  pointerRangeSieveSize?: string;
  mm?: string;
  pcs?: number;
  pts?: number;
  cts?: number;

  // Dynamic fields (pricing, weights, charges)
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

const pendantSchema = new Schema<IPendant>({
  // Basic product identification
  category: { type: String, required: true, trim: true, default: 'Jewelry' },
  subCategory: { type: String, trim: true, default: 'Pendant', index: true },
  parentSku: { type: String, required: true, trim: true, index: true },
  uniqueVariantId: { type: String, required: true, unique: true, trim: true },

  // Chain details
  withChain: { 
    type: String, 
    enum: ['With Chain', 'Without Chain'], 
    required: true 
  },
  chainLengthInches: { type: Number, min: 0 },

  // Metal details
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
    match: /^[0-9]{2}kt$|^925$/ // Matches 18kt, 14kt, 925 etc.
  },
  netWeightGrams: { type: Number, required: true, min: 0 },
  perGramRate: { type: Number, min: 0 },
  metalValue: { type: Number, min: 0 },

  // Center stone / Diamond
  centerStoneSize: { type: String, trim: true },
  centerStoneShape: { type: String, trim: true },
  diamondOrigin: { type: String, enum: ['Natural Diamond', 'Lab Grown Diamond', ''], default: '' },
  diamondColorClarity: { type: String, trim: true },

  // Gemstone info
  gemstoneOrigin: { type: String, trim: true },
  gemstoneColor: { type: String, trim: true },
  gemstoneClarity: { type: String, trim: true },

  // Additional product attributes
  priceSequence: { type: String, trim: true },
  diamondOrGemstoneShapes: { type: String, trim: true },
  certifiedOrUncertified: { 
    type: String, 
    enum: ['CERTIFIED', 'UNCERTIFIED', ''], 
    default: '' 
  },

  // Size, sieve info
  pointerRangeSieveSize: { type: String, trim: true },
  mm: { type: String, trim: true },
  pcs: { type: Number, min: 0 },
  pts: { type: Number, min: 0 },
  cts: { type: Number, min: 0 },

  // Dynamic fields (pricing, weights, charges)
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

// Indexes for fast queries
pendantSchema.index({ subCategory: 1, sellingPrice: 1 });
pendantSchema.index({ diamondOrigin: 1 });
pendantSchema.index({ certifiedOrUncertified: 1 });

export default mongoose.model<IPendant>('Pendant', pendantSchema);
