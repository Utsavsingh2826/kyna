# Build Your Jewelry - Backend Implementation

## Overview
This is a comprehensive backend implementation for the "Build Your Jewelry" functionality that allows customers to customize and build their own jewelry pieces. The system supports multiple jewelry categories with extensive customization options and special logic for gents rings with/without diamonds.

## Features

### 🎯 Core Features
- **Product Variant Management**: Handle 250+ variants across different jewelry categories
- **Category-based Filtering**: Support for Engagement Rings, Gents Rings, Bracelets, Earrings, Pendants, and Solitaire Rings
- **Customization Options**: Diamond shape, size, color, clarity, metal type, karat, and color selection
- **Price Calculation**: Dynamic pricing based on selected customizations
- **BOM Integration**: Bill of Materials integration for accurate product specifications
- **Image Management**: Cloudinary integration for product images
- **Special Gents Rings Logic**: Separate handling for rings with/without diamonds based on band width

### 🔧 Technical Features
- **RESTful API**: Clean, well-documented API endpoints
- **MongoDB Integration**: Efficient data storage and retrieval
- **TypeScript**: Full type safety and better development experience
- **Error Handling**: Comprehensive error handling and validation
- **Data Seeding**: Automated data initialization scripts
- **Testing**: Comprehensive test suite for all endpoints

## Architecture

### Models
1. **BOM Model** (`bomModel.ts`): Stores Bill of Materials data from Excel
2. **Product Variant Model** (`productVariantModel.ts`): Manages product variants and their configurations
3. **Customization Model** (`customizationModel.ts`): Handles all customization options and pricing

### Services
1. **BOM Service** (`bomService.ts`): Handles BOM operations and band width logic
2. **Image Service** (`imageService.ts`): Manages image uploads and transformations
3. **Seed Service** (`seedBuildYourJewelryData.ts`): Initializes database with sample data

### Controllers
1. **Build Your Jewelry Controller** (`buildYourJewelryController.ts`): Main controller for all API endpoints

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- TypeScript
- Cloudinary account (for image storage)

### Installation Steps

1. **Install Dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the server directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/kyna-jewels
   JWT_SECRET=your-jwt-secret
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

3. **Initialize Database**
   ```bash
   npm run init:build-jewelry
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Base URL
```
https://api.kynajewels.com/api/build-your-jewelry
```

### Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | Get all jewelry categories |
| GET | `/categories/:category` | Get variants by category |
| GET | `/variants/:variantId` | Get specific variant details |
| GET | `/variants/:variantId/customization-options` | Get customization options |
| POST | `/variants/:variantId/calculate-price` | Calculate customized price |
| GET | `/gents-rings/with-diamond` | Get gents rings with diamond |
| GET | `/gents-rings/without-diamond` | Get gents rings without diamond |
| GET | `/view-types` | Get view type mappings |
| POST | `/initialize-bom` | Initialize BOM data (Admin) |

## Usage Examples

### 1. Get All Categories
```javascript
const response = await fetch('/api/build-your-jewelry/categories');
const data = await response.json();
console.log(data.data); // Array of categories with variant counts
```

### 2. Get Engagement Ring Variants
```javascript
const response = await fetch('/api/build-your-jewelry/categories/ENGAGEMENT%20RINGS');
const data = await response.json();
console.log(data.data.variants); // Array of engagement ring variants
```

### 3. Get Gents Rings with Diamond
```javascript
const response = await fetch('/api/build-your-jewelry/gents-rings/with-diamond');
const data = await response.json();
console.log(data.data.variants); // Array of gents rings with diamond
```

### 4. Calculate Customized Price
```javascript
const response = await fetch('/api/build-your-jewelry/variants/ENG1/calculate-price', {
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
const data = await response.json();
console.log(data.data.customizedPrice); // Final calculated price
```

## Data Structure

### Product Variant Structure
```typescript
interface IProductVariant {
  variantId: string;                    // e.g., "ENG1", "GR10"
  category: string;                     // e.g., "ENGAGEMENT RINGS"
  subCategory: string;                  // e.g., "Men's Rings"
  stylingName: string;                  // e.g., "CLASSIC", "NATURE INSPIRED"
  builderView: string;                  // e.g., "ENG1-RD-100-WG-NBV"
  viewType: string;                     // "TRV", "BV", "NBV"
  hasDiamond: boolean;                  // For gents rings
  mainImage: string;                    // Main product image URL
  thumbnailImages: string[];            // Thumbnail image URLs
  availableDiamondShapes: string[];     // Available diamond shapes
  availableDiamondSizes: number[];      // Available diamond sizes
  availableMetalTypes: string[];        // Available metal types
  basePrice: number;                    // Base price
  priceRange: { min: number; max: number }; // Price range
}
```

### BOM Structure
```typescript
interface IBOM {
  productId: string;                    // e.g., "GR47", "ENG5"
  uniqueVariantId: string;             // e.g., "GR47-MF-SLV-LGEFVS-7"
  category: string;                     // e.g., "RINGS"
  subCategory: string;                  // e.g., "Men's Rings"
  bandWidth?: number;                   // Critical for gents rings
  metalType: string;                    // e.g., "SILVER", "GOLD"
  metalKt: string;                      // e.g., "925", "18kt"
  diamondOrigin: string;                // "LAB GROWN" or "NATURAL"
  centerStoneSize?: number;             // Diamond size in carats
  centerStoneShape?: string;            // Diamond shape
}
```

## Special Features

### Gents Rings Diamond Logic
- **With Diamond**: Rings that have a `bandWidth` value in the BOM
- **Without Diamond**: Rings that don't have a `bandWidth` value in the BOM
- **Default Display**: Shows "with diamond" variants by default

### View Types
- **TRV**: Tennis Ring View (for bracelets)
- **BV**: Builder View (for earrings, pendants, gents rings)
- **NBV**: Non-Builder View (for engagement rings, solitaire rings)

### Price Calculation
- Base price from BOM data
- Price multipliers for each customization option
- Dynamic calculation based on selected options
- Engraving cost per character

## Testing

### Run Tests
```bash
# Test all endpoints
node test-build-your-jewelry.js

# Test specific functionality
npm run test:build-jewelry
```

### Test Coverage
- ✅ All API endpoints
- ✅ Error handling
- ✅ Data validation
- ✅ Price calculations
- ✅ Category filtering
- ✅ Variant selection

## Database Seeding

### Initialize Data
```bash
npm run init:build-jewelry
```

This script will:
1. Seed customization options
2. Seed BOM data from Excel structure
3. Create product variants from BOM data
4. Set up all necessary relationships

### Sample Data Included
- 250+ product variants across all categories
- Complete customization options
- BOM data with band width logic
- Sample images and pricing

## Error Handling

### Common Error Responses
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

### Status Codes
- `200` - Success
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

## Performance Considerations

### Database Indexes
- Compound indexes on frequently queried fields
- Optimized for category and variant lookups
- Efficient filtering on customization options

### Caching Strategy
- Consider implementing Redis for frequently accessed data
- Cache customization options
- Cache price calculations

### Image Optimization
- Cloudinary automatic optimization
- Responsive image URLs
- Lazy loading support

## Security Considerations

### Input Validation
- All inputs validated using express-validator
- SQL injection prevention through Mongoose
- XSS protection through input sanitization

### Rate Limiting
- Implement rate limiting for price calculation endpoints
- Protect against abuse of customization APIs

## Deployment

### Production Checklist
- [ ] Set up production MongoDB
- [ ] Configure Cloudinary for production
- [ ] Set up proper environment variables
- [ ] Enable authentication for admin endpoints
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting
- [ ] Set up backup strategy

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://production-mongo-uri
JWT_SECRET=strong-production-secret
CLOUDINARY_CLOUD_NAME=production-cloud-name
CLOUDINARY_API_KEY=production-api-key
CLOUDINARY_API_SECRET=production-api-secret
```

## Contributing

### Code Style
- Use TypeScript for all new code
- Follow existing naming conventions
- Add proper error handling
- Include JSDoc comments for complex functions

### Testing
- Add tests for new features
- Ensure all tests pass before submitting
- Test error scenarios

## Support

For questions or issues:
1. Check the API documentation
2. Review the test files
3. Check the error logs
4. Contact the development team

## License

This project is part of the KynaJewels application and follows the same licensing terms.
