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
      const response = await fetch(`${this.baseUrl}/payment/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Payment initiation failed");
      }

      return data;
    } catch (error) {
      console.error("Payment initiation error:", error);
      throw error;
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
      const response = await fetch(`${this.baseUrl}/payment/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
