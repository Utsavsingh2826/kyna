import express from 'express';
import { getGiftingProducts } from '../controllers/giftingController';

const router = express.Router();

router.get('/', getGiftingProducts);

export default router;
