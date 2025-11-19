import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { NextFunction, Request, Response } from 'express';
import User from '../models/userModel';
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie';
import {
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from '../services/emailService';
import validator from "validator";
import { deleteImageFromCloudinary, extractPublicIdFromUrl } from "../services/cloudinary";


interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  secondaryEmail?: string;
  phoneNumber?: string;
  phone?: string;
  country?: string;
  state?: string;
  city?: string;
  zipCode?: string;
}
const generateOtpPayload = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return { otp, otpExpires };
};

// Signup with OTP verification
export const signup = async (req: Request, res: Response) => {
  const { email, password, name, referralCode } = req.body;

  try {
    if (!email || !password || !name) {
      throw new Error("All fields are required");
    }

    const userAlreadyExists = await User.findOne({ email });
    console.log("userAlreadyExists", userAlreadyExists);

    if (userAlreadyExists) {
      if (!userAlreadyExists.isVerified) {
        const { otp, otpExpires } = generateOtpPayload();
        userAlreadyExists.otp = otp;
        userAlreadyExists.otpExpires = otpExpires;
        await userAlreadyExists.save();
        await sendVerificationEmail(userAlreadyExists.email, otp);
        return res.status(200).json({
          success: false,
          requiresVerification: true,
          message: "Account already exists but is not verified. We have resent the verification code.",
          user: {
            id: userAlreadyExists._id,
            firstName: userAlreadyExists.firstName,
            lastName: userAlreadyExists.lastName,
            email: userAlreadyExists.email,
          },
        });
      }

      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const { otp, otpExpires } = generateOtpPayload();

    // Split name into firstName and lastName
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    // Create user with unverified status
    const userData: any = {
      email,
      password, // Will be hashed by pre-save hook
      name,
      firstName,
      lastName,
      otp,
      otpExpires,
      isVerified: false, // User must verify email before login
    };
    if (referralCode) {
      userData.referredBy = referralCode;
      userData.refDiscount = 5; // reserve 5% discount for referred user
    }

    const user = new User(userData);

    await user.save();

    // Send OTP email
    await sendVerificationEmail(user.email, otp);

    res.status(201).json({
      success: true,
      requiresVerification: true,
      message: "Registration successful. Please check your email for OTP verification.",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

// OTP verification
export const verifyEmail = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  try {
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const user = await User.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    // Verify the user
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Send welcome email
    await sendWelcomeEmail(user.email, user.name);

    // Generate JWT and set cookie for verified user
    const token = generateTokenAndSetCookie(res, user._id);

    res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now login.",
      token: token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
        role: user.role,
        lastLogin: user.lastLogin,
        isActive: user.isActive,
        availableOffers: user.availableOffers,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
    });
  } catch (error) {
    console.log("error in verifyEmail ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Login with email verification check
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }
    
    if (!user.isVerified) {
      const { otp, otpExpires } = generateOtpPayload();
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();
      await sendVerificationEmail(user.email, otp);

      return res.status(403).json({ 
        success: false,
        requiresVerification: true,
        message: "Please verify your email. We've sent a fresh verification code to your inbox.",
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        }
      });
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
      
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT and set cookie
    const token = generateTokenAndSetCookie(res, user._id);

    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token: token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
        role: user.role,
        lastLogin: user.lastLogin,
        isActive: user.isActive,
        availableOffers: user.availableOffers,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
    });
  } catch (error) {
    console.log("Error in login ", error);
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

// Resend OTP
export const resendOtp = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "Email already verified" });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP email
    await sendVerificationEmail(user.email, otp);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully. Please check your email.",
    });
  } catch (error) {
    console.log("Error in resendOtp ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Logout
export const logout = async (req: Request, res: Response) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

// Forgot password
export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = new Date(resetTokenExpiresAt);
    user.resetPasswordExpires = new Date(resetTokenExpiresAt); // For compatibility

    await user.save();

    // Send reset email
    await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

    res.status(200).json({ success: true, message: "Password reset link sent to your email" });
  } catch (error) {
    console.log("Error in forgotPassword ", error);
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token: resetToken } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }

    // Update password - schema hook handles hashing
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    user.resetPasswordExpires = undefined; // For compatibility
      await user.save();

    await sendResetSuccessEmail(user.email);

    // Generate JWT and set cookie for user after password reset
    const jwtToken = generateTokenAndSetCookie(res, user._id);

    res.status(200).json({ 
      success: true, 
      message: "Password reset successful",
      token: jwtToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
        role: user.role,
        lastLogin: user.lastLogin,
        isActive: user.isActive,
        availableOffers: user.availableOffers,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.log("Error in resetPassword ", error);
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

// Check authentication status
export const checkAuth = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).userId).select("-password");
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error in checkAuth ", error);
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

// Get current user profile
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
        role: user.role,
        lastLogin: user.lastLogin,
        isActive: user.isActive,
        availableOffers: user.availableOffers,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.log("Error in getCurrentUser ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ message: "Authentication required." });
      return;
    }

    // Get user from database
    const user = await User.findById(userId)
      .select("-password -otp -otpExpires -resetPasswordToken -resetPasswordExpires");

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    res.json({ user });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ message: "Server error during profile fetch." });
    next(err);
  }
};

// Update user profile
export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log("👉 [updateProfile] Request received");

  try {
    const userId = (req as any).user?.id;
    console.log("🔹 userId from token:", userId);

    if (!userId) {
      console.warn("⚠ Authentication required — userId missing");
      res.status(401).json({ message: "Authentication required." });
      return;
    }

    const {
      firstName,
      lastName,
      displayName,
      secondaryEmail,
      phoneNumber,
      phone,
      country,
      state,
      city,
      zipCode,
    } = req.body as UpdateProfileRequest;

    console.log("📦 Request body:", {
      firstName,
      lastName,
      displayName,
      secondaryEmail,
      phoneNumber,
      phone,
      country,
      state,
      city,
      zipCode,
    });

    // Get the uploaded file (if any) from multer
    const profileImageFile = (req as any).file;
    console.log("🖼 Uploaded file info:", profileImageFile ? {
      originalname: profileImageFile.originalname,
      mimetype: profileImageFile.mimetype,
      size: profileImageFile.size,
      path: profileImageFile.path // Cloudinary URL
    } : "No file uploaded");

    // Validate secondary email if provided
    if (secondaryEmail && !validator.isEmail(secondaryEmail)) {
      console.warn("⚠ Invalid secondary email:", secondaryEmail);
      res.status(400).json({ message: "Invalid secondary email address." });
      return;
    }

    // Get current user to handle profile image updates
    const currentUser = await User.findById(userId);
    console.log("👤 Current user fetched:", currentUser ? "found" : "not found");

    if (!currentUser) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    // Build update object with only provided fields
    const updateData: Partial<UpdateProfileRequest & { profileImage?: string }> = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (displayName !== undefined) updateData.displayName = displayName;
    if (secondaryEmail !== undefined) {
      updateData.secondaryEmail = validator.normalizeEmail(secondaryEmail) || secondaryEmail;
    }
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (phone !== undefined) updateData.phone = phone;
    if (country !== undefined) updateData.country = country;
    if (state !== undefined) updateData.state = state;
    if (city !== undefined) updateData.city = city;
    if (zipCode !== undefined) updateData.zipCode = zipCode;

    console.log("📝 Data to update:", updateData);

    // Handle profile image upload
    let newProfileImageUrl = currentUser.profileImage;

    try {
      if (profileImageFile && profileImageFile.path) {
        console.log("📤 Processing new profile image from Cloudinary");

        // Delete old image if it exists
        if (currentUser.profileImage) {
          const oldPublicId = extractPublicIdFromUrl(currentUser.profileImage);
          if (oldPublicId) {
            console.log("🗑 Deleting old image from Cloudinary:", oldPublicId);
            await deleteImageFromCloudinary(oldPublicId);
          }
        }

        // Use the Cloudinary URL provided by multer
        newProfileImageUrl = profileImageFile.path;
        updateData.profileImage = newProfileImageUrl;
        console.log("✅ New profile image URL:", newProfileImageUrl);
      } else {
        console.log("ℹ No new image uploaded — keeping current image");
      }
    } catch (imageError) {
      console.error("❌ Image upload/delete error:", imageError);
      res.status(500).json({ message: "Error processing profile image. Please try again." });
      return;
    }

    // Update user in database
    console.log("💾 Saving user update to database...");
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password -otp -otpExpires -resetPasswordToken -resetPasswordExpires");

    console.log("📡 Updated user:", updatedUser ? "success" : "not found");

    if (!updatedUser) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    console.log("🎉 Profile updated successfully for user:", updatedUser._id);

    res.json({
      message: "Profile updated successfully.",
      user: updatedUser,
      profileImage: newProfileImageUrl,
    });
  } catch (err) {
    console.error("💥 Profile update error:", err);
    if (err instanceof Error && (err as any).name === "ValidationError") {
      res.status(400).json({
        message: "Validation error",
        details: (err as any).message,
      });
      return;
    }
    res.status(500).json({ message: "Server error during profile update." });
    next(err);
  }
};
