import mongoose, { Schema, Document } from 'mongoose';

export interface IMarketingUser extends Document {
    email: string;
    isSubscribed: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const MarketingUserSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    isSubscribed: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model<IMarketingUser>('MarketingUser', MarketingUserSchema);
