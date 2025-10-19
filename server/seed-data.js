const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const { UserModel: User } = require('./src/models/userModel');
const Product = require('./src/models/productModel').default;
const Cart = require('./src/models/cartModel').default;

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
    subCategory: 'Ring',
    price: 45000,
    diamondOrigin: ['Natural Diamond'],
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
    subCategory: 'Bracelet',
    price: 75000,
    diamondOrigin: ['Lab Grown Diamond'],
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
    subCategory: 'Pendant',
    price: 32000,
    diamondOrigin: ['Natural Diamond'],
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
    subCategory: 'Earring',
    price: 28000,
    diamondOrigin: ['Lab Grown Diamond'],
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
    subCategory: 'Ring',
    price: 85000,
    diamondOrigin: ['Natural Diamond'],
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
    zipCode: '90210',
    isVerified: true,
    role: 'customer',
    addresses: [{
      label: 'Home',
      street: '123 Main Street',
      city: 'Los Angeles',
      state: 'California',
      postalCode: '90210',
      country: 'USA',
      isDefault: true
    }],
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
    zipCode: '10001',
    isVerified: true,
    role: 'customer',
    addresses: [{
      label: 'Home',
      street: '456 Oak Avenue',
      city: 'New York',
      state: 'New York',
      postalCode: '10001',
      country: 'USA',
      isDefault: true
    }],
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
    zipCode: '90210',
    isVerified: true,
    role: 'admin',
    addresses: [{
      label: 'Office',
      street: '789 Business Blvd',
      city: 'San Francisco',
      state: 'California',
      postalCode: '94105',
      country: 'USA',
      isDefault: true
    }],
    isActive: true,
    availableOffers: 0
  }
];

async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/kyna-jewels');
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
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = new User({
      ...userData,
      passwordHash: hashedPassword,
      password: hashedPassword
    });
    
    const savedUser = await user.save();
    createdUsers.push(savedUser);
    console.log(`✅ Created user: ${savedUser.email}`);
  }
  
  return createdUsers;
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

async function createCartWithItems(users, products) {
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

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    await connectToDatabase();
    await clearDatabase();
    
    const users = await createUsers();
    const products = await createProducts();
    const cart = await createCartWithItems(users, products);
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`👥 Users created: ${users.length}`);
    console.log(`💎 Products created: ${products.length}`);
    console.log(`🛒 Cart created: 1 (for John Doe)`);
    
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

module.exports = { seedDatabase };
