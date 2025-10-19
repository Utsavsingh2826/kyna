# 🚀 Kyna Jewels - Complete API Endpoints Documentation

## Overview

This document contains all available API endpoints for the Kyna Jewels e-commerce platform. The API is built with Node.js, Express, TypeScript, and MongoDB.

**Base URL**: `https://api.kynajewels.com/api`

---

## 📋 Table of Contents

- [Authentication & User Management](#-authentication--user-management)
- [Products & Catalog](#-products--catalog)
- [Shopping Cart](#-shopping-cart)
- [Orders & Tracking](#-orders--tracking)
- [Payment Gateway (CCAvenue)](#-payment-gateway-ccavenue)
- [Upload Your Own (Custom Jewelry)](#-upload-your-own-custom-jewelry)
- [Wishlist](#-wishlist)
- [Gift Cards](#-gift-cards)
- [Referral System](#-referral-system)
- [Reviews & Ratings](#-reviews--ratings)
- [Engraving Services](#-engraving-services)
- [Gifting](#-gifting)
- [Settings & Configuration](#-settings--configuration)
- [System & Health](#-system--health)

---

## 🔐 Authentication & User Management

| Method | Endpoint                      | Description                 | Auth Required |
| ------ | ----------------------------- | --------------------------- | ------------- |
| POST   | `/auth/signup`                | User registration           | ❌            |
| POST   | `/auth/login`                 | User login                  | ❌            |
| POST   | `/auth/logout`                | User logout                 | ❌            |
| POST   | `/auth/verify-email`          | Email verification          | ❌            |
| POST   | `/auth/forgot-password`       | Forgot password             | ❌            |
| POST   | `/auth/reset-password/:token` | Reset password              | ❌            |
| GET    | `/auth/check-auth`            | Check authentication status | ✅            |
| GET    | `/auth/me`                    | Get current user profile    | ✅            |
| PUT    | `/auth/profile`               | Update user profile         | ✅            |

### Example Request Bodies:

**Signup:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "+1234567890"
}
```

**Login:**

```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

---

## 💍 Products & Catalog

| Method | Endpoint                      | Description              | Auth Required |
| ------ | ----------------------------- | ------------------------ | ------------- |
| GET    | `/products/:category`         | Get products by category | ❌            |
| GET    | `/products/:category/filters` | Get filtered products    | ❌            |

### Available Categories:

- `rings`
- `earrings`
- `pendants`
- `bracelets`

### Example Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "product_id",
      "name": "Diamond Ring",
      "price": 1500,
      "category": "rings",
      "images": ["image_url_1", "image_url_2"],
      "description": "Beautiful diamond ring",
      "inStock": true
    }
  ]
}
```

---

## 🛒 Shopping Cart

| Method | Endpoint                  | Description           | Auth Required |
| ------ | ------------------------- | --------------------- | ------------- |
| GET    | `/cart`                   | Get user's cart       | ✅            |
| POST   | `/cart/add`               | Add item to cart      | ✅            |
| DELETE | `/cart/remove/:productId` | Remove item from cart | ✅            |
| PUT    | `/cart/update/:productId` | Update item quantity  | ✅            |
| DELETE | `/cart/clear`             | Clear entire cart     | ✅            |

### Example Request Body (Add to Cart):

```json
{
  "productId": "product_id",
  "quantity": 2,
  "size": "M",
  "customizations": {
    "engraving": "Love Forever"
  }
}
```

---

## 📦 Orders & Tracking

| Method | Endpoint                        | Description                   | Auth Required |
| ------ | ------------------------------- | ----------------------------- | ------------- |
| POST   | `/orders`                       | Create order from cart        | ✅            |
| POST   | `/orders/direct`                | Create direct order (buy now) | ✅            |
| GET    | `/orders/my`                    | Get user's orders             | ✅            |
| GET    | `/orders/:orderId`              | Get specific order details    | ✅            |
| PATCH  | `/orders/:orderId/cancel`       | Cancel order                  | ✅            |
| POST   | `/orders/track`                 | Track order (public)          | ❌            |
| POST   | `/orders/failed-payment`        | Handle failed payment         | ❌            |
| GET    | `/orders/admin/all`             | Get all orders (admin)        | ✅            |
| PUT    | `/orders/admin/:orderId/status` | Update order status (admin)   | ✅            |
| POST   | `/orders/admin/:orderId/ship`   | Ship order with docket number | ✅            |
| GET    | `/orders/admin/stats`           | Get order statistics (admin)  | ✅            |
| POST   | `/track-order/track-order`      | Track order (alternative)     | ❌            |
| GET    | `/track-order/my`               | Get my orders (alternative)   | ❌            |

## 🚚 Order Tracking (Sequel247 Integration)

| Method | Endpoint                        | Description                           | Auth Required |
| ------ | ------------------------------- | ------------------------------------- | ------------- |
| GET    | `/tracking/health`              | Health check for tracking service     | ❌            |
| POST   | `/tracking/track`               | Track order by order number and email | ❌            |
| GET    | `/tracking/history/:email`      | Get order history for customer        | ❌            |
| GET    | `/tracking/stats`               | Get tracking statistics (admin)       | ✅            |
| PUT    | `/tracking/status/:orderNumber` | Update order status (admin)           | ✅            |
| POST   | `/tracking/manual-update`       | Manual tracking update (admin)        | ✅            |
| POST   | `/tracking/test/create-order`   | Create test order (dev only)          | ❌            |

## 🏥 System Health & Monitoring

| Method | Endpoint                        | Description                           | Auth Required |
| ------ | ------------------------------- | ------------------------------------- | ------------- |
| GET    | `/system/health`                | Complete system health check          | ❌            |

### Example Response (System Health):

```json
{
  "success": true,
  "message": "System is healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "cronJob": {
    "status": "running",
    "frequency": "Every 30 minutes",
    "nextUpdate": "Within 30 minutes"
  },
  "database": {
    "connected": true,
    "totalOrders": 150,
    "totalTracking": 145,
    "ordersToUpdate": 23
  },
  "recentActivity": [
    {
      "orderNumber": "KYNA12345678",
      "status": "ON_THE_ROAD",
      "updatedAt": "2024-01-15T10:15:00.000Z"
    }
  ],
  "systemInfo": {
    "environment": "development",
    "uptime": "3600 seconds"
  }
}
```

### Example Request Body (Track Order):

```json
{
  "orderNumber": "KYNA12345678",
  "email": "test@example.com"
}
```

### Example Response (Track Order):

```json
{
  "success": true,
  "data": {
    "order": {
      "orderNumber": "KYNA12345678",
      "customerEmail": "test@example.com",
      "customerName": "John Doe",
      "totalAmount": 25000,
      "status": "ON_THE_ROAD",
      "docketNumber": "1234567890",
      "estimatedDelivery": "2024-01-20T00:00:00.000Z",
      "trackingHistory": [...]
    },
    "tracking": {
      "currentStatus": "ON_THE_ROAD",
      "progress": 80,
      "steps": [
        {
          "status": "ORDER_PLACED",
          "title": "Order Placed",
          "description": "Your order has been successfully placed",
          "completed": true,
          "active": false,
          "timestamp": "2024-01-15T10:00:00.000Z"
        },
        {
          "status": "ON_THE_ROAD",
          "title": "On The Road",
          "description": "Your order is on its way to you",
          "completed": true,
          "active": true,
          "location": "Mumbai Hub",
          "timestamp": "2024-01-17T14:30:00.000Z"
        }
      ],
      "estimatedDelivery": "2024-01-20T00:00:00.000Z"
    }
  },
  "message": "Order found successfully"
}
```

### Example Request Body (Create Order):

```json
{
  "items": [
    {
      "productId": "product_id",
      "quantity": 1,
      "price": 1500,
      "size": "M"
    }
  ],
  "shippingAddress": {
    "name": "John Doe",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "USA"
  },
  "paymentMethod": "credit_card"
}
```

---

## 💳 Payment Gateway (CCAvenue)

| Method | Endpoint                   | Description               | Auth Required |
| ------ | -------------------------- | ------------------------- | ------------- |
| POST   | `/payment/initiate`        | Initiate payment          | ❌            |
| POST   | `/payment/callback`        | Handle payment callback   | ❌            |
| GET    | `/payment/callback`        | Handle payment redirect   | ❌            |
| GET    | `/payment/status/:orderId` | Get payment status        | ❌            |
| GET    | `/payment/orders/:userId`  | Get user's payment orders | ❌            |

### Example Request Body (Initiate Payment):

```json
{
  "orderId": "ORD_1234567890",
  "amount": "1500.00",
  "currency": "INR",
  "billingInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+91-9876543210",
    "address": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zip": "400001",
    "country": "India"
  },
  "redirectUrl": "http://localhost:3000/payment-success",
  "cancelUrl": "http://localhost:3000/payment-cancel",
  "userId": "user_123"
}
```

### Example Response (Initiate Payment):

```json
{
  "success": true,
  "data": {
    "encryptedData": "encrypted_payment_data",
    "accessCode": "your_access_code",
    "orderId": "ORD_1234567890",
    "paymentUrl": "https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction"
  },
  "message": "Payment initiated successfully"
}
```

---

## 💎 Upload Your Own (Custom Jewelry)

| Method | Endpoint              | Description                | Auth Required |
| ------ | --------------------- | -------------------------- | ------------- |
| POST   | `/rings/upload`       | Upload custom ring images  | ❌            |
| POST   | `/rings/customize`    | Save customization details | ❌            |
| GET    | `/rings/user/:userId` | Get user's custom rings    | ❌            |
| GET    | `/rings/:id`          | Get ring details           | ❌            |
| POST   | `/rings/:id/payment`  | Process payment for ring   | ❌            |

### Example Request Body (Upload Images):

```json
{
  "sameAsImage": false,
  "modificationRequest": "I want a custom design with specific modifications",
  "description": "Custom ring design description",
  "userId": "user_123"
}
```

### Example Request Body (Customize):

```json
{
  "ringId": "ring_id",
  "customization": {
    "metal": "Gold",
    "metalColor": "Rose Gold",
    "goldKarat": "18KT",
    "diamondShape": "Round",
    "diamondSize": "1.5 carat",
    "diamondColor": "D",
    "diamondClarity": "VVS1",
    "ringSize": "7",
    "engraving": "Forever Love",
    "modificationRequest": "Custom modifications needed",
    "description": "Detailed description of the custom ring"
  }
}
```

---

## ❤️ Wishlist

| Method | Endpoint               | Description             | Auth Required |
| ------ | ---------------------- | ----------------------- | ------------- |
| GET    | `/wishlist`            | Get user's wishlist     | ✅            |
| POST   | `/wishlist`            | Add product to wishlist | ✅            |
| DELETE | `/wishlist/:productId` | Remove from wishlist    | ✅            |
| DELETE | `/wishlist/clear`      | Clear wishlist          | ✅            |

### Example Request Body (Add to Wishlist):

```json
{
  "productId": "product_id",
  "productModel": "Ring"
}
```

---

## 🎁 Gift Cards

| Method | Endpoint                        | Description           | Auth Required |
| ------ | ------------------------------- | --------------------- | ------------- |
| POST   | `/gift-cards`                   | Create gift card      | ❌            |
| POST   | `/gift-cards/claim/:giftCardId` | Claim gift from email | ✅            |
| GET    | `/gift-cards/my-gifts`          | Get user's gifts      | ✅            |

### Example Request Body (Create Gift Card):

```json
{
  "recipientEmail": "recipient@example.com",
  "amount": 100,
  "message": "Happy Birthday!",
  "senderName": "John Doe"
}
```

---

## 👥 Referral System

| Method | Endpoint                             | Description                     | Auth Required |
| ------ | ------------------------------------ | ------------------------------- | ------------- |
| POST   | `/referrals`                         | Create referral invitation      | ✅            |
| POST   | `/referrals/redeem`                  | Redeem promo code               | ✅            |
| GET    | `/referrals/my-referrals`            | Get user's referrals            | ✅            |
| GET    | `/referrals/:referFrdId`             | Get referral details by code    | ❌            |
| POST   | `/referrals/reminder-emails/trigger` | Trigger reminder emails (admin) | ✅            |

### Example Request Body (Create Referral):

```json
{
  "toEmails": ["friend1@example.com", "friend2@example.com"],
  "note": "Check out this amazing jewelry store! You'll get ₹10 off your first purchase.",
  "sendReminder": true
}
```

### Example Response (Create Referral):

```json
{
  "success": true,
  "message": "Referral created successfully",
  "data": {
    "referFrdId": "507f1f77bcf86cd799439011",
    "shareableLink": "http://localhost:5173/refer?code=507f1f77bcf86cd799439011",
    "referralCode": "507f1f77bcf86cd799439011",
    "expiresAt": "2024-02-15T10:30:00.000Z",
    "toEmails": ["friend1@example.com", "friend2@example.com"],
    "sendReminder": true,
    "emailResults": [
      { "email": "friend1@example.com", "sent": true },
      { "email": "friend2@example.com", "sent": true }
    ]
  }
}
```

### Example Request Body (Redeem Promo Code):

```json
{
  "referFrdId": "507f1f77bcf86cd799439011"
}
```

### Example Response (Redeem Promo Code):

```json
{
  "success": true,
  "message": "Promo code redeemed successfully",
  "data": {
    "friendReward": 10,
    "referrerReward": 10,
    "yourNewBalance": 25,
    "referrerNewBalance": 35
  }
}
```

### Example Response (Get User's Referrals):

```json
{
  "success": true,
  "data": [
    {
      "_id": "referral_id",
      "referFrdId": "507f1f77bcf86cd799439011",
      "fromUserId": "user_id",
      "toEmails": ["friend1@example.com", "friend2@example.com"],
      "note": "Check out this amazing jewelry store!",
      "status": "pending",
      "sendReminder": true,
      "expiresAt": "2024-02-15T10:30:00.000Z",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "redeemedBy": null,
      "redeemedAt": null,
      "reminderSentAt": null
    }
  ]
}
```

### Example Response (Get Referral Details):

```json
{
  "success": true,
  "data": {
    "referFrdId": "507f1f77bcf86cd799439011",
    "referralCode": "507f1f77bcf86cd799439011",
    "fromUser": {
      "_id": "user_id",
      "firstName": "John",
      "lastName": "Doe"
    },
    "note": "Check out this amazing jewelry store!",
    "expiresAt": "2024-02-15T10:30:00.000Z",
    "status": "pending"
  }
}
```

### Referral System Features:

- **Multi-email invitations**: Send referrals to multiple friends at once
- **Automatic email notifications**: System sends invitation emails automatically
- **Shareable links**: Generate shareable referral links with unique codes
- **Expiry handling**: Referral codes expire after configured days (default 30 days)
- **Reward system**: Both referrer and friend get rewards when code is redeemed
- **Email validation**: Only invited email addresses can redeem the code
- **Reminder emails**: Optional reminder emails sent 3 days after creation
- **Duplicate prevention**: Users cannot redeem their own referral codes
- **Transaction safety**: Uses MongoDB transactions for reward distribution

### Error Responses:

```json
{
  "success": false,
  "message": "Invalid referral code"
}
```

```json
{
  "success": false,
  "message": "Referral code has expired"
}
```

```json
{
  "success": false,
  "message": "This referral code is not valid for your email address"
}
```

```json
{
  "success": false,
  "message": "You cannot redeem your own referral code"
}
```

---

## ⭐ Reviews & Ratings

| Method | Endpoint                      | Description         | Auth Required |
| ------ | ----------------------------- | ------------------- | ------------- |
| POST   | `/reviews`                    | Add product review  | ✅            |
| GET    | `/reviews/product/:productId` | Get product reviews | ❌            |
| POST   | `/reviews/:reviewId/like`     | Toggle review like  | ✅            |
| POST   | `/reviews/:reviewId/reply`    | Add reply to review | ✅            |

### Example Request Body (Add Review):

```json
{
  "productId": "product_id",
  "rating": 5,
  "title": "Amazing quality!",
  "comment": "The ring is absolutely beautiful and the quality is outstanding.",
  "images": ["image_url_1", "image_url_2"]
}
```

---

## 🔨 Engraving Services

| Method | Endpoint                         | Description                   | Auth Required |
| ------ | -------------------------------- | ----------------------------- | ------------- |
| GET    | `/engraving/products`            | Get engraving products        | ❌            |
| GET    | `/engraving/product/:id`         | Get product engraving details | ❌            |
| GET    | `/engraving/user-images`         | Get user's engraving images   | ✅            |
| POST   | `/engraving/upload`              | Upload engraving image        | ✅            |
| POST   | `/engraving/create-product`      | Create engraving product      | ✅            |
| POST   | `/engraving/toggle-availability` | Toggle engraving availability | ✅            |

### Example Request Body (Upload Engraving):

```json
{
  "productId": "product_id",
  "engravingText": "Forever Love",
  "fontStyle": "elegant",
  "position": "inside"
}
```

---

## 🎁 Gifting

| Method | Endpoint   | Description          | Auth Required |
| ------ | ---------- | -------------------- | ------------- |
| GET    | `/gifting` | Get gifting products | ❌            |

---

## ⚙️ Settings & Configuration

| Method | Endpoint    | Description             | Auth Required |
| ------ | ----------- | ----------------------- | ------------- |
| GET    | `/settings` | Get current settings    | ❌            |
| POST   | `/settings` | Create settings (admin) | ✅            |
| PUT    | `/settings` | Update settings (admin) | ✅            |

### Example Request Body (Update Settings):

```json
{
  "storeName": "Kyna Jewels",
  "currency": "INR",
  "shippingRates": {
    "standard": 100,
    "express": 200
  },
  "returnPolicy": "30 days return policy",
  "contactInfo": {
    "email": "support@kynajewels.com",
    "phone": "+91-9876543210"
  }
}
```

---

## 🔍 System & Health

| Method | Endpoint | Description      | Auth Required |
| ------ | -------- | ---------------- | ------------- |
| GET    | `/test`  | API health check | ❌            |
| GET    | `/`      | Basic API status | ❌            |

### Example Response (Health Check):

```json
{
  "message": "Backend API is connected successfully!",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "status": "OK"
}
```

---

## 📊 Summary Statistics

| Category            | Endpoints | Description                        |
| ------------------- | --------- | ---------------------------------- |
| **Authentication**  | 9         | User management and authentication |
| **Products**        | 2         | Product catalog and filtering      |
| **Cart**            | 5         | Shopping cart management           |
| **Orders**          | 11        | Order processing and tracking      |
| **Order Tracking**  | 6         | Sequel247 integration and tracking |
| **Payment Gateway** | 5         | CCAvenue payment integration       |
| **Upload Your Own** | 5         | Custom jewelry upload and design   |
| **Wishlist**        | 4         | User wishlist management           |
| **Gift Cards**      | 3         | Gift card creation and redemption  |
| **Referrals**       | 5         | Referral system and promo codes    |
| **Reviews**         | 4         | Product reviews and ratings        |
| **Engraving**       | 6         | Engraving services                 |
| **Gifting**         | 1         | Gifting products                   |
| **Settings**        | 3         | System configuration               |
| **System**          | 2         | Health checks and monitoring       |

**Total: 81+ API Endpoints** covering all aspects of the jewelry e-commerce platform.

---

## 🔧 Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 📝 Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description"
}
```

## 🌐 Environment Variables

Ensure the following environment variables are configured:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/kyna-jewels

# JWT
JWT_SECRET=your_jwt_secret

# CCAvenue Payment Gateway
CCAVENUE_MERCHANT_ID=your_merchant_id
CCAVENUE_ACCESS_CODE=your_access_code
CCAVENUE_WORKING_KEY=your_working_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Sequel247 Tracking
SEQUEL247_TEST_ENDPOINT=https://test.sequel247.com/
SEQUEL247_TEST_TOKEN=your_test_token
SEQUEL247_PROD_ENDPOINT=https://sequel247.com/
SEQUEL247_PROD_TOKEN=your_prod_token
SEQUEL247_STORE_CODE=BLRAK

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

---

## 📞 Support

For API support and questions, please contact the development team or refer to the project documentation.

---

_Last updated: January 2024_
_Version: 1.0.0_
