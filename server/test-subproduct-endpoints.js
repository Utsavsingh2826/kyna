const axios = require('axios');

const BASE_URL = 'https://api.kynajewels.com/api';

// Test endpoints
const testEndpoints = async () => {
  console.log('🧪 Testing SubProduct API Endpoints...\n');

  try {
    // Test 1: Get all sub-products
    console.log('1️⃣ Testing GET /api/sub-products');
    const response1 = await axios.get(`${BASE_URL}/sub-products`);
    console.log('✅ Status:', response1.status);
    console.log('📊 Data:', response1.data.data.subProducts.length, 'sub-products found');
    console.log('📄 Pagination:', response1.data.data.pagination);
    console.log('');

    // Test 2: Get featured sub-products
    console.log('2️⃣ Testing GET /api/sub-products/featured');
    const response2 = await axios.get(`${BASE_URL}/sub-products/featured`);
    console.log('✅ Status:', response2.status);
    console.log('📊 Data:', response2.data.data.subProducts.length, 'featured sub-products found');
    console.log('');

    // Test 3: Get sub-products by category
    console.log('3️⃣ Testing GET /api/sub-products/category/RINGS');
    const response3 = await axios.get(`${BASE_URL}/sub-products/category/RINGS`);
    console.log('✅ Status:', response3.status);
    console.log('📊 Data:', response3.data.data.subProducts.length, 'ring sub-products found');
    console.log('');

    // Test 4: Search sub-products
    console.log('4️⃣ Testing GET /api/sub-products/search?q=fashion');
    const response4 = await axios.get(`${BASE_URL}/sub-products/search?q=fashion`);
    console.log('✅ Status:', response4.status);
    console.log('📊 Data:', response4.data.data.subProducts.length, 'search results found');
    console.log('');

    // Test 5: Get sub-product filters
    console.log('5️⃣ Testing GET /api/sub-products/filters');
    const response5 = await axios.get(`${BASE_URL}/sub-products/filters`);
    console.log('✅ Status:', response5.status);
    console.log('📊 Categories:', response5.data.data.categories.length);
    console.log('📊 Sub-categories:', response5.data.data.subCategories.length);
    console.log('📊 Price ranges:', response5.data.data.priceRanges.length);
    console.log('📊 Tags:', response5.data.data.tags.length);
    console.log('');

    // Test 6: Get sub-product by ID (using first sub-product)
    if (response1.data.data.subProducts.length > 0) {
      const firstSubProduct = response1.data.data.subProducts[0];
      console.log('6️⃣ Testing GET /api/sub-products/' + firstSubProduct.id);
      const response6 = await axios.get(`${BASE_URL}/sub-products/${firstSubProduct.id}`);
      console.log('✅ Status:', response6.status);
      console.log('📊 Sub-product name:', response6.data.data.displayName);
      console.log('📊 Variants count:', response6.data.data.allVariants.length);
      console.log('📊 Featured variants:', response6.data.data.featuredVariants.length);
      console.log('');

      // Test 7: Get sub-product variants
      console.log('7️⃣ Testing GET /api/sub-products/' + firstSubProduct.id + '/variants');
      const response7 = await axios.get(`${BASE_URL}/sub-products/${firstSubProduct.id}/variants`);
      console.log('✅ Status:', response7.status);
      console.log('📊 Variants:', response7.data.data.variants.length);
      console.log('📄 Pagination:', response7.data.data.pagination);
      console.log('');

      // Test 8: Get sub-product customization options
      console.log('8️⃣ Testing GET /api/sub-products/' + firstSubProduct.id + '/customization');
      const response8 = await axios.get(`${BASE_URL}/sub-products/${firstSubProduct.id}/customization`);
      console.log('✅ Status:', response8.status);
      console.log('📊 Diamond shapes:', response8.data.data.diamondShapes.length);
      console.log('📊 Diamond sizes:', response8.data.data.diamondSizes.length);
      console.log('📊 Metal types:', response8.data.data.metalTypes.length);
      console.log('📊 Metal colors:', response8.data.data.metalColors.length);
      console.log('');
    }

    // Test 9: Test filtering
    console.log('9️⃣ Testing GET /api/sub-products?category=RINGS&isFeatured=true');
    const response9 = await axios.get(`${BASE_URL}/sub-products?category=RINGS&isFeatured=true`);
    console.log('✅ Status:', response9.status);
    console.log('📊 Data:', response9.data.data.subProducts.length, 'featured ring sub-products found');
    console.log('');

    // Test 10: Test pagination
    console.log('🔟 Testing GET /api/sub-products?page=1&limit=3');
    const response10 = await axios.get(`${BASE_URL}/sub-products?page=1&limit=3`);
    console.log('✅ Status:', response10.status);
    console.log('📊 Data:', response10.data.data.subProducts.length, 'sub-products (limit 3)');
    console.log('📄 Pagination:', response10.data.data.pagination);
    console.log('');

    console.log('🎉 All SubProduct API endpoints tested successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status === 404) {
      console.log('💡 Make sure the server is running and the sub-product data is seeded');
    }
  }
};

// Run tests
testEndpoints();
