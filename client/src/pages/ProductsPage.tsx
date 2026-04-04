import { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Heart } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  FilterGroup,
  // DiamondShapeSelector,
  PriceRangeSlider,
} from "@/components/Engravings";
import "./ProductPage.css";
import type { AppDispatch, RootState } from "@/store";
import {
  addWishlistItem,
  buildWishlistKey,
  fetchWishlist,
  removeWishlistItemThunk,
  selectWishlistInitialized,
  selectWishlistKeyMap,
  selectWishlistLoading,
} from "@/store/slices/wishlistSlice";
import {
  saveCategoryProducts,
} from "@/store/slices/productsCacheSlice";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";

type MainCategory = "rings" | "earrings" | "pendants" | "bracelets";

interface Product {
  _id?: string;
  modelSku: string;
  metalTypes: string[];
  title: string;
  slug: string;
  variantCount: number;
  firstVariantSku: string;
  firstVariantImageUrl: string;
  sellingPrice: number;
  priceIncomplete: boolean;
}

interface ApiResponse {
  success: boolean;
  count: number;
  total: number;
  pagination: {
    totalPages: number;
    currentPage: number;
    limit: number;
  };
  appliedFilters?: {
    category?: string;
    centerStoneShape?: string[];
    ringTypeRequested?: string[];
    ringPrefixesApplied?: string[];
    earringType?: string[];
    pendantType?: string[];
    braceletType?: string[];
  };
  products: Product[];
}

export default function ProductsPage({ category }: { category: MainCategory }) {
  const location = window.location;
  const isEngravingsPage = location.pathname === "/engravings";
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  // Separate UI state (updates immediately while sliding) and API state (debounced)
  const [minPriceUI, setMinPriceUI] = useState<number>(0);
  const [maxPriceUI, setMaxPriceUI] = useState<number>(50000);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(50000);
  const priceDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const mainContainerRef = useRef<HTMLElement | null>(null);
  const toastShownRef = useRef<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingCache, setUsingCache] = useState(false);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    limit: 20,
    total: 0,
  });
  const [appliedFilters, setAppliedFilters] = useState<
    ApiResponse["appliedFilters"] | null
  >(null);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const wishlistInitialized = useSelector(selectWishlistInitialized);
  const wishlistLoading = useSelector(selectWishlistLoading);
  const wishlistKeyMap = useSelector(selectWishlistKeyMap);
  const cachedData = useSelector(
    (state: RootState) => state.productsCache.byCategory[category],
  );

  useEffect(() => {
    if (isAuthenticated && !wishlistInitialized && !wishlistLoading) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated, wishlistInitialized, wishlistLoading]);

  // Show toast on engravings page
  useEffect(() => {
    if (isEngravingsPage && !toastShownRef.current) {
      toastShownRef.current = true;
      toast.success("Select a variant to add engraving in it", {
        action: {
          label: "Okay",
          onClick: () => {},
        },
      });
    }
  }, [isEngravingsPage]);

  // Filter state management with backend parameter names - category-specific for all jewelry types
  const [activeFilters, setActiveFilters] = useState({
    // Ring categories and filters
    ring_category: [] as string[],
    solitaire_diamond_shape: [] as string[],
    engagement_diamond_shape: [] as string[],
    fashion_diamond_shape: [] as string[],
    mens_diamond_shape: [] as string[],

    // Earring categories and filters
    earring_category: [] as string[], // Backend parameter for earring categories
    studs_diamond_shape: [] as string[],
    hoops_diamond_shape: [] as string[],
    drop_diamond_shape: [] as string[],
    fashion_earring_diamond_shape: [] as string[],
    halo_earring_diamond_shape: [] as string[],
    earring_length: [] as string[], // Backend parameter for earring lengths

    // Pendant categories and filters
    pendant_category: [] as string[], // Backend parameter for pendant categories
    solitaire_pendant_diamond_shape: [] as string[],
    fashion_pendant_diamond_shape: [] as string[],
    halo_pendant_diamond_shape: [] as string[],

    // Bracelet categories and filters
    bracelet_category: [] as string[], // Backend parameter for bracelet categories
    tennis_bracelet_diamond_shape: [] as string[],
    fashion_bracelet_diamond_shape: [] as string[],

    // Common filters
    style: [] as string[],
    min_price: "0",
    max_price: "50000",

    // Earrings API (new) fields (category2 also used for Engagement Ring styles)
    category1: "" as string,
    category2: "" as string,
    category3: "" as string,
    centerStoneShape: "" as string,
  });

  // Generate cache key from current filters (without page number - cache all pages together)
  const generateCacheKey = useCallback(() => {
    const filterParams = new URLSearchParams();
    filterParams.set("minPrice", minPrice.toString());
    filterParams.set("maxPrice", maxPrice.toString());

    // Add all active filters to cache key
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        filterParams.set(key, value.join(","));
      } else if (typeof value === "string" && value) {
        filterParams.set(key, value);
      }
    });

    return filterParams.toString();
  }, [activeFilters, minPrice, maxPrice]);

  // API function to fetch products
  const fetchProducts = useCallback(
    async (
      page: number = 1,
      limit: number = 20,
      forceRefresh: boolean = false,
    ) => {
      // Set loading immediately for pagination UX
      setLoading(true);
      setError(null);

      try {
        // Generate cache key for current filters
        const cacheKey = generateCacheKey();

        // Check if we have cached data with same filters and it's less than 5 minutes old
        // Only use cache for page 1 to show instant results when returning to the page
        if (
          !forceRefresh &&
          page === 1 &&
          cachedData &&
          cachedData.queryKey === cacheKey
        ) {
          const cacheAge = Date.now() - cachedData.timestamp;
          const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

          if (cacheAge < CACHE_DURATION) {
            // console.log(
            //   "✨ Using cached products (age: " +
            //     Math.round(cacheAge / 1000) +
            //     "s)",
            // );
            setProducts(cachedData.products);
            if (cachedData.pagination) {
              setPagination(cachedData.pagination);
            }
            setAppliedFilters(cachedData.appliedFilters || null);
            setLoading(false);
            setUsingCache(true);
            return;
          }
        }

        // console.log("🌐 Fetching fresh products from API");
        setUsingCache(false);

        // Cancel any previous request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          // console.log("🚫 Cancelled previous API request");
        }

        // Create new AbortController for this request
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        // Earrings: special endpoint with 4 fields only
        if ((category as string) === "earrings") {
          const params = new URLSearchParams();
          params.set("category1", activeFilters.category1 || "");
          params.set("category2", activeFilters.category2 || "");
          params.set("category3", activeFilters.category3 || "");
          params.set("centerStoneShape", activeFilters.centerStoneShape || "");

          // Add price filters for earrings
          if (minPrice !== 0) {
            params.set("minPrice", minPrice.toString());
          }
          if (maxPrice !== 50000) {
            params.set("maxPrice", maxPrice.toString());
          }

          // Add pagination parameters
          params.set("page", page.toString());
          params.set("limit", limit.toString());

          const apiUrl = `/api/products/category/earrings?${params.toString()}`;
          const response = await fetch(apiUrl, { signal });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data: ApiResponse = await response.json();
          if (data.success) {
            setProducts(data.products);
            const paginationData = {
              totalPages: data.pagination.totalPages,
              currentPage: data.pagination.currentPage,
              limit: data.pagination.limit,
              total: data.total,
            };
            setPagination(paginationData);
            setAppliedFilters(data.appliedFilters || null);

            // Save earrings to Redux cache ONLY for page 1
            if (page === 1) {
              const cacheKey = generateCacheKey();
              dispatch(
                saveCategoryProducts({
                  category,
                  data: {
                    products: data.products,
                    pagination: paginationData,
                    appliedFilters: data.appliedFilters || null,
                    queryKey: cacheKey,
                    timestamp: Date.now(),
                  },
                }),
              );
              // console.log(
              //   "💾 Saved earrings page 1 to cache with key:",
              //   cacheKey,
              // );
            }
          } else {
            throw new Error("API returned success: false");
          }
          return; // Do not proceed to generic path
        }

        // Map category names to API category format
        const categoryMap: Record<MainCategory, string> = {
          rings: "RINGS",
          earrings: "EARRINGS",
          pendants: "PENDANTS",
          bracelets: "BRACELETS",
        };

        const apiCategory = categoryMap[category];

        // Build filter parameters based on active filters
        const buildApiFilters = () => {
          const params = new URLSearchParams();
          params.set("page", page.toString());
          params.set("limit", limit.toString());

          if (category === "rings") {
            // Collect shapes from all ring subcategories
            const allSelectedShapes = new Set<string>();
            activeFilters.solitaire_diamond_shape.forEach((shape) =>
              allSelectedShapes.add(shape),
            );
            activeFilters.engagement_diamond_shape.forEach((shape) =>
              allSelectedShapes.add(shape),
            );
            activeFilters.fashion_diamond_shape.forEach((shape) =>
              allSelectedShapes.add(shape),
            );
            activeFilters.mens_diamond_shape.forEach((shape) =>
              allSelectedShapes.add(shape),
            );

            // Add centerStoneShape parameter if any shapes are selected
            if (allSelectedShapes.size > 0) {
              params.set(
                "centerStoneShape",
                Array.from(allSelectedShapes)
                  .map((s) => s.toLowerCase())
                  .join(","),
              );
            }

            // Handle ring types based on selected categories
            const ringTypes = new Set<string>();
            if (
              activeFilters.ring_category.includes("Solitaire Rings") ||
              activeFilters.solitaire_diamond_shape.length > 0
            ) {
              ringTypes.add("solitaire");
            }
            if (
              activeFilters.ring_category.includes("Engagement Rings") ||
              activeFilters.engagement_diamond_shape.length > 0
            ) {
              ringTypes.add("engagement");
            }
            if (
              activeFilters.ring_category.includes("Fashion Rings") ||
              activeFilters.fashion_diamond_shape.length > 0
            ) {
              ringTypes.add("fashion");
            }
            if (
              activeFilters.ring_category.includes("Men's Rings") ||
              activeFilters.ring_category.includes("Mens Rings") ||
              activeFilters.mens_diamond_shape.length > 0
            ) {
              ringTypes.add("men");
            }

            if (ringTypes.size > 0) {
              params.set("ringType", Array.from(ringTypes).join(","));
            }

            // Add isEngraving parameter if on engravings page
            if (isEngravingsPage) {
              params.set("isEngraving", "true");
            }

            // Add category2 parameter for Engagement Ring styles
            if (activeFilters.category2) {
              params.set("category2", activeFilters.category2);
            }
          }

          // Handle earrings filters
          if (category === "earrings") {
            // Collect shapes from all earring subcategories
            const allSelectedShapes = new Set<string>();
            activeFilters.studs_diamond_shape.forEach((shape) =>
              allSelectedShapes.add(shape),
            );
            activeFilters.hoops_diamond_shape.forEach((shape) =>
              allSelectedShapes.add(shape),
            );
            activeFilters.drop_diamond_shape.forEach((shape) =>
              allSelectedShapes.add(shape),
            );
            activeFilters.fashion_earring_diamond_shape.forEach((shape) =>
              allSelectedShapes.add(shape),
            );
            activeFilters.halo_earring_diamond_shape.forEach((shape) =>
              allSelectedShapes.add(shape),
            );

            if (allSelectedShapes.size > 0) {
              params.set(
                "centerStoneShape",
                Array.from(allSelectedShapes)
                  .map((s) => s.toLowerCase())
                  .join(","),
              );
            }

            // Handle earring types
            const earringTypes = new Set<string>();
            if (
              activeFilters.earring_category.includes("Studs") ||
              activeFilters.studs_diamond_shape.length > 0
            ) {
              earringTypes.add("stud's");
            }
            if (
              activeFilters.earring_category.includes("Hoops / Huggies") ||
              activeFilters.hoops_diamond_shape.length > 0
            ) {
              earringTypes.add("hoops");
            }
            if (
              activeFilters.earring_category.includes("Drop Earrings") ||
              activeFilters.drop_diamond_shape.length > 0
            ) {
              earringTypes.add("drop");
            }
            if (
              activeFilters.earring_category.includes("Fashion Earrings") ||
              activeFilters.fashion_earring_diamond_shape.length > 0
            ) {
              earringTypes.add("fashion");
            }
            if (
              activeFilters.earring_category.includes("Halo Earrings") ||
              activeFilters.halo_earring_diamond_shape.length > 0
            ) {
              earringTypes.add("halo");
            }

            if (earringTypes.size > 0) {
              params.set("earringType", Array.from(earringTypes).join(","));
            }

            // Handle earring lengths
            if (activeFilters.earring_length.length > 0) {
              params.set(
                "earringLength",
                activeFilters.earring_length.join(","),
              );
            }
          }

          // Handle pendants filters
          if (category === "pendants") {
            const allSelectedShapes = new Set<string>();
            activeFilters.solitaire_pendant_diamond_shape.forEach((shape) =>
              allSelectedShapes.add(shape),
            );
            activeFilters.fashion_pendant_diamond_shape.forEach((shape) =>
              allSelectedShapes.add(shape),
            );
            activeFilters.halo_pendant_diamond_shape.forEach((shape) =>
              allSelectedShapes.add(shape),
            );

            if (allSelectedShapes.size > 0) {
              params.set(
                "centerStoneShape",
                Array.from(allSelectedShapes)
                  .map((s) => s.toLowerCase())
                  .join(","),
              );
            }

            const pendantCategory1 = new Set<string>();
            if (
              activeFilters.pendant_category.includes("Solitaire Pendants") ||
              activeFilters.solitaire_pendant_diamond_shape.length > 0
            ) {
              pendantCategory1.add("Soliatre Pendant");
            }
            if (
              activeFilters.pendant_category.includes("Fashion Pendants") ||
              activeFilters.fashion_pendant_diamond_shape.length > 0
            ) {
              pendantCategory1.add("Fashion Pendants");
            }
            if (
              activeFilters.pendant_category.includes("Solitaire Halo") ||
              activeFilters.halo_pendant_diamond_shape.length > 0
            ) {
              pendantCategory1.add("Solitaire Halo");
            }

            if (pendantCategory1.size > 0) {
              params.set("category1", Array.from(pendantCategory1).join(","));
            }
          }

          // Handle bracelets filters
          if (category === "bracelets") {
            const allSelectedShapes = new Set<string>();
            activeFilters.tennis_bracelet_diamond_shape.forEach((shape) =>
              allSelectedShapes.add(shape),
            );
            activeFilters.fashion_bracelet_diamond_shape.forEach((shape) =>
              allSelectedShapes.add(shape),
            );

            if (allSelectedShapes.size > 0) {
              params.set(
                "centerStoneShape",
                Array.from(allSelectedShapes)
                  .map((s) => s.toLowerCase())
                  .join(","),
              );
            }

            const braceletTypes = new Set<string>();
            if (
              activeFilters.bracelet_category.includes("Tennis Bracelets") ||
              activeFilters.tennis_bracelet_diamond_shape.length > 0
            ) {
              braceletTypes.add("tennis");
            }
            if (
              activeFilters.bracelet_category.includes("Fashion Bracelets") ||
              activeFilters.fashion_bracelet_diamond_shape.length > 0
            ) {
              braceletTypes.add("fashion");
            }
            if (activeFilters.bracelet_category.includes("Chain Bracelets")) {
              braceletTypes.add("chain");
            }
            if (activeFilters.bracelet_category.includes("Charm Bracelets")) {
              braceletTypes.add("charm");
            }

            if (braceletTypes.size > 0) {
              params.set("braceletType", Array.from(braceletTypes).join(","));
            }
          }

          // Handle styles (exclude Engagement Ring and Fashion Ring styles which go to category2)
          if (activeFilters.style.length > 0) {
            // Styles that should NOT be in style parameter (they go to category2)
            const stylesInCategory2 = [
              // Engagement Ring styles
              "Accents",
              "Halo",
              "Hidden Halo",
              "3 Stone",
              "5 Stone",
              "7 & 8 Stone",
              // Fashion Ring styles
              "Daily Wear Rings",
              "Designer Rings",
            ];

            // Filter out styles that go to category2 from style parameter
            const filteredStyles = activeFilters.style.filter(
              (style) => !stylesInCategory2.includes(style),
            );

            // Only set style parameter if there are styles that don't go to category2
            if (filteredStyles.length > 0) {
              params.set("style", filteredStyles.join(","));
            }
          }

          // Handle price range - use current slider values directly
          if (minPrice !== 0) {
            params.set("minPrice", minPrice.toString());
          }
          if (maxPrice !== 50000) {
            params.set("maxPrice", maxPrice.toString());
          }

          return params;
        };

        const filterParams = buildApiFilters();
        // console.log("📡 API Request Params:", filterParams.toString());
        // console.log("📊 Active Filters State:", activeFilters);
        const response = await fetch(
          `/api/products/category/${apiCategory}?${filterParams.toString()}`,
          { signal },
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse = await response.json();

        // console.log("API Response:", data);
        // console.log("Pagination from API:", data.pagination);
        // console.log("Total from API:", data.total);

        if (data.success) {
          setProducts(data.products);
          const paginationData = {
            totalPages: data.pagination.totalPages,
            currentPage: data.pagination.currentPage,
            limit: data.pagination.limit,
            total: data.total,
          };
          setPagination(paginationData);
          // console.log("Pagination state set to:", paginationData);
          setAppliedFilters(data.appliedFilters || null);

          // Save to Redux cache ONLY for page 1 (to avoid caching wrong page data)
          if (page === 1) {
            const cacheKey = generateCacheKey();
            dispatch(
              saveCategoryProducts({
                category,
                data: {
                  products: data.products,
                  pagination: paginationData,
                  appliedFilters: data.appliedFilters || null,
                  queryKey: cacheKey,
                  timestamp: Date.now(),
                },
              }),
            );
            // console.log(
            //   `💾 Saved ${category} page 1 to cache (${data.products.length} items)`,
            //   { category, cacheKey },
            // );
          }
        } else {
          throw new Error("API returned success: false");
        }
      } catch (err) {
        // Ignore abort errors - these are intentional cancellations
        if (err instanceof Error && err.name === "AbortError") {
          // console.log("✅ Request cancelled successfully");
          return;
        }

        // console.error("Error fetching products:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch products",
        );
        setProducts([]);
      } finally {
        setLoading(false);
      }
    },
    [
      category,
      activeFilters,
      minPrice,
      maxPrice,
      generateCacheKey,
      cachedData,
      dispatch,
    ],
  );

  // Helper function to extract metal color code from image URL
  const getMetalColorFromImage = useCallback((imageUrl: string): string => {
    if (!imageUrl) return "WG"; // Default fallback

    const filename = imageUrl.split("/").pop() || "";
    const upperFilename = filename.toUpperCase();

    // Check for color codes in the filename
    // Priority: YG (Yellow Gold) > RG (Rose Gold) > WG (White Gold) > BR (Black Rhodium)
    if (
      upperFilename.includes("YG") ||
      upperFilename.includes("_YG_") ||
      upperFilename.includes("-YG-")
    ) {
      return "YG";
    }
    if (
      upperFilename.includes("RG") ||
      upperFilename.includes("_RG_") ||
      upperFilename.includes("-RG-")
    ) {
      return "RG";
    }
    if (
      upperFilename.includes("WG") ||
      upperFilename.includes("_WG_") ||
      upperFilename.includes("-WG-")
    ) {
      return "WG";
    }
    if (
      upperFilename.includes("BR") ||
      upperFilename.includes("_BR_") ||
      upperFilename.includes("-BR-")
    ) {
      return "BR";
    }

    // Default to WG if no color code found
    return "WG";
  }, []);

  const handleWishlistToggle = useCallback(
    (event: React.MouseEvent, product: Product) => {
      event.preventDefault();
      event.stopPropagation();

      if (!isAuthenticated) {
        navigate("/login");
        return;
      }

      if (!product._id) {
        toast.error("Product information is unavailable. Please try again.");
        return;
      }

      const detectedMetalColor =
        getMetalColorFromImage(product.firstVariantImageUrl) || "WG";

      const entryKey = buildWishlistKey(
        product._id,
        product.firstVariantSku || null,
        detectedMetalColor,
      );
      const existingEntryId = wishlistKeyMap[entryKey];

      // console.log("🔴 Toggle Wishlist:", {
      //   modelSku: product.modelSku,
      //   productId: product._id,
      //   variantSku: product.firstVariantSku,
      //   detectedMetalColor,
      //   entryKey,
      //   existingEntryId,
      //   willAdd: !existingEntryId,
      //   wishlistKeyMapSize: Object.keys(wishlistKeyMap).length,
      // });

      if (existingEntryId) {
        dispatch(removeWishlistItemThunk(existingEntryId));
        return;
      }

      dispatch(
        addWishlistItem({
          productId: product._id,
          modelSku: product.modelSku,
          title: product.title,
          categorySlug: category,
          categoryLabel: category,
          variantSku: product.firstVariantSku,
          metalColorCode: detectedMetalColor,
          metalColorName:
            detectedMetalColor === "YG"
              ? "Yellow"
              : detectedMetalColor === "RG"
                ? "Rose"
                : detectedMetalColor === "BR"
                  ? "Black Rhodium"
                  : "White",
          primaryImage: product.firstVariantImageUrl || null,
          price:
            typeof product.sellingPrice === "number"
              ? product.sellingPrice
              : null,
        }),
      );
    },
    [
      category,
      dispatch,
      isAuthenticated,
      navigate,
      wishlistKeyMap,
      getMetalColorFromImage,
    ],
  );

  // Update URL when filters change - use comma-separated values
  const updateUrlFilters = (
    filterType: string,
    value: string,
    checked: boolean,
  ) => {
    const currentParams = new URLSearchParams(searchParams);

    // Get existing values as comma-separated string
    const existingParam = currentParams.get(filterType);
    const existingValues = existingParam ? existingParam.split(",") : [];

    if (checked) {
      // Add value if not already present
      if (!existingValues.includes(value)) {
        existingValues.push(value);
      }
    } else {
      // Remove value
      const index = existingValues.indexOf(value);
      if (index > -1) {
        existingValues.splice(index, 1);
      }
    }

    // Update URL parameter
    if (existingValues.length > 0) {
      currentParams.set(filterType, existingValues.join(","));
    } else {
      currentParams.delete(filterType);
    }

    // Reset to page 1 when filters change
    currentParams.delete("page");

    setSearchParams(currentParams);

    // Update local state
    setActiveFilters((prev) => ({
      ...prev,
      [filterType]: existingValues,
    }));
  };

  const updatePriceFilter = (
    type: "min_price" | "max_price",
    value: string,
  ) => {
    const currentParams = new URLSearchParams(searchParams);

    // Only update URL if value is different from default
    if (
      (type === "min_price" && value !== "0") ||
      (type === "max_price" && value !== "50000")
    ) {
      currentParams.set(type, value);
    } else {
      currentParams.delete(type);
    }

    // Reset to page 1 when price filters change
    currentParams.delete("page");

    setSearchParams(currentParams);

    setActiveFilters((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  // Handlers for slider input events (fires while dragging - updates UI only)
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    const clampedValue = Math.min(value, maxPriceUI - 2000);
    setMinPriceUI(clampedValue); // Update UI only for smooth sliding
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    const clampedValue = Math.max(value, minPriceUI + 2000);
    setMaxPriceUI(clampedValue); // Update UI only for smooth sliding
  };

  // Handlers for when user releases the slider (mouseup/touchend)
  const handleMinRelease = () => {
    // console.log("🔵 MIN SLIDER RELEASED - Calling API with:", minPriceUI);
    setMinPrice(minPriceUI);
    updatePriceFilter("min_price", minPriceUI.toString());
  };

  const handleMaxRelease = () => {
    // console.log("🔶 MAX SLIDER RELEASED - Calling API with:", maxPriceUI);
    setMaxPrice(maxPriceUI);
    updatePriceFilter("max_price", maxPriceUI.toString());
  };

  // Handlers for manual input changes
  const handleMinInputChange = (value: number) => {
    // console.log("🔵 MIN INPUT CHANGED - Calling API with:", value);
    setMinPriceUI(value);
    setMinPrice(value);
    updatePriceFilter("min_price", value.toString());
  };

  const handleMaxInputChange = (value: number) => {
    // console.log("🔶 MAX INPUT CHANGED - Calling API with:", value);
    setMaxPriceUI(value);
    setMaxPrice(value);
    updatePriceFilter("max_price", value.toString());
  };

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());

    // Clear price debounce timeout
    if (priceDebounceRef.current) {
      clearTimeout(priceDebounceRef.current);
    }

    // Reset both UI and API price states
    setMinPriceUI(0);
    setMaxPriceUI(50000);
    setMinPrice(0);
    setMaxPrice(50000);

    setActiveFilters({
      ring_category: [],
      solitaire_diamond_shape: [],
      engagement_diamond_shape: [],
      mens_diamond_shape: [],
      fashion_diamond_shape: [],
      earring_category: [],
      studs_diamond_shape: [],
      hoops_diamond_shape: [],
      drop_diamond_shape: [],
      fashion_earring_diamond_shape: [],
      halo_earring_diamond_shape: [],
      earring_length: [],
      pendant_category: [], // Add this missing field
      solitaire_pendant_diamond_shape: [],
      fashion_pendant_diamond_shape: [],
      halo_pendant_diamond_shape: [],
      style: [],
      bracelet_category: [],
      tennis_bracelet_diamond_shape: [],
      fashion_bracelet_diamond_shape: [],
      min_price: "0",
      max_price: "50000",
      category1: "",
      category2: "",
      category3: "",
      centerStoneShape: "",
    });
  }, [setSearchParams]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      // Cancel any in-flight requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        // console.log("🚫 Cancelled API request on unmount");
      }
      // Clear debounce timer
      if (priceDebounceRef.current) {
        clearTimeout(priceDebounceRef.current);
      }
    };
  }, []);

  // Ref to track if it's the first load
  const isFirstLoadRef = useRef(true);
  const lastFetchedPageRef = useRef<number>(1);
  const lastFetchedFiltersRef = useRef<string>("");

  // Single useEffect to fetch products - triggers on category or filter changes
  useEffect(() => {
    // Get page from URL params, default to 1
    const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);
    const validPage = isNaN(pageFromUrl) || pageFromUrl < 1 ? 1 : pageFromUrl;

    // Create a filter signature to detect filter changes
    const filterSignature = JSON.stringify({
      activeFilters,
      minPrice,
      maxPrice,
      category,
    });

    // Check if filters changed (not just page number)
    const filtersChanged = filterSignature !== lastFetchedFiltersRef.current;

    if (isFirstLoadRef.current) {
      isFirstLoadRef.current = false;
      lastFetchedPageRef.current = validPage;
      lastFetchedFiltersRef.current = filterSignature;
      fetchProducts(validPage);
      return;
    }

    // If filters changed, fetch from page 1 or specified page
    if (filtersChanged) {
      lastFetchedPageRef.current = validPage;
      lastFetchedFiltersRef.current = filterSignature;
      fetchProducts(validPage);
    }
    // Note: searchParams is intentionally NOT in dependencies to avoid infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchProducts]);

  // Separate effect to handle ONLY page number changes from pagination buttons
  useEffect(() => {
    const pageParam = searchParams.get("page");
    // If no page param, it means page 1 (default)
    const pageFromUrl = pageParam ? parseInt(pageParam, 10) : 1;
    const validPage = isNaN(pageFromUrl) || pageFromUrl < 1 ? 1 : pageFromUrl;

    // console.log("📄 Page change detected:", {
    //   pageParam,
    //   pageFromUrl,
    //   validPage,
    //   lastFetched: lastFetchedPageRef.current,
    //   isFirstLoad: isFirstLoadRef.current,
    // });

    // Only fetch if page actually changed and it's not the first load
    if (!isFirstLoadRef.current && validPage !== lastFetchedPageRef.current) {
      // console.log("🚀 Fetching new page:", validPage);
      lastFetchedPageRef.current = validPage;
      // Set loading state for instant UX feedback (keep existing products visible during load)
      setLoading(true);
      // Scroll to top immediately when page changes
      scrollToTop();
      fetchProducts(validPage);
    }
  }, [searchParams.get("page"), fetchProducts]);

  // Reset first load flag and clear price filters when category changes
  useEffect(() => {
    isFirstLoadRef.current = true;
    lastFetchedPageRef.current = 1;
    lastFetchedFiltersRef.current = "";

    // CRITICAL: Cancel any in-flight API requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      // console.log("🚫 Cancelled API request due to category change");
    }

    // CRITICAL: Clear any pending price debounce timers to prevent stale requests
    if (priceDebounceRef.current) {
      clearTimeout(priceDebounceRef.current);
      priceDebounceRef.current = null;
    }

    // Reset price filters to defaults when changing categories
    setMinPrice(0);
    setMaxPrice(50000);
    setMinPriceUI(0);
    setMaxPriceUI(50000);
  }, [category]);

  // Initialize filters from URL on component mount
  useEffect(() => {
    if (searchParams.toString()) {
      const urlMinPrice = searchParams.get("min_price");
      const urlMaxPrice = searchParams.get("max_price");

      if (urlMinPrice) {
        const minPriceValue = parseInt(urlMinPrice);
        setMinPrice(minPriceValue);
        setMinPriceUI(minPriceValue);
      }
      if (urlMaxPrice) {
        const maxPriceValue = parseInt(urlMaxPrice);
        setMaxPrice(maxPriceValue);
        setMaxPriceUI(maxPriceValue);
      }

      // Parse comma-separated values from URL for all category-specific filters
      const getFilterValues = (paramName: string) => {
        const param = searchParams.get(paramName);
        return param ? param.split(",") : [];
      };

      setActiveFilters({
        // Ring filters
        ring_category: getFilterValues("ring_category"),
        solitaire_diamond_shape: getFilterValues("solitaire_diamond_shape"),
        engagement_diamond_shape: getFilterValues("engagement_diamond_shape"),
        fashion_diamond_shape: getFilterValues("fashion_diamond_shape"),
        mens_diamond_shape: getFilterValues("mens_diamond_shape"),

        // Earring filters
        earring_category: getFilterValues("earring_category"),
        studs_diamond_shape: getFilterValues("studs_diamond_shape"),
        hoops_diamond_shape: getFilterValues("hoops_diamond_shape"),
        drop_diamond_shape: getFilterValues("drop_diamond_shape"),
        fashion_earring_diamond_shape: getFilterValues(
          "fashion_earring_diamond_shape",
        ),
        halo_earring_diamond_shape: getFilterValues(
          "halo_earring_diamond_shape",
        ),
        earring_length: getFilterValues("earring_length"),

        // Pendant filters
        pendant_category: getFilterValues("pendant_category"), // Add this missing field
        solitaire_pendant_diamond_shape: getFilterValues(
          "solitaire_pendant_diamond_shape",
        ),
        fashion_pendant_diamond_shape: getFilterValues(
          "fashion_pendant_diamond_shape",
        ),
        halo_pendant_diamond_shape: getFilterValues(
          "halo_pendant_diamond_shape",
        ),

        // Bracelet filters
        bracelet_category: getFilterValues("bracelet_category"),
        tennis_bracelet_diamond_shape: getFilterValues(
          "tennis_bracelet_diamond_shape",
        ),
        fashion_bracelet_diamond_shape: getFilterValues(
          "fashion_bracelet_diamond_shape",
        ),

        // Common filters
        style: getFilterValues("style"),
        min_price: urlMinPrice || "0",
        max_price: urlMaxPrice || "50000",

        // Earrings API (new) fields from URL
        category1: searchParams.get("category1") || "",
        category2: searchParams.get("category2") || "", // Also used for Engagement Ring styles
        category3: searchParams.get("category3") || "",
        centerStoneShape: searchParams.get("centerStoneShape") || "",
      });
    } else {
      clearAllFilters();
    }
  }, [searchParams, clearAllFilters]);

  const titleMap: Record<MainCategory, string> = {
    rings: "Rings",
    earrings: "Earrings",
    pendants: "Pendants",
    bracelets: "Bracelets",
  };

  // Override title for engravings page
  const pageTitle = isEngravingsPage
    ? "Engravable Ring Products"
    : titleMap[category];

  // Helper to determine if a filter group should be open based on URL params
  const shouldGroupBeOpen = (
    groupName: string,
    categoryParam: string,
  ): boolean => {
    const paramValue = searchParams.get(categoryParam);
    if (!paramValue) return false;

    const values = paramValue.split(",");
    return values.includes(groupName);
  };

  // Helper to handle filter group toggle
  const handleFilterGroupToggle = (
    groupName: string,
    categoryParam: string,
    isOpen: boolean,
  ) => {
    // console.log(
    //   `🔧 Filter Group Toggle: ${groupName} - ${isOpen ? "OPENING" : "CLOSING"}`,
    // );
    const currentParams = new URLSearchParams(searchParams);
    const existingParam = currentParams.get(categoryParam);
    const existingValues = existingParam ? existingParam.split(",") : [];

    if (isOpen) {
      // When opening a group, ONLY set this group (close all others in the category)
      // Clear all shape filters for ALL groups in this category
      if (category === "rings") {
        currentParams.delete("solitaire_diamond_shape");
        currentParams.delete("engagement_diamond_shape");
        currentParams.delete("mens_diamond_shape");
        currentParams.delete("fashion_diamond_shape");
        currentParams.delete("category2"); // Clear engagement ring styles
      } else if (category === "pendants") {
        currentParams.delete("solitaire_pendant_diamond_shape");
        currentParams.delete("fashion_pendant_diamond_shape");
        currentParams.delete("halo_pendant_diamond_shape");
      } else if (category === "bracelets") {
        currentParams.delete("tennis_bracelet_diamond_shape");
        currentParams.delete("fashion_bracelet_diamond_shape");
      }

      // Set ONLY the current group
      currentParams.set(categoryParam, groupName);
      // Reset to page 1 when filters change
      currentParams.delete("page");
      // console.log(`✅ Set ${groupName} as ONLY active ${categoryParam}`);
      setSearchParams(currentParams);

      // Update local state - clear all shape filters and set only current category
      setActiveFilters((prev) => ({
        ...prev,
        [categoryParam]: [groupName],
        // Clear all shape filters for this category
        ...(category === "rings" && {
          solitaire_diamond_shape: [],
          engagement_diamond_shape: [],
          mens_diamond_shape: [],
          fashion_diamond_shape: [],
          category2: "",
        }),
        ...(category === "pendants" && {
          solitaire_pendant_diamond_shape: [],
          fashion_pendant_diamond_shape: [],
          halo_pendant_diamond_shape: [],
        }),
        ...(category === "bracelets" && {
          tennis_bracelet_diamond_shape: [],
          fashion_bracelet_diamond_shape: [],
        }),
      }));
    } else {
      // When closing a group, remove it from the category parameter
      const index = existingValues.indexOf(groupName);
      if (index > -1) {
        existingValues.splice(index, 1);
        // console.log(
        //   `❌ Removed ${groupName} from ${categoryParam}:`,
        //   existingValues,
        // );

        // Update or delete the category parameter
        if (existingValues.length > 0) {
          currentParams.set(categoryParam, existingValues.join(","));
        } else {
          currentParams.delete(categoryParam);
          // console.log(`🗑️ Deleted ${categoryParam} from URL params`);
        }

        // Clear associated shape filters based on the group being closed
        if (category === "rings") {
          if (groupName === "Solitaire Rings") {
            currentParams.delete("solitaire_diamond_shape");
            setActiveFilters((prev) => ({
              ...prev,
              [categoryParam]: existingValues,
              solitaire_diamond_shape: [],
            }));
          } else if (groupName === "Engagement Rings") {
            currentParams.delete("engagement_diamond_shape");

            // Clear Engagement Ring styles from category2
            const existingCategory2 = currentParams.get("category2");
            if (existingCategory2) {
              const category2Values = existingCategory2
                .split(",")
                .map((v) => v.trim());
              // Engagement Ring styles that should be removed
              const engagementRingStyles = [
                "Accent",
                "Halo",
                "Hidden Halo",
                "3 Stone",
                "5 Stone",
                "7 STONE",
                "8 STONE",
              ];

              // Remove all Engagement Ring styles from category2
              const filteredCategory2 = category2Values.filter(
                (value) => !engagementRingStyles.includes(value),
              );

              // Update or delete category2
              if (filteredCategory2.length > 0) {
                currentParams.set("category2", filteredCategory2.join(","));
              } else {
                currentParams.delete("category2");
              }
            }

            setActiveFilters((prev) => {
              // Get current category2 and remove Engagement Ring styles
              const currentCategory2 = prev.category2
                ? prev.category2.split(",").map((v) => v.trim())
                : [];
              const engagementRingStyles = [
                "Accent",
                "Halo",
                "Hidden Halo",
                "3 Stone",
                "5 Stone",
                "7 STONE",
                "8 STONE",
              ];
              const filteredCategory2 = currentCategory2.filter(
                (value) => !engagementRingStyles.includes(value),
              );

              return {
                ...prev,
                [categoryParam]: existingValues,
                engagement_diamond_shape: [],
                category2: filteredCategory2.join(","),
              };
            });
          } else if (
            groupName === "Mens Rings" ||
            groupName === "Men's Rings"
          ) {
            currentParams.delete("mens_diamond_shape");
            setActiveFilters((prev) => ({
              ...prev,
              [categoryParam]: existingValues,
              mens_diamond_shape: [],
            }));
          } else if (groupName === "Fashion Rings") {
            currentParams.delete("fashion_diamond_shape");

            // Clear Fashion Ring styles from category2
            const existingCategory2 = currentParams.get("category2");
            if (existingCategory2) {
              const category2Values = existingCategory2
                .split(",")
                .map((v) => v.trim());
              // Fashion Ring styles that should be removed
              const fashionRingStyles = ["Daily Wear Rings", "Designer Rings"];

              // Remove all Fashion Ring styles from category2
              const filteredCategory2 = category2Values.filter(
                (value) => !fashionRingStyles.includes(value),
              );

              // Update or delete category2
              if (filteredCategory2.length > 0) {
                currentParams.set("category2", filteredCategory2.join(","));
              } else {
                currentParams.delete("category2");
              }
            }

            setActiveFilters((prev) => {
              // Get current category2 and remove Fashion Ring styles
              const currentCategory2 = prev.category2
                ? prev.category2.split(",").map((v) => v.trim())
                : [];
              const fashionRingStyles = ["Daily Wear Rings", "Designer Rings"];
              const filteredCategory2 = currentCategory2.filter(
                (value) => !fashionRingStyles.includes(value),
              );

              return {
                ...prev,
                [categoryParam]: existingValues,
                fashion_diamond_shape: [],
                category2: filteredCategory2.join(","),
              };
            });
          }
        } else if (category === "pendants") {
          if (groupName === "Solitaire Pendants") {
            currentParams.delete("solitaire_pendant_diamond_shape");
            setActiveFilters((prev) => ({
              ...prev,
              [categoryParam]: existingValues,
              solitaire_pendant_diamond_shape: [],
            }));
          } else if (groupName === "Fashion Pendants") {
            currentParams.delete("fashion_pendant_diamond_shape");
            // Clear pendant styles when closing the group
            const stylesToRemove = ["Daily Wear Pendants", "Designer Pendants"];
            const existingStyleParam = currentParams.get("style") || "";
            const styleParts = existingStyleParam
              ? existingStyleParam.split(",").map((v) => v.trim())
              : [];
            const nextStyles = styleParts.filter(
              (s) => !stylesToRemove.includes(s),
            );
            if (nextStyles.length > 0)
              currentParams.set("style", nextStyles.join(","));
            else currentParams.delete("style");
            setActiveFilters((prev) => ({
              ...prev,
              [categoryParam]: existingValues,
              fashion_pendant_diamond_shape: [],
              style: prev.style.filter((s) => !stylesToRemove.includes(s)),
            }));
          } else if (groupName === "Solitaire Halo") {
            currentParams.delete("halo_pendant_diamond_shape");
            setActiveFilters((prev) => ({
              ...prev,
              [categoryParam]: existingValues,
              halo_pendant_diamond_shape: [],
            }));
          }
        } else if (category === "bracelets") {
          if (groupName === "Tennis Bracelets") {
            currentParams.delete("tennis_bracelet_diamond_shape");
            setActiveFilters((prev) => ({
              ...prev,
              [categoryParam]: existingValues,
              tennis_bracelet_diamond_shape: [],
            }));
          } else if (groupName === "Fashion Bracelets") {
            currentParams.delete("fashion_bracelet_diamond_shape");
            // Clear bracelet styles when closing the group
            const stylesToRemove = [
              "Daily Wear Bracelets",
              "Designer Bracelets",
            ];
            const existingStyleParam = currentParams.get("style") || "";
            const styleParts = existingStyleParam
              ? existingStyleParam.split(",").map((v) => v.trim())
              : [];
            const nextStyles = styleParts.filter(
              (s) => !stylesToRemove.includes(s),
            );
            if (nextStyles.length > 0)
              currentParams.set("style", nextStyles.join(","));
            else currentParams.delete("style");
            setActiveFilters((prev) => ({
              ...prev,
              [categoryParam]: existingValues,
              fashion_bracelet_diamond_shape: [],
              style: prev.style.filter((s) => !stylesToRemove.includes(s)),
            }));
          } else if (groupName === "Chain Bracelets") {
            // Clear chain bracelet styles when closing the group
            const stylesToRemove = [
              "Gold Chains",
              "Silver Chains",
              "Rose Gold Chains",
            ];
            const existingStyleParam = currentParams.get("style") || "";
            const styleParts = existingStyleParam
              ? existingStyleParam.split(",").map((v) => v.trim())
              : [];
            const nextStyles = styleParts.filter(
              (s) => !stylesToRemove.includes(s),
            );
            if (nextStyles.length > 0)
              currentParams.set("style", nextStyles.join(","));
            else currentParams.delete("style");
            setActiveFilters((prev) => ({
              ...prev,
              [categoryParam]: existingValues,
              style: prev.style.filter((s) => !stylesToRemove.includes(s)),
            }));
          } else if (groupName === "Charm Bracelets") {
            // Clear charm bracelet styles when closing the group
            const stylesToRemove = [
              "Heart Charms",
              "Star Charms",
              "Custom Charms",
            ];
            const existingStyleParam = currentParams.get("style") || "";
            const styleParts = existingStyleParam
              ? existingStyleParam.split(",").map((v) => v.trim())
              : [];
            const nextStyles = styleParts.filter(
              (s) => !stylesToRemove.includes(s),
            );
            if (nextStyles.length > 0)
              currentParams.set("style", nextStyles.join(","));
            else currentParams.delete("style");
            setActiveFilters((prev) => ({
              ...prev,
              [categoryParam]: existingValues,
              style: prev.style.filter((s) => !stylesToRemove.includes(s)),
            }));
          }
        }

        setSearchParams(currentParams);

        // Update local state for simple cases (when not handled above)
        if (!currentParams.toString().includes("diamond_shape")) {
          setActiveFilters((prev) => ({
            ...prev,
            [categoryParam]: existingValues,
          }));
        }
      }
    }
  };

  // Function to render category-specific filters
  const renderCategoryFilters = () => {
    // Helpers for Earrings mapping (do not change UI, just wire to API fields)
    const mapEarringGroupToCategory1 = (group: string) => {
      const g = group.toLowerCase();
      if (g.includes("studs")) return "stud's";
      if (g.includes("hoops")) return "hoops/huggies";
      if (g.includes("fashion")) return "fashion earrings";
      if (g.includes("drop")) return "drop earrings";
      if (g.includes("halo")) return "halo";
      return "";
    };

    // Helper for earring groups to check if should be open
    const shouldEarringGroupBeOpen = (groupTitle: string): boolean => {
      const category1Value = searchParams.get("category1");
      if (!category1Value) return false;

      const mappedValue = mapEarringGroupToCategory1(groupTitle);
      const values = category1Value.split(",");
      return values.includes(mappedValue);
    };

    // Helper to handle earring group toggle
    const handleEarringGroupToggle = (groupTitle: string, isOpen: boolean) => {
      // console.log(
      //   `🎵 Earring Group Toggle: ${groupTitle} - ${
      //     isOpen ? "OPENING" : "CLOSING"
      //   }`,
      // );
      const mappedValue = mapEarringGroupToCategory1(groupTitle);
      const currentParams = new URLSearchParams(searchParams);

      if (isOpen) {
        // When opening a group, ONLY set this group (close all others)
        // Clear all shape filters for ALL earring subcategories
        currentParams.delete("studs_diamond_shape");
        currentParams.delete("hoops_diamond_shape");
        currentParams.delete("drop_diamond_shape");
        currentParams.delete("fashion_earring_diamond_shape");
        currentParams.delete("halo_earring_diamond_shape");
        currentParams.delete("centerStoneShape");
        currentParams.delete("category2"); // Clear styles/lengths
        currentParams.delete("earring_length");

        // Set ONLY the current group
        currentParams.set("category1", mappedValue);
        currentParams.set("category2", "");
        currentParams.set("category3", "");
        // Reset to page 1 when filters change
        currentParams.delete("page");
        // console.log(`✅ Set ${mappedValue} as ONLY active category1`);
        setSearchParams(currentParams);

        setActiveFilters((prev) => ({
          ...prev,
          category1: mappedValue,
          category2: "",
          category3: "",
          centerStoneShape: "",
          // Clear all earring shape filters
          studs_diamond_shape: [],
          hoops_diamond_shape: [],
          drop_diamond_shape: [],
          fashion_earring_diamond_shape: [],
          halo_earring_diamond_shape: [],
          earring_length: [],
        }));
      } else {
        // When closing, only clear if this is the currently open section
        const currentCategory1 = currentParams.get("category1");
        if (currentCategory1 === mappedValue) {
          // This section is currently open, so close it
          currentParams.delete("category1");
          currentParams.delete("category2");
          currentParams.delete("category3");
          currentParams.delete("centerStoneShape");
          currentParams.delete("studs_diamond_shape");
          currentParams.delete("hoops_diamond_shape");
          currentParams.delete("drop_diamond_shape");
          currentParams.delete("fashion_earring_diamond_shape");
          currentParams.delete("halo_earring_diamond_shape");
          currentParams.delete("earring_length");
          // Reset to page 1 when filters change
          currentParams.delete("page");
          // console.log(
          //   `🗑️ Closed ${groupTitle} and cleared all earring filters`,
          // );

          setSearchParams(currentParams);

          setActiveFilters((prev) => ({
            ...prev,
            category1: "",
            category2: "",
            category3: "",
            centerStoneShape: "",
            studs_diamond_shape: [],
            hoops_diamond_shape: [],
            drop_diamond_shape: [],
            fashion_earring_diamond_shape: [],
            halo_earring_diamond_shape: [],
            earring_length: [],
          }));
        }
        // If another section is open, do nothing - the opening logic handles closing others
      }
    };

    // const setEarringCategory1 = (groupTitle: string) => {
    //   const c1 = mapEarringGroupToCategory1(groupTitle);
    //   const currentParams = new URLSearchParams(searchParams);
    //   currentParams.set("category1", c1);
    //   if (!currentParams.has("category2")) currentParams.set("category2", "");
    //   if (!currentParams.has("category3")) currentParams.set("category3", "");
    //   setSearchParams(currentParams);
    //   setActiveFilters((prev) => ({ ...prev, category1: c1 }));
    // };

    const setEarringCenterStoneShape = (
      groupTitle: string,
      shape: string,
      checked: boolean,
    ) => {
      const shapeLower = shape.toLowerCase();

      const currentParams = new URLSearchParams(searchParams);
      const existingShapes = currentParams.get("centerStoneShape") || "";
      const shapeArray = existingShapes ? existingShapes.split(",") : [];

      if (checked) {
        if (!shapeArray.includes(shapeLower)) {
          shapeArray.push(shapeLower);
        }
      } else {
        const index = shapeArray.indexOf(shapeLower);
        if (index > -1) {
          shapeArray.splice(index, 1);
        }
      }

      // Build category1 from all subcategories that have selected shapes
      const category1Array = new Set<string>();

      // Check each earring subcategory to see if it has any selected shapes
      if (
        activeFilters.studs_diamond_shape.length > 0 ||
        (groupTitle === "Studs" && checked)
      ) {
        category1Array.add("stud's");
      }
      if (
        activeFilters.hoops_diamond_shape.length > 0 ||
        (groupTitle === "Hoops / Huggies" && checked)
      ) {
        category1Array.add("hoops/huggies");
      }
      if (
        activeFilters.drop_diamond_shape.length > 0 ||
        (groupTitle === "Drop Earrings" && checked)
      ) {
        category1Array.add("drop earrings");
      }
      if (
        activeFilters.fashion_earring_diamond_shape.length > 0 ||
        (groupTitle === "Fashion Earrings" && checked)
      ) {
        category1Array.add("fashion earrings");
      }
      if (
        activeFilters.halo_earring_diamond_shape.length > 0 ||
        (groupTitle === "Halo Earrings" && checked)
      ) {
        category1Array.add("halo");
      }

      // Remove current subcategory if unchecking and no shapes remain
      const currentSubcategory = mapEarringGroupToCategory1(groupTitle);
      const currentFilterKey =
        groupTitle === "Studs"
          ? "studs_diamond_shape"
          : groupTitle === "Hoops / Huggies"
            ? "hoops_diamond_shape"
            : groupTitle === "Drop Earrings"
              ? "drop_diamond_shape"
              : groupTitle === "Halo Earrings"
                ? "halo_earring_diamond_shape"
                : "fashion_earring_diamond_shape";

      const currentShapes = activeFilters[currentFilterKey] as string[];
      if (!checked && currentShapes.filter((s) => s !== shape).length === 0) {
        category1Array.delete(currentSubcategory);
      }

      const category1Value = Array.from(category1Array).join(",");

      // Update URL params
      currentParams.set("category1", category1Value);
      currentParams.set("centerStoneShape", shapeArray.join(","));
      if (!currentParams.has("category2")) currentParams.set("category2", "");
      if (!currentParams.has("category3")) currentParams.set("category3", "");

      // Also update the URL for the category-specific filter (already defined above)
      const categoryShapes = (
        activeFilters[currentFilterKey] as string[]
      ).slice();
      if (checked) {
        if (!categoryShapes.includes(shape)) {
          categoryShapes.push(shape);
        }
      } else {
        const idx = categoryShapes.indexOf(shape);
        if (idx > -1) {
          categoryShapes.splice(idx, 1);
        }
      }

      if (categoryShapes.length > 0) {
        currentParams.set(currentFilterKey, categoryShapes.join(","));
      } else {
        currentParams.delete(currentFilterKey);
      }

      setSearchParams(currentParams);

      setActiveFilters((prev) => ({
        ...prev,
        category1: category1Value,
        centerStoneShape: shapeArray.join(","),
        [currentFilterKey]: categoryShapes,
      }));
    };

    const setEarringCategory2 = (
      groupTitle: string,
      category2Value: string,
      hasStyles: boolean,
    ) => {
      // category2Value can be comma-separated styles or length values
      // This contains ALL selected styles from all subcategories

      // Check if this is a length value (contains "mm")
      const isLengthValue = category2Value.includes("mm");

      // Parse existing category2 to separate styles and lengths (ARRAY, not single value)
      const existingCategory2 = activeFilters.category2;
      let existingStyles: string[] = [];
      let existingLengths: string[] = [];

      if (existingCategory2) {
        const parts = existingCategory2.split(",");
        existingStyles = parts.filter(
          (p) => p && !["Small", "Medium", "Large"].includes(p),
        );
        existingLengths = parts.filter((p) =>
          ["Small", "Medium", "Large"].includes(p),
        );
      }

      // Determine what to update
      let newLengths = existingLengths;
      let newStyles = existingStyles;

      if (isLengthValue) {
        // Setting lengths - extract ALL lengths from category2Value and preserve existing styles
        newLengths = category2Value
          .split(",")
          .map((item) => {
            if (item.startsWith("Small")) return "Small";
            else if (item.startsWith("Medium")) return "Medium";
            else if (item.startsWith("Large")) return "Large";
            return "";
          })
          .filter((s) => s);
      } else {
        // Setting styles - preserve existing lengths
        newStyles = category2Value.split(",").filter((s) => s && s.trim());
      }

      // Build final category2 with both styles and ALL lengths
      const finalCategory2Parts: string[] = [];
      if (newStyles.length > 0) finalCategory2Parts.push(...newStyles);
      if (newLengths.length > 0) finalCategory2Parts.push(...newLengths);
      const finalCategory2 = finalCategory2Parts.join(",");

      const currentParams = new URLSearchParams(searchParams);

      // Build category1 from all subcategories that have selected shapes (preserve existing selections)
      const category1Array = new Set<string>();

      // CRITICAL: Preserve existing category1 subcategories from URL/state
      const existingCategory1 = activeFilters.category1;
      if (existingCategory1) {
        existingCategory1.split(",").forEach((cat) => {
          if (cat.trim()) category1Array.add(cat.trim());
        });
      }

      // Check each earring subcategory to see if it has any selected shapes
      if (activeFilters.studs_diamond_shape.length > 0) {
        category1Array.add("stud's");
      }
      if (activeFilters.hoops_diamond_shape.length > 0) {
        category1Array.add("hoops/huggies");
      }
      if (activeFilters.drop_diamond_shape.length > 0) {
        category1Array.add("drop earrings");
      }
      if (activeFilters.fashion_earring_diamond_shape.length > 0) {
        category1Array.add("fashion earrings");
      }

      // Add current subcategory if setting category2
      if (hasStyles) {
        const currentSubcategory = mapEarringGroupToCategory1(groupTitle);
        category1Array.add(currentSubcategory);
      }

      const category1Value = Array.from(category1Array).join(",");

      // Extract length values from category2Value for earring_length persistence
      const lengthValues = category2Value
        .split(",")
        .filter((s) => s && s.includes("mm"));

      // Update activeFilters BEFORE setSearchParams so state is ready when URL changes
      setActiveFilters((prev) => ({
        ...prev,
        category1: category1Value,
        category2: hasStyles ? finalCategory2 : "",
        // IMPORTANT: Earrings styles must be sent ONLY in category2 (never in style)
        style: [],
        earring_length:
          lengthValues.length > 0 ? lengthValues : prev.earring_length,
      }));

      // Set category2 with both styles and length
      currentParams.set("category1", category1Value);
      currentParams.set("category2", hasStyles ? finalCategory2 : "");
      if (!currentParams.has("category3")) currentParams.set("category3", "");

      // IMPORTANT: Earrings styles must be sent ONLY in category2 (never in style)
      currentParams.delete("style");

      // CRITICAL: Also set the "earring_length" URL parameter for length checkbox persistence
      if (lengthValues.length > 0) {
        currentParams.set("earring_length", lengthValues.join(","));
      } else {
        currentParams.delete("earring_length");
      }

      setSearchParams(currentParams);
    };
    // Enhanced filter components with URL updates and category tracking
    const renderStyleOptions = (
      styles: string[],
      categoryType: string,
      categoryName: string,
    ) => {
      // Check if these are Fashion Ring styles that should go to category2
      const fashionRingStyles = ["Daily Wear Rings", "Designer Rings"];
      const isFashionRingStyles =
        category === "rings" &&
        categoryName === "Fashion Rings" &&
        styles.some((s) => fashionRingStyles.includes(s));

      console.log("isFashionRingStyles:", isFashionRingStyles); // Keep it if intended for future use or remove if not

      return (
        <>
          {styles.map((style) => {
            // For Fashion Ring styles, check category2 instead of style
            const isFashionRingStyle = fashionRingStyles.includes(style);
            const currentCategory2 = activeFilters.category2
              ? activeFilters.category2.split(",").map((v) => v.trim())
              : [];
            const mapEarringStyleToCategory2 = (uiLabel: string) => {
              if (uiLabel === "Daily Wear Earrings") return "DAILY WEAR";
              if (uiLabel === "Designer Earrings") return "DESIGNER EARRINGS";
              return uiLabel;
            };

            // EARRINGS: styles are stored in category2 (not in activeFilters.style)
            const isEarringStyle =
              category === "earrings" && categoryType === "earring_category";
            const isChecked = isFashionRingStyle
              ? currentCategory2.includes(style)
              : isEarringStyle
                ? currentCategory2.includes(mapEarringStyleToCategory2(style))
                : activeFilters.style.includes(style);

            return (
              <label key={`${categoryName}-${style}`} className="eng-suboption">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => {
                    // For earrings, ONLY use setEarringCategory2 (don't call updateUrlFilters)
                    if (
                      category === "earrings" &&
                      categoryType === "earring_category"
                    ) {
                      // EARRINGS: send styles ONLY in category2, with required API mapping
                      const mapEarringStyleToCategory2 = (uiLabel: string) => {
                        if (uiLabel === "Daily Wear Earrings")
                          return "DAILY WEAR";
                        if (uiLabel === "Designer Earrings")
                          return "DESIGNER EARRINGS";
                        return uiLabel;
                      };

                      // Current "styles" in category2 are stored in activeFilters.category2 (excluding lengths)
                      const existingCategory2 = activeFilters.category2 || "";
                      const parts = existingCategory2
                        ? existingCategory2.split(",").map((v) => v.trim())
                        : [];
                      const existingStyles = parts.filter(
                        (p) => p && !["Small", "Medium", "Large"].includes(p),
                      );

                      const apiValue = mapEarringStyleToCategory2(style);
                      const nextStyles = existingStyles.slice();
                      if (e.target.checked) {
                        if (!nextStyles.includes(apiValue))
                          nextStyles.push(apiValue);
                      } else {
                        const idx = nextStyles.indexOf(apiValue);
                        if (idx > -1) nextStyles.splice(idx, 1);
                      }

                      // Call setEarringCategory2 with the combined (API) style values
                      const category2Value = nextStyles.join(",");
                      setEarringCategory2(
                        categoryName,
                        category2Value,
                        nextStyles.length > 0,
                      );
                    } else if (isFashionRingStyle) {
                      // For Fashion Ring styles, send to category2 instead of style
                      const currentParams = new URLSearchParams(searchParams);
                      const existingCategory2 = currentParams.get("category2");
                      const category2Values = existingCategory2
                        ? existingCategory2.split(",").map((v) => v.trim())
                        : [];

                      if (e.target.checked) {
                        // Add to category2 if not already present
                        if (!category2Values.includes(style)) {
                          category2Values.push(style);
                        }
                        // Also add ring_category if not already present
                        if (
                          !activeFilters.ring_category.includes(categoryName)
                        ) {
                          updateUrlFilters("ring_category", categoryName, true);
                        }
                      } else {
                        // Remove from category2
                        const index = category2Values.indexOf(style);
                        if (index > -1) {
                          category2Values.splice(index, 1);
                        }
                      }

                      // Update category2 in URL
                      if (category2Values.length > 0) {
                        currentParams.set(
                          "category2",
                          category2Values.join(","),
                        );
                      } else {
                        currentParams.delete("category2");
                      }

                      setSearchParams(currentParams);

                      // Update activeFilters state
                      setActiveFilters((prev) => ({
                        ...prev,
                        category2: category2Values.join(","),
                      }));
                    } else {
                      // For other styles, batch URL updates to prevent race conditions
                      const currentParams = new URLSearchParams(searchParams);

                      // Update style parameter
                      const existingStyles = currentParams.get("style");
                      const styleValues = existingStyles
                        ? existingStyles.split(",")
                        : [];

                      if (e.target.checked) {
                        if (!styleValues.includes(style)) {
                          styleValues.push(style);
                        }
                        // Also add category if not present
                        const existingCategories =
                          currentParams.get(categoryType);
                        const categoryValues = existingCategories
                          ? existingCategories.split(",")
                          : [];
                        if (!categoryValues.includes(categoryName)) {
                          categoryValues.push(categoryName);
                        }
                        if (categoryValues.length > 0) {
                          currentParams.set(
                            categoryType,
                            categoryValues.join(","),
                          );
                        }
                      } else {
                        const index = styleValues.indexOf(style);
                        if (index > -1) {
                          styleValues.splice(index, 1);
                        }
                      }

                      // Update or delete style parameter
                      if (styleValues.length > 0) {
                        currentParams.set("style", styleValues.join(","));
                      } else {
                        currentParams.delete("style");
                      }

                      // Update URL and state together
                      setSearchParams(currentParams);
                      setActiveFilters((prev) => ({
                        ...prev,
                        style: styleValues,
                      }));
                    }
                  }}
                />
                <span>{style}</span>
              </label>
            );
          })}
        </>
      );
    };

    // Enhanced earring length options with URL updates
    const renderEarringLengths = (earringCategory: string) => (
      <>
        {[
          "Small (10 to 19mm)",
          "Medium (20 to 35mm)",
          "Large (Above 35mm)",
        ].map((item) => (
          <label key={`earring-length-${item}`} className="eng-suboption">
            <input
              type="checkbox"
              checked={activeFilters.earring_length.includes(item)}
              onChange={(e) => {
                // For earrings, ONLY use setEarringCategory2 (don't call updateUrlFilters)
                if (category === "earrings") {
                  // Update earring_length array
                  const currentLengths = activeFilters.earring_length.slice();
                  if (e.target.checked) {
                    if (!currentLengths.includes(item)) {
                      currentLengths.push(item);
                    }
                  } else {
                    const idx = currentLengths.indexOf(item);
                    if (idx > -1) {
                      currentLengths.splice(idx, 1);
                    }
                  }

                  // Call setEarringCategory2 with the combined lengths
                  const category2Value = currentLengths.join(",");
                  setEarringCategory2(
                    earringCategory,
                    category2Value,
                    currentLengths.length > 0,
                  );
                } else {
                  // For non-earrings, use the regular updateUrlFilters
                  updateUrlFilters("earring_length", item, e.target.checked);
                  if (e.target.checked) {
                    updateUrlFilters("earring_category", earringCategory, true);
                  }
                }
              }}
            />
            <span>{item}</span>
          </label>
        ))}
      </>
    );

    // Enhanced drop earring styles with URL updates
    const renderDropEarringStyles = (earringCategory: string) => {
      // For earrings, check category2 instead of style
      const currentCategory2 = activeFilters.category2
        ? activeFilters.category2.split(",").map((v) => v.trim())
        : [];

      return (
        <>
          {["Classic Solitaire", "Halo Drop Earrings"].map((item) => {
            // Check if this item is in category2
            const isChecked = currentCategory2.includes(item);

            return (
              <label key={`drop-earring-${item}`} className="eng-suboption">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => {
                    // For earrings, send to category2 only (not style)
                    if (category === "earrings") {
                      // Current "styles" in category2 are stored in activeFilters.category2 (excluding lengths)
                      const existingCategory2 = activeFilters.category2 || "";
                      const parts = existingCategory2
                        ? existingCategory2.split(",").map((v) => v.trim())
                        : [];
                      const existingStyles = parts.filter(
                        (p) => p && !["Small", "Medium", "Large"].includes(p),
                      );

                      const nextStyles = existingStyles.slice();
                      if (e.target.checked) {
                        if (!nextStyles.includes(item)) nextStyles.push(item);
                      } else {
                        const idx = nextStyles.indexOf(item);
                        if (idx > -1) nextStyles.splice(idx, 1);
                      }

                      // Call setEarringCategory2 with the combined (API) style values
                      const category2Value = nextStyles.join(",");
                      setEarringCategory2(
                        earringCategory,
                        category2Value,
                        nextStyles.length > 0,
                      );
                    } else {
                      // For non-earrings, use the regular updateUrlFilters
                      updateUrlFilters("style", item, e.target.checked);
                      // Also update earring_category when style is selected
                      if (e.target.checked) {
                        updateUrlFilters(
                          "earring_category",
                          earringCategory,
                          true,
                        );
                      }
                    }
                  }}
                />
                <span>{item}</span>
              </label>
            );
          })}
        </>
      );
    };

    // Enhanced DiamondShapeSelector with category-specific filters
    const EnhancedDiamondShapeSelector = ({
      // selectedShapes,
      showImages,
      ringCategory,
      diamondShapeFilterKey,
    }: {
      selectedShapes: string[];
      showImages: boolean;
      ringCategory: string;
      diamondShapeFilterKey: keyof typeof activeFilters;
    }) => {
      const shapes = [
        "Round",
        "Oval",
        "Princess",
        "Emerald",
        "Cushion",
        "Marquise",
        "Pear",
        "Heart",
      ];

      // Get the specific diamond shape array for this category
      const categoryDiamondShapes = activeFilters[
        diamondShapeFilterKey
      ] as string[];

      // For earrings, use the category-specific shape arrays (same as other categories)
      const isEarrings = (category as string) === "earrings";

      return (
        <div
          className="diamond-shape-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "8px",
          }}
        >
          {shapes.map((shape) => {
            // Always check the category-specific array, not the shared centerStoneShape
            const isSelected = categoryDiamondShapes.includes(shape);

            return (
              <label
                key={`${ringCategory}-${shape}`}
                className="diamond-shape-option"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "8px",
                  cursor: "pointer",
                  border: isSelected
                    ? "2px solid #10b981"
                    : "1px solid var(--border)",
                  borderRadius: "6px",
                  backgroundColor: isSelected ? "transparent" : "transparent",
                }}
                onClick={() => {
                  const newChecked = !isSelected;
                  if (isEarrings) {
                    // Handle earrings - updates both category-specific array AND centerStoneShape
                    setEarringCenterStoneShape(ringCategory, shape, newChecked);
                  } else {
                    // Handle other categories - update the diamond shape filter
                    updateUrlFilters(diamondShapeFilterKey, shape, newChecked);

                    // Add the appropriate category filter based on the current category
                    if (newChecked) {
                      if (
                        category === "rings" &&
                        !activeFilters.ring_category.includes(ringCategory)
                      ) {
                        updateUrlFilters("ring_category", ringCategory, true);
                      } else if (
                        category === "pendants" &&
                        !activeFilters.pendant_category.includes(ringCategory)
                      ) {
                        updateUrlFilters(
                          "pendant_category",
                          ringCategory,
                          true,
                        );
                      } else if (
                        category === "bracelets" &&
                        !activeFilters.bracelet_category.includes(ringCategory)
                      ) {
                        updateUrlFilters(
                          "bracelet_category",
                          ringCategory,
                          true,
                        );
                      }
                    }
                  }
                }}
              >
                {showImages && (
                  <img
                    src={`/DIAMOND_SHAPES_WEBP/${shape.toLowerCase()}.png`}
                    alt={shape}
                    className="h-10 w-10 mb-1"
                    onError={(e) => {
                      // Replace with a simple placeholder if image fails to load
                      e.currentTarget.style.display = "none";
                      const placeholder = document.createElement("div");
                      placeholder.style.cssText =
                        "width: 32px; height: 32px; background: #e5e7eb; border-radius: 50%; margin-bottom: 4px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #6b7280;";
                      placeholder.textContent = shape.charAt(0);
                      e.currentTarget.parentNode?.insertBefore(
                        placeholder,
                        e.currentTarget,
                      );
                    }}
                  />
                )}
                <span
                  style={{
                    fontSize: "10px",
                    textAlign: "center",
                    fontWeight: isSelected ? "600" : "400",
                    color: isSelected ? "#10b981" : "inherit",
                  }}
                >
                  {shape}
                </span>
              </label>
            );
          })}
        </div>
      );
    };

    // Map UI labels to API values for Engagement Ring styles
    // Returns array of API values (for "7 & 8 Stone" it returns ["7 STONE", "8 STONE"])
    const mapEngagementStyleToApi = (uiLabel: string): string[] => {
      const mapping: Record<string, string[]> = {
        Accents: ["Accent"],
        Halo: ["Halo"],
        "Hidden Halo": ["Hidden Halo"],
        "3 Stone": ["3 Stone"],
        "5 Stone": ["5 Stone"],
        "7 & 8 Stone": ["7 STONE", "8 STONE"],
      };
      return mapping[uiLabel] || [uiLabel];
    };

    // Map API values to UI labels (reverse mapping)


    const renderEngagementRingStyles = (ringCategory: string) => {
      // Get current category2 values from state/URL
      const currentCategory2 = activeFilters.category2
        ? activeFilters.category2.split(",").map((v) => v.trim())
        : [];

      return (
        <>
          {[
            "Accents",
            "Halo",
            "Hidden Halo",
            "3 Stone",
            "5 Stone",
            "7 & 8 Stone",
          ].map((uiLabel) => {
            // Map UI label to API values (array - for "7 & 8 Stone" it's ["7 STONE", "8 STONE"])
            const apiValues = mapEngagementStyleToApi(uiLabel);

            // Check if all API values for this UI label are in category2
            // For "7 & 8 Stone", both "7 STONE" and "8 STONE" must be present
            const isChecked = apiValues.every((apiValue) =>
              currentCategory2.includes(apiValue),
            );

            return (
              <label
                key={`${ringCategory}-${uiLabel}`}
                className="eng-suboption"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => {
                    // Update category2 for Engagement Ring styles (only, not style)
                    const currentParams = new URLSearchParams(searchParams);
                    const existingCategory2 = currentParams.get("category2");
                    const category2Values = existingCategory2
                      ? existingCategory2.split(",").map((v) => v.trim())
                      : [];

                    if (e.target.checked) {
                      // Add all API values to category2 if not already present
                      apiValues.forEach((apiValue) => {
                        if (!category2Values.includes(apiValue)) {
                          category2Values.push(apiValue);
                        }
                      });
                      // Only add ring_category if not already present
                      if (!activeFilters.ring_category.includes(ringCategory)) {
                        updateUrlFilters("ring_category", ringCategory, true);
                      }
                    } else {
                      // Remove all API values from category2
                      apiValues.forEach((apiValue) => {
                        const index = category2Values.indexOf(apiValue);
                        if (index > -1) {
                          category2Values.splice(index, 1);
                        }
                      });
                    }

                    // Update category2 in URL
                    if (category2Values.length > 0) {
                      currentParams.set("category2", category2Values.join(","));
                    } else {
                      currentParams.delete("category2");
                    }

                    setSearchParams(currentParams);

                    // Update activeFilters state
                    setActiveFilters((prev) => ({
                      ...prev,
                      category2: category2Values.join(","),
                    }));
                  }}
                />
                <span>{uiLabel}</span>
              </label>
            );
          })}
        </>
      );
    };

    if (category === "rings") {
      return (
        <FilterGroup title="Rings" defaultOpen={true}>
          {/* Solitaire Rings */}
          <FilterGroup
            title="Solitaire Rings"
            defaultOpen={shouldGroupBeOpen("Solitaire Rings", "ring_category")}
            isSubGroup={true}
            onToggle={(isOpen) =>
              handleFilterGroupToggle(
                "Solitaire Rings",
                "ring_category",
                isOpen,
              )
            }
          >
            <p className="eng-label-muted">DIAMOND SHAPE</p>
            <EnhancedDiamondShapeSelector
              selectedShapes={activeFilters.solitaire_diamond_shape}
              showImages={true}
              ringCategory="Solitaire Rings"
              diamondShapeFilterKey="solitaire_diamond_shape"
            />
            <p className="eng-label-muted">PRICE</p>
            <PriceRangeSlider
              minPrice={minPriceUI}
              maxPrice={maxPriceUI}
              onMinChange={handleMinChange}
              onMaxChange={handleMaxChange}
              onMinRelease={handleMinRelease}
              onMaxRelease={handleMaxRelease}
              onMinInputChange={handleMinInputChange}
              onMaxInputChange={handleMaxInputChange}
            />
          </FilterGroup>

          {/* Engagement Rings */}
          <FilterGroup
            title="Engagement Rings"
            defaultOpen={shouldGroupBeOpen("Engagement Rings", "ring_category")}
            isSubGroup={true}
            onToggle={(isOpen) =>
              handleFilterGroupToggle(
                "Engagement Rings",
                "ring_category",
                isOpen,
              )
            }
          >
            <p className="eng-label-muted">DIAMOND SHAPE</p>
            <EnhancedDiamondShapeSelector
              selectedShapes={activeFilters.engagement_diamond_shape}
              showImages={true}
              ringCategory="Engagement Rings"
              diamondShapeFilterKey="engagement_diamond_shape"
            />
            <div className="eng-sublist pt-2">
              <p className="eng-label-muted">STYLE</p>
              {renderEngagementRingStyles("Engagement Rings")}
            </div>
            <p className="eng-label-muted">PRICE</p>
            <PriceRangeSlider
              minPrice={minPriceUI}
              maxPrice={maxPriceUI}
              onMinChange={handleMinChange}
              onMaxChange={handleMaxChange}
              onMinRelease={handleMinRelease}
              onMaxRelease={handleMaxRelease}
              onMinInputChange={handleMinInputChange}
              onMaxInputChange={handleMaxInputChange}
            />
          </FilterGroup>

          {/* Mens Rings */}
          <FilterGroup
            title="Mens Rings"
            defaultOpen={shouldGroupBeOpen("Mens Rings", "ring_category")}
            isSubGroup={true}
            onToggle={(isOpen) =>
              handleFilterGroupToggle("Mens Rings", "ring_category", isOpen)
            }
          >
            <p className="eng-label-muted">DIAMOND SHAPE</p>
            <EnhancedDiamondShapeSelector
              selectedShapes={activeFilters.mens_diamond_shape}
              showImages={true}
              ringCategory="Mens Rings"
              diamondShapeFilterKey="mens_diamond_shape"
            />
            <p className="eng-label-muted">PRICE</p>
            <PriceRangeSlider
              minPrice={minPriceUI}
              maxPrice={maxPriceUI}
              onMinChange={handleMinChange}
              onMaxChange={handleMaxChange}
              onMinRelease={handleMinRelease}
              onMaxRelease={handleMaxRelease}
              onMinInputChange={handleMinInputChange}
              onMaxInputChange={handleMaxInputChange}
            />
          </FilterGroup>

          {/* Fashion Rings */}
          <FilterGroup
            title="Fashion Rings"
            defaultOpen={shouldGroupBeOpen("Fashion Rings", "ring_category")}
            isSubGroup={true}
            onToggle={(isOpen) =>
              handleFilterGroupToggle("Fashion Rings", "ring_category", isOpen)
            }
          >
            <p className="eng-label-muted">DIAMOND SHAPE</p>
            <EnhancedDiamondShapeSelector
              selectedShapes={activeFilters.fashion_diamond_shape}
              showImages={true}
              ringCategory="Fashion Rings"
              diamondShapeFilterKey="fashion_diamond_shape"
            />
            <p className="eng-label-muted">STYLE</p>
            {renderStyleOptions(
              ["Daily Wear Rings", "Designer Rings"],
              "ring_category",
              "Fashion Rings",
            )}
            <p className="eng-label-muted">PRICE</p>
            <PriceRangeSlider
              minPrice={minPriceUI}
              maxPrice={maxPriceUI}
              onMinChange={handleMinChange}
              onMaxChange={handleMaxChange}
              onMinRelease={handleMinRelease}
              onMaxRelease={handleMaxRelease}
              onMinInputChange={handleMinInputChange}
              onMaxInputChange={handleMaxInputChange}
            />
          </FilterGroup>

          {/* Men's Rings
          <FilterGroup title="Men's Rings" isSubGroup={true}>
            <p className="eng-label-muted">DIAMOND SHAPE</p>
            <EnhancedDiamondShapeSelector
              selectedShapes={activeFilters.mens_diamond_shape}
              showImages={true}
              ringCategory="Men's Rings"
              diamondShapeFilterKey="mens_diamond_shape"
            />
            <p className="eng-label-muted">PRICE</p>
            <PriceRangeSlider
              minPrice={minPriceUI}
              maxPrice={maxPriceUI}
              onMinChange={handleMinChange}
              onMaxChange={handleMaxChange}
              onMinRelease={handleMinRelease}
              onMaxRelease={handleMaxRelease}
            />
          </FilterGroup> */}
        </FilterGroup>
      );
    }

    if (category === "earrings") {
      return (
        <FilterGroup title="Earrings" defaultOpen={true}>
          {/* Studs */}
          <FilterGroup
            title="Studs"
            defaultOpen={shouldEarringGroupBeOpen("Studs")}
            isSubGroup={true}
            onToggle={(isOpen) => handleEarringGroupToggle("Studs", isOpen)}
          >
            <p className="eng-label-muted">DIAMOND SHAPE</p>
            <EnhancedDiamondShapeSelector
              selectedShapes={activeFilters.studs_diamond_shape}
              showImages={true}
              ringCategory="Studs"
              diamondShapeFilterKey="studs_diamond_shape"
            />
            <p className="eng-label-muted">PRICE</p>
            <PriceRangeSlider
              minPrice={minPriceUI}
              maxPrice={maxPriceUI}
              onMinChange={handleMinChange}
              onMaxChange={handleMaxChange}
              onMinRelease={handleMinRelease}
              onMaxRelease={handleMaxRelease}
            />
          </FilterGroup>

          {/* Hoops / Huggies */}
          <FilterGroup
            title="Hoops / Huggies"
            defaultOpen={shouldEarringGroupBeOpen("Hoops / Huggies")}
            isSubGroup={true}
            onToggle={(isOpen) =>
              handleEarringGroupToggle("Hoops / Huggies", isOpen)
            }
          >
            <p className="eng-label-muted">DIAMOND SHAPE</p>
            <EnhancedDiamondShapeSelector
              selectedShapes={activeFilters.hoops_diamond_shape}
              showImages={true}
              ringCategory="Hoops / Huggies"
              diamondShapeFilterKey="hoops_diamond_shape"
            />
            <p className="eng-label-muted">EARRINGS Length</p>
            {renderEarringLengths("Hoops / Huggies")}
            <p className="eng-label-muted">PRICE</p>
            <PriceRangeSlider
              minPrice={minPriceUI}
              maxPrice={maxPriceUI}
              onMinChange={handleMinChange}
              onMaxChange={handleMaxChange}
              onMinRelease={handleMinRelease}
              onMaxRelease={handleMaxRelease}
            />
          </FilterGroup>

          {/* Fashion Earrings */}
          <FilterGroup
            title="Fashion Earrings"
            defaultOpen={shouldEarringGroupBeOpen("Fashion Earrings")}
            isSubGroup={true}
            onToggle={(isOpen) =>
              handleEarringGroupToggle("Fashion Earrings", isOpen)
            }
          >
            <p className="eng-label-muted">DIAMOND SHAPE</p>
            <EnhancedDiamondShapeSelector
              selectedShapes={activeFilters.fashion_earring_diamond_shape}
              showImages={true}
              ringCategory="Fashion Earrings"
              diamondShapeFilterKey="fashion_earring_diamond_shape"
            />
            <div className="eng-sublist pt-2">
              <p className="eng-label-muted">STYLE</p>
              {renderStyleOptions(
                ["Daily Wear Earrings", "Designer Earrings"],
                "earring_category",
                "Fashion Earrings",
              )}
            </div>
            <p className="eng-label-muted">PRICE</p>
            <PriceRangeSlider
              minPrice={minPriceUI}
              maxPrice={maxPriceUI}
              onMinChange={handleMinChange}
              onMaxChange={handleMaxChange}
              onMinRelease={handleMinRelease}
              onMaxRelease={handleMaxRelease}
              onMinInputChange={handleMinInputChange}
              onMaxInputChange={handleMaxInputChange}
            />
          </FilterGroup>

          {/* Halo Earrings */}
          <FilterGroup
            title="Halo Earrings"
            defaultOpen={shouldEarringGroupBeOpen("Halo Earrings")}
            isSubGroup={true}
            onToggle={(isOpen) =>
              handleEarringGroupToggle("Halo Earrings", isOpen)
            }
          >
            <p className="eng-label-muted">DIAMOND SHAPE</p>
            <EnhancedDiamondShapeSelector
              selectedShapes={activeFilters.halo_earring_diamond_shape}
              showImages={true}
              ringCategory="Halo Earrings"
              diamondShapeFilterKey="halo_earring_diamond_shape"
            />
            <p className="eng-label-muted">PRICE</p>
            <PriceRangeSlider
              minPrice={minPriceUI}
              maxPrice={maxPriceUI}
              onMinChange={handleMinChange}
              onMaxChange={handleMaxChange}
              onMinRelease={handleMinRelease}
              onMaxRelease={handleMaxRelease}
              onMinInputChange={handleMinInputChange}
              onMaxInputChange={handleMaxInputChange}
            />
          </FilterGroup>

          {/* Drop Earrings */}
          <FilterGroup
            title="Drop Earrings"
            defaultOpen={shouldEarringGroupBeOpen("Drop Earrings")}
            isSubGroup={true}
            onToggle={(isOpen) =>
              handleEarringGroupToggle("Drop Earrings", isOpen)
            }
          >
            <p className="eng-label-muted">DIAMOND SHAPE</p>
            <EnhancedDiamondShapeSelector
              selectedShapes={activeFilters.drop_diamond_shape}
              showImages={true}
              ringCategory="Drop Earrings"
              diamondShapeFilterKey="drop_diamond_shape"
            />
            <div className="eng-sublist pt-2">
              <p className="eng-label-muted">STYLE</p>
              {renderDropEarringStyles("Drop Earrings")}
            </div>
            <p className="eng-label-muted">PRICE</p>
            <PriceRangeSlider
              minPrice={minPriceUI}
              maxPrice={maxPriceUI}
              onMinChange={handleMinChange}
              onMaxChange={handleMaxChange}
              onMinRelease={handleMinRelease}
              onMaxRelease={handleMaxRelease}
            />
          </FilterGroup>
        </FilterGroup>
      );
    }

    if (category === "pendants") {
      return (
        <FilterGroup title="Pendants" defaultOpen={true}>
          {/* Solitaire Pendants */}
          <FilterGroup
            title="Solitaire Pendants"
            defaultOpen={shouldGroupBeOpen(
              "Solitaire Pendants",
              "pendant_category",
            )}
            isSubGroup={true}
            onToggle={(isOpen) =>
              handleFilterGroupToggle(
                "Solitaire Pendants",
                "pendant_category",
                isOpen,
              )
            }
          >
            <p className="eng-label-muted">DIAMOND SHAPE</p>
            <EnhancedDiamondShapeSelector
              selectedShapes={activeFilters.solitaire_pendant_diamond_shape}
              showImages={true}
              ringCategory="Solitaire Pendants"
              diamondShapeFilterKey="solitaire_pendant_diamond_shape"
            />
            <p className="eng-label-muted">PRICE</p>
            <PriceRangeSlider
              minPrice={minPriceUI}
              maxPrice={maxPriceUI}
              onMinChange={handleMinChange}
              onMaxChange={handleMaxChange}
              onMinRelease={handleMinRelease}
              onMaxRelease={handleMaxRelease}
              onMinInputChange={handleMinInputChange}
              onMaxInputChange={handleMaxInputChange}
            />
          </FilterGroup>

          {/* Fashion Pendants */}
          <FilterGroup
            title="Fashion Pendants"
            defaultOpen={shouldGroupBeOpen(
              "Fashion Pendants",
              "pendant_category",
            )}
            isSubGroup={true}
            onToggle={(isOpen) =>
              handleFilterGroupToggle(
                "Fashion Pendants",
                "pendant_category",
                isOpen,
              )
            }
          >
            <p className="eng-label-muted">DIAMOND SHAPE</p>
            <EnhancedDiamondShapeSelector
              selectedShapes={activeFilters.fashion_pendant_diamond_shape}
              showImages={true}
              ringCategory="Fashion Pendants"
              diamondShapeFilterKey="fashion_pendant_diamond_shape"
            />
            <div className="eng-sublist pt-2">
              <p className="eng-label-muted">STYLE</p>
              {renderStyleOptions(
                ["Daily Wear Pendants", "Designer Pendants"],
                "pendant_category",
                "Fashion Pendants",
              )}
            </div>
            <p className="eng-label-muted">PRICE</p>
            <PriceRangeSlider
              minPrice={minPriceUI}
              maxPrice={maxPriceUI}
              onMinChange={handleMinChange}
              onMaxChange={handleMaxChange}
              onMinRelease={handleMinRelease}
              onMaxRelease={handleMaxRelease}
              onMinInputChange={handleMinInputChange}
              onMaxInputChange={handleMaxInputChange}
            />
          </FilterGroup>

          {/* Solitaire Halo */}
          <FilterGroup
            title="Solitaire Halo"
            defaultOpen={shouldGroupBeOpen(
              "Solitaire Halo",
              "pendant_category",
            )}
            isSubGroup={true}
            onToggle={(isOpen) =>
              handleFilterGroupToggle(
                "Solitaire Halo",
                "pendant_category",
                isOpen,
              )
            }
          >
            <p className="eng-label-muted">DIAMOND SHAPE</p>
            <EnhancedDiamondShapeSelector
              selectedShapes={activeFilters.halo_pendant_diamond_shape}
              showImages={true}
              ringCategory="Solitaire Halo"
              diamondShapeFilterKey="halo_pendant_diamond_shape"
            />
            <p className="eng-label-muted">PRICE</p>
            <PriceRangeSlider
              minPrice={minPriceUI}
              maxPrice={maxPriceUI}
              onMinChange={handleMinChange}
              onMaxChange={handleMaxChange}
              onMinRelease={handleMinRelease}
              onMaxRelease={handleMaxRelease}
              onMinInputChange={handleMinInputChange}
              onMaxInputChange={handleMaxInputChange}
            />
          </FilterGroup>
        </FilterGroup>
      );
    }

    if (category === "bracelets") {
      return (
        <FilterGroup title="Bracelets" defaultOpen={true}>
          {/* Tennis Bracelets */}
          <FilterGroup
            title="Tennis Bracelets"
            defaultOpen={shouldGroupBeOpen(
              "Tennis Bracelets",
              "bracelet_category",
            )}
            isSubGroup={true}
            onToggle={(isOpen) =>
              handleFilterGroupToggle(
                "Tennis Bracelets",
                "bracelet_category",
                isOpen,
              )
            }
          >
            <p className="eng-label-muted">DIAMOND SHAPE</p>
            <EnhancedDiamondShapeSelector
              selectedShapes={activeFilters.tennis_bracelet_diamond_shape}
              showImages={true}
              ringCategory="Tennis Bracelets"
              diamondShapeFilterKey="tennis_bracelet_diamond_shape"
            />
            <p className="eng-label-muted">PRICE</p>
            <PriceRangeSlider
              minPrice={minPriceUI}
              maxPrice={maxPriceUI}
              onMinChange={handleMinChange}
              onMaxChange={handleMaxChange}
              onMinRelease={handleMinRelease}
              onMaxRelease={handleMaxRelease}
              onMinInputChange={handleMinInputChange}
              onMaxInputChange={handleMaxInputChange}
            />
          </FilterGroup>

          {/* Fashion Bracelets */}
          <FilterGroup
            title="Fashion Bracelets"
            defaultOpen={shouldGroupBeOpen(
              "Fashion Bracelets",
              "bracelet_category",
            )}
            isSubGroup={true}
            onToggle={(isOpen) =>
              handleFilterGroupToggle(
                "Fashion Bracelets",
                "bracelet_category",
                isOpen,
              )
            }
          >
            <p className="eng-label-muted">DIAMOND SHAPE</p>
            <EnhancedDiamondShapeSelector
              selectedShapes={activeFilters.fashion_bracelet_diamond_shape}
              showImages={false}
              ringCategory="Fashion Bracelets"
              diamondShapeFilterKey="fashion_bracelet_diamond_shape"
            />
            <div className="eng-sublist pt-2">
              <p className="eng-label-muted">STYLE</p>
              {renderStyleOptions(
                ["Daily Wear Bracelets", "Designer Bracelets"],
                "bracelet_category",
                "Fashion Bracelets",
              )}
            </div>
            <p className="eng-label-muted">PRICE</p>
            <PriceRangeSlider
              minPrice={minPriceUI}
              maxPrice={maxPriceUI}
              onMinChange={handleMinChange}
              onMaxChange={handleMaxChange}
              onMinRelease={handleMinRelease}
              onMaxRelease={handleMaxRelease}
              onMinInputChange={handleMinInputChange}
              onMaxInputChange={handleMaxInputChange}
            />
          </FilterGroup>

          {/* Chain Bracelets */}
          <FilterGroup
            title="Chain Bracelets"
            defaultOpen={shouldGroupBeOpen(
              "Chain Bracelets",
              "bracelet_category",
            )}
            isSubGroup={true}
            onToggle={(isOpen) =>
              handleFilterGroupToggle(
                "Chain Bracelets",
                "bracelet_category",
                isOpen,
              )
            }
          >
            <div className="eng-sublist pt-2">
              <p className="eng-label-muted">STYLE</p>
              {renderStyleOptions(
                ["Gold Chains", "Silver Chains", "Rose Gold Chains"],
                "bracelet_category",
                "Chain Bracelets",
              )}
            </div>
            <p className="eng-label-muted">PRICE</p>
            <PriceRangeSlider
              minPrice={minPriceUI}
              maxPrice={maxPriceUI}
              onMinChange={handleMinChange}
              onMaxChange={handleMaxChange}
              onMinRelease={handleMinRelease}
              onMaxRelease={handleMaxRelease}
              onMinInputChange={handleMinInputChange}
              onMaxInputChange={handleMaxInputChange}
            />
          </FilterGroup>

          {/* Charm Bracelets */}
          <FilterGroup
            title="Charm Bracelets"
            defaultOpen={shouldGroupBeOpen(
              "Charm Bracelets",
              "bracelet_category",
            )}
            isSubGroup={true}
            onToggle={(isOpen) =>
              handleFilterGroupToggle(
                "Charm Bracelets",
                "bracelet_category",
                isOpen,
              )
            }
          >
            <div className="eng-sublist pt-2">
              <p className="eng-label-muted">STYLE</p>
              {renderStyleOptions(
                ["Heart Charms", "Star Charms", "Custom Charms"],
                "bracelet_category",
                "Charm Bracelets",
              )}
            </div>
            <p className="eng-label-muted">PRICE</p>
            <PriceRangeSlider
              minPrice={minPriceUI}
              maxPrice={maxPriceUI}
              onMinChange={handleMinChange}
              onMaxChange={handleMaxChange}
              onMinRelease={handleMinRelease}
              onMaxRelease={handleMaxRelease}
              onMinInputChange={handleMinInputChange}
              onMaxInputChange={handleMaxInputChange}
            />
          </FilterGroup>
        </FilterGroup>
      );
    }

    return null;
  };

  // Add a function to handle sorting
  const handleSortChange = (sortOrder: string) => {
    const sortedProducts = [...products];
    if (sortOrder === "Price: Low to High") {
      sortedProducts.sort((a, b) => a.sellingPrice - b.sellingPrice);
    } else if (sortOrder === "Price: High to Low") {
      sortedProducts.sort((a, b) => b.sellingPrice - a.sellingPrice);
    }
    setProducts(sortedProducts);
  };

  // Function to scroll to top using multiple methods
  const scrollToTop = () => {
    // Try scrolling the window
    window.scrollTo({ top: 0, behavior: "instant" });
    // Also try scrolling document
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    // Try scrolling the main container if it exists
    if (mainContainerRef.current) {
      mainContainerRef.current.scrollTop = 0;
    }
  };

  return (
    <main
      ref={mainContainerRef}
      aria-labelledby="products-heading"
      className="eng-root"
    >
      <div className="eng-wrap">
        <nav
          aria-label="Breadcrumb"
          className="eng-breadcrumb flex justify-between border-b border-solid pb-3"
        >
          <div className="pt-2">
            <Link to="/">Home</Link> <span> - </span> <span>{pageTitle}</span>
            {/* {usingCache && (
              <span className="ml-3 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                ✨ Cached
              </span>
            )} */}
          </div>
          <div className="flex items-center gap-3">
            {usingCache && (
              <button
                onClick={() => fetchProducts(1, 20, true)}
                className="text-sm text-teal-600 hover:text-teal-800 font-medium"
                title="Refresh data"
              >
                Refresh
              </button>
            )}
            <div className="">
              <label>
                Sort by:{" "}
                <select
                  className="eng-sort"
                  aria-label="Sort products"
                  onChange={(e) => handleSortChange(e.target.value)}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select
                  </option>
                  <option value="Price: Low to High">Price: Low to High</option>
                  <option value="Price: High to Low">Price: High to Low</option>
                </select>
              </label>
            </div>
          </div>
        </nav>


        {/* API Applied Filters Display */}
        {appliedFilters && !loading && (
          <div className="hidden mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-2">
              Applied Filters (from API):
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              {Object.entries(
                (appliedFilters as unknown as Record<string, unknown>) || {},
              )
                .filter(([, v]) => {
                  if (v === null || v === undefined) return false;
                  if (Array.isArray(v)) return v.length > 0;
                  if (typeof v === "string") return v.trim().length > 0;
                  return true; // numbers/booleans/objects
                })
                .map(([k, v]) => {
                  const formatLabel = (key: string) => {
                    // space before capitals, digits; replace underscores; title case
                    const spaced = key
                      .replace(/_/g, " ")
                      .replace(/([a-z])([A-Z])/g, "$1 $2")
                      .replace(/(\D)(\d)/g, "$1 $2")
                      .trim();
                    return spaced
                      .split(/\s+/)
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ");
                  };

                  let valueText = "";
                  if (Array.isArray(v)) valueText = v.join(", ");
                  else if (typeof v === "object") valueText = JSON.stringify(v);
                  else valueText = String(v);

                  return (
                    <span
                      key={`applied-${k}`}
                      className="px-2 py-1 bg-blue-200 text-blue-800 rounded"
                    >
                      {formatLabel(k)}: {valueText}
                    </span>
                  );
                })}
            </div>
          </div>
        )}

        {/* Mobile filter bar */}
        <div
          className="flex justify-between items-center my-3 sm:hidden"
          aria-hidden="false"
        >
          <button
            className="inline-flex items-center gap-2 border border-gray-300 px-3 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-50"
            onClick={() => setMobileFiltersOpen(true)}
            aria-label="Open filters"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 6h18" />
              <path d="M7 12h10" />
              <path d="M11 18h2" />
            </svg>
            Filters
          </button>
        </div>

        <section
          className={category === "bracelets" ? "mt-5" : "eng-layout mt-5"}
        >
          {/*hide sidebar if category is braceclets*/}
          {category !== "bracelets" && (
            <aside
              className="eng-filters"
              aria-label="Filters"
              role="complementary"
            >
              <div className="eng-filters-header">
                Filters
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-teal-600 hover:text-teal-800"
                >
                  Clear All
                </button>
              </div>
              {renderCategoryFilters()}
            </aside>
          )}

          <section aria-label="Products" className="eng-grid">
            {/* Display active filters summary - removed to avoid confusion */}

            {/* Loading State */}
            {loading &&
              Array.from({ length: 20 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}

            {/* Error State */}
            {error && !loading && (
              <div className="col-span-full flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="text-red-500 text-xl mb-2">⚠️</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Failed to load products
                  </h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <button
                    onClick={() => fetchProducts()}
                    className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* No Products State */}
            {!loading && !error && products.length === 0 && (
              <div className="col-span-full flex justify-center items-center py-16">
                <div className="text-center max-w-md">
                  <div className="text-gray-400 text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    No Products Found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    We couldn't find any products matching your filters. Try
                    adjusting your search criteria.
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="px-6 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}

            {/* Products */}
            {!loading &&
              !error &&
              products.length > 0 &&
              products.map((p) => {
                // Detect metal color from product image
                const detectedMetalColor =
                  getMetalColorFromImage(p.firstVariantImageUrl) || "WG";

                const wishlistKey =
                  p._id &&
                  buildWishlistKey(
                    p._id,
                    p.firstVariantSku || null,
                    detectedMetalColor,
                  );
                const isWishlisted =
                  wishlistKey && Boolean(wishlistKeyMap[wishlistKey]);

                // // Debug logging
                // if (p.modelSku === products[0]?.modelSku) {
                //   console.log("🔍 Product Debug:", {
                //     modelSku: p.modelSku,
                //     productId: p._id,
                //     variantSku: p.firstVariantSku,
                //     detectedMetalColor,
                //     wishlistKey,
                //     isWishlisted,
                //     wishlistKeyMapSize: Object.keys(wishlistKeyMap).length,
                //     wishlistKeyMapEntries: Object.entries(wishlistKeyMap).slice(
                //       0,
                //       5,
                //     ),
                //   });
                // }

                return (
                  <Link
                    to={`/product/${category}/${p.modelSku
                      }?variantId=${encodeURIComponent(
                        p.firstVariantSku,
                      )}&metalColor=${detectedMetalColor}`}
                    key={`${category}-${p.modelSku}`}
                    className="block"
                  >
                    <article
                      className="eng-card hover:shadow-lg transition-shadow duration-200"
                      aria-label={p.title}
                    >
                      <button
                        className={`eng-wishlist ${isWishlisted ? "text-red-500" : ""
                          } ${wishlistLoading ? "opacity-70" : ""}`}
                        aria-label="Add to wishlist"
                        aria-pressed={Boolean(isWishlisted)}
                        onClick={(e) => handleWishlistToggle(e, p)}
                        disabled={wishlistLoading}
                      >
                        <Heart
                          size={16}
                          className={isWishlisted ? "fill-current" : ""}
                        />
                      </button>
                      <img
                        src={p.firstVariantImageUrl}
                        alt={`${p.title} product image`}
                        loading="lazy"
                        className="eng-card-img"
                      />
                      {/* {p.metalTypes && p.metalTypes.length > 0 && (
                        <div
                          className="eng-color-row"
                          aria-label="Available metals"
                        >
                          {p.metalTypes.slice(0, 3).map((metal) => (
                            <div
                              key={`${p.modelSku}-${metal}`}
                              className="text-xs px-2 py-1 bg-gray-100 rounded-full"
                            >
                              <img
                                src={
                                  metal === "GOLD"
                                    ? "/colors/gold.png"
                                    : metal === "SILVER"
                                      ? "/colors/white.png"
                                      : metal === "PLATINUM"
                                        ? "/colors/white.png"
                                        : metal === "ROSE GOLD"
                                          ? "/colors/rose-gold.png"
                                          : metal === "WHITE GOLD"
                                            ? "/colors/white-gold.png"
                                            : "/colors/default.png"
                                }
                                className="h-6 w-6"
                                alt=""
                              />
                            </div>
                          ))}
                        </div>
                      )} */}
                      <div className="eng-card-body">
                        <h3 className="eng-card-title">{p.title}</h3>
                        <div className="text-xs text-black mt-1">
                          Starting at Rs.{p.sellingPrice.toLocaleString()}
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
          </section>
        </section>

        {/* Pagination */}
        {(() => {
          // console.log("Pagination debug:", {
          //   loading,
          //   error,
          //   totalPages: pagination.totalPages,
          //   shouldShow: !loading && !error && pagination.totalPages > 1,
          // });
          return null;
        })()}
        {!loading && !error && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center mt-8 space-x-2">
            <button
              onClick={() => {
                const newPage = pagination.currentPage - 1;
                const currentParams = new URLSearchParams(searchParams);
                currentParams.set("page", newPage.toString());
                setSearchParams(currentParams);
              }}
              disabled={pagination.currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>

            <span className="px-4 py-2 text-sm text-gray-700">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>

            <button
              onClick={() => {
                const newPage = pagination.currentPage + 1;
                const currentParams = new URLSearchParams(searchParams);
                currentParams.set("page", newPage.toString());
                setSearchParams(currentParams);
              }}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <div
        className={`eng-drawer ${mobileFiltersOpen ? "active" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Filters drawer"
      >
        <aside className="eng-drawer-aside">
          <div className="eng-drawer-head">
            <div className="flex items-center justify-between w-full">
              <span>Filters</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-teal-600 hover:text-teal-800 font-medium"
                >
                  Clear All
                </button>
                <button
                  className="eng-close"
                  onClick={() => setMobileFiltersOpen(false)}
                  aria-label="Close filters"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
          <div className="eng-drawer-content">{renderCategoryFilters()}</div>
        </aside>
      </div>
    </main>
  );
}
