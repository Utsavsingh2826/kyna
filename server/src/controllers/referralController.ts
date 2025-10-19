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
      expiresAt: new Date(
        Date.now() + settings.promoExpiryDays * 24 * 60 * 60 * 1000
      ),
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

    // Generate shareable link
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const shareableLink = `${baseUrl}/refer?code=${referFrdId}`;

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
    const { referFrdId } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!referFrdId) {
      return res.status(400).json({
        success: false,
        message: "Referral code is required",
      });
    }

    // Find referral
    const referral = await Referral.findOne({ referFrdId }).populate("fromUserId");
    if (!referral) {
      return res.status(404).json({
        success: false,
        message: "Invalid referral code",
      });
    }

    // Check if code is expired
    if (new Date() > referral.expiresAt) {
      referral.status = "expired";
      await referral.save();
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

    // Check if user is trying to redeem their own referral
    if (referral.fromUserId.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot redeem your own referral code",
      });
    }

    // Check if user's email is in the referral's toEmails list
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!referral.toEmails.includes(user.email)) {
      return res.status(400).json({
        success: false,
        message: "This referral code is not valid for your email address",
      });
    }

    // Get settings for reward amounts
    const settings = await Settings.findOne({ isActive: true });
    if (!settings) {
      return res.status(500).json({
        success: false,
        message: "System configuration error",
      });
    }

    // --- Update documents sequentially (no transaction) ---

    referral.status = "accepted";
    referral.redeemedBy = userId;
    referral.redeemedAt = new Date();
    await referral.save();

    const referrer = await User.findById(referral.fromUserId);
    if (referrer) {
      referrer.availableOffers += settings.referralRewardReferrer;
      await referrer.save();
    }

    user.availableOffers += settings.referralRewardFriend;
    await user.save();

    // Send success notification to referrer
    if (referrer) {
      try {
        await sendReferralSuccessNotification(
          referrer,
          user.email,
          settings.referralRewardReferrer
        );
      } catch (error) {
        console.error("Failed to send success notification:", error);
        // Don't fail request for email issues
      }
    }

    return res.json({
      success: true,
      message: "Promo code redeemed successfully",
      data: {
        friendReward: settings.referralRewardFriend,
        referrerReward: settings.referralRewardReferrer,
        yourNewBalance: user.availableOffers,
        referrerNewBalance: referrer?.availableOffers || 0,
      },
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
