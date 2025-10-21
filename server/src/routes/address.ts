import { Router } from 'express';
import { verifyToken } from '../middleware/auth';
import {
  getUserAddresses,
  updateBillingAddress,
  updateShippingAddress,
  copyBillingToShipping
} from '../controllers/addressController';

const router = Router();

router.use(verifyToken); // All address routes require authentication

router.get('/addresses', getUserAddresses);
router.put('/billing-address', updateBillingAddress);
router.put('/shipping-address', updateShippingAddress);
router.post('/copy-billing-to-shipping', copyBillingToShipping);

export default router;
