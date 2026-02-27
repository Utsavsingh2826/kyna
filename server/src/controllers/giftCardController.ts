import { Request, Response } from 'express';
import GiftCard from '../models/giftCardModel';
import User from '../models/userModel';
import { AuthRequest } from '../types';
import { getRazorpayInstance, createOrderPayload, verifyWebhookSignature } from '../utils/razorpay';
import crypto from 'crypto';

// Helper to generate unique voucher code
const generateVoucherCode = (): string => {
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `KYNAGC${timestamp}${random}`;
};

// Create a new gift card order
export const createGiftCardOrder = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id;
        const { amount, type } = req.body;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Please log in to purchase a gift card',
            });
            return;
        }

        if (!amount || !type) {
            res.status(400).json({
                success: false,
                message: 'Amount and type are required',
            });
            return;
        }

        if (amount < 2500) {
            res.status(400).json({
                success: false,
                message: 'Amount must be at least ₹2500',
            });
            return;
        }

        // Create Razorpay order
        const razorpay = getRazorpayInstance();
        const payload = createOrderPayload(amount);

        const razorpayOrder = await razorpay.orders.create(payload);

        // Save pending gift card purchase
        const giftCard = new GiftCard({
            userId,
            amount,
            points: amount, // ₹X → X points
            type,
            razorpayOrderId: razorpayOrder.id,
            status: 'pending',
        });

        await giftCard.save();

        res.status(200).json({
            success: true,
            data: {
                razorpayOrderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                key: process.env.RAZORPAY_KEY_ID,
            },
        });
    } catch (error: any) {
        console.error('Error creating gift card order:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error',
        });
    }
};

// Verify payment and activate gift card
export const verifyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            res.status(400).json({
                success: false,
                message: 'Missing required payment verification fields',
            });
            return;
        }

        // Verify signature
        const secret = process.env.RAZORPAY_KEY_SECRET || '';
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            res.status(400).json({
                success: false,
                message: 'Invalid payment signature',
            });
            return;
        }

        // Find the gift card
        const giftCard = await GiftCard.findOne({ razorpayOrderId: razorpay_order_id });
        if (!giftCard) {
            res.status(404).json({
                success: false,
                message: 'Gift card order not found',
            });
            return;
        }

        if (giftCard.status !== 'pending') {
            res.status(400).json({
                success: false,
                message: 'Gift card already processed',
            });
            return;
        }

        // Payment success logic
        const voucherCode = generateVoucherCode();

        giftCard.status = 'active';
        giftCard.razorpayPaymentId = razorpay_payment_id;
        giftCard.voucherCode = voucherCode;
        await giftCard.save();

        // Credit points to user
        const user = await User.findById(giftCard.userId);
        if (user) {
            user.points = (user.points || 0) + giftCard.points;
            // Also store in gifts array if not already there
            if (!user.gifts.includes(giftCard._id)) {
                user.gifts.push(giftCard._id);
            }
            await user.save();
        }

        res.status(200).json({
            success: true,
            message: 'Payment verified and gift card activated!',
            data: {
                voucherCode,
                pointsCredited: giftCard.points,
            },
        });
    } catch (error: any) {
        console.error('Error verifying gift card payment:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error',
        });
    }
};

// GET user's gift cards (existing method update)
export const getUserGifts = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Please log in to view your gift cards',
            });
            return;
        }

        const giftCards = await GiftCard.find({ userId }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: giftCards,
        });
    } catch (error) {
        console.error('Error fetching user gifts:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
