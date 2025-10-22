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
const Cart = mongoose.model('Cart', new mongoose.Schema({}, { strict: false, strictPopulate: false }));
const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

const verifyUsers = async () => {
  try {
    console.log('🔍 VERIFYING USER DATA\n' + '='.repeat(70) + '\n');

    const user1 = await User.findOne({ email: 'tiwariaditya1810@gmail.com' })
      .populate('wishlist')
      .populate('usedPromoCodes');
    
    const user2 = await User.findOne({ email: 'addytiw1810@gmail.com' })
      .populate('wishlist')
      .populate('usedPromoCodes');

    if (!user1 || !user2) {
      console.error('❌ Users not found');
      return;
    }

    const cart1 = await Cart.findOne({ user: user1._id }).populate('items.product');
    const cart2 = await Cart.findOne({ user: user2._id }).populate('items.product');

    console.log('👤 USER 1: Aditya Vinay Tiwari TIWARI');
    console.log('─'.repeat(70));
    console.log(`Email: ${user1.email}`);
    console.log(`ID: ${user1._id}`);
    console.log(`Referral Code: ${user1.referralCode}`);
    console.log(`Verified: ${user1.isVerified ? '✅' : '❌'}`);
    console.log(`Available Offers: ${user1.availableOffers}`);
    
    console.log(`\n🛒 CART (${cart1 ? cart1.items.length : 0} items)`);
    if (cart1) {
      console.log(`Total Amount: ₹${cart1.totalAmount.toLocaleString()}`);
      cart1.items.forEach((item, idx) => {
        const prod = item.product;
        console.log(`  ${idx + 1}. ${prod.title}`);
        console.log(`     SKU: ${prod.sku}`);
        console.log(`     Price: ₹${item.price.toLocaleString()} x ${item.quantity} = ₹${(item.price * item.quantity).toLocaleString()}`);
      });
    } else {
      console.log('  ❌ No cart found');
    }

    console.log(`\n💝 WISHLIST (${user1.wishlist ? user1.wishlist.length : 0} items)`);
    if (user1.wishlist && user1.wishlist.length > 0) {
      user1.wishlist.forEach((prod, idx) => {
        if (prod && prod.title) {
          console.log(`  ${idx + 1}. ${prod.title} - ₹${prod.price.toLocaleString()}`);
          console.log(`     SKU: ${prod.sku}`);
        }
      });
    } else {
      console.log('  ❌ No wishlist items');
    }

    console.log(`\n🎫 PROMO CODES USED: ${user1.usedPromoCodes ? user1.usedPromoCodes.length : 0}`);
    if (user1.usedPromoCodes && user1.usedPromoCodes.length > 0) {
      user1.usedPromoCodes.forEach((pc, idx) => {
        if (pc) {
          console.log(`  ${idx + 1}. ${pc.code} - ${pc.description}`);
        }
      });
    }

    console.log('\n\n👤 USER 2: Addy bhai');
    console.log('─'.repeat(70));
    console.log(`Email: ${user2.email}`);
    console.log(`ID: ${user2._id}`);
    console.log(`Referral Code: ${user2.referralCode}`);
    console.log(`Verified: ${user2.isVerified ? '✅' : '❌'}`);
    console.log(`Available Offers: ${user2.availableOffers}`);
    console.log(`Used Referral Codes: ${user2.usedReferralCodes ? user2.usedReferralCodes.join(', ') : 'None'}`);
    
    console.log(`\n🛒 CART (${cart2 ? cart2.items.length : 0} items)`);
    if (cart2) {
      console.log(`Total Amount: ₹${cart2.totalAmount.toLocaleString()}`);
      cart2.items.forEach((item, idx) => {
        const prod = item.product;
        console.log(`  ${idx + 1}. ${prod.title}`);
        console.log(`     SKU: ${prod.sku}`);
        console.log(`     Price: ₹${item.price.toLocaleString()} x ${item.quantity} = ₹${(item.price * item.quantity).toLocaleString()}`);
      });
    } else {
      console.log('  ❌ No cart found');
    }

    console.log(`\n💝 WISHLIST (${user2.wishlist ? user2.wishlist.length : 0} items)`);
    if (user2.wishlist && user2.wishlist.length > 0) {
      user2.wishlist.forEach((prod, idx) => {
        if (prod && prod.title) {
          console.log(`  ${idx + 1}. ${prod.title} - ₹${prod.price.toLocaleString()}`);
          console.log(`     SKU: ${prod.sku}`);
        }
      });
    } else {
      console.log('  ❌ No wishlist items');
    }

    console.log(`\n🎫 PROMO CODES USED: ${user2.usedPromoCodes ? user2.usedPromoCodes.length : 0}`);
    if (user2.usedPromoCodes && user2.usedPromoCodes.length > 0) {
      user2.usedPromoCodes.forEach((pc, idx) => {
        if (pc) {
          console.log(`  ${idx + 1}. ${pc.code} - ${pc.description}`);
        }
      });
    }

    console.log('\n' + '='.repeat(70));
    console.log('\n✅ VERIFICATION COMPLETE!');
    console.log('\n🎯 Status:');
    console.log(`   User 1 Cart: ${cart1 ? '✅ Ready' : '❌ Missing'}`);
    console.log(`   User 1 Wishlist: ${user1.wishlist && user1.wishlist.length > 0 ? '✅ Ready' : '❌ Missing'}`);
    console.log(`   User 2 Cart: ${cart2 ? '✅ Ready' : '❌ Missing'}`);
    console.log(`   User 2 Wishlist: ${user2.wishlist && user2.wishlist.length > 0 ? '✅ Ready' : '❌ Missing'}`);
    console.log('\n✨ You can now test the cart and wishlist pages!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
};

const main = async () => {
  await connectDB();
  await verifyUsers();
  await mongoose.disconnect();
  console.log('👋 Goodbye!\n');
  process.exit(0);
};

main();


