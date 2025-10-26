import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createCustomizationRequest,
  createCustomizationRequestWithPayment,
  getMyCustomizationRequests,
  getCustomizationRequest,
  addMessageToRequest,
  cancelCustomizationRequest,
  getAllCustomizationRequests,
  updateCustomizationRequestStatus,
  addAdminMessage
} from '../controllers/customizationController';

const router = express.Router();

// User routes (require authentication)
router.post('/request', authenticateToken, createCustomizationRequest);
router.post('/request-with-payment', authenticateToken, createCustomizationRequestWithPayment);
router.get('/my-requests', authenticateToken, getMyCustomizationRequests);
router.get('/request/:requestId', authenticateToken, getCustomizationRequest);
router.post('/request/:requestId/message', authenticateToken, addMessageToRequest);
router.patch('/request/:requestId/cancel', authenticateToken, cancelCustomizationRequest);

// Admin routes (require authentication + admin role)
router.get('/admin/all', authenticateToken, getAllCustomizationRequests);
router.patch('/admin/request/:requestId/status', authenticateToken, updateCustomizationRequestStatus);
router.post('/admin/request/:requestId/message', authenticateToken, addAdminMessage);

export default router;
