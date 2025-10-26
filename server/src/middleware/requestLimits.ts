import { Request, Response, NextFunction } from 'express';

// Request size limits for different endpoint types
export const requestSizeLimits = {
  // Authentication endpoints - smaller limits for security
  auth: {
    signup: '1mb',
    login: '512kb',
    resetPassword: '1mb',
    verifyEmail: '512kb'
  },
  
  // Product endpoints - medium limits for search/filtering
  products: {
    search: '2mb',
    create: '5mb',
    update: '5mb',
    upload: '10mb'
  },
  
  // Order endpoints - larger limits for order data
  orders: {
    create: '2mb',
    update: '1mb',
    bulk: '5mb'
  },
  
  // File upload endpoints - largest limits
  uploads: {
    images: '20mb',
    documents: '10mb',
    bulk: '50mb'
  },
  
  // Default limit for other endpoints
  default: '1mb'
};

// Middleware factory for request size limits
export const createSizeLimit = (size: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.get('content-length') || '0', 10);
    const maxSize = parseSize(size);
    
    if (contentLength > maxSize) {
      return res.status(413).json({
        success: false,
        message: `Request too large. Maximum size allowed: ${size}`,
        maxSize: size,
        receivedSize: formatBytes(contentLength)
      });
    }
    
    next();
  };
};

// Parse size string to bytes
function parseSize(size: string): number {
  const units: { [key: string]: number } = {
    'b': 1,
    'kb': 1024,
    'mb': 1024 * 1024,
    'gb': 1024 * 1024 * 1024
  };
  
  const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)$/);
  if (!match) {
    throw new Error(`Invalid size format: ${size}`);
  }
  
  const value = parseFloat(match[1]);
  const unit = match[2];
  
  return Math.floor(value * units[unit]);
}

// Format bytes to human readable string
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Predefined limiters for common use cases
export const authLimiter = createSizeLimit(requestSizeLimits.auth.login);
export const productSearchLimiter = createSizeLimit(requestSizeLimits.products.search);
export const orderCreateLimiter = createSizeLimit(requestSizeLimits.orders.create);
export const imageUploadLimiter = createSizeLimit(requestSizeLimits.uploads.images);
export const documentUploadLimiter = createSizeLimit(requestSizeLimits.uploads.documents);
export const defaultLimiter = createSizeLimit(requestSizeLimits.default);

// Dynamic size limiter based on route
export const dynamicSizeLimit = (req: Request, res: Response, next: NextFunction) => {
  const path = req.path;
  let size = requestSizeLimits.default;
  
  // Determine size limit based on route
  if (path.includes('/auth/')) {
    if (path.includes('/signup')) size = requestSizeLimits.auth.signup;
    else if (path.includes('/login')) size = requestSizeLimits.auth.login;
    else if (path.includes('/reset')) size = requestSizeLimits.auth.resetPassword;
    else size = requestSizeLimits.auth.verifyEmail;
  } else if (path.includes('/products/')) {
    if (path.includes('/search')) size = requestSizeLimits.products.search;
    else if (path.includes('/upload')) size = requestSizeLimits.products.upload;
    else size = requestSizeLimits.products.create;
  } else if (path.includes('/orders/')) {
    if (path.includes('/bulk')) size = requestSizeLimits.orders.bulk;
    else size = requestSizeLimits.orders.create;
  } else if (path.includes('/upload/')) {
    if (path.includes('/images')) size = requestSizeLimits.uploads.images;
    else if (path.includes('/documents')) size = requestSizeLimits.uploads.documents;
    else size = requestSizeLimits.uploads.bulk;
  }
  
  return createSizeLimit(size)(req, res, next);
};
