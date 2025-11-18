import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchCart } from "@/store/slices/cartSlice";
import PaymentForm from "@/components/PaymentForm";
import { Loader, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RootState, AppDispatch } from "@/store";

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const { cart, loading: cartLoading } = useSelector(
    (state: RootState) => state.cart
  );

  // Get direct purchase data from navigation state
  const directPurchaseData = location.state?.directPurchase
    ? location.state
    : null;

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

  // Determine data source (cart or direct purchase)
  const isDirectPurchase = !!directPurchaseData;
  const itemsData = isDirectPurchase
    ? directPurchaseData.items
    : cart?.items || [];
  const totalAmount = isDirectPurchase
    ? directPurchaseData.totalAmount
    : cart?.totalAmount || 0;

  // Prepare order data for payment form
  const orderData = {
    orderId: isDirectPurchase
      ? directPurchaseData.orderData.orderId
      : `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    amount: totalAmount,
    items: itemsData.map((item: any) => ({
      name: item.product?.title || item.product?.name || "Product",
      quantity: item.quantity || 1,
      price: item.price || 0,
      customization: item.customization || null,
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
          }))
        );
      }
      return images;
    }),
    orderDetails: {
      jewelryType: "product",
      description: isDirectPurchase
        ? `Direct purchase: ${directPurchaseData.orderData.product.title}`
        : `Order with ${itemsData.length} items`,
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
    },
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header with back button */}
        <div className="mb-8">
          <Button
            onClick={() => navigate(isDirectPurchase ? -1 : "/cart")}
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
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax (18%)</span>
                  <span>
                    ₹{Math.round(totalAmount * 0.18).toLocaleString()}
                  </span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-semibold text-gray-900">
                    <span>Total</span>
                    <span className="text-lg text-teal-600">
                      ₹{Math.round(totalAmount * 1.18).toLocaleString()}
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
