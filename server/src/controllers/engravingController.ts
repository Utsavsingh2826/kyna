import { Request, Response } from 'express';
import Product from '../models/productModel';
import cloudinary from '../config/cloudinary';

// GET /api/engraving/products - Fetch all products where isEngraving = true
export const getEngravingProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({ isEngraving: true }).select('-__v');
    
    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error fetching engraving products:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: (error as Error).message
    });
  }
};

// POST /api/engraving/upload - Upload engraved image and save URL to product
export const uploadEngravingImage = async (req: Request, res: Response) => {
  try {
    const { productId } = req.body;
    const userId = (req as any).userId || (req as any).user?.id;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required'
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update product with engraving image URL and userId
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { 
        engravingImage: (req.file as any).path,
        isEngraving: true,
        // Store userId with the engraving for order tracking
        'engraving.userId': userId,
        'engraving.uploadedAt': new Date()
      },
      { new: true }
    ).select('-__v');

    res.status(200).json({
      success: true,
      message: 'Engraving uploaded successfully',
      data: {
        productId: updatedProduct?._id,
        engravingImage: updatedProduct?.engravingImage,
        userId: userId,
        uploadedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error uploading engraving image:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: (error as Error).message
    });
  }
};

// POST /api/engraving/create-product - Create a new product (for testing)
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, price, image, description, category, isEngraving } = req.body;

    if (!name || !price || !image) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, and image are required'
      });
    }

    const product = new Product({
      title: name, // Using title field from our schema
      price,
      image, // This will be stored in metalOptions gallery
      description,
      category,
      subCategory: 'Ring', // Default subCategory
      isEngraving: isEngraving || false
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: (error as Error).message
    });
  }
};

// GET /api/engraving/product/:id - Get specific product with engraving details
export const getProductEngravingDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id).select('-__v');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: product._id,
        title: product.title,
        price: product.price,
        isEngraving: product.isEngraving,
        engravingImage: product.engravingImage,
        engraving: product.engraving,
        // Include userId information for order tracking
        engravingUserId: product.engraving?.userId,
        engravingUploadedAt: product.engraving?.uploadedAt
      }
    });
  } catch (error) {
    console.error('Error fetching product engraving details:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: (error as Error).message
    });
  }
};

// GET /api/engraving/user-images - Get all engraving images uploaded by the authenticated user
export const getUserEngravingImages = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    // Find all products with engraving images uploaded by this user
    const products = await Product.find({
      'engraving.userId': userId,
      engravingImage: { $exists: true, $ne: null }
    }).select('_id title engravingImage engraving').sort({ 'engraving.uploadedAt': -1 });

    res.status(200).json({
      success: true,
      data: {
        userId: userId,
        totalImages: products.length,
        images: products.map(product => ({
          productId: product._id,
          productTitle: product.title,
          engravingImage: product.engravingImage,
          uploadedAt: product.engraving?.uploadedAt
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching user engraving images:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: (error as Error).message
    });
  }
};

// PUT /api/engraving/product/:id/toggle - Toggle engraving availability for a product
export const toggleEngravingAvailability = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isEngraving } = req.body;
    
    const product = await Product.findByIdAndUpdate(
      id,
      { isEngraving: isEngraving },
      { new: true }
    ).select('-__v');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Engraving ${isEngraving ? 'enabled' : 'disabled'} for product`,
      data: {
        id: product._id,
        title: product.title,
        isEngraving: product.isEngraving
      }
    });
  } catch (error) {
    console.error('Error toggling engraving availability:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: (error as Error).message
    });
  }
};
