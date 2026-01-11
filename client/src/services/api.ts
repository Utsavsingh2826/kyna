import API_CONFIG from "@/config/api";
import { getAccessToken } from "@/lib/authToken";

const API_BASE_URL = API_CONFIG.BASE_URL;

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const token = getAccessToken();

      // Build headers - don't set Content-Type for FormData (browser will set it with boundary)
      const headers: Record<string, string> = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers as Record<string, string> | undefined),
      };

      // Only add Content-Type if not FormData and not already set
      if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
      }

      const response = await fetch(url, {
        ...options,
        headers,
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        // Check if the backend response has a nested structure
        if (data.success && data.data) {
          // Backend returns {success: true, data: {...}}
          return {
            success: true,
            data: data.data,
            message: data.message,
          };
        } else {
          // Backend returns data directly
          return {
            success: true,
            data,
            message: data.message,
          };
        }
      } else {
        return {
          success: false,
          error: data.message || "Request failed",
          data,
        };
      }
    } catch {
      return {
        success: false,
        error: "Network error. Please check your connection.",
      };
    }
  }

  // Auth APIs
  async signup(userData: { name: string; email: string; password: string }) {
    return this.makeRequest("/auth/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: {
    email: string;
    password: string;
    useCookie?: boolean;
  }) {
    return this.makeRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.makeRequest("/auth/logout", {
      method: "POST",
    });
  }

  async verifyEmail(verificationData: { email: string; otp: string }) {
    return this.makeRequest("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify(verificationData),
    });
  }

  async resendOtp(email: string) {
    return this.makeRequest("/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async forgotPassword(email: string) {
    return this.makeRequest("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string) {
    return this.makeRequest(`/auth/reset-password/${token}`, {
      method: "POST",
      body: JSON.stringify({ password }),
    });
  }
  async updateProfile(profileData: Record<string, any>, profileImage?: File) {
    // If there's an image, use FormData
    if (profileImage) {
      const formData = new FormData();

      // Add all profile data fields
      Object.keys(profileData).forEach((key) => {
        if (profileData[key] !== undefined && profileData[key] !== null) {
          formData.append(key, profileData[key]);
        }
      });

      // Add the image file
      formData.append("profileImage", profileImage);

      return this.makeRequest("/auth/profile", {
        method: "PUT",
        body: formData, // Don't set Content-Type header, let browser set it with boundary
      });
    } else {
      // No image, use JSON
      return this.makeRequest("/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });
    }
  }

  async checkAuth() {
    return this.makeRequest("/auth/check-auth");
  }

  async getProfile() {
    return this.makeRequest("/auth/profile", {
      method: "GET",
    });
  }

  // Test API connection
  async testConnection() {
    try {
      const response = await fetch(`${API_BASE_URL}/test`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.ok; // Any successful response means server is running
    } catch {
      return false;
    }
  }

  // Product APIs
  async getProducts(params?: {
    category?: string;
    subCategory?: string;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append("category", params.category);
    if (params?.subCategory)
      queryParams.append("subCategory", params.subCategory);
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const queryString = queryParams.toString();
    return this.makeRequest(`/products${queryString ? `?${queryString}` : ""}`);
  }

  async getProduct(id: string) {
    return this.makeRequest(`/products/${id}`);
  }

  // Cart APIs
  async getCart() {
    return this.makeRequest("/cart");
  }

  async addToCart(
    productId: string,
    quantity: number = 1,
    variantData?: {
      variantSku: string;
      variantConfig: {
        metalColor?: string;
        metalType?: string;
        goldKarat?: string;
        diamondShape?: string;
        diamondSize?: string;
        diamondOrigin?: string;
        diamondColor?: string;
        diamondClarity?: string;
        ringSize?: string;
        centerStoneShape?: string;
        centerStoneSize?: string;
      };
    }
  ) {
    const requestBody: any = { productId, quantity };

    if (variantData) {
      requestBody.variantSku = variantData.variantSku;
      requestBody.variantConfig = variantData.variantConfig;
    }

    return this.makeRequest("/cart/add", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });
  }

  async updateCartItem(productId: string, quantity: number) {
    return this.makeRequest(`/cart/update/${productId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    });
  }

  async updateCartItemRingSize(itemId: string, ringSize: string) {
    return this.makeRequest(`/cart/update-ring-size/${itemId}`, {
      method: "PUT",
      body: JSON.stringify({ ringSize }),
    });
  }

  async removeFromCart(productId: string) {
    return this.makeRequest(`/cart/remove/${productId}`, {
      method: "DELETE",
    });
  }

  async clearCart() {
    return this.makeRequest("/cart/clear", {
      method: "DELETE",
    });
  }

  // Order APIs
  // async createOrder(orderData: any) {
  //   return this.makeRequest("/orders", {
  //     method: "POST",
  //     body: JSON.stringify(orderData),
  //   });
  // }

  async getOrders() {
    return this.makeRequest("/orders");
  }

  async getOrder(id: string) {
    return this.makeRequest(`/orders/${id}`);
  }

  // Promo Code APIs
  async validatePromoCode(payload: {
    code: string;
    context?: "cart" | "direct";
    directPurchase?: { diamondCost?: number };
  }) {
    return this.makeRequest("/promo-code/validate", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  // Redeem referral promo (cart flow) - supports passing either referFrdId or public code
  async redeemReferralPromo(codeOrId: string) {
    return this.makeRequest("/referrals/promos/redeem", {
      method: "POST",
      body: JSON.stringify({ referFrdId: codeOrId, code: codeOrId }),
    });
  }

  async applySimpleReferral() {
    return this.makeRequest("/referrals/apply-simple", {
      method: "POST",
    });
  }

  async validateReferralCode(code: string) {
    return this.makeRequest("/referral-code/validate", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
  }

  // Wishlist methods
  async getWishlist() {
    return this.makeRequest("/wishlist", {
      method: "GET",
    });
  }

  async addToWishlist(payload: {
    productId: string;
    modelSku: string;
    title?: string;
    categorySlug: string;
    categoryLabel?: string;
    variantSku?: string | null;
    metalColorName?: string | null;
    metalColorCode?: string | null;
    primaryImage?: string | null;
    price?: number | null;
    engraving?: {
      text?: string;
      motif?: string;
      imageUrl?: string;
    };
  }) {
    return this.makeRequest("/wishlist", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async removeFromWishlist(itemId: string) {
    return this.makeRequest(`/wishlist/${itemId}`, {
      method: "DELETE",
    });
  }

  async checkWishlistStatus(
    productId: string,
    options?: { variantSku?: string; metalColorCode?: string }
  ) {
    const params = new URLSearchParams();
    if (options?.variantSku) {
      params.set("variantSku", options.variantSku);
    }
    if (options?.metalColorCode) {
      params.set("metalColorCode", options.metalColorCode);
    }

    const query = params.toString();
    const endpoint = query
      ? `/wishlist/check/${productId}?${query}`
      : `/wishlist/check/${productId}`;

    return this.makeRequest(endpoint, {
      method: "GET",
    });
  }

  // Address management methods
  async getUserAddresses() {
    return this.makeRequest("/address/addresses", {
      method: "GET",
    });
  }

  async updateBillingAddress(addressData: {
    companyName?: string;
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  }) {
    return this.makeRequest("/address/billing-address", {
      method: "PUT",
      body: JSON.stringify(addressData),
    });
  }

  async updateShippingAddress(addressData: {
    companyName?: string;
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    sameAsBilling?: boolean;
  }) {
    return this.makeRequest("/address/shipping-address", {
      method: "PUT",
      body: JSON.stringify(addressData),
    });
  }

  async copyBillingToShipping() {
    return this.makeRequest("/address/copy-billing-to-shipping", {
      method: "POST",
    });
  }
}

export const apiService = new ApiService();
export default apiService;
