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

const User = mongoose.model('User', new mongoose.Schema({}, { strict: false, strictPopulate: false }));
const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false, strictPopulate: false }));
const PaymentOrder = mongoose.model('PaymentOrder', new mongoose.Schema({}, { strict: false, strictPopulate: false }));

const fixExistingOrders = async () => {
  try {
    console.log('🔄 Fixing existing orders in user records...\n');

    // Get all regular orders
    const allOrders = await Order.find({});
    console.log(`Found ${allOrders.length} regular orders in database`);

    // Get all payment orders (customized jewelry, etc.)
    const allPaymentOrders = await PaymentOrder.find({});
    console.log(`Found ${allPaymentOrders.length} payment orders in database\n`);

    const totalOrders = allOrders.length + allPaymentOrders.length;

    if (totalOrders === 0) {
      console.log('✅ No orders found. Nothing to fix.');
      return;
    }

    let fixedCount = 0;
    let alreadyCorrect = 0;

    // Process regular orders
    console.log('📦 Processing regular orders...');
    // Process each order
    for (const order of allOrders) {
      const userId = order.user;
      
      if (!userId) {
        console.log(`⚠️  Order ${order._id} has no user ID - skipping`);
        continue;
      }

      // Get the user
      const user = await User.findById(userId);
      
      if (!user) {
        console.log(`⚠️  User ${userId} not found for order ${order._id} - skipping`);
        continue;
      }

      // Check if order is already in user's orders array
      const orderIdString = order._id.toString();
      const userOrdersStrings = (user.orders || []).map(id => id.toString());
      
      if (userOrdersStrings.includes(orderIdString)) {
        alreadyCorrect++;
        continue;
      }

      // Add order to user's orders array
      await User.findByIdAndUpdate(
        userId,
        { $push: { orders: order._id } }
      );
      
      fixedCount++;
      console.log(`✅ Added order ${order._id} to user ${user.email}'s orders array`);
    }

    // Process payment orders
    console.log('\n💳 Processing payment orders (customized jewelry)...');
    for (const order of allPaymentOrders) {
      const userId = order.userId;
      
      if (!userId) {
        console.log(`⚠️  Payment order ${order._id} has no user ID - skipping`);
        continue;
      }

      // Get the user
      const user = await User.findById(userId);
      
      if (!user) {
        console.log(`⚠️  User ${userId} not found for payment order ${order._id} - skipping`);
        continue;
      }

      // Check if order is already in user's orders array
      const orderIdString = order._id.toString();
      const userOrdersStrings = (user.orders || []).map(id => id.toString());
      
      if (userOrdersStrings.includes(orderIdString)) {
        alreadyCorrect++;
        continue;
      }

      // Add order to user's orders array
      await User.findByIdAndUpdate(
        userId,
        { $push: { orders: order._id } }
      );
      
      fixedCount++;
      console.log(`✅ Added payment order ${order._id} to user ${user.email}'s orders array`);
    }

    console.log('\n' + '═'.repeat(70));
    console.log('📊 SUMMARY');
    console.log('═'.repeat(70));
    console.log(`Total Regular Orders: ${allOrders.length}`);
    console.log(`Total Payment Orders: ${allPaymentOrders.length}`);
    console.log(`Total Orders: ${totalOrders}`);
    console.log(`Already Correct: ${alreadyCorrect}`);
    console.log(`Fixed: ${fixedCount}`);
    console.log('═'.repeat(70) + '\n');

    // Display updated user stats
    console.log('👥 Updated User Statistics:\n');
    
    const usersWithOrders = await User.find({ 
      orders: { $exists: true, $ne: [] } 
    }).select('email firstName lastName orders');

    if (usersWithOrders.length > 0) {
      for (const user of usersWithOrders) {
        console.log(`📧 ${user.email}`);
        console.log(`   Name: ${user.firstName} ${user.lastName || ''}`);
        console.log(`   Total Orders: ${user.orders.length}`);
        
        // Get regular order details
        const userOrders = await Order.find({ 
          _id: { $in: user.orders } 
        }).select('orderNumber totalAmount orderStatus createdAt');
        
        // Get payment order details
        const userPaymentOrders = await PaymentOrder.find({ 
          _id: { $in: user.orders } 
        }).select('orderNumber amount status paymentStatus createdAt orderCategory orderType');
        
        userOrders.forEach((order, idx) => {
          console.log(`   ${idx + 1}. [Regular] Order ${order.orderNumber || order._id}`);
          console.log(`      Amount: ₹${order.totalAmount?.toLocaleString() || 'N/A'}`);
          console.log(`      Status: ${order.orderStatus || 'N/A'}`);
          console.log(`      Date: ${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}`);
        });
        
        userPaymentOrders.forEach((order, idx) => {
          console.log(`   ${userOrders.length + idx + 1}. [${order.orderCategory}] Order ${order.orderNumber || order._id}`);
          console.log(`      Amount: ₹${order.amount?.toLocaleString() || 'N/A'}`);
          console.log(`      Payment Status: ${order.paymentStatus || order.status || 'N/A'}`);
          console.log(`      Type: ${order.orderType || 'N/A'}`);
          console.log(`      Date: ${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}`);
        });
        console.log();
      }
    } else {
      console.log('   No users with orders found.');
    }

    console.log('✅ Fix completed successfully!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
};

const main = async () => {
  await connectDB();
  await fixExistingOrders();
  await mongoose.disconnect();
  console.log('👋 Disconnected. Goodbye!\n');
  process.exit(0);
};

main();

