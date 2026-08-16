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
    
    console.log('\n========== VARIANTS2 - IMAGE URL DETAILS ==========');
    const samples = await collection.find({}).limit(3).toArray();
    
    samples.forEach((doc: any, idx: number) => {
      console.log(`\n--- VARIANT ${idx + 1} ---`);
      console.log(`SKU: ${doc.variantSku}`);
      console.log(`Parent SKU: ${doc.parentSku}`);
      console.log(`Category: ${doc.category}`);
      
      if (doc.images && Array.isArray(doc.images)) {
        console.log(`\nImages array (${doc.images.length} total):`);
        doc.images.slice(0, 3).forEach((img: any, imgIdx: number) => {
          console.log(`  [${imgIdx}]:`, typeof img === 'string' ? img : JSON.stringify(img));
        });
      }
    });
    
    // Get count
    const count = await collection.countDocuments();
    console.log(`\n========== STATISTICS ==========`);
    console.log(`Total variants: ${count}`);
    
    // Sample SKUs
    const skus = await collection.distinct('variantSku', {});
    console.log(`\nSample SKUs:`);
    skus.slice(0, 5).forEach(sku => console.log(`  - ${sku}`));
    
  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

main();
