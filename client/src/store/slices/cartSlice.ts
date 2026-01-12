import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { apiService } from "@/services/api";

interface CartItem {
  _id: string;
  product: {
    _id: string;
    title: string;
    price: number;
    images?: {
      main: string;
      sub: string[];
    };
    modelSku: string;
    createdAt?: string;
  };
  variantSku: string; // Specific variant SKU
  variantConfig: {
    metalColor?: string;
    metalType?: string;
    goldKarat?: string;
    diamondShape?: string;
    diamondSize?: string;
    diamondOrigin?: string;
    diamondColor?: string;
    diamondClarity?: string;
    ringSize?: string;
    centerStoneShape?: string;
    centerStoneSize?: string;
    priceBreakdown?: [
      {
        metalCost: number;
        gstAmount: number;
        finalPrice: number;
        sellingPrice: number;
      }
    ]; // New field for price breakdown
  };
  quantity: number;
  price: number;
}

interface Cart {
  _id: string;
  user: string;
  items?: CartItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

interface CartState {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  cart: null,
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setCart(state, action: PayloadAction<Cart | null>) {
      state.cart = action.payload;
      state.error = null;
    },
    clearCart(state) {
      state.cart = null;
      state.error = null;
    },
  },
});

export const { setLoading, setError, setCart, clearCart } = cartSlice.actions;

// Async thunks for cart operations
export const fetchCart = () => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const response = (await apiService.getCart()) as {
      success: boolean;
      data: Cart;
    };

    if (response.success && response.data) {
      // The response.data contains the cart object directly
      const cartData: Cart = {
        _id: response.data._id,
        user: response.data.user,
        items: response.data.items || [],
        totalAmount: response.data.totalAmount,
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt,
      };
      dispatch(setCart(cartData));
    } else {
      dispatch(setCart(null));
    }
  } catch (error) {
    dispatch(
      setError(error instanceof Error ? error.message : "Failed to fetch cart")
    );
    dispatch(setCart(null));
  } finally {
    dispatch(setLoading(false));
  }
};

export const addToCart =
  (
    productId: string,
    quantity: number = 1,
    variantData?: {
      variantSku: string;
      variantConfig: {
        metalColor?: string;
        metalType?: string;
        goldKarat?: string;
        diamondShape?: string;
        diamondSize?: string;
        diamondOrigin?: string;
        diamondColor?: string;
        diamondClarity?: string;
        ringSize?: string;
        centerStoneShape?: string;
        centerStoneSize?: string;
      };
    }
  ) =>
  async (dispatch: any) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await apiService.addToCart(
        productId,
        quantity,
        variantData
      );

      if (response.success) {
        dispatch(fetchCart()); // Refresh cart
      } else {
        dispatch(setError(response.error || "Failed to add item to cart"));
      }
    } catch (error) {
      dispatch(
        setError(
          error instanceof Error ? error.message : "Failed to add item to cart"
        )
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

export const updateCartItem =
  (
    productId: string,
    quantity: number,
    variantData?: {
      variantSku?: string;
      variantConfig?: {
        metalColor?: string;
        metalType?: string;
        goldKarat?: string;
        diamondShape?: string;
        diamondSize?: string;
        diamondOrigin?: string;
        diamondColor?: string;
        diamondClarity?: string;
        ringSize?: string;
        centerStoneShape?: string;
        centerStoneSize?: string;
      };
    }
  ) =>
  async (dispatch: any) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      console.log("🚀 Redux updateCartItem - Sending to API:", {
        productId,
        quantity,
        variantData,
      });

      const response = await apiService.updateCartItem(
        productId,
        quantity,
        variantData
      );

      if (response.success) {
        dispatch(fetchCart()); // Refresh cart
      } else {
        dispatch(setError(response.error || "Failed to update cart item"));
      }
    } catch (error) {
      dispatch(
        setError(
          error instanceof Error ? error.message : "Failed to update cart item"
        )
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

export const removeFromCart =
  (
    productId: string,
    variantData?: {
      variantSku?: string;
      variantConfig?: {
        metalColor?: string;
        metalType?: string;
        goldKarat?: string;
        diamondShape?: string;
        diamondSize?: string;
        diamondOrigin?: string;
        diamondColor?: string;
        diamondClarity?: string;
        ringSize?: string;
        centerStoneShape?: string;
        centerStoneSize?: string;
      };
    }
  ) =>
  async (dispatch: any) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await apiService.removeFromCart(productId, variantData);

      if (response.success) {
        dispatch(fetchCart()); // Refresh cart
      } else {
        dispatch(setError(response.error || "Failed to remove item from cart"));
      }
    } catch (error) {
      dispatch(
        setError(
          error instanceof Error
            ? error.message
            : "Failed to remove item from cart"
        )
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

export const clearCartItems = () => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    const response = await apiService.clearCart();

    if (response.success) {
      dispatch(clearCart());
    } else {
      dispatch(setError(response.error || "Failed to clear cart"));
    }
  } catch (error) {
    dispatch(
      setError(error instanceof Error ? error.message : "Failed to clear cart")
    );
  } finally {
    dispatch(setLoading(false));
  }
};

export default cartSlice.reducer;
