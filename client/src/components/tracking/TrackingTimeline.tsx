import React from 'react';
import { 
  CheckCircle, 
  User, 
  MapPin, 
  Building, 
  FileText, 
  Clock,
  Package,
  Truck
} from 'lucide-react';

interface TimelineEvent {
  status: string;
  description: string;
  location?: string;
  timestamp: string;
  code: string;
}

interface TrackingTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

const getEventIcon = (status: string) => {
  const statusLower = status.toLowerCase();
  
  if (statusLower.includes('delivered')) {
    return CheckCircle;
  } else if (statusLower.includes('picked') || statusLower.includes('delivery')) {
    return User;
  } else if (statusLower.includes('hub') || statusLower.includes('location')) {
    return MapPin;
  } else if (statusLower.includes('way') || statusLower.includes('transit')) {
    return Building;
  } else if (statusLower.includes('verified') || statusLower.includes('confirmed')) {
    return CheckCircle;
  } else if (statusLower.includes('packaging')) {
    return Package;
  } else if (statusLower.includes('shipped') || statusLower.includes('road')) {
    return Truck;
  } else {
    return Clock;
  }
};

const getEventColor = (status: string) => {
  const statusLower = status.toLowerCase();
  
  if (statusLower.includes('delivered')) {
    return 'text-green-600 bg-green-50 border-green-200';
  } else if (statusLower.includes('picked') || statusLower.includes('delivery')) {
    return 'text-blue-600 bg-blue-50 border-blue-200';
  } else if (statusLower.includes('hub') || statusLower.includes('location')) {
    return 'text-purple-600 bg-purple-50 border-purple-200';
  } else if (statusLower.includes('way') || statusLower.includes('transit')) {
    return 'text-orange-600 bg-orange-50 border-orange-200';
  } else if (statusLower.includes('verified') || statusLower.includes('confirmed')) {
    return 'text-green-600 bg-green-50 border-green-200';
  } else {
    return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

export default function TrackingTimeline({ events, className = '' }: TrackingTimelineProps) {
  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const dateStr = date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return `${dateStr} at ${timeStr}`;
  };

  if (!events || events.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Activity</h3>
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No tracking events available yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Activity</h3>
        
        <div className="space-y-6">
          {events.map((event, index) => {
            const Icon = getEventIcon(event.status);
            const colorClasses = getEventColor(event.status);
            const isLast = index === events.length - 1;
            
            return (
              <div key={index} className="relative">
                {/* Timeline Line */}
                {!isLast && (
                  <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200" />
                )}
                
                <div className="flex items-start space-x-4">
                  {/* Event Icon */}
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300
                    ${colorClasses}
                  `}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  {/* Event Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">
                          {event.status}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {event.description}
                        </p>
                        {event.location && (
                          <p className="text-xs text-gray-500 mb-2">
                            📍 {event.location}
                          </p>
                        )}
                      </div>
                      
                      {/* Timestamp */}
                      <div className="text-right ml-4">
                        <p className="text-xs text-gray-500">
                          {formatDateTime(event.timestamp)}
                        </p>
                        {event.code && (
                          <p className="text-xs text-gray-400 mt-1">
                            #{event.code}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

