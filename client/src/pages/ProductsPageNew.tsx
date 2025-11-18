import { useState, useEffect, useCallback } from "react";
import { X, Heart } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { FilterGroup, PriceRangeSlider } from "@/components/Engravings";
import "./ProductPage.css";
import "./EarringFilters.css";

type MainCategory = "rings" | "earrings" | "pendants" | "bracelets";

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

export default function ProductsPage({ category }: { category: MainCategory }) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(50000);
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

  // Earring filter state for new API structure
  const [earringFilters, setEarringFilters] = useState({
    category1: "",
    category2: "",
    category3: "",
    centerStoneShape: "",
    page: 1,
    limit: 10,
  });

  // Legacy filter state for other categories
  const [activeFilters, setActiveFilters] = useState({
    ring_category: [] as string[],
    solitaire_diamond_shape: [] as string[],
    engagement_diamond_shape: [] as string[],
    fashion_diamond_shape: [] as string[],
    mens_diamond_shape: [] as string[],
    earring_category: [] as string[],
    studs_diamond_shape: [] as string[],
    hoops_diamond_shape: [] as string[],
    drop_diamond_shape: [] as string[],
    fashion_earring_diamond_shape: [] as string[],
    earring_length: [] as string[],
    pendant_category: [] as string[],
    solitaire_pendant_diamond_shape: [] as string[],
    fashion_pendant_diamond_shape: [] as string[],
    halo_pendant_diamond_shape: [] as string[],
    bracelet_category: [] as string[],
    tennis_bracelet_diamond_shape: [] as string[],
    fashion_bracelet_diamond_shape: [] as string[],
    style: [] as string[],
    min_price: "0",
    max_price: "50000",
  });

  // Update earring category1 filter
  const updateEarringCategory = (categoryValue: string) => {
    setEarringFilters((prev) => ({
      ...prev,
      category1: categoryValue,
      page: 1,
    }));
  };

  // Update diamond shape filter for earrings
  const updateDiamondShape = (shapeValue: string) => {
    setEarringFilters((prev) => ({
      ...prev,
      centerStoneShape: shapeValue,
      page: 1,
    }));
  };

  // Update pagination for earrings
  const updatePage = (newPage: number) => {
    setEarringFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  // API function to fetch products
  const fetchProducts = useCallback(
    async (page: number = 1, limit: number = 10) => {
      try {
        setLoading(true);
        setError(null);

        // For earrings, use the new specific API endpoint and structure
        if (category === "earrings") {
          const params = new URLSearchParams();
          params.set("page", earringFilters.page.toString());
          params.set("limit", earringFilters.limit.toString());
          params.set("category1", earringFilters.category1);
          params.set("category2", earringFilters.category2);
          params.set("category3", earringFilters.category3);
          params.set("centerStoneShape", earringFilters.centerStoneShape);

          const apiUrl = `http://localhost:5000/api/products/category/earrings?${params.toString()}`;
          console.log("Fetching earrings from:", apiUrl);

          const response = await fetch(apiUrl);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data: ApiResponse = await response.json();
          console.log("Earrings API Response:", data);

          if (data.success) {
            setProducts(data.products);
            setPagination({
              totalPages: data.pagination.totalPages,
              currentPage: data.pagination.currentPage,
              limit: data.pagination.limit,
              total: data.total,
            });
            setAppliedFilters(data.appliedFilters || null);
          } else {
            throw new Error("API returned success: false");
          }
          return;
        }

        // Legacy implementation for other categories (rings, pendants, bracelets)
        const categoryMap: Record<MainCategory, string> = {
          rings: "RINGS",
          earrings: "EARRINGS",
          pendants: "PENDANTS",
          bracelets: "BRACELETS",
        };

        const apiCategory = categoryMap[category];
        const params = new URLSearchParams();
        params.set("page", page.toString());
        params.set("limit", limit.toString());

        // Handle price range
        if (minPrice !== 0) {
          params.set("minPrice", minPrice.toString());
        }
        if (maxPrice !== 50000) {
          params.set("maxPrice", maxPrice.toString());
        }

        const response = await fetch(
          `http://localhost:5000/api/products/category/${apiCategory}?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ApiResponse = await response.json();

        if (data.success) {
          setProducts(data.products);
          setPagination({
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
    [category, earringFilters, minPrice, maxPrice]
  );

  // Price range handlers
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    const clampedValue = Math.min(value, maxPrice - 2000);
    setMinPrice(clampedValue);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    const clampedValue = Math.max(value, minPrice + 2000);
    setMaxPrice(clampedValue);
  };

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    if (category === "earrings") {
      setEarringFilters({
        category1: "",
        category2: "",
        category3: "",
        centerStoneShape: "",
        page: 1,
        limit: 10,
      });
    } else {
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
        earring_length: [],
        pendant_category: [],
        solitaire_pendant_diamond_shape: [],
        fashion_pendant_diamond_shape: [],
        halo_pendant_diamond_shape: [],
        bracelet_category: [],
        tennis_bracelet_diamond_shape: [],
        fashion_bracelet_diamond_shape: [],
        style: [],
        min_price: "0",
        max_price: "50000",
      });
    }
    setMinPrice(0);
    setMaxPrice(50000);
  }, [category]);

  // Fetch products when category or filters change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Trigger API call when earring filters change
  useEffect(() => {
    if (category === "earrings") {
      const timeoutId = setTimeout(() => {
        fetchProducts(earringFilters.page, earringFilters.limit);
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [category, earringFilters, fetchProducts]);

  const titleMap: Record<MainCategory, string> = {
    rings: "Rings",
    earrings: "Earrings",
    pendants: "Pendants",
    bracelets: "Bracelets",
  };

  // Function to render category-specific filters
  const renderCategoryFilters = () => {
    if (category === "earrings") {
      const EarringCategorySelector = () => {
        const categories = [
          { value: "studs", label: "Studs" },
          { value: "hoops/huggies", label: "Hoops / Huggies" },
          { value: "fashion earrings", label: "Fashion Earrings" },
          { value: "drop earrings", label: "Drop Earrings" },
        ];

        return (
          <div className="eng-filter-section">
            <p className="eng-label-muted">EARRING TYPE</p>
            <div className="eng-filter-grid">
              {categories.map((cat) => (
                <label key={cat.value} className="eng-suboption">
                  <input
                    type="radio"
                    name="earringCategory"
                    value={cat.value}
                    checked={earringFilters.category1 === cat.value}
                    onChange={(e) => updateEarringCategory(e.target.value)}
                  />
                  <span>{cat.label}</span>
                </label>
              ))}
            </div>
          </div>
        );
      };

      const DiamondShapeSelector = () => {
        const shapes = [
          "round",
          "oval",
          "princess",
          "emerald",
          "cushion",
          "marquise",
          "pear",
          "heart",
        ];

        return (
          <div className="eng-filter-section">
            <p className="eng-label-muted">DIAMOND SHAPE</p>
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
                  key={shape}
                  className="diamond-shape-option"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "8px",
                    cursor: "pointer",
                    border:
                      earringFilters.centerStoneShape === shape
                        ? "2px solid #14b8a6"
                        : "1px solid #d1d5db",
                    borderRadius: "6px",
                    backgroundColor:
                      earringFilters.centerStoneShape === shape
                        ? "#f0fdfa"
                        : "transparent",
                  }}
                >
                  <input
                    type="radio"
                    name="diamondShape"
                    value={shape}
                    checked={earringFilters.centerStoneShape === shape}
                    onChange={(e) => updateDiamondShape(e.target.value)}
                    style={{ marginBottom: "4px" }}
                  />
                  <img
                    src={`/DIAMOND_SHAPES_WEBP/${shape}.png`}
                    alt={shape}
                    className="h-8 w-8 mb-1"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const placeholder = document.createElement("div");
                      placeholder.style.cssText =
                        "width: 32px; height: 32px; background: #e5e7eb; border-radius: 50%; margin-bottom: 4px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #6b7280;";
                      placeholder.textContent = shape.charAt(0).toUpperCase();
                      e.currentTarget.parentNode?.insertBefore(
                        placeholder,
                        e.currentTarget
                      );
                    }}
                  />
                  <span
                    style={{
                      fontSize: "10px",
                      textAlign: "center",
                      fontWeight:
                        earringFilters.centerStoneShape === shape
                          ? "600"
                          : "400",
                    }}
                  >
                    {shape.charAt(0).toUpperCase() + shape.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        );
      };

      return (
        <FilterGroup title="Earrings" defaultOpen={true}>
          <EarringCategorySelector />
          <DiamondShapeSelector />

          <div className="eng-filter-section">
            <p className="eng-label-muted">CURRENT FILTERS</p>
            <div className="eng-current-filters">
              {earringFilters.category1 && (
                <span className="eng-filter-tag">
                  Type: {earringFilters.category1}
                  <button
                    onClick={() => updateEarringCategory("")}
                    className="eng-filter-remove"
                  >
                    ×
                  </button>
                </span>
              )}
              {earringFilters.centerStoneShape && (
                <span className="eng-filter-tag">
                  Shape: {earringFilters.centerStoneShape}
                  <button
                    onClick={() => updateDiamondShape("")}
                    className="eng-filter-remove"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>

          <div className="eng-filter-section">
            <p className="eng-label-muted">PRICE</p>
            <PriceRangeSlider
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinChange={handleMinChange}
              onMaxChange={handleMaxChange}
            />
          </div>

          <div className="eng-filter-section">
            <button
              onClick={clearAllFilters}
              className="w-full p-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Clear All Filters
            </button>
          </div>
        </FilterGroup>
      );
    }

    // Legacy filter rendering for other categories
    return (
      <FilterGroup title={titleMap[category]} defaultOpen={true}>
        <p className="eng-label-muted">PRICE</p>
        <PriceRangeSlider
          minPrice={minPrice}
          maxPrice={maxPrice}
          onMinChange={handleMinChange}
          onMaxChange={handleMaxChange}
        />
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
          {category === "earrings" && (
            <div className="eng-current-url">
              <p
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  wordBreak: "break-all",
                }}
              >
                API: http://localhost:5000/api/products/category/earrings?page=
                {earringFilters.page}&limit={earringFilters.limit}&category1=
                {earringFilters.category1}&category2={earringFilters.category2}
                &category3={earringFilters.category3}&centerStoneShape=
                {earringFilters.centerStoneShape}
              </p>
            </div>
          )}
        </div>

        <div className="eng-container">
          {/* Sidebar Filters */}
          <aside className="eng-sidebar">{renderCategoryFilters()}</aside>

          {/* Products Grid */}
          <section className="eng-products">
            {loading && (
              <div className="eng-loading">
                <p>Loading products...</p>
              </div>
            )}

            {error && (
              <div className="eng-error">
                <p>Error: {error}</p>
                <button
                  onClick={() => fetchProducts()}
                  className="eng-retry-btn"
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && products.length === 0 && (
              <div className="eng-no-products">
                <p>No products found. Try adjusting your filters.</p>
              </div>
            )}

            {!loading && !error && products.length > 0 && (
              <>
                <div className="eng-grid">
                  {products.map((product) => (
                    <div key={product.modelSku} className="eng-card">
                      <div className="eng-image-container">
                        <img
                          src={product.firstVariantImageUrl}
                          alt={product.title}
                          className="eng-image"
                          loading="lazy"
                        />
                        <button className="eng-heart">
                          <Heart className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="eng-info">
                        <h3 className="eng-name">{product.title}</h3>
                        <p className="eng-variants">
                          {product.variantCount} variants
                        </p>
                        <p className="eng-price">
                          ₹{product.sellingPrice.toLocaleString()}
                          {product.priceIncomplete && " onwards"}
                        </p>
                        <div className="eng-metals">
                          {product.metalTypes.map((metal) => (
                            <span key={metal} className="eng-metal">
                              {metal}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="eng-pagination">
                    <button
                      onClick={() =>
                        category === "earrings"
                          ? updatePage(earringFilters.page - 1)
                          : fetchProducts(pagination.currentPage - 1)
                      }
                      disabled={pagination.currentPage <= 1}
                      className="eng-page-btn"
                    >
                      Previous
                    </button>

                    <span className="eng-page-info">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>

                    <button
                      onClick={() =>
                        category === "earrings"
                          ? updatePage(earringFilters.page + 1)
                          : fetchProducts(pagination.currentPage + 1)
                      }
                      disabled={pagination.currentPage >= pagination.totalPages}
                      className="eng-page-btn"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
