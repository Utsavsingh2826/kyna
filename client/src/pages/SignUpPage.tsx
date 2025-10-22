import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Mail, User, Lock } from "lucide-react";
import apiService from "../services/api";
import { toast } from "sonner";

const SignUpPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [referralCode, setReferralCode] = useState("");

  const [step, setStep] = useState<"enterDetails" | "verifyOtp" | "completed">(
    "enterDetails"
  );
  const [otp, setOtp] = useState("");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Handle referral code from URL
  useEffect(() => {
    const referralParam = searchParams.get("referral");
    if (referralParam) {
      setReferralCode(referralParam);
      toast.info(`Referral code detected: ${referralParam}. You'll get rewards after signup!`);
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== "enterDetails") return;

    setIsLoading(true);
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      };
      if (referralCode) payload.referralCode = referralCode;

      const resp = await apiService.signup(payload);

      if (resp.success) {
        setSuccess(
          resp.message ||
            "Registered. Please verify your email with the OTP sent."
        );
        setStep("verifyOtp");
      } else {
        setError(resp.error || "Sign up failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== "verifyOtp") return;

    if (!otp || otp.length < 6) {
      setError("Please enter the 6-digit OTP sent to your email");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const resp = await apiService.verifyEmail({
        email: formData.email,
        otp,
      });

      if (resp.success) {
        setSuccess(resp.message || "Email verified successfully.");
        // Persist display name for profile page and redirect
        try {
          localStorage.setItem("displayName", formData.name);
        } catch {
          /* ignore storage write failures */
        }
        setStep("completed");
        
        // Apply referral code if present
        if (referralCode) {
          try {
            // First login the user to get token
            const loginResp = await apiService.login({
              email: formData.email,
              password: formData.password,
              useCookie: true,
            });
            
            if (loginResp.success) {
              // Apply referral code
              const referralResponse = await apiService.applyReferralCode(referralCode, 0);
              if (referralResponse.success) {
                const payload: any = referralResponse.data as any;
                toast.success(`Referral code applied! You saved ₹${payload.discountAmount || 0}`);
              } else {
                toast.warning(`Referral code couldn't be applied: ${referralResponse.error}`);
              }
            }
          } catch (error) {
            console.error("Error applying referral code:", error);
            toast.warning("Referral code couldn't be applied, but you can try again later.");
          }
        }
        
        // Navigate to login so the user can sign in
        setTimeout(() => navigate("/login"), 800);
      } else {
        setError(resp.error || "Invalid or expired OTP.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const resp = await apiService.resendOtp(formData.email);

      if (resp.success) {
        setSuccess(resp.message || "OTP sent successfully. Please check your email.");
      } else {
        setError(resp.error || "Failed to resend OTP.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              to="/login"
              className="font-medium text-[#68C5C0] hover:text-[#5AB5B0] transition-colors"
            >
              sign in to your existing account
            </Link>
          </p>
          
          {/* Referral Code Indicator */}
          {referralCode && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center justify-center">
                <div className="text-sm text-blue-800">
                  🎉 Referral code detected: <span className="font-mono font-bold">{referralCode}</span>
                </div>
              </div>
              <p className="text-xs text-blue-600 text-center mt-1">
                You'll get ₹100 rewards after successful signup!
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
            {success}
          </div>
        )}

        {step === "enterDetails" && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmitDetails}>
            <div className="space-y-4">
              {/* Name Field */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#68C5C0] focus:border-[#68C5C0] focus:z-10 sm:text-sm"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#68C5C0] focus:border-[#68C5C0] focus:z-10 sm:text-sm"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="appearance-none relative block w-full pl-10 pr-10 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#68C5C0] focus:border-[#68C5C0] focus:z-10 sm:text-sm"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="appearance-none relative block w-full pl-10 pr-10 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#68C5C0] focus:border-[#68C5C0] focus:z-10 sm:text-sm"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#68C5C0] hover:bg-[#5AB5B0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#68C5C0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "Creating account..." : "Sign up"}
              </button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                By signing up, you agree to our{" "}
                <a href="#" className="text-[#68C5C0] hover:text-[#5AB5B0]">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-[#68C5C0] hover:text-[#5AB5B0]">
                  Privacy Policy
                </a>
              </p>
            </div>
          </form>
        )}

        {step === "verifyOtp" && (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Enter the OTP sent to {formData.email}
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#68C5C0] focus:border-[#68C5C0] focus:z-10 sm:text-sm"
                placeholder="6-digit OTP"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#68C5C0] hover:bg-[#5AB5B0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#68C5C0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "Verifying..." : "Verify Email"}
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={handleResendOtp}
                className="px-4 py-2 text-sm font-medium text-[#68C5C0] border border-[#68C5C0] rounded-md hover:bg-[#E6F6F5] disabled:opacity-50"
              >
                Resend OTP
              </button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Didn't receive the email? Check your spam folder.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignUpPage;
