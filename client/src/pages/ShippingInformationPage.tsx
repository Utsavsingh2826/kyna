import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown } from 'lucide-react';

const ShippingInformationPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    address: '',
    country: '',
    region: '',
    city: '',
    zipCode: '',
    email: '',
    phoneNumber: '',
    sameAsBilling: false
  });

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

  const handleSaveChanges = () => {
    // Simulate saving shipping information
    console.log('Shipping information saved:', formData);
    // Redirect to order success page
    navigate('/order-success');
  };

  const countries = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia'];
  const regions = ['Karnataka', 'Maharashtra', 'Tamil Nadu', 'Delhi', 'Gujarat'];
  const cities = ['Bangalore', 'Mumbai', 'Chennai', 'Delhi', 'Ahmedabad'];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shipping Information</h1>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="space-y-6">
            {/* User Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User name*
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  name="firstName"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full"
                />
                <Input
                  name="lastName"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>
            </div>

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
                placeholder="Address"
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
                  Region/State*
                </label>
                <div className="relative">
                  <select
                    value={formData.region}
                    onChange={(e) => handleSelectChange('region', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md appearance-none bg-white pr-10"
                  >
                    <option value="">Select...</option>
                    {regions.map(region => (
                      <option key={region} value={region}>{region}</option>
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
                  >
                    <option value="">Select...</option>
                    {cities.map(city => (
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
                  placeholder="Zip Code"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email*
                </label>
                <Input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number*
                </label>
                <Input
                  name="phoneNumber"
                  placeholder="Phone Number"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>
            </div>

            {/* Same as Billing Address */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sameAsBilling"
                checked={formData.sameAsBilling}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, sameAsBilling: Boolean(checked) }))
                }
              />
              <label htmlFor="sameAsBilling" className="text-sm text-gray-700">
                Same as Billing address
              </label>
            </div>
          </div>

          {/* Save Changes Button */}
          <div className="mt-8 flex justify-start">
            <Button 
              className="bg-[#3AAFA9] hover:bg-[#2a8a85] text-white px-8 py-3 text-lg font-medium"
              onClick={handleSaveChanges}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingInformationPage;
