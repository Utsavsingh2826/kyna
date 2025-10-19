import { useState } from "react";
import { useParams } from "react-router-dom";
import { StickyTwoColumnLayout } from "@/components/StickyTwoColumnLayout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import axios from "axios";
import { toast } from "sonner";
import { Gift, Sparkles, Heart, Crown } from "lucide-react";
import referralJewelry from "/engravings/image.png";

const Referral = () => {
  const { referralId } = useParams();
  const [referralCode, setReferralCode] = useState(referralId || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showAnimation, setShowAnimation] = useState(false);
  const token = localStorage.getItem("token") || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!referralCode.trim()) {
      toast.error("Please enter a referral code.");
      return;
    }

    setLoading(true);
    setMessage("");
    // ✅ Trigger celebration animation
    setShowAnimation(true);
    setTimeout(() => setShowAnimation(false), 3000);

    setReferralCode("");

    try {
      const response = await axios.post(
        "https://api.kynajewels.com/api/referrals/promos/redeem",
        { referFrdId: referralCode },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const successMsg =
        response.data.message ||
        "Referral code redeemed successfully! Your reward will be processed shortly.";

      toast.success(successMsg);
      setMessage(successMsg);

      // ✅ Trigger celebration animation
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 3000);

      setReferralCode("");
    } catch (error: unknown) {
      console.error("Error redeeming referral:", error);

      let errMsg = "Failed to redeem referral code.";
      if (axios.isAxiosError(error)) {
        errMsg = error.response?.data?.message || errMsg;
      }

      toast.error(errMsg);
      setMessage(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const leftColumn = (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Redeem Referral
        </h1>
        <p className="text-lg text-muted-foreground">
          Got a referral code from a friend? Redeem it here to unlock exclusive
          rewards and special offers on our premium jewelry collection.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enter Your Referral Code</CardTitle>
          <CardDescription>
            Redeem your referral code to receive special discounts and rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="referralCode">Referral Code *</Label>
              <Input
                id="referralCode"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="Enter referral code"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Redeeming..." : "Redeem Referral"}
            </Button>

            {message && (
              <p className="text-sm text-center mt-2 text-red-500">{message}</p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );

  const rightColumn = (
    <div className="flex items-center justify-center">
      <img
        src={referralJewelry}
        alt="Referral Rewards - Exclusive Jewelry Collection"
        className="w-full h-auto rounded-lg shadow-lg"
      />
    </div>
  );

  return (
    <>
      <SEO
        title="Redeem Referral Code | Exclusive Jewelry Rewards"
        description="Redeem your referral code to unlock exclusive discounts and rewards on premium jewelry. Get 15% off your first purchase and access to limited collections."
      />
      <div className="min-h-screen bg-background relative overflow-hidden">
        <main className="container max-w-4xl mx-auto px-4 py-16">
          <StickyTwoColumnLayout
            leftColumn={leftColumn}
            rightColumn={rightColumn}
            gap="gap-12"
          />
        </main>

        {/* 🎉 Celebration Animation */}
        {showAnimation && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              >
                {i % 4 === 0 && (
                  <Gift className="h-8 w-8 text-primary animate-pulse" />
                )}
                {i % 4 === 1 && (
                  <Sparkles className="h-6 w-6 text-yellow-500 animate-spin" />
                )}
                {i % 4 === 2 && (
                  <Heart className="h-7 w-7 text-red-500 animate-ping" />
                )}
                {i % 4 === 3 && (
                  <Crown className="h-8 w-8 text-amber-500 animate-bounce" />
                )}
              </div>
            ))}

            {/* Confetti */}
            {[...Array(30)].map((_, i) => (
              <div
                key={`confetti-${i}`}
                className="absolute w-2 h-2 rounded-full animate-fade-in"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  backgroundColor: [
                    "hsl(var(--primary))",
                    "hsl(var(--secondary))",
                    "hsl(var(--accent))",
                    "#fbbf24",
                    "#f87171",
                    "#a78bfa",
                  ][Math.floor(Math.random() * 6)],
                  animationDelay: `${Math.random() * 1.5}s`,
                  animationDuration: `${1.5 + Math.random() * 1}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Referral;
