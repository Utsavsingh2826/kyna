import React, { useState } from "react";
import { Star, MessageCircle } from "lucide-react";
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

interface Review {
  id: number;
  author: string;
  location: string;
  date: string;
  rating: number;
  title: string;
  content: string;
  avatar?: string;
}

const sampleReviews: Review[] = [
  {
    id: 1,
    author: "Priya R.",
    location: "Mumbai",
    date: "20 Jan 2024",
    rating: 4,
    title: "Beautiful and Elegant!",
    content:
      "I ordered a gold-plated necklace set for my cousin's wedding, and it exceeded my expectations! The design is intricate, and it looks even better in person than in the photos. Everyone at the wedding complimented me on it. Perfect for special occasions. Highly recommend!",
    avatar: "/placeholder.svg",
  },
  {
    id: 2,
    author: "Sneha D.",
    location: "Jaipur",
    date: "2 Feb 2024",
    rating: 4,
    title: "Authentic and Stunning Bridal Set",
    content:
      "I bought the jewelry set for my wedding, and I couldn't be happier. It was the highlight of my bridal look! The jewelry is lightweight yet looks royal, and it matched perfectly with my lehenga. Totally worth the price!",
    avatar: "/placeholder.svg",
  },
];

const ProductReviews = () => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewContent, setReviewContent] = useState("");

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

  const handleSubmitReview = () => {
    // Handle review submission logic here
    console.log("Review submitted:", {
      reviewRating,
      reviewTitle,
      reviewContent,
    });
    setShowReviewForm(false);
    setReviewRating(0);
    setReviewTitle("");
    setReviewContent("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Reviews</h2>
        <Button
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 text-sm"
          onClick={() => setShowReviewForm(!showReviewForm)}
        >
          Write a Review
        </Button>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="border rounded-lg p-6 bg-gray-50 space-y-4">
          <div className="flex items-start gap-4">
            {/* User Avatar */}
            <Avatar className="w-12 h-12 bg-purple-600">
              <AvatarFallback className="bg-purple-600 text-white font-semibold">
                AB
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              {/* Login prompt and social icons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-teal-600 cursor-pointer hover:underline">
                    Log in
                  </span>
                  <span className="text-gray-500">to leave a comment or</span>
                  <div className="flex gap-1 ml-2">
                    <button className="w-6 h-6 bg-blue-600 text-white text-xs rounded flex items-center justify-center">
                      f
                    </button>
                    <button className="w-6 h-6 bg-blue-400 text-white text-xs rounded flex items-center justify-center">
                      t
                    </button>
                    <button className="w-6 h-6 bg-red-500 text-white text-xs rounded flex items-center justify-center">
                      G
                    </button>
                    <button className="w-6 h-6 bg-blue-700 text-white text-xs rounded flex items-center justify-center">
                      in
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Rate Us</span>
                  <div className="flex gap-1">
                    {renderRatingStars(reviewRating, true)}
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-500">20 Jan 2024</div>

              {/* Review Form Fields */}
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
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmitReview}
                className="bg-gray-400 hover:bg-gray-500 text-white px-8 py-2"
                disabled={
                  !reviewRating || !reviewTitle.trim() || !reviewContent.trim()
                }
              >
                Submit Review
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
        {sampleReviews.map((review) => (
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
                {/* Author Info and Rating */}
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
                    <div className="flex items-center gap-1">
                      {renderStars(review.rating)}
                      <span className="text-gray-500 text-sm ml-1">
                        {review.rating}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-sm">{review.date}</span>
                    <div className="flex items-center gap-1">
                      <MessageCircle size={14} className="text-gray-400" />
                      <span className="text-gray-500 text-sm">12</span>
                    </div>
                  </div>
                </div>

                {/* Review Title */}
                <h4 className="font-medium text-sm">{review.title}</h4>

                {/* Review Text */}
                <p className="text-gray-600 text-sm leading-relaxed">
                  {review.content}
                </p>

                {/* Reply Button */}
                <button className="text-teal-600 text-sm font-medium hover:text-teal-700">
                  Reply
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductReviews;
