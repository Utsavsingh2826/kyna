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
    const ProductModel = getCollectionModel("products");
    const populatedItems = await Promise.all(
      cart.items.map(async (item: any) => {
        try {
          const product = await ProductModel.findById(item.product);
          return {
            _id: item._id,
            quantity: item.quantity,
            price: item.price,
            variantSku: item.variantSku,
            variantConfig: item.variantConfig,
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
    const ProductModel = getCollectionModel("products");
    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Note: Stock validation removed as this appears to be a made-to-order jewelry business

    // Find or create cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [], totalAmount: 0 });
    }

    // Check if exact same variant already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId && item.variantSku === variantSku
    );

    if (existingItemIndex > -1) {
      // Update quantity if exact same variant exists
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      cart.items[existingItemIndex].quantity = newQuantity;
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
    }

    await cart.save();

    // Manually populate product details for response
    const populatedItems = await Promise.all(
      cart.items.map(async (item: any) => {
        try {
          const product = await ProductModel.findById(item.product);
          return {
            _id: item._id,
            quantity: item.quantity,
            price: item.price,
            variantSku: item.variantSku,
            variantConfig: item.variantConfig,
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

    // Remove item from cart
    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    if (cart.items.length === initialLength) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    await cart.save();

    // Populate product details for response
    await cart.populate("items.product");

    res.json({
      success: true,
      message: "Item removed from cart successfully",
      data: cart,
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
    const { quantity } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!productId || !quantity || quantity < 1) {
      return res
        .status(400)
        .json({ message: "Valid product ID and quantity are required" });
    }

    // Verify product exists using the same approach as productController
    const ProductModel = getCollectionModel("products");
    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Note: Stock validation removed as this appears to be a made-to-order jewelry business

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find and update item
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].price = (product as any).price || 0; // Update price in case it changed

    await cart.save();

    // Populate product details for response
    await cart.populate("items.product");

    res.json({
      success: true,
      message: "Cart item updated successfully",
      data: cart,
    });
  } catch (error) {
    console.error("Update cart item error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update cart item",
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
    const ProductModel = getCollectionModel("products");
    const populatedItems = await Promise.all(
      cart.items.map(async (item: any) => {
        try {
          const product = await ProductModel.findById(item.product);
          return {
            _id: item._id,
            quantity: item.quantity,
            price: item.price,
            variantSku: item.variantSku,
            variantConfig: item.variantConfig,
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
