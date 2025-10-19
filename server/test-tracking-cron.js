// Test script for automatic tracking updates
const axios = require('axios');

const BASE_URL = 'https://api.kynajewels.com/api';

async function testTrackingCron() {
  console.log('🧪 Testing Automatic Tracking Updates...\n');
  
  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Testing server health...');
    const healthResponse = await axios.get(`${BASE_URL}/tracking/health`);
    console.log('✅ Server is running:', healthResponse.data);
    
    // Test 2: Test manual tracking update endpoint
    console.log('\n2️⃣ Testing manual tracking update...');
    try {
      const manualUpdateResponse = await axios.post(`${BASE_URL}/tracking/manual-update`);
      console.log('✅ Manual tracking update successful:', manualUpdateResponse.data);
    } catch (error) {
      if (error.response) {
        console.log('📊 Manual update response:', error.response.data);
        if (error.response.data.message && error.response.data.message.includes('No orders to update')) {
          console.log('ℹ️ No orders to update (this is expected if no orders exist)');
        }
      } else {
        console.log('❌ Manual update error:', error.message);
      }
    }
    
    // Test 3: Check tracking stats
    console.log('\n3️⃣ Checking tracking statistics...');
    try {
      const statsResponse = await axios.get(`${BASE_URL}/tracking/stats`);
      console.log('✅ Tracking stats:', statsResponse.data);
    } catch (error) {
      console.log('❌ Stats error:', error.response?.data || error.message);
    }
    
    console.log('\n🎉 Tracking cron job test completed!');
    console.log('\n📋 What happens next:');
    console.log('• Automatic updates will run every 30 minutes');
    console.log('• Check server logs for cron job activity');
    console.log('• Orders with docket numbers will be updated automatically');
    console.log('• Use POST /api/tracking/manual-update to test manually');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the server is running:');
    console.log('cd server && npm run dev');
  }
}

// Run the test
testTrackingCron().catch(console.error);
