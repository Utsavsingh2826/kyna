import express from 'express';
import { createGiftCardOrder, verifyPayment, getUserGifts, validateVoucher } from '../controllers/giftCardController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Create a new gift card order (Razorpay)
router.post('/create-order', authenticateToken, createGiftCardOrder);

// Verify payment and activate card
router.post('/verify-payment', authenticateToken, verifyPayment);

// Get user's gifts
router.get('/my-gifts', authenticateToken, getUserGifts);

// Validate voucher
router.post('/validate-voucher', authenticateToken, validateVoucher);

export default router;