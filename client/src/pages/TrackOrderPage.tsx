import { useState, useEffect, useCallback } from "react";
import { Package, Search, Mail, AlertCircle, Clock, RefreshCw, XCircle, FileText } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import TrackingProgress from "@/components/tracking/TrackingProgress";
import TrackingTimeline from "@/components/tracking/TrackingTimeline";
import TrackingCard from "@/components/tracking/TrackingCard";
import SEO from "@/components/SEO";
import { getAccessToken } from "@/lib/authToken";

interface TrackingData {
  orderNumber: string;
  customerEmail: string;
  status: string;
  orderType?: 'normal' | 'customized';
  estimatedDelivery?: string;
  docketNumber?: string;
  shippingAddress?: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  trackingHistory: Array<{
    status: string;
    description: string;
    location?: string;
    timestamp: string;
    code: string;
  }>;
  items?: Array<{
    productName: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  totalAmount?: number;
  updatedAt: string;
}

interface TestOrder {
  orderNumber: string;
  email: string;
  customerName: string;
  status: string;
  orderType: 'normal' | 'customized';
  amount: number;
  productName: string;
  docketNumber?: string;
}

const AUTO_REFRESH_INTERVAL = 180000; // 3 minutes

// Tracking API service
const trackingApi = {
  trackOrder: async (orderNumber: string, email: string) => {
    const token = getAccessToken();
    const response = await fetch(`http://localhost:5000/api/tracking/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      body: JSON.stringify({ orderNumber, email }),
    });
    return response.json();
  },
  getAllTestOrders: async () => {
    const token = getAccessToken();
    const response = await fetch(`http://localhost:5000/api/tracking/my-orders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
    });
    return response.json();
  },
  cancelShipment: async (data: any) => {
    const token = getAccessToken();
    const response = await fetch(`http://localhost:5000/api/tracking/cancel-shipment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return response.json();
  },
  downloadPOD: async (data: any) => {
    const token = getAccessToken();
    const response = await fetch(`http://localhost:5000/api/tracking/download-pod`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

export default function TrackOrderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [testOrders, setTestOrders] = useState<TestOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isDownloadingPOD, setIsDownloadingPOD] = useState(false);

  // Check if we have pre-filled data from navigation state
  useEffect(() => {
    if (location.state) {
      const state = location.state as any;
      if (state.orderNumber) setOrderNumber(state.orderNumber);
      if (state.email) setEmail(state.email);
      
      // Auto-track if we have both values
      if (state.orderNumber && state.email) {
        fetchTrackingData(true);
      }
    }
  }, [location.state]);

  // Load cached data and test orders on mount
  useEffect(() => {
    console.log("\n" + "=".repeat(60));
    console.log("🔄 TrackOrderPage: Initializing...");
    console.log("=".repeat(60));
    
    const currentToken = getAccessToken();
    console.log("🔑 Token Status:", currentToken ? `✅ ${currentToken.substring(0, 20)}...` : "❌ NONE");
    
    if (!currentToken) {
      console.error("\n❌❌❌ AUTHENTICATION FAILED ❌❌❌");
      console.error("No token found. Please log in.");
      setError('Please log in to view your orders');
      return;
    }
    
    const cachedData = localStorage.getItem("lastTrackedOrder");
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        setTrackingData(parsed.data);
        setOrderNumber(parsed.orderNumber);
        setEmail(parsed.email);
      } catch (e) {
        console.error("Failed to load cached data", e);
      }
    }

    // Fetch orders for the logged-in user from database
    const fetchTestOrders = async () => {
      try {
        console.log('🔐 Fetching orders for logged-in user...');
        
        const response = await trackingApi.getAllTestOrders();
        console.log('📦 Orders response:', response);
        
        if (response.success && response.data) {
          setTestOrders(response.data as TestOrder[]);
          console.log('✅ Loaded orders:', response.data);
        } else {
          console.error('❌ Failed to fetch orders:', response.error);
          if (response.error?.includes('token') || response.error?.includes('authenticated')) {
            setError('Please log in to view your orders');
          }
        }
      } catch (err) {
        console.error("❌ Failed to fetch test orders:", err);
        setError('Failed to load orders. Please try again.');
      }
    };
    
    fetchTestOrders();
  }, []);

  const fetchTrackingData = useCallback(async (showLoader = true) => {
    if (!orderNumber || !email) {
      setError("Please enter both order number and email");
      return;
    }

    if (showLoader) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setError("");

    try {
      const response = await trackingApi.trackOrder(orderNumber, email);
      
      if (response.success && response.data) {
        console.log('🔍 Tracking Data Received:', response.data);
        console.log('📦 Order Type:', response.data.orderType);
        setTrackingData(response.data as TrackingData);
        
        // Cache the data
        localStorage.setItem(
          "lastTrackedOrder",
          JSON.stringify({
            data: response.data,
            orderNumber,
            email,
            timestamp: new Date().toISOString(),
          })
        );
      } else {
        setError(response.error || "Order not found. Please check your details.");
        setTrackingData(null);
      }
    } catch (err) {
      setError("Failed to fetch tracking data. Please try again.");
      console.error("Tracking error:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [orderNumber, email]);

  // Auto-refresh tracking data
  useEffect(() => {
    if (!trackingData || trackingData.status === "DELIVERED") return;

    const interval = setInterval(() => {
      fetchTrackingData(false);
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [trackingData, fetchTrackingData]);

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchTrackingData();
  };

  const handleRefresh = () => {
    fetchTrackingData(false);
  };

  const handleCancelShipment = async () => {
    if (!cancelReason.trim()) {
      setError("Please provide a cancellation reason");
      return;
    }

    if (!trackingData?.orderNumber || !trackingData?.customerEmail) {
      setError("Order information is incomplete. Please try again.");
      return;
    }

    setIsCancelling(true);
    setError("");

    try {
      const response = await trackingApi.cancelShipment({
        docketNumber: trackingData.docketNumber || undefined, // Optional - only if shipped
        reason: cancelReason,
        orderNumber: trackingData.orderNumber,
        email: trackingData.customerEmail,
      });

      if (response.success) {
        // Refresh tracking data to show cancelled status
        await fetchTrackingData(false);
        setShowCancelDialog(false);
        setCancelReason("");
        alert(trackingData.docketNumber 
          ? "Shipment cancelled successfully!" 
          : "Order cancelled successfully!");
      } else {
        setError(response.error || "Failed to cancel order");
      }
    } catch (err) {
      setError("Failed to cancel order. Please try again.");
      console.error("Cancel order error:", err);
    } finally {
      setIsCancelling(false);
    }
  };

  const canCancelOrder = () => {
    if (!trackingData) return false;
    const status = trackingData.status.toUpperCase();
    const orderType = trackingData.orderType || 'normal';
    
    // Allow cancellation for normal orders that are not delivered or already cancelled
    // Docket number check removed - users can cancel before shipment (no docket yet)
    return (
      status !== "DELIVERED" &&
      status !== "CANCELLED" &&
      orderType === 'normal'
    );
  };

  const handleDownloadPOD = async () => {
    if (!trackingData?.docketNumber) {
      alert("Docket number not available");
      return;
    }

    setIsDownloadingPOD(true);

    try {
      const response = await trackingApi.downloadPOD({
        orderNumber: trackingData.orderNumber,
        docketNumber: trackingData.docketNumber,
        email: trackingData.customerEmail,
      });

      if (response.success && response.data?.link) {
        // Open PDF in new tab
        window.open(response.data.link, "_blank");
      } else {
        alert(
          response.error ||
            "Proof of Delivery is being processed. Please try again in 1-2 hours."
        );
      }
    } catch (err) {
      console.error("Failed to download POD:", err);
      alert("Failed to download Proof of Delivery. Please try again later.");
    } finally {
      setIsDownloadingPOD(false);
    }
  };

  return (
    <>
      <SEO
        title="Track Your Order | Kyna Jewels"
        description="Track your jewelry order in real-time with Kyna Jewels. Get instant updates on your package delivery status."
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Track Your Order Details
            </h1>
            <p className="text-gray-600 text-sm">
              Enter your order details to get real-time tracking updates
            </p>
          </div>

          {/* User's Orders Cards */}
          {testOrders.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Orders</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {testOrders.map((order) => {
                  const statusColors: Record<string, string> = {
                    'DELIVERED': 'text-green-600',
                    'ON_THE_ROAD': 'text-blue-600',
                    'IN_TRANSIT': 'text-blue-600',
                    'PACKAGING': 'text-orange-600',
                    'PROCESSING': 'text-yellow-600',
                    'ORDER_PLACED': 'text-gray-600',
                    'CANCELLED': 'text-red-600'
                  };

                  const statusText = order.status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
                  const statusColor = statusColors[order.status] || 'text-gray-600';

                  return (
                    <div 
                      key={order.orderNumber}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => { setOrderNumber(order.orderNumber); setEmail(order.email); }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{order.orderNumber}</h4>
                          <p className="text-xs text-gray-500 mt-1">{order.email}</p>
                        </div>
                        <span className={`px-2 py-1 ${order.orderType === 'normal' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'} text-xs font-medium rounded`}>
                          {order.orderType === 'normal' ? 'Normal' : 'Customized'}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Package className={`w-4 h-4 mr-2 ${statusColor}`} />
                          <span className="text-gray-700">{statusText}</span>
                        </div>
                        <p className="text-xs text-gray-600">{order.productName}</p>
                        <p className="text-sm font-semibold text-gray-900">₹{order.amount.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-4 text-center">Click on any card to auto-fill the tracking form</p>
            </div>
          )}

          {/* Tracking Form */}
          {!trackingData && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
              <form onSubmit={handleTrackOrder} className="space-y-5">
                <div>
                  <label
                    htmlFor="orderNumber"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Order Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="orderNumber"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                      placeholder="e.g., ORD123456"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#126180] focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value.toLowerCase())}
                      placeholder="your.email@example.com"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#126180] focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-start space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#126180] hover:bg-[#0f4f6b] text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <RefreshCw className="animate-spin h-5 w-5 mr-2" />
                      Tracking...
                    </span>
                  ) : (
                    "Track Order"
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Tracking Results */}
          {trackingData && (
            <div className="space-y-4">
              {/* Order Info Header */}
              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Order #{trackingData.orderNumber}
                    </h2>
                    {trackingData.docketNumber && (
                      <p className="text-sm text-gray-600 mt-1">
                        Tracking ID: {trackingData.docketNumber}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setTrackingData(null)}
                    className="text-sm text-[#126180] hover:underline font-medium"
                  >
                    Track Another Order
                  </button>
                </div>

                {/* Last Updated */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    Last updated: {new Date(trackingData.updatedAt).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className="flex items-center text-[#126180] hover:text-[#0f4f6b] font-medium disabled:opacity-50"
                    >
                      <RefreshCw
                        className={`w-4 h-4 mr-1 ${
                          isRefreshing ? "animate-spin" : ""
                        }`}
                      />
                      Refresh
                    </button>
                    {canCancelOrder() && (
                      <button
                        onClick={() => setShowCancelDialog(true)}
                        className="flex items-center text-red-600 hover:text-red-700 font-medium"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Cancel Order
                      </button>
                    )}
                    {trackingData.status.toUpperCase() === "DELIVERED" && (
                      <button
                        onClick={handleDownloadPOD}
                        disabled={isDownloadingPOD}
                        className="flex items-center text-teal-600 hover:text-teal-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDownloadingPOD ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <FileText className="w-4 h-4 mr-1" />
                            Proof of Delivery
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <TrackingProgress status={trackingData.status} />

              {/* Order Details and Timeline */}
              <div className="grid md:grid-cols-2 gap-4">
                <TrackingCard
                  trackingData={trackingData}
                  courierPartner="Sequel247"
                />
                <TrackingTimeline events={trackingData.trackingHistory} />
              </div>
            </div>
          )}

          {/* Empty State */}
          {!trackingData && !loading && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tracking data yet
              </h3>
              <p className="text-gray-600">
                Enter your order details above to track your package
              </p>
            </div>
          )}

          {/* Cancel Order Dialog */}
          {showCancelDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    Cancel Order
                  </h3>
                  <button
                    onClick={() => {
                      setShowCancelDialog(false);
                      setCancelReason("");
                      setError("");
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-gray-600 mb-4">
                    Are you sure you want to cancel this shipment? This action
                    will notify the courier to stop delivery.
                  </p>

                  {trackingData && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
                      <p className="font-medium text-gray-900">
                        Order: {trackingData.orderNumber}
                      </p>
                      <p className="text-gray-600">
                        Tracking: {trackingData.docketNumber}
                      </p>
                    </div>
                  )}

                  <label
                    htmlFor="cancelReason"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Reason for Cancellation *
                  </label>
                  <textarea
                    id="cancelReason"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Please provide a reason (e.g., Changed my mind, Ordered by mistake, etc.)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    rows={3}
                    required
                  />
                </div>

                {error && (
                  <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowCancelDialog(false);
                      setCancelReason("");
                      setError("");
                    }}
                    disabled={isCancelling}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Keep Order
                  </button>
                  <button
                    onClick={handleCancelShipment}
                    disabled={isCancelling || !cancelReason.trim()}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCancelling ? (
                      <span className="flex items-center justify-center">
                        <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                        Cancelling...
                      </span>
                    ) : (
                      "Cancel Order"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

