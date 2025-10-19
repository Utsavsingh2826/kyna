import { Router } from 'express';
import { 
  getProductsByCategory, 
  getProductsByCategoryFilters,
  getProducts,
  getProductById,
  getProductPrice,
  getProductImages,
  searchProducts,
  getProductFilters,
  getProductBOM
} from '../controllers/productController';
import {
  validateGetProducts,
  validateGetProductPrice,
  validateGetProductImages,
  validateSearchProducts,
  validateProductId
} from '../middleware/validation';

const router = Router();

// =====================
// NEW API ROUTES
// =====================

// GET /api/products - Get paginated products with filters
router.get('/', validateGetProducts, getProducts);

// GET /api/products/search - Search products
router.get('/search', validateSearchProducts, searchProducts);

// GET /api/products/filters - Get available filter options
router.get('/filters', getProductFilters);

// GET /api/products/:id - Get complete product details
router.get('/:id', validateProductId, getProductById);

// GET /api/products/:id/price - Get calculated price for product
router.get('/:id/price', validateProductId, validateGetProductPrice, getProductPrice);

// GET /api/products/:id/images - Get product images
router.get('/:id/images', validateProductId, validateGetProductImages, getProductImages);

// GET /api/products/:id/bom - Get BOM details for product
router.get('/:id/bom', validateProductId, getProductBOM);

// =====================
// LEGACY ROUTES (for backward compatibility)
// =====================

// GET /api/products/category/:category
router.get('/category/:category', getProductsByCategory);
router.get("/category/:category/filters", getProductsByCategoryFilters);

// GET /api/products/earrings/filter/diamond-shapes
// router.get('/earrings', getEarringsByDiamondShape);

export default router;
