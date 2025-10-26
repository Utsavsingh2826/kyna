import { Request, Response } from 'express';
import Settings from '../models/settingsModel';
import { AuthRequest } from '../types';

// Get current settings (public endpoint)
export const getSettings = async (req: Request, res: Response) => {
  try {
    const settings = await Settings.findOne({ isActive: true });
    
    if (!settings) {
      // Return default settings if none exist
      return res.json({
        success: true,
        data: {
          referralRewardFriend: 10,
          referralRewardReferrer: 10,
          promoExpiryDays: 30,
          isActive: true
        }
      });
    }

    res.json({
      success: true,
      data: settings
    });

  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Update settings (admin only)
export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    // Check if user is admin
    const User = require('../models/userModel').default;
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin role required.' 
      });
    }

    const { 
      referralRewardFriend, 
      referralRewardReferrer, 
      promoExpiryDays 
    } = req.body;

    // Validate input
    if (referralRewardFriend !== undefined && (referralRewardFriend < 0 || referralRewardFriend > 1000)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Referral reward for friend must be between 0 and 1000' 
      });
    }

    if (referralRewardReferrer !== undefined && (referralRewardReferrer < 0 || referralRewardReferrer > 1000)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Referral reward for referrer must be between 0 and 1000' 
      });
    }

    if (promoExpiryDays !== undefined && (promoExpiryDays < 1 || promoExpiryDays > 365)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Promo expiry days must be between 1 and 365' 
      });
    }

    // Find existing settings or create new ones
    let settings = await Settings.findOne({ isActive: true });
    
    if (settings) {
      // Update existing settings
      if (referralRewardFriend !== undefined) settings.referralRewardFriend = referralRewardFriend;
      if (referralRewardReferrer !== undefined) settings.referralRewardReferrer = referralRewardReferrer;
      if (promoExpiryDays !== undefined) settings.promoExpiryDays = promoExpiryDays;
      
      await settings.save();
    } else {
      // Create new settings
      settings = new Settings({
        referralRewardFriend: referralRewardFriend || 10,
        referralRewardReferrer: referralRewardReferrer || 10,
        promoExpiryDays: promoExpiryDays || 30,
        isActive: true
      });
      
      await settings.save();
    }

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });

  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Create initial settings (admin only)
export const createSettings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    // Check if user is admin
    const User = require('../models/userModel').default;
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin role required.' 
      });
    }

    const { 
      referralRewardFriend, 
      referralRewardReferrer, 
      promoExpiryDays 
    } = req.body;

    // Check if settings already exist
    const existingSettings = await Settings.findOne({ isActive: true });
    if (existingSettings) {
      return res.status(400).json({ 
        success: false, 
        message: 'Settings already exist. Use PUT to update.' 
      });
    }

    // Validate required fields
    if (!referralRewardFriend || !referralRewardReferrer || !promoExpiryDays) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Validate input
    if (referralRewardFriend < 0 || referralRewardFriend > 1000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Referral reward for friend must be between 0 and 1000' 
      });
    }

    if (referralRewardReferrer < 0 || referralRewardReferrer > 1000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Referral reward for referrer must be between 0 and 1000' 
      });
    }

    if (promoExpiryDays < 1 || promoExpiryDays > 365) {
      return res.status(400).json({ 
        success: false, 
        message: 'Promo expiry days must be between 1 and 365' 
      });
    }

    const settings = new Settings({
      referralRewardFriend,
      referralRewardReferrer,
      promoExpiryDays,
      isActive: true
    });

    await settings.save();

    res.status(201).json({
      success: true,
      message: 'Settings created successfully',
      data: settings
    });

  } catch (error) {
    console.error('Error creating settings:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};
