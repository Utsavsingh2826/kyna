import React from "react";
import { FilterGroup } from "./FilterGroup";
import { DiamondShapeSelector } from "./DiamondShapeSelector";
import { PriceRangeSlider } from "./PriceRangeSlider";

interface FilterSidebarProps {
  minPrice: number;
  maxPrice: number;
  onMinChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMaxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  minPrice,
  maxPrice,
  onMinChange,
  onMaxChange,
}) => {
  const renderStyleOptions = (styles: string[]) => (
    <>
      {styles.map((style) => (
        <label key={style} className="eng-suboption">
          <input
            type="checkbox"
            defaultChecked={style === "Daily Wear Rings"}
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
      {["Small (10 to 19mm)", "Medium (20 to 35mm)", "Large (Above 35mm)"].map(
        (item) => (
          <label key={item} className="eng-suboption">
            <input type="checkbox" />
            <span>{item}</span>
          </label>
        )
      )}
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
          <DiamondShapeSelector selectedShapes={["Round"]} showImages={true} />
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
          <DiamondShapeSelector
            selectedShapes={["Round", "Oval"]}
            showImages={false}
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
          <DiamondShapeSelector selectedShapes={["Round"]} showImages={true} />
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
          <DiamondShapeSelector selectedShapes={["Round"]} showImages={true} />
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
            onMinChange={onMinChange}
            onMaxChange={onMaxChange}
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
            onMinChange={onMinChange}
            onMaxChange={onMaxChange}
          />
        </FilterGroup>
      </FilterGroup>

      {/* Pendants Section */}
      <FilterGroup title="Pendents" defaultOpen={false}>
        {/* Solitaire Pendants */}
        <FilterGroup
          title="Solitaire Pendants"
          defaultOpen={false}
          isSubGroup={true}
        >
          <p className="eng-label-muted">DIAMOND SHAPE</p>
          <DiamondShapeSelector selectedShapes={["Round"]} showImages={true} />
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
            {renderStyleOptions(["Daily Wear Pendants", "Designer Pendants"])}
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
          <DiamondShapeSelector selectedShapes={["Round"]} showImages={true} />
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
