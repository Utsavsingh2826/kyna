/**
 * Test Cloudinary Configuration
 * Run this to verify Cloudinary is properly configured
 */

require('dotenv').config();
const cloudinary = require('cloudinary').v2;

console.log('🔍 Testing Cloudinary Configuration...\n');

// Check environment variables
console.log('Environment Variables:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME || 'NOT SET');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY || 'NOT SET');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'SET (hidden)' : 'NOT SET');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test configuration
async function testCloudinaryConfig() {
  try {
    console.log('\n🧪 Testing Cloudinary API connection...');
    
    // Test API connection by getting account info
    const result = await cloudinary.api.ping();
    
    if (result.status === 'ok') {
      console.log('✅ Cloudinary connection successful!');
      console.log('   Status:', result.status);
    } else {
      console.log('❌ Cloudinary connection failed');
      console.log('   Response:', result);
    }
    
  } catch (error) {
    console.log('❌ Cloudinary connection error:');
    console.log('   Error:', error.message);
    
    if (error.message.includes('cloud_name is disabled')) {
      console.log('\n💡 Solution:');
      console.log('   1. Check if your Cloudinary account is active');
      console.log('   2. Verify the cloud name is correct');
      console.log('   3. Make sure your account is not suspended');
    }
    
    if (error.message.includes('Invalid API credentials')) {
      console.log('\n💡 Solution:');
      console.log('   1. Check your API key and secret');
      console.log('   2. Make sure they match your Cloudinary account');
    }
  }
}

// Test upload (with a simple test)
async function testUpload() {
  try {
    console.log('\n🧪 Testing image upload...');
    
    // Create a simple test image buffer (1x1 pixel)
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    );
    
    const result = await cloudinary.uploader.upload(
      `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`,
      {
        folder: 'kyna-jewels/test',
        resource_type: 'auto'
      }
    );
    
    console.log('✅ Test upload successful!');
    console.log('   URL:', result.secure_url);
    console.log('   Public ID:', result.public_id);
    
    // Clean up test image
    await cloudinary.uploader.destroy(result.public_id);
    console.log('   Test image cleaned up');
    
  } catch (error) {
    console.log('❌ Test upload failed:');
    console.log('   Error:', error.message);
  }
}

// Run tests
async function runTests() {
  await testCloudinaryConfig();
  await testUpload();
  
  console.log('\n🎉 Cloudinary tests completed!');
  console.log('\n📋 Next steps:');
  console.log('   1. If tests pass, restart your server');
  console.log('   2. Try the blog API again');
  console.log('   3. If issues persist, check your Cloudinary dashboard');
}

runTests().catch(console.error);
