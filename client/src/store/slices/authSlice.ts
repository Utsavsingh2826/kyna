import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the User type or import it from the appropriate module
interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  role?: string;
  isVerified?: boolean;
  profileImage?: string;
  secondaryEmail?: string;
  phoneNumber?: string;
  phone?: string;
  zipCode?: string;
  state?: string;
  country?: string;
  // Add other relevant user properties here
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  user: null,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    initializeAuth(state) {
      try {
        const isAuthenticated =
          localStorage.getItem("isAuthenticated") === "true";
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");

        if (isAuthenticated && token && userStr) {
          state.isAuthenticated = true;
          state.token = token;
          state.user = JSON.parse(userStr);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        // Clear invalid data
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    },

    loadUserFromStorage(state) {
      try {
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");
        const isAuthenticated =
          localStorage.getItem("isAuthenticated") === "true";

        if (token && userStr && isAuthenticated) {
          state.token = token;
          state.user = JSON.parse(userStr);
          state.isAuthenticated = true;
          state.error = null;
        }
      } catch (error) {
        console.error("Error loading user from storage:", error);
        state.error = "Failed to load user data";
      }
    },

    loginSucceeded(
      state,
      action: PayloadAction<{ token: string; user: User }>
    ) {
      const { token, user } = action.payload;
      state.isAuthenticated = true;
      state.token = token;
      state.user = user;
      state.error = null;

      // Save to localStorage
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    },

    logoutSucceeded(state) {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
      state.error = null;

      // Clear localStorage
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },

    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },

    clearError(state) {
      state.error = null;
    },

    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
  },
});

export const {
  initializeAuth,
  loadUserFromStorage,
  loginSucceeded,
  logoutSucceeded,
  setError,
  clearError,
  updateUser,
} = authSlice.actions;

export default authSlice.reducer;
