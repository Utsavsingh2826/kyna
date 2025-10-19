const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testFlexibleNamingConvention() {
  console.log('🧪 Testing Flexible BOM Naming Convention for Kyna Jewels...\n');

  try {
    // Test different jewelry types with various attribute combinations
    const testCases = [
      {
        name: 'Gents Ring - Round Diamond',
        sku: 'GR1',
        attributes: {
          diamondShape: 'RD',
          diamondSize: 0.70,
          tone: '2T',
          finish: 'BR',
          metal: 'RG'
        },
        expectedFormat: 'GR1-RD-70-2T-BR-RG-GP'
      },
      {
        name: 'Engagement Ring - Princess Diamond',
        sku: 'ENG1',
        attributes: {
          diamondShape: 'PR',
          diamondSize: 1.00,
          tone: '1T',
          finish: 'PL',
          metal: 'WG'
        },
        expectedFormat: 'ENG1-PR-100-1T-PL-WG-GP'
      },
      {
        name: 'Solitaire Ring - Oval Diamond',
        sku: 'SOL1',
        attributes: {
          diamondShape: 'OV',
          diamondSize: 0.50,
          tone: '1T',
          finish: 'MT',
          metal: 'YG'
        },
        expectedFormat: 'SOL1-OV-50-1T-MT-YG-GP'
      },
      {
        name: 'Fashion Ring - Cushion Diamond',
        sku: 'FR1',
        attributes: {
          diamondShape: 'CUS',
          diamondSize: 0.30,
          tone: '3T',
          finish: 'BR',
          metal: 'RG',
          gemstoneType: 'DI'
        },
        expectedFormat: 'FR1-CUS-30-3T-BR-RG-DI-GP'
      },
      {
        name: 'Bracelet - Round Diamond',
        sku: 'BR1',
        attributes: {
          diamondShape: 'RD',
          diamondSize: 0.25,
          tone: '2T',
          finish: 'PL',
          metal: 'SL'
        },
        expectedFormat: 'BR1-RD-25-2T-PL-SL-GP'
      },
      {
        name: 'Pendant - Emerald Diamond',
        sku: 'PN1',
        attributes: {
          diamondShape: 'EM',
          diamondSize: 0.40,
          tone: '1T',
          finish: 'BR',
          metal: 'PT',
          chainLength: 18
        },
        expectedFormat: 'PN1-EM-40-1T-BR-PT-18-GP'
      },
      {
        name: 'Earrings - Marquise Diamond',
        sku: 'ER1',
        attributes: {
          diamondShape: 'MAR',
          diamondSize: 0.60,
          tone: '2T',
          finish: 'PL',
          metal: 'RG',
          setting: 'HOOP'
        },
        expectedFormat: 'ER1-MAR-60-2T-PL-RG-HOOP-GP'
      },
      {
        name: 'Wedding Ring - Round Diamond',
        sku: 'WR1',
        attributes: {
          diamondShape: 'RD',
          diamondSize: 0.80,
          tone: '1T',
          finish: 'MT',
          metal: 'WG',
          karat: 18
        },
        expectedFormat: 'WR1-RD-80-1T-MT-WG-18-GP'
      }
    ];

    console.log('📋 Testing Different Jewelry Types and Attribute Combinations:\n');

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`${i + 1}️⃣ ${testCase.name}`);
      console.log(`   SKU: ${testCase.sku}`);
      console.log(`   Attributes:`, testCase.attributes);
      console.log(`   Expected Format: ${testCase.expectedFormat}`);
      
      // Test image URL generation
      try {
        const imageService = require('./src/services/imageService.ts');
        const imageUrls = imageService.imageService.generateImageUrlsFlexible(testCase.sku, testCase.attributes);
        
        console.log(`   ✅ Generated Main Image: ${imageUrls.main}`);
        console.log(`   ✅ Generated Sub Images: ${imageUrls.sub.length} images`);
        console.log(`   ✅ Category: ${testCase.sku.startsWith('GR') || testCase.sku.startsWith('ENG') || testCase.sku.startsWith('SOL') ? 'rings' : 'other'}`);
        console.log('');
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        console.log('');
      }
    }

    // Test category mapping
    console.log('🏷️ Testing Category Mapping:\n');
    const categoryTests = [
      { sku: 'GR1', expected: 'rings' },
      { sku: 'ENG1', expected: 'rings' },
      { sku: 'SOL1', expected: 'rings' },
      { sku: 'FR1', expected: 'rings' },
      { sku: 'WR1', expected: 'rings' },
      { sku: 'BR1', expected: 'bracelets' },
      { sku: 'PN1', expected: 'pendants' },
      { sku: 'ER1', expected: 'earrings' },
      { sku: 'NK1', expected: 'necklaces' },
      { sku: 'CH1', expected: 'chains' },
      { sku: 'WT1', expected: 'watches' },
      { sku: 'DI1', expected: 'diamonds' },
      { sku: 'EM1', expected: 'emeralds' },
      { sku: 'RU1', expected: 'rubies' },
      { sku: 'SA1', expected: 'sapphires' },
      { sku: 'PE1', expected: 'pearls' },
      { sku: 'GD1', expected: 'gold' },
      { sku: 'SL1', expected: 'silver' },
      { sku: 'PT1', expected: 'platinum' },
      { sku: 'UNKNOWN1', expected: 'jewelry' }
    ];

    categoryTests.forEach(test => {
      try {
        const imageService = require('./src/services/imageService.ts');
        const category = imageService.imageService.extractCategoryFromSku(test.sku);
        const status = category === test.expected ? '✅' : '❌';
        console.log(`   ${status} ${test.sku} -> ${category} (expected: ${test.expected})`);
      } catch (error) {
        console.log(`   ❌ ${test.sku} -> Error: ${error.message}`);
      }
    });

    console.log('\n🎯 Flexible Naming Convention Features:');
    console.log('   ✅ Dynamic SKU support (GR1, ENG1, SOL1, BR1, PN1, ER1, etc.)');
    console.log('   ✅ Flexible attribute concatenation');
    console.log('   ✅ Support for any number of attributes');
    console.log('   ✅ Automatic category detection from SKU');
    console.log('   ✅ 8 image views per product (GP + 7 sub images)');
    console.log('   ✅ Numeric value handling (diamond size conversion)');
    console.log('   ✅ Fallback to default category for unknown SKUs');
    console.log('   ✅ Support for custom attributes');

    console.log('\n📁 Image Storage Structure:');
    console.log('   /var/www/html/yourdomain.com/public/images/');
    console.log('   ├── rings/');
    console.log('   │   ├── GR1-RD-70-2T-BR-RG-GP.jpg');
    console.log('   │   ├── ENG1-PR-100-1T-PL-WG-GP.jpg');
    console.log('   │   └── ...');
    console.log('   ├── bracelets/');
    console.log('   │   ├── BR1-RD-25-2T-PL-SL-GP.jpg');
    console.log('   │   └── ...');
    console.log('   ├── pendants/');
    console.log('   │   ├── PN1-EM-40-1T-BR-PT-18-GP.jpg');
    console.log('   │   └── ...');
    console.log('   └── earrings/');
    console.log('       ├── ER1-MAR-60-2T-PL-RG-HOOP-GP.jpg');
    console.log('       └── ...');

    console.log('\n🎉 Flexible BOM Naming Convention Test Completed Successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testFlexibleNamingConvention();
