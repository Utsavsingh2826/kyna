import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const giftCards = [
  {
    id: 1,
    title: "Special & Shine Gift Card",
    originalPrice: "Rs. 6,000/-",
    salePrice: "Rs. 4,900/-",
    badge: "BEST DEAL",
  },
  {
    id: 2,
    title: "Golden Moments Voucher",
    originalPrice: "Rs. 3,000/-",
    salePrice: "Rs. 1,700/-",
    badge: "TOP PICK",
  },
  {
    id: 3,
    title: "Timeless Elegance Card",
    originalPrice: "Rs. 5,000/-",
    salePrice: "Rs. 4,600/-",
    badge: "LIMITED",
  },
  {
    id: 4,
    title: "Diamond Delight Gift Card",
    originalPrice: "Rs. 10,000/-",
    salePrice: "Rs. 8,500/-",
    badge: "PREMIUM",
  },
  {
    id: 5,
    title: "Timeless Elegance Card",
    originalPrice: "Rs. 15,000/-",
    salePrice: "Rs. 13,500/-",
    badge: "LUXURY",
  },
];

const Gifting = () => {
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
            <span className="text-gray-800">User Account</span>
          </nav>
        </div>
      </div>

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-amber-800 via-amber-700 to-amber-900 text-white">
          <div className="absolute inset-0 bg-black/30"></div>
          <section
            className="relative min-h-[350px] flex items-center bg-cover bg-center"
            style={{
              backgroundImage: "url('/gifting/banner.png')", // Replace with your actual image path
            }}
          >
            {/* Overlay for dark effect */}
            <div className="absolute inset-0 bg-black/30"></div>
            <div className="relative container mx-auto px-4 py-24 flex justify-end">
              <div className="max-w-xl text-left">
                <h1 className="text-5xl font-bold mb-6 text-white">
                  Gift Cards
                </h1>
                <p className="text-lg leading-relaxed mb-8 text-white/90">
                  Celebrating life's precious moments with timeless jewelry
                  gifts that speak from the heart. From dazzling necklaces to
                  elegant earrings, find the perfect piece to make every
                  occasion unforgettable.
                </p>
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 bg-white text-[#328F94] font-semibold px-8"
                >
                  Get a Gift Card Now
                </Button>
              </div>
            </div>
          </section>
        </section>

        {/* Gift Cards Grid Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Buy Gift Cards
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {giftCards.map((card) => (
                <Card
                  key={card.id}
                  className="relative overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="bg-teal-500 text-white text-xs font-semibold px-2 py-1 rounded">
                      {card.badge}
                    </span>
                  </div>

                  <CardContent className="p-6">
                    {/* Gift card visual */}
                    <img src="/gifting/card.png" alt="" />
                    {/* Card details */}
                    <div className="text-center">
                      <h3 className="font-semibold text-sm mb-2 text-foreground">
                        {card.title}
                      </h3>

                      <div className="flex items-center justify-center gap-2 mb-4">
                        <span className="text-muted-foreground line-through text-sm">
                          {card.originalPrice}
                        </span>
                        <span className="font-bold text-lg text-primary">
                          {card.salePrice}
                        </span>
                      </div>

                      <Button
                        className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium"
                        size="sm"
                      >
                        Buy Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Gifting;
