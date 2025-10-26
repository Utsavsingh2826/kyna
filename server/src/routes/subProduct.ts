import express from 'express';
import { subProductController } from '../controllers/subProductController';
import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Validation rules
const validateSubProductId = [
  param('id')
    .notEmpty()
    .withMessage('Sub-product ID is required')
    .isLength({ min: 1 })
    .withMessage('Sub-product ID must not be empty'),
  handleValidationErrors
];

const validateCategory = [
  param('category')
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ min: 1 })
    .withMessage('Category must not be empty'),
  handleValidationErrors
];

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

const validateFilters = [
  query('category')
    .optional()
    .isLength({ min: 1 })
    .withMessage('Category must not be empty'),
  query('subCategory')
    .optional()
    .isLength({ min: 1 })
    .withMessage('Sub-category must not be empty'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Min price must be a positive number'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Max price must be a positive number'),
  query('diamondShape')
    .optional()
    .isLength({ min: 1 })
    .withMessage('Diamond shape must not be empty'),
  query('metal')
    .optional()
    .isLength({ min: 1 })
    .withMessage('Metal must not be empty'),
  query('hasDiamond')
    .optional()
    .isBoolean()
    .withMessage('Has diamond must be a boolean'),
  query('tags')
    .optional()
    .isString()
    .withMessage('Tags must be a string'),
  query('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('Is featured must be a boolean'),
  handleValidationErrors
];

const validateSearch = [
  query('q')
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 1 })
    .withMessage('Search query must not be empty'),
  handleValidationErrors
];

// Routes

/**
 * @route   GET /api/sub-products
 * @desc    Get all sub-products with filters and pagination
 * @access  Public
 */
router.get('/', validateFilters, validatePagination, subProductController.getSubProducts);

/**
 * @route   GET /api/sub-products/featured
 * @desc    Get featured sub-products
 * @access  Public
 */
router.get('/featured', validatePagination, subProductController.getFeaturedSubProducts);

/**
 * @route   GET /api/sub-products/search
 * @desc    Search sub-products
 * @access  Public
 */
router.get('/search', validateSearch, validateFilters, validatePagination, subProductController.searchSubProducts);

/**
 * @route   GET /api/sub-products/filters
 * @desc    Get sub-product filters
 * @access  Public
 */
router.get('/filters', subProductController.getSubProductFilters);

/**
 * @route   GET /api/sub-products/category/:category
 * @desc    Get sub-products by category
 * @access  Public
 */
router.get('/category/:category', validateCategory, validatePagination, subProductController.getSubProductsByCategory);

/**
 * @route   GET /api/sub-products/:id
 * @desc    Get sub-product by ID or slug
 * @access  Public
 */
router.get('/:id', validateSubProductId, subProductController.getSubProductById);

/**
 * @route   GET /api/sub-products/:id/variants
 * @desc    Get sub-product variants
 * @access  Public
 */
router.get('/:id/variants', validateSubProductId, validatePagination, subProductController.getSubProductVariants);

/**
 * @route   GET /api/sub-products/:id/customization
 * @desc    Get sub-product customization options
 * @access  Public
 */
router.get('/:id/customization', validateSubProductId, subProductController.getSubProductCustomization);

export default router;
