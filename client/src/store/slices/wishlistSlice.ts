import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { apiService } from "@/services/api";
import type { RootState } from "@/store";
import { logoutSucceeded } from "./authSlice";

export interface WishlistEntry {
  _id: string;
  productId: string;
  modelSku: string;
  category: string;
  categorySlug: string;
  title: string;
  price: number | null;
  image: string | null;
  rating?: {
    score?: number;
    reviews?: number;
  } | null;
  variantSku?: string | null;
  metalColorName?: string | null;
  metalColorCode?: string | null;
  engraving?: {
    text?: string;
    motif?: string;
    imageUrl?: string;
  } | null;
  isEngraving?: boolean;
  addedAt?: string;
}

interface WishlistState {
  items: WishlistEntry[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
  keyMap: Record<string, string>;
}

const initialState: WishlistState = {
  items: [],
  loading: false,
  error: null,
  initialized: false,
  keyMap: {},
};

const buildKey = (
  productId: string,
  variantSku?: string | null,
  metalColorCode?: string | null
) => `${productId}::${variantSku || ""}::${metalColorCode || ""}`;

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setItems(state, action: PayloadAction<WishlistEntry[]>) {
      state.items = action.payload;
      state.error = null;
      state.initialized = true;
      state.keyMap = action.payload.reduce<Record<string, string>>(
        (acc, item) => {
          if (item.productId) {
            const key = buildKey(item.productId, item.variantSku, item.metalColorCode);
            acc[key] = item._id;
            console.log("📝 Building keyMap entry:", { productId: item.productId, variantSku: item.variantSku, metalColorCode: item.metalColorCode, key });
          }
          return acc;
        },
        {}
      );
      console.log("🔑 Final keyMap from setItems:", state.keyMap);
    },
    addItem(state, action: PayloadAction<WishlistEntry>) {
      console.log("✅ Adding to wishlist:", {
        productId: action.payload.productId,
        variantSku: action.payload.variantSku,
        metalColorCode: action.payload.metalColorCode,
        key: buildKey(action.payload.productId, action.payload.variantSku, action.payload.metalColorCode),
      });
      state.items.unshift(action.payload);
      state.keyMap[
        buildKey(
          action.payload.productId,
          action.payload.variantSku,
          action.payload.metalColorCode
        )
      ] = action.payload._id;
      console.log("📊 Updated keyMap:", state.keyMap);
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item._id !== action.payload);
      state.keyMap = Object.entries(state.keyMap).reduce<
        Record<string, string>
      >((acc, [key, value]) => {
        if (value !== action.payload) {
          acc[key] = value;
        }
        return acc;
      }, {});
    },
    resetWishlist() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logoutSucceeded, () => initialState);
  },
});

export const { setLoading, setError, setItems, addItem, removeItem } =
  wishlistSlice.actions;

export const fetchWishlist = () => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    dispatch(setError(null));
    const response = await apiService.getWishlist();
    
    if (response.success && response.data && typeof response.data === 'object' && 'wishlist' in response.data) {
      // Successfully retrieved wishlist (even if empty)
      const wishlistData = response.data as { wishlist: WishlistEntry[]; count?: number };
      dispatch(setItems(wishlistData.wishlist || []));
    } else {
      // Handle different error scenarios
      const errorMessage = response.error || "Failed to load wishlist";
      
      // Check if it's an authentication error
      if (errorMessage.toLowerCase().includes('authenticated') || 
          errorMessage.toLowerCase().includes('unauthorized') ||
          errorMessage.toLowerCase().includes('401')) {
        // Don't set error for auth issues - let the page handle it
        dispatch(setItems([]));
        dispatch(setError(null));
      } else {
        // Only set error for actual failures, not empty responses
        dispatch(setError(errorMessage));
        dispatch(setItems([]));
      }
    }
  } catch (error) {
    // Network or other errors
    const errorMessage = error instanceof Error ? error.message : "Failed to load wishlist";
    
    // Don't set error for network issues that might be temporary
    if (errorMessage.includes('Network error')) {
      dispatch(setError("Unable to connect to server. Please check your connection."));
    } else {
      dispatch(setError(errorMessage));
    }
    dispatch(setItems([]));
  } finally {
    dispatch(setLoading(false));
  }
};

export const addWishlistItem =
  (payload: Parameters<typeof apiService.addToWishlist>[0]) =>
  async (dispatch: any) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      console.log("📤 Sending to API:", payload);
      const response = await apiService.addToWishlist(payload);
      console.log("📥 API Response:", response);
      if (response.success && response.data && typeof response.data === 'object' && 'item' in response.data) {
        const itemData = response.data as { item: WishlistEntry };
        console.log("🎯 Item from API:", itemData.item);
        dispatch(addItem(itemData.item));
        return { success: true };
      } else {
        const errorMessage =
          response.error || "Failed to add item to wishlist";
        dispatch(setError(errorMessage));
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to add item to wishlist";
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  };

export const removeWishlistItemThunk =
  (itemId: string) => async (dispatch: any) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const response = await apiService.removeFromWishlist(itemId);
      if (response.success) {
        dispatch(removeItem(itemId));
        return { success: true };
      } else {
        const errorMessage =
          response.error || "Failed to remove item from wishlist";
        dispatch(setError(errorMessage));
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to remove item from wishlist";
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  };

export const selectWishlistItems = (state: RootState) =>
  state.wishlist.items;
export const selectWishlistLoading = (state: RootState) =>
  state.wishlist.loading;
export const selectWishlistInitialized = (state: RootState) =>
  state.wishlist.initialized;
export const selectWishlistKeyMap = (state: RootState) => state.wishlist.keyMap;

export const selectWishlistEntryId = (
  state: RootState,
  productId: string,
  variantSku?: string | null,
  metalColorCode?: string | null
) =>
  state.wishlist.keyMap[
    buildKey(productId, variantSku || null, metalColorCode || null)
  ];

export const buildWishlistKey = buildKey;

export default wishlistSlice.reducer;

