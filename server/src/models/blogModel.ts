import mongoose, { Schema, Document } from "mongoose";

export interface IBlog extends Document {
  title: string;
  displayImage: string;   // main/cover image
  notes: string;          // blog content
  images: string[];       // additional images
  createdAt: Date;
}

const BlogSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    displayImage: { type: String, required: true },
    notes: { type: String, required: true },
    images: [{ type: String }], // array of image URLs
  },
  { timestamps: true }
);

export default mongoose.model<IBlog>("Blog", BlogSchema);
