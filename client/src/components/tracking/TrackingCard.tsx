import React from 'react';
import { MapPin, Phone, Calendar, Package, Truck, CreditCard } from 'lucide-react';

interface TrackingData {
  orderNumber: string;
  customerEmail: string;
  status: string;
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
  items?: Array<{
    productName: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  totalAmount?: number;
  courierPartner?: string;
}

interface TrackingCardProps {
  trackingData: TrackingData;
  courierPartner?: string;
  className?: string;
}

export default function TrackingCard({ 
  trackingData, 
  courierPartner = "Sequel247",
  className = '' 
}: TrackingCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
      <div className="p-6">
        {/* Order Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
            <p className="text-sm text-gray-600 mt-1">#{trackingData.orderNumber}</p>
          </div>
          {trackingData.docketNumber && (
            <div className="text-right">
              <p className="text-xs text-gray-500">Tracking ID</p>
              <p className="text-sm font-medium text-[#126180]">{trackingData.docketNumber}</p>
            </div>
          )}
        </div>

        {/* Estimated Delivery */}
        {trackingData.estimatedDelivery && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-[#126180]" />
              <div>
                <p className="text-sm font-medium text-[#126180]">Expected Delivery</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatDate(trackingData.estimatedDelivery)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Courier Partner */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Truck className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-sm font-medium text-gray-700">Courier Partner</p>
              <p className="text-lg font-semibold text-gray-900">{courierPartner}</p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        {trackingData.items && trackingData.items.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Order Items</h4>
            <div className="space-y-3">
              {trackingData.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  {item.image && (
                    <img 
                      src={item.image} 
                      alt={item.productName}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                    <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    ₹{item.price.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Total Amount */}
        {trackingData.totalAmount && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Total Amount</span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                ₹{trackingData.totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Shipping Address */}
        {trackingData.shippingAddress && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Shipping Address</h4>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
                <div className="text-sm text-gray-700">
                  <p className="font-medium">{trackingData.shippingAddress.name}</p>
                  <p>{trackingData.shippingAddress.line1}</p>
                  {trackingData.shippingAddress.line2 && (
                    <p>{trackingData.shippingAddress.line2}</p>
                  )}
                  <p>
                    {trackingData.shippingAddress.city}, {trackingData.shippingAddress.state} - {trackingData.shippingAddress.pincode}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">{trackingData.shippingAddress.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

