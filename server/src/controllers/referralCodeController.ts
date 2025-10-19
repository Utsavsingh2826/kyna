import { Response } from 'express';
import User from '../models/userModel';
import Settings from '../models/settingsModel';
import { AuthRequest } from '../types';

// Apply referral code
export const applyReferralCode = async (req: AuthRequest, res: Response) => {
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
        message: 'Referral code and subtotal are required'
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

    // Calculate referral discount (both users get the same amount)
    const referralDiscount = settings.referralRewardFriend;

    // Update database - apply referral rewards
    // Update referrer's stats and wallet
    referrer.referralCount += 1;
    referrer.totalReferralEarnings += settings.referralRewardReferrer;
    referrer.availableOffers += settings.referralRewardReferrer;
    await referrer.save();

    // Update friend's wallet and mark referral as used
    user.availableOffers += settings.referralRewardFriend;
    user.usedReferralCodes.push(code.toUpperCase());
    await user.save();

    res.json({
      success: true,
      message: 'Referral code applied successfully. Rewards added to your wallet!',
      data: {
        code: referrer.referralCode,
        referrerName: `${referrer.firstName} ${referrer.lastName}`,
        discountAmount: referralDiscount,
        description: `Referral bonus from ${referrer.firstName}`,
        referrerId: referrer._id,
        walletBalance: user.availableOffers
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
        discountAmount: settings.referralRewardFriend,
        description: `Referral bonus from ${referrer.firstName}`,
        referrerId: referrer._id
      }
    });

  } catch (error) {
    console.error('Validate referral code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate referral code'
    });
  }
};

// Process referral rewards (called after successful order)
export const processReferralRewards = async (userId: string, referralCode?: string) => {
  try {
    if (!referralCode) return;

    const user = await User.findById(userId);
    const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
    const settings = await Settings.findOne({ isActive: true });

    if (!user || !referrer || !settings) return;

    // Update referrer's stats and wallet
    referrer.referralCount += 1;
    referrer.totalReferralEarnings += settings.referralRewardReferrer;
    referrer.availableOffers += settings.referralRewardReferrer;
    await referrer.save();

    // Update friend's wallet
    user.availableOffers += settings.referralRewardFriend;
    await user.save();

    console.log(`Referral rewards processed: ${referrer.firstName} earned ₹${settings.referralRewardReferrer}, ${user.firstName} earned ₹${settings.referralRewardFriend}`);

  } catch (error) {
    console.error('Process referral rewards error:', error);
  }
};

// Mark referral code as used
export const markReferralCodeUsed = async (userId: string, referralCode: string) => {
  try {
    const user = await User.findById(userId);
    if (user) {
      user.usedReferralCodes.push(referralCode.toUpperCase());
      await user.save();
    }
  } catch (error) {
    console.error('Mark referral code used error:', error);
  }
};
