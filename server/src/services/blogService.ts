import cloudinary from '../config/cloudinary';
import Blog, { IBlog } from '../models/blogModel';

export interface BlogCreateData {
  title: string;
  notes: string;
  displayImage?: string;
  images?: string[];
}

export interface BlogUpdateData {
  title?: string;
  notes?: string;
  displayImage?: string;
  images?: string[];
}

export interface BlogSearchOptions {
  query: string;
  page?: number;
  limit?: number;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export class BlogService {
  /**
   * Create a new blog post
   */
  static async createBlog(data: BlogCreateData): Promise<IBlog> {
    try {
      const blog = new Blog({
        title: data.title,
        notes: data.notes,
        displayImage: data.displayImage || '',
        images: data.images || []
      });

      return await blog.save();
    } catch (error) {
      console.error('Error creating blog:', error);
      throw new Error('Failed to create blog post');
    }
  }

  /**
   * Get all blog posts with pagination
   */
  static async getAllBlogs(options: PaginationOptions = { page: 1, limit: 10 }): Promise<{
    blogs: IBlog[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    try {
      const { page, limit } = options;
      const skip = (page - 1) * limit;

      const [blogs, total] = await Promise.all([
        Blog.find()
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Blog.countDocuments()
      ]);

      return {
        blogs,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error fetching blogs:', error);
      throw new Error('Failed to fetch blogs');
    }
  }

  /**
   * Get a single blog post by ID
   */
  static async getBlogById(id: string): Promise<IBlog | null> {
    try {
      return await Blog.findById(id);
    } catch (error) {
      console.error('Error fetching blog by ID:', error);
      throw new Error('Failed to fetch blog post');
    }
  }

  /**
   * Update a blog post
   */
  static async updateBlog(id: string, data: BlogUpdateData): Promise<IBlog | null> {
    try {
      const blog = await Blog.findById(id);
      if (!blog) {
        return null;
      }

      // Update fields if provided
      if (data.title !== undefined) blog.title = data.title;
      if (data.notes !== undefined) blog.notes = data.notes;
      if (data.displayImage !== undefined) blog.displayImage = data.displayImage;
      if (data.images !== undefined) blog.images = data.images;

      return await blog.save();
    } catch (error) {
      console.error('Error updating blog:', error);
      throw new Error('Failed to update blog post');
    }
  }

  /**
   * Delete a blog post and its images
   */
  static async deleteBlog(id: string): Promise<boolean> {
    try {
      const blog = await Blog.findById(id);
      if (!blog) {
        return false;
      }

      // Delete images from Cloudinary
      await this.deleteBlogImages(blog);

      // Delete the blog post
      await Blog.findByIdAndDelete(id);
      return true;
    } catch (error) {
      console.error('Error deleting blog:', error);
      throw new Error('Failed to delete blog post');
    }
  }

  /**
   * Search blog posts
   */
  static async searchBlogs(options: BlogSearchOptions): Promise<{
    blogs: IBlog[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    try {
      const { query, page = 1, limit = 10 } = options;
      const skip = (page - 1) * limit;

      const searchRegex = new RegExp(query, 'i');
      const searchQuery = {
        $or: [
          { title: searchRegex },
          { notes: searchRegex }
        ]
      };

      const [blogs, total] = await Promise.all([
        Blog.find(searchQuery)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Blog.countDocuments(searchQuery)
      ]);

      return {
        blogs,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error searching blogs:', error);
      throw new Error('Failed to search blogs');
    }
  }

  /**
   * Upload image to Cloudinary
   */
  static async uploadImage(file: Express.Multer.File): Promise<string> {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'kyna-jewels/blogs',
        resource_type: 'auto',
        quality: 'auto',
        fetch_format: 'auto'
      });
      return result.secure_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  }

  /**
   * Upload multiple images to Cloudinary
   */
  static async uploadMultipleImages(files: Express.Multer.File[]): Promise<string[]> {
    try {
      const uploadPromises = files.map(async (file) => {
        return await this.uploadImage(file);
      });
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading multiple images:', error);
      throw new Error('Failed to upload images');
    }
  }

  /**
   * Delete image from Cloudinary
   */
  static async deleteImageFromCloudinary(imageUrl: string): Promise<void> {
    try {
      // Extract public ID from URL
      const publicId = this.extractPublicId(imageUrl);
      if (publicId) {
        await cloudinary.uploader.destroy(`kyna-jewels/blogs/${publicId}`);
      }
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
      // Don't throw error here as it's not critical for the main operation
    }
  }

  /**
   * Delete all images associated with a blog post
   */
  static async deleteBlogImages(blog: IBlog): Promise<void> {
    try {
      // Delete display image
      if (blog.displayImage) {
        await this.deleteImageFromCloudinary(blog.displayImage);
      }

      // Delete additional images
      for (const image of blog.images) {
        await this.deleteImageFromCloudinary(image);
      }
    } catch (error) {
      console.error('Error deleting blog images:', error);
      // Don't throw error here as it's not critical for the main operation
    }
  }

  /**
   * Extract public ID from Cloudinary URL
   */
  private static extractPublicId(imageUrl: string): string | null {
    try {
      // Extract public ID from URL like: https://res.cloudinary.com/.../v1234567890/kyna-jewels/blogs/public_id
      const parts = imageUrl.split('/');
      const publicIdPart = parts[parts.length - 1];
      return publicIdPart.split('.')[0];
    } catch (error) {
      console.error('Error extracting public ID:', error);
      return null;
    }
  }

  /**
   * Get blog statistics
   */
  static async getBlogStats(): Promise<{
    totalBlogs: number;
    totalImages: number;
    recentBlogs: IBlog[];
  }> {
    try {
      const [totalBlogs, recentBlogs] = await Promise.all([
        Blog.countDocuments(),
        Blog.find().sort({ createdAt: -1 }).limit(5)
      ]);

      // Calculate total images across all blogs
      const blogsWithImages = await Blog.find({}, 'displayImage images');
      const totalImages = blogsWithImages.reduce((total, blog) => {
        return total + (blog.displayImage ? 1 : 0) + blog.images.length;
      }, 0);

      return {
        totalBlogs,
        totalImages,
        recentBlogs
      };
    } catch (error) {
      console.error('Error getting blog stats:', error);
      throw new Error('Failed to get blog statistics');
    }
  }
}
