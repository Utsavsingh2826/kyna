import React from "react";

interface PriceRangeSliderProps {
  minPrice: number;
  maxPrice: number;
  onMinChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMaxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  minPrice,
  maxPrice,
  onMinChange,
  onMaxChange,
}) => {
  // Define the slider absolute maximum so it can be reused (500k)
  const SLIDER_MAX = 500000;

  // Clamp values to slider bounds to avoid visual overflow
  const clampedMin = Math.max(0, Math.min(minPrice, SLIDER_MAX));
  const clampedMax = Math.max(0, Math.min(maxPrice, SLIDER_MAX));

  // Compute percentages for the active track - handle when min > max
  const actualMin = Math.min(clampedMin, clampedMax);
  const actualMax = Math.max(clampedMin, clampedMax);
  const leftPercent = (actualMin / SLIDER_MAX) * 100;
  const rightPercent = 100 - (actualMax / SLIDER_MAX) * 100;

  return (
    <div className="w-full max-w-full overflow-hidden">
      {/* Inputs row - keep compact to avoid overflow in narrow sidebars */}
      <div className="flex justify-between items-center mb-3 gap-2">
        <input
          className="eng-price-input w-20 sm:w-28 border border-gray-300 rounded-md text-center text-gray-500 text-xs"
          type="text"
          value={`${minPrice.toLocaleString()}/-`}
          readOnly
        />
        <input
          className="eng-price-input w-20 sm:w-28 border border-gray-300 rounded-md text-center text-gray-500 text-xs"
          type="text"
          value={`${maxPrice.toLocaleString()}/-`}
          readOnly
        />
      </div>

      {/* Slider row */}
      <div className="relative w-full" style={{ minHeight: 36 }}>
        {/* Track */}
        <div className="absolute left-0 right-0 top-1/2 h-2 rounded-full bg-gray-200 transform -translate-y-1/2"></div>

        {/* Active Range Highlight */}
        <div
          className="absolute top-1/2 h-2 bg-teal-500 rounded-full transform -translate-y-1/2"
          style={{ left: `${leftPercent}%`, right: `${rightPercent}%` }}
        ></div>

        {/* Max Thumb - Background slider */}
        <input
          type="range"
          min={0}
          max={SLIDER_MAX}
          value={maxPrice}
          onChange={onMaxChange}
          className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none z-10
                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5
                   [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-teal-500 [&::-webkit-slider-thumb]:border-2 
                   [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab
                   [&::-webkit-slider-thumb]:pointer-events-auto
                   [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full 
                   [&::-moz-range-thumb]:bg-teal-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-grab"
        />

        {/* Min Thumb - Foreground slider */}
        <input
          type="range"
          min={0}
          max={SLIDER_MAX}
          value={minPrice}
          onChange={onMinChange}
          className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none z-20
                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5
                   [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:border-2 
                   [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-grab
                   [&::-webkit-slider-thumb]:pointer-events-auto
                   [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full 
                   [&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-grab"
        />
      </div>
    </div>
  );
};
