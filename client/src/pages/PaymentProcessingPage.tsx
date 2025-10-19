import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentProcessingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate payment processing for 2 seconds, then redirect to shipping page
    const timer = setTimeout(() => {
      navigate('/shipping');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        {/* Loading Spinner */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 rounded-full animate-spin">
              <div className="absolute top-0 left-0 w-4 h-4 bg-[#3AAFA9] rounded-full animate-pulse"></div>
              <div className="absolute top-1 right-1 w-3 h-3 bg-[#3AAFA9] rounded-full animate-pulse delay-100"></div>
              <div className="absolute bottom-1 right-0 w-3 h-3 bg-[#3AAFA9] rounded-full animate-pulse delay-200"></div>
              <div className="absolute bottom-0 left-1 w-3 h-3 bg-[#3AAFA9] rounded-full animate-pulse delay-300"></div>
              <div className="absolute top-1/2 left-0 w-3 h-3 bg-[#3AAFA9] rounded-full animate-pulse delay-400"></div>
              <div className="absolute top-1/2 right-0 w-3 h-3 bg-[#3AAFA9] rounded-full animate-pulse delay-500"></div>
              <div className="absolute top-0 left-1/2 w-3 h-3 bg-[#3AAFA9] rounded-full animate-pulse delay-600"></div>
              <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-[#3AAFA9] rounded-full animate-pulse delay-700"></div>
            </div>
          </div>
        </div>

        {/* Processing Text */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Processing...</h2>

        {/* Instructions */}
        <div className="max-w-md mx-auto text-gray-600 space-y-2">
          <p>You will be redirected to your payment gateway</p>
          <p>It might take a few seconds</p>
          <p>Please do not refresh the page or click the</p>
          <p>"Back" or "Close" button of your browser</p>
        </div>

        {/* Progress Bar */}
        <div className="mt-8 max-w-md mx-auto">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-[#3AAFA9] h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentProcessingPage;
