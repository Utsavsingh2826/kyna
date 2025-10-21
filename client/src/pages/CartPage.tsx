import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Heart, Plus, Minus, ArrowLeft, ArrowRight, Edit } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';
import { fetchCart, updateCartItem, removeFromCart } from '@/store/slices/cartSlice';
import { updateUser } from '@/store/slices/authSlice';
import apiService from '@/services/api';

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { cart, loading, error } = useSelector((state: RootState) => state.cart);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [selectedBillingAddress, setSelectedBillingAddress] = useState('');
  const [selectedShippingAddress, setSelectedShippingAddress] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Promo and referral code states
  const [promoCode, setPromoCode] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [appliedReferral, setAppliedReferral] = useState<any>(null);
  const [promoError, setPromoError] = useState('');
  const [referralError, setReferralError] = useState('');
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch cart when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
      fetchWishlistItems();
    }
  }, [dispatch, isAuthenticated]);

  const fetchWishlistItems = async () => {
    try {
      const response = await apiService.getWishlist();
      if (response.success) {
        const wishlistProductIds = response.data.wishlist.map((item: any) => item._id);
        setWishlistItems(wishlistProductIds);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  // Handle Add Address click - redirect to profile page
  const handleAddAddress = () => {
    navigate('/profile');
  };

  // Set default addresses when user data is available
  useEffect(() => {
    if (user?.addresses && user.addresses.length > 0) {
      const defaultAddress = user.addresses.find(addr => addr.isDefault) || user.addresses[0];
      setSelectedBillingAddress(defaultAddress._id || '');
      setSelectedShippingAddress(defaultAddress._id || '');
    }
  }, [user]);

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      dispatch(removeFromCart(productId));
    } else {
      dispatch(updateCartItem(productId, newQuantity));
    }
  };

  const handleRemoveItem = async (productId: string) => {
    dispatch(removeFromCart(productId));
  };

  const handleMoveToWishlist = async (product: any) => {
    try {
      const response = await apiService.addToWishlist(product._id);
      if (response.success) {
        alert(`${product.title} added to wishlist!`);
        // Refresh wishlist items to update heart color
        fetchWishlistItems();
      } else {
        alert(response.error || 'Failed to add to wishlist');
      }
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      alert('Failed to add to wishlist');
    }
  };

  const handleEditProduct = (product: any) => {
    // Navigate to product edit page or open edit modal
    console.log('Edit product:', product.title);
    // TODO: Implement edit functionality
  };

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) return;
    
    try {
      setPromoError('');
      const response = await apiService.applyPromoCode(promoCode, cart?.totalAmount || 0);
      
      if (response.success) {
        setAppliedPromo(response.data);
        setPromoCode('');
        
        // Refresh user data to get updated wallet amount
        const userResponse = await apiService.getProfile();
        if (userResponse.success) {
          dispatch(updateUser(userResponse.data));
        }
      } else {
        setPromoError(response.error || 'Invalid promo code');
      }
    } catch (error) {
      setPromoError('Failed to apply promo code');
    }
  };

  const handleApplyReferralCode = async () => {
    if (!referralCode.trim()) return;
    
    try {
      setReferralError('');
      const response = await apiService.applyReferralCode(referralCode, cart?.totalAmount || 0);
      
      if (response.success) {
        setAppliedReferral(response.data);
        setReferralCode('');
        
        // Refresh user data to get updated wallet amount
        const userResponse = await apiService.getProfile();
        if (userResponse.success) {
          dispatch(updateUser(userResponse.data));
        }
      } else {
        setReferralError(response.error || 'Invalid referral code');
      }
    } catch (error) {
      setReferralError('Failed to apply referral code');
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setPromoError('');
  };

  const removeReferralCode = () => {
    setAppliedReferral(null);
    setReferralError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Loading Cart...</h2>
          <p className="text-gray-600">Please wait while we fetch your items.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some items to your cart to get started</p>
          <Link to="/">
            <Button className="bg-[#3AAFA9] hover:bg-[#2a8a85] text-white">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Use dynamic addresses from user data
  const addresses = user?.addresses || [];
  
  // Check if user has address information from top-level fields
  const hasUserAddress = user?.country && user?.state && user?.city && user?.zipCode;
  
  // Create address object from user's top-level fields
  const userAddressFromFields = hasUserAddress ? {
    _id: 'user-fields',
    id: 'user-fields',
    label: 'Default Address',
    street: '', // We don't have street from top-level fields
    city: user.city || '',
    state: user.state || '',
    postalCode: user.zipCode || '',
    country: user.country || ''
  } : null;

  const subtotal = cart.totalAmount;
  const promoDiscount = appliedPromo?.discountAmount || 0;
  const referralDiscount = appliedReferral?.discountAmount || 0;
  const totalDiscount = promoDiscount + referralDiscount;
  const tax = Math.round((subtotal - totalDiscount) * 0.18); // 18% GST
  const total = subtotal - totalDiscount + tax;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Assistance Header */}
        <div className="text-right text-sm text-gray-600 mb-6">
          Need Assistance? Chat now or call 8235567890
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shopping Cart Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h1 className="text-2xl font-semibold text-gray-900 mb-4">Shopping Cart</h1>
              <p className="text-gray-600 mb-6">Total Items: {cart.items?.length || 0}</p>

              <div className="space-y-6">
                {cart.items?.map((item) => (
                  <div key={item._id} className="border-b border-gray-100 pb-6 last:border-b-0">
                    <div className="flex items-start space-x-4">
                      <div className="text-xs text-gray-500 mb-2 w-full">
                        Product Added {new Date(item.product.createdAt || Date.now()).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <img 
                        src={item.product.images?.main || '/product_detail/ring.jpg'} 
                        alt={item.product.title}
                        className="w-20 h-20 object-cover rounded"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{item.product.title}</h3>
                          <button 
                            onClick={() => handleEditProduct(item.product)}
                            className="bg-[#2a8a85] hover:bg-[#1f6b66] text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center space-x-1"
                          >
                            <Edit className="w-4 h-4" />
                            <span className="text-sm font-medium">Edit Details</span>
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{item.product.sku}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="px-2 py-1 bg-gray-100 text-xs text-gray-700 rounded">
                            Quantity: {item.quantity}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-xs text-gray-700 rounded">
                            Price: ₹{item.price.toLocaleString('en-IN')}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <button 
                              onClick={() => handleMoveToWishlist(item.product)}
                              className={`flex items-center space-x-1 transition-colors ${
                                wishlistItems.includes(item.product._id) 
                                  ? 'text-red-500 hover:text-red-600' 
                                  : 'text-gray-500 hover:text-red-500'
                              }`}
                            >
                              <Heart 
                                className={`w-4 h-4 ${
                                  wishlistItems.includes(item.product._id) 
                                    ? 'fill-current' 
                                    : ''
                                }`} 
                              />
                              <span className="text-sm">
                                {wishlistItems.includes(item.product._id) 
                                  ? 'In Wish List' 
                                  : 'Move To Wish List'
                                }
                              </span>
                            </button>
                            <button 
                              onClick={() => handleEditProduct(item.product)}
                              className="text-gray-500 hover:text-blue-500 flex items-center space-x-1 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                              <span className="text-sm">Edit</span>
                            </button>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">
                              ₹{(item.price * item.quantity).toLocaleString('en-IN')}.00
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Qty:</span>
                            <button 
                              onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center border-2 border-[#2a8a85] text-[#2a8a85] hover:bg-[#2a8a85] hover:text-white rounded-md transition-colors duration-200"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <button 
                              onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center border-2 border-[#2a8a85] text-[#2a8a85] hover:bg-[#2a8a85] hover:text-white rounded-md transition-colors duration-200"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex space-x-2">
                            <button 
                              className="border-2 border-[#2a8a85] text-[#2a8a85] hover:bg-[#2a8a85] hover:text-white bg-white px-4 py-2 rounded-md transition-colors duration-200 font-medium"
                              onClick={() => handleRemoveItem(item.product._id)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <Link 
                  to="/" 
                  className="inline-flex items-center text-[#3AAFA9] hover:text-[#2a8a85] font-medium"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  ← RETURN TO SHOP
                </Link>
                <div className="border-t border-dashed border-gray-300 mt-2"></div>
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Promo Code Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Promo Code</h3>
              {appliedPromo ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-green-800">{appliedPromo.code}</p>
                      <p className="text-xs text-green-600">{appliedPromo.description}</p>
                    </div>
                    <button 
                      onClick={removePromoCode}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <p className="text-sm text-green-600">
                    Discount: ₹{appliedPromo.discountAmount}
                  </p>
                </div>
              ) : (
              <div className="space-y-3">
                <Input 
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  className="w-full"
                />
                  {promoError && (
                    <p className="text-sm text-red-600">{promoError}</p>
                  )}
                <Button 
                    onClick={handleApplyPromoCode}
                    disabled={!promoCode.trim()}
                  className="w-full bg-[#3AAFA9] hover:bg-[#2a8a85] text-white"
                >
                    Apply Promo Code
                </Button>
              </div>
              )}
            </div>

            {/* Referral Code Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Referral Code</h3>
              {appliedReferral ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-blue-800">{appliedReferral.code}</p>
                      <p className="text-xs text-blue-600">Referral from {appliedReferral.referrerName}</p>
                    </div>
                    <button 
                      onClick={removeReferralCode}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <p className="text-sm text-blue-600">
                    Bonus: ₹{appliedReferral.discountAmount}
                  </p>
                </div>
              ) : (
              <div className="space-y-3">
                <Input 
                    placeholder="Enter referral code"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                  className="w-full"
                />
                  {referralError && (
                    <p className="text-sm text-red-600">{referralError}</p>
                  )}
                <Button 
                    onClick={handleApplyReferralCode}
                    disabled={!referralCode.trim()}
                    className="w-full bg-[#3AAFA9] hover:bg-[#2a8a85] text-white"
                >
                    Apply Referral Code
                </Button>
                </div>
              )}
            </div>


            {/* Cart Price Details Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cart Price Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sub-total</span>
                  <span className="font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                {totalDiscount > 0 && (
                  <>
                    {appliedPromo && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Promo Discount ({appliedPromo.code})</span>
                        <span className="font-medium text-green-600">-₹{appliedPromo.discountAmount}</span>
                      </div>
                    )}
                    {appliedReferral && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Referral Bonus ({appliedReferral.code})</span>
                        <span className="font-medium text-green-600">-₹{appliedReferral.discountAmount}</span>
                      </div>
                    )}
                <div className="flex justify-between">
                      <span className="text-gray-600">Total Discount</span>
                      <span className="font-medium text-green-600">-₹{totalDiscount}</span>
                </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">₹{tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900">
                      ₹{total.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(Boolean(checked))}
                  />
                  <label 
                    htmlFor="terms"
                    className="text-sm text-gray-600 cursor-pointer"
                  >
                    By Clicking this, I agree to Kyna{' '}
                    <Link to="/terms-conditions" className="text-[#3AAFA9] hover:underline">
                      Terms & Conditions
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy-policy" className="text-[#3AAFA9] hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <Button 
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 text-lg"
                  disabled={!termsAccepted}
                  onClick={() => navigate('/checkout')}
                >
                  Proceed To Checkout
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>

            {/* Shipping & Returns Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="space-y-3 text-sm text-gray-600">
                <p>Estimated Ship Date: Monday, October 21st</p>
                <p>Free Shipping | Free Returns</p>
                
                <div className="flex items-center space-x-4 mt-4">
                  <div className="w-8 h-8 bg-yellow-400 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-white">G</span>
                  </div>
                  <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-white">D</span>
                  </div>
                  <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-white">SGL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;