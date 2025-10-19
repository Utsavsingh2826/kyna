import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';

// Configure multer with Cloudinary storage for blog images
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'kyna-jewels/blogs',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 1200, height: 800, crop: 'limit', quality: 'auto' }
    ],
    resource_type: 'image'
  } as any
});

// Create multer upload instance for blogs
const blogUpload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 10 // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Middleware for handling single display image upload
export const uploadDisplayImage = blogUpload.single('displayImage');

// Middleware for handling multiple additional images upload
export const uploadImages = blogUpload.array('images', 10);

// Middleware for handling both display image and additional images
export const uploadBlogImages = blogUpload.fields([
  { name: 'displayImage', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]);

// Error handling middleware for upload errors
export const handleUploadError = (error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB per file.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 10 additional images allowed.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed!'
    });
  }

  next(error);
};

export default blogUpload;
