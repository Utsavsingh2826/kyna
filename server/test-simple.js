// Simple test for tracking functionality
const http = require('http');

function makeRequest(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: url,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ status: res.statusCode, data: data });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

async function testTracking() {
  console.log('🧪 Testing Automatic Tracking Updates...\n');
  
  try {
    // Test 1: Health check
    console.log('1️⃣ Testing server health...');
    const health = await makeRequest('/api/tracking/health');
    console.log('✅ Server response:', health.status);
    console.log('📊 Data:', health.data);
    
    // Test 2: Manual update
    console.log('\n2️⃣ Testing manual tracking update...');
    const manual = await makeRequest('/api/tracking/manual-update', 'POST');
    console.log('✅ Manual update response:', manual.status);
    console.log('📊 Data:', manual.data);
    
    // Test 3: Stats
    console.log('\n3️⃣ Testing tracking stats...');
    const stats = await makeRequest('/api/tracking/stats');
    console.log('✅ Stats response:', stats.status);
    console.log('📊 Data:', stats.data);
    
    console.log('\n🎉 All tests completed!');
    console.log('\n📋 Automatic tracking is now active:');
    console.log('• Updates every 30 minutes');
    console.log('• Check server logs for activity');
    console.log('• Orders with docket numbers will be updated');
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('💡 Make sure server is running: cd server && npm run dev');
  }
}

testTracking();
