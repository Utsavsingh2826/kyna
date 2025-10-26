import { Router } from 'express';
import {
    getCart,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    updateCartPromoCode
} from '../controllers/cartController';
import { verifyToken } from '../middleware/auth';

const router = Router();

// All cart routes require authentication
router.use(verifyToken);

// GET /api/cart - Get user's cart
router.get('/', getCart);

// POST /api/cart/add - Add item to cart
router.post('/add', addToCart);

// DELETE /api/cart/remove/:productId - Remove item from cart
router.delete('/remove/:productId', removeFromCart);

// PUT /api/cart/update/:productId - Update item quantity
router.put('/update/:productId', updateCartItem);

// DELETE /api/cart/clear - Clear entire cart
router.delete('/clear', clearCart);

// PUT /api/cart/promo-code - Update cart with applied promo code
router.put('/promo-code', updateCartPromoCode);

export default router;