import { Request, Response } from 'express';
import Product from '../models/productModel';
import OrderModel from '../models/orderModel';
import User from '../models/userModel';
import { TrackingOrder } from '../models/TrackingOrder';
import { AuditLog } from '../models/AuditLog';
import { OrderStatus } from '../types/tracking';
import { logInfo, logError } from '../utils/tracking';
import { AnalyticsService, createAnalyticsService, AnalyticsPeriod } from '../services/AnalyticsService';
import { productService } from '../services/productService';
import { ImageService } from '../services/imageService';
import { pricingService } from '../services/pricingService';

interface AuthRequest extends Request {
  user?: {
    _id: string;
    email: string;
    role: string;
  };
}

// Admin middleware to check if user is admin
export const requireAdmin = (req: any, res: Response, next: any) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

// =====================
// PRODUCT MANAGEMENT
// =====================

// Create a new product
export const createProduct = async (req: Request, res: Response) => {
  try {
    const productData = req.body;

    // Validate required fields
    if (!productData.name || !productData.price) {
      return res.status(400).json({
        success: false,
        message: 'Product name and price are required'
      });
    }

    // Create product using service
    const product = await productService.createProduct(productData);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get all products with pagination and filtering
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string;
    const search = req.query.search as string;
    const status = req.query.status as string;

    const products = await productService.getAllProducts({
      page,
      limit,
      category,
      search,
      status
    });

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get product by ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await productService.updateProduct(id, updateData);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await productService.deleteProduct(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update product status
export const updateProductStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const product = await productService.updateProductStatus(id, status);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product status updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Error updating product status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get product statistics
export const getProductStats = async (req: Request, res: Response) => {
  try {
    const stats = await productService.getProductStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching product stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// =====================
// ORDER MANAGEMENT
// =====================

// Get all orders
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const customerId = req.query.customerId as string;

    const orders = await OrderModel.find({
      ...(status && { status }),
      ...(customerId && { user: customerId })
    })
    .populate('user', 'firstName lastName email')
    .populate('items.product', 'name price')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

    const total = await OrderModel.countDocuments({
      ...(status && { status }),
      ...(customerId && { user: customerId })
    });

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get order by ID
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await OrderModel.findById(id)
      .populate('user', 'firstName lastName email phone')
      .populate('items.product', 'name price images');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update order status
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const order = await OrderModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('user', 'firstName lastName email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get order statistics
export const getOrderStats = async (req: Request, res: Response) => {
  try {
    const totalOrders = await OrderModel.countDocuments();
    const pendingOrders = await OrderModel.countDocuments({ status: 'pending' });
    const completedOrders = await OrderModel.countDocuments({ status: 'delivered' });
    const cancelledOrders = await OrderModel.countDocuments({ status: 'cancelled' });

    const totalRevenue = await OrderModel.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.json({
      success: true,
      data: {
          totalOrders,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get orders by customer
export const getOrdersByCustomer = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const orders = await OrderModel.find({ user: customerId })
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await OrderModel.countDocuments({ user: customerId });

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer orders',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// =====================
// TRACKING MANAGEMENT
// =====================

/**
 * Get comprehensive tracking dashboard data
 */
export const getTrackingDashboard = async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const totalOrders = await TrackingOrder.countDocuments();
    const pendingOrders = await TrackingOrder.countDocuments({ status: OrderStatus.ORDER_PLACED });
    const inTransitOrders = await TrackingOrder.countDocuments({ status: OrderStatus.IN_TRANSIT });
    const deliveredOrders = await TrackingOrder.countDocuments({ status: OrderStatus.DELIVERED });
    const cancelledOrders = await TrackingOrder.countDocuments({ status: OrderStatus.CANCELLED });

    const recentOrders = await TrackingOrder.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('orderId', 'orderNumber totalAmount');

    res.json({
      success: true,
      data: {
        summary: {
        totalOrders,
          pendingOrders,
          inTransitOrders,
          deliveredOrders,
          cancelledOrders
        },
        recentOrders
      }
    });
  } catch (error) {
    console.error('Error fetching tracking dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tracking dashboard',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get tracking management tools
 */
export const getTrackingManagementTools = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const ordersNeedingUpdate = await TrackingOrder.find({
      status: { $nin: [OrderStatus.DELIVERED, OrderStatus.CANCELLED] },
      docketNumber: { $exists: true, $ne: null }
    }).limit(50);

    res.json({
      success: true,
      data: {
        ordersNeedingUpdate,
        count: ordersNeedingUpdate.length
      }
    });
  } catch (error) {
    console.error('Error fetching tracking management tools:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tracking management tools',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get tracking analytics
 */
export const getTrackingAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const period = req.query.period as string || 'LAST_30_DAYS';
    const analyticsService = createAnalyticsService();
    const periodObj: AnalyticsPeriod = {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      period: 'daily'
    };
    const analytics = await analyticsService.getTrackingAnalytics(periodObj);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching tracking analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tracking analytics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get system health
 */
export const getSystemHealth = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: {
        connected: true,
        totalOrders: await TrackingOrder.countDocuments(),
        totalAuditLogs: await AuditLog.countDocuments()
      }
    };

    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    console.error('Error fetching system health:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system health',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get tracking configuration
 */
export const getTrackingConfiguration = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const config = {
      sequel247: {
        endpoint: process.env.SEQUEL247_TEST_ENDPOINT || process.env.SEQUEL247_PROD_ENDPOINT,
        storeCode: process.env.SEQUEL247_STORE_CODE,
        environment: process.env.NODE_ENV
      },
      cron: {
        enabled: true,
        frequency: 'Every 30 minutes'
      }
    };

    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error fetching tracking configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tracking configuration',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get advanced analytics
 */
export const getAdvancedAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const analyticsService = createAnalyticsService();
    const advancedAnalytics = await analyticsService.getAdvancedAnalytics();

    res.json({
      success: true,
      data: advancedAnalytics
    });
  } catch (error) {
    console.error('Error fetching advanced analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch advanced analytics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get real-time stats
 */
export const getRealTimeStats = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const stats = {
      timestamp: new Date().toISOString(),
      activeOrders: await TrackingOrder.countDocuments({
        status: { $nin: [OrderStatus.DELIVERED, OrderStatus.CANCELLED] }
      }),
      recentUpdates: await TrackingOrder.find({
        updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }).countDocuments()
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching real-time stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch real-time stats',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Generate tracking report
 */
export const generateTrackingReport = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { startDate, endDate, format = 'json' } = req.body;

    const analyticsService = createAnalyticsService();
    const report = await analyticsService.generateReport(
      new Date(startDate),
      new Date(endDate),
      format
    );

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error generating tracking report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate tracking report',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
