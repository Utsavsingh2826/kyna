import BOM, { IBOM } from '../models/bomModel';
import ProductVariant, { IProductVariant } from '../models/productVariantModel';
import { ImageService } from './imageService';

/**
 * BOM Service
 * Handles Bill of Materials operations and band width logic for gents rings
 */
export class BOMService {
  private imageService: ImageService;
  
  constructor() {
    this.imageService = new ImageService();
  }
  
  /**
   * Get all BOM entries for a specific category
   */
  async getBOMByCategory(category: string): Promise<IBOM[]> {
    try {
      const bomEntries = await BOM.find({ category }).lean();
      return bomEntries;
    } catch (error) {
      console.error('Error fetching BOM by category:', error);
      throw new Error('Failed to fetch BOM data');
    }
  }

  /**
   * Get BOM entries for gents rings with diamond (band width present)
   */
  async getGentsRingsWithDiamond(): Promise<IBOM[]> {
    try {
      const bomEntries = await BOM.find({
        category: 'RINGS',
        subCategory: 'Men\'s Rings',
        bandWidth: { $exists: true, $ne: null, $gt: 0 }
      }).lean();
      return bomEntries;
    } catch (error) {
      console.error('Error fetching gents rings with diamond:', error);
      throw new Error('Failed to fetch gents rings with diamond');
    }
  }

  /**
   * Get BOM entries for gents rings without diamond (band width absent)
   */
  async getGentsRingsWithoutDiamond(): Promise<IBOM[]> {
    try {
      const bomEntries = await BOM.find({
        category: 'RINGS',
        subCategory: 'Men\'s Rings',
        $or: [
          { bandWidth: { $exists: false } },
          { bandWidth: null },
          { bandWidth: 0 }
        ]
      }).lean();
      return bomEntries;
    } catch (error) {
      console.error('Error fetching gents rings without diamond:', error);
      throw new Error('Failed to fetch gents rings without diamond');
    }
  }

  /**
   * Get BOM entry by unique variant ID
   */
  async getBOMByVariantId(variantId: string): Promise<IBOM | null> {
    try {
      const bomEntry = await BOM.findOne({ uniqueVariantId: variantId }).lean();
      return bomEntry;
    } catch (error) {
      console.error('Error fetching BOM by variant ID:', error);
      throw new Error('Failed to fetch BOM entry');
    }
  }

  /**
   * Get BOM entries by product ID
   */
  async getBOMByProductId(productId: string): Promise<IBOM[]> {
    try {
      const bomEntries = await BOM.find({ productId }).lean();
      return bomEntries;
    } catch (error) {
      console.error('Error fetching BOM by product ID:', error);
      throw new Error('Failed to fetch BOM entries');
    }
  }

  /**
   * Check if a gents ring has diamond based on band width
   */
  hasDiamond(bomEntry: IBOM): boolean {
    return bomEntry.bandWidth !== undefined && 
           bomEntry.bandWidth !== null && 
           bomEntry.bandWidth > 0;
  }

  /**
   * Get view type based on category
   */
  getViewType(category: string): string {
    const viewTypeMap: { [key: string]: string } = {
      'BRACELET': 'TRV',
      'EARRINGS': 'BV',
      'PENDANT': 'BV',
      'RINGS': 'BV', // Default for rings, will be overridden for specific types
      'ENGAGEMENT RINGS': 'NBV',
      'SOLITAIRE RINGS': 'NBV'
    };

    return viewTypeMap[category] || 'BV';
  }

  /**
   * Get view type for gents rings based on diamond presence
   */
  getGentsRingViewType(hasDiamond: boolean): string {
    return hasDiamond ? 'BV' : 'BV'; // Both use BV, but we can differentiate if needed
  }

  /**
   * Create product variants from BOM data
   */
  async createProductVariantsFromBOM(): Promise<void> {
    try {
      console.log('Creating product variants from BOM data...');
      
      // Get all BOM entries
      const bomEntries = await BOM.find().lean();
      
      for (const bomEntry of bomEntries) {
        const hasDiamond = this.hasDiamond(bomEntry);
        const viewType = this.getViewType(bomEntry.category);
        
        // Create product variant
        const productVariant: Partial<IProductVariant> = {
          variantId: bomEntry.productId,
          category: bomEntry.category,
          subCategory: bomEntry.subCategory,
          stylingName: this.generateStylingName(bomEntry),
          builderView: bomEntry.uniqueVariantId,
          viewType: viewType,
          hasDiamond: hasDiamond,
          builderImage: bomEntry.uniqueVariantId,
          mainImage: this.generateImageUrl(bomEntry.uniqueVariantId, 'main'),
          thumbnailImages: this.generateThumbnailImages(bomEntry.uniqueVariantId),
          variantImages: this.generateVariantImages(bomEntry.uniqueVariantId),
          availableDiamondShapes: this.getAvailableDiamondShapes(),
          availableDiamondSizes: this.getAvailableDiamondSizes(),
          availableDiamondColors: this.getAvailableDiamondColors(),
          availableMetalTypes: this.getAvailableMetalTypes(bomEntry.metalType),
          availableMetalKt: this.getAvailableMetalKt(bomEntry.metalKt),
          availableMetalColors: this.getAvailableMetalColors(bomEntry.metalType),
          basePrice: this.calculateBasePrice(bomEntry),
          priceRange: this.calculatePriceRange(bomEntry),
          bomVariantId: bomEntry.uniqueVariantId,
          isActive: true,
          isFeatured: false
        };

        // Check if variant already exists
        const existingVariant = await ProductVariant.findOne({ 
          variantId: productVariant.variantId 
        });

        if (!existingVariant) {
          await ProductVariant.create(productVariant);
          console.log(`Created variant: ${productVariant.variantId}`);
        } else {
          console.log(`Variant already exists: ${productVariant.variantId}`);
        }
      }

      // Backfill builderImage for existing variants missing the field
      await ProductVariant.updateMany(
        { $or: [ { builderImage: { $exists: false } }, { builderImage: { $eq: '' } } ] },
        [ { $set: { builderImage: { $ifNull: ['$bomVariantId', '$builderView'] } } } ]
      );

      console.log('Product variants created and backfilled successfully');
    } catch (error) {
      console.error('Error creating product variants from BOM:', error);
      throw new Error('Failed to create product variants');
    }
  }

  /**
   * Generate styling name from BOM data
   */
  private generateStylingName(bomEntry: IBOM): string {
    // This would be mapped from your Excel data
    // For now, using a simple mapping
    const stylingMap: { [key: string]: string } = {
      'GR47': 'CLASSIC',
      'ENG1': 'NATURE INSPIRED',
      'ENG5': 'CLASSIC',
      'SR1': 'CLASSIC',
      'BR1': 'PAPPER CLIP',
      'BR2': 'TENNIS BRACELET'
    };

    return stylingMap[bomEntry.productId] || 'CLASSIC';
  }

  /**
   * Extract attributes from variant ID for image generation
   */
  private extractAttributesFromVariantId(variantId: string): any {
    // Parse the variant ID to extract attributes
    // Format: SKU-ATTRIBUTE1-ATTRIBUTE2-ATTRIBUTE3-...-VIEW
    const parts = variantId.split('-');
    const attributes: any = {};
    
    if (parts.length > 1) {
      // Extract diamond shape (usually second part)
      if (parts[1]) attributes.diamondShape = parts[1];
      
      // Extract diamond size (usually third part)
      if (parts[2]) attributes.diamondSize = parseFloat(parts[2]) || parts[2];
      
      // Extract metal type/color (usually fourth part)
      if (parts[3]) attributes.metal = parts[3];
      
      // Extract tone (usually fifth part)
      if (parts[4]) attributes.tone = parts[4];
      
      // Extract finish (usually sixth part)
      if (parts[5]) attributes.finish = parts[5];
      
      // Extract view (last part)
      if (parts[parts.length - 1]) attributes.view = parts[parts.length - 1];
    }
    
    return attributes;
  }

  /**
   * Generate image URL for variant using ImageService
   */
  private generateImageUrl(variantId: string, type: 'main' | 'thumbnail'): string {
    const attributes = this.extractAttributesFromVariantId(variantId);
    const images = this.imageService.generateImageUrls(variantId, attributes);
    return type === 'main' ? images.main : images.thumbnails[0];
  }

  /**
   * Generate thumbnail images array using ImageService
   */
  private generateThumbnailImages(variantId: string): string[] {
    const attributes = this.extractAttributesFromVariantId(variantId);
    const images = this.imageService.generateImageUrls(variantId, attributes);
    return images.thumbnails;
  }

  /**
   * Generate variant images array using ImageService
   */
  private generateVariantImages(variantId: string): string[] {
    const attributes = this.extractAttributesFromVariantId(variantId);
    const images = this.imageService.generateImageUrlsFlexible(variantId, attributes);
    return images.sub;
  }

  /**
   * Get available diamond shapes
   */
  private getAvailableDiamondShapes(): string[] {
    return ['Round', 'Princess', 'Oval', 'Pear', 'Emerald', 'Asscher', 'Cushion', 'Marquise', 'Radiant', 'Heart'];
  }

  /**
   * Get available diamond sizes
   */
  private getAvailableDiamondSizes(): number[] {
    return [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0];
  }

  /**
   * Get available diamond colors
   */
  private getAvailableDiamondColors(): string[] {
    return ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
  }

  /**
   * Get available metal types based on BOM entry
   */
  private getAvailableMetalTypes(bomMetalType: string): string[] {
    const metalTypeMap: { [key: string]: string[] } = {
      'GOLD': ['Gold', 'Rose Gold', 'White Gold'],
      'SILVER': ['Silver'],
      'PLATINUM': ['Platinum']
    };

    return metalTypeMap[bomMetalType] || ['Gold'];
  }

  /**
   * Get available metal karats based on BOM entry
   */
  private getAvailableMetalKt(bomMetalKt: string): string[] {
    if (bomMetalKt === '925') {
      return ['925'];
    }
    
    const ktMap: { [key: string]: string[] } = {
      '18kt': ['18KT', '14KT', '10KT'],
      '14kt': ['14KT', '10KT'],
      '22kt': ['22KT', '18KT', '14KT', '10KT']
    };

    return ktMap[bomMetalKt] || ['18KT', '14KT', '10KT'];
  }

  /**
   * Get available metal colors based on metal type
   */
  private getAvailableMetalColors(metalType: string): string[] {
    const colorMap: { [key: string]: string[] } = {
      'GOLD': ['Yellow Gold', 'White Gold', 'Rose Gold'],
      'SILVER': ['Silver'],
      'PLATINUM': ['Platinum']
    };

    return colorMap[metalType] || ['Yellow Gold', 'White Gold', 'Rose Gold'];
  }

  /**
   * Calculate base price from BOM data
   */
  private calculateBasePrice(bomEntry: IBOM): number {
    // This would be your actual pricing logic
    let basePrice = 1000; // Base price

    // Add metal value
    if (bomEntry.metalValue) {
      basePrice += bomEntry.metalValue;
    }

    // Add diamond value based on size and origin
    if (bomEntry.centerStoneSize) {
      const diamondMultiplier = bomEntry.diamondOrigin === 'NATURAL DIAMONDS' ? 2 : 1;
      basePrice += bomEntry.centerStoneSize * 1000 * diamondMultiplier;
    }

    return Math.round(basePrice);
  }

  /**
   * Calculate price range for customization
   */
  private calculatePriceRange(bomEntry: IBOM): { min: number; max: number } {
    const basePrice = this.calculateBasePrice(bomEntry);
    return {
      min: Math.round(basePrice * 0.8),
      max: Math.round(basePrice * 2.5)
    };
  }
}

export default BOMService;
