const mongoose = require('mongoose');

const USER_IDS = {
  aditya: '68f7f452330878c13e49f6dc',
  addy: '68f7f4ff330878c13e49f6e4'
};

async function seedData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/kyna-jewels', {
      serverSelectionTimeoutMS: 5000
    });
    console.log('Connected!');

    // Create simple schemas
    const ProductSchema = new mongoose.Schema({}, { strict: false });
    const CartSchema = new mongoose.Schema({}, { strict: false });
    const WishlistShareSchema = new mongoose.Schema({}, { strict: false });

    const Product = mongoose.model('Product', ProductSchema);
    const Cart = mongoose.model('Cart', CartSchema);
    const WishlistShare = mongoose.model('WishlistShare', WishlistShareSchema);

    // Create products
    console.log('\nCreating products...');
    const products = [];
    const productsData = [
      {
        sku: 'GR1-RD-70-2T-BR-RG',
        variant: 'GR1',
        title: 'Elegant Rose Gold Diamond Ring',
        category: 'Gents Ring',
        subCategory: 'Ring',
        price: 45000
      },
      {
        sku: 'SR2-PR-50-YG',
        variant: 'SR2',
        title: 'Classic Yellow Gold Princess Cut Ring',
        category: 'Solitaire',
        subCategory: 'Ring',
        price: 65000
      },
      {
        sku: 'PD1-RD-30-WG',
        variant: 'PD1',
        title: 'Delicate White Gold Diamond Pendant',
        category: 'Pendant',
        subCategory: 'Pendant',
        price: 35000
      },
      {
        sku: 'ER1-RD-25-RG',
        variant: 'ER1',
        title: 'Rose Gold Diamond Stud Earrings',
        category: 'Earring',
        subCategory: 'Earring',
        price: 28000
      },
      {
        sku: 'BR1-RD-100-PT',
        variant: 'BR1',
        title: 'Luxurious Platinum Diamond Bracelet',
        category: 'Bracelet',
        subCategory: 'Bracelet',
        price: 125000
      }
    ];

    for (const pd of productsData) {
      const existing = await Product.findOne({ sku: pd.sku });
      if (existing) {
        products.push(existing);
        console.log(`Product exists: ${pd.sku}`);
      } else {
        const newProduct = await Product.create(pd);
        products.push(newProduct);
        console.log(`Created: ${pd.sku}`);
      }
    }

    // Create carts
    console.log('\nCreating carts...');
    
    const cart1 = await Cart.findOneAndUpdate(
      { user: USER_IDS.aditya },
      {
        user: USER_IDS.aditya,
        items: [
          { product: products[0]._id, quantity: 1, price: products[0].price },
          { product: products[2]._id, quantity: 2, price: products[2].price },
          { product: products[3]._id, quantity: 1, price: products[3].price }
        ],
        totalAmount: products[0].price + (products[2].price * 2) + products[3].price
      },
      { upsert: true, new: true }
    );
    console.log(`Cart for Aditya: ${cart1.items.length} items, ₹${cart1.totalAmount}`);

    const cart2 = await Cart.findOneAndUpdate(
      { user: USER_IDS.addy },
      {
        user: USER_IDS.addy,
        items: [
          { product: products[1]._id, quantity: 1, price: products[1].price },
          { product: products[4]._id, quantity: 1, price: products[4].price }
        ],
        totalAmount: products[1].price + products[4].price
      },
      { upsert: true, new: true }
    );
    console.log(`Cart for Addy: ${cart2.items.length} items, ₹${cart2.totalAmount}`);

    // Create wishlist shares
    console.log('\nCreating wishlist shares...');
    
    const ws1 = await WishlistShare.findOneAndUpdate(
      { shareId: 'ADITYA-WISHLIST-2025' },
      {
        shareId: 'ADITYA-WISHLIST-2025',
        userId: USER_IDS.aditya,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true
      },
      { upsert: true, new: true }
    );
    console.log(`WishlistShare for Aditya: ${ws1.shareId}`);

    const ws2 = await WishlistShare.findOneAndUpdate(
      { shareId: 'ADDY-WISHLIST-2025' },
      {
        shareId: 'ADDY-WISHLIST-2025',
        userId: USER_IDS.addy,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true
      },
      { upsert: true, new: true }
    );
    console.log(`WishlistShare for Addy: ${ws2.shareId}`);

    console.log('\n✅ Seeding completed successfully!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

seedData();


