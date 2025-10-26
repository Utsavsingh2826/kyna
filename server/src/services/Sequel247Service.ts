import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  Sequel247Config, 
  Sequel247TrackingResponse, 
  AppError, 
  OrderStatus 
} from '../types/tracking';
import { 
  SEQUEL_STATUS_MAPPING, 
  ERROR_MESSAGES, 
  API_ENDPOINTS 
} from '../constants/tracking';
import { retry, logError, logInfo } from '../utils/tracking';

export class Sequel247Service {
  private client: AxiosInstance;
  private config: Sequel247Config;

  constructor(config: Sequel247Config) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.endpoint,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'KynaJewels-Tracking/1.0'
      }
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        logInfo(`Making request to ${config.url}`, 'Sequel247Service');
        return config;
      },
      (error) => {
        logError(error, 'Sequel247Service-Request');
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        logInfo(`Response received from ${response.config.url}`, 'Sequel247Service');
        return response;
      },
      (error) => {
        logError(error, 'Sequel247Service-Response');
        return Promise.reject(this.handleApiError(error));
      }
    );
  }

  /**
   * Track a single shipment by docket number
   */
  async trackShipment(docketNumber: string): Promise<Sequel247TrackingResponse> {
    try {
      const response = await retry(
        () => this.client.post(API_ENDPOINTS.TRACK, {
          token: this.config.token,
          docket: docketNumber
        }),
        3,
        1000
      );

      return this.processTrackingResponse(response);
    } catch (error) {
      logError(error as Error, 'trackShipment');
      throw new AppError(ERROR_MESSAGES.SEQUEL_API_ERROR, 500);
    }
  }

  /**
   * Track multiple shipments by docket numbers
   */
  async trackMultipleShipments(docketNumbers: string[]): Promise<Sequel247TrackingResponse> {
    try {
      const response = await retry(
        () => this.client.post(API_ENDPOINTS.TRACK_MULTIPLE, {
          token: this.config.token,
          dockets: docketNumbers
        }),
        3,
        1000
      );

      return this.processTrackingResponse(response);
    } catch (error) {
      logError(error as Error, 'trackMultipleShipments');
      throw new AppError(ERROR_MESSAGES.SEQUEL_API_ERROR, 500);
    }
  }

  /**
   * Check if a pincode is serviceable
   */
  async checkServiceability(pincode: string): Promise<boolean> {
    try {
      const response = await this.client.post(API_ENDPOINTS.CHECK_SERVICEABILITY, {
        token: this.config.token,
        pin_code: pincode
      });

      const data = response.data;
      return data.status === true;
    } catch (error) {
      logError(error as Error, 'checkServiceability');
      return false;
    }
  }

  /**
   * Calculate estimated delivery date
   */
  async calculateEDD(
    originPincode: string, 
    destinationPincode: string, 
    pickupDate: string
  ): Promise<Date | null> {
    try {
      const response = await this.client.post(API_ENDPOINTS.CALCULATE_EDD, {
        token: this.config.token,
        origin_pincode: originPincode,
        destination_pincode: destinationPincode,
        pickup_date: pickupDate
      });

      const data = response.data;
      if (data.status && data.data?.estimated_delivery) {
        return new Date(data.data.estimated_delivery);
      }
      
      return null;
    } catch (error) {
      logError(error as Error, 'calculateEDD');
      return null;
    }
  }

  /**
   * Cancel a shipment
   */
  async cancelShipment(docketNumber: string, reason: string): Promise<boolean> {
    try {
      const response = await this.client.post(API_ENDPOINTS.CANCEL, {
        token: this.config.token,
        docket: docketNumber,
        cancelReason: reason
      });

      const data = response.data;
      return data.status === true;
    } catch (error) {
      logError(error as Error, 'cancelShipment');
      return false;
    }
  }

  /**
   * Download POD (Proof of Delivery)
   */
  async downloadPOD(
    docketNumbers: string[], 
    fromDate: string, 
    toDate: string
  ): Promise<string | null> {
    try {
      const response = await this.client.post(API_ENDPOINTS.POD_DOWNLOAD, {
        token: this.config.token,
        requestType: 'docket',
        dockets: docketNumbers,
        fromDate,
        toDate
      });

      const data = response.data;
      if (data.status && data.link) {
        return data.link;
      }
      
      return null;
    } catch (error) {
      logError(error as Error, 'downloadPOD');
      return null;
    }
  }

  /**
   * Map Sequel247 status code to our OrderStatus
   */
  mapSequelStatusToOrderStatus(sequelCode: string): OrderStatus {
    return SEQUEL_STATUS_MAPPING[sequelCode] || OrderStatus.ORDER_PLACED;
  }

  /**
   * Process tracking response and handle errors
   */
  private processTrackingResponse(response: AxiosResponse): Sequel247TrackingResponse {
    const data = response.data;

    if (!data) {
      throw new AppError('Empty response from Sequel247 API', 500);
    }

    if (data.status === false) {
      const errorMessage = data.message || 'Tracking request failed';
      const errorCode = data.code || 500;
      
      throw new AppError(errorMessage, errorCode);
    }

    return data;
  }

  /**
   * Handle API errors and convert to appropriate AppError
   */
  private handleApiError(error: any): AppError {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = error.response.data?.message || 'API request failed';
      
      switch (status) {
        case 400:
          return new AppError(`Bad Request: ${message}`, 400);
        case 401:
          return new AppError('Unauthorized: Invalid API token', 401);
        case 403:
          return new AppError('Forbidden: Access denied', 403);
        case 404:
          return new AppError('Not Found: Resource not found', 404);
        case 429:
          return new AppError('Rate Limited: Too many requests', 429);
        case 500:
          return new AppError('Internal Server Error: API server error', 500);
        case 503:
          return new AppError('Service Unavailable: API temporarily unavailable', 503);
        default:
          return new AppError(`API Error (${status}): ${message}`, status);
      }
    } else if (error.request) {
      // Request was made but no response received
      return new AppError('Network Error: Unable to reach Sequel247 API', 503);
    } else {
      // Something else happened
      return new AppError(`Request Error: ${error.message}`, 500);
    }
  }

  /**
   * Validate docket number format
   */
  validateDocketNumber(docketNumber: string): boolean {
    return /^\d{10}$/.test(docketNumber);
  }

  /**
   * Get service configuration
   */
  getConfig(): Sequel247Config {
    return { ...this.config };
  }
}

// Factory function to create service instances
export const createSequel247Service = (config: Sequel247Config): Sequel247Service => {
  return new Sequel247Service(config);
};
