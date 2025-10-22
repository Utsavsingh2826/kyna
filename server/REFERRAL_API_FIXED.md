# Referral API - Fixed & Updated

## ✅ Issue Resolved

The "invalid referral code" error has been fixed by adding proper endpoints to handle **user referral codes** (e.g., `ADI60U0`) separately from **referral document IDs** (e.g., `REF8U7IFQM6`).

## 🔑 Understanding the Two Types of Codes

### 1. **User Referral Code** (e.g., `ADI60U0`, `ADD626Z`)
- Belongs to a **user** (stored in `User.referralCode`)
- Used when sharing with friends: "Use my code ADI60U0 to join!"
- **ONE code per user** - never changes
- Anyone can use this code to get referral benefits

### 2. **Referral Document ID** (e.g., `REF8U7IFQM6`)
- Belongs to a **specific referral invitation** (stored in `Referral.referFrdId`)
- Created when user sends invitation to specific emails
- **Multiple per user** - one for each invitation sent
- Only invited emails can use this specific ID

---

## 📡 API Endpoints

### Base URL
```
http://localhost:3000/api/referrals
```

### 1. **Get User's Referral Statistics** ⭐ NEW
Get current user's referral code, earnings, and statistics.

**Endpoint:** `GET /api/referrals/stats`  
**Auth:** Required  

**Response:**
```json
{
  "success": true,
  "data": {
    "referralCode": "ADI60U0",
    "referralCount": 3,
    "totalReferralEarnings": 1500,
    "availableOffers": 3,
    "usedReferralCodes": [],
    "stats": {
      "total": 8,
      "accepted": 3,
      "pending": 3,
      "expired": 2
    }
  }
}
```

---

### 2. **Redeem User's Referral Code** ⭐ NEW
Apply a user's referral code (e.g., ADI60U0) to get benefits.

**Endpoint:** `POST /api/referrals/redeem-code`  
**Auth:** Required  

**Request Body:**
```json
{
  "referralCode": "ADI60U0"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Referral code applied successfully",
  "data": {
    "referrerName": "Aditya Vinay Tiwari TIWARI",
    "friendReward": 10,
    "referrerReward": 10,
    "yourNewBalance": 12,
    "referralEarnings": 500
  }
}
```

**Error Responses:**
```json
{
  "success": false,
  "message": "Invalid referral code"  // Code doesn't exist
}

{
  "success": false,
  "message": "You cannot use your own referral code"
}

{
  "success": false,
  "message": "You have already used a referral code",
  "usedCode": "ADI60U0"
}
```

---

### 3. **Get User's Referral List**
Get all referrals sent by the current user.

**Endpoint:** `GET /api/referrals/my-referrals`  
**Auth:** Required  

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "68f8760ee36138bce56f0465",
      "referFrdId": "REF8U7IFQM6",
      "fromUserId": "68f7f452330878c13e49f6dc",
      "toEmails": ["priya.sharma@example.com"],
      "note": "Check out this amazing jewelry!",
      "sendReminder": false,
      "status": "accepted",
      "redeemedBy": {
        "_id": "68f8760ee36138bce56f0462",
        "firstName": "Priya",
        "lastName": "Sharma",
        "email": "priya.sharma@example.com"
      },
      "redeemedAt": "2024-09-15T10:30:00.000Z",
      "expiresAt": "2025-11-21T06:13:34.907Z",
      "createdAt": "2024-08-20T14:22:00.000Z"
    }
  ]
}
```

---

### 4. **Create New Referral Invitation**
Send referral invitations to specific emails.

**Endpoint:** `POST /api/referrals`  
**Auth:** Required  

**Request Body:**
```json
{
  "toEmails": ["friend1@example.com", "friend2@example.com"],
  "note": "Check out this jewelry store!",
  "sendReminder": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Referral created successfully",
  "data": {
    "referFrdId": "6850a1b2c3d4e5f678901234",
    "shareableLink": "http://localhost:5173/refer?code=6850a1b2c3d4e5f678901234",
    "referralCode": "6850a1b2c3d4e5f678901234",
    "expiresAt": "2025-11-21T00:00:00.000Z",
    "toEmails": ["friend1@example.com", "friend2@example.com"],
    "sendReminder": true,
    "emailResults": [
      { "email": "friend1@example.com", "sent": true },
      { "email": "friend2@example.com", "sent": true }
    ]
  }
}
```

---

### 5. **Redeem Specific Referral Invitation**
Redeem a specific referral invitation (only for invited emails).

**Endpoint:** `POST /api/referrals/promos/redeem`  
**Auth:** Required  

**Request Body:**
```json
{
  "referFrdId": "6850a1b2c3d4e5f678901234"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Promo code redeemed successfully",
  "data": {
    "friendReward": 10,
    "referrerReward": 10,
    "yourNewBalance": 12,
    "referrerNewBalance": 23
  }
}
```

**Error Responses:**
```json
{
  "success": false,
  "message": "Invalid referral code"
}

{
  "success": false,
  "message": "Referral code has expired"
}

{
  "success": false,
  "message": "This referral code is not valid for your email address"
}

{
  "success": false,
  "message": "You cannot redeem your own referral code"
}
```

---

### 6. **Get Referral Details**
Validate a referral invitation before redeeming.

**Endpoint:** `GET /api/referrals/details/:referFrdId`  
**Auth:** Not required  

**Example:** `GET /api/referrals/details/6850a1b2c3d4e5f678901234`

**Response:**
```json
{
  "success": true,
  "data": {
    "referFrdId": "6850a1b2c3d4e5f678901234",
    "referralCode": "6850a1b2c3d4e5f678901234",
    "fromUser": {
      "_id": "68f7f452330878c13e49f6dc",
      "firstName": "Aditya",
      "lastName": "Vinay Tiwari TIWARI"
    },
    "note": "Check out this jewelry store!",
    "expiresAt": "2025-11-21T00:00:00.000Z",
    "status": "pending"
  }
}
```

---

## 🎯 Frontend Integration Guide

### **Scenario 1: Display User's Referral Code**

```javascript
// Get user's referral stats
const response = await fetch('/api/referrals/stats', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { data } = await response.json();
console.log('Your referral code:', data.referralCode); // ADI60U0
console.log('Total earnings:', data.totalReferralEarnings); // ₹1,500
console.log('Successful referrals:', data.referralCount); // 3
```

### **Scenario 2: User Wants to Apply a Referral Code**

```javascript
// User enters "ADI60U0" in a form
const response = await fetch('/api/referrals/redeem-code', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    referralCode: 'ADI60U0'
  })
});

const result = await response.json();
if (result.success) {
  alert(`Success! You got ${result.data.friendReward} offers!`);
  alert(`${result.data.referrerName} earned ₹${result.data.referralEarnings}`);
}
```

### **Scenario 3: Display User's Referral History**

```javascript
// Get list of all referrals sent
const response = await fetch('/api/referrals/my-referrals', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { data: referrals } = await response.json();

referrals.forEach(ref => {
  console.log(`Status: ${ref.status}`);
  console.log(`Sent to: ${ref.toEmails.join(', ')}`);
  if (ref.status === 'accepted') {
    console.log(`Redeemed by: ${ref.redeemedBy.email}`);
  }
});
```

---

## 📊 Test Data Available

### User 1 (Aditya)
- **Email:** tiwariaditya1810@gmail.com
- **Password:** password123
- **Referral Code:** `ADI60U0`
- **Earnings:** ₹1,500
- **Successful Referrals:** 3
- **Total Referrals:** 8 (3 accepted, 3 pending, 2 expired)

### User 2 (Addy)
- **Email:** addytiw1810@gmail.com
- **Password:** password123
- **Referral Code:** `ADD626Z`
- **Earnings:** ₹1,000
- **Successful Referrals:** 2
- **Total Referrals:** 6 (2 accepted, 3 pending, 1 expired)
- **Used Referral Code:** `ADI60U0` (from User 1)

---

## 🧪 Testing the Fix

### Test 1: Get User 1's Stats
```bash
curl -X GET http://localhost:3000/api/referrals/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 2: User 2 Uses User 1's Code (Should Fail - Already Used)
```bash
curl -X POST http://localhost:3000/api/referrals/redeem-code \
  -H "Authorization: Bearer USER2_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"referralCode": "ADI60U0"}'
```

### Test 3: Create New Test User and Use Referral Code
1. Register a new user: test@example.com
2. Login and get token
3. Apply referral code:
```bash
curl -X POST http://localhost:3000/api/referrals/redeem-code \
  -H "Authorization: Bearer NEW_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"referralCode": "ADI60U0"}'
```

---

## ✅ What Was Fixed

1. ✅ **Added `/api/referrals/redeem-code`** - Accepts user referral codes (ADI60U0)
2. ✅ **Added `/api/referrals/stats`** - Get user's referral statistics
3. ✅ **Updated controller** - New `redeemByUserReferralCode` function
4. ✅ **Updated controller** - New `getUserReferralStats` function
5. ✅ **Updated routes** - Exported and registered new endpoints

---

## 🔍 Debugging

If you still see "Invalid referral code" error:

1. **Check which endpoint the UI is calling:**
   - ✅ Correct: `POST /api/referrals/redeem-code` with `{referralCode: "ADI60U0"}`
   - ❌ Wrong: `POST /api/referrals/promos/redeem` with `{referFrdId: "ADI60U0"}`

2. **Verify the referral code exists:**
```javascript
const user = await User.findOne({ referralCode: "ADI60U0" });
console.log(user ? 'Found' : 'Not found');
```

3. **Check case sensitivity:**
   - Referral codes are stored in UPPERCASE
   - API automatically converts to uppercase: `.toUpperCase()`

---

## 📝 Summary

- ✅ Database data is perfect
- ✅ API endpoints are now correct
- ✅ Two separate flows:
  - **User referral code** (ADI60U0) → Use `/redeem-code`
  - **Invitation ID** (REF123) → Use `/promos/redeem`
- ✅ Frontend should use the appropriate endpoint based on use case

**The issue was in the API logic, not the database!** 🎉

