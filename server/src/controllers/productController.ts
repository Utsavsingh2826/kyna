import { Request, Response } from 'express';
import mongoose, { Model, Document } from 'mongoose';
import { productService } from '../services/productService';
import { pricingService } from '../services/pricingService';
import { ImageService } from '../services/imageService';
import Product from '../models/productModel';

// ✅ Utility to dynamically get collection
const getCollectionModel = (collectionName: string): Model<Document> => {
  // If model already exists in mongoose, reuse it
  if (mongoose.models[collectionName]) {
    return mongoose.models[collectionName] as Model<Document>;
  }

  // Otherwise create a new model with generic schema
  const schema = new mongoose.Schema({}, { strict: false, collection: collectionName });
  return mongoose.model<Document>(collectionName, schema, collectionName);
};

export const getProductsByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const rawPage = req.query.page as string;
    const rawLimit = req.query.limit as string;

    const page = parseInt(rawPage) || 1;
    const limit = parseInt(rawLimit) || 10;
    const skip = (page - 1) * limit;

    // Dynamically get model for this category’s collection
    const ProductModel = getCollectionModel(category.toLowerCase());

    // ✅ Only filter by category (no query param filters)
    const filters = { category: category.toLowerCase() };

    // Count total documents
    const totalProducts = await ProductModel.countDocuments(filters);

    // Paginated query
    const products = await ProductModel.find(filters)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: products.length,
      totalProducts,
      products,
      pagination: {
        totalPages: Math.ceil(totalProducts / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};


// GET /api/products/category/:category
export const getProductsByCategoryFilters = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const rawPage = req.query.page as string;
    const rawLimit = req.query.limit as string;

    const page = parseInt(rawPage) || 1;
    const limit = parseInt(rawLimit) || 10;
    const skip = (page - 1) * limit;

    // Dynamically get model for this category's collection
    const ProductModel = getCollectionModel(category.toLowerCase());

    // Build filters dynamically
    const filters: Record<string, any> = {
      category: category.toLowerCase(),
    };

    Object.entries(req.query).forEach(([key, value]) => {
      if (["page", "limit"].includes(key)) return; // skip pagination params

      if (typeof value === "string") {
        // ✅ Price range filter
        if (key === "minPrice" || key === "maxPrice") {
          if (!filters["price"]) filters["price"] = {};
          if (key === "minPrice") filters["price"]["$gte"] = parseFloat(value);
          if (key === "maxPrice") filters["price"]["$lte"] = parseFloat(value);
          return;
        }

        try {
          if (value.startsWith("[") && value.endsWith("]")) {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
              filters[key] = { $in: parsed.map(v => v.toUpperCase()) };
            }
          } else {
            // Single value
            filters[key] = value.toUpperCase();
          }
        } catch {
          filters[key] = value.toString().toUpperCase();
        }
      }
    });

    // Count total documents with filters
    const totalProducts = await ProductModel.countDocuments(filters);

    // Paginated query with filters
    const products = await ProductModel.find(filters)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: products.length,
      totalProducts,
      products,
      pagination: {
        totalPages: Math.ceil(totalProducts / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

// =====================
// NEW API ENDPOINTS
// =====================

/**
 * GET /api/products
 * Return paginated products for listing (20 per page)
 * Return lightweight data: id, name, sku, category, main image only
 * Support filters: category, diamondShape, metal, price range
 */
export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      category,
      diamondShape,
      metal,
      minPrice,
      maxPrice,
      diamondSize,
      karat,
      diamondOrigin,
      tone,
      finish
    } = req.query;

    // Parse pagination
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;

    // Build filters
    const filters: any = {};

    if (category) filters.category = category as string;
    if (diamondShape) filters.diamondShape = diamondShape as string;
    if (metal) filters.metal = metal as string;
    if (diamondSize) filters.diamondSize = { min: parseFloat(diamondSize as string) };
    if (karat) filters.karat = parseInt(karat as string);
    if (diamondOrigin) filters.diamondOrigin = diamondOrigin as string;
    if (tone) filters.tone = tone as string;
    if (finish) filters.finish = finish as string;

    if (minPrice || maxPrice) {
      filters.priceRange = {
        min: minPrice ? parseFloat(minPrice as string) : 0,
        max: maxPrice ? parseFloat(maxPrice as string) : Number.MAX_SAFE_INTEGER
      };
    }

    // Get products from service
    const result = await productService.getProducts(filters, {
      page: pageNum,
      limit: limitNum
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in getProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * GET /api/products/:id/price
 * Return calculated price with BOM details for a given product
 * Accept query params: diamondSize, metal, karat, diamondOrigin, diamondShape
 */
export const getProductPrice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      diamondSize,
      metal,
      karat,
      diamondOrigin,
      diamondShape,
      diamondColor
    } = req.query;

    // Build overrides object
    const overrides: any = {};
    if (diamondSize) overrides.diamondSize = parseFloat(diamondSize as string);
    if (metal) overrides.metal = metal as string;
    if (karat) overrides.karat = parseInt(karat as string);
    if (diamondOrigin) overrides.diamondOrigin = diamondOrigin as string;
    if (diamondShape) overrides.diamondShape = diamondShape as string;
    if (diamondColor) overrides.diamondColor = diamondColor as string;

    // Calculate price
    const result = await productService.calculateProductPrice(id, overrides);

    // Get product from database for BOM details
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get BOM details from pricing service
    const bomDetails = pricingService.getBOMDetails(product, overrides);

    res.status(200).json({
      success: true,
      data: {
        productId: id,
        price: result.price,
        breakdown: result.breakdown,
        bomDetails: bomDetails
      }
    });
  } catch (error) {
    console.error('Error in getProductPrice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate price',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * GET /api/products/:id/images
 * Return image URLs using flexible BOM naming convention
 * Format: SKU-ATTRIBUTE1-ATTRIBUTE2-ATTRIBUTE3-...-VIEW
 * Accept query params for any product attributes
 * Return main + sub images
 */
export const getProductImages = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const queryParams = req.query;

    // Build flexible attributes object from all query parameters
    const attributes: { [key: string]: string | number } = {};
    
    // Process all query parameters
    Object.keys(queryParams).forEach(key => {
      const value = queryParams[key];
      if (value && typeof value === 'string') {
        // Convert numeric values
        if (key === 'diamondSize' || key === 'size' || key === 'karat') {
          attributes[key] = parseFloat(value);
        } else {
          attributes[key] = value;
        }
      }
    });

    // Get images using flexible BOM naming convention
    const images = await productService.getProductImages(id, attributes);

    // Get product details for additional context
    const product = await productService.getProductById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        productId: id,
        productSku: product.sku,
        images,
        imageNamingConvention: {
          format: 'SKU-ATTRIBUTE1-ATTRIBUTE2-ATTRIBUTE3-...-VIEW',
          description: 'Dynamically concatenates SKU with any combination of product attributes',
          examples: {
            'Gents Ring': 'GR1-RD-70-2T-BR-RG-GP',
            'Engagement Ring': 'ENG1-PR-100-1T-WG-GP',
            'Solitaire Ring': 'SOL1-OV-50-1T-YG-GP',
            'Bracelet': 'BR1-RD-30-2T-BR-RG-GP',
            'Pendant': 'PN1-EM-25-1T-SL-GP',
            'Earrings': 'ER1-CUS-40-2T-BR-RG-GP'
          },
          views: {
            main: 'GP (Ground View)',
            sub: ['SIDE', 'TOP', 'DETAIL', 'LIFESTYLE', 'COMPARISON', 'CUSTOM', '360']
          },
          supportedAttributes: [
            'diamondShape', 'diamondSize', 'diamondColor', 'diamondOrigin',
            'metal', 'karat', 'tone', 'finish', 'gemstoneType', 'chainLength'
          ]
        }
      }
    });
  } catch (error) {
    console.error('Error in getProductImages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch images',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * GET /api/products/:id
 * Return complete product details
 * Include metadata, dynamic price, image URLs
 */
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get product details
    const product = await productService.getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error in getProductById:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * GET /api/products/search
 * Search products by query string
 */
export const searchProducts = async (req: Request, res: Response) => {
  try {
    const {
      q,
      page = '1',
      limit = '20',
      category,
      diamondShape,
      metal,
      minPrice,
      maxPrice
    } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Parse pagination
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;

    // Build filters
    const filters: any = {};
    if (category) filters.category = category as string;
    if (diamondShape) filters.diamondShape = diamondShape as string;
    if (metal) filters.metal = metal as string;

    if (minPrice || maxPrice) {
      filters.priceRange = {
        min: minPrice ? parseFloat(minPrice as string) : 0,
        max: maxPrice ? parseFloat(maxPrice as string) : Number.MAX_SAFE_INTEGER
      };
    }

    // Search products
    const result = await productService.searchProducts(q as string, filters, {
      page: pageNum,
      limit: limitNum
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in searchProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search products',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * GET /api/products/filters
 * Get available filter options
 */
export const getProductFilters = async (req: Request, res: Response) => {
  try {
    const filters = await productService.getProductFilters();

    res.status(200).json({
      success: true,
      data: filters
    });
  } catch (error) {
    console.error('Error in getProductFilters:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch filters',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * GET /api/products/:id/bom
 * Get BOM details for a product
 * Returns complete BOM information including pricing breakdown
 */
export const getProductBOM = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      diamondSize,
      metal,
      karat,
      diamondOrigin,
      diamondShape,
      diamondColor
    } = req.query;

    // Build overrides object
    const overrides: any = {};
    if (diamondSize) overrides.diamondSize = parseFloat(diamondSize as string);
    if (metal) overrides.metal = metal as string;
    if (karat) overrides.karat = parseInt(karat as string);
    if (diamondOrigin) overrides.diamondOrigin = diamondOrigin as string;
    if (diamondShape) overrides.diamondShape = diamondShape as string;
    if (diamondColor) overrides.diamondColor = diamondColor as string;

    // Get product from database for BOM details
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get BOM details from pricing service
    const bomDetails = pricingService.getBOMDetails(product, overrides);

    res.status(200).json({
      success: true,
      data: {
        productId: id,
        bomDetails
      }
    });
  } catch (error) {
    console.error('Error in getProductBOM:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch BOM details',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};







