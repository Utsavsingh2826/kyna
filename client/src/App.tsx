import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import PromotionalBanner from "./components/PromotionalBanner";
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import AboutPage from "./pages/AboutPage";
import Engraving from "./pages/Engravings";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import ProfilePage from "./pages/ProfilePage";
import TermsAndConditions from "./components/terms&conditions/TermsAndConditions";
import EngravingPage from "./pages/Engrave";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import BangelsEducations from "./pages/Education/BangelsEducations";
import CustomerService from "./pages/CustomerService";
import { useSelector } from "react-redux";
import type { RootState } from "./store";
import { initializeAuth } from "./store/slices/authSlice";
import RingSizeEducation from "./pages/Education/RingSizeEducation";
import JewelleryPage from "./pages/JewelleryPage";
import Gifting from "./pages/Gifting/GiftCards";
import RingBuilder from "./pages/design-yr-own.tsx/RingBuilder";
import PendantBuilder from "./pages/design-yr-own.tsx/PendantDisplay";
import BangleBuilder from "./pages/design-yr-own.tsx/BangelBuilder";
import BraceletBuilder from "./pages/design-yr-own.tsx/BraceletBuilder";
import NecklaceBuilder from "./pages/design-yr-own.tsx/NecklaceBuilder";
import EarringBuilder from "./pages/design-yr-own.tsx/EarringBuilder";
import Referral from "./pages/Referral";
import Blogs from "./pages/Blogs";
import BlogPost from "./pages/BlogPost";
import ProductDetail from "./pages/ProductDetail";
import Product3d from "./pages/Product3d";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentProcessingPage from "./pages/PaymentProcessingPage";
import ShippingInformationPage from "./pages/ShippingInformationPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import WishlistPage from "./pages/WishlistPage";
import SharedWishlistPage from "./pages/SharedWishlistPage";
import PrivacyPolicy from "./components/terms&conditions/PrivacyPolicy";
import ShippingPolicy from "./components/terms&conditions/Shipping";
import CancellationRefund from './components/terms&conditions/Cancellation&Refund'
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import BuildYourJewelleryPendants from "./pages/Build_yr_own/BuildYourJewelleryPendants";
import BuildYourJewelleryBracelets from "./pages/Build_yr_own/BuildYourJewelleryBracelet";
import BuildYourJewelleryBands from "./pages/Build_yr_own/BuildYourJewelleryBands";
import BuildYourJewelleryEarrings from "./pages/Build_yr_own/BuildYourJewelleryEarings";
import BuildYourJewelleryRings from "./pages/Build_yr_own/BuildYourJewelleryRings";
import TrackOrderPage from "./pages/TrackOrderPage";
import Giftings from "./pages/Gifting/Giftings";

function PrivateRoute({ children }: { children: JSX.Element }) {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  // Also check localStorage as fallback
  let isAuthenticatedFromStorage = false;
  try {
    isAuthenticatedFromStorage =
      localStorage.getItem("isAuthenticated") === "true";
  } catch {
    // ignore storage read failures
  }

  console.log("PrivateRoute check:", {
    reduxAuth: isAuthenticated,
    storageAuth: isAuthenticatedFromStorage,
  });

  if (!isAuthenticated && !isAuthenticatedFromStorage) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  console.log("User is authenticated, allowing access to protected route");
  return children;
}

function PublicRoute({ children }: { children: JSX.Element }) {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Initialize auth state from localStorage on app start
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-white">
        <PromotionalBanner />
        <Header />
        <Navigation />

        <Routes>
          <Route path="/product-3d" element={<Product3d />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/product" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment-processing" element={<PaymentProcessingPage />} />
          <Route path="/shipping" element={<ShippingInformationPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route
            path="/wishlist"
            element={
              <PrivateRoute>
                <WishlistPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/shared-wishlist/:shareId"
            element={<SharedWishlistPage />}
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignUpPage />
              </PublicRoute>
            }
          />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route
            path="/reset-password/:token"
            element={<ResetPasswordPage />}
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route path="/rings" element={<ProductsPage category="rings" />} />
          <Route
            path="/rings/:subcategory"
            element={<ProductsPage category="rings" />}
          />
          <Route
            path="/earrings"
            element={<ProductsPage category="earrings" />}
          />
          <Route
            path="/earrings/:subcategory"
            element={<ProductsPage category="earrings" />}
          />
          <Route path="/engravings" element={<Engraving />} />
          <Route
            path="/pendants"
            element={<ProductsPage category="pendants" />}
          />
          <Route
            path="/pendants/:subcategory"
            element={<ProductsPage category="pendants" />}
          />
          <Route path="/terms-conditions" element={<TermsAndConditions />} />
          <Route path="/customer-service" element={<CustomerService />} />
          {/* Pretty path-based FAQ routes */}
          <Route path="/customer-service/faqs" element={<CustomerService />} />
          <Route path="/customer-service/faqs/:categorySlug" element={<CustomerService />} />
          <Route path="/customer-service/faqs/:categorySlug/:questionSlug" element={<CustomerService />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/shipping-policy" element={<ShippingPolicy />} />
          <Route path="/cancellation-refund" element={<CancellationRefund />} />
          <Route
            path="/engrave-your-ring"
            element={<EngravingPage onClose={() => {}} />}
          />
          <Route path="/Bracelet-education" element={<BangelsEducations />} />
          <Route path="/RingSize-Education" element={<RingSizeEducation />} />
          <Route path="/gifting/gift-card" element={<Gifting />} />
          <Route path="/upload-your-design/rings" element={<RingBuilder />} />
          <Route path="/CustomerService" element={<CustomerService />} />
          <Route path="/referral" element={<Referral />} />
          <Route path="/referral/:referralId" element={<Referral />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route
            path="/upload-your-design/pendants"
            element={<PendantBuilder />}
          />
          <Route
            path="/upload-your-design/bangles"
            element={<BangleBuilder />}
          />
          <Route
            path="/upload-your-design/bracelets"
            element={<BraceletBuilder />}
          />
          <Route
            path="/upload-your-design/necklaces"
            element={<NecklaceBuilder />}
          />
          <Route
            path="/upload-your-design/earrings"
            element={<EarringBuilder />}
          />
          <Route
            path="/jewellery" 
            element={<JewelleryPage />}
          />
          <Route
            path="/jewellery/:category"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <h1 className="text-4xl">Jewellery Category</h1>
              </div>
            }
          />
          <Route
            path="/engraving"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <h1 className="text-4xl">Engraving Page</h1>
              </div>
            }
          />
          <Route
            path="/design-your-own"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <h1 className="text-4xl">Design Your Own</h1>
              </div>
            }
          />
          <Route
            path="/upload-design"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <h1 className="text-4xl">Upload Design</h1>
              </div>
            }
          />
          <Route
            path="/build-jewellery"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <h1 className="text-4xl">Build Jewellery</h1>
              </div>
            }
          />
          <Route
            path="/gifting"
            element={<Giftings />}
          />
          <Route
            path="/gifting/:priceRange"
            element={<Giftings />}
          />
          <Route
            path="/gifting/:category"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <h1 className="text-4xl">Gifting Category</h1>
              </div>
            }
          />
          <Route
            path="/build-your-jewellery/Rings"
            element={<BuildYourJewelleryRings />}
          />
          <Route
            path="/build-your-jewellery/Pendants"
            element={<BuildYourJewelleryPendants />}
          />
          <Route
            path="/build-your-jewellery/Bracelets"
            element={<BuildYourJewelleryBracelets />}
          />
          <Route
            path="/build-your-jewellery/Bands"
            element={<BuildYourJewelleryBands />}
          />
          <Route
            path="/build-your-jewellery/Earrings"
            element={<BuildYourJewelleryEarrings />}
          />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/track-order" element={<TrackOrderPage />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
