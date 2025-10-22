import express, { Request, Response } from 'express';
import { getRazorpayInstance, createOrderPayload, verifyWebhookSignature, validatePaymentAmount, PAYMENT_METHOD_LIMITS, DEFAULT_MAX_AMOUNT } from '../utils/razorpay';
import PaymentOrder, { OrderStatus, IPaymentResponse } from '../models/PaymentOrder';
import OrderModel from '../models/orderModel';
import User from '../models/userModel';

const router = express.Router();

/**
 * Utility function to detect order category and type based on order data
 */
function detectOrderCategoryAndType(orderData: any): { category: string; type: string } {
  // Default values
  let category = 'products';
  let type = 'normal';
  
  // Check orderId patterns
  const orderId = orderData.orderId || '';
  const orderIdLower = orderId.toLowerCase();
  
  // Check if customData indicates custom jewelry
  if (orderData.customData?.customizationComplete || orderData.customData?.jewelryType) {
    category = 'design-your-own';
    type = 'customized';
  }
  // Check for build-your-own patterns
  else if (orderIdLower.includes('build') || orderIdLower.includes('jewelry') || 
           orderData.items?.some((item: any) => item.name?.toLowerCase().includes('build'))) {
    category = 'build-your-own';
    type = 'customized';
  }
  // Check for design patterns
  else if (orderIdLower.includes('design') || orderIdLower.includes('custom') ||
           orderData.items?.some((item: any) => item.name?.toLowerCase().includes('custom'))) {
    category = 'design-your-own';
    type = 'customized';
  }
  // Check redirectUrl for hints
  else if (orderData.redirectUrl) {
    const redirectUrl = orderData.redirectUrl.toLowerCase();
    if (redirectUrl.includes('design') || redirectUrl.includes('custom')) {
      category = 'design-your-own';
      type = 'customized';
    } else if (redirectUrl.includes('build') || redirectUrl.includes('jewelry')) {
      category = 'build-your-own';
      type = 'customized';
    }
  }
  
  return { category, type };
}

/**
 * POST /api/payment/initiate
 * Initiates payment with CCAvenue
 */
router.post('/initiate', async (req: Request, res: Response) => {
  try {
    // Check if Razorpay is configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        error: 'Payment gateway not configured',
        message: 'Razorpay credentials are missing'
      });
    }

    const {
      orderId,
      amount,
      currency = 'INR',
      billingInfo,
      redirectUrl,
      cancelUrl,
      userId,
      orderCategory,
      orderType,
      // Additional data for smart detection
      customData,
      items,
      // Order details with all customization data
      orderDetails
    } = req.body;

    // Smart detection of category and type if not provided
    let finalOrderCategory = orderCategory;
    let finalOrderType = orderType;
    
    if (!orderCategory || !orderType) {
      const detected = detectOrderCategoryAndType({
        orderId,
        redirectUrl,
        customData,
        items
      });
      
      finalOrderCategory = orderCategory || detected.category;
      finalOrderType = orderType || detected.type;
    }

    // Validate required fields
    if (!orderId || !amount || !billingInfo || !redirectUrl || !cancelUrl || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['orderId', 'amount', 'billingInfo', 'redirectUrl', 'cancelUrl', 'userId']
      });
    }

    // Parse and validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount',
        message: 'Amount must be a positive number'
      });
    }

    // Validate amount using the utility function
    const amountValidation = validatePaymentAmount(amountNum);
    if (!amountValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment amount',
        message: amountValidation.error,
        amount: amountNum,
        recommendedPaymentMethods: amountValidation.recommendedMethods || ['netbanking', 'cards'],
        supportContact: 'support@kynajewels.com'
      });
    }

    // Log payment method recommendations if any methods are exceeded
    if (amountValidation.exceededMethods && amountValidation.exceededMethods.length > 0) {
      console.warn(`Payment amount ₹${amountNum} exceeds limits for: ${amountValidation.exceededMethods.join(', ')}. Recommended methods: ${amountValidation.recommendedMethods?.join(', ')}`);
    }

    // Validate orderCategory and orderType
    const validCategories = ['design-your-own', 'build-your-own', 'products'];
    const validTypes = ['customized', 'normal'];
    
    if (!validCategories.includes(finalOrderCategory)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid orderCategory',
        detected: finalOrderCategory,
        validValues: validCategories
      });
    }
    
    if (!validTypes.includes(finalOrderType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid orderType',
        detected: finalOrderType,
        validValues: validTypes
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

      // Create order in database
    const order = new PaymentOrder({
      orderId,
      orderNumber: orderId, // Set orderNumber same as orderId
      orderCategory: finalOrderCategory,
      orderType: finalOrderType,
      userId,
      amount: parseFloat(amount),
      currency: currency.toUpperCase(),
      status: OrderStatus.PENDING,
      billingInfo,
      redirectUrl,
      cancelUrl,
      orderDetails: orderDetails || null
    });

    await order.save();

    // Create a Razorpay order and return order details to frontend
    const razorpay = getRazorpayInstance();
    const payload = createOrderPayload(Number(amount), currency);

    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create(payload);
    } catch (razorpayError: any) {
      console.error('Razorpay order creation failed:', razorpayError);
      
      // Handle specific Razorpay errors
      if (razorpayError.error) {
        const errorCode = razorpayError.error.code;
        const errorDescription = razorpayError.error.description;
        
        if (errorCode === 'BAD_REQUEST_ERROR' && errorDescription?.includes('amount')) {
          return res.status(400).json({
            success: false,
            error: 'Invalid payment amount',
            message: `Payment amount ₹${amountNum} is invalid. ${errorDescription}`,
            amount: amountNum,
            razorpayError: errorDescription,
            recommendedPaymentMethods: ['netbanking', 'cards']
          });
        }
        
        if (errorCode === 'BAD_REQUEST_ERROR' && errorDescription?.includes('maximum')) {
          return res.status(400).json({
            success: false,
            error: 'Amount exceeds maximum limit',
            message: `Payment amount ₹${amountNum} exceeds the maximum allowed limit. Please use Net Banking or Card payment for this amount.`,
            amount: amountNum,
            razorpayError: errorDescription,
            recommendedPaymentMethods: ['netbanking', 'cards'],
            supportContact: 'support@kynajewels.com'
          });
        }
      }
      
      // Generic Razorpay error
      return res.status(500).json({
        success: false,
        error: 'Payment gateway error',
        message: 'Failed to create payment order. Please try again or contact support.',
        razorpayError: razorpayError.message || 'Unknown Razorpay error',
        supportContact: 'support@kynajewels.com'
      });
    }

    // Store razorpay order id in both paymentResponse and dedicated field
    order.paymentResponse = { orderId: razorpayOrder.id, amount: String(amount), currency } as any;
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    // Ensure a main OrderModel exists with orderNumber === orderId to avoid duplicate-null unique index errors
    try {
      const shippingAddress = {
        label: 'Billing',
        street: billingInfo.address || 'N/A',
        city: billingInfo.city || 'N/A',
        state: billingInfo.state || 'N/A',
        postalCode: billingInfo.zip || 'N/A',
        country: billingInfo.country || 'N/A'
      };

      await OrderModel.findOneAndUpdate(
        { orderNumber: orderId },
        {
          $setOnInsert: {
            user: userId,
            orderNumber: orderId,
            items: [],
            shippingAddress,
            paymentMethod: 'UPI',
            paymentStatus: 'pending',
            orderStatus: 'pending',
            subtotal: parseFloat(amount),
            gst: 0,
            shippingCharge: 0,
            totalAmount: parseFloat(amount),
            orderedAt: new Date(),
            statusHistory: [{ status: 'pending', date: new Date(), note: 'Order created via payment initiation' }]
          }
        },
        { upsert: true, new: true }
      );
    } catch (e) {
      console.warn('Failed to upsert main OrderModel for payment initiation:', e);
    }

    res.json({
      success: true,
      data: {
        razorpayOrderId: razorpayOrder.id,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
        orderId: order.orderId,
        orderNumber: order.orderNumber,
        orderCategory: order.orderCategory,
        orderType: order.orderType,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Kyna Jewels',
        description: `Payment for Order ${order.orderId}`,
        prefill: {
          name: billingInfo.name,
          email: billingInfo.email,
          contact: billingInfo.phone
        },
        theme: {
          color: '#328F94'
        },
        notes: {
          orderId: order.orderId,
          userId: userId
        }
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
// Razorpay webhook endpoint
router.post('/callback', express.raw({ type: '*/*' }), async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string | undefined;
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

    if (!signature) {
      return res.status(400).json({ success: false, error: 'Missing signature' });
    }

    const payload = req.body as Buffer;

    const isValid = verifyWebhookSignature(payload, signature, secret);

    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Invalid signature' });
    }

    const event = JSON.parse(payload.toString());

    // Handle payment captured / failed events
    if (event.event === 'payment.captured' || event.event === 'payment.failed') {
      const payment = event.payload.payment.entity;
      const razorpayOrderId = payment.order_id;

      // Find our order by razorpay order id stored in paymentResponse.orderId
      const order = await PaymentOrder.findOne({ 'paymentResponse.orderId': razorpayOrderId });

      if (!order) {
        return res.status(404).json({ success: false, error: 'PaymentOrder not found' });
      }

      const newStatus = event.event === 'payment.captured' ? OrderStatus.SUCCESS : OrderStatus.FAILED;

      const paymentResp: IPaymentResponse = {
        orderId: order.orderId,
        trackingId: payment.id,
        orderStatus: newStatus === OrderStatus.SUCCESS ? 'Success' : 'Failure',
        paymentMode: payment.method,
        cardName: payment.card ? payment.card.network : undefined,
        statusMessage: payment.error_description || payment.status || undefined,
        amount: String(payment.amount / 100),
        currency: payment.currency
      } as any;

      await order.updateStatus(newStatus, paymentResp);

      return res.json({ success: true });
    }

    res.json({ success: true, message: 'event ignored' });

  } catch (error) {
    console.error('Payment callback error:', error);
    res.status(500).json({ success: false, error: 'Failed to process webhook', message: error instanceof Error ? error.message : 'Unknown' });
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

    // For Razorpay, handle redirect by reading query params (Razorpay typically uses webhooks)
      // We'll attempt to read razorpay_payment_id and razorpay_order_id if present and update order
      const razorpayPaymentId = req.query['razorpay_payment_id'] as string | undefined;
      const razorpayOrderId = req.query['razorpay_order_id'] as string | undefined;

      if (!razorpayOrderId) {
        return res.status(400).json({ success: false, error: 'Missing razorpay_order_id' });
      }

      const order = await PaymentOrder.findOne({ 'paymentResponse.orderId': razorpayOrderId });
      if (!order) {
        return res.status(404).json({ success: false, error: 'PaymentOrder not found' });
      }

      // If payment id present, assume success (actual verification should query Razorpay API)
      if (razorpayPaymentId) {
        await order.updateStatus(OrderStatus.SUCCESS, { orderId: order.orderId, trackingId: razorpayPaymentId } as any);
      }

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

/**
 * POST /api/payment/verify
 * Verify Razorpay payment signature
 */
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature']
      });
    }

    // Get Razorpay instance
    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      return res.status(500).json({
        success: false,
        error: 'Payment gateway not configured'
      });
    }

    // Verify signature
    const isValidSignature = verifyWebhookSignature(
      razorpay_order_id + '|' + razorpay_payment_id,
      razorpay_signature,
      process.env.RAZORPAY_KEY_SECRET!
    );

    if (!isValidSignature) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature'
      });
    }

    // Find the payment order
    const paymentOrder = await PaymentOrder.findOne({ 
      razorpayOrderId: razorpay_order_id 
    });

    if (!paymentOrder) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Update payment order status
    paymentOrder.status = OrderStatus.SUCCESS;
    paymentOrder.razorpayPaymentId = razorpay_payment_id;
    paymentOrder.razorpaySignature = razorpay_signature;
    paymentOrder.paidAt = new Date();
    
    await paymentOrder.save();

    // Add order to user's orders array
    try {
      await User.findByIdAndUpdate(
        paymentOrder.userId,
        { $push: { orders: paymentOrder._id } }
      );
      console.log(`Payment order ${paymentOrder._id} added to user ${paymentOrder.userId} orders array`);
    } catch (userUpdateError) {
      console.warn('Failed to update user orders array:', userUpdateError);
      // Don't fail the verification if user update fails
    }

    // Create TrackingOrder for this payment order
    try {
      console.log('\n🔍 Creating TrackingOrder for payment order...');
      console.log('   Payment Order ID:', paymentOrder._id);
      console.log('   Order Number:', paymentOrder.orderNumber);
      console.log('   Order Type:', paymentOrder.orderType);
      console.log('   Customer Email:', paymentOrder.billingInfo?.email);
      
      const { TrackingOrder } = await import('../models/TrackingOrder');
      const { OrderStatus: TrackingOrderStatus } = await import('../types/tracking');
      
      // Check if TrackingOrder already exists
      const existingTracking = await TrackingOrder.findOne({ order: paymentOrder._id });
      if (existingTracking) {
        console.log('   ⚠️ TrackingOrder already exists:', existingTracking._id);
      } else {
        const trackingOrder = new TrackingOrder({
          userId: paymentOrder.userId,
          orderModel: 'PaymentOrder', // Specify model type for polymorphic reference
          order: paymentOrder._id,
          orderNumber: paymentOrder.orderNumber,
          orderType: paymentOrder.orderType || 'customized', // PaymentOrders are usually customized
          customerEmail: paymentOrder.billingInfo?.email || '',
          status: TrackingOrderStatus.ORDER_PLACED,
          trackingHistory: [{
            status: TrackingOrderStatus.ORDER_PLACED,
            description: 'Payment completed - Order placed',
            timestamp: new Date(),
            code: TrackingOrderStatus.ORDER_PLACED
          }]
        });

        await trackingOrder.save();
        console.log('   ✅ TrackingOrder created successfully!');
        console.log('   TrackingOrder ID:', trackingOrder._id);
        console.log('   Status:', trackingOrder.status);
      }
    } catch (trackingError) {
      console.error('   ❌ Failed to create TrackingOrder:');
      console.error('   Error:', trackingError);
      console.error('   Error message:', (trackingError as Error).message);
      console.error('   Stack:', (trackingError as Error).stack);
      // Don't fail the verification if tracking creation fails
    }

    // Update the main order if it exists
    try {
      await OrderModel.findOneAndUpdate(
        { orderId: paymentOrder.orderId },
        { 
          status: 'paid',
          paymentStatus: 'completed',
          razorpayPaymentId: razorpay_payment_id,
          updatedAt: new Date()
        },
        { upsert: false }
      );
    } catch (orderUpdateError) {
      console.warn('Failed to update main order:', orderUpdateError);
      // Don't fail the verification if main order update fails
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        orderId: paymentOrder.orderId,
        orderNumber: paymentOrder.orderNumber,
        orderCategory: paymentOrder.orderCategory,
        orderType: paymentOrder.orderType,
        orderDetails: paymentOrder.orderDetails,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        status: paymentOrder.status,
        paidAt: paymentOrder.paidAt
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Payment verification failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
