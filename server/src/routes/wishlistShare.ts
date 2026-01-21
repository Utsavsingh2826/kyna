import { Router } from 'express';
import {
  generateShareLink,
  getSharedWishlist,
  revokeShareLink,
  shareViaEmail
} from '../controllers/wishlistShareController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// POST /api/wishlist-share/generate - Generate share link (requires auth)
router.post('/generate', authenticateToken, generateShareLink);

// GET /api/wishlist-share/:shareId - Get shared wishlist (public)
router.get('/:shareId', getSharedWishlist);

// DELETE /api/wishlist-share/revoke - Revoke share link (requires auth)
router.delete('/revoke', authenticateToken, revokeShareLink);

// POST /api/wishlist-share/email - Share via email (public but rate limited)
router.post('/email', shareViaEmail);

export default router;
