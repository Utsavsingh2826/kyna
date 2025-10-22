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
const User = mongoose.model('User', new mongoose.Schema({
  firstName: String,
  lastName: String,
  displayName: String,
  email: { type: String, unique: true },
  secondaryEmail: String,
  phone: String,
  phoneNumber: String,
  country: String,
  state: String,
  city: String,
  zipCode: String,
  profileImage: String,
  password: String,
  name: String,
  isVerified: { type: Boolean, default: false },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  otp: String,
  otpExpires: Date,
  lastLogin: { type: Date, default: Date.now },
  verificationToken: String,
  verificationTokenExpiresAt: Date,
  address: {
    billingAddress: {
      companyName: String,
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    shippingAddress: {
      companyName: String,
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
      sameAsBilling: { type: Boolean, default: true }
    }
  },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  gifts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GiftCard' }],
  isActive: { type: Boolean, default: true },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  resetPasswordExpiresAt: Date,
  availableOffers: { type: Number, default: 0 },
  referralCode: { type: String, unique: true, sparse: true, uppercase: true },
  referralCount: { type: Number, default: 0 },
  totalReferralEarnings: { type: Number, default: 0 },
  usedPromoCodes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PromoCode' }],
  usedReferralCodes: [String]
}, { timestamps: true }));

const PromoCode = mongoose.model('PromoCode', new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  discountType: { type: String, enum: ['percentage', 'flat'], default: 'flat' },
  discountValue: { type: Number, required: true, min: 0 },
  minPurchase: { type: Number, default: 0, min: 0 },
  expiresAt: Date,
  usageLimit: { type: Number, default: 1, min: 1 },
  usedCount: { type: Number, default: 0, min: 0 },
  usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isActive: { type: Boolean, default: true },
  description: String
}, { timestamps: true }));

const Referral = mongoose.model('Referral', new mongoose.Schema({
  referFrdId: { type: String, required: true, unique: true, index: true },
  fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toEmails: [String],
  note: { type: String, maxlength: 500 },
  sendReminder: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'accepted', 'expired'], default: 'pending' },
  redeemedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  redeemedAt: Date,
  expiresAt: { type: Date, required: true },
  reminderSentAt: Date
}, { timestamps: true }));

const Cart = mongoose.model('Cart', new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    price: { type: Number, required: true, min: 0 }
  }],
  totalAmount: { type: Number, required: true, default: 0, min: 0 }
}, { timestamps: true }));

const WishlistShare = mongoose.model('WishlistShare', new mongoose.Schema({
  shareId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expiresAt: { type: Date, required: true, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  isActive: { type: Boolean, default: true }
}, { timestamps: true }));

const Product = mongoose.model('Product', new mongoose.Schema({
  sku: { type: String, required: true, unique: true },
  variant: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  category: { type: String, required: true },
  subCategory: { type: String, enum: ['Ring', 'Bracelet', 'Pendant', 'Earring'], required: true },
  price: { type: Number, required: true, min: 0 }
}, { timestamps: true }));

// Helper function to generate random date
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Helper function to generate unique referral ID
const generateReferralId = () => {
  return 'REF' + Math.random().toString(36).substring(2, 10).toUpperCase();
};

// Seed data function
const seedData = async () => {
  try {
    console.log('\n🌱 Starting to seed referral and promo code data...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await PromoCode.deleteMany({});
    await Referral.deleteMany({});
    await Cart.deleteMany({});
    await WishlistShare.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Step 1: Check or create users
    console.log('👥 Checking/Creating users...');
    let users = await User.find({}).limit(10);
    
    if (users.length < 5) {
      console.log('Creating new dummy users...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const newUsers = [];
      const userEmails = [
        { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' },
        { firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com' },
        { firstName: 'Mike', lastName: 'Johnson', email: 'mike.johnson@example.com' },
        { firstName: 'Sarah', lastName: 'Williams', email: 'sarah.williams@example.com' },
        { firstName: 'David', lastName: 'Brown', email: 'david.brown@example.com' },
        { firstName: 'Emma', lastName: 'Davis', email: 'emma.davis@example.com' },
        { firstName: 'James', lastName: 'Miller', email: 'james.miller@example.com' },
        { firstName: 'Olivia', lastName: 'Wilson', email: 'olivia.wilson@example.com' }
      ];

      for (const userData of userEmails) {
        const existingUser = await User.findOne({ email: userData.email });
        if (!existingUser) {
          const user = new User({
            firstName: userData.firstName,
            lastName: userData.lastName,
            name: `${userData.firstName} ${userData.lastName}`,
            email: userData.email,
            password: hashedPassword,
            phone: '+1' + Math.floor(Math.random() * 9000000000 + 1000000000),
            isVerified: true,
            role: 'customer',
            country: 'USA',
            state: 'California',
            city: 'Los Angeles',
            zipCode: '90001',
            address: {
              billingAddress: {
                street: '123 Main St',
                city: 'Los Angeles',
                state: 'California',
                country: 'USA',
                zipCode: '90001'
              },
              shippingAddress: {
                street: '123 Main St',
                city: 'Los Angeles',
                state: 'California',
                country: 'USA',
                zipCode: '90001',
                sameAsBilling: true
              }
            },
            referralCode: userData.firstName.substring(0, 3).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase(),
            referralCount: 0,
            totalReferralEarnings: 0,
            usedPromoCodes: [],
            usedReferralCodes: []
          });
          await user.save();
          newUsers.push(user);
        } else {
          newUsers.push(existingUser);
        }
      }
      users = newUsers;
    }
    console.log(`✅ ${users.length} users available\n`);

    // Step 2: Create Promo Codes
    console.log('🎫 Creating promo codes...');
    const promoCodes = [
      {
        code: 'WELCOME2024',
        discountType: 'percentage',
        discountValue: 20,
        minPurchase: 1000,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        usageLimit: 100,
        usedCount: 15,
        usedBy: users.slice(0, 3).map(u => u._id),
        isActive: true,
        description: 'Welcome offer - 20% off on orders above ₹1000'
      },
      {
        code: 'FESTIVE500',
        discountType: 'flat',
        discountValue: 500,
        minPurchase: 5000,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        usageLimit: 50,
        usedCount: 8,
        usedBy: users.slice(1, 3).map(u => u._id),
        isActive: true,
        description: 'Festive special - ₹500 off on orders above ₹5000'
      },
      {
        code: 'NEWYEAR2024',
        discountType: 'percentage',
        discountValue: 25,
        minPurchase: 2000,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        usageLimit: 200,
        usedCount: 45,
        usedBy: users.slice(0, 5).map(u => u._id),
        isActive: true,
        description: 'New Year offer - 25% off on orders above ₹2000'
      },
      {
        code: 'EXPIRED2023',
        discountType: 'flat',
        discountValue: 1000,
        minPurchase: 10000,
        expiresAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // Expired 10 days ago
        usageLimit: 10,
        usedCount: 5,
        usedBy: users.slice(0, 2).map(u => u._id),
        isActive: false,
        description: 'Expired promo code'
      },
      {
        code: 'FULLUSED100',
        discountType: 'percentage',
        discountValue: 15,
        minPurchase: 1500,
        expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        usageLimit: 5,
        usedCount: 5,
        usedBy: users.slice(0, 5).map(u => u._id),
        isActive: true,
        description: 'Fully used promo code - 15% off'
      },
      {
        code: 'FIRSTORDER',
        discountType: 'flat',
        discountValue: 300,
        minPurchase: 3000,
        expiresAt: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        usageLimit: 1000,
        usedCount: 0,
        usedBy: [],
        isActive: true,
        description: 'First order special - ₹300 off on orders above ₹3000'
      },
      {
        code: 'LUXURY10',
        discountType: 'percentage',
        discountValue: 10,
        minPurchase: 15000,
        expiresAt: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
        usageLimit: 30,
        usedCount: 12,
        usedBy: users.slice(2, 5).map(u => u._id),
        isActive: true,
        description: 'Luxury collection - 10% off on orders above ₹15000'
      },
      {
        code: 'FLASHSALE',
        discountType: 'flat',
        discountValue: 750,
        minPurchase: 7500,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        usageLimit: 20,
        usedCount: 18,
        usedBy: users.slice(0, 6).map(u => u._id),
        isActive: true,
        description: 'Flash sale - ₹750 off on orders above ₹7500'
      }
    ];

    const createdPromoCodes = await PromoCode.insertMany(promoCodes);
    console.log(`✅ Created ${createdPromoCodes.length} promo codes\n`);

    // Step 3: Create Referrals
    console.log('🔗 Creating referrals...');
    const referrals = [];
    
    // Active referrals
    for (let i = 0; i < 5; i++) {
      const fromUser = users[i];
      const toEmails = [
        `friend${i}a@example.com`,
        `friend${i}b@example.com`,
        `friend${i}c@example.com`
      ];
      
      referrals.push({
        referFrdId: generateReferralId(),
        fromUserId: fromUser._id,
        toEmails: toEmails,
        note: `Check out this amazing jewelry collection! Use my referral code for special discounts.`,
        sendReminder: Math.random() > 0.5,
        status: 'pending',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        reminderSentAt: Math.random() > 0.5 ? randomDate(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), new Date()) : null
      });
    }

    // Accepted referrals
    for (let i = 0; i < 3; i++) {
      const fromUser = users[i];
      const redeemedUser = users[i + 3];
      
      referrals.push({
        referFrdId: generateReferralId(),
        fromUserId: fromUser._id,
        toEmails: [redeemedUser.email],
        note: `Hey! I think you'll love this jewelry store. Use my referral code!`,
        sendReminder: false,
        status: 'accepted',
        redeemedBy: redeemedUser._id,
        redeemedAt: randomDate(new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), new Date()),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
    }

    // Expired referrals
    for (let i = 0; i < 2; i++) {
      const fromUser = users[i + 5];
      
      referrals.push({
        referFrdId: generateReferralId(),
        fromUserId: fromUser._id,
        toEmails: [`expired${i}@example.com`],
        note: `Limited time offer - check this out!`,
        sendReminder: true,
        status: 'expired',
        expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Expired 5 days ago
        reminderSentAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
      });
    }

    const createdReferrals = await Referral.insertMany(referrals);
    console.log(`✅ Created ${createdReferrals.length} referrals\n`);

    // Step 4: Update Users with referral and promo code data
    console.log('🔄 Updating users with referral and promo code data...');
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const updates = {};

      // Add used promo codes (random selection)
      const usedPromos = createdPromoCodes
        .filter(pc => pc.usedBy.some(id => id.toString() === user._id.toString()))
        .map(pc => pc._id);
      updates.usedPromoCodes = usedPromos;

      // Add used referral codes (random)
      const usedReferralCodes = [];
      if (i > 2) {
        const numReferrals = Math.floor(Math.random() * 3);
        for (let j = 0; j < numReferrals; j++) {
          usedReferralCodes.push(users[Math.floor(Math.random() * 3)].referralCode);
        }
      }
      updates.usedReferralCodes = usedReferralCodes;

      // Update referral count and earnings for users who referred others
      const acceptedReferrals = createdReferrals.filter(
        r => r.fromUserId.toString() === user._id.toString() && r.status === 'accepted'
      );
      updates.referralCount = acceptedReferrals.length;
      updates.totalReferralEarnings = acceptedReferrals.length * 500; // ₹500 per referral

      // Update available offers
      updates.availableOffers = Math.floor(Math.random() * 5);

      await User.findByIdAndUpdate(user._id, updates);
    }
    console.log(`✅ Updated ${users.length} users\n`);

    // Step 5: Create or check products for cart
    console.log('📦 Checking/Creating products...');
    let products = await Product.find({}).limit(5);
    
    if (products.length < 3) {
      console.log('Creating dummy products...');
      const dummyProducts = [
        {
          sku: 'GR1-RD-70-2T-BR-RG-001',
          variant: 'GR1',
          title: 'Elegant Diamond Ring',
          description: 'Beautiful diamond ring with 18kt gold',
          category: 'Gents Ring',
          subCategory: 'Ring',
          price: 45000
        },
        {
          sku: 'BR2-RD-50-1T-PL-WG-002',
          variant: 'BR2',
          title: 'Luxury Diamond Bracelet',
          description: 'Stunning diamond bracelet in white gold',
          category: 'Bracelet',
          subCategory: 'Bracelet',
          price: 85000
        },
        {
          sku: 'PD3-RD-30-2T-YG-003',
          variant: 'PD3',
          title: 'Classic Diamond Pendant',
          description: 'Timeless diamond pendant with yellow gold',
          category: 'Pendant',
          subCategory: 'Pendant',
          price: 35000
        },
        {
          sku: 'ER4-RD-40-1T-RG-004',
          variant: 'ER4',
          title: 'Radiant Diamond Earrings',
          description: 'Exquisite diamond earrings in rose gold',
          category: 'Earring',
          subCategory: 'Earring',
          price: 55000
        },
        {
          sku: 'GR5-PR-80-2T-PT-005',
          variant: 'GR5',
          title: 'Premium Platinum Ring',
          description: 'Luxurious platinum ring with princess cut diamond',
          category: 'Engagement Ring',
          subCategory: 'Ring',
          price: 125000
        }
      ];

      for (const productData of dummyProducts) {
        const existing = await Product.findOne({ sku: productData.sku });
        if (!existing) {
          await Product.create(productData);
        }
      }
      products = await Product.find({}).limit(5);
    }
    console.log(`✅ ${products.length} products available\n`);

    // Step 6: Create Carts
    console.log('🛒 Creating carts...');
    const carts = [];
    
    for (let i = 0; i < Math.min(5, users.length); i++) {
      const user = users[i];
      const numItems = Math.floor(Math.random() * 3) + 1;
      const cartItems = [];
      let totalAmount = 0;

      for (let j = 0; j < numItems; j++) {
        const product = products[j % products.length];
        const quantity = Math.floor(Math.random() * 2) + 1;
        const price = product.price;
        
        cartItems.push({
          product: product._id,
          quantity: quantity,
          price: price
        });
        totalAmount += price * quantity;
      }

      carts.push({
        user: user._id,
        items: cartItems,
        totalAmount: totalAmount
      });
    }

    const createdCarts = await Cart.insertMany(carts);
    console.log(`✅ Created ${createdCarts.length} carts\n`);

    // Step 7: Create Wishlist Shares
    console.log('💝 Creating wishlist shares...');
    const wishlistShares = [];
    
    for (let i = 0; i < Math.min(6, users.length); i++) {
      const user = users[i];
      
      wishlistShares.push({
        shareId: 'WISH' + Math.random().toString(36).substring(2, 12).toUpperCase(),
        userId: user._id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: i < 4 // First 4 active, rest inactive
      });
    }

    const createdWishlistShares = await WishlistShare.insertMany(wishlistShares);
    console.log(`✅ Created ${createdWishlistShares.length} wishlist shares\n`);

    // Summary
    console.log('\n📊 SEEDING SUMMARY\n' + '='.repeat(50));
    console.log(`👥 Users: ${users.length}`);
    console.log(`🎫 Promo Codes: ${createdPromoCodes.length}`);
    console.log(`   - Active: ${createdPromoCodes.filter(p => p.isActive && (!p.expiresAt || p.expiresAt > new Date())).length}`);
    console.log(`   - Expired: ${createdPromoCodes.filter(p => p.expiresAt && p.expiresAt < new Date()).length}`);
    console.log(`   - Fully Used: ${createdPromoCodes.filter(p => p.usedCount >= p.usageLimit).length}`);
    console.log(`🔗 Referrals: ${createdReferrals.length}`);
    console.log(`   - Pending: ${createdReferrals.filter(r => r.status === 'pending').length}`);
    console.log(`   - Accepted: ${createdReferrals.filter(r => r.status === 'accepted').length}`);
    console.log(`   - Expired: ${createdReferrals.filter(r => r.status === 'expired').length}`);
    console.log(`📦 Products: ${products.length}`);
    console.log(`🛒 Carts: ${createdCarts.length}`);
    console.log(`💝 Wishlist Shares: ${createdWishlistShares.length}`);
    console.log('='.repeat(50) + '\n');

    console.log('✨ Seeding completed successfully!\n');

    // Display sample data
    console.log('\n📋 SAMPLE DATA\n' + '='.repeat(50));
    
    console.log('\n🎫 Sample Promo Codes:');
    createdPromoCodes.slice(0, 3).forEach(pc => {
      console.log(`   ${pc.code} - ${pc.discountType} ${pc.discountValue}${pc.discountType === 'percentage' ? '%' : '₹'} (Used: ${pc.usedCount}/${pc.usageLimit})`);
    });

    console.log('\n🔗 Sample Referrals:');
    createdReferrals.slice(0, 3).forEach(ref => {
      console.log(`   ${ref.referFrdId} - Status: ${ref.status} - To: ${ref.toEmails[0]}`);
    });

    console.log('\n👥 Sample Users with Referral Data:');
    const sampleUsers = await User.find({}).populate('usedPromoCodes').limit(3);
    sampleUsers.forEach(user => {
      console.log(`   ${user.name} (${user.email})`);
      console.log(`      Referral Code: ${user.referralCode}`);
      console.log(`      Referral Count: ${user.referralCount}`);
      console.log(`      Total Earnings: ₹${user.totalReferralEarnings}`);
      console.log(`      Used Promo Codes: ${user.usedPromoCodes.length}`);
      console.log(`      Used Referral Codes: ${user.usedReferralCodes.join(', ') || 'None'}`);
    });

    console.log('\n='.repeat(50) + '\n');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
};

// Main execution
const main = async () => {
  try {
    await connectDB();
    await seedData();
    console.log('✅ All done! Disconnecting from database...');
    await mongoose.disconnect();
    console.log('👋 Database disconnected. Goodbye!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
};

main();


