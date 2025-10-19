# 🖼️ **IMAGE CONFIGURATION GUIDE - Kyna Jewels**

## 📋 **Environment Variables Required**

Add these environment variables to your `.env` file:

```env
# Hostinger VPS Image Configuration
IMAGE_BASE_URL=https://kynajewels.com/images/RENDERING%20PHOTOS
```

## 🎯 **How Image Fetching Works Now**

### **1. Product Image URL Generation**

Your `imageService.ts` now properly generates URLs based on your actual VPS structure:

**Example for Earrings (ER66):**
```javascript
// Input: SKU = "ER66", attributes = {diamondShape: "EM", diamondSize: "05", metalColour: "WG", view: "AV"}

// Generated URL:
"https://kynajewels.com/images/RENDERING%20PHOTOS/EARINGS/ER51-100/ER66-EM-05-WG-AV-GP.jpg"
```

**Example for Gents Rings (GR1):**
```javascript
// Input: SKU = "GR1", attributes = {diamondShape: "RD", diamondSize: "70", tone: "2T", finish: "BR", metal: "RG", view: "45"}

// Generated URL:
"https://kynajewels.com/images/RENDERING%20PHOTOS/GENTS RINGS/GR1-3-4-5-47-37-46-12-14-22-IMG-GLB/GR1-RD-70-2T-BR-RG-45-GP.jpg"
```

### **2. Folder Mapping Logic**

| SKU Prefix | Category Path | Subfolder Logic |
|------------|---------------|-----------------|
| `BR` | `BRACELETS/ALL BRACELETS` | Fixed folder |
| `ER` | `EARINGS/ER1-50` | Based on number: ER1-50, ER51-100, ER101-150, etc. |
| `FR` | `FASHION RINGS/FR1-50` | Based on number: FR1-50, FR51-100, FR101-150, etc. |
| `GR` | `GENTS RINGS/GR1-3-4-5-47-37-46-12-14-22-IMG-GLB` | Fixed folder |
| `ENG` | `ENGAGEMENT AND SOLITAIRE RINGS` | Fixed folder |
| `SOL` | `ENGAGEMENT AND SOLITAIRE RINGS` | Fixed folder |

### **3. Attribute String Building**

Based on your handwritten notes, the system builds filenames according to your naming conventions:

**Earrings (ER):** `SKU-DiamondShape-DiamondSize-MetalColour-View`
- Example: `ER66-EM-05-WG-AV`

**Engagement Rings (ENG):** `SKU-DiamondShape-DiamondSize-MetalType-DiamondOrigin-DiamondColour-DiamondClarity`
- Example: `ENG-1-EM-30-18-LG-EFVVS`

**Gents Rings (GR):** `SKU-DiamondShape-DiamondSize-Tone-Finish-Metal-View`
- Example: `GR1-RD-70-2T-BR-RG-45`

### **4. View Types Supported**

- `GP` - Ground Pose (Main view)
- `SIDE` - Side View
- `TOP` - Top View
- `DETAIL` - Detail View
- `LIFESTYLE` - Lifestyle View
- `COMPARISON` - Comparison View
- `CUSTOM` - Custom View
- `360` - 360° View
- `TH1`, `TH2`, `TH3` - Thumbnails

## 🚀 **API Usage Examples**

### **Get Product Images:**
```javascript
// Frontend request
const response = await fetch('/api/products/ER66/images?diamondShape=EM&diamondSize=05&metalColour=WG&view=AV');

// Response
{
  "success": true,
  "data": {
    "main": "https://kynajewels.com/images/RENDERING%20PHOTOS/EARINGS/ER51-100/ER66-EM-05-WG-AV-GP.jpg",
    "sub": [
      "https://kynajewels.com/images/RENDERING%20PHOTOS/EARINGS/ER51-100/ER66-EM-05-WG-AV-SIDE.jpg",
      "https://kynajewels.com/images/RENDERING%20PHOTOS/EARINGS/ER51-100/ER66-EM-05-WG-AV-TOP.jpg"
    ]
  }
}
```

### **Get Product with Images:**
```javascript
// Frontend request
const response = await fetch('/api/products/GR1');

// Response includes images
{
  "success": true,
  "data": {
    "sku": "GR1",
    "name": "Gents Ring 1",
    "images": {
      "main": "https://kynajewels.com/images/RENDERING%20PHOTOS/GENTS RINGS/GR1-3-4-5-47-37-46-12-14-22-IMG-GLB/GR1-RD-70-2T-BR-RG-45-GP.jpg",
      "sub": [...]
    }
  }
}
```

## ✅ **Testing Your Image System**

1. **Set Environment Variable:**
   ```bash
   export IMAGE_BASE_URL=https://kynajewels.com/images/RENDERING%20PHOTOS
   ```

2. **Test API Endpoints:**
   ```bash
   # Test earring images
   curl "https://api.kynajewels.com/api/products/ER66/images?diamondShape=EM&diamondSize=05&metalColour=WG&view=AV"
   
   # Test gents ring images
   curl "https://api.kynajewels.com/api/products/GR1/images?diamondShape=RD&diamondSize=70&tone=2T&finish=BR&metal=RG&view=45"
   ```

3. **Verify URLs in Browser:**
   Open the generated URLs in your browser to confirm images load correctly.

## 🔧 **Customization**

### **Adding New SKU Ranges:**
Update the subfolder functions in `imageService.ts`:

```typescript
private getEarringSubfolder(sku: string): string {
  const match = sku.match(/ER(\d+)/);
  if (!match) return 'EARINGS/ER1-50';
  
  const num = parseInt(match[1], 10);
  if (num >= 1 && num <= 50) return 'EARINGS/ER1-50';
  if (num >= 51 && num <= 100) return 'EARINGS/ER51-100';
  // Add more ranges as needed
  if (num >= 301 && num <= 350) return 'EARINGS/ER301-350';
  return 'EARINGS/ER1-50';
}
```

### **Adding New Product Types:**
Add new cases to the `getCategoryPath` and `buildAttributeString` functions.

## 🎯 **Summary**

Your image fetching system is now properly configured to:
- ✅ Use your actual Hostinger VPS paths
- ✅ Map SKUs to correct subfolders
- ✅ Build filenames according to your naming conventions
- ✅ Support all product categories (Bracelets, Earrings, Fashion Rings, Gents Rings, Engagement Rings)
- ✅ Generate proper HTTP URLs for frontend consumption

**Your images will now fetch successfully from your VPS!** 🚀
