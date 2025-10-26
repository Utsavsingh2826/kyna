import { logInfo, logError } from '../utils/tracking';

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number; // Base delay in milliseconds
  maxDelay: number; // Maximum delay in milliseconds
  backoffMultiplier: number; // Exponential backoff multiplier
  jitter: boolean; // Add random jitter to prevent thundering herd
}

export interface RetryableOperation<T> {
  operation: () => Promise<T>;
  operationName: string;
  context?: any;
}

export class RetryService {
  private config: RetryConfig;

  constructor(config?: Partial<RetryConfig>) {
    this.config = {
      maxAttempts: config?.maxAttempts || 3,
      baseDelay: config?.baseDelay || 1000,
      maxDelay: config?.maxDelay || 30000,
      backoffMultiplier: config?.backoffMultiplier || 2,
      jitter: config?.jitter !== false
    };
  }

  /**
   * Execute an operation with retry logic
   */
  async executeWithRetry<T>(retryableOperation: RetryableOperation<T>): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      try {
        logInfo(`Attempt ${attempt}/${this.config.maxAttempts} for ${retryableOperation.operationName}`, 'RetryService');
        
        const result = await retryableOperation.operation();
        
        if (attempt > 1) {
          logInfo(`Operation ${retryableOperation.operationName} succeeded on attempt ${attempt}`, 'RetryService');
        }
        
        return result;
        
      } catch (error) {
        lastError = error as Error;
        
        logError(new Error(`Attempt ${attempt}/${this.config.maxAttempts} failed for ${retryableOperation.operationName}: ${lastError.message}`), 'RetryService');
        
        // Don't retry on the last attempt
        if (attempt === this.config.maxAttempts) {
          break;
        }
        
        // Calculate delay for next attempt
        const delay = this.calculateDelay(attempt);
        
        logInfo(`Retrying ${retryableOperation.operationName} in ${delay}ms...`, 'RetryService');
        
        await this.delay(delay);
      }
    }
    
    // All attempts failed
    logError(new Error(`Operation ${retryableOperation.operationName} failed after ${this.config.maxAttempts} attempts`), 'RetryService');
    throw lastError || new Error('Operation failed');
  }

  /**
   * Calculate delay for retry attempt
   */
  private calculateDelay(attempt: number): number {
    // Exponential backoff: baseDelay * (backoffMultiplier ^ (attempt - 1))
    let delay = this.config.baseDelay * Math.pow(this.config.backoffMultiplier, attempt - 1);
    
    // Cap at maxDelay
    delay = Math.min(delay, this.config.maxDelay);
    
    // Add jitter to prevent thundering herd
    if (this.config.jitter) {
      // Add random jitter between 0.5x and 1.5x of the calculated delay
      const jitterFactor = 0.5 + Math.random();
      delay = delay * jitterFactor;
    }
    
    return Math.floor(delay);
  }

  /**
   * Delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if an error is retryable
   */
  static isRetryableError(error: any): boolean {
    if (!error) return false;
    
    // Network errors
    if (error.code === 'ECONNRESET' || 
        error.code === 'ENOTFOUND' || 
        error.code === 'ECONNREFUSED' ||
        error.code === 'ETIMEDOUT') {
      return true;
    }
    
    // HTTP status codes that are retryable
    if (error.response?.status) {
      const status = error.response.status;
      // 5xx server errors and 429 (rate limited)
      return status >= 500 || status === 429;
    }
    
    // Timeout errors
    if (error.message?.toLowerCase().includes('timeout')) {
      return true;
    }
    
    // Rate limit errors
    if (error.message?.toLowerCase().includes('rate limit') ||
        error.message?.toLowerCase().includes('too many requests')) {
      return true;
    }
    
    return false;
  }

  /**
   * Create a retryable operation for Sequel247 API calls
   */
  static createSequel247RetryOperation<T>(
    operation: () => Promise<T>,
    operationName: string,
    context?: any
  ): RetryableOperation<T> {
    return {
      operation: async () => {
        try {
          return await operation();
        } catch (error) {
          // Only retry if it's a retryable error
          if (RetryService.isRetryableError(error)) {
            throw error;
          } else {
            // For non-retryable errors, wrap them to indicate they shouldn't be retried
            const wrappedError = new Error(`Non-retryable error: ${error.message}`);
            (wrappedError as any).isRetryable = false;
            throw wrappedError;
          }
        }
      },
      operationName,
      context
    };
  }

  /**
   * Create a retryable operation for database operations
   */
  static createDatabaseRetryOperation<T>(
    operation: () => Promise<T>,
    operationName: string,
    context?: any
  ): RetryableOperation<T> {
    return {
      operation: async () => {
        try {
          return await operation();
        } catch (error) {
          // Database connection errors are retryable
          if (error.name === 'MongoNetworkError' || 
              error.name === 'MongoTimeoutError' ||
              error.message?.toLowerCase().includes('connection') ||
              error.message?.toLowerCase().includes('timeout')) {
            throw error;
          } else {
            // For other database errors, don't retry
            const wrappedError = new Error(`Non-retryable database error: ${error.message}`);
            (wrappedError as any).isRetryable = false;
            throw wrappedError;
          }
        }
      },
      operationName,
      context
    };
  }

  /**
   * Create a retryable operation for email notifications
   */
  static createEmailRetryOperation<T>(
    operation: () => Promise<T>,
    operationName: string,
    context?: any
  ): RetryableOperation<T> {
    return {
      operation: async () => {
        try {
          return await operation();
        } catch (error) {
          // SMTP errors are retryable
          if (error.code === 'ECONNECTION' ||
              error.code === 'ETIMEDOUT' ||
              error.message?.toLowerCase().includes('smtp') ||
              error.message?.toLowerCase().includes('connection')) {
            throw error;
          } else {
            // For other email errors, don't retry
            const wrappedError = new Error(`Non-retryable email error: ${error.message}`);
            (wrappedError as any).isRetryable = false;
            throw wrappedError;
          }
        }
      },
      operationName,
      context
    };
  }
}

export const createRetryService = (config?: Partial<RetryConfig>): RetryService => {
  return new RetryService(config);
};

// Default retry configurations
export const RETRY_CONFIGS = {
  SEQUEL247_API: {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    jitter: true
  },
  DATABASE: {
    maxAttempts: 5,
    baseDelay: 500,
    maxDelay: 5000,
    backoffMultiplier: 1.5,
    jitter: true
  },
  EMAIL: {
    maxAttempts: 2,
    baseDelay: 2000,
    maxDelay: 8000,
    backoffMultiplier: 2,
    jitter: true
  },
  WEBHOOK: {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 15000,
    backoffMultiplier: 2,
    jitter: true
  }
} as const;
