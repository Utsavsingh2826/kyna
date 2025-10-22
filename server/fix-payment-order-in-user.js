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

const fixPaymentOrder = async () => {
  try {
    console.log('🔄 Adding payment order to user...\n');

    const userId = new mongoose.Types.ObjectId('68f7f452330878c13e49f6dc');
    const orderId = new mongoose.Types.ObjectId('68f88552cad18354a82a87e6');

    // Get the user
    const User = mongoose.connection.collection('users');
    const user = await User.findOne({ _id: userId });

    if (!user) {
      console.error('❌ User not found');
      return;
    }

    console.log(`Found user: ${user.email}`);
    console.log(`Current orders in user: ${(user.orders || []).length}`);

    // Check if order already in user's orders array
    const userOrders = (user.orders || []).map(id => id.toString());
    const orderIdString = orderId.toString();

    if (userOrders.includes(orderIdString)) {
      console.log('✅ Order already in user\'s orders array');
    } else {
      // Add order to user's orders array
      await User.updateOne(
        { _id: userId },
        { $push: { orders: orderId } }
      );
      console.log('✅ Added order to user\'s orders array');
    }

    // Verify the update
    const updatedUser = await User.findOne({ _id: userId });
    console.log(`\nUpdated orders count: ${(updatedUser.orders || []).length}`);
    console.log('Orders:', (updatedUser.orders || []).map(id => id.toString()));

    // Get the order details
    const Orders = mongoose.connection.collection('orders');
    const order = await Orders.findOne({ _id: orderId });

    console.log('\n═'.repeat(70));
    console.log('📦 ORDER DETAILS');
    console.log('═'.repeat(70));
    console.log('Order ID:', order._id.toString());
    console.log('Order Number:', order.orderNumber);
    console.log('Order Category:', order.orderCategory);
    console.log('Order Type:', order.orderType);
    console.log('Amount: ₹' + order.amount.toLocaleString());
    console.log('Status:', order.status);
    console.log('Payment Status:', order.paymentStatus || 'N/A');
    console.log('Razorpay Order ID:', order.razorpayOrderId || 'N/A');
    console.log('Razorpay Payment ID:', order.razorpayPaymentId || 'N/A');
    console.log('Created:', new Date(order.createdAt).toLocaleString());

    console.log('\n═'.repeat(70));
    console.log('✅ SUCCESS! Order is now in user\'s orders array');
    console.log('═'.repeat(70));

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
};

const main = async () => {
  await connectDB();
  await fixPaymentOrder();
  await mongoose.disconnect();
  console.log('\n👋 Disconnected. Goodbye!\n');
  process.exit(0);
};

main();

