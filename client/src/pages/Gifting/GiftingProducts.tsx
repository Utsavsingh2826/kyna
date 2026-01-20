import { useState, useEffect } from "react";
import { X, Heart } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
// import productsData from "@/data/products.json";
import { FilterGroup, PriceRangeSlider } from "@/components/Engravings";
import "./GiftingProducts.css";

type ColorOption = "white" | "gold" | "rosegold";

interface Product {
  id: number | string;
  title: string;
  price: string;
  img: string;
  availableColors: ColorOption[];
  category: "rings" | "earrings" | "pendants";
}

interface APIProduct {
  id: string;
  name: string;
  price: number;
  rating: number;
  image: string;
  category: string;
  subCategory: string;
  modelSku: string;
  variantSku: string;
}

// const products: Product[] = productsData as unknown as Product[];

const COLOR_ICONS: Record<ColorOption, JSX.Element> = {
  white: <img src="/colors/white.png" className="h-7" alt="White color" />,
  gold: <img src="/colors/gold.png" className="h-7" alt="Gold color" />,
  rosegold: (
    <img src="/colors/rosegold.png" className="h-7" alt="Rose Gold color" />
  ),
};

// Comprehensive Filter Sidebar Component for Jewellery
const JewelleryFilterSidebar: React.FC<{
  minPrice: number;
  maxPrice: number;
  onMinChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMaxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  activeFilters: Record<string, string[] | string>;
  updateUrlFilters: (
    filterType: string,
    value: string,
    checked: boolean
  ) => void;
}> = ({
  minPrice,
  maxPrice,
  onMinChange,
  onMaxChange,
  activeFilters,
  updateUrlFilters,
}) => {
    // Enhanced DiamondShapeSelector with URL updates
    const EnhancedDiamondShapeSelector = ({
      showImages,
      category,
      diamondShapeFilterKey,
    }: {
      showImages: boolean;
      category: string;
      diamondShapeFilterKey: string;
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

      const categoryDiamondShapes =
        (activeFilters[diamondShapeFilterKey] as string[]) || [];

      return (
        <div>
          {/* Add helper text to clarify multiple selection */}
          <p className="text-xs text-gray-500 mb-2 italic">
            Select multiple shapes (hold Ctrl/Cmd for multiple)
          </p>
          <div
            className="diamond-shape-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "8px",
            }}
          >
            {shapes.map((shape) => (
              <label
                key={`${category}-${shape}`}
                className="diamond-shape-option"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "8px",
                  cursor: "pointer",
                  border: categoryDiamondShapes.includes(shape)
                    ? "2px solid var(--teal)"
                    : "1px solid var(--border)",
                  borderRadius: "6px",
                  backgroundColor: categoryDiamondShapes.includes(shape)
                    ? "var(--muted)"
                    : "transparent",
                  transition: "all 0.2s ease",
                  position: "relative",
                }}
              >
                <input
                  type="checkbox"
                  checked={categoryDiamondShapes.includes(shape)}
                  onChange={(e) => {
                    updateUrlFilters(
                      diamondShapeFilterKey,
                      shape,
                      e.target.checked
                    );
                    // Update category when diamond shape is selected
                    if (e.target.checked) {
                      const categoryKey = category.toLowerCase().includes("ring")
                        ? "ring_category"
                        : category.toLowerCase().includes("earring")
                          ? "earring_category"
                          : category.toLowerCase().includes("pendant")
                            ? "pendant_category"
                            : "category";
                      const existing =
                        (activeFilters[categoryKey] as string[]) || [];
                      if (!existing.includes(category)) {
                        updateUrlFilters(categoryKey, category, true);
                      }
                    }
                  }}
                  style={{ marginBottom: "4px" }}
                />
                {/* Selection indicator */}
                {categoryDiamondShapes.includes(shape) && (
                  <div
                    style={{
                      position: "absolute",
                      top: "4px",
                      right: "4px",
                      width: "16px",
                      height: "16px",
                      backgroundColor: "var(--teal)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "10px",
                      color: "white",
                      fontWeight: "bold",
                    }}
                  >
                    ✓
                  </div>
                )}
                {showImages && (
                  <img
                    src={`/diamond-shapes/${shape.toLowerCase()}.png`}
                    alt={shape}
                    className="h-8 w-8 mb-1"
                    onError={(e) => {
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
                    fontWeight: categoryDiamondShapes.includes(shape)
                      ? "600"
                      : "400",
                    color: categoryDiamondShapes.includes(shape)
                      ? "var(--teal)"
                      : "inherit",
                  }}
                >
                  {shape}
                </span>
              </label>
            ))}
          </div>
          {/* Show selected count */}
          {categoryDiamondShapes.length > 0 && (
            <p className="text-xs text-teal-600 mt-2 font-medium">
              {categoryDiamondShapes.length} shape
              {categoryDiamondShapes.length !== 1 ? "s" : ""} selected
            </p>
          )}
        </div>
      );
    };

    const renderStyleOptions = (
      styles: string[],
      categoryType: string,
      categoryName: string
    ) => (
      <div>
        <p className="text-xs text-gray-500 mb-2 italic">
          Multiple selections allowed
        </p>
        {styles.map((style) => (
          <label key={`${categoryName}-${style}`} className="eng-suboption">
            <input
              type="checkbox"
              checked={activeFilters.style?.includes(style) || false}
              onChange={(e) => {
                updateUrlFilters("style", style, e.target.checked);
                if (e.target.checked) {
                  updateUrlFilters(categoryType, categoryName, true);
                }
              }}
            />
            <span
              style={{
                fontWeight: activeFilters.style?.includes(style) ? "600" : "400",
                color: activeFilters.style?.includes(style)
                  ? "var(--teal)"
                  : "inherit",
              }}
            >
              {style}
            </span>
            {activeFilters.style?.includes(style) && (
              <span
                style={{
                  marginLeft: "auto",
                  color: "var(--teal)",
                  fontSize: "12px",
                }}
              >
                ✓
              </span>
            )}
          </label>
        ))}
        {/* Show selected count for styles */}
        {activeFilters.style && activeFilters.style.length > 0 && (
          <p className="text-xs text-teal-600 mt-1 font-medium px-2">
            {activeFilters.style.length} style
            {activeFilters.style.length !== 1 ? "s" : ""} selected
          </p>
        )}
      </div>
    );

    const renderEngagementRingStyles = (categoryName: string) => (
      <div>
        <p className="text-xs text-gray-500 mb-2 italic">
          Multiple selections allowed
        </p>
        {[
          "Accents",
          "Halo",
          "Hidden Halo",
          "3 Stone",
          "5 Stone",
          "7 & 8 Stone",
        ].map((item) => (
          <label key={`${categoryName}-${item}`} className="eng-suboption">
            <input
              type="checkbox"
              checked={activeFilters.style?.includes(item) || false}
              onChange={(e) => {
                updateUrlFilters("style", item, e.target.checked);
                if (e.target.checked) {
                  updateUrlFilters("ring_category", categoryName, true);
                }
              }}
            />
            <span
              style={{
                fontWeight: activeFilters.style?.includes(item) ? "600" : "400",
                color: activeFilters.style?.includes(item)
                  ? "var(--teal)"
                  : "inherit",
              }}
            >
              {item}
            </span>
            {activeFilters.style?.includes(item) && (
              <span
                style={{
                  marginLeft: "auto",
                  color: "var(--teal)",
                  fontSize: "12px",
                }}
              >
                ✓
              </span>
            )}
          </label>
        ))}
      </div>
    );

    const renderEarringLengths = (categoryName: string) => (
      <div>
        <p className="text-xs text-gray-500 mb-2 italic">
          Multiple selections allowed
        </p>
        {["Small (10 to 19mm)", "Medium (20 to 35mm)", "Large (Above 35mm)"].map(
          (item) => (
            <label key={`earring-length-${item}`} className="eng-suboption">
              <input
                type="checkbox"
                checked={activeFilters.earring_length?.includes(item) || false}
                onChange={(e) => {
                  updateUrlFilters("earring_length", item, e.target.checked);
                  if (e.target.checked) {
                    updateUrlFilters("earring_category", categoryName, true);
                  }
                }}
              />
              <span
                style={{
                  fontWeight: activeFilters.earring_length?.includes(item)
                    ? "600"
                    : "400",
                  color: activeFilters.earring_length?.includes(item)
                    ? "var(--teal)"
                    : "inherit",
                }}
              >
                {item}
              </span>
              {activeFilters.earring_length?.includes(item) && (
                <span
                  style={{
                    marginLeft: "auto",
                    color: "var(--teal)",
                    fontSize: "12px",
                  }}
                >
                  ✓
                </span>
              )}
            </label>
          )
        )}
        {/* Show selected count for lengths */}
        {activeFilters.earring_length &&
          activeFilters.earring_length.length > 0 && (
            <p className="text-xs text-teal-600 mt-1 font-medium px-2">
              {activeFilters.earring_length.length} length
              {activeFilters.earring_length.length !== 1 ? "s" : ""} selected
            </p>
          )}
      </div>
    );

    const renderDropEarringStyles = (categoryName: string) => (
      <div>
        <p className="text-xs text-gray-500 mb-2 italic">
          Multiple selections allowed
        </p>
        {["Classic Solitaire", "Halo Drop Earrings"].map((item) => (
          <label key={`drop-earring-${item}`} className="eng-suboption">
            <input
              type="checkbox"
              checked={activeFilters.style?.includes(item) || false}
              onChange={(e) => {
                updateUrlFilters("style", item, e.target.checked);
                if (e.target.checked) {
                  updateUrlFilters("earring_category", categoryName, true);
                }
              }}
            />
            <span
              style={{
                fontWeight: activeFilters.style?.includes(item) ? "600" : "400",
                color: activeFilters.style?.includes(item)
                  ? "var(--teal)"
                  : "inherit",
              }}
            >
              {item}
            </span>
            {activeFilters.style?.includes(item) && (
              <span
                style={{
                  marginLeft: "auto",
                  color: "var(--teal)",
                  fontSize: "12px",
                }}
              >
                ✓
              </span>
            )}
          </label>
        ))}
      </div>
    );

    return (
      <>
        {/* Rings Section */}
        <FilterGroup title="Rings" defaultOpen={true}>
          {/* Solitaire Rings */}
          <FilterGroup
            title="Solitaire Rings"
            defaultOpen={true}
            isSubGroup={true}
          >
            <p className="eng-label-muted">DIAMOND SHAPE</p>
            <EnhancedDiamondShapeSelector
              showImages={true}
              category="Solitaire Rings"
              diamondShapeFilterKey="solitaire_diamond_shape"
            />
            <p className="eng-label-muted">PRICE</p>
            <PriceRangeSlider
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinChange={onMinChange}
              onMaxChange={onMaxChange}
            />
          </FilterGroup>

          {/* Engagement Rings */}
          <FilterGroup title="Engagement Rings" isSubGroup={true}>
            <p className="eng-label-muted">DIAMOND SHAPE</p>
            <EnhancedDiamondShapeSelector
              showImages={false}
              category="Engagement Rings"
              diamondShapeFilterKey="engagement_diamond_shape"
            />
            <p className="eng-label-muted">PRICE</p>
            <PriceRangeSlider
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinChange={onMinChange}
              onMaxChange={onMaxChange}
            />
            <div className="eng-sublist pt-2">
              <p className="eng-label-muted">STYLE</p>
              {renderEngagementRingStyles("Engagement Rings")}
            </div>
          </FilterGroup>

          {/* Fashion Rings */}
          <FilterGroup title="Fashion Rings" isSubGroup={true}>
            <p className="eng-label-muted">STYLE</p>
            {renderStyleOptions(
              ["Daily Wear Rings", "Designer Rings"],
              "ring_category",
              "Fashion Rings"
            )}
            <p className="eng-label-muted">PRICE</p>
            <PriceRangeSlider
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinChange={onMinChange}
              onMaxChange={onMaxChange}
            />
          </FilterGroup>
        </FilterGroup>

        {/* Earrings Section */}
        <FilterGroup title="Earrings" defaultOpen={false}>
          {/* Studs */}
          <FilterGroup title="Studs" defaultOpen={false} isSubGroup={true}>
            <p className="eng-label-muted">DIAMOND SHAPE</p>
            <EnhancedDiamondShapeSelector
              showImages={true}
              category="Studs"
              diamondShapeFilterKey="studs_diamond_shape"
            />
            <p className="eng-label-muted">PRICE</p>
            <PriceRangeSlider
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinChange={onMinChange}
              onMaxChange={onMaxChange}
            />
          </FilterGroup>

          {/* Hoops / Huggies */}
          <FilterGroup
            title="Hoops / Huggies"
            defaultOpen={false}
            isSubGroup={true}
          >
            <p className="eng-label-muted">DIAMOND SHAPE</p>
            <EnhancedDiamondShapeSelector
              showImages={true}
              category="Hoops / Huggies"
              diamondShapeFilterKey="hoops_diamond_shape"
            />
            <p className="eng-label-muted">PRICE</p>
            <PriceRangeSlider
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinChange={onMinChange}
              onMaxChange={onMaxChange}
            />
            <div className="eng-sublist">
              <div className="eng-sublist pt-2">
                <p className="eng-label-muted">EARRINGS Length</p>
                {renderEarringLengths("Hoops / Huggies")}
              </div>
            </div>
          </FilterGroup>

          {/* Fashion Earrings */}
          <FilterGroup title="Fashion Earrings" isSubGroup={true}>
            <div className="eng-sublist pt-2">
              <p className="eng-label-muted">STYLE</p>
              {renderStyleOptions(
                ["Daily Wear Earrings", "Designer Earrings"],
                "earring_category",
                "Fashion Earrings"
              )}
            </div>
            <p className="eng-label-muted">PRICE</p>
            <PriceRangeSlider
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinChange={onMinChange}
              onMaxChange={onMaxChange}
            />
          </FilterGroup>

          {/* Drop Earrings */}
          <FilterGroup title="Drop Earrings" isSubGroup={true}>
            <p className="eng-label-muted">DIAMOND SHAPE</p>
            <EnhancedDiamondShapeSelector
              showImages={false}
              category="Drop Earrings"
              diamondShapeFilterKey="drop_diamond_shape"
            />
            <div className="eng-sublist pt-2">
              <p className="eng-label-muted">STYLE</p>
              {renderDropEarringStyles("Drop Earrings")}
            </div>
            <p className="eng-label-muted">PRICE</p>
            <PriceRangeSlider
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinChange={onMinChange}
              onMaxChange={onMaxChange}
            />
          </FilterGroup>
        </FilterGroup>

        {/* Pendants Section */}
        <FilterGroup title="Pendants" defaultOpen={false}>
          {/* Solitaire Pendants */}
          <FilterGroup
            title="Solitaire Pendants"
            defaultOpen={false}
            isSubGroup={true}
          >
            <p className="eng-label-muted">DIAMOND SHAPE</p>
            <EnhancedDiamondShapeSelector
              showImages={true}
              category="Solitaire Pendants"
              diamondShapeFilterKey="solitaire_pendant_diamond_shape"
            />
            <p className="eng-label-muted">PRICE</p>
            <PriceRangeSlider
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinChange={onMinChange}
              onMaxChange={onMaxChange}
            />
          </FilterGroup>

          {/* Fashion Pendants */}
          <FilterGroup title="Fashion Pendants" isSubGroup={true}>
            <div className="eng-sublist pt-2">
              <p className="eng-label-muted">STYLE</p>
              {renderStyleOptions(
                ["Daily Wear Pendants", "Designer Pendants"],
                "pendant_category",
                "Fashion Pendants"
              )}
            </div>
            <p className="eng-label-muted">PRICE</p>
            <PriceRangeSlider
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinChange={onMinChange}
              onMaxChange={onMaxChange}
            />
          </FilterGroup>

          {/* Solitaire Halo */}
          <FilterGroup
            title="Solitaire Halo"
            defaultOpen={false}
            isSubGroup={true}
          >
            <p className="eng-label-muted">DIAMOND SHAPE</p>
            <EnhancedDiamondShapeSelector
              showImages={true}
              category="Solitaire Halo"
              diamondShapeFilterKey="halo_pendant_diamond_shape"
            />
            <p className="eng-label-muted">PRICE</p>
            <PriceRangeSlider
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinChange={onMinChange}
              onMaxChange={onMaxChange}
            />
          </FilterGroup>
        </FilterGroup>

        {/* Bracelets Section */}
        <FilterGroup title="Bracelets" defaultOpen={false}>
          <FilterGroup
            title="Tennis Bracelets"
            defaultOpen={false}
            isSubGroup={true}
          >
            <p className="eng-label-muted">DIAMOND SHAPE</p>
            <EnhancedDiamondShapeSelector
              showImages={true}
              category="Tennis Bracelets"
              diamondShapeFilterKey="tennis_bracelet_diamond_shape"
            />
            <p className="eng-label-muted">PRICE</p>
            <PriceRangeSlider
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinChange={onMinChange}
              onMaxChange={onMaxChange}
            />
          </FilterGroup>

          <FilterGroup title="Fashion Bracelets" isSubGroup={true}>
            <div className="eng-sublist pt-2">
              <p className="eng-label-muted">STYLE</p>
              {renderStyleOptions(
                ["Daily Wear Bracelets", "Designer Bracelets"],
                "bracelet_category",
                "Fashion Bracelets"
              )}
            </div>
            <p className="eng-label-muted">PRICE</p>
            <PriceRangeSlider
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinChange={onMinChange}
              onMaxChange={onMaxChange}
            />
          </FilterGroup>
        </FilterGroup>
      </>
    );
  };

interface JewelleryPageProps {
  priceRange?: string;
  category?: string; // For backward compatibility
}

export default function JewelleryPage({
  priceRange,
  category,
}: JewelleryPageProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(25000);
  const [searchParams, setSearchParams] = useSearchParams();
  const [apiProducts, setApiProducts] = useState<APIProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [urlParamsInitialized, setUrlParamsInitialized] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Simplified filter state - only category and price
  const [activeFilters, setActiveFilters] = useState({
    category: "",
    min_price: "0",
    max_price: "25000",
  });

  // Helper: build URLSearchParams from the full filters state
  const buildParamsFromFilters = (state: typeof activeFilters) => {
    const params = new URLSearchParams();
    Object.entries(state).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length > 0) params.set(key, value.join(","));
      } else if (key === "min_price") {
        if (value !== "0") params.set(key, value);
      } else if (key === "max_price") {
        if (value !== "25000") params.set(key, value);
      }
    });
    return params;
  };

  // Update URL and local state for checkbox-like filters (multi-select)
  const updateUrlFilters = (
    filterType: string,
    value: string,
    checked: boolean
  ) => {
    setActiveFilters((prev) => {
      const filterKey = filterType as keyof typeof prev;
      const prevValues = Array.isArray(prev[filterKey])
        ? ([prev[filterKey]] as unknown as string[][])[0]
        : [];
      const nextValues = checked
        ? Array.from(new Set([...prevValues, value]))
        : prevValues.filter((v) => v !== value);

      const nextState = { ...prev, [filterType]: nextValues };
      const params = buildParamsFromFilters(nextState);
      setSearchParams(params, { replace: true });
      return nextState;
    });
  };

  const updatePriceFilter = (
    type: "min_price" | "max_price",
    value: string
  ) => {
    setActiveFilters((prev) => {
      const nextState = { ...prev, [type]: value };
      const params = buildParamsFromFilters(nextState);
      setSearchParams(params, { replace: true });
      return nextState;
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setActiveFilters({
      category: "",
      min_price: "0",
      max_price: "25000",
    });
    setSelectedCategory("");
    setSearchParams(new URLSearchParams(), { replace: true });
    setMinPrice(0);
    setMaxPrice(25000);
  };

  // Initialize filters from URL on component mount
  useEffect(() => {
    console.log(`🔄 [FRONTEND] URL params changed:`, searchParams.toString());

    if (searchParams.toString()) {
      const urlMinPrice = searchParams.get("min_price");
      const urlMaxPrice = searchParams.get("max_price");
      const urlCategory = searchParams.get("category");

      console.log(`📥 [FRONTEND] Reading URL params: min_price=${urlMinPrice}, max_price=${urlMaxPrice}, category=${urlCategory}`);

      if (urlMinPrice) setMinPrice(parseInt(urlMinPrice));
      if (urlMaxPrice) setMaxPrice(parseInt(urlMaxPrice));
      if (urlCategory) setSelectedCategory(urlCategory);

      setActiveFilters({
        category: urlCategory || "",
        min_price: urlMinPrice || "0",
        max_price: urlMaxPrice || "25000",
      });
      setUrlParamsInitialized(true);
    } else {
      console.log(`⚠️ [FRONTEND] No URL params found, clearing all filters`);
      clearAllFilters();
      setUrlParamsInitialized(true);
    }
  }, [searchParams]);

  // Handle URL-based price range routing (e.g., /gifting/25000-50000)
  useEffect(() => {
    // Check priceRange prop first, then fallback to category prop
    const rangeString = priceRange || category;

    if (rangeString && /^\d+-\d+$/.test(rangeString)) {
      const [urlMin, urlMax] = rangeString.split("-").map(Number);

      if (urlMin >= 0 && urlMax > urlMin) {
        console.log(`🎯 URL Price Range detected: ${urlMin} - ${urlMax}`);
        setMinPrice(urlMin);
        setMaxPrice(urlMax);

        // Update filter state as well
        setActiveFilters((prev) => ({
          ...prev,
          min_price: urlMin.toString(),
          max_price: urlMax.toString(),
        }));
      }
    }
  }, [priceRange, category]);

  // Fetch products from API
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    limit: 20,
    total: 0,
  });

  // Fetch products from API
  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);

      // Build URL with price range parameters
      const url = new URL("/api/gifting", window.location.origin);

      // Always send price range to ensure consistency
      url.searchParams.set("range", `${minPrice}-${maxPrice}`);

      // Add category filter if selected
      if (selectedCategory) {
        url.searchParams.set("category", selectedCategory);
      }

      url.searchParams.set("page", page.toString());
      url.searchParams.set("limit", "20");

      console.log(`🔍 [FRONTEND] Fetching products with minPrice: ${minPrice}, maxPrice: ${maxPrice}, category: ${selectedCategory || 'all'}`);
      console.log(`🔍 [FRONTEND] Full URL:`, url.toString());

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.success) {
        // API may return products as data.products or as data (array). Handle both.
        // Also handle data.data which might be the array if data has count/pagination at top level
        let productsFromApi = [];
        if (Array.isArray(data.products)) {
          productsFromApi = data.products;
        } else if (Array.isArray(data.data)) {
          productsFromApi = data.data;
        } else if (data.data && Array.isArray(data.data.products)) {
          productsFromApi = data.data.products;
        }

        setApiProducts(productsFromApi);

        if (data.pagination) {
          setPagination(data.pagination);
        }
      } else {
        setError("Failed to fetch products");
        setApiProducts([]);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to connect to API");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    // Only fetch after URL params have been initialized to avoid race condition
    if (urlParamsInitialized) {
      console.log(`🚀 [FRONTEND] Triggering fetch with minPrice: ${minPrice}, maxPrice: ${maxPrice}, category: ${selectedCategory || 'all'}`);

      const fetchWithGuard = async () => {
        try {
          if (!active) return;
          setLoading(true);

          // Build URL with price range parameters
          const url = new URL("/api/gifting", window.location.origin);
          url.searchParams.set("range", `${minPrice}-${maxPrice}`);

          if (selectedCategory) {
            url.searchParams.set("category", selectedCategory);
          }

          url.searchParams.set("page", "1"); // Always reset to page 1 on filter change
          url.searchParams.set("limit", "20");

          const response = await fetch(url.toString());
          const data = await response.json();

          if (!active) return;

          if (data.success) {
            let productsFromApi = [];
            if (Array.isArray(data.products)) {
              productsFromApi = data.products;
            } else if (Array.isArray(data.data)) {
              productsFromApi = data.data;
            } else if (data.data && Array.isArray(data.data.products)) {
              productsFromApi = data.data.products;
            }
            setApiProducts(productsFromApi);
            if (data.pagination) setPagination(data.pagination);
          } else {
            setError("Failed to fetch products");
            setApiProducts([]);
          }
        } catch (err) {
          if (active) {
            console.error("Error fetching products:", err);
            setError("Failed to connect to API");
          }
        } finally {
          if (active) setLoading(false);
        }
      };

      fetchWithGuard();
    } else {
      console.log(`⏸️ [FRONTEND] Skipping fetch - waiting for URL params to initialize`);
    }

    return () => { active = false; };
  }, [minPrice, maxPrice, selectedCategory, urlParamsInitialized]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), maxPrice - 1000);
    setMinPrice(value);
    updatePriceFilter("min_price", value.toString());
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), minPrice + 1000);
    setMaxPrice(value);
    updatePriceFilter("max_price", value.toString());
  };

  // Combine static products with API products
  const allProducts = [
    // ...products,
    ...apiProducts.map((p) => {
      const categoryLower = p.category?.toLowerCase() || "";

      return {
        id: p.id,
        title: p.name || "Product",
        price: `₹${Math.round(p.price || 0)}`,
        img: p.image || "/product_detail/display.png",
        availableColors: ["white", "gold", "rosegold"] as ColorOption[],
        category: categoryLower.includes("ring")
          ? "rings"
          : categoryLower.includes("earring")
            ? "earrings"
            : ("pendants" as "rings" | "earrings" | "pendants"),
        // Preserve backend data for proper linking
        modelSku: p.modelSku,
        variantSku: p.variantSku,
        categoryRaw: p.category,
      } as Product & { modelSku: string; variantSku: string; categoryRaw: string };
    }),
  ];

  // Client-side filtering logic as requested
  // Since we're filtering on the backend, use allProducts directly
  const filteredProducts = allProducts;

  return (
    <>
      <header aria-label="Site header" className="sr-only">
        <h1>Jewellery Collection — Premium Diamond Jewellery</h1>
      </header>

      <main aria-labelledby="jewellery-heading" className="eng-root">
        <div className="eng-wrap">
          <div className="eng-header">
            <h2 id="jewellery-heading" className="eng-title">
              Gifting Collection ({filteredProducts.length})
            </h2>

          </div>

          {/* Mobile filter bar */}
          <div
            className="flex justify-between items-center my-3 lg:hidden"
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
              className="eng-filters sticky top-24 self-start max-h-[calc(100vh-8rem)] overflow-y-auto"
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

              {/* Price Filters */}
              <div className="mb-6 border-b pb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Price</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setMinPrice(0);
                      setMaxPrice(25000);
                      setActiveFilters(prev => ({ ...prev, min_price: "0", max_price: "25000" }));
                      const params = new URLSearchParams(searchParams);
                      params.set("min_price", "0");
                      params.set("max_price", "25000");
                      setSearchParams(params, { replace: true });
                    }}
                    className={`w-full text-left flex items-center gap-3 px-2 py-1 rounded transition-colors ${minPrice === 0 && maxPrice === 25000
                      ? "text-teal-600 font-medium"
                      : "text-gray-600 hover:text-teal-500"
                      }`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${minPrice === 0 && maxPrice === 25000 ? "border-teal-600" : "border-gray-300"
                      }`}>
                      {minPrice === 0 && maxPrice === 25000 && (
                        <div className="w-2 h-2 rounded-full bg-teal-600" />
                      )}
                    </div>
                    Under ₹25,000
                  </button>

                  <button
                    onClick={() => {
                      setMinPrice(25000);
                      setMaxPrice(50000);
                      setActiveFilters(prev => ({ ...prev, min_price: "25000", max_price: "50000" }));
                      const params = new URLSearchParams(searchParams);
                      params.set("min_price", "25000");
                      params.set("max_price", "50000");
                      setSearchParams(params, { replace: true });
                    }}
                    className={`w-full text-left flex items-center gap-3 px-2 py-1 rounded transition-colors ${minPrice === 25000 && maxPrice === 50000
                      ? "text-teal-600 font-medium"
                      : "text-gray-600 hover:text-teal-500"
                      }`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${minPrice === 25000 && maxPrice === 50000 ? "border-teal-600" : "border-gray-300"
                      }`}>
                      {minPrice === 25000 && maxPrice === 50000 && (
                        <div className="w-2 h-2 rounded-full bg-teal-600" />
                      )}
                    </div>
                    ₹25,000 - ₹50,000
                  </button>
                </div>
              </div>

              {/* Category Filters */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 mb-4">Category</h3>
                {["Rings", "Earrings", "Pendants", "Bracelets"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      const newCategory = selectedCategory === cat.toLowerCase() ? "" : cat.toLowerCase();
                      setSelectedCategory(newCategory);

                      // Update URL params
                      const params = new URLSearchParams(searchParams);
                      if (newCategory) {
                        params.set("category", newCategory);
                      } else {
                        params.delete("category");
                      }
                      setSearchParams(params, { replace: true });
                    }}
                    className={`w-full text-left flex items-center justify-between px-2 py-2 rounded-lg transition-all ${selectedCategory === cat.toLowerCase()
                      ? "bg-teal-50 text-teal-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                  >
                    {cat}
                    {selectedCategory === cat.toLowerCase() && (
                      <span className="text-teal-600">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </aside>

            {/* Products */}
            <section aria-label="Products" className="eng-grid">
              {/* Display active filters summary */}
              {Object.values(activeFilters).some((filter) =>
                Array.isArray(filter)
                  ? filter.length > 0
                  : filter !== "24000" && filter !== "100000"
              ) && (
                  <div className="col-span-full mb-4 p-3 bg-gray-100 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Active Filters:</p>
                      <button
                        onClick={clearAllFilters}
                        className="text-xs text-red-600 hover:text-red-800 font-medium"
                      >
                        Clear All Filters
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {/* All Categories */}
                      {Object.entries(activeFilters).map(([key, values]) => {
                        if (!Array.isArray(values) || values.length === 0)
                          return null;

                        const displayName = key
                          .replace(/_/g, " ")
                          .replace(/category|diamond shape/gi, "")
                          .trim();
                        const colorClass = key.includes("ring")
                          ? "bg-teal-100 text-teal-800"
                          : key.includes("earring")
                            ? "bg-blue-100 text-blue-800"
                            : key.includes("pendant")
                              ? "bg-purple-100 text-purple-800"
                              : key.includes("bracelet")
                                ? "bg-orange-100 text-orange-800"
                                : "bg-green-100 text-green-800";

                        return (Array.isArray(values) ? values : []).map(
                          (value: string) => (
                            <span
                              key={`${key}-${value}`}
                              className={`px-2 py-1 ${colorClass} rounded-md text-xs flex items-center gap-1`}
                            >
                              <span className="font-medium">{displayName}:</span>{" "}
                              {value}
                              <button
                                onClick={() =>
                                  updateUrlFilters(key, value, false)
                                }
                                className="ml-1 hover:opacity-75 text-sm font-bold"
                                title={`Remove ${value} filter`}
                              >
                                ×
                              </button>
                            </span>
                          )
                        );
                      })}
                    </div>
                    {/* Show total filter count */}
                    <p className="text-xs text-gray-500 mt-2">
                      Total active filters:{" "}
                      {Object.values(activeFilters).reduce(
                        (count, filter) =>
                          count + (Array.isArray(filter) ? filter.length : 0),
                        0
                      )}
                    </p>
                  </div>
                )}

              {loading && (
                <div className="eng-loading col-span-full">
                  Loading products...
                </div>
              )}

              {error && (
                <div className="eng-error col-span-full">
                  {error}. Showing static products only.
                </div>
              )}

              {filteredProducts.map((p) => {
                const pWithMeta = p as Product & { modelSku?: string; variantSku?: string; categoryRaw?: string };
                // Default metal color (can be enhanced later)
                const metalColor = "WG";

                return (
                  <article
                    className="eng-card"
                    key={`jewellery-${p.id}`}
                    aria-label={p.title}
                  >
                    <button className="eng-wishlist" aria-label="Add to wishlist">
                      <Heart size={16} />
                    </button>
                    <Link to={pWithMeta.modelSku && pWithMeta.variantSku && pWithMeta.categoryRaw
                      ? `/product/${pWithMeta.categoryRaw.toLowerCase()}/${pWithMeta.modelSku}?variantId=${encodeURIComponent(pWithMeta.variantSku)}&metalColor=${metalColor}`
                      : `/product/${p.id}`}>
                      <img
                        src={p.img}
                        alt={`${p.title} product image`}
                        loading="lazy"
                        className="eng-card-img"
                      />
                    </Link>
                    {/* Available colors */}
                    {p.availableColors && p.availableColors.length > 0 && (
                      <div
                        className="eng-color-row"
                        aria-label="Available colors"
                      >
                        {p.availableColors.map((c) => (
                          <span key={`${p.id}-${c}`}>{COLOR_ICONS[c]}</span>
                        ))}
                      </div>
                    )}
                    <div className="eng-card-body">
                      <h3 className="eng-card-title">
                        <Link
                          to={pWithMeta.modelSku && pWithMeta.variantSku && pWithMeta.categoryRaw
                            ? `/product/${pWithMeta.categoryRaw.toLowerCase()}/${pWithMeta.modelSku}?variantId=${encodeURIComponent(pWithMeta.variantSku)}&metalColor=${metalColor}`
                            : `/product/${p.id}`}
                          className="hover:text-teal-600"
                        >
                          {p.title}
                        </Link>
                      </h3>
                      <div className="eng-card-prices">
                        <span className="eng-new">{p.price}</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          </section>


          {/* Pagination */}
          {!loading && !error && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 mb-8 space-x-2">
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  fetchProducts(pagination.currentPage - 1);
                }}
                disabled={pagination.currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 bg-white"
              >
                Previous
              </button>

              <span className="px-4 py-2 text-sm text-gray-700 font-medium">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>

              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  fetchProducts(pagination.currentPage + 1);
                }}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 bg-white"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Mobile Filters Drawer */}
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
            <div style={{ padding: "16px" }} className="overflow-y-auto h-full pb-20">

              {/* Price Filters Mobile */}
              <div className="mb-6 border-b border-gray-100 pb-6">
                <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">Price</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setMinPrice(0);
                      setMaxPrice(25000);
                      setActiveFilters(prev => ({ ...prev, min_price: "0", max_price: "25000" }));
                      const params = new URLSearchParams(searchParams);
                      params.set("min_price", "0");
                      params.set("max_price", "25000");
                      setSearchParams(params, { replace: true });
                      setMobileFiltersOpen(false);
                    }}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg transition-colors border ${minPrice === 0 && maxPrice === 25000
                      ? "bg-teal-50 border-teal-200 text-teal-700 font-medium"
                      : "bg-gray-50 border-gray-100 text-gray-600"
                      }`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center bg-white ${minPrice === 0 && maxPrice === 25000 ? "border-teal-600" : "border-gray-300"
                      }`}>
                      {minPrice === 0 && maxPrice === 25000 && (
                        <div className="w-2 h-2 rounded-full bg-teal-600" />
                      )}
                    </div>
                    Under ₹25,000
                  </button>

                  <button
                    onClick={() => {
                      setMinPrice(25000);
                      setMaxPrice(50000);
                      setActiveFilters(prev => ({ ...prev, min_price: "25000", max_price: "50000" }));
                      const params = new URLSearchParams(searchParams);
                      params.set("min_price", "25000");
                      params.set("max_price", "50000");
                      setSearchParams(params, { replace: true });
                      setMobileFiltersOpen(false);
                    }}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg transition-colors border ${minPrice === 25000 && maxPrice === 50000
                      ? "bg-teal-50 border-teal-200 text-teal-700 font-medium"
                      : "bg-gray-50 border-gray-100 text-gray-600"
                      }`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center bg-white ${minPrice === 25000 && maxPrice === 50000 ? "border-teal-600" : "border-gray-300"
                      }`}>
                      {minPrice === 25000 && maxPrice === 50000 && (
                        <div className="w-2 h-2 rounded-full bg-teal-600" />
                      )}
                    </div>
                    ₹25,000 - ₹50,000
                  </button>
                </div>
              </div>

              {/* Category Filters for Mobile */}
              <div className="space-y-3 pb-safe">
                <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">Category</h3>
                {["Rings", "Earrings", "Pendants", "Bracelets"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      const newCategory = selectedCategory === cat.toLowerCase() ? "" : cat.toLowerCase();
                      setSelectedCategory(newCategory);

                      // Update URL params
                      const params = new URLSearchParams(searchParams);
                      if (newCategory) {
                        params.set("category", newCategory);
                      } else {
                        params.delete("category");
                      }
                      setSearchParams(params, { replace: true });
                      setMobileFiltersOpen(false); // Close drawer after selection
                    }}
                    className={`w-full text-left flex items-center justify-between px-4 py-3 rounded-lg border transition-all ${selectedCategory === cat.toLowerCase()
                      ? "bg-teal-50 border-teal-500 text-teal-700 font-medium"
                      : "bg-white border-gray-200 text-gray-700 active:bg-gray-50"
                      }`}
                  >
                    {cat}
                    {selectedCategory === cat.toLowerCase() && (
                      <span className="text-teal-600 font-bold">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main >
    </>
  );
}
