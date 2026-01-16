import React, { useState, useEffect } from "react";
import { Star, CheckCircle } from "lucide-react";
import SEO from "@/components/SEO";

interface ProductReview {
  _id: string;
  user: {
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null;
  product?: {
    title?: string;
    sku?: string;
    images?: {
      main?: string;
      sub?: string[];
    };
  } | null;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  likes?: string[];
  replies?: Array<{
    user?: {
      firstName?: string;
      lastName?: string;
    } | null;
    text?: string;
    createdAt?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface GoogleReview {
  author_name: string;
  author_url?: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}

const CustomerReviewsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"site" | "product">("product");
  const [productReviews, setProductReviews] = useState<ProductReview[]>([]);
  const [googleReviews, setGoogleReviews] = useState<GoogleReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch product reviews from database
  const fetchProductReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/reviews/all?limit=100");
      const data = await response.json();

      console.log("Reviews API response:", data);

      if (response.ok && data.success && Array.isArray(data.data)) {
        setProductReviews(data.data);
        if (data.data.length === 0) {
          setError(null); // No error, just no reviews
        }
      } else {
        const errorMsg = data.message || data.error || "Failed to load reviews";
        console.error("Reviews API error:", errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      console.error("Error fetching product reviews:", err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Google Reviews
  const fetchGoogleReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/reviews/site");
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setGoogleReviews(data.data);
      } else {
        // If API fails, show empty state or mock data
        setGoogleReviews([]);
      }
    } catch (err) {
      console.error("Error fetching Google reviews:", err);
      // Don't set error for Google reviews as it's optional
      setGoogleReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "product") {
      fetchProductReviews();
    } else {
      fetchGoogleReviews();
    }
  }, [activeTab]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={
          i < rating
            ? "fill-black text-black"
            : "fill-gray-300 text-gray-300"
        }
      />
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0)?.toUpperCase() || "";
    const last = lastName?.charAt(0)?.toUpperCase() || "";
    return `${first}${last}` || "C";
  };

  return (
    <>
      <SEO
        title="Customer Reviews | Kyna Jewels"
        description="Read authentic customer reviews and testimonials about Kyna Jewels. See what our customers are saying about our jewelry."
      />
      <div className="min-h-screen bg-white">
        {/* Header Section */}
        <div className="border-b bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Customer Reviews
            </h1>
            <p className="mt-2 text-gray-600">
              See what our customers are saying about Kyna Jewels
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab("site")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "site"
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                Site Reviews
              </button>
              <button
                onClick={() => setActiveTab("product")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "product"
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                Product Reviews
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              <p className="mt-4 text-gray-600">Loading reviews...</p>
            </div>
          )}

          {error && activeTab === "product" && (
            <div className="text-center py-12">
              <p className="text-red-600 font-medium">{error}</p>
              <button
                onClick={fetchProductReviews}
                className="mt-4 px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Product Reviews Tab */}
          {activeTab === "product" && !loading && !error && (
            <div className="space-y-8">
              {productReviews.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">No product reviews yet.</p>
                </div>
              ) : (
                productReviews
                  .filter((review) => review && review._id && review.user) // Filter out invalid reviews
                  .map((review) => (
                    <div
                      key={review._id}
                      className="border-b border-gray-200 pb-8 last:border-b-0"
                    >
                      <div className="flex items-start space-x-4">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold">
                            {getInitials(
                              review.user?.firstName || "Customer",
                              review.user?.lastName
                            )}
                          </div>
                        </div>

                        {/* Review Content */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-semibold text-gray-900">
                              {review.user?.firstName || "Customer"}{" "}
                              {review.user?.lastName?.charAt(0) || ""}
                              {review.user?.lastName && "."}
                            </span>
                            <span className="text-sm text-gray-500 flex items-center">
                              <CheckCircle className="w-4 h-4 mr-1 text-teal-600" />
                              Verified Buyer
                            </span>
                          </div>

                          {/* Rating */}
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="flex">{renderStars(review.rating)}</div>
                            <span className="text-sm text-gray-500">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="font-semibold text-lg text-gray-900 mb-2">
                            {review.title}
                          </h3>

                          {/* Comment */}
                          <p className="text-gray-700 mb-4">{review.comment}</p>

                          {/* Product Info */}
                          {review.product && (review.product.title || review.product.sku) && (
                            <div className="mb-4">
                              <p className="text-sm text-gray-600">
                                Product Reviewed:{" "}
                                <span className="font-medium">
                                  {review.product.title || review.product.sku || "Unknown Product"}
                                </span>
                              </p>
                            </div>
                          )}

                          {/* Images */}
                          {review.images && review.images.length > 0 && (
                            <div className="flex space-x-2 mb-4">
                              {review.images.slice(0, 3).map((img, idx) => (
                                <img
                                  key={idx}
                                  src={img}
                                  alt={`Review image ${idx + 1}`}
                                  className="w-20 h-20 object-cover rounded border border-gray-200 cursor-pointer hover:opacity-80"
                                  onClick={() => {
                                    // Open image in lightbox or full view
                                    window.open(img, "_blank");
                                  }}
                                />
                              ))}
                            </div>
                          )}

                          {/* Store Owner Reply */}
                          {review.replies && review.replies.length > 0 && (
                            <div className="mt-4 pl-4 border-l-2 border-teal-200 bg-teal-50 p-4 rounded">
                              <p className="font-semibold text-sm text-gray-900 mb-1">
                                Store Owner
                              </p>
                              {review.replies
                                .filter((reply) => reply && reply.text)
                                .map((reply, idx) => (
                                  <p
                                    key={idx}
                                    className="text-sm text-gray-700"
                                  >
                                    {reply.text}
                                  </p>
                                ))}
                            </div>
                          )}

                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}

          {/* Site Reviews Tab (Google Reviews) */}
          {activeTab === "site" && !loading && (
            <div className="space-y-8">
              {googleReviews.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">
                    No Google reviews available at the moment.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Please check back later or visit our{" "}
                    <a
                      href="https://www.google.com/maps"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 hover:underline"
                    >
                      Google Business Profile
                    </a>
                  </p>
                </div>
              ) : (
                googleReviews.map((review, idx) => (
                  <div
                    key={idx}
                    className="border-b border-gray-200 pb-8 last:border-b-0"
                  >
                    <div className="flex items-start space-x-4">
                      {/* Profile Photo */}
                      <div className="flex-shrink-0">
                        {review.profile_photo_url ? (
                          <img
                            src={review.profile_photo_url}
                            alt={review.author_name}
                            className="w-12 h-12 rounded-full"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                            {review.author_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Review Content */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold text-gray-900">
                            {review.author_name}
                          </span>
                          <span className="text-sm text-gray-500">
                            {review.relative_time_description}
                          </span>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex">{renderStars(review.rating)}</div>
                        </div>

                        {/* Review Text */}
                        <p className="text-gray-700">{review.text}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CustomerReviewsPage;
