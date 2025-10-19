// Comprehensive API testing script
const axios = require('axios');

const BASE_URL = 'https://api.kynajewels.com/api';
const SAMPLE_PRODUCT_ID = '68ce55145c0f1761afa25604'; // From the created sample

// Test configurations
const testConfigs = {
  products: {
    endpoint: '/products',
    params: { page: 1, limit: 5, category: 'Gents Ring' }
  },
  price: {
    endpoint: `/products/${SAMPLE_PRODUCT_ID}/price`,
    params: {
      diamondShape: 'RD',
      diamondSize: 0.70,
      diamondColor: 'G',
      diamondOrigin: 'Natural',
      metal: 'RG',
      karat: 18,
      tone: '2T',
      finish: 'BR'
    }
  },
  images: {
    endpoint: `/products/${SAMPLE_PRODUCT_ID}/images`,
    params: {
      diamondShape: 'RD',
      diamondSize: 0.70,
      tone: '2T',
      metal: 'RG',
      finish: 'BR'
    }
  },
  details: {
    endpoint: `/products/${SAMPLE_PRODUCT_ID}`,
    params: {}
  },
  search: {
    endpoint: '/products/search',
    params: { q: 'ring', category: 'rings' }
  },
  filters: {
    endpoint: '/products/filters',
    params: {}
  },
  bom: {
    endpoint: `/products/${SAMPLE_PRODUCT_ID}/bom`,
    params: {
      diamondShape: 'RD',
      diamondSize: 0.70,
      metal: 'RG',
      karat: 18
    }
  }
};

async function testAPI(name, config) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🧪 Testing ${name.toUpperCase()}`);
  console.log(`${'='.repeat(80)}`);
  
  try {
    console.log(`📡 Request: GET ${config.endpoint}`);
    if (Object.keys(config.params).length > 0) {
      console.log(`📋 Query Params:`, config.params);
    }
    
    const response = await axios.get(`${BASE_URL}${config.endpoint}`, {
      params: config.params,
      timeout: 10000
    });
    
    console.log(`✅ Status: ${response.status} ${response.statusText}`);
    console.log(`📊 Response Data:`);
    console.log(JSON.stringify(response.data, null, 2));
    
    return { success: true, data: response.data };
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    if (error.response) {
      console.log(`📊 Error Response:`, error.response.data);
    }
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  console.log('🚀 Starting Comprehensive API Testing...\n');
  console.log('📝 Note: Make sure the server is running on http://localhost:5000');
  console.log('💡 To start server: npm run dev\n');
  
  const results = {};
  
  // Test all endpoints
  for (const [name, config] of Object.entries(testConfigs)) {
    results[name] = await testAPI(name, config);
    
    // Add delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log(`\n${'='.repeat(80)}`);
  console.log('📊 TESTING SUMMARY');
  console.log(`${'='.repeat(80)}`);
  
  const successful = Object.values(results).filter(r => r.success).length;
  const total = Object.keys(results).length;
  
  console.log(`✅ Successful: ${successful}/${total}`);
  console.log(`❌ Failed: ${total - successful}/${total}`);
  
  console.log('\n📋 Detailed Results:');
  Object.entries(results).forEach(([name, result]) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${name.toUpperCase()}: ${result.success ? 'PASSED' : 'FAILED'}`);
  });
  
  if (successful === total) {
    console.log('\n🎉 All tests passed! The Products API is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Check the server status and try again.');
  }
  
  console.log('\n🔗 Next Steps:');
  console.log('1. If tests failed, start the server: npm run dev');
  console.log('2. If tests passed, integrate with frontend');
  console.log('3. Test with different product attributes');
  console.log('4. Verify image URLs point to correct Hostinger VPS paths');
}

// Run the tests
runAllTests().catch(console.error);
