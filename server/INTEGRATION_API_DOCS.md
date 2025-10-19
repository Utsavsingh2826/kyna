# Integration API Documentation

This document describes the newly integrated APIs from the customer review and gifting filter modules.

## 🆕 New API Endpoints

### Customer Reviews API

#### 1. Add Review
- **POST** `/api/reviews`
- **Authentication**: Required
- **Description**: Add a review for a product with optional images
- **Request Body**:
  ```json
  {
    "productId": "string",
    "rating": "number (1-5)",
    "comment": "string"
  }
  ```
- **Request Files**: `images` (multipart/form-data, max 4 files, 5MB each)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "string",
      "user": {
        "firstName": "string",
        "lastName": "string",
        "email": "string"
      },
      "product": "string",
      "rating": "number",
      "comment": "string",
      "images": ["string"],
      "likes": ["string"],
      "replies": [],
      "createdAt": "date"
    }
  }
  ```

#### 2. Get Product Reviews
- **GET** `/api/reviews/product/:productId`
- **Authentication**: Not required
- **Description**: Get all reviews for a specific product
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "string",
        "user": {
          "firstName": "string",
          "lastName": "string",
          "email": "string"
        },
        "product": "string",
        "rating": "number",
        "comment": "string",
        "images": ["string"],
        "likes": ["string"],
        "replies": [
          {
            "user": {
              "firstName": "string",
              "lastName": "string",
              "email": "string"
            },
            "text": "string",
            "createdAt": "date"
          }
        ],
        "createdAt": "date"
      }
    ]
  }
  ```

#### 3. Toggle Like
- **PUT** `/api/reviews/:id/like`
- **Authentication**: Required
- **Description**: Like or unlike a review
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "liked": "boolean",
      "likesCount": "number",
      "review": "object"
    }
  }
  ```

#### 4. Add Reply
- **POST** `/api/reviews/:id/replies`
- **Authentication**: Required
- **Description**: Add a reply to a review
- **Request Body**:
  ```json
  {
    "text": "string"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": "review object with replies"
  }
  ```

### Gifting Products API

#### 1. Get Gifting Products
- **GET** `/api/gifting`
- **Authentication**: Not required
- **Description**: Get products available for gifting with price filtering
- **Query Parameters**:
  - `minPrice` (optional): Minimum price (default: 0)
  - `maxPrice` (optional): Maximum price (default: 500000)
- **Response**:
  ```json
  {
    "success": true,
    "count": "number",
    "data": [
      {
        "id": "string",
        "name": "string",
        "price": "number",
        "rating": "object",
        "image": "string",
        "category": "string",
        "subCategory": "string"
      }
    ]
  }
  ```

## 🔧 Database Changes

### New Collections

#### Reviews Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  product: ObjectId (ref: Product),
  rating: Number (1-5),
  comment: String,
  images: [String],
  likes: [ObjectId (ref: User)],
  replies: [{
    user: ObjectId (ref: User),
    text: String,
    createdAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Updated Collections

#### Products Collection
Added field:
- `isGiftingAvailable`: Boolean (default: false, indexed)

## 📁 File Structure

### New Files Added
```
server/src/
├── models/
│   └── reviewModel.ts          # Review model with replies
├── controllers/
│   ├── reviewController.ts     # Review CRUD operations
│   └── giftingController.ts    # Gifting product filtering
├── routes/
│   ├── review.ts              # Review routes with image upload
│   └── gifting.ts             # Gifting routes
└── uploads/                   # Directory for review images
```

### Updated Files
```
server/
├── package.json               # Added multer, cookie-parser dependencies
├── src/
│   ├── app.ts                 # Added new routes and middleware
│   └── models/
│       └── productModel.ts    # Added isGiftingAvailable field
```

## 🚀 Usage Examples

### Frontend Integration

#### Adding a Review
```javascript
const formData = new FormData();
formData.append('productId', 'product123');
formData.append('rating', '5');
formData.append('comment', 'Amazing product!');
formData.append('images', fileInput.files[0]);

fetch('/api/reviews', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

#### Getting Gifting Products
```javascript
fetch('/api/gifting?minPrice=1000&maxPrice=50000')
  .then(res => res.json())
  .then(data => console.log(data.data));
```

#### Liking a Review
```javascript
fetch(`/api/reviews/${reviewId}/like`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## 🔒 Security Features

- **Authentication**: All review operations require valid JWT token
- **File Upload**: Image uploads limited to 5MB per file, max 4 files
- **File Validation**: Only image files (jpeg, jpg, png, gif) allowed
- **Input Validation**: Rating must be 1-5, required fields validated

## 📊 Performance Optimizations

- **Database Indexes**: Added compound indexes for efficient querying
- **Image Storage**: Files stored with unique names to prevent conflicts
- **Pagination**: Reviews sorted by creation date (newest first)
- **Selective Fields**: Only necessary fields returned in responses

## 🧪 Testing

### Test the Integration

1. **Start the server**:
   ```bash
   cd server
   npm install
   npm run dev
   ```

2. **Test Review API**:
   ```bash
   # Get reviews for a product
   curl https://api.kynajewels.com/api/reviews/product/PRODUCT_ID
   
   # Add a review (requires authentication)
   curl -X POST https://api.kynajewels.com/api/reviews \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "productId=PRODUCT_ID" \
     -F "rating=5" \
     -F "comment=Great product!" \
     -F "images=@image.jpg"
   ```

3. **Test Gifting API**:
   ```bash
   # Get all gifting products
   curl https://api.kynajewels.com/api/gifting
   
   # Get products in price range
   curl "https://api.kynajewels.com/api/gifting?minPrice=1000&maxPrice=10000"
   ```

## 🔄 Migration Notes

### For Existing Products
- All existing products will have `isGiftingAvailable: false` by default
- Update products to enable gifting: `db.products.updateMany({}, {$set: {isGiftingAvailable: true}})`

### For Frontend Integration
- Update API calls to use new endpoints
- Add image upload functionality for reviews
- Implement gifting product filtering UI

## 🐛 Troubleshooting

### Common Issues

1. **Image Upload Fails**
   - Check file size (max 5MB)
   - Verify file type (images only)
   - Ensure uploads directory exists

2. **Authentication Errors**
   - Verify JWT token is valid
   - Check Authorization header format

3. **Database Errors**
   - Ensure MongoDB is running
   - Check collection indexes

### Error Responses

All endpoints return consistent error format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## 📈 Monitoring

### Key Metrics to Track
- Review creation rate
- Image upload success rate
- Gifting product search frequency
- Average review rating trends

### Database Queries for Analytics
```javascript
// Most reviewed products
db.reviews.aggregate([
  { $group: { _id: "$product", count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 10 }
]);

// Average rating by product
db.reviews.aggregate([
  { $group: { _id: "$product", avgRating: { $avg: "$rating" } } }
]);
```

This integration provides a complete review system and gifting product filtering functionality while maintaining the existing codebase structure and following the established patterns.
