# Cart Color-Specific Images Implementation

## Overview

Updated the cart controller to fetch and display color-specific images based on the metal color selected for each cart item. This ensures that when users add variants with different colors (like White Gold, Rose Gold, etc.), the cart displays the appropriate images for each color variant.

## Key Changes Made

### 1. Added Helper Functions

**Metal Color Code Mapping:**

```typescript
const METAL_COLOR_CODE_MAP: Record<string, string> = {
  "White Gold": "WG",
  "Yellow Gold": "YG",
  "Rose Gold": "RG",
  Platinum: "PL",
  Silver: "SV",
};
```

**Color-Specific Image Fetching:**

```typescript
const getColorSpecificImages = async (product: any, metalColor: string): Promise<string[]>
```

This function uses the same image filtering logic as the product detail page to:

- Extract all images from the product variant
- Filter images based on metal color codes (WG, YG, RG, etc.)
- Apply priority matching: strict primary-only → inclusive primary → loose matches
- Return up to 24 unique images

### 2. Updated Cart Functions

All cart-related functions now fetch color-specific images:

- `getCart()` - Get user's cart with color-filtered images
- `addToCart()` - Add item with proper color images
- `removeFromCart()` - Remove item and refresh with color images
- `updateCartItem()` - Update quantity with color images
- `removeCartItemById()` - Remove specific item with color images
- `updateCartItemRingSize()` - Update ring size with color images

### 3. Enhanced Variant Configuration

Each cart item now includes:

```typescript
const updatedVariantConfig = {
  ...item.variantConfig,
  variantImages: colorSpecificImages,
  metalColorCode: METAL_COLOR_CODE_MAP[metalColor] || metalColor,
};
```

## How It Works

1. **Product Addition**: When a product is added to cart with a specific metal color, the system stores the metalColor in variantConfig.

2. **Image Fetching**: Each time cart data is retrieved, the system:

   - Checks if the cart item has a metalColor in variantConfig
   - Fetches the product data from the catalog
   - Applies color-specific image filtering using the same logic as product detail page
   - Returns images that match the specific color (e.g., only "WG" images for White Gold)

3. **Frontend Display**: The cart page receives color-specific images and displays them correctly for each variant.

## Example Behavior

**Before**:

- User adds same ring in White Gold and Rose Gold
- Cart shows same images for both variants

**After**:

- User adds same ring in White Gold and Rose Gold
- Cart shows WG-specific images for White Gold variant
- Cart shows RG-specific images for Rose Gold variant
- Each variant is visually distinct

## Color Code Mapping

- White Gold → WG
- Yellow Gold → YG
- Rose Gold → RG
- Platinum → PL
- Silver → SV

## Image Filtering Priority

1. **Strict Primary-Only**: Images with exactly one metal color code (e.g., only "WG")
2. **Inclusive Primary**: Images containing the metal color code among others
3. **Loose Matches**: Images containing the color code anywhere in filename
4. **Fallback**: First 6 available images if no color-specific images found

## Integration with Frontend

The frontend CartPage.tsx already extracts images from `variantConfig.variantImages`, so no frontend changes are needed. The color-specific images will automatically display correctly.

## Error Handling

- If color-specific image fetching fails, falls back to existing variantImages
- If no metalColor is specified, returns all available images
- Comprehensive error logging for debugging

This implementation ensures a consistent and accurate visual representation of each product variant in the cart based on the selected metal color.
