import fetch from 'node-fetch';

// Configuration
const BASE_URL = 'http://localhost:5000/api';
const TEST_PIN_CODES = ['400066', '110001', '560001', '700001', '600001'];

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg: string) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg: string) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg: string) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warning: (msg: string) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  header: (msg: string) => console.log(`\n${colors.bold}${colors.blue}🚀 ${msg}${colors.reset}\n`)
};

// Test functions
async function testServiceabilityRoutes() {
  log.header('Testing Serviceability Routes');

  // Test 1: Check if routes are working
  try {
    log.info('Testing serviceability routes availability...');
    const response = await fetch(`${BASE_URL}/serviceability/test`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      log.success('Serviceability routes are available');
      console.log('Available endpoints:', data.endpoints);
    } else {
      log.error('Serviceability routes test failed');
      return false;
    }
  } catch (error) {
    log.error(`Failed to connect to serviceability routes: ${error.message}`);
    return false;
  }

  // Test 2: Check serviceability for multiple PIN codes
  log.info('Testing serviceability check...');
  for (const pinCode of TEST_PIN_CODES) {
    try {
      const response = await fetch(`${BASE_URL}/serviceability/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin_code: pinCode })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        log.success(`PIN ${pinCode}: ${data.serviceable ? 'Serviceable' : 'Not Serviceable'}`);
      } else {
        log.error(`PIN ${pinCode}: ${data.message || 'Failed'}`);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      log.error(`PIN ${pinCode}: Request failed - ${error.message}`);
    }
  }

  // Test 3: Calculate EDD for serviceable areas
  log.info('Testing EDD calculation...');
  for (const pinCode of TEST_PIN_CODES.slice(0, 2)) { // Test only first 2 to avoid too many API calls
    try {
      const response = await fetch(`${BASE_URL}/serviceability/calculate-edd`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination_pincode: pinCode })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        log.success(`EDD for ${pinCode}: ${data.estimated_day || 'N/A'} (${data.estimated_delivery || 'No date'})`);
      } else {
        log.error(`EDD for ${pinCode}: ${data.message || 'Failed'}`);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      log.error(`EDD for ${pinCode}: Request failed - ${error.message}`);
    }
  }

  return true;
}

async function testLegacyEDDController() {
  log.header('Testing Legacy EDD Controller');
  
  try {
    const response = await fetch(`${BASE_URL}/orders/estimate-delivery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination_pincode: '400066' })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      log.success(`Legacy EDD: ${data.estimated_delivery_day} (${data.estimated_delivery_date})`);
      log.info(`Data source: ${data.source}`);
      if (data.note) log.warning(data.note);
    } else {
      log.error(`Legacy EDD failed: ${data.error || 'Unknown error'}`);
    }
  } catch (error) {
    log.error(`Legacy EDD request failed: ${error.message}`);
  }
}

async function testInvalidInputs() {
  log.header('Testing Invalid Inputs');
  
  const invalidTests = [
    { name: 'Empty PIN', body: { pin_code: '' } },
    { name: 'Invalid PIN format', body: { pin_code: '12345' } },
    { name: 'Non-numeric PIN', body: { pin_code: 'ABCDEF' } },
    { name: 'Missing PIN', body: {} }
  ];

  for (const test of invalidTests) {
    try {
      const response = await fetch(`${BASE_URL}/serviceability/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test.body)
      });
      
      const data = await response.json();
      
      if (response.status === 400) {
        log.success(`${test.name}: Properly rejected (${data.message})`);
      } else {
        log.warning(`${test.name}: Expected 400, got ${response.status}`);
      }
    } catch (error) {
      log.error(`${test.name}: Request failed - ${error.message}`);
    }
  }
}

// Main test runner
async function runAllTests() {
  console.log(`${colors.bold}🧪 Serviceability API Test Suite${colors.reset}`);
  console.log(`${colors.blue}Testing against: ${BASE_URL}${colors.reset}`);
  console.log('='.repeat(50));

  try {
    await testServiceabilityRoutes();
    await testLegacyEDDController();
    await testInvalidInputs();
    
    log.header('Test Suite Completed');
    log.success('All tests finished. Check results above.');
  } catch (error) {
    log.error(`Test suite failed: ${error.message}`);
  }
}

// Run the tests
if (require.main === module) {
  runAllTests();
}

export { runAllTests, testServiceabilityRoutes, testLegacyEDDController, testInvalidInputs };