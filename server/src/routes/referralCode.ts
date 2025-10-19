import { Router } from 'express';
import { applyReferralCode, validateReferralCode } from '../controllers/referralCodeController';
import { verifyToken } from '../middleware/auth';

const router = Router();

// All referral code routes require authentication
router.use(verifyToken);

// POST /api/referral-code/apply - Apply referral code
router.post('/apply', applyReferralCode);

// POST /api/referral-code/validate - Validate referral code
router.post('/validate', validateReferralCode);

export default router;
