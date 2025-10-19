// Script to create a sample product for testing
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/kynajewels', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Product Schema (simplified for testing)
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  variant: { type: String, required: true },
  description: { type: String },
  diamondShape: { type: String },
  diamondSize: { type: Number },
  diamondColor: { type: String },
  diamondOrigin: { type: String },
  tone: { type: String },
  finish: { type: String },
  metal: { type: String },
  karat: { type: Number },
  price: { type: Number },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  inStock: { type: Boolean, default: true },
  stockQuantity: { type: Number, default: 0 },
  tags: [String],
  specifications: {
    weight: String,
    dimensions: String,
    warranty: String,
    certification: String
  },
  images: {
    main: String,
    sub: [String]
  }
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);

// Sample products to create
const sampleProducts = [
  {
    name: "Gents Ring GR1",
    sku: "GR1",
    category: "Gents Ring",
    variant: "GR1",
    description: "Elegant gents ring with round diamond",
    diamondShape: "RD",
    diamondSize: 0.70,
    diamondColor: "G",
    diamondOrigin: "Natural",
    tone: "2T",
    finish: "BR",
    metal: "RG",
    karat: 18,
    price: 25000,
    rating: 4.5,
    reviews: 12,
    inStock: true,
    stockQuantity: 5,
    tags: ["gents", "ring", "diamond", "gold"],
    specifications: {
      weight: "3.5g",
      dimensions: "8mm x 6mm",
      warranty: "1 year",
      certification: "BIS Hallmark"
    },
    images: {
      main: "https://yourdomain.com/images/rings/GR1-RD-70-2T-BR-RG-GP.jpg",
      sub: [
        "https://yourdomain.com/images/rings/GR1-RD-70-2T-BR-RG-SIDE.jpg",
        "https://yourdomain.com/images/rings/GR1-RD-70-2T-BR-RG-TOP.jpg",
        "https://yourdomain.com/images/rings/GR1-RD-70-2T-BR-RG-DETAIL.jpg",
        "https://yourdomain.com/images/rings/GR1-RD-70-2T-BR-RG-LIFESTYLE.jpg",
        "https://yourdomain.com/images/rings/GR1-RD-70-2T-BR-RG-COMPARISON.jpg",
        "https://yourdomain.com/images/rings/GR1-RD-70-2T-BR-RG-CUSTOM.jpg",
        "https://yourdomain.com/images/rings/GR1-RD-70-2T-BR-RG-360.jpg"
      ]
    }
  },
  {
    name: "Engagement Ring ENG1",
    sku: "ENG1",
    category: "Engagement Ring",
    variant: "ENG1",
    description: "Beautiful engagement ring with princess cut diamond",
    diamondShape: "PR",
    diamondSize: 1.00,
    diamondColor: "F",
    diamondOrigin: "Natural",
    tone: "1T",
    finish: "PL",
    metal: "WG",
    karat: 18,
    price: 45000,
    rating: 4.8,
    reviews: 25,
    inStock: true,
    stockQuantity: 3,
    tags: ["engagement", "ring", "diamond", "white-gold"],
    specifications: {
      weight: "4.2g",
      dimensions: "10mm x 8mm",
      warranty: "2 years",
      certification: "GIA Certified"
    },
    images: {
      main: "https://yourdomain.com/images/rings/ENG1-PR-100-1T-PL-WG-GP.jpg",
      sub: [
        "https://yourdomain.com/images/rings/ENG1-PR-100-1T-PL-WG-SIDE.jpg",
        "https://yourdomain.com/images/rings/ENG1-PR-100-1T-PL-WG-TOP.jpg",
        "https://yourdomain.com/images/rings/ENG1-PR-100-1T-PL-WG-DETAIL.jpg",
        "https://yourdomain.com/images/rings/ENG1-PR-100-1T-PL-WG-LIFESTYLE.jpg",
        "https://yourdomain.com/images/rings/ENG1-PR-100-1T-PL-WG-COMPARISON.jpg",
        "https://yourdomain.com/images/rings/ENG1-PR-100-1T-PL-WG-CUSTOM.jpg",
        "https://yourdomain.com/images/rings/ENG1-PR-100-1T-PL-WG-360.jpg"
      ]
    }
  },
  {
    name: "Bracelet BR1",
    sku: "BR1",
    category: "Bracelet",
    variant: "BR1",
    description: "Elegant diamond bracelet",
    diamondShape: "RD",
    diamondSize: 0.25,
    diamondColor: "H",
    diamondOrigin: "Lab-grown",
    tone: "2T",
    finish: "PL",
    metal: "SL",
    karat: 18,
    price: 15000,
    rating: 4.2,
    reviews: 8,
    inStock: true,
    stockQuantity: 7,
    tags: ["bracelet", "diamond", "silver"],
    specifications: {
      weight: "8.5g",
      dimensions: "18cm length",
      warranty: "1 year",
      certification: "BIS Hallmark"
    },
    images: {
      main: "https://yourdomain.com/images/bracelets/BR1-RD-25-2T-PL-SL-GP.jpg",
      sub: [
        "https://yourdomain.com/images/bracelets/BR1-RD-25-2T-PL-SL-SIDE.jpg",
        "https://yourdomain.com/images/bracelets/BR1-RD-25-2T-PL-SL-TOP.jpg",
        "https://yourdomain.com/images/bracelets/BR1-RD-25-2T-PL-SL-DETAIL.jpg",
        "https://yourdomain.com/images/bracelets/BR1-RD-25-2T-PL-SL-LIFESTYLE.jpg",
        "https://yourdomain.com/images/bracelets/BR1-RD-25-2T-PL-SL-COMPARISON.jpg",
        "https://yourdomain.com/images/bracelets/BR1-RD-25-2T-PL-SL-CUSTOM.jpg",
        "https://yourdomain.com/images/bracelets/BR1-RD-25-2T-PL-SL-360.jpg"
      ]
    }
  }
];

async function createSampleProducts() {
  try {
    console.log('🚀 Creating sample products for testing...\n');
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('✅ Cleared existing products');
    
    // Create sample products
    for (const productData of sampleProducts) {
      const product = new Product(productData);
      await product.save();
      console.log(`✅ Created product: ${product.name} (${product.sku})`);
    }
    
    console.log('\n🎉 Sample products created successfully!');
    console.log('\n📊 Products created:');
    
    const products = await Product.find({});
    products.forEach(product => {
      console.log(`- ${product.name} (${product.sku}) - ₹${product.price}`);
    });
    
    console.log('\n🔗 You can now test the APIs with these products:');
    console.log('- GET /api/products');
    console.log('- GET /api/products/' + products[0]._id + '/price');
    console.log('- GET /api/products/' + products[0]._id + '/images');
    console.log('- GET /api/products/' + products[0]._id);
    
  } catch (error) {
    console.error('❌ Error creating sample products:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

createSampleProducts();
