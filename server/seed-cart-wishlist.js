require('dotenv').config();
const mongoose = require('mongoose');

// User IDs from the provided data
const USER_IDS = {
  aditya: '68f7f452330878c13e49f6dc',
  addy: '68f7f4ff330878c13e49f6e4'
};

// Product Schema (simplified for seeding)
const productSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true },
  variant: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  subCategory: { type: String, enum: ['Ring', 'Bracelet', 'Pendant', 'Earring'], required: true },
  price: { type: Number, required: true },
  description: String,
  images: {
    main: String,
    sub: [String]
  },
  metal: String,
  karat: Number,
  diamondShape: String,
  diamondSize: Number,
  isGiftingAvailable: { type: Boolean, default: false },
  isEngraving: { type: Boolean, default: false }
}, { timestamps: true });

// Cart Schema
const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    price: { type: Number, required: true, min: 0 }
  }],
  totalAmount: { type: Number, required: true, default: 0, min: 0 }
}, { timestamps: true });

cartSchema.pre('save', function(next) {
  this.totalAmount = this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  next();
});

// WishlistShare Schema
const wishlistShareSchema = new mongoose.Schema({
  shareId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expiresAt: { type: Date, required: true, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Models
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);
const WishlistShare = mongoose.models.WishlistShare || mongoose.model('WishlistShare', wishlistShareSchema);

// Dummy Products Data
const dummyProducts = [
  {
    sku: 'GR1-RD-70-2T-BR-RG',
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
    isEngraving: true,
    images: {
      main: 'https://example.com/ring1-main.jpg',
      sub: ['https://example.com/ring1-1.jpg', 'https://example.com/ring1-2.jpg']
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
    metal: 'YG',
    karat: 18,
    diamondShape: 'PR',
    diamondSize: 0.50,
    isGiftingAvailable: true,
    isEngraving: false,
    images: {
      main: 'https://example.com/ring2-main.jpg',
      sub: ['https://example.com/ring2-1.jpg', 'https://example.com/ring2-2.jpg']
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
    metal: 'WG',
    karat: 18,
    diamondShape: 'RD',
    diamondSize: 0.30,
    isGiftingAvailable: true,
    isEngraving: true,
    images: {
      main: 'https://example.com/pendant1-main.jpg',
      sub: ['https://example.com/pendant1-1.jpg']
    }
  },
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
    isEngraving: false,
    images: {
      main: 'https://example.com/earring1-main.jpg',
      sub: ['https://example.com/earring1-1.jpg']
    }
  },
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
    isEngraving: true,
    images: {
      main: 'https://example.com/bracelet1-main.jpg',
      sub: ['https://example.com/bracelet1-1.jpg', 'https://example.com/bracelet1-2.jpg']
    }
  }
];

async function seedDatabase() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/kyna-jewels');
    console.log('✅ Connected to MongoDB');

    // Step 1: Create/Update Products
    console.log('\n📦 Creating/Updating Products...');
    const createdProducts = [];
    
    for (const productData of dummyProducts) {
      const product = await Product.findOneAndUpdate(
        { sku: productData.sku },
        productData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      createdProducts.push(product);
      console.log(`✅ Product created/updated: ${product.title} (${product.sku})`);
    }

    // Step 2: Create Cart for Aditya
    console.log('\n🛒 Creating Cart for Aditya...');
    const adityaCart = await Cart.findOneAndUpdate(
      { user: new mongoose.Types.ObjectId(USER_IDS.aditya) },
      {
        user: new mongoose.Types.ObjectId(USER_IDS.aditya),
        items: [
          {
            product: createdProducts[0]._id, // Rose Gold Ring
            quantity: 1,
            price: createdProducts[0].price
          },
          {
            product: createdProducts[2]._id, // White Gold Pendant
            quantity: 2,
            price: createdProducts[2].price
          },
          {
            product: createdProducts[3]._id, // Rose Gold Earrings
            quantity: 1,
            price: createdProducts[3].price
          }
        ]
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`✅ Cart created for Aditya with ${adityaCart.items.length} items`);
    console.log(`   Total Amount: ₹${adityaCart.totalAmount}`);

    // Step 3: Create Cart for Addy
    console.log('\n🛒 Creating Cart for Addy...');
    const addyCart = await Cart.findOneAndUpdate(
      { user: new mongoose.Types.ObjectId(USER_IDS.addy) },
      {
        user: new mongoose.Types.ObjectId(USER_IDS.addy),
        items: [
          {
            product: createdProducts[1]._id, // Yellow Gold Ring
            quantity: 1,
            price: createdProducts[1].price
          },
          {
            product: createdProducts[4]._id, // Platinum Bracelet
            quantity: 1,
            price: createdProducts[4].price
          }
        ]
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`✅ Cart created for Addy with ${addyCart.items.length} items`);
    console.log(`   Total Amount: ₹${addyCart.totalAmount}`);

    // Step 4: Create WishlistShare for Aditya
    console.log('\n💝 Creating WishlistShare for Aditya...');
    const adityaWishlistShare = await WishlistShare.findOneAndUpdate(
      { shareId: 'ADITYA-WISHLIST-2025' },
      {
        shareId: 'ADITYA-WISHLIST-2025',
        userId: new mongoose.Types.ObjectId(USER_IDS.aditya),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        isActive: true
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`✅ WishlistShare created for Aditya`);
    console.log(`   Share ID: ${adityaWishlistShare.shareId}`);
    console.log(`   Expires At: ${adityaWishlistShare.expiresAt}`);

    // Step 5: Create WishlistShare for Addy
    console.log('\n💝 Creating WishlistShare for Addy...');
    const addyWishlistShare = await WishlistShare.findOneAndUpdate(
      { shareId: 'ADDY-WISHLIST-2025' },
      {
        shareId: 'ADDY-WISHLIST-2025',
        userId: new mongoose.Types.ObjectId(USER_IDS.addy),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        isActive: true
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`✅ WishlistShare created for Addy`);
    console.log(`   Share ID: ${addyWishlistShare.shareId}`);
    console.log(`   Expires At: ${addyWishlistShare.expiresAt}`);

    // Summary
    console.log('\n📊 SEEDING SUMMARY:');
    console.log('═══════════════════════════════════════');
    console.log(`✅ Products Created: ${createdProducts.length}`);
    console.log(`✅ Carts Created: 2`);
    console.log(`   - Aditya's Cart: ${adityaCart.items.length} items (₹${adityaCart.totalAmount})`);
    console.log(`   - Addy's Cart: ${addyCart.items.length} items (₹${addyCart.totalAmount})`);
    console.log(`✅ WishlistShares Created: 2`);
    console.log(`   - Aditya's Share ID: ${adityaWishlistShare.shareId}`);
    console.log(`   - Addy's Share ID: ${addyWishlistShare.shareId}`);
    console.log('═══════════════════════════════════════');
    console.log('🎉 Database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// Run the seeding function
seedDatabase();


