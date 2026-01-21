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

// Rate limit map: IP -> timestamp of last email
const emailRateLimit = new Map<string, number>();

// Share via email
export const shareViaEmail = async (req: AuthRequest, res: Response) => {
  try {
    const { emails, message, url } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';

    // Rate limiting: 1 req per minute per IP to prevent spam
    const lastRequest = emailRateLimit.get(clientIp as string);
    const now = Date.now();
    if (lastRequest && now - lastRequest < 60000) {
      return res.status(429).json({
        success: false,
        message: 'Please wait a minute before sending another email.'
      });
    }
    emailRateLimit.set(clientIp as string, now);

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid emails are required'
      });
    }

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'Share URL is required'
      });
    }

    // Replace localhost with kynajewels.com if found (useful during development/local testing)
    const sanitizedUrl = url.replace(/localhost:\d+/g, 'kynajewels.com').replace(/http:\/\/kynajewels.com/g, 'https://kynajewels.com');

    // Dynamic import to avoid circular dependency issues if any
    const { sendShareEmail } = await import('../services/emailService');

    // Send emails in parallel
    await Promise.all(
      emails.map((email: string) =>
        sendShareEmail(email, message || 'Check this out on Kyna Jewels', sanitizedUrl)
      )
    );

    res.json({
      success: true,
      message: 'Emails sent successfully'
    });

  } catch (error) {
    console.error('Share via email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send emails'
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
