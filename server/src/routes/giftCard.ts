import express from 'express';
import { createGiftCard, getUserGifts, claimGiftFromEmail } from '../controllers/giftCardController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Create a new gift card
router.post('/', createGiftCard);

// Claim a gift from email link (requires authentication)
router.post('/claim/:giftCardId', authenticateToken, claimGiftFromEmail);

// Redeem a gift card (requires authentication)

// Get user's gifts (requires authentication)
router.get('/my-gifts', authenticateToken, getUserGifts);

export default router;