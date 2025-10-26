import express, { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { TrackingController } from '../controllers/trackingController';
import { RATE_LIMITS } from '../constants/tracking';

const router: Router = express.Router();

// Rate limiting for tracking endpoints
const trackingRateLimit = rateLimit({
  windowMs: RATE_LIMITS.TRACKING.windowMs,
  max: RATE_LIMITS.TRACKING.max,
  message: {
    success: false,
    error: 'Too many tracking requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General rate limiting
const generalRateLimit = rateLimit({
  windowMs: RATE_LIMITS.GENERAL.windowMs,
  max: RATE_LIMITS.GENERAL.max,
  message: {
    success: false,
    error: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Store controller instance
let trackingController: TrackingController | undefined;

// Function to set controller (called during initialization)
export const setTrackingController = (controller: TrackingController): void => {
  trackingController = controller;
};

// Helper function to get controller or return error
const getController = () => {
  if (!trackingController) {
    throw new Error('Tracking service not initialized');
  }
  return trackingController;
};

// Health check endpoint (no rate limiting)
router.get('/health', (req, res) => {
  try {
    const controller = getController();
    controller.healthCheck(req, res, () => {});
  } catch (error) {
    res.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'KynaJewels Tracking API',
        version: '1.0.0'
      }
    });
  }
});

// Tracking endpoints with rate limiting
router.post('/track', trackingRateLimit, (req, res) => {
  try {
    const controller = getController();
    controller.trackOrder(req, res, () => {});
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'Tracking service not initialized'
    });
  }
});

router.get('/history/:email', generalRateLimit, (req, res) => {
  try {
    const controller = getController();
    controller.getOrderHistory(req, res, () => {});
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'Tracking service not initialized'
    });
  }
});

// Admin endpoints (no rate limiting for now, but should be protected with auth)
router.get('/stats', (req, res) => {
  try {
    const controller = getController();
    controller.getTrackingStats(req, res, () => {});
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'Tracking service not initialized'
    });
  }
});

router.put('/status/:orderNumber', (req, res) => {
  try {
    const controller = getController();
    controller.updateOrderStatus(req, res, () => {});
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'Tracking service not initialized'
    });
  }
});

// Webhook endpoints
router.get('/webhook/config', (req, res) => {
  try {
    const controller = getController();
    controller.getWebhookConfig(req, res, () => {});
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'Tracking service not initialized'
    });
  }
});

router.post('/webhook/test', (req, res) => {
  try {
    const controller = getController();
    controller.testWebhook(req, res, () => {});
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'Tracking service not initialized'
    });
  }
});

// Audit endpoints
router.get('/audit/order/:orderNumber', (req, res) => {
  try {
    const controller = getController();
    controller.getOrderAuditTrail(req, res, () => {});
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'Tracking service not initialized'
    });
  }
});

router.get('/audit/search', (req, res) => {
  try {
    const controller = getController();
    controller.searchAuditLogs(req, res, () => {});
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'Tracking service not initialized'
    });
  }
});

router.get('/audit/stats', (req, res) => {
  try {
    const controller = getController();
    controller.getAuditStats(req, res, () => {});
  } catch (error) {
    res.status(503).json({
      success: false,
      error: 'Tracking service not initialized'
    });
  }
});

// Development only endpoints
if (process.env.NODE_ENV !== 'production') {
  router.post('/test/create-order', (req, res) => {
    try {
      const controller = getController();
      controller.createTestOrder(req, res, () => {});
    } catch (error) {
      res.status(503).json({
        success: false,
        error: 'Tracking service not initialized'
      });
    }
  });
}

export default router;
