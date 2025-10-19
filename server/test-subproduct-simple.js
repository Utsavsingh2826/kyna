const mongoose = require('mongoose');
require('dotenv').config();

const testSubProduct = async () => {
  try {
    console.log('🧪 Testing SubProduct functionality...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/kyna-jewels');
    console.log('✅ Connected to MongoDB');

    // Import the SubProduct model
    const SubProduct = require('./dist/models/subProductModel').default;
    
    // Test 1: Get all sub-products
    console.log('\n1️⃣ Testing SubProduct.find()...');
    const subProducts = await SubProduct.find({ isActive: true });
    console.log(`✅ Found ${subProducts.length} sub-products`);
    
    if (subProducts.length > 0) {
      const firstSubProduct = subProducts[0];
      console.log(`📊 First sub-product: ${firstSubProduct.displayName}`);
      console.log(`📊 Category: ${firstSubProduct.category}`);
      console.log(`📊 Sub-category: ${firstSubProduct.subCategory}`);
      console.log(`📊 View type: ${firstSubProduct.viewType}`);
      console.log(`📊 Price range: ₹${firstSubProduct.priceRange.min} - ₹${firstSubProduct.priceRange.max}`);
      console.log(`📊 Product variants: ${firstSubProduct.productVariants.length}`);
      console.log(`📊 Featured variants: ${firstSubProduct.featuredVariants.length}`);
    }

    // Test 2: Get sub-products by category
    console.log('\n2️⃣ Testing SubProduct.find({ category: "RINGS" })...');
    const ringSubProducts = await SubProduct.find({ category: 'RINGS', isActive: true });
    console.log(`✅ Found ${ringSubProducts.length} ring sub-products`);

    // Test 3: Get featured sub-products
    console.log('\n3️⃣ Testing SubProduct.find({ isFeatured: true })...');
    const featuredSubProducts = await SubProduct.find({ isFeatured: true, isActive: true });
    console.log(`✅ Found ${featuredSubProducts.length} featured sub-products`);

    // Test 4: Search sub-products
    console.log('\n4️⃣ Testing SubProduct.find({ $or: [...] })...');
    const searchResults = await SubProduct.find({
      $or: [
        { displayName: { $regex: 'fashion', $options: 'i' } },
        { description: { $regex: 'fashion', $options: 'i' } },
        { tags: { $in: [new RegExp('fashion', 'i')] } }
      ],
      isActive: true
    });
    console.log(`✅ Found ${searchResults.length} search results for "fashion"`);

    // Test 5: Get sub-product by ID
    if (subProducts.length > 0) {
      console.log('\n5️⃣ Testing SubProduct.findById()...');
      const subProductById = await SubProduct.findById(subProducts[0]._id);
      console.log(`✅ Found sub-product by ID: ${subProductById?.displayName}`);
    }

    // Test 6: Get sub-product by slug
    if (subProducts.length > 0) {
      console.log('\n6️⃣ Testing SubProduct.findOne({ slug: "..." })...');
      const subProductBySlug = await SubProduct.findOne({ 
        slug: subProducts[0].slug, 
        isActive: true 
      });
      console.log(`✅ Found sub-product by slug: ${subProductBySlug?.displayName}`);
    }

    // Test 7: Get filters
    console.log('\n7️⃣ Testing SubProduct.distinct()...');
    const categories = await SubProduct.distinct('category', { isActive: true });
    const subCategories = await SubProduct.distinct('subCategory', { isActive: true });
    const tags = await SubProduct.distinct('tags', { isActive: true });
    console.log(`✅ Categories: ${categories.length}`);
    console.log(`✅ Sub-categories: ${subCategories.length}`);
    console.log(`✅ Tags: ${tags.length}`);

    console.log('\n🎉 All SubProduct functionality tests passed!');
    console.log('\n📋 Summary:');
    console.log(`   - Total sub-products: ${subProducts.length}`);
    console.log(`   - Ring sub-products: ${ringSubProducts.length}`);
    console.log(`   - Featured sub-products: ${featuredSubProducts.length}`);
    console.log(`   - Search results: ${searchResults.length}`);
    console.log(`   - Categories: ${categories.join(', ')}`);
    console.log(`   - Sub-categories: ${subCategories.join(', ')}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
};

// Run the test
testSubProduct();
