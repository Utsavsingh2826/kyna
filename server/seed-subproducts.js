const mongoose = require('mongoose');
require('dotenv').config();

// Import the seeder
const { seedSubProductData } = require('./dist/services/seedSubProductData');

const seedSubProducts = async () => {
  try {
    console.log('🌱 Starting SubProduct seeding process...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/kyna-jewels');
    console.log('✅ Connected to MongoDB');

    // Seed sub-product data
    await seedSubProductData();
    
    console.log('🎉 SubProduct seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding sub-products:', error);
    process.exit(1);
  }
};

// Run the seeder
seedSubProducts();
