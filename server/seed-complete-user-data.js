const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/kyna');
    console.log('✅ MongoDB Connected Successfully\n');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Define schemas
const User = mongoose.model('User', new mongoose.Schema({}, { strict: false, strictPopulate: false }));
const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false, strictPopulate: false }));
const Cart = mongoose.model('Cart', new mongoose.Schema({}, { strict: false, strictPopulate: false }));
const PromoCode = mongoose.model('PromoCode', new mongoose.Schema({}, { strict: false, strictPopulate: false }));
const Referral = mongoose.model('Referral', new mongoose.Schema({}, { strict: false, strictPopulate: false }));

// Helper function
const generateReferralId = () => {
  return 'REF' + Math.random().toString(36).substring(2, 10).toUpperCase();
};

const seedCompleteUserData = async () => {
  try {
    console.log('🌱 Starting complete user data seeding...\n');

    // User 1 Data
    const user1Id = new mongoose.Types.ObjectId('68f7f452330878c13e49f6dc');
    const user2Id = new mongoose.Types.ObjectId('68f7f4ff330878c13e49f6e4');

    // Check if users exist
    let user1 = await User.findById(user1Id);
    let user2 = await User.findById(user2Id);

    // Create User 1 if doesn't exist
    if (!user1) {
      console.log('👤 Creating User 1: Aditya Vinay Tiwari TIWARI...');
      user1 = await User.create({
        _id: user1Id,
        firstName: 'Aditya',
        lastName: 'Vinay Tiwari TIWARI',
        email: 'tiwariaditya1810@gmail.com',
        password: '$2a$10$p4ytSky9dj1co2VuyK4gZ.tHr4M2RHI9Vz1/VaAASIkgBpIfZmzQe',
        name: 'Aditya Vinay Tiwari TIWARI',
        isVerified: true,
        role: 'customer',
        address: {
          billingAddress: {
            street: '123 Main Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            country: 'India',
            zipCode: '400001'
          },
          shippingAddress: {
            sameAsBilling: true,
            street: '123 Main Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            country: 'India',
            zipCode: '400001'
          }
        },
        orders: [],
        wishlist: [],
        gifts: [],
        isActive: true,
        availableOffers: 3,
        referralCount: 0,
        totalReferralEarnings: 0,
        usedPromoCodes: [],
        usedReferralCodes: [],
        lastLogin: new Date('2025-10-21T21:01:03.051Z'),
        referralCode: 'ADI60U0',
        createdAt: new Date('2025-10-21T21:00:02.600Z'),
        updatedAt: new Date()
      });
      console.log('✅ User 1 created\n');
    } else {
      console.log('✅ User 1 already exists\n');
    }

    // Create User 2 if doesn't exist
    if (!user2) {
      console.log('👤 Creating User 2: Addy bhai...');
      user2 = await User.create({
        _id: user2Id,
        firstName: 'Addy',
        lastName: 'bhai',
        email: 'addytiw1810@gmail.com',
        password: '$2a$10$H6f4Ay1m9DT5QQ4cENgjQugU11E15NnX1XL0d54XG9zAa18nyqimu',
        name: 'Addy bhai',
        isVerified: true,
        role: 'customer',
        address: {
          billingAddress: {
            street: '456 Park Avenue',
            city: 'Delhi',
            state: 'Delhi',
            country: 'India',
            zipCode: '110001'
          },
          shippingAddress: {
            sameAsBilling: true,
            street: '456 Park Avenue',
            city: 'Delhi',
            state: 'Delhi',
            country: 'India',
            zipCode: '110001'
          }
        },
        orders: [],
        wishlist: [],
        gifts: [],
        isActive: true,
        availableOffers: 2,
        referralCount: 0,
        totalReferralEarnings: 0,
        usedPromoCodes: [],
        usedReferralCodes: [],
        lastLogin: new Date('2025-10-21T21:05:41.091Z'),
        referralCode: 'ADD626Z',
        createdAt: new Date('2025-10-21T21:02:55.934Z'),
        updatedAt: new Date()
      });
      console.log('✅ User 2 created\n');
    } else {
      console.log('✅ User 2 already exists\n');
    }

    // Create/Get Products
    console.log('📦 Creating products...');
    const productsData = [
      {
        sku: 'GR1-RD-70-2T-BR-RG-001',
        variant: 'GR1',
        title: 'Elegant Diamond Ring',
        description: 'Beautiful diamond ring with 18kt gold, perfect for engagements',
        category: 'Gents Ring',
        subCategory: 'Ring',
        price: 45000,
        images: {
          main: '/product_detail/1.jpg',
          sub: ['/product_detail/2.jpg', '/product_detail/3.jpg', '/product_detail/4.jpg']
        },
        diamondOrigin: ['Natural Diamond'],
        diamondShape: 'RD',
        diamondSize: 0.70,
        diamondColor: 'F',
        metal: 'RG',
        karat: 18,
        netWeightGrams: 3.5,
        isGiftingAvailable: true,
        isEngraving: true,
        rating: { score: 4.8, reviews: 152 }
      },
      {
        sku: 'BR2-RD-50-1T-PL-WG-002',
        variant: 'BR2',
        title: 'Luxury Diamond Bracelet',
        description: 'Stunning diamond bracelet in white gold with lab-grown diamonds',
        category: 'Bracelet',
        subCategory: 'Bracelet',
        price: 85000,
        images: {
          main: '/navigation/bracelet1.jpg',
          sub: ['/navigation/bracelet2.jpg', '/navigation/bracelet3.png']
        },
        diamondOrigin: ['Lab Grown Diamond'],
        diamondShape: 'RD',
        diamondSize: 0.50,
        diamondColor: 'E',
        metal: 'WG',
        karat: 18,
        netWeightGrams: 8.2,
        isGiftingAvailable: true,
        isEngraving: false,
        rating: { score: 4.9, reviews: 98 }
      },
      {
        sku: 'PD3-RD-30-2T-YG-003',
        variant: 'PD3',
        title: 'Classic Diamond Pendant',
        description: 'Timeless diamond pendant with yellow gold chain',
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
        diamondColor: 'G',
        metal: 'YG',
        karat: 22,
        chainLengthInches: 18,
        netWeightGrams: 2.8,
        isGiftingAvailable: true,
        isEngraving: true,
        rating: { score: 4.7, reviews: 203 }
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
        diamondColor: 'F',
        metal: 'RG',
        karat: 18,
        netWeightGrams: 4.1,
        isGiftingAvailable: false,
        isEngraving: false,
        rating: { score: 4.6, reviews: 87 }
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
          sub: ['/collections(Home)/2.jpg', '/collections(Home)/3.jpg', '/collections(Home)/4.jpg']
        },
        diamondOrigin: ['Natural Diamond'],
        diamondShape: 'PR',
        diamondSize: 0.80,
        diamondColor: 'D',
        metal: 'PT',
        karat: 22,
        netWeightGrams: 5.2,
        isGiftingAvailable: true,
        isEngraving: true,
        rating: { score: 5.0, reviews: 45 }
      },
      {
        sku: 'GR6-RD-60-1T-YG-006',
        variant: 'GR6',
        title: 'Classic Gold Band Ring',
        description: 'Traditional 22kt gold band with diamond accent',
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
        diamondColor: 'H',
        metal: 'YG',
        karat: 22,
        netWeightGrams: 6.5,
        isGiftingAvailable: true,
        isEngraving: true,
        rating: { score: 4.5, reviews: 312 }
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
        diamondColor: 'F',
        metal: 'WG',
        karat: 18,
        netWeightGrams: 9.8,
        isGiftingAvailable: true,
        isEngraving: false,
        rating: { score: 4.8, reviews: 76 }
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
        diamondColor: 'G',
        metal: 'RG',
        karat: 18,
        chainLengthInches: 16,
        netWeightGrams: 3.2,
        isGiftingAvailable: true,
        isEngraving: true,
        rating: { score: 4.9, reviews: 134 }
      }
    ];

    const products = [];
    for (const prodData of productsData) {
      let product = await Product.findOne({ sku: prodData.sku });
      if (!product) {
        product = await Product.create(prodData);
      }
      products.push(product);
    }
    console.log(`✅ ${products.length} products ready\n`);

    // Create Promo Codes
    console.log('🎫 Creating promo codes...');
    const promoCodesData = [
      {
        code: 'WELCOME2024',
        discountType: 'percentage',
        discountValue: 20,
        minPurchase: 1000,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        usageLimit: 100,
        usedCount: 15,
        usedBy: [],
        isActive: true,
        description: 'Welcome offer - 20% off on orders above ₹1000'
      },
      {
        code: 'FESTIVE500',
        discountType: 'flat',
        discountValue: 500,
        minPurchase: 5000,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 50,
        usedCount: 8,
        usedBy: [],
        isActive: true,
        description: 'Festive special - ₹500 off on orders above ₹5000'
      }
    ];

    const promoCodes = [];
    for (const pcData of promoCodesData) {
      let promoCode = await PromoCode.findOne({ code: pcData.code });
      if (!promoCode) {
        promoCode = await PromoCode.create(pcData);
      }
      promoCodes.push(promoCode);
    }
    console.log(`✅ ${promoCodes.length} promo codes ready\n`);

    // Clear existing carts
    await Cart.deleteMany({ user: { $in: [user1Id, user2Id] } });
    console.log('🗑️  Cleared existing carts\n');

    // Create Cart for User 1
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
    const cart1Total = cart1Items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    await Cart.create({
      user: user1Id,
      items: cart1Items,
      totalAmount: cart1Total
    });
    console.log(`✅ Cart created: ${cart1Items.length} items, Total: ₹${cart1Total.toLocaleString()}\n`);

    // Create Cart for User 2
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
      },
      {
        product: products[5]._id,
        quantity: 2,
        price: products[5].price
      }
    ];
    const cart2Total = cart2Items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    await Cart.create({
      user: user2Id,
      items: cart2Items,
      totalAmount: cart2Total
    });
    console.log(`✅ Cart created: ${cart2Items.length} items, Total: ₹${cart2Total.toLocaleString()}\n`);

    // Update User 1 - Wishlist and Promo Codes
    console.log('💝 Updating User 1 wishlist and promo codes...');
    const wishlist1 = [products[5]._id, products[6]._id, products[7]._id];
    await User.findByIdAndUpdate(user1Id, {
      wishlist: wishlist1,
      availableOffers: 3,
      usedPromoCodes: [promoCodes[0]._id],
      usedReferralCodes: []
    });
    // Also update promo code
    await PromoCode.findByIdAndUpdate(promoCodes[0]._id, {
      $addToSet: { usedBy: user1Id }
    });
    console.log(`✅ User 1 updated: ${wishlist1.length} wishlist items\n`);

    // Update User 2 - Wishlist and Promo Codes
    console.log('💝 Updating User 2 wishlist and promo codes...');
    const wishlist2 = [products[0]._id, products[4]._id, products[7]._id];
    await User.findByIdAndUpdate(user2Id, {
      wishlist: wishlist2,
      availableOffers: 2,
      usedPromoCodes: [promoCodes[1]._id],
      usedReferralCodes: [user1.referralCode]
    });
    // Also update promo code
    await PromoCode.findByIdAndUpdate(promoCodes[1]._id, {
      $addToSet: { usedBy: user2Id }
    });
    console.log(`✅ User 2 updated: ${wishlist2.length} wishlist items\n`);

    // Create Referrals
    console.log('🔗 Creating referrals...');
    
    const existingRef1 = await Referral.findOne({ fromUserId: user1Id });
    if (!existingRef1) {
      await Referral.create({
        referFrdId: generateReferralId(),
        fromUserId: user1Id,
        toEmails: ['friend1@example.com', 'friend2@example.com', 'friend3@example.com'],
        note: 'Check out these amazing jewelry pieces! Use my code for special discount.',
        sendReminder: true,
        status: 'pending',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
      console.log('✅ Referral created for User 1');
    }

    const existingRef2 = await Referral.findOne({ fromUserId: user2Id });
    if (!existingRef2) {
      await Referral.create({
        referFrdId: generateReferralId(),
        fromUserId: user2Id,
        toEmails: ['contact@example.com', 'buyer@example.com'],
        note: 'You should definitely check out this jewelry collection!',
        sendReminder: false,
        status: 'pending',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
      console.log('✅ Referral created for User 2\n');
    }

    // Final Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 SEEDING SUMMARY');
    console.log('='.repeat(70));

    const finalUser1 = await User.findById(user1Id).populate('wishlist');
    const finalUser2 = await User.findById(user2Id).populate('wishlist');
    const finalCart1 = await Cart.findOne({ user: user1Id }).populate('items.product');
    const finalCart2 = await Cart.findOne({ user: user2Id }).populate('items.product');

    console.log(`\n👤 User 1: ${finalUser1.name}`);
    console.log(`   Email: ${finalUser1.email}`);
    console.log(`   Referral Code: ${finalUser1.referralCode}`);
    console.log(`   🛒 Cart: ${finalCart1.items.length} items (₹${finalCart1.totalAmount.toLocaleString()})`);
    finalCart1.items.forEach((item, idx) => {
      console.log(`      ${idx + 1}. ${item.product.title} x${item.quantity} = ₹${(item.price * item.quantity).toLocaleString()}`);
    });
    console.log(`   💝 Wishlist: ${finalUser1.wishlist.length} items`);
    finalUser1.wishlist.forEach((prod, idx) => {
      console.log(`      ${idx + 1}. ${prod.title} (₹${prod.price.toLocaleString()})`);
    });

    console.log(`\n👤 User 2: ${finalUser2.name}`);
    console.log(`   Email: ${finalUser2.email}`);
    console.log(`   Referral Code: ${finalUser2.referralCode}`);
    console.log(`   🛒 Cart: ${finalCart2.items.length} items (₹${finalCart2.totalAmount.toLocaleString()})`);
    finalCart2.items.forEach((item, idx) => {
      console.log(`      ${idx + 1}. ${item.product.title} x${item.quantity} = ₹${(item.price * item.quantity).toLocaleString()}`);
    });
    console.log(`   💝 Wishlist: ${finalUser2.wishlist.length} items`);
    finalUser2.wishlist.forEach((prod, idx) => {
      console.log(`      ${idx + 1}. ${prod.title} (₹${prod.price.toLocaleString()})`);
    });

    console.log('\n' + '='.repeat(70));
    console.log('\n✨ SUCCESS! Both users now have:');
    console.log('   ✅ Complete profile data');
    console.log('   ✅ Active carts with products');
    console.log('   ✅ Wishlists with products');
    console.log('   ✅ Referral codes');
    console.log('   ✅ Promo code usage tracking');
    console.log('   ✅ Referral invitations sent');
    console.log('\n🎯 You can now test cart and wishlist pages!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
};

const main = async () => {
  try {
    await connectDB();
    await seedCompleteUserData();
    await mongoose.disconnect();
    console.log('✅ Disconnected from database. Goodbye!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
};

main();


