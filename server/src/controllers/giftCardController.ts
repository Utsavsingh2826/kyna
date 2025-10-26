import { Request, Response } from 'express';
import GiftCard, { IGiftCard } from '../models/giftCardModel';
import User from '../models/userModel';
import { sendEmail } from '../services/email';
import { AuthRequest } from '../types';

// Create a new gift card
export const createGiftCard = async (req: Request, res: Response): Promise<void> => {
    try {
        const { from, to, amount } = req.body;

        // Validation
        if (!from || !to || !amount) {
            res.status(400).json({
                success: false,
                message: 'From, to, amount, and recipient email are required',
            });
            return;
        }

        if (amount < 1) {
            res.status(400).json({
                success: false,
                message: 'Amount must be at least ₹1',
            });
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(to)) {
            res.status(400).json({
                success: false,
                message: 'Please provide a valid email address',
            });
            return;
        }

        // Check if recipient is an existing user
        const existingUser = await User.findOne({ email: to });

        // Create gift card
        const giftCard = new GiftCard({
            from,
            to,
            amount,
        });

        await giftCard.save();

        // If user exists, add gift to their gifts array
        if (existingUser) {
            existingUser.gifts.push(giftCard._id);
            await existingUser.save();
        }

        // Send email to recipient
        try {
            const emailContent = `
                <h2>🎁 You've received a gift card!</h2>
                <p>From: ${from}</p>
                <p>Amount: $${amount}</p>
                <p>Gift Card ID: ${giftCard._id.toString()}</p>
                <p>Use this gift card code at checkout to redeem your gift!</p>
            `;
            await sendEmail(
                to,
                `🎁 You've received a gift card from ${from}!`,
                emailContent
            );
        } catch (emailError) {
            console.error('Failed to send gift card email:', emailError);
            // Don't fail the request if email fails, but log it
        }

        res.status(201).json({
            success: true,
            message: 'Gift card created and sent successfully!',
            data: {
                id: giftCard._id,
                from: giftCard.from,
                to: giftCard.to,
                amount: giftCard.amount,
            },
        });
    } catch (error) {
        console.error('Error creating gift card:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// Redeem a gift card (when user clicks on gift link)


// Get user's gifts
export const getUserGifts = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Please log in to view your gifts',
            });
            return;
        }

        const user = await User.findById(userId).populate('gifts');
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: user.gifts,
        });
    } catch (error) {
        console.error('Error fetching user gifts:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};



// Claim a gift card from email link (when user clicks on email link after login)
export const claimGiftFromEmail = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { giftCardId } = req.params;
        const userId = req.user?._id;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Please log in to claim your gift',
            });
            return;
        }

        const giftCard = await GiftCard.findById(giftCardId);
        if (!giftCard) {
            res.status(404).json({
                success: false,
                message: 'Gift card not found',
            });
            return;
        }


        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }

        // Check if gift is for this user's email
        if (giftCard.to !== user.email) {
            res.status(403).json({
                success: false,
                message: 'This gift card is not for your email address',
            });
            return;
        }

        // Add to user's gifts if not already there (don't redeem yet, just claim)
        if (!user.gifts.includes(giftCard._id)) {
            user.gifts.push(giftCard._id);
            await user.save();
        }

        res.status(200).json({
            success: true,
            message: 'Gift card claimed successfully! You can now view it in your profile.',
            data: {
                id: giftCard._id,
                from: giftCard.from,
                to: giftCard.to,
                amount: giftCard.amount,
            },
        });
    } catch (error) {
        console.error('Error claiming gift card:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

