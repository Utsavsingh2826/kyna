import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateProductStatus,
  getProductStats,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats,
  getOrdersByCustomer,
  getTrackingDashboard,
  getTrackingManagementTools,
  getTrackingAnalytics,
  getSystemHealth,
  getTrackingConfiguration,
  getAdvancedAnalytics,
  getRealTimeStats,
  generateTrackingReport,
  requireAdmin
} from '../controllers/adminController';

const router = Router();

// Apply authentication and admin middleware to all routes
router.use(authenticateToken);
// router.use(requireAdmin);

// Product CRUD routes
router.post('/products', createProduct);
router.get('/products', getAllProducts);
router.get('/products/stats', getProductStats);
router.get('/products/:id', getProductById);
router.put('/products/:id', updateProduct);
router.patch('/products/:id/status', updateProductStatus);
router.delete('/products/:id', deleteProduct);

// Order Management routes
router.get('/orders', getAllOrders);
router.get('/orders/stats', getOrderStats);
router.get('/orders/:id', getOrderById);
router.patch('/orders/:id/status', updateOrderStatus);
router.get('/orders/customer/:customerId', getOrdersByCustomer);

// Tracking dashboard
router.get('/tracking/dashboard', getTrackingDashboard);
router.get('/tracking/management', getTrackingManagementTools);
router.get('/tracking/analytics', getTrackingAnalytics);
router.get('/tracking/analytics/advanced', getAdvancedAnalytics);
router.get('/tracking/analytics/realtime', getRealTimeStats);
router.post('/tracking/analytics/report', generateTrackingReport);
router.get('/system/health', getSystemHealth);
router.get('/tracking/config', getTrackingConfiguration);

export default router;
