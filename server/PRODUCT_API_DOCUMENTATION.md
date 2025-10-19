# Kyna Jewels - Enhanced Product API Documentation

## Overview
This document describes the enhanced Product API endpoints for the Kyna Jewels e-commerce platform. The API supports dynamic pricing, image management, and advanced filtering based on jewelry attributes.

## Base URL
```
https://api.kynajewels.com/api/products
```

## Authentication
All endpoints are currently public. Authentication can be added as needed.

## Environment Variables Required
```env
IMAGE_BASE_URL=https://kyna-jewels.com/images
IMAGE_BASE_PATH=/var/www/html/kyna-jewels.com/public/images
```

---

## API Endpoints

### 1. Get Products (Paginated with Filters)
**GET** `/api/products`

Returns paginated products with lightweight data for listing pages.

#### Query Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `page` | number | No | Page number (default: 1) | `1` |
| `limit` | number | No | Items per page (default: 20, max: 100) | `20` |
| `category` | string | No | Product category | `"Gents Ring"` |
| `diamondShape` | string | No | Diamond shape | `"RD"` |
| `metal` | string | No | Metal type | `"RG"` |
| `minPrice` | number | No | Minimum price filter | `10000` |
| `maxPrice` | number | No | Maximum price filter | `50000` |
| `diamondSize` | number | No | Diamond size in carats | `0.70` |
| `karat` | number | No | Metal karat | `18` |
| `diamondOrigin` | string | No | Diamond origin | `"Natural Diamond"` |
| `tone` | string | No | Metal tone | `"2T"` |
| `finish` | string | No | Metal finish | `"BR"` |

#### Example Request
```bash
GET /api/products?category=Gents Ring&diamondShape=RD&metal=RG&minPrice=10000&maxPrice=50000&page=1&limit=20
```

#### Response
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": "18Kt Gold 70 cent Lab Grown Diamond Round Cut Ring",
        "sku": "GR1-RD-70-2T-BR-RG",
        "category": "Gents Ring",
        "mainImage": "https://kyna-jewels.com/images/rings/GR1-RD-70-2T-BR-RG-GP.jpg",
        "price": 45000
      }
    ],
    "pagination": {
      "totalProducts": 150,
      "totalPages": 8,
      "currentPage": 1,
      "limit": 20
    }
  }
}
```

---

### 2. Get Product Price (Dynamic Calculation)
**GET** `/api/products/:id/price`

Returns calculated price for a product with optional attribute overrides.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Product ID (MongoDB ObjectId) |

#### Query Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `diamondSize` | number | No | Override diamond size | `1.00` |
| `metal` | string | No | Override metal type | `"WG"` |
| `karat` | number | No | Override karat | `22` |
| `diamondOrigin` | string | No | Override diamond origin | `"Lab Grown Diamond"` |
| `diamondShape` | string | No | Override diamond shape | `"PR"` |
| `diamondColor` | string | No | Override diamond color | `"F"` |

#### Example Request
```bash
GET /api/products/64f8a1b2c3d4e5f6a7b8c9d0/price?diamondSize=1.00&metal=WG&karat=22
```

#### Response
```json
{
  "success": true,
  "data": {
    "productId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "price": 52000,
    "breakdown": {
      "metalCost": 15000,
      "diamondCost": 30000,
      "makingCharges": 2500,
      "baseCost": 47500,
      "profitMargin": 11875,
      "gst": 1781,
      "finalPrice": 52000
    }
  }
}
```

---

### 3. Get Product Images
**GET** `/api/products/:id/images`

Returns image URLs for a product with optional attribute-based variations.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Product ID (MongoDB ObjectId) |

#### Query Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `diamondShape` | string | No | Override diamond shape | `"PR"` |
| `size` | number | No | Override diamond size | `1.00` |
| `tone` | string | No | Override metal tone | `"2T"` |
| `metal` | string | No | Override metal type | `"WG"` |
| `origin` | string | No | Override diamond origin | `"Natural"` |
| `diamondColor` | string | No | Override diamond color | `"F"` |
| `finish` | string | No | Override metal finish | `"BR"` |

#### Example Request
```bash
GET /api/products/64f8a1b2c3d4e5f6a7b8c9d0/images?diamondShape=PR&metal=WG&size=1.00
```

#### Response
```json
{
  "success": true,
  "data": {
    "productId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "images": {
      "main": "https://kyna-jewels.com/images/rings/GR1-PR-100-2T-BR-WG-GP.jpg",
      "sub": [
        "https://kyna-jewels.com/images/rings/GR1-PR-100-2T-BR-WG-SIDE.jpg",
        "https://kyna-jewels.com/images/rings/GR1-PR-100-2T-BR-WG-TOP.jpg",
        "https://kyna-jewels.com/images/rings/GR1-PR-100-2T-BR-WG-DETAIL.jpg",
        "https://kyna-jewels.com/images/rings/GR1-PR-100-2T-BR-WG-LIFESTYLE.jpg",
        "https://kyna-jewels.com/images/rings/GR1-PR-100-2T-BR-WG-COMPARISON.jpg",
        "https://kyna-jewels.com/images/rings/GR1-PR-100-2T-BR-WG-CUSTOM.jpg",
        "https://kyna-jewels.com/images/rings/GR1-PR-100-2T-BR-WG-360.jpg"
      ]
    }
  }
}
```

---

### 4. Get Product Details
**GET** `/api/products/:id`

Returns complete product details including metadata, dynamic price, and image URLs.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Product ID (MongoDB ObjectId) |

#### Example Request
```bash
GET /api/products/64f8a1b2c3d4e5f6a7b8c9d0
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "sku": "GR1-RD-70-2T-BR-RG",
    "variant": "GR1",
    "title": "18Kt Gold 70 cent Lab Grown Diamond Round Cut Ring",
    "description": "Elegant round cut diamond ring with two-tone finish...",
    "category": "Gents Ring",
    "subCategory": "Ring",
    "price": 45000,
    "diamondShape": "RD",
    "diamondSize": 0.70,
    "diamondColor": "G",
    "diamondOrigin": ["Lab Grown Diamond"],
    "tone": "2T",
    "finish": "BR",
    "metal": "RG",
    "karat": 18,
    "images": {
      "main": "https://kyna-jewels.com/images/rings/GR1-RD-70-2T-BR-RG-GP.jpg",
      "sub": [
        "https://kyna-jewels.com/images/rings/GR1-RD-70-2T-BR-RG-SIDE.jpg",
        "https://kyna-jewels.com/images/rings/GR1-RD-70-2T-BR-RG-TOP.jpg",
        "https://kyna-jewels.com/images/rings/GR1-RD-70-2T-BR-RG-DETAIL.jpg",
        "https://kyna-jewels.com/images/rings/GR1-RD-70-2T-BR-RG-LIFESTYLE.jpg",
        "https://kyna-jewels.com/images/rings/GR1-RD-70-2T-BR-RG-COMPARISON.jpg",
        "https://kyna-jewels.com/images/rings/GR1-RD-70-2T-BR-RG-CUSTOM.jpg",
        "https://kyna-jewels.com/images/rings/GR1-RD-70-2T-BR-RG-360.jpg"
      ]
    },
    "rating": {
      "score": 4.5,
      "reviews": 25
    },
    "isGiftingAvailable": true,
    "isEngraving": true,
    "createdAt": "2023-09-01T10:00:00.000Z",
    "updatedAt": "2023-09-01T10:00:00.000Z"
  }
}
```

---

### 5. Search Products
**GET** `/api/products/search`

Search products by query string with optional filters.

#### Query Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `q` | string | Yes | Search query | `"diamond ring"` |
| `page` | number | No | Page number (default: 1) | `1` |
| `limit` | number | No | Items per page (default: 20) | `20` |
| `category` | string | No | Filter by category | `"Gents Ring"` |
| `diamondShape` | string | No | Filter by diamond shape | `"RD"` |
| `metal` | string | No | Filter by metal | `"RG"` |
| `minPrice` | number | No | Minimum price | `10000` |
| `maxPrice` | number | No | Maximum price | `50000` |

#### Example Request
```bash
GET /api/products/search?q=diamond ring&category=Gents Ring&minPrice=10000&maxPrice=50000
```

#### Response
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": "18Kt Gold 70 cent Lab Grown Diamond Round Cut Ring",
        "sku": "GR1-RD-70-2T-BR-RG",
        "category": "Gents Ring",
        "mainImage": "https://kyna-jewels.com/images/rings/GR1-RD-70-2T-BR-RG-GP.jpg",
        "price": 45000
      }
    ],
    "pagination": {
      "totalProducts": 25,
      "totalPages": 2,
      "currentPage": 1,
      "limit": 20
    }
  }
}
```

---

### 6. Get Product Filters
**GET** `/api/products/filters`

Returns available filter options for products.

#### Example Request
```bash
GET /api/products/filters
```

#### Response
```json
{
  "success": true,
  "data": {
    "diamondShapes": ["RD", "PR", "EM", "OV", "CUS"],
    "metals": ["RG", "YG", "WG", "PT"],
    "karats": [14, 18, 22],
    "diamondOrigins": ["Natural Diamond", "Lab Grown Diamond"],
    "tones": ["2T", "3T"],
    "finishes": ["BR", "PL", "RH"]
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "diamondSize",
      "message": "\"diamondSize\" must be a number"
    }
  ]
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Product not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to fetch products",
  "error": "Database connection error"
}
```

---

## Image URL Structure

Images are stored on Hostinger VPS and follow this naming convention:

```
https://kyna-jewels.com/images/{category}/{SKU}-{diamondShape}-{size}-{color}-{origin}-{tone}-{finish}-{metal}-{viewType}.jpg
```

### Example Image URLs:
- Main (GP): `GR1-RD-70-2T-BR-RG-GP.jpg`
- Side: `GR1-RD-70-2T-BR-RG-SIDE.jpg`
- Top: `GR1-RD-70-2T-BR-RG-TOP.jpg`
- Detail: `GR1-RD-70-2T-BR-RG-DETAIL.jpg`
- Lifestyle: `GR1-RD-70-2T-BR-RG-LIFESTYLE.jpg`
- Comparison: `GR1-RD-70-2T-BR-RG-COMPARISON.jpg`
- Custom: `GR1-RD-70-2T-BR-RG-CUSTOM.jpg`
- 360°: `GR1-RD-70-2T-BR-RG-360.jpg`

---

## Pricing Logic

The pricing service calculates dynamic prices based on:

1. **Metal Cost**: `metalPricePerGram × weight × karatMultiplier`
2. **Diamond Cost**: `diamondPricePerCarat × caratWeight × originMultiplier × colorMultiplier × shapeMultiplier`
3. **Making Charges**: `makingChargesPerGram × weight`
4. **Profit Margin**: `baseCost × profitMarginPercentage`
5. **GST**: `(baseCost + profitMargin) × gstPercentage`

### Price Factors:
- **Metal Types**: Gold (14kt, 18kt, 22kt), Silver (925), Platinum (950)
- **Diamond Origins**: Natural Diamond, Lab Grown Diamond
- **Diamond Colors**: D, E, F, G, H, I, J, K
- **Diamond Shapes**: RD, PR, EM, OV, CUS, PEAR, MARQUISE, HEART
- **Metal Tones**: 2T (Two-tone), 3T (Three-tone)
- **Metal Finishes**: BR (Black Rhodium), PL (Platinum), RH (Rose Gold)

---

## Database Schema

### Enhanced Product Schema
```typescript
interface IProduct {
  sku: string;                    // "GR1-RD-70-2T-BR-RG"
  variant: string;                // "GR1"
  title: string;
  description?: string;
  category: string;               // "Gents Ring", "Solitaire", "Engagement Ring"
  subCategory: 'Ring' | 'Bracelet' | 'Pendant' | 'Earring';
  price: number;                  // Dynamic price (calculated)
  
  // Diamond Details
  diamondShape?: string;          // "RD", "PR", "EM", etc.
  diamondSize?: number;           // Numeric value for carats
  diamondColor?: string;          // Diamond color grade
  diamondOrigin?: string[];       // ["Natural Diamond", "Lab Grown Diamond"]
  
  // Metal Details
  tone?: string;                  // "2T", "3T"
  finish?: string;                // "BR", "PL", "RH"
  metal?: string;                 // "RG", "YG", "WG", "PT"
  karat?: number;                 // 14, 18, 22
  
  // Images
  images?: {
    main: string;                 // Main image URL
    sub: string[];                // Array of 7 sub image URLs
  };
  
  // Other fields...
  rating?: { score: number; reviews: number };
  isGiftingAvailable?: boolean;
  isEngraving?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Testing

### Test the API endpoints:

1. **Get Products**: `GET /api/products?category=Gents Ring&page=1&limit=10`
2. **Get Product Price**: `GET /api/products/{id}/price?diamondSize=1.00&metal=WG`
3. **Get Product Images**: `GET /api/products/{id}/images?diamondShape=PR&metal=WG`
4. **Get Product Details**: `GET /api/products/{id}`
5. **Search Products**: `GET /api/products/search?q=diamond ring&category=Gents Ring`
6. **Get Filters**: `GET /api/products/filters`

### Sample cURL Commands:

```bash
# Get products with filters
curl "https://api.kynajewels.com/api/products?category=Gents Ring&diamondShape=RD&metal=RG&minPrice=10000&maxPrice=50000"

# Get product price with overrides
curl "https://api.kynajewels.com/api/products/64f8a1b2c3d4e5f6a7b8c9d0/price?diamondSize=1.00&metal=WG&karat=22"

# Get product images
curl "https://api.kynajewels.com/api/products/64f8a1b2c3d4e5f6a7b8c9d0/images?diamondShape=PR&metal=WG"

# Search products
curl "https://api.kynajewels.com/api/products/search?q=diamond ring&category=Gents Ring"

# Get available filters
curl "https://api.kynajewels.com/api/products/filters"
```

---

## Notes

1. **Image Management**: Images are stored on Hostinger VPS and served as static files
2. **Dynamic Pricing**: Prices are calculated in real-time based on current market rates
3. **Validation**: All query parameters are validated using Joi schemas
4. **Pagination**: All listing endpoints support pagination with configurable limits
5. **Filtering**: Advanced filtering is supported across multiple product attributes
6. **Search**: Full-text search across product titles, descriptions, SKUs, and categories
7. **Error Handling**: Comprehensive error handling with detailed error messages
8. **Performance**: Optimized with MongoDB indexes for fast querying

This enhanced Product API provides a robust foundation for the Kyna Jewels e-commerce platform with dynamic pricing, image management, and advanced filtering capabilities.
