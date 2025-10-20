import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, Package, Download, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { paymentService } from "../services/paymentService";

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Support both `orderId` and `order_id` query param names
    const orderId = searchParams.get("orderId") || searchParams.get("order_id");
    const status =
      searchParams.get("status") || searchParams.get("order_status");

    console.log("Payment callback params:", { orderId, status });

    if (orderId) {
      fetchPaymentStatus(orderId);
    } else {
      setError("Order ID not found in URL parameters");
      setLoading(false);
    }
  }, [searchParams]);

  const fetchPaymentStatus = async (orderId: string) => {
    try {
      const response = await paymentService.getPaymentStatus(orderId);

      if (response.success) {
        setPaymentDetails(response.data);
      } else {
        setError(response.message || "Failed to get payment status");
      }
    } catch (err) {
      console.error("Error fetching payment status:", err);
      setError("Failed to verify payment status");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#328F94] mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Payment Verification Failed
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-x-4">
            <Link to="/">
              <Button variant="outline">Go Home</Button>
            </Link>
            <Link to="/profile">
              <Button className="bg-[#328F94] hover:bg-[#328F94]/90">
                View Orders
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isSuccess = paymentDetails?.status === "success";

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div
            className={`text-center py-12 ${
              isSuccess ? "bg-green-50" : "bg-red-50"
            }`}
          >
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                isSuccess ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {isSuccess ? (
                <CheckCircle className="w-10 h-10 text-green-600" />
              ) : (
                <span className="text-red-600 text-4xl">❌</span>
              )}
            </div>

            <h1
              className={`text-3xl font-bold mb-4 ${
                isSuccess ? "text-green-800" : "text-red-800"
              }`}
            >
              {isSuccess ? "Payment Successful!" : "Payment Failed"}
            </h1>

            <p
              className={`text-lg ${
                isSuccess ? "text-green-700" : "text-red-700"
              }`}
            >
              {isSuccess
                ? "Thank you for your purchase. Your order has been confirmed."
                : "There was an issue processing your payment. Please try again."}
            </p>
          </div>

          {/* Payment Details */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Order Details</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-medium">
                      {paymentDetails?.orderId}
                    </span>
                  </div>
                  {paymentDetails?.transactionId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-medium">
                        {paymentDetails.transactionId}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="font-medium">
                      ₹{paymentDetails?.amount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status:</span>
                    <span
                      className={`font-medium capitalize ${
                        isSuccess ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {paymentDetails?.status}
                    </span>
                  </div>
                  {paymentDetails?.paymentDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Date:</span>
                      <span className="font-medium">
                        {new Date(
                          paymentDetails.paymentDate
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {isSuccess && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">What's Next?</h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Package className="w-5 h-5 text-[#328F94] mt-1" />
                      <div>
                        <h3 className="font-medium">Order Processing</h3>
                        <p className="text-sm text-gray-600">
                          Your order will be processed within 1-2 business days.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Download className="w-5 h-5 text-[#328F94] mt-1" />
                      <div>
                        <h3 className="font-medium">Order Confirmation</h3>
                        <p className="text-sm text-gray-600">
                          You'll receive an email confirmation shortly.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              {isSuccess ? (
                <>
                  <Link to="/profile">
                    <Button className="bg-[#328F94] hover:bg-[#328F94]/90 flex items-center gap-2">
                      View Your Orders
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link to="/">
                    <Button variant="outline">Continue Shopping</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => window.history.back()}
                    className="bg-[#328F94] hover:bg-[#328F94]/90"
                  >
                    Try Again
                  </Button>
                  <Link to="/">
                    <Button variant="outline">Go Home</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
