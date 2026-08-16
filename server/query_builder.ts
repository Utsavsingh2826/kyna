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
    
    // Check builder and variants2 collections
    const collections = ['builder', 'variants2', 'rings'];
    
    for (const collName of collections) {
      const collection = catalogDb.collection(collName);
      const count = await collection.countDocuments();
      console.log(`\n========== ${collName.toUpperCase()} ==========`);
      console.log(`Total documents: ${count}`);
      
      if (count > 0) {
        // Show detailed samples
        const samples = await collection.find({}).limit(3).toArray();
        samples.forEach((doc: any, idx: number) => {
          console.log(`\n--- ${collName} SAMPLE ${idx + 1} ---`);
          
          // Show all keys
          const keys = Object.keys(doc);
          console.log('Fields:', keys.join(', '));
          
          // Show image-related fields
          const imageKeys = keys.filter(k => 
            k.toLowerCase().includes('image') || k.toLowerCase().includes('img')
          );
          
          if (imageKeys.length > 0) {
            console.log('\nImage fields:');
            imageKeys.forEach(key => {
              const val = doc[key];
              if (typeof val === 'string') {
                console.log(`  ${key}: ${val}`);
              } else if (Array.isArray(val)) {
                console.log(`  ${key}: [${val.length} items]`);
                if (val.length > 0 && typeof val[0] === 'string') {
                  console.log(`    First: ${val[0]}`);
                }
              } else {
                console.log(`  ${key}: ${JSON.stringify(val).substring(0, 150)}`);
              }
            });
          }
          
          // Show SKU-like fields
          const skuKeys = keys.filter(k => 
            k.toLowerCase().includes('sku') || k.toLowerCase().includes('variant') || k.toLowerCase().includes('id')
          );
          if (skuKeys.length > 0) {
            console.log('\nIdentifier fields:');
            skuKeys.forEach(key => {
              console.log(`  ${key}: ${doc[key]}`);
            });
          }
        });
      }
    }
    
  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

main();
