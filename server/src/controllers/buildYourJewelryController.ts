import { Request, Response } from 'express';
import ProductVariant from '../models/productVariantModel';
import BOM from '../models/bomModel';
import CustomizationOptions from '../models/customizationModel';
import BOMService from '../services/bomService';
import { ImageService } from '../services/imageService';

/**
 * Build Your Jewelry Controller
 * Handles all the "Build Your Jewelry" functionality
 */
export class BuildYourJewelryController {
  private bomService: BOMService;
  private imageService: ImageService;

  constructor() {
    this.bomService = new BOMService();
    this.imageService = new ImageService();
  }

  /**
   * Get all jewelry categories with their variants
   */
  public getJewelryCategories = async (req: Request, res: Response) => {
    try {
      const categories = await ProductVariant.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            variants: {
              $push: {
                variantId: '$variantId',
                stylingName: '$stylingName',
                mainImage: '$mainImage',
                basePrice: '$basePrice',
                viewType: '$viewType'
              }
            }
          }
        },
        {
          $project: {
            category: '$_id',
            count: 1,
            variants: 1,
            _id: 0
          }
        },
        {
          $sort: { category: 1 }
        }
      ]);

      res.json({
        success: true,
        message: 'Jewelry categories fetched successfully',
        data: categories
      });
    } catch (error) {
      console.error('Error fetching jewelry categories:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch jewelry categories',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get product variants by category
   */
  public getVariantsByCategory = async (req: Request, res: Response) => {
    try {
      const { category } = req.params;
      const { withDiamond } = req.query;

      let query: any = { 
        category: category.toUpperCase(),
        isActive: true 
      };

      // Special handling for gents rings
      if (category.toLowerCase() === 'gents rings' || category.toLowerCase() === 'rings') {
        if (withDiamond === 'true') {
          query.hasDiamond = true;
        } else if (withDiamond === 'false') {
          query.hasDiamond = false;
        }
        // If withDiamond is not specified, show with diamond by default
        if (withDiamond === undefined) {
          query.hasDiamond = true;
        }
      }

      const variants = await ProductVariant.find(query)
        .select('variantId stylingName mainImage thumbnailImages basePrice priceRange viewType hasDiamond')
        .sort({ variantId: 1 });

      res.json({
        success: true,
        message: `Product variants for ${category} fetched successfully`,
        data: {
          category,
          count: variants.length,
          variants
        }
      });
    } catch (error) {
      console.error('Error fetching variants by category:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch product variants',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get specific variant details
   */
  public getVariantDetails = async (req: Request, res: Response) => {
    try {
      const { variantId } = req.params;

      const variant = await ProductVariant.findOne({ 
        variantId,
        isActive: true 
      });

      if (!variant) {
        return res.status(404).json({
          success: false,
          message: 'Product variant not found'
        });
      }

      // Get BOM details if available
      let bomDetails = null;
      if (variant.bomVariantId) {
        bomDetails = await this.bomService.getBOMByVariantId(variant.bomVariantId);
      }

      res.json({
        success: true,
        message: 'Variant details fetched successfully',
        data: {
          variant,
          bomDetails
        }
      });
    } catch (error) {
      console.error('Error fetching variant details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch variant details',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get customization options for a variant
   */
  public getCustomizationOptions = async (req: Request, res: Response) => {
    try {
      const { variantId } = req.params;

      const variant = await ProductVariant.findOne({ 
        variantId,
        isActive: true 
      });

      if (!variant) {
        return res.status(404).json({
          success: false,
          message: 'Product variant not found'
        });
      }

      // Get customization options
      const customizationOptions = await CustomizationOptions.findOne()
        .sort({ createdAt: -1 });

      if (!customizationOptions) {
        return res.status(404).json({
          success: false,
          message: 'Customization options not found'
        });
      }

      // Filter options based on variant capabilities
      const filteredOptions = {
        diamondShapes: variant.availableDiamondShapes.length > 0 ? 
          customizationOptions.diamondShapes.filter(shape => 
            variant.availableDiamondShapes.includes(shape.shape)
          ) : [],
        diamondSizes: variant.availableDiamondSizes.length > 0 ?
          customizationOptions.diamondSizes.filter(size =>
            variant.availableDiamondSizes.includes(size.size)
          ) : [],
        diamondColors: variant.availableDiamondColors.length > 0 ?
          customizationOptions.diamondColors.filter(color =>
            variant.availableDiamondColors.includes(color.color)
          ) : [],
        diamondClarities: customizationOptions.diamondClarities,
        diamondOrigins: customizationOptions.diamondOrigins,
        metalTypes: variant.availableMetalTypes.length > 0 ?
          customizationOptions.metalTypes.filter(type =>
            variant.availableMetalTypes.includes(type.type)
          ) : [],
        metalKt: variant.availableMetalKt.length > 0 ?
          customizationOptions.metalKt.filter(kt =>
            variant.availableMetalKt.includes(kt.karat)
          ) : [],
        metalColors: variant.availableMetalColors.length > 0 ?
          customizationOptions.metalColors.filter(color =>
            variant.availableMetalColors.includes(color.color)
          ) : [],
        ringSizes: customizationOptions.ringSizes,
        braceletSizes: customizationOptions.braceletSizes,
        necklaceLengths: customizationOptions.necklaceLengths,
        engraving: customizationOptions.engraving
      };

      res.json({
        success: true,
        message: 'Customization options fetched successfully',
        data: {
          variantId,
          customizationOptions: filteredOptions
        }
      });
    } catch (error) {
      console.error('Error fetching customization options:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch customization options',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Calculate price for customized jewelry
   */
  public calculateCustomizedPrice = async (req: Request, res: Response) => {
    try {
      const { variantId } = req.params;
      const {
        diamondShape,
        diamondSize,
        diamondColor,
        diamondClarity,
        diamondOrigin,
        metalType,
        metalKt,
        metalColor,
        ringSize,
        braceletSize,
        necklaceLength,
        engraving
      } = req.body;

      const variant = await ProductVariant.findOne({ 
        variantId,
        isActive: true 
      });

      if (!variant) {
        return res.status(404).json({
          success: false,
          message: 'Product variant not found'
        });
      }

      // Get customization options for price calculation
      const customizationOptions = await CustomizationOptions.findOne()
        .sort({ createdAt: -1 });

      if (!customizationOptions) {
        return res.status(404).json({
          success: false,
          message: 'Customization options not found'
        });
      }

      let totalPrice = variant.basePrice;

      // Calculate diamond price
      if (diamondShape && diamondSize) {
        const shapeOption = customizationOptions.diamondShapes.find(s => s.shape === diamondShape);
        const sizeOption = customizationOptions.diamondSizes.find(s => s.size === diamondSize);
        
        if (shapeOption && sizeOption) {
          totalPrice *= (shapeOption.priceMultiplier || 1) * (sizeOption.priceMultiplier || 1);
        }
      }

      // Calculate metal price
      if (metalType && metalKt) {
        const metalTypeOption = customizationOptions.metalTypes.find(m => m.type === metalType);
        const metalKtOption = customizationOptions.metalKt.find(k => k.karat === metalKt);
        
        if (metalTypeOption && metalKtOption) {
          totalPrice *= (metalTypeOption.priceMultiplier || 1) * (metalKtOption.priceMultiplier || 1);
        }
      }

      // Add engraving cost
      if (engraving && customizationOptions.engraving.isAvailable) {
        const engravingCost = engraving.length * (customizationOptions.engraving.pricePerCharacter || 0);
        totalPrice += engravingCost;
      }

      res.json({
        success: true,
        message: 'Price calculated successfully',
        data: {
          variantId,
          basePrice: variant.basePrice,
          customizedPrice: Math.round(totalPrice),
          priceBreakdown: {
            basePrice: variant.basePrice,
            diamondUpgrade: totalPrice - variant.basePrice,
            engravingCost: engraving ? engraving.length * (customizationOptions.engraving.pricePerCharacter || 0) : 0
          }
        }
      });
    } catch (error) {
      console.error('Error calculating customized price:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate price',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get gents rings with diamond option
   */
  public getGentsRingsWithDiamond = async (req: Request, res: Response) => {
    try {
      const variants = await ProductVariant.find({
        category: 'RINGS',
        subCategory: 'Men\'s Rings',
        hasDiamond: true,
        isActive: true
      }).select('variantId stylingName mainImage thumbnailImages basePrice priceRange viewType');

      res.json({
        success: true,
        message: 'Gents rings with diamond fetched successfully',
        data: {
          category: 'Gents Rings',
          type: 'with_diamond',
          count: variants.length,
          variants
        }
      });
    } catch (error) {
      console.error('Error fetching gents rings with diamond:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch gents rings with diamond',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get gents rings without diamond option
   */
  public getGentsRingsWithoutDiamond = async (req: Request, res: Response) => {
    try {
      const variants = await ProductVariant.find({
        category: 'RINGS',
        subCategory: 'Men\'s Rings',
        hasDiamond: false,
        isActive: true
      }).select('variantId stylingName mainImage thumbnailImages basePrice priceRange viewType');

      res.json({
        success: true,
        message: 'Gents rings without diamond fetched successfully',
        data: {
          category: 'Gents Rings',
          type: 'without_diamond',
          count: variants.length,
          variants
        }
      });
    } catch (error) {
      console.error('Error fetching gents rings without diamond:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch gents rings without diamond',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Initialize BOM data and create product variants
   */
  public initializeBOMData = async (req: Request, res: Response) => {
    try {
      await this.bomService.createProductVariantsFromBOM();
      
      res.json({
        success: true,
        message: 'BOM data initialized and product variants created successfully'
      });
    } catch (error) {
      console.error('Error initializing BOM data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to initialize BOM data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get all available view types
   */
  public getViewTypes = async (req: Request, res: Response) => {
    try {
      const viewTypes = {
        'BRACELET': 'TRV',
        'EARRINGS': 'BV',
        'PENDANT': 'BV',
        'GENTS RINGS': 'BV',
        'ENGAGEMENT RINGS': 'NBV',
        'SOLITAIRE RINGS': 'NBV'
      };

      res.json({
        success: true,
        message: 'View types fetched successfully',
        data: viewTypes
      });
    } catch (error) {
      console.error('Error fetching view types:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch view types',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get variant images with custom attributes
   */
  public getVariantImages = async (req: Request, res: Response) => {
    try {
      const { variantId } = req.params;
      const queryParams = req.query;

      // Build attributes object from query parameters
      const attributes: { [key: string]: string | number } = {};
      
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

      // Generate images using ImageService
      const images = this.imageService.generateImageUrlsFlexible(variantId, attributes);

      res.json({
        success: true,
        message: 'Variant images generated successfully',
        data: {
          variantId,
          images,
          imageNamingConvention: {
            format: 'SKU-ATTRIBUTE1-ATTRIBUTE2-ATTRIBUTE3-...-VIEW',
            description: 'Dynamically concatenates SKU with any combination of product attributes',
            examples: {
              'Gents Ring': 'GR1-RD-70-2T-BR-RG-GP',
              'Engagement Ring': 'ENG1-PR-100-1T-WG-GP',
              'Solitaire Ring': 'SR1-OV-50-1T-YG-GP',
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
      console.error('Error generating variant images:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate variant images',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get variant images with basic view (for listing)
   */
  public getVariantBasicImages = async (req: Request, res: Response) => {
    try {
      const { variantId } = req.params;

      // Generate basic images using ImageService
      const images = this.imageService.generateImageUrls(variantId, {});

      res.json({
        success: true,
        message: 'Variant basic images generated successfully',
        data: {
          variantId,
          images
        }
      });
    } catch (error) {
      console.error('Error generating variant basic images:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate variant basic images',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}

export default BuildYourJewelryController;
