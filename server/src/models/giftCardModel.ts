import mongoose, { Document, Schema } from 'mongoose';

export interface IGiftCard extends Document {
    from: string;
    to: string;
    amount: number;
}

const giftCardSchema = new Schema<IGiftCard>({
    from: {
        type: String,
        required: true,
        trim: true,
    },
    to: {
        type: String,
        required: true,
        trim: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 1,
    },

}, {
    timestamps: true,
});



export default mongoose.model<IGiftCard>('GiftCard', giftCardSchema);