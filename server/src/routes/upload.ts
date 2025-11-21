import express, { Request, Response } from "express";
import upload from "../middleware/upload";

const router = express.Router();

/**
 * POST /api/upload/engraving
 * Upload engraving image to Cloudinary via backend with text and motif path
 */
router.post(
  "/engraving",
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      console.log("🎨 Engraving upload request received");
      console.log("📝 Request body:", req.body);

      if (!req.file) {
        console.log("❌ No engraving image file uploaded");
        return res.status(400).json({
          success: false,
          message: "Engraving image is required",
        });
      }

      // Extract additional engraving data from form
      const { text, motifPath } = req.body;

      console.log("📁 Engraving file received:", {
        originalname: req.file.originalname,
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
      });

      console.log("📝 Engraving data:", {
        text: text || "No text provided",
        motifPath: motifPath || "No motif provided",
      });

      // The upload middleware already handles Cloudinary upload
      // Return the Cloudinary URL along with the engraving data
      res.status(200).json({
        success: true,
        message: "Engraving uploaded successfully",
        data: {
          imageUrl: req.file.path, // Cloudinary URL
          publicId: req.file.filename || `engraving_${Date.now()}`,
          originalName: req.file.originalname,
          text: text || "",
          motifPath: motifPath || "",
        },
      });
    } catch (error) {
      console.error("❌ Engraving upload error:", error);
      res.status(500).json({
        success: false,
        message: "Error uploading engraving image",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

export default router;
