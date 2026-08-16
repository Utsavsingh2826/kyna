import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import vid1 from "/heropage/Bracelet.mov";
import vid2 from "/heropage/Ring-and-Braclelet.mov";
import vid3 from "/heropage/ring.mp4";
import vid4 from "/heropage/newring.mp4";

const HeroSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const slides = [
    {
      video: vid2,
      title: "LOVE IN EVERY MILESTONE",
      subtitle: "Handcrafted engagement rings & bracelets for life's greatest moments",
      primaryCta: { label: "Shop Engagement Rings", link: "/rings?ring_category=Engagement+Rings" },
      secondaryCta: { label: "Shop Bracelets", link: "/bracelets" },
    },
    {
      video: vid3,
      title: "SOLITAIRES THAT LAST FOREVER",
      subtitle: "Timeless solitaire diamonds — crafted to perfection, worn for a lifetime",
      primaryCta: { label: "Shop Solitaire Rings", link: "/rings?ring_category=Solitaire+Rings" },
      secondaryCta: { label: "View All Rings", link: "/rings" },
    },
    {
      video: vid4,
      title: "CRAFTED TO BE REMEMBERED",
      subtitle: "Every piece tells your story — explore our finest collections",
      primaryCta: { label: "Shop All Rings", link: "/rings" },
      secondaryCta: { label: "Design Your Own", link: "/upload-your-design/rings" },
    },
    {
      video: vid1,
      title: "ELEGANCE ON YOUR WRIST",
      subtitle: "Discover our exquisite bracelet collection — where craft meets elegance",
      primaryCta: { label: "Shop Bracelets", link: "/bracelets" },
      secondaryCta: { label: "Shop Men's Rings", link: "/rings?ring_category=Mens+Rings" },
    },
  ];

  const goToSlide = (index: number) => {
    if (index === currentSlide || isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 700);
  };

  const prevSlide = () => goToSlide((currentSlide - 1 + slides.length) % slides.length);

  // Auto-advance uses functional update so the interval never resets — steady 5s rhythm
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentSlide((prev) => (prev + 1) % slides.length);
      setTimeout(() => setIsTransitioning(false), 700);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative">
      <div className="relative h-[80vh] md:h-[88vh] lg:h-screen overflow-hidden">

        {/* Videos with crossfade */}
        <div className="absolute inset-0">
          {slides.map((slide, index) => (
            <video
              key={index}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                currentSlide === index ? "opacity-100" : "opacity-0"
              }`}
              src={slide.video}
              autoPlay
              loop
              muted
              playsInline
              preload={currentSlide === index ? "auto" : "none"}
            />
          ))}
        </div>

        {/* Cinematic gradient — heavy at top and bottom, light in middle */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/65 z-10 pointer-events-none" />
        {/* Left vignette for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-transparent z-10 pointer-events-none" />

        {/* Navigation Arrows — bare, no pill background */}
        <button
          onClick={prevSlide}
          className="absolute left-5 md:left-7 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors duration-300 z-20 p-2"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-7 h-7 md:w-8 md:h-8" strokeWidth={1.5} />
        </button>
        <button
          onClick={() => goToSlide((currentSlide + 1) % slides.length)}
          className="absolute right-5 md:right-7 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors duration-300 z-20 p-2"
          aria-label="Next slide"
        >
          <ChevronRight className="w-7 h-7 md:w-8 md:h-8" strokeWidth={1.5} />
        </button>

        {/* Hero Content — bottom-left cinematic positioning */}
        <div className="absolute bottom-0 left-0 right-0 z-20 pb-16 md:pb-20 px-8 md:px-14">

          {/* Slide counter */}
          <p className="text-white/45 text-[11px] tracking-[0.35em] uppercase mb-4 font-light">
            {String(currentSlide + 1).padStart(2, "0")}&nbsp;&nbsp;/&nbsp;&nbsp;{String(slides.length).padStart(2, "0")}
          </p>

          {/* Animated title — key forces remount per slide → CSS animation re-fires */}
          <h1
            key={`title-${currentSlide}`}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-white tracking-widest mb-4 leading-tight max-w-2xl hero-text-in"
          >
            {slides[currentSlide].title}
          </h1>

          <p
            key={`sub-${currentSlide}`}
            className="text-sm md:text-base text-white/70 font-light tracking-wide mb-8 max-w-lg hero-text-in"
            style={{ animationDelay: "80ms" }}
          >
            {slides[currentSlide].subtitle}
          </p>

          <div
            key={`cta-${currentSlide}`}
            className="flex flex-col sm:flex-row gap-3 hero-text-in"
            style={{ animationDelay: "160ms" }}
          >
            <Link
              to={slides[currentSlide].primaryCta.link}
              className="bg-white text-gray-900 px-7 py-3 text-xs font-medium tracking-[0.15em] uppercase hover:bg-[#68C5C0] hover:text-white transition-colors duration-300 shadow-lg w-fit"
            >
              {slides[currentSlide].primaryCta.label}
            </Link>
            <Link
              to={slides[currentSlide].secondaryCta.link}
              className="border border-white/70 text-white px-7 py-3 text-xs font-medium tracking-[0.15em] uppercase hover:bg-white hover:text-gray-900 transition-colors duration-300 w-fit"
            >
              {slides[currentSlide].secondaryCta.label}
            </Link>
          </div>

          {/* Thin line indicators */}
          <div className="flex items-center gap-2 mt-10">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className="relative h-[2px] flex-shrink-0 overflow-hidden transition-all duration-500"
                style={{ width: currentSlide === index ? "40px" : "20px" }}
              >
                <span className="absolute inset-0 bg-white/30" />
                <span
                  className={`absolute inset-0 bg-white origin-left transition-transform duration-500 ${
                    currentSlide === index ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes heroTextIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-text-in {
          animation: heroTextIn 0.65s ease-out both;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
