import express from 'express';
import { subscribe } from '../controllers/marketingController';

const router = express.Router();

router.post('/subscribe', subscribe);

export default router;
