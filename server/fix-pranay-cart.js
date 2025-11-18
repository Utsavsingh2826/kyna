#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kyna-jewels';
const USER_ID = '68c85306d7202412be3bb05a';

async function fixCart() {
  try {
    console.log('\n🔧 Fixing your cart...');
    console.log(`📍 Connecting to: ${MONGO_URI}`);
    
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });
    console.log('✅ Connected!\n');

    const productSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });
    const cartSchema = new mongoose.Schema({}, { strict: false, collection: 'carts' });
    const userSchema = new mongoose.Schema({}, { strict: false, collection: 'users' });

    const Product = mongoose.model('Product', productSchema);
    const Cart = mongoose.model('Cart', cartSchema);
    const User = mongoose.model('User', userSchema);

    // Step 1: Get all products
    console.log('📦 Fetching products...');
    const products = await Product.find({}).limit(4);
    console.log(`✅ Found ${products.length} products`);

    if (products.length === 0) {
      console.error('❌ No products found! Please seed products first.');
      process.exit(1);
    }

    // Step 2: Delete old empty carts for this user
    console.log('\n🗑️  Cleaning up old carts...');
    const userObjectId = new mongoose.Types.ObjectId(USER_ID);
    const deleteResult = await Cart.deleteMany({ 
      user: { $in: [USER_ID, userObjectId] } 
    });
    console.log(`✅ Deleted ${deleteResult.deletedCount} old cart(s)`);

    // Step 3: Create new cart with items
    console.log('\n🛒 Creating new cart with items...');
    
    const cartItems = products.map((product, idx) => ({
      product: product._id,
      quantity: 1,
      price: product.price
    }));

    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const newCart = await Cart.create({
      user: userObjectId,
      items: cartItems,
      totalAmount: totalAmount
    });

    console.log(`✅ Created new cart: ${newCart._id}`);
    console.log(`✅ Added ${cartItems.length} items`);
    console.log(`✅ Total: ₹${totalAmount}`);

    // Step 4: Verify
    console.log('\n✔️  Verifying cart...');
    const verifyCart = await Cart.findById(newCart._id).populate('items.product', 'title price');
    
    console.log('\n' + '='.repeat(70));
    console.log('🎉 CART FIXED AND POPULATED!');
    console.log('='.repeat(70));
    console.log(`
Cart ID: ${verifyCart._id}
User ID: ${verifyCart.user}
Items: ${verifyCart.items.length}
Total: ₹${verifyCart.totalAmount}

Items in Cart:
${verifyCart.items.map((item, idx) => `  ${idx + 1}. ${item.product?.title || 'Product'} - ₹${item.price} (Qty: ${item.quantity})`).join('\n')}

📝 Next Steps:
  1. Refresh your browser
  2. Go to Cart page
  3. You should now see your items!
  4. Total: ₹${verifyCart.totalAmount}
    `);
    console.log('='.repeat(70));

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database closed');
  }
}

fixCart();
