import mongoose, { Document, Schema } from 'mongoose';

export interface IGiftCard extends Document {
    userId: mongoose.Types.ObjectId;
    amount: number;
    points: number;
    voucherCode: string;
    type: 'static' | 'custom';
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    status: 'pending' | 'active' | 'redeemed' | 'failed';
    createdAt: Date;
    updatedAt: Date;
}

const giftCardSchema = new Schema<IGiftCard>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 2500,
    },
    points: {
        type: Number,
        required: true,
    },
    voucherCode: {
        type: String,
        unique: true,
        sparse: true, // Allow multiple pending ones with null if needed, but we'll generate it after payment success
    },
    type: {
        type: String,
        enum: ['static', 'custom'],
        required: true,
    },
    razorpayOrderId: {
        type: String,
        required: true,
        unique: true,
    },
    razorpayPaymentId: {
        type: String,
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'redeemed', 'failed'],
        default: 'pending',
    },
}, {
    timestamps: true,
});

export default mongoose.model<IGiftCard>('GiftCard', giftCardSchema);