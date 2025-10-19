#!/usr/bin/env node

/**
 * Simple monitoring script for the order tracking system
 * Usage: node monitor-tracking-system.js
 */

const axios = require('axios');

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';

async function checkSystemHealth() {
  console.log('🔍 Checking Order Tracking System Health...\n');
  
  try {
    // Check system health
    const healthResponse = await axios.get(`${SERVER_URL}/api/system/health`);
    const health = healthResponse.data;
    
    console.log('✅ SYSTEM STATUS: HEALTHY');
    console.log(`📅 Last Check: ${health.timestamp}`);
    console.log(`🔄 Cron Job: ${health.cronJob.status} (${health.cronJob.frequency})`);
    console.log(`📊 Database: ${health.database.connected ? 'Connected' : 'Disconnected'}`);
    console.log(`📦 Total Orders: ${health.database.totalOrders}`);
    console.log(`🚚 Total Tracking Records: ${health.database.totalTracking}`);
    console.log(`⏳ Orders Pending Updates: ${health.database.ordersToUpdate}`);
    console.log(`⚡ System Uptime: ${health.systemInfo.uptime}`);
    
    if (health.recentActivity && health.recentActivity.length > 0) {
      console.log('\n📈 Recent Order Updates:');
      health.recentActivity.forEach((order, index) => {
        console.log(`   ${index + 1}. ${order.orderNumber}: ${order.status} (${new Date(order.updatedAt).toLocaleString()})`);
      });
    }
    
    // Check if manual update is available
    console.log('\n🧪 Testing Manual Update Capability...');
    const manualUpdateResponse = await axios.post(`${SERVER_URL}/api/tracking/manual-update`);
    const manualResult = manualUpdateResponse.data;
    
    if (manualResult.success) {
      console.log('✅ Manual Updates: Working');
      console.log(`📊 Update Result: ${manualResult.data.message}`);
      if (manualResult.data.updatedCount > 0) {
        console.log(`🎉 Successfully updated ${manualResult.data.updatedCount} orders`);
      }
    }
    
  } catch (error) {
    console.error('❌ SYSTEM STATUS: ERROR');
    
    if (error.response) {
      console.error(`📡 HTTP Error: ${error.response.status} - ${error.response.statusText}`);
      if (error.response.data) {
        console.error(`📝 Error Details: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    } else if (error.request) {
      console.error('🚫 No Response: Server may be down');
      console.error(`🔗 Attempted URL: ${SERVER_URL}/api/system/health`);
    } else {
      console.error(`💥 Request Error: ${error.message}`);
    }
    
    console.log('\n🔧 Troubleshooting Tips:');
    console.log('   1. Make sure the server is running: cd server && npm run dev');
    console.log('   2. Check if the URL is correct:', SERVER_URL);
    console.log('   3. Verify environment variables are set');
    console.log('   4. Check server logs for errors');
  }
}

async function main() {
  console.log('🚀 Kyna Jewels - Order Tracking System Monitor\n');
  console.log(`🔗 Server URL: ${SERVER_URL}`);
  console.log('=' * 50);
  
  await checkSystemHealth();
  
  console.log('\n' + '=' * 50);
  console.log('📋 Available Endpoints:');
  console.log(`   Health Check: ${SERVER_URL}/api/system/health`);
  console.log(`   Manual Update: ${SERVER_URL}/api/tracking/manual-update`);
  console.log(`   Tracking Health: ${SERVER_URL}/api/tracking/health`);
  console.log(`   API Documentation: ${SERVER_URL}/api`);
  
  console.log('\n💡 How to use:');
  console.log('   - Run this script regularly to monitor system health');
  console.log('   - Use manual update endpoint to force immediate updates');
  console.log('   - Check server logs for detailed cron job output');
  console.log('   - The system automatically updates orders every 30 minutes');
  
  console.log('\n🎯 For your colleague building the admin dashboard:');
  console.log('   - Use GET /api/system/health for dashboard health widget');
  console.log('   - Use POST /api/tracking/manual-update for admin manual trigger');
  console.log('   - All endpoints return JSON with success/error status');
}

// Run the monitor
main().catch(console.error);
