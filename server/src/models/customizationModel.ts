import mongoose, { Schema, Document } from 'mongoose';

/**
 * Diamond Shape Enum
 */
export enum DiamondShape {
  ROUND = 'Round',
  PRINCESS = 'Princess',
  OVAL = 'Oval',
  PEAR = 'Pear',
  EMERALD = 'Emerald',
  ASSCHER = 'Asscher',
  CUSHION = 'Cushion',
  MARQUISE = 'Marquise',
  RADIANT = 'Radiant',
  HEART = 'Heart'
}

/**
 * Metal Type Enum
 */
export enum MetalType {
  GOLD = 'Gold',
  SILVER = 'Silver',
  PLATINUM = 'Platinum',
  ROSE_GOLD = 'Rose Gold',
  WHITE_GOLD = 'White Gold'
}

/**
 * Gold Karat Enum
 */
export enum GoldKarat {
  K10 = '10KT',
  K14 = '14KT',
  K18 = '18KT',
  K22 = '22KT'
}

/**
 * Diamond Origin Enum
 */
export enum DiamondOrigin {
  NATURAL = 'Natural Diamond',
  LAB_GROWN = 'Lab Grown Diamond'
}

/**
 * Customization Options Interface
 */
export interface ICustomizationOptions extends Document {
  // Diamond Options
  diamondShapes: {
    shape: DiamondShape;
    isAvailable: boolean;
    priceMultiplier?: number;
  }[];
  
  diamondSizes: {
    size: number; // in carats
    isAvailable: boolean;
    priceMultiplier?: number;
  }[];
  
  diamondColors: {
    color: string; // e.g., "D", "E", "F", "G", "H", "I", "J"
    isAvailable: boolean;
    priceMultiplier?: number;
  }[];
  
  diamondClarities: {
    clarity: string; // e.g., "FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2"
    isAvailable: boolean;
    priceMultiplier?: number;
  }[];
  
  diamondOrigins: {
    origin: DiamondOrigin;
    isAvailable: boolean;
    priceMultiplier?: number;
  }[];
  
  // Metal Options
  metalTypes: {
    type: MetalType;
    isAvailable: boolean;
    priceMultiplier?: number;
  }[];
  
  metalKt: {
    karat: GoldKarat;
    isAvailable: boolean;
    priceMultiplier?: number;
  }[];
  
  metalColors: {
    color: string; // e.g., "Yellow Gold", "White Gold", "Rose Gold", "Platinum"
    isAvailable: boolean;
    priceMultiplier?: number;
  }[];
  
  // Ring Size Options (for rings)
  ringSizes?: {
    size: string; // e.g., "6", "6.5", "7", "7.5"
    isAvailable: boolean;
  }[];
  
  // Bracelet Size Options (for bracelets)
  braceletSizes?: {
    size: string; // e.g., "6", "6.5", "7", "7.5" (in inches)
    isAvailable: boolean;
  }[];
  
  // Necklace Length Options (for necklaces)
  necklaceLengths?: {
    length: string; // e.g., "16", "18", "20", "22" (in inches)
    isAvailable: boolean;
  }[];
  
  // Engraving Options
  engraving: {
    isAvailable: boolean;
    maxCharacters: number;
    pricePerCharacter?: number;
    note?: string;
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Customization Options Schema
 */
const diamondShapeSchema = new Schema({
  shape: {
    type: String,
    enum: Object.values(DiamondShape),
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  priceMultiplier: {
    type: Number,
    min: 0,
    default: 1
  }
}, { _id: false });

const diamondSizeSchema = new Schema({
  size: {
    type: Number,
    required: true,
    min: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  priceMultiplier: {
    type: Number,
    min: 0,
    default: 1
  }
}, { _id: false });

const diamondColorSchema = new Schema({
  color: {
    type: String,
    required: true,
    trim: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  priceMultiplier: {
    type: Number,
    min: 0,
    default: 1
  }
}, { _id: false });

const diamondClaritySchema = new Schema({
  clarity: {
    type: String,
    required: true,
    trim: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  priceMultiplier: {
    type: Number,
    min: 0,
    default: 1
  }
}, { _id: false });

const diamondOriginSchema = new Schema({
  origin: {
    type: String,
    enum: Object.values(DiamondOrigin),
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  priceMultiplier: {
    type: Number,
    min: 0,
    default: 1
  }
}, { _id: false });

const metalTypeSchema = new Schema({
  type: {
    type: String,
    enum: Object.values(MetalType),
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  priceMultiplier: {
    type: Number,
    min: 0,
    default: 1
  }
}, { _id: false });

const metalKtSchema = new Schema({
  karat: {
    type: String,
    enum: Object.values(GoldKarat),
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  priceMultiplier: {
    type: Number,
    min: 0,
    default: 1
  }
}, { _id: false });

const metalColorSchema = new Schema({
  color: {
    type: String,
    required: true,
    trim: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  priceMultiplier: {
    type: Number,
    min: 0,
    default: 1
  }
}, { _id: false });

const sizeOptionSchema = new Schema({
  size: {
    type: String,
    required: true,
    trim: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const engravingSchema = new Schema({
  isAvailable: {
    type: Boolean,
    default: false
  },
  maxCharacters: {
    type: Number,
    default: 15,
    min: 1
  },
  pricePerCharacter: {
    type: Number,
    min: 0,
    default: 0
  },
  note: {
    type: String,
    trim: true
  }
}, { _id: false });

const customizationOptionsSchema = new Schema<ICustomizationOptions>({
  diamondShapes: [diamondShapeSchema],
  diamondSizes: [diamondSizeSchema],
  diamondColors: [diamondColorSchema],
  diamondClarities: [diamondClaritySchema],
  diamondOrigins: [diamondOriginSchema],
  metalTypes: [metalTypeSchema],
  metalKt: [metalKtSchema],
  metalColors: [metalColorSchema],
  ringSizes: [sizeOptionSchema],
  braceletSizes: [sizeOptionSchema],
  necklaceLengths: [sizeOptionSchema],
  engraving: engravingSchema
}, {
  timestamps: true
});

// Indexes for efficient queries
customizationOptionsSchema.index({ createdAt: -1 });

export default mongoose.model<ICustomizationOptions>('CustomizationOptions', customizationOptionsSchema);
