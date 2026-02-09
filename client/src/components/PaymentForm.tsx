import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { CreditCard, Lock, Shield } from "lucide-react";
import {
  paymentService,
  PaymentInitiateRequest,
} from "../services/paymentService";
import { Country, State, City } from "country-state-city";
import { toast } from "sonner";


interface PaymentFormProps {
  orderData: {
    orderId: string;
    orderCategory?: "design-your-own" | "build-your-own" | "products";
    orderType?: "customized" | "normal";
    customData?: unknown;
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
      promo?: {
        code: string;
        discountPercent: number;
        discountValue: number;
        diamondSubtotal?: number;
        appliedOn?: string;
      };
      pricingSummary?: {
        subtotal: number;
        promoDiscount: number;
        taxableAmount: number;
        tax: number;
        payableAmount: number;
      };
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

type ServiceabilityStatus =
  | "idle"
  | "checking"
  | "serviceable"
  | "not-serviceable";

const PaymentForm: React.FC<PaymentFormProps> = ({
  orderData,
  userInfo,
  onPaymentInitiated,
  onError,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [serviceabilityStatus, setServiceabilityStatus] =
    useState<ServiceabilityStatus>("idle");

  // Get all countries
  const countries = Country.getAllCountries();

  // Find default country
  const defaultCountry =
    countries.find((c) => c.name === "India") || countries[0];

  const [selectedCountry, setSelectedCountry] = useState(
    defaultCountry.isoCode
  );
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  // Get states for selected country (excluding Kerala)
  const states = State.getStatesOfCountry(selectedCountry).filter(
    (state) => state.name.toLowerCase() !== "kerala"
  );

  // Get cities for selected state (excluding Borivli)
  const cities = selectedState
    ? City.getCitiesOfState(selectedCountry, selectedState).filter(
      (city) => city.name.toLowerCase() !== "borivli"
    )
    : [];

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

  // PAN Card State
  const [panCardUrl, setPanCardUrl] = useState<string>("");
  const [isPanUploading, setIsPanUploading] = useState(false);

  const handlePanUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsPanUploading(true);

      // Create FormData for backend upload
      const formData = new FormData();
      formData.append("file", file);

      // Upload via backend API
      const response = await fetch("/api/upload/pan-card", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.data?.url) {
        setPanCardUrl(result.data.url);
        toast.success("PAN card uploaded successfully");
      } else {
        toast.error(result.message || "Failed to upload PAN card image");
        onError?.(result.message || "Failed to upload PAN card image");
      }
    } catch (error) {
      console.error("PAN upload error:", error);
      toast.error("Error uploading PAN card");
      onError?.("Error uploading PAN card");
    } finally {
      setIsPanUploading(false);
    }
  };

  // Update billing info when selections change
  useEffect(() => {
    const country = countries.find((c) => c.isoCode === selectedCountry);
    if (country) {
      setBillingInfo((prev) => ({ ...prev, country: country.name }));
    }
  }, [selectedCountry]);

  useEffect(() => {
    const state = states.find((s) => s.isoCode === selectedState);
    if (state) {
      setBillingInfo((prev) => ({ ...prev, state: state.name }));
    }
  }, [selectedState, states]);

  useEffect(() => {
    if (selectedCity) {
      setBillingInfo((prev) => ({ ...prev, city: selectedCity }));
    }
  }, [selectedCity]);

  const pricingSummary = orderData.orderDetails?.pricingSummary as
    | {
      subtotal?: number;
      promoDiscount?: number;
      referralWallet?: number;
      taxableAmount?: number;
      tax?: number;
      payableAmount?: number;
    }
    | undefined;

  const formatCurrency = (value?: number) => {
    if (typeof value !== "number" || Number.isNaN(value)) {
      return "₹0";
    }
    return `₹${value.toLocaleString("en-IN")}`;
  };

  const handleInputChange = async (field: string, value: string) => {
    setBillingInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Check serviceability when user enters a valid 6-digit pincode
    if (value.length === 6 && /^\d{6}$/.test(value)) {
      const matches = await validatePinMatchesLocation(value);

      // ⛔ If pin/state/city mismatch — stop here
      if (!matches) {
        setServiceabilityStatus("idle");
        return;
      }

      // ✔ PIN is valid for city/state → now check serviceability
      await checkServiceability(value);
    } else if (value.length < 6) {
      setServiceabilityStatus("idle");
    }
  };

  const validatePinMatchesLocation = async (pinCode: string) => {
    if (!selectedState || !selectedCity) return;

    try {
      const res = await fetch(
        `https://api.postalpincode.in/pincode/${pinCode}`
      );
      const data = await res.json();

      if (!Array.isArray(data) || !data[0]?.PostOffice) return;

      const postOffices = data[0].PostOffice;

      // Extract unique state + district names
      const apiStates = new Set(postOffices.map((p: any) => p.State.trim()));
      const apiDistricts = new Set(
        postOffices.map((p: any) => p.District.trim())
      );

      const selectedStateName =
        states.find((s) => s.isoCode === selectedState)?.name || "";
      const selectedCityName = selectedCity.trim();

      // Validate state + district match
      if (
        apiStates.has(selectedStateName) &&
        apiDistricts.has(selectedCityName)
      ) {
        console.log("🎉 PIN matches selected State + City");
        return true;
      }

      console.warn("⛔ Pincode does NOT belong to selected city/state");
      toast.error(
        `Pincode ${pinCode} does not match ${selectedCityName}, ${selectedStateName}`
      );
      setServiceabilityStatus("idle");
      return false;
    } catch (error) {
      console.error("PIN validation API error:", error);
      return false;
    }
  };

  // Function to check serviceability using Sequel247 API
  const checkServiceability = async (pinCode: string): Promise<boolean> => {
    if (!pinCode || pinCode.length !== 6 || !/^\d{6}$/.test(pinCode)) {
      setServiceabilityStatus("idle");
      return false;
    }

    try {
      setServiceabilityStatus("checking");
      console.log("🚀 Checking serviceability for pincode:", pinCode);

      const response = await fetch(
        "https://test.sequel247.com/api/checkServiceability",
        {
          method: "POST",
          body: JSON.stringify({
            token: "b228a27399f07927985d57c0f7d94ce8",
            pin_code: pinCode,
          }),
        }
      );

      const result = await response.json();
      console.log("📍 Serviceability check result:", result);

      const statusRaw = result?.status;
      console.debug(
        "🔎 Raw serviceability status from API:",
        statusRaw,
        typeof statusRaw
      );
      const statusStr =
        statusRaw == null ? "" : String(statusRaw).trim().toLowerCase();
      const isServiceableApi =
        statusRaw === true || ["true", "1", "yes"].includes(statusStr);

      if (isServiceableApi) {
        setServiceabilityStatus("serviceable");
        return true;
      } else {
        setServiceabilityStatus("not-serviceable");
        return false;
      }
    } catch (error) {
      console.error("❌ Error checking serviceability:", error);
      setServiceabilityStatus("idle");
      return false;
    }
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

    if (orderData.amount >= 200000 && !panCardUrl) {
      onError?.("Please upload PAN Card details for orders above ₹2,00,000");
      return false;
    }

    return true;
  };

  const initiatePayment = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);

    // Check if serviceability has been verified
    if (serviceabilityStatus !== "serviceable") {
      if (serviceabilityStatus === "not-serviceable") {
        toast.error(
          "❌ Sorry, we cannot process customization requests to your area as it is not serviceable. Please contact customer support for more information."
        );
        setIsProcessing(false);
        return;
      } else if (serviceabilityStatus === "checking") {
        toast.info("Please wait while we check if your area is serviceable.");
        setIsProcessing(false);
        return;
      } else {
        // Status is 'idle' - need to check serviceability
        console.log("📍 Checking serviceability for pincode:", billingInfo.zip);
        const isServiceable = await checkServiceability(billingInfo.zip);

        if (!isServiceable) {
          toast.error(
            "❌ Sorry, we cannot process customization requests to your area as it is not serviceable. Please contact customer support for more information."
          );
          setIsProcessing(false);
          return;
        }
      }
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
        orderCategory: orderData.orderCategory || "products",
        orderType: orderData.orderType || "normal",
        customData: orderData.customData,
        items: orderData.items,
        orderDetails: orderData.orderDetails,
        images: orderData.images || [],
        estimatedDelivery:
          orderData.orderDetails?.estimatedDelivery || "03-04-05",
        estimatedDeliveryDay:
          orderData.orderDetails?.estimatedDeliveryDay || "sunday",
        panCardDetails: panCardUrl ? {
          url: panCardUrl,
          uploadedAt: new Date()
        } : undefined
      };

      console.log("💳 Initiating payment with data:", paymentData);

      const response = await paymentService.initiatePayment(paymentData);

      if (response.success) {
        console.log("✅ Payment initiated successfully:", response.data);

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
          handler: () => { }, // Will be set by openRazorpayCheckout
          modal: {
            ondismiss: () => { },
          },
        };

        paymentService.openRazorpayCheckout(
          razorpayOptions,
          async (paymentResponse) => {
            try {
              const verificationResult = await paymentService.verifyPayment({
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
                orderId: response.data.orderId,
              });

              if (verificationResult.success) {
                onPaymentInitiated?.(response.data.orderId);
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
            console.error("Payment error (full object):", paymentError);

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

      // Handle "Order ID already exists" error specifically
      if (
        error instanceof Error &&
        error.message.includes("Order ID already exists")
      ) {
        console.log(
          "⚠️ Order already exists, generating new order ID for retry:",
          orderData.orderId
        );

        try {
          // Generate a new order ID to avoid conflicts
          const generateOrderId = () => {
            const timestamp = Date.now();
            const randomString = Math.random().toString(36).substring(2, 9);
            return `ORD-${timestamp}-${randomString}`;
          };

          const newOrderId = generateOrderId();
          console.log(`🔄 Retrying payment with new order ID: ${newOrderId}`);

          // Create retry payment data with new order ID
          const retryPaymentData: PaymentInitiateRequest = {
            orderId: newOrderId,
            amount: orderData.amount.toString(),
            currency: "INR",
            billingInfo: billingInfo,
            redirectUrl: `${window.location.origin}/payment-success`,
            cancelUrl: `${window.location.origin}/payment-cancel`,
            userId: userInfo.userId,
            orderNumber: newOrderId,
            orderCategory: orderData.orderCategory || "products",
            orderType: orderData.orderType || "normal",
            customData: orderData.customData,
            items: orderData.items,
            orderDetails: orderData.orderDetails,
            images: orderData.images || [],
            estimatedDelivery:
              orderData.orderDetails?.estimatedDelivery || "03-04-05",
            estimatedDeliveryDay:
              orderData.orderDetails?.estimatedDeliveryDay || "sunday",
          };

          console.log(
            "🔄 Initiating payment with new order data:",
            retryPaymentData
          );
          const retryResponse = await paymentService.initiatePayment(
            retryPaymentData
          );

          if (retryResponse.success) {
            console.log("✅ Payment retry successful with new order ID");

            const razorpayOptions = {
              key: retryResponse.data.razorpayKeyId,
              amount: retryResponse.data.amount,
              currency: retryResponse.data.currency,
              name: retryResponse.data.name,
              description: retryResponse.data.description,
              order_id: retryResponse.data.razorpayOrderId,
              prefill: retryResponse.data.prefill,
              theme: retryResponse.data.theme,
              notes: retryResponse.data.notes,
              handler: () => { }, // Will be set by openRazorpayCheckout
              modal: {
                ondismiss: () => { },
              },
            };

            paymentService.openRazorpayCheckout(
              razorpayOptions,
              async (paymentResponse) => {
                try {
                  console.log(
                    "✅ Payment successful with retry order:",
                    paymentResponse
                  );

                  const verificationResult = await paymentService.verifyPayment(
                    {
                      razorpay_order_id: paymentResponse.razorpay_order_id,
                      razorpay_payment_id: paymentResponse.razorpay_payment_id,
                      razorpay_signature: paymentResponse.razorpay_signature,
                      orderId: retryResponse.data.orderId,
                    }
                  );

                  if (verificationResult.success) {
                    console.log(
                      "✅ Payment verified successfully for retry order"
                    );
                    onPaymentInitiated?.(retryResponse.data.orderId);
                    window.location.href = `${window.location.origin}/payment-success?orderId=${retryResponse.data.orderId}&status=success`;
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
                console.error("Payment error:", paymentError);
                onError?.(
                  "Payment failed. Please try again or use another payment method."
                );
              }
            );

            return; // Exit successfully
          } else {
            throw new Error("Failed to initiate payment with new order ID");
          }
        } catch (retryError) {
          console.error("❌ Payment retry failed:", retryError);
          onError?.(
            "Unable to process payment. Please refresh the page and try again."
          );
        }
      } else {
        // Handle other errors normally
        onError?.(
          error instanceof Error ? error.message : "Payment initiation failed"
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Order Summary */}
      <div className=" hidden mb-8 p-4 bg-gray-50 rounded-lg">
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
        </div>
        {pricingSummary ? (
          <div className="border-t pt-3 mt-3 space-y-2 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>
                {formatCurrency(pricingSummary.subtotal ?? orderData.amount)}
              </span>
            </div>
            {pricingSummary.promoDiscount &&
              pricingSummary.promoDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Promo Discount</span>
                  <span>-{formatCurrency(pricingSummary.promoDiscount)}</span>
                </div>
              )}
            {pricingSummary.referralWallet &&
              pricingSummary.referralWallet > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Referral Wallet</span>
                  <span>-{formatCurrency(pricingSummary.referralWallet)}</span>
                </div>
              )}
            <div className="flex justify-between">
              <span>Tax</span>
              <span>{formatCurrency(pricingSummary.tax)}</span>
            </div>
            <div className="flex justify-between font-semibold text-base text-gray-900">
              <span>Amount Due</span>
              <span>
                {formatCurrency(
                  pricingSummary.payableAmount ?? orderData.amount
                )}
              </span>
            </div>
          </div>
        ) : (
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-semibold">
              <span>Total Amount</span>
              <span>₹{orderData.amount.toLocaleString()}</span>
            </div>
          </div>
        )}
        {orderData.orderDetails?.promo && (
          <p className="text-xs text-green-700 mt-1">
            Includes promo {orderData.orderDetails.promo.code} saving ₹
            {typeof orderData.orderDetails.promo.discountValue === "number"
              ? orderData.orderDetails.promo.discountValue.toLocaleString()
              : orderData.orderDetails.promo.discountValue}
          </p>
        )}
        {pricingSummary?.referralWallet &&
          pricingSummary.referralWallet > 0 && (
            <p className="text-xs text-indigo-700">
              Referral wallet redemption: ₹
              {pricingSummary.referralWallet.toLocaleString()}
            </p>
          )}
      </div>

      {/* PAN Card Upload Section for High Value Orders */}
      {orderData.amount >= 200000 && (
        <div className="mb-8 p-6 bg-yellow-50 rounded-lg border border-yellow-200">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-yellow-800">
            <Shield className="w-5 h-5" />
            PAN Card Details Required
          </h3>
          <p className="text-sm text-yellow-700 mb-4">
            As per government regulations, PAN card details are mandatory for orders of ₹2,00,000 and above.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload PAN Card Image *
              </label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handlePanUpload}
                  disabled={isPanUploading}
                  className="bg-white"
                />
                {isPanUploading && <span className="text-sm text-gray-500">Uploading...</span>}
              </div>
              {panCardUrl && (
                <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  PAN Card Verified
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Billing Information */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <Input
              type="text"
              value={billingInfo.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <Input
              type="email"
              value={billingInfo.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <Input
              type="tel"
              value={billingInfo.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="+91 XXXXX XXXXX"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country *
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value);
                setSelectedState(""); // Reset state when country changes
                setSelectedCity(""); // Reset city when country changes
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-400 focus:border-transparent"
              required
            >
              {countries.map((country) => (
                <option key={country.isoCode} value={country.isoCode}>
                  {country.name}
                </option>
              ))}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State *
            </label>
            {states.length > 0 ? (
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setSelectedCity(""); // Reset city when state changes
                }}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                required
              >
                <option value="">Select State</option>
                {states.map((state) => (
                  <option key={state.isoCode} value={state.isoCode}>
                    {state.name}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                type="text"
                value={billingInfo.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                placeholder="Enter State"
                required
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            {cities.length > 0 ? (
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                required
              >
                <option value="">Select City</option>
                {cities.map((city) => (
                  <option key={city.name} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                type="text"
                value={billingInfo.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="Enter City"
                required
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ZIP Code *
            </label>
            <Input
              type="text"
              value={billingInfo.zip}
              onChange={(e) => handleInputChange("zip", e.target.value)}
              placeholder="ZIP Code"
              required
            />
          </div>
        </div>

        {/* Serviceability Status */}
        {serviceabilityStatus && serviceabilityStatus !== "idle" && (
          <div className="mt-4 p-3 rounded-lg border">
            {serviceabilityStatus === "checking" && (
              <div className="text-blue-600 text-sm">
                🔄 Checking if your area is serviceable...
              </div>
            )}
            {serviceabilityStatus === "serviceable" && (
              <div className="text-green-600 text-sm">
                ✅ Great! We can deliver to your area.
              </div>
            )}
            {serviceabilityStatus === "not-serviceable" && (
              <div className="text-red-600 text-sm">
                ❌ Sorry, we cannot deliver to this area currently.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment Button */}
      <div className="flex flex-col space-y-4">
        <Button
          onClick={initiatePayment}
          disabled={
            isProcessing ||
            serviceabilityStatus === "checking" ||
            serviceabilityStatus === "not-serviceable"
          }
          className="w-full bg-[#328F94] hover:bg-[#328F94]/90 text-white py-3 text-lg font-medium flex items-center justify-center gap-2"
        >
          <Lock className="w-5 h-5" />
          {isProcessing
            ? "Processing..."
            : `Pay ₹${orderData.amount.toLocaleString()} securely`}
        </Button>

        <div className="text-center text-xs text-gray-500">
          <p>🔒 Secure payment powered by Razorpay</p>
          <p>Your payment information is encrypted and secure</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;
