import React, { useState } from "react";

interface PriceRangeSliderProps {
  minPrice: number;
  maxPrice: number;
  onMinChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMaxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMinRelease?: () => void;
  onMaxRelease?: () => void;
  onMinInputChange?: (value: number) => void;
  onMaxInputChange?: (value: number) => void;
}

export const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  minPrice,
  maxPrice,
  onMinChange,
  onMaxChange,
  onMinRelease,
  onMaxRelease,
  onMinInputChange,
  onMaxInputChange,
}) => {
  // Define the slider absolute maximum so it can be reused (500k)
  const SLIDER_MAX = 500000;
  const MIN_GAP = 2000;

  // Local state for input field values (for editing)
  const [minInputValue, setMinInputValue] = useState(minPrice.toString());
  const [maxInputValue, setMaxInputValue] = useState(maxPrice.toString());

  // Clamp values to slider bounds to avoid visual overflow
  const clampedMin = Math.max(0, Math.min(minPrice, SLIDER_MAX));
  const clampedMax = Math.max(0, Math.min(maxPrice, SLIDER_MAX));

  // Compute percentages for the active track - handle when min > max
  const actualMin = Math.min(clampedMin, clampedMax);
  const actualMax = Math.max(clampedMin, clampedMax);
  const leftPercent = (actualMin / SLIDER_MAX) * 100;
  const rightPercent = 100 - (actualMax / SLIDER_MAX) * 100;

  // Update local state when props change
  React.useEffect(() => {
    setMinInputValue(minPrice.toString());
  }, [minPrice]);

  React.useEffect(() => {
    setMaxInputValue(maxPrice.toString());
  }, [maxPrice]);

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, ""); // Only allow numbers

    // Limit to 6 digits (max 500000)
    if (value.length <= 6) {
      const numValue = parseInt(value) || 0;
      // Don't allow values greater than SLIDER_MAX
      if (numValue <= SLIDER_MAX) {
        setMinInputValue(value);
      }
    }
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, ""); // Only allow numbers

    // Limit to 6 digits (max 500000)
    if (value.length <= 6) {
      const numValue = parseInt(value) || 0;
      // Don't allow values greater than SLIDER_MAX
      if (numValue <= SLIDER_MAX) {
        setMaxInputValue(value);
      }
    }
  };

  const handleMinInputBlur = () => {
    let numValue = parseInt(minInputValue) || 0;

    // Validate and clamp
    numValue = Math.max(0, Math.min(numValue, SLIDER_MAX));
    numValue = Math.min(numValue, maxPrice - MIN_GAP);

    setMinInputValue(numValue.toString());
    if (onMinInputChange) {
      onMinInputChange(numValue);
    }
  };

  const handleMaxInputBlur = () => {
    let numValue = parseInt(maxInputValue) || 0;

    // Validate and clamp
    numValue = Math.max(0, Math.min(numValue, SLIDER_MAX));
    numValue = Math.max(numValue, minPrice + MIN_GAP);

    setMaxInputValue(numValue.toString());
    if (onMaxInputChange) {
      onMaxInputChange(numValue);
    }
  };

  const handleMinInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleMinInputBlur();
      e.currentTarget.blur();
    }
  };

  const handleMaxInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleMaxInputBlur();
      e.currentTarget.blur();
    }
  };

  return (
    <div className="w-full max-w-full overflow-hidden">
      {/* Inputs row - keep compact to avoid overflow in narrow sidebars */}
      <div className="flex justify-between items-center mb-3 gap-2">
        <input
          className="eng-price-input w-20 sm:w-28 border border-gray-300 rounded-md text-center text-gray-700 text-xs px-1 py-2 focus:border-blue-500 focus:outline-none"
          type="text"
          value={minInputValue}
          onChange={handleMinInputChange}
          onBlur={handleMinInputBlur}
          onKeyDown={handleMinInputKeyDown}
          placeholder="Min"
          maxLength={6}
        />
        <input
          className="eng-price-input w-20 sm:w-28 border border-gray-300 rounded-md text-center text-gray-700 text-xs px-1 py-2 focus:border-teal-500 focus:outline-none"
          type="text"
          value={maxInputValue}
          onChange={handleMaxInputChange}
          onBlur={handleMaxInputBlur}
          onKeyDown={handleMaxInputKeyDown}
          placeholder="Max"
          maxLength={6}
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

        {/* Min Thumb - Background slider */}
        <input
          type="range"
          min={0}
          max={SLIDER_MAX}
          value={minPrice}
          onChange={onMinChange}
          onMouseUp={onMinRelease}
          onTouchEnd={onMinRelease}
          className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none z-10
                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5
                   [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:border-2 
                   [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-grab
                   [&::-webkit-slider-thumb]:pointer-events-auto
                   [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full 
                   [&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-grab"
        />

        {/* Max Thumb - Foreground slider */}
        <input
          type="range"
          min={0}
          max={SLIDER_MAX}
          value={maxPrice}
          onChange={onMaxChange}
          onMouseUp={onMaxRelease}
          onTouchEnd={onMaxRelease}
          className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none z-20
                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5
                   [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-teal-500 [&::-webkit-slider-thumb]:border-2 
                   [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab
                   [&::-webkit-slider-thumb]:pointer-events-auto
                   [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full 
                   [&::-moz-range-thumb]:bg-teal-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-grab"
        />
      </div>
    </div>
  );
};
