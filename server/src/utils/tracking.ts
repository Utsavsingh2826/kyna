import { ApiResponse, ValidationError } from '../types/tracking';
import { VALIDATION_RULES, ERROR_MESSAGES } from '../constants/tracking';

// Create success response
export const createSuccessResponse = <T>(
  data: T, 
  message?: string
): ApiResponse<T> => ({
  success: true,
  data,
  message
});

// Create error response
export const createErrorResponse = (
  message: string, 
  errors?: Record<string, string>
): ApiResponse => ({
  success: false,
  error: message,
  errors
});

// Validation functions
export const validateOrderNumber = (orderNumber: string): boolean => {
  const { minLength, maxLength, pattern } = VALIDATION_RULES.ORDER_NUMBER;
  return orderNumber.length >= minLength && 
         orderNumber.length <= maxLength && 
         pattern.test(orderNumber);
};

export const validateEmail = (email: string): boolean => {
  return VALIDATION_RULES.EMAIL.pattern.test(email);
};

export const validateDocketNumber = (docketNumber: string): boolean => {
  const { length, pattern } = VALIDATION_RULES.DOCKET_NUMBER;
  return docketNumber.length === length && pattern.test(docketNumber);
};

// Create validation error
export const createValidationError = (field: string, message: string): ValidationError => {
  return new ValidationError(message, { [field]: message });
};

// Retry utility
export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
    }
  }
  
  throw lastError!;
};

// Logging utilities
export const logInfo = (message: string, context: string = 'App'): void => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [INFO] [${context}] ${message}`);
};

export const logError = (error: Error, context: string = 'App'): void => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] [ERROR] [${context}] ${error.message}`, error.stack);
};

export const logWarn = (message: string, context: string = 'App'): void => {
  const timestamp = new Date().toISOString();
  console.warn(`[${timestamp}] [WARN] [${context}] ${message}`);
};

// Environment check
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};
