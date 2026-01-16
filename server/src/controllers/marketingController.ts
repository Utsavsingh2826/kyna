import { Request, Response } from 'express';
import MarketingUser from '../models/marketingUser';

export const subscribe = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        // Basic validation
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format' });
        }

        // Check if user already exists
        let user = await MarketingUser.findOne({ email });

        if (user) {
            if (!user.isSubscribed) {
                // Re-subscribe if they had unsubscribed (hypothetically)
                user.isSubscribed = true;
                await user.save();
                return res.status(200).json({ success: true, message: 'Welcome back! You are subscribed again.' });
            }
            return res.status(200).json({ success: true, message: 'You are already subscribed to our newsletter.' });
        }

        // Create new subscriber
        user = new MarketingUser({ email });
        await user.save();

        res.status(201).json({ success: true, message: 'Successfully subscribed to Kyna Jewels newsletter!' });
    } catch (error) {
        console.error('Marketing subscription error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
