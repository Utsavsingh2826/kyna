# Server Setup Guide

## Environment Variables Required

Create a `.env` file in the server directory with the following variables:

```env
# Environment Configuration
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/kyna-jewels

# JWT Configuration
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRES_IN=1d
JWT_COOKIE_SECURE=false

# Email Configuration (Optional for development)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@kynajewels.com

# OTP Configuration
OTP_EXPIRY_MINUTES=10
RESET_TOKEN_EXPIRY_HOURS=1
BCRYPT_SALT_ROUNDS=12

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
CLIENT_URL=http://localhost:5173

# Cloudinary Configuration (Optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Payment Gateway (Optional)
CCAVENUE_MERCHANT_ID=your-merchant-id
CCAVENUE_ACCESS_CODE=your-access-code
CCAVENUE_WORKING_KEY=your-working-key

# Tracking Configuration
SEQUEL247_TEST_ENDPOINT=https://test.sequel247.com/
SEQUEL247_TEST_TOKEN=b228a27399f07927985d57c0f7d94ce8
SEQUEL247_PROD_ENDPOINT=https://sequel247.com/
SEQUEL247_PROD_TOKEN=93444c78f18f9934a09cec2be4b17c8c
SEQUEL247_STORE_CODE=BLRAK
```

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with the variables above

3. Build the project:
```bash
npm run build
```

4. Start the server:
```bash
npm run dev
```

## Features

- ✅ Enhanced Authentication System
- ✅ OTP-based Email Verification
- ✅ Secure Password Reset
- ✅ Profile Management with Image Upload
- ✅ JWT Token Authentication
- ✅ Cookie-based Authentication
- ✅ Development Mode Support
- ✅ Comprehensive Error Handling
- ✅ TypeScript Support

## API Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password/:token` - Password reset
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - User logout

## Development Mode

The server includes development mode features:
- Skips database operations when MONGO_URI is not set
- Provides mock OTP for testing
- Enhanced logging and error messages
