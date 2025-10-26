import { OrderStatus } from '../types/tracking';
import { logError } from './tracking';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData?: any;
}

export class DataValidator {
  /**
   * Validate and sanitize order number
   */
  static validateOrderNumber(orderNumber: string): ValidationResult {
    const errors: string[] = [];

    if (!orderNumber) {
      errors.push('Order number is required');
      return { isValid: false, errors };
    }

    // Sanitize order number
    const sanitized = orderNumber.trim().toUpperCase();

    // Validate format (alphanumeric, 6-20 characters)
    if (!/^[A-Z0-9]{6,20}$/.test(sanitized)) {
      errors.push('Order number must be 6-20 characters, alphanumeric only');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData: sanitized
    };
  }

  /**
   * Validate and sanitize email
   */
  static validateEmail(email: string): ValidationResult {
    const errors: string[] = [];

    if (!email) {
      errors.push('Email is required');
      return { isValid: false, errors };
    }

    // Sanitize email
    const sanitized = email.trim().toLowerCase();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitized)) {
      errors.push('Invalid email format');
    }

    // Check length
    if (sanitized.length > 254) {
      errors.push('Email is too long');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData: sanitized
    };
  }

  /**
   * Validate and sanitize docket number
   */
  static validateDocketNumber(docketNumber: string): ValidationResult {
    const errors: string[] = [];

    if (!docketNumber) {
      errors.push('Docket number is required');
      return { isValid: false, errors };
    }

    // Sanitize docket number
    const sanitized = docketNumber.trim().replace(/\s+/g, '');

    // Validate format (10 digits)
    if (!/^\d{10}$/.test(sanitized)) {
      errors.push('Docket number must be exactly 10 digits');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData: sanitized
    };
  }

  /**
   * Validate and sanitize tracking status
   */
  static validateTrackingStatus(status: string): ValidationResult {
    const errors: string[] = [];

    if (!status) {
      errors.push('Status is required');
      return { isValid: false, errors };
    }

    // Sanitize status
    const sanitized = status.trim().toUpperCase();

    // Validate against allowed statuses
    const validStatuses = Object.values(OrderStatus);
    if (!validStatuses.includes(sanitized as OrderStatus)) {
      errors.push(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData: sanitized
    };
  }

  /**
   * Validate and sanitize customer name
   */
  static validateCustomerName(name: string): ValidationResult {
    const errors: string[] = [];

    if (!name) {
      errors.push('Customer name is required');
      return { isValid: false, errors };
    }

    // Sanitize name
    const sanitized = name.trim().replace(/\s+/g, ' ');

    // Validate length
    if (sanitized.length < 2) {
      errors.push('Customer name must be at least 2 characters');
    }

    if (sanitized.length > 100) {
      errors.push('Customer name is too long');
    }

    // Validate characters (letters, spaces, hyphens, apostrophes)
    if (!/^[a-zA-Z\s\-']+$/.test(sanitized)) {
      errors.push('Customer name contains invalid characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData: sanitized
    };
  }

  /**
   * Validate and sanitize phone number
   */
  static validatePhoneNumber(phone: string): ValidationResult {
    const errors: string[] = [];

    if (!phone) {
      return { isValid: true, errors: [], sanitizedData: '' };
    }

    // Sanitize phone number (remove all non-digits)
    const sanitized = phone.replace(/\D/g, '');

    // Validate length (10-15 digits)
    if (sanitized.length < 10 || sanitized.length > 15) {
      errors.push('Phone number must be 10-15 digits');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData: sanitized
    };
  }

  /**
   * Validate and sanitize address
   */
  static validateAddress(address: any): ValidationResult {
    const errors: string[] = [];

    if (!address) {
      errors.push('Address is required');
      return { isValid: false, errors };
    }

    const sanitized = {
      line1: address.line1 ? address.line1.trim() : '',
      line2: address.line2 ? address.line2.trim() : '',
      city: address.city ? address.city.trim() : '',
      state: address.state ? address.state.trim() : '',
      pincode: address.pincode ? address.pincode.trim() : '',
      country: address.country ? address.country.trim() : 'India'
    };

    // Validate required fields
    if (!sanitized.line1) errors.push('Address line 1 is required');
    if (!sanitized.city) errors.push('City is required');
    if (!sanitized.state) errors.push('State is required');
    if (!sanitized.pincode) errors.push('Pincode is required');

    // Validate pincode format (6 digits for India)
    if (sanitized.pincode && !/^\d{6}$/.test(sanitized.pincode)) {
      errors.push('Pincode must be 6 digits');
    }

    // Validate lengths
    if (sanitized.line1.length > 100) errors.push('Address line 1 is too long');
    if (sanitized.line2.length > 100) errors.push('Address line 2 is too long');
    if (sanitized.city.length > 50) errors.push('City name is too long');
    if (sanitized.state.length > 50) errors.push('State name is too long');

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData: sanitized
    };
  }

  /**
   * Validate and sanitize tracking request
   */
  static validateTrackingRequest(data: any): ValidationResult {
    const errors: string[] = [];
    const sanitized: any = {};

    // Validate order number
    const orderNumberResult = this.validateOrderNumber(data.orderNumber);
    if (!orderNumberResult.isValid) {
      errors.push(...orderNumberResult.errors);
    } else {
      sanitized.orderNumber = orderNumberResult.sanitizedData;
    }

    // Validate email
    const emailResult = this.validateEmail(data.email);
    if (!emailResult.isValid) {
      errors.push(...emailResult.errors);
    } else {
      sanitized.email = emailResult.sanitizedData;
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData: sanitized
    };
  }

  /**
   * Validate and sanitize tracking order data
   */
  static validateTrackingOrderData(data: any): ValidationResult {
    const errors: string[] = [];
    const sanitized: any = {};

    // Validate order number
    const orderNumberResult = this.validateOrderNumber(data.orderNumber);
    if (!orderNumberResult.isValid) {
      errors.push(...orderNumberResult.errors);
    } else {
      sanitized.orderNumber = orderNumberResult.sanitizedData;
    }

    // Validate email
    const emailResult = this.validateEmail(data.customerEmail);
    if (!emailResult.isValid) {
      errors.push(...emailResult.errors);
    } else {
      sanitized.customerEmail = emailResult.sanitizedData;
    }

    // Validate customer name
    const nameResult = this.validateCustomerName(data.customerName);
    if (!nameResult.isValid) {
      errors.push(...nameResult.errors);
    } else {
      sanitized.customerName = nameResult.sanitizedData;
    }

    // Validate docket number (optional)
    if (data.docketNumber) {
      const docketResult = this.validateDocketNumber(data.docketNumber);
      if (!docketResult.isValid) {
        errors.push(...docketResult.errors);
      } else {
        sanitized.docketNumber = docketResult.sanitizedData;
      }
    }

    // Validate status
    if (data.status) {
      const statusResult = this.validateTrackingStatus(data.status);
      if (!statusResult.isValid) {
        errors.push(...statusResult.errors);
      } else {
        sanitized.status = statusResult.sanitizedData;
      }
    }

    // Validate total amount
    if (data.totalAmount !== undefined) {
      const amount = parseFloat(data.totalAmount);
      if (isNaN(amount) || amount < 0) {
        errors.push('Total amount must be a positive number');
      } else {
        sanitized.totalAmount = amount;
      }
    }

    // Validate addresses
    if (data.shippingAddress) {
      const shippingResult = this.validateAddress(data.shippingAddress);
      if (!shippingResult.isValid) {
        errors.push(...shippingResult.errors.map(e => `Shipping address: ${e}`));
      } else {
        sanitized.shippingAddress = shippingResult.sanitizedData;
      }
    }

    if (data.billingAddress) {
      const billingResult = this.validateAddress(data.billingAddress);
      if (!billingResult.isValid) {
        errors.push(...billingResult.errors.map(e => `Billing address: ${e}`));
      } else {
        sanitized.billingAddress = billingResult.sanitizedData;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData: sanitized
    };
  }

  /**
   * Sanitize HTML content to prevent XSS
   */
  static sanitizeHtml(html: string): string {
    if (!html) return '';

    return html
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Sanitize text input
   */
  static sanitizeText(text: string): string {
    if (!text) return '';

    return text
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[<>]/g, '');
  }

  /**
   * Validate and sanitize pagination parameters
   */
  static validatePagination(page: any, limit: any): ValidationResult {
    const errors: string[] = [];
    const sanitized: any = {};

    // Validate page
    const pageNum = parseInt(page);
    if (isNaN(pageNum) || pageNum < 1) {
      errors.push('Page must be a positive integer');
    } else {
      sanitized.page = pageNum;
    }

    // Validate limit
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      errors.push('Limit must be between 1 and 100');
    } else {
      sanitized.limit = limitNum;
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData: sanitized
    };
  }

  /**
   * Validate and sanitize date range
   */
  static validateDateRange(startDate: any, endDate: any): ValidationResult {
    const errors: string[] = [];
    const sanitized: any = {};

    if (startDate) {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) {
        errors.push('Invalid start date format');
      } else {
        sanitized.startDate = start;
      }
    }

    if (endDate) {
      const end = new Date(endDate);
      if (isNaN(end.getTime())) {
        errors.push('Invalid end date format');
      } else {
        sanitized.endDate = end;
      }
    }

    if (sanitized.startDate && sanitized.endDate && sanitized.startDate > sanitized.endDate) {
      errors.push('Start date must be before end date');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData: sanitized
    };
  }
}

export const validateAndSanitize = (data: any, validator: (data: any) => ValidationResult): ValidationResult => {
  try {
    return validator(data);
  } catch (error) {
    logError(error as Error, 'validateAndSanitize');
    return {
      isValid: false,
      errors: ['Validation error occurred']
    };
  }
};
