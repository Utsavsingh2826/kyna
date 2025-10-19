import express from 'express';
import { body, param, query } from 'express-validator';
import BuildYourJewelryController from '../controllers/buildYourJewelryController';

const router = express.Router();
const buildYourJewelryController = new BuildYourJewelryController();

/**
 * @route GET /api/build-your-jewelry/categories
 * @desc Get all jewelry categories with their variants
 * @access Public
 */
router.get('/categories', buildYourJewelryController.getJewelryCategories);

/**
 * @route GET /api/build-your-jewelry/categories/:category
 * @desc Get product variants by category
 * @access Public
 */
router.get('/categories/:category', [
  param('category')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  query('withDiamond')
    .optional()
    .isBoolean()
    .withMessage('withDiamond must be a boolean')
], buildYourJewelryController.getVariantsByCategory);

/**
 * @route GET /api/build-your-jewelry/variants/:variantId
 * @desc Get specific variant details
 * @access Public
 */
router.get('/variants/:variantId', [
  param('variantId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Variant ID is required')
], buildYourJewelryController.getVariantDetails);

/**
 * @route GET /api/build-your-jewelry/variants/:variantId/customization-options
 * @desc Get customization options for a variant
 * @access Public
 */
router.get('/variants/:variantId/customization-options', [
  param('variantId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Variant ID is required')
], buildYourJewelryController.getCustomizationOptions);

/**
 * @route POST /api/build-your-jewelry/variants/:variantId/calculate-price
 * @desc Calculate price for customized jewelry
 * @access Public
 */
router.post('/variants/:variantId/calculate-price', [
  param('variantId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Variant ID is required'),
  body('diamondShape')
    .optional()
    .isString()
    .trim()
    .withMessage('Diamond shape must be a string'),
  body('diamondSize')
    .optional()
    .isNumeric()
    .withMessage('Diamond size must be a number'),
  body('diamondColor')
    .optional()
    .isString()
    .trim()
    .withMessage('Diamond color must be a string'),
  body('diamondClarity')
    .optional()
    .isString()
    .trim()
    .withMessage('Diamond clarity must be a string'),
  body('diamondOrigin')
    .optional()
    .isString()
    .trim()
    .withMessage('Diamond origin must be a string'),
  body('metalType')
    .optional()
    .isString()
    .trim()
    .withMessage('Metal type must be a string'),
  body('metalKt')
    .optional()
    .isString()
    .trim()
    .withMessage('Metal karat must be a string'),
  body('metalColor')
    .optional()
    .isString()
    .trim()
    .withMessage('Metal color must be a string'),
  body('ringSize')
    .optional()
    .isString()
    .trim()
    .withMessage('Ring size must be a string'),
  body('braceletSize')
    .optional()
    .isString()
    .trim()
    .withMessage('Bracelet size must be a string'),
  body('necklaceLength')
    .optional()
    .isString()
    .trim()
    .withMessage('Necklace length must be a string'),
  body('engraving')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 15 })
    .withMessage('Engraving must be a string with maximum 15 characters')
], buildYourJewelryController.calculateCustomizedPrice);

/**
 * @route GET /api/build-your-jewelry/gents-rings/with-diamond
 * @desc Get gents rings with diamond
 * @access Public
 */
router.get('/gents-rings/with-diamond', buildYourJewelryController.getGentsRingsWithDiamond);

/**
 * @route GET /api/build-your-jewelry/gents-rings/without-diamond
 * @desc Get gents rings without diamond
 * @access Public
 */
router.get('/gents-rings/without-diamond', buildYourJewelryController.getGentsRingsWithoutDiamond);

/**
 * @route POST /api/build-your-jewelry/initialize-bom
 * @desc Initialize BOM data and create product variants
 * @access Public (should be protected in production)
 */
router.post('/initialize-bom', buildYourJewelryController.initializeBOMData);

/**
 * @route GET /api/build-your-jewelry/view-types
 * @desc Get all available view types
 * @access Public
 */
router.get('/view-types', buildYourJewelryController.getViewTypes);

/**
 * @route GET /api/build-your-jewelry/variants/:variantId/images
 * @desc Get variant images with custom attributes
 * @access Public
 */
router.get('/variants/:variantId/images', [
  param('variantId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Variant ID is required'),
  query('diamondShape')
    .optional()
    .isString()
    .trim()
    .withMessage('Diamond shape must be a string'),
  query('diamondSize')
    .optional()
    .isNumeric()
    .withMessage('Diamond size must be a number'),
  query('diamondColor')
    .optional()
    .isString()
    .trim()
    .withMessage('Diamond color must be a string'),
  query('metal')
    .optional()
    .isString()
    .trim()
    .withMessage('Metal must be a string'),
  query('karat')
    .optional()
    .isNumeric()
    .withMessage('Karat must be a number'),
  query('tone')
    .optional()
    .isString()
    .trim()
    .withMessage('Tone must be a string'),
  query('finish')
    .optional()
    .isString()
    .trim()
    .withMessage('Finish must be a string'),
  query('view')
    .optional()
    .isString()
    .trim()
    .withMessage('View must be a string')
], buildYourJewelryController.getVariantImages);

/**
 * @route GET /api/build-your-jewelry/variants/:variantId/images/basic
 * @desc Get variant basic images (for listing)
 * @access Public
 */
router.get('/variants/:variantId/images/basic', [
  param('variantId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Variant ID is required')
], buildYourJewelryController.getVariantBasicImages);

export default router;
