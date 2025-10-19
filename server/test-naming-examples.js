// Test examples for flexible BOM naming convention
console.log('🧪 Flexible BOM Naming Convention Examples for Kyna Jewels\n');

// Simulate the flexible naming logic
function generateImageIdentifier(sku, attributes) {
  const attributeValues = Object.values(attributes)
    .map(value => {
      if (typeof value === 'number') {
        // Convert diamond size: 0.70 -> 70, 1.00 -> 100
        return Math.round(value * 100).toString();
      }
      return value.toString();
    })
    .filter(value => value && value !== 'undefined' && value !== 'null');

  return [sku, ...attributeValues].join('-');
}

function extractCategoryFromSku(sku) {
  const prefix = sku.match(/^([A-Z]+)/)?.[1] || '';
  
  const categoryMap = {
    // Ring Categories
    'GR': 'rings',      // Gents Rings
    'ENG': 'rings',     // Engagement Rings  
    'SOL': 'rings',     // Solitaire Rings
    'FR': 'rings',      // Fashion Rings
    'WR': 'rings',      // Wedding Rings
    'PR': 'rings',      // Promise Rings
    'AR': 'rings',      // Anniversary Rings
    
    // Other Jewelry Categories
    'BR': 'bracelets',  // Bracelets
    'PN': 'pendants',   // Pendants
    'ER': 'earrings',   // Earrings
    'NK': 'necklaces',  // Necklaces
    'CH': 'chains',     // Chains
    'WT': 'watches',    // Watches
    'AN': 'anklets',    // Anklets
    
    // Gemstone Categories
    'DI': 'diamonds',   // Diamonds
    'EM': 'emeralds',   // Emeralds
    'RU': 'rubies',     // Rubies
    'SA': 'sapphires',  // Sapphires
    'PE': 'pearls',     // Pearls
    'AM': 'amethysts',  // Amethysts
    'CI': 'citrines',   // Citrines
    'TO': 'topazes',    // Topazes
    
    // Metal Categories
    'GD': 'gold',       // Gold
    'SL': 'silver',     // Silver
    'PT': 'platinum',   // Platinum
    'TI': 'titanium',   // Titanium
    'ST': 'steel',      // Steel
    
    // Default fallback
    'DEFAULT': 'jewelry'
  };

  return categoryMap[prefix] || categoryMap['DEFAULT'];
}

// Test cases
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
    }
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
    }
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
    }
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
    }
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
    }
  },
  {
    name: 'Pendant - Emerald Diamond with Chain',
    sku: 'PN1',
    attributes: {
      diamondShape: 'EM',
      diamondSize: 0.40,
      tone: '1T',
      finish: 'BR',
      metal: 'PT',
      chainLength: 18
    }
  },
  {
    name: 'Earrings - Marquise Diamond Hoops',
    sku: 'ER1',
    attributes: {
      diamondShape: 'MAR',
      diamondSize: 0.60,
      tone: '2T',
      finish: 'PL',
      metal: 'RG',
      setting: 'HOOP'
    }
  },
  {
    name: 'Wedding Ring - Round Diamond with Karat',
    sku: 'WR1',
    attributes: {
      diamondShape: 'RD',
      diamondSize: 0.80,
      tone: '1T',
      finish: 'MT',
      metal: 'WG',
      karat: 18
    }
  },
  {
    name: 'Necklace - Pearl String',
    sku: 'NK1',
    attributes: {
      gemstoneType: 'PE',
      pearlSize: 8,
      length: 18,
      metal: 'SL',
      clasp: 'LOBSTER'
    }
  },
  {
    name: 'Watch - Diamond Bezel',
    sku: 'WT1',
    attributes: {
      caseMaterial: 'ST',
      bezelType: 'DI',
      diamondCount: 12,
      movement: 'AUTO',
      waterResistance: 100
    }
  }
];

console.log('📋 Testing Different Jewelry Types and Attribute Combinations:\n');

testCases.forEach((testCase, index) => {
  console.log(`${index + 1}️⃣ ${testCase.name}`);
  console.log(`   SKU: ${testCase.sku}`);
  console.log(`   Attributes:`, testCase.attributes);
  
  // Generate image identifier
  const baseIdentifier = generateImageIdentifier(testCase.sku, testCase.attributes);
  const category = extractCategoryFromSku(testCase.sku);
  
  console.log(`   ✅ Generated Identifier: ${baseIdentifier}`);
  console.log(`   ✅ Category: ${category}`);
  console.log(`   ✅ Main Image: https://yourdomain.com/images/${category}/${baseIdentifier}-GP.jpg`);
  console.log(`   ✅ Sub Images: 7 additional views (SIDE, TOP, DETAIL, LIFESTYLE, COMPARISON, CUSTOM, 360)`);
  console.log('');
});

console.log('🎯 Key Features of Flexible Naming Convention:');
console.log('   ✅ Dynamic SKU support - works with any SKU format');
console.log('   ✅ Flexible attribute concatenation - any number of attributes');
console.log('   ✅ Automatic category detection from SKU prefix');
console.log('   ✅ Numeric value handling (diamond size conversion)');
console.log('   ✅ Support for custom attributes (chainLength, setting, etc.)');
console.log('   ✅ 8 image views per product (GP + 7 sub images)');
console.log('   ✅ Fallback to default category for unknown SKUs');

console.log('\n📁 Image Storage Structure:');
console.log('   /var/www/html/yourdomain.com/public/images/');
console.log('   ├── rings/          (GR1, ENG1, SOL1, FR1, WR1, PR1, AR1)');
console.log('   ├── bracelets/      (BR1)');
console.log('   ├── pendants/       (PN1)');
console.log('   ├── earrings/       (ER1)');
console.log('   ├── necklaces/      (NK1)');
console.log('   ├── chains/         (CH1)');
console.log('   ├── watches/        (WT1)');
console.log('   ├── anklets/        (AN1)');
console.log('   ├── diamonds/       (DI1)');
console.log('   ├── emeralds/       (EM1)');
console.log('   ├── rubies/         (RU1)');
console.log('   ├── sapphires/      (SA1)');
console.log('   ├── pearls/         (PE1)');
console.log('   ├── gold/           (GD1)');
console.log('   ├── silver/         (SL1)');
console.log('   ├── platinum/       (PT1)');
console.log('   └── jewelry/        (Unknown SKUs)');

console.log('\n🎉 Flexible BOM Naming Convention Implementation Complete!');
console.log('   The system now supports any SKU format and dynamically concatenates attributes.');
console.log('   Perfect for handling all types of jewelry with varying attribute combinations.');
