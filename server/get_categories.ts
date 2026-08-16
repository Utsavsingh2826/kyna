import 'dotenv/config';
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI as string;
if (!MONGO_URI) {
  console.error('MONGO_URI is not set. Add it to server/.env');
  process.exit(1);
}

async function main() {
  try {
    await mongoose.connect(MONGO_URI);
    const catalogDb = mongoose.connection.useDb('catalog');
    const collection = catalogDb.collection('variants2');
    
    // Get distinct categories
    const categories = await collection.distinct('category');
    console.log(`All categories in variants2: ${categories.length} total`);
    categories.forEach(cat => console.log(`  - ${cat}`));
    
    // Get sample from each category
    console.log('\n========== SAMPLE FROM EACH CATEGORY ==========');
    for (const cat of categories.slice(0, 5)) {
      const doc = await collection.findOne({ category: cat });
      if (doc && doc.images && doc.images.length > 0) {
        console.log(`\n${cat}: ${doc.variantSku}`);
        console.log(`  Image: ${doc.images[0].url}`);
      }
    }
    
  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

main();
