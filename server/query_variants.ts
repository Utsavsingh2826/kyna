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
    
    // Check each potential product collection
    const collectionNames = ['products', 'products2', 'variants2', 'productvariants', 'rings', 'builder'];
    
    for (const collName of collectionNames) {
      const collection = catalogDb.collection(collName);
      const count = await collection.countDocuments();
      console.log(`${collName}: ${count} documents`);
      
      if (count > 0) {
        console.log(`\n========== SAMPLE FROM ${collName.toUpperCase()} ==========`);
        const sample = await collection.findOne();
        console.log(JSON.stringify(sample, null, 2));
        
        // Get 2-3 more samples
        console.log(`\n========== 3 SAMPLES - KEY FIELDS FROM ${collName.toUpperCase()} ==========`);
        const samples = await collection.find({}).limit(3).toArray();
        samples.forEach((doc: any, idx: number) => {
          console.log(`\n--- ${collName} ${idx + 1} ---`);
          
          // Show SKU or ID
          if (doc.sku) console.log(`SKU: ${doc.sku}`);
          if (doc._id) console.log(`ID: ${doc._id}`);
          if (doc.variantId) console.log(`VariantID: ${doc.variantId}`);
          
          // Show image fields
          const imageKeys = Object.keys(doc).filter(k => 
            k.toLowerCase().includes('image') || k.toLowerCase().includes('img')
          );
          
          if (imageKeys.length > 0) {
            console.log('Image fields:');
            imageKeys.forEach(key => {
              const val = doc[key];
              if (typeof val === 'string' || Array.isArray(val)) {
                console.log(`  ${key}: ${JSON.stringify(val).substring(0, 200)}`);
              }
            });
          }
        });
        break;
      }
    }
    
  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

main();
