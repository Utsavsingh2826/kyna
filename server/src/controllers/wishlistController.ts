import { Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/userModel';
import Product from '../models/productModel';
import { AuthRequest } from '../types';

// Get user's wishlist
export const getWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const user = await User.findById(userId).populate('wishlist');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Wishlist retrieved successfully',
      data: {
        wishlist: user.wishlist,
        count: user.wishlist.length
      }
    });

  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve wishlist'
    });
  }
};

// Add product to wishlist
export const addToWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { productId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if product is already in wishlist
    const productObjectId = new mongoose.Types.ObjectId(productId);
    const isAlreadyInWishlist = user.wishlist.some(item => {
      const itemId = typeof item === 'string' ? item : item._id?.toString();
      return itemId === productObjectId.toString();
    });
    
    if (isAlreadyInWishlist) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }

    // Add product to wishlist (cast to any to avoid TypeScript issues)
    (user.wishlist as any).push(productObjectId);
    await user.save();

    // Populate the updated wishlist
    await user.populate('wishlist');

    res.json({
      success: true,
      message: 'Product added to wishlist successfully',
      data: {
        wishlist: user.wishlist,
        count: user.wishlist.length,
        addedProduct: product
      }
    });

  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add product to wishlist'
    });
  }
};

// Remove product from wishlist
export const removeFromWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { productId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if product is in wishlist
    const productObjectId = new mongoose.Types.ObjectId(productId);
    const isInWishlist = user.wishlist.some(item => {
      const itemId = typeof item === 'string' ? item : item._id?.toString();
      return itemId === productObjectId.toString();
    });
    
    if (!isInWishlist) {
      return res.status(400).json({
        success: false,
        message: 'Product not in wishlist'
      });
    }

    // Remove product from wishlist
    (user.wishlist as any) = user.wishlist.filter((item: any) => {
      const itemId = typeof item === 'string' ? item : item._id?.toString();
      return itemId !== productObjectId.toString();
    });
    await user.save();

    // Populate the updated wishlist
    await user.populate('wishlist');

    res.json({
      success: true,
      message: 'Product removed from wishlist successfully',
      data: {
        wishlist: user.wishlist,
        count: user.wishlist.length
      }
    });

  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove product from wishlist'
    });
  }
};

// Check if product is in wishlist
export const checkWishlistStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { productId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const productObjectId = new mongoose.Types.ObjectId(productId);
    const isInWishlist = user.wishlist.some(item => {
      const itemId = typeof item === 'string' ? item : item._id?.toString();
      return itemId === productObjectId.toString();
    });

    res.json({
      success: true,
      message: 'Wishlist status retrieved successfully',
      data: {
        isInWishlist,
        productId
      }
    });

  } catch (error) {
    console.error('Check wishlist status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check wishlist status'
    });
  }
};