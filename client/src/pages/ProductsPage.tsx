import { useState, useEffect } from "react";
import { X, Heart } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import productsData from "@/data/products.json";
import {
  FilterGroup,
  // DiamondShapeSelector,
  PriceRangeSlider,
} from "@/components/Engravings";
import "./ProductPage.css";

type ColorOption = "white" | "gold" | "rosegold";
type MainCategory = "rings" | "earrings" | "pendants" | "bracelets";

interface Product {
  id: number;
  title: string;
  oldPrice: string;
  price: string;
  img: string;
  discount: string;
  availableColors: ColorOption[];
  category: MainCategory;
}

const COLOR_ICONS: Record<ColorOption, JSX.Element> = {
  white: <img src="/colors/white.png" className="h-7" alt="White color" />,
  gold: <img src="/colors/gold.png" className="h-7" alt="Gold color" />,
  rosegold: (
    <img src="/colors/rosegold.png" className="h-7" alt="Rose Gold color" />
  ),
};

export default function ProductsPage({ category }: { category: MainCategory }) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [minPrice, setMinPrice] = useState<number>(24000);
  const [maxPrice, setMaxPrice] = useState<number>(50000);
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter state management with backend parameter names - category-specific for all jewelry types
  const [activeFilters, setActiveFilters] = useState({
    // Ring categories and filters
    ring_category: [] as string[],
    solitaire_diamond_shape: [] as string[],
    engagement_diamond_shape: [] as string[],
    fashion_diamond_shape: [] as string[],

    // Earring categories and filters
    earring_category: [] as string[], // Backend parameter for earring categories
    studs_diamond_shape: [] as string[],
    hoops_diamond_shape: [] as string[],
    drop_diamond_shape: [] as string[],
    fashion_earring_diamond_shape: [] as string[],
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
    min_price: "24000",
    max_price: "50000",
  });

  const products: Product[] = productsData as unknown as Product[];
  const filtered = products.filter((p) => p.category === category);

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
      (type === "min_price" && value !== "24000") ||
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
    const value = Math.min(Number(e.target.value), maxPrice - 1000);
    setMinPrice(value);
    updatePriceFilter("min_price", value.toString());
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), minPrice + 1000);
    setMaxPrice(value);
    updatePriceFilter("max_price", value.toString());
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
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
      pendant_category: [], // Add this missing field
      solitaire_pendant_diamond_shape: [],
      fashion_pendant_diamond_shape: [],
      halo_pendant_diamond_shape: [],
      style: [],
      bracelet_category: [],
      tennis_bracelet_diamond_shape: [],
      fashion_bracelet_diamond_shape: [],
      min_price: "24000",
      max_price: "50000",
    });
    setMinPrice(24000);
    setMaxPrice(50000);
  };

  // Initialize filters from URL on component mount
  useEffect(() => {
    if (searchParams.toString()) {
      const urlMinPrice = searchParams.get("min_price");
      const urlMaxPrice = searchParams.get("max_price");

      if (urlMinPrice) setMinPrice(parseInt(urlMinPrice));
      if (urlMaxPrice) setMaxPrice(parseInt(urlMaxPrice));

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

        // Earring filters
        earring_category: getFilterValues("earring_category"),
        studs_diamond_shape: getFilterValues("studs_diamond_shape"),
        hoops_diamond_shape: getFilterValues("hoops_diamond_shape"),
        drop_diamond_shape: getFilterValues("drop_diamond_shape"),
        fashion_earring_diamond_shape: getFilterValues(
          "fashion_earring_diamond_shape"
        ),
        earring_length: getFilterValues("earring_length"),

        // Pendant filters
        pendant_category: getFilterValues("pendant_category"), // Add this missing field
        solitaire_pendant_diamond_shape: getFilterValues(
          "solitaire_pendant_diamond_shape"
        ),
        fashion_pendant_diamond_shape: getFilterValues(
          "fashion_pendant_diamond_shape"
        ),
        halo_pendant_diamond_shape: getFilterValues(
          "halo_pendant_diamond_shape"
        ),

        // Bracelet filters
        bracelet_category: getFilterValues("bracelet_category"),
        tennis_bracelet_diamond_shape: getFilterValues(
          "tennis_bracelet_diamond_shape"
        ),
        fashion_bracelet_diamond_shape: getFilterValues(
          "fashion_bracelet_diamond_shape"
        ),

        // Common filters
        style: getFilterValues("style"),
        min_price: urlMinPrice || "24000",
        max_price: urlMaxPrice || "50000",
      });
    } else {
      clearAllFilters();
    }
  }, []);

  const titleMap: Record<MainCategory, string> = {
    rings: "Rings",
    earrings: "Earrings",
    pendants: "Pendants",
    bracelets: "Bracelets",
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
                updateUrlFilters("earring_length", item, e.target.checked);
                // Also update earring_category when length is selected
                if (e.target.checked) {
                  updateUrlFilters("earring_category", earringCategory, true);
                }
              }}
            />
            <span>{item}</span>
          </label>
        ))}
      </>
    );

    // Enhanced drop earring styles with URL updates
    const renderDropEarringStyles = (earringCategory: string) => (
      <>
        {["Classic Solitaire", "Halo Drop Earrings"].map((item) => (
          <label key={`drop-earring-${item}`} className="eng-suboption">
            <input
              type="checkbox"
              checked={activeFilters.style.includes(item)}
              onChange={(e) => {
                updateUrlFilters("style", item, e.target.checked);
                // Also update earring_category when style is selected
                if (e.target.checked) {
                  updateUrlFilters("earring_category", earringCategory, true);
                }
              }}
            />
            <span>{item}</span>
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
          {shapes.map((shape) => (
            <label
              key={`${ringCategory}-${shape}`}
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
                  src={`/diamond-shapes/${shape.toLowerCase()}.png`}
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
                  fontWeight: categoryDiamondShapes.includes(shape)
                    ? "600"
                    : "400",
                }}
              >
                {shape}
              </span>
            </label>
          ))}
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

    if (category === "rings") {
      return (
        <FilterGroup title="Rings" defaultOpen={false}>
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
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinChange={handleMinChange}
              onMaxChange={handleMaxChange}
            />
          </FilterGroup>

          {/* Engagement Rings */}
          <FilterGroup title="Engagement Rings" isSubGroup={true}>
            <p className="eng-label-muted">DIAMOND SHAPE</p>
            <EnhancedDiamondShapeSelector
              selectedShapes={activeFilters.engagement_diamond_shape}
              showImages={false}
              ringCategory="Engagement Rings"
              diamondShapeFilterKey="engagement_diamond_shape"
            />
            <p className="eng-label-muted">PRICE</p>
            <PriceRangeSlider
              minPrice={minPrice}
              maxPrice={maxPrice}
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
              showImages={false}
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
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinChange={handleMinChange}
              onMaxChange={handleMaxChange}
            />
          </FilterGroup>
        </FilterGroup>
      );
    }

    if (category === "earrings") {
      return (
        <FilterGroup title="Earrings" defaultOpen={true}>
          {/* Studs */}
          <FilterGroup title="Studs" defaultOpen={true} isSubGroup={true}>
            <p className="eng-label-muted">DIAMOND SHAPE</p>
            <EnhancedDiamondShapeSelector
              selectedShapes={activeFilters.studs_diamond_shape}
              showImages={true}
              ringCategory="Studs"
              diamondShapeFilterKey="studs_diamond_shape"
            />
            <p className="eng-label-muted">PRICE</p>
            <PriceRangeSlider
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinChange={handleMinChange}
              onMaxChange={handleMaxChange}
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
              selectedShapes={activeFilters.hoops_diamond_shape}
              showImages={true}
              ringCategory="Hoops / Huggies"
              diamondShapeFilterKey="hoops_diamond_shape"
            />
            <p className="eng-label-muted">EARRINGS Length</p>
            {renderEarringLengths("Hoops / Huggies")}
            <p className="eng-label-muted">PRICE</p>
            <PriceRangeSlider
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinChange={handleMinChange}
              onMaxChange={handleMaxChange}
            />
          </FilterGroup>

          {/* Fashion Earrings */}
          <FilterGroup title="Fashion Earrings" isSubGroup={true}>
            <p className="eng-label-muted">DIAMOND SHAPE</p>
            <EnhancedDiamondShapeSelector
              selectedShapes={activeFilters.fashion_earring_diamond_shape}
              showImages={false}
              ringCategory="Fashion Earrings"
              diamondShapeFilterKey="fashion_earring_diamond_shape"
            />
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
              onMinChange={handleMinChange}
              onMaxChange={handleMaxChange}
            />
          </FilterGroup>

          {/* Drop Earrings */}
          <FilterGroup title="Drop Earrings" isSubGroup={true}>
            <p className="eng-label-muted">DIAMOND SHAPE</p>
            <EnhancedDiamondShapeSelector
              selectedShapes={activeFilters.drop_diamond_shape}
              showImages={false}
              ringCategory="Drop Earrings"
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
              onMinChange={handleMinChange}
              onMaxChange={handleMaxChange}
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
            defaultOpen={true}
            isSubGroup={true}
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
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinChange={handleMinChange}
              onMaxChange={handleMaxChange}
            />
          </FilterGroup>

          {/* Fashion Pendants */}
          <FilterGroup title="Fashion Pendants" isSubGroup={true}>
            <p className="eng-label-muted">DIAMOND SHAPE</p>
            <EnhancedDiamondShapeSelector
              selectedShapes={activeFilters.fashion_pendant_diamond_shape}
              showImages={false}
              ringCategory="Fashion Pendants"
              diamondShapeFilterKey="fashion_pendant_diamond_shape"
            />
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
              onMinChange={handleMinChange}
              onMaxChange={handleMaxChange}
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
              selectedShapes={activeFilters.halo_pendant_diamond_shape}
              showImages={true}
              ringCategory="Solitaire Halo"
              diamondShapeFilterKey="halo_pendant_diamond_shape"
            />
            <p className="eng-label-muted">PRICE</p>
            <PriceRangeSlider
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinChange={handleMinChange}
              onMaxChange={handleMaxChange}
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
            defaultOpen={true}
            isSubGroup={true}
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
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinChange={handleMinChange}
              onMaxChange={handleMaxChange}
            />
          </FilterGroup>

          {/* Fashion Bracelets */}
          <FilterGroup title="Fashion Bracelets" isSubGroup={true}>
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
                "Fashion Bracelets"
              )}
            </div>
            <p className="eng-label-muted">PRICE</p>
            <PriceRangeSlider
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinChange={handleMinChange}
              onMaxChange={handleMaxChange}
            />
          </FilterGroup>

          {/* Chain Bracelets */}
          <FilterGroup title="Chain Bracelets" isSubGroup={true}>
            <div className="eng-sublist pt-2">
              <p className="eng-label-muted">STYLE</p>
              {renderStyleOptions(
                ["Gold Chains", "Silver Chains", "Rose Gold Chains"],
                "bracelet_category",
                "Chain Bracelets"
              )}
            </div>
            <p className="eng-label-muted">PRICE</p>
            <PriceRangeSlider
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinChange={handleMinChange}
              onMaxChange={handleMaxChange}
            />
          </FilterGroup>

          {/* Charm Bracelets */}
          <FilterGroup title="Charm Bracelets" isSubGroup={true}>
            <div className="eng-sublist pt-2">
              <p className="eng-label-muted">STYLE</p>
              {renderStyleOptions(
                ["Heart Charms", "Star Charms", "Custom Charms"],
                "bracelet_category",
                "Charm Bracelets"
              )}
            </div>
            <p className="eng-label-muted">PRICE</p>
            <PriceRangeSlider
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinChange={handleMinChange}
              onMaxChange={handleMaxChange}
            />
          </FilterGroup>
        </FilterGroup>
      );
    }

    return null;
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
            {titleMap[category]} Products ({filtered.length})
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
            {/* Display active filters summary */}
            {(activeFilters.ring_category.length > 0 ||
              activeFilters.earring_category.length > 0 ||
              activeFilters.pendant_category.length > 0 ||
              activeFilters.bracelet_category.length > 0 ||
              Object.entries(activeFilters)
                .filter(([key]) => key.includes("diamond_shape"))
                .some(([, shapes]) => (shapes as string[]).length > 0) ||
              activeFilters.earring_length.length > 0 ||
              activeFilters.style.length > 0 ||
              activeFilters.min_price !== "24000" ||
              activeFilters.max_price !== "50000") && (
              <div className="col-span-full mb-4 p-3 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Active Filters:</p>
                <div className="flex flex-wrap gap-2">
                  {/* Ring Categories */}
                  {activeFilters.ring_category.map((category) => (
                    <span
                      key={category}
                      className="px-2 py-1 bg-teal-100 text-teal-800 rounded-md text-xs"
                    >
                      Ring Category: {category}
                      <button
                        onClick={() =>
                          updateUrlFilters("ring_category", category, false)
                        }
                        className="ml-1 text-teal-600 hover:text-teal-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}

                  {/* Earring Categories */}
                  {activeFilters.earring_category.map((category) => (
                    <span
                      key={category}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs"
                    >
                      Earring Category: {category}
                      <button
                        onClick={() =>
                          updateUrlFilters("earring_category", category, false)
                        }
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}

                  {/* Pendant Categories */}
                  {activeFilters.pendant_category.map((category) => (
                    <span
                      key={category}
                      className="px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-xs"
                    >
                      Pendant Category: {category}
                      <button
                        onClick={() =>
                          updateUrlFilters("pendant_category", category, false)
                        }
                        className="ml-1 text-purple-600 hover:text-purple-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}

                  {/* Bracelet Categories */}
                  {activeFilters.bracelet_category.map((category) => (
                    <span
                      key={category}
                      className="px-2 py-1 bg-orange-100 text-orange-800 rounded-md text-xs"
                    >
                      Bracelet Category: {category}
                      <button
                        onClick={() =>
                          updateUrlFilters("bracelet_category", category, false)
                        }
                        className="ml-1 text-orange-600 hover:text-orange-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}

                  {/* Diamond Shapes */}
                  {Object.entries(activeFilters)
                    .filter(([key]) => key.includes("diamond_shape"))
                    .map(([filterKey, shapes]) =>
                      (shapes as string[]).map((shape) => {
                        const categoryName = filterKey
                          .replace("_diamond_shape", "")
                          .replace("_", " ");
                        return (
                          <span
                            key={`${filterKey}-${shape}`}
                            className="px-2 py-1 bg-teal-100 text-teal-800 rounded-md text-xs"
                          >
                            {categoryName} Shape: {shape}
                            <button
                              onClick={() =>
                                updateUrlFilters(filterKey, shape, false)
                              }
                              className="ml-1 text-teal-600 hover:text-teal-800"
                            >
                              ×
                            </button>
                          </span>
                        );
                      })
                    )}

                  {/* Earring Lengths */}
                  {activeFilters.earring_length.map((length) => (
                    <span
                      key={length}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs"
                    >
                      Length: {length}
                      <button
                        onClick={() =>
                          updateUrlFilters("earring_length", length, false)
                        }
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}

                  {/* Styles */}
                  {activeFilters.style.map((style) => (
                    <span
                      key={style}
                      className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs"
                    >
                      Style: {style}
                      <button
                        onClick={() => updateUrlFilters("style", style, false)}
                        className="ml-1 text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {filtered.map((p) => (
              <article
                className="eng-card"
                key={`${category}-${p.id}`}
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
                <img
                  src={p.img}
                  alt={`${p.title} product image`}
                  loading="lazy"
                  className="eng-card-img"
                />
                {p.availableColors && p.availableColors.length > 0 && (
                  <div className="eng-color-row" aria-label="Available colors">
                    {p.availableColors.map((c) => (
                      <span key={`${p.id}-${c}`}>{COLOR_ICONS[c]}</span>
                    ))}
                  </div>
                )}
                <div className="eng-card-body">
                  <h3 className="eng-card-title">{p.title}</h3>
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
