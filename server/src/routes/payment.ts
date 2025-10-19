import express, { Request, Response } from 'express';
import { 
  encrypt, 
  decrypt, 
  createQueryString, 
  validateCallbackResponse, 
  getCCAvenueConfig,
  PaymentRequest 
} from '../utils/ccavenue';
import PaymentOrder, { OrderStatus, IPaymentResponse } from '../models/PaymentOrder';

const router = express.Router();

/**
 * POST /api/payment/initiate
 * Initiates payment with CCAvenue
 */
router.post('/initiate', async (req: Request, res: Response) => {
  try {
    const {
      orderId,
      amount,
      currency = 'INR',
      billingInfo,
      redirectUrl,
      cancelUrl,
      userId
    } = req.body;

    // Validate required fields
    if (!orderId || !amount || !billingInfo || !redirectUrl || !cancelUrl || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['orderId', 'amount', 'billingInfo', 'redirectUrl', 'cancelUrl', 'userId']
      });
    }

    // Validate billing info
    const requiredBillingFields = ['name', 'address', 'city', 'state', 'zip', 'country', 'phone', 'email'];
    const missingBillingFields = requiredBillingFields.filter(field => !billingInfo[field]);
    
    if (missingBillingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required billing fields',
        missing: missingBillingFields
      });
    }

    // Check if order already exists
    const existingOrder = await PaymentOrder.findByOrderId(orderId);
    if (existingOrder) {
      return res.status(400).json({
        success: false,
        error: 'Order ID already exists'
      });
    }

    // Get CCAvenue configuration
    const config = getCCAvenueConfig();

    // Create order in database
    const order = new PaymentOrder({
      orderId,
      userId,
      amount: parseFloat(amount),
      currency: currency.toUpperCase(),
      status: OrderStatus.PENDING,
      billingInfo,
      redirectUrl,
      cancelUrl
    });

    await order.save();

    // Prepare payment request
    const paymentRequest: PaymentRequest = {
      orderId,
      amount,
      currency,
      billingName: billingInfo.name,
      billingAddress: billingInfo.address,
      billingCity: billingInfo.city,
      billingState: billingInfo.state,
      billingZip: billingInfo.zip,
      billingCountry: billingInfo.country,
      billingTel: billingInfo.phone,
      billingEmail: billingInfo.email,
      redirectUrl,
      cancelUrl
    };

    // Create query string for encryption
    const queryString = createQueryString(paymentRequest);
    
    // Encrypt the query string
    const encryptedData = encrypt(queryString, config.workingKey);

    // Return response to frontend
    res.json({
      success: true,
      data: {
        encryptedData,
        accessCode: config.accessCode,
        orderId,
        paymentUrl: config.paymentUrl
      },
      message: 'Payment initiated successfully'
    });

  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate payment',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/payment/callback
 * Handles CCAvenue payment callback
 */
router.post('/callback', async (req: Request, res: Response) => {
  try {
    // CCAvenue sends data as form-encoded, not JSON
    const { encResp } = req.body;

    if (!encResp) {
      return res.status(400).json({
        success: false,
        error: 'Missing encrypted response'
      });
    }

    // Get CCAvenue configuration
    const config = getCCAvenueConfig();

    // Decrypt the response
    const decryptedResponse = decrypt(encResp, config.workingKey);
    
    // Validate and parse the response
    const callbackData = validateCallbackResponse(decryptedResponse);

    // Find the order
    const order = await PaymentOrder.findByOrderId(callbackData.orderId || '');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'PaymentOrder not found'
      });
    }

    // Determine payment status
    let newStatus: OrderStatus;
    if (callbackData.orderStatus === 'Success') {
      newStatus = OrderStatus.SUCCESS;
    } else if (callbackData.orderStatus === 'Failure') {
      newStatus = OrderStatus.FAILED;
    } else {
      newStatus = OrderStatus.PENDING;
    }

    // Update order with payment response
    await order.updateStatus(newStatus, callbackData as IPaymentResponse);

    // Return success response
    res.json({
      success: true,
      data: {
        orderId: order.orderId,
        status: order.status,
        paymentResponse: order.paymentResponse
      },
      message: 'Payment callback processed successfully'
    });

  } catch (error) {
    console.error('Payment callback error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process payment callback',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/payment/callback
 * Handles CCAvenue payment callback (GET request for redirects)
 */
router.get('/callback', async (req: Request, res: Response) => {
  try {
    // CCAvenue redirects with query parameters
    const { encResp } = req.query;

    if (!encResp || typeof encResp !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing encrypted response'
      });
    }

    // Get CCAvenue configuration
    const config = getCCAvenueConfig();

    // Decrypt the response
    const decryptedResponse = decrypt(encResp, config.workingKey);
    
    // Validate and parse the response
    const callbackData = validateCallbackResponse(decryptedResponse);

    // Find the order
    const order = await PaymentOrder.findByOrderId(callbackData.orderId || '');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'PaymentOrder not found'
      });
    }

    // Determine payment status
    let newStatus: OrderStatus;
    if (callbackData.orderStatus === 'Success') {
      newStatus = OrderStatus.SUCCESS;
    } else if (callbackData.orderStatus === 'Failure') {
      newStatus = OrderStatus.FAILED;
    } else {
      newStatus = OrderStatus.PENDING;
    }

    // Update order with payment response
    await order.updateStatus(newStatus, callbackData as IPaymentResponse);

    // Redirect to frontend with status
    const redirectUrl = new URL(order.redirectUrl);
    redirectUrl.searchParams.set('orderId', order.orderId);
    redirectUrl.searchParams.set('status', order.status);
    
    res.redirect(redirectUrl.toString());

  } catch (error) {
    console.error('Payment callback error:', error);
    // Redirect to failure page on error
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/payment-failure?error=callback_error`);
  }
});

/**
 * GET /api/payment/status/:orderId
 * Get payment status for an order
 */
router.get('/status/:orderId', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const order = await PaymentOrder.findByOrderId(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'PaymentOrder not found'
      });
    }

    res.json({
      success: true,
      data: {
        orderId: order.orderId,
        status: order.status,
        amount: order.amount,
        currency: order.currency,
        paymentResponse: order.paymentResponse,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }
    });

  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get payment status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/payment/orders/:userId
 * Get all orders for a user
 */
router.get('/orders/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { limit = 10, page = 1 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    
    const orders = await PaymentOrder.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const totalPaymentOrders = await PaymentOrder.countDocuments({ userId });

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalPaymentOrders / Number(limit)),
          totalPaymentOrders,
          hasNext: skip + orders.length < totalPaymentOrders,
          hasPrev: Number(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user orders',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
