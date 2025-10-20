import { useState, useEffect } from "react";
import { X, Heart } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import productsData from "@/data/products.json";
import { FilterGroup, PriceRangeSlider } from "@/components/Engravings";
import "./JewelleryPage.css";

type ColorOption = "white" | "gold" | "rosegold";

interface Product {
  id: number;
  title: string;
  oldPrice: string;
  price: string;
  img: string;
  discount: string;
  availableColors: ColorOption[];
  category: "rings" | "earrings" | "pendants";
}

interface APIProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  mainImage: string;
  price: number;
}

const products: Product[] = productsData as unknown as Product[];

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

export default function JewelleryPage() {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [minPrice, setMinPrice] = useState<number>(24000);
  const [maxPrice, setMaxPrice] = useState<number>(100000);
  const [searchParams, setSearchParams] = useSearchParams();
  const [apiProducts, setApiProducts] = useState<APIProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state management with backend parameter names
  const [activeFilters, setActiveFilters] = useState({
    // Ring categories and filters
    ring_category: [] as string[],
    solitaire_diamond_shape: [] as string[],
    engagement_diamond_shape: [] as string[],
    fashion_diamond_shape: [] as string[],

    // Earring categories and filters
    earring_category: [] as string[],
    studs_diamond_shape: [] as string[],
    hoops_diamond_shape: [] as string[],
    drop_diamond_shape: [] as string[],
    fashion_earring_diamond_shape: [] as string[],
    earring_length: [] as string[],

    // Pendant categories and filters
    pendant_category: [] as string[],
    solitaire_pendant_diamond_shape: [] as string[],
    fashion_pendant_diamond_shape: [] as string[],
    halo_pendant_diamond_shape: [] as string[],

    // Bracelet categories and filters
    bracelet_category: [] as string[],
    tennis_bracelet_diamond_shape: [] as string[],

    // Common filters
    style: [] as string[],
    min_price: "24000",
    max_price: "100000",
  });

  // Helper: build URLSearchParams from the full filters state
  const buildParamsFromFilters = (state: typeof activeFilters) => {
    const params = new URLSearchParams();
    Object.entries(state).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length > 0) params.set(key, value.join(","));
      } else if (key === "min_price") {
        if (value !== "24000") params.set(key, value);
      } else if (key === "max_price") {
        if (value !== "100000") params.set(key, value);
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
      ring_category: [],
      solitaire_diamond_shape: [],
      engagement_diamond_shape: [],
      fashion_diamond_shape: [],
      earring_category: [],
      studs_diamond_shape: [],
      hoops_diamond_shape: [],
      drop_diamond_shape: [],
      fashion_earring_diamond_shape: [],
      earring_length: [],
      pendant_category: [],
      solitaire_pendant_diamond_shape: [],
      fashion_pendant_diamond_shape: [],
      halo_pendant_diamond_shape: [],
      bracelet_category: [],
      tennis_bracelet_diamond_shape: [],
      style: [],
      min_price: "24000",
      max_price: "100000",
    });
    setSearchParams(new URLSearchParams(), { replace: true });
    setMinPrice(24000);
    setMaxPrice(100000);
  };

  // Initialize filters from URL on component mount
  useEffect(() => {
    if (searchParams.toString()) {
      const urlMinPrice = searchParams.get("min_price");
      const urlMaxPrice = searchParams.get("max_price");

      if (urlMinPrice) setMinPrice(parseInt(urlMinPrice));
      if (urlMaxPrice) setMaxPrice(parseInt(urlMaxPrice));

      // Parse comma-separated values from URL
      const getFilterValues = (paramName: string) => {
        const param = searchParams.get(paramName);
        return param ? param.split(",") : [];
      };

      setActiveFilters({
        ring_category: getFilterValues("ring_category"),
        solitaire_diamond_shape: getFilterValues("solitaire_diamond_shape"),
        engagement_diamond_shape: getFilterValues("engagement_diamond_shape"),
        fashion_diamond_shape: getFilterValues("fashion_diamond_shape"),
        earring_category: getFilterValues("earring_category"),
        studs_diamond_shape: getFilterValues("studs_diamond_shape"),
        hoops_diamond_shape: getFilterValues("hoops_diamond_shape"),
        drop_diamond_shape: getFilterValues("drop_diamond_shape"),
        fashion_earring_diamond_shape: getFilterValues(
          "fashion_earring_diamond_shape"
        ),
        earring_length: getFilterValues("earring_length"),
        pendant_category: getFilterValues("pendant_category"),
        solitaire_pendant_diamond_shape: getFilterValues(
          "solitaire_pendant_diamond_shape"
        ),
        fashion_pendant_diamond_shape: getFilterValues(
          "fashion_pendant_diamond_shape"
        ),
        halo_pendant_diamond_shape: getFilterValues(
          "halo_pendant_diamond_shape"
        ),
        bracelet_category: getFilterValues("bracelet_category"),
        tennis_bracelet_diamond_shape: getFilterValues(
          "tennis_bracelet_diamond_shape"
        ),
        style: getFilterValues("style"),
        min_price: urlMinPrice || "24000",
        max_price: urlMaxPrice || "100000",
      });
    } else {
      clearAllFilters();
    }
  }, []);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(" http://localhost:5000/api/products");
        const data = await response.json();

        if (data.success) {
          setApiProducts(data.data.products);
        } else {
          setError("Failed to fetch products");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to connect to API");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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
    ...products,
    ...apiProducts.map((p) => ({
      id: parseInt(p.id),
      title: p.name,
      oldPrice: `₹${Math.round(p.price * 1.2)}`,
      price: `₹${p.price}`,
      img: p.mainImage.startsWith("/")
        ? p.mainImage
        : "/product_detail/display.png",
      discount: "15% OFF",
      availableColors: ["white", "gold", "rosegold"] as ColorOption[],
      category: p.category.toLowerCase().includes("ring")
        ? "rings"
        : p.category.toLowerCase().includes("earring")
        ? "earrings"
        : ("pendants" as "rings" | "earrings" | "pendants"),
    })),
  ];

  // Filter products by price range
  const filteredProducts = allProducts.filter((p) => {
    const price = parseInt(p.price.replace(/[₹,]/g, ""));
    return price >= minPrice && price <= maxPrice;
  });

  return (
    <>
      <header aria-label="Site header" className="sr-only">
        <h1>Jewellery Collection — Premium Diamond Jewellery</h1>
      </header>

      <main aria-labelledby="jewellery-heading" className="eng-root">
        <div className="eng-wrap">
          <nav aria-label="Breadcrumb" className="eng-breadcrumb">
            <Link to="/">Home</Link> <span> - </span> <span>Jewellery</span>
          </nav>

          <p className="eng-sub">
            Discover our complete collection of premium diamond jewellery. From
            elegant rings to stunning earrings, find the perfect piece that
            speaks to your style. Each piece is crafted with precision and
            attention to detail.
          </p>

          <div className="eng-header">
            <h2 id="jewellery-heading" className="eng-title">
              Jewellery Collection ({filteredProducts.length})
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
            {/* Desktop sidebar */}
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
              <JewelleryFilterSidebar
                minPrice={minPrice}
                maxPrice={maxPrice}
                onMinChange={handleMinChange}
                onMaxChange={handleMaxChange}
                activeFilters={activeFilters}
                updateUrlFilters={updateUrlFilters}
              />
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

                      return values.map((value: string) => (
                        <span
                          key={`${key}-${value}`}
                          className={`px-2 py-1 ${colorClass} rounded-md text-xs flex items-center gap-1`}
                        >
                          <span className="font-medium">{displayName}:</span>{" "}
                          {value}
                          <button
                            onClick={() => updateUrlFilters(key, value, false)}
                            className="ml-1 hover:opacity-75 text-sm font-bold"
                            title={`Remove ${value} filter`}
                          >
                            ×
                          </button>
                        </span>
                      ));
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

              {filteredProducts.map((p) => (
                <article
                  className="eng-card"
                  key={`jewellery-${p.id}`}
                  aria-label={p.title}
                >
                  {p.discount && (
                    <span
                      className="eng-badge"
                      aria-label={`${p.discount} badge`}
                    >
                      {p.discount}
                    </span>
                  )}
                  <button className="eng-wishlist" aria-label="Add to wishlist">
                    <Heart size={16} />
                  </button>
                  <Link to={`/product/${p.id}`}>
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
                        to={`/product/${p.id}`}
                        className="hover:text-teal-600"
                      >
                        {p.title}
                      </Link>
                    </h3>
                    <div className="eng-card-prices">
                      <span className="eng-old">{p.oldPrice}</span>
                      <span className="eng-new">{p.price}</span>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          </section>
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
            <div style={{ padding: "8px 0" }}>
              <JewelleryFilterSidebar
                minPrice={minPrice}
                maxPrice={maxPrice}
                onMinChange={handleMinChange}
                onMaxChange={handleMaxChange}
                activeFilters={activeFilters}
                updateUrlFilters={updateUrlFilters}
              />
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
