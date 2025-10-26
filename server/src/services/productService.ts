import { IProduct } from '../models/productModel';
import Product from '../models/productModel';
import { pricingService } from './pricingService';
import { ImageService } from './imageService';

// Query filters interface
interface ProductFilters {
  category?: string;
  diamondShape?: string;
  metal?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  diamondSize?: {
    min: number;
    max: number;
  };
  karat?: number;
  diamondOrigin?: string;
  tone?: string;
  finish?: string;
}

// Pagination interface
interface PaginationOptions {
  page: number;
  limit: number;
}

// Product listing response
interface ProductListingResponse {
  products: Array<{
    id: string;
    name: string;
    sku: string;
    category: string;
    mainImage: string;
    price: number;
  }>;
  pagination: {
    totalProducts: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

// Product details response
interface ProductDetailsResponse {
  id: string;
  sku: string;
  variant: string;
  title: string;
  description?: string;
  category: string;
  subCategory: string;
  price: number;
  diamondShape?: string;
  diamondSize?: number;
  diamondColor?: string;
  diamondOrigin?: string[];
  tone?: string;
  finish?: string;
  metal?: string;
  karat?: number;
  images: {
    main: string;
    sub: string[];
  };
  rating?: {
    score?: number;
    reviews?: number;
  };
  isGiftingAvailable?: boolean;
  isEngraving?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ProductService {
  /**
   * Get paginated products with filters
   */
  async getProducts(
    filters: ProductFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 20 }
  ): Promise<ProductListingResponse> {
    try {
      const { page, limit } = pagination;
      const skip = (page - 1) * limit;

      // Build MongoDB query
      const query: any = {};

      // Apply filters
      if (filters.category) {
        query.category = { $regex: filters.category, $options: 'i' };
      }

      if (filters.diamondShape) {
        query.diamondShape = filters.diamondShape;
      }

      if (filters.metal) {
        query.metal = filters.metal;
      }

      if (filters.priceRange) {
        query.price = {
          $gte: filters.priceRange.min,
          $lte: filters.priceRange.max
        };
      }

      if (filters.diamondSize) {
        query.diamondSize = {
          $gte: filters.diamondSize.min,
          $lte: filters.diamondSize.max
        };
      }

      if (filters.karat) {
        query.karat = filters.karat;
      }

      if (filters.diamondOrigin) {
        query.diamondOrigin = { $in: [filters.diamondOrigin] };
      }

      if (filters.tone) {
        query.tone = filters.tone;
      }

      if (filters.finish) {
        query.finish = filters.finish;
      }

      // Get total count
      const totalProducts = await Product.countDocuments(query);

      // Get products with pagination
      const products = await Product.find(query)
        .select('_id title sku category price images')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      // Transform products for response
      const transformedProducts = products.map(product => ({
        id: product._id.toString(),
        name: product.title,
        sku: product.sku,
        category: product.category,
        mainImage: product.images?.main || new ImageService().getDefaultImageUrl(),
        price: product.price
      }));

      return {
        products: transformedProducts,
        pagination: {
          totalProducts,
          totalPages: Math.ceil(totalProducts / limit),
          currentPage: page,
          limit
        }
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(productId: string): Promise<ProductDetailsResponse | null> {
    try {
      const product = await Product.findById(productId);
      
      if (!product) {
        return null;
      }

      return this.transformProductToDetails(product);
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      throw new Error('Failed to fetch product');
    }
  }

  /**
   * Get product by SKU
   */
  async getProductBySku(sku: string): Promise<ProductDetailsResponse | null> {
    try {
      const product = await Product.findOne({ sku });
      
      if (!product) {
        return null;
      }

      return this.transformProductToDetails(product);
    } catch (error) {
      console.error('Error fetching product by SKU:', error);
      throw new Error('Failed to fetch product');
    }
  }

  /**
   * Calculate dynamic price for a product
   */
  async calculateProductPrice(
    productId: string,
    overrides?: {
      diamondSize?: number;
      metal?: string;
      karat?: number;
      diamondOrigin?: string;
      diamondShape?: string;
      diamondColor?: string;
    }
  ): Promise<{ price: number; breakdown?: any }> {
    try {
      const product = await Product.findById(productId);
      
      if (!product) {
        throw new Error('Product not found');
      }

      const price = pricingService.calculatePrice(product, overrides);
      const breakdown = pricingService.getPriceBreakdown(product, overrides);

      return {
        price,
        breakdown
      };
    } catch (error) {
      console.error('Error calculating product price:', error);
      throw new Error('Failed to calculate price');
    }
  }

  /**
   * Get product images using flexible BOM naming convention
   * Dynamically concatenates SKU with any combination of attributes
   * Format: SKU-ATTRIBUTE1-ATTRIBUTE2-ATTRIBUTE3-...-VIEW
   */
  async getProductImages(
    productId: string,
    attributes?: {
      diamondShape?: string;
      metal?: string;
      diamondSize?: number;
      diamondColor?: string;
      diamondOrigin?: string;
      tone?: string;
      finish?: string;
      [key: string]: string | number | undefined;
    }
  ): Promise<{ main: string; sub: string[] }> {
    try {
      const product = await Product.findById(productId);
      
      if (!product) {
        throw new Error('Product not found');
      }

      // Build flexible attributes object with all available attributes
      const imageAttributes: { [key: string]: string | number } = {};
      
      // Add provided attributes or use product defaults
      if (attributes?.diamondShape) imageAttributes.diamondShape = attributes.diamondShape;
      else if (product.diamondShape) imageAttributes.diamondShape = product.diamondShape;
      
      if (attributes?.metal) imageAttributes.metal = attributes.metal;
      else if (product.metal) imageAttributes.metal = product.metal;
      
      if (attributes?.diamondSize) imageAttributes.diamondSize = attributes.diamondSize;
      else if (product.diamondSize) imageAttributes.diamondSize = product.diamondSize;
      
      if (attributes?.tone) imageAttributes.tone = attributes.tone;
      else if (product.tone) imageAttributes.tone = product.tone;
      
      if (attributes?.finish) imageAttributes.finish = attributes.finish;
      else if (product.finish) imageAttributes.finish = product.finish;
      
      if (attributes?.diamondColor) imageAttributes.diamondColor = attributes.diamondColor;
      else if (product.diamondColor) imageAttributes.diamondColor = product.diamondColor;
      
      if (attributes?.karat) imageAttributes.karat = attributes.karat;
      else if (product.karat) imageAttributes.karat = product.karat;

      // Add any additional custom attributes
      Object.keys(attributes || {}).forEach(key => {
        if (attributes![key] !== undefined && !imageAttributes[key]) {
          imageAttributes[key] = attributes![key] as string | number;
        }
      });

      // Use flexible BOM-based image generation
      return new ImageService().generateImageUrlsFlexible(product.sku, imageAttributes);
    } catch (error) {
      console.error('Error fetching product images:', error);
      throw new Error('Failed to fetch images');
    }
  }

  /**
   * Get product categories
   */
  async getProductCategories(): Promise<string[]> {
    try {
      const categories = await Product.distinct('category');
      return categories.sort();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Failed to fetch categories');
    }
  }

  /**
   * Get product filters (available values for filtering)
   */
  async getProductFilters(): Promise<{
    diamondShapes: string[];
    metals: string[];
    karats: number[];
    diamondOrigins: string[];
    tones: string[];
    finishes: string[];
  }> {
    try {
      const [
        diamondShapes,
        metals,
        karats,
        diamondOrigins,
        tones,
        finishes
      ] = await Promise.all([
        Product.distinct('diamondShape'),
        Product.distinct('metal'),
        Product.distinct('karat'),
        Product.distinct('diamondOrigin'),
        Product.distinct('tone'),
        Product.distinct('finish')
      ]);

      return {
        diamondShapes: diamondShapes.filter(Boolean).sort(),
        metals: metals.filter(Boolean).sort(),
        karats: karats.filter(Boolean).sort((a, b) => a - b),
        diamondOrigins: diamondOrigins.filter(Boolean).sort(),
        tones: tones.filter(Boolean).sort(),
        finishes: finishes.filter(Boolean).sort()
      };
    } catch (error) {
      console.error('Error fetching product filters:', error);
      throw new Error('Failed to fetch filters');
    }
  }

  /**
   * Search products by query
   */
  async searchProducts(
    query: string,
    filters: ProductFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 20 }
  ): Promise<ProductListingResponse> {
    try {
      const { page, limit } = pagination;
      const skip = (page - 1) * limit;

      // Build search query
      const searchQuery: any = {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { sku: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } }
        ]
      };

      // Apply additional filters
      if (filters.category) {
        searchQuery.category = { $regex: filters.category, $options: 'i' };
      }

      if (filters.diamondShape) {
        searchQuery.diamondShape = filters.diamondShape;
      }

      if (filters.metal) {
        searchQuery.metal = filters.metal;
      }

      if (filters.priceRange) {
        searchQuery.price = {
          $gte: filters.priceRange.min,
          $lte: filters.priceRange.max
        };
      }

      // Get total count
      const totalProducts = await Product.countDocuments(searchQuery);

      // Get products with pagination
      const products = await Product.find(searchQuery)
        .select('_id title sku category price images')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      // Transform products for response
      const transformedProducts = products.map(product => ({
        id: product._id.toString(),
        name: product.title,
        sku: product.sku,
        category: product.category,
        mainImage: product.images?.main || new ImageService().getDefaultImageUrl(),
        price: product.price
      }));

      return {
        products: transformedProducts,
        pagination: {
          totalProducts,
          totalPages: Math.ceil(totalProducts / limit),
          currentPage: page,
          limit
        }
      };
    } catch (error) {
      console.error('Error searching products:', error);
      throw new Error('Failed to search products');
    }
  }

  /**
   * Transform product to details response
   */
  private transformProductToDetails(product: IProduct): ProductDetailsResponse {
    return {
      id: product._id.toString(),
      sku: product.sku,
      variant: product.variant,
      title: product.title,
      description: product.description,
      category: product.category,
      subCategory: product.subCategory,
      price: product.price,
      diamondShape: product.diamondShape,
      diamondSize: product.diamondSize,
      diamondColor: product.diamondColor,
      diamondOrigin: product.diamondOrigin,
      tone: product.tone,
      finish: product.finish,
      metal: product.metal,
      karat: product.karat,
      images: product.images || {
        main: new ImageService().getDefaultImageUrl(),
        sub: [new ImageService().getDefaultImageUrl()]
      },
      rating: product.rating,
      isGiftingAvailable: product.isGiftingAvailable,
      isEngraving: product.isEngraving,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };
  }

  /**
   * Update product images based on attributes
   */
  async updateProductImages(productId: string, attributes: any): Promise<void> {
    try {
      const product = await Product.findById(productId);
      
      if (!product) {
        throw new Error('Product not found');
      }

      const images = new ImageService().generateImageUrls(product.sku, attributes);
      
      await Product.findByIdAndUpdate(productId, { images });
    } catch (error) {
      console.error('Error updating product images:', error);
      throw new Error('Failed to update images');
    }
  }

  /**
   * Update product price based on attributes
   */
  async updateProductPrice(productId: string, attributes: any): Promise<number> {
    try {
      const product = await Product.findById(productId);
      
      if (!product) {
        throw new Error('Product not found');
      }

      const newPrice = pricingService.calculatePrice(product, attributes);
      
      await Product.findByIdAndUpdate(productId, { price: newPrice });
      
      return newPrice;
    } catch (error) {
      console.error('Error updating product price:', error);
      throw new Error('Failed to update price');
    }
  }

  /**
   * Create a new product (Admin function)
   */
  async createProduct(productData: any): Promise<any> {
    try {
      const product = new Product(productData);
      await product.save();
      return this.transformProductToDetails(product);
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error('Failed to create product');
    }
  }

  /**
   * Get all products with admin filters (Admin function)
   */
  async getAllProducts(filters: {
    page: number;
    limit: number;
    category?: string;
    search?: string;
    status?: string;
  }): Promise<any> {
    try {
      const { page, limit, category, search, status } = filters;
      const skip = (page - 1) * limit;

      const query: any = {};

      if (category) {
        query.category = { $regex: category, $options: 'i' };
      }

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { sku: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      if (status) {
        query.isActive = status === 'active';
      }

      const totalProducts = await Product.countDocuments(query);
      const products = await Product.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      return {
        products: products.map(product => this.transformProductToDetails(product)),
        pagination: {
          page,
          limit,
          total: totalProducts,
          pages: Math.ceil(totalProducts / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching all products:', error);
      throw new Error('Failed to fetch products');
    }
  }

  /**
   * Update product (Admin function)
   */
  async updateProduct(id: string, updateData: any): Promise<any> {
    try {
      const product = await Product.findByIdAndUpdate(id, updateData, { new: true });
      if (!product) {
        throw new Error('Product not found');
      }
      return this.transformProductToDetails(product);
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('Failed to update product');
    }
  }

  /**
   * Delete product (Admin function)
   */
  async deleteProduct(id: string): Promise<boolean> {
    try {
      const result = await Product.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product');
    }
  }

  /**
   * Update product status (Admin function)
   */
  async updateProductStatus(id: string, status: string): Promise<any> {
    try {
      const product = await Product.findByIdAndUpdate(
        id, 
        { isActive: status === 'active' }, 
        { new: true }
      );
      if (!product) {
        throw new Error('Product not found');
      }
      return this.transformProductToDetails(product);
    } catch (error) {
      console.error('Error updating product status:', error);
      throw new Error('Failed to update product status');
    }
  }

  /**
   * Get product statistics (Admin function)
   */
  async getProductStats(): Promise<any> {
    try {
      const totalProducts = await Product.countDocuments();
      const activeProducts = await Product.countDocuments({ isActive: true });
      const inactiveProducts = await Product.countDocuments({ isActive: false });
      
      const categoryStats = await Product.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      const priceStats = await Product.aggregate([
        { $group: { 
          _id: null, 
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }}
      ]);

      return {
        totalProducts,
        activeProducts,
        inactiveProducts,
        categoryStats,
        priceStats: priceStats[0] || { avgPrice: 0, minPrice: 0, maxPrice: 0 }
      };
    } catch (error) {
      console.error('Error fetching product stats:', error);
      throw new Error('Failed to fetch product statistics');
    }
  }
}

// Export singleton instance
export const productService = new ProductService();
