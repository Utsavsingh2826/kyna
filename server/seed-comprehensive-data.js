const mongoose = require('mongoose');

// MongoDB URI
const MONGO_URI = 'mongodb://localhost:27017/kyna-jewels';

// User IDs from the provided data
const USER_IDS = {
  aditya: '68f7f452330878c13e49f6dc',
  addy: '68f7f4ff330878c13e49f6e4'
};

// Comprehensive Products Data (20 products)
const productsData = [
  // Rings (8 products)
  {
    sku: 'GR1-RD-70-RG',
    variant: 'GR1',
    title: 'Elegant Rose Gold Diamond Ring',
    description: 'Beautiful rose gold ring with round diamond',
    category: 'Gents Ring',
    subCategory: 'Ring',
    price: 45000,
    metal: 'RG',
    karat: 18,
    diamondShape: 'RD',
    diamondSize: 0.70,
    isGiftingAvailable: true,
    isEngraving: true
  },
  {
    sku: 'SR2-PR-50-YG',
    variant: 'SR2',
    title: 'Classic Yellow Gold Princess Cut Ring',
    description: 'Stunning yellow gold ring with princess cut diamond',
    category: 'Solitaire',
    subCategory: 'Ring',
    price: 65000,
    metal: 'YG',
    karat: 18,
    diamondShape: 'PR',
    diamondSize: 0.50,
    isGiftingAvailable: true,
    isEngraving: false
  },
  {
    sku: 'ER3-EM-80-WG',
    variant: 'ER3',
    title: 'Exquisite White Gold Emerald Ring',
    description: 'Sophisticated white gold ring with emerald cut diamond',
    category: 'Engagement Ring',
    subCategory: 'Ring',
    price: 85000,
    metal: 'WG',
    karat: 18,
    diamondShape: 'EM',
    diamondSize: 0.80,
    isGiftingAvailable: true,
    isEngraving: true
  },
  {
    sku: 'GR4-OV-60-RG',
    variant: 'GR4',
    title: 'Modern Rose Gold Oval Diamond Ring',
    description: 'Contemporary design with oval diamond',
    category: 'Gents Ring',
    subCategory: 'Ring',
    price: 52000,
    metal: 'RG',
    karat: 18,
    diamondShape: 'OV',
    diamondSize: 0.60,
    isGiftingAvailable: true,
    isEngraving: true
  },
  {
    sku: 'SR5-CS-90-PT',
    variant: 'SR5',
    title: 'Luxury Platinum Cushion Cut Ring',
    description: 'Premium platinum ring with cushion cut diamond',
    category: 'Solitaire',
    subCategory: 'Ring',
    price: 145000,
    metal: 'PT',
    karat: 22,
    diamondShape: 'CS',
    diamondSize: 0.90,
    isGiftingAvailable: true,
    isEngraving: false
  },
  {
    sku: 'ER6-HT-45-RG',
    variant: 'ER6',
    title: 'Romantic Rose Gold Heart Diamond Ring',
    description: 'Romantic heart-shaped diamond in rose gold',
    category: 'Engagement Ring',
    subCategory: 'Ring',
    price: 48000,
    metal: 'RG',
    karat: 18,
    diamondShape: 'HT',
    diamondSize: 0.45,
    isGiftingAvailable: true,
    isEngraving: true
  },
  {
    sku: 'GR7-MQ-55-YG',
    variant: 'GR7',
    title: 'Unique Yellow Gold Marquise Ring',
    description: 'Distinctive marquise cut diamond ring',
    category: 'Gents Ring',
    subCategory: 'Ring',
    price: 58000,
    metal: 'YG',
    karat: 18,
    diamondShape: 'MQ',
    diamondSize: 0.55,
    isGiftingAvailable: false,
    isEngraving: true
  },
  {
    sku: 'SR8-RD-100-WG',
    variant: 'SR8',
    title: 'Grand White Gold Round Brilliant Ring',
    description: 'Magnificent 1 carat round brilliant diamond',
    category: 'Solitaire',
    subCategory: 'Ring',
    price: 125000,
    metal: 'WG',
    karat: 18,
    diamondShape: 'RD',
    diamondSize: 1.00,
    isGiftingAvailable: true,
    isEngraving: true
  },

  // Pendants (5 products)
  {
    sku: 'PD1-RD-30-WG',
    variant: 'PD1',
    title: 'Delicate White Gold Diamond Pendant',
    description: 'Elegant white gold pendant with round diamond',
    category: 'Pendant',
    subCategory: 'Pendant',
    price: 35000,
    metal: 'WG',
    karat: 18,
    diamondShape: 'RD',
    diamondSize: 0.30,
    isGiftingAvailable: true,
    isEngraving: true
  },
  {
    sku: 'PD2-HT-40-RG',
    variant: 'PD2',
    title: 'Heart-Shaped Rose Gold Pendant',
    description: 'Romantic heart pendant in rose gold',
    category: 'Pendant',
    subCategory: 'Pendant',
    price: 42000,
    metal: 'RG',
    karat: 18,
    diamondShape: 'HT',
    diamondSize: 0.40,
    isGiftingAvailable: true,
    isEngraving: false
  },
  {
    sku: 'PD3-PR-35-YG',
    variant: 'PD3',
    title: 'Princess Cut Yellow Gold Pendant',
    description: 'Brilliant princess cut pendant',
    category: 'Pendant',
    subCategory: 'Pendant',
    price: 38000,
    metal: 'YG',
    karat: 18,
    diamondShape: 'PR',
    diamondSize: 0.35,
    isGiftingAvailable: true,
    isEngraving: true
  },
  {
    sku: 'PD4-OV-50-WG',
    variant: 'PD4',
    title: 'Elegant Oval White Gold Pendant',
    description: 'Sophisticated oval diamond pendant',
    category: 'Pendant',
    subCategory: 'Pendant',
    price: 55000,
    metal: 'WG',
    karat: 18,
    diamondShape: 'OV',
    diamondSize: 0.50,
    isGiftingAvailable: true,
    isEngraving: false
  },
  {
    sku: 'PD5-RD-25-PT',
    variant: 'PD5',
    title: 'Platinum Solitaire Pendant',
    description: 'Premium platinum pendant with round diamond',
    category: 'Pendant',
    subCategory: 'Pendant',
    price: 68000,
    metal: 'PT',
    karat: 22,
    diamondShape: 'RD',
    diamondSize: 0.25,
    isGiftingAvailable: true,
    isEngraving: true
  },

  // Earrings (4 products)
  {
    sku: 'ER1-RD-25-RG',
    variant: 'ER1',
    title: 'Rose Gold Diamond Stud Earrings',
    description: 'Beautiful rose gold stud earrings with round diamonds',
    category: 'Earring',
    subCategory: 'Earring',
    price: 28000,
    metal: 'RG',
    karat: 18,
    diamondShape: 'RD',
    diamondSize: 0.25,
    isGiftingAvailable: true,
    isEngraving: false
  },
  {
    sku: 'ER2-PR-30-WG',
    variant: 'ER2',
    title: 'White Gold Princess Cut Earrings',
    description: 'Sparkling princess cut diamond earrings',
    category: 'Earring',
    subCategory: 'Earring',
    price: 35000,
    metal: 'WG',
    karat: 18,
    diamondShape: 'PR',
    diamondSize: 0.30,
    isGiftingAvailable: true,
    isEngraving: false
  },
  {
    sku: 'ER3-RD-40-YG',
    variant: 'ER3',
    title: 'Yellow Gold Halo Diamond Earrings',
    description: 'Stunning halo design diamond earrings',
    category: 'Earring',
    subCategory: 'Earring',
    price: 48000,
    metal: 'YG',
    karat: 18,
    diamondShape: 'RD',
    diamondSize: 0.40,
    isGiftingAvailable: true,
    isEngraving: false
  },
  {
    sku: 'ER4-OV-35-PT',
    variant: 'ER4',
    title: 'Platinum Oval Drop Earrings',
    description: 'Elegant platinum drop earrings',
    category: 'Earring',
    subCategory: 'Earring',
    price: 75000,
    metal: 'PT',
    karat: 22,
    diamondShape: 'OV',
    diamondSize: 0.35,
    isGiftingAvailable: true,
    isEngraving: false
  },

  // Bracelets (3 products)
  {
    sku: 'BR1-RD-100-PT',
    variant: 'BR1',
    title: 'Luxurious Platinum Diamond Bracelet',
    description: 'Exquisite platinum bracelet with multiple round diamonds',
    category: 'Bracelet',
    subCategory: 'Bracelet',
    price: 125000,
    metal: 'PT',
    karat: 22,
    diamondShape: 'RD',
    diamondSize: 1.00,
    isGiftingAvailable: true,
    isEngraving: true
  },
  {
    sku: 'BR2-RD-75-RG',
    variant: 'BR2',
    title: 'Rose Gold Tennis Bracelet',
    description: 'Classic tennis bracelet in rose gold',
    category: 'Bracelet',
    subCategory: 'Bracelet',
    price: 95000,
    metal: 'RG',
    karat: 18,
    diamondShape: 'RD',
    diamondSize: 0.75,
    isGiftingAvailable: true,
    isEngraving: false
  },
  {
    sku: 'BR3-PR-60-WG',
    variant: 'BR3',
    title: 'White Gold Princess Bracelet',
    description: 'Elegant white gold bracelet with princess cuts',
    category: 'Bracelet',
    subCategory: 'Bracelet',
    price: 82000,
    metal: 'WG',
    karat: 18,
    diamondShape: 'PR',
    diamondSize: 0.60,
    isGiftingAvailable: true,
    isEngraving: true
  }
];

async function seedComprehensiveData() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    console.log(`   URI: ${MONGO_URI}`);
    
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Connected to MongoDB successfully!\n');

    // Define schemas
    const ProductSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
    const CartSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
    const WishlistShareSchema = new mongoose.Schema({}, { strict: false, timestamps: true });

    const Product = mongoose.model('Product', ProductSchema);
    const Cart = mongoose.model('Cart', CartSchema);
    const WishlistShare = mongoose.model('WishlistShare', WishlistShareSchema);

    // Step 1: Create/Update Products
    console.log('📦 CREATING/UPDATING PRODUCTS');
    console.log('═'.repeat(50));
    const createdProducts = [];
    
    for (const productData of productsData) {
      const product = await Product.findOneAndUpdate(
        { sku: productData.sku },
        productData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      createdProducts.push(product);
      console.log(`✅ ${product.title}`);
      console.log(`   SKU: ${product.sku} | Price: ₹${product.price.toLocaleString()}`);
    }
    console.log(`\n✅ Total Products: ${createdProducts.length}\n`);

    // Step 2: Create Comprehensive Cart for Aditya
    console.log('🛒 CREATING CART FOR ADITYA');
    console.log('═'.repeat(50));
    
    const adityaCartItems = [
      { product: createdProducts[0]._id, quantity: 1, price: createdProducts[0].price }, // Rose Gold Ring
      { product: createdProducts[2]._id, quantity: 1, price: createdProducts[2].price }, // White Gold Emerald Ring
      { product: createdProducts[8]._id, quantity: 2, price: createdProducts[8].price }, // White Gold Pendant (x2)
      { product: createdProducts[9]._id, quantity: 1, price: createdProducts[9].price }, // Rose Gold Heart Pendant
      { product: createdProducts[14]._id, quantity: 1, price: createdProducts[14].price }, // Rose Gold Earrings
      { product: createdProducts[16]._id, quantity: 1, price: createdProducts[16].price }, // Yellow Gold Halo Earrings
      { product: createdProducts[18]._id, quantity: 1, price: createdProducts[18].price }  // Platinum Bracelet
    ];

    const adityaTotalAmount = adityaCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const adityaCart = await Cart.findOneAndUpdate(
      { user: new mongoose.Types.ObjectId(USER_IDS.aditya) },
      {
        user: new mongoose.Types.ObjectId(USER_IDS.aditya),
        items: adityaCartItems,
        totalAmount: adityaTotalAmount
      },
      { upsert: true, new: true }
    );

    console.log(`✅ Cart created for Aditya (${adityaCart.items.length} items)`);
    adityaCart.items.forEach((item, idx) => {
      const prod = createdProducts.find(p => p._id.equals(item.product));
      console.log(`   ${idx + 1}. ${prod.title} (Qty: ${item.quantity}) - ₹${(item.price * item.quantity).toLocaleString()}`);
    });
    console.log(`   💰 Total Amount: ₹${adityaTotalAmount.toLocaleString()}\n`);

    // Step 3: Create Comprehensive Cart for Addy
    console.log('🛒 CREATING CART FOR ADDY');
    console.log('═'.repeat(50));
    
    const addyCartItems = [
      { product: createdProducts[1]._id, quantity: 1, price: createdProducts[1].price }, // Yellow Gold Princess Ring
      { product: createdProducts[4]._id, quantity: 1, price: createdProducts[4].price }, // Platinum Cushion Ring
      { product: createdProducts[7]._id, quantity: 1, price: createdProducts[7].price }, // White Gold Round Brilliant
      { product: createdProducts[10]._id, quantity: 1, price: createdProducts[10].price }, // Princess Yellow Gold Pendant
      { product: createdProducts[12]._id, quantity: 2, price: createdProducts[12].price }, // Platinum Pendant (x2)
      { product: createdProducts[15]._id, quantity: 1, price: createdProducts[15].price }, // White Gold Princess Earrings
      { product: createdProducts[19]._id, quantity: 1, price: createdProducts[19].price }  // Rose Gold Tennis Bracelet
    ];

    const addyTotalAmount = addyCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const addyCart = await Cart.findOneAndUpdate(
      { user: new mongoose.Types.ObjectId(USER_IDS.addy) },
      {
        user: new mongoose.Types.ObjectId(USER_IDS.addy),
        items: addyCartItems,
        totalAmount: addyTotalAmount
      },
      { upsert: true, new: true }
    );

    console.log(`✅ Cart created for Addy (${addyCart.items.length} items)`);
    addyCart.items.forEach((item, idx) => {
      const prod = createdProducts.find(p => p._id.equals(item.product));
      console.log(`   ${idx + 1}. ${prod.title} (Qty: ${item.quantity}) - ₹${(item.price * item.quantity).toLocaleString()}`);
    });
    console.log(`   💰 Total Amount: ₹${addyTotalAmount.toLocaleString()}\n`);

    // Step 4: Create Multiple WishlistShares for Aditya
    console.log('💝 CREATING WISHLIST SHARES FOR ADITYA');
    console.log('═'.repeat(50));
    
    const adityaWishlistShares = [
      {
        shareId: 'ADITYA-WISHLIST-2025',
        userId: new mongoose.Types.ObjectId(USER_IDS.aditya),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        isActive: true
      },
      {
        shareId: 'ADITYA-ENGAGEMENT-COLLECTION',
        userId: new mongoose.Types.ObjectId(USER_IDS.aditya),
        expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
        isActive: true
      },
      {
        shareId: 'ADITYA-ANNIVERSARY-PICKS',
        userId: new mongoose.Types.ObjectId(USER_IDS.aditya),
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        isActive: true
      },
      {
        shareId: 'ADITYA-GIFT-IDEAS',
        userId: new mongoose.Types.ObjectId(USER_IDS.aditya),
        expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
        isActive: true
      }
    ];

    for (const wsData of adityaWishlistShares) {
      const ws = await WishlistShare.findOneAndUpdate(
        { shareId: wsData.shareId },
        wsData,
        { upsert: true, new: true }
      );
      console.log(`✅ ${ws.shareId}`);
      console.log(`   Expires: ${ws.expiresAt.toLocaleDateString()} | Active: ${ws.isActive}`);
    }

    // Step 5: Create Multiple WishlistShares for Addy
    console.log('\n💝 CREATING WISHLIST SHARES FOR ADDY');
    console.log('═'.repeat(50));
    
    const addyWishlistShares = [
      {
        shareId: 'ADDY-WISHLIST-2025',
        userId: new mongoose.Types.ObjectId(USER_IDS.addy),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        isActive: true
      },
      {
        shareId: 'ADDY-WEDDING-COLLECTION',
        userId: new mongoose.Types.ObjectId(USER_IDS.addy),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        isActive: true
      },
      {
        shareId: 'ADDY-BIRTHDAY-SPECIALS',
        userId: new mongoose.Types.ObjectId(USER_IDS.addy),
        expiresAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days
        isActive: true
      },
      {
        shareId: 'ADDY-LUXURY-FAVORITES',
        userId: new mongoose.Types.ObjectId(USER_IDS.addy),
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        isActive: true
      },
      {
        shareId: 'ADDY-ARCHIVED-WISHLIST',
        userId: new mongoose.Types.ObjectId(USER_IDS.addy),
        expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Expired 5 days ago
        isActive: false
      }
    ];

    for (const wsData of addyWishlistShares) {
      const ws = await WishlistShare.findOneAndUpdate(
        { shareId: wsData.shareId },
        wsData,
        { upsert: true, new: true }
      );
      const status = ws.isActive ? '🟢 Active' : '🔴 Inactive';
      console.log(`✅ ${ws.shareId}`);
      console.log(`   Expires: ${ws.expiresAt.toLocaleDateString()} | ${status}`);
    }

    // Final Summary
    console.log('\n\n📊 COMPREHENSIVE SEEDING SUMMARY');
    console.log('═'.repeat(50));
    console.log(`✅ Products Created/Updated: ${createdProducts.length}`);
    console.log('\n🛒 CARTS:');
    console.log(`   • Aditya's Cart: ${adityaCart.items.length} items | ₹${adityaTotalAmount.toLocaleString()}`);
    console.log(`   • Addy's Cart: ${addyCart.items.length} items | ₹${addyTotalAmount.toLocaleString()}`);
    console.log(`   • Total Cart Value: ₹${(adityaTotalAmount + addyTotalAmount).toLocaleString()}`);
    console.log('\n💝 WISHLIST SHARES:');
    console.log(`   • Aditya's Shares: ${adityaWishlistShares.length}`);
    console.log(`   • Addy's Shares: ${addyWishlistShares.length}`);
    console.log(`   • Total Shares: ${adityaWishlistShares.length + addyWishlistShares.length}`);
    console.log('═'.repeat(50));
    console.log('🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!\n');

  } catch (error) {
    console.error('\n❌ ERROR DURING SEEDING:');
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed\n');
    process.exit(0);
  }
}

// Run the comprehensive seeding function
seedComprehensiveData();


