import { useState } from "react";
import { X, Heart } from "lucide-react";
import productsData from "@/data/products.json";
import {
  FilterGroup,
  DiamondShapeSelector,
  PriceRangeSlider,
} from "@/components/Engravings";

type ColorOption = "white" | "gold" | "rosegold";
type MainCategory = "rings" | "earrings" | "pendants";

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

  const products: Product[] = productsData as unknown as Product[];
  const filtered = products.filter((p) => p.category === category);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), maxPrice - 1000);
    setMinPrice(value);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), minPrice + 1000);
    setMaxPrice(value);
  };

  const titleMap: Record<MainCategory, string> = {
    rings: "Rings",
    earrings: "Earrings",
    pendants: "Pendants",
  };

  // Function to render category-specific filters
  const renderCategoryFilters = () => {
    const renderStyleOptions = (styles: string[]) => (
      <>
        {styles.map((style) => (
          <label key={style} className="eng-suboption">
            <input
              type="checkbox"
              defaultChecked={
                style === "Daily Wear Rings" ||
                style === "Daily Wear Earrings" ||
                style === "Daily Wear Pendants"
              }
            />
            <span>{style}</span>
          </label>
        ))}
      </>
    );

    const renderEngagementRingStyles = () => (
      <>
        {[
          "Accents",
          "Halo",
          "Hidden Halo",
          "3 Stone",
          "5 Stone",
          "7 & 8 Stone",
        ].map((item) => (
          <label key={item} className="eng-suboption">
            <input type="checkbox" />
            <span>{item}</span>
          </label>
        ))}
      </>
    );

    const renderEarringLengths = () => (
      <>
        {[
          "Small (10 to 19mm)",
          "Medium (20 to 35mm)",
          "Large (Above 35mm)",
        ].map((item) => (
          <label key={item} className="eng-suboption">
            <input type="checkbox" />
            <span>{item}</span>
          </label>
        ))}
      </>
    );

    const renderDropEarringStyles = () => (
      <>
        {["Classic Solitaire", "Halo Drop Earrings"].map((item) => (
          <label key={item} className="eng-suboption">
            <input type="checkbox" />
            <span>{item}</span>
          </label>
        ))}
      </>
    );

    if (category === "rings") {
      return (
        <FilterGroup title="Rings" defaultOpen={true}>
          {/* Solitaire Rings */}
          <FilterGroup
            title="Solitaire Rings"
            defaultOpen={true}
            isSubGroup={true}
          >
            <p className="eng-label-muted">DIAMOND SHAPE</p>
            <DiamondShapeSelector
              selectedShapes={["Round"]}
              showImages={true}
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
            <DiamondShapeSelector
              selectedShapes={["Round", "Oval"]}
              showImages={false}
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
              {renderEngagementRingStyles()}
            </div>
          </FilterGroup>

          {/* Fashion Rings */}
          <FilterGroup title="Fashion Rings" isSubGroup={true}>
            <p className="eng-label-muted">STYLE</p>
            {renderStyleOptions(["Daily Wear Rings", "Designer Rings"])}
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
            <DiamondShapeSelector
              selectedShapes={["Round"]}
              showImages={true}
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
            <DiamondShapeSelector
              selectedShapes={["Round"]}
              showImages={true}
            />
            <p className="eng-label-muted">PRICE</p>
            <PriceRangeSlider
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinChange={handleMinChange}
              onMaxChange={handleMaxChange}
            />
            <div className="eng-sublist">
              <div className="eng-sublist pt-2">
                <p className="eng-label-muted">EARRINGS Length</p>
                {renderEarringLengths()}
              </div>
            </div>
          </FilterGroup>

          {/* Fashion Earrings */}
          <FilterGroup title="Fashion Earrings" isSubGroup={true}>
            <div className="eng-sublist pt-2">
              <p className="eng-label-muted">STYLE</p>
              {renderStyleOptions(["Daily Wear Earrings", "Designer Earrings"])}
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
            <DiamondShapeSelector
              selectedShapes={["Round", "Oval"]}
              showImages={false}
            />
            <div className="eng-sublist pt-2">
              <p className="eng-label-muted">STYLE</p>
              {renderDropEarringStyles()}
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
            <DiamondShapeSelector
              selectedShapes={["Round"]}
              showImages={true}
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
            <div className="eng-sublist pt-2">
              <p className="eng-label-muted">STYLE</p>
              {renderStyleOptions(["Daily Wear Pendants", "Designer Pendants"])}
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
            <DiamondShapeSelector
              selectedShapes={["Round"]}
              showImages={true}
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

    return null;
  };

  return (
    <main aria-labelledby="products-heading" className="eng-root">
      <style>{`
        .eng-root { --teal: hsl(176 45% 40%); --teal-2: hsl(176 45% 55%); --muted: hsl(0 0% 96%); --border: hsl(0 0% 88%); --text: hsl(210 20% 15%); --subtle: hsl(210 12% 40%); color: var(--text); }
        .eng-wrap { max-width: 1200px; margin: 0 auto; padding: 1rem; }
        .eng-breadcrumb { font-size: 12px; color: var(--subtle); margin: 0.5rem 0 1rem; }
        .eng-breadcrumb a { color: inherit; text-decoration: none; }

        .eng-header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.75rem 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .eng-title { font-size: 20px; font-weight: 600; }
        .eng-sub { margin: 1rem 0; color: var(--subtle); font-size: 14px; text-align: center; }
        .eng-actions { font-size: 13px; }
        .eng-sort { border: 1px solid var(--border); background: #fff; border-radius: 8px; padding: 6px 10px; color: var(--text); }

        .eng-layout { display: grid; grid-template-columns: 1fr; gap: 1rem; }
        .eng-filters { background: #fff; border: 1px solid var(--border); border-radius: 8px; }
        .eng-filters-header { display:flex; align-items:center; justify-content:space-between; padding: 10px 12px; border-bottom: 1px solid var(--border); font-weight: 600; font-size: 14px; }
        @media (max-width: 1023px) { .eng-filters { display: none; } }
        @media (min-width: 1024px) { .eng-layout { grid-template-columns: 280px 1fr; align-items: start; } }

        details.eng-group { border-bottom: 1px solid var(--border); }
        details.eng-group > summary { list-style:none; cursor:pointer; display:flex; align-items:center; justify-content:space-between; padding: 12px; font-weight: 600; font-size: 14px; }
        details.eng-group > summary::-webkit-details-marker { display:none; }
        details.eng-group > summary .chevron { transition: transform 0.2s ease; }
        details.eng-group[open] > summary .chevron { transform: rotate(180deg); }
        details.eng-group > summary .chevron-right { transition: transform 0.2s ease; }
        details.eng-group[open] > summary .chevron-right { transform: rotate(90deg); }
        .eng-group .eng-sublist { padding: 8px 12px 12px 12px; }
        .eng-suboption { display:flex; align-items:center; gap:.5rem; padding:6px 8px; border-radius:6px; cursor:pointer; }
        .eng-suboption:hover { background: var(--muted); }
        .eng-suboption input { accent-color: var(--teal); }
        .eng-label-muted { font-size: 12px; color: var(--subtle); margin: 10px 0 6px; }

        .eng-price-range { display:flex; align-items:center; gap:.5rem; }
        .eng-price-range input[type="range"] { flex:1; accent-color: var(--teal); }
        .eng-price-input { width: 100px; border:1px solid var(--border); border-radius:6px; padding:6px 8px; font-size:12px; }

        .eng-grid { display:grid; grid-template-columns: 1fr; gap: 16px; }
        @media (min-width: 640px) { .eng-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .eng-grid { grid-template-columns: repeat(4, 1fr); } }

        .eng-card { background:#fff; border:1px solid var(--border); border-radius: 10px; overflow:hidden; position:relative; }
        .eng-card-img { width:100%; aspect-ratio: 1 / 1; object-fit: cover; display:block; background:#fafafa; }
        .eng-card-body { padding: 10px 12px 14px; }
        .eng-card-title { font-size: 13px; font-weight: 600; margin: 0 0 6px; }
        .eng-card-prices { display:flex; gap:.5rem; align-items:center; font-size: 13px; }
        .eng-old { color: var(--subtle); text-decoration: line-through; }
        .eng-new { font-weight: 600; }
        .eng-wishlist { position:absolute; top: 10px; right: 10px; background:#fff; border:1px solid var(--border); width:34px; height:34px; border-radius:50%; display:grid; place-items:center; }
        .eng-badge { position:absolute; top: 10px; left: 10px; background: var(--teal); color:#fff; font-size:11px; padding: 4px 6px; border-radius: 4px; font-weight:600; }
        .eng-color-row { display:flex; gap:0px; padding: 8px 12px 0; justify-content:center; align-items:center; }

        .eng-drawer { position: fixed; inset: 0; background: rgba(0,0,0,.36); display:none; z-index: 60; }
        .eng-drawer.active { display:block; }
        .eng-drawer-aside { position:absolute; top:0; left:0; height:100%; width:min(85%,320px); background:#fff; border-right:1px solid var(--border); transform: translateX(-100%); transition: transform .25s ease; }
        .eng-drawer.active .eng-drawer-aside { transform: translateX(0); }
        .eng-drawer-head { display:flex; align-items:center; justify-content:space-between; padding:12px; border-bottom:1px solid var(--border); font-weight:600; }
        .eng-close { border:none; background:#fff; border:1px solid var(--border); width:32px; height:32px; border-radius:8px; display:grid; place-items:center; cursor:pointer; }
      `}</style>

      <div className="eng-wrap">
        <nav aria-label="Breadcrumb" className="eng-breadcrumb">
          <a href="/">Home</a> <span> - </span>{" "}
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
            <div className="eng-filters-header">Filters</div>
            {renderCategoryFilters()}
          </aside>

          <section aria-label="Products" className="eng-grid">
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
