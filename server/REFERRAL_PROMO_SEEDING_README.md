# Referral & Promo Code Seeding Documentation

## Overview

This document describes the dummy data that has been seeded into the database for testing referral and promo code functionality.

## Files Created

1. **`seed-referral-promo.js`** - Main seeding script that populates all data
2. **`verify-seeded-data.js`** - Verification script to view seeded data
3. **`REFERRAL_PROMO_SEEDING_README.md`** - This documentation file

## What Was Seeded

### 📊 Summary Statistics

- **Users**: 10 users (8 new + 2 existing)
- **Promo Codes**: 8 promo codes
  - Active & Valid: 6
  - Expired: 1
  - Fully Used: 1
- **Referrals**: 10 referrals
  - Pending: 5
  - Accepted: 3
  - Expired: 2
- **Carts**: 5 carts with jewelry products
- **Wishlist Shares**: 6 wishlist shares
  - Active: 4
  - Inactive: 2
- **Products**: 5 jewelry products (rings, bracelets, pendants, earrings)

### 🎫 Promo Codes Created

| Code | Type | Discount | Min Purchase | Usage | Status |
|------|------|----------|--------------|-------|--------|
| WELCOME2024 | Percentage | 20% | ₹1,000 | 15/100 | ✅ Active |
| FESTIVE500 | Flat | ₹500 | ₹5,000 | 8/50 | ✅ Active |
| NEWYEAR2024 | Percentage | 25% | ₹2,000 | 45/200 | ✅ Active |
| FIRSTORDER | Flat | ₹300 | ₹3,000 | 0/1000 | ✅ Active |
| LUXURY10 | Percentage | 10% | ₹15,000 | 12/30 | ✅ Active |
| FLASHSALE | Flat | ₹750 | ₹7,500 | 18/20 | ✅ Active |
| FULLUSED100 | Percentage | 15% | ₹1,500 | 5/5 | 🔒 Fully Used |
| EXPIRED2023 | Flat | ₹1,000 | ₹10,000 | 5/10 | ❌ Expired/Inactive |

### 🔗 Referrals Created

- **5 Pending Referrals**: Users invited friends who haven't signed up yet
- **3 Accepted Referrals**: Referrals that were successfully redeemed
  - Each accepted referral earned the referrer ₹500
- **2 Expired Referrals**: Referrals that expired before being used

### 👥 User Updates

All users have been updated with:

1. **Referral Codes**: Unique codes like `JOHYPEO`, `JANV1O1`, `MIKC2JS`, etc.
2. **Referral Statistics**:
   - Referral count (number of successful referrals)
   - Total referral earnings (₹500 per successful referral)
3. **Promo Code Usage**: Track which promo codes each user has used
4. **Referral Code Usage**: Track which referral codes each user has redeemed
5. **Available Offers**: Random number of available offers (0-4)

#### Sample User Data

**John Doe** (john.doe@example.com)
- Referral Code: `JOHYPEO`
- Referral Count: 1
- Total Earnings: ₹500
- Used Promo Codes: 5 codes (WELCOME2024, FESTIVE500, etc.)
- Available Offers: 4

**Jane Smith** (jane.smith@example.com)
- Referral Code: `JANV1O1`
- Referral Count: 1
- Total Earnings: ₹500
- Used Promo Codes: 6 codes
- Available Offers: 3

### 🛒 Carts Created

Created 5 carts with various jewelry items:
- Cart values range from ₹45,000 to ₹290,000
- Total cart value across all carts: ₹810,000
- Products include rings, bracelets, pendants, and earrings

### 💝 Wishlist Shares Created

Created 6 wishlist share links:
- 4 active share links
- 2 inactive share links
- All expire in 30 days
- Unique share IDs like `WISH0TY1ZAO8JD`, `WISHZTIX0KU269`, etc.

## How to Use

### Running the Seeding Script

```bash
cd server
node seed-referral-promo.js
```

This will:
1. Clear existing referral, promo code, cart, and wishlist share data
2. Create or use existing users
3. Generate promo codes with various states
4. Create referrals with different statuses
5. Update users with referral and promo code data
6. Create carts with products
7. Create wishlist shares

### Verifying the Seeded Data

```bash
cd server
node verify-seeded-data.js
```

This will display:
- All promo codes with their details
- All referrals with status and relationships
- All users with their referral and promo code data
- All carts with items and amounts
- All wishlist shares with status
- Summary statistics

## Database Collections Updated

The seeding script affects the following collections:

1. **users**
   - Added referral codes
   - Updated referral counts and earnings
   - Added used promo codes
   - Added used referral codes
   - Updated available offers

2. **promocodes**
   - Created 8 promo codes with various states
   - Linked to users who used them

3. **referrals**
   - Created 10 referrals with different statuses
   - Linked referrers to their invitees

4. **carts**
   - Created 5 carts with products
   - Linked to users

5. **wishlistshares**
   - Created 6 wishlist shares
   - Linked to users

6. **products**
   - Created 5 jewelry products (if they didn't exist)

## Testing Scenarios

The seeded data supports the following test scenarios:

### Promo Code Testing
- ✅ Valid active promo code usage
- ⏰ Expired promo code handling
- 🔒 Fully used promo code handling
- 💰 Both percentage and flat discount types
- 🛒 Various minimum purchase requirements

### Referral Testing
- 📧 Pending referral invitations
- ✅ Accepted referral rewards
- ⏰ Expired referral handling
- 💸 Referral earnings calculation
- 🔗 Referral code usage tracking

### User Testing
- 👤 Users with multiple promo codes used
- 🎁 Users with referral earnings
- 📊 Users with various referral counts
- 🎯 Users with available offers

### Cart Testing
- 🛒 Multiple items in cart
- 💰 Various cart values for promo code testing
- 📦 Different product types

### Wishlist Share Testing
- 🔗 Active share links
- ❌ Inactive share links
- ⏰ Expiration handling

## API Endpoints to Test

With this data, you can test the following API endpoints:

### Promo Codes
- `POST /api/promo-codes/validate` - Test with codes like WELCOME2024, EXPIRED2023, FULLUSED100
- `GET /api/promo-codes` - Get all promo codes (admin)
- `POST /api/promo-codes` - Create new promo code (admin)

### Referrals
- `POST /api/referrals/send` - Send new referral
- `GET /api/referrals/my-referrals` - Get user's referrals
- `POST /api/referrals/redeem/:referFrdId` - Redeem a referral code

### User Profile
- `GET /api/users/profile` - Should show referral code and earnings
- `GET /api/users/referral-stats` - Get referral statistics

### Cart
- `GET /api/cart` - View cart
- `POST /api/cart/apply-promo` - Apply promo code to cart

## Sample Test Data

### Test Users (All passwords: `password123`)

| Name | Email | Referral Code | Earnings |
|------|-------|---------------|----------|
| John Doe | john.doe@example.com | JOHYPEO | ₹500 |
| Jane Smith | jane.smith@example.com | JANV1O1 | ₹500 |
| Mike Johnson | mike.johnson@example.com | MIKC2JS | ₹500 |
| Sarah Williams | sarah.williams@example.com | SARU39A | ₹0 |
| David Brown | david.brown@example.com | DAV3L4T | ₹0 |

### Test Promo Codes

| Code | For Testing |
|------|-------------|
| WELCOME2024 | Valid active percentage discount |
| FIRSTORDER | Valid active flat discount (unused) |
| EXPIRED2023 | Expired code handling |
| FULLUSED100 | Fully used code handling |
| FLASHSALE | Almost fully used (18/20) |

### Test Referral IDs

Sample referral IDs from the seeding (check actual IDs in database):
- Pending referrals: `REFDCV68D1D`, `REFDPG1H7PK`
- Accepted referrals: `REFHDLEXMF2`, `REF1NC4L7N0`
- Expired referrals: `REFAOE1YYPI`, `REF52N174ZI`

## Re-running the Seed Script

⚠️ **Warning**: The seed script clears existing data for:
- Promo codes
- Referrals
- Carts
- Wishlist shares

It does NOT clear:
- Users (will use existing or create new)
- Products (will use existing or create new)
- Orders

To re-run the script safely:

```bash
cd server
node seed-referral-promo.js
```

## Troubleshooting

### Issue: "MongoDB Connection Error"
**Solution**: Ensure MongoDB is running and the `MONGO_URI` in `.env` is correct.

### Issue: "Cannot find module 'bcryptjs'"
**Solution**: Install dependencies:
```bash
npm install bcryptjs
```

### Issue: Users not populating correctly
**Solution**: Check if the User model allows the fields being set. The script uses existing users if available.

## Notes

- All monetary values are in Indian Rupees (₹)
- Referral rewards are set to ₹500 per successful referral
- Promo code expiry dates range from already expired to 120 days in the future
- All test users have the same password: `password123`
- Referral codes are automatically generated for each user
- Cart items reference actual products created by the script

## Next Steps

After seeding, you can:

1. Test the promo code application on cart
2. Test referral link generation and redemption
3. Test user referral statistics display
4. Test promo code validation and usage limits
5. Test expired code and referral handling
6. Test wishlist sharing functionality

## Support

If you encounter any issues with the seeding script, check:
1. MongoDB connection
2. Required npm packages installed
3. Environment variables properly set
4. Sufficient database permissions

---

**Last Updated**: October 22, 2025
**Script Version**: 1.0


