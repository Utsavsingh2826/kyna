import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { generateStaticMetaFeed } from '../services/MetaFeedService';

dotenv.config();

/**
 * CLI script to trigger the Meta Dynamic Product Feed generation.
 * Run this via: npx ts-node src/scripts/build-meta-feed.ts
 */
const run = async () => {
  try {
    console.log('📦 Initializing Database Connection...');
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/kyna-jewels";
    const dbName = process.env.MONGO_DB_NAME || "catalog";

    await mongoose.connect(mongoUri, {
      dbName,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
    });

    console.log('✅ Connected to MongoDB.');

    const startTime = Date.now();
    const result = await generateStaticMetaFeed();
    const endTime = Date.now();

    const durationMinutes = ((endTime - startTime) / 60000).toFixed(2);
    console.log(`\n🎉 Meta Product Feed successfully built!`);
    console.log(`📊 Items processed: ${result.itemCount}`);
    console.log(`📂 Total chunks: ${result.totalChunks}`);
    console.log(`⏱️ Duration: ${durationMinutes} minutes`);

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Fatal Error during feed building:', error);
    process.exit(1);
  }
};

run();
