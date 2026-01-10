import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  User,
  // Wallet,
  // CreditCard,
  // Package,
  // Clock,
  // Heart,
  LogOut,
  Edit3,
  ChevronDown,
  Truck,
  Heart,
} from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "@/store/slices/authSlice";
import type { RootState } from "@/store";
import apiService from "@/services/api";
import TrackOrderPage from "./TrackOrderPage";
import WidhlistPage from "./WishlistPage";

interface UserData {
  firstName: string;
  lastName?: string;
  email: string;
  secondaryEmail?: string;
  phoneNumber?: string;
  country?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  displayName?: string;
  profileImage?: File | null;
  // ...other backend fields
}

const ProfilePage: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const [activeSection, setActiveSection] = useState("User Account");
  const [isLoading, setIsLoading] = useState(true);
  const [profileImageUrl, setProfileImageUrl] = useState<string>(""); // Cloudinary URL
  const [profileData, setProfileData] = useState<UserData>({
    firstName: "",
    lastName: "",
    displayName: "",
    email: "",
    secondaryEmail: "",
    phoneNumber: "",
    country: "",
    state: "",
    city: "",
    zipCode: "",
  });

  const sidebarItems = [
    { icon: User, label: "User Account", active: true },
    // { icon: Wallet, label: "Wallet" },
    // { icon: CreditCard, label: "Cards & Address" },
    // { icon: Package, label: "Order History" },
    { icon: Truck, label: "Track Order" },
    { icon: Heart, label: "Wishlist" },
    { icon: LogOut, label: "Signout" },
  ];

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveChanges = async () => {
    // Validate required fields before saving
    if (!profileData.firstName.trim()) {
      alert("First name is required");
      return;
    }

    if (!profileData.email.trim()) {
      alert("Email is required");
      return;
    }

    try {
      const updateData = profileData;

      // Map frontend fields to backend expected fields
      const profileUpdateData = {
        firstName: updateData.firstName.trim(),
        lastName: updateData.lastName?.trim() || "",
        phone: updateData.phoneNumber?.trim() || "",
        secondaryEmail: updateData.secondaryEmail?.trim() || "",
        country: updateData.country?.trim() || "",
        state: updateData.state?.trim() || "",
        city: updateData.city?.trim() || "",
        zipCode: updateData.zipCode?.trim() || "",
      };

      interface UpdateProfileResponse {
        success: boolean;
        data?: {
          firstName?: string;
          lastName?: string;
          phone?: string;
          secondaryEmail?: string;
          country?: string;
          state?: string;
          city?: string;
          zipCode?: string;
          profileImage?: string;
          [key: string]: unknown;
        };
        message?: string;
      }

      // Pass the profile image if it exists
      const response = (await apiService.updateProfile(
        profileUpdateData,
        profileData.profileImage || undefined
      )) as UpdateProfileResponse;

      if (response.success) {
        // Fetch fresh profile data from backend to ensure all fields are up to date
        const profileResponse = await apiService.getProfile();

        if (profileResponse.success && profileResponse.data) {
          const userData =
            (profileResponse.data as any).user || profileResponse.data;

          // Update Redux store with the complete fresh data
          dispatch(updateUser(userData));

          // Update local state with the fresh data
          setProfileData({
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            displayName: userData.displayName || userData.firstName || "",
            email: userData.email || "",
            secondaryEmail: userData.secondaryEmail || "",
            phoneNumber: userData.phone || userData.phoneNumber || "",
            country: userData.country || "",
            state: userData.state || "",
            city: userData.city || "",
            zipCode: userData.zipCode || "",
            profileImage: undefined, // Clear the file from local state after upload
          });

          // Update profile image URL from Cloudinary
          setProfileImageUrl(userData.profileImage || "");
        }

        alert("Profile updated successfully!");
      } else {
        alert(
          "Error updating profile: " + (response.message || "Unknown error")
        );
      }
    } catch (err) {
      console.error("Profile update error:", err);
      alert("Something went wrong while updating profile.");
    }
  };

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    // Redirect to home page or login page
    window.location.href = "/";
  };

  const handleDeleteAccount = () => {
    alert("Delete account feature will be implemented soon.");
  };

  useEffect(() => {
    // Always fetch fresh profile data from API on component mount
    const loadProfileData = async () => {
      setIsLoading(true);

      try {
        const response = await apiService.getProfile();

        if (response.success && response.data) {
          const userData = (response.data as any).user || response.data; // Handle both {user} and direct user object

          // Update Redux store with fetched data
          dispatch(updateUser(userData));

          // Set profile data
          setProfileData({
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            displayName: userData.displayName || userData.firstName || "",
            email: userData.email || "",
            secondaryEmail: userData.secondaryEmail || "",
            phoneNumber: userData.phone || userData.phoneNumber || "",
            country: userData.country || "",
            state: userData.state || "",
            city: userData.city || "",
            zipCode: userData.zipCode || "",
            profileImage: undefined,
          });

          // Set profile image URL from Cloudinary
          setProfileImageUrl(userData.profileImage || "");
        } else {
          console.log("ProfilePage: API call failed or returned no data");
          // If API fails, try to use Redux data as fallback
          if (user) {
            setProfileData({
              firstName: user.firstName || "",
              lastName: user.lastName || "",
              displayName: user.displayName || user.firstName || "",
              email: user.email || "",
              secondaryEmail: user.secondaryEmail || "",
              phoneNumber: user.phone || user.phoneNumber || "",
              country: user.country || "",
              state: user.state || "",
              city: user.city || "",
              zipCode: user.zipCode || "",
              profileImage: undefined,
            });
          } else {
            // Set minimal default state
            setProfileData({
              firstName: "",
              lastName: "",
              displayName: "",
              email: "",
              secondaryEmail: "",
              phoneNumber: "",
              country: "",
              state: "",
              city: "",
              zipCode: "",
              profileImage: undefined,
            });
          }
        }
      } catch (error) {
        console.error("ProfilePage: Failed to fetch profile data:", error);
        // Use Redux data as fallback
        if (user) {
          setProfileData({
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            displayName: user.displayName || user.firstName || "",
            email: user.email || "",
            secondaryEmail: user.secondaryEmail || "",
            phoneNumber: user.phone || user.phoneNumber || "",
            country: user.country || "",
            state: user.state || "",
            city: user.city || "",
            zipCode: user.zipCode || "",
            profileImage: undefined,
          });
        } else {
          // Set minimal default state
          setProfileData({
            firstName: "",
            lastName: "",
            displayName: "",
            email: "",
            secondaryEmail: "",
            phoneNumber: "",
            country: "",
            state: "",
            city: "",
            zipCode: "",
            profileImage: undefined,
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [dispatch]); // Remove user from dependencies to always fetch fresh data

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // optional chaining
    if (file) {
      setProfileData((prev) => ({ ...prev, profileImage: file }));
    }
  };

  const getInitials = (firstName: string, lastName?: string) => {
    return (firstName.charAt(0) + (lastName?.charAt(0) || "")).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="text-sm text-gray-600">
            <Link to="/" className="hover:text-teal-600">
              Home
            </Link>
            <span className="mx-2">-</span>
            <span className="text-gray-800">User Account</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {sidebarItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (item.label === "Track Order") {
                      window.location.href = "/track-order";
                      return;
                    }
                    setActiveSection(item.label);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-left transition-colors border-b border-gray-100 last:border-b-0 ${
                    activeSection === item.label
                      ? "bg-[#328F94] text-white "
                      : "text-gray-700"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
              <h1 className="text-2xl font-semibold text-gray-800 mb-8">
                {activeSection === "Signout"
                  ? "ACCOUNT ACTIONS"
                  : "ACCOUNT SETTING"}
              </h1>

              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#328F94]"></div>
                  <span className="ml-3 text-gray-600">
                    Loading profile data...
                  </span>
                </div>
              ) : !isLoading && !profileData.email ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 mb-4">
                    <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      Profile Information Not Available
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      We couldn't load your profile information. Please try
                      refreshing the page or contact support if the problem
                      persists.
                    </p>
                    <Button
                      onClick={() => window.location.reload()}
                      className="bg-[#328F94] hover:bg-[#328F94]/90 text-white"
                    >
                      Refresh Page
                    </Button>
                  </div>
                </div>
              ) : activeSection === "Signout" ? (
                /* Sign Out Section */
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Profile Image Section - Keep unchanged */}
                  <div className="lg:w-1/3 flex flex-col items-center">
                    <div className="relative mb-4">
                      <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg overflow-hidden">
                        {profileData.profileImage ? (
                          <img
                            src={URL.createObjectURL(profileData.profileImage)}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : profileImageUrl ? (
                          <img
                            src={profileImageUrl}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          getInitials(
                            profileData.firstName,
                            profileData.lastName
                          )
                        )}
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {user?.firstName} {user?.lastName}
                      </h3>
                      <p className="text-gray-600">{user?.email}</p>
                    </div>
                  </div>

                  {/* Action Buttons Section */}
                  <div className="lg:w-2/3 flex flex-col justify-center">
                    <div className="space-y-4">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                        <h4 className="text-center">
                          Are You Sure You want to signout ?
                        </h4>
                        <div className="mt-4">
                          <Button
                            onClick={handleLogout}
                            className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
                          >
                            Log Out
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeSection === "Track Order" ? (
                // <iframe
                //   src="/track-order"
                //   className="w-full h-[80vh] border-0 rounded-lg"
                //   title="Track your order"
                // ></iframe>
                <TrackOrderPage />
              ) : activeSection === "Wishlist" ? (
                <WidhlistPage />
              ) : (
                /* Regular Account Settings Section */
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Profile Image Section */}
                  <div className="lg:w-1/3 flex flex-col items-center">
                    <div className="relative mb-4">
                      <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg overflow-hidden">
                        {profileData.profileImage ? (
                          <img
                            src={URL.createObjectURL(profileData.profileImage)}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : profileImageUrl ? (
                          <img
                            src={profileImageUrl}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          getInitials(
                            profileData.firstName,
                            profileData.lastName
                          )
                        )}
                      </div>

                      {/* Use a label to trigger file input */}
                      <label className="absolute bottom-2 right-2 cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfileImageChange}
                          className="hidden"
                        />
                        <div className="bg-white rounded-full p-2 shadow-lg hover:shadow-xl border border-gray-200">
                          <Edit3 className="w-4 h-4 text-gray-600" />
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Form Section */}
                  <div className="lg:w-2/3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* First Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          value={profileData.firstName}
                          onChange={(e) =>
                            handleInputChange("firstName", e.target.value)
                          }
                          className="w-full"
                          required
                        />
                      </div>

                      {/* Last Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <Input
                          type="text"
                          value={profileData.lastName}
                          onChange={(e) =>
                            handleInputChange("lastName", e.target.value)
                          }
                          placeholder="Display Name"
                          className="w-full"
                        />
                      </div>

                      {/* Email */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="email"
                          value={profileData.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          className="w-full"
                        />
                      </div>

                      {/* Secondary Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Secondary Email
                        </label>
                        <Input
                          type="email"
                          value={profileData.secondaryEmail}
                          onChange={(e) =>
                            handleInputChange("secondaryEmail", e.target.value)
                          }
                          className="w-full"
                        />
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <Input
                          type="tel"
                          value={profileData.phoneNumber}
                          onChange={(e) =>
                            handleInputChange("phoneNumber", e.target.value)
                          }
                          className="w-full"
                        />
                      </div>

                      {/* Country/Region */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country/Region
                        </label>
                        <div className="relative">
                          <select
                            value={profileData.country}
                            onChange={(e) =>
                              handleInputChange("country", e.target.value)
                            }
                            className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent appearance-none"
                          >
                            <option value="India">India</option>
                            <option value="USA">USA</option>
                            <option value="UK">UK</option>
                            <option value="Canada">Canada</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* City */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City
                        </label>
                        <Input
                          type="text"
                          value={profileData.city}
                          onChange={(e) =>
                            handleInputChange("city", e.target.value)
                          }
                          className="w-full"
                        />
                      </div>

                      {/* States and Zip Code in one column */}
                      <div className="flex gap-3">
                        {/* States */}
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            States
                          </label>
                          <div className="relative">
                            <select
                              value={profileData.state}
                              onChange={(e) =>
                                handleInputChange("state", e.target.value)
                              }
                              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent appearance-none"
                            >
                              <option value="Maharashtra">Maharashtra</option>
                              <option value="Delhi">Delhi</option>
                              <option value="Karnataka">Karnataka</option>
                              <option value="Tamil Nadu">Tamil Nadu</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                        </div>

                        {/* Zip Code */}
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Zip Code
                          </label>
                          <Input
                            type="text"
                            value={profileData.zipCode}
                            onChange={(e) =>
                              handleInputChange("zipCode", e.target.value)
                            }
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="mt-8">
                      <Button
                        onClick={handleSaveChanges}
                        className="bg-[#328F94] hover:text-[#328F94] hover:border-[#328F94] border-2 text-white px-8 py-3 rounded-md font-medium transition-colors"
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
