import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { apiService } from "@/services/api";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, MailIcon } from "lucide-react";
import { toast } from "sonner";
import type { AppDispatch, RootState } from "@/store";
import {
  fetchWishlist,
  removeWishlistItemThunk,
  selectWishlistInitialized,
  selectWishlistItems,
  selectWishlistLoading,
} from "@/store/slices/wishlistSlice";
import type { WishlistEntry } from "@/store/slices/wishlistSlice";
import { ShareEmailModal } from "@/components/ShareEmailModal";

const WishlistPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );
  const wishlist = useSelector(selectWishlistItems);
  const wishlistLoading = useSelector(selectWishlistLoading);
  const wishlistInitialized = useSelector(selectWishlistInitialized);
  const wishlistError = useSelector((state: RootState) => state.wishlist.error);
  const [activeTab, setActiveTab] = useState("all");

  const loading = wishlistLoading && !wishlistInitialized;
  const error = wishlistError;

  const formatCategoryLabel = (label: string) => {
    if (label === "all") return "View All";
    return label
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const buildProductUrl = (item: WishlistEntry) => {
    const slug = item.categorySlug || "rings";
    const sku = item.modelSku || item.productId;
    const params = new URLSearchParams();
    if (item.variantSku) {
      params.set("variantId", item.variantSku);
    }
    if (item.metalColorCode) {
      params.set("metalColor", item.metalColorCode);
    }
    const query = params.toString();
    return `/product/${slug}/${sku}${query ? `?${query}` : ""}`;
  };

  useEffect(() => {
    // Only fetch wishlist if user is authenticated and wishlist hasn't been initialized
    if (isAuthenticated && !wishlistInitialized && !wishlistLoading) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated, wishlistInitialized, wishlistLoading]);

  const handleRemoveFromWishlist = (itemId: string, productTitle: string) => {
    dispatch(removeWishlistItemThunk(itemId));
    toast.success(`${productTitle} removed from wishlist`);
  };

  const getFilteredWishlist = () => {
    if (activeTab === "all") return wishlist;
    const tabValue = activeTab.toLowerCase();
    return wishlist.filter((item) => {
      const categoryLabel = (item.category || "").toLowerCase();
      const slug = (item.categorySlug || "").toLowerCase();
      return categoryLabel.includes(tabValue) || slug.includes(tabValue);
    });
  };

  const getCategoryCounts = () => {
    const counts: { [key: string]: number } = { all: wishlist.length };

    wishlist.forEach((item) => {
      const category = item.category || item.categorySlug || "Other";
      counts[category] = (counts[category] || 0) + 1;
    });

    return counts;
  };

  const categoryCounts = getCategoryCounts();
  const filteredWishlist = getFilteredWishlist();

  /* State for share modal */
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [shareMessage, setShareMessage] = useState("");

  const handleShare = async (platform: 'whatsapp' | 'email') => {
    try {
      // 1. Generate the share link
      const response = await apiService.generateShareLink();

      if (response.success && response.data) {
        const shareData = response.data as { shareUrl: string };
        const generatedUrl = shareData.shareUrl;
        const message = `I've put together a wishlist of my favorite pieces at Kyna Jewels! 💎\n\nTake a look here: ${generatedUrl}\n\nKyna Jewels is the best online jewellery business with stunning premium collections.`;

        if (platform === 'whatsapp') {
          const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
          window.open(url, "_blank");
        } else {
          // Open email modal instead of mailto
          setShareUrl(generatedUrl);
          setShareMessage(`I've put together a wishlist of my favorite pieces at Kyna Jewels! 💎\n\nTake a look and let me know what you think. Kyna Jewels is the best online jewellery business with stunning premium collections!`);
          setShareModalOpen(true);
        }
      } else {
        toast.error("Failed to generate share link");
      }
    } catch (error) {
      console.error("Share error:", error);
      toast.error("Failed to share wishlist");
    }
  };

  const handleWhatsAppShare = () => handleShare('whatsapp');
  const handleEmailShare = () => handleShare('email');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#328F94] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  // Show login message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Please login to view your wishlist
          </h3>
          <p className="text-gray-500 mb-6">
            Sign in to access your saved items
          </p>
          <Link to="/login">
            <Button className="bg-[#328F94] hover:bg-[#1e6e72] text-white text-[10px] tracking-[0.2em] uppercase rounded-none py-3 px-6 transition-colors duration-200">Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button
            onClick={() => dispatch(fetchWishlist())}
            className="bg-[#328F94] hover:bg-[#1e6e72] text-white text-[10px] tracking-[0.2em] uppercase rounded-none py-3 px-6 transition-colors duration-200"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <ShareEmailModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        defaultMessage={shareMessage}
        shareUrl={shareUrl}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-light tracking-[0.12em] uppercase text-gray-800 mb-2">
              {user?.firstName || "User"}'s Wish List
            </h1>
            <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400">
              {wishlist.length} item{wishlist.length !== 1 ? "s" : ""} in your
              wishlist
            </p>
          </div>

          {/* Share Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center gap-2 border border-[#328F94] text-[#328F94] hover:bg-[#328F94] hover:text-white text-[10px] tracking-[0.2em] uppercase rounded-none py-3 px-6 transition-colors duration-200"
            >
              Share Wish List
              <img src="/Jan/Vector.png" alt="WhatsApp" className="w-5 h-5" />
            </button>

            <button
              onClick={handleEmailShare}
              className="flex items-center gap-2 border border-[#328F94] text-[#328F94] hover:bg-[#328F94] hover:text-white text-[10px] tracking-[0.2em] uppercase rounded-none py-3 px-6 transition-colors duration-200"
            >
              {/* <img src="/icons/mail.svg" alt="Email" className="w-5 h-5" /> */}
              Share Wish List
              <MailIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {Object.entries(categoryCounts).map(([category, count]) => (
              <button
                key={category}
                onClick={() => setActiveTab(category)}
                className={`py-2 px-1 border-b-2 text-[10px] tracking-[0.15em] uppercase ${activeTab === category
                  ? "border-[#328F94] text-[#328F94]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                {formatCategoryLabel(category)} ({count})
              </button>
            ))}
          </nav>
        </div>

        {/* Wishlist Items */}
        {filteredWishlist.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === "all"
                ? "Your wishlist is empty"
                : `No ${formatCategoryLabel(activeTab)} items in your wishlist`}
            </h3>
            <p className="text-gray-500 mb-6">
              {activeTab === "all"
                ? "Start adding items you love to your wishlist"
                : `Try browsing other categories or add some ${activeTab.toLowerCase()} items`}
            </p>
            <Link to="/">
              <Button className="bg-[#328F94] hover:bg-[#1e6e72] text-white text-[10px] tracking-[0.2em] uppercase rounded-none py-3 px-6 transition-colors duration-200">
                Continue Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredWishlist.map((item) => (
              <div
                key={item._id}
                className="bg-white border border-gray-100 hover:border-[#328F94]/20 hover:shadow-sm transition-shadow flex flex-col h-full"
              >
                <div className="relative">
                  <img
                    src={item.image || "/placeholder.png"}
                    alt={item.title}
                    className="w-full h-64 object-cover"
                  />
                  <button
                    onClick={() =>
                      handleRemoveFromWishlist(item._id, item.title)
                    }
                    className="absolute top-3 right-3 p-2 bg-white text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <Heart className="w-5 h-5 text-red-500 fill-current" />
                  </button>
                </div>

                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-[11px] tracking-[0.06em] text-gray-700 mb-2 line-clamp-2 min-h-[3rem]">
                    {item.title}
                  </h3>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-light text-gray-800">
                        {typeof item.price === "number"
                          ? `₹${item.price.toLocaleString("en-IN")}`
                          : "Price on request"}
                      </span>
                    </div>
                    {item.rating && (
                      <div className="flex items-center text-sm text-gray-500">
                        <span>★</span>
                        <span className="ml-1">{item.rating.score}</span>
                        <span className="ml-1">({item.rating.reviews})</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto">
                    <div className="flex gap-2 mb-2">
                      <Link to={buildProductUrl(item)} className="flex-1">
                        <Button className="w-full bg-[#328F94] hover:bg-[#1e6e72] text-white text-[10px] tracking-[0.2em] uppercase rounded-none py-3 px-6 transition-colors duration-200">
                          Show Details
                        </Button>
                      </Link>
                    </div>

                    <button
                      onClick={() =>
                        handleRemoveFromWishlist(item._id, item.title)
                      }
                      className="w-full text-sm text-gray-300 hover:text-red-400 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
