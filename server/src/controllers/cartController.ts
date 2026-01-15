import { Response } from "express";
import mongoose, { Connection, Model, Document } from "mongoose";
import Cart from "../models/cartModel";
import Product from "../models/productModel";
import { AuthRequest } from "../types";

// ---------- Helpers for accessing product collection ----------
const getCatalogConnection = (): Connection => {
  const dbName = (process.env.MONGO_DB_NAME || "catalog").toString();
  return mongoose.connection.useDb(dbName, { useCache: true });
};

// Metal color code mapping
const METAL_COLOR_CODE_MAP: Record<string, string> = {
  "White Gold": "WG",
  "Yellow Gold": "YG",
  "Rose Gold": "RG",
  Platinum: "PL",
  Silver: "SV",
};

// Helper function to get color-specific images from product
const getColorSpecificImages = async (
  product: any,
  metalColor: string
): Promise<string[]> => {
  if (
    !product?.variants ||
    !Array.isArray(product.variants) ||
    product.variants.length === 0
  ) {
    return [];
  }

  const firstVariant = product.variants[0];
  if (!firstVariant?.images || !Array.isArray(firstVariant.images)) {
    return [];
  }

  const allImgs = firstVariant.images
    .map((img: any) => img?.url ?? img?.filename ?? img)
    .filter(Boolean)
    .map(String);

  const PRIMARY_METALS = ["WG", "YG", "RG", "BR"];
  const OTHER_ALLOWED = [
    "NBV",
    "BV",
    "SV",
    "PV",
    "GP",
    "PG",
    "2T",
    "TV",
    "45",
    "FV",
    "EV",
    "BRD",
  ];
  const BARE_GENERIC = new Set([
    "GP",
    "360",
    "NBV",
    "BV",
    "45",
    "EV",
    "TV",
    "FV",
    "SV",
  ]);

  const tokenRegex = (token: string) =>
    new RegExp(`(?:^|[-_\\.\\/])${token}(?:$|[-_\\.\\/])`, "i");

  const basenameNoExt = (url: string) => {
    const name = url.split("/").pop() || "";
    const dot = name.lastIndexOf(".");
    return dot === -1 ? name : name.slice(0, dot);
  };

  const removeBareGeneric = (url: string) =>
    BARE_GENERIC.has(basenameNoExt(url).toUpperCase());

  const detectPrimariesInFilename = (url: string) =>
    PRIMARY_METALS.filter((pm) => tokenRegex(pm).test(url)).map((x) =>
      x.toUpperCase()
    );

  const strictPrimaryOnlyMatches = (token: string) => {
    if (!token) return [];
    const re = tokenRegex(token);
    return allImgs.filter((u) => {
      if (removeBareGeneric(u)) return false;
      if (!re.test(u)) return false;
      const primariesFound = detectPrimariesInFilename(u);
      return (
        primariesFound.length === 1 && primariesFound[0] === token.toUpperCase()
      );
    });
  };

  const inclusivePrimaryMatches = (token: string) => {
    if (!token) return [];
    const re = tokenRegex(token);
    return allImgs.filter((u) => !removeBareGeneric(u) && re.test(u));
  };

  const looseMatches = (token: string) => {
    if (!token) return [];
    const up = token.toUpperCase();
    return allImgs.filter(
      (u) => !removeBareGeneric(u) && u.toUpperCase().includes(up)
    );
  };

  const prefiltered = allImgs.filter((u) => !removeBareGeneric(u));

  // Convert metal color name to code
  const metalColorCode = METAL_COLOR_CODE_MAP[metalColor] || metalColor;

  let variantImages: string[] = [];

  if (metalColorCode) {
    const token = metalColorCode.toUpperCase();
    if (PRIMARY_METALS.includes(token)) {
      variantImages = strictPrimaryOnlyMatches(token);
      if (variantImages.length === 0)
        variantImages = inclusivePrimaryMatches(token);
      if (variantImages.length === 0) variantImages = looseMatches(token);
    } else {
      const re = tokenRegex(token);
      variantImages = prefiltered.filter((u) => re.test(u));
      if (variantImages.length === 0)
        variantImages = prefiltered.filter((u) =>
          u.toUpperCase().includes(token)
        );
    }
  }

  if (!variantImages || variantImages.length === 0) {
    variantImages = prefiltered.slice(0, 6);
  }

  return Array.from(new Set(variantImages)).slice(0, 24);
};

// Helper function to compare variant configurations
const areVariantConfigsEqual = (config1: any, config2: any): boolean => {
  // Define the fields that make a variant unique
  const variantFields = [
    "metalColor",
    "metalType",
    "goldKarat",
    "diamondShape",
    "diamondSize",
    "diamondOrigin",
    "diamondClarity",
    "diamondCut",
    "size", // for rings
    "length", // for chains/bracelets
    "width",
    "thickness",
    // Engraving fields
    "hasEngraving",
    "engravingText",
    "engravingMotifPath",
    "engravingImageUrl",
  ];

  // Compare each variant field
  for (const field of variantFields) {
    const value1 = config1?.[field];
    const value2 = config2?.[field];

    // Handle null/undefined comparison
    if (value1 !== value2) {
      // If both are null/undefined, they're equal
      if (value1 == null && value2 == null) {
        continue;
      }
      // If one is null/undefined and other isn't, they're different
      if (value1 == null || value2 == null) {
        return false;
      }
      // Compare actual values (case-insensitive for strings)
      if (typeof value1 === "string" && typeof value2 === "string") {
        if (value1.toLowerCase() !== value2.toLowerCase()) {
          return false;
        }
      } else if (value1 !== value2) {
        return false;
      }
    }
  }

  return true;
};

const getCollectionModel = (collectionName: string): Model<Document> => {
  const conn = getCatalogConnection();
  const modelName = `${collectionName}_model`;
  if ((conn.models as any)[modelName]) return (conn.models as any)[modelName];
  const schema = new mongoose.Schema(
    {},
    { strict: false, collection: collectionName }
  );
  return conn.model<Document>(modelName, schema, collectionName);
};

// Get user's cart
export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      // Create empty cart if doesn't exist
      cart = new Cart({ user: userId, items: [], totalAmount: 0 });
      await cart.save();
    }

    // Manually populate product data from the correct collection
    const ProductModel = getCollectionModel("products2");
    const populatedItems = await Promise.all(
      cart.items.map(async (item: any) => {
        try {
          const product = await ProductModel.findById(item.product);

          // Get color-specific images if metal color is available
          let colorSpecificImages: string[] = [];
          if (product && item.variantConfig?.metalColor) {
            try {
              colorSpecificImages = await getColorSpecificImages(
                product,
                item.variantConfig.metalColor
              );
            } catch (imageError) {
              console.error(
                `Error getting color-specific images for ${item.product}:`,
                imageError
              );
            }
          }

          // Update variant config with color-specific images
          const updatedVariantConfig = {
            ...item.variantConfig,
            variantImages:
              colorSpecificImages.length > 0
                ? colorSpecificImages
                : item.variantConfig?.variantImages || [],
            metalColorCode: item.variantConfig?.metalColor
              ? METAL_COLOR_CODE_MAP[item.variantConfig.metalColor] ||
              item.variantConfig.metalColor
              : undefined,
          };

          return {
            _id: item._id,
            quantity: item.quantity,
            price: item.price,
            variantSku: item.variantSku,
            variantConfig: updatedVariantConfig,
            product: product ? product.toObject() : null,
          };
        } catch (error) {
          console.error(`Error fetching product ${item.product}:`, error);
          return {
            _id: item._id,
            quantity: item.quantity,
            price: item.price,
            variantSku: item.variantSku || null,
            variantConfig: item.variantConfig || {},
            product: null,
          };
        }
      })
    );

    const populatedCart = {
      ...cart.toObject(),
      items: populatedItems,
    };

    res.json({
      success: true,
      data: populatedCart,
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get cart",
    });
  }
};

// Add item to cart
export const addToCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const {
      productId,
      quantity = 1,
      variantSku,
      variantConfig = {},
    } = req.body;

    console.log("🛒 ADD TO CART REQUEST:", {
      userId,
      productId,
      quantity,
      variantSku,
      variantConfig,
      requestBody: req.body,
    });

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    if (!variantSku) {
      return res.status(400).json({ message: "Variant SKU is required" });
    }

    // Verify product exists using the same approach as productController
    const ProductModel = getCollectionModel("products2");
    console.log(`🔍 Looking for product with ID: ${productId}`);
    console.log(`📦 Using collection: products2, Model: ${ProductModel.modelName}`);

    const product = await ProductModel.findById(productId);
    console.log(`✅ Product found:`, product ? `Yes (${product._id})` : 'No');

    if (!product) {
      console.error(`❌ Product not found with ID: ${productId}`);
      return res.status(404).json({ message: "Product not found" });
    }

    console.log(`✅ Product verified: ${product._id}`);

    // Note: Stock validation removed as this appears to be a made-to-order jewelry business

    // Find or create cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [], totalAmount: 0 });
    }

    // Check if exact same variant already exists in cart
    // Compare both variantSku AND variantConfig for precise matching
    const existingItemIndex = cart.items.findIndex((item) => {
      const sameProduct = item.product.toString() === productId;
      const sameVariantSku = item.variantSku === variantSku;
      const sameVariantConfig = areVariantConfigsEqual(
        item.variantConfig,
        variantConfig
      );

      console.log(`🔍 Cart comparison for product ${productId}:`, {
        sameProduct,
        sameVariantSku,
        sameVariantConfig,
        existingConfig: item.variantConfig,
        newConfig: variantConfig,
      });

      return sameProduct && sameVariantSku && sameVariantConfig;
    });

    if (existingItemIndex > -1) {
      // Update quantity if exact same variant exists
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      cart.items[existingItemIndex].quantity = newQuantity;
      console.log(`✅ Updated quantity for existing variant to ${newQuantity}`);
    } else {
      // Add new variant item to cart
      const variantPrice =
        variantConfig.sellingPrice || (product as any).price || 0;
      cart.items.push({
        product: productId,
        variantSku,
        variantConfig,
        quantity,
        price: variantPrice,
      });
      console.log(`➕ Added new variant to cart:`, {
        variantSku,
        variantConfig,
        quantity,
        price: variantPrice,
      });
    }

    await cart.save();
    console.log(`✅ Cart saved successfully. Total items in cart: ${cart.items.length}`);

    // Manually populate product details for response
    const populatedItems = await Promise.all(
      cart.items.map(async (item: any) => {
        try {
          const product = await ProductModel.findById(item.product);

          // Get color-specific images if metal color is available
          let colorSpecificImages: string[] = [];
          if (product && item.variantConfig?.metalColor) {
            try {
              colorSpecificImages = await getColorSpecificImages(
                product,
                item.variantConfig.metalColor
              );
            } catch (imageError) {
              console.error(
                `Error getting color-specific images for ${item.product}:`,
                imageError
              );
            }
          }

          // Update variant config with color-specific images and metal color code
          const updatedVariantConfig = {
            ...item.variantConfig,
            variantImages:
              colorSpecificImages.length > 0
                ? colorSpecificImages
                : item.variantConfig?.variantImages || [],
            metalColorCode: item.variantConfig?.metalColor
              ? METAL_COLOR_CODE_MAP[item.variantConfig.metalColor] ||
              item.variantConfig.metalColor
              : undefined,
          };

          return {
            _id: item._id,
            quantity: item.quantity,
            price: item.price,
            variantSku: item.variantSku,
            variantConfig: updatedVariantConfig,
            product: product ? product.toObject() : null,
          };
        } catch (error) {
          console.error(`Error fetching product ${item.product}:`, error);
          return {
            _id: item._id,
            quantity: item.quantity,
            price: item.price,
            variantSku: item.variantSku || null,
            variantConfig: item.variantConfig || {},
            product: null,
          };
        }
      })
    );

    const populatedCart = {
      ...cart.toObject(),
      items: populatedItems,
    };

    res.json({
      success: true,
      message: "Item added to cart successfully",
      data: populatedCart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add item to cart",
    });
  }
};

// Remove item from cart
export const removeFromCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { productId } = req.params;
    const { variantSku, variantConfig } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Remove specific variant from cart if variantSku and variantConfig provided
    const initialLength = cart.items.length;

    if (variantSku && variantConfig) {
      // Remove specific variant
      cart.items = cart.items.filter((item) => {
        const sameProduct = item.product.toString() === productId;
        const sameVariantSku = item.variantSku === variantSku;
        const sameVariantConfig = areVariantConfigsEqual(
          item.variantConfig,
          variantConfig
        );

        // Keep item if it doesn't match all criteria
        return !(sameProduct && sameVariantSku && sameVariantConfig);
      });
    } else {
      // Remove all variants of the product (legacy behavior)
      cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId
      );
    }

    if (cart.items.length === initialLength) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    await cart.save();

    // Manually populate product details for response
    const ProductModel = getCollectionModel("products2");
    const populatedItems = await Promise.all(
      cart.items.map(async (item: any) => {
        try {
          const product = await ProductModel.findById(item.product);

          // Get color-specific images if metal color is available
          let colorSpecificImages: string[] = [];
          if (product && item.variantConfig?.metalColor) {
            try {
              colorSpecificImages = await getColorSpecificImages(
                product,
                item.variantConfig.metalColor
              );
            } catch (imageError) {
              console.error(
                `Error getting color-specific images for ${item.product}:`,
                imageError
              );
            }
          }

          // Update variant config with color-specific images and metal color code
          const updatedVariantConfig = {
            ...item.variantConfig,
            variantImages:
              colorSpecificImages.length > 0
                ? colorSpecificImages
                : item.variantConfig?.variantImages || [],
            metalColorCode: item.variantConfig?.metalColor
              ? METAL_COLOR_CODE_MAP[item.variantConfig.metalColor] ||
              item.variantConfig.metalColor
              : undefined,
          };

          return {
            _id: item._id,
            quantity: item.quantity,
            price: item.price,
            variantSku: item.variantSku,
            variantConfig: updatedVariantConfig,
            product: product ? product.toObject() : null,
          };
        } catch (error) {
          console.error(`Error fetching product ${item.product}:`, error);
          return {
            _id: item._id,
            quantity: item.quantity,
            price: item.price,
            variantSku: item.variantSku || null,
            variantConfig: item.variantConfig || {},
            product: null,
          };
        }
      })
    );

    const populatedCart = {
      ...cart.toObject(),
      items: populatedItems,
    };

    res.json({
      success: true,
      message: "Item removed from cart successfully",
      data: populatedCart,
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove item from cart",
    });
  }
};

// Update item quantity in cart
export const updateCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { productId } = req.params;
    const { quantity, variantSku, variantConfig } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!productId || !quantity || quantity < 1) {
      return res
        .status(400)
        .json({ message: "Valid product ID and quantity are required" });
    }

    // Verify product exists using the same approach as productController
    const ProductModel = getCollectionModel("products2");
    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Note: Stock validation removed as this appears to be a made-to-order jewelry business

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find and update specific variant if provided, otherwise update first matching product
    let itemIndex = -1;

    if (variantSku && variantConfig) {
      // Find specific variant
      itemIndex = cart.items.findIndex((item) => {
        const sameProduct = item.product.toString() === productId;
        const sameVariantSku = item.variantSku === variantSku;
        const sameVariantConfig = areVariantConfigsEqual(
          item.variantConfig,
          variantConfig
        );

        return sameProduct && sameVariantSku && sameVariantConfig;
      });
    } else {
      // Legacy behavior - find first matching product
      itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );
    }

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    cart.items[itemIndex].quantity = quantity;

    // Update price from variantConfig if available, otherwise use product price
    const updatedPrice =
      variantConfig?.sellingPrice ||
      (product as any).price ||
      cart.items[itemIndex].price;
    cart.items[itemIndex].price = updatedPrice;

    await cart.save();

    // Manually populate product details for response
    const populatedItems = await Promise.all(
      cart.items.map(async (item: any) => {
        try {
          const product = await ProductModel.findById(item.product);

          // Get color-specific images if metal color is available
          let colorSpecificImages: string[] = [];
          if (product && item.variantConfig?.metalColor) {
            try {
              colorSpecificImages = await getColorSpecificImages(
                product,
                item.variantConfig.metalColor
              );
            } catch (imageError) {
              console.error(
                `Error getting color-specific images for ${item.product}:`,
                imageError
              );
            }
          }

          // Update variant config with color-specific images and metal color code
          const updatedVariantConfig = {
            ...item.variantConfig,
            variantImages:
              colorSpecificImages.length > 0
                ? colorSpecificImages
                : item.variantConfig?.variantImages || [],
            metalColorCode: item.variantConfig?.metalColor
              ? METAL_COLOR_CODE_MAP[item.variantConfig.metalColor] ||
              item.variantConfig.metalColor
              : undefined,
          };

          return {
            _id: item._id,
            quantity: item.quantity,
            price: item.price,
            variantSku: item.variantSku,
            variantConfig: updatedVariantConfig,
            product: product ? product.toObject() : null,
          };
        } catch (error) {
          console.error(`Error fetching product ${item.product}:`, error);
          return {
            _id: item._id,
            quantity: item.quantity,
            price: item.price,
            variantSku: item.variantSku || null,
            variantConfig: item.variantConfig || {},
            product: null,
          };
        }
      })
    );

    const populatedCart = {
      ...cart.toObject(),
      items: populatedItems,
    };

    res.json({
      success: true,
      message: "Cart item updated successfully",
      data: populatedCart,
    });
  } catch (error) {
    console.error("Update cart item error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update cart item",
    });
  }
};

// Remove item from cart by cart item ID (easier for frontend)
export const removeCartItemById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { itemId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!itemId) {
      return res.status(400).json({ message: "Cart item ID is required" });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Remove item by its _id
    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      (item: any) => item._id?.toString() !== itemId
    );

    if (cart.items.length === initialLength) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    await cart.save();

    // Manually populate product details for response
    const ProductModel = getCollectionModel("products2");
    const populatedItems = await Promise.all(
      cart.items.map(async (item: any) => {
        try {
          const product = await ProductModel.findById(item.product);

          // Get color-specific images if metal color is available
          let colorSpecificImages: string[] = [];
          if (product && item.variantConfig?.metalColor) {
            try {
              colorSpecificImages = await getColorSpecificImages(
                product,
                item.variantConfig.metalColor
              );
            } catch (imageError) {
              console.error(
                `Error getting color-specific images for ${item.product}:`,
                imageError
              );
            }
          }

          // Update variant config with color-specific images and metal color code
          const updatedVariantConfig = {
            ...item.variantConfig,
            variantImages:
              colorSpecificImages.length > 0
                ? colorSpecificImages
                : item.variantConfig?.variantImages || [],
            metalColorCode: item.variantConfig?.metalColor
              ? METAL_COLOR_CODE_MAP[item.variantConfig.metalColor] ||
              item.variantConfig.metalColor
              : undefined,
          };

          return {
            _id: item._id,
            quantity: item.quantity,
            price: item.price,
            variantSku: item.variantSku,
            variantConfig: updatedVariantConfig,
            product: product ? product.toObject() : null,
          };
        } catch (error) {
          console.error(`Error fetching product ${item.product}:`, error);
          return {
            _id: item._id,
            quantity: item.quantity,
            price: item.price,
            variantSku: item.variantSku || null,
            variantConfig: item.variantConfig || {},
            product: null,
          };
        }
      })
    );

    const populatedCart = {
      ...cart.toObject(),
      items: populatedItems,
    };

    res.json({
      success: true,
      message: "Cart item removed successfully",
      data: populatedCart,
    });
  } catch (error) {
    console.error("Remove cart item by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove cart item",
    });
  }
};

// Clear entire cart
export const clearCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    res.json({
      success: true,
      message: "Cart cleared successfully",
      data: cart,
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear cart",
    });
  }
};

// Update ring size for cart item
export const updateCartItemRingSize = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?._id;
    const { itemId } = req.params;
    const { ringSize } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!itemId || !ringSize) {
      return res
        .status(400)
        .json({ message: "Item ID and ring size are required" });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find the cart item
    const itemIndex = cart.items.findIndex(
      (item: any) => item._id?.toString() === itemId
    );
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    // Update the ring size in variant config
    if (!cart.items[itemIndex].variantConfig) {
      cart.items[itemIndex].variantConfig = {};
    }
    cart.items[itemIndex].variantConfig.ringSize = ringSize;

    await cart.save();

    // Manually populate product details for response
    const ProductModel = getCollectionModel("products2");
    const populatedItems = await Promise.all(
      cart.items.map(async (item: any) => {
        try {
          const product = await ProductModel.findById(item.product);

          // Get color-specific images if metal color is available
          let colorSpecificImages: string[] = [];
          if (product && item.variantConfig?.metalColor) {
            try {
              colorSpecificImages = await getColorSpecificImages(
                product,
                item.variantConfig.metalColor
              );
            } catch (imageError) {
              console.error(
                `Error getting color-specific images for ${item.product}:`,
                imageError
              );
            }
          }

          // Update variant config with color-specific images and metal color code
          const updatedVariantConfig = {
            ...item.variantConfig,
            variantImages:
              colorSpecificImages.length > 0
                ? colorSpecificImages
                : item.variantConfig?.variantImages || [],
            metalColorCode: item.variantConfig?.metalColor
              ? METAL_COLOR_CODE_MAP[item.variantConfig.metalColor] ||
              item.variantConfig.metalColor
              : undefined,
          };

          return {
            _id: item._id,
            quantity: item.quantity,
            price: item.price,
            variantSku: item.variantSku,
            variantConfig: updatedVariantConfig,
            product: product ? product.toObject() : null,
          };
        } catch (error) {
          console.error(`Error fetching product ${item.product}:`, error);
          return {
            _id: item._id,
            quantity: item.quantity,
            price: item.price,
            variantSku: item.variantSku || null,
            variantConfig: item.variantConfig || {},
            product: null,
          };
        }
      })
    );

    const populatedCart = {
      ...cart.toObject(),
      items: populatedItems,
    };

    res.json({
      success: true,
      message: "Ring size updated successfully",
      data: populatedCart,
    });
  } catch (error) {
    console.error("Update ring size error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update ring size",
    });
  }
};
