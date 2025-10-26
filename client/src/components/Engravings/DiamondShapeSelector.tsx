import React from "react";

const shapeImages = {
  Round: "/DIAMOND_SHAPES_WEBP/round.webp",
  Oval: "/DIAMOND_SHAPES_WEBP/oval.webp",
  Cushion: "/DIAMOND_SHAPES_WEBP/cushion.webp",
  Pear: "/DIAMOND_SHAPES_WEBP/pear.webp",
  Princess: "/DIAMOND_SHAPES_WEBP/princess.webp",
  Emerald: "/DIAMOND_SHAPES_WEBP/emerald.webp",
  Marquise: "/DIAMOND_SHAPES_WEBP/marquise.webp",
  Asscher: "/DIAMOND_SHAPES_WEBP/asscher.webp",
  Radiant: "/DIAMOND_SHAPES_WEBP/radiant.webp",
  Heart: "/DIAMOND_SHAPES_WEBP/heart.webp",
};

interface DiamondShapeSelectorProps {
  selectedShapes?: string[];
  showImages?: boolean;
}

export const DiamondShapeSelector: React.FC<DiamondShapeSelectorProps> = ({
  selectedShapes = ["Round"],
  showImages = true,
}) => {
  const shapes = Object.keys(shapeImages) as Array<keyof typeof shapeImages>;

  return (
    <>
      {shapes.map((shape) => (
        <label key={shape} className="eng-suboption">
          <input
            type="checkbox"
            defaultChecked={selectedShapes.includes(shape)}
          />
          {showImages && (
            <img className="h-8" src={shapeImages[shape]} alt={shape} />
          )}
          <span>{shape}</span>
        </label>
      ))}
    </>
  );
};
