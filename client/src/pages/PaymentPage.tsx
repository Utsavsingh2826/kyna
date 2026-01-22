import { useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchCart } from "@/store/slices/cartSlice";
import PaymentForm from "@/components/PaymentForm";
import { Loader, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { RootState, AppDispatch } from "@/store";
import { toast } from "sonner";
import apiService from "@/services/api";
import { updateUser } from "@/store/slices/authSlice";

interface PromoApiResponse {
  code: string;
  discountPercent: number;
  discountValue: number;
  diamondSubtotal: number;
  description?: string;
  appliedOn?: string;
}

const extractDiamondCostFromProduct = (product: any): number => {
  if (!product) return 0;
  const breakdown = product.priceBreakdown;
  if (breakdown) {
    if (typeof breakdown.diamondCost === "number") {
      return breakdown.diamondCost;
    }
    if (typeof breakdown.diamondPrice === "number") {
      return breakdown.diamondPrice;
    }
  }
  if (typeof product.diamondTotalValue === "number") {
    return product.diamondTotalValue;
  }
  return 0;
};

const calculateCartDiamondSubtotal = (items: any[]): number => {
  if (!Array.isArray(items)) return 0;
  return items.reduce((sum, item) => {
    const perItemDiamond = extractDiamondCostFromProduct(item.product);
    const quantity = item.quantity || 1;
    return sum + perItemDiamond * quantity;
  }, 0);
};

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );
  const { cart, loading: cartLoading } = useSelector(
    (state: RootState) => state.cart,
  );

  const [persistentOrderId, setPersistentOrderId] = useState<string | null>(
    null,
  );

  // Get direct purchase data from navigation state
  const directPurchaseData = location.state?.directPurchase
    ? location.state
    : null;

  // Initialize persistent order ID for cart purchases
  useEffect(() => {
    if (!directPurchaseData && !persistentOrderId) {
      // Generate persistent order ID for cart purchases only
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const newOrderId = `ORD_${timestamp}_${randomString}`;
      console.log("🆕 Generated persistent cart order ID:", newOrderId);
      setPersistentOrderId(newOrderId);
    }
  }, [directPurchaseData, persistentOrderId]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Fetch cart data when component mounts (only if not direct purchase)
  useEffect(() => {
    if (isAuthenticated && user && !directPurchaseData) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated, user, directPurchaseData]);

  // Promo code UI state
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<any>(null);

  // Make referralBalance reactive to user state changes
  const [referralBalance, setReferralBalance] = useState(0);
  const [walletDiscount, setWalletDiscount] = useState(0);
  const [walletError, setWalletError] = useState("");
  const referralAvailableBalanceFromUser =
    Number(user?.referralAvailableBalance) || 0;

  const fetchReferralBalance = useCallback(async () => {
    if (!isAuthenticated) {
      setReferralBalance(0);
      return;
    }

    try {
      const response = (await apiService.getProfile()) as any;
      if (response.success) {
        const freshUserData = response.data?.user || response.user;
        if (freshUserData) {
          dispatch(updateUser(freshUserData));
          const balance = Math.max(
            0,
            Number(freshUserData.referralAvailableBalance) || 0,
          );
          setReferralBalance(balance);
          return;
        }
      }
      setReferralBalance(referralAvailableBalanceFromUser);
    } catch (error) {
      console.error("Failed to fetch fresh referral data:", error);
      setReferralBalance(referralAvailableBalanceFromUser);
    }
  }, [dispatch, isAuthenticated, referralAvailableBalanceFromUser]);

  useEffect(() => {
    fetchReferralBalance();
  }, [fetchReferralBalance]);

  useEffect(() => {
    setReferralBalance(referralAvailableBalanceFromUser);
  }, [referralAvailableBalanceFromUser]);

  // Determine data source (cart or direct purchase)
  const isDirectPurchase = !!directPurchaseData;
  const itemsData = isDirectPurchase
    ? directPurchaseData.items
    : cart?.items || [];
  const totalAmount = isDirectPurchase
    ? directPurchaseData.totalAmount
    : cart?.totalAmount || 0;

  const directPurchaseDiamondCost = isDirectPurchase
    ? Number(
        directPurchaseData?.orderData?.product?.priceBreakdown?.diamondCost ??
          0,
      )
    : 0;
  const cartDiamondSubtotal = !isDirectPurchase
    ? calculateCartDiamondSubtotal(itemsData)
    : 0;
  const diamondSubtotal = isDirectPurchase
    ? directPurchaseDiamondCost
    : cartDiamondSubtotal;

  const promoDiscount = appliedPromo?.discountValue || 0;
  const maxWalletRedeemable = Math.max(
    0,
    Math.min(referralBalance, Math.max(totalAmount - promoDiscount, 0)),
  );
  const displayedReferralBalance = Math.max(
    0,
    referralBalance - (walletDiscount || 0),
  );

  useEffect(() => {
    if (walletDiscount > maxWalletRedeemable) {
      setWalletDiscount(maxWalletRedeemable);
    }
  }, [walletDiscount, maxWalletRedeemable]);

  const subtotalAfterDiscounts = Math.max(
    totalAmount - promoDiscount - walletDiscount,
    0,
  );
  const taxAmount = Math.round(subtotalAfterDiscounts * 0.03);
  const payableAmount = subtotalAfterDiscounts + taxAmount;

  // Get user info from Redux auth state
  const userInfo = {
    userId: typeof user?.id === "string" ? user.id : "",
    firstName: typeof user?.firstName === "string" ? user.firstName : "",
    lastName: typeof user?.lastName === "string" ? user.lastName : "",
    email: typeof user?.email === "string" ? user.email : "",
    phone: typeof user?.phone === "string" ? user.phone : "",
    address: typeof user?.address === "string" ? user.address : "",
    city: typeof user?.city === "string" ? user.city : "",
    state: typeof user?.state === "string" ? user.state : "",
    zipCode: typeof user?.zipCode === "string" ? user.zipCode : "",
    country: typeof user?.country === "string" ? user.country : "India",
  };

  const promoSummary = appliedPromo
    ? {
        code: appliedPromo.code,
        discountPercent: appliedPromo.discountPercent,
        discountValue: appliedPromo.discountValue,
        diamondSubtotal: appliedPromo.diamondSubtotal,
        appliedOn: appliedPromo.appliedOn || "diamond",
      }
    : undefined;

  const orderPricingSummary = {
    subtotal: totalAmount,
    promoDiscount,
    referralWallet: walletDiscount,
    taxableAmount: subtotalAfterDiscounts,
    tax: taxAmount,
    payableAmount,
    diamondSubtotal,
  };

  // Prepare order data for payment form
  const orderData = {
    orderId: isDirectPurchase
      ? directPurchaseData.orderData.orderId
      : persistentOrderId ||
        `ORD_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`, // Fallback if persistent ID not ready
    amount: payableAmount,
    items: itemsData.map((item: any) => ({
      name: item.product?.title || item.product?.name || "Product",
      quantity: item.quantity || 1,
      price: item.price || 0,
      customization: item.customization || null,
      // Add variant details for cart items
      variantSku: item.variantSku || null,
      variantConfig: item.variantConfig || null,
      productSku: item.product?.sku || item.product?.modelSku || null,
    })),
    images: itemsData.flatMap((item: any) => {
      const images = [];
      if (item.product?.images?.main) {
        images.push({
          url: item.product.images.main,
          alt: item.product?.title,
        });
      }
      if (item.product?.images?.sub && Array.isArray(item.product.images.sub)) {
        images.push(
          ...item.product.images.sub.map((url: string) => ({
            url,
            alt: item.product?.title,
          })),
        );
      }
      return images;
    }),
    orderDetails: {
      jewelryType: "product",
      description: isDirectPurchase
        ? `Direct purchase: ${directPurchaseData.orderData.product.title}`
        : `Order with ${itemsData.length} items${
            itemsData.length > 0
              ? ": " +
                itemsData
                  .map((item: any) => item.product?.title || "Product")
                  .join(", ")
              : ""
          }`,
      sku: isDirectPurchase
        ? directPurchaseData.orderData.product.sku
        : undefined,
      variantSku: isDirectPurchase
        ? directPurchaseData.orderData.product.variantSku
        : undefined,
      isDirectPurchase,
      directPurchaseData: isDirectPurchase
        ? {
            product: directPurchaseData.orderData.product,
            customization: directPurchaseData.orderData.customization,
          }
        : null,
      promo: promoSummary,
      referralWallet:
        walletDiscount > 0
          ? {
              amountRequested: walletDiscount,
            }
          : undefined,
      pricingSummary: orderPricingSummary,
      // Add cart items data for multi-item orders
      cartItems: !isDirectPurchase
        ? itemsData.map((item: any) => ({
            productId: item.product?._id,
            productTitle: item.product?.title,
            productSku: item.product?.sku || item.product?.modelSku,
            variantSku: item.variantSku,
            variantConfig: item.variantConfig,
            quantity: item.quantity,
            price: item.price,
            sellingPrice: item.variantConfig?.sellingPrice || item.price,
            priceBreakdown: item.variantConfig?.priceBreakdown,
            metalDetails: {
              type: item.variantConfig?.metalType,
              color: item.variantConfig?.metalColor,
              karat: item.variantConfig?.goldKarat,
            },
            diamondDetails: {
              shape: item.variantConfig?.diamondShape,
              size: item.variantConfig?.diamondSize,
              origin: item.variantConfig?.diamondOrigin,
              color: item.variantConfig?.diamondColor,
              clarity: item.variantConfig?.diamondClarity,
            },
            ringDetails: {
              size: item.variantConfig?.ringSize || "",
            },
          }))
        : null,
    },
  };

  const handlePaymentInitiated = async (orderId: string) => {
    try {
      console.log("Payment initiated for order:", orderId);
      // The PaymentForm component handles the rest
      // The checkout page already handles order creation after payment verification
    } catch (error) {
      console.error("Error handling payment initiation:", error);
    }
  };

  const handleError = (errorMsg: string) => {
    alert("Payment error: " + errorMsg);
    // Error will be shown to user by PaymentForm component
  };

  const promoContext = isDirectPurchase ? "direct" : "cart";

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoError("");

    try {
      const payload: any = {
        code: promoCode.trim().toUpperCase(),
        context: promoContext,
      };

      if (promoContext === "direct") {
        if (!directPurchaseDiamondCost) {
          throw new Error(
            "Diamond value is unavailable for this product. Promo cannot be applied.",
          );
        }
        payload.directPurchase = { diamondCost: directPurchaseDiamondCost };
      }

      const response = await apiService.validatePromoCode(payload);

      if (response.success && response.data) {
        const promoData = response.data as PromoApiResponse;
        setAppliedPromo(promoData);
        setPromoCode("");
        toast.success(
          `Promo ${promoData.code} applied. You saved ₹${promoData.discountValue}`,
        );
      } else {
        const fallbackMessage =
          response.error || response.message || "Promo invalid";
        setPromoError(fallbackMessage);
        toast.error(fallbackMessage);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to apply promo";
      setPromoError(message);
      toast.error(message);
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoError("");
    toast.info("Promo removed");
  };

  const handleToggleWallet = async () => {
    if (walletDiscount > 0) {
      const prevDiscount = walletDiscount;
      setWalletDiscount(0);
      setWalletError("");
      toast.info("Referral earnings removed");
      if (prevDiscount > 0) {
        await fetchReferralBalance();
      }
      return;
    }

    if (referralBalance <= 0) {
      const message = "No referral earnings available to redeem.";
      setWalletError(message);
      toast.error(message);
      return;
    }

    if (maxWalletRedeemable <= 0) {
      const message =
        "No payable amount remaining to redeem referral earnings.";
      setWalletError(message);
      toast.warning(message);
      return;
    }

    setWalletDiscount(maxWalletRedeemable);
    setWalletError("");
    toast.success(
      `Referral earnings of ₹${maxWalletRedeemable.toLocaleString()} applied`,
    );
    await fetchReferralBalance();
  };

  // Check if cart is empty (only for cart-based purchases)
  if (!directPurchaseData && cartLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-teal-600" />
          <h2 className="text-2xl font-semibold text-gray-900">
            Loading Cart...
          </h2>
        </div>
      </div>
    );
  }

  if (
    !directPurchaseData &&
    (!cart || !cart.items || cart.items.length === 0)
  ) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-6">
            Add some items to proceed with payment
          </p>
          <Button
            onClick={() => navigate("/cart")}
            className="bg-[#328F94] hover:bg-[#328F94]/90 text-white"
          >
            Back to Cart
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header with back button */}
        <div className="mb-8">
          <Button
            onClick={() => {
              if (isDirectPurchase) {
                navigate(-1);
              } else {
                navigate("/cart");
              }
            }}
            variant="ghost"
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            {isDirectPurchase ? "Back to Product" : "Back to Cart"}
          </Button>

          <div className="bg-white rounded-lg p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Complete Your Payment
            </h1>
            <p className="text-gray-600">
              {itemsData?.length || 0} item
              {(itemsData?.length || 0) !== 1 ? "s" : ""} • Total:{" "}
              <span className="font-semibold text-gray-900">
                ₹{totalAmount.toLocaleString()}
              </span>
            </p>
            {appliedPromo && (
              <p className="text-sm text-green-700 mt-1">
                Promo {appliedPromo.code} applied: now paying ₹
                {payableAmount.toLocaleString()}
              </p>
            )}
            {walletDiscount > 0 && (
              <p className="text-sm text-indigo-700">
                Referral wallet applied: ₹
                {walletDiscount.toLocaleString("en-IN")}
              </p>
            )}
            {isDirectPurchase && directPurchaseData?.orderData?.product && (
              <div className="mt-3 text-sm text-gray-600">
                <strong>Product:</strong>{" "}
                {directPurchaseData.orderData.product.title}
                {directPurchaseData.orderData.customization && (
                  <div className="mt-1">
                    <strong>Customization:</strong>{" "}
                    {directPurchaseData.orderData.customization.metalColor},{" "}
                    {directPurchaseData.orderData.customization.metalType}{" "}
                    {directPurchaseData.orderData.customization.goldKarat},{" "}
                    {directPurchaseData.orderData.customization.diamondShape}{" "}
                    {directPurchaseData.orderData.customization.diamondSize}ct,{" "}
                    {directPurchaseData.orderData.customization.diamondOrigin}
                    {directPurchaseData.orderData.customization.ringSize && (
                      <>
                        , Size:{" "}
                        {directPurchaseData.orderData.customization.ringSize}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Promo Code Section */}
        {/* {isDirectPurchase && ( */}
        <div className="bg-white rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Coupon Code
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Apply a promo to get additional savings on the diamond value of your
            order.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              disabled={promoLoading || !!appliedPromo}
              className="flex-1"
            />
            <Button
              onClick={handleApplyPromo}
              disabled={promoLoading || !promoCode.trim() || !!appliedPromo}
              className="bg-[#328F94] hover:bg-[#28777b]"
            >
              {promoLoading ? "Applying..." : "Apply Coupon"}
            </Button>
          </div>
          {promoError && (
            <p className="text-sm text-red-500 mt-2">{promoError}</p>
          )}
          {appliedPromo && (
            <div className="mt-4 flex flex-col gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold">
                  Promo {appliedPromo.code} applied
                </p>
                <p>
                  Savings: ₹{appliedPromo.discountValue.toLocaleString()} on
                  diamond value ₹{appliedPromo.diamondSubtotal.toLocaleString()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemovePromo}
                className="text-red-600 hover:text-red-700"
              >
                Remove
              </Button>
            </div>
          )}
        </div>
        {/* )} */}

        {/* Referral Wallet Section */}
        <div className="bg-white rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Referral Wallet
          </h2>
          <p className="text-sm text-gray-600">
            Wallet balance:{" "}
            <span className="font-semibold">
              ₹{displayedReferralBalance.toLocaleString("en-IN")}
            </span>
          </p>
          {walletDiscount > 0 ? (
            <p className="text-sm text-green-700 mt-1">
              Redeeming ₹{walletDiscount.toLocaleString("en-IN")} on this order.
            </p>
          ) : (
            <p className="text-sm text-gray-500 mt-1">
              You can redeem up to ₹
              {maxWalletRedeemable.toLocaleString("en-IN")} on this order.
            </p>
          )}
          <div className="mt-4">
            <Button
              onClick={handleToggleWallet}
              disabled={referralBalance <= 0 && walletDiscount <= 0}
              className="bg-[#4c4f8f] hover:bg-[#3c3f72] text-white"
            >
              {walletDiscount > 0
                ? "Remove Redemption"
                : "Redeem Referral Earnings"}
            </Button>
          </div>
          {walletError && (
            <p className="text-sm text-red-500 mt-2">{walletError}</p>
          )}
        </div>

        {/* Main content - Payment Form and Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <PaymentForm
              orderData={orderData}
              userInfo={userInfo}
              onPaymentInitiated={handlePaymentInitiated}
              onError={handleError}
            />
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 sticky top-4 shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                {itemsData?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <div>
                      <p className="font-medium text-gray-900">
                        {item.product?.title || "Product"}
                      </p>
                      <p className="text-gray-600 text-xs">
                        Qty: {item.quantity}
                      </p>
                      {item.customization && (
                        <div className="text-xs text-gray-500 mt-1">
                          {item.customization.metalColor},{" "}
                          {item.customization.metalType}{" "}
                          {item.customization.goldKarat}
                          {item.customization.ringSize &&
                            `, Size: ${item.customization.ringSize}`}
                        </div>
                      )}
                    </div>
                    <p className="font-medium text-gray-900">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Promo ({appliedPromo.code})</span>
                    <span>-₹{promoDiscount.toLocaleString()}</span>
                  </div>
                )}
                {walletDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Referral Wallet</span>
                    <span>-₹{walletDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax (3%)</span>
                  <span>₹{taxAmount.toLocaleString()}</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-semibold text-gray-900">
                    <span>Total Payable</span>
                    <span className="text-lg text-teal-600">
                      ₹{payableAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center gap-2 text-xs text-gray-600 bg-gray-50 p-3 rounded">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 9.707a1 1 0 010-1.414L10 3.586l4.707 4.707a1 1 0 01-1.414 1.414L10 6.414l-3.293 3.293a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Secure & Encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
