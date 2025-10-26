const mongoose = require('mongoose');
const User = require('./src/models/userModel').default;
const Cart = require('./src/models/cartModel').default;
const Product = require('./src/models/productModel').default;

async function checkUserData() {
  try {
    console.log('🔍 Checking user data...');
    
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/kynajewels');
    console.log('✅ Connected to database');

    // Find the user
    const user = await User.findOne({ email: 'utsavsingh2826@gmail.com' });
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log(`\n👤 User: ${user.name} (${user.email})`);
    console.log(`🆔 User ID: ${user._id}`);

    // Check cart
    const cart = await Cart.findOne({ user: user._id }).populate('items.product');
    console.log(`\n🛒 Cart exists: ${cart ? 'Yes' : 'No'}`);
    if (cart) {
      console.log(`🛒 Cart items: ${cart.items.length}`);
      console.log(`💰 Cart total: ₹${cart.totalAmount.toLocaleString()}`);
      if (cart.items.length > 0) {
        console.log('Cart items:');
        cart.items.forEach((item, i) => {
          console.log(`  ${i + 1}. ${item.product.title} - Qty: ${item.quantity} - ₹${item.price.toLocaleString()}`);
        });
      }
    }

    // Check wishlist
    console.log(`\n❤️ Wishlist items: ${user.wishlist.length}`);
    if (user.wishlist.length > 0) {
      const wishlistProducts = await Product.find({ _id: { $in: user.wishlist } });
      console.log('Wishlist items:');
      wishlistProducts.forEach((product, i) => {
        console.log(`  ${i + 1}. ${product.title} - ₹${product.price.toLocaleString()}`);
      });
    }

    // Check available products
    const products = await Product.find({});
    console.log(`\n💎 Available products: ${products.length}`);
    if (products.length > 0) {
      console.log('Available products:');
      products.forEach((product, i) => {
        console.log(`  ${i + 1}. ${product.title} - ₹${product.price.toLocaleString()}`);
      });
    }

    console.log('\n📊 Summary:');
    console.log(`👤 User: ${user.name}`);
    console.log(`🛒 Cart: ${cart ? cart.items.length : 0} items`);
    console.log(`❤️ Wishlist: ${user.wishlist.length} items`);
    console.log(`💎 Products: ${products.length} available`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the check
if (require.main === module) {
  checkUserData();
}

module.exports = checkUserData;
