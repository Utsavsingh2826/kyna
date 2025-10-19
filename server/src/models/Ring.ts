import mongoose, { Document, Schema } from 'mongoose';

/**
 * Ring Status Enum
 */
export enum RingStatus {
  UPLOADED = 'uploaded',
  CUSTOMIZED = 'customized',
  PAYMENT_PENDING = 'payment_pending',
  COMPLETED = 'completed'
}

/**
 * Image Interface
 */
export interface IImage {
  url: string;
  publicId: string;
  userId: string;
  uploadedAt: Date;
}

/**
 * Customization Interface
 */
export interface ICustomization {
  metal?: string;
  metalColor?: string;
  goldKarat?: string;
  diamondShape?: string;
  diamondSize?: string;
  diamondColor?: string;
  diamondClarity?: string;
  ringSize?: string;
  engraving?: string;
  modificationRequest?: string;
  description?: string;
}

/**
 * Ring Interface
 */
export interface IRing extends Document {
  userId: string;
  images: IImage[];
  sameAsImage: boolean;
  customization?: ICustomization;
  status: RingStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Ring Schema
 */
const imageSchema = new Schema<IImage>({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  userId: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
}, { _id: false });

const customizationSchema = new Schema<ICustomization>({
  metal: {
    type: String,
    enum: ['Gold', 'Silver', 'Platinum', 'Rose Gold', 'White Gold']
  },
  metalColor: {
    type: String,
    default: 'Same as Image'
  },
  goldKarat: {
    type: String,
    enum: ['10KT', '14KT', '18KT', '22KT']
  },
  diamondShape: {
    type: String,
    enum: ['Round', 'Oval', 'Cushion', 'Pear', 'Princess', 'Emerald', 'Radiant', 'Heart', 'Marquise']
  },
  diamondSize: {
    type: String,
    default: 'Center Stone'
  },
  diamondColor: {
    type: String,
    default: 'Center Stone'
  },
  diamondClarity: {
    type: String,
    default: 'Center Stone'
  },
  ringSize: {
    type: String
  },
  engraving: {
    type: String,
    maxlength: 15
  },
  modificationRequest: {
    type: String,
    minlength: 15
  },
  description: {
    type: String,
    maxlength: 500
  }
}, { _id: false });

const ringSchema = new Schema<IRing>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  images: [imageSchema],
  sameAsImage: {
    type: Boolean,
    default: false
  },
  customization: customizationSchema,
  status: {
    type: String,
    enum: Object.values(RingStatus),
    default: RingStatus.UPLOADED,
    index: true
  }
}, {
  timestamps: true,
  collection: 'rings'
});

// Indexes for better query performance
ringSchema.index({ userId: 1, createdAt: -1 });
ringSchema.index({ status: 1 });

const Ring = mongoose.model<IRing>('Ring', ringSchema);

export default Ring;
