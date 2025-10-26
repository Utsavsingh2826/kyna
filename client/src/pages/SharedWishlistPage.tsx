import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, ArrowLeft, User } from 'lucide-react';
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

interface SharedWishlistData {
  owner: {
    firstName: string;
    lastName: string;
    displayName: string;
  };
  wishlist: WishlistItem[];
  count: number;
  shareId: string;
  expiresAt: string;
}

const SharedWishlistPage = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const [sharedData, setSharedData] = useState<SharedWishlistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (shareId) {
      fetchSharedWishlist();
    }
  }, [shareId]);

  const fetchSharedWishlist = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSharedWishlist(shareId!);
      if (response.success) {
        setSharedData(response.data as SharedWishlistData);
      } else {
        setError(response.error || 'Failed to fetch shared wishlist');
      }
    } catch (error) {
      console.error('Error fetching shared wishlist:', error);
      setError('Failed to fetch shared wishlist');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredWishlist = () => {
    if (!sharedData) return [];
    if (activeTab === 'all') return sharedData.wishlist;
    return sharedData.wishlist.filter(item => 
      item.category.toLowerCase().includes(activeTab.toLowerCase()) ||
      item.subCategory.toLowerCase().includes(activeTab.toLowerCase())
    );
  };

  const getCategoryCounts = () => {
    if (!sharedData) return { all: 0 };
    
    const counts: { [key: string]: number } = { all: sharedData.wishlist.length };
    
    sharedData.wishlist.forEach(item => {
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
          <p className="mt-4 text-gray-600">Loading shared wishlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Wishlist Not Found</h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <Button onClick={() => navigate('/')} className="bg-teal-600 hover:bg-teal-700">
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  if (!sharedData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">No data available</p>
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
            <div className="flex items-center mb-2">
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                className="mr-4 p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center">
                <User className="w-6 h-6 text-gray-500 mr-2" />
                <h1 className="text-4xl font-bold text-gray-900">
                  {sharedData.owner.displayName}'s Wish List
                </h1>
              </div>
            </div>
            <p className="text-gray-600 ml-12">
              {sharedData.count} item{sharedData.count !== 1 ? 's' : ''} in this wishlist
            </p>
            <p className="text-sm text-gray-500 ml-12">
              Shared with you • Expires {new Date(sharedData.expiresAt).toLocaleDateString()}
            </p>
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
              {activeTab === 'all' ? 'This wishlist is empty' : `No ${activeTab} items in this wishlist`}
            </h3>
            <p className="text-gray-500 mb-6">
              {activeTab === 'all' 
                ? 'The owner hasn\'t added any items to their wishlist yet'
                : `Try browsing other categories or check back later`
              }
            </p>
            <Button onClick={() => navigate('/')} className="bg-teal-600 hover:bg-teal-700">
              Browse Our Collection
            </Button>
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
                  <div className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md">
                    <Heart className="w-5 h-5 text-red-500 fill-current" />
                  </div>
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
                    <Button 
                      onClick={() => navigate(`/product/${item._id}`)}
                      className="w-full bg-teal-600 hover:bg-teal-700"
                    >
                      View Details
                    </Button>
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

export default SharedWishlistPage;
