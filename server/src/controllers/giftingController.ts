import { Request, Response } from 'express';
import Product from '../models/productModel';

export const getGiftingProducts = async (req: Request, res: Response) => {
  try {
    let min = 0;
    let max = 500000;

    // Support multiple query formats:
    // 1. ?minPrice=0&maxPrice=25000
    // 2. ?range=0-25000
    // 3. ?0-25000 (as a query key)
    const { minPrice, maxPrice, range } = req.query;

    if (minPrice && maxPrice) {
      // Format 1: Traditional minPrice/maxPrice
      min = parseFloat(minPrice as string);
      max = parseFloat(maxPrice as string);
    } else if (range) {
      // Format 2: ?range=0-25000
      const rangeParts = (range as string).split('-');
      if (rangeParts.length === 2) {
        min = parseFloat(rangeParts[0]);
        max = parseFloat(rangeParts[1]);
      }
    } else {
      // Format 3: Check for range as query key (e.g., ?0-25000)
      const rangeKey = Object.keys(req.query).find(key => key.includes('-') && /^\d+-\d+$/.test(key));
      if (rangeKey) {
        const rangeParts = rangeKey.split('-');
        if (rangeParts.length === 2) {
          min = parseFloat(rangeParts[0]);
          max = parseFloat(rangeParts[1]);
        }
      }
    }
    
    if (isNaN(min) || isNaN(max) || min < 0 || max < min) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid price range. Price range must be valid numbers with min <= max. Supported formats: ?minPrice=0&maxPrice=25000, ?range=0-25000, or ?0-25000' 
      });
    }

    console.log(`🔍 Querying products with price range: ${min} - ${max}`);
    
    const products = await Product.find({
      isGiftingAvailable: true,
      price: { $gte: min, $lte: max }
    })
    .select('title price rating images category subCategory metalOptions')
    .sort({ price: 1 })
    .lean();

    console.log(`📦 Found ${products.length} products matching criteria`);
    console.log(`💰 Sample prices:`, products.slice(0, 3).map(p => ({ title: p.title, price: p.price })));

    res.json({
      success: true,
      count: products.length,
      priceRange: `${min}-${max}`,
      data: products.map(product => ({
        id: product._id,
        name: product.title,
        price: product.price,
        rating: product.rating?.score || 0,
        image: product.metalOptions?.[0]?.gallery?.[0] || product.images?.main || 'https://via.placeholder.com/300x300?text=Jewelry',
        category: product.category,
        subCategory: product.subCategory
      }))
    });
  } catch (error) {
    console.error('Error fetching gifting products:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch gifting products',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
