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
    
    console.log('\n========== IMAGE SAMPLES FROM DIFFERENT CATEGORIES ==========');
    
    // Get samples from different categories
    const categories = ['BRACELETS', 'GENTS RINGS', 'SOLITAIRE RINGS and ENGAGEMENT RINGS', 'EARINGS'];
    
    for (const cat of categories) {
      const doc = await collection.findOne({ category: cat });
      
      if (doc) {
        console.log(`\n--- ${cat} ---`);
        console.log(`SKU: ${doc.variantSku}`);
        
        if (doc.images && Array.isArray(doc.images) && doc.images.length > 0) {
          const firstImg = doc.images[0];
          console.log(`First image URL: ${firstImg.url}`);
          console.log(`Metadata: color=${firstImg.color}, metalType=${firstImg.metalType}, metalKt=${firstImg.metalKt}`);
          
          // Show 2 more image URLs
          console.log(`Other image URLs:`);
          doc.images.slice(1, 3).forEach((img: any, idx: number) => {
            console.log(`  ${idx + 1}. ${img.url}`);
          });
        }
      } else {
        console.log(`\n--- ${cat} ---`);
        console.log('(No documents found)');
      }
    }
    
  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

main();
