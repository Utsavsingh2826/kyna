import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';

const OrderSuccessPage = () => {
  const navigate = useNavigate();

  const handleGoToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Your order is successfully placed
        </h1>

        {/* Descriptive Text */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          Pellentesque sed lectus nec tortor tristique accumsan quis dictum risus. Donec volutpat mollis nulla non facilisis.
        </p>

        {/* Go to Home Page Button */}
        <div className="flex justify-center">
          <Button 
            variant="outline"
            className="border-[#57DBDB] text-[#57DBDB] hover:bg-[#57DBDB] hover:text-white px-8 py-3 text-lg font-medium transition-colors"
            onClick={handleGoToHome}
          >
            Go To Home Page
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Additional Success Message */}
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm">
            🎉 Thank you for your order! You will receive a confirmation email shortly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
