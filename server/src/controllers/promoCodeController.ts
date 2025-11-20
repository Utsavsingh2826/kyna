import { Response } from "express";
import PromoCode from "../models/promoCodeModel";
import User from "../models/userModel";
import Cart from "../models/cartModel";
import { AuthRequest } from "../types";

type PromoContext = "cart" | "direct";

const getDiamondValueFromProduct = (product: any): number => {
  if (!product) return 0;

  const breakdownDiamond =
    product.priceBreakdown?.diamondCost ??
    product.priceBreakdown?.diamondPrice ??
    product.diamondTotalValue;

  return typeof breakdownDiamond === "number" && breakdownDiamond > 0
    ? breakdownDiamond
    : 0;
};

const calculateDiamondSubtotalFromCart = async (userId: string) => {
  const cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart || !cart.items.length) {
    return { diamondSubtotal: 0, itemCount: 0 };
  }

  const diamondSubtotal = cart.items.reduce((sum, item: any) => {
    const perUnitDiamond = getDiamondValueFromProduct(item.product);
    return sum + perUnitDiamond * (item.quantity || 1);
  }, 0);

  return { diamondSubtotal, itemCount: cart.items.length };
};

export const validatePromoCode = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const {
      code,
      context = "cart",
      directPurchase,
    }: { code?: string; context?: PromoContext; directPurchase?: { diamondCost?: number } } =
      req.body || {};

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Promo code is required",
      });
    }

    const promoCode = await PromoCode.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: "Promo code not found or inactive",
      });
    }

    const user = await User.findById(userId).select("usedPromoCodes");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const alreadyUsed = user.usedPromoCodes?.some(
      (entry) => entry.code === promoCode.code
    );
    if (alreadyUsed) {
      return res.status(400).json({
        success: false,
        message: "You have already redeemed this promo",
      });
    }

    let diamondSubtotal = 0;

    if (context === "direct") {
      const directDiamondCost = directPurchase?.diamondCost;
      if (typeof directDiamondCost !== "number" || directDiamondCost <= 0) {
        return res.status(400).json({
          success: false,
          message:
            "Diamond cost is required for direct purchases to apply this promo",
        });
      }
      diamondSubtotal = directDiamondCost;
    } else {
      const { diamondSubtotal: cartDiamondSubtotal, itemCount } =
        await calculateDiamondSubtotalFromCart(userId.toString());

      if (!itemCount) {
        return res.status(400).json({
          success: false,
          message: "Add items to your cart before applying a promo",
        });
      }

      diamondSubtotal = cartDiamondSubtotal;
    }

    if (!diamondSubtotal || diamondSubtotal <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "This promo applies only to diamond components. Eligible diamond value was not found.",
      });
    }

    const discountValue = Math.round(
      (diamondSubtotal * promoCode.discountPercent) / 100
    );

    if (discountValue <= 0) {
      return res.status(400).json({
        success: false,
        message: "Promo discount could not be calculated for this order",
      });
    }

    return res.json({
      success: true,
      message: "Promo code applied to diamond total",
      data: {
        promoId: promoCode._id,
        code: promoCode.code,
        discountPercent: promoCode.discountPercent,
        discountValue,
        diamondSubtotal,
        description: promoCode.description,
        appliedOn: "diamond",
      },
    });
  } catch (error) {
    console.error("validatePromoCode error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to validate promo code",
    });
  }
};
