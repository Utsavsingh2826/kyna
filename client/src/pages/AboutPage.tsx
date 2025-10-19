import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import logo from "/logo.png";
import { Link } from "react-router-dom";

const benefits = [
  {
    title: "Free Shipping Both",
    subtitle: "Ways",
  },
  {
    title: "Free 30-Day Returns",
    subtitle: "& Exchanges",
  },
  {
    title: "24/7 Customer",
    subtitle: "Support",
  },
  {
    title: "Free 60-Day",
    subtitle: "Resizes",
  },
  {
    title: "Free Diamond",
    subtitle: "Upgrades",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b text-[#1A141F] from-purple-50 to-white">
      {/* Hero Section */}

      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="text-sm text-gray-600">
            <Link to="/" className="hover:text-teal-600">
              Home
            </Link>
            <span className="mx-2">-</span>
            <span className="text-gray-800">About Us</span>
          </nav>
        </div>
      </div>
      <div
        className="relative h-[70vh] flex items-center justify-center text-center text-white"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(/about/about.jpg)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="z-10"
        >
          <motion.h1
            className="text-4xl md:text-5xl  mb-6"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            Jewellery That Celebrates You
          </motion.h1>
          <motion.p
            className="text-lg md:text-2xl max-w-3xl mx-auto px-4 italic font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            "At Kyna, every piece tells a story — your story. We craft timeless
            jewellery to honour your meaningful moments, guided by Kyna Mentors
            and celebrated by our passionate Ambassadors. Wear your memories,
            your milestones, and your love."
          </motion.p>
        </motion.div>
      </div>
      <div className="bg-[#328F94] h-24 flex justify-center items-center">
        <div className="relative">
          <p className="font-bold text-white text-2xl capitalize text-center">
            Our Story
          </p>
          {/* Custom underline */}
          <span className="absolute left-1/2 transform -translate-x-1/2 bottom-[-1] w-36 h-1 bg-[#68C5C0]"></span>
        </div>
      </div>
      {/* section 1 */}
      <div className="py-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-top">
            {/* Text Content */}
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight">
                Celebrating Meaningful Moments
              </h2>
              <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
                At Kyna, we create jewellery that celebrates life's meaningful
                moments, connecting deeply with your emotions and milestones.
              </p>
            </div>

            {/* Image + Quote */}
            <div className="flex flex-col items-center">
              {/* Replace with your uploaded image */}
              <img
                src="/about/1.jpg"
                alt="Jewellery Moment"
                className="rounded-3xl w-full max-w-md object-cover mb-6"
              />
              {/* Quote below image */}
              <p className="text-center text-muted-foreground text-lg md:text-xl italic mb-2">
                “We started Kyna to redefine jewelry by blending timeless
                craftsmanship with modern elegance, creating pieces that
                celebrate individuality and tell unique stories.”
              </p>
              <p className="text-center text-muted-foreground text-sm">
                — Example, CEO & Co-Founder
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#328F94] flex justify-center">
        <div className="">
          <img src={logo} className="h-40" alt="Company Logo" />
        </div>
      </div>
      <section className="bg-background">
        {/* Timeless Pieces Section */}
        <div className="pt-20 px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Text Content */}
              <div className="space-y-8">
                <h2 className="text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight">
                  Personalized Guidance with Kyna Mentors{" "}
                </h2>
                <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
                  To enrich your journey, we introduce Kyna Mentors who provide
                  personalized guidance, helping you select pieces that resonate
                  with your personal story.
                </p>
              </div>

              {/* Image + Quote */}
              <div className="flex flex-col items-center">
                {/* Replace with your uploaded image */}
                <img
                  src="/about/2.jpg"
                  alt="Jewellery Moment"
                  className="rounded-3xl w-full max-w-3xl object-cover mb-6"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="py-20 top-0 px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Image + Quote */}
              <div className="flex flex-col items-center">
                {/* Replace with your uploaded image */}
                <img
                  src="/about/3.png"
                  alt="Jewellery Moment"
                  className="rounded-3xl w-full max-w-3xl object-cover mb-6"
                />
              </div>
              {/* Text Content */}
              <div className="space-y-8">
                <h2 className="text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight">
                  Community Engagement with Kyna Ambassadors
                </h2>
                <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
                  Kyna Ambassadors, passionate advocates of our brand's values,
                  share their stories and connect with our community to foster
                  deeper engagement.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className=" px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Text Content */}
              <div className="space-y-8">
                <h2 className="text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight">
                  Timeless Pieces for Your Cherished Memories{" "}
                </h2>
                <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
                  At Kyna, we craft timeless pieces that hold the heart of every
                  story, connection, and milestone. We invite you to wear your
                  love, your memories, and the moments that matter most, with
                  guidance from our mentors and ambassadors enriching your
                  journey with us.
                </p>
              </div>

              {/* Image + Quote */}
              <div className="flex flex-col items-center">
                {/* Replace with your uploaded image */}
                <img
                  src="/about/4.jpg"
                  alt="Jewellery Moment"
                  className="rounded-3xl w-full max-w-3xl object-cover mb-6"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="py-20 top-0 px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Image + Quote */}
              <div className="flex flex-col items-center">
                {/* Replace with your uploaded image */}
                <img
                  src="/about/5.jpg"
                  alt="Jewellery Moment"
                  className="rounded-3xl w-full max-w-3xl object-cover mb-6"
                />
              </div>
              <div className="space-y-8 lg:order-2">
                <h2 className="text-4xl text-[#1A141F] md:text-5xl font-semibold ">
                  WE'RE HERE FOR YOU
                </h2>

                <div className="space-y-6">
                  <h3 className="text-2xl text-foreground">
                    Virtual Appointment
                  </h3>
                  <p className="text-[#1A1A1A99] text-lg leading-relaxed">
                    Appointments are relaxed, joyful, and tailored to you.
                    Whether it's a milestone moment or an everyday luxury, we're
                    here to help you start your stack, find your fit, and design
                    the perfect piece.
                  </p>

                  <hr className="border-gray-300 my-4" />

                  <p className="text-[#1A1A1A99] font-medium">
                    From the comfort of your own home
                  </p>
                </div>

                <Button className="bg-[#328F94] text-white hover:text-[#328F94] hover:bg-white hover:border-[#328F94] hover:border-2 w-64">
                  Book Appointment
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#328F94] py-16 px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-white">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 text-center">
              {benefits.map((benefit, index) => (
                <div key={index} className="space-y-4 group">
                  <div className="text-cta-foreground">
                    <h3 className="font-bold text-base md:text-lg leading-tight">
                      {benefit.title}
                    </h3>

                    {/* Subtitle with custom underline */}
                    <div className="relative inline-block">
                      <p className="font-bold text-base md:text-lg leading-tight">
                        {benefit.subtitle}
                      </p>
                      <span className="absolute left-1/2 transform -translate-x-1/2 bottom-[-1] w-28 h-1 bg-[#68C5C0] rounded-full"></span>
                    </div>
                  </div>

                  <button className="text-cta-foreground/80 hover:text-cta-foreground underline text-sm transition-colors group-hover:scale-105 transform duration-200">
                    Learn More
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
