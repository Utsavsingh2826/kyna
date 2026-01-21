import { Response } from 'express';
import mongoose from 'mongoose';
import WishlistShare from '../models/wishlistShareModel';
import User from '../models/userModel';
import { AuthRequest } from '../types';

// Generate a shareable wishlist link
export const generateShareLink = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Check if user already has an active share link
    const existingShare = await WishlistShare.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      isActive: true,
      expiresAt: { $gt: new Date() }
    });

    const baseUrl = process.env.FRONTEND_URL || 'https://kynajewels.com';

    if (existingShare) {
      return res.json({
        success: true,
        message: 'Share link retrieved successfully',
        data: {
          shareId: existingShare.shareId,
          shareUrl: `${baseUrl}/shared-wishlist/${existingShare.shareId}`,
          expiresAt: existingShare.expiresAt
        }
      });
    }

    // Generate a unique share ID
    const shareId = `wish_${userId.toString().slice(-6)}_${Date.now().toString(36)}`;

    // Create new share link
    const wishlistShare = new WishlistShare({
      shareId,
      userId: new mongoose.Types.ObjectId(userId),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    await wishlistShare.save();

    res.json({
      success: true,
      message: 'Share link generated successfully',
      data: {
        shareId: wishlistShare.shareId,
        shareUrl: `${baseUrl}/shared-wishlist/${wishlistShare.shareId}`,
        expiresAt: wishlistShare.expiresAt
      }
    });

  } catch (error) {
    console.error('Generate share link error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate share link'
    });
  }
};

// Get shared wishlist by share ID
export const getSharedWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const { shareId } = req.params;

    if (!shareId) {
      return res.status(400).json({
        success: false,
        message: 'Share ID is required'
      });
    }

    // Find the share record
    const wishlistShare = await WishlistShare.findOne({
      shareId,
      isActive: true,
      expiresAt: { $gt: new Date() }
    });

    if (!wishlistShare) {
      return res.status(404).json({
        success: false,
        message: 'Share link not found or expired'
      });
    }

    // Get the user details
    const user = await User.findById(wishlistShare.userId).select('firstName lastName displayName');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User for this wishlist not found'
      });
    }

    // Fetch wishlist items from WishlistItem collection
    const WishlistItem = (await import('../models/wishlistItemModel')).default;
    const items = await WishlistItem.find({ user: user._id }).sort({ createdAt: -1 });

    // Normalize items to match the structure expected by the frontend
    // We rely on snapshot data here to avoid duplicating the complex catalog logic
    const normalizedItems = items.map(item => ({
      _id: item._id,
      productId: item.productId,
      modelSku: item.modelSku,
      category: item.category,
      categorySlug: item.categorySlug,
      title: item.titleSnapshot || 'Product',
      price: item.priceSnapshot || null,
      image: item.imageSnapshot || null,
      rating: item.ratingSnapshot ? {
        score: item.ratingSnapshot.score,
        reviews: item.ratingSnapshot.reviews
      } : null,
      variantSku: item.variantSku,
      metalColorName: item.metalColorName,
      metalColorCode: item.metalColorCode,
      engraving: item.engraving,
      isEngraving: item.isEngraving,
      addedAt: item.createdAt
    }));

    res.json({
      success: true,
      message: 'Shared wishlist retrieved successfully',
      data: {
        owner: {
          firstName: user.firstName,
          lastName: user.lastName,
          displayName: user.displayName || `${user.firstName} ${user.lastName}`
        },
        wishlist: normalizedItems,
        count: normalizedItems.length,
        shareId: wishlistShare.shareId,
        expiresAt: wishlistShare.expiresAt
      }
    });

  } catch (error) {
    console.error('Get shared wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve shared wishlist'
    });
  }
};

// Revoke share link
export const revokeShareLink = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Deactivate all share links for this user
    await WishlistShare.updateMany(
      { userId: new mongoose.Types.ObjectId(userId) },
      { isActive: false }
    );

    res.json({
      success: true,
      message: 'Share link revoked successfully'
    });

  } catch (error) {
    console.error('Revoke share link error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to revoke share link'
    });
  }
};
