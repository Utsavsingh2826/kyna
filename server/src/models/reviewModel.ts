import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '../types';

// Reply interface
export interface IReply {
  user: string | IUser;
  text: string;
  createdAt: Date;
}

// Review interface
export interface IReview extends Document {
  user: string | IUser;
  product: string;
  rating: number;
  comment: string;
  images: string[];
  likes: (string | IUser)[];
  replies: IReply[];
  createdAt: Date;
  updatedAt: Date;
}

// Reply sub-schema
const replySchema = new Schema<IReply>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
}, { _id: true });

// Main review schema
const reviewSchema = new Schema<IReview>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  product: { type: String, ref: "Product", required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true, trim: true },
  images: [{ type: String }],
  likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  replies: [replySchema],
}, { 
  timestamps: true 
});

// Index for faster queries
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ user: 1 });

export default mongoose.model<IReview>('Review', reviewSchema);
