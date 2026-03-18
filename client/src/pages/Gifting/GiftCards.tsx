import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import apiService from "@/services/api";
import { paymentService } from "@/services/paymentService";
import { Loader2 } from "lucide-react";
import logo from "/logo.png";

const giftCardImg = "/premium_gift_card.png";

const staticGiftCards = [
  { amount: 2500, title: "Starter Gift Card", badge: "POPULAR" },
  { amount: 5000, title: "Pearl Gift Card", badge: "BEST VALUE" },
  { amount: 7500, title: "Sapphire Gift Card", badge: "PREMIUM" },
  { amount: 10000, title: "Diamond Gift Card", badge: "LUXURY" },
];

const GiftingCards = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const [customAmount, setCustomAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [purchasedCards, setPurchasedCards] = useState<any[]>([]);
  const [isFetchingCards, setIsFetchingCards] = useState<boolean>(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyGiftCards();
    }
  }, [isAuthenticated]);

  const fetchMyGiftCards = async () => {
    setIsFetchingCards(true);
    try {
      const response = await apiService.getMyGiftCards();
      if (response.success && response.data) {
        setPurchasedCards(response.data as any[]);
      }
    } catch (error) {
      console.error("Error fetching gift cards:", error);
    } finally {
      setIsFetchingCards(false);
    }
  };

  const handleBuyNow = async (amount: number, type: "static" | "custom") => {
    if (!isAuthenticated) {
      toast.error("Please login to buy a gift card");
      navigate("/login");
      return;
    }

    if (amount < 2500) {
      toast.error("Amount must be at least ₹2500");
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.createGiftCardOrder(amount, type);

      if (response.success && response.data) {
        const { razorpayOrderId, amount: orderAmount, currency, key } = response.data as any;

        const options = {
          key: key,
          amount: orderAmount,
          currency: currency,
          name: "Kyna Jewels",
          description: `Gift Card Purchase - ₹${amount}`,
          order_id: razorpayOrderId,
          prefill: {
            name: `${user?.firstName} ${user?.lastName}`.trim(),
            email: user?.email || "",
            contact: user?.phone || "",
          },
          theme: {
            color: "#328F94",
          },
          notes: {
            userId: user?.id || "",
            type: type,
            amount: amount.toString(),
          },
          modal: {
            ondismiss: () => {
              setIsLoading(false);
            }
          }
        };

        paymentService.openRazorpayCheckout(
          options as any,
          async (paymentResponse) => {
            try {
              const verifyResponse = await apiService.verifyGiftCardPayment({
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
              });

              if (verifyResponse.success && verifyResponse.data) {
                const voucherCode = (verifyResponse.data as any).voucherCode;
                toast.success(`Success! Voucher Code: ${voucherCode}`);
                fetchMyGiftCards();
                // Reset custom amount
                setCustomAmount("");
              } else {
                toast.error("Payment verification failed. Please contact support.");
              }
            } catch (error) {
              console.error("Verification error:", error);
              toast.error("An error occurred during verification.");
            } finally {
              setIsLoading(false);
            }
          },
          (error: any) => {
            console.error("Payment error:", error);
            toast.error(error.message || "Payment failed");
            setIsLoading(false);
          }
        );
      } else {
        toast.error(response.message || "Failed to create order");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error initiating purchase:", error);
      toast.error("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleCompletePayment = (card: any) => {
    if (!card.razorpayKeyId) {
      toast.error("Configuration error: Razorpay key missing for this card.");
      return;
    }
    setIsLoading(true);
    const options = {
      key: card.razorpayKeyId,
      amount: card.amount * 100, // Razorpay expects paise
      currency: "INR",
      name: "Kyna Jewels",
      description: `Gift Card Purchase - ₹${card.amount}`,
      order_id: card.razorpayOrderId,
      prefill: {
        name: `${user?.firstName} ${user?.lastName}`.trim(),
        email: user?.email || "",
        contact: user?.phone || "",
      },
      theme: { color: "#328F94" },
      handler: async (paymentResponse: any) => {
        try {
          const verifyResponse = await apiService.verifyGiftCardPayment({
            razorpay_order_id: paymentResponse.razorpay_order_id,
            razorpay_payment_id: paymentResponse.razorpay_payment_id,
            razorpay_signature: paymentResponse.razorpay_signature,
          });

          if (verifyResponse.success) {
            toast.success("Payment successful! Gift card activated.");
            fetchMyGiftCards();
          }
        } catch (error) {
          console.error("Verification error:", error);
          toast.error("Verification failed.");
        } finally {
          setIsLoading(false);
        }
      },
      modal: {
        ondismiss: () => setIsLoading(false),
      }
    };

    paymentService.openRazorpayCheckout(
      options as any,
      options.handler,
      (error: any) => {
        toast.error(error.message || "Payment failed");
        setIsLoading(false);
      }
    );
  };

  const handleCustomBuy = () => {
    const amount = parseInt(customAmount);
    if (isNaN(amount)) {
      toast.error("Please enter a valid amount");
      return;
    }
    handleBuyNow(amount, "custom");
  };

  const isCustomAmountValid = () => {
    const amount = parseInt(customAmount);
    return !isNaN(amount) && amount >= 2500;
  };

  return (
    <>
      <SEO
        title="Gift Cards - Premium Jewelry Gifts | Design Your Own Ring"
        description="Celebrate life's precious moments with timeless jewelry gifts. Perfect for any occasion - birthdays, anniversaries, or special celebrations."
        canonical="/gifting"
      />
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="text-sm text-gray-600">
            <Link to="/" className="hover:text-teal-600">
              Home
            </Link>
            <span className="mx-2">-</span>
            <span className="text-gray-800">Gift-Cards</span>
          </nav>
        </div>
      </div>

      <main className="min-h-screen">


        {/* Gift Cards Grid Section */}
        <section id="gift-grid" className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Buy Gift Cards
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {staticGiftCards.map((card, index) => (
                <Card
                  key={index}
                  className="relative overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="absolute top-3 left-3 z-10">
                    <span className="bg-teal-500 text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-tighter">
                      {card.badge}
                    </span>
                  </div>

                  <CardContent className="p-4">
                    <div className="relative aspect-[1.6/1] mb-6 rounded-xl overflow-hidden shadow-md group">
                      <img
                        src={giftCardImg}
                        alt={card.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/5"></div>
                      {/* Shifted right to avoid badge overlap */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center translate-x-4">
                        <span className="text-2xl font-bold text-[#328F94] drop-shadow-sm">
                          ₹{card.amount.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-[#328F94]/70 font-medium">
                          + 3% GST (Total: ₹{(card.amount * 1.03).toLocaleString()})
                        </span>
                      </div>
                    </div>

                    <div className="text-center">
                      <h3 className="font-semibold text-[10px] tracking-wider uppercase mb-4 text-gray-700">
                        {card.title}
                      </h3>

                      <Button
                        onClick={() => handleBuyNow(card.amount, "static")}
                        className="w-full bg-[#68C5C0] hover:bg-[#5bb3ae] text-white font-semibold transition-all duration-300"
                        size="sm"
                        disabled={isLoading}
                      >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : `Buy Now`}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Custom Amount Card - Improved UI */}
              <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <div className="absolute top-3 left-3 z-10">
                  <span className="bg-[#328F94] text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-tighter">
                    CUSTOM
                  </span>
                </div>

                <CardContent className="p-4">
                  <div className="relative aspect-[1.6/1] mb-6 rounded-xl overflow-hidden shadow-md group">
                    <img
                      src={giftCardImg}
                      alt="Custom Gift Card"
                      className="w-full h-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-white/40"></div>

                    {/* Input overlay - Shifted right */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center translate-x-4 pt-4">
                      <span className="text-[10px] text-[#328F94] uppercase font-bold tracking-widest opacity-80 mb-1">Enter Amount</span>
                      <div className="relative w-3/4">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#328F94] font-bold text-xl">₹</span>
                        <Input
                          type="number"
                          placeholder="2500+"
                          className="pl-7 text-center font-bold text-[#328F94] border-none focus-visible:ring-0 bg-transparent text-2xl h-auto py-0"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          min={2500}
                        />
                        <div className="mx-auto w-24 h-0.5 bg-[#328F94]/30 mt-1"></div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-tighter">Min. ₹2500 per card</p>
                    <p className="text-[10px] text-teal-600 font-bold mb-4 uppercase tracking-tighter italic">+ 3% GST Applicable</p>
                    <Button
                      onClick={handleCustomBuy}
                      className={`w-full font-semibold transition-all duration-300 ${isCustomAmountValid() ? 'bg-[#328F94] hover:bg-[#2a7a7e] text-white shadow-md' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                      size="sm"
                      disabled={isLoading || !isCustomAmountValid()}
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Purchase Custom"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* My Gift Cards Section */}
        {isAuthenticated && (
          <section className="py-16 bg-gray-50 border-t">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold mb-8">My Gift Cards</h2>
              {isFetchingCards ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                </div>
              ) : purchasedCards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {purchasedCards.map((card) => (
                    <Card key={card._id} className="overflow-hidden border-teal-100">
                      <div className="bg-teal-500 p-4 text-white flex justify-between items-center opacity-90">
                        <span className="font-bold translate-x-2">₹{card.amount.toLocaleString()}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ${card.status === 'active' ? 'bg-white text-teal-600' : card.status === 'redeemed' ? 'bg-gray-200 text-gray-600' : 'bg-yellow-400 text-yellow-900'}`}>
                          {card.status}
                        </span>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">Voucher Code:</span>
                            <span className="text-sm font-mono font-bold select-all">{card.voucherCode || "PENDING"}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">Points Credited:</span>
                            <span className="text-sm font-bold text-teal-600">{card.points} Points</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">Purchased On:</span>
                            <span className="text-xs">{new Date(card.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {card.status === 'pending' && (
                          <Button
                            onClick={() => handleCompletePayment(card)}
                            className="w-full mt-4 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold"
                            size="sm"
                            disabled={isLoading}
                          >
                            {isLoading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : null}
                            Complete Payment
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border">
                  <p className="text-gray-500">You haven't purchased any gift cards yet.</p>
                </div>
              )}
            </div>
          </section>
        )}
      </main >
    </>
  );
};

export default GiftingCards;
