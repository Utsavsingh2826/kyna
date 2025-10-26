import mongoose, { Schema, Document } from 'mongoose';

// Metal Option Interface
interface IMetalOption {
  name: 'Gold' | 'Silver' | 'Platinum';
  karat?: string;
  gallery?: string[];
  availableColors?: string[];
}

// Engraving Interface
interface IEngraving {
  maxCharacters?: number;
  note?: string;
  userId?: string;
  uploadedAt?: Date;
}

// Shipping Interface
interface IShipping {
  freeShipping: boolean;
  freeReturns: boolean;
}

// Purchase Option Interface
interface IPurchaseOption {
  type?: string;
  action?: string;
}

// Rating Interface
interface IRating {
  score?: number;
  reviews?: number;
}

// Image Interface
interface IProductImages {
  main: string;   // URL for GP view image
  sub: string[];  // Array of other 7 image URLs
}

// Main Product Interface
export interface IProduct extends Document {
  // Identifiers
  sku: string;                    // "GR1-RD-70-2T-BR-RG"
  parentSku?: string;
  variant: string;                // "GR1"

  // Basic Info
  title: string;
  description?: string;
  rating?: IRating;

  // Categorization
  category: string;               // "Gents Ring", "Solitaire", "Engagement Ring"
  subCategory: 'Ring' | 'Bracelet' | 'Pendant' | 'Earring';

  // Pricing
  price: number;                  // Dynamic price (calculated, not stored as fixed)
  priceNote?: string;
  sellingPriceWithGST?: number;
  gstPercent?: number;

  // Diamond Details
  diamondOrigin?: Array<'Natural Diamond' | 'Lab Grown Diamond'>;
  diamondShape?: string;          // "RD" (Round), "PR" (Princess), etc.
  diamondSize?: number;           // Numeric value for carats
  diamondColor?: string;          // Diamond color grade
  diamondTotalWeight?: number;
  diamondTotalValue?: number;

  // Metal Details
  tone?: string;                  // "2T" for two-tone
  finish?: string;                // "BR" for black rhodium
  metal?: string;                 // "RG", "YG", "WG", "PT"
  karat?: number;                 // 14, 18, 22

  // Images
  images?: IProductImages;        // Main and sub images

  // Gemstone Details
  gemstoneTotalWeight?: number;
  gemstoneTotalValue?: number;

  // Physical Specs
  netWeightGrams?: number;
  chainLengthInches?: number;

  // Options
  karatOptions?: string[];
  metalOptions?: IMetalOption[];

  // Customization
  engraving?: IEngraving;

  // Logistics
  estimatedShipDate?: string;
  shipping?: IShipping;
  purchaseOptions?: IPurchaseOption[];

  // Manufacturing Costs
  makingChargesPerGram?: number;
  makingChargesTotalValue?: number;

  // Gifting
  isGiftingAvailable?: boolean;

  // Engraving
  isEngraving?: boolean;
  engravingImage?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// --- Metal Option Sub-schema
const metalOptionSchema = new Schema<IMetalOption>({
  name: {
    type: String,
    required: true,
    trim: true,
    enum: ['Gold', 'Silver', 'Platinum'] // Can expand
  },
  karat: { 
    type: String, 
    trim: true,
    match: /^[0-9]{2}kt$|^925$/ // Matches 18kt, 14kt, 925
  },
  gallery: [{
    type: String,
    trim: true
  }],
  availableColors: [{
    type: String,
    trim: true
  }]
}, { _id: false });

// --- Engraving Sub-schema
const engravingSchema = new Schema<IEngraving>({
  maxCharacters: { type: Number, min: 1 },
  note: { type: String, trim: true },
  userId: { type: String, trim: true, index: true },
  uploadedAt: { type: Date, default: Date.now }
}, { _id: false });

// --- Shipping Sub-schema
const shippingSchema = new Schema<IShipping>({
  freeShipping: { type: Boolean, default: true },
  freeReturns: { type: Boolean, default: true }
}, { _id: false });

// --- Purchase Option Sub-schema
const purchaseOptionSchema = new Schema<IPurchaseOption>({
  type: { type: String, trim: true },
  action: { type: String, trim: true }
}, { _id: false });

// --- Rating Sub-schema
const ratingSchema = new Schema<IRating>({
  score: { type: Number, min: 0, max: 5 },
  reviews: { type: Number, min: 0 }
}, { _id: false });

// --- Image Sub-schema
const productImagesSchema = new Schema<IProductImages>({
  main: { type: String, trim: true },
  sub: [{ type: String, trim: true }]
}, { _id: false });

// --- Main Product Schema
const productSchema = new Schema<IProduct>({
  // Identifiers
  sku: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true,
    index: true // Fast lookups
  },
  parentSku: { type: String, trim: true, index: true },
  variant: { type: String, required: true, trim: true, index: true },

  // Basic Info
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  rating: ratingSchema,

  // Categorization
  category: { type: String, required: true, trim: true, index: true },
  subCategory: { 
    type: String, 
    enum: ['Ring', 'Bracelet', 'Pendant', 'Earring'],
    required: true,
    index: true
  },

  // Pricing
  price: { type: Number, required: true, min: 0, index: true },
  priceNote: { type: String, trim: true },
  sellingPriceWithGST: { type: Number, min: 0 },
  gstPercent: { type: Number, min: 0, max: 100 },

  // Diamond Details
  diamondOrigin: [{ type: String, enum: ['Natural Diamond', 'Lab Grown Diamond'] }],
  diamondShape: { type: String, trim: true, index: true },
  diamondSize: { type: Number, min: 0, index: true },
  diamondColor: { type: String, trim: true, index: true },
  diamondTotalWeight: { type: Number, min: 0 },
  diamondTotalValue: { type: Number, min: 0 },

  // Metal Details
  tone: { type: String, trim: true, index: true },
  finish: { type: String, trim: true, index: true },
  metal: { type: String, trim: true, index: true },
  karat: { type: Number, min: 0, index: true },

  // Images
  images: productImagesSchema,

  // Gemstone Details
  gemstoneTotalWeight: { type: Number, min: 0 },
  gemstoneTotalValue: { type: Number, min: 0 },

  // Physical Specs
  netWeightGrams: { type: Number, min: 0 },
  chainLengthInches: { type: Number, min: 0 },

  // Options
  karatOptions: [{ type: String, trim: true }],
  metalOptions: [metalOptionSchema],

  // Customization
  engraving: engravingSchema,

  // Logistics
  estimatedShipDate: { type: String, trim: true },
  shipping: shippingSchema,
  purchaseOptions: [purchaseOptionSchema],

  // Manufacturing Costs
  makingChargesPerGram: { type: Number, min: 0 },
  makingChargesTotalValue: { type: Number, min: 0 },

  // Gifting
  isGiftingAvailable: { type: Boolean, default: false, index: true },

  // Engraving
  isEngraving: { type: Boolean, default: false, index: true },
  engravingImage: { type: String, trim: true }

}, { 
  timestamps: true
});

// Compound Index for filtering products quickly
productSchema.index({ subCategory: 1, price: 1 });
productSchema.index({ subCategory: 1, diamondOrigin: 1 });
productSchema.index({ isGiftingAvailable: 1, price: 1 });
productSchema.index({ isEngraving: 1, price: 1 });
productSchema.index({ category: 1, diamondShape: 1, metal: 1 });
productSchema.index({ diamondShape: 1, metal: 1, karat: 1 });
productSchema.index({ variant: 1, diamondSize: 1, diamondColor: 1 });

export default mongoose.model<IProduct>('Product', productSchema);
