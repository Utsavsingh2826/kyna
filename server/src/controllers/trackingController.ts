import { Request, Response, NextFunction } from 'express';
import { TrackingService } from '../services/TrackingService';
import { 
  ApiResponse, 
  TrackingRequest, 
  AppError, 
  ValidationError,
  NotFoundError 
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
   * Test webhook configuration
   */
  testWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const webhookModule = await import('../services/WebhookService');
      
      const webhookConfig: any = {
        url: process.env.WEBHOOK_URL || '',
        secret: process.env.WEBHOOK_SECRET || '',
        events: ['tracking.status_change', 'order.shipped', 'order.delivered', 'order.cancelled'],
        retryAttempts: 3,
        timeout: 10000
      };

      const webhookService = new webhookModule.WebhookService(webhookConfig);
      const success = await webhookService.testWebhook();

      const response: ApiResponse = createSuccessResponse(
        { success, config: webhookConfig },
        success ? 'Webhook test successful' : 'Webhook test failed'
      );
      
      res.status(success ? HTTP_STATUS.OK : HTTP_STATUS.BAD_REQUEST).json(response);

    } catch (error) {
      next(error);
    }
  };

  /**
   * Get webhook configuration
   */
  getWebhookConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const config = {
        url: process.env.WEBHOOK_URL || '',
        events: ['tracking.status_change', 'order.shipped', 'order.delivered', 'order.cancelled'],
        retryAttempts: 3,
        timeout: 10000,
        enabled: !!(process.env.WEBHOOK_URL && process.env.WEBHOOK_SECRET)
      };

      const response: ApiResponse = createSuccessResponse(config);
      res.status(HTTP_STATUS.OK).json(response);

    } catch (error) {
      next(error);
    }
  };

  /**
   * Get audit trail for an order
   */
  getOrderAuditTrail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orderNumber } = req.params;
      const { limit = 50 } = req.query;

      if (!orderNumber) {
        const response: ApiResponse = createErrorResponse('Order number is required');
        res.status(HTTP_STATUS.BAD_REQUEST).json(response);
        return;
      }

      const { AuditService } = await import('../services/AuditService');
      const auditService = new AuditService();
      const auditTrail = await auditService.getOrderAuditTrail(orderNumber, parseInt(limit as string));

      const response: ApiResponse = createSuccessResponse(auditTrail);
      res.status(HTTP_STATUS.OK).json(response);

    } catch (error) {
      next(error);
    }
  };

  /**
   * Search audit logs
   */
  searchAuditLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { 
        entityType, 
        action, 
        userId, 
        orderNumber, 
        docketNumber, 
        startDate, 
        endDate, 
        limit = 100 
      } = req.query;

      const { AuditService } = await import('../services/AuditService');
      const auditService = new AuditService();
      
      const filters = {
        entityType: entityType as string,
        action: action as string,
        userId: userId as string,
        orderNumber: orderNumber as string,
        docketNumber: docketNumber as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        limit: parseInt(limit as string)
      };

      const auditLogs = await auditService.searchAuditLogs(filters);

      const response: ApiResponse = createSuccessResponse(auditLogs);
      res.status(HTTP_STATUS.OK).json(response);

    } catch (error) {
      next(error);
    }
  };

  /**
   * Get audit statistics
   */
  getAuditStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { AuditService } = await import('../services/AuditService');
      const auditService = new AuditService();
      const stats = await auditService.getAuditStats();

      const response: ApiResponse = createSuccessResponse(stats);
      res.status(HTTP_STATUS.OK).json(response);

    } catch (error) {
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
