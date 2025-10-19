import mongoose, { Schema } from "mongoose";
import { IReferral } from "../types";

const referralSchema = new Schema<IReferral>(
  {
    referFrdId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    fromUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toEmails: [
      {
        type: [String],
        required: true,
        validate: {
          validator: function (emails: string[]) {
            return (
              emails.length > 0 &&
              emails.every((email) => /^\S+@\S+\.\S+$/.test(email))
            );
          },
          message: "Please provide valid email addresses",
        },
      },
    ],
    note: {
      type: String,
      maxlength: 500,
    },
    sendReminder: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "expired"],
      default: "pending",
    },
    redeemedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    redeemedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    reminderSentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster lookups
referralSchema.index({ referFrdId: 1 });
referralSchema.index({ fromUserId: 1 });
referralSchema.index({ status: 1 });
referralSchema.index({ expiresAt: 1 });

// Pre-save middleware to set expiration date
referralSchema.pre("save", async function (next) {
  if (this.isNew) {
    // Get settings to determine expiry days
    const Settings = mongoose.model("Settings");
    const settings = await Settings.findOne({ isActive: true });
    const expiryDays = settings?.promoExpiryDays || 30; // Default 30 days

    this.expiresAt = new Date();
    this.expiresAt.setDate(this.expiresAt.getDate() + expiryDays);
  }
  next();
});

export default mongoose.model<IReferral>("Referral", referralSchema);
