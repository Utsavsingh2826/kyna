import { Response } from 'express';
import mongoose, { Connection, Document, Model } from 'mongoose';
import Product, { IProduct } from '../models/productModel';
import WishlistItem, {
  IWishlistEngraving,
  IWishlistItem,
} from '../models/wishlistItemModel';
import { AuthRequest } from '../types';

const getCatalogDbName = () =>
  process.env.CATALOG_DB_NAME ||
  process.env.CATALOG_DB ||
  process.env.PRODUCTS_DB ||
  process.env.MONGO_DB_NAME ||
  mongoose.connection.name;

const getCatalogConnection = (): Connection => {
  const dbName = getCatalogDbName();
  return mongoose.connection.useDb(dbName, { useCache: true });
};

const getCollectionModel = (collectionName: string): Model<Document> => {
  const conn = getCatalogConnection();
  const modelName = `${collectionName}_model`;
  if ((conn.models as any)[modelName]) {
    return (conn.models as any)[modelName];
  }
  const schema = new mongoose.Schema({}, { strict: false, collection: collectionName });
  return conn.model<Document>(modelName, schema, collectionName);
};

const PRODUCT_COLLECTION = 'products';

const CATEGORY_SLUG_MAP: Record<string, string> = {
  ring: 'rings',
  rings: 'rings',
  'gents ring': 'rings',
  'mens ring': 'rings',
  bracelet: 'bracelets',
  bracelets: 'bracelets',
  pendant: 'pendants',
  pendants: 'pendants',
  necklace: 'pendants',
  earring: 'earrings',
  earrings: 'earrings',
};

const normalizeCategorySlug = (value?: string): string => {
  if (!value) return 'rings';
  const key = value.toLowerCase();
  return CATEGORY_SLUG_MAP[key] || key.replace(/\s+/g, '-');
};

const toPlainObject = (value: any) =>
  value && typeof value.toObject === 'function' ? value.toObject() : value;

const fetchCatalogProduct = async ({
  productId,
  modelSku,
}: {
  productId?: string | null;
  modelSku?: string | null;
}) => {
  const ProductModel = getCollectionModel(PRODUCT_COLLECTION);
  let doc: Document | null = null;

  if (productId) {
    try {
      doc = await ProductModel.findById(productId);
    } catch {
      try {
        doc = await ProductModel.findOne({ _id: productId });
      } catch {
        doc = null;
      }
    }
  }

  if (!doc && modelSku) {
    doc = await ProductModel.findOne({ modelSku });
  }

  return doc;
};

const buildWishlistItemResponse = (
  item: IWishlistItem,
  productDoc?: IProduct | Document | null
) => {
  const product = productDoc ? toPlainObject(productDoc) : null;
  const resolvedProductId =
    item.productId ||
    product?._id?.toString?.() ||
    item.productRef?.toString() ||
    null;

  const resolvedTitle =
    item.titleSnapshot || product?.title || 'Product no longer available';

  const resolvedPrice =
    item.priceSnapshot ??
    product?.sellingPriceWithGST ??
    product?.sellingPrice ??
    product?.price ??
    product?.priceBreakdown?.totalWithGst ??
    product?.priceBreakdown?.totalWithGST ??
    null;

  const resolvedImage =
    item.imageSnapshot ||
    product?.firstVariantImageUrl ||
    product?.primaryImage ||
    product?.images?.main ||
    product?.images?.[0]?.url ||
    product?.variantImages?.[0] ||
    null;

  const resolvedRating =
    product?.rating || item.ratingSnapshot
      ? {
        score:
          product?.rating?.score ??
          item.ratingSnapshot?.score ??
          product?.rating?.value ??
          null,
        reviews:
          product?.rating?.reviews ??
          item.ratingSnapshot?.reviews ??
          product?.rating?.count ??
          null,
      }
      : null;

  return {
    _id: item._id,
    productId: resolvedProductId,
    modelSku: item.modelSku || product?.modelSku || product?.sku || '',
    category: item.category || product?.category || '',
    categorySlug:
      item.categorySlug || normalizeCategorySlug(product?.category),
    title: resolvedTitle,
    price: resolvedPrice,
    image: resolvedImage,
    rating: resolvedRating,
    variantSku: item.variantSku || null,
    metalColorName: item.metalColorName || null,
    metalColorCode: item.metalColorCode || null,
    engraving: item.engraving || null,
    isEngraving: item.isEngraving ?? Boolean(product?.isEngraving),
    addedAt: item.createdAt,
  };
};

const findExistingWishlistItem = async ({
  userId,
  productId,
  variantSku,
  metalColorCode,
}: {
  userId: string;
  productId: string;
  variantSku?: string | null;
  metalColorCode?: string | null;
}) => {
  const query: Record<string, any> = {
    user: userId,
    productId,
  };

  query.variantSku = variantSku || null;
  query.metalColorCode = metalColorCode || null;

  return WishlistItem.findOne(query);
};

// Get user's wishlist
export const getWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const items = await WishlistItem.find({ user: userId }).sort({
      createdAt: -1,
    });

    const normalized = await Promise.all(
      items.map(async (item) => {
        let productDoc: any = null;
        try {
          productDoc = await fetchCatalogProduct({
            productId: item.productId,
            modelSku: item.modelSku,
          });
        } catch (error) {
          console.error('Wishlist catalog fetch error:', error);
        }

        if (!productDoc && item.productRef) {
          try {
            productDoc = await Product.findById(item.productRef);
          } catch (error) {
            console.error('Wishlist legacy product fetch error:', error);
          }
        }

        return buildWishlistItemResponse(item, productDoc);
      })
    );

    return res.json({
      success: true,
      message: 'Wishlist retrieved successfully',
      data: {
        wishlist: normalized,
        count: normalized.length,
      },
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve wishlist',
    });
  }
};

// Add product to wishlist
export const addToWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const {
      productId,
      modelSku,
      title,
      categorySlug,
      categoryLabel,
      variantSku,
      metalColorName,
      metalColorCode,
      primaryImage,
      price,
      engraving,
    }: {
      productId?: string;
      modelSku?: string;
      title?: string;
      categorySlug?: string;
      categoryLabel?: string;
      variantSku?: string;
      metalColorName?: string;
      metalColorCode?: string;
      primaryImage?: string | null;
      price?: number | null;
      engraving?: IWishlistEngraving;
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required',
      });
    }

    const normalizedVariant = variantSku || null;
    const normalizedMetalColorCode = metalColorCode || null;

    let catalogProduct: Document | null = null;
    try {
      catalogProduct = await fetchCatalogProduct({
        productId,
        modelSku,
      });
    } catch (error) {
      console.error('Wishlist catalog fetch error:', error);
    }

    let legacyProduct: IProduct | null = null;
    if (!catalogProduct) {
      try {
        legacyProduct =
          (await Product.findById(productId)) ||
          (modelSku ? await Product.findOne({ sku: modelSku }) : null);
      } catch (error) {
        console.error('Wishlist legacy product lookup error:', error);
      }
    }

    if (!catalogProduct && !legacyProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const productSnapshot = toPlainObject(catalogProduct || legacyProduct);
    const normalizedPrice =
      typeof price === 'number' && Number.isFinite(price) ? price : null;
    
    // Use the productId sent by the client directly - it's already the correct ID
    const normalizedProductId = productId;

    const existingItem = await findExistingWishlistItem({
      userId,
      productId: normalizedProductId,
      variantSku: normalizedVariant,
      metalColorCode: normalizedMetalColorCode,
    });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist',
      });
    }

    const savedItem = await WishlistItem.create({
      user: userId,
      productId: normalizedProductId,
      productRef: legacyProduct?._id,
      modelSku:
        modelSku ||
        productSnapshot?.modelSku ||
        productSnapshot?.sku ||
        normalizedProductId,
      category: categoryLabel || productSnapshot?.category || 'rings',
      categorySlug: normalizeCategorySlug(
        categorySlug || productSnapshot?.category
      ),
      titleSnapshot: title || productSnapshot?.title,
      priceSnapshot:
        normalizedPrice ??
        productSnapshot?.sellingPriceWithGST ??
        productSnapshot?.sellingPrice ??
        productSnapshot?.price ??
        null,
      imageSnapshot:
        primaryImage ||
        productSnapshot?.firstVariantImageUrl ||
        productSnapshot?.primaryImage ||
        productSnapshot?.images?.main ||
        productSnapshot?.images?.[0]?.url ||
        productSnapshot?.variantImages?.[0] ||
        null,
      ratingSnapshot: productSnapshot?.rating
        ? {
          score: productSnapshot.rating.score,
          reviews: productSnapshot.rating.reviews,
        }
        : undefined,
      variantSku: normalizedVariant,
      metalColorName,
      metalColorCode: normalizedMetalColorCode,
      engraving,
      isEngraving:
        typeof productSnapshot?.isEngraving === 'boolean'
          ? productSnapshot.isEngraving
          : Boolean(productSnapshot?.engraving),
    });

    const normalized = buildWishlistItemResponse(
      savedItem,
      catalogProduct || legacyProduct
    );

    return res.json({
      success: true,
      message: 'Product added to wishlist successfully',
      data: {
        item: normalized,
      },
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add product to wishlist',
    });
  }
};

// Remove product from wishlist
export const removeFromWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { itemId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: 'Wishlist item ID is required',
      });
    }

    const deleted = await WishlistItem.findOneAndDelete({
      _id: itemId,
      user: userId,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist item not found',
      });
    }

    return res.json({
      success: true,
      message: 'Product removed from wishlist successfully',
      data: { itemId },
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove product from wishlist',
    });
  }
};

// Check if product is in wishlist
export const checkWishlistStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { productId } = req.params;
    const { variantSku, metalColorCode } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required',
      });
    }

    const normalizedVariant =
      typeof variantSku === 'string' ? variantSku : null;
    const normalizedMetalColorCode =
      typeof metalColorCode === 'string' ? metalColorCode : null;

    const existingItem = await findExistingWishlistItem({
      userId,
      productId,
      variantSku: normalizedVariant,
      metalColorCode: normalizedMetalColorCode,
    });

    return res.json({
      success: true,
      message: 'Wishlist status retrieved successfully',
      data: {
        isInWishlist: Boolean(existingItem),
        itemId: existingItem?._id,
      },
    });
  } catch (error) {
    console.error('Check wishlist status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check wishlist status',
    });
  }
};