# OTP Registration System Setup Guide

## Overview
This implementation adds OTP-based email verification to the user registration process. Users must verify their email with a 6-digit OTP before they can login.

## Changes Made

### 1. User Schema Updates
- **Removed**: `passwordHash` field
- **Updated**: `password` field now contains the hashed password (for security)
- **Added**: OTP fields (`otp`, `otpExpires`) for email verification
- **Updated**: Pre-save hook now hashes the `password` field instead of `passwordHash`

### 2. Authentication Controller Updates
- **signup**: Creates user with unverified status and sends OTP email
- **verifyEmail**: Verifies OTP and marks user as verified
- **login**: Checks if user is verified before allowing login
- **resendOtp**: Allows resending OTP to unverified users

### 3. Email Service Updates
- **Gmail Configuration**: Uses `enquiries@kynajewels.com` with app password `qrue wzck rvqw pjzg`
- **OTP Email**: Sends 6-digit OTP for verification
- **Welcome Email**: Sent after successful verification

### 4. Frontend Updates
- **SignUpPage**: Updated to handle OTP verification flow
- **API Service**: Added `resendOtp` function
- **OTP Input**: 6-digit numeric input with validation

### 5. Routes Updates
- **Added**: `/auth/resend-otp` endpoint

## Environment Variables Required

Create a `.env` file in the server directory with:

```env
# Database
MONGO_URI=mongodb://localhost:27017/kynajewels

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_COOKIE_SECURE=false

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=enquiries@kynajewels.com
EMAIL_PASS=qrue wzck rvqw pjzg
EMAIL_FROM=enquiries@kynajewels.com

# Client URL
CLIENT_URL=http://localhost:5173

# OTP Configuration
OTP_EXPIRY_MINUTES=10

# Environment
NODE_ENV=development
```

## Testing

### 1. Database Test
```bash
cd server
npx ts-node test-otp-registration.js
```

### 2. API Endpoints Test
```bash
cd server
node test-api-endpoints.js
```

### 3. Manual Testing
1. Start the server: `npm start`
2. Start the client: `cd ../client && npm run dev`
3. Go to `/signup` and register a new user
4. Check email for OTP
5. Enter OTP to verify
6. Try to login (should work after verification)

## Registration Flow

1. **User Registration**:
   - User fills registration form
   - System creates user with `isVerified: false`
   - 6-digit OTP generated and sent to email
   - User redirected to OTP verification page

2. **OTP Verification**:
   - User enters 6-digit OTP
   - System verifies OTP and expiry
   - User marked as `isVerified: true`
   - Welcome email sent
   - User redirected to login page

3. **Login**:
   - System checks if user is verified
   - Only verified users can login
   - Unverified users get error message

## Security Features

- **Password Hashing**: Passwords are hashed using bcrypt before storage
- **OTP Expiry**: OTP expires after 10 minutes
- **Email Verification**: Users must verify email before login
- **Gmail App Password**: Secure email sending using Gmail app password

## API Endpoints

### POST `/api/auth/signup`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### POST `/api/auth/verify-email`
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

### POST `/api/auth/resend-otp`
```json
{
  "email": "john@example.com"
}
```

### POST `/api/auth/login`
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

## Troubleshooting

1. **Email not sending**: Check Gmail app password and SMTP settings
2. **OTP not working**: Check OTP expiry time and database connection
3. **Login blocked**: Ensure user is verified (`isVerified: true`)
4. **Database errors**: Check MongoDB connection and schema updates

## Next Steps

1. Set up production environment variables
2. Configure Gmail SMTP for production
3. Add rate limiting for OTP requests
4. Add email templates customization
5. Add OTP expiry countdown in frontend
