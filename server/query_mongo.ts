import 'dotenv/config';
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI as string;
if (!MONGO_URI) {
  console.error('MONGO_URI is not set. Add it to server/.env');
  process.exit(1);
}

async function main() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection;
    
    // Get catalog database
    const catalogDb = db.useDb('catalog');
    
    // List collections
    console.log('\n========== COLLECTIONS IN CATALOG DATABASE ==========');
    const collections = await catalogDb.db.listCollections().toArray();
    collections.forEach(coll => console.log(`- ${coll.name}`));
    
    // Get products collection
    const productsCollection = catalogDb.collection('products');
    
    // Count documents
    const count = await productsCollection.countDocuments();
    console.log(`\n========== PRODUCT COUNT ==========\nTotal products: ${count}`);
    
    // Find one product with all fields
    console.log('\n========== FIRST PRODUCT (COMPLETE DOCUMENT) ==========');
    const product = await productsCollection.findOne();
    console.log(JSON.stringify(product, null, 2));
    
    // Find 2-3 products showing SKU and image fields
    console.log('\n========== 3 SAMPLE PRODUCTS - IMAGE FIELDS ==========');
    const samples = await productsCollection
      .find({})
      .limit(3)
      .toArray();
    
    samples.forEach((prod: any, idx: number) => {
      console.log(`\n--- Product ${idx + 1} ---`);
      console.log(`SKU: ${prod.sku || 'N/A'}`);
      console.log(`Title: ${prod.title || 'N/A'}`);
      
      // Get all keys that contain "image" or "img"
      const imageKeys = Object.keys(prod).filter(k => 
        k.toLowerCase().includes('image') || k.toLowerCase().includes('img')
      );
      
      if (imageKeys.length > 0) {
        console.log('Image-related fields:');
        imageKeys.forEach(key => {
          console.log(`  ${key}:`, prod[key]);
        });
      }
    });
    
  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

main();
