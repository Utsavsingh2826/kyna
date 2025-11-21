import { useState, useEffect, useCallback, useRef } from "react";
import { X, Heart } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FilterGroup,
  // DiamondShapeSelector,
  PriceRangeSlider,
} from "@/components/Engravings";
import "./ProductPage.css";

type MainCategory = "rings";

interface Product {
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

export default function EngravingsPage() {
  const category: MainCategory = "rings"; // Fixed to rings only
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  // Separate UI state (updates immediately while sliding) and API state (debounced)
  const [minPriceUI, setMinPriceUI] = useState<number>(0);
  const [maxPriceUI, setMaxPriceUI] = useState<number>(50000);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(50000);
  const priceDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    limit: 5,
    total: 0,
  });
  const [appliedFilters, setAppliedFilters] = useState<
    ApiResponse["appliedFilters"] | null
  >(null);

  // Filter state management with backend parameter names - only for rings with engraving
  const [activeFilters, setActiveFilters] = useState({
    // Ring categories and filters
    ring_category: [] as string[],
    solitaire_diamond_shape: [] as string[],
    engagement_diamond_shape: [] as string[],
    fashion_diamond_shape: [] as string[],
    mens_diamond_shape: [] as string[],

    // Common filters
    style: [] as string[],
    min_price: "0",
    max_price: "50000",
  });

  // API function to fetch products
  const fetchProducts = useCallback(
    async (page: number = 1, limit: number = 20) => {
      try {
        setLoading(true);
        setError(null);

        // Only handle rings with engraving
        const apiCategory = "RINGS";

        // Build filter parameters for rings with engraving
        const buildApiFilters = () => {
          const params = new URLSearchParams();
          params.set("page", page.toString());
          params.set("limit", limit.toString());
          params.set("isEngraving", "true"); // Add engraving filter

          // Handle diamond shapes - collect all selected shapes from ring subcategories
          const allSelectedShapes = new Set<string>();

          // Collect shapes from all ring subcategories
          activeFilters.solitaire_diamond_shape.forEach((shape) =>
            allSelectedShapes.add(shape)
          );
          activeFilters.engagement_diamond_shape.forEach((shape) =>
            allSelectedShapes.add(shape)
          );
          activeFilters.fashion_diamond_shape.forEach((shape) =>
            allSelectedShapes.add(shape)
          );
          activeFilters.mens_diamond_shape.forEach((shape) =>
            allSelectedShapes.add(shape)
          );

          // Add centerStoneShape parameter if any shapes are selected
          if (allSelectedShapes.size > 0) {
            params.set(
              "centerStoneShape",
              Array.from(allSelectedShapes)
                .map((s) => s.toLowerCase())
                .join(",")
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
            activeFilters.mens_diamond_shape.length > 0
          ) {
            ringTypes.add("men");
          }

          if (ringTypes.size > 0) {
            params.set("ringType", Array.from(ringTypes).join(","));
          }

          // Handle styles
          if (activeFilters.style.length > 0) {
            params.set("style", activeFilters.style.join(","));
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
        const response = await fetch(
          `http://localhost:5000/api/products/category/${apiCategory}?${filterParams.toString()}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse = await response.json();

        console.log("API Response:", data);
        console.log("Pagination from API:", data.pagination);
        console.log("Total from API:", data.total);

        if (data.success) {
          console.log("🔍 DEBUG - Products from API:", data.products);
          console.log(
            "🔍 DEBUG - First product image URLs:",
            data.products.slice(0, 3).map((p) => ({
              modelSku: p.modelSku,
              firstVariantImageUrl: p.firstVariantImageUrl,
            }))
          );

          setProducts(data.products);
          setPagination({
            totalPages: data.pagination.totalPages,
            currentPage: data.pagination.currentPage,
            limit: data.pagination.limit,
            total: data.total,
          });
          console.log("Pagination state set to:", {
            totalPages: data.pagination.totalPages,
            currentPage: data.pagination.currentPage,
            limit: data.pagination.limit,
            total: data.total,
          });
          setAppliedFilters(data.appliedFilters || null);
        } else {
          throw new Error("API returned success: false");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch products"
        );
        setProducts([]);
      } finally {
        setLoading(false);
      }
    },
    [activeFilters, minPrice, maxPrice]
  );

  // Update URL when filters change - use comma-separated values
  const updateUrlFilters = (
    filterType: string,
    value: string,
    checked: boolean
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

    setSearchParams(currentParams);

    // Update local state
    setActiveFilters((prev) => ({
      ...prev,
      [filterType]: existingValues,
    }));
  };

  const updatePriceFilter = (
    type: "min_price" | "max_price",
    value: string
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

    setSearchParams(currentParams);

    setActiveFilters((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    console.log("🔵 MIN THUMB MOVED:", value);
    // Ensure min price doesn't exceed max price - 2000
    const clampedValue = Math.min(value, maxPriceUI - 2000);

    // Update UI immediately for smooth sliding
    setMinPriceUI(clampedValue);

    // Debounce API call
    if (priceDebounceRef.current) {
      clearTimeout(priceDebounceRef.current);
    }

    priceDebounceRef.current = setTimeout(() => {
      setMinPrice(clampedValue);
      updatePriceFilter("min_price", clampedValue.toString());
    }, 500); // 500ms debounce for API calls
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    console.log("🔶 MAX THUMB MOVED:", value);
    // Ensure max price doesn't go below min price + 2000
    const clampedValue = Math.max(value, minPriceUI + 2000);

    // Update UI immediately for smooth sliding
    setMaxPriceUI(clampedValue);

    // Debounce API call
    if (priceDebounceRef.current) {
      clearTimeout(priceDebounceRef.current);
    }

    priceDebounceRef.current = setTimeout(() => {
      setMaxPrice(clampedValue);
      updatePriceFilter("max_price", clampedValue.toString());
    }, 500); // 500ms debounce for API calls
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
      style: [],
      min_price: "0",
      max_price: "50000",
    });
  }, [setSearchParams]);

  // Cleanup debounce timeout on component unmount
  useEffect(() => {
    return () => {
      if (priceDebounceRef.current) {
        clearTimeout(priceDebounceRef.current);
      }
    };
  }, []);

  // Fetch products when component mounts
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Trigger API call when filters change (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts(1); // Reset to first page when filters change
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [fetchProducts, minPrice, maxPrice]);

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
        // Ring filters only
        ring_category: getFilterValues("ring_category"),
        solitaire_diamond_shape: getFilterValues("solitaire_diamond_shape"),
        engagement_diamond_shape: getFilterValues("engagement_diamond_shape"),
        fashion_diamond_shape: getFilterValues("fashion_diamond_shape"),
        mens_diamond_shape: getFilterValues("mens_diamond_shape"),

        // Common filters
        style: getFilterValues("style"),
        min_price: urlMinPrice || "0",
        max_price: urlMaxPrice || "50000",
      });
    } else {
      clearAllFilters();
    }
  }, [searchParams, clearAllFilters]);

  const titleMap: Record<MainCategory, string> = {
    rings: "Engraving Rings",
  };

  // Function to render category-specific filters
  const renderCategoryFilters = () => {
    // Enhanced filter components with URL updates and category tracking
    const renderStyleOptions = (
      styles: string[],
      categoryType: string,
      categoryName: string
    ) => (
      <>
        {styles.map((style) => (
          <label key={`${categoryName}-${style}`} className="eng-suboption">
            <input
              type="checkbox"
              checked={activeFilters.style.includes(style)}
              onChange={(e) => {
                updateUrlFilters("style", style, e.target.checked);
                // Update appropriate category when style is selected
                if (e.target.checked) {
                  updateUrlFilters(categoryType, categoryName, true);
                }
              }}
            />
            <span>{style}</span>
          </label>
        ))}
      </>
    );

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
                  backgroundColor: isSelected ? "#dcfce7" : "transparent",
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => {
                    // Handle ring categories only
                    updateUrlFilters(
                      diamondShapeFilterKey,
                      shape,
                      e.target.checked
                    );
                    // Only add ring_category if diamond shape is being checked and category not already present
                    if (
                      e.target.checked &&
                      !activeFilters.ring_category.includes(ringCategory)
                    ) {
                      updateUrlFilters("ring_category", ringCategory, true);
                    }
                  }}
                  style={{ marginBottom: "4px" }}
                />
                {showImages && (
                  <img
                    src={`/DIAMOND_SHAPES_WEBP/${shape.toLowerCase()}.png`}
                    alt={shape}
                    className="h-8 w-8 mb-1"
                    onError={(e) => {
                      // Replace with a simple placeholder if image fails to load
                      e.currentTarget.style.display = "none";
                      const placeholder = document.createElement("div");
                      placeholder.style.cssText =
                        "width: 32px; height: 32px; background: #e5e7eb; border-radius: 50%; margin-bottom: 4px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #6b7280;";
                      placeholder.textContent = shape.charAt(0);
                      e.currentTarget.parentNode?.insertBefore(
                        placeholder,
                        e.currentTarget
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

    const renderEngagementRingStyles = (ringCategory: string) => (
      <>
        {[
          "Accents",
          "Halo",
          "Hidden Halo",
          "3 Stone",
          "5 Stone",
          "7 & 8 Stone",
        ].map((item) => (
          <label key={`${ringCategory}-${item}`} className="eng-suboption">
            <input
              type="checkbox"
              checked={activeFilters.style.includes(item)}
              onChange={(e) => {
                updateUrlFilters("style", item, e.target.checked);
                // Only add ring_category if style is being checked and category not already present
                if (
                  e.target.checked &&
                  !activeFilters.ring_category.includes(ringCategory)
                ) {
                  updateUrlFilters("ring_category", ringCategory, true);
                }
              }}
            />
            <span>{item}</span>
          </label>
        ))}
      </>
    );

    return (
      <FilterGroup title="Engraving Rings" defaultOpen={true}>
        {/* Solitaire Rings */}
        <FilterGroup
          title="Solitaire Rings"
          defaultOpen={true}
          isSubGroup={true}
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
          />
        </FilterGroup>

        {/* Engagement Rings */}
        <FilterGroup title="Engagement Rings" isSubGroup={true}>
          <p className="eng-label-muted">DIAMOND SHAPE</p>
          <EnhancedDiamondShapeSelector
            selectedShapes={activeFilters.engagement_diamond_shape}
            showImages={true}
            ringCategory="Engagement Rings"
            diamondShapeFilterKey="engagement_diamond_shape"
          />
          <p className="eng-label-muted">PRICE</p>
          <PriceRangeSlider
            minPrice={minPriceUI}
            maxPrice={maxPriceUI}
            onMinChange={handleMinChange}
            onMaxChange={handleMaxChange}
          />
          <div className="eng-sublist pt-2">
            <p className="eng-label-muted">STYLE</p>
            {renderEngagementRingStyles("Engagement Rings")}
          </div>
        </FilterGroup>

        {/* Fashion Rings */}
        <FilterGroup title="Fashion Rings" isSubGroup={true}>
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
            "Fashion Rings"
          )}
          <p className="eng-label-muted">PRICE</p>
          <PriceRangeSlider
            minPrice={minPriceUI}
            maxPrice={maxPriceUI}
            onMinChange={handleMinChange}
            onMaxChange={handleMaxChange}
          />
        </FilterGroup>

        {/* Men's Rings */}
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
          />
        </FilterGroup>
      </FilterGroup>
    );
  };

  return (
    <main aria-labelledby="products-heading" className="eng-root">
      <div className="eng-wrap">
        <nav aria-label="Breadcrumb" className="eng-breadcrumb">
          <Link to="/">Home</Link> <span> - </span>{" "}
          <span>{titleMap[category]}</span>
        </nav>

        <div className="eng-header">
          <h2 id="products-heading" className="eng-title">
            {titleMap[category]} Products ({loading ? "..." : pagination.total})
          </h2>
          <div className="eng-actions">
            <label>
              Sort by:{" "}
              <select className="eng-sort" aria-label="Sort products">
                <option>Best Seller</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest</option>
              </select>
            </label>
          </div>
        </div>

        {/* API Applied Filters Display */}
        {appliedFilters && !loading && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-2">
              Applied Filters (from API):
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              {Object.entries(
                (appliedFilters as unknown as Record<string, unknown>) || {}
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

        <section className="eng-layout mt-5">
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

          <section aria-label="Products" className="eng-grid">
            {/* Display active filters summary - removed to avoid confusion */}

            {/* Loading State */}
            {loading && (
              <div className="col-span-full flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading products...</p>
                </div>
              </div>
            )}

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

            {/* Products */}
            {!loading &&
              !error &&
              products.map((p) => {
                // Convert any view suffix to EV (Engraving View)
                console.log(
                  "🔍 DEBUG - Original image URL:",
                  p.firstVariantImageUrl
                );

                const evImage =
                  p.firstVariantImageUrl?.replace(
                    /-(FV|SV|TV|BV|LV|RV)\.webp$/i,
                    "-EV.webp"
                  ) || p.firstVariantImageUrl;

                console.log("🎯 DEBUG - Converted EV image URL:", evImage);
                console.log(
                  "✅ DEBUG - URLs match (no conversion needed):",
                  p.firstVariantImageUrl === evImage
                );
                console.log(
                  "🔄 DEBUG - Conversion applied:",
                  p.firstVariantImageUrl !== evImage
                );
                console.log("---");

                return (
                  <Link
                    to={`/product/rings/${
                      p.modelSku
                    }?variantId=${encodeURIComponent(
                      p.firstVariantSku
                    )}&metalColor=WG&view=EV`}
                    key={`rings-${p.modelSku}`}
                    className="block"
                  >
                    <article
                      className="eng-card hover:shadow-lg transition-shadow duration-200"
                      aria-label={p.title}
                    >
                      <button
                        className="eng-wishlist"
                        aria-label="Add to wishlist"
                      >
                        <Heart size={16} />
                      </button>
                      <img
                        src={evImage || p.firstVariantImageUrl}
                        alt={`${p.title} engraving view`}
                        loading="lazy"
                        className="eng-card-img"
                        onLoad={(e) => {
                          console.log(
                            "✅ DEBUG - Image loaded successfully:",
                            e.currentTarget.src
                          );
                        }}
                        onError={(e) => {
                          console.log(
                            "❌ DEBUG - EV image failed to load:",
                            evImage
                          );
                          console.log(
                            "🔄 DEBUG - Falling back to original image:",
                            p.firstVariantImageUrl
                          );
                          // Fallback to original image if EV image fails to load
                          e.currentTarget.src = p.firstVariantImageUrl;
                        }}
                      />
                      {p.metalTypes && p.metalTypes.length > 0 && (
                        <div
                          className="eng-color-row"
                          aria-label="Available metals"
                        >
                          {p.metalTypes.slice(0, 3).map((metal) => (
                            // <span
                            //   key={`${p.modelSku}-${metal}`}
                            //   className="text-xs px-2 py-1 bg-gray-100 rounded-full"
                            // >
                            //   {metal}
                            // </span>
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
                                    ? "/colors/platinum.png"
                                    : metal === "ROSE GOLD"
                                    ? "/colors/rose-gold.png"
                                    : metal === "WHITE GOLD"
                                    ? "/colors/white-gold.png"
                                    : "/colors/default.png"
                                }
                                className="h-6 w-6"
                                alt=""
                              />
                              {/* {metal} */}
                            </div>
                          ))}
                        </div>
                      )}
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
          console.log("Pagination debug:", {
            loading,
            error,
            totalPages: pagination.totalPages,
            shouldShow: !loading && !error && pagination.totalPages > 1,
          });
          return null;
        })()}
        {!loading && !error && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center mt-8 space-x-2">
            <button
              onClick={() => fetchProducts(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>

            <span className="px-4 py-2 text-sm text-gray-700">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>

            <button
              onClick={() => fetchProducts(pagination.currentPage + 1)}
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
            <span>Filters</span>
            <button
              className="eng-close"
              onClick={() => setMobileFiltersOpen(false)}
              aria-label="Close filters"
            >
              <X size={16} />
            </button>
          </div>
          <div style={{ padding: "8px 0" }}>{renderCategoryFilters()}</div>
        </aside>
      </div>
    </main>
  );
}
