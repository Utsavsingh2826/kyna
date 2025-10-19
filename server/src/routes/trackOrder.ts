import express from 'express';
import { trackOrder, getMyOrders } from '../controllers/orderController';

const router = express.Router();

// POST /api/track-order
router.post('/track-order', trackOrder);
router.get('/my', getMyOrders);

export default router;
