# Quick Reference - Seeded Data

## 🚀 Quick Start

### Run Seeding
```bash
cd server
node seed-referral-promo.js
```

### Verify Data
```bash
node verify-seeded-data.js
```

## 🎫 Promo Codes to Test

| Code | Type | Discount | Min Purchase | Status |
|------|------|----------|--------------|--------|
| **WELCOME2024** | % | 20% | ₹1,000 | ✅ Valid |
| **FIRSTORDER** | ₹ | 300 | ₹3,000 | ✅ Valid (Unused) |
| **FESTIVE500** | ₹ | 500 | ₹5,000 | ✅ Valid |
| **NEWYEAR2024** | % | 25% | ₹2,000 | ✅ Valid |
| **LUXURY10** | % | 10% | ₹15,000 | ✅ Valid |
| **FLASHSALE** | ₹ | 750 | ₹7,500 | ✅ Valid (18/20) |
| **FULLUSED100** | % | 15% | ₹1,500 | 🔒 Fully Used |
| **EXPIRED2023** | ₹ | 1000 | ₹10,000 | ❌ Expired |

## 👥 Test Users

**All passwords**: `password123`

| Email | Name | Referral Code | Earnings |
|-------|------|---------------|----------|
| john.doe@example.com | John Doe | JOHYPEO | ₹500 |
| jane.smith@example.com | Jane Smith | JANV1O1 | ₹500 |
| mike.johnson@example.com | Mike Johnson | MIKC2JS | ₹500 |
| sarah.williams@example.com | Sarah Williams | SARU39A | ₹0 |
| david.brown@example.com | David Brown | DAV3L4T | ₹0 |
| emma.davis@example.com | Emma Davis | EMMEX7Q | ₹0 |
| james.miller@example.com | James Miller | JAMTZZP | ₹0 |
| olivia.wilson@example.com | Olivia Wilson | OLISUMI | ₹0 |

## 🧪 Test Scenarios

### Test Valid Promo Code
```bash
# Use WELCOME2024 for 20% off on ₹1000+
# Use FIRSTORDER for ₹300 off on ₹3000+ (no one has used it yet)
```

### Test Invalid Promo Code
```bash
# Use EXPIRED2023 - should reject (expired)
# Use FULLUSED100 - should reject (fully used)
```

### Test Referral Code
```bash
# Use JOHYPEO, JANV1O1, or MIKC2JS
# These users have already earned from referrals
```

### Test Cart Value
```bash
# Cart 1: ₹155,000 (2 items)
# Cart 2: ₹290,000 (3 items)
# Cart 3: ₹45,000 (1 item)
# Cart 4: ₹175,000 (2 items)
# Cart 5: ₹145,000 (3 items)
```

## 📊 Data Summary

- **10** Users with referral codes
- **8** Promo codes (6 active)
- **10** Referrals (5 pending, 3 accepted, 2 expired)
- **5** Carts (₹810,000 total value)
- **6** Wishlist shares (4 active)
- **5** Products

## 🔗 API Endpoints to Test

### Promo Codes
```
POST /api/promo-codes/validate
Body: { "code": "WELCOME2024", "cartTotal": 5000 }

GET /api/promo-codes (admin)
POST /api/promo-codes (admin)
```

### Referrals
```
POST /api/referrals/send
GET /api/referrals/my-referrals
POST /api/referrals/redeem/:referFrdId
```

### User
```
GET /api/users/profile
GET /api/users/referral-stats
```

### Cart
```
GET /api/cart
POST /api/cart/apply-promo
Body: { "promoCode": "WELCOME2024" }
```

## 📝 Notes

- All test users have password: `password123`
- Referral earnings: ₹500 per successful referral
- Promo codes have usage limits
- Some promo codes are intentionally expired/used for testing

## 🎯 Common Test Cases

### ✅ Apply Valid Promo
1. Login as john.doe@example.com
2. View cart (should have items)
3. Apply code: WELCOME2024
4. Should get 20% discount

### ✅ Check Referral Stats
1. Login as john.doe@example.com
2. View profile/referral stats
3. Should show:
   - Referral code: JOHYPEO
   - Referrals: 1
   - Earnings: ₹500

### ✅ Try Expired Promo
1. Apply code: EXPIRED2023
2. Should reject with "expired" message

### ✅ Try Fully Used Promo
1. Apply code: FULLUSED100
2. Should reject with "usage limit reached" message

### ✅ Send New Referral
1. Login as any user
2. Get your referral code
3. Send to new emails
4. New referral should be created

---

**Need Help?** See `REFERRAL_PROMO_SEEDING_README.md` for full documentation.


