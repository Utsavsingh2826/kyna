import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Calendar,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  Truck,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import apiService from "@/services/api";
import SEO from "@/components/SEO";

interface OrderItem {
  productId?: string;
  productName?: string;
  title?: string;
  quantity: number;
  price: number;
  image?: string;
  primaryImage?: string;
  product?: {
    images?: {
      main?: string;
      sub?: string[];
    };
    primaryImage?: string;
    image?: string;
  };
}

interface ShippingAddress {
  name?: string;
  firstName?: string;
  lastName?: string;
  line1?: string;
  street?: string;
  city: string;
  state: string;
  pincode?: string;
  zipCode?: string;
  phone?: string;
  phoneNumber?: string;
  email?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  totalAmount: number;
  status?: string;
  orderStatus?: string;
  createdAt?: string;
  orderedAt?: string;
  items?: OrderItem[];
  images?: string[];
  productDetails?: {
    product?: {
      title?: string;
      price?: number;
      images?: {
        main?: string;
        sub?: string[];
      };
    };
    productSpecs?: {
      title?: string;
      sellingPrice?: number;
    };
  };
  shippingAddress?: ShippingAddress;
  trackingHistory?: Array<{
    status: string;
    timestamp: string;
  }>;
}

const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDeliveredOrders();
  }, []);

  const fetchDeliveredOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getOrders();

      if (response.success && response.data) {
        // Handle both array and object responses
        const ordersData = Array.isArray(response.data)
          ? response.data
          : response.data.orders || response.data || [];

        // Filter for delivered orders - check both order status and tracking status
        const deliveredOrders = ordersData.filter((order: Order) => {
          // Check order status
          const orderStatus = order.status?.toUpperCase() || order.orderStatus?.toLowerCase() || "";
          // Check tracking status if available
          const trackingStatus = (order as any).trackingInfo?.status?.toUpperCase() || "";
          
          return (
            orderStatus === "DELIVERED" || 
            orderStatus === "delivered" ||
            trackingStatus === "DELIVERED"
          );
        });

        // Sort by date (most recent first)
        deliveredOrders.sort((a: Order, b: Order) => {
          const dateA = new Date(a.createdAt || a.orderedAt || 0).getTime();
          const dateB = new Date(b.createdAt || b.orderedAt || 0).getTime();
          return dateB - dateA;
        });

        setOrders(deliveredOrders);
      } else {
        setError(response.error || "Failed to load orders");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Network error. Please check your connection and try again.");
      toast.error("Failed to load order history");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getOrderImage = (order: Order): string | undefined => {
    // Try order images array first
    if (order.images && order.images.length > 0) {
      return order.images[0];
    }

    // Try to get image from items
    if (order.items && order.items.length > 0) {
      const firstItem = order.items[0];
      // Check item's direct image properties
      if (firstItem.image) return firstItem.image;
      if (firstItem.primaryImage) return firstItem.primaryImage;
      // Check populated product images
      if (firstItem.product?.images?.main) return firstItem.product.images.main;
      if (firstItem.product?.primaryImage) return firstItem.product.primaryImage;
      if (firstItem.product?.image) return firstItem.product.image;
      if (firstItem.product?.images?.sub && firstItem.product.images.sub.length > 0) {
        return firstItem.product.images.sub[0];
      }
    }

    // Try productDetails images
    if (order.productDetails?.product?.images?.main) {
      return order.productDetails.product.images.main;
    }
    if (order.productDetails?.product?.images?.sub && order.productDetails.product.images.sub.length > 0) {
      return order.productDetails.product.images.sub[0];
    }

    return undefined;
  };

  const getItemImage = (item: OrderItem): string | undefined => {
    // Check item's direct image properties
    if (item.image) return item.image;
    if (item.primaryImage) return item.primaryImage;
    // Check populated product images
    if (item.product?.images?.main) return item.product.images.main;
    if (item.product?.primaryImage) return item.product.primaryImage;
    if (item.product?.image) return item.product.image;
    if (item.product?.images?.sub && item.product.images.sub.length > 0) {
      return item.product.images.sub[0];
    }
    return undefined;
  };

  const getOrderTitle = (order: Order): string => {
    // Try to get title from items
    if (order.items && order.items.length > 0) {
      const firstItem = order.items[0];
      if (firstItem.productName) return firstItem.productName;
      if (firstItem.title) return firstItem.title;
    }
    // Try productDetails
    if (order.productDetails?.product?.title) {
      return order.productDetails.product.title;
    }
    if (order.productDetails?.productSpecs?.title) {
      return order.productDetails.productSpecs.title;
    }
    return "Order Item";
  };

  const getItemCount = (order: Order): number => {
    if (order.items && order.items.length > 0) {
      return order.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    }
    return 1;
  };

  return (
    <>
      <SEO
        title="Order History | Kyna Jewels"
        description="View your delivered orders from Kyna Jewels"
      />
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-3">
            <nav className="text-sm text-gray-600">
              <Link to="/" className="hover:text-teal-600">
                Home
              </Link>
              <span className="mx-2">-</span>
              <Link to="/profile" className="hover:text-teal-600">
                Profile
              </Link>
              <span className="mx-2">-</span>
              <span className="text-gray-800">Order History</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Order History
              </h1>
              <p className="text-gray-600">
                View all your delivered orders
              </p>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-4" />
                <p className="text-gray-600">Loading your orders...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-600 font-medium mb-4">{error}</p>
                <button
                  onClick={fetchDeliveredOrders}
                  className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && orders.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Delivered Orders Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  You don't have any delivered orders at the moment.
                </p>
                <Link
                  to="/"
                  className="inline-block px-6 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            )}

            {/* Orders List */}
            {!loading && !error && orders.length > 0 && (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                  >
                    {/* Order Header */}
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="font-semibold text-gray-900">
                              Order #{order.orderNumber}
                            </span>
                          </div>
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            Delivered
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Delivered on {formatDate(order.createdAt || order.orderedAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Order Content */}
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Order Image - Show only if no items or single item order */}
                        {getOrderImage(order) && (!order.items || order.items.length <= 1) && (
                          <div className="flex-shrink-0">
                            <img
                              src={getOrderImage(order)}
                              alt={getOrderTitle(order)}
                              className="w-32 h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          </div>
                        )}
                        {/* Fallback image if no image found and no items */}
                        {!getOrderImage(order) && (!order.items || order.items.length === 0) && (
                          <div className="flex-shrink-0 w-32 h-32 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                            <Package className="w-12 h-12 text-gray-400" />
                          </div>
                        )}

                        {/* Order Details */}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {getOrderTitle(order)}
                          </h3>

                          {/* Items List */}
                          {order.items && order.items.length > 0 && (
                            <div className="mb-4">
                              <p className="text-sm text-gray-600 mb-3">
                                {getItemCount(order)} item{getItemCount(order) !== 1 ? "s" : ""}
                              </p>
                              <div className="space-y-3">
                                {order.items.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                                  >
                                    {/* Item Image */}
                                    {getItemImage(item) ? (
                                      <div className="flex-shrink-0">
                                        <img
                                          src={getItemImage(item)}
                                          alt={item.productName || item.title || "Product"}
                                          className="w-16 h-16 object-cover rounded border border-gray-200"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = "none";
                                          }}
                                        />
                                      </div>
                                    ) : (
                                      <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded border border-gray-200 flex items-center justify-center">
                                        <Package className="w-6 h-6 text-gray-400" />
                                      </div>
                                    )}
                                    {/* Item Details */}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {item.productName || item.title || "Item"}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        Quantity: {item.quantity}
                                      </p>
                                    </div>
                                    <div className="flex-shrink-0 text-right">
                                      <span className="text-sm font-semibold text-gray-900">
                                        {formatCurrency(item.price * (item.quantity || 1))}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Shipping Address */}
                          {order.shippingAddress && (
                            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                              <div className="flex items-start gap-2 mb-2">
                                <Truck className="w-4 h-4 text-gray-600 mt-0.5" />
                                <span className="text-sm font-semibold text-gray-900">
                                  Shipping Address
                                </span>
                              </div>
                              <div className="text-sm text-gray-700 space-y-1 ml-6">
                                <p>
                                  {order.shippingAddress.name ||
                                    `${order.shippingAddress.firstName || ""} ${order.shippingAddress.lastName || ""}`.trim()}
                                </p>
                                <p>
                                  {order.shippingAddress.line1 || order.shippingAddress.street}
                                </p>
                                <p>
                                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                                  {order.shippingAddress.pincode || order.shippingAddress.zipCode}
                                </p>
                                {order.shippingAddress.phone && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <Phone className="w-3 h-3" />
                                    <span>{order.shippingAddress.phone}</span>
                                  </div>
                                )}
                                {order.shippingAddress.email && (
                                  <div className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    <span>{order.shippingAddress.email}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Order Total */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <span className="text-lg font-semibold text-gray-900">
                              Total Amount
                            </span>
                            <span className="text-xl font-bold text-teal-600">
                              {formatCurrency(order.totalAmount)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-6 flex gap-3">
                        <Link
                          to={`/track-order?orderNumber=${order.orderNumber}`}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                          Track Order
                        </Link>
                        <button
                          onClick={() => {
                            // Copy order number to clipboard
                            navigator.clipboard.writeText(order.orderNumber);
                            toast.success("Order number copied to clipboard");
                          }}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                          Copy Order Number
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderHistoryPage;
