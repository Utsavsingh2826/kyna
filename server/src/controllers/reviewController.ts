import { Request, Response } from "express";
import mongoose from "mongoose";
import Review from "../models/reviewModel";
import Product from "../models/productModel";
import { AuthRequest } from "../types";

// Add a review to a product and update product.reviews reference array
export const addReview = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { productId, rating, title, comment } = req.body;
    if (!productId || !rating || !title || !comment) {
      return res.status(400).json({
        success: false,
        message: "productId, rating, title, and comment are required",
      });
    }

    const imageFiles = ((req.files as Express.Multer.File[]) || []).map(
      (f) => f.path
    );

    const review = await Review.create({
      user: userId,
      product: productId,
      rating,
      title,
      comment,
      images: imageFiles,
    });

    // Product model doesn't have reviews array field, so we skip updating it
    // Reviews can be fetched by querying Review collection directly

    const populated = await Review.findById(review._id)
      .populate("user", "firstName lastName email")
      .lean();

    return res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    console.error("Error adding review:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add review",
      error: error instanceof Error ? error.message : "Unknown error",
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
      data: reviews,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get all reviews (for customer reviews page)
export const getAllReviews = async (req: Request, res: Response) => {
  try {
    const { limit = 50, skip = 0 } = req.query;
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .populate("user", "firstName lastName email")
      .populate("replies.user", "firstName lastName email")
      .lean();

    const total = await Review.countDocuments();

    // Since product is stored as string (SKU), we need to fetch products separately
    // Get unique product SKUs/IDs from reviews
    const productIds = [...new Set(reviews.map((r: any) => r.product).filter(Boolean))];
    
    // Helper function to check if string is a valid 24-character hex ObjectId
    const isValidObjectId = (id: string): boolean => {
      if (!id || typeof id !== 'string') return false;
      if (id.length !== 24) return false;
      // Check if it's a valid hex string (24 hex characters)
      return /^[0-9a-fA-F]{24}$/.test(id);
    };
    
    // Separate valid ObjectIds from SKU strings
    const validObjectIds: string[] = [];
    const skuStrings: string[] = [];
    
    productIds.forEach((id: string) => {
      if (isValidObjectId(id)) {
        validObjectIds.push(id);
      } else {
        skuStrings.push(id);
      }
    });
    
    // Build query conditions - only query by SKU to avoid ObjectId casting issues
    // Since products are primarily identified by SKU, we'll query by SKU only
    let products: any[] = [];
    if (skuStrings.length > 0) {
      products = await Product.find({
        sku: { $in: skuStrings }
      }).select("sku title images").lean();
    }
    
    // If we have valid ObjectIds, try to find by _id as well (but separately to avoid casting errors)
    if (validObjectIds.length > 0) {
      try {
        const objectIdProducts = await Product.find({
          _id: { $in: validObjectIds.map(id => new mongoose.Types.ObjectId(id)) }
        }).select("sku title images").lean();
        products = [...products, ...objectIdProducts];
      } catch (err) {
        // If ObjectId query fails, just skip it and use SKU results
        console.warn("Error querying products by ObjectId:", err);
      }
    }

    // Create a map for quick lookup
    const productMap = new Map();
    products.forEach((p: any) => {
      productMap.set(p.sku, p);
      productMap.set(p._id.toString(), p);
    });

    // Attach product info to reviews
    const reviewsWithProducts = reviews.map((review: any) => ({
      ...review,
      product: productMap.get(review.product) || null,
    }));

    return res.status(200).json({
      success: true,
      data: reviewsWithProducts,
      total,
      limit: Number(limit),
      skip: Number(skip),
    });
  } catch (error) {
    console.error("Error fetching all reviews:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: error instanceof Error ? error.message : "Unknown error",
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
        message: "Unauthorized",
      });
    }

    const { id } = req.params; // review id
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    const hasLiked = review.likes.some(
      (u) => u.toString() === userId.toString()
    );
    if (hasLiked) {
      review.likes = review.likes.filter(
        (u) => u.toString() !== userId.toString()
      );
    } else {
      review.likes.push(userId);
    }
    await review.save();

    const populated = await Review.findById(id).populate(
      "user",
      "firstName lastName email"
    );
    return res.status(200).json({
      success: true,
      data: {
        liked: !hasLiked,
        likesCount: populated?.likes.length || 0,
        review: populated,
      },
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle like",
      error: error instanceof Error ? error.message : "Unknown error",
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
        message: "Unauthorized",
      });
    }

    const { id } = req.params; // review id
    const { text } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Reply text is required",
      });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    review.replies.push({
      user: userId,
      text: text.trim(),
      createdAt: new Date(),
    });
    await review.save();

    const populated = await Review.findById(id)
      .populate("user", "firstName lastName email")
      .populate("replies.user", "firstName lastName email");

    return res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    console.error("Error adding reply:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add reply",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
