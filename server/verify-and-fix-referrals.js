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
const Referral = mongoose.model('Referral', new mongoose.Schema({}, { strict: false, strictPopulate: false }));

const verifyAndFixReferrals = async () => {
  try {
    console.log('🔍 VERIFYING REFERRAL DATA\n' + '='.repeat(70) + '\n');

    // Get both users
    const user1 = await User.findOne({ email: 'tiwariaditya1810@gmail.com' });
    const user2 = await User.findOne({ email: 'addytiw1810@gmail.com' });

    if (!user1 || !user2) {
      console.error('❌ Users not found');
      return;
    }

    console.log('👥 USERS FOUND:');
    console.log(`   User 1: ${user1.name} (${user1.email})`);
    console.log(`   Referral Code: ${user1.referralCode}`);
    console.log(`   ID: ${user1._id}`);
    console.log();
    console.log(`   User 2: ${user2.name} (${user2.email})`);
    console.log(`   Referral Code: ${user2.referralCode}`);
    console.log(`   ID: ${user2._id}`);
    console.log(`   Used Referral Codes: ${user2.usedReferralCodes ? user2.usedReferralCodes.join(', ') : 'None'}`);
    console.log('\n' + '─'.repeat(70) + '\n');

    // Get all referrals for both users
    const user1Referrals = await Referral.find({ fromUserId: user1._id });
    const user2Referrals = await Referral.find({ fromUserId: user2._id });

    console.log('🔗 REFERRALS IN DATABASE:');
    console.log(`   User 1 Referrals: ${user1Referrals.length}`);
    console.log(`   User 2 Referrals: ${user2Referrals.length}`);
    console.log('\n' + '─'.repeat(70) + '\n');

    // Display all referrals with details
    console.log('📋 USER 1 REFERRALS:\n');
    if (user1Referrals.length === 0) {
      console.log('   ❌ No referrals found!\n');
    } else {
      user1Referrals.forEach((ref, idx) => {
        const statusIcon = ref.status === 'accepted' ? '✅' : 
                          ref.status === 'expired' ? '⏰' : '⏳';
        console.log(`   ${idx + 1}. ${statusIcon} ${ref.referFrdId}`);
        console.log(`      Status: ${ref.status}`);
        console.log(`      To Emails: ${ref.toEmails.join(', ')}`);
        console.log(`      From User ID: ${ref.fromUserId}`);
        console.log(`      Created: ${new Date(ref.createdAt).toLocaleDateString()}`);
        console.log(`      Expires: ${new Date(ref.expiresAt).toLocaleDateString()}`);
        if (ref.status === 'accepted' && ref.redeemedBy) {
          console.log(`      Redeemed By: ${ref.redeemedBy}`);
          console.log(`      Redeemed At: ${new Date(ref.redeemedAt).toLocaleDateString()}`);
        }
        console.log();
      });
    }

    console.log('📋 USER 2 REFERRALS:\n');
    if (user2Referrals.length === 0) {
      console.log('   ❌ No referrals found!\n');
    } else {
      user2Referrals.forEach((ref, idx) => {
        const statusIcon = ref.status === 'accepted' ? '✅' : 
                          ref.status === 'expired' ? '⏰' : '⏳';
        console.log(`   ${idx + 1}. ${statusIcon} ${ref.referFrdId}`);
        console.log(`      Status: ${ref.status}`);
        console.log(`      To Emails: ${ref.toEmails.join(', ')}`);
        console.log(`      From User ID: ${ref.fromUserId}`);
        console.log(`      Created: ${new Date(ref.createdAt).toLocaleDateString()}`);
        console.log(`      Expires: ${new Date(ref.expiresAt).toLocaleDateString()}`);
        if (ref.status === 'accepted' && ref.redeemedBy) {
          console.log(`      Redeemed By: ${ref.redeemedBy}`);
          console.log(`      Redeemed At: ${new Date(ref.redeemedAt).toLocaleDateString()}`);
        }
        console.log();
      });
    }

    console.log('─'.repeat(70) + '\n');

    // Check for issues
    console.log('🔍 CHECKING FOR ISSUES:\n');
    
    let issuesFound = false;

    // Issue 1: Check if referral IDs are unique
    const allReferrals = await Referral.find({});
    const referralIds = allReferrals.map(r => r.referFrdId);
    const duplicateIds = referralIds.filter((id, index) => referralIds.indexOf(id) !== index);
    
    if (duplicateIds.length > 0) {
      console.log('   ❌ Found duplicate referral IDs:', duplicateIds);
      issuesFound = true;
    } else {
      console.log('   ✅ All referral IDs are unique');
    }

    // Issue 2: Check if fromUserId matches actual users
    const invalidFromUserIds = allReferrals.filter(ref => {
      return ref.fromUserId.toString() !== user1._id.toString() && 
             ref.fromUserId.toString() !== user2._id.toString();
    });
    
    if (invalidFromUserIds.length > 0) {
      console.log('   ❌ Found referrals with invalid fromUserId:', invalidFromUserIds.length);
      issuesFound = true;
    } else {
      console.log('   ✅ All referrals have valid fromUserId');
    }

    // Issue 3: Check if user referral codes match what's expected
    if (!user1.referralCode) {
      console.log('   ❌ User 1 missing referral code');
      issuesFound = true;
    } else {
      console.log(`   ✅ User 1 has referral code: ${user1.referralCode}`);
    }

    if (!user2.referralCode) {
      console.log('   ❌ User 2 missing referral code');
      issuesFound = true;
    } else {
      console.log(`   ✅ User 2 has referral code: ${user2.referralCode}`);
    }

    // Issue 4: Check referral count vs actual accepted referrals
    const user1AcceptedCount = user1Referrals.filter(r => r.status === 'accepted').length;
    const user2AcceptedCount = user2Referrals.filter(r => r.status === 'accepted').length;

    if (user1.referralCount !== user1AcceptedCount) {
      console.log(`   ⚠️  User 1 referralCount mismatch: DB says ${user1.referralCount}, actual is ${user1AcceptedCount}`);
      issuesFound = true;
    } else {
      console.log(`   ✅ User 1 referralCount matches: ${user1AcceptedCount}`);
    }

    if (user2.referralCount !== user2AcceptedCount) {
      console.log(`   ⚠️  User 2 referralCount mismatch: DB says ${user2.referralCount}, actual is ${user2AcceptedCount}`);
      issuesFound = true;
    } else {
      console.log(`   ✅ User 2 referralCount matches: ${user2AcceptedCount}`);
    }

    // Issue 5: Check if User 2's used referral code exists
    if (user2.usedReferralCodes && user2.usedReferralCodes.length > 0) {
      const usedCode = user2.usedReferralCodes[0];
      if (usedCode !== user1.referralCode) {
        console.log(`   ⚠️  User 2's used referral code (${usedCode}) doesn't match User 1's code (${user1.referralCode})`);
        issuesFound = true;
      } else {
        console.log(`   ✅ User 2's used referral code matches User 1's code`);
      }
    }

    console.log('\n' + '─'.repeat(70) + '\n');

    // TEST REFERRAL CODE LOOKUP
    console.log('🧪 TESTING REFERRAL CODE LOOKUP:\n');
    
    console.log(`Testing lookup by User 1's referral code: ${user1.referralCode}`);
    const referralsByCode1 = await Referral.find({ 
      $or: [
        { referFrdId: user1.referralCode },
        { fromUserId: user1._id }
      ]
    });
    console.log(`   Found ${referralsByCode1.length} referrals`);
    
    console.log(`\nTesting lookup by User 2's referral code: ${user2.referralCode}`);
    const referralsByCode2 = await Referral.find({ 
      $or: [
        { referFrdId: user2.referralCode },
        { fromUserId: user2._id }
      ]
    });
    console.log(`   Found ${referralsByCode2.length} referrals`);

    console.log('\n' + '─'.repeat(70) + '\n');

    // IMPORTANT: Check what the UI might be expecting
    console.log('💡 DIAGNOSIS:\n');
    console.log('The UI likely expects one of the following:');
    console.log('   1. Lookup referrals by user\'s referralCode (e.g., ADI60U0)');
    console.log('   2. Lookup referrals by referFrdId (e.g., REF12345678)');
    console.log('   3. Lookup by fromUserId\n');
    
    console.log('Current state:');
    console.log(`   - User referral codes: ${user1.referralCode}, ${user2.referralCode}`);
    console.log(`   - Referral document IDs (referFrdId): ${user1Referrals.map(r => r.referFrdId).join(', ')}`);
    console.log(`   - These are DIFFERENT!\n`);
    
    console.log('❗ LIKELY ISSUE:');
    console.log('   The UI is trying to find referrals using the user\'s referralCode (e.g., ADI60U0)');
    console.log('   But the Referral documents use different IDs (referFrdId like REF12345678)');
    console.log('   The correct way is to find referrals by fromUserId, not by referralCode\n');

    if (!issuesFound) {
      console.log('✅ No critical issues found in database!');
      console.log('\n💡 The issue is likely in the API/frontend logic.');
      console.log('   The API should query: Referral.find({ fromUserId: userId })');
      console.log('   NOT: Referral.find({ referFrdId: userReferralCode })\n');
    }

    // Show correct query examples
    console.log('═'.repeat(70));
    console.log('📖 CORRECT API QUERIES:\n');
    console.log('// To get all referrals sent by a user:');
    console.log('const referrals = await Referral.find({ fromUserId: userId });');
    console.log('\n// To get a specific referral by its ID:');
    console.log('const referral = await Referral.findOne({ referFrdId: "REF12345678" });');
    console.log('\n// To get user by their referral code:');
    console.log('const user = await User.findOne({ referralCode: "ADI60U0" });');
    console.log('═'.repeat(70) + '\n');

    // Create sample data display for frontend
    console.log('📊 DATA FOR FRONTEND TESTING:\n');
    console.log('User 1 API Response should include:');
    console.log(JSON.stringify({
      userId: user1._id,
      name: user1.name,
      email: user1.email,
      referralCode: user1.referralCode,
      referralCount: user1AcceptedCount,
      totalEarnings: user1AcceptedCount * 500,
      referrals: user1Referrals.map(r => ({
        referFrdId: r.referFrdId,
        status: r.status,
        toEmails: r.toEmails,
        createdAt: r.createdAt,
        expiresAt: r.expiresAt
      }))
    }, null, 2));

    console.log('\n✨ Verification complete!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
};

const main = async () => {
  await connectDB();
  await verifyAndFixReferrals();
  await mongoose.disconnect();
  console.log('👋 Disconnected. Goodbye!\n');
  process.exit(0);
};

main();

