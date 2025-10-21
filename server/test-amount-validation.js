// Test script for Razorpay amount validation
const { validatePaymentAmount, PAYMENT_METHOD_LIMITS, DEFAULT_MAX_AMOUNT } = require('./src/utils/razorpay');

console.log('Testing Razorpay Amount Validation\n');

// Test cases
const testCases = [
  { amount: 88500, description: 'Your problematic amount' },
  { amount: 100000, description: 'UPI/Wallet limit' },
  { amount: 500000, description: 'Default maximum limit' },
  { amount: 600000, description: 'Above default limit' },
  { amount: 50000, description: 'Within all limits' },
  { amount: 0, description: 'Zero amount' },
  { amount: -100, description: 'Negative amount' },
  { amount: 'invalid', description: 'Invalid string amount' }
];

console.log('Payment Method Limits:');
Object.entries(PAYMENT_METHOD_LIMITS).forEach(([method, limit]) => {
  console.log(`  ${method}: ₹${limit === Infinity ? 'No limit' : limit.toLocaleString()}`);
});
console.log(`\nDefault Maximum Amount: ₹${DEFAULT_MAX_AMOUNT.toLocaleString()}\n`);

testCases.forEach(({ amount, description }) => {
  console.log(`Testing: ${description} (₹${amount})`);
  const result = validatePaymentAmount(amount);
  
  if (result.isValid) {
    console.log(`  ✅ Valid`);
    if (result.exceededMethods && result.exceededMethods.length > 0) {
      console.log(`  ⚠️  Exceeds limits for: ${result.exceededMethods.join(', ')}`);
    }
    if (result.recommendedMethods && result.recommendedMethods.length > 0) {
      console.log(`  💡 Recommended methods: ${result.recommendedMethods.join(', ')}`);
    }
  } else {
    console.log(`  ❌ Invalid: ${result.error}`);
    if (result.recommendedMethods && result.recommendedMethods.length > 0) {
      console.log(`  💡 Recommended methods: ${result.recommendedMethods.join(', ')}`);
    }
  }
  console.log('');
});

console.log('\nFor your ₹88,500 payment:');
const yourAmount = validatePaymentAmount(88500);
if (yourAmount.isValid) {
  console.log('✅ Amount is valid for payment');
  if (yourAmount.exceededMethods && yourAmount.exceededMethods.length > 0) {
    console.log(`⚠️  Cannot use: ${yourAmount.exceededMethods.join(', ')}`);
  }
  if (yourAmount.recommendedMethods && yourAmount.recommendedMethods.length > 0) {
    console.log(`💡 Recommended: ${yourAmount.recommendedMethods.join(', ')}`);
  }
} else {
  console.log(`❌ ${yourAmount.error}`);
}
