import { Request, Response } from 'express';
import { subProductService, SubProductFilters } from '../services/subProductService';

export class SubProductController {
  /**
   * Get all sub-products with filters and pagination
   * GET /api/sub-products
   */
  public getSubProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        page = 1,
        limit = 20,
        category,
        subCategory,
        minPrice,
        maxPrice,
        diamondShape,
        metal,
        hasDiamond,
        tags,
        isFeatured
      } = req.query;

      // Build filters
      const filters: SubProductFilters = {};
      
      if (category) filters.category = category as string;
      if (subCategory) filters.subCategory = subCategory as string;
      if (minPrice && maxPrice) {
        filters.priceRange = {
          min: parseInt(minPrice as string),
          max: parseInt(maxPrice as string)
        };
      }
      if (diamondShape) filters.diamondShape = diamondShape as string;
      if (metal) filters.metal = metal as string;
      if (hasDiamond !== undefined) filters.hasDiamond = hasDiamond === 'true';
      if (tags) filters.tags = (tags as string).split(',');
      if (isFeatured !== undefined) filters.isFeatured = isFeatured === 'true';

      const pagination = {
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };

      const result = await subProductService.getSubProducts(filters, pagination);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Sub-products fetched successfully'
      });
    } catch (error) {
      console.error('Error in getSubProducts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch sub-products',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get sub-product by ID or slug
   * GET /api/sub-products/:id
   */
  public getSubProductById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Sub-product ID is required'
        });
        return;
      }

      const subProduct = await subProductService.getSubProductById(id);

      if (!subProduct) {
        res.status(404).json({
          success: false,
          message: 'Sub-product not found'
        });
        return;
      }

      // Increment view count
      await subProductService.incrementViewCount(subProduct.id);

      res.status(200).json({
        success: true,
        data: subProduct,
        message: 'Sub-product details fetched successfully'
      });
    } catch (error) {
      console.error('Error in getSubProductById:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch sub-product details',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get sub-products by category
   * GET /api/sub-products/category/:category
   */
  public getSubProductsByCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const { category } = req.params;
      const { page = 1, limit = 20 } = req.query;

      if (!category) {
        res.status(400).json({
          success: false,
          message: 'Category is required'
        });
        return;
      }

      const pagination = {
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };

      const result = await subProductService.getSubProductsByCategory(category);

      res.status(200).json({
        success: true,
        data: result,
        message: `Sub-products for category '${category}' fetched successfully`
      });
    } catch (error) {
      console.error('Error in getSubProductsByCategory:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch sub-products by category',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get featured sub-products
   * GET /api/sub-products/featured
   */
  public getFeaturedSubProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const { limit = 6 } = req.query;

      const result = await subProductService.getFeaturedSubProducts(parseInt(limit as string));

      res.status(200).json({
        success: true,
        data: result,
        message: 'Featured sub-products fetched successfully'
      });
    } catch (error) {
      console.error('Error in getFeaturedSubProducts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch featured sub-products',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Search sub-products
   * GET /api/sub-products/search
   */
  public searchSubProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        q,
        page = 1,
        limit = 20,
        category,
        subCategory,
        minPrice,
        maxPrice,
        tags
      } = req.query;

      if (!q) {
        res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
        return;
      }

      // Build filters
      const filters: SubProductFilters = {};
      
      if (category) filters.category = category as string;
      if (subCategory) filters.subCategory = subCategory as string;
      if (minPrice && maxPrice) {
        filters.priceRange = {
          min: parseInt(minPrice as string),
          max: parseInt(maxPrice as string)
        };
      }
      if (tags) filters.tags = (tags as string).split(',');

      const pagination = {
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };

      const result = await subProductService.searchSubProducts(q as string, filters, pagination);

      res.status(200).json({
        success: true,
        data: result,
        message: `Search results for '${q}' fetched successfully`
      });
    } catch (error) {
      console.error('Error in searchSubProducts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search sub-products',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get sub-product filters
   * GET /api/sub-products/filters
   */
  public getSubProductFilters = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters = await subProductService.getSubProductFilters();

      res.status(200).json({
        success: true,
        data: filters,
        message: 'Sub-product filters fetched successfully'
      });
    } catch (error) {
      console.error('Error in getSubProductFilters:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch sub-product filters',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get sub-product variants
   * GET /api/sub-products/:id/variants
   */
  public getSubProductVariants = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { featured = false, page = 1, limit = 20 } = req.query;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Sub-product ID is required'
        });
        return;
      }

      const subProduct = await subProductService.getSubProductById(id);

      if (!subProduct) {
        res.status(404).json({
          success: false,
          message: 'Sub-product not found'
        });
        return;
      }

      const variants = featured === 'true' ? subProduct.featuredVariants : subProduct.allVariants;
      
      // Apply pagination
      const pagination = {
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };
      
      const startIndex = (pagination.page - 1) * pagination.limit;
      const endIndex = startIndex + pagination.limit;
      const paginatedVariants = variants.slice(startIndex, endIndex);

      res.status(200).json({
        success: true,
        data: {
          variants: paginatedVariants,
          pagination: {
            totalVariants: variants.length,
            totalPages: Math.ceil(variants.length / pagination.limit),
            currentPage: pagination.page,
            limit: pagination.limit
          }
        },
        message: 'Sub-product variants fetched successfully'
      });
    } catch (error) {
      console.error('Error in getSubProductVariants:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch sub-product variants',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get sub-product customization options
   * GET /api/sub-products/:id/customization
   */
  public getSubProductCustomization = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Sub-product ID is required'
        });
        return;
      }

      const subProduct = await subProductService.getSubProductById(id);

      if (!subProduct) {
        res.status(404).json({
          success: false,
          message: 'Sub-product not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: subProduct.customizationOptions,
        message: 'Sub-product customization options fetched successfully'
      });
    } catch (error) {
      console.error('Error in getSubProductCustomization:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch customization options',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}

export const subProductController = new SubProductController();
