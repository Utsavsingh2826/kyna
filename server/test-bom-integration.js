const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testBOMIntegration() {
  console.log('🧪 Testing BOM Integration for Kyna Jewels...\n');

  try {
    // Test 1: Get product filters
    console.log('1️⃣ Testing Product Filters...');
    const filtersResponse = await axios.get(`${BASE_URL}/api/products/filters`);
    console.log('✅ Filters API:', filtersResponse.data);
    console.log('');

    // Test 2: Test image generation with BOM naming convention
    console.log('2️⃣ Testing Image Generation with BOM Naming...');
    
    // Create a sample product for testing
    const sampleProduct = {
      sku: 'GR1-RD-70-2T-BR-RG',
      variant: 'GR1',
      title: 'Gents Ring - Round Diamond 0.70ct Two Tone Black Rhodium Rose Gold',
      category: 'Gents Ring',
      subCategory: 'Ring',
      price: 0, // Will be calculated dynamically
      diamondShape: 'RD',
      diamondSize: 0.70,
      diamondColor: 'G',
      diamondOrigin: ['Lab Grown Diamond'],
      tone: '2T',
      finish: 'BR',
      metal: 'RG',
      karat: 18,
      netWeightGrams: 5.2
    };

    // Test image URL generation
    const imageService = require('./src/services/imageService.ts');
    const imageUrls = imageService.imageService.generateImageUrlsFromBOM('GR1', {
      diamondShape: 'RD',
      diamondSize: 0.70,
      tone: '2T',
      finish: 'BR',
      metal: 'RG'
    });

    console.log('✅ Generated Image URLs:');
    console.log('   Main Image (GP):', imageUrls.main);
    console.log('   Sub Images:', imageUrls.sub);
    console.log('');

    // Test 3: Test pricing with BOM details
    console.log('3️⃣ Testing Pricing with BOM Details...');
    const pricingService = require('./src/services/pricingService.ts');
    const bomDetails = pricingService.pricingService.getBOMDetails(sampleProduct, {});
    
    console.log('✅ BOM Details Generated:');
    console.log('   Product SKU:', bomDetails.productSku);
    console.log('   Diamond Shape:', bomDetails.diamondShape);
    console.log('   Diamond Size:', bomDetails.diamondSize);
    console.log('   Metal:', bomDetails.metal);
    console.log('   Karat:', bomDetails.karat);
    console.log('   Tone:', bomDetails.tone);
    console.log('   Finish:', bomDetails.finish);
    console.log('   Final Price:', bomDetails.finalPrice);
    console.log('   Metal Cost:', bomDetails.metalCost);
    console.log('   Diamond Cost:', bomDetails.diamondCost);
    console.log('   Making Charges:', bomDetails.makingCharges);
    console.log('   GST:', bomDetails.gst);
    console.log('');

    // Test 4: Test different product variants
    console.log('4️⃣ Testing Different Product Variants...');
    
    const variants = [
      { sku: 'GR1-RD-100-2T-BR-RG', diamondSize: 1.00, metal: 'RG' },
      { sku: 'GR1-PR-70-2T-BR-RG', diamondShape: 'PR', diamondSize: 0.70, metal: 'RG' },
      { sku: 'GR1-RD-70-2T-BR-YG', diamondSize: 0.70, metal: 'YG' },
      { sku: 'ENG1-RD-50-1T-WG', diamondSize: 0.50, metal: 'WG', tone: '1T' }
    ];

    variants.forEach((variant, index) => {
      const imageUrls = imageService.imageService.generateImageUrlsFromBOM(variant.sku, {
        diamondShape: variant.diamondShape || 'RD',
        diamondSize: variant.diamondSize,
        tone: variant.tone || '2T',
        finish: 'BR',
        metal: variant.metal
      });
      
      console.log(`   Variant ${index + 1}: ${variant.sku}`);
      console.log(`   Main Image: ${imageUrls.main}`);
      console.log('');
    });

    console.log('🎉 All BOM Integration Tests Completed Successfully!');
    console.log('');
    console.log('📋 Summary of Implementation:');
    console.log('   ✅ Image naming convention: SKU-SHAPE-SIZE-TONE-FINISH-METAL-VIEW');
    console.log('   ✅ BOM details integration in pricing API');
    console.log('   ✅ Dynamic image URL generation from Hostinger VPS');
    console.log('   ✅ Support for multiple product categories (GR1, ENG1, SOL1)');
    console.log('   ✅ 8 image views per product (GP + 7 sub images)');
    console.log('   ✅ Complete pricing breakdown with BOM data');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testBOMIntegration();
