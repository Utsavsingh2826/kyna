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

// Helper function to generate unique referral ID
const generateReferralId = () => {
  return 'REF' + Math.random().toString(36).substring(2, 10).toUpperCase();
};

// Helper function for random date
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const seedReferrals = async () => {
  try {
    console.log('🔗 Starting referral data seeding for specific users...\n');

    // Get the two users
    const user1Id = new mongoose.Types.ObjectId('68f7f452330878c13e49f6dc'); // Aditya
    const user2Id = new mongoose.Types.ObjectId('68f7f4ff330878c13e49f6e4'); // Addy

    const user1 = await User.findById(user1Id);
    const user2 = await User.findById(user2Id);

    if (!user1 || !user2) {
      console.error('❌ Users not found');
      return;
    }

    console.log(`✅ Found User 1: ${user1.name} (${user1.email})`);
    console.log(`   Referral Code: ${user1.referralCode}`);
    console.log(`✅ Found User 2: ${user2.name} (${user2.email})`);
    console.log(`   Referral Code: ${user2.referralCode}\n`);

    // Clear existing referrals for these users
    console.log('🗑️  Clearing existing referrals...');
    await Referral.deleteMany({ 
      $or: [
        { fromUserId: user1Id },
        { fromUserId: user2Id }
      ]
    });
    console.log('✅ Cleared\n');

    // Create referrals for User 1 (Aditya)
    console.log('📧 Creating referrals for User 1 (Aditya)...\n');
    
    const user1Referrals = [
      // Accepted referrals (earning ₹500 each)
      {
        referFrdId: generateReferralId(),
        fromUserId: user1Id,
        toEmails: ['priya.sharma@example.com'],
        note: 'Hey Priya! Check out these beautiful jewelry pieces. You\'ll love the collection!',
        sendReminder: false,
        status: 'accepted',
        redeemedBy: new mongoose.Types.ObjectId(), // Simulated redeemed user
        redeemedAt: new Date('2024-09-15T10:30:00Z'),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date('2024-08-20T14:22:00Z')
      },
      {
        referFrdId: generateReferralId(),
        fromUserId: user1Id,
        toEmails: ['rahul.verma@example.com'],
        note: 'Rahul bhai, this jewelry store has amazing designs. Use my code!',
        sendReminder: false,
        status: 'accepted',
        redeemedBy: new mongoose.Types.ObjectId(),
        redeemedAt: new Date('2024-10-02T16:45:00Z'),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date('2024-09-10T09:15:00Z')
      },
      {
        referFrdId: generateReferralId(),
        fromUserId: user1Id,
        toEmails: ['sneha.patel@example.com'],
        note: 'Sneha, you were looking for engagement rings. Check this out!',
        sendReminder: false,
        status: 'accepted',
        redeemedBy: new mongoose.Types.ObjectId(),
        redeemedAt: new Date('2024-10-10T11:20:00Z'),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date('2024-09-25T08:30:00Z')
      },
      // Pending referrals
      {
        referFrdId: generateReferralId(),
        fromUserId: user1Id,
        toEmails: ['amit.kumar@example.com', 'neha.singh@example.com'],
        note: 'Amazing jewelry collection with great discounts! Check it out.',
        sendReminder: true,
        status: 'pending',
        expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        reminderSentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
      },
      {
        referFrdId: generateReferralId(),
        fromUserId: user1Id,
        toEmails: ['kavita.mehta@example.com'],
        note: 'Best place to buy jewelry online. Trust me!',
        sendReminder: false,
        status: 'pending',
        expiresAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      },
      {
        referFrdId: generateReferralId(),
        fromUserId: user1Id,
        toEmails: ['sanjay.gupta@example.com', 'pooja.rao@example.com', 'vikram.shah@example.com'],
        note: 'Premium jewelry at amazing prices. Use my referral code for extra discount!',
        sendReminder: true,
        status: 'pending',
        expiresAt: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      // Expired referrals
      {
        referFrdId: generateReferralId(),
        fromUserId: user1Id,
        toEmails: ['old.contact1@example.com'],
        note: 'Limited time offer on diamond rings!',
        sendReminder: true,
        status: 'expired',
        expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        reminderSentAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000)
      },
      {
        referFrdId: generateReferralId(),
        fromUserId: user1Id,
        toEmails: ['old.contact2@example.com', 'old.contact3@example.com'],
        note: 'Don\'t miss out on festive sale!',
        sendReminder: false,
        status: 'expired',
        expiresAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000)
      }
    ];

    const createdUser1Referrals = await Referral.insertMany(user1Referrals);
    console.log(`✅ Created ${createdUser1Referrals.length} referrals for User 1`);
    console.log(`   - Accepted: ${createdUser1Referrals.filter(r => r.status === 'accepted').length}`);
    console.log(`   - Pending: ${createdUser1Referrals.filter(r => r.status === 'pending').length}`);
    console.log(`   - Expired: ${createdUser1Referrals.filter(r => r.status === 'expired').length}\n`);

    // Create referrals for User 2 (Addy)
    console.log('📧 Creating referrals for User 2 (Addy)...\n');
    
    const user2Referrals = [
      // Accepted referrals
      {
        referFrdId: generateReferralId(),
        fromUserId: user2Id,
        toEmails: ['deepak.joshi@example.com'],
        note: 'Deepak, you should definitely check out this jewelry store!',
        sendReminder: false,
        status: 'accepted',
        redeemedBy: new mongoose.Types.ObjectId(),
        redeemedAt: new Date('2024-09-20T14:30:00Z'),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date('2024-09-01T10:00:00Z')
      },
      {
        referFrdId: generateReferralId(),
        fromUserId: user2Id,
        toEmails: ['meera.iyer@example.com'],
        note: 'Meera, found the perfect place for your wedding jewelry shopping!',
        sendReminder: false,
        status: 'accepted',
        redeemedBy: new mongoose.Types.ObjectId(),
        redeemedAt: new Date('2024-10-05T09:15:00Z'),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date('2024-09-15T11:45:00Z')
      },
      // Pending referrals
      {
        referFrdId: generateReferralId(),
        fromUserId: user2Id,
        toEmails: ['rohit.desai@example.com', 'anjali.nair@example.com'],
        note: 'Great collection of diamond jewelry. Check it out!',
        sendReminder: true,
        status: 'pending',
        expiresAt: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
        reminderSentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
      },
      {
        referFrdId: generateReferralId(),
        fromUserId: user2Id,
        toEmails: ['kiran.reddy@example.com'],
        note: 'Kiran, remember you wanted to buy a bracelet? This store has amazing options!',
        sendReminder: false,
        status: 'pending',
        expiresAt: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        referFrdId: generateReferralId(),
        fromUserId: user2Id,
        toEmails: ['arjun.pillai@example.com', 'divya.menon@example.com'],
        note: 'Sharing my favorite jewelry store. Amazing quality and prices!',
        sendReminder: true,
        status: 'pending',
        expiresAt: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      // Expired referrals
      {
        referFrdId: generateReferralId(),
        fromUserId: user2Id,
        toEmails: ['expired.user@example.com'],
        note: 'Hurry up! Sale ending soon.',
        sendReminder: true,
        status: 'expired',
        expiresAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        reminderSentAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 33 * 24 * 60 * 60 * 1000)
      }
    ];

    const createdUser2Referrals = await Referral.insertMany(user2Referrals);
    console.log(`✅ Created ${createdUser2Referrals.length} referrals for User 2`);
    console.log(`   - Accepted: ${createdUser2Referrals.filter(r => r.status === 'accepted').length}`);
    console.log(`   - Pending: ${createdUser2Referrals.filter(r => r.status === 'pending').length}`);
    console.log(`   - Expired: ${createdUser2Referrals.filter(r => r.status === 'expired').length}\n`);

    // Update User 1 statistics
    console.log('🔄 Updating user statistics...\n');
    
    const user1AcceptedCount = createdUser1Referrals.filter(r => r.status === 'accepted').length;
    const user1Earnings = user1AcceptedCount * 500; // ₹500 per referral
    
    await User.findByIdAndUpdate(user1Id, {
      referralCount: user1AcceptedCount,
      totalReferralEarnings: user1Earnings
    });
    
    console.log(`✅ User 1 (Aditya) updated:`);
    console.log(`   Referral Count: ${user1AcceptedCount}`);
    console.log(`   Total Earnings: ₹${user1Earnings.toLocaleString()}\n`);

    // Update User 2 statistics
    const user2AcceptedCount = createdUser2Referrals.filter(r => r.status === 'accepted').length;
    const user2Earnings = user2AcceptedCount * 500;
    
    await User.findByIdAndUpdate(user2Id, {
      referralCount: user2AcceptedCount,
      totalReferralEarnings: user2Earnings
    });
    
    console.log(`✅ User 2 (Addy) updated:`);
    console.log(`   Referral Count: ${user2AcceptedCount}`);
    console.log(`   Total Earnings: ₹${user2Earnings.toLocaleString()}\n`);

    // Display summary
    console.log('═'.repeat(70));
    console.log('📊 REFERRAL SEEDING SUMMARY');
    console.log('═'.repeat(70) + '\n');

    const allReferrals = await Referral.find({ 
      fromUserId: { $in: [user1Id, user2Id] } 
    }).sort({ createdAt: -1 });

    console.log(`👤 User 1: ${user1.name}`);
    console.log(`   Email: ${user1.email}`);
    console.log(`   Referral Code: ${user1.referralCode}`);
    console.log(`   📊 Statistics:`);
    console.log(`      Total Referrals Sent: ${user1Referrals.length}`);
    console.log(`      Accepted: ${user1AcceptedCount} (✅ Earning: ₹${user1Earnings.toLocaleString()})`);
    console.log(`      Pending: ${user1Referrals.filter(r => r.status === 'pending').length} (⏳ Waiting)`);
    console.log(`      Expired: ${user1Referrals.filter(r => r.status === 'expired').length} (⏰ Missed)`);

    console.log(`\n👤 User 2: ${user2.name}`);
    console.log(`   Email: ${user2.email}`);
    console.log(`   Referral Code: ${user2.referralCode}`);
    console.log(`   📊 Statistics:`);
    console.log(`      Total Referrals Sent: ${user2Referrals.length}`);
    console.log(`      Accepted: ${user2AcceptedCount} (✅ Earning: ₹${user2Earnings.toLocaleString()})`);
    console.log(`      Pending: ${user2Referrals.filter(r => r.status === 'pending').length} (⏳ Waiting)`);
    console.log(`      Expired: ${user2Referrals.filter(r => r.status === 'expired').length} (⏰ Missed)`);

    console.log('\n📋 Recent Referrals:');
    console.log('─'.repeat(70));
    allReferrals.slice(0, 5).forEach((ref, idx) => {
      const fromUser = ref.fromUserId.toString() === user1Id.toString() ? 'Aditya' : 'Addy';
      const statusIcon = ref.status === 'accepted' ? '✅' : 
                        ref.status === 'expired' ? '⏰' : '⏳';
      console.log(`${idx + 1}. ${ref.referFrdId} ${statusIcon}`);
      console.log(`   From: ${fromUser}`);
      console.log(`   To: ${ref.toEmails.slice(0, 2).join(', ')}${ref.toEmails.length > 2 ? ` +${ref.toEmails.length - 2} more` : ''}`);
      console.log(`   Status: ${ref.status.toUpperCase()}`);
      if (ref.status === 'accepted') {
        console.log(`   Redeemed: ${new Date(ref.redeemedAt).toLocaleDateString()}`);
      }
      console.log();
    });

    console.log('═'.repeat(70));
    console.log('\n✨ SUCCESS! Referral data seeded for both users!\n');
    console.log('🎯 You can now test:');
    console.log('   - View referral dashboard');
    console.log('   - See referral earnings');
    console.log('   - Track referral status');
    console.log('   - Send new referrals');
    console.log('   - View referral history\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
};

const main = async () => {
  await connectDB();
  await seedReferrals();
  await mongoose.disconnect();
  console.log('👋 Disconnected. Goodbye!\n');
  process.exit(0);
};

main();

