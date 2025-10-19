import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [formData, setFormData] = useState({
    // Billing address fields
    companyName: '',
    address: '',
    country: 'India',
    region: '',
    city: '',
    zipCode: '',
    shipToBilling: false,
    // Shipping address fields
    shippingCompanyName: '',
    shippingAddress: '',
    shippingCountry: 'India',
    shippingRegion: '',
    shippingCity: '',
    shippingZipCode: '',
    cardName: '',
    cardNumber: '',
    expireDate: '',
    cvv: '',
    saveCardDetails: false
  });

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('credit-card');
  const [showCardDetails, setShowCardDetails] = useState(true);
  const [userAddresses, setUserAddresses] = useState<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePaymentMethodChange = (method: string) => {
    setSelectedPaymentMethod(method);
    setShowCardDetails(method === 'credit-card');
  };

  const handleSameAsBillingChange = (checked: boolean) => {
    setFormData(prev => {
      if (checked) {
        // Copy billing address to shipping address
        return {
          ...prev,
          shipToBilling: checked,
          shippingCompanyName: prev.companyName,
          shippingAddress: prev.address,
          shippingCountry: prev.country,
          shippingRegion: prev.region,
          shippingCity: prev.city,
          shippingZipCode: prev.zipCode,
        };
      } else {
        return {
          ...prev,
          shipToBilling: checked,
        };
      }
    });
  };

  // Load user addresses on component mount
  useEffect(() => {
    const loadUserAddresses = async () => {
      try {
        const response = await apiService.getUserAddresses();
        if (response.success && response.data) {
          setUserAddresses(response.data);
          
          // If user has billing address, populate the form
          if (response.data.billingAddress) {
            const billing = response.data.billingAddress;
            setFormData(prev => ({
              ...prev,
              companyName: billing.companyName || '',
              address: billing.street || '',
              country: billing.country || 'India',
              region: billing.state || '',
              city: billing.city || '',
              zipCode: billing.zipCode || '',
            }));
          }
        }
      } catch (error) {
        console.error('Failed to load user addresses:', error);
      }
    };

    loadUserAddresses();
  }, []);

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

  const handleSaveBillingAddress = async () => {
    try {
      const billingData = {
        companyName: formData.companyName,
        street: formData.address,
        city: formData.city,
        state: formData.region,
        country: formData.country,
        zipCode: formData.zipCode
      };

      const response = await apiService.updateBillingAddress(billingData);
      if (response.success) {
        alert('Billing address updated successfully!');
      } else {
        alert('Failed to update billing address');
      }
    } catch (error) {
      console.error('Error updating billing address:', error);
      alert('Error updating billing address');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Billing Information and Payment Option</h1>

        <div className="space-y-8">
          {/* Billing Address Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Billing Information</h2>
            
            <div className="space-y-6">
              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name (Optional)
                </label>
                <Input
                  name="companyName"
                  placeholder="Company Name"
                  value={formData.companyName}
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
                  name="address"
                  placeholder="Street address"
                  value={formData.address}
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
                      value={formData.country}
                      onChange={(e) => handleSelectChange('country', e.target.value)}
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
                      value={formData.region}
                      onChange={(e) => {
                        handleSelectChange('region', e.target.value);
                        // Reset city when state changes
                        setFormData(prev => ({ ...prev, city: '' }));
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
                      value={formData.city}
                      onChange={(e) => handleSelectChange('city', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md appearance-none bg-white pr-10"
                      disabled={!formData.region}
                    >
                      <option value="">Select...</option>
                      {getCitiesByState(formData.region).map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zip Code*
                  </label>
                  <Input
                    name="zipCode"
                    placeholder="Enter zip code"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Ship to Billing Address */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="shipToBilling"
                  checked={formData.shipToBilling}
                  onCheckedChange={handleSameAsBillingChange}
                />
                <label htmlFor="shipToBilling" className="text-sm text-gray-700">
                  Ship into Billing address
                </label>
              </div>

              {/* Save Billing Address Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleSaveBillingAddress}
                  className="bg-[#3AAFA9] hover:bg-[#2a8a85] text-white px-6 py-2"
                >
                  Save Billing Address
                </Button>
              </div>
            </div>
          </div>

          {/* Shipping Address Section - Only show when shipToBilling is false */}
          {!formData.shipToBilling && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Shipping Address</h2>
              
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
                    placeholder="Street address"
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
                        onChange={(e) => handleSelectChange('shippingCountry', e.target.value)}
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
                      Zip Code*
                    </label>
                    <Input
                      name="shippingZipCode"
                      placeholder="Enter zip code"
                      value={formData.shippingZipCode}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

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
                  onClick={() => navigate('/order-success')}
                  className="bg-[#3AAFA9] hover:bg-[#2a8a85] text-white px-8 py-3 flex items-center space-x-2"
                >
                  <span>Proceed to Checkout</span>
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