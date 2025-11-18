import mongoose, { Schema, Document } from "mongoose";

/**
 * Customization Request Status Enum
 */
export enum CustomizationStatus {
  PENDING = "pending",
  IN_REVIEW = "in_review",
  APPROVED = "approved",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  REJECTED = "rejected",
  CANCELLED = "cancelled",
}

/**
 * Customization Request Interface
 * This model stores customization requests from users
 */
export interface ICustomizationRequest extends Document {
  // Request Identifiers
  requestId: string; // Unique request identifier
  userId: string; // User who made the request
  requestNumber: string; // Human-readable request number

  // Request Information
  title: string; // Request title/description
  description: string; // Detailed description
  category: string; // e.g., "RINGS", "EARRINGS", "BRACELETS"
  subCategory: string; // e.g., "Men's Rings", "Women's Rings"

  // Jewelry Specifications
  jewelryType: string; // Type of jewelry (ring, earring, etc.)
  stylingName: string; // e.g., "CLASSIC", "NATURE INSPIRED", "CUSTOM"

  // Images and References
  referenceImages: string[]; // User uploaded reference images
  inspirationImages: string[]; // Additional inspiration images
  designImages: string[]; // Generated design images

  // Diamond Specifications
  diamondShape: string; // Selected diamond shape
  diamondSize: string; // Diamond size in carats
  diamondColor: string; // Diamond color grade
  diamondClarity: string; // Diamond clarity grade
  diamondOrigin: string; // Natural or Lab Grown

  // Metal Specifications
  metalType: string; // Gold, Platinum, Silver
  metalKarat: string; // 14K, 18K, 22K
  metalColor: string; // Yellow, White, Rose Gold

  // Size and Dimensions
  ringSize?: string; // Ring size if applicable
  dimensions?: {
    // Custom dimensions
    width?: number;
    height?: number;
    depth?: number;
  };

  // Customization Details
  engraving?: {
    text: string;
    font: string;
    position: string;
  };

  // Special Requirements
  specialInstructions: string; // Any special requirements
  budgetRange?: {
    // Budget range if specified
    min: number;
    max: number;
  };

  // Contact Information
  contactInfo?: {
    // User contact details
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  // Pricing Information
  estimatedPrice?: number; // Estimated price from backend
  finalPrice?: number; // Final agreed price
  priceBreakdown?: {
    // Detailed pricing
    basePrice: number;
    diamondPrice: number;
    metalPrice: number;
    customizationFee: number;
    engravingFee: number;
    gst: number;
    total: number;
  };

  // Status and Progress
  status: CustomizationStatus; // Current status
  progress: number; // Progress percentage (0-100)

  // Communication
  messages: Array<{
    // Communication history
    sender: "user" | "admin";
    message: string;
    timestamp: Date;
    attachments?: string[];
  }>;

  // Admin Notes
  adminNotes: string; // Internal admin notes
  rejectionReason?: string; // Reason for rejection if applicable

  // Timeline
  requestedAt: Date; // When request was made
  reviewedAt?: Date; // When it was reviewed
  approvedAt?: Date; // When it was approved
  completedAt?: Date; // When it was completed

  // Delivery Information
  estimatedDelivery?: Date; // Estimated delivery date
  estimatedDeliveryDay?: string; // Estimated delivery day label
  actualDelivery?: Date; // Actual delivery date

  // Payment Information
  paymentId?: string; // Payment transaction ID
  paymentStatus?: string; // Payment status (pending/success/failed)
  paymentAmount?: number; // Payment amount

  // Additional Data
  customData?: Record<string, any>; // Additional custom data
  tags: string[]; // Tags for categorization

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  updateStatus(
    newStatus: CustomizationStatus,
    message?: string
  ): Promise<ICustomizationRequest>;
  addMessage(
    sender: "user" | "admin",
    message: string,
    attachments?: string[]
  ): Promise<ICustomizationRequest>;
}

/**
 * Customization Request Model Interface
 */
export interface ICustomizationRequestModel
  extends mongoose.Model<ICustomizationRequest> {
  findByRequestId(requestId: string): Promise<ICustomizationRequest | null>;
  findByUserId(
    userId: string,
    limit?: number
  ): Promise<ICustomizationRequest[]>;
  findByStatus(
    status: CustomizationStatus,
    limit?: number
  ): Promise<ICustomizationRequest[]>;
}

/**
 * Customization Request Schema
 */
const customizationRequestSchema = new Schema<ICustomizationRequest>(
  {
    requestId: {
      type: String,
      unique: true,
      trim: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    requestNumber: {
      type: String,
      unique: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    subCategory: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    jewelryType: {
      type: String,
      required: true,
      trim: true,
    },
    stylingName: {
      type: String,
      required: true,
      trim: true,
    },
    referenceImages: [
      {
        type: String,
        trim: true,
      },
    ],
    inspirationImages: [
      {
        type: String,
        trim: true,
      },
    ],
    designImages: [
      {
        type: String,
        trim: true,
      },
    ],
    diamondShape: {
      type: String,
      trim: true,
    },
    diamondSize: {
      type: String,
      trim: true,
    },
    diamondColor: {
      type: String,
      trim: true,
    },
    diamondClarity: {
      type: String,
      trim: true,
    },
    diamondOrigin: {
      type: String,
      trim: true,
    },
    metalType: {
      type: String,
      trim: true,
    },
    metalKarat: {
      type: String,
      trim: true,
    },
    metalColor: {
      type: String,
      trim: true,
    },
    ringSize: {
      type: String,
      trim: true,
    },
    dimensions: {
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 },
      depth: { type: Number, min: 0 },
    },
    engraving: {
      text: { type: String, trim: true },
      font: { type: String, trim: true },
      position: { type: String, trim: true },
    },
    specialInstructions: {
      type: String,
      trim: true,
    },
    budgetRange: {
      min: { type: Number, min: 0 },
      max: { type: Number, min: 0 },
    },
    contactInfo: {
      firstName: { type: String, trim: true },
      lastName: { type: String, trim: true },
      email: { type: String, trim: true },
      phoneNumber: { type: String, trim: true },
      address: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      country: { type: String, trim: true },
    },
    estimatedPrice: {
      type: Number,
      min: 0,
    },
    finalPrice: {
      type: Number,
      min: 0,
    },
    priceBreakdown: {
      basePrice: { type: Number, min: 0 },
      diamondPrice: { type: Number, min: 0 },
      metalPrice: { type: Number, min: 0 },
      customizationFee: { type: Number, min: 0 },
      engravingFee: { type: Number, min: 0 },
      gst: { type: Number, min: 0 },
      total: { type: Number, min: 0 },
    },
    status: {
      type: String,
      enum: Object.values(CustomizationStatus),
      default: CustomizationStatus.PENDING,
      index: true,
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    messages: [
      {
        sender: {
          type: String,
          enum: ["user", "admin"],
          required: true,
        },
        message: {
          type: String,
          required: true,
          trim: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        attachments: [
          {
            type: String,
            trim: true,
          },
        ],
      },
    ],
    adminNotes: {
      type: String,
      trim: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date,
    },
    approvedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    estimatedDelivery: {
      type: Date,
    },
    estimatedDeliveryDay: {
      type: String,
      trim: true,
    },
    actualDelivery: {
      type: Date,
    },
    // Payment Information
    paymentId: {
      type: String,
      trim: true,
      index: true,
    },
    paymentStatus: {
      type: String,
      default: "pending",
      trim: true,
    },
    paymentAmount: {
      type: Number,
      min: 0,
    },
    customData: {
      type: Schema.Types.Mixed,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
    collection: "customization_requests",
  }
);

// Compound indexes for efficient queries
customizationRequestSchema.index({ userId: 1, status: 1 });
customizationRequestSchema.index({ category: 1, status: 1 });
customizationRequestSchema.index({ status: 1, createdAt: -1 });
customizationRequestSchema.index({ requestId: 1, userId: 1 });

// Pre-save middleware to generate requestId and requestNumber if not provided
customizationRequestSchema.pre("save", function (next) {
  if (!this.requestId) {
    this.requestId = `REQ_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }
  if (!this.requestNumber) {
    this.requestNumber = `KYNA-REQ-${Date.now().toString().slice(-8)}`;
  }
  next();
});

// Instance methods
customizationRequestSchema.methods.updateStatus = function (
  newStatus: CustomizationStatus,
  message?: string
) {
  this.status = newStatus;

  // Update progress based on status
  switch (newStatus) {
    case CustomizationStatus.PENDING:
      this.progress = 10;
      break;
    case CustomizationStatus.IN_REVIEW:
      this.progress = 25;
      this.reviewedAt = new Date();
      break;
    case CustomizationStatus.APPROVED:
      this.progress = 50;
      this.approvedAt = new Date();
      break;
    case CustomizationStatus.IN_PROGRESS:
      this.progress = 75;
      break;
    case CustomizationStatus.COMPLETED:
      this.progress = 100;
      this.completedAt = new Date();
      break;
    case CustomizationStatus.REJECTED:
      this.progress = 0;
      break;
    case CustomizationStatus.CANCELLED:
      this.progress = 0;
      break;
  }

  // Add message if provided
  if (message) {
    this.messages.push({
      sender: "admin",
      message,
      timestamp: new Date(),
    });
  }

  return this.save();
};

customizationRequestSchema.methods.addMessage = function (
  sender: "user" | "admin",
  message: string,
  attachments?: string[]
) {
  this.messages.push({
    sender,
    message,
    timestamp: new Date(),
    attachments,
  });
  return this.save();
};

// Static methods
customizationRequestSchema.statics.findByRequestId = function (
  requestId: string
) {
  return this.findOne({ requestId });
};

customizationRequestSchema.statics.findByUserId = function (
  userId: string,
  limit: number = 10
) {
  return this.find({ userId }).sort({ createdAt: -1 }).limit(limit);
};

customizationRequestSchema.statics.findByStatus = function (
  status: CustomizationStatus,
  limit: number = 10
) {
  return this.find({ status }).sort({ createdAt: -1 }).limit(limit);
};

const CustomizationRequest = mongoose.model<
  ICustomizationRequest,
  ICustomizationRequestModel
>("CustomizationRequest", customizationRequestSchema);

export default CustomizationRequest;
