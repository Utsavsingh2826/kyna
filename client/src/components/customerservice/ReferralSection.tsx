import React, { useState, useEffect } from "react";
import { Copy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import axios from "axios";

const token = localStorage.getItem("token") || "";

interface ReferralSectionProps {
  isOpen: boolean;
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

  useEffect(() => {
    // Get user data from localStorage
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setYourEmail(userData.email || "");
        // Pre-fill the form with user's email
        setReferralForm((prev) => ({
          ...prev,
          yourEmail: userData.email || "",
        }));
      }
    } catch (error) {
      console.error("Error getting user data:", error);
    }
  }, []);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleReferralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const toEmails = referralForm.friendsEmails
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email.length > 0);

      const response = await axios.post(
        "https://api.kynajewels.com/api/referrals",
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

      setMessage(response.data.message || "Referral sent successfully!");
      setReferralForm({
        yourEmail: yourEmail,
        friendsEmails: "",
        note: "",
        sendReminder: false,
      });

      // Set the referral link dynamically
      const baseUrl = "http://localhost:5173";
      const shareableLink = `${baseUrl}/referral/${response.data.data?.referralCode}`;
      setReferralLink(shareableLink);
    } catch (error: unknown) {
      console.error("Error sending referral:", error);

      let errMsg = "Failed to send referral.";

      // Check if error is an AxiosError
      if (axios.isAxiosError(error)) {
        errMsg = error.response?.data?.message || errMsg;
      }

      setMessage(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Copy the dynamic referral link
  const handleCopyLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      alert("Referral link copied!");
    }
  };

  return (
    <Collapsible open={isOpen}>
      <CollapsibleContent>
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left side - Form */}
              <div>
                <div className="mb-6">
                  <h2
                    className="text-6xl font-light mb-1"
                    style={{ fontFamily: "KoPub Batang" }}
                  >
                    Give ₹100,
                  </h2>
                  <h2
                    className="text-6xl font-light mb-4"
                    style={{ fontFamily: "KoPub Batang" }}
                  >
                    Get ₹100
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Treat your friend to ₹100 and get ₹100 towards a future
                    purchase after their first order of ₹1,000+.
                  </p>
                </div>

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
                      onChange={() => alert("Email cannot be changed")}
                      className="mt-1"
                      required
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
                      placeholder="I thought you'd love Brilliant Earth as much as I do..."
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
                    >
                      <Copy className="h-4 w-4" />
                      Copy
                    </Button>
                  </div>

                  {message && (
                    <p className="text-sm text-red-500 mt-2">{message}</p>
                  )}

                  <div className="text-center mt-2">
                    <p className="text-sm text-muted-foreground">
                      Code: <span className="font-mono">123456785785676</span>
                    </p>
                  </div>
                </form>
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
