import SubProduct from '../models/subProductModel';
import ProductVariant from '../models/productVariantModel';
import { ImageService } from './imageService';

const imageService = new ImageService();

export const subProductSeedData = [
  // Fashion Rings
  {
    subProductId: 'FASHION_RINGS',
    category: 'RINGS',
    subCategory: 'FASHION_RINGS',
    displayName: 'Fashion Rings',
    description: 'Discover our exquisite collection of fashion rings that blend contemporary design with timeless elegance. Perfect for everyday wear and special occasions.',
    shortDescription: 'Contemporary fashion rings for every style and occasion',
    slug: 'fashion-rings',
    heroImage: 'https://kynajewels.com/images/RENDERING PHOTOS/FASHION RINGS/FR1-50/FR1-RD-100-WG-NBV.jpg',
    bannerImage: 'https://kynajewels.com/images/RENDERING PHOTOS/FASHION RINGS/banner.jpg',
    galleryImages: [
      'https://kynajewels.com/images/RENDERING PHOTOS/FASHION RINGS/FR1-50/FR1-RD-100-WG-NBV.jpg',
      'https://kynajewels.com/images/RENDERING PHOTOS/FASHION RINGS/FR1-50/FR1-RD-100-WG-TRV.jpg',
      'https://kynajewels.com/images/RENDERING PHOTOS/FASHION RINGS/FR1-50/FR1-RD-100-WG-BV.jpg'
    ],
    productVariants: ['FR1', 'FR2', 'FR3', 'FR4', 'FR5', 'FR6', 'FR7', 'FR8', 'FR9', 'FR10'],
    featuredVariants: ['FR1', 'FR2', 'FR3', 'FR4'],
    viewType: 'NBV',
    tags: ['fashion', 'rings', 'contemporary', 'elegant', 'everyday'],
    priceRange: { min: 15000, max: 75000 },
    availableDiamondShapes: ['RD', 'PR', 'EM', 'OV', 'CU', 'AS', 'MQ', 'PE', 'HS'],
    availableDiamondSizes: [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0],
    availableMetalTypes: ['Gold', 'Silver', 'Platinum'],
    availableMetalColors: ['Yellow Gold', 'White Gold', 'Rose Gold', 'Silver', 'Platinum'],
    metaTitle: 'Fashion Rings - Contemporary Jewelry Collection | Kyna Jewels',
    metaDescription: 'Explore our stunning collection of fashion rings. Contemporary designs, premium materials, and exceptional craftsmanship.',
    keywords: ['fashion rings', 'contemporary jewelry', 'designer rings', 'premium rings'],
    isActive: true,
    isFeatured: true,
    sortOrder: 1,
    displayPriority: 'high',
    productCount: 10,
    viewCount: 0
  },

  // Gents Rings with Diamond
  {
    subProductId: 'GENTS_RINGS_WITH_DIAMOND',
    category: 'RINGS',
    subCategory: 'GENTS_RINGS',
    displayName: 'Gents Rings with Diamond',
    description: 'Sophisticated men\'s rings featuring premium diamonds and precious metals. Designed for the modern gentleman who appreciates quality and style.',
    shortDescription: 'Premium men\'s rings with diamonds for the sophisticated gentleman',
    slug: 'gents-rings-with-diamond',
    heroImage: 'https://kynajewels.com/images/RENDERING PHOTOS/GENTS RINGS/GR1-3-4-5-47-37-46-12-14-22-IMG-GLB/GR1-RD-70-2T-BR-RG-45.jpg',
    bannerImage: 'https://kynajewels.com/images/RENDERING PHOTOS/GENTS RINGS/banner.jpg',
    galleryImages: [
      'https://kynajewels.com/images/RENDERING PHOTOS/GENTS RINGS/GR1-3-4-5-47-37-46-12-14-22-IMG-GLB/GR1-RD-70-2T-BR-RG-45.jpg',
      'https://kynajewels.com/images/RENDERING PHOTOS/GENTS RINGS/GR1-3-4-5-47-37-46-12-14-22-IMG-GLB/GR1-RD-70-2T-BR-RG-45.jpg'
    ],
    productVariants: ['GR1', 'GR2', 'GR3', 'GR4', 'GR5', 'GR6', 'GR7', 'GR8', 'GR9', 'GR10'],
    featuredVariants: ['GR1', 'GR2', 'GR3', 'GR4'],
    viewType: 'TRV',
    tags: ['gents', 'men', 'rings', 'diamond', 'sophisticated', 'premium'],
    priceRange: { min: 25000, max: 150000 },
    availableDiamondShapes: ['RD', 'PR', 'EM', 'OV', 'CU', 'AS'],
    availableDiamondSizes: [0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0],
    availableMetalTypes: ['Gold', 'Platinum'],
    availableMetalColors: ['Yellow Gold', 'White Gold', 'Rose Gold', 'Platinum'],
    metaTitle: 'Gents Rings with Diamond - Premium Men\'s Jewelry | Kyna Jewels',
    metaDescription: 'Discover our collection of sophisticated men\'s rings with diamonds. Premium quality, elegant designs for the modern gentleman.',
    keywords: ['gents rings', 'men rings', 'diamond rings', 'premium jewelry', 'mens fashion'],
    isActive: true,
    isFeatured: true,
    sortOrder: 2,
    displayPriority: 'high',
    productCount: 10,
    viewCount: 0
  },

  // Engagement Rings
  {
    subProductId: 'ENGAGEMENT_RINGS',
    category: 'RINGS',
    subCategory: 'ENGAGEMENT_RINGS',
    displayName: 'Engagement Rings',
    description: 'Celebrate your love with our stunning collection of engagement rings. Each piece is crafted with precision and designed to symbolize your unique bond.',
    shortDescription: 'Exquisite engagement rings to celebrate your special moment',
    slug: 'engagement-rings',
    heroImage: 'https://kynajewels.com/images/RENDERING PHOTOS/SOLITAIRE RINGS and ENGAGEMENT RINGS/ENG1-10/ENG1-RD-100-WG-NBV.jpg',
    bannerImage: 'https://kynajewels.com/images/RENDERING PHOTOS/SOLITAIRE RINGS and ENGAGEMENT RINGS/banner.jpg',
    galleryImages: [
      'https://kynajewels.com/images/RENDERING PHOTOS/SOLITAIRE RINGS and ENGAGEMENT RINGS/ENG1-10/ENG1-RD-100-WG-NBV.jpg',
      'https://kynajewels.com/images/RENDERING PHOTOS/SOLITAIRE RINGS and ENGAGEMENT RINGS/ENG1-10/ENG1-RD-100-WG-TRV.jpg',
      'https://kynajewels.com/images/RENDERING PHOTOS/SOLITAIRE RINGS and ENGAGEMENT RINGS/ENG1-10/ENG1-RD-100-WG-BV.jpg'
    ],
    productVariants: ['ENG1', 'ENG2', 'ENG3', 'ENG4', 'ENG5', 'ENG6', 'ENG7', 'ENG8', 'ENG9', 'ENG10'],
    featuredVariants: ['ENG1', 'ENG2', 'ENG3', 'ENG4'],
    viewType: 'NBV',
    tags: ['engagement', 'rings', 'love', 'romantic', 'special', 'proposal'],
    priceRange: { min: 50000, max: 500000 },
    availableDiamondShapes: ['RD', 'PR', 'EM', 'OV', 'CU', 'AS', 'MQ', 'PE', 'HS'],
    availableDiamondSizes: [0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0],
    availableMetalTypes: ['Gold', 'Platinum'],
    availableMetalColors: ['Yellow Gold', 'White Gold', 'Rose Gold', 'Platinum'],
    metaTitle: 'Engagement Rings - Exquisite Diamond Rings | Kyna Jewels',
    metaDescription: 'Find the perfect engagement ring for your special moment. Premium diamonds, elegant designs, and exceptional craftsmanship.',
    keywords: ['engagement rings', 'diamond rings', 'proposal rings', 'wedding rings', 'romantic jewelry'],
    isActive: true,
    isFeatured: true,
    sortOrder: 3,
    displayPriority: 'high',
    productCount: 10,
    viewCount: 0
  },

  // Solitaire Rings
  {
    subProductId: 'SOLITAIRE_RINGS',
    category: 'RINGS',
    subCategory: 'SOLITAIRE_RINGS',
    displayName: 'Solitaire Rings',
    description: 'Classic solitaire rings featuring a single, stunning diamond. Timeless elegance that never goes out of style.',
    shortDescription: 'Classic solitaire rings with single stunning diamonds',
    slug: 'solitaire-rings',
    heroImage: 'https://kynajewels.com/images/RENDERING PHOTOS/SOLITAIRE RINGS and ENGAGEMENT RINGS/SR1-10/SR1-RD-100-WG-NBV.jpg',
    bannerImage: 'https://kynajewels.com/images/RENDERING PHOTOS/SOLITAIRE RINGS and ENGAGEMENT RINGS/banner.jpg',
    galleryImages: [
      'https://kynajewels.com/images/RENDERING PHOTOS/SOLITAIRE RINGS and ENGAGEMENT RINGS/SR1-10/SR1-RD-100-WG-NBV.jpg',
      'https://kynajewels.com/images/RENDERING PHOTOS/SOLITAIRE RINGS and ENGAGEMENT RINGS/SR1-10/SR1-RD-100-WG-TRV.jpg',
      'https://kynajewels.com/images/RENDERING PHOTOS/SOLITAIRE RINGS and ENGAGEMENT RINGS/SR1-10/SR1-RD-100-WG-BV.jpg'
    ],
    productVariants: ['SR1', 'SR2', 'SR3', 'SR4', 'SR5', 'SR6', 'SR7', 'SR8', 'SR9', 'SR10'],
    featuredVariants: ['SR1', 'SR2', 'SR3', 'SR4'],
    viewType: 'NBV',
    tags: ['solitaire', 'rings', 'classic', 'elegant', 'timeless', 'diamond'],
    priceRange: { min: 30000, max: 300000 },
    availableDiamondShapes: ['RD', 'PR', 'EM', 'OV', 'CU', 'AS'],
    availableDiamondSizes: [0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0],
    availableMetalTypes: ['Gold', 'Platinum'],
    availableMetalColors: ['Yellow Gold', 'White Gold', 'Rose Gold', 'Platinum'],
    metaTitle: 'Solitaire Rings - Classic Diamond Rings | Kyna Jewels',
    metaDescription: 'Discover our collection of classic solitaire rings. Single stunning diamonds in elegant settings.',
    keywords: ['solitaire rings', 'diamond rings', 'classic rings', 'elegant jewelry', 'timeless design'],
    isActive: true,
    isFeatured: true,
    sortOrder: 4,
    displayPriority: 'high',
    productCount: 10,
    viewCount: 0
  },

  // Bracelets
  {
    subProductId: 'BRACELETS',
    category: 'BRACELETS',
    subCategory: 'ALL_BRACELETS',
    displayName: 'Bracelets',
    description: 'Adorn your wrist with our beautiful collection of bracelets. From delicate chains to statement pieces, find the perfect bracelet for any occasion.',
    shortDescription: 'Beautiful bracelets for every style and occasion',
    slug: 'bracelets',
    heroImage: 'https://kynajewels.com/images/RENDERING PHOTOS/BRACELETS/ALL BRACELETS/BR1-RD-025-WG-TRV.jpg',
    bannerImage: 'https://kynajewels.com/images/RENDERING PHOTOS/BRACELETS/banner.jpg',
    galleryImages: [
      'https://kynajewels.com/images/RENDERING PHOTOS/BRACELETS/ALL BRACELETS/BR1-RD-025-WG-TRV.jpg',
      'https://kynajewels.com/images/RENDERING PHOTOS/BRACELETS/ALL BRACELETS/BR1-RD-025-WG-BV.jpg',
      'https://kynajewels.com/images/RENDERING PHOTOS/BRACELETS/ALL BRACELETS/BR1-RD-025-WG-NBV.jpg'
    ],
    productVariants: ['BR1', 'BR2', 'BR3', 'BR4', 'BR5', 'BR6', 'BR7', 'BR8', 'BR9', 'BR10'],
    featuredVariants: ['BR1', 'BR2', 'BR3', 'BR4'],
    viewType: 'TRV',
    tags: ['bracelets', 'wrist', 'jewelry', 'elegant', 'delicate', 'statement'],
    priceRange: { min: 10000, max: 100000 },
    availableDiamondShapes: ['RD', 'PR', 'EM', 'OV', 'CU', 'AS', 'MQ', 'PE', 'HS'],
    availableDiamondSizes: [0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.75, 1.0],
    availableMetalTypes: ['Gold', 'Silver', 'Platinum'],
    availableMetalColors: ['Yellow Gold', 'White Gold', 'Rose Gold', 'Silver', 'Platinum'],
    metaTitle: 'Bracelets - Beautiful Wrist Jewelry | Kyna Jewels',
    metaDescription: 'Explore our stunning collection of bracelets. From delicate chains to statement pieces, perfect for any occasion.',
    keywords: ['bracelets', 'wrist jewelry', 'chain bracelets', 'diamond bracelets', 'elegant accessories'],
    isActive: true,
    isFeatured: true,
    sortOrder: 5,
    displayPriority: 'high',
    productCount: 10,
    viewCount: 0
  },

  // Earrings
  {
    subProductId: 'EARRINGS',
    category: 'EARRINGS',
    subCategory: 'ALL_EARRINGS',
    displayName: 'Earrings',
    description: 'Frame your face with our exquisite collection of earrings. From studs to drops, find the perfect pair to complement your style.',
    shortDescription: 'Exquisite earrings to frame your face beautifully',
    slug: 'earrings',
    heroImage: 'https://kynajewels.com/images/RENDERING PHOTOS/EARINGS/ER1-50/ER66-EM-05-WG-AV.jpg',
    bannerImage: 'https://kynajewels.com/images/RENDERING PHOTOS/EARINGS/banner.jpg',
    galleryImages: [
      'https://kynajewels.com/images/RENDERING PHOTOS/EARINGS/ER1-50/ER66-EM-05-WG-AV.jpg',
      'https://kynajewels.com/images/RENDERING PHOTOS/EARINGS/ER1-50/ER66-EM-05-WG-SIDE.jpg',
      'https://kynajewels.com/images/RENDERING PHOTOS/EARINGS/ER1-50/ER66-EM-05-WG-BACK.jpg'
    ],
    productVariants: ['ER1', 'ER2', 'ER3', 'ER4', 'ER5', 'ER6', 'ER7', 'ER8', 'ER9', 'ER10'],
    featuredVariants: ['ER1', 'ER2', 'ER3', 'ER4'],
    viewType: 'AV',
    tags: ['earrings', 'studs', 'drops', 'hoops', 'elegant', 'face'],
    priceRange: { min: 8000, max: 80000 },
    availableDiamondShapes: ['RD', 'PR', 'EM', 'OV', 'CU', 'AS', 'MQ', 'PE', 'HS'],
    availableDiamondSizes: [0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.75, 1.0],
    availableMetalTypes: ['Gold', 'Silver', 'Platinum'],
    availableMetalColors: ['Yellow Gold', 'White Gold', 'Rose Gold', 'Silver', 'Platinum'],
    metaTitle: 'Earrings - Exquisite Face Jewelry | Kyna Jewels',
    metaDescription: 'Discover our beautiful collection of earrings. From studs to drops, find the perfect pair for any occasion.',
    keywords: ['earrings', 'stud earrings', 'drop earrings', 'hoop earrings', 'face jewelry'],
    isActive: true,
    isFeatured: true,
    sortOrder: 6,
    displayPriority: 'high',
    productCount: 10,
    viewCount: 0
  },

  // Pendants
  {
    subProductId: 'PENDANTS',
    category: 'PENDANTS',
    subCategory: 'ALL_PENDANTS',
    displayName: 'Pendants',
    description: 'Add a touch of elegance with our stunning pendant collection. Perfect for layering or wearing alone as a statement piece.',
    shortDescription: 'Elegant pendants to add sophistication to any look',
    slug: 'pendants',
    heroImage: 'https://kynajewels.com/images/RENDERING PHOTOS/PENDANTS/PD1-RD-100-WG-NBV.jpg',
    bannerImage: 'https://kynajewels.com/images/RENDERING PHOTOS/PENDANTS/banner.jpg',
    galleryImages: [
      'https://kynajewels.com/images/RENDERING PHOTOS/PENDANTS/PD1-RD-100-WG-NBV.jpg',
      'https://kynajewels.com/images/RENDERING PHOTOS/PENDANTS/PD1-RD-100-WG-TRV.jpg',
      'https://kynajewels.com/images/RENDERING PHOTOS/PENDANTS/PD1-RD-100-WG-BV.jpg'
    ],
    productVariants: ['PD1', 'PD2', 'PD3', 'PD4', 'PD5', 'PD6', 'PD7', 'PD8', 'PD9', 'PD10'],
    featuredVariants: ['PD1', 'PD2', 'PD3', 'PD4'],
    viewType: 'NBV',
    tags: ['pendants', 'necklace', 'elegant', 'layering', 'statement', 'sophisticated'],
    priceRange: { min: 12000, max: 120000 },
    availableDiamondShapes: ['RD', 'PR', 'EM', 'OV', 'CU', 'AS', 'MQ', 'PE', 'HS'],
    availableDiamondSizes: [0.2, 0.25, 0.3, 0.4, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0],
    availableMetalTypes: ['Gold', 'Silver', 'Platinum'],
    availableMetalColors: ['Yellow Gold', 'White Gold', 'Rose Gold', 'Silver', 'Platinum'],
    metaTitle: 'Pendants - Elegant Necklace Jewelry | Kyna Jewels',
    metaDescription: 'Explore our collection of elegant pendants. Perfect for layering or wearing alone as a statement piece.',
    keywords: ['pendants', 'necklace pendants', 'elegant jewelry', 'layering jewelry', 'statement pieces'],
    isActive: true,
    isFeatured: true,
    sortOrder: 7,
    displayPriority: 'high',
    productCount: 10,
    viewCount: 0
  },

  // Necklaces
  {
    subProductId: 'NECKLACES',
    category: 'NECKLACES',
    subCategory: 'ALL_NECKLACES',
    displayName: 'Necklaces',
    description: 'Complete your look with our beautiful necklace collection. From delicate chains to bold statement pieces, find the perfect necklace for any occasion.',
    shortDescription: 'Beautiful necklaces to complete your elegant look',
    slug: 'necklaces',
    heroImage: 'https://kynajewels.com/images/RENDERING PHOTOS/NECKLACES/NK1-RD-100-WG-NBV.jpg',
    bannerImage: 'https://kynajewels.com/images/RENDERING PHOTOS/NECKLACES/banner.jpg',
    galleryImages: [
      'https://kynajewels.com/images/RENDERING PHOTOS/NECKLACES/NK1-RD-100-WG-NBV.jpg',
      'https://kynajewels.com/images/RENDERING PHOTOS/NECKLACES/NK1-RD-100-WG-TRV.jpg',
      'https://kynajewels.com/images/RENDERING PHOTOS/NECKLACES/NK1-RD-100-WG-BV.jpg'
    ],
    productVariants: ['NK1', 'NK2', 'NK3', 'NK4', 'NK5', 'NK6', 'NK7', 'NK8', 'NK9', 'NK10'],
    featuredVariants: ['NK1', 'NK2', 'NK3', 'NK4'],
    viewType: 'NBV',
    tags: ['necklaces', 'chains', 'elegant', 'statement', 'delicate', 'bold'],
    priceRange: { min: 15000, max: 200000 },
    availableDiamondShapes: ['RD', 'PR', 'EM', 'OV', 'CU', 'AS', 'MQ', 'PE', 'HS'],
    availableDiamondSizes: [0.2, 0.25, 0.3, 0.4, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0],
    availableMetalTypes: ['Gold', 'Silver', 'Platinum'],
    availableMetalColors: ['Yellow Gold', 'White Gold', 'Rose Gold', 'Silver', 'Platinum'],
    metaTitle: 'Necklaces - Elegant Chain Jewelry | Kyna Jewels',
    metaDescription: 'Discover our stunning collection of necklaces. From delicate chains to bold statement pieces, perfect for any occasion.',
    keywords: ['necklaces', 'chain necklaces', 'elegant jewelry', 'statement necklaces', 'delicate chains'],
    isActive: true,
    isFeatured: true,
    sortOrder: 8,
    displayPriority: 'high',
    productCount: 10,
    viewCount: 0
  }
];

export const seedSubProductData = async (): Promise<void> => {
  try {
    console.log('🌱 Starting SubProduct data seeding...');

    // Clear existing sub-products
    await SubProduct.deleteMany({});
    console.log('✅ Cleared existing sub-products');

    // Insert new sub-products
    const createdSubProducts = await SubProduct.insertMany(subProductSeedData);
    console.log(`✅ Created ${createdSubProducts.length} sub-products`);

    // Update product counts for each sub-product
    for (const subProduct of createdSubProducts) {
      await subProductService.updateProductCount(subProduct._id.toString());
    }

    console.log('✅ Updated product counts for all sub-products');
    console.log('🎉 SubProduct data seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding SubProduct data:', error);
    throw error;
  }
};

// Import the service here to avoid circular dependency
import { subProductService } from './subProductService';
