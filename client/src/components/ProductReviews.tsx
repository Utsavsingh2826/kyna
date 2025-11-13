import React, { useState, useEffect } from "react";
import {
  Star,
  MessageCircle,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

interface Review {
  id: number | string;
  author: string;
  location: string;
  date: string;
  rating: number;
  title: string;
  content: string;
  avatar?: string;
  images?: string[];
}

interface ProductReviewsProps {
  productId: string | undefined | null;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewContent, setReviewContent] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const auth = useSelector((state: RootState) => state.auth);

  // Lightbox selected image state:
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    reviewIdx: number;
    imgIdx: number;
  } | null>(null);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }
      />
    ));
  };

  const renderRatingStars = (rating: number, interactive: boolean = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={20}
        className={`cursor-pointer transition-colors ${
          i < rating
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300 hover:text-yellow-400"
        }`}
        onClick={interactive ? () => setReviewRating(i + 1) : undefined}
      />
    ));
  };

  // Fetch reviews for the given productId
  const fetchReviews = async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/reviews/product/${encodeURIComponent(productId)}`
      );
      const json = await res.json();
      if (json && json.success && Array.isArray(json.data)) {
        const mapped: Review[] = json.data.map((r: any, idx: number) => ({
          id: r._id || idx,
          author: r.user?.firstName
            ? `${r.user.firstName} ${r.user.lastName || ""}`.trim()
            : r.user?.name || "Customer",
          location: r.user?.city || r.location || "",
          date: new Date(r.createdAt || Date.now()).toLocaleDateString(),
          rating: r.rating || 0,
          title: r.title || "",
          content: r.comment || "",
          avatar: r.user?.profileImage || "/placeholder.svg",
          images: r.images || [],
        }));
        setReviews(mapped);
      } else if (json && Array.isArray(json)) {
        setReviews(json as Review[]);
      }
    } catch (err) {
      console.error("Failed to fetch reviews", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected) return;

    // Get current files count and remaining slots
    const remainingSlots = 4 - files.length;
    const newFiles = Array.from(selected).slice(0, remainingSlots);

    // Add new files to existing files (up to 4 total)
    setFiles((prev) => [...prev, ...newFiles].slice(0, 4));
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReview = async () => {
    if (!productId) {
      alert("Product not specified");
      return;
    }
    if (!auth?.isAuthenticated || !auth.token) {
      alert("Please log in to submit a review");
      return;
    }
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("productId", productId);
      form.append("title", reviewTitle);
      form.append("comment", reviewContent);
      form.append("rating", String(reviewRating));
      if (auth.user?.city) form.append("location", auth.user.city);
      files.forEach((file) => form.append("images", file));

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        body: form,
      });

      const json = await res.json();

      if (json.success) {
        await fetchReviews();
        setShowReviewForm(false);
        setReviewRating(0);
        setReviewTitle("");
        setReviewContent("");
        setFiles([]);
      } else {
        console.error("Failed to submit review", json);
        alert(json.message || "Failed to submit review");
      }
    } catch (err) {
      console.error("Error submitting review", err);
      alert("Error submitting review");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Lightbox helper functions ---
  const openImage = (reviewIdx: number, imgIdx: number, src: string) => {
    setSelectedImage({ reviewIdx, imgIdx, src });
    // optionally prevent body scroll
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setSelectedImage(null);
    document.body.style.overflow = "";
  };

  const prevImage = () => {
    if (!selectedImage) return;
    const { reviewIdx, imgIdx } = selectedImage;
    const imgs = reviews[reviewIdx]?.images || [];
    if (!imgs || imgs.length === 0) return;
    const newIdx = (imgIdx - 1 + imgs.length) % imgs.length;
    setSelectedImage({ reviewIdx, imgIdx: newIdx, src: imgs[newIdx] });
  };

  const nextImage = () => {
    if (!selectedImage) return;
    const { reviewIdx, imgIdx } = selectedImage;
    const imgs = reviews[reviewIdx]?.images || [];
    if (!imgs || imgs.length === 0) return;
    const newIdx = (imgIdx + 1) % imgs.length;
    setSelectedImage({ reviewIdx, imgIdx: newIdx, src: imgs[newIdx] });
  };

  // keyboard handlers: Escape to close, ArrowLeft/Right to navigate
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!selectedImage) return;
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImage, reviews]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Reviews</h2>
        {auth?.isAuthenticated ? (
          <Button
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 text-sm"
            onClick={() => setShowReviewForm(!showReviewForm)}
          >
            Write a Review
          </Button>
        ) : (
          <Button
            className="bg-gray-400 text-white px-4 py-2 text-sm cursor-not-allowed"
            disabled
          >
            Login to Write Review
          </Button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && auth?.isAuthenticated && (
        <div className="border rounded-lg p-6 bg-gray-50 space-y-4">
          <div className="flex items-start gap-4">
            <Avatar className="w-12 h-12 bg-purple-600">
              {auth?.user?.profileImage ? (
                <AvatarImage
                  src={auth.user.profileImage}
                  alt={auth.user.firstName || "User"}
                />
              ) : null}
              <AvatarFallback className="bg-purple-600 text-white font-semibold">
                {auth?.user?.firstName
                  ? auth.user.firstName.charAt(0).toUpperCase()
                  : auth?.user?.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                {auth?.isAuthenticated && auth?.user ? (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-700">
                      Logged in as{" "}
                      {auth.user.firstName ||
                        auth.user.displayName ||
                        auth.user.email}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-teal-600 cursor-pointer hover:underline">
                      Log in
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Rate Us</span>
                  <div className="flex gap-1">
                    {renderRatingStars(reviewRating, true)}
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-500">
                {new Date().toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>

              <div className="space-y-3">
                <Input
                  placeholder="Summarize your review in a few words"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="bg-white"
                />
                <Textarea
                  placeholder="Write a brief review here..."
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  className="bg-white min-h-[100px] resize-none"
                />
                <div className="space-y-3">
                  {/* File Upload Input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="text-sm"
                      disabled={files.length >= 4}
                    />
                    <span className="text-xs text-gray-500">
                      {files.length}/4 images selected
                    </span>
                  </div>

                  {/* Display Selected Images */}
                  {files.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {files.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded border border-gray-300"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={handleSubmitReview}
                className="bg-gray-400 hover:bg-gray-500 text-white px-8 py-2"
                disabled={
                  submitting ||
                  !reviewRating ||
                  !reviewTitle.trim() ||
                  !reviewContent.trim()
                }
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Sort Dropdown */}
      <div className="flex bg-white items-center gap-2">
        <Select defaultValue="newest">
          <SelectTrigger className="w-48 bg-white text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="newest">Sort by newest review</SelectItem>
            <SelectItem value="oldest">Sort by oldest review</SelectItem>
            <SelectItem value="highest">Sort by highest rating</SelectItem>
            <SelectItem value="lowest">Sort by lowest rating</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map((review, reviewIdx) => (
          <div
            key={review.id}
            className="border-b border-gray-100 last:border-b-0"
          >
            <div className="flex gap-4">
              {/* Avatar */}
              <Avatar className="w-10 h-10">
                <AvatarImage src={review.avatar} alt={review.author} />
                <AvatarFallback className="bg-gray-100">
                  {review.author.charAt(0)}
                </AvatarFallback>
              </Avatar>

              {/* Review Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {review.author}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {review.location}
                      </span>
                    </div>
                    <span className="text-gray-500 text-sm">{review.date}</span>
                  </div>
                  {/* <div className="flex items-center gap-2">
                    {/* <span className="text-gray-500 text-sm">{review.date}</span> */}
                  {/* <div className="flex items-center gap-1">
                      <MessageCircle size={14} className="text-gray-400" />
                      <span className="text-gray-500 text-sm">12</span>
                    </div> 
                  </div> */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {renderStars(review.rating)}
                      <span className="text-gray-500 text-sm ml-1">
                        {review.rating}
                      </span>
                    </div>
                  </div>
                </div>

                <h4 className="font-medium text-sm">{review.title}</h4>

                <p className="text-gray-600 text-sm leading-relaxed">
                  {review.content}
                </p>

                {/* Thumbnails */}
                {review.images && review.images.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {review.images.map((imgSrc, idx) => (
                      <img
                        key={idx}
                        src={imgSrc}
                        alt={`Review image ${idx + 1}`}
                        className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-90"
                        onClick={() => openImage(reviewIdx, idx, imgSrc)}
                        role="button"
                        aria-label={`Open image ${idx + 1} of review by ${
                          review.author
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* <button className="text-teal-600 text-sm font-medium hover:text-teal-700">
                  Reply
                </button> */}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={closeModal} // click outside to close
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()} // prevent overlay click from closing when interacting with inner content
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 p-2 rounded bg-black/40 hover:bg-black/60"
              aria-label="Close image"
            >
              <X size={18} className="text-white" />
            </button>

            {/* Prev */}
            <button
              onClick={prevImage}
              className="absolute left-3 p-2 rounded bg-black/40 hover:bg-black/60"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} className="text-white" />
            </button>

            {/* Next */}
            <button
              onClick={nextImage}
              className="absolute right-3 p-2 rounded bg-black/40 hover:bg-black/60"
              aria-label="Next image"
            >
              <ChevronRight size={20} className="text-white" />
            </button>

            {/* Image */}
            <img
              src={selectedImage.src}
              alt="Selected review"
              className="max-w-full max-h-[80vh] rounded shadow-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
