import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Ring, { RingStatus } from '../models/Ring';
import upload from '../middleware/upload';

const router = express.Router();

/**
 * POST /api/rings/upload
 * Upload images for custom ring design
 */
router.post('/upload', upload.array('images', 10), async (req: Request, res: Response) => {
  try {
    const { sameAsImage, modificationRequest, description, userId } = req.body;
    
    if (!req.files || (req.files as Express.Multer.File[]).length < 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least 2 images are required' 
      });
    }

    // Generate userId if not provided (for demo purposes)
    const currentUserId = userId || `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Process uploaded files with user information
    const imageData = (req.files as Express.Multer.File[]).map(file => ({
      url: file.path,
      publicId: file.filename,
      userId: currentUserId,
      uploadedAt: new Date()
    }));

    const ringData: any = {
      userId: currentUserId,
      images: imageData,
      sameAsImage: sameAsImage === 'true',
      status: sameAsImage === 'true' ? RingStatus.PAYMENT_PENDING : RingStatus.CUSTOMIZED
    };

    // Add modification request and description if provided
    if (modificationRequest) {
      ringData.customization = {
        modificationRequest,
        description
      };
    }

    const ring = new Ring(ringData);
    await ring.save();

    res.status(201).json({
      success: true,
      message: 'Images uploaded successfully',
      data: {
        ringId: ring._id,
        userId: ring.userId,
        images: ring.images.map(img => img.url), // Return just URLs for frontend compatibility
        sameAsImage: ring.sameAsImage,
        status: ring.status
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error uploading images',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/rings/customize
 * Save customization details for a ring
 */
router.post('/customize', [
  body('ringId').notEmpty().withMessage('Ring ID is required'),
  body('customization.metal').optional().isIn(['Gold', 'Silver', 'Platinum', 'Rose Gold', 'White Gold']),
  body('customization.goldKarat').optional().isIn(['10KT', '14KT', '18KT', '22KT']),
  body('customization.diamondShape').optional().isIn(['Round', 'Oval', 'Cushion', 'Pear', 'Princess', 'Emerald', 'Radiant', 'Heart', 'Marquise']),
  body('customization.engraving').optional().isLength({ max: 15 }).withMessage('Engraving must be 15 characters or less'),
  body('customization.modificationRequest').optional().isLength({ min: 15 }).withMessage('Modification request must be at least 15 characters'),
  body('customization.description').optional().isLength({ max: 500 }).withMessage('Description must be 500 characters or less')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { ringId, customization } = req.body;

    const ring = await Ring.findById(ringId);
    if (!ring) {
      return res.status(404).json({
        success: false,
        message: 'Ring not found'
      });
    }

    ring.customization = { ...ring.customization, ...customization };
    ring.status = RingStatus.PAYMENT_PENDING;
    await ring.save();

    res.json({
      success: true,
      message: 'Customization saved successfully',
      data: ring
    });
  } catch (error) {
    console.error('Customization error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving customization',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/rings/user/:userId
 * Get all rings for a specific user
 */
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const rings = await Ring.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: rings
    });
  } catch (error) {
    console.error('Get user rings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user rings',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/rings/:id
 * Get ring details by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const ring = await Ring.findById(req.params.id);
    if (!ring) {
      return res.status(404).json({
        success: false,
        message: 'Ring not found'
      });
    }

    res.json({
      success: true,
      data: ring
    });
  } catch (error) {
    console.error('Get ring error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ring details',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/rings/:id/payment
 * Process payment for a ring (placeholder - integrates with CCAvenue)
 */
router.post('/:id/payment', async (req: Request, res: Response) => {
  try {
    const ring = await Ring.findById(req.params.id);
    if (!ring) {
      return res.status(404).json({
        success: false,
        message: 'Ring not found'
      });
    }

    // Update ring status to completed (payment processed)
    ring.status = RingStatus.COMPLETED;
    await ring.save();

    res.json({
      success: true,
      message: 'Payment processed successfully',
      data: ring
    });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing payment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
