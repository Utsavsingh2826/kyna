const mongoose = require('mongoose');
const User = require('./src/models/userModel').default;

async function migrateUsersToNewSchema() {
  try {
    console.log('🔄 Starting user schema migration...');
    
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/kynajewels');
    console.log('✅ Connected to database');

    // Find all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users to migrate`);

    for (const user of users) {
      console.log(`\n👤 Processing user: ${user.email}`);
      
      // Check if user has passwordHash but no password (old schema)
      if (user.passwordHash && !user.password) {
        console.log('  🔄 Migrating passwordHash to password field...');
        user.password = user.passwordHash;
        user.passwordHash = undefined; // Remove old field
        await user.save();
        console.log('  ✅ Password migrated successfully');
      } else if (user.password) {
        console.log('  ✅ Already using new schema');
      } else {
        console.log('  ⚠️ No password found, setting default...');
        user.password = 'password123'; // Will be hashed by pre-save hook
        await user.save();
        console.log('  ✅ Default password set');
      }

      // Ensure user is verified for testing
      if (!user.isVerified) {
        console.log('  🔄 Setting user as verified...');
        user.isVerified = true;
        await user.save();
        console.log('  ✅ User verified');
      }

      console.log(`  📧 Email: ${user.email}`);
      console.log(`  🔐 Password field: ${user.password ? 'Present' : 'Missing'}`);
      console.log(`  ✅ Verified: ${user.isVerified}`);
    }

    console.log('\n🎉 User migration completed successfully!');
    console.log('\n📋 Migration Summary:');
    console.log(`👥 Users processed: ${users.length}`);
    console.log('✅ All users now use the new password schema');
    console.log('✅ All users are verified for testing');

    // Test login for John Doe
    console.log('\n🧪 Testing login for John Doe...');
    const johnDoe = await User.findOne({ email: 'john.doe@example.com' });
    if (johnDoe) {
      const isValid = await johnDoe.comparePassword('password123');
      console.log(`✅ John Doe password test: ${isValid ? 'PASSED' : 'FAILED'}`);
    } else {
      console.log('❌ John Doe not found');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the migration
if (require.main === module) {
  migrateUsersToNewSchema();
}

module.exports = migrateUsersToNewSchema;
