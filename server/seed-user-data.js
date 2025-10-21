const mongoose = require('mongoose');
const User = require('./src/models/userModel').default;
const Product = require('./src/models/productModel').default;
const Cart = require('./src/models/cartModel').default;

async function seedUserData() {
  try {
    console.log('🌱 Starting user data seeding...');
    
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/kynajewels');
    console.log('✅ Connected to database');

    // Step 1: Create or find the user
    console.log('\n👤 Step 1: Creating/finding user...');
    let user = await User.findOne({ email: 'utsavsingh2826@gmail.com' });
    
    if (!user) {
      user = new User({
        email: 'utsavsingh2826@gmail.com',
        password: 'password123', // Will be hashed by pre-save hook
        name: 'Utsav Singh',
        firstName: 'Utsav',
        lastName: 'Singh',
        phone: '+91-9876543210',
        country: 'India',
        state: 'Delhi',
        city: 'New Delhi',
        zipCode: '110001',
        isVerified: true, // Set as verified for testing
        role: 'customer',
        isActive: true,
        availableOffers: 2
      });
      
      await user.save();
      console.log('✅ User created successfully');
    } else {
      console.log('✅ User already exists');
    }
    
    console.log(`📧 Email: ${user.email}`);
    console.log(`🆔 User ID: ${user._id}`);

    // Step 2: Create sample products if they don't exist
    console.log('\n💎 Step 2: Creating sample products...');
    const sampleProducts = [
      {
        sku: 'GR1-RD-70-2T-BR-RG-001',
        variant: 'GR1',
        title: 'Diamond Engagement Ring',
        description: 'Beautiful diamond engagement ring with 1 carat center stone',
        category: 'Engagement Ring',
        subCategory: 'Ring',
        price: 150000,
        images: {
          main: 'https://example.com/ring1-main.jpg',
          sub: [
            'https://example.com/ring1-1.jpg',
            'https://example.com/ring1-2.jpg',
            'https://example.com/ring1-3.jpg'
          ]
        },
        diamondShape: 'RD',
        diamondSize: 1.0,
        metal: 'RG',
        karat: 18,
        rating: { score: 4.8, reviews: 25 },
        isEngraving: true,
        isGiftingAvailable: true
      },
      {
        sku: 'NC1-GD-50-YG-002',
        variant: 'NC1',
        title: 'Gold Necklace Set',
        description: 'Elegant gold necklace set with matching earrings',
        category: 'Necklace Set',
        subCategory: 'Pendant',
        price: 85000,
        images: {
          main: 'https://example.com/necklace1-main.jpg',
          sub: [
            'https://example.com/necklace1-1.jpg',
            'https://example.com/necklace1-2.jpg'
          ]
        },
        metal: 'YG',
        karat: 22,
        rating: { score: 4.6, reviews: 18 },
        isEngraving: false,
        isGiftingAvailable: true
      },
      {
        sku: 'BR1-PR-30-WG-003',
        variant: 'BR1',
        title: 'Pearl Bracelet',
        description: 'Classic pearl bracelet perfect for any occasion',
        category: 'Bracelet',
        subCategory: 'Bracelet',
        price: 25000,
        images: {
          main: 'https://example.com/bracelet1-main.jpg',
          sub: [
            'https://example.com/bracelet1-1.jpg',
            'https://example.com/bracelet1-2.jpg'
          ]
        },
        metal: 'WG',
        karat: 14,
        rating: { score: 4.7, reviews: 32 },
        isEngraving: false,
        isGiftingAvailable: true
      },
      {
        sku: 'ER1-EM-40-YG-004',
        variant: 'ER1',
        title: 'Emerald Earrings',
        description: 'Stunning emerald earrings with diamond accents',
        category: 'Earrings',
        subCategory: 'Earring',
        price: 45000,
        images: {
          main: 'https://example.com/earrings1-main.jpg',
          sub: [
            'https://example.com/earrings1-1.jpg',
            'https://example.com/earrings1-2.jpg'
          ]
        },
        metal: 'YG',
        karat: 18,
        rating: { score: 4.9, reviews: 12 },
        isEngraving: false,
        isGiftingAvailable: true
      },
      {
        sku: 'PD1-SP-35-RG-005',
        variant: 'PD1',
        title: 'Sapphire Pendant',
        description: 'Exquisite sapphire pendant on gold chain',
        category: 'Pendant',
        subCategory: 'Pendant',
        price: 35000,
        images: {
          main: 'https://example.com/pendant1-main.jpg',
          sub: [
            'https://example.com/pendant1-1.jpg',
            'https://example.com/pendant1-2.jpg'
          ]
        },
        metal: 'RG',
        karat: 18,
        rating: { score: 4.5, reviews: 20 },
        isEngraving: true,
        isGiftingAvailable: true
      }
    ];

    const createdProducts = [];
    for (const productData of sampleProducts) {
      let product = await Product.findOne({ sku: productData.sku });
      if (!product) {
        product = new Product(productData);
        await product.save();
        console.log(`✅ Created product: ${product.title}`);
      } else {
        console.log(`✅ Product already exists: ${product.title}`);
      }
      createdProducts.push(product);
    }

    // Step 3: Create cart with items
    console.log('\n🛒 Step 3: Creating cart with items...');
    
    // Clear existing cart for this user
    await Cart.deleteOne({ user: user._id });
    
    const cartItems = [
      {
        product: createdProducts[0]._id, // Diamond Engagement Ring
        quantity: 1,
        price: createdProducts[0].price
      },
      {
        product: createdProducts[1]._id, // Gold Necklace Set
        quantity: 1,
        price: createdProducts[1].price
      },
      {
        product: createdProducts[2]._id, // Pearl Bracelet
        quantity: 2,
        price: createdProducts[2].price
      }
    ];

    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const cart = new Cart({
      user: user._id,
      items: cartItems,
      totalAmount: totalAmount
    });

    await cart.save();
    console.log('✅ Cart created successfully');
    console.log(`📦 Cart items: ${cartItems.length}`);
    console.log(`💰 Total amount: ₹${totalAmount.toLocaleString()}`);

    // Step 4: Add items to wishlist
    console.log('\n❤️ Step 4: Adding items to wishlist...');
    
    const wishlistItems = [
      createdProducts[3]._id, // Emerald Earrings
      createdProducts[4]._id  // Sapphire Pendant
    ];

    user.wishlist = wishlistItems;
    await user.save();
    console.log('✅ Wishlist updated successfully');
    console.log(`❤️ Wishlist items: ${wishlistItems.length}`);

    // Step 5: Display summary
    console.log('\n🎉 User data seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`👤 User: ${user.name} (${user.email})`);
    console.log(`🛒 Cart items: ${cartItems.length}`);
    console.log(`💰 Cart total: ₹${totalAmount.toLocaleString()}`);
    console.log(`❤️ Wishlist items: ${wishlistItems.length}`);
    console.log(`💎 Products available: ${createdProducts.length}`);

    console.log('\n🛒 Cart Details:');
    cartItems.forEach((item, index) => {
      const product = createdProducts.find(p => p._id.equals(item.product));
      console.log(`  ${index + 1}. ${product.title} - Qty: ${item.quantity} - ₹${item.price.toLocaleString()}`);
    });

    console.log('\n❤️ Wishlist Details:');
    wishlistItems.forEach((productId, index) => {
      const product = createdProducts.find(p => p._id.equals(productId));
      console.log(`  ${index + 1}. ${product.title} - ₹${product.price.toLocaleString()}`);
    });

  } catch (error) {
    console.error('❌ Error seeding user data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the seeding
if (require.main === module) {
  seedUserData();
}

module.exports = seedUserData;
