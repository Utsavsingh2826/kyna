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
    
    // Use TrackingOrder fields FIRST (they are the source of truth), then fallback to order
    const orderType = trackingObj.orderType || order?.orderType || 'normal';
    const orderNumber = trackingObj.orderNumber || order?.orderNumber || 'N/A'; // ✅ Use TrackingOrder.orderNumber first
    const totalAmount = order?.totalAmount || order?.amount || 0;
    const items = order?.items || [];
    const shippingAddress = order?.shippingAddress;
    
    console.log('🔍 Building Tracking Response:');
    console.log('  Order Number (TrackingOrder):', trackingObj.orderNumber);
    console.log('  Order Number (Order):', order?.orderNumber);
    console.log('  Final Order Number:', orderNumber);
    console.log('  Order Type from TrackingOrder:', trackingObj.orderType);
    console.log('  Order Type from populated order:', order?.orderType);
    console.log('  Final Order Type:', orderType);
    console.log('  Status:', trackingObj.status);
    console.log('  Estimated Delivery (TrackingOrder):', trackingObj.estimatedDelivery);
    console.log('  Estimated Delivery (Order):', order?.estimatedDelivery || order?.estimatedDeliveryDate);
    
    // Get customer email - use TrackingOrder.customerEmail FIRST (source of truth)
    let customerEmail = trackingObj.customerEmail || '';
    
    // Fallback: get from order's user if TrackingOrder doesn't have it
    if (!customerEmail && order?.user) {
      if (typeof order.user === 'object' && order.user.email) {
        customerEmail = order.user.email;
      }
    }
    
    // Fallback: get from billingInfo if available (for PaymentOrder)
    if (!customerEmail && order?.billingInfo?.email) {
      customerEmail = order.billingInfo.email;
    }

    // Return data in the format expected by frontend
    // Get estimatedDelivery from TrackingOrder first, fallback to Order collection
    const estimatedDeliveryDate = trackingObj.estimatedDelivery || order?.estimatedDelivery || order?.estimatedDeliveryDate;
    
    const response = {
      orderNumber: orderNumber,
      customerEmail: customerEmail,
      status: trackingObj.status,
      orderType: orderType, // ⭐ FROM POPULATED ORDER REFERENCE
      estimatedDelivery: estimatedDeliveryDate ? new Date(estimatedDeliveryDate).toISOString() : undefined,
      docketNumber: trackingObj.docketNumber,
      shippingAddress: shippingAddress,
      trackingHistory: trackingObj.trackingHistory || [],
      items: items,
      totalAmount: totalAmount,
      createdAt: order?.orderedAt || order?.createdAt || trackingObj.createdAt, // ✅ For 2-day cancellation policy
      orderedAt: order?.orderedAt || order?.createdAt, // ✅ For 2-day cancellation policy
      returnRequest: trackingObj.returnRequest, // ✅ Return request info
      updatedAt: trackingObj.updatedAt ? new Date(trackingObj.updatedAt).toISOString() : new Date().toISOString()
    };
    
    console.log('  📤 Sending Order Type to Frontend:', response.orderType);
    console.log('  📅 Sending Estimated Delivery to Frontend:', response.estimatedDelivery);
    console.log('  📧 Sending Customer Email to Frontend:', response.customerEmail);
    
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
   * Update tracking order from Sequel247 API response (for trackMultiple)
   * This method processes the trackMultiple response and updates the database
   */
  async updateTrackingFromSequel(trackingOrder: any): Promise<boolean> {
    try {
      if (!trackingOrder.docketNumber) {
        logInfo(`Order ${trackingOrder.orderNumber} has no docket number, skipping Sequel update`, 'TrackingService');
        return false;
      }

      // Import trackMultiple function
      const { trackMultiple } = await import('../utils/sequelApi');
      
      // Call Sequel247 API to get latest tracking info
      const response = await trackMultiple([trackingOrder.docketNumber]);
      
      if (response.status !== 'true' || !response.successShipments) {
        logInfo(`No tracking data found for docket ${trackingOrder.docketNumber}`, 'TrackingService');
        return false;
      }

      // Find the shipment data for this docket number
      const shipmentData = response.successShipments[trackingOrder.docketNumber];
      
      if (!shipmentData) {
        // Check errorShipments for this docket
        if (response.errorShipments && response.errorShipments[trackingOrder.docketNumber]) {
          const error = response.errorShipments[trackingOrder.docketNumber];
          logInfo(`Error tracking docket ${trackingOrder.docketNumber}: ${error.docket || error.docketNo}`, 'TrackingService');
        }
        return false;
      }

      // Get previous status for comparison
      const previousStatus = trackingOrder.status;

      // Update tracking order with Sequel247 data
      trackingOrder.updateFromSequelTracking(shipmentData);
      
      await trackingOrder.save();

      // Check if status changed
      if (previousStatus !== trackingOrder.status) {
        logInfo(`Order ${trackingOrder.orderNumber} status updated: ${previousStatus} → ${trackingOrder.status}`, 'TrackingService');
        
        // If order is delivered and POD link doesn't exist, fetch it
        if (trackingOrder.status === OrderStatus.DELIVERED && !trackingOrder.podLink && trackingOrder.docketNumber) {
          try {
            // Format delivery date for POD request (YYYY-MM-DD)
            const deliveryDate = trackingOrder.deliveredAt 
              ? new Date(trackingOrder.deliveredAt).toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0];
            
            const podLink = await this.downloadPOD(
              [trackingOrder.docketNumber],
              deliveryDate,
              deliveryDate
            );
            
            if (podLink) {
              trackingOrder.podLink = podLink;
              await trackingOrder.save();
              logInfo(`POD link saved for delivered order ${trackingOrder.orderNumber}`, 'TrackingService');
            }
          } catch (podError) {
            logError(podError as Error, 'updateTrackingFromSequel - POD fetch');
            // Don't fail the tracking update if POD fetch fails
          }
        }
        
        // Sync status back to original order
        await this.syncOrderStatus(trackingOrder, trackingOrder.status);
      }

      return true;

    } catch (error) {
      logError(error as Error, 'updateTrackingFromSequel');
      return false;
    }
  }

  /**
   * Update multiple tracking orders using trackMultiple API
   * This is more efficient than calling updateTrackingFromSequel individually
   */
  async updateMultipleTrackingFromSequel(trackingOrders: any[]): Promise<{
    successCount: number;
    errorCount: number;
    results: Array<{ orderNumber: string; success: boolean; error?: string }>;
  }> {
    try {
      // Extract all docket numbers
      const docketNumbers = trackingOrders
        .map(order => order.docketNumber)
        .filter((docket): docket is string => !!docket);

      if (docketNumbers.length === 0) {
        return { successCount: 0, errorCount: 0, results: [] };
      }

      // Import trackMultiple function
      const { trackMultiple } = await import('../utils/sequelApi');
      
      // Call Sequel247 API to get latest tracking info for all dockets
      const response = await trackMultiple(docketNumbers);
      
      const results: Array<{ orderNumber: string; success: boolean; error?: string }> = [];
      let successCount = 0;
      let errorCount = 0;

      // Create a map of docket number to tracking order for quick lookup
      const docketToOrderMap = new Map<string, any>();
      trackingOrders.forEach(order => {
        if (order.docketNumber) {
          docketToOrderMap.set(order.docketNumber, order);
        }
      });

      // Process successful shipments
      if (response.successShipments) {
        for (const [docketNumber, shipmentData] of Object.entries(response.successShipments)) {
          const trackingOrder = docketToOrderMap.get(docketNumber);
          
          if (!trackingOrder) {
            continue;
          }

          try {
            const previousStatus = trackingOrder.status;
            
            // Update tracking order with Sequel247 data
            trackingOrder.updateFromSequelTracking(shipmentData);
            await trackingOrder.save();

            // Check if status changed
            if (previousStatus !== trackingOrder.status) {
              // If order is delivered and POD link doesn't exist, fetch it
              if (trackingOrder.status === OrderStatus.DELIVERED && !trackingOrder.podLink && trackingOrder.docketNumber) {
                try {
                  // Format delivery date for POD request (YYYY-MM-DD)
                  const deliveryDate = trackingOrder.deliveredAt 
                    ? new Date(trackingOrder.deliveredAt).toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0];
                  
                  const podLink = await this.downloadPOD(
                    [trackingOrder.docketNumber],
                    deliveryDate,
                    deliveryDate
                  );
                  
                  if (podLink) {
                    trackingOrder.podLink = podLink;
                    await trackingOrder.save();
                    logInfo(`POD link saved for delivered order ${trackingOrder.orderNumber}`, 'TrackingService');
                  }
                } catch (podError) {
                  logError(podError as Error, 'updateMultipleTrackingFromSequel - POD fetch');
                  // Don't fail the tracking update if POD fetch fails
                }
              }
              
              // Sync status back to original order
              await this.syncOrderStatus(trackingOrder, trackingOrder.status);
            }

            results.push({
              orderNumber: trackingOrder.orderNumber,
              success: true
            });
            successCount++;

          } catch (error) {
            logError(error as Error, `updateMultipleTrackingFromSequel - order ${trackingOrder.orderNumber}`);
            results.push({
              orderNumber: trackingOrder.orderNumber,
              success: false,
              error: (error as Error).message
            });
            errorCount++;
          }
        }
      }

      // Process error shipments
      if (response.errorShipments) {
        for (const [docketNumber, errorData] of Object.entries(response.errorShipments)) {
          const trackingOrder = docketToOrderMap.get(docketNumber);
          
          if (trackingOrder) {
            const errorMessage = errorData.docket || errorData.docketNo || 'Unknown error';
            logInfo(`Error tracking docket ${docketNumber} for order ${trackingOrder.orderNumber}: ${errorMessage}`, 'TrackingService');
            
            results.push({
              orderNumber: trackingOrder.orderNumber,
              success: false,
              error: errorMessage
            });
            errorCount++;
          }
        }
      }

      return { successCount, errorCount, results };

    } catch (error) {
      logError(error as Error, 'updateMultipleTrackingFromSequel');
      throw error;
    }
  }

  /**
   * Cancel shipment via Sequel247 API
   * Calls the Sequel247 cancel API and updates the database accordingly
   */
  async cancelShipment(docketNumber: string, reason: string): Promise<boolean> {
    try {
      if (!docketNumber) {
        logError(new Error('Docket number is required for cancellation'), 'cancelShipment');
        return false;
      }

      // Find tracking order first to ensure it exists
      const trackingOrder = await TrackingOrder.findOne({ docketNumber });
      
      if (!trackingOrder) {
        logError(new Error(`Tracking order not found for docket: ${docketNumber}`), 'cancelShipment');
        return false;
      }

      // Check if already cancelled
      if (trackingOrder.status === OrderStatus.CANCELLED) {
        logInfo(`Shipment ${docketNumber} is already cancelled`, 'TrackingService');
        return true;
      }

      // Import cancelShipment function from sequelApi
      const { cancelShipment: cancelSequelShipment } = await import('../utils/sequelApi');
      
      // Call Sequel247 API to cancel the shipment
      const response = await cancelSequelShipment(docketNumber, reason);
      
      if (response.status !== 'true') {
        logError(new Error(`Failed to cancel shipment: ${response.message || 'Unknown error'}`), 'cancelShipment');
        return false;
      }

      // Update tracking order status in database
      trackingOrder.status = OrderStatus.CANCELLED;
      trackingOrder.addTrackingEvent(
        OrderStatus.CANCELLED,
        `Shipment cancelled via Sequel247: ${reason}`,
        undefined,
        'SCANCELLED'
      );
      
      await trackingOrder.save();

      // Sync status back to original order
      await this.syncOrderStatus(trackingOrder, OrderStatus.CANCELLED);
      
      logInfo(`Shipment ${docketNumber} cancelled successfully via Sequel247`, 'TrackingService');
      return true;

    } catch (error) {
      logError(error as Error, 'cancelShipment');
      return false;
    }
  }

  /**
   * Download Proof of Delivery via Sequel247 API
   * Fetches POD download link for given docket numbers
   */
  async downloadPOD(docketNumbers: string[], fromDate?: string, toDate?: string): Promise<string | null> {
    try {
      if (!docketNumbers || docketNumbers.length === 0) {
        logError(new Error('Docket numbers are required for POD download'), 'downloadPOD');
        return null;
      }

      // Import podDownload function from sequelApi
      const { podDownload } = await import('../utils/sequelApi');
      
      // Call Sequel247 API to get POD download link
      const response = await podDownload({
        requestType: 'docket',
        dockets: docketNumbers,
        fromDate: fromDate, // Optional: YYYY-MM-DD format
        toDate: toDate // Optional: YYYY-MM-DD format
      });
      
      if (response.status !== 'true' || !response.link) {
        logInfo(`POD not available for dockets: ${docketNumbers.join(', ')}. Message: ${response.message || 'Unknown error'}`, 'TrackingService');
        return null;
      }

      logInfo(`POD link retrieved successfully for dockets: ${docketNumbers.join(', ')}`, 'TrackingService');
      return response.link;

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
