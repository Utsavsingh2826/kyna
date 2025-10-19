import SubProduct, { ISubProduct } from '../models/subProductModel';
import ProductVariant from '../models/productVariantModel';
import { ImageService } from './imageService';

export interface SubProductFilters {
  category?: string;
  subCategory?: string;
  priceRange?: { min: number; max: number };
  diamondShape?: string;
  metal?: string;
  hasDiamond?: boolean;
  tags?: string[];
  isFeatured?: boolean;
}

export interface SubProductListingResponse {
  subProducts: Array<{
    id: string;
    subProductId: string;
    displayName: string;
    shortDescription: string;
    slug: string;
    heroImage: string;
    productCount: number;
    priceRange: { min: number; max: number };
    tags: string[];
    category: string;
    subCategory: string;
  }>;
  pagination: {
    totalSubProducts: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export class SubProductService {
  private imageService: ImageService;

  constructor() {
    this.imageService = new ImageService();
  }

  async getSubProducts(
    filters: SubProductFilters = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ): Promise<SubProductListingResponse> {
    try {
      const { page, limit } = pagination;
      const skip = (page - 1) * limit;

      const query: any = { isActive: true };

      if (filters.category) {
        query.category = { $regex: filters.category, $options: 'i' };
      }

      if (filters.subCategory) {
        query.subCategory = { $regex: filters.subCategory, $options: 'i' };
      }

      if (filters.priceRange) {
        query.priceRange = {
          $gte: filters.priceRange.min,
          $lte: filters.priceRange.max
        };
      }

      if (filters.tags && filters.tags.length > 0) {
        query.tags = { $in: filters.tags };
      }

      if (filters.isFeatured !== undefined) {
        query.isFeatured = filters.isFeatured;
      }

      const totalSubProducts = await SubProduct.countDocuments(query);
      const subProducts = await SubProduct.find(query)
        .select('subProductId displayName shortDescription slug heroImage productCount priceRange tags category subCategory')
        .sort({ sortOrder: 1, displayPriority: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const transformedSubProducts = subProducts.map(subProduct => ({
        id: subProduct._id.toString(),
        subProductId: subProduct.subProductId,
        displayName: subProduct.displayName,
        shortDescription: subProduct.shortDescription,
        slug: subProduct.slug,
        heroImage: subProduct.heroImage,
        productCount: subProduct.productCount,
        priceRange: subProduct.priceRange,
        tags: subProduct.tags,
        category: subProduct.category,
        subCategory: subProduct.subCategory
      }));

      return {
        subProducts: transformedSubProducts,
        pagination: {
          totalSubProducts,
          totalPages: Math.ceil(totalSubProducts / limit),
          currentPage: page,
          limit
        }
      };
    } catch (error) {
      console.error('Error fetching sub-products:', error);
      throw new Error('Failed to fetch sub-products');
    }
  }

  async getSubProductById(identifier: string): Promise<any> {
    try {
      const subProduct = await SubProduct.findOne({
        $or: [
          { _id: identifier },
          { subProductId: identifier },
          { slug: identifier }
        ],
        isActive: true
      });

      if (!subProduct) {
        return null;
      }

      const featuredVariants = await ProductVariant.find({
        variantId: { $in: subProduct.featuredVariants },
        isActive: true
      }).select('variantId stylingName mainImage basePrice priceRange viewType hasDiamond');

      const allVariants = await ProductVariant.find({
        variantId: { $in: subProduct.productVariants },
        isActive: true
      }).select('variantId stylingName mainImage basePrice priceRange viewType hasDiamond');

      return {
        id: subProduct._id.toString(),
        subProductId: subProduct.subProductId,
        displayName: subProduct.displayName,
        description: subProduct.description,
        shortDescription: subProduct.shortDescription,
        slug: subProduct.slug,
        heroImage: subProduct.heroImage,
        bannerImage: subProduct.bannerImage,
        galleryImages: subProduct.galleryImages,
        category: subProduct.category,
        subCategory: subProduct.subCategory,
        viewType: subProduct.viewType,
        priceRange: subProduct.priceRange,
        availableDiamondShapes: subProduct.availableDiamondShapes,
        availableDiamondSizes: subProduct.availableDiamondSizes,
        availableMetalTypes: subProduct.availableMetalTypes,
        availableMetalColors: subProduct.availableMetalColors,
        tags: subProduct.tags,
        metaTitle: subProduct.metaTitle,
        metaDescription: subProduct.metaDescription,
        keywords: subProduct.keywords,
        productCount: subProduct.productCount,
        featuredVariants: featuredVariants.map(variant => ({
          variantId: variant.variantId,
          stylingName: variant.stylingName,
          mainImage: variant.mainImage,
          basePrice: variant.basePrice,
          priceRange: variant.priceRange,
          viewType: variant.viewType,
          hasDiamond: variant.hasDiamond
        })),
        allVariants: allVariants.map(variant => ({
          variantId: variant.variantId,
          stylingName: variant.stylingName,
          mainImage: variant.mainImage,
          basePrice: variant.basePrice,
          priceRange: variant.priceRange,
          viewType: variant.viewType,
          hasDiamond: variant.hasDiamond
        })),
        customizationOptions: {
          diamondShapes: subProduct.availableDiamondShapes,
          diamondSizes: subProduct.availableDiamondSizes,
          metalTypes: subProduct.availableMetalTypes,
          metalColors: subProduct.availableMetalColors
        }
      };
    } catch (error) {
      console.error('Error fetching sub-product details:', error);
      throw new Error('Failed to fetch sub-product details');
    }
  }

  async getSubProductsByCategory(category: string): Promise<SubProductListingResponse> {
    return this.getSubProducts({ category });
  }

  async getFeaturedSubProducts(limit: number = 6): Promise<SubProductListingResponse> {
    return this.getSubProducts({ isFeatured: true }, { page: 1, limit });
  }

  async searchSubProducts(
    query: string,
    filters: SubProductFilters = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ): Promise<SubProductListingResponse> {
    try {
      const searchQuery: any = {
        $or: [
          { displayName: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { shortDescription: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } },
          { keywords: { $in: [new RegExp(query, 'i')] } }
        ],
        isActive: true
      };

      if (filters.category) {
        searchQuery.category = { $regex: filters.category, $options: 'i' };
      }

      if (filters.subCategory) {
        searchQuery.subCategory = { $regex: filters.subCategory, $options: 'i' };
      }

      if (filters.priceRange) {
        searchQuery.priceRange = {
          $gte: filters.priceRange.min,
          $lte: filters.priceRange.max
        };
      }

      const { page, limit } = pagination;
      const skip = (page - 1) * limit;

      const totalSubProducts = await SubProduct.countDocuments(searchQuery);
      const subProducts = await SubProduct.find(searchQuery)
        .select('subProductId displayName shortDescription slug heroImage productCount priceRange tags category subCategory')
        .sort({ sortOrder: 1, displayPriority: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const transformedSubProducts = subProducts.map(subProduct => ({
        id: subProduct._id.toString(),
        subProductId: subProduct.subProductId,
        displayName: subProduct.displayName,
        shortDescription: subProduct.shortDescription,
        slug: subProduct.slug,
        heroImage: subProduct.heroImage,
        productCount: subProduct.productCount,
        priceRange: subProduct.priceRange,
        tags: subProduct.tags,
        category: subProduct.category,
        subCategory: subProduct.subCategory
      }));

      return {
        subProducts: transformedSubProducts,
        pagination: {
          totalSubProducts,
          totalPages: Math.ceil(totalSubProducts / limit),
          currentPage: page,
          limit
        }
      };
    } catch (error) {
      console.error('Error searching sub-products:', error);
      throw new Error('Failed to search sub-products');
    }
  }

  async getSubProductFilters(): Promise<{
    categories: string[];
    subCategories: string[];
    priceRanges: Array<{ min: number; max: number; label: string }>;
    tags: string[];
  }> {
    try {
      const [categories, subCategories, priceRanges, tags] = await Promise.all([
        SubProduct.distinct('category', { isActive: true }),
        SubProduct.distinct('subCategory', { isActive: true }),
        SubProduct.aggregate([
          { $match: { isActive: true } },
          {
            $group: {
              _id: null,
              minPrice: { $min: '$priceRange.min' },
              maxPrice: { $max: '$priceRange.max' }
            }
          }
        ]),
        SubProduct.distinct('tags', { isActive: true })
      ]);

      const priceRangeBuckets = [];
      if (priceRanges.length > 0) {
        const { minPrice, maxPrice } = priceRanges[0];
        const range = maxPrice - minPrice;
        const bucketSize = Math.ceil(range / 5);

        for (let i = 0; i < 5; i++) {
          const min = minPrice + (i * bucketSize);
          const max = i === 4 ? maxPrice : min + bucketSize - 1;
          priceRangeBuckets.push({
            min,
            max,
            label: `₹${min.toLocaleString()} - ₹${max.toLocaleString()}`
          });
        }
      }

      return {
        categories: categories.sort(),
        subCategories: subCategories.sort(),
        priceRanges: priceRangeBuckets,
        tags: tags.filter(Boolean).sort()
      };
    } catch (error) {
      console.error('Error fetching sub-product filters:', error);
      throw new Error('Failed to fetch filters');
    }
  }

  async incrementViewCount(subProductId: string): Promise<void> {
    try {
      await SubProduct.findByIdAndUpdate(subProductId, {
        $inc: { viewCount: 1 }
      });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  }

  async updateProductCount(subProductId: string): Promise<void> {
    try {
      const subProduct = await SubProduct.findById(subProductId);
      if (!subProduct) return;

      const productCount = await ProductVariant.countDocuments({
        variantId: { $in: subProduct.productVariants },
        isActive: true
      });

      await SubProduct.findByIdAndUpdate(subProductId, {
        productCount,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Error updating product count:', error);
    }
  }
}

export const subProductService = new SubProductService();
