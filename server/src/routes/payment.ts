import express, { Request, Response } from "express";
import {
  getRazorpayInstance,
  createOrderPayload,
  verifyWebhookSignature,
  validatePaymentAmount,
  PAYMENT_METHOD_LIMITS,
  DEFAULT_MAX_AMOUNT,
} from "../utils/razorpay";
import PaymentOrder, {
  OrderStatus,
  IPaymentResponse,
} from "../models/PaymentOrder";
import OrderModel from "../models/orderModel";
import User from "../models/userModel";
import Cart from "../models/cartModel";
import GiftCard from "../models/giftCardModel";
import {
  consumeReferralCredits,
  queueReferralCredit,
  releasePendingReferralCredits,
} from "../utils/referralWallet";

const router = express.Router();

/**
 * Generate short order number (14 characters total)
 * Format: KYNA + 6-digit timestamp + 4 random chars
 * Example: KYNA567698F0SK
 */
function generateShortOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `KYNA${timestamp}${random}`;
}

/**
 * Utility function to detect order category and type based on order data
 */
function detectOrderCategoryAndType(orderData: any): {
  category: string;
  type: string;
} {
  // Default values
  let category = "products";
  let type = "normal";

  // Check orderId patterns
  const orderId = orderData.orderId || "";
  const orderIdLower = orderId.toLowerCase();

  // Check if customData indicates custom jewelry
  if (
    orderData.customData?.customizationComplete ||
    orderData.customData?.jewelryType
  ) {
    category = "design-your-own";
    type = "customized";
  }
  // Check for build-your-own patterns
  else if (
    orderIdLower.includes("build") ||
    orderIdLower.includes("jewelry") ||
    orderData.items?.some((item: any) =>
      item.name?.toLowerCase().includes("build")
    )
  ) {
    category = "build-your-own";
    type = "customized";
  }
  // Check for design patterns
  else if (
    orderIdLower.includes("design") ||
    orderIdLower.includes("custom") ||
    orderData.items?.some((item: any) =>
      item.name?.toLowerCase().includes("custom")
    )
  ) {
    category = "design-your-own";
    type = "customized";
  }
  // Check redirectUrl for hints
  else if (orderData.redirectUrl) {
    const redirectUrl = orderData.redirectUrl.toLowerCase();
    if (redirectUrl.includes("design") || redirectUrl.includes("custom")) {
      category = "design-your-own";
      type = "customized";
    } else if (
      redirectUrl.includes("build") ||
      redirectUrl.includes("jewelry")
    ) {
      category = "build-your-own";
      type = "customized";
    }
  }

  return { category, type };
}

const getDiamondSubtotalFromOrder = (orderDetails: any): number => {
  if (!orderDetails) return 0;
  const summaryValue = orderDetails.pricingSummary?.diamondSubtotal;
  if (typeof summaryValue === "number" && summaryValue > 0) {
    return summaryValue;
  }
  const directDiamond =
    orderDetails.directPurchaseData?.product?.priceBreakdown?.diamondCost;
  if (typeof directDiamond === "number" && directDiamond > 0) {
    return directDiamond;
  }
  return 0;
};

/**
 * POST /api/payment/initiate
 * Initiates payment with CCAvenue
 */
router.post("/initiate", async (req: Request, res: Response) => {
  try {
    // Check if Razorpay is configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        error: "Payment gateway not configured",
        message: "Razorpay credentials are missing",
      });
    }

    const {
      orderId,
      amount,
      currency = "INR",
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
      orderDetails,
      // PAN Card details
      panCardDetails,
      // Gift card details
      giftCardVoucher,
      giftCardAmount,
    } = req.body;

    // Debug: log the orderDetails being received
    console.log("🔍 Payment initiation - orderDetails received:");
    console.log(JSON.stringify(orderDetails, null, 2));

    // Smart detection of category and type if not provided
    let finalOrderCategory = orderCategory;
    let finalOrderType = orderType;

    if (!orderCategory || !orderType) {
      const detected = detectOrderCategoryAndType({
        orderId,
        redirectUrl,
        customData,
        items,
      });

      finalOrderCategory = orderCategory || detected.category;
      finalOrderType = orderType || detected.type;
    }

    // Validate required fields
    if (
      !orderId ||
      !amount ||
      !billingInfo ||
      !redirectUrl ||
      !cancelUrl ||
      !userId
    ) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        required: [
          "orderId",
          "amount",
          "billingInfo",
          "redirectUrl",
          "cancelUrl",
          "userId",
        ],
      });
    }

    // Require estimated delivery (fetched from courier API) — do not allow storing orders without it
    if (!req.body.estimatedDelivery) {
      return res.status(400).json({
        success: false,
        error: "Missing estimatedDelivery",
        message:
          "Estimated delivery date is required to create orders. Please fetch EDD before initiating payment.",
      });
    }

    // Parse and validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid amount",
        message: "Amount must be a positive number",
      });
    }

    // Validate amount using the utility function
    const amountValidation = validatePaymentAmount(amountNum);
    if (!amountValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: "Invalid payment amount",
        message: amountValidation.error,
        amount: amountNum,
        recommendedPaymentMethods: amountValidation.recommendedMethods || [
          "netbanking",
          "cards",
        ],
        supportContact: "support@kynajewels.com",
      });
    }

    // Log payment method recommendations if any methods are exceeded
    if (
      amountValidation.exceededMethods &&
      amountValidation.exceededMethods.length > 0
    ) {
      console.warn(
        `Payment amount ₹${amountNum} exceeds limits for: ${amountValidation.exceededMethods.join(
          ", "
        )}. Recommended methods: ${amountValidation.recommendedMethods?.join(
          ", "
        )}`
      );
    }

    // Validate orderCategory and orderType
    const validCategories = ["design-your-own", "build-your-own", "products"];
    const validTypes = ["customized", "normal"];

    if (!validCategories.includes(finalOrderCategory)) {
      return res.status(400).json({
        success: false,
        error: "Invalid orderCategory",
        detected: finalOrderCategory,
        validValues: validCategories,
      });
    }

    if (!validTypes.includes(finalOrderType)) {
      return res.status(400).json({
        success: false,
        error: "Invalid orderType",
        detected: finalOrderType,
        validValues: validTypes,
      });
    }

    // Validate billing info
    const requiredBillingFields = [
      "name",
      "address",
      "city",
      "state",
      "zip",
      "country",
      "phone",
      "email",
    ];
    const missingBillingFields = requiredBillingFields.filter(
      (field) => !billingInfo[field]
    );

    if (missingBillingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Missing required billing fields",
        missing: missingBillingFields,
      });
    }

    // Validate Gift Card if provided
    if (giftCardVoucher) {
      const giftCard = await GiftCard.findOne({
        voucherCode: giftCardVoucher.toUpperCase(),
        status: 'active'
      });

      if (!giftCard) {
        return res.status(400).json({
          success: false,
          error: "Invalid gift card",
          message: "The gift card voucher is either invalid or already used."
        });
      }

      const expectedAmount = Number(giftCardAmount || 0);
      if (Math.abs(giftCard.amount - expectedAmount) > 0.01) {
        console.warn(`💰 Gift card amount mismatch. Provided: ${expectedAmount}, Actual: ${giftCard.amount}`);
        // Optionally update the amount to match the database if we trust the database more
        // For now, we'll just log it and use the database amount if logic allows, 
        // but it's safer to reject if the frontend calculation differs significantly.
      }
    }

    // Check if order already exists
    const existingOrder = await PaymentOrder.findByOrderId(orderId);
    if (existingOrder) {
      return res.status(400).json({
        success: false,
        error: "Order ID already exists",
      });
    }

    // Create order in database
    const shortOrderNumber = generateShortOrderNumber();
    const order = new PaymentOrder({
      orderId,
      orderNumber: shortOrderNumber, // Generate short 14-char order number
      orderCategory: finalOrderCategory,
      orderType: finalOrderType,
      userId,
      amount: parseFloat(amount),
      currency: currency.toUpperCase(),
      status: OrderStatus.PENDING,
      billingInfo,
      redirectUrl,
      cancelUrl,
      orderDetails: orderDetails || null,
      // Accept estimated delivery information if frontend provided it
      estimatedDelivery: req.body.estimatedDelivery || null,
      estimatedDeliveryDay: req.body.estimatedDeliveryDay || null,
      panCardDetails: panCardDetails || null,
      giftCardVoucher,
      giftCardAmount,
    });

    await order.save();

    // Create a Razorpay order and return order details to frontend
    const razorpay = getRazorpayInstance();
    const payload = createOrderPayload(Number(amount), currency);

    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create(payload);
    } catch (razorpayError: any) {
      console.error("Razorpay order creation failed:", razorpayError);

      // Handle specific Razorpay errors
      if (razorpayError.error) {
        const errorCode = razorpayError.error.code;
        const errorDescription = razorpayError.error.description;

        if (
          errorCode === "BAD_REQUEST_ERROR" &&
          errorDescription?.includes("amount")
        ) {
          return res.status(400).json({
            success: false,
            error: "Invalid payment amount",
            message: `Payment amount ₹${amountNum} is invalid. ${errorDescription}`,
            amount: amountNum,
            razorpayError: errorDescription,
            recommendedPaymentMethods: ["netbanking", "cards"],
          });
        }

        if (
          errorCode === "BAD_REQUEST_ERROR" &&
          errorDescription?.includes("maximum")
        ) {
          return res.status(400).json({
            success: false,
            error: "Amount exceeds maximum limit",
            message: `Payment amount ₹${amountNum} exceeds the maximum allowed limit. Please use Net Banking or Card payment for this amount.`,
            amount: amountNum,
            razorpayError: errorDescription,
            recommendedPaymentMethods: ["netbanking", "cards"],
            supportContact: "support@kynajewels.com",
          });
        }
      }

      // Generic Razorpay error
      return res.status(500).json({
        success: false,
        error: "Payment gateway error",
        message:
          "Failed to create payment order. Please try again or contact support.",
        razorpayError: razorpayError.message || "Unknown Razorpay error",
        supportContact: "support@kynajewels.com",
      });
    }

    // Store razorpay order id in both paymentResponse and dedicated field
    order.paymentResponse = {
      orderId: razorpayOrder.id,
      amount: String(amount),
      currency,
    } as any;
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    // Skip OrderModel creation for customization orders (design-your-own category)
    // Customizations should only create CustomizationRequest entries, not orders
    if (finalOrderCategory !== "design-your-own") {
      // Ensure a main OrderModel exists with orderNumber === shortOrderNumber to avoid duplicate-null unique index errors
      try {
        const billingAddressForOrder = {
          street: billingInfo.address || "N/A",
          city: billingInfo.city || "N/A",
          state: billingInfo.state || "N/A",
          country: billingInfo.country || "N/A",
          zipCode: billingInfo.zip || "N/A",
        };

        const shippingAddressForOrder = {
          street: billingInfo.address || "N/A",
          city: billingInfo.city || "N/A",
          state: billingInfo.state || "N/A",
          country: billingInfo.country || "N/A",
          zipCode: billingInfo.zip || "N/A",
          sameAsBilling: true,
        };

        // Prepare initial order data
        const initialOrderData: any = {
          user: userId,
          orderNumber: shortOrderNumber,
          items: [],
          billingAddress: billingAddressForOrder,
          shippingAddress: shippingAddressForOrder,
          paymentMethod: "CARDS",
          paymentStatus: "pending",
          orderStatus: "pending",
          subtotal: parseFloat(amount),
          gst: 0,
          shippingCharge: 0,
          totalAmount: parseFloat(amount),
          orderedAt: new Date(),
          statusHistory: [
            {
              status: "pending",
              date: new Date(),
              note: "Order created via payment initiation",
            },
          ],
          giftCardSummary: giftCardVoucher ? {
            code: giftCardVoucher,
            amount: giftCardAmount || 0,
          } : undefined,
          panCardDetails: panCardDetails || null,
        };

        // Add product details and items if cart data is provided
        if (orderDetails) {
          initialOrderData.productDetails = {
            jewelryType: orderDetails.jewelryType || "product",
            description: orderDetails.description || "Order placed via payment",
            isDirectPurchase: orderDetails.isDirectPurchase || false,
          };

          // Handle cart items for multi-item orders
          if (orderDetails.cartItems && !orderDetails.isDirectPurchase) {
            console.log(
              `🛒 Initial order creation with ${orderDetails.cartItems.length} cart items`
            );

            // Add cart items to productDetails
            initialOrderData.productDetails.cartItems =
              orderDetails.cartItems.map((item: any) => ({
                productId: item.productId,
                productTitle: item.productTitle,
                productSku: item.productSku,
                variantSku: item.variantSku,
                variantConfig: item.variantConfig,
                quantity: item.quantity,
                price: item.price,
                sellingPrice: item.sellingPrice,
                priceBreakdown: item.priceBreakdown,
                metalDetails: item.metalDetails,
                diamondDetails: item.diamondDetails,
                ringDetails: item.ringDetails,
              }));

            // Add cart items to main items array
            initialOrderData.items = orderDetails.cartItems.map(
              (item: any) => ({
                product: item.productId,
                productModel: "Product",
                productTitle: item.productTitle,
                productSku: item.productSku,
                variantSku: item.variantSku,
                variantConfig: item.variantConfig,
                quantity: item.quantity,
                price: item.price || item.sellingPrice,
                total: (item.price || item.sellingPrice) * item.quantity,
                metalDetails: item.metalDetails,
                diamondDetails: item.diamondDetails,
                ringDetails: item.ringDetails,
                priceBreakdown: item.priceBreakdown,
              })
            );
          }
          // Handle direct purchase
          else if (
            orderDetails.directPurchaseData &&
            orderDetails.isDirectPurchase
          ) {
            initialOrderData.productDetails = {
              ...initialOrderData.productDetails,
              product: orderDetails.directPurchaseData.product,
              customization: orderDetails.directPurchaseData.customization,
              size:
                orderDetails.directPurchaseData.customization?.size ||
                orderDetails.directPurchaseData.customization?.ringSize,
              // Add other direct purchase details...
            };
          }
        }

        await OrderModel.findOneAndUpdate(
          { orderNumber: shortOrderNumber },
          { $setOnInsert: initialOrderData },
          { upsert: true, new: true }
        );
        console.log(
          `✅ OrderModel created for ${finalOrderCategory} order: ${shortOrderNumber}`
        );
      } catch (e) {
        console.warn(
          "Failed to upsert main OrderModel for payment initiation:",
          e
        );
      }
    } else {
      console.log(
        `⏭️ Skipping OrderModel creation for customization order (${finalOrderCategory}): ${shortOrderNumber}`
      );
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
        name: "Kyna Jewels",
        description: `Payment for Order ${order.orderId}`,
        prefill: {
          name: billingInfo.name,
          email: billingInfo.email,
          contact: billingInfo.phone,
        },
        theme: {
          color: "#328F94",
        },
        notes: {
          orderId: order.orderId,
          userId: userId,
        },
      },
      message: "Payment initiated successfully",
    });
  } catch (error) {
    console.error("Payment initiation error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to initiate payment",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/payment/callback
 * Handles CCAvenue payment callback
 */
// Razorpay webhook endpoint
router.post(
  "/callback",
  express.raw({ type: "*/*" }),
  async (req: Request, res: Response) => {
    try {
      const signature = req.headers["x-razorpay-signature"] as
        | string
        | undefined;
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

      if (!signature) {
        return res
          .status(400)
          .json({ success: false, error: "Missing signature" });
      }

      const payload = req.body as Buffer;

      const isValid = verifyWebhookSignature(payload, signature, secret);

      if (!isValid) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid signature" });
      }

      const event = JSON.parse(payload.toString());

      // Handle payment captured / failed events
      if (
        event.event === "payment.captured" ||
        event.event === "payment.failed"
      ) {
        const payment = event.payload.payment.entity;
        const razorpayOrderId = payment.order_id;

        // Find our order by razorpay order id stored in paymentResponse.orderId
        const order = await PaymentOrder.findOne({
          "paymentResponse.orderId": razorpayOrderId,
        });

        if (!order) {
          return res
            .status(404)
            .json({ success: false, error: "PaymentOrder not found" });
        }

        const newStatus =
          event.event === "payment.captured"
            ? OrderStatus.SUCCESS
            : OrderStatus.FAILED;

        const paymentResp: IPaymentResponse = {
          orderId: order.orderId,
          trackingId: payment.id,
          orderStatus:
            newStatus === OrderStatus.SUCCESS ? "Success" : "Failure",
          paymentMode: payment.method,
          cardName: payment.card ? payment.card.network : undefined,
          statusMessage:
            payment.error_description || payment.status || undefined,
          amount: String(payment.amount / 100),
          currency: payment.currency,
        } as any;

        await order.updateStatus(newStatus, paymentResp);

        return res.json({ success: true });
      }

      res.json({ success: true, message: "event ignored" });
    } catch (error) {
      console.error("Payment callback error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to process webhook",
        message: error instanceof Error ? error.message : "Unknown",
      });
    }
  }
);

/**
 * GET /api/payment/callback
 * Handles CCAvenue payment callback (GET request for redirects)
 */
router.get("/callback", async (req: Request, res: Response) => {
  try {
    // CCAvenue redirects with query parameters
    const { encResp } = req.query;

    if (!encResp || typeof encResp !== "string") {
      return res.status(400).json({
        success: false,
        error: "Missing encrypted response",
      });
    }

    // For Razorpay, handle redirect by reading query params (Razorpay typically uses webhooks)
    // We'll attempt to read razorpay_payment_id and razorpay_order_id if present and update order
    const razorpayPaymentId = req.query["razorpay_payment_id"] as
      | string
      | undefined;
    const razorpayOrderId = req.query["razorpay_order_id"] as
      | string
      | undefined;

    if (!razorpayOrderId) {
      return res
        .status(400)
        .json({ success: false, error: "Missing razorpay_order_id" });
    }

    const order = await PaymentOrder.findOne({
      "paymentResponse.orderId": razorpayOrderId,
    });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, error: "PaymentOrder not found" });
    }

    // If payment id present, assume success (actual verification should query Razorpay API)
    if (razorpayPaymentId) {
      await order.updateStatus(OrderStatus.SUCCESS, {
        orderId: order.orderId,
        trackingId: razorpayPaymentId,
      } as any);
    }

    const redirectUrl = new URL(order.redirectUrl);
    redirectUrl.searchParams.set("orderId", order.orderId);
    redirectUrl.searchParams.set("status", order.status);

    res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error("Payment callback error:", error);
    // Redirect to failure page on error
    res.redirect(
      `${process.env.CLIENT_URL || "http://localhost:3000"
      }/payment-failure?error=callback_error`
    );
  }
});

/**
 * GET /api/payment/status/:orderId
 * Get payment status for an order
 */
router.get("/status/:orderId", async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const order = await PaymentOrder.findByOrderId(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "PaymentOrder not found",
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
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get payment status error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get payment status",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/payment/orders/:userId
 * Get all orders for a user
 */
router.get("/orders/:userId", async (req: Request, res: Response) => {
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
          hasPrev: Number(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get user orders",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/payment/verify
 * Verify Razorpay payment signature
 */
router.post("/verify", async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        required: [
          "razorpay_order_id",
          "razorpay_payment_id",
          "razorpay_signature",
        ],
      });
    }

    // Get Razorpay instance
    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      return res.status(500).json({
        success: false,
        error: "Payment gateway not configured",
      });
    }

    // Verify signature
    const isValidSignature = verifyWebhookSignature(
      razorpay_order_id + "|" + razorpay_payment_id,
      razorpay_signature,
      process.env.RAZORPAY_KEY_SECRET!
    );

    if (!isValidSignature) {
      return res.status(400).json({
        success: false,
        error: "Invalid payment signature",
      });
    }

    // Find the payment order
    const paymentOrder = await PaymentOrder.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!paymentOrder) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    console.log("🔍 PaymentOrder found - Full object:");
    console.log(JSON.stringify(paymentOrder, null, 2));

    const purchasingUser = await User.findById(paymentOrder.userId);
    if (!purchasingUser) {
      console.warn(
        "⚠️ Unable to locate purchasing user for payment order:",
        paymentOrder.userId
      );
    }
    let purchasingUserChanged = false;
    if (purchasingUser) {
      const releasedForPurchaser = releasePendingReferralCredits(purchasingUser);
      if (releasedForPurchaser > 0) {
        purchasingUserChanged = true;
      }
    }
    const referralSummary: {
      credits?: { referrerId?: any; code: string; amount: number };
      walletRedemption?: { amount: number };
    } = {};

    console.log("🔍 About to update payment order status to SUCCESS");
    console.log("🔍 Previous status:", paymentOrder.status);

    // Update payment order status using the updateStatus method to trigger email
    paymentOrder.razorpayPaymentId = razorpay_payment_id;
    paymentOrder.razorpaySignature = razorpay_signature;
    paymentOrder.paidAt = new Date();

    console.log("🔍 Calling updateStatus method...");
    await paymentOrder.updateStatus(OrderStatus.SUCCESS, {
      orderId: paymentOrder.orderId,
      trackingId: razorpay_payment_id,
      orderStatus: "Success",
      paymentMode: "razorpay",
      statusMessage: "Payment successful",
      amount: String(paymentOrder.amount),
      currency: paymentOrder.currency,
    } as any);

    console.log("🔍 Payment order status updated to:", paymentOrder.status);

    const promoInfo =
      (paymentOrder.orderDetails as any)?.promo ||
      (paymentOrder.orderDetails as any)?.pricing?.promo;

    if (purchasingUser) {
      const alreadyLinked = Array.isArray(purchasingUser.orders)
        ? purchasingUser.orders.some(
          (orderId: any) =>
            orderId?.toString() === paymentOrder._id.toString()
        )
        : false;
      if (!alreadyLinked) {
        purchasingUser.orders = [
          ...(purchasingUser.orders || []),
          paymentOrder._id as any,
        ];
        purchasingUserChanged = true;
      }

      if (
        promoInfo?.code &&
        !purchasingUser.usedPromoCodes?.some(
          (entry) => entry.code === promoInfo.code
        )
      ) {
        purchasingUser.usedPromoCodes = [
          ...(purchasingUser.usedPromoCodes || []),
          {
            code: promoInfo.code,
            orderId: paymentOrder._id,
            discountValue: promoInfo.discountValue || 0,
            appliedAt: new Date(),
          },
        ];
        purchasingUserChanged = true;
      }

      console.log(
        `Payment order ${paymentOrder._id} added to user ${paymentOrder.userId} orders array`
      );
    }

    // Create TrackingOrder for this payment order if orderCategory is not design-your-own
    if (purchasingUser) {
      const requestedWalletAmount = Number(
        (paymentOrder.orderDetails as any)?.referralWallet?.amountRequested || 0
      );
      const availableBalance = purchasingUser.referralAvailableBalance || 0;
      if (requestedWalletAmount > 0 && availableBalance > 0) {
        const walletDeduction = Math.min(requestedWalletAmount, availableBalance);
        if (walletDeduction > 0) {
          const consumed = consumeReferralCredits(
            purchasingUser,
            walletDeduction,
            { orderId: paymentOrder._id }
          );
          if (consumed > 0) {
            purchasingUser.referralEarningsHistory =
              purchasingUser.referralEarningsHistory || [];
            purchasingUser.referralEarningsHistory.push({
              type: "debit",
              amount: consumed,
              orderId: paymentOrder._id,
              note: "Redeemed at checkout",
              createdAt: new Date(),
            } as any);
            purchasingUserChanged = true;
            referralSummary.walletRedemption = { amount: consumed };
          }
        }
      }
    }

    const diamondSubtotal = getDiamondSubtotalFromOrder(
      paymentOrder.orderDetails
    );
    if (
      purchasingUser?.referredBy &&
      typeof purchasingUser.referredBy === "string" &&
      !purchasingUser.referralRewardIssued
    ) {
      const referrer = await User.findOne({
        referralCode: purchasingUser.referredBy.toUpperCase(),
      });
      if (
        referrer &&
        referrer._id.toString() !== purchasingUser._id.toString()
      ) {
        const releaseDelta = releasePendingReferralCredits(referrer);
        const referralCredit = Math.round(diamondSubtotal * 0.05);
        let referrerChanged = releaseDelta > 0;
        if (referralCredit > 0) {
          queueReferralCredit(referrer, referralCredit, {
            orderId: paymentOrder._id,
            note: `Referral purchase by ${purchasingUser.email || purchasingUser._id
              }`,
          });
          referrerChanged = true;
          referralSummary.credits = {
            referrerId: referrer._id,
            code: referrer.referralCode,
            amount: referralCredit,
          };
        }
        if (referrerChanged) {
          await referrer.save();
        }
        purchasingUser.referralRewardIssued = true;
        purchasingUserChanged = true;
      }
    }

    if (purchasingUserChanged) {
      try {
        await purchasingUser.save();
      } catch (userSaveError) {
        console.warn("Failed to update purchasing user:", userSaveError);
      }
    }

    if (paymentOrder.orderCategory !== "design-your-own") {
      try {
        console.log("\n🔍 Creating TrackingOrder for payment order...");
        console.log("   Payment Order ID:", paymentOrder._id);
        console.log("   Order Number:", paymentOrder.orderNumber);
        console.log("   Order Type:", paymentOrder.orderType);
        console.log("   Customer Email:", paymentOrder.billingInfo?.email);

        const { TrackingOrder } = await import("../models/TrackingOrder");
        const { OrderStatus: TrackingOrderStatus } = await import(
          "../types/tracking"
        );

        // Check if TrackingOrder already exists
        const existingTracking = await TrackingOrder.findOne({
          order: paymentOrder._id,
        });
        if (existingTracking) {
          console.log(
            "   ⚠️ TrackingOrder already exists:",
            existingTracking._id
          );
        } else {
          const trackingOrder = new TrackingOrder({
            userId: paymentOrder.userId,
            orderModel: "PaymentOrder", // Specify model type for polymorphic reference
            order: paymentOrder._id,
            orderNumber: paymentOrder.orderNumber,
            orderType: paymentOrder.orderType || "customized", // PaymentOrders are usually customized
            customerEmail: paymentOrder.billingInfo?.email || "",
            status: TrackingOrderStatus.ORDER_PLACED,
            trackingHistory: [
              {
                status: TrackingOrderStatus.ORDER_PLACED,
                description: "Payment completed - Order placed",
                timestamp: new Date(),
                code: TrackingOrderStatus.ORDER_PLACED,
              },
            ],
          });

          await trackingOrder.save();
          console.log("   ✅ TrackingOrder created successfully!");
          console.log("   TrackingOrder ID:", trackingOrder._id);
          console.log("   Status:", trackingOrder.status);
        }
      } catch (trackingError) {
        console.error("   ❌ Failed to create TrackingOrder:");
        console.error("   Error:", trackingError);
        console.error("   Error message:", (trackingError as Error).message);
        console.error("   Stack:", (trackingError as Error).stack);
        // Don't fail the verification if tracking creation fails
      }
    }

    // Redeem and delete gift card if used
    if (paymentOrder.giftCardVoucher) {
      try {
        const giftCard = await GiftCard.findOne({
          voucherCode: paymentOrder.giftCardVoucher.toUpperCase(),
          status: 'active'
        });

        if (giftCard) {
          console.log(`🎫 Redeeming gift card: ${paymentOrder.giftCardVoucher}`);
          giftCard.amount = 0;
          giftCard.status = 'redeemed';
          await giftCard.save();

          // Delete it as requested by the user
          await GiftCard.findByIdAndDelete(giftCard._id);
          console.log(`✅ Gift card ${paymentOrder.giftCardVoucher} redeemed and deleted successfully.`);
        } else {
          console.warn(`⚠️ Gift card ${paymentOrder.giftCardVoucher} not found or already redeemed.`);
        }
      } catch (gcError) {
        console.error("❌ Failed to redeem gift card during payment verification:", gcError);
      }
    }

    // Update the main order if it exists (skip for customization orders)
    if (paymentOrder.orderCategory !== "design-your-own") {
      try {
        const updateData: any = {
          paymentStatus: "paid",
          orderStatus: "processing",
          transactionId: razorpay_payment_id,
          updatedAt: new Date(),
        };

        if (promoInfo?.code) {
          updateData.promoSummary = {
            code: promoInfo.code,
            discountPercent: promoInfo.discountPercent,
            discountValue: promoInfo.discountValue,
            appliedOn: promoInfo.appliedOn || "diamond",
          };
        }

        if (referralSummary.walletRedemption || referralSummary.credits) {
          updateData.referralSummary = referralSummary;
        }

        if (paymentOrder.giftCardVoucher) {
          updateData.giftCardSummary = {
            code: paymentOrder.giftCardVoucher,
            amount: paymentOrder.giftCardAmount || 0,
          };
        }

        // Add detailed product information if available from PaymentOrder
        let orderDetails: any = null; // Declare outside if block for proper scope
        if (paymentOrder.orderDetails) {
          orderDetails = paymentOrder.orderDetails as any; // Type assertion for extended properties

          console.log("🔍 Full orderDetails structure:");
          console.log(JSON.stringify(orderDetails, null, 2));

          updateData.productDetails = {
            jewelryType: orderDetails.jewelryType,
            description: orderDetails.description,
            isDirectPurchase: orderDetails.isDirectPurchase,
            ...(orderDetails.directPurchaseData && {
              // Extract detailed product specifications from PaymentOrder
              product: orderDetails.directPurchaseData.product,
              customization: orderDetails.directPurchaseData.customization,
              // Add structured diamond details
              diamondDetails: {
                shape:
                  orderDetails.directPurchaseData.customization?.diamondShape,
                size: orderDetails.directPurchaseData.customization
                  ?.diamondSize,
                origin:
                  orderDetails.directPurchaseData.customization?.diamondOrigin,
                carat:
                  orderDetails.directPurchaseData.customization?.diamondSize,
              },
              // Add structured metal details
              metalDetails: {
                type: orderDetails.directPurchaseData.customization?.metalType,
                color:
                  orderDetails.directPurchaseData.customization?.metalColor,
                karat: orderDetails.directPurchaseData.customization?.goldKarat,
              },
              // Add structured ring/general size details
              ringDetails: {
                size:
                  orderDetails.directPurchaseData.customization?.size ||
                  orderDetails.directPurchaseData.customization?.ringSize,
              },
              // Add structured engraving details
              engravingDetails: {
                text:
                  orderDetails.directPurchaseData.customization?.engraving ||
                  "",
                imageUrl:
                  orderDetails.directPurchaseData.customization
                    ?.engravingImageUrl || "",
                hasEngraving:
                  orderDetails.directPurchaseData.customization?.hasEngraving ||
                  false,
              },
              // Add price breakdown
              priceBreakdown:
                orderDetails.directPurchaseData.product?.priceBreakdown,
              // Add product specifications
              productSpecs: {
                modelSku: orderDetails.directPurchaseData.product?.modelSku,
                variantSku: orderDetails.directPurchaseData.product?.variantSku,
                variant: orderDetails.directPurchaseData.product?.variantSku, // Include variant SKU
                title: orderDetails.directPurchaseData.product?.title,
                sellingPrice: orderDetails.directPurchaseData.product?.price,
              },
            }),
            // Add cart items data for multi-item orders
            ...(orderDetails.cartItems &&
              !orderDetails.isDirectPurchase && {
              cartItems: orderDetails.cartItems.map((item: any) => ({
                productId: item.productId,
                productTitle: item.productTitle,
                productSku: item.productSku,
                variantSku: item.variantSku,
                variantConfig: item.variantConfig,
                quantity: item.quantity,
                price: item.price,
                sellingPrice: item.sellingPrice,
                priceBreakdown: item.priceBreakdown,
                metalDetails: item.metalDetails,
                diamondDetails: item.diamondDetails,
                ringDetails: item.ringDetails,
              })),
            }),
          };

          // Also update the main items array for cart orders
          if (orderDetails.cartItems && !orderDetails.isDirectPurchase) {
            console.log("🛒 Updating main items array with cart data...");
            updateData.items = orderDetails.cartItems.map((item: any) => ({
              product: item.productId,
              productModel: "Product",
              productTitle: item.productTitle,
              productSku: item.productSku,
              variantSku: item.variantSku,
              variantConfig: item.variantConfig,
              quantity: item.quantity,
              price: item.price || item.sellingPrice,
              total: (item.price || item.sellingPrice) * item.quantity,
              metalDetails: item.metalDetails,
              diamondDetails: item.diamondDetails,
              ringDetails: item.ringDetails,
              priceBreakdown: item.priceBreakdown,
            }));
            console.log(`🛒 Adding ${updateData.items.length} items to order`);
          }

          console.log(
            "📦 Adding product details to OrderModel:",
            JSON.stringify(updateData.productDetails, null, 2)
          );
          // Collect images from direct purchase product or cart items and add to order update
          try {
            const collectedImages: string[] = [];
            if (orderDetails?.directPurchaseData?.product?.images) {
              collectedImages.push(
                ...orderDetails.directPurchaseData.product.images
              );
            }
            if (
              orderDetails?.cartItems &&
              Array.isArray(orderDetails.cartItems)
            ) {
              orderDetails.cartItems.forEach((ci: any) => {
                if (
                  ci?.variantConfig?.variantImages &&
                  Array.isArray(ci.variantConfig.variantImages)
                ) {
                  collectedImages.push(...ci.variantConfig.variantImages);
                }
                if (
                  ci?.variantConfig?.variantImages &&
                  Array.isArray(ci.variantConfig.variantImages)
                ) {
                  // also ensure any product-level images are captured
                }
              });
            }

            if (collectedImages.length) {
              // set top-level images array on order update (schema expects { url })
              updateData.images = Array.from(new Set(collectedImages)).map(
                (u) => ({ url: u })
              );
            }

            // For direct purchases, also populate the main items array so frontend/consumers can read variantConfig
            if (
              orderDetails?.isDirectPurchase &&
              orderDetails.directPurchaseData
            ) {
              const pd = orderDetails.directPurchaseData;
              const variantConfig = Object.assign({}, pd.customization || {});
              variantConfig.variantImages =
                pd.product?.images || variantConfig.variantImages || [];

              updateData.items = [
                {
                  product: pd.product?._id || undefined,
                  productModel: "Product",
                  productTitle:
                    pd.product?.title ||
                    updateData.productDetails?.productSpecs?.title,
                  productSku:
                    pd.product?.modelSku ||
                    updateData.productDetails?.productSpecs?.modelSku,
                  variantSku:
                    pd.product?.variantSku ||
                    updateData.productDetails?.productSpecs?.variantSku,
                  variantConfig,
                  quantity: 1,
                  price:
                    pd.product?.price ||
                    updateData.productDetails?.productSpecs?.sellingPrice ||
                    0,
                  total:
                    pd.product?.price ||
                    updateData.productDetails?.productSpecs?.sellingPrice ||
                    0,
                  priceBreakdown: pd.product?.priceBreakdown,
                },
              ];
            }
          } catch (e) {
            console.warn("Failed to collect images for order update:", e);
          }
        }

        await OrderModel.findOneAndUpdate(
          { orderNumber: paymentOrder.orderNumber },
          updateData,
          { upsert: false }
        );
        console.log(
          `✅ OrderModel updated with product details for payment: ${paymentOrder.orderNumber}`
        );

        // Note: Email confirmation is handled by OrderModel post-findOneAndUpdate hook

        // Clear user's cart after successful order update (only for cart orders, not direct purchases)
        if (orderDetails.cartItems && !orderDetails.isDirectPurchase) {
          try {
            const cartResult = await Cart.findOneAndDelete({
              user: paymentOrder.userId,
            });
            if (cartResult) {
              console.log(
                `🛒 Cart cleared for user ${paymentOrder.userId} after successful order ${paymentOrder.orderNumber}`
              );
            } else {
              console.log(
                `🛒 No cart found to clear for user ${paymentOrder.userId}`
              );
            }
          } catch (cartError) {
            console.warn(
              "Failed to clear cart after order completion:",
              cartError
            );
            // Don't fail the verification if cart clearing fails
          }
        }
      } catch (orderUpdateError) {
        console.warn("Failed to update main order:", orderUpdateError);
        // Don't fail the verification if main order update fails
      }
    } else {
      console.log(
        `⏭️ Skipping OrderModel update for customization order: ${paymentOrder.orderNumber}`
      );
      console.log(`📧 Order category: "${paymentOrder.orderCategory}"`);
      console.log(`📧 Checking if should send customization email...`);

      // Send customization order confirmation email since OrderModel hooks won't trigger
      try {
        console.log(`📧 Sending customization order confirmation email for ${paymentOrder.orderNumber}`);

        // Import the customization email function
        const { sendCustomizationOrderConfirmationEmail } = await import("../services/emailService");

        // For customization orders, we can extract details from the PaymentOrder itself
        // or try to find the associated CustomizationRequest
        let customizationDetails = {
          title: 'Custom Jewelry Design',
          description: 'Custom jewelry design request',
          category: 'Custom',
          subCategory: 'Design Your Own',
          jewelryType: 'Custom Jewelry',
          metalType: undefined,
          metalKarat: undefined,
          metalColor: undefined,
          diamondShape: undefined,
          diamondSize: undefined,
          diamondOrigin: undefined,
          size: undefined,
          engraving: undefined,
          specialInstructions: undefined,
        };

        let requestNumber = null;

        // Try to find the associated CustomizationRequest for more detailed information
        const CustomizationRequest = (await import("../models/CustomizationRequest")).default;

        // Try multiple ways to find the customization request
        let customizationRequest = null;

        console.log(`📧 Searching for CustomizationRequest...`);

        // Method 1: Find by PaymentOrder ID
        customizationRequest = await CustomizationRequest.findOne({
          paymentId: paymentOrder._id.toString()
        });
        console.log(`📧 Method 1 (PaymentOrder ID): ${customizationRequest ? 'Found' : 'Not found'}`);

        // Method 2: Find by Razorpay payment ID
        if (!customizationRequest) {
          customizationRequest = await CustomizationRequest.findOne({
            paymentId: razorpay_payment_id
          });
          console.log(`📧 Method 2 (Razorpay ID): ${customizationRequest ? 'Found' : 'Not found'}`);
        }

        // Method 3: Find by PaymentOrder orderId
        if (!customizationRequest) {
          customizationRequest = await CustomizationRequest.findOne({
            paymentId: paymentOrder.orderId
          });
          console.log(`📧 Method 3 (Order ID): ${customizationRequest ? 'Found' : 'Not found'}`);
        }

        // Method 4: Find by user ID and recent creation (within last 10 minutes) and matching amount
        if (!customizationRequest) {
          const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
          customizationRequest = await CustomizationRequest.findOne({
            userId: paymentOrder.userId,
            createdAt: { $gte: tenMinutesAgo },
            $or: [
              { paymentAmount: paymentOrder.amount },
              { paymentStatus: { $in: ['pending', 'success'] } }
            ]
          }).sort({ createdAt: -1 });
          console.log(`📧 Method 4 (Recent + Amount): ${customizationRequest ? 'Found' : 'Not found'}`);
        }

        // Method 5: Find by user ID and recent creation (including future - for timing issues)
        if (!customizationRequest) {
          const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
          const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
          customizationRequest = await CustomizationRequest.findOne({
            userId: paymentOrder.userId,
            createdAt: { $gte: tenMinutesAgo, $lte: fiveMinutesFromNow }
          }).sort({ createdAt: -1 });
          console.log(`📧 Method 5 (Recent with future): ${customizationRequest ? 'Found' : 'Not found'}`);
        }

        if (customizationRequest) {
          console.log(`📧 Found customization request: ${customizationRequest.requestNumber}`);
          requestNumber = customizationRequest.requestNumber;
          customizationDetails = {
            title: customizationRequest.title,
            description: customizationRequest.description,
            category: customizationRequest.category,
            subCategory: customizationRequest.subCategory,
            jewelryType: customizationRequest.jewelryType,
            metalType: customizationRequest.metalType,
            metalKarat: customizationRequest.metalKarat,
            metalColor: customizationRequest.metalColor,
            diamondShape: customizationRequest.diamondShape,
            diamondSize: customizationRequest.diamondSize,
            diamondOrigin: customizationRequest.diamondOrigin,
            size: customizationRequest.size || customizationRequest.ringSize,
            engraving: customizationRequest.engraving?.text,
            specialInstructions: customizationRequest.specialInstructions,
          };

          // Update the customization request with payment success
          customizationRequest.paymentStatus = 'success';
          customizationRequest.paymentId = razorpay_payment_id;
          await customizationRequest.save();
        } else {
          console.warn(`📧 No customization request found for payment order: ${paymentOrder.orderNumber}`);
        }

        // Prepare email data
        const emailData = {
          customerName: paymentOrder.billingInfo.name,
          customerEmail: paymentOrder.billingInfo.email,
          orderNumber: paymentOrder.orderNumber,
          requestNumber: requestNumber,
          orderDate: new Date().toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          paymentMethod: 'Razorpay',
          transactionId: razorpay_payment_id,
          estimatedDelivery: paymentOrder.estimatedDelivery || 'To be confirmed',
          customizationDetails: customizationDetails,
          totalAmount: paymentOrder.amount,
          shippingAddress: {
            street: paymentOrder.billingInfo.address,
            city: paymentOrder.billingInfo.city,
            state: paymentOrder.billingInfo.state,
            country: paymentOrder.billingInfo.country,
            zipCode: paymentOrder.billingInfo.zip,
          },
          billingAddress: {
            street: paymentOrder.billingInfo.address,
            city: paymentOrder.billingInfo.city,
            state: paymentOrder.billingInfo.state,
            country: paymentOrder.billingInfo.country,
            zipCode: paymentOrder.billingInfo.zip,
          },
        };

        console.log(`📧 Calling sendCustomizationOrderConfirmationEmail...`);
        await sendCustomizationOrderConfirmationEmail(emailData);
        console.log(`📧 Customization order confirmation email sent successfully for ${paymentOrder.orderNumber}`);
      } catch (emailError) {
        console.error('📧 Failed to send customization order confirmation email:', emailError);
        console.error('📧 Error stack:', emailError.stack);
        // Don't fail the verification if email sending fails
      }
    }

    // Note: Order confirmation email is handled by OrderModel post-findOneAndUpdate hook
    // to avoid duplicate emails and ensure proper product data is used

    res.json({
      success: true,
      message: "Payment verified successfully",
      data: {
        orderId: paymentOrder.orderId,
        orderNumber: paymentOrder.orderNumber,
        orderCategory: paymentOrder.orderCategory,
        orderType: paymentOrder.orderType,
        orderDetails: paymentOrder.orderDetails,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        status: paymentOrder.status,
        paidAt: paymentOrder.paidAt,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      error: "Payment verification failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
