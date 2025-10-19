# 🖼️ **Image Storage Strategy - Kyna Jewels**

## 📋 **Overview**

Your image storage strategy is **perfectly configured** for your hosting setup:

- **Product Images**: Hostinger VPS (yourdomain.com/images/)
- **User Uploads**: Cloudinary (reviews, rings, engraving)

---

## 🏪 **Product Images (Hostinger VPS)**

### **Purpose**
- Pre-existing product catalog images
- Generated dynamically based on SKU + attributes
- Served directly from your Hostinger VPS

### **Configuration**
```typescript
// In ImageService
baseUrl: process.env.IMAGE_BASE_URL || 'https://kyna-jewels.com/images'
basePath: process.env.IMAGE_BASE_PATH || '/var/www/html/kyna-jewels.com/public/images'
```

### **URL Structure**
```
https://yourdomain.com/images/{category}/{identifier}-{view}.jpg

Examples:
- https://yourdomain.com/images/rings/GR1-RD-70-2T-BR-RG-GP.jpg
- https://yourdomain.com/images/bracelets/BR1-RD-25-2T-PL-SL-GP.jpg
- https://yourdomain.com/images/earrings/ER1-MAR-60-2T-PL-RG-HOOP-GP.jpg
```

### **Dynamic Generation**
- **SKU-based**: `GR1`, `ENG1`, `BR1`, etc.
- **Attribute-based**: Diamond shape, size, metal, tone, finish
- **View-based**: GP, SIDE, TOP, DETAIL, LIFESTYLE, COMPARISON, CUSTOM, 360

### **API Endpoints**
- `GET /api/products/:id/images` - Get product images
- `GET /api/products` - Product listing with main images
- `GET /api/products/:id` - Complete product details with images

---

## ☁️ **User Uploads (Cloudinary)**

### **1. Reviews**
- **Folder**: `kyna-jewels/reviews`
- **Endpoint**: `POST /api/reviews`
- **Purpose**: Customer review images
- **Limit**: 4 images per review, 5MB each

### **2. Rings (Upload Your Own)**
- **Folder**: `kyna-jewels/rings-upload`
- **Endpoint**: `POST /api/rings/upload`
- **Purpose**: Custom ring design uploads
- **Limit**: 10 images per upload, 5MB each

### **3. Engraving**
- **Folder**: `kyna-jewels/uploads`
- **Endpoint**: `POST /api/engraving/upload`
- **Purpose**: Engraved jewelry images
- **Limit**: Single image, 5MB

### **Cloudinary Configuration**
```typescript
// All uploads use Cloudinary with optimization
transformation: [
  { width: 800, height: 600, crop: 'limit', quality: 'auto' }
]
```

---

## 🔧 **Environment Variables**

### **Hostinger VPS (Product Images)**
```bash
IMAGE_BASE_URL=https://yourdomain.com/images
IMAGE_BASE_PATH=/var/www/html/yourdomain.com/public/images
```

### **Cloudinary (User Uploads)**
```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 📁 **File Structure on Hostinger VPS**

```
/var/www/html/yourdomain.com/public/images/
├── rings/
│   ├── GR1-RD-70-2T-BR-RG-GP.jpg
│   ├── GR1-RD-70-2T-BR-RG-SIDE.jpg
│   ├── ENG1-PR-100-1T-PL-WG-GP.jpg
│   └── ...
├── bracelets/
│   ├── BR1-RD-25-2T-PL-SL-GP.jpg
│   └── ...
├── pendants/
│   ├── PN1-EM-40-1T-BR-PT-18-GP.jpg
│   └── ...
├── earrings/
│   ├── ER1-MAR-60-2T-PL-RG-HOOP-GP.jpg
│   └── ...
└── default/
    └── product-placeholder.jpg
```

---

## 🚀 **API Usage Examples**

### **Get Product Images**
```javascript
// Request
GET /api/products/64f8a1b2c3d4e5f6a7b8c9d0/images?diamondShape=RD&diamondSize=0.70&tone=2T&metal=RG&finish=BR

// Response
{
  "success": true,
  "data": {
    "productId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "productSku": "GR1",
    "images": {
      "main": "https://yourdomain.com/images/rings/GR1-RD-70-2T-BR-RG-GP.jpg",
      "sub": [
        "https://yourdomain.com/images/rings/GR1-RD-70-2T-BR-RG-SIDE.jpg",
        "https://yourdomain.com/images/rings/GR1-RD-70-2T-BR-RG-TOP.jpg",
        // ... 5 more views
      ]
    }
  }
}
```

### **Upload Review Images**
```javascript
// Request
POST /api/reviews
Content-Type: multipart/form-data

// Files go to Cloudinary: kyna-jewels/reviews/
// Response includes Cloudinary URLs
```

### **Upload Ring Images**
```javascript
// Request
POST /api/rings/upload
Content-Type: multipart/form-data

// Files go to Cloudinary: kyna-jewels/rings-upload/
// Response includes Cloudinary URLs
```

---

## ✅ **Benefits of This Setup**

### **Product Images (Hostinger VPS)**
- ✅ **Fast Loading**: Direct from your VPS
- ✅ **Cost Effective**: No cloud storage costs
- ✅ **Full Control**: You manage the images
- ✅ **SEO Friendly**: Direct URLs for search engines
- ✅ **CDN Ready**: Can add CDN later if needed

### **User Uploads (Cloudinary)**
- ✅ **Automatic Optimization**: Images compressed and resized
- ✅ **CDN Delivery**: Fast global delivery
- ✅ **Scalable**: Handles any number of uploads
- ✅ **Reliable**: 99.9% uptime guarantee
- ✅ **Secure**: Automatic virus scanning

---

## 🔄 **Image Flow Summary**

```
1. Product Catalog Images
   Frontend → API → Hostinger VPS → Frontend
   
2. User Upload Images
   Frontend → API → Cloudinary → Frontend
   
3. Dynamic Product Images
   Frontend → API → Generate URLs → Hostinger VPS → Frontend
```

---

## 🎯 **Perfect for Your Hosting Setup**

- **Backend**: Vercel (serverless)
- **Product Images**: Hostinger VPS (your domain)
- **User Uploads**: Cloudinary (cloud storage)
- **Database**: MongoDB Atlas
- **Frontend**: Any hosting (Vercel, Netlify, etc.)

This setup gives you the best of both worlds:
- **Control** over your product images
- **Scalability** for user uploads
- **Performance** with optimized delivery
- **Cost efficiency** with strategic storage placement

---

**Status**: ✅ **PERFECTLY CONFIGURED**  
**No Changes Needed**: Your setup is optimal!  
**Last Updated**: January 2024
