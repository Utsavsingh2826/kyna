import { useState, useEffect, useCallback } from "react";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { FilterGroup, PriceRangeSlider } from "@/components/Engravings";
import "./ProductPage.css";
import "./EarringFilters.css";
import "./builder-luxury.css";

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

          const apiUrl = `/api/products/category/earrings?${params.toString()}`;
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
          `/api/products/category/${apiCategory}?${params.toString()}`
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
            <p className="eng-filter-label">Earring Type</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  className={`bld-chip${earringFilters.category1 === cat.value ? " active" : ""}`}
                  style={{ textAlign: "left" }}
                  onClick={() =>
                    updateEarringCategory(
                      earringFilters.category1 === cat.value ? "" : cat.value
                    )
                  }
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        );
      };

      const DiamondShapeSelector = () => {
        const shapes = [
          "round", "oval", "princess", "emerald",
          "cushion", "marquise", "pear", "heart",
        ];

        return (
          <div className="eng-filter-section" style={{ marginTop: "1.25rem" }}>
            <p className="eng-filter-label">Diamond Shape</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
              {shapes.map((shape) => (
                <button
                  key={shape}
                  onClick={() =>
                    updateDiamondShape(
                      earringFilters.centerStoneShape === shape ? "" : shape
                    )
                  }
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                >
                  <div className={`bld-shape-btn${earringFilters.centerStoneShape === shape ? " active" : ""}`}>
                    <img
                      src={`/DIAMOND_SHAPES_WEBP/${shape}.png`}
                      alt={shape}
                      style={{ width: 28, height: 28, objectFit: "contain" }}
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  </div>
                  <p className={`bld-shape-name${earringFilters.centerStoneShape === shape ? " active" : ""}`}>
                    {shape}
                  </p>
                </button>
              ))}
            </div>
          </div>
        );
      };

      return (
        <FilterGroup title="Earrings" defaultOpen={true}>
          <EarringCategorySelector />
          <DiamondShapeSelector />

          <div className="eng-filter-section" style={{ marginTop: "1.25rem" }}>
            <p className="eng-filter-label">Price</p>
            <PriceRangeSlider
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinChange={handleMinChange}
              onMaxChange={handleMaxChange}
            />
          </div>

          <div className="eng-filter-section" style={{ marginTop: "1.25rem" }}>
            <button onClick={clearAllFilters} className="eng-clear-btn">
              Clear All Filters
            </button>
          </div>
        </FilterGroup>
      );
    }

    // Legacy filter rendering for other categories
    return (
      <FilterGroup title={titleMap[category]} defaultOpen={true}>
        <div className="eng-filter-section">
          <p className="eng-filter-label">Price</p>
          <PriceRangeSlider
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinChange={handleMinChange}
            onMaxChange={handleMaxChange}
          />
        </div>
        <div className="eng-filter-section" style={{ marginTop: "1rem" }}>
          <button onClick={clearAllFilters} className="eng-clear-btn">
            Clear All Filters
          </button>
        </div>
      </FilterGroup>
    );
  };

  return (
    <main aria-labelledby="products-heading" className="eng-root" style={{ fontFamily: "Poppins, sans-serif" }}>
      <div className="eng-wrap">
        <nav aria-label="Breadcrumb" className="bld-breadcrumb">
          <Link to="/">Home</Link>
          <span style={{ margin: "0 6px", color: "#ccc" }}>›</span>
          <span>{titleMap[category]}</span>
        </nav>

        <div className="eng-header">
          <div>
            <p className="eng-collection-label">Collection</p>
            <h2 id="products-heading" className="eng-title">
              {titleMap[category]}
            </h2>
            <p className="eng-count">
              {loading ? "Loading…" : `${pagination.total} pieces`}
            </p>
          </div>
        </div>

        <div className="eng-container">
          {/* Sidebar Filters */}
          <aside className="eng-sidebar">{renderCategoryFilters()}</aside>

          {/* Products Grid */}
          <section className="eng-products">
            {loading && (
              <div className="eng-loading">Loading…</div>
            )}

            {error && (
              <div className="eng-error">
                <p>Unable to load products.</p>
                <button onClick={() => fetchProducts()} className="eng-retry-btn">
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && products.length === 0 && (
              <div className="eng-no-products">
                No pieces found — try adjusting your filters.
              </div>
            )}

            {!loading && !error && products.length > 0 && (
              <>
                <div className="eng-grid">
                  {products.map((product) => (
                    <Link
                      key={product.modelSku}
                      to={`/product/${product.slug}/${product.firstVariantSku}`}
                      className="eng-card"
                      style={{ textDecoration: "none", color: "inherit", display: "block" }}
                    >
                      <div className="eng-card-img-wrap">
                        <img
                          src={product.firstVariantImageUrl}
                          alt={product.title}
                          className="eng-card-img"
                          loading="lazy"
                        />
                        <button
                          className="eng-wishlist"
                          onClick={(e) => e.preventDefault()}
                          aria-label="Add to wishlist"
                        >
                          <Heart className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="eng-card-body">
                        <p className="eng-card-variants">
                          {product.variantCount} variant{product.variantCount !== 1 ? "s" : ""}
                        </p>
                        <h3 className="eng-card-title">{product.title}</h3>
                        <p className="eng-card-price">
                          ₹{product.sellingPrice.toLocaleString()}
                          {product.priceIncomplete && (
                            <span className="eng-card-onwards"> onwards</span>
                          )}
                        </p>
                        <div className="eng-metals">
                          {product.metalTypes.map((metal) => (
                            <span key={metal} className="eng-metal">{metal}</span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

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
                      ← Previous
                    </button>

                    <span className="eng-page-info">
                      {pagination.currentPage} / {pagination.totalPages}
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
                      Next →
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
