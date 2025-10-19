import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SeedBuildYourJewelryData from '../services/seedBuildYourJewelryData';
import BOMService from '../services/bomService';

// Load environment variables
dotenv.config();

/**
 * Initialize Build Your Jewelry Data Script
 * This script seeds the database with initial data for the Build Your Jewelry functionality
 */
async function initializeBuildYourJewelryData() {
  try {
    console.log('🚀 Starting Build Your Jewelry data initialization...');

    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/kyna-jewels';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Initialize seed service
    const seedService = new SeedBuildYourJewelryData();
    const bomService = new BOMService();

    // Seed customization options
    console.log('📝 Seeding customization options...');
    await seedService.seedCustomizationOptions();

    // Seed BOM data
    console.log('📊 Seeding BOM data...');
    await seedService.seedBOMData();

    // Create product variants from BOM data
    console.log('🔧 Creating product variants from BOM data...');
    await bomService.createProductVariantsFromBOM();

    console.log('✅ Build Your Jewelry data initialization completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- Customization options seeded');
    console.log('- BOM data seeded');
    console.log('- Product variants created');
    console.log('\n🎉 You can now use the Build Your Jewelry API endpoints!');

  } catch (error) {
    console.error('❌ Error initializing Build Your Jewelry data:', error);
    process.exit(1);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  }
}

// Run the initialization
initializeBuildYourJewelryData();
