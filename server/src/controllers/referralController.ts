import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../models/userModel";
import Referral from "../models/referralModel";
import Settings from "../models/settingsModel";
import { AuthRequest } from "../types";
import {
  sendReferralInvitation,
  sendReferralSuccessNotification,
  sendReferralReminder,
} from "../services/referralEmail";

// Create referral
export const createReferral = async (req: AuthRequest, res: Response) => {
  try {
    const { toEmails, note, sendReminder = false } = req.body;
    const fromUserId = req.user?._id;

    if (!fromUserId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Validate input
    if (!toEmails || !Array.isArray(toEmails) || toEmails.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one email address",
      });
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    const invalidEmails = toEmails.filter((email) => !emailRegex.test(email));
    if (invalidEmails.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid email addresses: ${invalidEmails.join(", ")}`,
      });
    }

    // Check if user exists
    const user = await User.findById(fromUserId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate unique referral ID using MongoDB ObjectId
    const referFrdId = new mongoose.Types.ObjectId().toString();

    // Get settings for expiry
    let settings = await Settings.findOne({ isActive: true });
    if (!settings) {
      // Create default settings if none exist
      settings = new Settings({
        referralRewardFriend: 10,
        referralRewardReferrer: 10,
        promoExpiryDays: 30,
        isActive: true,
      });
      await settings.save();
    }

    // Create referral
    const referral = new Referral({
  referFrdId,
  fromUserId,
  toEmails,
  note: note || "",
  sendReminder: Boolean(sendReminder),
  expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 12)), // 1 year expiry
});

await referral.save();


    

    // Send invitation emails to all friends
    const emailPromises = toEmails.map(async (email: string) => {
      try {
        await sendReferralInvitation(referral, user, email);
        return { email, sent: true };
      } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
        return { email, sent: false, error: (error as Error).message };
      }
    });

    const emailResults = await Promise.all(emailPromises);

    // Generate shareable link (redirects to signup page)
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const shareableLink = `${baseUrl}/signup?referral=${user.referralCode}`;

    res.status(201).json({
      success: true,
      message: "Referral created successfully",
      data: {
        referFrdId,
        shareableLink,
        referralCode: referFrdId, // For easy copying
        expiresAt: referral.expiresAt,
        toEmails: referral.toEmails,
        sendReminder: referral.sendReminder,
        emailResults,
      },
    });
  } catch (error) {
    console.error("Error creating referral:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Redeem promo code
export const redeemPromoCode = async (req: AuthRequest, res: Response) => {
  try {
    const { referFrdId, code } = req.body; // support both legacy referFrdId and public code
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }


    const inputCode = referFrdId || code;
    if (!inputCode) {
      return res.status(400).json({ success: false, message: 'Referral code is required' });
    }

    // Try to locate a referral record by referFrdId
    let referral = await Referral.findOne({ referFrdId: inputCode }).populate('fromUserId');

    // If not found, maybe the user supplied a public referral code (referrer.referralCode)
    if (!referral) {
      // No referral document found. Try to see if the current user has a saved referredBy code from signup.
      const referrerUser = await User.findOne({ referralCode: inputCode });
      if (!referrerUser) {
        // No such referrer user either
        return res.status(404).json({ success: false, message: 'Invalid referral code' });
      }
      // Check current user's saved referral info
      const currentUser = await User.findById(userId);
      if (currentUser && currentUser.referredBy && currentUser.referredBy.toUpperCase() === String(inputCode).toUpperCase() && currentUser.refDiscount && currentUser.refDiscount > 0) {
        // Apply simple stored discount
        const Cart = (await import('../models/cartModel')).default;
        const cart = await Cart.findOne({ user: userId });
        if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

        const subtotal = cart.totalAmount || 0;
        const discountAmount = Math.round((subtotal * currentUser.refDiscount) / 100);
        const tax = Math.round((subtotal - discountAmount) * 0.18);
        const totalAfter = subtotal - discountAmount + tax;

        // Clear single-use referral fields
        currentUser.refDiscount = 0;
        currentUser.referredBy = null;
        await currentUser.save();

        return res.json({ success: true, message: 'Referral applied: 5% discount applied to your cart', data: { discountAmount, subtotal, tax, totalAfter } });
      }

      // If not a stored referral for this user, try to find a referral record created by that referrer targeting this user's email
      const user = await User.findById(userId);
      referral = await Referral.findOne({ fromUserId: referrerUser._id, toEmails: user?.email, status: 'pending' }).populate('fromUserId');
      if (!referral) {
        return res.status(404).json({ success: false, message: 'No pending referral found for this code and your email' });
      }
    }

    // Check if code is expired
    if (new Date() > referral.expiresAt) {
      referral.status = 'expired';
      await referral.save();
      return res.status(400).json({ success: false, message: 'Referral code has expired' });
    }

    // Check if already redeemed
    if (referral.status === 'accepted') {
      return res.status(400).json({ success: false, message: 'Referral code has already been redeemed' });
    }

    // Check if user is trying to redeem their own referral
    if (referral.fromUserId.toString() === userId.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot redeem your own referral code' });
    }

    // Check if user's email is in the referral's toEmails list
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (!referral.toEmails.includes(user.email)) {
      return res.status(400).json({ success: false, message: 'This referral code is not valid for your email address' });
    }

    // Find user's cart
    const Cart = (await import('../models/cartModel')).default;
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    // Compute 5% discount on cart totalAmount
    const subtotal = cart.totalAmount || 0;
    const discountAmount = Math.round(subtotal * 0.05);

    // Mark referral as accepted (do not credit wallets or totals — per request keep it simple)
    referral.status = 'accepted';
    referral.redeemedBy = userId;
    referral.redeemedAt = new Date();
    await referral.save();

    // Return discount info and updated totals; frontend will apply discount to UI
    const tax = Math.round((subtotal - discountAmount) * 0.18); // 18% GST
    const totalAfter = subtotal - discountAmount + tax;

    return res.json({
      success: true,
      message: 'Referral applied: 5% discount applied to your cart',
      data: {
        discountAmount,
        subtotal,
        tax,
        totalAfter,
        referralId: referral.referFrdId,
      }
    });
  } catch (error) {
    console.error("Error redeeming promo code:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// Get user's referrals
export const getUserReferrals = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const referrals = await Referral.find({ fromUserId: userId })
      .populate("redeemedBy", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: referrals,
    });
  } catch (error) {
    console.error("Error fetching user referrals:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get referral details by code (for validation before redemption)
export const getReferralDetails = async (req: Request, res: Response) => {
  try {
    const { referFrdId } = req.params;

    const referral = await Referral.findOne({ referFrdId })
      .populate("fromUserId", "firstName lastName")
      .select("-__v");

    if (!referral) {
      return res.status(404).json({
        success: false,
        message: "Invalid referral code",
      });
    }

    // Check if expired
    if (new Date() > referral.expiresAt) {
      return res.status(400).json({
        success: false,
        message: "Referral code has expired",
      });
    }

    // Check if already redeemed
    if (referral.status === "accepted") {
      return res.status(400).json({
        success: false,
        message: "Referral code has already been redeemed",
      });
    }

    res.json({
      success: true,
      data: {
        referFrdId: referral.referFrdId,
        referralCode: referral.referFrdId, // For easy copying
        fromUser: referral.fromUserId,
        note: referral.note,
        expiresAt: referral.expiresAt,
        status: referral.status,
      },
    });
  } catch (error) {
    console.error("Error fetching referral details:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Send reminder emails for pending referrals (3 days after creation)
export const sendReminderEmails = async () => {
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Find referrals that are 3 days old, pending, have sendReminder enabled, and haven't sent reminder yet
    const referrals = await Referral.find({
      status: "pending",
      sendReminder: true,
      reminderSentAt: { $exists: false },
      createdAt: { $lte: threeDaysAgo },
    }).populate("fromUserId");

    console.log(`Found ${referrals.length} referrals to send reminders for`);

    for (const referral of referrals) {
      const referrer = referral.fromUserId as any;

      // Send reminder to each email in the referral
      const emailPromises = referral.toEmails.map(async (email: string) => {
        try {
          await sendReferralReminder(referral, referrer, email);
          return { email, sent: true };
        } catch (error) {
          console.error(`Failed to send reminder to ${email}:`, error);
          return { email, sent: false, error: (error as Error).message };
        }
      });

      const emailResults = await Promise.all(emailPromises);

      // Mark reminder as sent
      referral.reminderSentAt = new Date();
      await referral.save();

      console.log(
        `Sent reminders for referral ${referral.referFrdId}:`,
        emailResults
      );
    }

    return {
      success: true,
      message: `Sent reminders for ${referrals.length} referrals`,
      processed: referrals.length,
    };
  } catch (error) {
    console.error("Error sending reminder emails:", error);
    return {
      success: false,
      message: "Error sending reminder emails",
      error: (error as Error).message,
    };
  }
};

// Manual trigger for sending reminders (admin endpoint)
export const triggerReminderEmails = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const result = await sendReminderEmails();

    res.json({
      success: result.success,
      message: result.message,
      data: {
        processed: result.processed,
      },
    });
  } catch (error) {
    console.error("Error triggering reminder emails:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Apply simple referral discount saved on user at signup
export const applySimpleReferral = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ success: false, message: 'User not authenticated' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (!user.referredBy || !user.refDiscount || user.refDiscount <= 0) {
      return res.status(400).json({ success: false, message: 'No referral discount available' });
    }

    // Find cart
    const Cart = (await import('../models/cartModel')).default;
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const subtotal = cart.totalAmount || 0;
    const discountAmount = Math.round((subtotal * user.refDiscount) / 100);
    const tax = Math.round((subtotal - discountAmount) * 0.18);
    const totalAfter = subtotal - discountAmount + tax;

    // Clear the referral discount so it's single-use
    user.refDiscount = 0;
    user.referredBy = null;
    await user.save();

    // If there is a referral record for this referrer and this user's email, mark it accepted
    try {
      const referral = await Referral.findOne({ fromUserId: (await User.findOne({ referralCode: user.referredBy }))?._id, toEmails: user.email, status: 'pending' });
      if (referral) {
        referral.status = 'accepted';
        referral.redeemedBy = userId;
        referral.redeemedAt = new Date();
        await referral.save();
      }
    } catch (err) {
      // ignore referral marking errors
    }

    return res.json({ success: true, message: 'Referral discount applied', data: { discountAmount, subtotal, tax, totalAfter } });
  } catch (error) {
    console.error('Apply simple referral error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
