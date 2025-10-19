import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';

// Configure multer with Cloudinary storage for profile images
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'kyna-jewels/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    resource_type: 'image',
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto' }
    ]
  } as any
});

// Create multer upload instance for profile images
const profileUpload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only single profile image
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      // Additional validation for image types
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(file.originalname.toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      
      if (mimetype && extname) {
        cb(null, true);
      } else {
        cb(new Error('Only JPEG, PNG, GIF, and WebP images are allowed!'));
      }
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Middleware for handling single profile image upload
export const uploadProfileImage = profileUpload.single('profileImage');

// Alternative memory storage for direct buffer handling (if needed)
const memoryStorage = multer.memoryStorage();

const profileMemoryUpload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(file.originalname.toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      
      if (mimetype && extname) {
        cb(null, true);
      } else {
        cb(new Error('Only JPEG, PNG, GIF, and WebP images are allowed!'));
      }
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Memory storage middleware (for custom Cloudinary handling)
export const uploadProfileImageMemory = profileMemoryUpload.single('profileImage');

// Error handling middleware for upload errors
export const handleProfileUploadError = (error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Profile image too large. Maximum size is 5MB.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field. Only "profileImage" field is allowed.'
      });
    }
  }
  
  if (error.message?.includes('Only') && error.message?.includes('allowed')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  // For other errors, pass to next error handler
  next(error);
};

export default profileUpload;
