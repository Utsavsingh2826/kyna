import { Request, Response } from 'express';
import Review from '../models/reviewModel';
import Product from '../models/productModel';
import { AuthRequest } from '../types';

// Add a review to a product and update product.reviews reference array
export const addReview = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized" 
      });
    }

    const { productId, rating, comment } = req.body;
    if (!productId || !rating || !comment) {
      return res.status(400).json({ 
        success: false,
        message: "productId, rating, and comment are required" 
      });
    }

    const imageFiles = (req.files as Express.Multer.File[] || []).map((f) => f.path);

    const review = await Review.create({
      user: userId,
      product: productId,
      rating,
      comment,
      images: imageFiles,
    });

    // Update product.reviews with the newly created review id
    await Product.findByIdAndUpdate(
      productId,
      { $addToSet: { reviews: review._id } },
      { new: true }
    );

    const populated = await Review.findById(review._id)
      .populate("user", "firstName lastName email")
      .lean();

    return res.status(201).json({
      success: true,
      data: populated
    });
  } catch (error) {
    console.error('Error adding review:', error);
    return res.status(500).json({ 
      success: false,
      message: "Failed to add review", 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get all reviews for a product
export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId })
      .sort({ createdAt: -1 })
      .populate("user", "firstName lastName email")
      .lean();

    return res.status(200).json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({ 
      success: false,
      message: "Failed to fetch reviews", 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Like/unlike a review (toggle)
export const toggleLike = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized" 
      });
    }

    const { id } = req.params; // review id
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ 
        success: false,
        message: "Review not found" 
      });
    }

    const hasLiked = review.likes.some((u) => u.toString() === userId.toString());
    if (hasLiked) {
      review.likes = review.likes.filter((u) => u.toString() !== userId.toString());
    } else {
      review.likes.push(userId);
    }
    await review.save();

    const populated = await Review.findById(id).populate("user", "firstName lastName email");
    return res.status(200).json({ 
      success: true,
      data: {
        liked: !hasLiked, 
        likesCount: populated?.likes.length || 0, 
        review: populated 
      }
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    return res.status(500).json({ 
      success: false,
      message: "Failed to toggle like", 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Reply to a review
export const addReply = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized" 
      });
    }

    const { id } = req.params; // review id
    const { text } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Reply text is required" 
      });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ 
        success: false,
        message: "Review not found" 
      });
    }

    review.replies.push({ user: userId, text: text.trim(), createdAt: new Date() });
    await review.save();

    const populated = await Review.findById(id)
      .populate("user", "firstName lastName email")
      .populate("replies.user", "firstName lastName email");

    return res.status(201).json({
      success: true,
      data: populated
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    return res.status(500).json({ 
      success: false,
      message: "Failed to add reply", 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
