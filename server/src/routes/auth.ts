import express from "express";
import { verifyToken, checkAuth } from "../middleware/auth";
import { uploadProfileImage, handleProfileUploadError } from "../middleware/profileUpload";
import {
  signup,
  login,
  logout,
  verifyEmail,
  resendOtp,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
} from "../controllers/authController";

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Protected routes
router.get("/check-auth", verifyToken, checkAuth);
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, uploadProfileImage, handleProfileUploadError, updateProfile);

export default router;
