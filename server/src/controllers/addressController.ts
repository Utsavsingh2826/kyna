import { Request, Response } from 'express';
import { UserModel } from '../models/userModel';
import { AuthRequest } from '../types';

// Get user's billing info
export const getUserBillingInfo = async (req: AuthRequest, res: Response) => {
  try {
    const user = await UserModel.findById(req.userId).select('billingInfo');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user.billingInfo });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update billing info
export const updateBillingInfo = async (req: AuthRequest, res: Response) => {
  try {
    const { companyName, street, city, state, country, zipCode } = req.body;
    
    // Validate required fields
    if (!street || !city || !state || !country || !zipCode) {
      return res.status(400).json({ 
        success: false, 
        message: 'All billing fields (street, city, state, country, zipCode) are required' 
      });
    }
    
    const user = await UserModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update billing info
    user.billingInfo = { companyName, street, city, state, country, zipCode };
    await user.save();
    
    res.status(200).json({ 
      success: true, 
      message: 'Billing info updated successfully', 
      data: user.billingInfo 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
