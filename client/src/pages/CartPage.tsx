import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Minus, ArrowLeft, ArrowRight, Edit } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import {
  fetchCart,
  updateCartItem,
  removeFromCart,
} from "@/store/slices/cartSlice";
// import { updateUser } from "@/store/slices/authSlice";
import apiService from "@/services/api";
import ReferralPromoSection from "@/components/ReferralPromoSection";
import { toast } from "sonner";
// import { Item } from "@radix-ui/react-accordion";

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { cart, loading, error } = useSelector(
    (state: RootState) => state.cart,
  );
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  // const [setSelectedBillingAddress] = useState("");
  // const [setSelectedShippingAddress] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Promo and referral code states
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [appliedReferral, setAppliedReferral] = useState<any>(null);

  const [showTermsError, setShowTermsError] = useState(false);
  const formattedDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 25);
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Fetch cart when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  // Handle Add Address click - redirect to profile page
  // const handleAddAddress = () => {
  //   navigate("/profile");
  // };

  // Set default addresses when user data is available
  // useEffect(() => {
  //   if (user?.addresses && user.addresses.length > 0) {
  //     const defaultAddress =
  //       user.addresses.find((addr) => addr.isDefault) || user.addresses[0];
  //     setSelectedBillingAddress(defaultAddress._id || "");
  //     setSelectedShippingAddress(defaultAddress._id || "");
  //   }
  // }, [user]);

  const handleQuantityChange = async (
    productId: string,
    newQuantity: number,
    variantSku?: string,
    variantConfig?: any,
  ) => {
    console.log("🔍 handleQuantityChange called with:", {
      productId,
      newQuantity,
      variantSku,
      variantConfig,
    });

    if (newQuantity < 1) {
      console.log("➖ Removing item (quantity < 1)");
      dispatch(
        removeFromCart(productId, {
          variantSku,
          variantConfig,
        }),
      );
    } else {
      console.log("➕ Updating quantity to:", newQuantity);
      dispatch(
        updateCartItem(productId, newQuantity, {
          variantSku,
          variantConfig,
        }),
      );
    }
  };

  const handleRemoveItem = async (
    productId: string,
    variantSku?: string,
    variantConfig?: any,
  ) => {
    dispatch(
      removeFromCart(productId, {
        variantSku,
        variantConfig,
      }),
    );
  };

  const handleEditProduct = (
    product: any,
    variantSku: string,
    metalColor?: string,
    variantConfig?: any,
  ) => {
    console.log("✏️ handleEditProduct called with:", {
      product,
      variantSku,
      metalColor,
      variantConfig,
    });

    // Safety check to ensure product and required properties exist
    // Added parentSku check as some products (like engagement rings) use that instead of modelSku
    if (!product || (!product.modelSku && !product.sku && !product.parentSku)) {
      console.error("Product or SKU is missing:", product);
      toast.error("Cannot edit details: Product information missing");
      return;
    }

    // Debug: Check if variantSku is missing metal code
    if (variantSku && variantSku.includes("--")) {
      console.error("⚠️ VARIANT SKU IS MALFORMED (double dash):", variantSku);
      console.log("Variant Config:", variantConfig);

      // Try to reconstruct the correct variant SKU from variantConfig
      if (variantConfig?.metalType) {
        const metalCodeMap: { [key: string]: string } = {
          GOLD: "",
          PLATINUM: "PT",
          SILVER: "SLV",
        };

        let metalCode = "";
        if (variantConfig.metalType === "GOLD") {
          // Extract karat number (e.g., "18kt" -> "18")
          const karatMatch = variantConfig.goldKarat?.match(/(\d+)/);
          metalCode = karatMatch ? karatMatch[1] : "18";
          console.log("🔍 GOLD detected, extracted karat:", metalCode);
        } else {
          metalCode = metalCodeMap[variantConfig.metalType] || "";
          console.log(
            "🔍 Non-GOLD metal detected:",
            variantConfig.metalType,
            "→ code:",
            metalCode,
          );
        }

        if (metalCode) {
          // Replace double dash with metal code
          const parts = variantSku.split("--");
          if (parts.length === 2) {
            const oldSku = variantSku;
            variantSku = `${parts[0]}-${metalCode}-${parts[1]}`;
            console.log("✅ RECONSTRUCTED VARIANT SKU:");
            console.log("   OLD:", oldSku);
            console.log("   NEW:", variantSku);
          }
        } else {
          console.error("❌ Failed to extract metal code");
        }
      } else {
        console.error("❌ variantConfig or metalType is missing");
      }
    }

    // Navigate to product page with variant parameter and metal color
    const productSku = product.sku || product.modelSku || product.parentSku;
    let category = (product.category || "rings").toLowerCase(); // Default fallback
    if (product.category?.toLowerCase() === "ring") {
      category = "rings";
    }

    // Map metal color to code for URL
    const metalColorMap: { [key: string]: string } = {
      White: "WG",
      Yellow: "YG",
      Rose: "RG",
      "Black Rhodium": "BR",
      "White - Black Rhodium": "WG-BR",
      "White - Yellow": "WG-YG",
      "White - Rose": "WG-RG",
      "Yellow - White": "YG-WG",
      "Yellow - Rose": "YG-RG",
      "Yellow - Black Rhodium": "YG-BR",
      "Rose - White": "RG-WG",
      "Rose - Yellow": "RG-YG",
      "Rose - Black Rhodium": "RG-BR",
      "3T": "3T",
    };

    let url = `/product/${category}/${productSku}?variantId=${variantSku}`;
    console.log("🚀 Navigating to:", url);

    // Add metal color parameter if available
    if (metalColor && metalColorMap[metalColor]) {
      url += `&metalColor=${metalColorMap[metalColor]}`;
    }

    console.log("🚀 Final URL:", url);
    navigate(url);
  };

  const handleRingSizeUpdate = async (itemId: string, newRingSize: string) => {
    try {
      // Update ring size in cart item
      // Note: You'll need to implement this endpoint in your backend
      const response = await apiService.updateCartItemRingSize(
        itemId,
        newRingSize,
      );
      if (response.success) {
        dispatch(fetchCart()); // Refresh cart
      } else {
        alert(response.error || "Failed to update ring size");
      }
    } catch (error) {
      console.error("Failed to update ring size:", error);
      alert("Failed to update ring size");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Loading Cart...
          </h2>
          <p className="text-gray-600">
            Please wait while we fetch your items.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-6">
            Add some items to your cart to get started
          </p>
          <Link to="/">
            <Button className="bg-[#3AAFA9] hover:bg-[#2a8a85] text-white">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = cart.totalAmount;
  const promoDiscount = appliedPromo?.discountAmount || 0;
  const referralDiscount = appliedReferral?.discountAmount || 0;
  const totalDiscount = promoDiscount + referralDiscount;
  const tax = Math.round((subtotal - totalDiscount) * 0.03); // 3% GST
  const total = subtotal - totalDiscount + tax;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Assistance Header */}
        <div className="text-right text-sm text-gray-600 mb-6">
          <a
            href="https://wa.me/918235567890"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#3AAFA9] hover:underline"
          >
            Need Assistance? Chat Now
          </a>{" "}
          &nbsp;or&nbsp;
          <a href="tel:+918928610682" className="hover:underline">
            call +91 8235567890
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6 lg:space-y-8">
            {/* Shopping Cart Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3 md:mb-4">
                Shopping Cart
              </h1>
              <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
                Total Items: {cart.items?.length || 0}
              </p>

              <div className="space-y-6">
                {cart.items?.map((item) => {
                  // Handle case where product might be null
                  if (!item.product) {
                    return (
                      <div
                        key={item._id}
                        className="border-b border-gray-100 pb-6 last:border-b-0"
                      >
                        <div className="text-center py-4">
                          <p className="text-gray-500">
                            Product information unavailable
                          </p>
                          <button
                            onClick={() =>
                              handleRemoveItem(
                                item.product?._id || item._id,
                                item.variantSku,
                                item.variantConfig,
                              )
                            }
                            className="mt-2 text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove Item
                          </button>
                        </div>
                      </div>
                    );
                  }

                  const variantConfig = (item.variantConfig || {}) as any;
                  const priceBreakdownRaw = variantConfig?.priceBreakdown;
                  const priceBreakdown = Array.isArray(priceBreakdownRaw)
                    ? priceBreakdownRaw[0] || {}
                    : priceBreakdownRaw || {};
                  const rawVariantImages = Array.isArray(
                    variantConfig?.variantImages,
                  )
                    ? variantConfig.variantImages
                    : [];
                  const variantImages = rawVariantImages
                    .map((image: any) =>
                      typeof image === "string"
                        ? image
                        : image?.url || image?.imageUrl || image?.src || "",
                    )
                    .filter(Boolean);
                  const primaryVariantImage = variantImages[0] || "";
                  const productCategory = (
                    typeof (item.product as any)?.category === "string"
                      ? ((item.product as any)?.category as string)
                      : ""
                  ).toUpperCase();

                  return (
                    <div
                      key={item._id}
                      className="border-b border-gray-100 pb-6 last:border-b-0"
                    >
                      <div className="flex items-start space-x-4">
                        {/* <div className="text-xs text-gray-500 mb-2 w-full">
                          Product Added{" "}
                          {new Date(
                            item.product?.createdAt ||
                              item.createdAt ||
                              Date.now()
                          ).toLocaleDateString()}
                        </div> */}
                      </div>

                      <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
                        <img
                          src={primaryVariantImage}
                          alt={item.product.title}
                          className="w-full sm:w-20 h-48 sm:h-20 object-cover rounded"
                        />

                        <div className="flex-1 w-full">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <h3 className="font-medium text-gray-900 text-sm md:text-base">
                              {variantConfig?.title || item.product.title}
                            </h3>
                            <button
                              onClick={() =>
                                handleEditProduct(
                                  item.product,
                                  item.variantSku,
                                  variantConfig?.metalColor,
                                  variantConfig,
                                )
                              }
                              className="bg-[#2a8a85] hover:bg-[#1f6b66] text-white px-3 md:px-4 py-1.5 md:py-2 rounded-md transition-colors duration-200 flex items-center justify-center space-x-1 text-sm whitespace-nowrap"
                            >
                              <Edit className="w-3 h-3 md:w-4 md:h-4" />
                              <span className="text-xs md:text-sm">
                                Edit Details
                              </span>
                            </button>
                          </div>
                          {/* <p className="text-sm text-gray-600 mb-2">
                            SKU: {item.product.modelSku}
                          </p> */}

                          <div className="hidden sm:flex justify-end mt-2">
                            <p className="text-lg font-semibold text-gray-900">
                              ₹
                              {(item.price * item.quantity).toLocaleString(
                                "en-IN",
                              )}
                              .00
                            </p>
                          </div>

                          {/* Enhanced Variant Information Display */}
                          {item.variantSku && (
                            <div className="mb-4 p-2 md:p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                <p className="text-xs md:text-sm font-semibold text-gray-800 break-all">
                                  Variant: {item.variantSku}
                                </p>
                                <p className="text-base md:text-lg font-bold text-[#2a8a85]">
                                  ₹
                                  {(
                                    variantConfig?.sellingPrice ||
                                    item.price ||
                                    0
                                  ).toLocaleString("en-IN")}
                                </p>
                              </div>

                              {/* Variant Images Row */}
                              {variantImages.length > 0 && (
                                <div className="mb-2 md:mb-3">
                                  <p className="text-xs text-gray-600 mb-1">
                                    Variant Images:
                                  </p>
                                  <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-thin">
                                    {variantImages
                                      .slice(0, 4)
                                      .map((image: any, index: number) => (
                                        <img
                                          key={index}
                                          src={image}
                                          alt={`Variant ${index + 1}`}
                                          className="w-12 h-12 object-cover rounded border-2 border-gray-200 hover:border-[#2a8a85] transition-colors flex-shrink-0 cursor-pointer"
                                          onError={(e) => {
                                            console.warn(
                                              `Failed to load variant image: ${image}`,
                                            );
                                            e.currentTarget.style.display =
                                              "none";
                                          }}
                                          title={`Variant image ${index + 1}`}
                                        />
                                      ))}
                                    {variantImages.length > 4 && (
                                      <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded border-2 border-gray-200 text-xs text-gray-600">
                                        +{variantImages.length - 4}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Price Breakdown */}
                              {/* {variantConfig?.priceBreakdown && (
                                <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-200">
                                  <p className="text-xs font-medium text-blue-800 mb-1">
                                    Price Breakdown:
                                  </p>
                                  <div className="grid grid-cols-2 gap-1 text-xs text-blue-700">
                                    {priceBreakdown.metalCost && (
                                      <div>
                                        Metal: ₹
                                        {priceBreakdown.metalCost.toLocaleString(
                                          "en-IN"
                                        )}
                                      </div>
                                    )}
                                    {priceBreakdown.diamondCost && (
                                      <div>
                                        Diamond: ₹
                                        {priceBreakdown.diamondCost.toLocaleString(
                                          "en-IN"
                                        )}
                                      </div>
                                    )}
                                    {priceBreakdown.labourCost && (
                                      <div>
                                        Labour: ₹
                                        {priceBreakdown.labourCost.toLocaleString(
                                          "en-IN"
                                        )}
                                      </div>
                                    )}
                                    {priceBreakdown.gstAmount && (
                                      <div>
                                        GST ({priceBreakdown.gstPercent}
                                        %): ₹
                                        {priceBreakdown.gstAmount.toLocaleString(
                                          "en-IN"
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )} */}

                              {variantConfig && (
                                <div className="space-y-2">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs md:text-sm">
                                    {variantConfig.metalType && (
                                      <div className="flex items-center">
                                        <span className="text-gray-600 mr-1">
                                          Metal:
                                        </span>
                                        <span className="">
                                          {variantConfig.metalType}{" "}
                                          {variantConfig.goldKarat}
                                          {variantConfig.metalColor && (
                                            <span className="ml-1 text-xs bg-gray-200 px-1 rounded">
                                              {variantConfig.metalColor}
                                            </span>
                                          )}
                                        </span>
                                      </div>
                                    )}
                                    {variantConfig.diamondShape && (
                                      <div className="flex items-center">
                                        <span className="text-gray-600 mr-1">
                                          Diamond:
                                        </span>
                                        <span className="">
                                          {variantConfig.diamondShape}{" "}
                                          {variantConfig.diamondSize}ct
                                        </span>
                                      </div>
                                    )}
                                    {variantConfig.diamondOrigin && (
                                      <div className="flex items-center">
                                        <span className="text-gray-600 mr-1">
                                          Origin:
                                        </span>
                                        <span className="">
                                          {variantConfig.diamondOrigin}
                                        </span>
                                      </div>
                                    )}
                                    {variantConfig.hasEngraving && (
                                      <div className="flex items-center col-span-2">
                                        <span className="text-gray-600 mr-1">
                                          Engraving:
                                        </span>
                                        <div className="flex items-center space-x-2">
                                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                            ✨ Engraved
                                          </span>
                                          {variantConfig.engravingText && (
                                            <span className="text-xs bg-purple-50 px-2 py-1 rounded border border-purple-200 text-purple-700">
                                              "{variantConfig.engravingText}"
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Ring Size Dropdown - Only for Rings */}
                                  {productCategory === "RINGS" && (
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-2 border-t border-gray-200">
                                      <span className="text-xs md:text-sm text-gray-600 font-medium">
                                        Ring Size:
                                      </span>
                                      <select
                                        value={variantConfig.ringSize || ""}
                                        onChange={(e) =>
                                          handleRingSizeUpdate(
                                            item._id,
                                            e.target.value,
                                          )
                                        }
                                        className="text-xs md:text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-[#2a8a85] bg-white w-full sm:min-w-[120px] sm:w-auto"
                                      >
                                        <option value="">Select Size</option>
                                        <option value="11 (16.3MM)">
                                          11 (16.3MM)
                                        </option>
                                        <option value="12 (16.5MM)">
                                          12 (16.5MM)
                                        </option>
                                        <option value="13 (16.9MM)">
                                          13 (16.9MM)
                                        </option>
                                        <option value="14 (17.3MM)">
                                          14 (17.3MM)
                                        </option>
                                        <option value="15 (17.5MM)">
                                          15 (17.5MM)
                                        </option>
                                        <option value="16 (17.9MM)">
                                          16 (17.9MM)
                                        </option>
                                        <option value="17 (18.1MM)">
                                          17 (18.1MM)
                                        </option>
                                        <option value="18 (18.5MM)">
                                          18 (18.5MM)
                                        </option>
                                        <option value="19 (18.7MM)">
                                          19 (18.7MM)
                                        </option>
                                        <option value="20 (19.2MM)">
                                          20 (19.2MM)
                                        </option>
                                        <option value="21 (19.4MM)">
                                          21 (19.4MM)
                                        </option>
                                        <option value="22 (19.8MM)">
                                          22 (19.8MM)
                                        </option>
                                        <option value="23 (20MM)">
                                          23 (20MM)
                                        </option>
                                        <option value="24 (20.4MM)">
                                          24 (20.4MM)
                                        </option>
                                        <option value="25 (20.6MM)">
                                          25 (20.6MM)
                                        </option>
                                      </select>
                                      {variantConfig.ringSize && (
                                        <span className="text-xs text-green-600 font-medium">
                                          ✓ Selected
                                        </span>
                                      )}
                                      {!variantConfig.ringSize && (
                                        <span className="text-xs text-orange-600 font-medium">
                                          ⚠ Please select ring size
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {!item.variantSku && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              <span className="px-2 py-1 bg-gray-100 text-xs text-gray-700 rounded">
                                Quantity: {item.quantity}
                              </span>
                              <span className="px-2 py-1 bg-gray-100 text-xs text-gray-700 rounded">
                                Price: ₹
                                {(
                                  variantConfig?.sellingPrice ||
                                  item.price ||
                                  0
                                ).toLocaleString("en-IN")}
                              </span>
                            </div>
                          )}

                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs md:text-sm text-gray-600">
                                  Qty:
                                </span>
                                <button
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.product._id,
                                      item.quantity - 1,
                                      item.variantSku,
                                      item.variantConfig,
                                    )
                                  }
                                  className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center border-2 border-[#2a8a85] text-[#2a8a85] hover:bg-[#2a8a85] hover:text-white rounded-md transition-colors duration-200"
                                >
                                  <Minus className="w-3 h-3 md:w-4 md:h-4" />
                                </button>
                                <span className="w-7 md:w-8 text-center font-medium text-sm md:text-base">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.product._id,
                                      item.quantity + 1,
                                      item.variantSku,
                                      item.variantConfig,
                                    )
                                  }
                                  className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center border-2 border-[#182625] text-[#2a8a85] hover:bg-[#2a8a85] hover:text-white rounded-md transition-colors duration-200"
                                >
                                  <Plus className="w-3 h-3 md:w-4 md:h-4" />
                                </button>
                              </div>
                              <p className="text-base md:text-lg font-semibold text-gray-900 sm:hidden">
                                ₹
                                {(item.price * item.quantity).toLocaleString(
                                  "en-IN",
                                )}
                                .00
                              </p>
                            </div>

                            <div className="flex space-x-2">
                              <button
                                className="border-2 border-[#2a8a85] text-[#2a8a85] hover:bg-[#2a8a85] hover:text-white bg-white px-3 md:px-4 py-1.5 md:py-2 rounded-md transition-colors duration-200 font-medium text-xs md:text-sm w-full sm:w-auto"
                                onClick={() =>
                                  handleRemoveItem(
                                    item.product._id,
                                    item.variantSku,
                                    item.variantConfig,
                                  )
                                }
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200">
                <Link
                  to="/"
                  className="inline-flex items-center text-[#3AAFA9] hover:text-[#2a8a85] font-medium text-sm md:text-base"
                >
                  <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 mr-2" />← RETURN
                  TO SHOP
                </Link>
                <div className="border-t border-dashed border-gray-300 mt-2"></div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4 md:space-y-6">
            {/* Promo & Referral Code Section */}
            <ReferralPromoSection
              onPromoApplied={setAppliedPromo}
              onReferralApplied={setAppliedReferral}
              onPromoRemoved={() => setAppliedPromo(null)}
              onReferralRemoved={() => setAppliedReferral(null)}
              appliedPromo={appliedPromo}
              appliedReferral={appliedReferral}
            />

            {/* Cart Price Details Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">
                Cart Price Details
              </h3>
              <div className="space-y-2 md:space-y-3 text-sm md:text-base">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sub-total</span>
                  <span className="font-medium">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                {totalDiscount > 0 && (
                  <>
                    {appliedPromo && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Promo Discount ({appliedPromo.code})
                        </span>
                        <span className="font-medium text-green-600">
                          -₹{appliedPromo.discountAmount}
                        </span>
                      </div>
                    )}
                    {appliedReferral && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Referral Bonus ({appliedReferral.code})
                        </span>
                        <span className="font-medium text-green-600">
                          -₹{appliedReferral.discountAmount}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Discount</span>
                      <span className="font-medium text-green-600">
                        -₹{totalDiscount}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">
                    ₹{tax.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">
                      Total
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      ₹{total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) =>
                      setTermsAccepted(Boolean(checked))
                    }
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm text-gray-600 cursor-pointer"
                  >
                    By Clicking this, I agree to Kyna{" "}
                    <Link
                      to="/terms-conditions"
                      className="text-[#3AAFA9] hover:underline"
                    >
                      Terms & Conditions
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy-policy"
                      className="text-[#3AAFA9] hover:underline"
                    >
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <Button
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2.5 md:py-3 text-base md:text-lg"
                  onClick={() => {
                    if (!termsAccepted) {
                      setShowTermsError(true);
                      return;
                    }
                    navigate("/payment");
                  }}
                >
                  Proceed To Checkout
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                </Button>
                {showTermsError && !termsAccepted && (
                  <p className="text-red-500 text-sm mt-1 text-center">
                    You must accept Terms & Conditions before proceeding.
                  </p>
                )}
              </div>
            </div>

            {/* Shipping & Returns Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
              <div className="space-y-2 md:space-y-3 text-xs md:text-sm text-gray-600">
                {/* Estimated Ship Date */}
                <div className=" text-sm">
                  <div className="font-medium">
                    Estimated Ship Date: {formattedDate}
                  </div>
                  <div className="text-muted-foreground">
                    Free Shipping | Free Returns
                  </div>
                </div>

                <div className="flex items-center space-x-2 md:space-x-4 mt-3 md:mt-4">
                  <div className="flex items-center gap-2 md:gap-4">
                    <img
                      className="w-6 h-6 md:w-8 md:h-8"
                      src="/Hallmarks/BIS.png"
                      alt="Hallmark"
                    />
                    <img
                      className="w-6 h-6 md:w-8 md:h-8"
                      src="/Hallmarks/IGI.png"
                      alt="IGI"
                    />
                    <img
                      className="w-6 h-6 md:w-8 md:h-8"
                      src="/Hallmarks/SGL.png"
                      alt="SGA"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
