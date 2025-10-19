# Integration Setup Guide

## Environment Variables Required

Add the following environment variables to your `.env` file in the server directory:

```env
# CCAvenue Payment Gateway Configuration
CCAVENUE_MERCHANT_ID=your_merchant_id_here
CCAVENUE_ACCESS_CODE=your_access_code_here
CCAVENUE_WORKING_KEY=your_working_key_here
CCAVENUE_PAYMENT_URL=https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction

# Cloudinary Configuration (if not already present)
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here

# Client Configuration
CLIENT_URL=http://localhost:3000
```

## New API Endpoints Added

### Payment Gateway Endpoints
- `POST /api/payment/initiate` - Initiate payment with CCAvenue
- `POST /api/payment/callback` - Handle CCAvenue payment callback
- `GET /api/payment/callback` - Handle CCAvenue redirect callback
- `GET /api/payment/status/:orderId` - Get payment status
- `GET /api/payment/orders/:userId` - Get user orders

### Upload Your Own Endpoints
- `POST /api/rings/upload` - Upload images for custom ring design
- `POST /api/rings/customize` - Save customization details
- `GET /api/rings/user/:userId` - Get user's rings
- `GET /api/rings/:id` - Get ring details
- `POST /api/rings/:id/payment` - Process payment for ring

## Installation

1. Install new dependencies:
```bash
cd server
npm install
```

2. Add environment variables to your `.env` file

3. Start the server:
```bash
npm run dev
```

## Features Integrated

✅ CCAvenue Payment Gateway with AES-128-CBC encryption
✅ Upload Your Own functionality with Cloudinary integration
✅ Image upload with validation and optimization
✅ Ring customization options
✅ Order management system
✅ Payment status tracking
✅ User-specific data management

## Testing

The server will start without errors if all environment variables are properly configured. Test the endpoints using the provided API documentation.
