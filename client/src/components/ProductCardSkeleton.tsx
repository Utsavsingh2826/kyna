const ProductCardSkeleton = () => (
  <div className="eng-card animate-pulse relative">

    {/* Product image skeleton */}
    <div className="eng-card-img bg-gray-200 rounded-md h-48 w-full" />

    {/* Metal color row skeleton */}
    <div className="eng-color-row flex gap-2 mt-2 px-2">
      <div className="h-6 w-6 bg-gray-200 rounded-full" />
      <div className="h-6 w-6 bg-gray-200 rounded-full" />
      <div className="h-6 w-6 bg-gray-200 rounded-full" />
    </div>

    {/* Card body */}
    <div className="eng-card-body mt-3 px-2 space-y-2">
      {/* Title */}
      <div className="bg-gray-200 h-4 w-3/4 rounded" />

      {/* Price */}
      <div className="bg-gray-200 h-3 w-1/2 rounded" />
    </div>
  </div>
);

export default ProductCardSkeleton;
