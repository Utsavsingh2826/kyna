import { OrderStatus } from '../types/tracking';

// Order Status Mapping
export const ORDER_STATUS_MAPPING = {
  [OrderStatus.ORDER_PLACED]: {
    title: 'Order Placed',
    description: 'Your order has been successfully placed',
    progress: 20,
    icon: '📝'
  },
  [OrderStatus.PROCESSING]: {
    title: 'Processing',
    description: 'Your order is being processed',
    progress: 40,
    icon: '⚙️'
  },
  [OrderStatus.PACKAGING]: {
    title: 'Packaging',
    description: 'Your order is being carefully packaged',
    progress: 60,
    icon: '📦'
  },
  [OrderStatus.ON_THE_ROAD]: {
    title: 'On The Road',
    description: 'Your order is on its way to you',
    progress: 80,
    icon: '🚚'
  },
  [OrderStatus.DELIVERED]: {
    title: 'Delivered',
    description: 'Your order has been delivered',
    progress: 100,
    icon: '✅'
  },
  [OrderStatus.CANCELLED]: {
    title: 'Cancelled',
    description: 'Your order has been cancelled',
    progress: 0,
    icon: '❌'
  }
};

// Sequel247 Status Code Mapping
export const SEQUEL_STATUS_MAPPING: Record<string, OrderStatus> = {
  'SCREATED': OrderStatus.ORDER_PLACED,
  'SCHECKIN': OrderStatus.PROCESSING,
  'SPU': OrderStatus.PACKAGING,
  'SLINORIN': OrderStatus.ON_THE_ROAD,
  'SLINDEST': OrderStatus.ON_THE_ROAD,
  'SDELASN': OrderStatus.ON_THE_ROAD,
  'SDELVD': OrderStatus.DELIVERED,
  'SCANCELLED': OrderStatus.CANCELLED
};

// API Endpoints
export const API_ENDPOINTS = {
  TRACK: '/api/track',
  TRACK_MULTIPLE: '/api/trackMultiple',
  CHECK_SERVICEABILITY: '/api/checkServiceability',
  CALCULATE_EDD: '/api/shipment/calculateEDD',
  CREATE_ADDRESS: '/api/create_address',
  CANCEL: '/api/cancel',
  POD_DOWNLOAD: '/api/podDownload'
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const;

// Rate Limiting
export const RATE_LIMITS = {
  TRACKING: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10 // limit each IP to 10 requests per windowMs
  },
  GENERAL: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  }
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  ORDER_NUMBER: {
    minLength: 8,
    maxLength: 30,
    pattern: /^[A-Z0-9\-]+$/i  // Allow hyphens and case-insensitive
  },
  EMAIL: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  DOCKET_NUMBER: {
    length: 10,
    pattern: /^\d{10}$/
  }
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  ORDER_NOT_FOUND: 'Order not found',
  INVALID_ORDER_NUMBER: 'Invalid order number format',
  INVALID_EMAIL: 'Invalid email format',
  INVALID_DOCKET: 'Invalid docket number',
  SEQUEL_API_ERROR: 'Unable to fetch tracking information',
  RATE_LIMIT_EXCEEDED: 'Too many requests, please try again later',
  INTERNAL_ERROR: 'Internal server error',
  VALIDATION_ERROR: 'Validation failed'
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  ORDER_FOUND: 'Order found successfully',
  TRACKING_UPDATED: 'Tracking information updated',
  ORDER_CREATED: 'Order created successfully'
} as const;
