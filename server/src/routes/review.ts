import express from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import { 
  addReview, 
  getProductReviews, 
  toggleLike, 
  addReply 
} from '../controllers/reviewController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup with Cloudinary storage for review images
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'kyna-jewels/reviews',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    resource_type: 'image',
    transformation: [
      { width: 800, height: 600, crop: 'limit', quality: 'auto' }
    ]
  } as any
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Routes
router.post('/', authenticateToken, upload.array("images", 4), addReview);
router.get('/product/:productId', getProductReviews);
router.put('/:id/like', authenticateToken, toggleLike);
router.post('/:id/replies', authenticateToken, addReply);

export default router;
