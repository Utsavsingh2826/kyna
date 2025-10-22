const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/kyna');
    console.log('✅ MongoDB Connected Successfully\n');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

const checkUsers = async () => {
  try {
    const users = await User.find({});
    console.log(`Found ${users.length} users:\n`);
    
    users.forEach((user, idx) => {
      console.log(`${idx + 1}. ${user.name || user.firstName} - ${user.email}`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Referral Code: ${user.referralCode || 'None'}`);
      console.log(`   Wishlist: ${user.wishlist ? user.wishlist.length : 0} items`);
      console.log();
    });

    // Check for the specific emails
    const user1 = await User.findOne({ email: 'tiwariaditya1810@gmail.com' });
    const user2 = await User.findOne({ email: 'addytiw1810@gmail.com' });
    
    console.log('\n🔍 Specific Users Check:');
    console.log('tiwariaditya1810@gmail.com:', user1 ? '✅ Found' : '❌ Not Found');
    console.log('addytiw1810@gmail.com:', user2 ? '✅ Found' : '❌ Not Found');

  } catch (error) {
    console.error('❌ Error:', error);
  }
};

const main = async () => {
  await connectDB();
  await checkUsers();
  await mongoose.disconnect();
  console.log('\n✅ Done');
  process.exit(0);
};

main();


