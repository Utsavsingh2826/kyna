const ProductCardSkeleton = () => (
  <div className="eng-card animate-pulse relative">
    <div className="eng-card-img-wrap">
      <div className="bg-gray-200 w-full" style={{ aspectRatio: "4/5" }} />
    </div>
    <div className="eng-card-body space-y-2">
      <div className="bg-gray-200 h-3 w-3/4 rounded" />
      <div className="bg-gray-200 h-3 w-1/2 rounded" />
    </div>
  </div>
);

export default ProductCardSkeleton;
