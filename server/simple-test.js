// Simple test to check if server is running
const http = require('http');

function testServer() {
  console.log('🔍 Testing if server is running...\n');
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/products',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Server is running! Status: ${res.statusCode}`);
    console.log(`📡 Response Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('\n📊 Response Body:');
      try {
        const jsonData = JSON.parse(data);
        console.log(JSON.stringify(jsonData, null, 2));
      } catch (e) {
        console.log(data);
      }
    });
  });

  req.on('error', (err) => {
    console.log('❌ Server is not running or not accessible');
    console.log('Error:', err.message);
    console.log('\n💡 To start the server, run: npm run dev');
  });

  req.setTimeout(5000, () => {
    console.log('⏰ Request timeout - server might not be running');
    req.destroy();
  });

  req.end();
}

testServer();
