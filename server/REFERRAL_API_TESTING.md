# Referral System API Testing Guide

This document provides comprehensive testing instructions for the Referral and Promo Code system.

## Prerequisites

1. **Backend Server Running**: Ensure your backend server is running on `http://localhost:5000`
2. **Database**: MongoDB should be connected and running
3. **Authentication**: You'll need valid JWT tokens for authenticated endpoints
4. **Email Configuration**: Set up email environment variables for email functionality

## Environment Variables Required

Add these to your `.env` file in the server directory:

```env
# Email Configuration (for sending referral emails)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@kynajewels.com

# Frontend URL (for generating referral links)
FRONTEND_URL=http://localhost:5173
```

## API Endpoints Overview

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/referrals` | Yes | Create a referral |
| POST | `/api/referrals/promos/redeem` | Yes | Redeem a promo code |
| GET | `/api/referrals/my-referrals` | Yes | Get user's referrals |
| GET | `/api/referrals/details/:referFrdId` | No | Get referral details |
| GET | `/api/settings` | No | Get current settings |
| POST | `/api/settings` | Yes (Admin) | Create settings |
| PUT | `/api/settings` | Yes (Admin) | Update settings |

## Testing Steps

### Step 1: Setup and Authentication

1. **Start the backend server:**
   ```bash
   cd server
   npm run dev
   ```

2. **Create test users:**
   - Register two users: one as referrer, one as friend
   - Note down their JWT tokens for API calls

3. **Create admin user (optional):**
   - Update a user's role to 'admin' in the database for settings management

### Step 2: Initialize Settings (Admin Only)

**Create initial settings:**
```bash
curl -X POST https://api.kynajewels.com/api/settings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -d '{
    "referralRewardFriend": 15,
    "referralRewardReferrer": 20,
    "promoExpiryDays": 30
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Settings created successfully",
  "data": {
    "_id": "...",
    "referralRewardFriend": 15,
    "referralRewardReferrer": 20,
    "promoExpiryDays": 30,
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### Step 3: Create a Referral

**Create referral with friend emails:**
```bash
curl -X POST https://api.kynajewels.com/api/referrals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_REFERRER_JWT_TOKEN" \
  -d '{
    "toEmails": ["friend1@example.com", "friend2@example.com"],
    "note": "Hey! Check out this amazing jewelry store. You'll love it!"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Referral created successfully",
  "data": {
    "referFrdId": "507f1f77bcf86cd799439011",
    "shareableLink": "http://localhost:5173/refer?code=507f1f77bcf86cd799439011",
    "expiresAt": "2024-02-15T10:30:00.000Z",
    "toEmails": ["friend1@example.com", "friend2@example.com"],
    "emailResults": [
      {"email": "friend1@example.com", "sent": true},
      {"email": "friend2@example.com", "sent": true}
    ]
  }
}
```

### Step 4: Validate Referral Code

**Check referral details before redemption:**
```bash
curl -X GET https://api.kynajewels.com/api/referrals/details/507f1f77bcf86cd799439011
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "referFrdId": "507f1f77bcf86cd799439011",
    "fromUser": {
      "_id": "...",
      "firstName": "John",
      "lastName": "Doe"
    },
    "note": "Hey! Check out this amazing jewelry store. You'll love it!",
    "expiresAt": "2024-02-15T10:30:00.000Z",
    "status": "pending"
  }
}
```

### Step 5: Redeem Promo Code

**Redeem the referral code as a friend:**
```bash
curl -X POST https://api.kynajewels.com/api/referrals/promos/redeem \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FRIEND_JWT_TOKEN" \
  -d '{
    "referFrdId": "507f1f77bcf86cd799439011"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Promo code redeemed successfully",
  "data": {
    "friendReward": 15,
    "referrerReward": 20,
    "yourNewBalance": 15,
    "referrerNewBalance": 20
  }
}
```

### Step 6: View User's Referrals

**Get referrer's referral history:**
```bash
curl -X GET https://api.kynajewels.com/api/referrals/my-referrals \
  -H "Authorization: Bearer YOUR_REFERRER_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "referFrdId": "507f1f77bcf86cd799439011",
      "fromUserId": "...",
      "toEmails": ["friend1@example.com", "friend2@example.com"],
      "note": "Hey! Check out this amazing jewelry store. You'll love it!",
      "status": "accepted",
      "redeemedBy": {
        "_id": "...",
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "friend1@example.com"
      },
      "redeemedAt": "2024-01-16T10:30:00.000Z",
      "expiresAt": "2024-02-15T10:30:00.000Z",
      "createdAt": "2024-01-16T10:00:00.000Z",
      "updatedAt": "2024-01-16T10:30:00.000Z"
    }
  ]
}
```

### Step 7: Check Current Settings

**Get current system settings:**
```bash
curl -X GET https://api.kynajewels.com/api/settings
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "referralRewardFriend": 15,
    "referralRewardReferrer": 20,
    "promoExpiryDays": 30,
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

## Error Testing Scenarios

### 1. Invalid Referral Code
```bash
curl -X POST https://api.kynajewels.com/api/referrals/promos/redeem \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FRIEND_JWT_TOKEN" \
  -d '{
    "referFrdId": "invalid-code"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Invalid referral code"
}
```

### 2. Already Redeemed Code
```bash
# Try to redeem the same code again
curl -X POST https://api.kynajewels.com/api/referrals/promos/redeem \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FRIEND_JWT_TOKEN" \
  -d '{
    "referFrdId": "507f1f77bcf86cd799439011"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Referral code has already been redeemed"
}
```

### 3. Self-Referral Attempt
```bash
# Try to redeem your own referral code
curl -X POST https://api.kynajewels.com/api/referrals/promos/redeem \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_REFERRER_JWT_TOKEN" \
  -d '{
    "referFrdId": "507f1f77bcf86cd799439011"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "You cannot redeem your own referral code"
}
```

### 4. Invalid Email Format
```bash
curl -X POST https://api.kynajewels.com/api/referrals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_REFERRER_JWT_TOKEN" \
  -d '{
    "toEmails": ["invalid-email", "friend@example.com"],
    "note": "Test referral"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Invalid email addresses: invalid-email"
}
```

## Database Verification

### Check Referral Collection
```javascript
// In MongoDB shell or MongoDB Compass
db.referrals.find().pretty()
```

### Check User's Available Offers
```javascript
// Check if rewards were added to user accounts
db.users.find({}, {firstName: 1, lastName: 1, email: 1, availableOffers: 1})
```

### Check Settings Collection
```javascript
// Verify settings were created
db.settings.find().pretty()
```

## Frontend Integration

### 1. Referral Link Handling
The referral system generates links like: `http://localhost:5173/refer?code=REFERRAL_ID`

In your frontend, handle this URL to:
- Extract the `code` parameter
- Validate the code using `/api/referrals/details/:referFrdId`
- Show referral information to the user
- Allow them to redeem the code

### 2. User Dashboard
Add sections to show:
- User's available offers balance
- Referral history
- Create new referrals form

### 3. Checkout Integration
- Add promo code input field
- Validate and redeem codes during checkout
- Apply rewards to order total

## Performance Testing

### Load Testing with Multiple Referrals
```bash
# Create multiple referrals simultaneously
for i in {1..10}; do
  curl -X POST https://api.kynajewels.com/api/referrals \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_REFERRER_JWT_TOKEN" \
    -d "{
      \"toEmails\": [\"friend$i@example.com\"],
      \"note\": \"Test referral $i\"
    }" &
done
wait
```

## Security Testing

### 1. Unauthorized Access
```bash
# Try to access protected endpoints without token
curl -X POST https://api.kynajewels.com/api/referrals \
  -H "Content-Type: application/json" \
  -d '{"toEmails": ["test@example.com"]}'
```

### 2. Admin-Only Endpoints
```bash
# Try to update settings without admin role
curl -X PUT https://api.kynajewels.com/api/settings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_REGULAR_USER_JWT_TOKEN" \
  -d '{"referralRewardFriend": 100}'
```

## Troubleshooting

### Common Issues:

1. **Email not sending**: Check email configuration in `.env`
2. **Database connection**: Ensure MongoDB is running
3. **Authentication errors**: Verify JWT token is valid and not expired
4. **Referral not found**: Check if the referral ID is correct and not expired

### Debug Mode:
Add console.log statements in controllers to debug issues:
```javascript
console.log('Creating referral for user:', fromUserId);
console.log('Referral data:', referral);
```

## Monitoring

### Key Metrics to Track:
- Number of referrals created per day
- Referral redemption rate
- Email delivery success rate
- User engagement with referral system
- Revenue generated from referrals

This testing guide should help you thoroughly test the referral system and ensure it works correctly in all scenarios.
