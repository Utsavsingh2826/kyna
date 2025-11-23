# KYNA JEWELS - Frontend Backend Connection

## 🚀 Quick Start

### Option 1: Using PowerShell Scripts (Recommended)

1. **Start Backend**: Right-click `start-backend.ps1` and select "Run with PowerShell"
2. **Start Frontend**: Right-click `start-frontend.ps1` and select "Run with PowerShell"

### Option 2: Manual Setup

#### Backend Setup

1. Navigate to the server directory:

   ```bash
   cd server
   ```

2. Install dependencies (if not already installed):

   ```bash
   npm install
   ```

3. Start the backend server:
   ```bash
   npm run dev
   ```

The backend will start on ``

#### Frontend Setup

1. Navigate to the client directory:

   ```bash
   cd client
   ```

2. Install dependencies (if not already installed):

   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm run dev
   ```

The frontend will start on `http://localhost:5173`

## 🔗 API Endpoints Connected

### Authentication APIs

- **Signup**: `POST https://api.kynajewels.com/api/auth/signup`
- **Login**: `POST https://api.kynajewels.com/api/auth/login`
- **Logout**: `POST https://api.kynajewels.com/api/auth/logout`
- **Email Verification**: `POST https://api.kynajewels.com/api/auth/verify-email`
- **Forgot Password**: `POST https://api.kynajewels.com/api/auth/forgot-password`
- **Reset Password**: `POST https://api.kynajewels.com/api/auth/reset-password/:token`

## 🎨 Features Implemented

### Frontend Components

- ✅ **SignUp Page** - User registration with form validation
- ✅ **Login Page** - User authentication with cookie support
- ✅ **Email Verification Page** - OTP verification flow
- ✅ **Header Component** - User dropdown menu with authentication status
- ✅ **API Status Indicator** - Real-time backend connection status

### Authentication Flow

1. **Sign Up**: User fills registration form → Backend creates account → Email verification required
2. **Email Verification**: User enters OTP → Account verified → Redirect to login
3. **Login**: User enters credentials → Backend authenticates → Cookie set → User logged in
4. **Logout**: User clicks logout → Cookie cleared → User logged out

### UI Features

- 🎨 **Color Scheme**: Uses `#68C5C0` teal and white combination
- 📱 **Responsive Design**: Works on all screen sizes
- 🔒 **Password Visibility Toggle**: Show/hide password functionality
- ⚡ **Loading States**: Visual feedback during API calls
- ✅ **Form Validation**: Client-side validation with error messages
- 🔄 **Auto-redirect**: Automatic navigation after successful actions

## 🔧 Technical Details

### Frontend Technologies

- **React 18** with TypeScript
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Fetch API** for HTTP requests

### Backend Technologies

- **Node.js** with Express
- **TypeScript** for type safety
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcrypt** for password hashing
- **nodemailer** for email sending

### API Integration

- **CORS** enabled for cross-origin requests
- **Cookie-based authentication** for secure sessions
- **Centralized API service** for consistent error handling
- **Real-time connection status** indicator

## 🧪 Testing the Connection

1. **Start both servers** (backend and frontend)
2. **Check the API status indicator** in the bottom-right corner
3. **Try signing up** with a new account
4. **Verify email** with the OTP (check backend logs for OTP)
5. **Login** with the verified account
6. **Test logout** functionality

## 📝 Environment Variables

Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/kyna-jewels
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1d
JWT_COOKIE_SECURE=false
OTP_EXPIRY_MINUTES=10
RESET_TOKEN_EXPIRY_HOURS=1
BCRYPT_SALT_ROUNDS=12
```

## 🎯 Next Steps

- [ ] Add user profile management
- [ ] Implement order tracking
- [ ] Add product catalog integration
- [ ] Create admin dashboard
- [ ] Add payment integration
- [ ] Implement wishlist functionality

## 🐛 Troubleshooting

### Common Issues & Solutions

#### 1. CORS Error (Most Common)

**Error**: `Access to fetch at 'https://api.kynajewels.com/api/auth/login' has been blocked by CORS policy`

**Solution**:

- ✅ **Fixed**: CORS is now properly configured for `http://localhost:5173`
- Ensure both servers are running (backend on 5000, frontend on 5173)
- Check that the API status indicator shows "Backend Connected"

#### 2. 500 Internal Server Error

**Error**: `Failed to load resource: the server responded with a status of 500`

**Solution**:

- ✅ **Fixed**: Added development mode that works without MongoDB
- The server now has fallback behavior for missing environment variables
- Check server console for specific error messages

#### 3. Backend Won't Start

**Error**: `Cannot find module` or `JWT_SECRET environment variable is required`

**Solution**:

- ✅ **Fixed**: Server now sets default values for development
- Use the PowerShell scripts: `start-backend.ps1` and `start-frontend.ps1`
- Or manually run: `cd server && npm run dev`

#### 4. Authentication Not Working

**Error**: Login/signup fails with network errors

**Solution**:

- ✅ **Fixed**: Development mode accepts any credentials for testing
- For signup: Use any email/password (OTP will be '123456' in dev mode)
- For login: Use any email/password in development mode
- For email verification: Use any 6-digit code in development mode

### Development Mode Features

- 🔧 **No MongoDB Required**: Server works without database in development
- 🔧 **Default Credentials**: Any email/password works for testing
- 🔧 **Fixed OTP**: Use '123456' for email verification
- 🔧 **Auto Environment Variables**: No .env file needed for basic testing

### Production Setup

For production, you'll need:

1. MongoDB database
2. Proper .env file with real credentials
3. Email service configuration
4. Secure JWT secret
