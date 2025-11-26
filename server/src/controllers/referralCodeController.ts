import { Response } from 'express';
import User from '../models/userModel';
import Settings from '../models/settingsModel';
import { AuthRequest } from '../types';

// Apply referral code
export const applyReferralCode = async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Referral code is required'
      });
    }

    // Find user by referral code
    const referrer = await User.findOne({ 
      referralCode: code.toUpperCase(),
      isActive: true 
    });

    if (!referrer) {
      return res.status(404).json({
        success: false,
        message: 'Invalid referral code'
      });
    }

    // Check if user is trying to use their own referral code
    if (referrer._id.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot use your own referral code'
      });
    }

    // Check if user has already used this referral code
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.usedReferralCodes.includes(code.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'You have already used this referral code'
      });
    }

    // Get settings for reward amounts
    const settings = await Settings.findOne({ isActive: true });
    if (!settings) {
      return res.status(500).json({
        success: false,
        message: 'System configuration error'
      });
    }

    // Link this user to the referrer so credits can be issued after first purchase
    user.referredBy = referrer.referralCode;
    user.usedReferralCodes.push(code.toUpperCase());
    await user.save();

    res.json({
      success: true,
      message:
        'Referral code applied successfully. Your referrer will receive rewards after your first purchase.',
      data: {
        code: referrer.referralCode,
        referrerName: `${referrer.firstName} ${referrer.lastName}`,
        referrerId: referrer._id,
      }
    });

  } catch (error) {
    console.error('Apply referral code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply referral code'
    });
  }
};

// Validate referral code (without applying)
export const validateReferralCode = async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Referral code is required'
      });
    }

    // Find user by referral code
    const referrer = await User.findOne({ 
      referralCode: code.toUpperCase(),
      isActive: true 
    });

    if (!referrer) {
      return res.status(404).json({
        success: false,
        message: 'Invalid referral code'
      });
    }

    // Check if user is trying to use their own referral code
    if (referrer._id.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot use your own referral code'
      });
    }

    // Check if user has already used this referral code
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.usedReferralCodes.includes(code.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'You have already used this referral code'
      });
    }

    // Get settings for reward amounts
    const settings = await Settings.findOne({ isActive: true });
    if (!settings) {
      return res.status(500).json({
        success: false,
        message: 'System configuration error'
      });
    }

    res.json({
      success: true,
      message: 'Referral code is valid',
      data: {
        code: referrer.referralCode,
        referrerName: `${referrer.firstName} ${referrer.lastName}`,
        rewardAmount: settings.referralRewardReferrer,
        description: `Your friend will earn rewards after your first purchase`,
        referrerId: referrer._id,
      },
    });

  } catch (error) {
    console.error('Validate referral code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate referral code'
    });
  }
};
