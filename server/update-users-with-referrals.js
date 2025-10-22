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

const updateUsers = async () => {
  try {
    console.log('🔄 Updating users with referral statistics...\n');

    const user1Id = new mongoose.Types.ObjectId('68f7f452330878c13e49f6dc');
    const user2Id = new mongoose.Types.ObjectId('68f7f4ff330878c13e49f6e4');

    // Get referral counts for both users
    const user1Referrals = await Referral.find({ fromUserId: user1Id });
    const user2Referrals = await Referral.find({ fromUserId: user2Id });

    const user1AcceptedCount = user1Referrals.filter(r => r.status === 'accepted').length;
    const user2AcceptedCount = user2Referrals.filter(r => r.status === 'accepted').length;

    const user1Earnings = user1AcceptedCount * 500;
    const user2Earnings = user2AcceptedCount * 500;

    console.log('📊 Calculated Referral Statistics:');
    console.log(`   User 1 (Aditya): ${user1AcceptedCount} accepted referrals = ₹${user1Earnings.toLocaleString()}`);
    console.log(`   User 2 (Addy): ${user2AcceptedCount} accepted referrals = ₹${user2Earnings.toLocaleString()}\n`);

    // Update User 1
    console.log('👤 Updating User 1 (Aditya Vinay Tiwari TIWARI)...');
    const updatedUser1 = await User.findByIdAndUpdate(
      user1Id,
      {
        firstName: "Aditya",
        lastName: "Vinay Tiwari TIWARI",
        email: "tiwariaditya1810@gmail.com",
        name: "Aditya Vinay Tiwari TIWARI",
        isVerified: true,
        role: "customer",
        address: {
          billingAddress: {
            street: "123 Main Street",
            city: "Mumbai",
            state: "Maharashtra",
            country: "India",
            zipCode: "400001"
          },
          shippingAddress: {
            street: "123 Main Street",
            city: "Mumbai",
            state: "Maharashtra",
            country: "India",
            zipCode: "400001",
            sameAsBilling: true
          }
        },
        isActive: true,
        availableOffers: 3,
        referralCount: user1AcceptedCount,
        totalReferralEarnings: user1Earnings,
        usedPromoCodes: [
          new mongoose.Types.ObjectId('68f86cc6c9379bb7cc8c3cde'),
          new mongoose.Types.ObjectId('68f86cc6c9379bb7cc8c3cdf')
        ],
        usedReferralCodes: [],
        referralCode: "ADI60U0",
        lastLogin: new Date("2025-10-22T06:03:01.316Z"),
        updatedAt: new Date()
      },
      { new: true }
    );

    console.log('✅ User 1 updated successfully');
    console.log(`   Referral Count: ${updatedUser1.referralCount}`);
    console.log(`   Total Earnings: ₹${updatedUser1.totalReferralEarnings.toLocaleString()}`);
    console.log(`   Wishlist Items: ${updatedUser1.wishlist ? updatedUser1.wishlist.length : 0}`);
    console.log(`   Used Promo Codes: ${updatedUser1.usedPromoCodes.length}\n`);

    // Update User 2
    console.log('👤 Updating User 2 (Addy bhai)...');
    const updatedUser2 = await User.findByIdAndUpdate(
      user2Id,
      {
        firstName: "Addy",
        lastName: "bhai",
        email: "addytiw1810@gmail.com",
        name: "Addy bhai",
        isVerified: true,
        role: "customer",
        address: {
          billingAddress: {
            street: "456 Park Avenue",
            city: "Delhi",
            state: "Delhi",
            country: "India",
            zipCode: "110001"
          },
          shippingAddress: {
            street: "456 Park Avenue",
            city: "Delhi",
            state: "Delhi",
            country: "India",
            zipCode: "110001",
            sameAsBilling: true
          }
        },
        isActive: true,
        availableOffers: 2,
        referralCount: user2AcceptedCount,
        totalReferralEarnings: user2Earnings,
        usedPromoCodes: [
          new mongoose.Types.ObjectId('68f86cc6c9379bb7cc8c3cdf')
        ],
        usedReferralCodes: ["ADI60U0"],
        referralCode: "ADD626Z",
        lastLogin: new Date("2025-10-21T21:05:41.091Z"),
        updatedAt: new Date()
      },
      { new: true }
    );

    console.log('✅ User 2 updated successfully');
    console.log(`   Referral Count: ${updatedUser2.referralCount}`);
    console.log(`   Total Earnings: ₹${updatedUser2.totalReferralEarnings.toLocaleString()}`);
    console.log(`   Wishlist Items: ${updatedUser2.wishlist ? updatedUser2.wishlist.length : 0}`);
    console.log(`   Used Promo Codes: ${updatedUser2.usedPromoCodes.length}`);
    console.log(`   Used Referral Codes: ${updatedUser2.usedReferralCodes.join(', ')}\n`);

    // Display detailed summary
    console.log('═'.repeat(70));
    console.log('📊 COMPLETE USER UPDATE SUMMARY');
    console.log('═'.repeat(70) + '\n');

    console.log('👤 USER 1: Aditya Vinay Tiwari TIWARI');
    console.log('─'.repeat(70));
    console.log(`Email: ${updatedUser1.email}`);
    console.log(`ID: ${updatedUser1._id}`);
    console.log(`Referral Code: ${updatedUser1.referralCode}`);
    console.log(`Status: ${updatedUser1.isVerified ? '✅ Verified' : '❌ Not Verified'}`);
    console.log(`\n📍 Address:`);
    console.log(`   Billing: ${updatedUser1.address.billingAddress.street}, ${updatedUser1.address.billingAddress.city}`);
    console.log(`   Shipping: Same as billing`);
    console.log(`\n💰 Referral Statistics:`);
    console.log(`   Total Referrals: ${user1Referrals.length}`);
    console.log(`   Successful Referrals: ${updatedUser1.referralCount}`);
    console.log(`   Total Earnings: ₹${updatedUser1.totalReferralEarnings.toLocaleString()}`);
    console.log(`   Pending Referrals: ${user1Referrals.filter(r => r.status === 'pending').length}`);
    console.log(`   Expired Referrals: ${user1Referrals.filter(r => r.status === 'expired').length}`);
    console.log(`\n🎁 Offers & Usage:`);
    console.log(`   Available Offers: ${updatedUser1.availableOffers}`);
    console.log(`   Promo Codes Used: ${updatedUser1.usedPromoCodes.length}`);
    console.log(`   Referral Codes Used: ${updatedUser1.usedReferralCodes.length}`);
    console.log(`\n💝 Wishlist: ${updatedUser1.wishlist.length} items`);

    console.log('\n\n👤 USER 2: Addy bhai');
    console.log('─'.repeat(70));
    console.log(`Email: ${updatedUser2.email}`);
    console.log(`ID: ${updatedUser2._id}`);
    console.log(`Referral Code: ${updatedUser2.referralCode}`);
    console.log(`Status: ${updatedUser2.isVerified ? '✅ Verified' : '❌ Not Verified'}`);
    console.log(`\n📍 Address:`);
    console.log(`   Billing: ${updatedUser2.address.billingAddress.street}, ${updatedUser2.address.billingAddress.city}`);
    console.log(`   Shipping: Same as billing`);
    console.log(`\n💰 Referral Statistics:`);
    console.log(`   Total Referrals: ${user2Referrals.length}`);
    console.log(`   Successful Referrals: ${updatedUser2.referralCount}`);
    console.log(`   Total Earnings: ₹${updatedUser2.totalReferralEarnings.toLocaleString()}`);
    console.log(`   Pending Referrals: ${user2Referrals.filter(r => r.status === 'pending').length}`);
    console.log(`   Expired Referrals: ${user2Referrals.filter(r => r.status === 'expired').length}`);
    console.log(`\n🎁 Offers & Usage:`);
    console.log(`   Available Offers: ${updatedUser2.availableOffers}`);
    console.log(`   Promo Codes Used: ${updatedUser2.usedPromoCodes.length}`);
    console.log(`   Referral Codes Used: ${updatedUser2.usedReferralCodes.length} (${updatedUser2.usedReferralCodes.join(', ')})`);
    console.log(`\n💝 Wishlist: ${updatedUser2.wishlist.length} items`);

    console.log('\n' + '═'.repeat(70));
    console.log('\n✅ SUCCESS! Both users updated with synced referral data!\n');
    console.log('🎯 Key Updates:');
    console.log(`   ✅ User 1 referral earnings: ₹${user1Earnings.toLocaleString()}`);
    console.log(`   ✅ User 2 referral earnings: ₹${user2Earnings.toLocaleString()}`);
    console.log(`   ✅ User 2 used User 1's referral code: ${updatedUser2.usedReferralCodes[0]}`);
    console.log(`   ✅ All addresses and details updated`);
    console.log(`   ✅ Promo code usage tracked\n`);

    // Show referral breakdown
    console.log('📋 Referral Breakdown:\n');
    
    console.log('User 1 (Aditya) Referrals:');
    const user1ReferralsByStatus = {
      accepted: user1Referrals.filter(r => r.status === 'accepted'),
      pending: user1Referrals.filter(r => r.status === 'pending'),
      expired: user1Referrals.filter(r => r.status === 'expired')
    };
    
    if (user1ReferralsByStatus.accepted.length > 0) {
      console.log('  ✅ Accepted:');
      user1ReferralsByStatus.accepted.forEach((ref, idx) => {
        console.log(`     ${idx + 1}. ${ref.toEmails[0]} - Earned ₹500`);
      });
    }
    if (user1ReferralsByStatus.pending.length > 0) {
      console.log('  ⏳ Pending:');
      user1ReferralsByStatus.pending.forEach((ref, idx) => {
        console.log(`     ${idx + 1}. ${ref.toEmails[0]}${ref.toEmails.length > 1 ? ` +${ref.toEmails.length-1}` : ''}`);
      });
    }
    if (user1ReferralsByStatus.expired.length > 0) {
      console.log('  ⏰ Expired:');
      user1ReferralsByStatus.expired.forEach((ref, idx) => {
        console.log(`     ${idx + 1}. ${ref.toEmails[0]}`);
      });
    }

    console.log('\nUser 2 (Addy) Referrals:');
    const user2ReferralsByStatus = {
      accepted: user2Referrals.filter(r => r.status === 'accepted'),
      pending: user2Referrals.filter(r => r.status === 'pending'),
      expired: user2Referrals.filter(r => r.status === 'expired')
    };
    
    if (user2ReferralsByStatus.accepted.length > 0) {
      console.log('  ✅ Accepted:');
      user2ReferralsByStatus.accepted.forEach((ref, idx) => {
        console.log(`     ${idx + 1}. ${ref.toEmails[0]} - Earned ₹500`);
      });
    }
    if (user2ReferralsByStatus.pending.length > 0) {
      console.log('  ⏳ Pending:');
      user2ReferralsByStatus.pending.forEach((ref, idx) => {
        console.log(`     ${idx + 1}. ${ref.toEmails[0]}${ref.toEmails.length > 1 ? ` +${ref.toEmails.length-1}` : ''}`);
      });
    }
    if (user2ReferralsByStatus.expired.length > 0) {
      console.log('  ⏰ Expired:');
      user2ReferralsByStatus.expired.forEach((ref, idx) => {
        console.log(`     ${idx + 1}. ${ref.toEmails[0]}`);
      });
    }

    console.log('\n✨ Users are now fully synced with referral data!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
};

const main = async () => {
  await connectDB();
  await updateUsers();
  await mongoose.disconnect();
  console.log('👋 Disconnected. Goodbye!\n');
  process.exit(0);
};

main();

