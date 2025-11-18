// Simple test for serviceability API endpoints
import fetch from 'node-fetch';

const API_BASE = 'https://test.sequel247.com/api';
const TOKEN = 'b228a27399f07927985d57c0f7d94ce8';

// Test serviceability check
async function testServiceabilityCheck(pinCode: string) {
  console.log(`\n🧪 Testing serviceability for PIN: ${pinCode}`);
  
  try {
    const response = await fetch(`${API_BASE}/checkServiceability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: TOKEN,
        pin_code: pinCode,
      }),
    });

    const result = await response.json();
    
    console.log('📍 Response Status:', response.status);
    console.log('📍 Response Data:', JSON.stringify(result, null, 2));
    
    // Check serviceability status
    const isServiceable = result.status === true || 
                         result.status === 'true' || 
                         result.success === true ||
                         result.serviceable === true;
    
    console.log(`✅ PIN ${pinCode} is ${isServiceable ? 'SERVICEABLE' : 'NOT SERVICEABLE'}`);
    return isServiceable;
    
  } catch (error) {
    console.error('❌ Serviceability check failed:', error.message);
    return false;
  }
}

// Test EDD calculation
async function testEDDCalculation(destinationPin: string) {
  console.log(`\n🧪 Testing EDD calculation for PIN: ${destinationPin}`);
  
  try {
    const response = await fetch(`${API_BASE}/shipment/calculateEDD`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: TOKEN,
        origin_pincode: '400097',
        destination_pincode: destinationPin,
        pickup_date: new Date().toISOString().split('T')[0]
      }),
    });

    const result = await response.json();
    
    console.log('📦 Response Status:', response.status);
    console.log('📦 Response Data:', JSON.stringify(result, null, 2));
    
    // Extract EDD data
    const eddData = result.result || result.data || result;
    
    if (result.status === true && eddData) {
      console.log(`✅ EDD for ${destinationPin}:`);
      console.log(`   📅 Estimated Delivery: ${eddData.estimated_delivery || 'N/A'}`);
      console.log(`   📅 Estimated Day: ${eddData.estimated_day || 'N/A'}`);
      return eddData;
    } else {
      console.log(`❌ EDD calculation failed for ${destinationPin}`);
      return null;
    }
    
  } catch (error) {
    console.error('❌ EDD calculation failed:', error.message);
    return null;
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Sequel247 API Tests');
  console.log('=====================================');
  
  const testPins = ['400066', '110001', '560001'];
  
  // Test serviceability for multiple PINs
  console.log('\n🔍 SERVICEABILITY TESTS');
  for (const pin of testPins) {
    await testServiceabilityCheck(pin);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
  }
  
  // Test EDD calculation for serviceable areas
  console.log('\n📦 EDD CALCULATION TESTS');
  for (const pin of testPins.slice(0, 2)) { // Test only first 2
    await testEDDCalculation(pin);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
  }
  
  console.log('\n✅ All tests completed!');
}

// Execute if run directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
}

export { testServiceabilityCheck, testEDDCalculation, runTests };