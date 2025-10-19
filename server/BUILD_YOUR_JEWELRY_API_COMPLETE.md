# Build Your Jewelry API - Complete Documentation

## Overview
The Build Your Jewelry API provides comprehensive functionality for customers to customize and build their own jewelry pieces. This includes product variant selection, customization options, pricing calculations, and special handling for gents rings with/without diamonds.

## Base URL
```
https://api.kynajewels.com/api/build-your-jewelry
```

## Authentication
Most endpoints are public and don't require authentication. However, some admin endpoints may require authentication in production.

---

## 🎯 **API Endpoints & Frontend Data**

### 1. **Get All Jewelry Categories**
**GET** `/categories`

**Purpose:** Get all available jewelry categories with their variant counts and basic variant information.

**Frontend Data Received:**
```json
{
  "success": true,
  "message": "Jewelry categories fetched successfully",
  "data": [
    {
      "category": "ENGAGEMENT RINGS",
      "count": 250,
      "variants": [
        {
          "variantId": "ENG1",
          "stylingName": "NATURE INSPIRED",
          "mainImage": "https://your-cdn.com/images/ENG1/main.jpg",
          "basePrice": 25000,
          "viewType": "NBV"
        },
        {
          "variantId": "ENG2",
          "stylingName": "CLASSIC",
          "mainImage": "https://your-cdn.com/images/ENG2/main.jpg",
          "basePrice": 30000,
          "viewType": "NBV"
        }
      ]
    },
    {
      "category": "GENTS RINGS",
      "count": 25,
      "variants": [
        {
          "variantId": "GR1",
          "stylingName": "CLASSIC",
          "mainImage": "https://your-cdn.com/images/GR1/main.jpg",
          "basePrice": 35000,
          "viewType": "BV"
        }
      ]
    }
  ]
}
```

**Frontend Usage:** Display category cards with variant counts and sample images.

---

### 2. **Get Product Variants by Category**
**GET** `/categories/:category`

**Purpose:** Get all variants for a specific category with detailed information.

**Parameters:**
- `category` (string, required): The jewelry category (e.g., "ENGAGEMENT RINGS", "GENTS RINGS")
- `withDiamond` (boolean, optional): For gents rings, filter by diamond presence

**Example URLs:**
```
GET /api/build-your-jewelry/categories/ENGAGEMENT%20RINGS
GET /api/build-your-jewelry/categories/GENTS%20RINGS?withDiamond=true
GET /api/build-your-jewelry/categories/GENTS%20RINGS?withDiamond=false
```

**Frontend Data Received:**
```json
{
  "success": true,
  "message": "Product variants for ENGAGEMENT RINGS fetched successfully",
  "data": {
    "category": "ENGAGEMENT RINGS",
    "count": 250,
    "variants": [
      {
        "variantId": "ENG1",
        "stylingName": "NATURE INSPIRED",
        "mainImage": "https://your-cdn.com/images/ENG1/main.jpg",
        "thumbnailImages": [
          "https://your-cdn.com/images/ENG1/thumb1.jpg",
          "https://your-cdn.com/images/ENG1/thumb2.jpg",
          "https://your-cdn.com/images/ENG1/thumb3.jpg"
        ],
        "basePrice": 25000,
        "priceRange": {
          "min": 20000,
          "max": 62500
        },
        "viewType": "NBV",
        "hasDiamond": true
      },
      {
        "variantId": "ENG2",
        "stylingName": "CLASSIC",
        "mainImage": "https://your-cdn.com/images/ENG2/main.jpg",
        "thumbnailImages": [
          "https://your-cdn.com/images/ENG2/thumb1.jpg",
          "https://your-cdn.com/images/ENG2/thumb2.jpg"
        ],
        "basePrice": 30000,
        "priceRange": {
          "min": 24000,
          "max": 75000
        },
        "viewType": "NBV",
        "hasDiamond": true
      }
    ]
  }
}
```

**Frontend Usage:** Display product grid with images, names, and price ranges. Use `viewType` to determine the display style.

---

### 3. **Get Specific Variant Details**
**GET** `/variants/:variantId`

**Purpose:** Get detailed information about a specific product variant including all customization options.

**Parameters:**
- `variantId` (string, required): The variant ID (e.g., "ENG1", "GR10")

**Frontend Data Received:**
```json
{
  "success": true,
  "message": "Variant details fetched successfully",
  "data": {
    "variant": {
      "variantId": "ENG1",
      "category": "ENGAGEMENT RINGS",
      "subCategory": "Women's Rings",
      "stylingName": "NATURE INSPIRED",
      "builderView": "ENG1-RD-100-WG-NBV",
      "viewType": "NBV",
      "hasDiamond": true,
      "mainImage": "https://your-cdn.com/images/ENG1/main.jpg",
      "thumbnailImages": [
        "https://your-cdn.com/images/ENG1/thumb1.jpg",
        "https://your-cdn.com/images/ENG1/thumb2.jpg",
        "https://your-cdn.com/images/ENG1/thumb3.jpg"
      ],
      "variantImages": [
        "https://your-cdn.com/images/ENG1/variant1.jpg",
        "https://your-cdn.com/images/ENG1/variant2.jpg",
        "https://your-cdn.com/images/ENG1/variant3.jpg"
      ],
      "availableDiamondShapes": ["Round", "Princess", "Oval", "Pear", "Emerald"],
      "availableDiamondSizes": [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0],
      "availableDiamondColors": ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M"],
      "availableMetalTypes": ["Gold", "Rose Gold", "White Gold"],
      "availableMetalKt": ["18KT", "14KT", "10KT"],
      "availableMetalColors": ["Yellow Gold", "White Gold", "Rose Gold"],
      "basePrice": 25000,
      "priceRange": {
        "min": 20000,
        "max": 62500
      },
      "isActive": true,
      "isFeatured": false
    },
    "bomDetails": {
      "productId": "ENG1",
      "uniqueVariantId": "ENG1-RD-100-WG-NBV",
      "category": "ENGAGEMENT RINGS",
      "metalType": "GOLD",
      "metalKt": "18kt",
      "diamondOrigin": "NATURAL DIAMONDS",
      "centerStoneSize": 1.0,
      "centerStoneShape": "Round",
      "bandWidth": 2.5
    }
  }
}
```

**Frontend Usage:** Display detailed product page with all customization options and BOM details.

---

### 4. **Get Customization Options**
**GET** `/variants/:variantId/customization-options`

**Purpose:** Get all available customization options with pricing information for a specific variant.

**Frontend Data Received:**
```json
{
  "success": true,
  "message": "Customization options fetched successfully",
  "data": {
    "variantId": "ENG1",
    "customizationOptions": {
      "diamondShapes": [
        {
          "shape": "Round",
          "isAvailable": true,
          "priceMultiplier": 1.0
        },
        {
          "shape": "Princess",
          "isAvailable": true,
          "priceMultiplier": 0.95
        },
        {
          "shape": "Oval",
          "isAvailable": true,
          "priceMultiplier": 0.90
        }
      ],
      "diamondSizes": [
        {
          "size": 0.5,
          "isAvailable": true,
          "priceMultiplier": 0.6
        },
        {
          "size": 1.0,
          "isAvailable": true,
          "priceMultiplier": 1.0
        },
        {
          "size": 1.5,
          "isAvailable": true,
          "priceMultiplier": 1.8
        },
        {
          "size": 2.0,
          "isAvailable": true,
          "priceMultiplier": 3.2
        }
      ],
      "diamondColors": [
        {
          "color": "D",
          "isAvailable": true,
          "priceMultiplier": 1.5
        },
        {
          "color": "E",
          "isAvailable": true,
          "priceMultiplier": 1.4
        },
        {
          "color": "F",
          "isAvailable": true,
          "priceMultiplier": 1.3
        },
        {
          "color": "G",
          "isAvailable": true,
          "priceMultiplier": 1.2
        }
      ],
      "diamondClarities": [
        {
          "clarity": "FL",
          "isAvailable": true,
          "priceMultiplier": 2.0
        },
        {
          "clarity": "IF",
          "isAvailable": true,
          "priceMultiplier": 1.8
        },
        {
          "clarity": "VVS1",
          "isAvailable": true,
          "priceMultiplier": 1.6
        },
        {
          "clarity": "VVS2",
          "isAvailable": true,
          "priceMultiplier": 1.4
        },
        {
          "clarity": "VS1",
          "isAvailable": true,
          "priceMultiplier": 1.2
        }
      ],
      "diamondOrigins": [
        {
          "origin": "Natural Diamond",
          "isAvailable": true,
          "priceMultiplier": 2.0
        },
        {
          "origin": "Lab Grown Diamond",
          "isAvailable": true,
          "priceMultiplier": 1.0
        }
      ],
      "metalTypes": [
        {
          "type": "Gold",
          "isAvailable": true,
          "priceMultiplier": 1.0
        },
        {
          "type": "Rose Gold",
          "isAvailable": true,
          "priceMultiplier": 1.1
        },
        {
          "type": "White Gold",
          "isAvailable": true,
          "priceMultiplier": 1.2
        }
      ],
      "metalKt": [
        {
          "karat": "22KT",
          "isAvailable": true,
          "priceMultiplier": 1.3
        },
        {
          "karat": "18KT",
          "isAvailable": true,
          "priceMultiplier": 1.0
        },
        {
          "karat": "14KT",
          "isAvailable": true,
          "priceMultiplier": 0.8
        },
        {
          "karat": "10KT",
          "isAvailable": true,
          "priceMultiplier": 0.6
        }
      ],
      "metalColors": [
        {
          "color": "Yellow Gold",
          "isAvailable": true,
          "priceMultiplier": 1.0
        },
        {
          "color": "White Gold",
          "isAvailable": true,
          "priceMultiplier": 1.1
        },
        {
          "color": "Rose Gold",
          "isAvailable": true,
          "priceMultiplier": 1.05
        }
      ],
      "ringSizes": [
        {
          "size": "4",
          "isAvailable": true
        },
        {
          "size": "5",
          "isAvailable": true
        },
        {
          "size": "6",
          "isAvailable": true
        },
        {
          "size": "7",
          "isAvailable": true
        },
        {
          "size": "8",
          "isAvailable": true
        },
        {
          "size": "9",
          "isAvailable": true
        },
        {
          "size": "10",
          "isAvailable": true
        }
      ],
      "braceletSizes": [
        {
          "size": "6.5",
          "isAvailable": true
        },
        {
          "size": "7",
          "isAvailable": true
        },
        {
          "size": "7.5",
          "isAvailable": true
        }
      ],
      "necklaceLengths": [
        {
          "length": "16",
          "isAvailable": true
        },
        {
          "length": "18",
          "isAvailable": true
        },
        {
          "length": "20",
          "isAvailable": true
        }
      ],
      "engraving": {
        "isAvailable": true,
        "maxCharacters": 15,
        "pricePerCharacter": 50,
        "note": "Max 15 characters. We suggest 12 characters or less."
      }
    }
  }
}
```

**Frontend Usage:** Display customization form with all available options and their pricing.

---

### 5. **Calculate Customized Price**
**POST** `/variants/:variantId/calculate-price`

**Purpose:** Calculate the final price for a customized jewelry piece.

**Request Body:**
```json
{
  "diamondShape": "Round",
  "diamondSize": 1.5,
  "diamondColor": "E",
  "diamondClarity": "VS1",
  "diamondOrigin": "Natural Diamond",
  "metalType": "Gold",
  "metalKt": "18KT",
  "metalColor": "Yellow Gold",
  "ringSize": "7",
  "braceletSize": "7",
  "necklaceLength": "18",
  "engraving": "Love Always"
}
```

**Frontend Data Received:**
```json
{
  "success": true,
  "message": "Price calculated successfully",
  "data": {
    "variantId": "ENG1",
    "basePrice": 25000,
    "customizedPrice": 67500,
    "priceBreakdown": {
      "basePrice": 25000,
      "diamondUpgrade": 42000,
      "engravingCost": 500
    }
  }
}
```

**Frontend Usage:** Display real-time price updates as user selects customization options.

---

### 6. **Get Gents Rings with Diamond**
**GET** `/gents-rings/with-diamond`

**Purpose:** Get all gents rings that have diamonds (band width present in BOM).

**Frontend Data Received:**
```json
{
  "success": true,
  "message": "Gents rings with diamond fetched successfully",
  "data": {
    "category": "Gents Rings",
    "type": "with_diamond",
    "count": 15,
    "variants": [
      {
        "variantId": "GR1",
        "stylingName": "CLASSIC",
        "mainImage": "https://your-cdn.com/images/GR1/main.jpg",
        "thumbnailImages": [
          "https://your-cdn.com/images/GR1/thumb1.jpg",
          "https://your-cdn.com/images/GR1/thumb2.jpg"
        ],
        "basePrice": 35000,
        "priceRange": {
          "min": 28000,
          "max": 87500
        },
        "viewType": "BV",
        "hasDiamond": true
      },
      {
        "variantId": "GR2",
        "stylingName": "MODERN",
        "mainImage": "https://your-cdn.com/images/GR2/main.jpg",
        "thumbnailImages": [
          "https://your-cdn.com/images/GR2/thumb1.jpg"
        ],
        "basePrice": 40000,
        "priceRange": {
          "min": 32000,
          "max": 100000
        },
        "viewType": "BV",
        "hasDiamond": true
      }
    ]
  }
}
```

**Frontend Usage:** Display gents rings with diamond option when user selects "with diamond".

---

### 7. **Get Gents Rings without Diamond**
**GET** `/gents-rings/without-diamond`

**Purpose:** Get all gents rings that don't have diamonds (band width absent in BOM).

**Frontend Data Received:**
```json
{
  "success": true,
  "message": "Gents rings without diamond fetched successfully",
  "data": {
    "category": "Gents Rings",
    "type": "without_diamond",
    "count": 10,
    "variants": [
      {
        "variantId": "GR4",
        "stylingName": "CLASSIC",
        "mainImage": "https://your-cdn.com/images/GR4/main.jpg",
        "thumbnailImages": [
          "https://your-cdn.com/images/GR4/thumb1.jpg"
        ],
        "basePrice": 15000,
        "priceRange": {
          "min": 12000,
          "max": 37500
        },
        "viewType": "BV",
        "hasDiamond": false
      },
      {
        "variantId": "GR5",
        "stylingName": "MINIMALIST",
        "mainImage": "https://your-cdn.com/images/GR5/main.jpg",
        "thumbnailImages": [
          "https://your-cdn.com/images/GR5/thumb1.jpg"
        ],
        "basePrice": 12000,
        "priceRange": {
          "min": 9600,
          "max": 30000
        },
        "viewType": "BV",
        "hasDiamond": false
      }
    ]
  }
}
```

**Frontend Usage:** Display gents rings without diamond option when user selects "without diamond".

---

### 8. **Get View Types**
**GET** `/view-types`

**Purpose:** Get the mapping of categories to their view types for frontend display logic.

**Frontend Data Received:**
```json
{
  "success": true,
  "message": "View types fetched successfully",
  "data": {
    "BRACELET": "TRV",
    "EARRINGS": "BV",
    "PENDANT": "BV",
    "GENTS RINGS": "BV",
    "ENGAGEMENT RINGS": "NBV",
    "SOLITAIRE RINGS": "NBV"
  }
}
```

**Frontend Usage:** Determine how to display products based on category (TRV, BV, NBV).

---

### 9. **Initialize BOM Data (Admin)**
**POST** `/initialize-bom`

**Purpose:** Initialize BOM data and create product variants from Excel data.

**Frontend Data Received:**
```json
{
  "success": true,
  "message": "BOM data initialized and product variants created successfully"
}
```

**Frontend Usage:** Admin function to seed the database with product data.

---

## 🎯 **Frontend Integration Guide**

### **1. Category Selection Flow**
```javascript
// 1. Get all categories
const categoriesResponse = await fetch('/api/build-your-jewelry/categories');
const categories = await categoriesResponse.json();

// 2. Display category cards
categories.data.forEach(category => {
  console.log(`Category: ${category.category}`);
  console.log(`Variant Count: ${category.count}`);
  console.log(`Sample Variants:`, category.variants);
});
```

### **2. Product Variant Display Flow**
```javascript
// 1. Get variants for selected category
const variantsResponse = await fetch(`/api/build-your-jewelry/categories/${selectedCategory}`);
const variants = await variantsResponse.json();

// 2. Display products based on viewType
variants.data.variants.forEach(variant => {
  if (variant.viewType === 'NBV') {
    // Display as Non-Builder View (engagement rings, solitaire rings)
    displayNonBuilderView(variant);
  } else if (variant.viewType === 'BV') {
    // Display as Builder View (earrings, pendants, gents rings)
    displayBuilderView(variant);
  } else if (variant.viewType === 'TRV') {
    // Display as Tennis Ring View (bracelets)
    displayTennisRingView(variant);
  }
});
```

### **3. Gents Rings Special Logic**
```javascript
// 1. Show diamond option selection first
const showDiamondOptions = () => {
  // Display "With Diamond" and "Without Diamond" buttons
};

// 2. Get appropriate variants based on selection
const getGentsRings = async (withDiamond) => {
  const endpoint = withDiamond 
    ? '/api/build-your-jewelry/gents-rings/with-diamond'
    : '/api/build-your-jewelry/gents-rings/without-diamond';
  
  const response = await fetch(endpoint);
  const data = await response.json();
  return data.data.variants;
};
```

### **4. Customization Flow**
```javascript
// 1. Get variant details
const variantResponse = await fetch(`/api/build-your-jewelry/variants/${variantId}`);
const variantData = await variantResponse.json();

// 2. Get customization options
const optionsResponse = await fetch(`/api/build-your-jewelry/variants/${variantId}/customization-options`);
const options = await optionsResponse.json();

// 3. Display customization form
displayCustomizationForm(options.data.customizationOptions);

// 4. Calculate price on selection change
const calculatePrice = async (selections) => {
  const response = await fetch(`/api/build-your-jewelry/variants/${variantId}/calculate-price`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(selections)
  });
  const priceData = await response.json();
  updatePriceDisplay(priceData.data);
};
```

---

## 🎯 **View Types Explained**

### **TRV (Tennis Ring View)**
- **Used for:** Bracelets
- **Display:** Horizontal scrolling carousel of bracelet links
- **Layout:** Similar to tennis bracelet with connected links

### **BV (Builder View)**
- **Used for:** Earrings, Pendants, Gents Rings
- **Display:** Grid layout with customization options
- **Layout:** Product cards with customization panel

### **NBV (Non-Builder View)**
- **Used for:** Engagement Rings, Solitaire Rings
- **Display:** Large product showcase with minimal customization
- **Layout:** Hero image with basic options

---

## 🎯 **Error Handling**

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

---

## 🎯 **Special Features**

### **Gents Rings Diamond Logic**
- Gents rings with `bandWidth` field present in BOM are considered "with diamond"
- Gents rings without `bandWidth` field are considered "without diamond"
- By default, gents rings with diamond are shown

### **Price Calculation**
- Base price is calculated from BOM data
- Customization options have price multipliers
- Final price includes all selected customizations
- Real-time price updates as user makes selections

### **Image Management**
- Main image for product display
- Thumbnail images for gallery
- Variant images for different angles
- All images are CDN-hosted URLs

---

## 🎯 **Frontend State Management**

### **Recommended State Structure**
```javascript
const buildJewelryState = {
  selectedCategory: null,
  selectedVariant: null,
  customizationOptions: {},
  currentSelections: {
    diamondShape: null,
    diamondSize: null,
    diamondColor: null,
    diamondClarity: null,
    diamondOrigin: null,
    metalType: null,
    metalKt: null,
    metalColor: null,
    ringSize: null,
    engraving: null
  },
  calculatedPrice: {
    basePrice: 0,
    customizedPrice: 0,
    priceBreakdown: {}
  },
  viewType: null
};
```

---

## 🎯 **Performance Considerations**

1. **Caching:** Cache category and variant data
2. **Lazy Loading:** Load variant details only when needed
3. **Image Optimization:** Use appropriate image sizes
4. **Price Calculation:** Debounce price calculation requests
5. **Error Boundaries:** Implement proper error handling

---

This API provides everything needed for a complete "Build Your Jewelry" experience with real-time customization and pricing! 🎉
