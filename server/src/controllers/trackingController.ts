import { Request, Response, NextFunction } from 'express';
import { TrackingService } from '../services/TrackingService';
import { 
  ApiResponse, 
  TrackingRequest, 
  AppError, 
  ValidationError,
  NotFoundError,
  OrderStatus
} from '../types/tracking';
import { 
  ERROR_MESSAGES, 
  SUCCESS_MESSAGES, 
  HTTP_STATUS 
} from '../constants/tracking';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  logError 
} from '../utils/tracking';

export class TrackingController {
  private trackingService: TrackingService;

  constructor(trackingService: TrackingService) {
    this.trackingService = trackingService;
  }

  /**
   * Track an order by order number and email
   */
  trackOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orderNumber, email } = req.body as TrackingRequest;

      if (!orderNumber || !email) {
        const errors: Record<string, string> = {};
        if (!orderNumber) errors.orderNumber = 'Order number is required';
        if (!email) errors.email = 'Email is required';
        
        const response: ApiResponse = createErrorResponse(
          'Order number and email are required',
          errors
        );
        res.status(HTTP_STATUS.BAD_REQUEST).json(response);
        return;
      }

      const result = await this.trackingService.trackOrder({ orderNumber, email });
      
      const response: ApiResponse = createSuccessResponse(
        result, 
        SUCCESS_MESSAGES.ORDER_FOUND
      );
      
      res.status(HTTP_STATUS.OK).json(response);

    } catch (error) {
      next(error);
    }
  };

  /**
   * Get order history for a customer
   */
  getOrderHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.params;
      const { limit = 10 } = req.query;

      if (!email) {
        const response: ApiResponse = createErrorResponse('Email is required');
        res.status(HTTP_STATUS.BAD_REQUEST).json(response);
        return;
      }

      const orders = await this.trackingService.getOrderHistory(
        email, 
        parseInt(limit as string)
      );
      
      const response: ApiResponse = createSuccessResponse(orders);
      res.status(HTTP_STATUS.OK).json(response);

    } catch (error) {
      next(error);
    }
  };

  /**
   * Get tracking statistics (admin only)
   */
  getTrackingStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.trackingService.getTrackingStats();
      
      const response: ApiResponse = createSuccessResponse(stats);
      res.status(HTTP_STATUS.OK).json(response);

    } catch (error) {
      next(error);
    }
  };

  /**
   * Update order status (admin only)
   */
  updateOrderStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orderNumber } = req.params;
      const { status, description, location } = req.body;

      if (!orderNumber || !status) {
        const response: ApiResponse = createErrorResponse(
          'Order number and status are required'
        );
        res.status(HTTP_STATUS.BAD_REQUEST).json(response);
        return;
      }

      const order = await this.trackingService.updateOrderStatus(
        orderNumber, 
        status, 
        description, 
        location
      );
      
      const response: ApiResponse = createSuccessResponse(
        order, 
        'Order status updated successfully'
      );
      
      res.status(HTTP_STATUS.OK).json(response);

    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a test order (development only)
   */
  createTestOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (process.env.NODE_ENV === 'production') {
        const response: ApiResponse = createErrorResponse(
          'This endpoint is not available in production'
        );
        res.status(HTTP_STATUS.FORBIDDEN).json(response);
        return;
      }

      const orderData = req.body;
      const order = await this.trackingService.createOrder(orderData);
      
      const response: ApiResponse = createSuccessResponse(
        order, 
        'Test order created successfully'
      );
      
      res.status(HTTP_STATUS.CREATED).json(response);

    } catch (error) {
      next(error);
    }
  };

  /**
   * Health check endpoint
   */
  healthCheck = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const response: ApiResponse = createSuccessResponse({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'KynaJewels Tracking API',
        version: '1.0.0'
      });
      
      res.status(HTTP_STATUS.OK).json(response);

    } catch (error) {
      next(error);
    }
  };

  /**
   * Cancel a shipment
   */
  cancelShipment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { docketNumber, reason, orderNumber, email } = req.body;

      // Validation - require either docketNumber OR orderNumber+email
      if (!reason || (!docketNumber && !(orderNumber && email))) {
        const response: ApiResponse = createErrorResponse(
          'Reason is required, and either docket number OR order number with email must be provided'
        );
        res.status(HTTP_STATUS.BAD_REQUEST).json(response);
        return;
      }

      // Find tracking order by docketNumber OR orderNumber+email
      const { TrackingOrder } = await import('../models/TrackingOrder');
      const { OrderModel } = await import('../models/orderModel');
      const { UserModel } = await import('../models/userModel');
      
      let trackingOrder: any = null;

      if (docketNumber) {
        // Find by docket number (order already shipped)
        trackingOrder = await TrackingOrder.findOne({ docketNumber }).populate('order');
      } else if (orderNumber && email) {
        // Find by order number and email (order not yet shipped)
        const user = await UserModel.findOne({ email: email.toLowerCase() });
        if (!user) {
          const response: ApiResponse = createErrorResponse('User not found with this email');
          res.status(HTTP_STATUS.NOT_FOUND).json(response);
          return;
        }

        const order = await OrderModel.findOne({ 
          orderNumber: new RegExp(`^${orderNumber}$`, 'i'),
          user: user._id 
        });

        if (!order) {
          const response: ApiResponse = createErrorResponse('Order not found');
          res.status(HTTP_STATUS.NOT_FOUND).json(response);
          return;
        }

        trackingOrder = await TrackingOrder.findOne({ order: order._id }).populate('order');
      }
      
      if (!trackingOrder) {
        const response: ApiResponse = createErrorResponse(
          'Order not found. Please check your order details.'
        );
        res.status(HTTP_STATUS.NOT_FOUND).json(response);
        return;
      }

      // Check 1: Order must NOT be delivered
      if (trackingOrder.status === OrderStatus.DELIVERED) {
        const response: ApiResponse = createErrorResponse(
          'Cannot cancel delivered orders. This order has already been delivered.'
        );
        res.status(HTTP_STATUS.FORBIDDEN).json(response);
        return;
      }

      // Check 2: Order must NOT be already cancelled
      if (trackingOrder.status === OrderStatus.CANCELLED) {
        const response: ApiResponse = createErrorResponse(
          'This order has already been cancelled.'
        );
        res.status(HTTP_STATUS.BAD_REQUEST).json(response);
        return;
      }

      // Check 3: Order must be within 2 days of creation (NEW POLICY: All orders can be cancelled within 2 days)
      if (trackingOrder.order) {
        const order = trackingOrder.order as any;
        const orderCreatedAt = order.orderedAt || order.createdAt;
        
        if (!orderCreatedAt) {
          const response: ApiResponse = createErrorResponse(
            'Cannot determine order creation date. Please contact support.'
          );
          res.status(HTTP_STATUS.BAD_REQUEST).json(response);
          return;
        }

        const currentTime = new Date();
        const orderTime = new Date(orderCreatedAt);
        const hoursSinceOrder = (currentTime.getTime() - orderTime.getTime()) / (1000 * 60 * 60);
        const twoDaysInHours = 48;

        if (hoursSinceOrder > twoDaysInHours) {
          const daysSinceOrder = Math.floor(hoursSinceOrder / 24);
          const response: ApiResponse = createErrorResponse(
            `Cannot cancel order. Cancellation is only allowed within 2 days of order placement. This order was placed ${daysSinceOrder} days ago.`
          );
          res.status(HTTP_STATUS.FORBIDDEN).json(response);
          return;
        }
        
        console.log(`✅ Order within cancellation window: ${hoursSinceOrder.toFixed(1)} hours since order (${(48 - hoursSinceOrder).toFixed(1)} hours remaining)`);
      }

      // Cancel the shipment
      let success = true;
      
      // If order has docket number (already shipped), call Sequel247 API
      if (trackingOrder.docketNumber) {
        console.log(`📞 Calling Sequel247 API to cancel docket: ${trackingOrder.docketNumber}`);
        success = await this.trackingService.cancelShipment(trackingOrder.docketNumber, reason);
        
        if (!success) {
          const response: ApiResponse = createErrorResponse(
            'Failed to cancel shipment with courier. Please contact support.'
          );
          res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(response);
          return;
        }
      } else {
        // Order not yet shipped - no need to call courier API
        console.log(`✅ Order not yet shipped (no docket). Cancelling in database only.`);
      }

      // Update the tracking order status in database
      try {
        trackingOrder.status = OrderStatus.CANCELLED;
        trackingOrder.addTrackingEvent(
          OrderStatus.CANCELLED,
          trackingOrder.docketNumber 
            ? `Shipment cancelled with courier: ${reason}` 
            : `Order cancelled before shipment: ${reason}`
        );
        await trackingOrder.save();

        // Sync with main order model
        await this.trackingService.syncOrderStatus(trackingOrder, trackingOrder.status);

        const response: ApiResponse = createSuccessResponse(
          { cancelled: true, orderNumber: trackingOrder.order?.orderNumber || orderNumber },
          trackingOrder.docketNumber 
            ? 'Shipment cancelled successfully' 
            : 'Order cancelled successfully'
        );
        res.status(HTTP_STATUS.OK).json(response);
      } catch (dbError) {
        console.error('❌ Failed to update tracking status in database:', dbError);
        const response: ApiResponse = createErrorResponse(
          'Failed to cancel order. Please try again or contact support.'
        );
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(response);
      }

    } catch (error) {
      logError(error as Error, 'cancelShipment');
      next(error);
    }
  };

  /**
   * Get all orders for the logged-in user
   * Protected route - uses direct userId reference in TrackingOrder and populates Order data
   */
  getAllTestOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { TrackingOrder } = await import('../models/TrackingOrder');
      
      // Get user from request (set by authenticateToken middleware)
      const user = (req as any).user;
      if (!user || !user._id) {
        console.error('❌ NO USER IN REQUEST!');
        const response: ApiResponse = createErrorResponse('User not authenticated');
        res.status(HTTP_STATUS.UNAUTHORIZED).json(response);
        return;
      }

      console.log('\n=================================================');
      console.log('🔍 GET USER ORDERS - PROTECTED ROUTE');
      console.log('=================================================');
      console.log('📧 Authenticated User:', user.email);
      console.log('🆔 User ID:', user._id);
      console.log('👤 User Name:', user.firstName || user.name);
      console.log('=================================================\n');
      
      // Query TrackingOrder and populate Order data
      console.log('📊 Fetching tracking orders with populated order data...');
      const trackingOrders = await TrackingOrder.find({ userId: user._id })
        .populate({
          path: 'order',
          select: 'orderNumber orderType items totalAmount amount shippingAddress billingInfo createdAt'
        })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

      console.log('✅ QUERY RESULTS:');
      console.log(`   Total Tracking Orders Found: ${trackingOrders.length}`);
      console.log('');
      
      // Log each order's details
      if (trackingOrders.length > 0) {
        console.log('📦 TRACKING ORDER DETAILS:');
        trackingOrders.forEach((tracking: any, index: number) => {
          const order = tracking.order;
          console.log(`   ${index + 1}. Order: ${order?.orderNumber}`);
          console.log(`      User ID: ${tracking.userId}`);
          console.log(`      Type: ${order?.orderType || 'normal'}`);
          console.log(`      Tracking Status: ${tracking.status}`);
          console.log(`      Docket: ${tracking.docketNumber || 'Not assigned'}`);
        });
        
        // Verify all orders belong to the authenticated user
        const wrongUserOrders = trackingOrders.filter((o: any) => o.userId?.toString() !== user._id.toString());
        if (wrongUserOrders.length > 0) {
          console.log('\n❌ ERROR: Found orders from other users!');
        } else {
          console.log('\n✅ USER ISOLATION VERIFIED: All orders belong to userId:', user._id);
        }
      } else {
        console.log('⚠️  NO TRACKING ORDERS FOUND for user:', user.email);
      }
      console.log('\n=================================================\n');

      // Format the response by combining tracking and order data
      const formattedOrders = trackingOrders.map((tracking: any) => {
        const order = tracking.order;
        return {
          orderNumber: order?.orderNumber || 'N/A',
          email: user.email, // From authenticated user
          customerName: `${user.firstName || user.name || ''} ${user.lastName || ''}`.trim(), // From authenticated user
          status: tracking.status, // From TrackingOrder
          orderType: order?.orderType || 'normal', // From Order
          amount: order?.totalAmount || order?.amount || 0, // From Order
          productName: order?.items && order.items.length > 0 ? order.items[0].productName || 'Product' : 'Product', // From Order.items
          docketNumber: tracking.docketNumber, // From TrackingOrder
          createdAt: tracking.createdAt,
          updatedAt: tracking.updatedAt
        };
      });

      const response: ApiResponse = createSuccessResponse(
        formattedOrders,
        `Found ${formattedOrders.length} orders for your account`
      );
      res.status(HTTP_STATUS.OK).json(response);

    } catch (error) {
      logError(error as Error, 'getAllTestOrders');
      next(error);
    }
  };

  /**
   * Download Proof of Delivery (POD) for delivered orders
   */
  downloadProofOfDelivery = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orderNumber, docketNumber, email } = req.body;

      // Validate required fields
      if (!orderNumber || !docketNumber || !email) {
        const response: ApiResponse = createErrorResponse(
          'Order number, docket number, and email are required'
        );
        res.status(HTTP_STATUS.BAD_REQUEST).json(response);
        return;
      }

      // Find the order
      const { TrackingOrder } = await import('../models/TrackingOrder');
      const trackingOrder = await TrackingOrder.findOne({ docketNumber }).populate('order');

      if (!trackingOrder) {
        const response: ApiResponse = createErrorResponse(
          'Order not found'
        );
        res.status(HTTP_STATUS.NOT_FOUND).json(response);
        return;
      }

      // Check if order is delivered
      if (trackingOrder.status !== OrderStatus.DELIVERED) {
        const response: ApiResponse = createErrorResponse(
          'Proof of Delivery is only available for delivered orders'
        );
        res.status(HTTP_STATUS.BAD_REQUEST).json(response);
        return;
      }

      // Check if POD link is already cached
      if (trackingOrder.podLink) {
        const response: ApiResponse = createSuccessResponse(
          { link: trackingOrder.podLink },
          'POD retrieved from cache'
        );
        res.status(HTTP_STATUS.OK).json(response);
        return;
      }

      // Get delivery date
      const deliveryDate = trackingOrder.deliveredAt 
        ? new Date(trackingOrder.deliveredAt).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      // Fetch POD from Sequel247 (or set to null if not available)
      const podLink = await this.trackingService.downloadPOD(
        [docketNumber],
        deliveryDate,
        deliveryDate
      );

      if (podLink) {
        // Cache the POD link in database
        trackingOrder.podLink = podLink;
        await trackingOrder.save();

        const response: ApiResponse = createSuccessResponse(
          { link: podLink },
          'Proof of Delivery is ready for download'
        );
        res.status(HTTP_STATUS.OK).json(response);
      } else {
        const response: ApiResponse = createErrorResponse(
          'Proof of Delivery is being processed. Please try again in 1-2 hours.'
        );
        res.status(HTTP_STATUS.NOT_FOUND).json(response);
      }

    } catch (error) {
      logError(error as Error, 'downloadProofOfDelivery');
      next(error);
    }
  };

  /**
   * Handle return order request
   * Send email notification to admin
   */
  returnOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orderNumber, email, reason, hasManufacturerFault, customerName, orderAmount } = req.body;

      // Validate required fields
      if (!orderNumber || !email || !reason) {
        const response: ApiResponse = createErrorResponse(
          'Order number, email, and reason are required'
        );
        res.status(HTTP_STATUS.BAD_REQUEST).json(response);
        return;
      }

      // Find the order
      const { TrackingOrder } = await import('../models/TrackingOrder');
      const { UserModel } = await import('../models/userModel');
      
      const user = await UserModel.findOne({ email: email.toLowerCase() });
      if (!user) {
        const response: ApiResponse = createErrorResponse('User not found');
        res.status(HTTP_STATUS.NOT_FOUND).json(response);
        return;
      }

      const trackingOrder = await TrackingOrder.findOne({ 
        orderNumber: new RegExp(`^${orderNumber}$`, 'i')
      }).populate('order');

      if (!trackingOrder) {
        const response: ApiResponse = createErrorResponse('Order not found');
        res.status(HTTP_STATUS.NOT_FOUND).json(response);
        return;
      }

      // Check if order is delivered
      if (trackingOrder.status !== OrderStatus.DELIVERED) {
        const response: ApiResponse = createErrorResponse(
          'Returns are only available for delivered orders'
        );
        res.status(HTTP_STATUS.BAD_REQUEST).json(response);
        return;
      }

      // Send email notification to admin
      try {
        const nodemailer = await import('nodemailer');
        
        // Create transporter
        const transporter = nodemailer.default.createTransport({
          host: process.env.EMAIL_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.EMAIL_PORT || '587'),
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
          tls: {
            rejectUnauthorized: false // Fix for self-signed certificate error
          },
        });

        // Email content
        const returnCharges = hasManufacturerFault ? 0 : 1800;
        const refundAmount = hasManufacturerFault ? orderAmount : (orderAmount - returnCharges);

        const mailOptions = {
          from: process.env.EMAIL_FROM || 'noreply@kynajewels.com',
          to: 'addytiwari1810@gmail.com', // Admin email
          subject: `🔄 Return Request - Order ${orderNumber}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #f97316;">Return Order Request</h2>
              
              <div style="background-color: #fff7ed; padding: 15px; border-left: 4px solid #f97316; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #ea580c;">Order Details</h3>
                <p><strong>Order Number:</strong> ${orderNumber}</p>
                <p><strong>Customer Name:</strong> ${customerName}</p>
                <p><strong>Customer Email:</strong> ${email}</p>
                <p><strong>Order Amount:</strong> ₹${orderAmount?.toLocaleString('en-IN') || 'N/A'}</p>
                ${trackingOrder.docketNumber ? `<p><strong>Docket Number:</strong> ${trackingOrder.docketNumber}</p>` : ''}
              </div>

              <div style="background-color: #f0fdf4; padding: 15px; border-left: 4px solid #22c55e; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #16a34a;">Return Information</h3>
                <p><strong>Manufacturer Fault:</strong> ${hasManufacturerFault ? 'YES ✅' : 'NO ❌'}</p>
                <p><strong>Return Charges:</strong> ₹${returnCharges.toLocaleString('en-IN')}</p>
                <p><strong>Refund Amount:</strong> ₹${refundAmount.toLocaleString('en-IN')}</p>
              </div>

              <div style="background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #d97706;">Return Reason</h3>
                <p style="white-space: pre-wrap;">${reason}</p>
              </div>

              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Action Required:</strong></p>
                <p style="margin: 5px 0 0 0;">Please contact the customer and arrange the return pickup.</p>
              </div>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              
              <p style="color: #6b7280; font-size: 12px;">
                This is an automated notification from Kyna Jewels Return Management System.<br>
                Received: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
              </p>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Return request email sent to admin for order ${orderNumber}`);

        // Send confirmation email to customer
        const customerMailOptions = {
          from: process.env.EMAIL_FROM || 'noreply@kynajewels.com',
          to: email,
          subject: `Return Request Received - Order ${orderNumber}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #f97316;">Return Request Received</h2>
              
              <p>Dear ${customerName},</p>
              
              <p>We have received your return request for order <strong>${orderNumber}</strong>.</p>

              <div style="background-color: #fff7ed; padding: 15px; border-left: 4px solid #f97316; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #ea580c;">Return Details</h3>
                <p><strong>Order Number:</strong> ${orderNumber}</p>
                <p><strong>Order Amount:</strong> ₹${orderAmount?.toLocaleString('en-IN') || 'N/A'}</p>
                <p><strong>Return Charges:</strong> ${hasManufacturerFault ? '₹0 (Manufacturer Fault)' : '₹1,800'}</p>
                <p><strong>Expected Refund:</strong> ₹${hasManufacturerFault ? orderAmount?.toLocaleString('en-IN') : (orderAmount - 1800).toLocaleString('en-IN')}</p>
              </div>

              <div style="background-color: #dbeafe; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0;">
                <p style="margin: 0;"><strong>📧 We're on it!</strong></p>
                <p style="margin: 5px 0 0 0;">Our team is reviewing your return request and will contact you shortly to arrange the pickup.</p>
              </div>

              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Your Return Reason:</strong></p>
                <p style="margin: 5px 0 0 0; white-space: pre-wrap;">${reason}</p>
              </div>

              <p>If you have any questions, please don't hesitate to contact us.</p>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              
              <p style="color: #6b7280; font-size: 12px;">
                Thank you for shopping with Kyna Jewels.<br>
                This is an automated confirmation email.<br>
                Sent: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
              </p>
            </div>
          `,
        };

        await transporter.sendMail(customerMailOptions);
        console.log(`✅ Return confirmation email sent to customer: ${email}`);

      } catch (emailError) {
        console.error('Failed to send return request email:', emailError);
        // Don't fail the request if email fails
      }

      // Update the tracking order to mark return request
      trackingOrder.returnRequest = {
        requested: true,
        reason: reason,
        hasManufacturerFault: hasManufacturerFault || false,
        requestedAt: new Date()
      };
      await trackingOrder.save();
      console.log(`✅ Return request marked in database for order ${orderNumber}`);

      const response: ApiResponse = createSuccessResponse(
        { 
          orderNumber,
          returnCharges: hasManufacturerFault ? 0 : 1800 
        },
        'Return request submitted successfully. We have sent you a confirmation email. Our team will contact you soon.'
      );
      res.status(HTTP_STATUS.OK).json(response);

    } catch (error) {
      logError(error as Error, 'returnOrder');
      next(error);
    }
  };
}

// Error handling middleware
export const handleError = (
  error: Error, 
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  logError(error, 'TrackingController');

  let statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message: string = ERROR_MESSAGES.INTERNAL_ERROR;
  let errors: Record<string, string> | undefined;

  if (error instanceof ValidationError) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = error.message;
  } else if (error instanceof NotFoundError) {
    statusCode = HTTP_STATUS.NOT_FOUND;
    message = error.message;
  } else if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  }

  const response: ApiResponse = createErrorResponse(message, errors);
  res.status(statusCode).json(response);
};

// 404 handler
export const handleNotFound = (req: Request, res: Response): void => {
  const response: ApiResponse = createErrorResponse('Endpoint not found');
  res.status(HTTP_STATUS.NOT_FOUND).json(response);
};
