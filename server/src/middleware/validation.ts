import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

// Validation schemas for product endpoints
export const productValidationSchemas = {
  // GET /api/products validation
  getProducts: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    category: Joi.string().trim().optional(),
    diamondShape: Joi.string().trim().optional(),
    metal: Joi.string().trim().optional(),
    minPrice: Joi.number().min(0).optional(),
    maxPrice: Joi.number().min(0).optional(),
    diamondSize: Joi.number().min(0).optional(),
    karat: Joi.number().integer().min(0).optional(),
    diamondOrigin: Joi.string().trim().optional(),
    tone: Joi.string().trim().optional(),
    finish: Joi.string().trim().optional()
  }),

  // GET /api/products/:id/price validation
  getProductPrice: Joi.object({
    diamondSize: Joi.number().min(0).optional(),
    metal: Joi.string().trim().optional(),
    karat: Joi.number().integer().min(0).optional(),
    diamondOrigin: Joi.string().trim().optional(),
    diamondShape: Joi.string().trim().optional(),
    diamondColor: Joi.string().trim().optional()
  }),

  // GET /api/products/:id/images validation
  getProductImages: Joi.object({
    diamondShape: Joi.string().trim().optional(),
    size: Joi.number().min(0).optional(),
    tone: Joi.string().trim().optional(),
    metal: Joi.string().trim().optional(),
    origin: Joi.string().trim().optional(),
    diamondColor: Joi.string().trim().optional(),
    finish: Joi.string().trim().optional()
  }),

  // GET /api/products/search validation
  searchProducts: Joi.object({
    q: Joi.string().trim().min(1).required(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    category: Joi.string().trim().optional(),
    diamondShape: Joi.string().trim().optional(),
    metal: Joi.string().trim().optional(),
    minPrice: Joi.number().min(0).optional(),
    maxPrice: Joi.number().min(0).optional()
  }),

  // GET /api/products/:id validation
  getProductById: Joi.object({
    id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
  })
};

// Validation middleware factory
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query, { 
      abortEarly: false,
      stripUnknown: true 
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errorDetails
      });
    }

    // Replace req.query with validated and sanitized values
    req.query = value;
    next();
  };
};

// Validation middleware for params
export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.params, { 
      abortEarly: false,
      stripUnknown: true 
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errorDetails
      });
    }

    // Replace req.params with validated and sanitized values
    req.params = value;
    next();
  };
};

// Common validation middleware
export const validateProductId = validateParams(
  Joi.object({
    id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
  })
);

export const validateGetProducts = validateQuery(productValidationSchemas.getProducts);
export const validateGetProductPrice = validateQuery(productValidationSchemas.getProductPrice);
export const validateGetProductImages = validateQuery(productValidationSchemas.getProductImages);
export const validateSearchProducts = validateQuery(productValidationSchemas.searchProducts);
