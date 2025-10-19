# 🛍️ **Kyna Jewels - Products API Documentation**

## 📋 **Overview**

This document provides comprehensive documentation for the Products API endpoints in the Kyna Jewels e-commerce backend. The API supports dynamic pricing, flexible image management, and comprehensive product data retrieval.

---

## 🚀 **Base URL**

```
Development: https://api.kynajewels.com/api/products
Production: https://yourdomain.com/api/products
```

---

## 📊 **API Endpoints**

### **1. Get All Products (Paginated)**

**Endpoint:** `GET /api/products`

**Description:** Retrieve paginated list of products with optional filtering

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number for pagination |
| `limit` | number | No | 20 | Number of products per page |
| `category` | string | No | - | Filter by category (rings, bracelets, pendants, etc.) |
| `diamondShape` | string | No | - | Filter by diamond shape (RD, PR, EM, etc.) |
| `metal` | string | No | - | Filter by metal type (RG, YG, WG, PT) |
| `minPrice` | number | No | - | Minimum price filter |
| `maxPrice` | number | No | - | Maximum price filter |
| `sortBy` | string | No | createdAt | Sort field (name, price, createdAt) |
| `sortOrder` | string | No | desc | Sort order (asc, desc) |

**Example Request:**
```javascript
GET /api/products?page=1&limit=10&category=rings&diamondShape=RD&metal=RG&minPrice=1000&maxPrice=5000
```

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": "Gents Ring GR1",
        "sku": "GR1",
        "category": "Gents Ring",
        "variant": "GR1",
        "mainImage": "https://yourdomain.com/images/rings/GR1-RD-70-2T-BR-RG-GP.jpg",
        "price": 25000,
        "rating": 4.5,
        "reviews": 12
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalProducts": 95,
      "hasNext": true,
      "hasPrev": false
    },
    "filters": {
      "categories": ["Gents Ring", "Engagement Ring", "Solitaire Ring"],
      "diamondShapes": ["RD", "PR", "EM", "OV"],
      "metals": ["RG", "YG", "WG", "PT"],
      "priceRange": {
        "min": 1000,
        "max": 50000
      }
    }
  },
  "message": "Products retrieved successfully"
}
```

---

### **2. Get Product Price (Dynamic)**

**Endpoint:** `GET /api/products/:id/price`

**Description:** Calculate and return dynamic price based on product attributes

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Product ID |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `diamondShape` | string | No | Diamond shape (RD, PR, EM, OV, etc.) |
| `diamondSize` | number | No | Diamond size in carats (0.25, 0.50, 0.70, 1.00, etc.) |
| `diamondColor` | string | No | Diamond color (D, E, F, G, H, I, J, K, L, M) |
| `diamondOrigin` | string | No | Diamond origin (Natural, Lab-grown) |
| `metal` | string | No | Metal type (RG, YG, WG, PT) |
| `karat` | number | No | Karat value (14, 18, 22, 24) |
| `tone` | string | No | Tone (1T, 2T, 3T) |
| `finish` | string | No | Finish (BR, PL, MR) |

**Example Request:**
```javascript
GET /api/products/64f8a1b2c3d4e5f6a7b8c9d0/price?diamondShape=RD&diamondSize=0.70&diamondColor=G&diamondOrigin=Natural&metal=RG&karat=18&tone=2T&finish=BR
```

**Response:**
```json
{
  "success": true,
  "data": {
    "productId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "price": 25000,
    "breakdown": {
      "basePrice": 20000,
      "diamondCost": 15000,
      "metalCost": 3000,
      "makingCharges": 2000,
      "gst": 4500,
      "profitMargin": 500
    },
    "bomDetails": {
      "productSku": "GR1",
      "category": "Gents Ring",
      "variant": "GR1",
      "diamondShape": "RD",
      "diamondSize": 0.70,
      "diamondColor": "G",
      "diamondOrigin": "Natural",
      "metal": "RG",
      "karat": 18,
      "tone": "2T",
      "finish": "BR",
      "netWeightGrams": 3.5,
      "metalCost": 3000,
      "diamondCost": 15000,
      "makingCharges": 2000,
      "baseCost": 20000,
      "profitMargin": 500,
      "gst": 4500,
      "finalPrice": 25000,
      "pricingBreakdown": {
        "metalPricingPerGram": 857.14,
        "diamondPricingPerCarat": 21428.57,
        "makingChargesPerGram": 571.43,
        "gstPercent": 18,
        "profitMarginPercent": 2.5
      }
    }
  },
  "message": "Price calculated successfully"
}
```

---

### **3. Get Product Images (Dynamic)**

**Endpoint:** `GET /api/products/:id/images`

**Description:** Retrieve dynamic image URLs based on product attributes

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Product ID |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `diamondShape` | string | No | Diamond shape (RD, PR, EM, OV, etc.) |
| `diamondSize` | number | No | Diamond size in carats |
| `diamondColor` | string | No | Diamond color |
| `diamondOrigin` | string | No | Diamond origin |
| `metal` | string | No | Metal type |
| `karat` | number | No | Karat value |
| `tone` | string | No | Tone |
| `finish` | string | No | Finish |
| `gemstoneType` | string | No | Gemstone type |
| `chainLength` | string | No | Chain length |

**Example Request:**
```javascript
GET /api/products/64f8a1b2c3d4e5f6a7b8c9d0/images?diamondShape=RD&diamondSize=0.70&tone=2T&metal=RG&finish=BR
```

**Response:**
```json
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
        "https://yourdomain.com/images/rings/GR1-RD-70-2T-BR-RG-DETAIL.jpg",
        "https://yourdomain.com/images/rings/GR1-RD-70-2T-BR-RG-LIFESTYLE.jpg",
        "https://yourdomain.com/images/rings/GR1-RD-70-2T-BR-RG-COMPARISON.jpg",
        "https://yourdomain.com/images/rings/GR1-RD-70-2T-BR-RG-CUSTOM.jpg",
        "https://yourdomain.com/images/rings/GR1-RD-70-2T-BR-RG-360.jpg"
      ]
    },
    "imageNamingConvention": {
      "format": "SKU-ATTRIBUTE1-ATTRIBUTE2-ATTRIBUTE3-...-VIEW",
      "description": "Dynamically concatenates SKU with any combination of product attributes",
      "examples": {
        "gentsRing": "GR1-RD-70-2T-BR-RG-GP.jpg",
        "engagementRing": "ENG1-PR-100-1T-PL-WG-GP.jpg",
        "bracelet": "BR1-RD-25-2T-PL-SL-GP.jpg",
        "pendant": "PN1-EM-40-1T-BR-PT-18-GP.jpg"
      },
      "views": {
        "main": "GP (Ground View)",
        "sub": ["SIDE", "TOP", "DETAIL", "LIFESTYLE", "COMPARISON", "CUSTOM", "360"]
      },
      "supportedAttributes": [
        "diamondShape", "diamondSize", "diamondColor", "diamondOrigin",
        "metal", "karat", "tone", "finish", "gemstoneType", "chainLength"
      ]
    }
  },
  "message": "Images retrieved successfully"
}
```

---

### **4. Get Complete Product Details**

**Endpoint:** `GET /api/products/:id`

**Description:** Retrieve complete product information including all details

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Product ID |

**Example Request:**
```javascript
GET /api/products/64f8a1b2c3d4e5f6a7b8c9d0
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "Gents Ring GR1",
    "sku": "GR1",
    "category": "Gents Ring",
    "variant": "GR1",
    "description": "Elegant gents ring with round diamond",
    "diamondShape": "RD",
    "diamondSize": 0.70,
    "diamondColor": "G",
    "diamondOrigin": "Natural",
    "tone": "2T",
    "finish": "BR",
    "metal": "RG",
    "karat": 18,
    "images": {
      "main": "https://yourdomain.com/images/rings/GR1-RD-70-2T-BR-RG-GP.jpg",
      "sub": [
        "https://yourdomain.com/images/rings/GR1-RD-70-2T-BR-RG-SIDE.jpg",
        "https://yourdomain.com/images/rings/GR1-RD-70-2T-BR-RG-TOP.jpg",
        "https://yourdomain.com/images/rings/GR1-RD-70-2T-BR-RG-DETAIL.jpg",
        "https://yourdomain.com/images/rings/GR1-RD-70-2T-BR-RG-LIFESTYLE.jpg",
        "https://yourdomain.com/images/rings/GR1-RD-70-2T-BR-RG-COMPARISON.jpg",
        "https://yourdomain.com/images/rings/GR1-RD-70-2T-BR-RG-CUSTOM.jpg",
        "https://yourdomain.com/images/rings/GR1-RD-70-2T-BR-RG-360.jpg"
      ]
    },
    "price": 25000,
    "rating": 4.5,
    "reviews": 12,
    "inStock": true,
    "stockQuantity": 5,
    "tags": ["gents", "ring", "diamond", "gold"],
    "specifications": {
      "weight": "3.5g",
      "dimensions": "8mm x 6mm",
      "warranty": "1 year",
      "certification": "BIS Hallmark"
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T14:45:00Z"
  },
  "message": "Product details retrieved successfully"
}
```

---

### **5. Search Products**

**Endpoint:** `GET /api/products/search`

**Description:** Search products by name, description, or SKU

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query |
| `category` | string | No | Filter by category |
| `page` | number | No | Page number |
| `limit` | number | No | Results per page |

**Example Request:**
```javascript
GET /api/products/search?q=ring&category=rings&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": "Gents Ring GR1",
        "sku": "GR1",
        "category": "Gents Ring",
        "mainImage": "https://yourdomain.com/images/rings/GR1-RD-70-2T-BR-RG-GP.jpg",
        "price": 25000,
        "rating": 4.5
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalProducts": 15,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "message": "Search completed successfully"
}
```

---

### **6. Get Product Filters**

**Endpoint:** `GET /api/products/filters`

**Description:** Get available filter options for products

**Example Request:**
```javascript
GET /api/products/filters
```

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      { "value": "rings", "label": "Rings", "count": 45 },
      { "value": "bracelets", "label": "Bracelets", "count": 20 },
      { "value": "pendants", "label": "Pendants", "count": 15 },
      { "value": "earrings", "label": "Earrings", "count": 30 }
    ],
    "diamondShapes": [
      { "value": "RD", "label": "Round", "count": 25 },
      { "value": "PR", "label": "Princess", "count": 15 },
      { "value": "EM", "label": "Emerald", "count": 10 },
      { "value": "OV", "label": "Oval", "count": 8 }
    ],
    "metals": [
      { "value": "RG", "label": "Rose Gold", "count": 30 },
      { "value": "YG", "label": "Yellow Gold", "count": 25 },
      { "value": "WG", "label": "White Gold", "count": 20 },
      { "value": "PT", "label": "Platinum", "count": 15 }
    ],
    "priceRanges": [
      { "min": 0, "max": 10000, "label": "Under ₹10,000", "count": 20 },
      { "min": 10000, "max": 25000, "label": "₹10,000 - ₹25,000", "count": 35 },
      { "min": 25000, "max": 50000, "label": "₹25,000 - ₹50,000", "count": 25 },
      { "min": 50000, "max": 100000, "label": "₹50,000 - ₹1,00,000", "count": 15 }
    ]
  },
  "message": "Filters retrieved successfully"
}
```

---

### **7. Get Product BOM Details**

**Endpoint:** `GET /api/products/:id/bom`

**Description:** Get detailed Bill of Materials (BOM) information for a product

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Product ID |

**Query Parameters:** Same as price endpoint

**Example Request:**
```javascript
GET /api/products/64f8a1b2c3d4e5f6a7b8c9d0/bom?diamondShape=RD&diamondSize=0.70&metal=RG&karat=18
```

**Response:**
```json
{
  "success": true,
  "data": {
    "productId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "bomDetails": {
      "productSku": "GR1",
      "category": "Gents Ring",
      "variant": "GR1",
      "diamondShape": "RD",
      "diamondSize": 0.70,
      "diamondColor": "G",
      "diamondOrigin": "Natural",
      "metal": "RG",
      "karat": 18,
      "tone": "2T",
      "finish": "BR",
      "netWeightGrams": 3.5,
      "metalCost": 3000,
      "diamondCost": 15000,
      "makingCharges": 2000,
      "baseCost": 20000,
      "profitMargin": 500,
      "gst": 4500,
      "finalPrice": 25000,
      "pricingBreakdown": {
        "metalPricingPerGram": 857.14,
        "diamondPricingPerCarat": 21428.57,
        "makingChargesPerGram": 571.43,
        "gstPercent": 18,
        "profitMarginPercent": 2.5
      }
    }
  },
  "message": "BOM details retrieved successfully"
}
```

---

## 🖼️ **Image Management System**

### **Image Naming Convention**

The system uses a flexible, dynamic naming convention for images:

**Format:** `SKU-ATTRIBUTE1-ATTRIBUTE2-ATTRIBUTE3-...-VIEW`

**Examples:**
- Gents Ring: `GR1-RD-70-2T-BR-RG-GP.jpg`
- Engagement Ring: `ENG1-PR-100-1T-PL-WG-GP.jpg`
- Bracelet: `BR1-RD-25-2T-PL-SL-GP.jpg`
- Pendant: `PN1-EM-40-1T-BR-PT-18-GP.jpg`

### **Image Views**

- **GP (Ground View)**: Main product image
- **SIDE**: Side view
- **TOP**: Top view
- **DETAIL**: Detail/close-up view
- **LIFESTYLE**: Lifestyle/wearing view
- **COMPARISON**: Comparison view
- **CUSTOM**: Custom angle view
- **360**: 360-degree view

### **Image Storage Structure**

```
Hostinger VPS:
/var/www/html/yourdomain.com/public/images/
├── rings/
│   ├── GR1-RD-70-2T-BR-RG-GP.jpg
│   ├── GR1-RD-70-2T-BR-RG-SIDE.jpg
│   └── ...
├── bracelets/
│   ├── BR1-RD-25-2T-PL-SL-GP.jpg
│   └── ...
├── pendants/
│   ├── PN1-EM-40-1T-BR-PT-18-GP.jpg
│   └── ...
└── earrings/
    ├── ER1-MAR-60-2T-PL-RG-HOOP-GP.jpg
    └── ...
```

---

## 💰 **Dynamic Pricing System**

### **Pricing Factors**

1. **Metal Cost**: Based on karat and weight
2. **Diamond Cost**: Based on shape, size, color, and origin
3. **Making Charges**: Based on complexity and weight
4. **GST**: 18% on total cost
5. **Profit Margin**: 2.5% on base cost

### **Price Calculation Formula**

```
Base Cost = Metal Cost + Diamond Cost + Making Charges
Final Price = Base Cost + (Base Cost × Profit Margin %) + GST
```

---

## 🔧 **Error Handling**

### **Common Error Responses**

```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product not found",
    "details": "No product found with the given ID"
  }
}
```

### **Error Codes**

| Code | Description |
|------|-------------|
| `PRODUCT_NOT_FOUND` | Product with given ID not found |
| `INVALID_PARAMETERS` | Invalid query parameters |
| `PRICING_ERROR` | Error calculating price |
| `IMAGE_ERROR` | Error generating image URLs |
| `VALIDATION_ERROR` | Input validation failed |

---

## 📱 **Frontend Integration Examples**

### **React/JavaScript Example**

```javascript
// Get products with filters
const getProducts = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const response = await fetch(`/api/products?${params}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
  }
};

// Get product price with attributes
const getProductPrice = async (productId, attributes) => {
  try {
    const params = new URLSearchParams(attributes);
    const response = await fetch(`/api/products/${productId}/price?${params}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching price:', error);
  }
};

// Get product images with attributes
const getProductImages = async (productId, attributes) => {
  try {
    const params = new URLSearchParams(attributes);
    const response = await fetch(`/api/products/${productId}/images?${params}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching images:', error);
  }
};

// Usage example
const loadProduct = async () => {
  const productId = '64f8a1b2c3d4e5f6a7b8c9d0';
  const attributes = {
    diamondShape: 'RD',
    diamondSize: 0.70,
    tone: '2T',
    metal: 'RG',
    finish: 'BR'
  };

  // Get product details
  const product = await getProduct(productId);
  
  // Get dynamic price
  const priceData = await getProductPrice(productId, attributes);
  
  // Get dynamic images
  const imageData = await getProductImages(productId, attributes);
  
  // Update UI
  updateProductUI(product, priceData, imageData);
};
```

---

## 🚀 **Performance Considerations**

### **Caching**
- Images are cached by browsers
- API responses can be cached
- Use CDN for image delivery

### **Optimization**
- Pagination for large datasets
- Lazy loading for images
- Compressed image formats (WebP, JPEG)

### **Rate Limiting**
- API calls are rate limited
- Implement retry logic with exponential backoff

---

## 📝 **Notes for Frontend Team**

1. **Image URLs**: All image URLs point to Hostinger VPS server
2. **Dynamic Attributes**: Images and prices change based on selected attributes
3. **Error Handling**: Always handle API errors gracefully
4. **Loading States**: Show loading indicators during API calls
5. **Validation**: Validate user inputs before making API calls
6. **Caching**: Implement proper caching for better performance

---

## 🔗 **Related Documentation**

- [BOM Integration Documentation](./BOM_INTEGRATION_DOCUMENTATION.md)
- [API Endpoints Documentation](./API_ENDPOINTS.md)
- [Flexible Naming Summary](./FLEXIBLE_NAMING_SUMMARY.md)

---

**Last Updated:** January 2024  
**Version:** 1.0.0  
**Maintained by:** Kyna Jewels Development Team
