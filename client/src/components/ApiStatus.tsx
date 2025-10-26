import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import apiService from "../services/api";

const ApiStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setIsLoading(true);
    const connected = await apiService.testConnection();
    setIsConnected(connected);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="fixed bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg border z-50">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#68C5C0]"></div>
          <span className="text-sm">Testing API...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg border z-50">
      <div className="flex items-center space-x-2">
        {isConnected ? (
          <>
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-700">Backend Connected</span>
          </>
        ) : (
          <>
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-700">Backend Disconnected</span>
          </>
        )}
      </div>
      <button
        onClick={testConnection}
        className="text-xs text-[#68C5C0] hover:text-[#5AB5B0] mt-1"
      >
        Retry
      </button>
    </div>
  );
};

export default ApiStatus;
