# Build Your Jewelry API Documentation

## Overview
The Build Your Jewelry API provides comprehensive functionality for customers to customize and build their own jewelry pieces. This includes product variant selection, customization options, pricing calculations, and special handling for gents rings with/without diamonds.

## Base URL
```
https://api.kynajewels.com/api/build-your-jewelry
```

## Authentication
Most endpoints are public and don't require authentication. However, some admin endpoints may require authentication in production.

## Endpoints

### 1. Get All Jewelry Categories
**GET** `/categories`

Returns all available jewelry categories with their variant counts.

**Response:**
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
        }
      ]
    }
  ]
}
```

### 2. Get Product Variants by Category
**GET** `/categories/:category`

Get all variants for a specific category.

**Parameters:**
- `category` (string, required): The jewelry category (e.g., "ENGAGEMENT RINGS", "GENTS RINGS")
- `withDiamond` (boolean, optional): For gents rings, filter by diamond presence

**Example:**
```
GET /api/build-your-jewelry/categories/ENGAGEMENT%20RINGS
GET /api/build-your-jewelry/categories/GENTS%20RINGS?withDiamond=true
```

**Response:**
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
          "https://your-cdn.com/images/ENG1/thumb2.jpg"
        ],
        "basePrice": 25000,
        "priceRange": {
          "min": 20000,
          "max": 62500
        },
        "viewType": "NBV",
        "hasDiamond": true
      }
    ]
  }
}
```

### 3. Get Specific Variant Details
**GET** `/variants/:variantId`

Get detailed information about a specific product variant.

**Parameters:**
- `variantId` (string, required): The variant ID (e.g., "ENG1", "GR10")

**Response:**
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
      "thumbnailImages": [...],
      "variantImages": [...],
      "availableDiamondShapes": ["Round", "Princess", "Oval"],
      "availableDiamondSizes": [0.5, 1.0, 1.5, 2.0],
      "availableDiamondColors": ["D", "E", "F", "G", "H"],
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
      "centerStoneShape": "Round"
    }
  }
}
```

### 4. Get Customization Options
**GET** `/variants/:variantId/customization-options`

Get all available customization options for a specific variant.

**Response:**
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
        }
      ],
      "diamondClarities": [
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
        }
      ],
      "metalKt": [
        {
          "karat": "18KT",
          "isAvailable": true,
          "priceMultiplier": 1.0
        }
      ],
      "metalColors": [
        {
          "color": "Yellow Gold",
          "isAvailable": true,
          "priceMultiplier": 1.0
        }
      ],
      "ringSizes": [
        {
          "size": "6",
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

### 5. Calculate Customized Price
**POST** `/variants/:variantId/calculate-price`

Calculate the final price for a customized jewelry piece.

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
  "engraving": "Love Always"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Price calculated successfully",
  "data": {
    "variantId": "ENG1",
    "basePrice": 25000,
    "customizedPrice": 45000,
    "priceBreakdown": {
      "basePrice": 25000,
      "diamondUpgrade": 18000,
      "engravingCost": 650
    }
  }
}
```

### 6. Get Gents Rings with Diamond
**GET** `/gents-rings/with-diamond`

Get all gents rings that have diamonds (band width present in BOM).

**Response:**
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
        "basePrice": 35000,
        "viewType": "BV",
        "hasDiamond": true
      }
    ]
  }
}
```

### 7. Get Gents Rings without Diamond
**GET** `/gents-rings/without-diamond`

Get all gents rings that don't have diamonds (band width absent in BOM).

**Response:**
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
        "basePrice": 15000,
        "viewType": "BV",
        "hasDiamond": false
      }
    ]
  }
}
```

### 8. Get View Types
**GET** `/view-types`

Get the mapping of categories to their view types.

**Response:**
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

### 9. Initialize BOM Data (Admin)
**POST** `/initialize-bom`

Initialize BOM data and create product variants from the Excel data.

**Response:**
```json
{
  "success": true,
  "message": "BOM data initialized and product variants created successfully"
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Status Codes

- `200` - Success
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

## Special Features

### Gents Rings Diamond Logic
- Gents rings with `bandWidth` field present in BOM are considered "with diamond"
- Gents rings without `bandWidth` field are considered "without diamond"
- By default, gents rings with diamond are shown

### View Types
- **TRV**: Tennis Ring View (for bracelets)
- **BV**: Builder View (for earrings, pendants, gents rings)
- **NBV**: Non-Builder View (for engagement rings, solitaire rings)

### Price Calculation
- Base price is calculated from BOM data
- Customization options have price multipliers
- Final price includes all selected customizations

## Usage Examples

### Frontend Integration Example

```javascript
// Get all categories
const categories = await fetch('/api/build-your-jewelry/categories');

// Get engagement ring variants
const engagementRings = await fetch('/api/build-your-jewelry/categories/ENGAGEMENT%20RINGS');

// Get gents rings with diamond
const gentsWithDiamond = await fetch('/api/build-your-jewelry/gents-rings/with-diamond');

// Get variant details
const variantDetails = await fetch('/api/build-your-jewelry/variants/ENG1');

// Get customization options
const customizationOptions = await fetch('/api/build-your-jewelry/variants/ENG1/customization-options');

// Calculate price
const priceCalculation = await fetch('/api/build-your-jewelry/variants/ENG1/calculate-price', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    diamondShape: 'Round',
    diamondSize: 1.5,
    diamondColor: 'E',
    metalType: 'Gold',
    metalKt: '18KT',
    ringSize: '7'
  })
});
```

## Notes

1. All image URLs are placeholder URLs and should be replaced with actual CDN URLs
2. The BOM data seeding should be run once to populate the database
3. Price calculations are based on multipliers and can be adjusted as needed
4. The API supports both natural and lab-grown diamonds
5. Engraving is limited to 15 characters with pricing per character
