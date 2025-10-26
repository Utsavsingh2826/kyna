// Tracking system types for Sequel247 integration

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string>;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Order and Tracking Types
export interface TrackingOrder {
  _id: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  totalAmount: number;
  status: OrderStatus;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  createdAt: Date;
  updatedAt: Date;
  docketNumber?: string;
  estimatedDelivery?: Date;
  trackingHistory: TrackingEvent[];
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface Address {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
}

export enum OrderStatus {
  ORDER_PLACED = 'ORDER_PLACED',
  PROCESSING = 'PROCESSING',
  PACKAGING = 'PACKAGING',
  IN_TRANSIT = 'IN_TRANSIT',
  ON_THE_ROAD = 'ON_THE_ROAD',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface TrackingEvent {
  status: OrderStatus;
  description: string;
  location?: string;
  timestamp: Date;
  code: string;
}

// Sequel247 API Types
export interface Sequel247Config {
  endpoint: string;
  token: string;
  storeCode: string;
}

export interface Sequel247TrackingResponse {
  status: boolean;
  data?: {
    docket_no: string;
    requestID: string;
    client_code: string;
    br_number: string;
    senders_name: string;
    senders_phone: string;
    requested_pickup_date: string;
    actual_pickedup_date_time: string;
    pickedup_by_name: string;
    pickedup_by_employeeID: string;
    estimated_delivery: string;
    geography: string;
    category_type: string;
    product_type: string;
    sender_store_code: string;
    receiver_store_code: string;
    actual_value: string;
    no_of_packages: string;
    total_net_weight: string;
    total_gross_weight: string;
    insurance: string;
    cod: string;
    special_instructions: string;
    invoices: string[];
    box_details: Array<{
      boxNumber: string;
      lockNumber: string;
      length: string;
      breadth: string;
      height: string;
    }>;
    shipment_status: string;
    tracking: Array<{
      description: string;
      location: string | null;
      date_time: string;
      code: string;
    }>;
  };
  errorInfo?: any[];
  message?: string;
}

export interface TrackingRequest {
  orderNumber: string;
  email: string;
}

export interface TrackingResponse {
  order: TrackingOrder;
  tracking: {
    currentStatus: OrderStatus;
    progress: number; // 0-100
    steps: TrackingStep[];
    estimatedDelivery?: Date;
  };
}

export interface TrackingStep {
  status: OrderStatus;
  title: string;
  description: string;
  completed: boolean;
  active: boolean;
  timestamp?: Date;
  location?: string;
}

// Error Types
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, errors?: Record<string, string>) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}
