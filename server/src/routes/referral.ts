import express from "express";
import {
  createReferral,
  redeemPromoCode,
  getUserReferrals,
  getReferralDetails,
  triggerReminderEmails,
} from "../controllers/referralController";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

// Create referral (requires authentication)
router.post("/", authenticateToken, createReferral);

// Redeem promo code (requires authentication)
router.post("/promos/redeem", authenticateToken, redeemPromoCode);

// Get user's referrals (requires authentication)
router.get("/my-referrals", authenticateToken, getUserReferrals);

// Get referral details by code (public endpoint for validation)
router.get("/details/:referFrdId", getReferralDetails);

// Trigger reminder emails (admin endpoint)
router.post("/send-reminders", authenticateToken, triggerReminderEmails);

export default router;
