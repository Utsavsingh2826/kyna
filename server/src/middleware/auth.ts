import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/userModel';
import { AuthRequest } from '../types';

interface JwtPayload {
  id: string;
  userId: string;
}

// Enhanced token authentication middleware - supports both cookies and headers
export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // First try to get token from cookies (preferred method for new auth system)
    let token = req.cookies?.token;
    
    // Fallback to Authorization header if no cookie
    if (!token) {
      const authHeader = req.headers['authorization'];
      token = authHeader?.split(' ')[1]; // Bearer TOKEN
    }

    if (!token) {
      res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
      return;
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not configured');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    
    // Find user and attach to request
    const user = await User.findById(decoded.userId).select('-passwordHash -password -otp -otpExpires -resetPasswordToken -resetPasswordExpires');
    if (!user) {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid token - user not found' 
      });
      return;
    }

    req.user = user;
    req.userId = decoded.userId;
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(403).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

// Legacy verifyToken function for backward compatibility
export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  // Use the enhanced authenticateToken function
  return authenticateToken(req, res, next);
};

export const checkAuth = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id).select('-passwordHash');
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.json({ user });
  } catch (err) {
    console.error('Auth check error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
