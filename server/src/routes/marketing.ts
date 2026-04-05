import express from 'express';
import path from 'path';
import { subscribe, getMetaProductFeed } from '../controllers/marketingController';

const router = express.Router();

router.post('/subscribe', subscribe);
router.get('/meta-product-feed', getMetaProductFeed);

// 🔗 High-Performance Shard Server (Ensures Nginx hits the API folder)
router.use('/feeds', express.static(path.join(process.cwd(), 'public', 'feeds')));

export default router;
