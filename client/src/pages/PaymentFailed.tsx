import React from "react";
import { Link } from "react-router-dom";
import { XCircle, ArrowLeft, Home } from "lucide-react";
import { Button } from "../components/ui/button";

const PaymentCancel: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-orange-600" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Cancelled
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-8">
            Your payment has been cancelled. No charges have been made to your
            account. You can continue shopping or try the payment process again.
          </p>

          {/* Reasons */}
          <div className="bg-orange-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold text-orange-800 mb-3">
              Common reasons for payment cancellation:
            </h2>
            <ul className="space-y-2 text-orange-700">
              <li>
                • You clicked the "Cancel" or "Back" button during payment
              </li>
              <li>• Payment session timed out</li>
              <li>• Browser was closed during the payment process</li>
              <li>• Network connectivity issues</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => window.history.back()}
              className="bg-[#328F94] hover:bg-[#328F94]/90 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Try Payment Again
            </Button>

            <Link to="/">
              <Button variant="outline" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Continue Shopping
              </Button>
            </Link>
          </div>

          {/* Help */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need help? Contact our support team at{" "}
              <a
                href="mailto:support@kynajewels.com"
                className="text-[#328F94] hover:underline"
              >
                support@kynajewels.com
              </a>{" "}
              or call{" "}
              <a
                href="tel:+91-9876543210"
                className="text-[#328F94] hover:underline"
              >
                +91-9876543210
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
