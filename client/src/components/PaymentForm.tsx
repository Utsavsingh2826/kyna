import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { CreditCard, Lock, Shield } from "lucide-react";
import {
  paymentService,
  PaymentInitiateRequest,
} from "../services/paymentService";

interface PaymentFormProps {
  orderData: {
    orderId: string;
    orderCategory?: 'design-your-own' | 'build-your-own' | 'products';
    orderType?: 'customized' | 'normal';
    customData?: any;
    amount: number;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    images?: Array<{
      url: string;
      publicId?: string;
      uploadedAt?: string | Date;
      source?: string;
      alt?: string;
    }>;
    orderDetails?: {
      jewelryType?: string;
      description?: string;
      estimatedDelivery?: string | null;
      estimatedDeliveryDay?: string | null;
      [key: string]: unknown;
    };
  };
  userInfo: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  onPaymentInitiated?: (orderId: string) => void;
  onError?: (error: string) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  orderData,
  userInfo,
  onPaymentInitiated,
  onError,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [billingInfo, setBillingInfo] = useState({
    name: `${userInfo.firstName} ${userInfo.lastName}`.trim(),
    email: userInfo.email,
    phone: userInfo.phone || "",
    address: userInfo.address || "",
    city: userInfo.city || "",
    state: userInfo.state || "",
    zip: userInfo.zipCode || "",
    country: userInfo.country || "India",
  });

  const handleInputChange = (field: string, value: string) => {
    setBillingInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const required = [
      "name",
      "email",
      "phone",
      "address",
      "city",
      "state",
      "zip",
    ];
    const missing = required.filter(
      (field) => !billingInfo[field as keyof typeof billingInfo]
    );

    if (missing.length > 0) {
      onError?.(`Please fill in all required fields: ${missing.join(", ")}`);
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(billingInfo.email)) {
      onError?.("Please enter a valid email address");
      return false;
    }

    const phoneRegex = /^[+]?[0-9]{10,15}$/;
    if (!phoneRegex.test(billingInfo.phone.replace(/[-\s]/g, ""))) {
      onError?.("Please enter a valid phone number");
      return false;
    }

    return true;
  };

  const initiatePayment = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);

    // VERY OBVIOUS DEBUG - Alert to ensure this code is running
    alert(`IMAGES DEBUG: ${JSON.stringify(orderData.images)}`);
    console.log("🔍 IMAGES ALERT DONE - orderData.images:", orderData.images);

    // Debug: Check what orderData.images contains
    console.log(
      "🔍 PaymentForm - orderData.images JSON:",
      JSON.stringify(orderData.images)
    );
    console.log(
      "🔍 PaymentForm - orderData.images length:",
      orderData.images?.length || 0
    );
    console.log(
      "🔍 PaymentForm - orderData.images type:",
      typeof orderData.images,
      "Array?",
      Array.isArray(orderData.images)
    );

    // Debug: Check EDD data in orderData
    console.log('📦 [EDD] PaymentForm - EDD data check:', {
      hasOrderDetails: !!orderData.orderDetails,
      estimatedDelivery: orderData.orderDetails?.estimatedDelivery,
      estimatedDeliveryDay: orderData.orderDetails?.estimatedDeliveryDay,
      fullOrderDetails: JSON.stringify(orderData.orderDetails, null, 2)
    });
    
    if (orderData.orderDetails?.estimatedDelivery) {
      console.log('✅ [EDD] PaymentForm - EDD data found, will be sent to backend');
    } else {
      console.warn('⚠️ [EDD] PaymentForm - No EDD data found in orderDetails');
    }

    try {
      const paymentData: PaymentInitiateRequest = {
        orderId: orderData.orderId,
        amount: orderData.amount.toString(),
        currency: "INR",
        billingInfo: billingInfo,
        redirectUrl: `${window.location.origin}/payment-success`,
        cancelUrl: `${window.location.origin}/payment-cancel`,
        userId: userInfo.userId,
        orderNumber: orderData.orderId,
        orderCategory: orderData.orderCategory || 'products',
        orderType: orderData.orderType || 'normal',
        customData: orderData.customData,
        items: orderData.items,
        orderDetails: orderData.orderDetails,
        // jewelryId: orderData.jewelryId, // Include jewelryId if available
        images: orderData.images || [],
        // Extract EDD from orderDetails and add to root level for backend validation
        estimatedDelivery: orderData.orderDetails?.estimatedDelivery || null,
        estimatedDeliveryDay: orderData.orderDetails?.estimatedDeliveryDay || null,
      };

      console.log("💳 Initiating payment with images:", paymentData.images);
      console.log("💳 Full payment data:", paymentData);

      // PROMINENT LOG FOR DEBUGGING
      if (!paymentData.images || paymentData.images.length === 0) {
        console.error("❌ IMAGES ARE EMPTY IN PAYMENT DATA!");
      } else {
        console.log(
          "✅ IMAGES FOUND IN PAYMENT DATA:",
          paymentData.images.length,
          "images"
        );
      }

      const response = await paymentService.initiatePayment(paymentData);

      if (response.success) {
        console.log("✅ Payment initiated successfully:", response.data);

        // Prepare Razorpay options
        const razorpayOptions = {
          key: response.data.razorpayKeyId,
          amount: response.data.amount,
          currency: response.data.currency,
          name: response.data.name,
          description: response.data.description,
          order_id: response.data.razorpayOrderId,
          prefill: response.data.prefill,
          theme: response.data.theme,
          notes: response.data.notes,
          handler: () => {}, // Will be set by openRazorpayCheckout
          modal: {
            ondismiss: () => {},
          },
        };

        // Open Razorpay checkout
        paymentService.openRazorpayCheckout(
          razorpayOptions,
          async (paymentResponse) => {
            try {
              // Verify payment with backend
              const verificationResult = await paymentService.verifyPayment({
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
                orderId: response.data.orderId,
              });

              if (verificationResult.success) {
                onPaymentInitiated?.(response.data.orderId);
                // Redirect to success page
                window.location.href = `${window.location.origin}/payment-success?orderId=${response.data.orderId}&status=success`;
              } else {
                throw new Error("Payment verification failed");
              }
            } catch (verifyError) {
              console.error("Payment verification error:", verifyError);
              onError?.(
                verifyError instanceof Error
                  ? verifyError.message
                  : "Payment verification failed"
              );
            }
          },
          (paymentError) => {
            // Log full error object from Razorpay for debugging
            console.error("Payment error (full object):", paymentError);

            /*
             Razorpay error object often contains fields like:
             - code
             - description
             - source
             - step
             - reason
             - metadata
            */

            // Pick a friendly message to show the user
            const errorMessage = (() => {
              if (paymentError && typeof paymentError === "object") {
                // @ts-expect-error - paymentError is any from Razorpay
                const { description, reason, code } = paymentError;
                if (description) return String(description);
                if (reason) return String(reason);
                if (code) return `Payment failed (${String(code)})`;
              }
              return "Payment failed. Please try again or use another payment method.";
            })();

            onError?.(errorMessage);
          }
        );
      } else {
        throw new Error(response.message || "Payment initiation failed");
      }
    } catch (error) {
      console.error("❌ Payment initiation failed:", error);
      onError?.(
        error instanceof Error ? error.message : "Payment initiation failed"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Order Summary */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Order Summary
        </h3>
        <div className="space-y-2">
          {orderData.items.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>₹{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-semibold">
              <span>Total Amount</span>
              <span>₹{orderData.amount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Billing Information */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Billing Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <Input
              type="text"
              value={billingInfo.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <Input
              type="email"
              value={billingInfo.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="john@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone *
            </label>
            <Input
              type="tel"
              value={billingInfo.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="+91-9876543210"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country *
            </label>
            <select
              value={billingInfo.country}
              onChange={(e) => handleInputChange("country", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-400 focus:border-transparent"
              required
            >
              <option value="India">India</option>
              <option value="USA">USA</option>
              <option value="UK">UK</option>
              <option value="Canada">Canada</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <Input
              type="text"
              value={billingInfo.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="123 Main Street"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <Input
              type="text"
              value={billingInfo.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
              placeholder="Mumbai"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State *
            </label>
            <Input
              type="text"
              value={billingInfo.state}
              onChange={(e) => handleInputChange("state", e.target.value)}
              placeholder="Maharashtra"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ZIP Code *
            </label>
            <Input
              type="text"
              value={billingInfo.zip}
              onChange={(e) => handleInputChange("zip", e.target.value)}
              placeholder="400001"
              required
            />
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-center gap-2 text-green-800 mb-2">
          <Shield className="w-5 h-5" />
          <span className="font-medium">Secure Payment</span>
        </div>
        <p className="text-sm text-green-700">
          Your payment is secured with 256-bit SSL encryption. We don't store
          your card details.
        </p>
      </div>

      {/* Payment Button */}
      <Button
        onClick={initiatePayment}
        disabled={isProcessing}
        className="w-full bg-[#328F94] hover:bg-[#328F94]/90 text-white py-3 text-lg font-medium flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Processing...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            Pay ₹{orderData.amount.toLocaleString()} Securely
          </>
        )}
      </Button>

      <p className="text-xs text-gray-500 text-center mt-4">
        By clicking "Pay Securely", you agree to our Terms of Service and
        Privacy Policy. Payment is processed securely through Razorpay.
      </p>
    </div>
  );
};

export default PaymentForm;
