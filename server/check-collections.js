const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/kyna');
    console.log('✅ MongoDB Connected\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

const checkCollections = async () => {
  try {
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    console.log('📂 Available Collections:\n');
    collections.forEach((col, idx) => {
      console.log(`${idx + 1}. ${col.name}`);
    });
    
    console.log('\n🔍 Checking order-related collections:\n');
    
    // Check PaymentOrder collection (likely 'orders' or 'paymentorders')
    const paymentOrders = mongoose.connection.collection('orders');
    const paymentOrderCount = await paymentOrders.countDocuments();
    console.log(`orders collection: ${paymentOrderCount} documents`);
    
    // Sample from orders collection
    if (paymentOrderCount > 0) {
      const sample = await paymentOrders.findOne({});
      console.log('\nSample document from orders collection:');
      console.log('Fields:', Object.keys(sample).join(', '));
      console.log('ID:', sample._id);
      console.log('OrderId:', sample.orderId || 'N/A');
      console.log('UserId:', sample.userId || sample.user || 'N/A');
      console.log('OrderCategory:', sample.orderCategory || 'N/A');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

const main = async () => {
  await connectDB();
  await checkCollections();
  await mongoose.disconnect();
  console.log('\n✅ Done');
  process.exit(0);
};

main();

