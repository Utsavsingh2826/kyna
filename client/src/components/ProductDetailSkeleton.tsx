export default function ProductDetailSkeleton() {
  return (
    <div className="flex justify-center" style={{ fontFamily: "Poppins" }}>
      <main className="min-h-screen max-w-6xl w-full bg-background px-4 py-8 animate-pulse">
        {/* Breadcrumb skeleton */}
        <div className="h-4 w-40 bg-gray-200 rounded-full mb-6" />

        <div className="flex flex-col md:flex-row gap-10">
          {/* ================= LEFT SIDE (Image section) ================= */}
          <div className="flex gap-4 flex-col md:flex-row">
            {/* Thumbnail skeletons */}
            <div className="hidden md:flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="w-16 h-16 bg-gray-200 rounded-xl shadow-sm"
                />
              ))}
            </div>

            {/* Main Image Skeleton */}
            <div className="bg-gray-200 rounded-3xl w-[360px] h-[420px] md:w-[420px] md:h-[480px] shadow-sm" />
          </div>

          {/* ================= RIGHT SIDE ================= */}
          <div className="flex-1 space-y-6">
            {/* Title */}
            <div className="h-6 w-3/4 bg-gray-200 rounded-full" />

            {/* Rating & variant count */}
            <div className="h-4 w-32 bg-gray-200 rounded-full" />

            {/* Description lines */}
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-200 rounded-full" />
              <div className="h-4 w-5/6 bg-gray-200 rounded-full" />
            </div>

            {/* Price */}
            <div className="h-7 w-48 bg-gray-300 rounded-full mt-3" />

            {/* Section headers */}
            <div className="h-5 w-32 bg-gray-200 rounded-full mt-4" />

            {/* Options skeleton */}
            <div className="grid grid-cols-2 gap-4">
              <div className="h-12 bg-gray-200 rounded-xl" />
              <div className="h-12 bg-gray-200 rounded-xl" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="h-12 bg-gray-200 rounded-xl" />
              <div className="h-12 bg-gray-200 rounded-xl" />
            </div>

            {/* Metal color circles */}
            <div className="flex gap-3 mt-4">
              <div className="h-10 w-10 bg-gray-200 rounded-full" />
              <div className="h-10 w-10 bg-gray-200 rounded-full" />
              <div className="h-10 w-10 bg-gray-200 rounded-full" />
            </div>

            {/* CTA buttons */}
            <div className="flex gap-4 mt-8">
              <div className="h-12 w-40 bg-gray-300 rounded-xl" />
              <div className="h-12 w-40 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
