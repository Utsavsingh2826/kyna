#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kyna-jewels';

// Your user ID
const USER_ID = '68c85306d7202412be3bb05a';

// Sample jewelry products to add to cart
const SAMPLE_PRODUCTS = [
  {
    sku: 'GR1-RD-70-2T-BR-RG',
    variant: 'GR1',
    title: 'Elegant Rose Gold Diamond Ring',
    description: 'Beautiful rose gold ring with round diamond',
    category: 'Gents Ring',
    subCategory: 'Ring',
    price: 45000,
    metal: 'Rose Gold',
    karat: 18,
    diamondShape: 'Round',
    diamondSize: 0.70,
    isGiftingAvailable: true,
    isEngraving: true,
    images: {
      main: 'https://via.placeholder.com/500?text=Rose+Gold+Ring',
      sub: ['https://via.placeholder.com/500?text=Rose+Gold+Ring+View+1', 'https://via.placeholder.com/500?text=Rose+Gold+Ring+View+2']
    }
  },
  {
    sku: 'SR2-PR-50-YG',
    variant: 'SR2',
    title: 'Classic Yellow Gold Princess Cut Ring',
    description: 'Stunning yellow gold ring with princess cut diamond',
    category: 'Solitaire',
    subCategory: 'Ring',
    price: 65000,
    metal: 'Yellow Gold',
    karat: 18,
    diamondShape: 'Princess',
    diamondSize: 0.50,
    isGiftingAvailable: true,
    isEngraving: false,
    images: {
      main: 'https://via.placeholder.com/500?text=Yellow+Gold+Ring',
      sub: ['https://via.placeholder.com/500?text=Yellow+Gold+Ring+View+1', 'https://via.placeholder.com/500?text=Yellow+Gold+Ring+View+2']
    }
  },
  {
    sku: 'PD1-RD-30-WG',
    variant: 'PD1',
    title: 'Delicate White Gold Diamond Pendant',
    description: 'Elegant white gold pendant with round diamond',
    category: 'Pendant',
    subCategory: 'Pendant',
    price: 35000,
    metal: 'White Gold',
    karat: 18,
    diamondShape: 'Round',
    diamondSize: 0.30,
    isGiftingAvailable: true,
    isEngraving: true,
    images: {
      main: 'https://via.placeholder.com/500?text=White+Gold+Pendant',
      sub: ['https://via.placeholder.com/500?text=White+Gold+Pendant+View+1', 'https://via.placeholder.com/500?text=White+Gold+Pendant+View+2']
    }
  },
  {
    sku: 'ER1-RD-25-RG',
    variant: 'ER1',
    title: 'Rose Gold Diamond Stud Earrings',
    description: 'Timeless rose gold earrings with diamond studs',
    category: 'Earring',
    subCategory: 'Earring',
    price: 28000,
    metal: 'Rose Gold',
    karat: 18,
    diamondShape: 'Round',
    diamondSize: 0.25,
    isGiftingAvailable: true,
    isEngraving: false,
    images: {
      main: 'https://via.placeholder.com/500?text=Rose+Gold+Earrings',
      sub: ['https://via.placeholder.com/500?text=Rose+Gold+Earrings+View+1', 'https://via.placeholder.com/500?text=Rose+Gold+Earrings+View+2']
    }
  },
  {
    sku: 'BR1-RD-100-PT',
    variant: 'BR1',
    title: 'Luxurious Platinum Diamond Bracelet',
    description: 'Premium platinum bracelet with diamonds',
    category: 'Bracelet',
    subCategory: 'Bracelet',
    price: 125000,
    metal: 'Platinum',
    karat: 95,
    diamondShape: 'Round',
    diamondSize: 1.00,
    isGiftingAvailable: true,
    isEngraving: false,
    images: {
      main: 'https://via.placeholder.com/500?text=Platinum+Bracelet',
      sub: ['https://via.placeholder.com/500?text=Platinum+Bracelet+View+1', 'https://via.placeholder.com/500?text=Platinum+Bracelet+View+2']
    }
  },
  {
    sku: 'NA1-OV-45-YG',
    variant: 'NA1',
    title: 'Elegant Yellow Gold Necklace',
    description: 'Sophisticated yellow gold necklace with oval diamond',
    category: 'Necklace',
    subCategory: 'Pendant',
    price: 55000,
    metal: 'Yellow Gold',
    karat: 22,
    diamondShape: 'Oval',
    diamondSize: 0.45,
    isGiftingAvailable: true,
    isEngraving: true,
    images: {
      main: 'https://via.placeholder.com/500?text=Yellow+Gold+Necklace',
      sub: ['https://via.placeholder.com/500?text=Necklace+View+1', 'https://via.placeholder.com/500?text=Necklace+View+2']
    }
  }
];

async function seedPersonalData() {
  try {
    console.log('\n🔗 Connecting to MongoDB...');
    console.log(`📍 URI: ${MONGO_URI}`);
    
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });
    console.log('✅ Connected to MongoDB!\n');

    // Define schemas (flexible schema to match existing db)
    const productSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });
    const cartSchema = new mongoose.Schema({}, { strict: false, collection: 'carts' });
    const userSchema = new mongoose.Schema({}, { strict: false, collection: 'users' });

    const Product = mongoose.model('Product', productSchema);
    const Cart = mongoose.model('Cart', cartSchema);
    const User = mongoose.model('User', userSchema);

    // Step 1: Verify user exists
    console.log('👤 Finding your user account...');
    const user = await User.findById(USER_ID);
    
    if (!user) {
      console.error(`  ❌ User not found with ID: ${USER_ID}`);
      process.exit(1);
    }
    console.log(`  ✅ Found user: ${user.firstName} ${user.lastName} (${user.email})`);

    // Step 2: Create or get products
    console.log('\n📦 Creating/fetching products...');
    const products = [];

    for (const productData of SAMPLE_PRODUCTS) {
      let product = await Product.findOne({ sku: productData.sku });
      if (!product) {
        product = await Product.create(productData);
        console.log(`  ✅ Created product: ${productData.sku} - ${productData.title}`);
      } else {
        console.log(`  ℹ️  Product exists: ${productData.sku} - ${productData.title}`);
      }
      products.push(product);
    }

    // Step 3: Create or update cart with sample items
    console.log('\n🛒 Creating/updating your cart...');
    
    let cart = await Cart.findOne({ user: USER_ID });
    
    if (cart) {
      console.log(`  ℹ️  Cart exists for your account`);
      console.log(`  📊 Current items in cart: ${cart.items ? cart.items.length : 0}`);
      
      // Clear existing items
      if (cart.items) {
        cart.items = [];
      }
    } else {
      cart = await Cart.create({
        user: USER_ID,
        items: []
      });
      console.log(`  ✅ Created new cart for your account`);
    }

    // Add items to cart (first 4 products)
    const itemsToAdd = 4;
    for (let i = 0; i < Math.min(itemsToAdd, products.length); i++) {
      const product = products[i];
      const quantity = 1;
      
      cart.items.push({
        product: product._id,
        quantity: quantity,
        price: product.price
      });
      console.log(`  ➕ Added to cart: ${product.title} (Qty: ${quantity}) - ₹${product.price}`);
    }

    // Save cart with items
    cart.totalAmount = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    await cart.save();
    console.log(`  ✅ Cart saved with ${cart.items.length} items`);
    console.log(`  💰 Total amount: ₹${cart.totalAmount}`);

    // Step 4: Display summary
    console.log('\n' + '='.repeat(70));
    console.log('🎉 YOUR CART SEEDING COMPLETE!');
    console.log('='.repeat(70));
    console.log(`
👤 Your Account:
  ✅ Name: ${user.firstName} ${user.lastName}
  ✅ Email: ${user.email}
  ✅ Phone: ${user.phone}
  ✅ User ID: ${user._id}
  ✅ Orders: ${user.orders.length}

📦 Products Created:
  ✅ Total products in database: ${products.length}

🛒 Your Cart:
  ✅ Cart ID: ${cart._id}
  ✅ Items in cart: ${cart.items.length}
  💰 Total cart value: ₹${cart.totalAmount}

📝 Your Cart Items:
${cart.items.map((item, idx) => {
  const product = products.find(p => p._id.toString() === item.product.toString());
  return `  ${idx + 1}. ${product?.title || 'Unknown'} (Qty: ${item.quantity}) - ₹${item.price * item.quantity}`;
}).join('\n')}

🌐 Next Steps:
  1. Open: http://localhost:5173 (or your frontend URL)
  2. Login with: ${user.email}
  3. Go to your Cart
  4. You should see ${cart.items.length} items
  5. Total: ₹${cart.totalAmount}
  6. Try updating quantities, removing items, or checkout!

💡 Test Features:
  ✓ Add/Remove items from cart
  ✓ Update quantities
  ✓ See cart total update
  ✓ Proceed to checkout
  ✓ Apply coupon codes
  ✓ View order history
    `);

    console.log('='.repeat(70));

  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Cannot connect to MongoDB. Make sure:');
      console.error('  1. MongoDB is running (mongod)');
      console.error('  2. Connection URI is correct: ' + MONGO_URI);
    }
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run seeding
seedPersonalData();
