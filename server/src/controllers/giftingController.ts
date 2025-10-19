import { Request, Response } from 'express';
import Product from '../models/productModel';

export const getGiftingProducts = async (req: Request, res: Response) => {
  try {
    const { minPrice = '0', maxPrice = '500000' } = req.query;
    
    const min = parseFloat(minPrice as string);
    const max = parseFloat(maxPrice as string);
    
    if (isNaN(min) || isNaN(max) || min < 0 || max < min) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid price range. minPrice and maxPrice must be valid numbers with minPrice <= maxPrice' 
      });
    }

    const products = await Product.find({
      isGiftingAvailable: true,
      price: { $gte: min, $lte: max }
    })
    .select('name price rating images category subCategory')
    .sort({ price: 1 })
    .lean();

    res.json({
      success: true,
      count: products.length,
      data: products.map(product => ({
        id: product._id,
        name: product.title,
        price: product.price,
        rating: product.rating?.score || 0,
        image: product.metalOptions?.[0]?.gallery?.[0] || 'https://via.placeholder.com/300x300?text=Jewelry',
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
