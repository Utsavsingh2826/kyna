import { Router } from 'express';
import { validatePromoCode } from '../controllers/promoCodeController';
import { verifyToken } from '../middleware/auth';

const router = Router();

// All promo code routes require authentication
router.use(verifyToken);

router.post('/validate', validatePromoCode);

export default router;
