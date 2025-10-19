import { Response } from 'express';
import User from '../models/userModel';
import Order from '../models/orderModel';
import { AuthRequest } from '../types';

// Get user addresses from their latest order
export const getUserAddresses = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Get the latest order for the user to fetch addresses
    const latestOrder = await Order.findOne({ user: userId })
      .sort({ orderedAt: -1 })
      .select('billingAddress shippingAddress');

    if (!latestOrder) {
      return res.json({
        success: true,
        data: {
          billingAddress: null,
          shippingAddress: null,
          addresses: []
        }
      });
    }

    res.json({
      success: true,
      data: {
        billingAddress: latestOrder.billingAddress,
        shippingAddress: latestOrder.shippingAddress,
        addresses: [] // No longer using addresses array
      }
    });
  } catch (error) {
    console.error('Get user addresses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user addresses'
    });
  }
};

// Update billing address (creates a new order or updates latest order)
export const updateBillingAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const {
      companyName,
      street,
      city,
      state,
      country,
      zipCode
    } = req.body;

    // For now, we'll store this as a draft order or update the latest order
    // In a real application, you might want to create a separate "draft" order
    const billingAddress = {
      companyName,
      street,
      city,
      state,
      country,
      zipCode
    };

    // Find the latest order and update its billing address
    const latestOrder = await Order.findOne({ user: userId })
      .sort({ orderedAt: -1 });

    if (latestOrder) {
      latestOrder.billingAddress = billingAddress;
      await latestOrder.save();
    } else {
      // Create a draft order with just the billing address
      const draftOrder = new Order({
        user: userId,
        orderNumber: `DRAFT-${Date.now()}`,
        items: [],
        billingAddress,
        shippingAddress: {
          street: '',
          city: '',
          state: '',
          country: '',
          zipCode: '',
          sameAsBilling: false
        },
        paymentMethod: 'Credit Card',
        paymentStatus: 'pending',
        orderStatus: 'pending',
        subtotal: 0,
        gst: 0,
        shippingCharge: 0,
        totalAmount: 0
      });
      await draftOrder.save();
    }

    res.json({
      success: true,
      message: 'Billing address updated successfully',
      data: {
        billingAddress
      }
    });

  } catch (error) {
    console.error('Update billing address error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update billing address'
    });
  }
};

// Update shipping address
export const updateShippingAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const {
      companyName,
      street,
      city,
      state,
      country,
      zipCode,
      sameAsBilling
    } = req.body;

    const shippingAddress = {
      companyName,
      street,
      city,
      state,
      country,
      zipCode,
      sameAsBilling: sameAsBilling || false
    };

    // Find the latest order and update its shipping address
    const latestOrder = await Order.findOne({ user: userId })
      .sort({ orderedAt: -1 });

    if (latestOrder) {
      latestOrder.shippingAddress = shippingAddress;
      await latestOrder.save();
    } else {
      // Create a draft order with just the shipping address
      const draftOrder = new Order({
        user: userId,
        orderNumber: `DRAFT-${Date.now()}`,
        items: [],
        billingAddress: {
          street: '',
          city: '',
          state: '',
          country: '',
          zipCode: ''
        },
        shippingAddress,
        paymentMethod: 'Credit Card',
        paymentStatus: 'pending',
        orderStatus: 'pending',
        subtotal: 0,
        gst: 0,
        shippingCharge: 0,
        totalAmount: 0
      });
      await draftOrder.save();
    }

    res.json({
      success: true,
      message: 'Shipping address updated successfully',
      data: {
        shippingAddress
      }
    });

  } catch (error) {
    console.error('Update shipping address error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update shipping address'
    });
  }
};

// Copy billing address to shipping address
export const copyBillingToShipping = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Find the latest order
    const latestOrder = await Order.findOne({ user: userId })
      .sort({ orderedAt: -1 });

    if (!latestOrder) {
      return res.status(400).json({
        success: false,
        message: 'No order found to copy billing address from'
      });
    }

    if (!latestOrder.billingAddress) {
      return res.status(400).json({
        success: false,
        message: 'No billing address found to copy'
      });
    }

    // Copy billing address to shipping address
    const shippingAddress = {
      companyName: latestOrder.billingAddress.companyName,
      street: latestOrder.billingAddress.street,
      city: latestOrder.billingAddress.city,
      state: latestOrder.billingAddress.state,
      country: latestOrder.billingAddress.country,
      zipCode: latestOrder.billingAddress.zipCode,
      sameAsBilling: true
    };

    latestOrder.shippingAddress = shippingAddress;
    await latestOrder.save();

    res.json({
      success: true,
      message: 'Billing address copied to shipping address successfully',
      data: {
        shippingAddress
      }
    });

  } catch (error) {
    console.error('Copy billing to shipping error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to copy billing address to shipping address'
    });
  }
};