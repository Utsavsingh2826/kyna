import express from 'express';
import { verifyToken } from '../middleware/auth';
import {
  updateBillingAddress,
  updateShippingAddress,
  getUserAddresses,
  copyBillingToShipping
} from '../controllers/addressController';

const router = express.Router();

// Get user addresses
router.get('/addresses', verifyToken, getUserAddresses);

// Update billing address
router.put('/billing-address', verifyToken, updateBillingAddress);

// Update shipping address
router.put('/shipping-address', verifyToken, updateShippingAddress);

// Copy billing address to shipping address
router.post('/copy-billing-to-shipping', verifyToken, copyBillingToShipping);

export default router;
