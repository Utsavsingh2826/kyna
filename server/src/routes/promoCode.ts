import { Router } from 'express';
import { applyPromoCode, validatePromoCode } from '../controllers/promoCodeController';
import { verifyToken } from '../middleware/auth';

const router = Router();

// All promo code routes require authentication
router.use(verifyToken);

// POST /api/promo-code/apply - Apply promo code
router.post('/apply', applyPromoCode);

// POST /api/promo-code/validate - Validate promo code
router.post('/validate', validatePromoCode);

export default router;
