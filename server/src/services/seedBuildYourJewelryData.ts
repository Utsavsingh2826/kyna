import CustomizationOptions from '../models/customizationModel';
import BOM from '../models/bomModel';
import { DiamondShape, MetalType, GoldKarat, DiamondOrigin } from '../models/customizationModel';

/**
 * Seed Build Your Jewelry Data
 * This service seeds the database with initial customization options and BOM data
 */
export class SeedBuildYourJewelryData {
  
  /**
   * Seed customization options
   */
  async seedCustomizationOptions(): Promise<void> {
    try {
      console.log('Seeding customization options...');

      // Check if customization options already exist
      const existingOptions = await CustomizationOptions.findOne();
      if (existingOptions) {
        console.log('Customization options already exist, skipping...');
        return;
      }

      const customizationOptions = {
        diamondShapes: [
          { shape: DiamondShape.ROUND, isAvailable: true, priceMultiplier: 1.0 },
          { shape: DiamondShape.PRINCESS, isAvailable: true, priceMultiplier: 0.95 },
          { shape: DiamondShape.OVAL, isAvailable: true, priceMultiplier: 1.1 },
          { shape: DiamondShape.PEAR, isAvailable: true, priceMultiplier: 1.05 },
          { shape: DiamondShape.EMERALD, isAvailable: true, priceMultiplier: 0.9 },
          { shape: DiamondShape.ASSCHER, isAvailable: true, priceMultiplier: 0.9 },
          { shape: DiamondShape.CUSHION, isAvailable: true, priceMultiplier: 1.0 },
          { shape: DiamondShape.MARQUISE, isAvailable: true, priceMultiplier: 1.15 },
          { shape: DiamondShape.RADIANT, isAvailable: true, priceMultiplier: 1.05 },
          { shape: DiamondShape.HEART, isAvailable: true, priceMultiplier: 1.2 }
        ],
        diamondSizes: [
          { size: 0.25, isAvailable: true, priceMultiplier: 0.3 },
          { size: 0.5, isAvailable: true, priceMultiplier: 0.6 },
          { size: 0.75, isAvailable: true, priceMultiplier: 0.8 },
          { size: 1.0, isAvailable: true, priceMultiplier: 1.0 },
          { size: 1.25, isAvailable: true, priceMultiplier: 1.3 },
          { size: 1.5, isAvailable: true, priceMultiplier: 1.6 },
          { size: 1.75, isAvailable: true, priceMultiplier: 1.9 },
          { size: 2.0, isAvailable: true, priceMultiplier: 2.2 },
          { size: 2.5, isAvailable: true, priceMultiplier: 2.8 },
          { size: 3.0, isAvailable: true, priceMultiplier: 3.5 }
        ],
        diamondColors: [
          { color: 'D', isAvailable: true, priceMultiplier: 1.5 },
          { color: 'E', isAvailable: true, priceMultiplier: 1.4 },
          { color: 'F', isAvailable: true, priceMultiplier: 1.3 },
          { color: 'G', isAvailable: true, priceMultiplier: 1.2 },
          { color: 'H', isAvailable: true, priceMultiplier: 1.1 },
          { color: 'I', isAvailable: true, priceMultiplier: 1.0 },
          { color: 'J', isAvailable: true, priceMultiplier: 0.9 },
          { color: 'K', isAvailable: true, priceMultiplier: 0.8 },
          { color: 'L', isAvailable: true, priceMultiplier: 0.7 },
          { color: 'M', isAvailable: true, priceMultiplier: 0.6 }
        ],
        diamondClarities: [
          { clarity: 'FL', isAvailable: true, priceMultiplier: 2.0 },
          { clarity: 'IF', isAvailable: true, priceMultiplier: 1.8 },
          { clarity: 'VVS1', isAvailable: true, priceMultiplier: 1.6 },
          { clarity: 'VVS2', isAvailable: true, priceMultiplier: 1.4 },
          { clarity: 'VS1', isAvailable: true, priceMultiplier: 1.2 },
          { clarity: 'VS2', isAvailable: true, priceMultiplier: 1.1 },
          { clarity: 'SI1', isAvailable: true, priceMultiplier: 1.0 },
          { clarity: 'SI2', isAvailable: true, priceMultiplier: 0.9 },
          { clarity: 'I1', isAvailable: true, priceMultiplier: 0.7 },
          { clarity: 'I2', isAvailable: true, priceMultiplier: 0.5 }
        ],
        diamondOrigins: [
          { origin: DiamondOrigin.NATURAL, isAvailable: true, priceMultiplier: 2.0 },
          { origin: DiamondOrigin.LAB_GROWN, isAvailable: true, priceMultiplier: 1.0 }
        ],
        metalTypes: [
          { type: MetalType.GOLD, isAvailable: true, priceMultiplier: 1.0 },
          { type: MetalType.SILVER, isAvailable: true, priceMultiplier: 0.3 },
          { type: MetalType.PLATINUM, isAvailable: true, priceMultiplier: 1.5 },
          { type: MetalType.ROSE_GOLD, isAvailable: true, priceMultiplier: 1.1 },
          { type: MetalType.WHITE_GOLD, isAvailable: true, priceMultiplier: 1.05 }
        ],
        metalKt: [
          { karat: GoldKarat.K10, isAvailable: true, priceMultiplier: 0.8 },
          { karat: GoldKarat.K14, isAvailable: true, priceMultiplier: 0.9 },
          { karat: GoldKarat.K18, isAvailable: true, priceMultiplier: 1.0 },
          { karat: GoldKarat.K22, isAvailable: true, priceMultiplier: 1.2 }
        ],
        metalColors: [
          { color: 'Yellow Gold', isAvailable: true, priceMultiplier: 1.0 },
          { color: 'White Gold', isAvailable: true, priceMultiplier: 1.05 },
          { color: 'Rose Gold', isAvailable: true, priceMultiplier: 1.1 },
          { color: 'Silver', isAvailable: true, priceMultiplier: 0.3 },
          { color: 'Platinum', isAvailable: true, priceMultiplier: 1.5 }
        ],
        ringSizes: [
          { size: '5', isAvailable: true },
          { size: '5.5', isAvailable: true },
          { size: '6', isAvailable: true },
          { size: '6.5', isAvailable: true },
          { size: '7', isAvailable: true },
          { size: '7.5', isAvailable: true },
          { size: '8', isAvailable: true },
          { size: '8.5', isAvailable: true },
          { size: '9', isAvailable: true },
          { size: '9.5', isAvailable: true },
          { size: '10', isAvailable: true },
          { size: '10.5', isAvailable: true },
          { size: '11', isAvailable: true },
          { size: '11.5', isAvailable: true },
          { size: '12', isAvailable: true }
        ],
        braceletSizes: [
          { size: '6', isAvailable: true },
          { size: '6.5', isAvailable: true },
          { size: '7', isAvailable: true },
          { size: '7.5', isAvailable: true },
          { size: '8', isAvailable: true },
          { size: '8.5', isAvailable: true },
          { size: '9', isAvailable: true },
          { size: '9.5', isAvailable: true },
          { size: '10', isAvailable: true }
        ],
        necklaceLengths: [
          { length: '14', isAvailable: true },
          { length: '16', isAvailable: true },
          { length: '18', isAvailable: true },
          { length: '20', isAvailable: true },
          { length: '22', isAvailable: true },
          { length: '24', isAvailable: true },
          { length: '26', isAvailable: true },
          { length: '28', isAvailable: true },
          { length: '30', isAvailable: true }
        ],
        engraving: {
          isAvailable: true,
          maxCharacters: 15,
          pricePerCharacter: 50,
          note: 'Max 15 characters. We suggest 12 characters or less. More characters will make the font size smaller. Engraving will appear on the side of the ring on the inside.'
        }
      };

      await CustomizationOptions.create(customizationOptions);
      console.log('✅ Customization options seeded successfully');
    } catch (error) {
      console.error('❌ Error seeding customization options:', error);
      throw error;
    }
  }

  /**
   * Seed BOM data from Excel structure
   */
  async seedBOMData(): Promise<void> {
    try {
      console.log('Seeding BOM data...');

      // Check if BOM data already exists
      const existingBOM = await BOM.findOne();
      if (existingBOM) {
        console.log('BOM data already exists, skipping...');
        return;
      }

      // Sample BOM data based on the Excel structure you provided
      const bomData = [
        // Engagement Rings (ENG1-ENG50)
        { productId: 'ENG1', uniqueVariantId: 'ENG1-RD-100-WG-NBV', category: 'ENGAGEMENT RINGS', subCategory: 'Women\'s Rings', parentSku: 'ENG1', finish: 'MATT FINISH', metalType: 'GOLD', metalKt: '18kt', netWeightGrams: 4.250, diamondOrigin: 'NATURAL DIAMONDS', centerStoneSize: 1.0, centerStoneShape: 'Round' },
        { productId: 'ENG2', uniqueVariantId: 'ENG2-PR-100-WG-NBV', category: 'ENGAGEMENT RINGS', subCategory: 'Women\'s Rings', parentSku: 'ENG2', finish: 'MATT FINISH', metalType: 'GOLD', metalKt: '18kt', netWeightGrams: 4.500, diamondOrigin: 'NATURAL DIAMONDS', centerStoneSize: 1.0, centerStoneShape: 'Princess' },
        { productId: 'ENG3', uniqueVariantId: 'ENG3-OV-100-WG-NBV', category: 'ENGAGEMENT RINGS', subCategory: 'Women\'s Rings', parentSku: 'ENG3', finish: 'MATT FINISH', metalType: 'GOLD', metalKt: '18kt', netWeightGrams: 4.750, diamondOrigin: 'NATURAL DIAMONDS', centerStoneSize: 1.0, centerStoneShape: 'Oval' },
        { productId: 'ENG4', uniqueVariantId: 'ENG4-EM-100-WG-NBV', category: 'ENGAGEMENT RINGS', subCategory: 'Women\'s Rings', parentSku: 'ENG4', finish: 'MATT FINISH', metalType: 'GOLD', metalKt: '18kt', netWeightGrams: 4.300, diamondOrigin: 'NATURAL DIAMONDS', centerStoneSize: 1.0, centerStoneShape: 'Emerald' },
        { productId: 'ENG5', uniqueVariantId: 'ENG5-RD-100-WG-NBV', category: 'ENGAGEMENT RINGS', subCategory: 'Women\'s Rings', parentSku: 'ENG5', finish: 'MATT FINISH', metalType: 'GOLD', metalKt: '18kt', netWeightGrams: 4.200, diamondOrigin: 'NATURAL DIAMONDS', centerStoneSize: 1.0, centerStoneShape: 'Round' },

        // Solitaire Rings (SR1-SR20)
        { productId: 'SR1', uniqueVariantId: 'SR1-RD-100-WG-NBV', category: 'SOLITAIRE RINGS', subCategory: 'Women\'s Rings', parentSku: 'SR1', finish: 'MATT FINISH', metalType: 'GOLD', metalKt: '18kt', netWeightGrams: 3.500, diamondOrigin: 'NATURAL DIAMONDS', centerStoneSize: 1.0, centerStoneShape: 'Round' },
        { productId: 'SR2', uniqueVariantId: 'SR2-PR-100-WG-NBV', category: 'SOLITAIRE RINGS', subCategory: 'Women\'s Rings', parentSku: 'SR2', finish: 'MATT FINISH', metalType: 'GOLD', metalKt: '18kt', netWeightGrams: 3.750, diamondOrigin: 'NATURAL DIAMONDS', centerStoneSize: 1.0, centerStoneShape: 'Princess' },
        { productId: 'SR3', uniqueVariantId: 'SR3-OV-100-WG-NBV', category: 'SOLITAIRE RINGS', subCategory: 'Women\'s Rings', parentSku: 'SR3', finish: 'MATT FINISH', metalType: 'GOLD', metalKt: '18kt', netWeightGrams: 3.600, diamondOrigin: 'NATURAL DIAMONDS', centerStoneSize: 1.0, centerStoneShape: 'Oval' },

        // Gents Rings with Diamond (band width present)
        { productId: 'GR1', uniqueVariantId: 'GR1-RD-100-WG-BV', category: 'RINGS', subCategory: 'Men\'s Rings', parentSku: 'GR1', bandWidth: 7, finish: 'MATT FINISH', metalType: 'GOLD', metalKt: '18kt', netWeightGrams: 8.500, diamondOrigin: 'NATURAL DIAMONDS', centerStoneSize: 1.0, centerStoneShape: 'Round' },
        { productId: 'GR2', uniqueVariantId: 'GR2-PR-100-WG-BV', category: 'RINGS', subCategory: 'Men\'s Rings', parentSku: 'GR2', bandWidth: 8, finish: 'MATT FINISH', metalType: 'GOLD', metalKt: '18kt', netWeightGrams: 9.200, diamondOrigin: 'NATURAL DIAMONDS', centerStoneSize: 1.0, centerStoneShape: 'Princess' },
        { productId: 'GR3', uniqueVariantId: 'GR3-OV-100-WG-BV', category: 'RINGS', subCategory: 'Men\'s Rings', parentSku: 'GR3', bandWidth: 6, finish: 'MATT FINISH', metalType: 'GOLD', metalKt: '18kt', netWeightGrams: 7.800, diamondOrigin: 'NATURAL DIAMONDS', centerStoneSize: 1.0, centerStoneShape: 'Oval' },

        // Gents Rings without Diamond (band width absent)
        { productId: 'GR4', uniqueVariantId: 'GR4-WG-BV', category: 'RINGS', subCategory: 'Men\'s Rings', parentSku: 'GR4', finish: 'MATT FINISH', metalType: 'GOLD', metalKt: '18kt', netWeightGrams: 6.500, diamondOrigin: 'NATURAL DIAMONDS' },
        { productId: 'GR5', uniqueVariantId: 'GR5-WG-BV', category: 'RINGS', subCategory: 'Men\'s Rings', parentSku: 'GR5', finish: 'MATT FINISH', metalType: 'GOLD', metalKt: '14kt', netWeightGrams: 5.800, diamondOrigin: 'NATURAL DIAMONDS' },
        { productId: 'GR6', uniqueVariantId: 'GR6-WG-BV', category: 'RINGS', subCategory: 'Men\'s Rings', parentSku: 'GR6', finish: 'MATT FINISH', metalType: 'SILVER', metalKt: '925', netWeightGrams: 4.200, diamondOrigin: 'NATURAL DIAMONDS' },

        // Bracelets
        { productId: 'BR1', uniqueVariantId: 'BR1-RD-025-WG-TRV', category: 'BRACELET', subCategory: 'Women\'s Bracelets', parentSku: 'BR1', finish: 'MATT FINISH', metalType: 'GOLD', metalKt: '18kt', netWeightGrams: 12.500, diamondOrigin: 'NATURAL DIAMONDS', centerStoneSize: 0.25, centerStoneShape: 'Round' },
        { productId: 'BR2', uniqueVariantId: 'BR2-EM-025-WG-TRV', category: 'BRACELET', subCategory: 'Women\'s Bracelets', parentSku: 'BR2', finish: 'MATT FINISH', metalType: 'GOLD', metalKt: '18kt', netWeightGrams: 15.200, diamondOrigin: 'NATURAL DIAMONDS', centerStoneSize: 0.25, centerStoneShape: 'Emerald' },

        // Earrings
        { productId: 'ER1', uniqueVariantId: 'ER1-RD-100-WG-BV', category: 'EARRINGS', subCategory: 'Women\'s Earrings', parentSku: 'ER1', finish: 'MATT FINISH', metalType: 'GOLD', metalKt: '18kt', netWeightGrams: 3.200, diamondOrigin: 'NATURAL DIAMONDS', centerStoneSize: 1.0, centerStoneShape: 'Round' },
        { productId: 'ER2', uniqueVariantId: 'ER2-PR-100-WG-BV', category: 'EARRINGS', subCategory: 'Women\'s Earrings', parentSku: 'ER2', finish: 'MATT FINISH', metalType: 'GOLD', metalKt: '18kt', netWeightGrams: 3.500, diamondOrigin: 'NATURAL DIAMONDS', centerStoneSize: 1.0, centerStoneShape: 'Princess' },

        // Pendants
        { productId: 'PD1', uniqueVariantId: 'PD1-RD-100-WG-BV', category: 'PENDANT', subCategory: 'Women\'s Pendants', parentSku: 'PD1', finish: 'MATT FINISH', metalType: 'GOLD', metalKt: '18kt', netWeightGrams: 2.800, diamondOrigin: 'NATURAL DIAMONDS', centerStoneSize: 1.0, centerStoneShape: 'Round' },
        { productId: 'PD2', uniqueVariantId: 'PD2-OV-100-WG-BV', category: 'PENDANT', subCategory: 'Women\'s Pendants', parentSku: 'PD2', finish: 'MATT FINISH', metalType: 'GOLD', metalKt: '18kt', netWeightGrams: 3.100, diamondOrigin: 'NATURAL DIAMONDS', centerStoneSize: 1.0, centerStoneShape: 'Oval' }
      ];

      await BOM.insertMany(bomData);
      console.log('✅ BOM data seeded successfully');
    } catch (error) {
      console.error('❌ Error seeding BOM data:', error);
      throw error;
    }
  }

  /**
   * Seed all build your jewelry data
   */
  async seedAllData(): Promise<void> {
    try {
      console.log('Starting to seed Build Your Jewelry data...');
      
      await this.seedCustomizationOptions();
      await this.seedBOMData();
      
      console.log('✅ All Build Your Jewelry data seeded successfully');
    } catch (error) {
      console.error('❌ Error seeding Build Your Jewelry data:', error);
      throw error;
    }
  }
}

export default SeedBuildYourJewelryData;
