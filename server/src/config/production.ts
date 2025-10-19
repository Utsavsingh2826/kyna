import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const productionConfig = {
  // Application
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  FRONTEND_URL: process.env.FRONTEND_URL?.split(',') || ['https://kynajewels.com'],

  // Database
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/kyna-jewels',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  JWT_COOKIE_SECURE: process.env.JWT_COOKIE_SECURE === 'true',

  // Email
  EMAIL: {
    HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
    PORT: parseInt(process.env.EMAIL_PORT || '587', 10),
    USER: process.env.EMAIL_USER || '',
    PASS: process.env.EMAIL_PASS || '',
    FROM: process.env.EMAIL_FROM || 'noreply@kynajewels.com'
  },

  // CCAvenue
  CCAVENUE: {
    MERCHANT_ID: process.env.CCAVENUE_MERCHANT_ID || '',
    ACCESS_CODE: process.env.CCAVENUE_ACCESS_CODE || '',
    WORKING_KEY: process.env.CCAVENUE_WORKING_KEY || '',
    REDIRECT_URL: process.env.CCAVENUE_REDIRECT_URL || 'https://kynajewels.com/payment/callback',
    CANCEL_URL: process.env.CCAVENUE_CANCEL_URL || 'https://kynajewels.com/payment/cancel'
  },

  // Sequel247
  SEQUEL247: {
    TEST_ENDPOINT: process.env.SEQUEL247_TEST_ENDPOINT || '',
    TEST_TOKEN: process.env.SEQUEL247_TEST_TOKEN || '',
    PROD_ENDPOINT: process.env.SEQUEL247_PROD_ENDPOINT || '',
    PROD_TOKEN: process.env.SEQUEL247_PROD_TOKEN || '',
    STORE_CODE: process.env.SEQUEL247_STORE_CODE || 'BLRAK'
  },

  // Cloudinary
  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
    API_KEY: process.env.CLOUDINARY_API_KEY || '',
    API_SECRET: process.env.CLOUDINARY_API_SECRET || ''
  },

  // Image Storage
  IMAGE_BASE_URL: process.env.IMAGE_BASE_URL || 'https://kynajewels.com/images/RENDERING PHOTOS',

  // Security
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
  OTP_EXPIRY_MINUTES: parseInt(process.env.OTP_EXPIRY_MINUTES || '10', 10),
  RESET_TOKEN_EXPIRY_HOURS: parseInt(process.env.RESET_TOKEN_EXPIRY_HOURS || '1', 10),

  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    AUTH_MAX_REQUESTS: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || '5', 10)
  },

  // Redis
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',

  // Monitoring
  ENABLE_MONITORING: process.env.ENABLE_MONITORING === 'true',
  METRICS_PORT: parseInt(process.env.METRICS_PORT || '9090', 10)
};

// Validation function
export const validateProductionConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Critical validations
  if (!productionConfig.JWT_SECRET || productionConfig.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long');
  }

  if (!productionConfig.MONGO_URI) {
    errors.push('MONGO_URI is required');
  }

  if (productionConfig.NODE_ENV === 'production') {
    // Production-specific validations
    if (!productionConfig.CCAVENUE.MERCHANT_ID) {
      errors.push('CCAVENUE_MERCHANT_ID is required for production');
    }

    if (!productionConfig.CCAVENUE.ACCESS_CODE) {
      errors.push('CCAVENUE_ACCESS_CODE is required for production');
    }

    if (!productionConfig.CCAVENUE.WORKING_KEY) {
      errors.push('CCAVENUE_WORKING_KEY is required for production');
    }

    if (!productionConfig.SEQUEL247.PROD_ENDPOINT) {
      errors.push('SEQUEL247_PROD_ENDPOINT is required for production');
    }

    if (!productionConfig.SEQUEL247.PROD_TOKEN) {
      errors.push('SEQUEL247_PROD_TOKEN is required for production');
    }

    if (!productionConfig.EMAIL.USER) {
      errors.push('EMAIL_USER is required for production');
    }

    if (!productionConfig.EMAIL.PASS) {
      errors.push('EMAIL_PASS is required for production');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export default productionConfig;
