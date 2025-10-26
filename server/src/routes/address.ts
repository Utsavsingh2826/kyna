import { Router } from 'express';
import { verifyToken } from '../middleware/auth';
import {
  getUserBillingInfo,
  updateBillingInfo
} from '../controllers/addressController';

const router = Router();

router.use(verifyToken); // All address routes require authentication

router.get('/billing-info', getUserBillingInfo);
router.put('/billing-info', updateBillingInfo);

export default router;
