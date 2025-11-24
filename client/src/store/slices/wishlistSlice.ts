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
            acc[
              buildKey(item.productId, item.variantSku, item.metalColorCode)
            ] = item._id;
          }
          return acc;
        },
        {}
      );
    },
    addItem(state, action: PayloadAction<WishlistEntry>) {
      state.items.unshift(action.payload);
      state.keyMap[
        buildKey(
          action.payload.productId,
          action.payload.variantSku,
          action.payload.metalColorCode
        )
      ] = action.payload._id;
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
    if (response.success && response.data?.wishlist) {
      dispatch(setItems(response.data.wishlist));
    } else {
      dispatch(setItems([]));
    }
  } catch (error) {
    dispatch(
      setError(error instanceof Error ? error.message : "Failed to load wishlist")
    );
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
      const response = await apiService.addToWishlist(payload);
      if (response.success && response.data?.item) {
        dispatch(addItem(response.data.item));
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

