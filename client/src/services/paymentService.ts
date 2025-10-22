// Note: no direct apiService used here; using fetch directly for payment endpoints

// Razorpay types
export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  notes: Record<string, string>;
  handler: (response: RazorpayResponse) => void;
  modal: {
    ondismiss: () => void;
  };
}

export interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayError {
  code: string;
  description: string;
  source: string;
  step: string;
  reason: string;
  metadata: Record<string, unknown>;
}

// Extend Window interface for Razorpay
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, callback: (error: RazorpayError) => void) => void;
    };
  }
}

export interface PaymentInitiateRequest {
  orderId: string;
  amount: string;
  currency: string;
  billingInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  redirectUrl: string;
  cancelUrl: string;
  userId: string;
  orderNumber: string;
  orderCategory?: 'design-your-own' | 'build-your-own' | 'products';
  orderType?: 'customized' | 'normal';
  jewelryId?: string; // Add optional jewelryId
  // Estimated delivery fields (required by backend at root level)
  estimatedDelivery?: string | null;
  estimatedDeliveryDay?: string | null;
  // Additional data for smart detection
  customData?: any;
  items?: any[];
  // Order details with all customization data
  orderDetails?: {
    jewelryType?: string;
    description?: string;
    images?: Array<{
      url: string;
      publicId?: string;
      source?: string;
      step?: string;
      alt?: string;
      uploadedAt?: string | Date;
    }>;
    diamond?: Record<string, unknown>;
    metal?: Record<string, unknown>;
    ringDetails?: Record<string, unknown>;
    stepData?: Record<string, unknown>;
    engraving?: Record<string, unknown>;
    specialRequests?: string;
    notes?: string;
    customizationComplete?: boolean;
    completedSteps?: string[];
    backendJewelryId?: string;
    designId?: string;
    priceBreakdown?: Record<string, unknown>;
    // Estimated delivery information from courier API
    estimatedDelivery?: string | null;
    estimatedDeliveryDay?: string | null;
  };
  images?: Array<{
    url: string;
    publicId?: string;
    uploadedAt?: string | Date;
    source?: string;
    alt?: string;
  }>;
}

export interface PaymentInitiateResponse {
  success: boolean;
  data: {
    razorpayOrderId: string;
    razorpayKeyId: string;
    orderId: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    prefill: {
      name: string;
      email: string;
      contact: string;
    };
    theme: {
      color: string;
    };
    notes: {
      orderId: string;
      userId: string;
    };
  };
  message: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  data: {
    orderId: string;
    status: "success" | "failed" | "pending";
    amount: string;
    transactionId?: string;
    paymentDate?: string;
  };
  message: string;
}

class PaymentService {
  private baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  async initiatePayment(
    paymentData: PaymentInitiateRequest
  ): Promise<PaymentInitiateResponse> {
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      
      console.log('Making payment request to:', `${this.baseUrl}/payment/initiate`);
      console.log('Request data:', paymentData);
      console.log('Request data validation:', {
        hasOrderId: !!paymentData.orderId,
        hasAmount: !!paymentData.amount,
        hasBillingInfo: !!paymentData.billingInfo,
        hasUserId: !!paymentData.userId,
        hasRedirectUrl: !!paymentData.redirectUrl,
        hasCancelUrl: !!paymentData.cancelUrl,
        orderId: paymentData.orderId,
        amount: paymentData.amount,
        userId: paymentData.userId,
        billingInfoKeys: paymentData.billingInfo ? Object.keys(paymentData.billingInfo) : 'no billing info'
      });

      // Log EDD data being sent to backend (both root level and orderDetails)
      console.log('📦 [EDD] PaymentService - EDD data in payment request:', {
        // Root level EDD (required by backend)
        rootEstimatedDelivery: paymentData.estimatedDelivery,
        rootEstimatedDeliveryDay: paymentData.estimatedDeliveryDay,
        // OrderDetails EDD (for reference)
        orderDetailsEstimatedDelivery: paymentData.orderDetails?.estimatedDelivery,
        hasRootEddData: !!(paymentData.estimatedDelivery)
      });
      
      if (paymentData.estimatedDelivery) {
        console.log('✅ [EDD] PaymentService - Sending EDD to backend at ROOT LEVEL:', {
          estimatedDelivery: paymentData.estimatedDelivery,
          estimatedDeliveryDay: paymentData.estimatedDeliveryDay
        });
      } else {
        console.warn('⚠️ [EDD] PaymentService - No EDD data found at ROOT LEVEL - backend will reject this');
      }
      
      console.log('Starting fetch request...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(`${this.baseUrl}/payment/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` })
        },
        body: JSON.stringify(paymentData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('Fetch request completed');

      console.log('Raw response:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        const textResponse = await response.text();
        console.error('Raw response text:', textResponse);
        throw new Error(`Server returned invalid JSON: ${textResponse}`);
      }

      console.log('Server response:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: data
      });

      if (!response.ok) {
        console.error("Payment initiation failed:", {
          status: response.status,
          statusText: response.statusText,
          data: data,
          url: `${this.baseUrl}/payment/initiate`,
          dataType: typeof data,
          dataKeys: data ? Object.keys(data) : 'no data'
        });
        
        // Handle specific error types
        if (data.error === 'Amount exceeds maximum limit') {
          throw new Error(`Payment amount ₹${data.amount} exceeds the maximum allowed limit of ₹${data.maxAmount}. Please use Net Banking or Card payment for this amount. Contact support at ${data.supportContact} to increase your transaction limit.`);
        }
        
        if (data.error === 'Invalid payment amount') {
          throw new Error(`Payment amount ₹${data.amount} is invalid. ${data.razorpayError || data.message}. Please try using Net Banking or Card payment.`);
        }
        
        if (data.error === 'Payment gateway error') {
          throw new Error(`Payment gateway error: ${data.razorpayError || data.message}. Please try again or contact support at ${data.supportContact}.`);
        }
        
        // Try to extract error message from different possible fields
        let errorMessage = "Payment initiation failed";
        if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.errorMessage) {
          errorMessage = data.errorMessage;
        } else if (typeof data === 'string') {
          errorMessage = data;
        } else if (data.details) {
          errorMessage = data.details;
        } else if (data.msg) {
          errorMessage = data.msg;
        } else if (data.description) {
          errorMessage = data.description;
        } else {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        
        console.log('Extracted error message:', errorMessage);
        throw new Error(errorMessage);
      }

      return data;
    } catch (error: any) {
      console.error("Payment initiation error:", error);

      // Handle different types of errors with clearer messages
      if (error && typeof error === 'object' && 'name' in error && (error as any).name === 'AbortError') {
        throw new Error("Request timeout: Payment service took too long to respond");
      }

      if (error instanceof TypeError && error.message && error.message.includes('fetch')) {
        throw new Error("Network error: Unable to connect to payment service");
      }

      if (error instanceof SyntaxError) {
        throw new Error("Server response error: Invalid response format");
      }

      // If error has a message, rethrow preserving it. Otherwise stringify the error object.
      const errMsg = error && error.message ? error.message : (error ? JSON.stringify(error) : null);
      if (errMsg) {
        throw new Error(errMsg);
      }

      throw new Error("Unknown error occurred during payment initiation");
    }
  }

  async getPaymentStatus(orderId: string): Promise<PaymentStatusResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/payment/status/${orderId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get payment status");
      }

      return data;
    } catch (error) {
      console.error("Payment status error:", error);
      throw error;
    }
  }

  async getUserPaymentOrders(userId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/payment/orders/${userId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get payment orders");
      }

      return data;
    } catch (error) {
      console.error("Get payment orders error:", error);
      throw error;
    }
  }

  // Open Razorpay checkout
  openRazorpayCheckout(
    options: RazorpayOptions,
    onSuccess: (response: RazorpayResponse) => void,
    onError: (error: RazorpayError | { message: string }) => void
  ) {
    // Load Razorpay script if not already loaded
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        this.openRazorpayCheckout(options, onSuccess, onError);
      };
      script.onerror = () => {
        onError({ message: "Failed to load Razorpay checkout script" });
      };
      document.head.appendChild(script);
      return;
    }

    const razorpay = new window.Razorpay({
      ...options,
      handler: onSuccess,
      modal: {
        ondismiss: () => {
          onError({ message: "Payment cancelled by user" });
        },
      },
    });

    razorpay.on("payment.failed", onError);
    razorpay.open();
  }

  // Verify payment with backend
  async verifyPayment(verificationData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    orderId: string;
  }) {
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${this.baseUrl}/payment/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` })
        },
        body: JSON.stringify(verificationData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Payment verification failed");
      }

      return data;
    } catch (error) {
      console.error("Payment verification error:", error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();
