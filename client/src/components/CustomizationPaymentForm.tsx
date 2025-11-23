import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { CreditCard, Lock, Shield } from "lucide-react";
import {
  paymentService,
  PaymentInitiateRequest,
} from "../services/paymentService";

interface CustomizationData {
  title: string;
  description: string;
  category: string;
  subCategory: string;
  jewelryType: string;
  stylingName: string;
  referenceImages: string[];
  inspirationImages: string[];
  diamondShape: string;
  diamondSize: string;
  diamondColor: string;
  metalType: string;
  metalKarat: string;
  metalColor: string;
  contactInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  customData: {
    sameAsImage: boolean;
    modificationRequest: string;
    priority: string;
  };
  tags: string[];
  estimatedDelivery: string;
  estimatedDeliveryDay: string;
}

interface CustomizationPaymentFormProps {
  customizationData: CustomizationData;
  amount: number;
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
  onPaymentSuccess?: (customizationResult: any) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

const CustomizationPaymentForm: React.FC<CustomizationPaymentFormProps> = ({
  customizationData,
  amount,
  userInfo,
  onPaymentSuccess,
  onError,
  onCancel,
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

    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(billingInfo.phone.replace(/\D/g, ""))) {
      onError?.("Please enter a valid phone number");
      return false;
    }

    return true;
  };

  const saveCustomizationRequest = async (paymentData: {
    paymentId: string;
    paymentStatus: string;
    paymentAmount: number;
  }) => {
    try {
      const customizationRequestData = {
        ...customizationData,
        // Add payment information
        paymentId: paymentData.paymentId,
        paymentStatus: paymentData.paymentStatus,
        paymentAmount: paymentData.paymentAmount,
      };

      console.log(
        "💾 Saving customization request with payment data:",
        customizationRequestData
      );

      const response = await fetch("/api/customization/request-with-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(customizationRequestData),
      });

      const result = await response.json();

      if (result.success) {
        console.log(
          "✅ Customization request saved successfully:",
          result.data
        );
        return result.data;
      } else {
        throw new Error(
          result.message || "Failed to save customization request"
        );
      }
    } catch (error) {
      console.error("❌ Error saving customization request:", error);
      throw error;
    }
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      // Create temporary order data for payment processing
      const tempOrderData = {
        orderId: `CUST_${Date.now()}_${Math.random()
          .toString(36)
          .substring(2, 8)}`, // Generate temporary ID
        orderNumber: `KYNA-CUST-${Date.now()}`, // Generate temporary order number
        userId: userInfo.userId,
        amount: amount.toString(), // Convert number to string as required by PaymentInitiateRequest
        currency: "INR",
        redirectUrl: `${window.location.origin}/payment/success`,
        cancelUrl: `${window.location.origin}/payment/cancel`,
        // Add estimated delivery fields (required by payment service)
        estimatedDelivery: customizationData.estimatedDelivery || "2025-12-15", // Hardcoded fallback
        estimatedDeliveryDay:
          customizationData.estimatedDeliveryDay || "Sunday", // Hardcoded fallback
        items: [
          {
            name: customizationData.title,
            quantity: 1,
            price: amount,
          },
        ],
        orderCategory: "design-your-own" as const,
        orderType: "customized" as const,
        billingInfo: billingInfo,
        customData: {
          isCustomizationRequest: true,
          jewelryType: customizationData.jewelryType,
          description: customizationData.description,
        },
        // Add shipping info from billing for now
        shippingInfo: {
          name: billingInfo.name,
          address: billingInfo.address,
          city: billingInfo.city,
          state: billingInfo.state,
          zip: billingInfo.zip,
          country: billingInfo.country,
          phone: billingInfo.phone,
        },
      };

      console.log("💳 Initiating payment for customization:", tempOrderData);

      // Initiate payment through existing payment service
      const response = await paymentService.initiatePayment(tempOrderData);

      if (response.success && response.data) {
        console.log("✅ Payment initiated successfully:", response.data);

        // Debug: Log the exact keys available in response.data
        console.log(
          "🔑 Available response data keys:",
          Object.keys(response.data)
        );
        console.log("🔑 razorpayKeyId:", response.data.razorpayKeyId);
        console.log("🔑 razorpayOrderId:", response.data.razorpayOrderId);

        // Prepare Razorpay options
        const razorpayOptions = {
          key: response.data.razorpayKeyId, // Use razorpayKeyId from backend response
          amount: response.data.amount,
          currency: response.data.currency,
          name: response.data.name,
          description: response.data.description,
          order_id: response.data.razorpayOrderId, // Use razorpayOrderId from backend
          prefill: response.data.prefill,
          theme: response.data.theme,
          notes: response.data.notes,
          handler: () => {}, // Will be set by openRazorpayCheckout
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
            },
          },
        };

        console.log("🚀 Final Razorpay options:", razorpayOptions);
        console.log("🔑 Razorpay key being used:", razorpayOptions.key);

        // Open Razorpay checkout
        paymentService.openRazorpayCheckout(
          razorpayOptions,
          async (paymentResponse) => {
            try {
              console.log("💰 Payment response received:", paymentResponse);

              // Verify payment with backend
              const verificationResult = await paymentService.verifyPayment({
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
                orderId: response.data.orderId,
              });

              if (verificationResult.success) {
                console.log("✅ Payment verified successfully");

                // Now save the customization request with payment details
                const customizationResult = await saveCustomizationRequest({
                  paymentId: paymentResponse.razorpay_payment_id,
                  paymentStatus: "completed",
                  paymentAmount: amount,
                });

                onPaymentSuccess?.(customizationResult);
              } else {
                throw new Error("Payment verification failed");
              }
            } catch (verifyError) {
              console.error(
                "❌ Payment verification/saving error:",
                verifyError
              );
              onError?.(
                verifyError instanceof Error
                  ? verifyError.message
                  : "Payment verification failed"
              );
            } finally {
              setIsProcessing(false);
            }
          },
          (paymentError) => {
            console.error("❌ Payment error:", paymentError);
            setIsProcessing(false);

            let errorMessage = "Payment failed. Please try again.";
            if (paymentError && typeof paymentError === "object") {
              if ("description" in paymentError) {
                errorMessage = paymentError.description;
              } else if ("reason" in paymentError) {
                errorMessage = paymentError.reason;
              } else if ("message" in paymentError) {
                errorMessage = paymentError.message;
              }
            }

            onError?.(errorMessage);
          }
        );
      } else {
        throw new Error(response.message || "Failed to initiate payment");
      }
    } catch (error) {
      console.error("❌ Payment initiation error:", error);
      setIsProcessing(false);
      onError?.(
        error instanceof Error ? error.message : "Failed to initiate payment"
      );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="w-6 h-6 text-green-600" />
          Secure Payment
        </h2>
        <p className="text-gray-600 mt-1">
          Complete your customization request payment securely
        </p>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">{customizationData.title}</span>
            <span className="font-medium">{formatCurrency(amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Jewelry Type:</span>
            <span className="text-gray-900">
              {customizationData.jewelryType}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Diamond Shape:</span>
            <span className="text-gray-900">
              {customizationData.diamondShape}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Metal Type:</span>
            <span className="text-gray-900">
              {customizationData.metalType} ({customizationData.metalKarat})
            </span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total Amount:</span>
              <span className="text-[#328F94]">{formatCurrency(amount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Billing Information */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Billing Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <Input
              value={billingInfo.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter full name"
              disabled={isProcessing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <Input
              type="email"
              value={billingInfo.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Enter email"
              disabled={isProcessing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <Input
              value={billingInfo.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="Enter phone number"
              disabled={isProcessing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country *
            </label>
            <Input
              value={billingInfo.country}
              onChange={(e) => handleInputChange("country", e.target.value)}
              placeholder="Enter country"
              disabled={isProcessing}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address *
            </label>
            <Input
              value={billingInfo.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Enter full address"
              disabled={isProcessing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <Input
              value={billingInfo.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
              placeholder="Enter city"
              disabled={isProcessing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State *
            </label>
            <Input
              value={billingInfo.state}
              onChange={(e) => handleInputChange("state", e.target.value)}
              placeholder="Enter state"
              disabled={isProcessing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ZIP Code *
            </label>
            <Input
              value={billingInfo.zip}
              onChange={(e) => handleInputChange("zip", e.target.value)}
              placeholder="Enter ZIP code"
              disabled={isProcessing}
            />
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 font-medium">
              Your payment is secured with 256-bit SSL encryption
            </p>
            <p className="text-sm text-blue-700 mt-1">
              We use Razorpay's secure payment gateway. Your card details are
              never stored on our servers.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={isProcessing}
        >
          Cancel
        </Button>
        <Button
          onClick={handlePayment}
          className="flex-1 bg-[#328F94] hover:bg-[#328F94]/90 text-white"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Pay {formatCurrency(amount)}
            </div>
          )}
        </Button>
      </div>

      {/* Payment Methods */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 mb-2">Accepted Payment Methods</p>
        <div className="flex justify-center gap-2">
          <div className="px-3 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
            Credit Card
          </div>
          <div className="px-3 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
            Debit Card
          </div>
          <div className="px-3 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
            UPI
          </div>
          <div className="px-3 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
            Net Banking
          </div>
          <div className="px-3 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
            Wallets
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizationPaymentForm;
