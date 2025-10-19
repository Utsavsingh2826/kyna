import { Request, Response } from 'express';
import Blog, { IBlog } from '../models/blogModel';
import cloudinary from '../config/cloudinary';

export class BlogController {
  /**
   * Create a new blog post
   * POST /api/blogs
   */
  static async createBlog(req: Request, res: Response) {
    try {
      const { title, notes } = req.body;
      
      // Validate required fields
      if (!title || !notes) {
        return res.status(400).json({
          success: false,
          message: 'Title and notes are required'
        });
      }

      let displayImage = '';
      let images: string[] = [];

      // Handle display image upload
      if (req.files && 'displayImage' in req.files) {
        const displayImageFile = (req.files['displayImage'] as Express.Multer.File[])[0];
        const displayImageResult = await cloudinary.uploader.upload(displayImageFile.path, {
          folder: 'kyna-jewels/blogs',
          resource_type: 'auto',
          quality: 'auto',
          fetch_format: 'auto'
        });
        displayImage = displayImageResult.secure_url;
      }

      // Handle additional images upload
      if (req.files && 'images' in req.files) {
        const imageFiles = req.files['images'] as Express.Multer.File[];
        const uploadPromises = imageFiles.map(async (file) => {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'kyna-jewels/blogs',
            resource_type: 'auto',
            quality: 'auto',
            fetch_format: 'auto'
          });
          return result.secure_url;
        });
        images = await Promise.all(uploadPromises);
      }

      // Create blog post
      const blog = new Blog({
        title,
        displayImage,
        notes,
        images
      });

      await blog.save();

      res.status(201).json({
        success: true,
        message: 'Blog post created successfully',
        data: blog
      });
    } catch (error) {
      console.error('Error creating blog:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create blog post',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get all blog posts
   * GET /api/blogs
   */
  static async getAllBlogs(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const blogs = await Blog.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Blog.countDocuments();

      res.status(200).json({
        success: true,
        message: 'Blogs retrieved successfully',
        data: {
          blogs,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error fetching blogs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch blogs',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get a single blog post by ID
   * GET /api/blogs/:id
   */
  static async getBlogById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const blog = await Blog.findById(id);
      if (!blog) {
        return res.status(404).json({
          success: false,
          message: 'Blog post not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Blog post retrieved successfully',
        data: blog
      });
    } catch (error) {
      console.error('Error fetching blog:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch blog post',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update a blog post
   * PUT /api/blogs/:id
   */
  static async updateBlog(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, notes } = req.body;

      const blog = await Blog.findById(id);
      if (!blog) {
        return res.status(404).json({
          success: false,
          message: 'Blog post not found'
        });
      }

      // Update basic fields
      if (title) blog.title = title;
      if (notes) blog.notes = notes;

      // Handle display image update
      if (req.files && 'displayImage' in req.files) {
        // Delete old image from Cloudinary if exists
        if (blog.displayImage) {
          const publicId = blog.displayImage.split('/').pop()?.split('.')[0];
          if (publicId) {
            await cloudinary.uploader.destroy(`kyna-jewels/blogs/${publicId}`);
          }
        }

        const displayImageFile = (req.files['displayImage'] as Express.Multer.File[])[0];
        const displayImageResult = await cloudinary.uploader.upload(displayImageFile.path, {
          folder: 'kyna-jewels/blogs',
          resource_type: 'auto',
          quality: 'auto',
          fetch_format: 'auto'
        });
        blog.displayImage = displayImageResult.secure_url;
      }

      // Handle additional images update
      if (req.files && 'images' in req.files) {
        // Delete old images from Cloudinary
        for (const oldImage of blog.images) {
          const publicId = oldImage.split('/').pop()?.split('.')[0];
          if (publicId) {
            await cloudinary.uploader.destroy(`kyna-jewels/blogs/${publicId}`);
          }
        }

        const imageFiles = req.files['images'] as Express.Multer.File[];
        const uploadPromises = imageFiles.map(async (file) => {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'kyna-jewels/blogs',
            resource_type: 'auto',
            quality: 'auto',
            fetch_format: 'auto'
          });
          return result.secure_url;
        });
        blog.images = await Promise.all(uploadPromises);
      }

      await blog.save();

      res.status(200).json({
        success: true,
        message: 'Blog post updated successfully',
        data: blog
      });
    } catch (error) {
      console.error('Error updating blog:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update blog post',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Delete a blog post
   * DELETE /api/blogs/:id
   */
  static async deleteBlog(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const blog = await Blog.findById(id);
      if (!blog) {
        return res.status(404).json({
          success: false,
          message: 'Blog post not found'
        });
      }

      // Delete images from Cloudinary
      if (blog.displayImage) {
        const publicId = blog.displayImage.split('/').pop()?.split('.')[0];
        if (publicId) {
          await cloudinary.uploader.destroy(`kyna-jewels/blogs/${publicId}`);
        }
      }

      for (const image of blog.images) {
        const publicId = image.split('/').pop()?.split('.')[0];
        if (publicId) {
          await cloudinary.uploader.destroy(`kyna-jewels/blogs/${publicId}`);
        }
      }

      await Blog.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: 'Blog post deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting blog:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete blog post',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Search blog posts
   * GET /api/blogs/search?q=searchTerm
   */
  static async searchBlogs(req: Request, res: Response) {
    try {
      const { q } = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const searchRegex = new RegExp(q as string, 'i');
      const blogs = await Blog.find({
        $or: [
          { title: searchRegex },
          { notes: searchRegex }
        ]
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Blog.countDocuments({
        $or: [
          { title: searchRegex },
          { notes: searchRegex }
        ]
      });

      res.status(200).json({
        success: true,
        message: 'Search results retrieved successfully',
        data: {
          blogs,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error searching blogs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search blogs',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
