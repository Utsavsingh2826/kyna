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
  return (
    <div className="w-full max-w-lg">
      {/* Inputs row */}
      <div className="flex justify-between mb-4">
        <input
          className="eng-price-input w-28 border border-gray-300 rounded-md text-center text-gray-500"
          type="text"
          value={`${minPrice.toLocaleString()}/-`}
          readOnly
        />
        <input
          className="eng-price-input w-28 border border-gray-300 rounded-md text-center text-gray-500"
          type="text"
          value={`${maxPrice.toLocaleString()}/-`}
          readOnly
        />
      </div>

      {/* Slider row */}
      <div className="relative w-full">
        {/* Track */}
        <div className="absolute top-1/2 h-2 w-full rounded-full bg-gray-200 transform -translate-y-1/2"></div>

        {/* Active Range Highlight */}
        <div
          className="absolute top-1/2 h-2 bg-teal-500 rounded-full transform -translate-y-1/2"
          style={{
            left: `${(minPrice / 100000) * 100}%`,
            right: `${100 - (maxPrice / 100000) * 100}%`,
          }}
        ></div>

        {/* Min Thumb */}
        <input
          type="range"
          min={0}
          max={100000}
          value={minPrice}
          onChange={onMinChange}
          className="absolute w-full appearance-none bg-transparent 
                   [&::-webkit-slider-thumb]:appearance-none
                   [&::-webkit-slider-thumb]:h-5
                   [&::-webkit-slider-thumb]:w-5
                   [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-teal-600
                   [&::-webkit-slider-thumb]:cursor-pointer
                   pointer-events-auto"
        />

        {/* Max Thumb */}
        <input
          type="range"
          min={0}
          max={100000}
          value={maxPrice}
          onChange={onMaxChange}
          className="absolute w-full appearance-none bg-transparent
                   [&::-webkit-slider-thumb]:appearance-none
                   [&::-webkit-slider-thumb]:h-5
                   [&::-webkit-slider-thumb]:w-5
                   [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-teal-600
                   [&::-webkit-slider-thumb]:cursor-pointer
                   pointer-events-auto"
        />
      </div>
    </div>
  );
};
