# Customer Reviews Setup Guide

## ✅ Dependencies Status

All required dependencies are already installed in your `server/package.json`:
- ✅ `node-fetch@2.7.0` - For making HTTP requests to Google Places API
- ✅ `@types/node-fetch@2` - TypeScript types (just installed)

## 🔧 Potential Errors & Solutions

### 1. **TypeScript Compilation Errors**

If you see errors like:
```
Cannot find module 'node-fetch' or its corresponding type declarations
```

**Solution:** The types have been installed. If you still see this error, run:
```bash
cd server
npm install --save-dev @types/node-fetch@2
```

### 2. **Runtime Errors - Missing Environment Variables**

The Google Reviews endpoint will work even without Google API keys (it returns an empty array). However, if you want to use Google Reviews:

**Add to `server/.env`:**
```env
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
GOOGLE_PLACE_ID=your_google_business_place_id_here
```

**How to get these:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project or select existing one
3. Enable "Places API"
4. Create credentials (API Key)
5. Get your Place ID from [Google Business Profile](https://business.google.com/)

### 3. **MongoDB Connection**

Your MongoDB URI is already configured. Make sure it's in `server/.env`:
```env
MONGO_URI=mongodb+srv://aditya:Addy@kynaa.eweepwh.mongodb.net/test?retryWrites=true&w=majority
```

### 4. **Import Errors**

If you see import errors for `googleReviewsController`, make sure:
- The file exists at: `server/src/controllers/googleReviewsController.ts`
- The route is registered in: `server/src/routes/review.ts`

## 🚀 Starting the Server

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies (if needed):**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm run dev
   ```

   Or for production:
   ```bash
   npm run build
   npm start
   ```

## 📋 API Endpoints Created

1. **GET `/api/reviews/all`** - Get all product reviews from database
   - No authentication required
   - Query params: `?limit=50&skip=0`

2. **GET `/api/reviews/google`** - Get Google Reviews
   - No authentication required
   - Returns empty array if API keys not configured

## 🧪 Testing the Endpoints

### Test Product Reviews:
```bash
curl http://localhost:5000/api/reviews/all
```

### Test Google Reviews:
```bash
curl http://localhost:5000/api/reviews/google
```

## ✅ Verification Checklist

- [x] `node-fetch` installed
- [x] `@types/node-fetch` installed
- [x] Google Reviews controller created
- [x] Route registered in review routes
- [x] Frontend page created
- [x] Footer link updated
- [x] Route added to App.tsx

## 🐛 Common Issues

### Issue: "Cannot find module 'node-fetch'"
**Fix:** Run `npm install` in the server directory

### Issue: TypeScript errors about node-fetch types
**Fix:** Already installed, but if persists, run:
```bash
cd server
npm install --save-dev @types/node-fetch@2
```

### Issue: Google Reviews not showing
**Fix:** This is expected if `GOOGLE_PLACES_API_KEY` and `GOOGLE_PLACE_ID` are not set. The endpoint will return an empty array gracefully.

### Issue: Product Reviews not showing
**Fix:** 
1. Check MongoDB connection
2. Verify reviews exist in database
3. Check server logs for errors

## 📝 Notes

- The Google Reviews endpoint gracefully handles missing API keys
- Product Reviews will show all reviews from your MongoDB database
- The page is accessible at `/customer-reviews`
- Footer link has been updated to point to the new page
