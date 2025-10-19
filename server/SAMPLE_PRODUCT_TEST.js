// Sample Product Test Script
// This script creates a sample product to test the enhanced functionality

const mongoose = require('mongoose');

// Sample product data based on the BOM structure
const sampleProduct = {
  sku: "GR1-RD-70-EF-LG-2T-BR-RG",
  variant: "GR1",
  title: "18Kt Rose Gold 70 cent Lab Grown Diamond Round Cut Engagement Ring",
  description: "Elegant round cut diamond ring with two-tone finish and black rhodium accents. Features premium lab-grown diamond with EF color grade for exceptional brilliance and fire.",
  category: "Engagement Ring",
  subCategory: "Ring",
  price: 45000, // This will be calculated dynamically
  
  // Diamond Details
  diamondShape: "RD",
  diamondSize: 0.70,
  diamondColor: "EF",
  diamondOrigin: ["Lab Grown Diamond"],
  diamondTotalWeight: 0.70,
  
  // Metal Details  
  tone: "2T",
  finish: "BR",
  metal: "RG",
  karat: 18,
  
  // Images (following VPS structure)
  images: {
    main: "https://kyna-jewels.com/images/rings/GR1-RD-70-EF-LG-2T-BR-RG-GP.jpg",
    sub: [
      "https://kyna-jewels.com/images/rings/GR1-RD-70-EF-LG-2T-BR-RG-SIDE.jpg",
      "https://kyna-jewels.com/images/rings/GR1-RD-70-EF-LG-2T-BR-RG-TOP.jpg",
      "https://kyna-jewels.com/images/rings/GR1-RD-70-EF-LG-2T-BR-RG-DETAIL.jpg",
      "https://kyna-jewels.com/images/rings/GR1-RD-70-EF-LG-2T-BR-RG-LIFESTYLE.jpg",
      "https://kyna-jewels.com/images/rings/GR1-RD-70-EF-LG-2T-BR-RG-COMPARISON.jpg",
      "https://kyna-jewels.com/images/rings/GR1-RD-70-EF-LG-2T-BR-RG-CUSTOM.jpg",
      "https://kyna-jewels.com/images/rings/GR1-RD-70-EF-LG-2T-BR-RG-360.jpg"
    ]
  },
  
  // Physical Specs
  netWeightGrams: 5.2,
  
  // BOM Data (from Excel structure)
  makingChargesPerGram: 500,
  makingChargesTotalValue: 2600,
  
  // Features
  isGiftingAvailable: true,
  isEngraving: true,
  
  // Rating
  rating: {
    score: 4.8,
    reviews: 15
  }
};

// Additional sample products for variety
const sampleProducts = [
  {
    ...sampleProduct,
    sku: "GR2-PR-100-D-ND-3T-PL-WG",
    variant: "GR2",
    title: "18Kt White Gold 1.00 carat Natural Diamond Princess Cut Ring",
    diamondShape: "PR",
    diamondSize: 1.00,
    diamondColor: "D",
    diamondOrigin: ["Natural Diamond"],
    tone: "3T",
    finish: "PL",
    metal: "WG",
    price: 85000,
    category: "Solitaire Ring",
    netWeightGrams: 6.5,
    images: {
      main: "https://kyna-jewels.com/images/rings/GR2-PR-100-D-ND-3T-PL-WG-GP.jpg",
      sub: [
        "https://kyna-jewels.com/images/rings/GR2-PR-100-D-ND-3T-PL-WG-SIDE.jpg",
        "https://kyna-jewels.com/images/rings/GR2-PR-100-D-ND-3T-PL-WG-TOP.jpg",
        "https://kyna-jewels.com/images/rings/GR2-PR-100-D-ND-3T-PL-WG-DETAIL.jpg",
        "https://kyna-jewels.com/images/rings/GR2-PR-100-D-ND-3T-PL-WG-LIFESTYLE.jpg",
        "https://kyna-jewels.com/images/rings/GR2-PR-100-D-ND-3T-PL-WG-COMPARISON.jpg",
        "https://kyna-jewels.com/images/rings/GR2-PR-100-D-ND-3T-PL-WG-CUSTOM.jpg",
        "https://kyna-jewels.com/images/rings/GR2-PR-100-D-ND-3T-PL-WG-360.jpg"
      ]
    }
  },
  {
    ...sampleProduct,
    sku: "GR3-EM-50-G-LG-2T-RH-YG",
    variant: "GR3",
    title: "22Kt Yellow Gold 50 cent Lab Grown Diamond Emerald Cut Ring",
    diamondShape: "EM",
    diamondSize: 0.50,
    diamondColor: "G",
    diamondOrigin: ["Lab Grown Diamond"],
    tone: "2T",
    finish: "RH",
    metal: "YG",
    karat: 22,
    price: 35000,
    category: "Fashion Ring",
    netWeightGrams: 4.8,
    images: {
      main: "https://kyna-jewels.com/images/rings/GR3-EM-50-G-LG-2T-RH-YG-GP.jpg",
      sub: [
        "https://kyna-jewels.com/images/rings/GR3-EM-50-G-LG-2T-RH-YG-SIDE.jpg",
        "https://kyna-jewels.com/images/rings/GR3-EM-50-G-LG-2T-RH-YG-TOP.jpg",
        "https://kyna-jewels.com/images/rings/GR3-EM-50-G-LG-2T-RH-YG-DETAIL.jpg",
        "https://kyna-jewels.com/images/rings/GR3-EM-50-G-LG-2T-RH-YG-LIFESTYLE.jpg",
        "https://kyna-jewels.com/images/rings/GR3-EM-50-G-LG-2T-RH-YG-COMPARISON.jpg",
        "https://kyna-jewels.com/images/rings/GR3-EM-50-G-LG-2T-RH-YG-CUSTOM.jpg",
        "https://kyna-jewels.com/images/rings/GR3-EM-50-G-LG-2T-RH-YG-360.jpg"
      ]
    }
  }
];

// Function to add sample products (run this in MongoDB shell or Node.js script)
async function addSampleProducts() {
  try {
    await mongoose.connect('mongodb://localhost:27017/kyna-jewels');
    
    const Product = mongoose.model('Product');
    
    for (const product of sampleProducts) {
      const existingProduct = await Product.findOne({ sku: product.sku });
      if (!existingProduct) {
        await Product.create(product);
        console.log(`✅ Created product: ${product.sku}`);
      } else {
        console.log(`⚠️ Product already exists: ${product.sku}`);
      }
    }
    
    console.log('✅ Sample products added successfully!');
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error adding sample products:', error);
  }
}

// Export for use in other scripts
module.exports = { sampleProducts, addSampleProducts };

// Uncomment to run directly
// addSampleProducts();
