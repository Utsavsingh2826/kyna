# 🏗️ BOM Integration Documentation - Kyna Jewels

## 📋 Overview

This document details the complete implementation of BOM (Bill of Materials) integration for the Kyna Jewels e-commerce platform, including dynamic image management from Hostinger VPS and comprehensive pricing with BOM details.

## 🎯 Key Features Implemented

### 1. **Flexible Image Naming Convention**
- **Format**: `SKU-ATTRIBUTE1-ATTRIBUTE2-ATTRIBUTE3-...-VIEW`
- **Dynamic Concatenation**: Automatically concatenates SKU with any combination of product attributes
- **Examples**:
  - `GR1-RD-70-2T-BR-RG-GP` (Gents Ring)
  - `ENG1-PR-100-1T-PL-WG-GP` (Engagement Ring)
  - `SOL1-OV-50-1T-MT-YG-GP` (Solitaire Ring)
  - `BR1-RD-25-2T-PL-SL-GP` (Bracelet)
  - `PN1-EM-40-1T-BR-PT-18-GP` (Pendant with chain length)
  - `ER1-MAR-60-2T-PL-RG-HOOP-GP` (Earrings with setting type)

### 2. **Image Management System**
- **8 Images per Product**: 1 main (GP) + 7 sub images
- **Sub Image Views**: SIDE, TOP, DETAIL, LIFESTYLE, COMPARISON, CUSTOM, 360
- **VPS Integration**: Images stored on Hostinger VPS, URLs in MongoDB
- **Dynamic Generation**: URLs generated based on product attributes

### 3. **BOM Details Integration**
- **Complete Pricing Breakdown**: Metal cost, diamond cost, making charges, GST
- **Dynamic Pricing**: Based on BOM data from Excel sheets
- **Product Attributes**: SKU, variant, diamond specs, metal specs, weight
- **Pricing Transparency**: Detailed cost breakdown for customers

## 🔧 Technical Implementation

### **Files Modified/Created**

#### 1. **ImageService** (`src/services/imageService.ts`)
```typescript
// New method for BOM-based image generation
generateImageUrlsFromBOM(productSku: string, attributes: {
  diamondShape: string;
  diamondSize: number;
  tone: string;
  finish: string;
  metal: string;
}): { main: string; sub: string[] }
```

**Key Features**:
- Generates image URLs using exact BOM naming convention
- Supports multiple product categories (GR1, ENG1, SOL1, etc.)
- Handles different diamond shapes, sizes, and metal combinations
- Fallback to default images when product images not found

#### 2. **PricingService** (`src/services/pricingService.ts`)
```typescript
// New method for BOM details
getBOMDetails(product: IProduct, overrides?: any): {
  productSku: string;
  category: string;
  variant: string;
  diamondShape: string;
  diamondSize: number;
  diamondColor: string;
  diamondOrigin: string;
  metal: string;
  karat: number;
  tone: string;
  finish: string;
  netWeightGrams: number;
  metalCost: number;
  diamondCost: number;
  makingCharges: number;
  baseCost: number;
  profitMargin: number;
  gst: number;
  finalPrice: number;
  pricingBreakdown: {
    metalPricingPerGram: number;
    diamondPricingPerCarat: number;
    makingChargesPerGram: number;
    gstPercent: number;
    profitMarginPercent: number;
  };
}
```

**Key Features**:
- Complete BOM data extraction from product attributes
- Dynamic pricing calculation based on BOM data
- Detailed cost breakdown for transparency
- Support for different metal types, karats, and diamond specifications

#### 3. **ProductController** (`src/controllers/productController.ts`)
```typescript
// Enhanced price endpoint with BOM details
export const getProductPrice = async (req: Request, res: Response) => {
  // Returns price + BOM details
}

// New BOM endpoint
export const getProductBOM = async (req: Request, res: Response) => {
  // Returns complete BOM information
}

// Enhanced image endpoint with naming convention info
export const getProductImages = async (req: Request, res: Response) => {
  // Returns images + naming convention details
}
```

**Key Features**:
- BOM details included in price responses
- Dedicated BOM endpoint for detailed information
- Image naming convention documentation in responses
- Support for query parameters to override product attributes

#### 4. **ProductService** (`src/services/productService.ts`)
```typescript
// Updated to use BOM-based image generation
async getProductImages(productId: string, attributes?: any): Promise<{ main: string; sub: string[] }> {
  // Uses generateImageUrlsFromBOM method
}
```

**Key Features**:
- Integration with new BOM-based image generation
- Fallback to default values for missing attributes
- Support for attribute overrides

#### 5. **Routes** (`src/routes/product.ts`)
```typescript
// New BOM endpoint
router.get('/:id/bom', validateProductId, getProductBOM);
```

## 🌐 API Endpoints

### **New/Enhanced Endpoints**

#### 1. **GET /api/products/:id/price**
- **Enhanced**: Now includes BOM details
- **Query Params**: `diamondSize`, `metal`, `karat`, `diamondOrigin`, `diamondShape`, `diamondColor`
- **Response**: Price + BOM details + pricing breakdown

#### 2. **GET /api/products/:id/images**
- **Enhanced**: Uses BOM naming convention
- **Query Params**: `diamondShape`, `size`, `tone`, `metal`, `origin`, `diamondColor`, `finish`
- **Response**: Image URLs + naming convention documentation

#### 3. **GET /api/products/:id/bom** (NEW)
- **Purpose**: Get complete BOM details for a product
- **Query Params**: Same as price endpoint
- **Response**: Complete BOM information with pricing breakdown

## 📊 BOM Data Structure

### **Product Categories Supported**
- **Ring Categories**: GR1 (Gents), ENG1 (Engagement), SOL1 (Solitaire), FR1 (Fashion), WR1 (Wedding), PR1 (Promise), AR1 (Anniversary)
- **Jewelry Categories**: BR1 (Bracelets), PN1 (Pendants), ER1 (Earrings), NK1 (Necklaces), CH1 (Chains), WT1 (Watches), AN1 (Anklets)
- **Gemstone Categories**: DI1 (Diamonds), EM1 (Emeralds), RU1 (Rubies), SA1 (Sapphires), PE1 (Pearls), AM1 (Amethysts), CI1 (Citrines), TO1 (Topazes)
- **Metal Categories**: GD1 (Gold), SL1 (Silver), PT1 (Platinum), TI1 (Titanium), ST1 (Steel)
- **Custom Categories**: Any SKU format supported with automatic category detection

### **Diamond Shapes**
- **RD**: Round
- **PR**: Princess
- **EM**: Emerald
- **OV**: Oval
- **CUS**: Cushion
- **PEAR**: Pear
- **MARQUISE**: Marquise
- **HEART**: Heart

### **Metal Types**
- **RG**: Rose Gold
- **YG**: Yellow Gold
- **WG**: White Gold
- **SLV**: Silver
- **PT**: Platinum

### **Tone Options**
- **1T**: Single tone
- **2T**: Two tone
- **3T**: Three tone

### **Finish Options**
- **BR**: Black Rhodium
- **PL**: Polished
- **MT**: Matte
- **BR**: Brushed

## 🔄 Image URL Generation Examples

### **Flexible Image URL Examples**

#### **Gents Ring (GR1)**
```
Main Image: https://yourdomain.com/images/rings/GR1-RD-70-2T-BR-RG-GP.jpg
Sub Images:
- https://yourdomain.com/images/rings/GR1-RD-70-2T-BR-RG-SIDE.jpg
- https://yourdomain.com/images/rings/GR1-RD-70-2T-BR-RG-TOP.jpg
- https://yourdomain.com/images/rings/GR1-RD-70-2T-BR-RG-DETAIL.jpg
- https://yourdomain.com/images/rings/GR1-RD-70-2T-BR-RG-LIFESTYLE.jpg
- https://yourdomain.com/images/rings/GR1-RD-70-2T-BR-RG-COMPARISON.jpg
- https://yourdomain.com/images/rings/GR1-RD-70-2T-BR-RG-CUSTOM.jpg
- https://yourdomain.com/images/rings/GR1-RD-70-2T-BR-RG-360.jpg
```

#### **Engagement Ring (ENG1)**
```
Main Image: https://yourdomain.com/images/rings/ENG1-PR-100-1T-PL-WG-GP.jpg
Sub Images: [Similar pattern with ENG1-PR-100-1T-PL-WG prefix]
```

#### **Bracelet (BR1)**
```
Main Image: https://yourdomain.com/images/bracelets/BR1-RD-25-2T-PL-SL-GP.jpg
Sub Images: [Similar pattern with BR1-RD-25-2T-PL-SL prefix]
```

#### **Pendant with Chain Length (PN1)**
```
Main Image: https://yourdomain.com/images/pendants/PN1-EM-40-1T-BR-PT-18-GP.jpg
Sub Images: [Similar pattern with PN1-EM-40-1T-BR-PT-18 prefix]
```

#### **Earrings with Setting Type (ER1)**
```
Main Image: https://yourdomain.com/images/earrings/ER1-MAR-60-2T-PL-RG-HOOP-GP.jpg
Sub Images: [Similar pattern with ER1-MAR-60-2T-PL-RG-HOOP prefix]
```

## 💰 Pricing Integration

### **BOM Details Included in Price Response**
```json
{
  "success": true,
  "data": {
    "productId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "price": 125000,
    "breakdown": {
      "metalCost": 45000,
      "diamondCost": 70000,
      "makingCharges": 2600,
      "baseCost": 117600,
      "profitMargin": 29400,
      "gst": 4410,
      "finalPrice": 125000
    },
    "bomDetails": {
      "productSku": "GR1-RD-70-2T-BR-RG",
      "category": "Gents Ring",
      "variant": "GR1",
      "diamondShape": "RD",
      "diamondSize": 0.70,
      "diamondColor": "G",
      "diamondOrigin": "Lab Grown Diamond",
      "metal": "RG",
      "karat": 18,
      "tone": "2T",
      "finish": "BR",
      "netWeightGrams": 5.2,
      "pricingBreakdown": {
        "metalPricingPerGram": 4500,
        "diamondPricingPerCarat": 100000,
        "makingChargesPerGram": 500,
        "gstPercent": 3,
        "profitMarginPercent": 25
      }
    }
  }
}
```

## 🚀 Usage Instructions

### **1. Environment Setup**
```bash
# Add to .env file
IMAGE_BASE_URL=https://yourdomain.com/images
IMAGE_BASE_PATH=/var/www/html/yourdomain.com/public/images
```

### **2. Image Storage Structure**
```
/var/www/html/yourdomain.com/public/images/
├── rings/
│   ├── GR1-RD-70-2T-BR-RG-GP.jpg
│   ├── GR1-RD-70-2T-BR-RG-SIDE.jpg
│   ├── GR1-RD-70-2T-BR-RG-TOP.jpg
│   └── ...
├── bracelets/
├── pendants/
└── earrings/
```

### **3. API Usage Examples**

#### **Get Product Price with BOM Details**
```bash
GET /api/products/64f8a1b2c3d4e5f6a7b8c9d0/price?diamondSize=1.00&metal=YG&karat=18
```

#### **Get Product Images**
```bash
GET /api/products/64f8a1b2c3d4e5f6a7b8c9d0/images?diamondShape=RD&size=0.70&tone=2T&metal=RG&finish=BR
```

#### **Get Complete BOM Details**
```bash
GET /api/products/64f8a1b2c3d4e5f6a7b8c9d0/bom?diamondSize=0.70&metal=RG&karat=18
```

## ✅ Testing

### **Test Script**
Run the included test script to verify implementation:
```bash
cd server
node test-bom-integration.js
```

### **Manual Testing**
1. Start the server: `npm run dev`
2. Test endpoints using Postman or curl
3. Verify image URL generation
4. Check BOM details in price responses

## 🔧 Configuration

### **Image Service Configuration**
```typescript
const imageConfig = {
  baseUrl: process.env.IMAGE_BASE_URL || 'https://kyna-jewels.com/images',
  basePath: process.env.IMAGE_BASE_PATH || '/var/www/html/kyna-jewels.com/public/images',
  supportedFormats: ['jpg', 'jpeg', 'png', 'webp'],
  maxImageSize: 10 // MB
};
```

### **Pricing Configuration**
```typescript
const pricingConfig = {
  metalPricing: {
    'Gold': { 14: 3500, 18: 4500, 22: 5500 },
    'Silver': { 925: 80 },
    'Platinum': { 950: 3500 }
  },
  diamondPricing: {
    'Natural Diamond': { /* pricing by color and shape */ },
    'Lab Grown Diamond': { /* pricing by color and shape */ }
  },
  makingChargesPerGram: 500,
  gstPercent: 3,
  profitMargin: 0.25
};
```

## 📈 Benefits

### **For Frontend Development**
- **Consistent Image Naming**: Predictable URL structure for easy integration
- **Dynamic Image Loading**: Images change based on product attributes
- **Complete BOM Data**: All necessary information for product display
- **Pricing Transparency**: Detailed cost breakdown for customer trust

### **For Business Operations**
- **BOM Integration**: Direct connection to Excel BOM data
- **Dynamic Pricing**: Real-time price calculation based on current costs
- **Image Management**: Centralized image storage on VPS
- **Scalability**: Easy to add new product categories and variants

### **For Customers**
- **Multiple Product Views**: 8 different angles of each product
- **Price Transparency**: Clear breakdown of costs
- **Consistent Experience**: Uniform image naming across all products
- **Fast Loading**: Images served from VPS for optimal performance

## 🎯 Next Steps

1. **Upload Images**: Store product images on Hostinger VPS following the naming convention
2. **Frontend Integration**: Update frontend to use new API endpoints
3. **Testing**: Comprehensive testing with real product data
4. **Performance Optimization**: Implement image caching and CDN
5. **Monitoring**: Set up logging and monitoring for image and pricing services

---

**Implementation Status**: ✅ **COMPLETE**
**Last Updated**: September 20, 2025
**Version**: 1.0.0
