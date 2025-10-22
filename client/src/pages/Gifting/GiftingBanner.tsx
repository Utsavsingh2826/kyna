import { Link } from "react-router-dom"
import SEO from "../../components/SEO"
import { Button } from "../../components/ui/button"

export default function GiftingBanner() {
  return (
    <div>  <>
      <SEO
        title="Gift Cards - Premium Jewelry Gifts"
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
            <span className="text-gray-800">Gifting</span>
          </nav>
        </div>
      </div>

      <main className="">
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
      </main>
    </></div>
  )
}
