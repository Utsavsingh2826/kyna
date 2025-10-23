import { Response } from 'express';
import mongoose from 'mongoose';
import PromoCode from '../models/promoCodeModel';
import User from '../models/userModel';
import { AuthRequest } from '../types';

// Apply promo code
export const applyPromoCode = async (req: AuthRequest, res: Response) => {
  try {
    const { code, subtotal } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!code || !subtotal) {
      return res.status(400).json({
        success: false,
        message: 'Promo code and subtotal are required'
      });
    }

    // Find promo code
    const promoCode = await PromoCode.findOne({ 
      code: code.toUpperCase(),
      isActive: true 
    });

    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: 'Invalid promo code'
      });
    }

    // Check if promo code is valid
    if (!promoCode.isValid()) {
      return res.status(400).json({
        success: false,
        message: 'Promo code has expired or reached usage limit'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't check if user has already used this code here
    // This check should only happen when the order is created
    // The promo code can be applied multiple times to the cart until order is placed

    // Check minimum purchase requirement
    if (subtotal < promoCode.minPurchase) {
      return res.status(400).json({
        success: false,
        message: `Minimum purchase of ₹${promoCode.minPurchase} required for this promo code`
      });
    }

    // Calculate discount
    const discountAmount = promoCode.calculateDiscount(subtotal);

    // Don't mark promo code as used yet - only mark when order is created
    // Just return the discount info for cart display

    res.json({
      success: true,
      message: 'Promo code applied successfully',
      data: {
        code: promoCode.code,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue,
        discountAmount,
        description: promoCode.description,
        promoCodeId: promoCode._id,
        isTemporary: true // Indicates this is temporary until order is placed
      }
    });

  } catch (error) {
    console.error('Apply promo code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply promo code'
    });
  }
};

// Validate promo code (without applying)
export const validatePromoCode = async (req: AuthRequest, res: Response) => {
  try {
    const { code, subtotal } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!code || !subtotal) {
      return res.status(400).json({
        success: false,
        message: 'Promo code and subtotal are required'
      });
    }

    // Find promo code
    const promoCode = await PromoCode.findOne({ 
      code: code.toUpperCase(),
      isActive: true 
    });

    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: 'Invalid promo code'
      });
    }

    // Check if promo code is valid
    if (!promoCode.isValid()) {
      return res.status(400).json({
        success: false,
        message: 'Promo code has expired or reached usage limit'
      });
    }

    // Check if user has already used this code
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.usedPromoCodes.includes(promoCode._id)) {
      return res.status(400).json({
        success: false,
        message: 'You have already used this promo code'
      });
    }

    // Check minimum purchase requirement
    if (subtotal < promoCode.minPurchase) {
      return res.status(400).json({
        success: false,
        message: `Minimum purchase of ₹${promoCode.minPurchase} required for this promo code`
      });
    }

    // Calculate discount
    const discountAmount = promoCode.calculateDiscount(subtotal);

    res.json({
      success: true,
      message: 'Promo code is valid',
      data: {
        code: promoCode.code,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue,
        discountAmount,
        description: promoCode.description,
        promoCodeId: promoCode._id
      }
    });

  } catch (error) {
    console.error('Validate promo code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate promo code'
    });
  }
};

// Mark promo code as used (called after successful order)
export const markPromoCodeUsed = async (userId: string, promoCodeId: string) => {
  try {
    const promoCode = await PromoCode.findById(promoCodeId);
    const user = await User.findById(userId);
    
    if (promoCode && user) {
      // Add to user's used promo codes
      user.usedPromoCodes.push(promoCode._id);
      await user.save();
      
      // Update promo code usage
      promoCode.usedBy.push(new mongoose.Types.ObjectId(userId));
      promoCode.usedCount += 1;
      await promoCode.save();
    }
  } catch (error) {
    console.error('Mark promo code used error:', error);
  }
};
