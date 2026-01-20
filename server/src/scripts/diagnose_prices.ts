
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Try to load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/kyna-jewels";

console.log('Connecting to:', MONGO_URI);

const productSchema = new mongoose.Schema({
    title: String,
    price: Number,
    category: String,
    subCategory: String
}, { strict: false });

const Product = mongoose.model('Product', productSchema);

async function diagnose() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const total = await Product.countDocuments({});
        console.log(`Total Products: ${total}`);

        const under25k = await Product.countDocuments({ price: { $lte: 25000 } });
        console.log(`Products <= 25000: ${under25k}`);

        const range25to50 = await Product.countDocuments({ price: { $gt: 25000, $lte: 50000 } });
        console.log(`Products 25000 < price <= 50000: ${range25to50}`);

        if (under25k === 0) {
            // Find minimum price
            const minPriceProduct = await Product.findOne().sort({ price: 1 }).select('price title');
            console.log('Cheapest product found:', minPriceProduct);
        } else {
            const samples = await Product.find({ price: { $lte: 25000 } }).limit(5).select('title price');
            console.log('Samples <= 25000:', samples);
        }

        if (range25to50 > 0) {
            const samples = await Product.find({ price: { $gt: 25000, $lte: 50000 } }).limit(5).select('title price');
            console.log('Samples 25-50k:', samples);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

diagnose();
