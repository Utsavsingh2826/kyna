import React, { useState, useEffect } from "react";
import { Copy, Users, DollarSign, Gift } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import axios from "axios";
import { toast } from "sonner";

const token = localStorage.getItem("token") || "";

interface ReferralSectionProps {
  isOpen: boolean;
}

interface UserReferralData {
  referralCode: string;
  referralCount: number;
  totalReferralEarnings: number;
  availableOffers: number;
}

interface ReferralSettings {
  referralRewardFriend: number;
  referralRewardReferrer: number;
  promoExpiryDays: number;
}

interface ReferralHistory {
  _id: string;
  referFrdId: string;
  toEmails: string[];
  status: string;
  createdAt: string;
  redeemedBy?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function ReferralSection({ isOpen }: ReferralSectionProps) {
  const [referralForm, setReferralForm] = useState({
    yourEmail: "",
    friendsEmails: "",
    note: "",
    sendReminder: false,
  });
  const [yourEmail, setYourEmail] = useState("");
  const [referralLink, setReferralLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [userReferralData, setUserReferralData] = useState<UserReferralData | null>(null);
  const [referralSettings, setReferralSettings] = useState<ReferralSettings | null>(null);
  const [referralHistory, setReferralHistory] = useState<ReferralHistory[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Fetch user data and referral information
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoadingData(true);
        
        // Get user profile with referral data
        const userResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (userResponse.data.user) {
          const userData = userResponse.data.user;
          setYourEmail(userData.email || "");
          setReferralForm(prev => ({
            ...prev,
            yourEmail: userData.email || "",
          }));
          
          // Set user referral data
          setUserReferralData({
            referralCode: userData.referralCode || "",
            referralCount: userData.referralCount || 0,
            totalReferralEarnings: userData.totalReferralEarnings || 0,
            availableOffers: userData.availableOffers || 0,
          });

          // Generate referral link if user has a referral code
          if (userData.referralCode) {
            const baseUrl = import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173";
            // Redirect to signup page with referral code as parameter
            const shareableLink = `${baseUrl}/signup?referral=${userData.referralCode}`;
            setReferralLink(shareableLink);
          }
        }

        // Get referral settings
        const settingsResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/settings`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (settingsResponse.data.success) {
          setReferralSettings(settingsResponse.data.data);
        }

        // Get user's referral history
        const historyResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/referrals/my-referrals`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (historyResponse.data.success) {
          setReferralHistory(historyResponse.data.data);
        }

      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load referral data");
      } finally {
        setLoadingData(false);
      }
    };

    if (isOpen && token) {
      fetchUserData();
    }
  }, [isOpen, token]);

  const handleReferralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const toEmails = referralForm.friendsEmails
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email.length > 0);

      if (toEmails.length === 0) {
        setMessage("Please enter at least one valid email address");
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/referrals`,
        {
          toEmails,
          note: referralForm.note,
          sendReminder: referralForm.sendReminder,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setMessage(response.data.message || "Referral sent successfully!");
        toast.success("Referral invitations sent!");
        
        setReferralForm({
          yourEmail: yourEmail,
          friendsEmails: "",
          note: "",
          sendReminder: false,
        });

        // Update referral link if new one was generated
        if (response.data.data?.referralCode) {
          const baseUrl = import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173";
          // Redirect to signup page with referral code as parameter
          const shareableLink = `${baseUrl}/signup?referral=${response.data.data.referralCode}`;
          setReferralLink(shareableLink);
        }

        // Refresh referral history
        const historyResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/referrals/my-referrals`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (historyResponse.data.success) {
          setReferralHistory(historyResponse.data.data);
        }
      } else {
        setMessage(response.data.message || "Failed to send referral");
        toast.error(response.data.message || "Failed to send referral");
      }
    } catch (error: unknown) {
      console.error("Error sending referral:", error);

      let errMsg = "Failed to send referral.";
      if (axios.isAxiosError(error)) {
        errMsg = error.response?.data?.message || errMsg;
      }

      setMessage(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Copy the dynamic referral link
  const handleCopyLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      toast.success("Referral link copied to clipboard!");
    } else {
      toast.error("No referral link available");
    }
  };

  // Copy referral code
  const handleCopyCode = () => {
    if (userReferralData?.referralCode) {
      navigator.clipboard.writeText(userReferralData.referralCode);
      toast.success("Referral code copied to clipboard!");
    } else {
      toast.error("No referral code available");
    }
  };

  if (loadingData) {
    return (
      <Collapsible open={isOpen}>
        <CollapsibleContent>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading referral data...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <Collapsible open={isOpen}>
      <CollapsibleContent>
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left side - Form and Stats */}
              <div>
                {/* Referral Statistics */}
                {userReferralData && (
                  <div className="mb-6 grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                      <p className="text-sm text-gray-600">Referrals</p>
                      <p className="text-lg font-semibold text-blue-600">
                        {userReferralData.referralCount}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-600" />
                      <p className="text-sm text-gray-600">Earnings</p>
                      <p className="text-lg font-semibold text-green-600">
                        ₹{userReferralData.totalReferralEarnings}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <Gift className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                      <p className="text-sm text-gray-600">Wallet</p>
                      <p className="text-lg font-semibold text-purple-600">
                        ₹{userReferralData.availableOffers}
                      </p>
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h2
                    className="text-6xl font-light mb-1"
                    style={{ fontFamily: "KoPub Batang" }}
                  >
                    Give ₹{referralSettings?.referralRewardFriend || 10},
                  </h2>
                  <h2
                    className="text-6xl font-light mb-4"
                    style={{ fontFamily: "KoPub Batang" }}
                  >
                    Get ₹{referralSettings?.referralRewardReferrer || 10}
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Treat your friend to ₹{referralSettings?.referralRewardFriend || 10} and get ₹{referralSettings?.referralRewardReferrer || 10} towards a future
                    purchase after their first order of ₹1,000+.
                  </p>
                </div>

                {/* Your Referral Code */}
                {userReferralData?.referralCode && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Your Referral Code</h3>
                    <div className="flex items-center gap-2">
                      <Input
                        value={userReferralData.referralCode}
                        readOnly
                        className="font-mono text-lg"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCopyCode}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Share this code with your friends
                    </p>
                  </div>
                )}

                <form onSubmit={handleReferralSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="yourEmail" className="text-sm font-medium">
                      Your Email
                    </label>
                    <Input
                      id="yourEmail"
                      type="email"
                      placeholder={yourEmail || " "}
                      value={referralForm.yourEmail}
                      onChange={() => toast.info("Email cannot be changed")}
                      className="mt-1"
                      required
                      disabled
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="friendsEmails"
                      className="text-sm font-medium"
                    >
                      To
                    </label>
                    <Input
                      id="friendsEmails"
                      type="text"
                      placeholder="Enter your friends' emails separated by commas"
                      value={referralForm.friendsEmails}
                      onChange={(e) =>
                        setReferralForm((prev) => ({
                          ...prev,
                          friendsEmails: e.target.value,
                        }))
                      }
                      className="mt-1"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="note" className="text-sm font-medium">
                      Note
                    </label>
                    <textarea
                      id="note"
                      placeholder="I thought you'd love Kyna Jewels as much as I do..."
                      value={referralForm.note}
                      onChange={(e) =>
                        setReferralForm((prev) => ({
                          ...prev,
                          note: e.target.value,
                        }))
                      }
                      className="mt-1 min-h-[120px] w-full border border-border rounded-md p-2"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      id="sendReminder"
                      type="checkbox"
                      checked={referralForm.sendReminder}
                      onChange={(e) =>
                        setReferralForm((prev) => ({
                          ...prev,
                          sendReminder: e.target.checked,
                        }))
                      }
                      className="h-4 w-4"
                    />
                    <label htmlFor="sendReminder" className="text-sm">
                      Send my friends a reminder email in 3 days
                    </label>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button type="submit" className="flex-1" disabled={loading}>
                      {loading ? "Sending..." : "Send"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={handleCopyLink}
                      disabled={!referralLink}
                    >
                      <Copy className="h-4 w-4" />
                      Copy Link
                    </Button>
                  </div>

                  {message && (
                    <p className={`text-sm mt-2 ${message.includes('success') ? 'text-green-600' : 'text-red-500'}`}>
                      {message}
                    </p>
                  )}
                </form>

                {/* Recent Referrals */}
                {referralHistory.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Recent Referrals</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {referralHistory.slice(0, 5).map((referral) => (
                        <div key={referral._id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium">
                                {referral.toEmails.join(", ")}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(referral.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              referral.status === 'accepted' 
                                ? 'bg-green-100 text-green-800' 
                                : referral.status === 'expired'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {referral.status}
                            </span>
                          </div>
                          {referral.redeemedBy && (
                            <p className="text-xs text-green-600 mt-1">
                              Redeemed by: {referral.redeemedBy.firstName} {referral.redeemedBy.lastName}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right side - Image */}
              <div className="flex items-center justify-center">
                <div className="rounded-lg overflow-hidden h-full w-full flex items-center justify-center bg-muted">
                  <img
                    src="/engravings/image.png"
                    alt="Referral promotion"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}
