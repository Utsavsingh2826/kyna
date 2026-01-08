import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Category = "rings" | "earrings" | "pendants" | "bracelets";

interface CachedProducts {
  products: any[];
  pagination: {
    totalPages: number;
    currentPage: number;
    limit: number;
    total: number;
  } | null;
  appliedFilters: any;
  queryKey: string; // identifies filters + price
  timestamp: number;
}

interface ProductsCacheState {
  byCategory: Record<Category, CachedProducts | null>;
}

const initialState: ProductsCacheState = {
  byCategory: {
    rings: null,
    earrings: null,
    pendants: null,
    bracelets: null,
  },
};

const productsCacheSlice = createSlice({
  name: "productsCache",
  initialState,
  reducers: {
    saveCategoryProducts(
      state,
      action: PayloadAction<{
        category: Category;
        data: CachedProducts;
      }>
    ) {
      state.byCategory[action.payload.category] = action.payload.data;
    },

    clearCategoryCache(state, action: PayloadAction<Category>) {
      state.byCategory[action.payload] = null;
    },

    clearAllCache(state) {
      state.byCategory = initialState.byCategory;
    },
  },
});

export const { saveCategoryProducts, clearCategoryCache, clearAllCache } =
  productsCacheSlice.actions;

export default productsCacheSlice.reducer;
