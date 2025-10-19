import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Import models
import { UserModel as User } from './src/models/userModel';
import Product from './src/models/productModel';
import Cart from './src/models/cartModel';
import PromoCode from './src/models/promoCodeModel';
import Settings from './src/models/settingsModel';

dotenv.config();

// Default jewelry images
const DEFAULT_IMAGES = {
  main: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&h=500&fit=crop',
  sub: [
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&h=500&fit=crop'
  ]
};

// Sample products data
const sampleProducts = [
  {
    sku: 'GR1-RD-70-2T-BR-RG',
    variant: 'GR1',
    title: 'Classic Gold Ring with Diamond',
    description: 'Elegant gold ring featuring a beautiful diamond centerpiece',
    category: 'Engagement Ring',
    subCategory: 'Ring' as const,
    price: 45000,
    diamondOrigin: ['Natural Diamond' as const],
    diamondShape: 'RD',
    diamondSize: 0.7,
    diamondColor: 'F',
    metal: 'RG',
    karat: 18,
    tone: '2T',
    finish: 'BR',
    images: DEFAULT_IMAGES,
    netWeightGrams: 3.5,
    isGiftingAvailable: true,
    isEngraving: true,
    rating: { score: 4.8, reviews: 125 }
  },
  {
    sku: 'BR2-PR-50-1T-PL-WG',
    variant: 'BR2',
    title: 'Princess Cut Diamond Bracelet',
    description: 'Stunning white gold bracelet with princess cut diamonds',
    category: 'Bracelet',
    subCategory: 'Bracelet' as const,
    price: 75000,
    diamondOrigin: ['Lab Grown Diamond' as const],
    diamondShape: 'PR',
    diamondSize: 0.5,
    diamondColor: 'G',
    metal: 'WG',
    karat: 18,
    tone: '1T',
    finish: 'PL',
    images: DEFAULT_IMAGES,
    netWeightGrams: 8.2,
    isGiftingAvailable: true,
    isEngraving: false,
    rating: { score: 4.6, reviews: 89 }
  },
  {
    sku: 'PN3-OV-30-1T-BR-YG',
    variant: 'PN3',
    title: 'Oval Diamond Pendant',
    description: 'Beautiful oval diamond pendant in yellow gold',
    category: 'Pendant',
    subCategory: 'Pendant' as const,
    price: 32000,
    diamondOrigin: ['Natural Diamond' as const],
    diamondShape: 'OV',
    diamondSize: 0.3,
    diamondColor: 'H',
    metal: 'YG',
    karat: 14,
    tone: '1T',
    finish: 'BR',
    images: DEFAULT_IMAGES,
    netWeightGrams: 2.1,
    chainLengthInches: 18,
    isGiftingAvailable: true,
    isEngraving: true,
    rating: { score: 4.7, reviews: 156 }
  },
  {
    sku: 'ER4-HR-25-1T-PL-RG',
    variant: 'ER4',
    title: 'Heart Diamond Earrings',
    description: 'Romantic heart-shaped diamond earrings in rose gold',
    category: 'Earring',
    subCategory: 'Earring' as const,
    price: 28000,
    diamondOrigin: ['Lab Grown Diamond' as const],
    diamondShape: 'HR',
    diamondSize: 0.25,
    diamondColor: 'I',
    metal: 'RG',
    karat: 18,
    tone: '1T',
    finish: 'PL',
    images: DEFAULT_IMAGES,
    netWeightGrams: 1.8,
    isGiftingAvailable: true,
    isEngraving: false,
    rating: { score: 4.9, reviews: 203 }
  },
  {
    sku: 'GR5-MQ-60-2T-BR-PT',
    variant: 'GR5',
    title: 'Marquise Diamond Ring',
    description: 'Unique marquise cut diamond ring in platinum',
    category: 'Solitaire',
    subCategory: 'Ring' as const,
    price: 85000,
    diamondOrigin: ['Natural Diamond' as const],
    diamondShape: 'MQ',
    diamondSize: 0.6,
    diamondColor: 'E',
    metal: 'PT',
    karat: 18,
    tone: '2T',
    finish: 'BR',
    images: DEFAULT_IMAGES,
    netWeightGrams: 4.2,
    isGiftingAvailable: true,
    isEngraving: true,
    rating: { score: 4.8, reviews: 78 }
  }
];

// Sample user data
const sampleUsers = [
  {
    firstName: 'John',
    lastName: 'Doe',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    passwordHash: '', // Will be hashed
    phone: '+1234567890',
    country: 'USA',
    state: 'California',
    city: 'Los Angeles',
    zipCode: '90210',
    isVerified: true,
    role: 'customer' as const,
    // Addresses moved to Order model
    isActive: true,
    availableOffers: 2
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    password: 'password123',
    passwordHash: '', // Will be hashed
    phone: '+1987654321',
    country: 'USA',
    state: 'New York',
    city: 'New York',
    zipCode: '10001',
    isVerified: true,
    role: 'customer' as const,
    // Addresses moved to Order model
    isActive: true,
    availableOffers: 1
  },
  {
    firstName: 'Admin',
    lastName: 'User',
    name: 'Admin User',
    email: 'admin@kynajewels.com',
    password: 'admin123',
    passwordHash: '', // Will be hashed
    phone: '+1555123456',
    country: 'USA',
    state: 'California',
    city: 'San Francisco',
    zipCode: '94105',
    isVerified: true,
    role: 'admin' as const,
    // Addresses moved to Order model
    isActive: true,
    availableOffers: 0
  }
];

async function connectToDatabase() {
  try {
    const mongoUri = 'mongodb://localhost:27017/kyna-jewels';
    console.log(`🔗 Connecting to: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function clearDatabase() {
  try {
    await User.deleteMany({});
    await Product.deleteMany({});
    await Cart.deleteMany({});
    console.log('🗑️ Cleared existing data');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  }
}

async function createUsers() {
  console.log('👥 Creating users...');
  const createdUsers = [];
  
  for (const userData of sampleUsers) {
    const user = new User({
      ...userData,
      passwordHash: userData.password // Let the pre-save hook handle hashing
      // Don't set password field - let it be undefined
    });
    
    const savedUser = await user.save();
    createdUsers.push(savedUser);
    console.log(`✅ Created user: ${savedUser.email}`);
  }
  
  return createdUsers;
}

async function createSampleOrders(users: any[], products: any[]) {
  console.log('📦 Creating sample orders...');
  const Order = require('./src/models/orderModel').default;
  
  const sampleOrders = [
    {
      user: users[0]._id, // John Doe
      orderNumber: 'ORD-001',
      items: [
        {
          product: products[0]._id,
          productModel: 'Ring',
          quantity: 1,
          price: 45000,
          total: 45000
        }
      ],
      billingAddress: {
        companyName: 'Doe Enterprises',
        street: '123 Main Street',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        zipCode: '560001'
      },
      shippingAddress: {
        companyName: 'Doe Enterprises',
        street: '123 Main Street',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        zipCode: '560001',
        sameAsBilling: true
      },
      paymentMethod: 'Credit Card',
      paymentStatus: 'paid',
      orderStatus: 'delivered',
      subtotal: 45000,
      gst: 8100,
      shippingCharge: 0,
      totalAmount: 53100,
      trackingNumber: 'TRK123456789',
      orderedAt: new Date('2024-01-15'),
      shippedAt: new Date('2024-01-16'),
      deliveredAt: new Date('2024-01-20')
    },
    {
      user: users[1]._id, // Jane Smith
      orderNumber: 'ORD-002',
      items: [
        {
          product: products[1]._id,
          productModel: 'Bracelet',
          quantity: 1,
          price: 75000,
          total: 75000
        }
      ],
      billingAddress: {
        companyName: 'Smith & Co',
        street: '456 Oak Avenue',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        zipCode: '400001'
      },
      shippingAddress: {
        street: '789 Pine Street',
        city: 'Delhi',
        state: 'Delhi',
        country: 'India',
        zipCode: '110001',
        sameAsBilling: false
      },
      paymentMethod: 'UPI',
      paymentStatus: 'paid',
      orderStatus: 'processing',
      subtotal: 75000,
      gst: 13500,
      shippingCharge: 100,
      totalAmount: 88600,
      orderedAt: new Date('2024-01-20')
    }
  ];

  const createdOrders = [];
  for (const orderData of sampleOrders) {
    const order = new Order(orderData);
    const savedOrder = await order.save();
    createdOrders.push(savedOrder);
    console.log(`✅ Created order: ${savedOrder.orderNumber}`);
  }

  return createdOrders;
}

async function addWishlistItems(users: any[], products: any[]) {
  console.log('💝 Adding wishlist items...');
  
  // Add some products to John Doe's wishlist
  const johnDoe = users.find(user => user.email === 'john.doe@example.com');
  if (johnDoe && products.length >= 2) {
    johnDoe.wishlist = [products[0]._id, products[2]._id]; // First and third products
    await johnDoe.save();
    console.log(`✅ Added 2 items to ${johnDoe.firstName}'s wishlist`);
  }
  
  // Add some products to Jane Smith's wishlist
  const janeSmith = users.find(user => user.email === 'jane.smith@example.com');
  if (janeSmith && products.length >= 3) {
    janeSmith.wishlist = [products[1]._id, products[3]._id]; // Second and fourth products
    await janeSmith.save();
    console.log(`✅ Added 2 items to ${janeSmith.firstName}'s wishlist`);
  }
}

async function createProducts() {
  console.log('💎 Creating products...');
  const createdProducts = [];
  
  for (const productData of sampleProducts) {
    const product = new Product(productData);
    const savedProduct = await product.save();
    createdProducts.push(savedProduct);
    console.log(`✅ Created product: ${savedProduct.title}`);
  }
  
  return createdProducts;
}

async function createCartWithItems(users: any[], products: any[]) {
  console.log('🛒 Creating cart with items...');
  
  // Create cart for first user (John Doe) with multiple items
  const johnDoe = users.find(user => user.email === 'john.doe@example.com');
  const selectedProducts = products.slice(0, 3); // First 3 products
  
  const cartItems = selectedProducts.map(product => ({
    product: product._id,
    quantity: Math.floor(Math.random() * 3) + 1, // Random quantity 1-3
    price: product.price
  }));
  
  const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  const cart = new Cart({
    user: johnDoe._id,
    items: cartItems,
    totalAmount: totalAmount
  });
  
  const savedCart = await cart.save();
  console.log(`✅ Created cart for ${johnDoe.email} with ${cartItems.length} items`);
  console.log(`💰 Total amount: ₹${totalAmount.toLocaleString()}`);
  
  return savedCart;
}

async function createSettings() {
  console.log('⚙️ Creating settings...');
  
  // Check if settings already exist
  let settings = await Settings.findOne({ isActive: true });
  
  if (!settings) {
    settings = new Settings({
      referralRewardFriend: 100, // ₹100 for friend
      referralRewardReferrer: 100, // ₹100 for referrer
      promoExpiryDays: 30,
      isActive: true
    });
    
    settings = await settings.save();
    console.log('✅ Created settings with referral rewards: ₹100 each');
  } else {
    console.log('✅ Settings already exist with referral rewards: ₹100 each');
  }
  
  return settings;
}

async function createPromoCodes() {
  console.log('🎟️ Creating promo codes...');
  
  const promoCodes = [
    {
      code: 'SAVE20',
      discountType: 'percentage',
      discountValue: 20,
      minPurchase: 10000,
      usageLimit: 100,
      description: '20% off on orders above ₹10,000'
    },
    {
      code: 'FLAT500',
      discountType: 'flat',
      discountValue: 500,
      minPurchase: 5000,
      usageLimit: 50,
      description: '₹500 off on orders above ₹5,000'
    },
    {
      code: 'WELCOME10',
      discountType: 'percentage',
      discountValue: 10,
      minPurchase: 0,
      usageLimit: 200,
      description: '10% off for new customers'
    },
    {
      code: 'JOHNDOE20',
      discountType: 'percentage',
      discountValue: 20,
      minPurchase: 0,
      usageLimit: 1,
      description: 'Special 20% off for John Doe'
    },
    {
      code: 'TEST100',
      discountType: 'flat',
      discountValue: 100,
      minPurchase: 0,
      usageLimit: 5,
      description: 'Test promo code - ₹100 off'
    }
  ];
  
  const createdPromoCodes = [];
  for (const promoData of promoCodes) {
    // Check if promo code already exists
    let promoCode = await PromoCode.findOne({ code: promoData.code });
    
    if (!promoCode) {
      promoCode = new PromoCode(promoData);
      promoCode = await promoCode.save();
      console.log(`✅ Created promo code: ${promoCode.code}`);
    } else {
      console.log(`✅ Promo code already exists: ${promoCode.code}`);
    }
    
    createdPromoCodes.push(promoCode);
  }
  
  return createdPromoCodes;
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    await connectToDatabase();
    await clearDatabase();
    
    const users = await createUsers();
    const products = await createProducts();
    const cart = await createCartWithItems(users, products);
    const orders = await createSampleOrders(users, products);
    const settings = await createSettings();
    const promoCodes = await createPromoCodes();
    await addWishlistItems(users, products);
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`👥 Users created: ${users.length}`);
    console.log(`💎 Products created: ${products.length}`);
    console.log(`🛒 Cart created: 1 (for John Doe)`);
    console.log(`📦 Orders created: ${orders.length}`);
    console.log(`⚙️ Settings created: 1`);
    console.log(`🎟️ Promo codes created: ${promoCodes.length}`);
    
    console.log('\n🔑 Login Credentials:');
    console.log('Customer Account:');
    console.log('  Email: john.doe@example.com');
    console.log('  Password: password123');
    console.log('  Cart Items: 3 products');
    console.log('');
    console.log('Admin Account:');
    console.log('  Email: admin@kynajewels.com');
    console.log('  Password: admin123');
    console.log('');
    console.log('Test Account:');
    console.log('  Email: jane.smith@example.com');
    console.log('  Password: password123');
    
    console.log('\n🎟️ Promo Codes:');
    console.log('  SAVE20 - 20% off (min ₹10,000)');
    console.log('  FLAT500 - ₹500 off (min ₹5,000)');
    console.log('  WELCOME10 - 10% off (no minimum)');
    console.log('  JOHNDOE20 - 20% off for John Doe (no minimum)');
    console.log('  TEST100 - ₹100 off (no minimum)');
    
    console.log('\n👥 Referral Codes:');
    users.forEach(user => {
      console.log(`  ${user.firstName} ${user.lastName}: ${user.referralCode}`);
    });
    
    console.log('\n🧪 Test Instructions:');
    console.log('1. Login as john.doe@example.com');
    console.log('2. Go to cart page');
    console.log('3. Try promo codes: JOHNDOE20, TEST100');
    console.log('4. Try referral code: JANEJNW (Jane Smith\'s code)');
    console.log('5. Check wallet amount updates');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the seeding
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };
