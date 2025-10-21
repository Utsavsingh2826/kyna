import { Request, Response } from 'express';
import { UserModel } from '../models/userModel';
import { AuthRequest } from '../types';

// Get user's addresses
export const getUserAddresses = async (req: AuthRequest, res: Response) => {
  try {
    const user = await UserModel.findById(req.userId).select('address');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user.address });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update billing address
export const updateBillingAddress = async (req: AuthRequest, res: Response) => {
  try {
    const { companyName, street, city, state, country, zipCode } = req.body;
    
    // Validate required fields
    if (!street || !city || !state || !country || !zipCode) {
      return res.status(400).json({ 
        success: false, 
        message: 'All address fields (street, city, state, country, zipCode) are required' 
      });
    }
    
    const user = await UserModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Initialize address object if it doesn't exist
    if (!user.address) {
      user.address = {
        billingAddress: {
          companyName: '',
          street: '',
          city: '',
          state: '',
          country: '',
          zipCode: ''
        },
        shippingAddress: {
          companyName: '',
          street: '',
          city: '',
          state: '',
          country: '',
          zipCode: '',
          sameAsBilling: true
        }
      };
    }

    // Update billing address
    user.address.billingAddress = { companyName, street, city, state, country, zipCode };

    // If shipping address is set to sameAsBilling, update it too
    if (user.address.shippingAddress.sameAsBilling) {
      user.address.shippingAddress = { ...user.address.billingAddress, sameAsBilling: true };
    }

    await user.save();
    res.status(200).json({ success: true, message: 'Billing address updated successfully', data: user.address.billingAddress });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update shipping address
export const updateShippingAddress = async (req: AuthRequest, res: Response) => {
  try {
    const { companyName, street, city, state, country, zipCode, sameAsBilling } = req.body;
    
    // Validate required fields
    if (!street || !city || !state || !country || !zipCode) {
      return res.status(400).json({ 
        success: false, 
        message: 'All address fields (street, city, state, country, zipCode) are required' 
      });
    }
    
    const user = await UserModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Initialize address object if it doesn't exist
    if (!user.address) {
      user.address = {
        billingAddress: {
          companyName: '',
          street: '',
          city: '',
          state: '',
          country: '',
          zipCode: ''
        },
        shippingAddress: {
          companyName: '',
          street: '',
          city: '',
          state: '',
          country: '',
          zipCode: '',
          sameAsBilling: true
        }
      };
    }

    user.address.shippingAddress = { companyName, street, city, state, country, zipCode, sameAsBilling };
    await user.save();
    res.status(200).json({ success: true, message: 'Shipping address updated successfully', data: user.address.shippingAddress });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Copy billing address to shipping address
export const copyBillingToShipping = async (req: AuthRequest, res: Response) => {
  try {
    const user = await UserModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.address || !user.address.billingAddress) {
      return res.status(400).json({ success: false, message: 'No billing address found to copy' });
    }

    // Initialize address object if it doesn't exist
    if (!user.address) {
      user.address = {
        billingAddress: {
          companyName: '',
          street: '',
          city: '',
          state: '',
          country: '',
          zipCode: ''
        },
        shippingAddress: {
          companyName: '',
          street: '',
          city: '',
          state: '',
          country: '',
          zipCode: '',
          sameAsBilling: true
        }
      };
    }

    user.address.shippingAddress = { ...user.address.billingAddress, sameAsBilling: true };
    await user.save();
    res.status(200).json({ success: true, message: 'Billing address copied to shipping successfully', data: user.address.shippingAddress });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
