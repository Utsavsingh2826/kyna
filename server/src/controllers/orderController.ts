import { Request, Response } from 'express';
import { AuthRequest, IOrder } from '../types';
import { OrderStatus } from '../types/tracking';
import OrderModel from '../models/orderModel';
import Cart from '../models/cartModel';
import Product from '../models/productModel';
import User from '../models/userModel';
import nodemailer from 'nodemailer';

interface TrackOrderRequest {
  orderNumber: string;
  billingAddress: string;
}

// POST /api/track-order
// Body: { orderNumber, billingAddress }
// Returns: order tracking details
export const trackOrder = async (req: Request, res: Response): Promise<Response> => {
  const { orderNumber, billingAddress } = req.body as TrackOrderRequest;

  if (!orderNumber || !billingAddress) {
    return res.status(400).json({ error: 'Order number and billing address are required.' });
  }

  try {
    const order = await OrderModel.findOne({ orderNumber, billingAddress });

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    return res.json({
      orderNumber: order.orderNumber,
      amount: order.totalAmount,
      products: order.items,
      status: order.orderStatus,
      expectedArrival: order.estimatedDeliveryDate,
      activities: order.statusHistory,
      createdAt: order.createdAt,
    });
  } catch (err) {
    console.error('trackOrder error:', err);
    return res.status(500).json({ error: 'Server error.' });
  }
};

// Generate unique order number
const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD${timestamp.slice(-6)}${random}`;
};

// Calculate GST (18% for jewelry in India)
const calculateGST = (subtotal: number): number => {
  return Math.round((subtotal * 0.18) * 100) / 100;
};

// Create order directly with items (buy now functionality)
export const createDirectOrder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items are required' });
    }

    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({
        message: 'Shipping address and payment method are required'
      });
    }

    // Validate and prepare order items
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          message: `Product not found: ${item.productId}`
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        productModel: 'Product',
        quantity: item.quantity,
        price: product.price,
        total: itemTotal
      });
    }

    // Calculate totals
    const gst = calculateGST(subtotal);
    const shippingCharge = subtotal > 5000 ? 0 : 200;
    const totalAmount = subtotal + gst + shippingCharge;

    // Create order
    const order = new OrderModel({
      user: userId,
      orderNumber: generateOrderNumber(),
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'pending',
      subtotal,
      gst,
      shippingCharge,
      totalAmount,
      estimatedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      statusHistory: [{
        status: 'pending',
        date: new Date(),
        note: 'Order placed successfully'
      }]
    });

    await order.save();
    await order.populate('items.product');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    console.error('Create direct order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
};

// Create order from cart
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { shippingAddress, paymentMethod } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({
        message: 'Shipping address and payment method are required'
      });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate totals
    const subtotal = cart.totalAmount;
    const gst = calculateGST(subtotal);
    const shippingCharge = subtotal > 5000 ? 0 : 200; // Free shipping above ₹5000
    const totalAmount = subtotal + gst + shippingCharge;

    // Prepare order items
    const orderItems = cart.items.map(item => {
      // Handle both populated and non-populated product references
      const productId = typeof item.product === 'string' ? item.product : item.product._id;
      return {
        product: productId,
        productModel: 'Product', // Default model
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity
      };
    });

    // Create order
    const order = new OrderModel({
      user: userId,
      orderNumber: generateOrderNumber(),
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'pending',
      subtotal,
      gst,
      shippingCharge,
      totalAmount,
      estimatedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      statusHistory: [{
        status: 'pending',
        date: new Date(),
        note: 'Order placed successfully'
      }]
    });

    await order.save();

    // Clear cart after successful order
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    // Populate order for response
    await order.populate('items.product');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
};

// Get user's orders
export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { page = 1, limit = 10, status } = req.query;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const query: any = { user: userId };
    if (status) {
      query.orderStatus = status;
    }

    const orders = await OrderModel.find(query)
      .populate('items.product')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    // Add tracking information to each order
    const ordersWithTracking = await Promise.all(
      orders.map(async (order) => {
        try {
          // Import TrackingOrder dynamically to avoid circular dependency
          const { TrackingOrder } = await import('../models/TrackingOrder');
          
          const tracking = await TrackingOrder.findOne({ 
            orderNumber: order.orderNumber 
          });
          
          if (tracking) {
            order.trackingInfo = {
              docketNumber: tracking.docketNumber,
              status: tracking.status,
              estimatedDelivery: tracking.estimatedDelivery?.toString(),
              trackingHistory: tracking.trackingHistory,
              hasTracking: true
            };
          } else {
            order.trackingInfo = {
              hasTracking: false
            };
          }
          
          return order;
        } catch (error) {
          console.error(`Error adding tracking info for order ${order.orderNumber}:`, error);
          order.trackingInfo = {
            hasTracking: false,
            error: 'Failed to load tracking information'
          };
          return order;
        }
      })
    );

    const totalOrders = await OrderModel.countDocuments(query);

    res.json({
      success: true,
      data: ordersWithTracking,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalOrders / Number(limit)),
        totalOrders,
        hasNext: Number(page) * Number(limit) < totalOrders,
        hasPrev: Number(page) > 1
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

// Get single order details
export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { orderId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const order = await OrderModel.findOne({
      _id: orderId,
      user: userId
    }).populate('items.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Add tracking information
    try {
      const { TrackingOrder } = await import('../models/TrackingOrder');
      
      const tracking = await TrackingOrder.findOne({ 
        orderNumber: order.orderNumber 
      });
      
      if (tracking) {
        order.trackingInfo = {
          docketNumber: tracking.docketNumber,
          status: tracking.status,
          estimatedDelivery: tracking.estimatedDelivery?.toString(),
          trackingHistory: tracking.trackingHistory,
          hasTracking: true
        };
      } else {
        order.trackingInfo = {
          hasTracking: false
        };
      }
    } catch (error) {
      console.error(`Error adding tracking info for order ${order.orderNumber}:`, error);
      order.trackingInfo = {
        hasTracking: false,
        error: 'Failed to load tracking information'
      };
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    });
  }
};

// Cancel order
export const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { orderId } = req.params;
    const { reason } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const order = await OrderModel.findOne({
      _id: orderId,
      user: userId
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order can be cancelled
    if (['shipped', 'delivered', 'cancelled', 'returned'].includes(order.orderStatus)) {
      return res.status(400).json({
        message: `Cannot cancel order with status: ${order.orderStatus}`
      });
    }

    // Update order status
    order.orderStatus = 'cancelled';
    order.cancelledAt = new Date();
    order.statusHistory?.push({
      status: 'cancelled',
      date: new Date(),
      note: reason || 'Order cancelled by customer'
    });

    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order'
    });
  }
};

// Admin: Get all orders
export const getAllOrders = async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { page = 1, limit = 20, status, search } = req.query;
    const query: any = {};

    if (status) {
      query.orderStatus = status;
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.city': { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await OrderModel.find(query)
      .populate('user', 'firstName lastName email')
      .populate('items.product')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const totalOrders = await OrderModel.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalOrders / Number(limit)),
        totalOrders,
        hasNext: Number(page) * Number(limit) < totalOrders,
        hasPrev: Number(page) > 1
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

// Admin: Update order status
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { orderId } = req.params;
    const { status, note, trackingNumber, courierService } = req.body;

    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update order status
    order.orderStatus = status;

    // Update specific timestamps based on status
    if (status === 'shipped') {
      order.shippedAt = new Date();
      if (trackingNumber) order.trackingNumber = trackingNumber;
      if (courierService) order.courierService = courierService;
    } else if (status === 'delivered') {
      order.deliveredAt = new Date();
    } else if (status === 'cancelled') {
      order.cancelledAt = new Date();
    } else if (status === 'returned') {
      order.returnedAt = new Date();
    }

    // Add to status history
    order.statusHistory?.push({
      status,
      date: new Date(),
      note: note || `Order status updated to ${status}`
    });

    await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
};

// Admin: Ship order with docket number assignment
export const shipOrder = async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { orderId } = req.params;
    const { docketNumber, courierService } = req.body;

    if (!docketNumber) {
      return res.status(400).json({ 
        success: false,
        message: 'Docket number is required for shipping' 
      });
    }

    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Update order status to shipped
    order.orderStatus = 'shipped';
    order.trackingNumber = docketNumber;
    order.courierService = courierService || 'Sequel247';
    order.shippedAt = new Date();

    // Add to status history
    order.statusHistory?.push({
      status: 'shipped',
      date: new Date(),
      note: `Order shipped with docket number: ${docketNumber}`
    });

    await order.save();

    // Create tracking record
    try {
      // Import TrackingService dynamically to avoid circular dependency
      const { TrackingService } = await import('../services/TrackingService');
      const { createSequel247Service } = await import('../services/Sequel247Service');
      const trackingTypes = await import('../types/tracking');

      // Create Sequel247 service instance
      const sequelConfig: any = {
        endpoint: process.env.NODE_ENV === "production"
          ? process.env.SEQUEL247_PROD_ENDPOINT || "https://sequel247.com/"
          : process.env.SEQUEL247_TEST_ENDPOINT || "https://test.sequel247.com/",
        token: process.env.NODE_ENV === "production"
          ? process.env.SEQUEL247_PROD_TOKEN || ""
          : process.env.SEQUEL247_TEST_TOKEN || "",
        storeCode: process.env.SEQUEL247_STORE_CODE || "BLRAK",
      };

      const sequelService = createSequel247Service(sequelConfig);
      const trackingService = new TrackingService(sequelService);

      // Create tracking record
      const trackingOrder = await trackingService.createTrackingFromOrder(orderId, docketNumber);

      // Log audit trail for shipping
      try {
        const { AuditService } = await import('../services/AuditService');
        const auditService = new AuditService();
        await auditService.logOrderShipped(
          orderId,
          order.orderNumber,
          docketNumber,
          {
            userId: req.user?._id,
            userEmail: req.user?.email,
            userRole: req.user?.role,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            reason: 'Order shipped by admin'
          }
        );
      } catch (auditError) {
        console.error('Failed to log audit trail:', auditError);
        // Don't fail the request if audit logging fails
      }

      // Send shipping notification
      try {
        const { NotificationService } = await import('../services/NotificationService');
        const notificationService = new NotificationService();
        await notificationService.sendOrderShippedNotification(order, docketNumber);
      } catch (notificationError) {
        console.error('Failed to send shipping notification:', notificationError);
        // Don't fail the request if notification fails
      }

      res.json({
        success: true,
        message: 'Order shipped successfully with tracking',
        data: {
          order: order,
          tracking: trackingOrder
        }
      });

    } catch (trackingError) {
      console.error('Failed to create tracking record:', trackingError);
      
      // Still return success for order update, but mention tracking issue
      res.json({
        success: true,
        message: 'Order shipped successfully, but tracking setup failed',
        warning: 'Tracking record could not be created. Please create manually.',
        data: {
          order: order
        }
      });
    }

  } catch (error) {
    console.error('Ship order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to ship order'
    });
  }
};

// Admin: Bulk ship orders
export const bulkShipOrders = async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { orders } = req.body; // Array of { orderId, docketNumber, courierService }

    if (!Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Orders array is required and cannot be empty' 
      });
    }

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const orderData of orders) {
      try {
        const { orderId, docketNumber, courierService } = orderData;

        if (!orderId || !docketNumber) {
          results.push({
            orderId,
            success: false,
            error: 'Order ID and docket number are required'
          });
          errorCount++;
          continue;
        }

        const order = await OrderModel.findById(orderId);
        if (!order) {
          results.push({
            orderId,
            success: false,
            error: 'Order not found'
          });
          errorCount++;
          continue;
        }

        // Update order status to shipped
        order.orderStatus = 'shipped';
        order.trackingNumber = docketNumber;
        order.courierService = courierService || 'Sequel247';
        order.shippedAt = new Date();

        // Add to status history
        order.statusHistory?.push({
          status: 'shipped',
          date: new Date(),
          note: `Order shipped with docket number: ${docketNumber}`
        });

        await order.save();

        // Create tracking record
        try {
          const { TrackingService } = await import('../services/TrackingService');
          const { createSequel247Service } = await import('../services/Sequel247Service');
          const trackingTypes = await import('../types/tracking');

          const sequelConfig: any = {
            endpoint: process.env.NODE_ENV === "production"
              ? process.env.SEQUEL247_PROD_ENDPOINT || "https://sequel247.com/"
              : process.env.SEQUEL247_TEST_ENDPOINT || "https://test.sequel247.com/",
            token: process.env.NODE_ENV === "production"
              ? process.env.SEQUEL247_PROD_TOKEN || ""
              : process.env.SEQUEL247_TEST_TOKEN || "",
            storeCode: process.env.SEQUEL247_STORE_CODE || "BLRAK",
          };

          const sequelService = createSequel247Service(sequelConfig);
          const trackingService = new TrackingService(sequelService);

          const trackingOrder = await trackingService.createTrackingFromOrder(orderId, docketNumber);

          results.push({
            orderId,
            orderNumber: order.orderNumber,
            success: true,
            docketNumber,
            tracking: trackingOrder
          });
          successCount++;

        } catch (trackingError) {
          console.error(`Failed to create tracking record for order ${orderId}:`, trackingError);
          results.push({
            orderId,
            orderNumber: order.orderNumber,
            success: true,
            warning: 'Order shipped but tracking setup failed',
            docketNumber
          });
          successCount++;
        }

      } catch (error) {
        console.error(`Failed to ship order ${orderData.orderId}:`, error);
        results.push({
          orderId: orderData.orderId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        errorCount++;
      }
    }

    res.json({
      success: true,
      message: `Bulk ship completed: ${successCount} successful, ${errorCount} failed`,
      data: {
        totalOrders: orders.length,
        successCount,
        errorCount,
        results
      }
    });

  } catch (error) {
    console.error('Bulk ship orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process bulk ship orders'
    });
  }
};

// Admin: Bulk update order status
export const bulkUpdateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { orders, status, note } = req.body; // Array of orderIds and new status

    if (!Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Orders array is required and cannot be empty' 
      });
    }

    if (!status) {
      return res.status(400).json({ 
        success: false,
        message: 'Status is required' 
      });
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const orderId of orders) {
      try {
        const order = await OrderModel.findById(orderId);
        if (!order) {
          results.push({
            orderId,
            success: false,
            error: 'Order not found'
          });
          errorCount++;
          continue;
        }

        const previousStatus = order.orderStatus;
        order.orderStatus = status;

        // Update specific timestamps based on status
        if (status === 'shipped' && !order.shippedAt) {
          order.shippedAt = new Date();
        } else if (status === 'delivered' && !order.deliveredAt) {
          order.deliveredAt = new Date();
        } else if (status === 'cancelled' && !order.cancelledAt) {
          order.cancelledAt = new Date();
        }

        // Add to status history
        order.statusHistory?.push({
          status: status,
          date: new Date(),
          note: note || `Status updated from ${previousStatus} to ${status}`
        });

        await order.save();

        results.push({
          orderId,
          orderNumber: order.orderNumber,
          success: true,
          previousStatus,
          newStatus: status
        });
        successCount++;

      } catch (error) {
        console.error(`Failed to update order ${orderId}:`, error);
        results.push({
          orderId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        errorCount++;
      }
    }

    res.json({
      success: true,
      message: `Bulk status update completed: ${successCount} successful, ${errorCount} failed`,
      data: {
        totalOrders: orders.length,
        successCount,
        errorCount,
        status,
        results
      }
    });

  } catch (error) {
    console.error('Bulk update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process bulk status update'
    });
  }
};

// Admin: Get orders ready for shipping
export const getOrdersReadyForShipping = async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { page = 1, limit = 50, status = 'processing' } = req.query;

    const query: any = { 
      orderStatus: status,
      trackingNumber: { $exists: false } // Orders without tracking numbers
    };

    const orders = await OrderModel.find(query)
      .populate('user', 'firstName lastName email phone')
      .populate('items.product')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const totalOrders = await OrderModel.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalOrders / Number(limit)),
        totalOrders,
        hasNext: Number(page) * Number(limit) < totalOrders,
        hasPrev: Number(page) > 1
      }
    });

  } catch (error) {
    console.error('Get orders ready for shipping error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders ready for shipping'
    });
  }
};

// Enhanced cancel order with tracking cleanup
export const cancelOrderWithCleanup = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { orderId } = req.params;
    const { reason } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const order = await OrderModel.findOne({
      _id: orderId,
      user: userId
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order can be cancelled
    if (order.orderStatus === 'delivered') {
      return res.status(400).json({ 
        message: 'Cannot cancel delivered order' 
      });
    }

    if (order.orderStatus === 'cancelled') {
      return res.status(400).json({ 
        message: 'Order is already cancelled' 
      });
    }

    const previousStatus = order.orderStatus;
    order.orderStatus = 'cancelled';
    order.cancelledAt = new Date();

    // Add to status history
    order.statusHistory?.push({
      status: 'cancelled',
      date: new Date(),
      note: reason || 'Order cancelled by customer'
    });

    await order.save();

    // Clean up tracking data if exists
    try {
      const { TrackingOrder } = await import('../models/TrackingOrder');
      const trackingOrder = await TrackingOrder.findOne({ 
        orderNumber: order.orderNumber 
      });

      if (trackingOrder) {
        // Update tracking status to cancelled
        trackingOrder.status = OrderStatus.CANCELLED;
        trackingOrder.addTrackingEvent(OrderStatus.CANCELLED, 'Order cancelled by customer');
        await trackingOrder.save();

        // Log audit trail for cancellation
        const { AuditService } = await import('../services/AuditService');
        const auditService = new AuditService();
        await auditService.logOrderCancelled(
          orderId,
          order.orderNumber,
          reason || 'Order cancelled by customer',
          {
            userId: userId,
            userEmail: req.user?.email,
            userRole: req.user?.role,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
          }
        );
      }
    } catch (trackingError) {
      console.error('Failed to cleanup tracking data:', trackingError);
      // Don't fail the cancellation if tracking cleanup fails
    }

    // Send cancellation notification
    try {
      const { NotificationService } = await import('../services/NotificationService');
      const notificationService = new NotificationService();
      await notificationService.sendOrderCancelledNotification(order);
    } catch (notificationError) {
      console.error('Failed to send cancellation notification:', notificationError);
      // Don't fail the cancellation if notification fails
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order'
    });
  }
};

// Admin: Cancel order with tracking cleanup
export const adminCancelOrder = async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { orderId } = req.params;
    const { reason, notifyCustomer = true } = req.body;

    const order = await OrderModel.findById(orderId).populate('user');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order can be cancelled
    if (order.orderStatus === 'delivered') {
      return res.status(400).json({ 
        message: 'Cannot cancel delivered order' 
      });
    }

    if (order.orderStatus === 'cancelled') {
      return res.status(400).json({ 
        message: 'Order is already cancelled' 
      });
    }

    const previousStatus = order.orderStatus;
    order.orderStatus = 'cancelled';
    order.cancelledAt = new Date();

    // Add to status history
    order.statusHistory?.push({
      status: 'cancelled',
      date: new Date(),
      note: reason || 'Order cancelled by admin'
    });

    await order.save();

    // Clean up tracking data if exists
    try {
      const { TrackingOrder } = await import('../models/TrackingOrder');
      const trackingOrder = await TrackingOrder.findOne({ 
        orderNumber: order.orderNumber 
      });

      if (trackingOrder) {
        // Update tracking status to cancelled
        trackingOrder.status = OrderStatus.CANCELLED;
        trackingOrder.addTrackingEvent(OrderStatus.CANCELLED, reason || 'Order cancelled by admin');
        await trackingOrder.save();

        // Log audit trail for cancellation
        const { AuditService } = await import('../services/AuditService');
        const auditService = new AuditService();
        await auditService.logOrderCancelled(
          orderId,
          order.orderNumber,
          reason || 'Order cancelled by admin',
          {
            userId: req.user?._id,
            userEmail: req.user?.email,
            userRole: req.user?.role,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
          }
        );
      }
    } catch (trackingError) {
      console.error('Failed to cleanup tracking data:', trackingError);
      // Don't fail the cancellation if tracking cleanup fails
    }

    // Send cancellation notification if requested
    if (notifyCustomer) {
      try {
        const { NotificationService } = await import('../services/NotificationService');
        const notificationService = new NotificationService();
        await notificationService.sendOrderCancelledNotification(order);
      } catch (notificationError) {
        console.error('Failed to send cancellation notification:', notificationError);
        // Don't fail the cancellation if notification fails
      }
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully by admin',
      data: order
    });

  } catch (error) {
    console.error('Admin cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order'
    });
  }
};

// Get order statistics (Admin)
export const getOrderStats = async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const stats = await OrderModel.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    const totalOrders = await OrderModel.countDocuments();
    const totalRevenue = await OrderModel.aggregate([
      { $match: { orderStatus: { $in: ['delivered', 'shipped'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        statusBreakdown: stats
      }
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order statistics'
    });
  }
};

// Handle failed payment notification
export const handleFailedPayment = async (req: Request, res: Response) => {
  try {
    const {
      email,
      username,
      orderId,
      productName,
      productCategory,
      quantity,
      price,
      retryPaymentUrl,
      productImageUrl
    } = req.body;

    // Validate required fields
    if (!email || !orderId || !productName || !price) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, orderId, productName, price'
      });
    }

    // Create failed payment email template
    const failedPaymentEmailTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Failed - Kyna Jewels</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .order-details { background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0e0e0; }
        .product-info { display: flex; align-items: center; margin: 15px 0; }
        .product-image { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 15px; }
        .product-details h4 { margin: 0 0 5px 0; color: #333; }
        .product-details p { margin: 0; color: #666; }
        .retry-button { display: inline-block; background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .warning-box { background: #f8d7da; padding: 15px; border-radius: 5px; border-left: 4px solid #dc3545; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚠️ Payment Failed</h1>
            <p>We couldn't process your payment for order ${orderId}</p>
        </div>
        
        <div class="content">
            <h2>Hello ${username || 'Valued Customer'}!</h2>
            <p>We're sorry to inform you that your payment for the following order could not be processed successfully.</p>
            
            <div class="order-details">
                <h3>Order Details</h3>
                <div class="product-info">
                    ${productImageUrl ? `<img src="${productImageUrl}" alt="${productName}" class="product-image">` : ''}
                    <div class="product-details">
                        <h4>${productName}</h4>
                        <p><strong>Category:</strong> ${productCategory || 'Jewelry'}</p>
                        <p><strong>Quantity:</strong> ${quantity || 1}</p>
                        <p><strong>Price:</strong> ₹${price}</p>
                        <p><strong>Order ID:</strong> ${orderId}</p>
                    </div>
                </div>
            </div>
            
            <div class="warning-box">
                <strong>What happened?</strong><br>
                Your payment could not be processed due to various possible reasons such as insufficient funds, incorrect card details, or bank restrictions.
            </div>
            
            <div style="text-align: center;">
                <a href="${retryPaymentUrl || '#'}" class="retry-button">Retry Payment Now</a>
            </div>
            
            <h3>Next Steps:</h3>
            <ul>
                <li>Check your payment method and try again</li>
                <li>Ensure sufficient funds are available</li>
                <li>Contact your bank if the issue persists</li>
                <li>Your order will be held for 24 hours</li>
            </ul>
            
            <p>If you continue to experience issues, please contact our customer support team.</p>
        </div>
        
        <div class="footer">
            <p>Best regards,<br>The Kyna Jewels Team</p>
            <p>Need help? Contact us at support@kynajewels.com</p>
        </div>
    </div>
</body>
</html>`;

    // Create transporter with SSL fix
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false // Allow self-signed certificates
      }
    });

    // Send failed payment email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@kynajewels.com',
      to: email,
      subject: `Payment Failed - Order ${orderId} - Kyna Jewels`,
      html: failedPaymentEmailTemplate
    });

    console.log(`Failed payment email sent to ${email} for order ${orderId}`);

    res.status(200).json({
      success: true,
      message: 'Failed payment notification sent successfully',
      data: {
        email,
        orderId,
        productName,
        price,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Failed payment handler error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment failure notification',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
