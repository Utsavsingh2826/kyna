const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

const resetPasswords = async () => {
  try {
    console.log('🔐 Resetting passwords for specific users...\n');

    const newPassword = 'password123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update User 1
    const user1 = await User.findOneAndUpdate(
      { email: 'tiwariaditya1810@gmail.com' },
      { password: hashedPassword },
      { new: true }
    );

    if (user1) {
      console.log('✅ Password reset for User 1:');
      console.log(`   Email: ${user1.email}`);
      console.log(`   New Password: ${newPassword}`);
      console.log();
    } else {
      console.log('❌ User 1 not found\n');
    }

    // Update User 2
    const user2 = await User.findOneAndUpdate(
      { email: 'addytiw1810@gmail.com' },
      { password: hashedPassword },
      { new: true }
    );

    if (user2) {
      console.log('✅ Password reset for User 2:');
      console.log(`   Email: ${user2.email}`);
      console.log(`   New Password: ${newPassword}`);
      console.log();
    } else {
      console.log('❌ User 2 not found\n');
    }

    console.log('═'.repeat(70));
    console.log('\n✅ Password Reset Complete!\n');
    console.log('📝 Login Credentials:\n');
    console.log('User 1:');
    console.log('  Email: tiwariaditya1810@gmail.com');
    console.log(`  Password: ${newPassword}\n`);
    console.log('User 2:');
    console.log('  Email: addytiw1810@gmail.com');
    console.log(`  Password: ${newPassword}\n`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
};

const main = async () => {
  await connectDB();
  await resetPasswords();
  await mongoose.disconnect();
  console.log('👋 Disconnected. Goodbye!\n');
  process.exit(0);
};

main();

