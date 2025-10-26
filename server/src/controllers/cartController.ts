import { Response } from 'express';
import Cart from '../models/cartModel';
import Product from '../models/productModel';
import { AuthRequest } from '../types';

// Get user's cart
export const getCart = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const User = (await import('../models/userModel')).default;
        
        let cart = await Cart.findOne({ user: userId }).populate('items.product');

        if (!cart) {
            // Create empty cart if doesn't exist
            cart = new Cart({ user: userId, items: [], totalAmount: 0 });
            await cart.save();
        }

        // Get user to check referral discount
        const user = await User.findById(userId);
        
        // Calculate referral discount if applicable
        if (user && user.referredBy && user.refDiscount > 0 && !user.usedReferralCodes?.includes(user.referredBy)) {
            const subtotal = cart.totalAmount || 0;
            const discountAmount = Math.round((subtotal * user.refDiscount) / 100);
            const subtotalAfterDiscount = subtotal - discountAmount;
            const shippingCharge = subtotal > 5000 ? 0 : 200;
            const totalBeforeTax = subtotalAfterDiscount + shippingCharge;
            const tax = Math.round(totalBeforeTax * 0.03); // 3% tax
            const finalTotal = totalBeforeTax + tax;
            
            // Attach discount info to cart
            (cart as any).referralDiscount = user.refDiscount;
            (cart as any).appliedReferralCode = user.referredBy;
            (cart as any).discountAmount = discountAmount;
            (cart as any).subtotalAfterDiscount = subtotalAfterDiscount;
            (cart as any).shippingCharge = shippingCharge;
            (cart as any).taxAmount = tax;
            (cart as any).finalTotal = finalTotal;
        } else {
            // No referral discount
            const subtotal = cart.totalAmount || 0;
            const shippingCharge = subtotal > 5000 ? 0 : 200;
            const totalBeforeTax = subtotal + shippingCharge;
            const tax = Math.round(totalBeforeTax * 0.03); // 3% tax
            const finalTotal = totalBeforeTax + tax;
            
            (cart as any).referralDiscount = 0;
            (cart as any).appliedReferralCode = null;
            (cart as any).discountAmount = 0;
            (cart as any).subtotalAfterDiscount = subtotal;
            (cart as any).shippingCharge = shippingCharge;
            (cart as any).taxAmount = tax;
            (cart as any).finalTotal = finalTotal;
        }

        res.json({
            success: true,
            data: cart
        });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get cart'
        });
    }
};

// Add item to cart
export const addToCart = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        const { productId, quantity = 1 } = req.body;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required' });
        }

        // Verify product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Note: Stock validation removed as this appears to be a made-to-order jewelry business

        // Find or create cart
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, items: [], totalAmount: 0 });
        }

        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (existingItemIndex > -1) {
            // Update quantity if item exists
            const newQuantity = cart.items[existingItemIndex].quantity + quantity;

            // Note: Stock validation removed as this appears to be a made-to-order jewelry business

            cart.items[existingItemIndex].quantity = newQuantity;
        } else {
            // Add new item to cart
            cart.items.push({
                product: productId,
                quantity,
                price: product.price
            });
        }

        await cart.save();

        // Populate product details for response
        await cart.populate('items.product');

        res.json({
            success: true,
            message: 'Item added to cart successfully',
            data: cart
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add item to cart'
        });
    }
};

// Remove item from cart
export const removeFromCart = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        const { productId } = req.params;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required' });
        }

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Remove item from cart
        const initialLength = cart.items.length;
        cart.items = cart.items.filter(item => item.product.toString() !== productId);

        if (cart.items.length === initialLength) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        await cart.save();

        // Populate product details for response
        await cart.populate('items.product');

        res.json({
            success: true,
            message: 'Item removed from cart successfully',
            data: cart
        });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove item from cart'
        });
    }
};

// Update item quantity in cart
export const updateCartItem = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        if (!productId || !quantity || quantity < 1) {
            return res.status(400).json({ message: 'Valid product ID and quantity are required' });
        }

        // Verify product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Note: Stock validation removed as this appears to be a made-to-order jewelry business

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Find and update item
        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        cart.items[itemIndex].quantity = quantity;
        cart.items[itemIndex].price = product.price; // Update price in case it changed

        await cart.save();

        // Populate product details for response
        await cart.populate('items.product');

        res.json({
            success: true,
            message: 'Cart item updated successfully',
            data: cart
        });
    } catch (error) {
        console.error('Update cart item error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update cart item'
        });
    }
};

// Clear entire cart
export const clearCart = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = [];
        cart.totalAmount = 0;
        await cart.save();

        res.json({
            success: true,
            message: 'Cart cleared successfully',
            data: cart
        });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear cart'
        });
    }
};

// Update cart with applied promo code
export const updateCartPromoCode = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?._id;
        const { promoCode } = req.body;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Update applied promo code
        cart.appliedPromoCode = promoCode || null;
        await cart.save();

        res.json({
            success: true,
            message: promoCode ? 'Promo code applied to cart' : 'Promo code removed from cart',
            data: cart
        });
    } catch (error) {
        console.error('Update cart promo code error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update cart promo code'
        });
    }
};