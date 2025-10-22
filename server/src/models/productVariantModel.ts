import mongoose, { Schema, Document } from 'mongoose';

/**
 * Product Variant Interface
 * This model stores the product variants for the "Build Your Jewelry" functionality
 */
export interface IProductVariant extends Document {
  // Product Identifiers
  variantId: string;                    // e.g., "ENG1", "ENG50", "GR10", "BR1"
  category: string;                     // e.g., "ENGAGEMENT RINGS", "GENTS RINGS", "BRACELET"
  subCategory: string;                  // e.g., "Men's Rings", "Women's Rings"
  
  // Product Information
  stylingName: string;                  // e.g., "CLASSIC", "NATURE INSPIRED", "TENNIS BRACELET"
  builderView: string;                  // e.g., "ENG1-RD-100-WG-NBV", "BR1-RD-025-WG-TRV"
  
  // View Configuration
  viewType: string;                     // "TRV", "BV", "NBV" based on category
  hasDiamond: boolean;                  // For gents rings - derived from band width
  
  // Images
  builderImage: string;                 // File name used to build image path e.g., "BR15-EMMQ-025-WG-TRV"
  mainImage: string;                    // Main product image URL
  thumbnailImages: string[];            // Array of thumbnail image URLs
  variantImages: string[];              // Additional variant images
  
  // Customization Options
  availableDiamondShapes: string[];     // Available diamond shapes for this variant
  availableDiamondSizes: number[];      // Available diamond sizes in carats
  availableDiamondColors: string[];     // Available diamond colors
  availableDiamondClarity: string[];    // Available diamond clarity options
  availableDiamondOrigins: string[];    // Available diamond origins (Natural/Lab Grown)
  availableMetalTypes: string[];        // Available metal types
  availableMetalKt: string[];          // Available metal karats
  availableMetalColors: string[];       // Available metal colors
  availableSizes: string[];            // Available ring/jewelry sizes
  
  // Gallery & 3D
  galleryImages: string[];             // Additional gallery images
  modelUrl?: string;                   // 3D GLB model URL
  
  // Pricing
  basePrice: number;                    // Base price for this variant
  priceRange: {                         // Price range for customization
    min: number;
    max: number;
  };
  
  // BOM Reference
  bomVariantId?: string;                // Reference to BOM entry
  
  // Status
  isActive: boolean;                    // Whether this variant is available
  isFeatured: boolean;                  // Whether to show in featured section
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Product Variant Schema
 */
const productVariantSchema = new Schema<IProductVariant>({
  variantId: {
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
  stylingName: {
    type: String,
    required: true,
    trim: true
  },
  builderView: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  viewType: {
    type: String,
    required: true,
    trim: true,
    enum: ['TRV', 'BV', 'NBV'],
    index: true
  },
  hasDiamond: {
    type: Boolean,
    default: false,
    index: true
  },
  builderImage: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  mainImage: {
    type: String,
    required: true,
    trim: true
  },
  thumbnailImages: [{
    type: String,
    trim: true
  }],
  variantImages: [{
    type: String,
    trim: true
  }],
  availableDiamondShapes: [{
    type: String,
    trim: true
  }],
  availableDiamondSizes: [{
    type: Number,
    min: 0
  }],
  availableDiamondColors: [{
    type: String,
    trim: true
  }],
  availableMetalTypes: [{
    type: String,
    trim: true
  }],
  availableMetalKt: [{
    type: String,
    trim: true
  }],
  availableMetalColors: [{
    type: String,
    trim: true
  }],
  availableDiamondClarity: [{
    type: String,
    trim: true
  }],
  availableDiamondOrigins: [{
    type: String,
    trim: true
  }],
  availableSizes: [{
    type: String,
    trim: true
  }],
  galleryImages: [{
    type: String,
    trim: true
  }],
  modelUrl: {
    type: String,
    trim: true
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  priceRange: {
    min: { type: Number, required: true, min: 0 },
    max: { type: Number, required: true, min: 0 }
  },
  bomVariantId: {
    type: String,
    trim: true,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
productVariantSchema.index({ category: 1, isActive: 1 });
productVariantSchema.index({ category: 1, hasDiamond: 1 });
productVariantSchema.index({ viewType: 1, isActive: 1 });
productVariantSchema.index({ variantId: 1, isActive: 1 });

export default mongoose.model<IProductVariant>('ProductVariant', productVariantSchema);
