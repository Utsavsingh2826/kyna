const axios = require('axios');

const BASE_URL = 'https://api.kynajewels.com/api';

// Test configuration
const tests = [
  {
    name: 'Health Check - Simple',
    url: '/health/simple',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Health Check - Comprehensive',
    url: '/health',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'API Documentation',
    url: '/',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Test Endpoint',
    url: '/test',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Sub-Products List',
    url: '/sub-products',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Sub-Products Featured',
    url: '/sub-products/featured',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Sub-Products Filters',
    url: '/sub-products/filters',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Products List',
    url: '/products',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Build Your Jewelry Variants',
    url: '/build-your-jewelry/variants',
    method: 'GET',
    expectedStatus: 200
  }
];

// Rate limiting tests
const rateLimitTests = [
  {
    name: 'Rate Limiting - Normal Request',
    url: '/test',
    method: 'GET',
    expectedStatus: 200,
    delay: 100
  },
  {
    name: 'Rate Limiting - Multiple Requests',
    url: '/test',
    method: 'GET',
    expectedStatus: 200,
    delay: 50,
    count: 5
  }
];

// Security tests
const securityTests = [
  {
    name: 'CORS Headers',
    url: '/test',
    method: 'OPTIONS',
    expectedStatus: 200,
    checkHeaders: ['access-control-allow-origin', 'access-control-allow-methods']
  },
  {
    name: 'Security Headers',
    url: '/test',
    method: 'GET',
    expectedStatus: 200,
    checkHeaders: ['x-content-type-options', 'x-frame-options']
  }
];

async function runTest(test) {
  try {
    const config = {
      method: test.method,
      url: `${BASE_URL}${test.url}`,
      timeout: 10000,
      validateStatus: () => true // Don't throw on any status code
    };

    if (test.count) {
      // Run multiple requests for rate limiting test
      const results = [];
      for (let i = 0; i < test.count; i++) {
        const response = await axios(config);
        results.push(response.status);
        if (test.delay) await new Promise(resolve => setTimeout(resolve, test.delay));
      }
      return { success: true, status: results, message: `Multiple requests: ${results.join(', ')}` };
    } else {
      const response = await axios(config);
      
      // Check headers if specified
      if (test.checkHeaders) {
        const missingHeaders = test.checkHeaders.filter(header => !response.headers[header]);
        if (missingHeaders.length > 0) {
          return { 
            success: false, 
            status: response.status, 
            message: `Missing headers: ${missingHeaders.join(', ')}` 
          };
        }
      }

      const success = response.status === test.expectedStatus;
      return { 
        success, 
        status: response.status, 
        message: success ? 'OK' : `Expected ${test.expectedStatus}, got ${response.status}` 
      };
    }
  } catch (error) {
    return { 
      success: false, 
      status: 'ERROR', 
      message: error.message 
    };
  }
}

async function runAllTests() {
  console.log('🚀 Starting Production Readiness Tests...\n');
  
  let passed = 0;
  let failed = 0;
  let total = 0;

  // Run basic functionality tests
  console.log('📋 Basic Functionality Tests:');
  console.log('=' .repeat(50));
  
  for (const test of tests) {
    total++;
    const result = await runTest(test);
    
    if (result.success) {
      console.log(`✅ ${test.name}: ${result.message}`);
      passed++;
    } else {
      console.log(`❌ ${test.name}: ${result.message}`);
      failed++;
    }
    
    if (test.delay) await new Promise(resolve => setTimeout(resolve, test.delay));
  }

  console.log('\n🔒 Security Tests:');
  console.log('=' .repeat(50));
  
  for (const test of securityTests) {
    total++;
    const result = await runTest(test);
    
    if (result.success) {
      console.log(`✅ ${test.name}: ${result.message}`);
      passed++;
    } else {
      console.log(`❌ ${test.name}: ${result.message}`);
      failed++;
    }
  }

  console.log('\n⚡ Rate Limiting Tests:');
  console.log('=' .repeat(50));
  
  for (const test of rateLimitTests) {
    total++;
    const result = await runTest(test);
    
    if (result.success) {
      console.log(`✅ ${test.name}: ${result.message}`);
      passed++;
    } else {
      console.log(`❌ ${test.name}: ${result.message}`);
      failed++;
    }
  }

  // Summary
  console.log('\n📊 Test Summary:');
  console.log('=' .repeat(50));
  console.log(`Total Tests: ${total}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ❌`);
  console.log(`Success Rate: ${Math.round((passed / total) * 100)}%`);

  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Server is production ready! 🎉');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the issues above.');
  }

  return { passed, failed, total };
}

// Run tests
runAllTests().catch(console.error);
