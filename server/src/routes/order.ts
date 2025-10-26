import { Router } from 'express';
import { 
  createOrder,
  createDirectOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  cancelOrderWithCleanup,
  adminCancelOrder,
  getAllOrders,
  updateOrderStatus,
  shipOrder,
  bulkShipOrders,
  bulkUpdateOrderStatus,
  getOrdersReadyForShipping,
  getOrderStats,
  trackOrder,
  handleFailedPayment
} from '../controllers/orderController';
import { verifyToken } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/track', trackOrder); // Track order without authentication
router.post('/failed-payment', handleFailedPayment); // Handle failed payment notifications

// Protected routes (require authentication)
router.use(verifyToken);

// Customer routes
router.post('/', createOrder); // Create order from cart
router.post('/direct', createDirectOrder); // Create order directly (buy now)
router.get('/my', getMyOrders); // Get user's orders
router.get('/:orderId', getOrderById); // Get specific order details
router.patch('/:orderId/cancel', cancelOrderWithCleanup); // Cancel order with tracking cleanup

// Admin routes
router.get('/admin/all', getAllOrders); // Get all orders (admin only)
router.patch('/admin/:orderId/status', updateOrderStatus); // Update order status (admin only)
router.post('/admin/:orderId/ship', shipOrder); // Ship order with docket number (admin only)
router.post('/admin/bulk/ship', bulkShipOrders); // Bulk ship orders (admin only)
router.patch('/admin/bulk/status', bulkUpdateOrderStatus); // Bulk update order status (admin only)
router.patch('/admin/:orderId/cancel', adminCancelOrder); // Admin cancel order with tracking cleanup
router.get('/admin/ready-for-shipping', getOrdersReadyForShipping); // Get orders ready for shipping (admin only)
router.get('/admin/stats', getOrderStats); // Get order statistics (admin only)

export default router;