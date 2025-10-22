import { TrackingOrder } from '../models/TrackingOrder';
import { 
  TrackingRequest, 
  OrderStatus, 
  NotFoundError
} from '../types/tracking';
import { 
  ORDER_STATUS_MAPPING, 
  ERROR_MESSAGES
} from '../constants/tracking';
import { 
  validateOrderNumber, 
  validateEmail, 
  createValidationError,
  logError,
  logInfo
} from '../utils/tracking';

export class TrackingService {
  constructor() {}

  /**
   * Track an order by order number and email
   */
  async trackOrder(request: TrackingRequest): Promise<any> {
    try {
      // Validate input
      if (!validateOrderNumber(request.orderNumber)) {
        throw createValidationError('orderNumber', ERROR_MESSAGES.INVALID_ORDER_NUMBER);
      }

      if (!validateEmail(request.email)) {
        throw createValidationError('email', ERROR_MESSAGES.INVALID_EMAIL);
      }

      // Find order in database (already populated by findByOrderNumberAndEmail)
      const trackingOrder = await TrackingOrder.findByOrderNumberAndEmail(
        request.orderNumber, 
        request.email
      );

      if (!trackingOrder) {
        throw new NotFoundError(ERROR_MESSAGES.ORDER_NOT_FOUND);
      }

      // Build tracking response (order is already populated)
      const trackingResponse = this.buildTrackingResponse(trackingOrder);

      logInfo(`Order ${request.orderNumber} tracked successfully`, 'TrackingService');
      return trackingResponse;

    } catch (error) {
      logError(error as Error, 'trackOrder');
      throw error;
    }
  }

  /**
   * Get order history for a customer
   */
  async getOrderHistory(email: string, limit: number = 10): Promise<any[]> {
    try {
      if (!validateEmail(email)) {
        throw createValidationError('email', ERROR_MESSAGES.INVALID_EMAIL);
      }

      const orders = await TrackingOrder.findByCustomerEmail(email, limit);
      return orders;

    } catch (error) {
      logError(error as Error, 'getOrderHistory');
      throw error;
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    orderNumber: string, 
    status: OrderStatus, 
    description?: string,
    location?: string
  ): Promise<any> {
    try {
      const order = await TrackingOrder.findOne({ orderNumber: orderNumber.toUpperCase() }).populate('order');
      
      if (!order) {
        throw new NotFoundError(ERROR_MESSAGES.ORDER_NOT_FOUND);
      }

      order.addTrackingEvent(
        status, 
        description || ORDER_STATUS_MAPPING[status].description,
        location
      );

      await order.save();
      
      logInfo(`Order ${orderNumber} status updated to ${status}`, 'TrackingService');
      return order;

    } catch (error) {
      logError(error as Error, 'updateOrderStatus');
      throw error;
    }
  }

  /**
   * Build tracking response with progress steps
   */
  private buildTrackingResponse(trackingOrder: any): any {
    const trackingObj = trackingOrder.toObject();
    
    // Get data from TrackingOrder and populated order reference
    const order: any = trackingObj.order;
    
    // Get orderType directly from TrackingOrder (fallback to order if not present)
    const orderType = trackingObj.orderType || order?.orderType || 'normal';
    const orderNumber = order?.orderNumber || 'N/A';
    const totalAmount = order?.totalAmount || order?.amount || 0;
    const items = order?.items || [];
    const shippingAddress = order?.shippingAddress;
    
    console.log('🔍 Building Tracking Response:');
    console.log('  Order Number:', orderNumber);
    console.log('  Order Type from TrackingOrder:', trackingObj.orderType);
    console.log('  Order Type from populated order:', order?.orderType);
    console.log('  Final Order Type:', orderType);
    console.log('  Status:', trackingObj.status);
    
    // Get user email - handle both populated and unpopulated scenarios
    let customerEmail = '';
    if (order?.user) {
      if (typeof order.user === 'object' && order.user.email) {
        customerEmail = order.user.email;
      }
    }
    
    // Fallback: get from billingInfo if available (for PaymentOrder)
    if (!customerEmail && order?.billingInfo?.email) {
      customerEmail = order.billingInfo.email;
    }

    // Return data in the format expected by frontend
    const response = {
      orderNumber: orderNumber,
      customerEmail: customerEmail,
      status: trackingObj.status,
      orderType: orderType, // ⭐ FROM POPULATED ORDER REFERENCE
      estimatedDelivery: trackingObj.estimatedDelivery ? new Date(trackingObj.estimatedDelivery).toISOString() : undefined,
      docketNumber: trackingObj.docketNumber,
      shippingAddress: shippingAddress,
      trackingHistory: trackingObj.trackingHistory || [],
      items: items,
      totalAmount: totalAmount,
      updatedAt: trackingObj.updatedAt ? new Date(trackingObj.updatedAt).toISOString() : new Date().toISOString()
    };
    
    console.log('  📤 Sending Order Type to Frontend:', response.orderType);
    
    return response;
  }

  /**
   * Create a new order (for testing purposes)
   */
  async createOrder(orderData: Partial<any>): Promise<any> {
    try {
      const order = new TrackingOrder(orderData);
      await order.save();
      
      logInfo(`Order ${order._id} created`, 'TrackingService');
      return order;

    } catch (error) {
      logError(error as Error, 'createOrder');
      throw error;
    }
  }

  /**
   * Get tracking statistics
   */
  async getTrackingStats(): Promise<{
    totalOrders: number;
    ordersByStatus: Record<OrderStatus, number>;
    recentOrders: any[];
  }> {
    try {
      const totalOrders = await TrackingOrder.countDocuments();
      
      const ordersByStatus = await TrackingOrder.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const statusCounts: Record<OrderStatus, number> = {
        [OrderStatus.ORDER_PLACED]: 0,
        [OrderStatus.PROCESSING]: 0,
        [OrderStatus.PACKAGING]: 0,
        [OrderStatus.IN_TRANSIT]: 0,
        [OrderStatus.ON_THE_ROAD]: 0,
        [OrderStatus.DELIVERED]: 0,
        [OrderStatus.CANCELLED]: 0
      };

      ordersByStatus.forEach(item => {
        statusCounts[item._id as OrderStatus] = item.count;
      });

      const recentOrders = await TrackingOrder.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('order');

      return {
        totalOrders,
        ordersByStatus: statusCounts,
        recentOrders
      };

    } catch (error) {
      logError(error as Error, 'getTrackingStats');
      throw error;
    }
  }

  /**
   * Cancel shipment
   */
  async cancelShipment(docketNumber: string, reason: string): Promise<boolean> {
    try {
      // In a real implementation, this would call Sequel247 API
      // For now, just update the database
      const trackingOrder = await TrackingOrder.findOne({ docketNumber });
      
      if (!trackingOrder) {
        return false;
      }

      trackingOrder.status = OrderStatus.CANCELLED;
      trackingOrder.addTrackingEvent(
        OrderStatus.CANCELLED,
        `Shipment cancelled: ${reason}`
      );
      
      await trackingOrder.save();
      
      logInfo(`Shipment ${docketNumber} cancelled`, 'TrackingService');
      return true;

    } catch (error) {
      logError(error as Error, 'cancelShipment');
      return false;
    }
  }

  /**
   * Download Proof of Delivery
   */
  async downloadPOD(docketNumbers: string[], fromDate: string, toDate: string): Promise<string | null> {
    try {
      // In a real implementation, this would call Sequel247 API
      // For now, return null to indicate POD not available
      logInfo(`POD request for dockets: ${docketNumbers.join(', ')}`, 'TrackingService');
      return null;

    } catch (error) {
      logError(error as Error, 'downloadPOD');
      return null;
    }
  }

  /**
   * Sync tracking status back to original order
   */
  async syncOrderStatus(trackingOrder: any, newStatus: OrderStatus): Promise<void> {
    try {
      // Import order models
      const OrderModel = require('../models/orderModel').default;
      const PaymentOrder = require('../models/PaymentOrder').default;
      
      // Get the order reference
      let order = await OrderModel.findById(trackingOrder.order);
      
      // If not found in regular orders, try PaymentOrder
      if (!order) {
        order = await PaymentOrder.findById(trackingOrder.order);
      }
      
      if (!order) {
        logError(new Error(`Order not found for tracking order ${trackingOrder._id}`), 'syncOrderStatus');
        return;
      }

      // Map tracking status to order status
      const orderStatus = this.mapTrackingStatusToOrderStatus(newStatus);
      
      if (order.orderStatus !== orderStatus && order.status !== orderStatus) {
        // Update order status (handle both 'orderStatus' and 'status' fields)
        if ('orderStatus' in order) {
          order.orderStatus = orderStatus;
        }
        if ('status' in order) {
          order.status = orderStatus === 'delivered' ? 'success' : orderStatus;
        }

        await order.save();
        logInfo(`Synced order ${order._id} status to ${orderStatus}`, 'TrackingService');
      }

    } catch (error) {
      logError(error as Error, 'syncOrderStatus');
      // Don't throw - status sync is not critical
    }
  }

  /**
   * Map tracking status to order status
   */
  private mapTrackingStatusToOrderStatus(trackingStatus: OrderStatus): string {
    const statusMap: Record<OrderStatus, string> = {
      [OrderStatus.ORDER_PLACED]: 'pending',
      [OrderStatus.PROCESSING]: 'processing',
      [OrderStatus.PACKAGING]: 'processing',
      [OrderStatus.IN_TRANSIT]: 'shipped',
      [OrderStatus.ON_THE_ROAD]: 'shipped',
      [OrderStatus.DELIVERED]: 'delivered',
      [OrderStatus.CANCELLED]: 'cancelled'
    };

    return statusMap[trackingStatus] || 'pending';
  }
}
