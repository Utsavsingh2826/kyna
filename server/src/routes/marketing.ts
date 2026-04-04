import express from 'express';
import { subscribe, getMetaProductFeed } from '../controllers/marketingController';

const router = express.Router();

router.post('/subscribe', subscribe);
router.get('/meta-product-feed', getMetaProductFeed);

export default router;
