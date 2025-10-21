import { TrackingOrder } from '../models/TrackingOrder';
import { Sequel247Service } from './Sequel247Service';
import { OrderModel } from '../models/orderModel';
import { UserModel } from '../models/userModel';
import { NotificationService } from './NotificationService';
import { WebhookService, WebhookConfig } from './WebhookService';
import { AuditService, AuditContext } from './AuditService';
import { 
  TrackingRequest, 
  TrackingResponse, 
  OrderStatus, 
  TrackingStep,
  AppError,
  NotFoundError
} from '../types/tracking';
import { 
  ORDER_STATUS_MAPPING, 
  ERROR_MESSAGES, 
  SUCCESS_MESSAGES 
} from '../constants/tracking';
import { 
  validateOrderNumber, 
  validateEmail, 
  createValidationError,
  logError,
  logInfo
} from '../utils/tracking';
import { DataValidator, validateAndSanitize } from '../utils/validation';
import { RetryService, createRetryService, RETRY_CONFIGS, RetryableOperation } from './RetryService';

export class TrackingService {
  private sequelService: Sequel247Service;
  private notificationService: NotificationService;
  private webhookService?: WebhookService;
  private auditService: AuditService;
  private retryService: RetryService;

  constructor(sequelService: Sequel247Service, webhookConfig?: WebhookConfig) {
    this.sequelService = sequelService;
    this.notificationService = new NotificationService();
    this.auditService = new AuditService();
    this.retryService = createRetryService(RETRY_CONFIGS.SEQUEL247_API);
    
    if (webhookConfig) {
      this.webhookService = new WebhookService(webhookConfig);
    }
  }

  /**
   * Track an order by order number and email
   */
  async trackOrder(request: TrackingRequest): Promise<TrackingResponse> {
    try {
      // Validate and sanitize input
      const validationResult = validateAndSanitize(request, DataValidator.validateTrackingRequest);
      if (!validationResult.isValid) {
        throw createValidationError('validation', validationResult.errors.join(', '));
      }

      const sanitizedRequest = validationResult.sanitizedData;

      // Find order in database
      const order = await TrackingOrder.findByOrderNumberAndEmail(
        sanitizedRequest.orderNumber, 
        sanitizedRequest.email
      );

      if (!order) {
        throw new NotFoundError(ERROR_MESSAGES.ORDER_NOT_FOUND);
      }

      // Update tracking from Sequel247 if docket number exists
      if (order.docketNumber) {
        await this.updateTrackingFromSequel(order);
      }

      // Build tracking response
      const trackingResponse = this.buildTrackingResponse(order);

      logInfo(`Order ${sanitizedRequest.orderNumber} tracked successfully`, 'TrackingService');
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
   * Update order tracking from Sequel247
   */
  async updateTrackingFromSequel(order: any): Promise<void> {
    try {
      if (!order.docketNumber) {
        return;
      }

      logInfo(`Updating tracking for docket ${order.docketNumber}`, 'TrackingService');

      // Create retryable operation for Sequel247 API call
      const retryableOperation: RetryableOperation<any> = {
        operation: async () => {
          return await this.sequelService.trackShipment(order.docketNumber);
        },
        operationName: `trackShipment-${order.docketNumber}`,
        context: { orderNumber: order.orderNumber, docketNumber: order.docketNumber }
      };

      const sequelResponse = await this.retryService.executeWithRetry(retryableOperation);
      
      if (sequelResponse.data) {
        order.updateFromSequelTracking(sequelResponse.data);
        await order.save();
        
        logInfo(`Tracking updated for order ${order.orderNumber}`, 'TrackingService');
      }

    } catch (error) {
      logError(error as Error, 'updateTrackingFromSequel');
      // Don't throw error here as we still want to return cached data
    }
  }

  /**
   * Create a new order (for testing purposes)
   */
  async createOrder(orderData: Partial<any>): Promise<any> {
    try {
      const order = new TrackingOrder(orderData);
      await order.save();
      
      logInfo(`Order ${order.orderNumber} created`, 'TrackingService');
      return order;

    } catch (error) {
      logError(error as Error, 'createOrder');
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
      const order = await TrackingOrder.findOne({ orderNumber: orderNumber.toUpperCase() });
      
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
  private buildTrackingResponse(order: any): TrackingResponse {
    const steps = this.buildTrackingSteps(order);
    const currentStatus = order.status;
    const progress = this.calculateProgress(currentStatus);

    return {
      order: order.toObject(),
      tracking: {
        currentStatus,
        progress,
        steps,
        estimatedDelivery: order.estimatedDelivery
      }
    };
  }

  /**
   * Build tracking steps for UI display
   */
  private buildTrackingSteps(order: any): TrackingStep[] {
    const allSteps: OrderStatus[] = [
      OrderStatus.ORDER_PLACED,
      OrderStatus.PROCESSING,
      OrderStatus.PACKAGING,
      OrderStatus.ON_THE_ROAD,
      OrderStatus.DELIVERED
    ];

    const currentStatusIndex = allSteps.indexOf(order.status);
    const completedStatuses = allSteps.slice(0, currentStatusIndex + 1);

    return allSteps.map((status, index) => {
      const isCompleted = completedStatuses.includes(status);
      const isActive = status === order.status;
      const statusInfo = ORDER_STATUS_MAPPING[status];
      
      // Find the most recent tracking event for this status
      const trackingEvent = order.trackingHistory
        .filter((event: any) => event.status === status)
        .sort((a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime())[0];

      return {
        status,
        title: statusInfo.title,
        description: trackingEvent?.description || statusInfo.description,
        completed: isCompleted,
        active: isActive,
        timestamp: trackingEvent?.timestamp,
        location: trackingEvent?.location
      };
    });
  }

  /**
   * Calculate progress percentage
   */
  private calculateProgress(status: OrderStatus): number {
    const statusProgressMap: Record<OrderStatus, number> = {
      [OrderStatus.ORDER_PLACED]: 20,
      [OrderStatus.PROCESSING]: 40,
      [OrderStatus.PACKAGING]: 60,
      [OrderStatus.IN_TRANSIT]: 70,
      [OrderStatus.ON_THE_ROAD]: 80,
      [OrderStatus.DELIVERED]: 100,
      [OrderStatus.CANCELLED]: 0
    };

    return statusProgressMap[status] || 0;
  }

  /**
   * Validate tracking request
   */
  private validateTrackingRequest(request: TrackingRequest): void {
    if (!request.orderNumber || !validateOrderNumber(request.orderNumber)) {
      throw createValidationError('orderNumber', ERROR_MESSAGES.INVALID_ORDER_NUMBER);
    }

    if (!request.email || !validateEmail(request.email)) {
      throw createValidationError('email', ERROR_MESSAGES.INVALID_EMAIL);
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
        .limit(10);

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
   * Create tracking record from order when shipped
   */
  async createTrackingFromOrder(orderId: string, docketNumber: string): Promise<any> {
    try {
      // Validate docket number
      const docketValidation = DataValidator.validateDocketNumber(docketNumber);
      if (!docketValidation.isValid) {
        throw createValidationError('docketNumber', docketValidation.errors.join(', '));
      }

      const order = await OrderModel.findById(orderId).populate('user');
      if (!order) {
        throw new NotFoundError('Order not found');
      }

      // Validate order number
      const orderNumberValidation = DataValidator.validateOrderNumber(order.orderNumber);
      if (!orderNumberValidation.isValid) {
        throw createValidationError('orderNumber', orderNumberValidation.errors.join(', '));
      }

      // Check if tracking record already exists
      const existingTracking = await TrackingOrder.findOne({ 
        orderNumber: orderNumberValidation.sanitizedData
      });
      
      if (existingTracking) {
        // Update existing tracking record with docket number
        existingTracking.docketNumber = docketValidation.sanitizedData;
        await existingTracking.save();
        logInfo(`Updated tracking record for order ${orderNumberValidation.sanitizedData} with docket ${docketValidation.sanitizedData}`, 'TrackingService');
        return existingTracking;
      }

      // Prepare tracking data with validation
      const trackingData = {
        orderNumber: orderNumberValidation.sanitizedData,
        customerEmail: typeof order.user === 'object' && 'email' in order.user ? order.user.email : '',
        customerName: typeof order.user === 'object' && 'firstName' in order.user ? `${order.user.firstName} ${order.user.lastName}`.trim() : '',
        docketNumber: docketValidation.sanitizedData,
        totalAmount: order.totalAmount,
        status: OrderStatus.ORDER_PLACED,
        items: order.items.map(item => ({
          productId: item.product.toString(),
          productName: `Product ${item.productModel}`,
          quantity: item.quantity,
          price: item.price,
          image: ''
        })),
        shippingAddress: {
          name: 'Home',
          line1: order.shippingAddress.street,
          line2: '',
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          pincode: order.shippingAddress.zipCode,
          phone: typeof order.user === 'object' && 'phone' in order.user ? order.user.phone || '' : '',
          email: typeof order.user === 'object' && 'email' in order.user ? order.user.email : ''
        },
        billingAddress: {
          name: 'Home',
          line1: order.shippingAddress.street,
          line2: '',
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          pincode: order.shippingAddress.zipCode,
          phone: typeof order.user === 'object' && 'phone' in order.user ? order.user.phone || '' : '',
          email: typeof order.user === 'object' && 'email' in order.user ? order.user.email : ''
        }
      };

      // Validate tracking data
      const validationResult = DataValidator.validateTrackingOrderData(trackingData);
      if (!validationResult.isValid) {
        throw createValidationError('trackingData', validationResult.errors.join(', '));
      }

      // Create new tracking record with sanitized data
      const trackingOrder = new TrackingOrder(validationResult.sanitizedData);
      await trackingOrder.save();
      
      logInfo(`Created tracking record for order ${orderNumberValidation.sanitizedData} with docket ${docketValidation.sanitizedData}`, 'TrackingService');
      return trackingOrder;

    } catch (error) {
      logError(error as Error, 'createTrackingFromOrder');
      throw error;
    }
  }

  /**
   * Sync tracking status back to original order
   */
  async syncOrderStatus(trackingOrder: any, previousStatus?: OrderStatus, auditContext?: AuditContext): Promise<void> {
    try {
      const order = await OrderModel.findOne({ 
        orderNumber: trackingOrder.orderNumber 
      });
      
      if (!order) {
        logError(new Error(`Order not found for tracking order ${trackingOrder.orderNumber}`), 'syncOrderStatus');
        return;
      }

      const orderStatus = this.mapTrackingStatusToOrderStatus(trackingOrder.status);
      const previousOrderStatus = previousStatus ? this.mapTrackingStatusToOrderStatus(previousStatus) : order.orderStatus;
      
      if (order.orderStatus !== orderStatus) {
        const oldStatus = order.orderStatus;
        order.orderStatus = orderStatus as any;
        
        // Update specific timestamps based on status
        if (orderStatus === 'shipped' && !order.shippedAt) {
          order.shippedAt = new Date();
        } else if (orderStatus === 'delivered' && !order.deliveredAt) {
          order.deliveredAt = new Date();
        } else if (orderStatus === 'cancelled' && !order.cancelledAt) {
          order.cancelledAt = new Date();
        }

        await order.save();
        
        // Log audit trail for status change
        if (auditContext) {
          await this.auditService.logOrderStatusChange(
            order._id.toString(),
            order.orderNumber,
            oldStatus,
            orderStatus,
            auditContext
          );
        }
        
        // Send notification for status changes
        if (previousOrderStatus !== orderStatus) {
          await this.notificationService.sendTrackingUpdateNotification(
            trackingOrder, 
            previousStatus || trackingOrder.status, 
            trackingOrder.status
          );

          // Send webhook for status changes
          if (this.webhookService) {
            try {
              await this.webhookService.sendTrackingStatusChange(
                trackingOrder,
                previousStatus || trackingOrder.status,
                trackingOrder.status
              );
            } catch (webhookError) {
              logError(webhookError as Error, 'sendTrackingStatusChange webhook');
            }
          }
        }
        
        logInfo(`Synced status for order ${order.orderNumber}: ${orderStatus}`, 'TrackingService');
      }

    } catch (error) {
      logError(error as Error, 'syncOrderStatus');
      // Don't throw error here as we don't want to break the tracking update
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

  /**
   * Get user orders with tracking information
   */
  async getUserOrdersWithTracking(userId: string): Promise<any[]> {
    try {
      const orders = await OrderModel.find({ user: userId })
        .populate('user', 'firstName lastName email phone')
        .sort({ orderedAt: -1 });

      // Add tracking info to each order
      for (const order of orders) {
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
      }

      return orders;

    } catch (error) {
      logError(error as Error, 'getUserOrdersWithTracking');
      throw error;
    }
  }

  /**
   * Get order by order number with tracking info
   */
  async getOrderWithTracking(orderNumber: string): Promise<any> {
    try {
      const order = await OrderModel.findOne({ orderNumber })
        .populate('user', 'firstName lastName email phone');
      
      if (!order) {
        throw new NotFoundError('Order not found');
      }

      const tracking = await TrackingOrder.findOne({ orderNumber });
      
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
      logError(error as Error, 'getOrderWithTracking');
      throw error;
    }
  }
}
