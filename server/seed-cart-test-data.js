#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kyna-jewels';

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

async function seedCartData() {
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

    // Step 1: Create or get products
    console.log('📦 Creating/fetching products...');
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

    // Step 2: Find or create test user
    console.log('\n👤 Finding/creating test user...');
    let testUser = await User.findOne({ email: 'test@example.com' });
    
    if (!testUser) {
      testUser = await User.create({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '9876543210',
        password: 'hashedpassword123',
        role: 'user'
      });
      console.log(`  ✅ Created test user: ${testUser.email}`);
    } else {
      console.log(`  ℹ️  Test user exists: ${testUser.email}`);
    }

    // Step 3: Create or update cart with sample items
    console.log('\n🛒 Creating/updating cart...');
    
    let cart = await Cart.findOne({ user: testUser._id });
    
    if (cart) {
      console.log(`  ℹ️  Cart exists for user: ${testUser._id}`);
      console.log(`  📊 Current items in cart: ${cart.items ? cart.items.length : 0}`);
      
      // Clear existing items
      if (cart.items) {
        cart.items = [];
      }
    } else {
      cart = await Cart.create({
        user: testUser._id,
        items: []
      });
      console.log(`  ✅ Created new cart for user: ${testUser._id}`);
    }

    // Add items to cart (first 3 products)
    for (let i = 0; i < Math.min(3, products.length); i++) {
      const product = products[i];
      const quantity = i === 0 ? 1 : 1; // Mix of quantities
      
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
    console.log('\n' + '='.repeat(60));
    console.log('🎉 SEEDING COMPLETE!');
    console.log('='.repeat(60));
    console.log(`
📊 Summary:
  ✅ Products created/verified: ${products.length}
  ✅ Test user: ${testUser.email}
  ✅ Cart items: ${cart.items.length}
  💰 Total cart value: ₹${cart.totalAmount}

🔑 Test Credentials:
  Email: test@example.com
  User ID: ${testUser._id}
  Cart ID: ${cart._id}

🛍️  Cart Items:
${cart.items.map((item, idx) => {
  const product = products.find(p => p._id.toString() === item.product.toString());
  return `  ${idx + 1}. ${product?.title || 'Unknown'} (Qty: ${item.quantity}) - ₹${item.price * item.quantity}`;
}).join('\n')}

📝 Next Steps:
  1. Login with email: test@example.com
  2. Go to cart page
  3. You should see ${cart.items.length} items in your cart
  4. Total: ₹${cart.totalAmount}
    `);

    console.log('='.repeat(60));

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
seedCartData();
