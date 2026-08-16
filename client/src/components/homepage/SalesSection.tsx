import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const SaleSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: "/marketing/menstud.png",
      title: "Diamonds That Define You",
      subtitle: "Discover our handpicked diamond earring collection — each piece a story of brilliance",
      cta: { label: "Explore Earrings", link: "/earrings" },
    },
    {
      image: "/marketing/bracelelt.png",
      title: "Rings for Every Chapter",
      subtitle: "From engagement to everyday elegance — find the ring that speaks your heart",
      cta: { label: "Shop Rings", link: "/rings" },
    },
    {
      image: "/marketing/earring.jpeg",
      title: "Crafted for the Ones You Love",
      subtitle: "Timeless jewellery gifted with intention — explore our finest collections",
      cta: { label: "Shop All Jewellery", link: "/earrings" },
    },
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-8 sm:py-12 bg-white">
      <div className="relative overflow-hidden group rounded-lg shadow-lg mx-4 md:mx-8 lg:mx-16 h-[300px] sm:h-[350px] md:h-[420px] lg:h-[465px]">

        {/* Images with real crossfade — same pattern as hero videos */}
        <div className="absolute inset-0">
          {slides.map((slide, index) => (
            <img
              key={index}
              src={slide.image}
              alt={slide.title}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                currentSlide === index ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors duration-300 opacity-0 group-hover:opacity-100 z-20 p-2"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-7 h-7" strokeWidth={1.5} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors duration-300 opacity-0 group-hover:opacity-100 z-20 p-2"
          aria-label="Next slide"
        >
          <ChevronRight className="w-7 h-7" strokeWidth={1.5} />
        </button>

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent z-10 pointer-events-none" />

        {/* Content */}
        <div className="container mx-auto px-8 md:px-12 relative z-20 h-full">
          <div className="flex flex-col justify-center h-full max-w-lg">

            {/* Limited time badge */}
            <span className="inline-block mb-4 px-3 py-1 bg-white/15 border border-white/40 text-white text-xs tracking-widest uppercase backdrop-blur-sm w-fit">
              ✦ Limited Time Offer ✦
            </span>

            <h3 className="text-2xl md:text-3xl font-light text-white mb-2 leading-snug">
              {slides[currentSlide].title}
            </h3>
            <p className="text-sm text-white/80 mb-6 font-light">
              {slides[currentSlide].subtitle}
            </p>

            <Link
              to={slides[currentSlide].cta.link}
              className="inline-block w-fit bg-white text-gray-800 px-8 py-3 text-sm font-medium tracking-wide hover:bg-[#68C5C0] hover:text-white transition-colors duration-200 shadow-lg"
            >
              {slides[currentSlide].cta.label} →
            </Link>
          </div>
        </div>

        {/* Thin line slide indicators */}
        <div className="absolute bottom-5 left-8 md:left-12 flex items-center gap-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className="relative h-[2px] flex-shrink-0 overflow-hidden transition-all duration-500"
              style={{ width: currentSlide === index ? "40px" : "20px" }}
            >
              <span className="absolute inset-0 bg-white/35" />
              <span
                className={`absolute inset-0 bg-white origin-left transition-transform duration-500 ${
                  currentSlide === index ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SaleSection;
