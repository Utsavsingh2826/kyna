import express from 'express';
import { 
  getSettings, 
  updateSettings, 
  createSettings 
} from '../controllers/settingsController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get current settings (public endpoint)
router.get('/', getSettings);

// Create settings (admin only)
router.post('/', authenticateToken, createSettings);

// Update settings (admin only)
router.put('/', authenticateToken, updateSettings);

export default router;
