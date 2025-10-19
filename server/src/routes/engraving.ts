import express from 'express';
import { 
  getEngravingProducts, 
  uploadEngravingImage, 
  createProduct,
  getProductEngravingDetails,
  getUserEngravingImages,
  toggleEngravingAvailability
} from '../controllers/engravingController';
import { upload } from '../config/cloudinary';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// GET /api/engraving/products - Fetch all products where isEngraving = true
router.get('/products', getEngravingProducts);

// GET /api/engraving/product/:id - Get specific product with engraving details
router.get('/product/:id', getProductEngravingDetails);

// GET /api/engraving/user-images - Get all engraving images uploaded by the authenticated user
router.get('/user-images', authenticateToken, getUserEngravingImages);

// POST /api/engraving/upload - Upload engraved image and save URL to product
router.post('/upload', authenticateToken, upload.single('engravingImage'), uploadEngravingImage);

// POST /api/engraving/create-product - Create a new product (for testing)
router.post('/create-product', authenticateToken, createProduct);

// PUT /api/engraving/product/:id/toggle - Toggle engraving availability for a product
router.put('/product/:id/toggle', authenticateToken, toggleEngravingAvailability);

export default router;
