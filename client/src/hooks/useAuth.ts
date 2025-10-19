import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { RootState } from "@/store";
import { loadUserFromStorage } from "@/store/slices/authSlice";

// Define the User type if not already imported
export interface User {
  id: string;
  email: string;
  // Add other fields as needed, and ensure firstName and lastName exist if you use them below
  firstName?: string;
  lastName?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  // Removed isLoading if not present in your actual Redux state
  token: string | null;
  user: User | null;
  error: string | null;
}

export const useAuth = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Load user from storage on first render if not already authenticated
    if (!authState.isAuthenticated) {
      dispatch(loadUserFromStorage());
    }
  }, [dispatch, authState.isAuthenticated]);

  // Enhanced debug logging to check if login data is stored correctly
  useEffect(() => {
    console.log("🔍 Auth State Debug - Full State:", {
      isAuthenticated: authState.isAuthenticated,
      hasToken: !!authState.token,
      tokenLength: authState.token?.length || 0,
      tokenPreview: authState.token
        ? `${authState.token.substring(0, 20)}...`
        : "No token",
      hasUser: !!authState.user,
      userId: (authState.user as User | null)?.id,
      userEmail: (authState.user as User | null)?.email,
      userName: authState.user
        ? `${authState.user?.firstName ?? ""} ${
            authState.user?.lastName ?? ""
          }`.trim() || "No user"
        : "No user",
      // isLoading: authState.isLoading, // Removed if not present in state
      error: authState.error || "No error",
      fullAuthState: authState,
    });

    // Check localStorage for token persistence
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    console.log("💾 LocalStorage Debug:", {
      hasStoredToken: !!storedToken,
      storedTokenLength: storedToken?.length || 0,
      hasStoredUser: !!storedUser,
      storedUserEmail: storedUser
        ? JSON.parse(storedUser)?.email
        : "No stored user",
    });

    // Check if there's a mismatch between store and localStorage
    if (storedToken && !authState.token) {
      console.warn("⚠️ Token exists in localStorage but not in Redux store!");
    }

    if (storedUser && !authState.user) {
      console.warn("⚠️ User exists in localStorage but not in Redux store!");
    }
  }, [authState]);

  const isLoggedIn =
    authState.isAuthenticated && !!authState.token && !!authState.user;

  // Additional validation check
  const isCompleteAuth =
    isLoggedIn &&
    authState.user !== null &&
    typeof authState.user === "object" &&
    "id" in authState.user &&
    "email" in authState.user &&
    !!authState.user.id &&
    !!authState.user.email;

  console.log("✅ Auth Status Check:", {
    isLoggedIn,
    isCompleteAuth,
    canRefer: isCompleteAuth,
    authValidation: {
      hasAuthenticated: authState.isAuthenticated,
      hasToken: !!authState.token,
      hasUser: !!authState.user,
      hasUserId: !!authState.user?.id,
      hasUserEmail: !!authState.user?.email,
    },
  });

  return {
    ...authState,
    isLoggedIn,
    // Additional helper properties
    isFullyAuthenticated: isCompleteAuth,
    canRefer: isCompleteAuth,
    // Debug info for troubleshooting
    debug: {
      storeHasToken: !!authState.token,
      storeHasUser: !!authState.user,
      localStorageToken: !!localStorage.getItem("token"),
      localStorageUser: !!localStorage.getItem("user"),
    },
  };
};
