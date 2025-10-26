import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCart } from '@/store/slices/cartSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CreditCard, 
  DollarSign, 
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import apiService from '@/services/api';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: any) => state.auth);
  const { cart } = useSelector((state: any) => state.cart);
  const [formData, setFormData] = useState({
    // Billing info fields (for editing)
    billingCompanyName: '',
    billingAddress: '',
    billingCountry: 'India',
    billingRegion: '',
    billingCity: '',
    billingZipCode: '',
    // Shipping address fields (always required)
    shippingCompanyName: '',
    shippingAddress: '',
    shippingCountry: 'India',
    shippingRegion: '',
    shippingCity: '',
    shippingZipCode: '',
    // Payment fields
    cardName: '',
    cardNumber: '',
    expireDate: '',
    cvv: '',
    saveCardDetails: false
  });

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('credit-card');
  const [showCardDetails, setShowCardDetails] = useState(true);
  const [userBillingInfo, setUserBillingInfo] = useState<any>(null);
  const [isSavingBilling, setIsSavingBilling] = useState(false);
  const [isEditingBilling, setIsEditingBilling] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch cart data when component mounts
  useEffect(() => {
    if (user && isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, user, isAuthenticated]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePaymentMethodChange = (method: string) => {
    setSelectedPaymentMethod(method);
    setShowCardDetails(method === 'credit-card');
  };

  // Load user billing info on component mount
  useEffect(() => {
    const loadUserBillingInfo = async () => {
      try {
        const response = await apiService.getUserBillingInfo();
        if (response.success && response.data) {
          setUserBillingInfo(response.data);
          
          // If user has billing info, populate the form for editing
          if (response.data.street) {
            setFormData(prev => ({
              ...prev,
              billingCompanyName: response.data.companyName || '',
              billingAddress: response.data.street || '',
              billingCountry: response.data.country || 'India',
              billingRegion: response.data.state || '',
              billingCity: response.data.city || '',
              billingZipCode: response.data.zipCode || '',
            }));
          }
        }
      } catch (error) {
        console.error('Failed to load user billing info:', error);
      }
    };

    if (isAuthenticated) {
      loadUserBillingInfo();
    }
  }, [isAuthenticated]);

  const paymentMethods = [
    { id: 'cod', name: 'Cash on Delivery', icon: DollarSign },
    { id: 'venmo', name: 'Venmo', icon: () => <span className="text-blue-600 font-bold">V</span> },
    { id: 'paypal', name: 'Paypal', icon: () => <span className="text-blue-600 font-bold">PP</span> },
    { id: 'amazon', name: 'Amazon Pay', icon: () => <span className="text-orange-600 font-bold">a</span> },
    { id: 'credit-card', name: 'Debit/Credit Card', icon: CreditCard }
  ];

  const countries = ['India'];
  
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
    'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Chandigarh',
    'Puducherry', 'Jammu and Kashmir', 'Ladakh'
  ];

  const indianCities = {
    'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Tirupati', 'Kadapa', 'Anantapur', 'Chittoor'],
    'Arunachal Pradesh': ['Itanagar', 'Naharlagun', 'Pasighat', 'Tezpur', 'Dibrugarh', 'Tinsukia', 'Jorhat', 'Sibsagar', 'Guwahati', 'Silchar'],
    'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Tinsukia', 'Tezpur', 'Nagaon', 'Barpeta', 'Goalpara', 'Karimganj'],
    'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Darbhanga', 'Purnia', 'Arrah', 'Begusarai', 'Katihar', 'Chhapra'],
    'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Rajnandgaon', 'Durg', 'Jagdalpur', 'Ambikapur', 'Chirmiri', 'Dhamtari'],
    'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Mormugao', 'Curchorem', 'Sanquelim', 'Bicholim', 'Quepem'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand', 'Nadiad'],
    'Haryana': ['Faridabad', 'Gurgaon', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula'],
    'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Palampur', 'Kullu', 'Manali', 'Chamba', 'Una', 'Baddi'],
    'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Phusro', 'Hazaribagh', 'Giridih', 'Ramgarh', 'Medininagar'],
    'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Gulbarga', 'Davanagere', 'Bellary', 'Bijapur', 'Shimoga'],
    'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam', 'Palakkad', 'Alappuzha', 'Malappuram', 'Kannur', 'Kasaragod'],
    'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa'],
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 'Amravati', 'Kolhapur', 'Sangli'],
    'Manipur': ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Senapati', 'Tamenglong', 'Chandel', 'Ukhrul', 'Kangpokpi', 'Jiribam'],
    'Meghalaya': ['Shillong', 'Tura', 'Jowai', 'Nongstoin', 'Williamnagar', 'Baghmara', 'Mairang', 'Nongpoh', 'Cherrapunji', 'Mawkyrwat'],
    'Mizoram': ['Aizawl', 'Lunglei', 'Saiha', 'Champhai', 'Kolasib', 'Serchhip', 'Lawngtlai', 'Mamit', 'Saitual', 'Hnahthial'],
    'Nagaland': ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha', 'Zunheboto', 'Phek', 'Mon', 'Kiphire', 'Longleng'],
    'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore', 'Bhadrak', 'Baripada', 'Jharsuguda'],
    'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Firozpur', 'Batala', 'Pathankot', 'Moga'],
    'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer', 'Bharatpur', 'Alwar', 'Sikar', 'Pali'],
    'Sikkim': ['Gangtok', 'Namchi', 'Mangan', 'Gyalshing', 'Singtam', 'Rangpo', 'Jorethang', 'Ravangla', 'Pelling', 'Lachung'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Tiruppur', 'Erode', 'Vellore', 'Thoothukudi'],
    'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar', 'Ramagundam', 'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Suryapet'],
    'Tripura': ['Agartala', 'Dharmanagar', 'Udaipur', 'Ambassa', 'Kailasahar', 'Belonia', 'Khowai', 'Teliamura', 'Sabroom', 'Amarpur'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Meerut', 'Allahabad', 'Bareilly', 'Ghaziabad', 'Aligarh', 'Moradabad'],
    'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee', 'Kashipur', 'Rudrapur', 'Haldwani', 'Rishikesh', 'Nainital', 'Mussoorie', 'Almora'],
    'West Bengal': ['Kolkata', 'Asansol', 'Siliguri', 'Durgapur', 'Bardhaman', 'Malda', 'Baharampur', 'Habra', 'Kharagpur', 'Shantipur'],
    'Delhi': ['New Delhi', 'Central Delhi', 'East Delhi', 'North Delhi', 'North East Delhi', 'North West Delhi', 'Shahdara', 'South Delhi', 'South East Delhi', 'South West Delhi', 'West Delhi'],
    'Chandigarh': ['Chandigarh', 'Mohali', 'Panchkula'],
    'Puducherry': ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'],
    'Jammu and Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Sopore', 'Kathua', 'Udhampur', 'Punch', 'Rajauri', 'Doda'],
    'Ladakh': ['Leh', 'Kargil', 'Drass', 'Zanskar', 'Nubra', 'Changthang']
  };

  const getCitiesByState = (state: string) => {
    return indianCities[state as keyof typeof indianCities] || [];
  };

  const handleSaveBillingInfo = async () => {
    setIsSavingBilling(true);
    try {
      const billingData = {
        companyName: formData.billingCompanyName,
        street: formData.billingAddress,
        city: formData.billingCity,
        state: formData.billingRegion,
        country: formData.billingCountry,
        zipCode: formData.billingZipCode,
      };

      const response = await apiService.updateBillingInfo(billingData);
      if (response.success) {
        alert('Billing info saved successfully!');
        setUserBillingInfo(response.data);
        setIsEditingBilling(false);
        // Refresh billing info
        const refreshResponse = await apiService.getUserBillingInfo();
        if (refreshResponse.success) {
          setUserBillingInfo(refreshResponse.data);
        }
      } else {
        alert('Failed to save billing info');
      }
    } catch (error) {
      console.error('Error saving billing info:', error);
      alert('Error saving billing info');
    } finally {
      setIsSavingBilling(false);
    }
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProceedToCheckout = async () => {
    // Check if billing info exists (either saved or provided)
    if (!userBillingInfo?.street && (!formData.billingAddress || !formData.billingCity || !formData.billingRegion || !formData.billingZipCode)) {
      alert('Please save your billing info before proceeding');
      return;
    }

    // Check if shipping address is filled
    if (!formData.shippingAddress || !formData.shippingCity || !formData.shippingRegion || !formData.shippingZipCode) {
      alert('Please fill in all shipping address fields before proceeding');
      return;
    }

    // Check if payment method is selected
    if (!selectedPaymentMethod) {
      alert('Please select a payment method');
      return;
    }

    // Check if cart has items
    if (!cart || !cart.items || cart.items.length === 0) {
      alert('Your cart is empty. Please add items to proceed.');
      return;
    }

    // Check if user is logged in
    if (!isAuthenticated || !user || (!user._id && !user.id)) {
      alert('Please log in to proceed with payment.');
      return;
    }

    setIsCreatingOrder(true);
    
    try {
      // Calculate totals
      const subtotal = cart.totalAmount;
      const gst = subtotal * 0.18; // 18% GST
      const shippingCharge = subtotal > 5000 ? 0 : 200; // Free shipping above ₹5000
      const finalAmount = subtotal + gst + shippingCharge;

      // Validate amount
      if (finalAmount <= 0) {
        alert('Invalid order amount. Please try again.');
        return;
      }

      // Prepare billing info data (use saved or current form data)
      const billingInfoData = userBillingInfo?.street ? userBillingInfo : {
        companyName: formData.billingCompanyName || '',
        street: formData.billingAddress || '',
        city: formData.billingCity || '',
        state: formData.billingRegion || '',
        country: formData.billingCountry || 'India',
        zipCode: formData.billingZipCode || '',
      };

      // Prepare shipping address data (per-order)
      const shippingAddressData = {
        companyName: formData.shippingCompanyName,
        street: formData.shippingAddress,
        city: formData.shippingCity,
        state: formData.shippingRegion,
        country: formData.shippingCountry,
        zipCode: formData.shippingZipCode,
      };

      // Generate unique order ID with timestamp and random string
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const orderId = `ORD_${timestamp}_${randomString}`;

      console.log('Creating order directly without payment integration...');

      // Create order data
      const orderData = {
        paymentMethod: selectedPaymentMethod,
        billingInfo: billingInfoData,
        shippingAddress: shippingAddressData,
        items: cart.items,
        subtotal: subtotal,
        gst: gst,
        shippingCharge: shippingCharge,
        totalAmount: finalAmount,
        orderId: orderId,
        paymentStatus: 'pending' // Set as pending since no payment integration
      };

      // Create order directly
      const orderResponse = await apiService.createOrder(orderData);
      
      if (orderResponse.success) {
        console.log('✅ Order created successfully:', orderResponse.data);
        
        // Navigate to order success page
        navigate('/order-success', { 
          state: { 
            order: orderResponse.data as any,
            orderNumber: (orderResponse.data as any)?.orderNumber,
            paymentId: null, // No payment ID since no payment integration
            message: 'Order created successfully! Payment integration will be added later.'
          } 
        });
      } else {
        console.error('❌ Order creation failed:', orderResponse);
        alert('Failed to create order. Please try again.');
      }

    } catch (error: any) {
      console.error('Error creating order:', error);
      
      // Display specific error message
      let errorMessage = 'Error creating order. Please try again.';
      
      if (error.message) {
        if (error.message.includes('validation failed')) {
          errorMessage = 'Order validation failed. Please check your information and try again.';
        } else if (error.message.includes('User not authenticated')) {
          errorMessage = 'Please log in to create an order.';
        } else if (error.message.includes('Cart is empty')) {
          errorMessage = 'Your cart is empty. Please add items before creating an order.';
        } else {
          errorMessage = error.message;
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Billing Information and Payment Option</h1>

        <div className="space-y-8">
          {/* Billing Information Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Billing Information</h2>
            
            {userBillingInfo?.street ? (
              // Show saved billing info with update button
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Your Billing Information</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    {userBillingInfo.companyName && (
                      <p><span className="font-medium">Company:</span> {userBillingInfo.companyName}</p>
                    )}
                    <p><span className="font-medium">Address:</span> {userBillingInfo.street}</p>
                    <p><span className="font-medium">City:</span> {userBillingInfo.city}</p>
                    <p><span className="font-medium">State:</span> {userBillingInfo.state}</p>
                    <p><span className="font-medium">Country:</span> {userBillingInfo.country}</p>
                    <p><span className="font-medium">ZIP Code:</span> {userBillingInfo.zipCode}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditingBilling(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Update Billing Info
                </button>
              </div>
            ) : (
              // Show billing info form for new users
              <div className="space-y-6">
                <p className="text-sm text-gray-600">Please provide your billing information. This will be saved for future orders.</p>
                
                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name (Optional)
                  </label>
                  <Input
                    name="billingCompanyName"
                    placeholder="Company Name"
                    value={formData.billingCompanyName}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address*
                  </label>
                  <Input
                    name="billingAddress"
                    placeholder="Street Address"
                    value={formData.billingAddress}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>

                {/* Location Dropdowns */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country*
                    </label>
                    <div className="relative">
                      <select
                        value={formData.billingCountry}
                        onChange={(e) => {
                          handleSelectChange('billingCountry', e.target.value);
                          setFormData(prev => ({ ...prev, billingRegion: '', billingCity: '' }));
                        }}
                        className="w-full p-3 border border-gray-300 rounded-md appearance-none bg-white pr-10"
                      >
                        <option value="">Select...</option>
                        {countries.map(country => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State*
                    </label>
                    <div className="relative">
                      <select
                        value={formData.billingRegion}
                        onChange={(e) => {
                          handleSelectChange('billingRegion', e.target.value);
                          setFormData(prev => ({ ...prev, billingCity: '' }));
                        }}
                        className="w-full p-3 border border-gray-300 rounded-md appearance-none bg-white pr-10"
                      >
                        <option value="">Select...</option>
                        {indianStates.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City*
                    </label>
                    <div className="relative">
                      <select
                        value={formData.billingCity}
                        onChange={(e) => handleSelectChange('billingCity', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md appearance-none bg-white pr-10"
                        disabled={!formData.billingRegion}
                      >
                        <option value="">Select...</option>
                        {getCitiesByState(formData.billingRegion).map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code*
                    </label>
                    <Input
                      name="billingZipCode"
                      placeholder="ZIP Code"
                      value={formData.billingZipCode}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveBillingInfo}
                  disabled={isSavingBilling}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {isSavingBilling ? 'Saving...' : 'Save Billing Info'}
                </button>
              </div>
            )}

            {/* Edit Billing Info Form */}
            {isEditingBilling && (
              <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="font-medium text-gray-900 mb-4">Update Billing Information</h3>
                
                <div className="space-y-4">
                  {/* Company Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name (Optional)
                    </label>
                    <Input
                      name="billingCompanyName"
                      placeholder="Company Name"
                      value={formData.billingCompanyName}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address*
                    </label>
                    <Input
                      name="billingAddress"
                      placeholder="Street Address"
                      value={formData.billingAddress}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                  </div>

                  {/* Location Dropdowns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country*
                      </label>
                      <div className="relative">
                        <select
                          value={formData.billingCountry}
                          onChange={(e) => {
                            handleSelectChange('billingCountry', e.target.value);
                            setFormData(prev => ({ ...prev, billingRegion: '', billingCity: '' }));
                          }}
                          className="w-full p-3 border border-gray-300 rounded-md appearance-none bg-white pr-10"
                        >
                          <option value="">Select...</option>
                          {countries.map(country => (
                            <option key={country} value={country}>{country}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State*
                      </label>
                      <div className="relative">
                        <select
                          value={formData.billingRegion}
                          onChange={(e) => {
                            handleSelectChange('billingRegion', e.target.value);
                            setFormData(prev => ({ ...prev, billingCity: '' }));
                          }}
                          className="w-full p-3 border border-gray-300 rounded-md appearance-none bg-white pr-10"
                        >
                          <option value="">Select...</option>
                          {indianStates.map(state => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City*
                      </label>
                      <div className="relative">
                        <select
                          value={formData.billingCity}
                          onChange={(e) => handleSelectChange('billingCity', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-md appearance-none bg-white pr-10"
                          disabled={!formData.billingRegion}
                        >
                          <option value="">Select...</option>
                          {getCitiesByState(formData.billingRegion).map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP Code*
                      </label>
                      <Input
                        name="billingZipCode"
                        placeholder="ZIP Code"
                        value={formData.billingZipCode}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleSaveBillingInfo}
                      disabled={isSavingBilling}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                    >
                      {isSavingBilling ? 'Saving...' : 'Update Billing Info'}
                    </button>
                    <button
                      onClick={() => setIsEditingBilling(false)}
                      className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Shipping Address Section - Always Required */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Shipping Address</h2>
            <p className="text-sm text-gray-600 mb-6">Please provide the shipping address for this order. This address will be used only for this order.</p>
            
            <div className="space-y-6">
              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name (Optional)
                </label>
                <Input
                  name="shippingCompanyName"
                  placeholder="Company Name"
                  value={formData.shippingCompanyName}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address*
                </label>
                <Input
                  name="shippingAddress"
                  placeholder="Street Address"
                  value={formData.shippingAddress}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>

              {/* Location Dropdowns */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country*
                  </label>
                  <div className="relative">
                    <select
                      value={formData.shippingCountry}
                      onChange={(e) => {
                        handleSelectChange('shippingCountry', e.target.value);
                        setFormData(prev => ({ ...prev, shippingRegion: '', shippingCity: '' }));
                      }}
                      className="w-full p-3 border border-gray-300 rounded-md appearance-none bg-white pr-10"
                    >
                      <option value="">Select...</option>
                      {countries.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State*
                  </label>
                  <div className="relative">
                    <select
                      value={formData.shippingRegion}
                      onChange={(e) => {
                        handleSelectChange('shippingRegion', e.target.value);
                        setFormData(prev => ({ ...prev, shippingCity: '' }));
                      }}
                      className="w-full p-3 border border-gray-300 rounded-md appearance-none bg-white pr-10"
                    >
                      <option value="">Select...</option>
                      {indianStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City*
                  </label>
                  <div className="relative">
                    <select
                      value={formData.shippingCity}
                      onChange={(e) => handleSelectChange('shippingCity', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md appearance-none bg-white pr-10"
                      disabled={!formData.shippingRegion}
                    >
                      <option value="">Select...</option>
                      {getCitiesByState(formData.shippingRegion).map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code*
                  </label>
                  <Input
                    name="shippingZipCode"
                    placeholder="ZIP Code"
                    value={formData.shippingZipCode}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Option Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Option</h2>
            
            <div className="space-y-4">
              {/* Payment Method Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedPaymentMethod === method.id
                        ? 'border-[#3AAFA9] bg-[#3AAFA9]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handlePaymentMethodChange(method.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedPaymentMethod === method.id
                          ? 'border-[#3AAFA9] bg-[#3AAFA9]'
                          : 'border-gray-300'
                      }`}>
                        {selectedPaymentMethod === method.id && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <method.icon />
                        <span className="text-sm font-medium text-gray-700">
                          {method.name}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Credit Card Details */}
              {showCardDetails && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Card Details</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name on Card
                      </label>
                      <Input
                        name="cardName"
                        placeholder="Name on Card"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number
                      </label>
                      <Input
                        name="cardNumber"
                        placeholder="Card Number"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expire Date
                        </label>
                        <Input
                          name="expireDate"
                          placeholder="DD/YY"
                          value={formData.expireDate}
                          onChange={handleInputChange}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV
                        </label>
                        <Input
                          name="cvv"
                          placeholder="CVV"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="saveCardDetails"
                        checked={formData.saveCardDetails}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, saveCardDetails: checked as boolean }))
                        }
                      />
                      <label htmlFor="saveCardDetails" className="text-sm text-gray-700">
                        Save card details for future purchases
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Proceed to Checkout Button */}
              <div className="flex justify-end mt-8">
                <Button
                  onClick={handleProceedToCheckout}
                  disabled={isCreatingOrder}
                  className="bg-[#3AAFA9] hover:bg-[#2a8a85] text-white px-8 py-3 flex items-center space-x-2 disabled:opacity-50"
                >
                  <span>{isCreatingOrder ? 'Creating Order...' : 'Create Order'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;