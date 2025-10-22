import React from 'react';
import { Check, Package, Truck, FileText, Clock } from 'lucide-react';

interface TrackingProgressProps {
  status: string;
  className?: string;
}

const STAGES = [
  {
    id: 'ORDER_PLACED',
    label: 'Order Placed',
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    id: 'PROCESSING',
    label: 'Processing',
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    id: 'PACKAGING',
    label: 'Packaging',
    icon: Package,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    id: 'ON_THE_ROAD',
    label: 'On The Road',
    icon: Truck,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    id: 'DELIVERED',
    label: 'Delivered',
    icon: Check,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  }
];

const STATUS_ORDER = ['ORDER_PLACED', 'PROCESSING', 'PACKAGING', 'ON_THE_ROAD', 'DELIVERED'];

export default function TrackingProgress({ status, className = '' }: TrackingProgressProps) {
  const currentStageIndex = STATUS_ORDER.indexOf(status);
  const isCompleted = (stageIndex: number) => stageIndex < currentStageIndex;
  const isCurrent = (stageIndex: number) => stageIndex === currentStageIndex;
  const isActive = (stageIndex: number) => stageIndex <= currentStageIndex;
  
  // Calculate progress line width based on current stage
  const getProgressWidth = () => {
    console.log('Current status:', status, 'Index:', currentStageIndex);
    if (currentStageIndex === -1) return '0%'; // No status found
    if (currentStageIndex === 0) return '0%'; // Order Placed - no line yet
    if (currentStageIndex === 1) return '25%'; // Processing - line to Processing
    if (currentStageIndex === 2) return '50%'; // Packaging - line to Packaging  
    if (currentStageIndex === 3) return '75%'; // On The Road - line to On The Road
    if (currentStageIndex === 4) return '100%'; // Delivered - line to Delivered
    return '0%';
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 border border-gray-100 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Progress</h3>
      
      {/* Desktop Progress Bar */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between relative">
          {/* Progress Line Background */}
          <div className="absolute top-6 left-6 right-6 h-2 bg-gray-200 z-0 rounded-full">
            {/* Progress Line Fill - stops at current stage */}
            <div 
              className="h-full bg-[#126180] transition-all duration-1000 ease-out rounded-full"
              style={{ 
                width: getProgressWidth()
              }}
            />
          </div>
          
          {STAGES.map((stage, index) => {
            const Icon = stage.icon;
            const completed = isCompleted(index);
            const current = isCurrent(index);
            const active = isActive(index);
            
            return (
              <div key={stage.id} className="flex flex-col items-center relative z-20">
                {/* Stage Circle */}
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500
                  ${current 
                    ? 'bg-[#126180] border-[#126180] text-white' 
                    : completed
                    ? 'bg-[#126180] border-[#126180] text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                  }
                `}>
                  <Icon className="w-5 h-5" />
                </div>
                
                {/* Stage Label */}
                <span className={`
                  mt-3 text-sm font-medium text-center transition-colors duration-300
                  ${active ? 'text-[#126180]' : 'text-gray-500'}
                `}>
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Progress Bar */}
      <div className="md:hidden">
        <div className="space-y-4">
          {STAGES.map((stage, index) => {
            const Icon = stage.icon;
            const completed = isCompleted(index);
            const current = isCurrent(index);
            const active = isActive(index);
            
            return (
              <div key={stage.id} className="flex items-center space-x-4 relative">
                {/* Stage Circle */}
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 flex-shrink-0
                  ${current 
                    ? 'bg-[#126180] border-[#126180] text-white' 
                    : completed
                    ? 'bg-[#126180] border-[#126180] text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                  }
                `}>
                  <Icon className="w-5 h-5" />
                </div>
                
                {/* Stage Label */}
                <span className={`
                  text-sm font-medium transition-colors duration-300
                  ${active ? 'text-[#126180]' : 'text-gray-500'}
                `}>
                  {stage.label}
                </span>
                
                {/* Connector Line */}
                {index < STAGES.length - 1 && (
                  <div className="absolute left-5 mt-12 w-0.5 h-8 bg-gray-200">
                    <div 
                      className={`
                        w-full transition-all duration-1000 ease-out
                        ${completed ? 'bg-[#126180]' : 'bg-gray-200'}
                      `}
                      style={{ 
                        height: completed ? '100%' : '0%' 
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

