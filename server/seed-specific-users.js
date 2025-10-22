const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/kyna');
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Import models
const User = mongoose.model('User', new mongoose.Schema({}, { strict: false, strictPopulate: false }));
const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false, strictPopulate: false }));
const Cart = mongoose.model('Cart', new mongoose.Schema({}, { strict: false, strictPopulate: false }));
const PromoCode = mongoose.model('PromoCode', new mongoose.Schema({}, { strict: false, strictPopulate: false }));
const Referral = mongoose.model('Referral', new mongoose.Schema({}, { strict: false, strictPopulate: false }));

// Helper function to generate unique referral ID
const generateReferralId = () => {
  return 'REF' + Math.random().toString(36).substring(2, 10).toUpperCase();
};

// Seed data function
const seedSpecificUsers = async () => {
  try {
    console.log('\n🌱 Starting to seed data for specific users...\n');

    // Find the two specific users
    const user1 = await User.findOne({ email: 'tiwariaditya1810@gmail.com' });
    const user2 = await User.findOne({ email: 'addytiw1810@gmail.com' });

    if (!user1) {
      console.error('❌ User tiwariaditya1810@gmail.com not found');
      return;
    }
    if (!user2) {
      console.error('❌ User addytiw1810@gmail.com not found');
      return;
    }

    console.log(`✅ Found user 1: ${user1.name} (${user1.email})`);
    console.log(`✅ Found user 2: ${user2.name} (${user2.email})\n`);

    // Get or create products
    console.log('📦 Checking products...');
    let products = await Product.find({}).limit(10);
    
    if (products.length < 5) {
      console.log('Creating products for testing...');
      const productsData = [
        {
          sku: 'GR1-RD-70-2T-BR-RG-001',
          variant: 'GR1',
          title: 'Elegant Diamond Ring',
          description: 'Beautiful diamond ring with 18kt gold',
          category: 'Gents Ring',
          subCategory: 'Ring',
          price: 45000,
          images: {
            main: '/product_detail/ring1.jpg',
            sub: ['/product_detail/ring2.jpg', '/product_detail/ring3.jpg']
          },
          diamondOrigin: ['Natural Diamond'],
          diamondShape: 'RD',
          diamondSize: 0.70,
          metal: 'RG',
          karat: 18,
          isGiftingAvailable: true,
          isEngraving: true
        },
        {
          sku: 'BR2-RD-50-1T-PL-WG-002',
          variant: 'BR2',
          title: 'Luxury Diamond Bracelet',
          description: 'Stunning diamond bracelet in white gold',
          category: 'Bracelet',
          subCategory: 'Bracelet',
          price: 85000,
          images: {
            main: '/navigation/bracelet1.jpg',
            sub: ['/navigation/bracelet2.jpg']
          },
          diamondOrigin: ['Lab Grown Diamond'],
          diamondShape: 'RD',
          diamondSize: 0.50,
          metal: 'WG',
          karat: 18,
          isGiftingAvailable: true,
          isEngraving: false
        },
        {
          sku: 'PD3-RD-30-2T-YG-003',
          variant: 'PD3',
          title: 'Classic Diamond Pendant',
          description: 'Timeless diamond pendant with yellow gold',
          category: 'Pendant',
          subCategory: 'Pendant',
          price: 35000,
          images: {
            main: '/navigation/pendant1.png',
            sub: ['/navigation/pendant2.png']
          },
          diamondOrigin: ['Natural Diamond'],
          diamondShape: 'RD',
          diamondSize: 0.30,
          metal: 'YG',
          karat: 22,
          isGiftingAvailable: true,
          isEngraving: true
        },
        {
          sku: 'ER4-RD-40-1T-RG-004',
          variant: 'ER4',
          title: 'Radiant Diamond Earrings',
          description: 'Exquisite diamond earrings in rose gold',
          category: 'Earring',
          subCategory: 'Earring',
          price: 55000,
          images: {
            main: '/navigation/earring1.jpg',
            sub: ['/navigation/earring2.jpg']
          },
          diamondOrigin: ['Lab Grown Diamond'],
          diamondShape: 'RD',
          diamondSize: 0.40,
          metal: 'RG',
          karat: 18,
          isGiftingAvailable: false,
          isEngraving: false
        },
        {
          sku: 'GR5-PR-80-2T-PT-005',
          variant: 'GR5',
          title: 'Premium Platinum Ring',
          description: 'Luxurious platinum ring with princess cut diamond',
          category: 'Engagement Ring',
          subCategory: 'Ring',
          price: 125000,
          images: {
            main: '/collections(Home)/1.jpg',
            sub: ['/collections(Home)/2.jpg', '/collections(Home)/3.jpg']
          },
          diamondOrigin: ['Natural Diamond'],
          diamondShape: 'PR',
          diamondSize: 0.80,
          metal: 'PT',
          karat: 22,
          isGiftingAvailable: true,
          isEngraving: true
        },
        {
          sku: 'GR6-RD-60-1T-YG-006',
          variant: 'GR6',
          title: 'Classic Gold Band Ring',
          description: 'Traditional gold band with diamond accent',
          category: 'Gents Ring',
          subCategory: 'Ring',
          price: 38000,
          images: {
            main: '/ring.jpg',
            sub: ['/rings.jpg', '/newring.jpg']
          },
          diamondOrigin: ['Natural Diamond'],
          diamondShape: 'RD',
          diamondSize: 0.60,
          metal: 'YG',
          karat: 22,
          isGiftingAvailable: true,
          isEngraving: true
        },
        {
          sku: 'BR7-RD-45-2T-WG-007',
          variant: 'BR7',
          title: 'Delicate Tennis Bracelet',
          description: 'Elegant tennis bracelet with natural diamonds',
          category: 'Bracelet',
          subCategory: 'Bracelet',
          price: 95000,
          images: {
            main: '/Education/bangel.png',
            sub: []
          },
          diamondOrigin: ['Natural Diamond'],
          diamondShape: 'RD',
          diamondSize: 0.45,
          metal: 'WG',
          karat: 18,
          isGiftingAvailable: true,
          isEngraving: false
        },
        {
          sku: 'PD8-RD-35-1T-RG-008',
          variant: 'PD8',
          title: 'Heart Diamond Pendant',
          description: 'Romantic heart-shaped diamond pendant',
          category: 'Pendant',
          subCategory: 'Pendant',
          price: 42000,
          images: {
            main: '/navigation/pendant1.png',
            sub: []
          },
          diamondOrigin: ['Lab Grown Diamond'],
          diamondShape: 'RD',
          diamondSize: 0.35,
          metal: 'RG',
          karat: 18,
          isGiftingAvailable: true,
          isEngraving: true
        }
      ];

      for (const prodData of productsData) {
        const existing = await Product.findOne({ sku: prodData.sku });
        if (!existing) {
          await Product.create(prodData);
        }
      }
      products = await Product.find({}).limit(10);
    }
    console.log(`✅ ${products.length} products available\n`);

    // Get promo codes
    const promoCodes = await PromoCode.find({}).limit(3);
    console.log(`✅ Found ${promoCodes.length} promo codes\n`);

    // Clear existing carts for these users
    console.log('🗑️  Clearing existing carts for these users...');
    await Cart.deleteMany({ user: { $in: [user1._id, user2._id] } });
    console.log('✅ Existing carts cleared\n');

    // Create Cart for User 1 (tiwariaditya1810@gmail.com)
    console.log('🛒 Creating cart for User 1...');
    const cart1Items = [
      {
        product: products[0]._id,
        quantity: 1,
        price: products[0].price
      },
      {
        product: products[2]._id,
        quantity: 2,
        price: products[2].price
      },
      {
        product: products[4]._id,
        quantity: 1,
        price: products[4].price
      }
    ];
    const cart1TotalAmount = cart1Items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const cart1 = await Cart.create({
      user: user1._id,
      items: cart1Items,
      totalAmount: cart1TotalAmount
    });
    console.log(`✅ Cart 1 created with ${cart1Items.length} items (Total: ₹${cart1TotalAmount.toLocaleString()})\n`);

    // Create Cart for User 2 (addytiw1810@gmail.com)
    console.log('🛒 Creating cart for User 2...');
    const cart2Items = [
      {
        product: products[1]._id,
        quantity: 1,
        price: products[1].price
      },
      {
        product: products[3]._id,
        quantity: 1,
        price: products[3].price
      }
    ];
    const cart2TotalAmount = cart2Items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const cart2 = await Cart.create({
      user: user2._id,
      items: cart2Items,
      totalAmount: cart2TotalAmount
    });
    console.log(`✅ Cart 2 created with ${cart2Items.length} items (Total: ₹${cart2TotalAmount.toLocaleString()})\n`);

    // Update User 1 - Add wishlist items
    console.log('💝 Updating User 1 wishlist...');
    const wishlist1Products = [products[5]._id, products[6]._id, products[7]._id];
    await User.findByIdAndUpdate(user1._id, {
      wishlist: wishlist1Products,
      availableOffers: 3,
      usedPromoCodes: promoCodes.length > 0 ? [promoCodes[0]._id] : [],
      usedReferralCodes: []
    });
    console.log(`✅ User 1 wishlist updated with ${wishlist1Products.length} products\n`);

    // Update User 2 - Add wishlist items
    console.log('💝 Updating User 2 wishlist...');
    const wishlist2Products = [products[0]._id, products[4]._id];
    await User.findByIdAndUpdate(user2._id, {
      wishlist: wishlist2Products,
      availableOffers: 2,
      usedPromoCodes: promoCodes.length > 1 ? [promoCodes[1]._id] : [],
      usedReferralCodes: user1.referralCode ? [user1.referralCode] : []
    });
    console.log(`✅ User 2 wishlist updated with ${wishlist2Products.length} products\n`);

    // Create referral for User 1
    console.log('🔗 Creating referral for User 1...');
    const existingReferral1 = await Referral.findOne({ fromUserId: user1._id });
    if (!existingReferral1) {
      await Referral.create({
        referFrdId: generateReferralId(),
        fromUserId: user1._id,
        toEmails: ['friend1@example.com', 'friend2@example.com'],
        note: 'Check out this amazing jewelry collection!',
        sendReminder: true,
        status: 'pending',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
      console.log('✅ Referral created for User 1\n');
    } else {
      console.log('✅ Referral already exists for User 1\n');
    }

    // Create referral for User 2
    console.log('🔗 Creating referral for User 2...');
    const existingReferral2 = await Referral.findOne({ fromUserId: user2._id });
    if (!existingReferral2) {
      await Referral.create({
        referFrdId: generateReferralId(),
        fromUserId: user2._id,
        toEmails: ['contact@example.com'],
        note: 'You should see this jewelry store!',
        sendReminder: false,
        status: 'pending',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
      console.log('✅ Referral created for User 2\n');
    } else {
      console.log('✅ Referral already exists for User 2\n');
    }

    // Display summary
    console.log('\n📊 SUMMARY\n' + '='.repeat(70));
    
    const updatedUser1 = await User.findById(user1._id).populate('wishlist').populate('usedPromoCodes');
    const updatedUser2 = await User.findById(user2._id).populate('wishlist').populate('usedPromoCodes');
    
    console.log(`\n👤 User 1: ${updatedUser1.name} (${updatedUser1.email})`);
    console.log(`   Referral Code: ${updatedUser1.referralCode}`);
    console.log(`   Wishlist Items: ${updatedUser1.wishlist.length}`);
    updatedUser1.wishlist.forEach((prod, idx) => {
      console.log(`      ${idx + 1}. ${prod.title} - ₹${prod.price.toLocaleString()}`);
    });
    console.log(`   Cart Items: ${cart1Items.length}`);
    console.log(`   Cart Total: ₹${cart1TotalAmount.toLocaleString()}`);
    console.log(`   Available Offers: ${updatedUser1.availableOffers}`);
    console.log(`   Used Promo Codes: ${updatedUser1.usedPromoCodes.length}`);

    console.log(`\n👤 User 2: ${updatedUser2.name} (${updatedUser2.email})`);
    console.log(`   Referral Code: ${updatedUser2.referralCode}`);
    console.log(`   Wishlist Items: ${updatedUser2.wishlist.length}`);
    updatedUser2.wishlist.forEach((prod, idx) => {
      console.log(`      ${idx + 1}. ${prod.title} - ₹${prod.price.toLocaleString()}`);
    });
    console.log(`   Cart Items: ${cart2Items.length}`);
    console.log(`   Cart Total: ₹${cart2TotalAmount.toLocaleString()}`);
    console.log(`   Available Offers: ${updatedUser2.availableOffers}`);
    console.log(`   Used Promo Codes: ${updatedUser2.usedPromoCodes.length}`);
    console.log(`   Used Referral Codes: ${updatedUser2.usedReferralCodes.join(', ')}`);

    console.log('\n' + '='.repeat(70));
    console.log('\n✨ Data seeded successfully for both users!\n');
    console.log('🎯 You can now access:');
    console.log('   - Cart page for both users');
    console.log('   - Wishlist page for both users');
    console.log('   - Referral tracking');
    console.log('   - Promo code application\n');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
};

// Main execution
const main = async () => {
  try {
    await connectDB();
    await seedSpecificUsers();
    console.log('👋 Disconnecting from database...');
    await mongoose.disconnect();
    console.log('✅ Database disconnected. Goodbye!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
};

main();


