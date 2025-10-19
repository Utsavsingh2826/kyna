import { IProduct } from '../models/productModel';

// Pricing configuration based on BOM data
interface PricingConfig {
  // Metal pricing per gram (in INR)
  metalPricing: {
    [key: string]: {
      [karat: number]: number;
    };
  };
  
  // Diamond pricing per carat (in INR)
  diamondPricing: {
    [origin: string]: {
      [color: string]: {
        [shape: string]: number;
      };
    };
  };
  
  // Making charges per gram
  makingChargesPerGram: number;
  
  // GST percentage
  gstPercent: number;
  
  // Profit margin percentage
  profitMargin: number;
}

// Default pricing configuration (can be loaded from database or config file)
const defaultPricingConfig: PricingConfig = {
  metalPricing: {
    'Gold': {
      14: 3500,  // 14kt gold per gram
      18: 4500,  // 18kt gold per gram
      22: 5500,  // 22kt gold per gram
    },
    'Silver': {
      925: 80,   // 925 silver per gram
    },
    'Platinum': {
      950: 3500, // 950 platinum per gram
    }
  },
  
  diamondPricing: {
    'Natural Diamond': {
      'D': { 'RD': 500000, 'PR': 450000, 'EM': 400000, 'OV': 420000, 'CUS': 380000 },
      'E': { 'RD': 400000, 'PR': 360000, 'EM': 320000, 'OV': 340000, 'CUS': 300000 },
      'F': { 'RD': 350000, 'PR': 315000, 'EM': 280000, 'OV': 300000, 'CUS': 260000 },
      'G': { 'RD': 300000, 'PR': 270000, 'EM': 240000, 'OV': 255000, 'CUS': 220000 },
      'H': { 'RD': 250000, 'PR': 225000, 'EM': 200000, 'OV': 210000, 'CUS': 180000 },
      'I': { 'RD': 200000, 'PR': 180000, 'EM': 160000, 'OV': 170000, 'CUS': 145000 },
      'J': { 'RD': 150000, 'PR': 135000, 'EM': 120000, 'OV': 130000, 'CUS': 110000 },
      'K': { 'RD': 100000, 'PR': 90000, 'EM': 80000, 'OV': 85000, 'CUS': 75000 },
    },
    'Lab Grown Diamond': {
      'D': { 'RD': 50000, 'PR': 45000, 'EM': 40000, 'OV': 42000, 'CUS': 38000 },
      'E': { 'RD': 40000, 'PR': 36000, 'EM': 32000, 'OV': 34000, 'CUS': 30000 },
      'F': { 'RD': 35000, 'PR': 31500, 'EM': 28000, 'OV': 30000, 'CUS': 26000 },
      'G': { 'RD': 30000, 'PR': 27000, 'EM': 24000, 'OV': 25500, 'CUS': 22000 },
      'H': { 'RD': 25000, 'PR': 22500, 'EM': 20000, 'OV': 21000, 'CUS': 18000 },
      'I': { 'RD': 20000, 'PR': 18000, 'EM': 16000, 'OV': 17000, 'CUS': 14500 },
      'J': { 'RD': 15000, 'PR': 13500, 'EM': 12000, 'OV': 13000, 'CUS': 11000 },
      'K': { 'RD': 10000, 'PR': 9000, 'EM': 8000, 'OV': 8500, 'CUS': 7500 },
    }
  },
  
  makingChargesPerGram: 500, // Making charges per gram
  gstPercent: 3, // 3% GST as per BOM data
  profitMargin: 0.25 // 25% profit margin
};

export class PricingService {
  private config: PricingConfig;

  constructor(config?: Partial<PricingConfig>) {
    this.config = { ...defaultPricingConfig, ...config };
  }

  /**
   * Calculate dynamic price for a product based on its attributes
   */
  calculatePrice(product: IProduct, overrides?: {
    diamondSize?: number;
    metal?: string;
    karat?: number;
    diamondOrigin?: string;
    diamondShape?: string;
    diamondColor?: string;
  }): number {
    try {
      // Use overrides if provided, otherwise use product values
      const diamondSize = overrides?.diamondSize || product.diamondSize || 0;
      const metal = overrides?.metal || product.metal || 'Gold';
      const karat = overrides?.karat || product.karat || 18;
      const diamondOrigin = overrides?.diamondOrigin || product.diamondOrigin?.[0] || 'Natural Diamond';
      const diamondShape = overrides?.diamondShape || product.diamondShape || 'RD';
      const diamondColor = overrides?.diamondColor || product.diamondColor || 'G';
      const netWeight = product.netWeightGrams || 5; // Default weight if not specified

      // Calculate metal cost
      const metalCost = this.calculateMetalCost(metal, karat, netWeight);

      // Calculate diamond cost
      const diamondCost = this.calculateDiamondCost(diamondOrigin, diamondColor, diamondShape, diamondSize);

      // Calculate making charges
      const makingCharges = this.calculateMakingCharges(netWeight);

      // Calculate base cost
      const baseCost = metalCost + diamondCost + makingCharges;

      // Apply profit margin
      const priceWithMargin = baseCost * (1 + this.config.profitMargin);

      // Apply GST
      const finalPrice = priceWithMargin * (1 + this.config.gstPercent / 100);

      return Math.round(finalPrice);
    } catch (error) {
      console.error('Error calculating price:', error);
      return product.price || 0; // Fallback to stored price
    }
  }

  /**
   * Calculate metal cost based on type, karat, and weight
   */
  private calculateMetalCost(metal: string, karat: number, weight: number): number {
    const metalType = this.normalizeMetalType(metal);
    const metalPrice = this.config.metalPricing[metalType]?.[karat];
    
    if (!metalPrice) {
      console.warn(`No pricing found for metal: ${metalType}, karat: ${karat}`);
      return 0;
    }

    return metalPrice * weight;
  }

  /**
   * Calculate diamond cost based on origin, color, shape, and size
   */
  private calculateDiamondCost(origin: string, color: string, shape: string, size: number): number {
    const normalizedOrigin = this.normalizeDiamondOrigin(origin);
    const normalizedColor = this.normalizeDiamondColor(color);
    const normalizedShape = this.normalizeDiamondShape(shape);

    const diamondPrice = this.config.diamondPricing[normalizedOrigin]?.[normalizedColor]?.[normalizedShape];
    
    if (!diamondPrice) {
      console.warn(`No pricing found for diamond: ${normalizedOrigin}, ${normalizedColor}, ${normalizedShape}`);
      return 0;
    }

    return diamondPrice * size;
  }

  /**
   * Calculate making charges based on weight
   */
  private calculateMakingCharges(weight: number): number {
    return this.config.makingChargesPerGram * weight;
  }

  /**
   * Normalize metal type for pricing lookup
   */
  private normalizeMetalType(metal: string): string {
    const metalMap: { [key: string]: string } = {
      'RG': 'Gold',
      'YG': 'Gold', 
      'WG': 'Gold',
      'SLV': 'Silver',
      'PT': 'Platinum'
    };
    return metalMap[metal.toUpperCase()] || 'Gold';
  }

  /**
   * Normalize diamond origin for pricing lookup
   */
  private normalizeDiamondOrigin(origin: string): string {
    if (origin.toLowerCase().includes('lab') || origin.toLowerCase().includes('grown')) {
      return 'Lab Grown Diamond';
    }
    return 'Natural Diamond';
  }

  /**
   * Normalize diamond color for pricing lookup
   */
  private normalizeDiamondColor(color: string): string {
    // Extract color grade from color string (e.g., "EF VS" -> "E")
    const colorMatch = color.match(/^([A-Z])/);
    return colorMatch ? colorMatch[1] : 'G';
  }

  /**
   * Normalize diamond shape for pricing lookup
   */
  private normalizeDiamondShape(shape: string): string {
    const shapeMap: { [key: string]: string } = {
      'RD': 'RD',
      'ROUND': 'RD',
      'PR': 'PR', 
      'PRINCESS': 'PR',
      'EM': 'EM',
      'EMERALD': 'EM',
      'OV': 'OV',
      'OVAL': 'OV',
      'CUS': 'CUS',
      'CUSHION': 'CUS',
      'PEAR': 'PEAR',
      'MARQUISE': 'MARQUISE',
      'HEART': 'HEART'
    };
    return shapeMap[shape.toUpperCase()] || 'RD';
  }

  /**
   * Get price breakdown for transparency
   */
  getPriceBreakdown(product: IProduct, overrides?: any): {
    metalCost: number;
    diamondCost: number;
    makingCharges: number;
    baseCost: number;
    profitMargin: number;
    gst: number;
    finalPrice: number;
  } {
    const diamondSize = overrides?.diamondSize || product.diamondSize || 0;
    const metal = overrides?.metal || product.metal || 'Gold';
    const karat = overrides?.karat || product.karat || 18;
    const diamondOrigin = overrides?.diamondOrigin || product.diamondOrigin?.[0] || 'Natural Diamond';
    const diamondShape = overrides?.diamondShape || product.diamondShape || 'RD';
    const diamondColor = overrides?.diamondColor || product.diamondColor || 'G';
    const netWeight = product.netWeightGrams || 5;

    const metalCost = this.calculateMetalCost(metal, karat, netWeight);
    const diamondCost = this.calculateDiamondCost(diamondOrigin, diamondColor, diamondShape, diamondSize);
    const makingCharges = this.calculateMakingCharges(netWeight);
    const baseCost = metalCost + diamondCost + makingCharges;
    const profitMargin = baseCost * this.config.profitMargin;
    const priceWithMargin = baseCost + profitMargin;
    const gst = priceWithMargin * (this.config.gstPercent / 100);
    const finalPrice = priceWithMargin + gst;

    return {
      metalCost: Math.round(metalCost),
      diamondCost: Math.round(diamondCost),
      makingCharges: Math.round(makingCharges),
      baseCost: Math.round(baseCost),
      profitMargin: Math.round(profitMargin),
      gst: Math.round(gst),
      finalPrice: Math.round(finalPrice)
    };
  }

  /**
   * Get BOM details for price calculation
   * Returns detailed BOM information based on product attributes
   */
  getBOMDetails(product: IProduct, overrides?: any): {
    productSku: string;
    category: string;
    variant: string;
    diamondShape: string;
    diamondSize: number;
    diamondColor: string;
    diamondOrigin: string;
    metal: string;
    karat: number;
    tone: string;
    finish: string;
    netWeightGrams: number;
    metalCost: number;
    diamondCost: number;
    makingCharges: number;
    baseCost: number;
    profitMargin: number;
    gst: number;
    finalPrice: number;
    pricingBreakdown: {
      metalPricingPerGram: number;
      diamondPricingPerCarat: number;
      makingChargesPerGram: number;
      gstPercent: number;
      profitMarginPercent: number;
    };
  } {
    const diamondSize = overrides?.diamondSize || product.diamondSize || 0;
    const metal = overrides?.metal || product.metal || 'Gold';
    const karat = overrides?.karat || product.karat || 18;
    const diamondOrigin = overrides?.diamondOrigin || product.diamondOrigin?.[0] || 'Natural Diamond';
    const diamondShape = overrides?.diamondShape || product.diamondShape || 'RD';
    const diamondColor = overrides?.diamondColor || product.diamondColor || 'G';
    const netWeight = product.netWeightGrams || 5;

    // Get pricing breakdown
    const breakdown = this.getPriceBreakdown(product, overrides);
    
    // Get pricing rates
    const metalType = this.normalizeMetalType(metal);
    const normalizedOrigin = this.normalizeDiamondOrigin(diamondOrigin);
    const normalizedColor = this.normalizeDiamondColor(diamondColor);
    const normalizedShape = this.normalizeDiamondShape(diamondShape);

    const metalPricingPerGram = this.config.metalPricing[metalType]?.[karat] || 0;
    const diamondPricingPerCarat = this.config.diamondPricing[normalizedOrigin]?.[normalizedColor]?.[normalizedShape] || 0;

    return {
      productSku: product.sku || '',
      category: product.category || '',
      variant: product.variant || '',
      diamondShape,
      diamondSize,
      diamondColor,
      diamondOrigin,
      metal,
      karat,
      tone: product.tone || '2T',
      finish: product.finish || 'BR',
      netWeightGrams: netWeight,
      metalCost: breakdown.metalCost,
      diamondCost: breakdown.diamondCost,
      makingCharges: breakdown.makingCharges,
      baseCost: breakdown.baseCost,
      profitMargin: breakdown.profitMargin,
      gst: breakdown.gst,
      finalPrice: breakdown.finalPrice,
      pricingBreakdown: {
        metalPricingPerGram,
        diamondPricingPerCarat,
        makingChargesPerGram: this.config.makingChargesPerGram,
        gstPercent: this.config.gstPercent,
        profitMarginPercent: this.config.profitMargin * 100
      }
    };
  }

  /**
   * Update pricing configuration
   */
  updateConfig(newConfig: Partial<PricingConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current pricing configuration
   */
  getConfig(): PricingConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const pricingService = new PricingService();
