import express from 'express';
import { BlogController } from '../controllers/blogController';
import { 
  uploadBlogImages, 
  uploadDisplayImage, 
  uploadImages, 
  handleUploadError 
} from '../middleware/blogUpload';
// Validation middleware removed

const router = express.Router();

/**
 * Blog Routes
 * 
 * @route   POST   /api/blogs
 * @desc    Create a new blog post with images
 * @access  Private (admin)
 * @body    { title: string, notes: string, displayImage?: File, images?: File[] }
 */
router.post(
  '/',
  uploadBlogImages,
  handleUploadError,
  BlogController.createBlog
);

/**
 * @route   GET    /api/blogs
 * @desc    Get all blog posts with pagination
 * @access  Public
 * @query   { page?: number, limit?: number }
 */
router.get(
  '/',
  BlogController.getAllBlogs
);

/**
 * @route   GET    /api/blogs/search
 * @desc    Search blog posts by title or content
 * @access  Public
 * @query   { q: string, page?: number, limit?: number }
 */
router.get(
  '/search',
  BlogController.searchBlogs
);

/**
 * @route   GET    /api/blogs/:id
 * @desc    Get a single blog post by ID
 * @access  Public
 * @params  { id: string }
 */
router.get(
  '/:id',
  BlogController.getBlogById
);

/**
 * @route   PUT    /api/blogs/:id
 * @desc    Update a blog post with new images
 * @access  Private (admin)
 * @params  { id: string }
 * @body    { title?: string, notes?: string, displayImage?: File, images?: File[] }
 */
router.put(
  '/:id',
  uploadBlogImages,
  handleUploadError,
  BlogController.updateBlog
);

/**
 * @route   DELETE /api/blogs/:id
 * @desc    Delete a blog post and its images
 * @access  Private (admin)
 * @params  { id: string }
 */
router.delete(
  '/:id',
  BlogController.deleteBlog
);

// Additional routes for specific image uploads

/**
 * @route   POST   /api/blogs/:id/display-image
 * @desc    Upload/update only the display image for a blog post
 * @access  Private (admin)
 * @params  { id: string }
 * @body    { displayImage: File }
 */
router.post(
  '/:id/display-image',
  uploadDisplayImage,
  handleUploadError,
  BlogController.updateBlog
);

/**
 * @route   POST   /api/blogs/:id/images
 * @desc    Upload additional images for a blog post
 * @access  Private (admin)
 * @params  { id: string }
 * @body    { images: File[] }
 */
router.post(
  '/:id/images',
  uploadImages,
  handleUploadError,
  BlogController.updateBlog
);

export default router;
