const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/kyna');
    console.log('✅ MongoDB Connected Successfully\n');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Import models - using minimal schemas needed for reading
const userSchema = new mongoose.Schema({}, { strict: false, strictPopulate: false });
const promoCodeSchema = new mongoose.Schema({}, { strict: false, strictPopulate: false });
const referralSchema = new mongoose.Schema({}, { strict: false, strictPopulate: false });
const cartSchema = new mongoose.Schema({}, { strict: false, strictPopulate: false });
const wishlistShareSchema = new mongoose.Schema({}, { strict: false, strictPopulate: false });
const productSchema = new mongoose.Schema({}, { strict: false, strictPopulate: false });

const User = mongoose.model('User', userSchema);
const PromoCode = mongoose.model('PromoCode', promoCodeSchema);
const Referral = mongoose.model('Referral', referralSchema);
const Cart = mongoose.model('Cart', cartSchema);
const WishlistShare = mongoose.model('WishlistShare', wishlistShareSchema);
const Product = mongoose.model('Product', productSchema);

// Verify data function
const verifyData = async () => {
  try {
    console.log('🔍 VERIFYING SEEDED DATA\n' + '='.repeat(70) + '\n');

    // 1. Promo Codes
    console.log('🎫 PROMO CODES:');
    console.log('─'.repeat(70));
    const promoCodes = await PromoCode.find({}).sort({ createdAt: -1 });
    console.log(`Total Promo Codes: ${promoCodes.length}\n`);
    
    promoCodes.forEach((pc, idx) => {
      const isExpired = pc.expiresAt && new Date(pc.expiresAt) < new Date();
      const isFullyUsed = pc.usedCount >= pc.usageLimit;
      const status = !pc.isActive ? '❌ INACTIVE' : 
                     isExpired ? '⏰ EXPIRED' : 
                     isFullyUsed ? '🔒 FULLY USED' : 
                     '✅ ACTIVE';
      
      console.log(`${idx + 1}. ${pc.code}`);
      console.log(`   Type: ${pc.discountType.toUpperCase()}`);
      console.log(`   Discount: ${pc.discountType === 'percentage' ? pc.discountValue + '%' : '₹' + pc.discountValue}`);
      console.log(`   Min Purchase: ₹${pc.minPurchase}`);
      console.log(`   Usage: ${pc.usedCount}/${pc.usageLimit}`);
      console.log(`   Used By: ${pc.usedBy.length} users`);
      console.log(`   Status: ${status}`);
      console.log(`   Expires: ${pc.expiresAt ? new Date(pc.expiresAt).toLocaleDateString() : 'No expiry'}`);
      console.log(`   Description: ${pc.description}`);
      console.log();
    });

    // 2. Referrals
    console.log('\n🔗 REFERRALS:');
    console.log('─'.repeat(70));
    const referrals = await Referral.find({})
      .populate('fromUserId', 'name email referralCode')
      .populate('redeemedBy', 'name email')
      .sort({ createdAt: -1 });
    console.log(`Total Referrals: ${referrals.length}\n`);

    const referralsByStatus = {
      pending: referrals.filter(r => r.status === 'pending'),
      accepted: referrals.filter(r => r.status === 'accepted'),
      expired: referrals.filter(r => r.status === 'expired')
    };

    console.log(`📊 By Status:`);
    console.log(`   Pending: ${referralsByStatus.pending.length}`);
    console.log(`   Accepted: ${referralsByStatus.accepted.length}`);
    console.log(`   Expired: ${referralsByStatus.expired.length}\n`);

    referrals.forEach((ref, idx) => {
      const statusIcon = ref.status === 'accepted' ? '✅' : 
                        ref.status === 'expired' ? '⏰' : '⏳';
      
      console.log(`${idx + 1}. ${ref.referFrdId} ${statusIcon}`);
      console.log(`   From: ${ref.fromUserId?.name || 'Unknown'} (${ref.fromUserId?.email || 'N/A'})`);
      console.log(`   Referral Code: ${ref.fromUserId?.referralCode || 'N/A'}`);
      console.log(`   To Emails: ${ref.toEmails.join(', ')}`);
      console.log(`   Status: ${ref.status.toUpperCase()}`);
      if (ref.redeemedBy) {
        console.log(`   Redeemed By: ${ref.redeemedBy.name} (${ref.redeemedBy.email})`);
        console.log(`   Redeemed At: ${new Date(ref.redeemedAt).toLocaleString()}`);
      }
      console.log(`   Expires: ${new Date(ref.expiresAt).toLocaleDateString()}`);
      if (ref.note) {
        console.log(`   Note: "${ref.note.substring(0, 50)}${ref.note.length > 50 ? '...' : ''}"`);
      }
      console.log();
    });

    // 3. Users with Referral & Promo Data
    console.log('\n👥 USERS WITH REFERRAL & PROMO DATA:');
    console.log('─'.repeat(70));
    const users = await User.find({})
      .populate('usedPromoCodes', 'code discountType discountValue')
      .sort({ createdAt: -1 });
    console.log(`Total Users: ${users.length}\n`);

    users.forEach((user, idx) => {
      console.log(`${idx + 1}. ${user.name || user.firstName + ' ' + (user.lastName || '')}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role?.toUpperCase() || 'CUSTOMER'}`);
      console.log(`   Referral Code: ${user.referralCode || 'Not Generated'}`);
      console.log(`   Referral Stats:`);
      console.log(`      - Total Referrals: ${user.referralCount || 0}`);
      console.log(`      - Total Earnings: ₹${user.totalReferralEarnings || 0}`);
      console.log(`   Promo Codes Used: ${user.usedPromoCodes?.length || 0}`);
      if (user.usedPromoCodes && user.usedPromoCodes.length > 0) {
        user.usedPromoCodes.forEach(pc => {
          console.log(`      - ${pc.code} (${pc.discountType}: ${pc.discountValue}${pc.discountType === 'percentage' ? '%' : '₹'})`);
        });
      }
      console.log(`   Referral Codes Used: ${user.usedReferralCodes?.length || 0}`);
      if (user.usedReferralCodes && user.usedReferralCodes.length > 0) {
        console.log(`      - ${user.usedReferralCodes.join(', ')}`);
      }
      console.log(`   Available Offers: ${user.availableOffers || 0}`);
      console.log();
    });

    // 4. Carts
    console.log('\n🛒 CARTS:');
    console.log('─'.repeat(70));
    const carts = await Cart.find({})
      .populate('user', 'name email')
      .populate('items.product', 'title sku price')
      .sort({ createdAt: -1 });
    console.log(`Total Carts: ${carts.length}\n`);

    carts.forEach((cart, idx) => {
      console.log(`${idx + 1}. Cart for ${cart.user?.name || 'Unknown User'} (${cart.user?.email || 'N/A'})`);
      console.log(`   Total Items: ${cart.items.length}`);
      console.log(`   Total Amount: ₹${cart.totalAmount.toLocaleString()}`);
      console.log(`   Items:`);
      cart.items.forEach((item, itemIdx) => {
        console.log(`      ${itemIdx + 1}. ${item.product?.title || 'Unknown Product'}`);
        console.log(`         SKU: ${item.product?.sku || 'N/A'}`);
        console.log(`         Price: ₹${item.price.toLocaleString()} x ${item.quantity} = ₹${(item.price * item.quantity).toLocaleString()}`);
      });
      console.log();
    });

    // 5. Wishlist Shares
    console.log('\n💝 WISHLIST SHARES:');
    console.log('─'.repeat(70));
    const wishlistShares = await WishlistShare.find({})
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    console.log(`Total Wishlist Shares: ${wishlistShares.length}\n`);

    wishlistShares.forEach((share, idx) => {
      const isExpired = new Date(share.expiresAt) < new Date();
      const status = !share.isActive ? '❌ INACTIVE' : 
                     isExpired ? '⏰ EXPIRED' : 
                     '✅ ACTIVE';
      
      console.log(`${idx + 1}. ${share.shareId}`);
      console.log(`   User: ${share.userId?.name || 'Unknown'} (${share.userId?.email || 'N/A'})`);
      console.log(`   Status: ${status}`);
      console.log(`   Created: ${new Date(share.createdAt).toLocaleDateString()}`);
      console.log(`   Expires: ${new Date(share.expiresAt).toLocaleDateString()}`);
      console.log();
    });

    // Summary Statistics
    console.log('\n📊 SUMMARY STATISTICS:');
    console.log('='.repeat(70));
    console.log(`Total Users: ${users.length}`);
    console.log(`Total Promo Codes: ${promoCodes.length}`);
    console.log(`   - Active & Valid: ${promoCodes.filter(pc => pc.isActive && (!pc.expiresAt || new Date(pc.expiresAt) > new Date()) && pc.usedCount < pc.usageLimit).length}`);
    console.log(`Total Referrals: ${referrals.length}`);
    console.log(`   - Pending: ${referralsByStatus.pending.length}`);
    console.log(`   - Accepted: ${referralsByStatus.accepted.length}`);
    console.log(`   - Expired: ${referralsByStatus.expired.length}`);
    console.log(`Total Carts: ${carts.length}`);
    console.log(`Total Wishlist Shares: ${wishlistShares.length}`);
    console.log(`   - Active: ${wishlistShares.filter(ws => ws.isActive).length}`);
    
    const totalReferralEarnings = users.reduce((sum, user) => sum + (user.totalReferralEarnings || 0), 0);
    console.log(`Total Referral Earnings (All Users): ₹${totalReferralEarnings.toLocaleString()}`);
    
    const totalCartValue = carts.reduce((sum, cart) => sum + cart.totalAmount, 0);
    console.log(`Total Cart Value: ₹${totalCartValue.toLocaleString()}`);
    
    console.log('='.repeat(70));
    console.log('\n✅ Verification completed successfully!\n');

  } catch (error) {
    console.error('❌ Error verifying data:', error);
    throw error;
  }
};

// Main execution
const main = async () => {
  try {
    await connectDB();
    await verifyData();
    console.log('👋 Disconnecting from database...');
    await mongoose.disconnect();
    console.log('✅ Database disconnected. Goodbye!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
};

main();

