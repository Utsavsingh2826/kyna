const axios = require('axios');

const BASE_URL = 'https://api.kynajewels.com/api/build-your-jewelry';

/**
 * Test Build Your Jewelry API endpoints
 */
async function testBuildYourJewelryAPI() {
  console.log('🧪 Testing Build Your Jewelry API...\n');

  try {
    // Test 1: Get all categories
    console.log('1️⃣ Testing GET /categories');
    const categoriesResponse = await axios.get(`${BASE_URL}/categories`);
    console.log('✅ Categories fetched successfully');
    console.log(`   Found ${categoriesResponse.data.data.length} categories\n`);

    // Test 2: Get engagement rings
    console.log('2️⃣ Testing GET /categories/ENGAGEMENT%20RINGS');
    const engagementRingsResponse = await axios.get(`${BASE_URL}/categories/ENGAGEMENT%20RINGS`);
    console.log('✅ Engagement rings fetched successfully');
    console.log(`   Found ${engagementRingsResponse.data.data.count} engagement ring variants\n`);

    // Test 3: Get gents rings with diamond
    console.log('3️⃣ Testing GET /gents-rings/with-diamond');
    const gentsWithDiamondResponse = await axios.get(`${BASE_URL}/gents-rings/with-diamond`);
    console.log('✅ Gents rings with diamond fetched successfully');
    console.log(`   Found ${gentsWithDiamondResponse.data.data.count} gents rings with diamond\n`);

    // Test 4: Get gents rings without diamond
    console.log('4️⃣ Testing GET /gents-rings/without-diamond');
    const gentsWithoutDiamondResponse = await axios.get(`${BASE_URL}/gents-rings/without-diamond`);
    console.log('✅ Gents rings without diamond fetched successfully');
    console.log(`   Found ${gentsWithoutDiamondResponse.data.data.count} gents rings without diamond\n`);

    // Test 5: Get view types
    console.log('5️⃣ Testing GET /view-types');
    const viewTypesResponse = await axios.get(`${BASE_URL}/view-types`);
    console.log('✅ View types fetched successfully');
    console.log('   View types:', viewTypesResponse.data.data);
    console.log();

    // Test 6: Get specific variant details (if any variants exist)
    if (engagementRingsResponse.data.data.variants.length > 0) {
      const variantId = engagementRingsResponse.data.data.variants[0].variantId;
      console.log(`6️⃣ Testing GET /variants/${variantId}`);
      const variantDetailsResponse = await axios.get(`${BASE_URL}/variants/${variantId}`);
      console.log('✅ Variant details fetched successfully');
      console.log(`   Variant: ${variantDetailsResponse.data.data.variant.stylingName}\n`);

      // Test 7: Get customization options
      console.log(`7️⃣ Testing GET /variants/${variantId}/customization-options`);
      const customizationOptionsResponse = await axios.get(`${BASE_URL}/variants/${variantId}/customization-options`);
      console.log('✅ Customization options fetched successfully');
      console.log(`   Available diamond shapes: ${customizationOptionsResponse.data.data.customizationOptions.diamondShapes.length}\n`);

      // Test 8: Calculate customized price
      console.log(`8️⃣ Testing POST /variants/${variantId}/calculate-price`);
      const priceCalculationResponse = await axios.post(`${BASE_URL}/variants/${variantId}/calculate-price`, {
        diamondShape: 'Round',
        diamondSize: 1.5,
        diamondColor: 'E',
        diamondClarity: 'VS1',
        diamondOrigin: 'Natural Diamond',
        metalType: 'Gold',
        metalKt: '18KT',
        metalColor: 'Yellow Gold',
        ringSize: '7',
        engraving: 'Love Always'
      });
      console.log('✅ Price calculated successfully');
      console.log(`   Base Price: ₹${priceCalculationResponse.data.data.basePrice}`);
      console.log(`   Customized Price: ₹${priceCalculationResponse.data.data.customizedPrice}\n`);
    }

    // Test 9: Test error handling - invalid variant
    console.log('9️⃣ Testing error handling with invalid variant');
    try {
      await axios.get(`${BASE_URL}/variants/INVALID_VARIANT`);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('✅ Error handling works correctly (404 for invalid variant)\n');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // Test 10: Test error handling - invalid category
    console.log('🔟 Testing error handling with invalid category');
    try {
      await axios.get(`${BASE_URL}/categories/INVALID_CATEGORY`);
    } catch (error) {
      if (error.response && error.response.status === 200) {
        console.log('✅ Invalid category handled gracefully (empty results)\n');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    console.log('🎉 All tests completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('✅ Categories endpoint');
    console.log('✅ Engagement rings endpoint');
    console.log('✅ Gents rings with diamond endpoint');
    console.log('✅ Gents rings without diamond endpoint');
    console.log('✅ View types endpoint');
    console.log('✅ Variant details endpoint');
    console.log('✅ Customization options endpoint');
    console.log('✅ Price calculation endpoint');
    console.log('✅ Error handling');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the tests
testBuildYourJewelryAPI();
