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

const syncReferralData = async () => {
  try {
    console.log('🔄 Syncing referral data for two users...\n');

    const user1Id = new mongoose.Types.ObjectId('68f7f452330878c13e49f6dc');
    const user2Id = new mongoose.Types.ObjectId('68f7f4ff330878c13e49f6e4');

    // Get both users
    const user1 = await User.findById(user1Id);
    const user2 = await User.findById(user2Id);

    if (!user1 || !user2) {
      console.error('❌ Users not found');
      return;
    }

    console.log(`Found User 1: ${user1.name} - Code: ${user1.referralCode}`);
    console.log(`Found User 2: ${user2.name} - Code: ${user2.referralCode}\n`);

    // Get actual referral counts from database
    const user1Referrals = await Referral.find({ fromUserId: user1Id });
    const user2Referrals = await Referral.find({ fromUserId: user2Id });

    const user1AcceptedCount = user1Referrals.filter(r => r.status === 'accepted').length;
    const user2AcceptedCount = user2Referrals.filter(r => r.status === 'accepted').length;

    console.log('📊 Current Referral Status:');
    console.log(`   User 1: ${user1AcceptedCount} accepted out of ${user1Referrals.length} total`);
    console.log(`   User 2: ${user2AcceptedCount} accepted out of ${user2Referrals.length} total\n`);

    // Update User 1 with correct referral statistics
    console.log('🔄 Updating User 1 (Aditya)...');
    await User.findByIdAndUpdate(user1Id, {
      referralCount: user1AcceptedCount,
      totalReferralEarnings: user1AcceptedCount * 500,
      referralCode: 'ADI60U0',
      usedReferralCodes: [], // User 1 hasn't used anyone's code
      availableOffers: 3
    });
    console.log(`   ✅ Updated: ${user1AcceptedCount} referrals, ₹${user1AcceptedCount * 500} earnings\n`);

    // Update User 2 with correct referral statistics and mark as having used User 1's code
    console.log('🔄 Updating User 2 (Addy)...');
    await User.findByIdAndUpdate(user2Id, {
      referralCount: user2AcceptedCount,
      totalReferralEarnings: user2AcceptedCount * 500,
      referralCode: 'ADD626Z',
      usedReferralCodes: ['ADI60U0'], // User 2 used User 1's referral code
      availableOffers: 2
    });
    console.log(`   ✅ Updated: ${user2AcceptedCount} referrals, ₹${user2AcceptedCount * 500} earnings`);
    console.log(`   ✅ Used referral code: ADI60U0\n`);

    // Verify the updates
    const updatedUser1 = await User.findById(user1Id);
    const updatedUser2 = await User.findById(user2Id);

    console.log('═'.repeat(70));
    console.log('✅ FINAL DATABASE STATE');
    console.log('═'.repeat(70) + '\n');

    console.log('👤 USER 1: Aditya Vinay Tiwari TIWARI');
    console.log('   Email:', updatedUser1.email);
    console.log('   Referral Code:', updatedUser1.referralCode);
    console.log('   Referral Count:', updatedUser1.referralCount);
    console.log('   Total Earnings: ₹' + (updatedUser1.totalReferralEarnings || 0).toLocaleString());
    console.log('   Available Offers:', updatedUser1.availableOffers);
    console.log('   Used Referral Codes:', updatedUser1.usedReferralCodes || []);
    console.log('   Wishlist Items:', updatedUser1.wishlist ? updatedUser1.wishlist.length : 0);
    console.log('   Used Promo Codes:', updatedUser1.usedPromoCodes ? updatedUser1.usedPromoCodes.length : 0);
    
    console.log('\n   📊 Referrals Breakdown:');
    console.log(`      Total: ${user1Referrals.length}`);
    console.log(`      Accepted: ${user1Referrals.filter(r => r.status === 'accepted').length}`);
    console.log(`      Pending: ${user1Referrals.filter(r => r.status === 'pending').length}`);
    console.log(`      Expired: ${user1Referrals.filter(r => r.status === 'expired').length}`);

    console.log('\n👤 USER 2: Addy bhai');
    console.log('   Email:', updatedUser2.email);
    console.log('   Referral Code:', updatedUser2.referralCode);
    console.log('   Referral Count:', updatedUser2.referralCount);
    console.log('   Total Earnings: ₹' + (updatedUser2.totalReferralEarnings || 0).toLocaleString());
    console.log('   Available Offers:', updatedUser2.availableOffers);
    console.log('   Used Referral Codes:', updatedUser2.usedReferralCodes || []);
    console.log('   Wishlist Items:', updatedUser2.wishlist ? updatedUser2.wishlist.length : 0);
    console.log('   Used Promo Codes:', updatedUser2.usedPromoCodes ? updatedUser2.usedPromoCodes.length : 0);
    
    console.log('\n   📊 Referrals Breakdown:');
    console.log(`      Total: ${user2Referrals.length}`);
    console.log(`      Accepted: ${user2Referrals.filter(r => r.status === 'accepted').length}`);
    console.log(`      Pending: ${user2Referrals.filter(r => r.status === 'pending').length}`);
    console.log(`      Expired: ${user2Referrals.filter(r => r.status === 'expired').length}`);

    console.log('\n═'.repeat(70));
    console.log('\n✅ SUCCESS! Database is now synced correctly!');
    console.log('\n📋 Summary:');
    console.log(`   • User 1 has sent ${user1Referrals.length} referrals (${user1AcceptedCount} accepted)`);
    console.log(`   • User 1 earned ₹${user1AcceptedCount * 500} from referrals`);
    console.log(`   • User 2 has sent ${user2Referrals.length} referrals (${user2AcceptedCount} accepted)`);
    console.log(`   • User 2 earned ₹${user2AcceptedCount * 500} from referrals`);
    console.log(`   • User 2 used User 1's referral code: ${updatedUser2.usedReferralCodes[0]}`);
    console.log('\n🎯 Your code should work perfectly now!\n');

    // Display sample referral data
    console.log('📋 Sample Referral Records:\n');
    const sampleReferrals = await Referral.find({ 
      fromUserId: { $in: [user1Id, user2Id] } 
    }).limit(5).sort({ createdAt: -1 });

    sampleReferrals.forEach((ref, idx) => {
      const fromUser = ref.fromUserId.toString() === user1Id.toString() ? 'Aditya' : 'Addy';
      const statusIcon = ref.status === 'accepted' ? '✅' : 
                        ref.status === 'expired' ? '⏰' : '⏳';
      console.log(`${idx + 1}. ${statusIcon} ${ref.referFrdId}`);
      console.log(`   From: ${fromUser}`);
      console.log(`   To: ${ref.toEmails[0]}${ref.toEmails.length > 1 ? ` +${ref.toEmails.length - 1}` : ''}`);
      console.log(`   Status: ${ref.status.toUpperCase()}`);
      console.log();
    });

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
};

const main = async () => {
  await connectDB();
  await syncReferralData();
  await mongoose.disconnect();
  console.log('👋 Disconnected. Goodbye!\n');
  process.exit(0);
};

main();

