import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, Share2, Mail, MessageCircle } from 'lucide-react';
import type { RootState } from '@/store';
import apiService from '@/services/api';

interface WishlistItem {
  _id: string;
  title: string;
  price: number;
  images: {
    main: string;
    sub: string[];
  };
  category: string;
  subCategory: string;
  rating?: {
    score: number;
    reviews: number;
  };
}

const WishlistPage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await apiService.getWishlist();
      if (response.success) {
        setWishlist(response.data.wishlist || []);
      } else {
        setError(response.error || 'Failed to fetch wishlist');
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setError('Failed to fetch wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId: string, productTitle: string) => {
    try {
      const response = await apiService.removeFromWishlist(productId);
      if (response.success) {
        setWishlist(prev => prev.filter(item => item._id !== productId));
        alert(`${productTitle} removed from wishlist`);
      } else {
        alert(response.error || 'Failed to remove from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('Failed to remove from wishlist');
    }
  };

  const handleShareWishlist = async (method: 'whatsapp' | 'email') => {
    try {
      const response = await apiService.generateWishlistShareLink();
      if (response.success) {
        const userName = user?.firstName || 'User';
        const shareUrl = response.data.shareUrl;
        
        if (method === 'whatsapp') {
          const message = `Check out ${userName}'s wishlist: ${shareUrl}`;
          window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
        } else if (method === 'email') {
          const subject = `${userName}'s Wishlist`;
          const body = `Check out my wishlist: ${shareUrl}`;
          window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
        }
      } else {
        alert('Failed to generate share link');
      }
    } catch (error) {
      console.error('Error generating share link:', error);
      alert('Failed to generate share link');
    }
  };

  const getFilteredWishlist = () => {
    if (activeTab === 'all') return wishlist;
    return wishlist.filter(item => 
      item.category.toLowerCase().includes(activeTab.toLowerCase()) ||
      item.subCategory.toLowerCase().includes(activeTab.toLowerCase())
    );
  };

  const getCategoryCounts = () => {
    const counts: { [key: string]: number } = { all: wishlist.length };
    
    wishlist.forEach(item => {
      const category = item.category;
      counts[category] = (counts[category] || 0) + 1;
    });
    
    return counts;
  };

  const categoryCounts = getCategoryCounts();
  const filteredWishlist = getFilteredWishlist();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchWishlist} className="bg-teal-600 hover:bg-teal-700">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {user?.firstName || 'User'}'s Wish List
            </h1>
            <p className="text-gray-600">
              {wishlist.length} item{wishlist.length !== 1 ? 's' : ''} in your wishlist
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={() => handleShareWishlist('whatsapp')}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Share Wish List
            </Button>
            <Button
              onClick={() => handleShareWishlist('email')}
              className="bg-gray-600 hover:bg-gray-700 text-white flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Share Wish List
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {Object.entries(categoryCounts).map(([category, count]) => (
              <button
                key={category}
                onClick={() => setActiveTab(category)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === category
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {category === 'all' ? 'View All' : category} ({count})
              </button>
            ))}
          </nav>
        </div>

        {/* Wishlist Items */}
        {filteredWishlist.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === 'all' ? 'Your wishlist is empty' : `No ${activeTab} items in your wishlist`}
            </h3>
            <p className="text-gray-500 mb-6">
              {activeTab === 'all' 
                ? 'Start adding items you love to your wishlist'
                : `Try browsing other categories or add some ${activeTab.toLowerCase()} items`
              }
            </p>
            <Link to="/">
              <Button className="bg-teal-600 hover:bg-teal-700">
                Continue Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredWishlist.map((item) => (
              <div key={item._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
                <div className="relative">
                  <img
                    src={item.images.main}
                    alt={item.title}
                    className="w-full h-64 object-cover rounded-t-lg"
                  />
                  <button
                    onClick={() => handleRemoveFromWishlist(item._id, item.title)}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                  >
                    <Heart className="w-5 h-5 text-red-500 fill-current" />
                  </button>
                </div>
                
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
                    {item.title}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-gray-900">
                        ₹{item.price.toLocaleString()}
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
                      <Link to={`/product/${item._id}`} className="flex-1">
                        <Button className="w-full bg-teal-600 hover:bg-teal-700">
                          Show Details
                        </Button>
                      </Link>
                    </div>
                    
                    <button
                      onClick={() => handleRemoveFromWishlist(item._id, item.title)}
                      className="w-full text-sm text-gray-500 hover:text-red-600 transition-colors"
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
