import axios, { AxiosResponse } from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE = process.env.SEQUEL_BASE_URL;
const TOKEN = process.env.SEQUEL_API_TOKEN;

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${TOKEN}`
};

// =====================
// INTERFACES & TYPES (Based on Sequel247 Actual API)
// =====================

/**
 * Create Address API - Register warehouse/business address
 */
export interface CreateAddressPayload {
  address_type: 'Business' | 'Residential';
  address_short_code: string; // Unique code like "BOM4", "DEL1"
  nature_of_address: string; // e.g., "Warehouse / Distribution Center"
  gst_in?: string; // GST number
  business_entity_name: string; // Business name
  address_line1: string;
  address_line2?: string;
  pinCode: string; // 6 digit pincode
  auth_receiver_name: string; // Person who will receive pickups
  auth_receiver_phone: string;
  auth_receiver_email?: string;
}

export interface CreateAddressResponse {
  status: string; // "true" or "false"
  message?: string;
  data?: {
    address_short_code: string;
    address_id?: string;
  };
}

/**
 * Check Serviceability API - Check if pincode is deliverable
 */
export interface ServiceabilityResponse {
  status: string; // "true" or "false"
  message?: string;
  data?: {
    city: string;
    hub: string;
    state: string;
    Tier_Classification: string;
    First_Call_Time: string; // e.g., "10:00"
    Last_Call_Time: string; // e.g., "14:00"
    Last_Pickup_Time: string; // e.g., "16:00"
    Pickup_Availability: string; // e.g., "Mo, Tu, We, Th, Fr, Sa"
    Delivery_Availability: string;
  };
}

/**
 * Calculate EDD API - Get estimated delivery date
 */
export interface CalculateEDDResponse {
  status: string; // "true" or "false"
  message?: string;
  data?: {
    estimated_delivery: string; // "DD-MM-YYYY HH:MM"
    estimated_day: string; // "Monday", "Tuesday", etc.
  };
}

/**
 * Create Shipment API - For Diamond & Jewelry shipments
 */
export interface CreateShipmentPayload {
  location: 'domestic' | 'international';
  shipmentType: 'D&J'; // Diamond & Jewellery
  serviceType: 'valuable'; // For valuable items
  pickUpDate: 'Today' | 'Tomorrow' | string; // YYYY-MM-DD format
  pickUpTime: string; // e.g., "9:00-10:00"
  fromStoreCode: string; // Your registered address short code
  toAddress: {
    consignee_name: string;
    address_line1: string;
    address_line2?: string;
    pinCode: string;
    auth_receiver_name: string;
    auth_receiver_phone: string;
    auth_receiver_email?: string;
  };
  net_weight: string; // Weight in grams
  gross_weight: string; // Weight in grams (including packaging)
  net_value: string; // Jewelry value in INR
  codValue?: string; // COD amount (optional)
  no_of_packages: string; // Number of boxes
  boxes?: { // ✅ Optional - auto-generated if not provided
    box_number: string; // Box ID
    lock_number: string; // Lock ID
    length: string; // cm
    breadth: string; // cm
    height: string; // cm
    gross_weight: string; // grams
  }[];
  invoice: string[]; // Invoice numbers
  remark?: string; // Special instructions
}

export interface CreateShipmentResponse {
  status: string; // "true" or "false"
  message?: string;
  data?: {
    docketNumber: string; // ⭐ Main tracking number
    brn: string; // Booking reference number
    estimated_delivery: string; // "DD-MM-YYYY HH:MM"
    sender_store_code: string;
    receiver_store_code: string;
    docket_print?: string; // PDF URL for docket
  };
}

/**
 * Track Single Shipment API
 */
export interface TrackingEvent {
  description: string;
  location: string;
  date_time: string; // "YYYY-MM-DD HH:MM:SS"
  code: string; // Status code like "SCREATED", "SPU", "SDELVD"
}

export interface TrackSingleResponse {
  status: string; // "true" or "false"
  message?: string;
  data?: {
    docket_no: string;
    shipment_status: string; // Current status code
    estimated_delivery: string;
    tracking: TrackingEvent[]; // Complete tracking history
  };
}

/**
 * Track Multiple Shipments API
 */
export interface TrackMultipleResponse {
  status: string;
  message?: string;
  data?: {
    docket_no: string;
    shipment_status: string;
    estimated_delivery: string;
    tracking: TrackingEvent[];
  }[];
}

/**
 * Cancel Shipment API
 */
export interface CancelShipmentResponse {
  status: string;
  message?: string;
  data?: {
    docket_number: string;
    cancelled: boolean;
  };
}

/**
 * POD Download API - Proof of Delivery
 */
export interface PODDownloadPayload {
  requestType: 'docket' | 'date_range';
  dockets?: string[]; // Array of docket numbers
  fromDate?: string; // DD-MM-YYYY
  toDate?: string; // DD-MM-YYYY
}

export interface PODDownloadResponse {
  status: string;
  message?: string;
  data?: {
    download_url?: string;
    pod_details?: {
      docket_number: string;
      pod_url?: string;
      delivered_date?: string;
      receiver_name?: string;
    }[];
  };
}

/**
 * Sequel247 Status Codes Mapping
 */
export const SEQUEL_STATUS_CODES = {
  SCREATED: 'Shipment Created',
  SCHECKIN: 'Checked in at Hub',
  SPU: 'Picked Up',
  SLINORIN: 'Left Origin Hub',
  SLINDEST: 'Reached Destination Hub',
  SDELASN: 'Out for Delivery',
  SDELVD: 'Delivered',
  SCANCELLED: 'Cancelled',
  SINEXCP: 'Exception',
  SRTOPKP: 'RTO Pickup',
  SRTODLV: 'RTO Delivered'
} as const;

// =====================
// KYNA JEWELS SPECIFIC HELPERS
// =====================

/**
 * Get Kyna Jewels fixed pickup address
 * This address is used for all shipments
 */
export const getKynaPickupAddress = () => {
  return {
    address_short_code: process.env.SEQUEL_PICKUP_ADDRESS_CODE || '400097',
    business_entity_name: process.env.SEQUEL_BUSINESS_NAME || 'Kyna Jewels',
    address_line1: process.env.SEQUEL_ADDRESS_LINE1 || 'B1901 Shah arcade 2',
    address_line2: process.env.SEQUEL_ADDRESS_LINE2 || 'Rani sati marg, Malad east',
    pinCode: process.env.SEQUEL_PINCODE || '400097',
    auth_receiver_name: process.env.SEQUEL_RECEIVER_NAME || 'Kyna Jewels Admin',
    auth_receiver_phone: process.env.SEQUEL_RECEIVER_PHONE || '8928610682',
    auth_receiver_email: process.env.SEQUEL_RECEIVER_EMAIL || 'enquiries@kynajewels.com',
    gst_in: process.env.SEQUEL_GST_IN || '22AAAAA0000A1Z5'
  };
};

/**
 * Auto-generate box details if not provided
 * Creates a single standard jewelry box
 */
const generateDefaultBox = (orderNumber: string, grossWeight: string) => {
  return [{
    box_number: `BOX-${orderNumber}`,
    lock_number: `LK-${Date.now()}`,
    length: '15', // 15 cm - standard jewelry box
    breadth: '10', // 10 cm
    height: '8',  // 8 cm
    gross_weight: grossWeight
  }];
};

/**
 * Simplified shipment creation for Kyna Jewels orders
 * Auto-fills pickup address and generates box details if needed
 */
export const createKynaShipment = async (params: {
  orderNumber: string;
  customerName: string;
  customerAddress: string;
  customerAddress2?: string;
  customerPincode: string;
  customerPhone: string;
  customerEmail?: string;
  netWeight: number; // in grams
  grossWeight: number; // in grams
  orderValue: number; // in INR
  codAmount?: number; // COD amount in INR
  invoiceNumbers?: string[];
  pickupDate?: 'Today' | 'Tomorrow';
  pickupTime?: string;
  remark?: string;
}) => {
  const pickupAddress = getKynaPickupAddress();
  
  const payload: CreateShipmentPayload = {
    location: 'domestic',
    shipmentType: 'D&J',
    serviceType: 'valuable',
    pickUpDate: params.pickupDate || 'Tomorrow',
    pickUpTime: params.pickupTime || '10:00-11:00',
    fromStoreCode: pickupAddress.address_short_code, // ✅ Auto-filled from env
    toAddress: {
      consignee_name: params.customerName,
      address_line1: params.customerAddress,
      address_line2: params.customerAddress2,
      pinCode: params.customerPincode,
      auth_receiver_name: params.customerName,
      auth_receiver_phone: params.customerPhone,
      auth_receiver_email: params.customerEmail
    },
    net_weight: params.netWeight.toString(),
    gross_weight: params.grossWeight.toString(),
    net_value: params.orderValue.toString(),
    codValue: params.codAmount?.toString() || '0',
    no_of_packages: '1',
    boxes: generateDefaultBox(params.orderNumber, params.grossWeight.toString()), // ✅ Auto-generated
    invoice: params.invoiceNumbers || [`INV-${params.orderNumber}`],
    remark: params.remark || 'Jewelry - Handle with care'
  };
  
  return await createSequelShipment(payload);
};

// =====================
// API FUNCTIONS
// =====================

/**
 * 1️⃣ Create Address API
 * Register your warehouse/business address with Sequel247
 * 
 * @param payload Address details
 * @returns Created address response with short code
 */
export const createAddress = async (
  payload: CreateAddressPayload
): Promise<CreateAddressResponse> => {
  try {
    const url = `${BASE}/api/create_address`;
    const res: AxiosResponse<CreateAddressResponse> = await axios.post(
      url,
      { token: TOKEN, ...payload },
      { headers }
    );
    return res.data;
  } catch (error: any) {
    console.error('❌ Create Address Error:', error.response?.data || error.message);
    return {
      status: 'false',
      message: error.response?.data?.message || error.message || 'Failed to create address'
    };
  }
};

/**
 * 2️⃣ Check Serviceability API
 * Check if Sequel247 delivers to a specific pincode
 * 
 * @param pin_code Pincode to check (6 digits)
 * @returns Serviceability status with pickup/delivery timings
 */
export const checkServiceability = async (
  pin_code: string
): Promise<ServiceabilityResponse> => {
  try {
    const url = `${BASE}/api/checkServiceability`;
    const res: AxiosResponse<ServiceabilityResponse> = await axios.post(
      url,
      { token: TOKEN, pin_code },
      { headers }
    );
    return res.data;
  } catch (error: any) {
    console.error('❌ Check Serviceability Error:', error.response?.data || error.message);
    return {
      status: 'false',
      message: error.response?.data?.message || error.message || 'Failed to check serviceability'
    };
  }
};

/**
 * 3️⃣ Calculate EDD (Estimated Delivery Date) API
 * Calculate when the shipment will be delivered
 * 
 * @param origin_pincode Origin pincode (your warehouse)
 * @param destination_pincode Destination pincode (customer)
 * @param pickup_date Pickup date (YYYY-MM-DD)
 * @returns Estimated delivery date and day
 */
export const calculateEDD = async (
  origin_pincode: string,
  destination_pincode: string,
  pickup_date: string
): Promise<CalculateEDDResponse> => {
  try {
    const url = `${BASE}/api/shipment/calculateEDD`;
    const res: AxiosResponse<CalculateEDDResponse> = await axios.post(
      url,
      { token: TOKEN, origin_pincode, destination_pincode, pickup_date },
      { headers }
    );
    return res.data;
  } catch (error: any) {
    console.error('❌ Calculate EDD Error:', error.response?.data || error.message);
    return {
      status: 'false',
      message: error.response?.data?.message || error.message || 'Failed to calculate EDD'
    };
  }
};

/**
 * 4️⃣ Create Shipment API
 * Create a new jewelry shipment booking with Sequel247
 * Returns docket number for tracking
 * 
 * @param payload Shipment details (jewelry-specific)
 * @returns Shipment response with docket number
 */
export const createSequelShipment = async (
  payload: CreateShipmentPayload
): Promise<CreateShipmentResponse> => {
  try {
    const url = `${BASE}/api/shipment/create`;
    
    // ✅ Auto-generate boxes if not provided
    const finalPayload = {
      ...payload,
      boxes: payload.boxes || generateDefaultBox(
        payload.invoice[0] || 'ORDER', 
        payload.gross_weight
      )
    };
    
    const body = { token: TOKEN, ...finalPayload };
    const res: AxiosResponse<CreateShipmentResponse> = await axios.post(url, body, { headers });
    return res.data;
  } catch (error: any) {
    console.error('❌ Create Shipment Error:', error.response?.data || error.message);
    return {
      status: 'false',
      message: error.response?.data?.message || error.message || 'Failed to create shipment'
    };
  }
};

/**
 * 5️⃣ Track Single Shipment API
 * Track a single shipment using docket number
 * 
 * @param docket 10-digit docket number
 * @returns Complete tracking history and current status
 */
export const trackSingle = async (docket: string): Promise<TrackSingleResponse> => {
  try {
    const url = `${BASE}/api/track`;
    const res: AxiosResponse<TrackSingleResponse> = await axios.post(
      url,
      { token: TOKEN, docket },
      { headers }
    );
    return res.data;
  } catch (error: any) {
    console.error('❌ Track Single Error:', error.response?.data || error.message);
    return {
      status: 'false',
      message: error.response?.data?.message || error.message || 'Failed to track shipment'
    };
  }
};

/**
 * 6️⃣ Track Multiple Shipments API
 * Track multiple shipments at once (more efficient)
 * 
 * @param dockets Array of docket numbers
 * @returns Tracking information for all shipments
 */
export const trackMultiple = async (dockets: string[] = []): Promise<TrackMultipleResponse> => {
  try {
    const url = `${BASE}/api/trackMultiple`;
    const res: AxiosResponse<TrackMultipleResponse> = await axios.post(
      url,
      { token: TOKEN, dockets },
      { headers }
    );
    return res.data;
  } catch (error: any) {
    console.error('❌ Track Multiple Error:', error.response?.data || error.message);
    return {
      status: 'false',
      message: error.response?.data?.message || error.message || 'Failed to track multiple shipments'
    };
  }
};

/**
 * 7️⃣ Cancel Shipment API
 * Cancel a shipment before pickup
 * 
 * @param docket Docket number to cancel
 * @param cancelReason Reason for cancellation
 * @returns Cancellation status
 */
export const cancelShipment = async (
  docket: string,
  cancelReason: string = 'Cancelled by merchant'
): Promise<CancelShipmentResponse> => {
  try {
    const url = `${BASE}/api/cancel`;
    const res: AxiosResponse<CancelShipmentResponse> = await axios.post(
      url,
      { token: TOKEN, docket, cancelReason },
      { headers }
    );
    return res.data;
  } catch (error: any) {
    console.error('❌ Cancel Shipment Error:', error.response?.data || error.message);
    return {
      status: 'false',
      message: error.response?.data?.message || error.message || 'Failed to cancel shipment'
    };
  }
};

/**
 * 8️⃣ POD Download API
 * Download Proof of Delivery documents
 * 
 * @param payload POD request (by docket or date range)
 * @returns POD download link or details
 */
export const podDownload = async (payload: PODDownloadPayload): Promise<PODDownloadResponse> => {
  try {
    const {
      requestType = 'docket',
      dockets = [],
      fromDate,
      toDate
    } = payload;

    const url = `${BASE}/api/podDownload`;
    const res: AxiosResponse<PODDownloadResponse> = await axios.post(
      url,
      { token: TOKEN, requestType, dockets, fromDate, toDate },
      { headers }
    );
    return res.data;
  } catch (error: any) {
    console.error('❌ POD Download Error:', error.response?.data || error.message);
    return {
      status: 'false',
      message: error.response?.data?.message || error.message || 'Failed to download POD'
    };
  }
};

// =====================
// HELPER FUNCTIONS
// =====================

/**
 * Validate Sequel247 configuration
 * @returns true if all required env vars are set
 */
export const validateSequelConfig = (): boolean => {
  if (!BASE || !TOKEN) {
    console.error('❌ Sequel247 configuration missing!');
    console.error('   Please set SEQUEL_BASE_URL and SEQUEL_API_TOKEN in .env file');
    return false;
  }
  return true;
};

/**
 * Get Sequel247 configuration status
 */
export const getSequelConfig = () => {
  return {
    baseUrl: BASE || 'Not configured',
    hasToken: !!TOKEN,
    isConfigured: validateSequelConfig()
  };
};

/**
 * Map Sequel247 status code to readable status
 * @param code Status code from API
 * @returns Readable status description
 */
export const getStatusDescription = (code: string): string => {
  return SEQUEL_STATUS_CODES[code as keyof typeof SEQUEL_STATUS_CODES] || code;
};

/**
 * Check if shipment is delivered
 * @param statusCode Status code from API
 * @returns true if delivered
 */
export const isDelivered = (statusCode: string): boolean => {
  return statusCode === 'SDELVD';
};

/**
 * Check if shipment is cancelled
 * @param statusCode Status code from API
 * @returns true if cancelled
 */
export const isCancelled = (statusCode: string): boolean => {
  return statusCode === 'SCANCELLED';
};

/**
 * Format date for Sequel247 API
 * @param date Date object
 * @returns Formatted date string (YYYY-MM-DD)
 */
export const formatDateForSequel = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get tomorrow's date formatted for pickup
 * @returns Tomorrow's date (YYYY-MM-DD)
 */
export const getTomorrowDate = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatDateForSequel(tomorrow);
};

// =====================
// DEFAULT EXPORT
// =====================

export default {
  // API Functions
  createAddress,
  checkServiceability,
  calculateEDD,
  createSequelShipment,
  trackSingle,
  trackMultiple,
  cancelShipment,
  podDownload,
  
  // Kyna Jewels Specific
  getKynaPickupAddress,
  createKynaShipment,
  
  // Helpers
  validateSequelConfig,
  getSequelConfig,
  getStatusDescription,
  isDelivered,
  isCancelled,
  formatDateForSequel,
  getTomorrowDate,
  
  // Constants
  SEQUEL_STATUS_CODES
};
