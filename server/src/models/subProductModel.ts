import mongoose, { Schema, Document } from 'mongoose';

/**
 * Sub-Product Interface
 * This model stores sub-products for specific jewelry categories
 */
export interface ISubProduct extends Document {
  // Identifiers
  subProductId: string;                // e.g., "FASHION_RINGS", "GENTS_RINGS_WITH_DIAMOND"
  category: string;                    // Main category: "RINGS", "EARRINGS", "BRACELETS"
  subCategory: string;                 // Sub category: "FASHION_RINGS", "GENTS_RINGS", "ENGAGEMENT_RINGS"
  
  // Display Information
  displayName: string;                 // "Fashion Rings", "Gents Rings with Diamond"
  description: string;                 // Detailed description
  shortDescription: string;            // Short description for cards
  slug: string;                        // URL-friendly identifier
  
  // Visual
  heroImage: string;                   // Main hero image
  bannerImage?: string;                // Banner image for category page
  galleryImages: string[];             // Gallery images
  
  // Product Configuration
  productVariants: string[];           // Array of variant IDs that belong to this sub-product
  featuredVariants: string[];          // Featured variants to show first
  viewType: string;                    // "TRV", "BV", "NBV" based on category
  
  // Filtering & Search
  tags: string[];                      // Tags for filtering and search
  priceRange: {                        // Price range for this sub-product
    min: number;
    max: number;
  };
  
  // Customization Options
  availableDiamondShapes: string[];    // Available diamond shapes
  availableDiamondSizes: number[];     // Available diamond sizes
  availableMetalTypes: string[];       // Available metal types
  availableMetalColors: string[];      // Available metal colors
  
  // SEO & Marketing
  metaTitle: string;                   // SEO title
  metaDescription: string;             // SEO description
  keywords: string[];                  // SEO keywords
  
  // Status & Ordering
  isActive: boolean;                   // Whether this sub-product is available
  isFeatured: boolean;                 // Whether to show in featured section
  sortOrder: number;                   // Display order
  displayPriority: 'high' | 'medium' | 'low'; // Display priority
  
  // Statistics
  productCount: number;                // Number of products in this sub-category
  viewCount: number;                   // Number of views
  lastUpdated: Date;                   // Last time products were updated
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Sub-Product Schema
 */
const subProductSchema = new Schema<ISubProduct>({
  subProductId: {
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
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  shortDescription: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  heroImage: {
    type: String,
    required: true,
    trim: true
  },
  bannerImage: {
    type: String,
    trim: true
  },
  galleryImages: [{
    type: String,
    trim: true
  }],
  productVariants: [{
    type: String,
    trim: true,
    index: true
  }],
  featuredVariants: [{
    type: String,
    trim: true
  }],
  viewType: {
    type: String,
    required: true,
    enum: ['TRV', 'BV', 'NBV', 'AV'],
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    index: true
  }],
  priceRange: {
    min: { type: Number, required: true, min: 0 },
    max: { type: Number, required: true, min: 0 }
  },
  availableDiamondShapes: [{
    type: String,
    trim: true
  }],
  availableDiamondSizes: [{
    type: Number,
    min: 0
  }],
  availableMetalTypes: [{
    type: String,
    trim: true
  }],
  availableMetalColors: [{
    type: String,
    trim: true
  }],
  metaTitle: {
    type: String,
    required: true,
    trim: true
  },
  metaDescription: {
    type: String,
    required: true,
    trim: true
  },
  keywords: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  sortOrder: {
    type: Number,
    default: 0,
    index: true
  },
  displayPriority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium',
    index: true
  },
  productCount: {
    type: Number,
    default: 0,
    min: 0
  },
  viewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
subProductSchema.index({ category: 1, isActive: 1, sortOrder: 1 });
subProductSchema.index({ subCategory: 1, isActive: 1 });
subProductSchema.index({ isFeatured: 1, displayPriority: 1, sortOrder: 1 });
subProductSchema.index({ tags: 1, isActive: 1 });
subProductSchema.index({ priceRange: 1, isActive: 1 });

export default mongoose.model<ISubProduct>('SubProduct', subProductSchema);
