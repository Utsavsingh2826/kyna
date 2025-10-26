import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import vid1 from "/heropage/Bracelet.mov";
import vid2 from "/heropage/Ring-and-Braclelet.mov";

const HeroSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      video: vid1,
      title: "Cultivate With Love",
      subtitle: "Discover our exquisite collection of handcrafted jewelry",
    },
    {
      video: vid2,
      title: "Cultivate With Love",
      subtitle: "Discover our exquisite collection of handcrafted jewelry",
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative">
      <div className="relative h-[70vh] md:h-[80vh] lg:h-[85vh] overflow-hidden group">
        {/* Hero video */}
        <video
          className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out"
          src={slides[currentSlide].video}
          autoPlay
          loop
          muted
          playsInline
        />

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 z-20"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 z-20"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-light mb-12 tracking-wide animate-fade-in">
              {slides[currentSlide].title}
            </h2>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-white text-gray-800 px-8 py-3 text-sm font-medium hover:bg-gray-100 transition-colors shadow-lg min-w-[200px] hover:scale-105 transform duration-200">
                Shop All Engagement Rings
              </button>
              <button className="bg-white text-gray-800 px-8 py-3 text-sm font-medium hover:bg-gray-100 transition-colors shadow-lg min-w-[200px] hover:scale-105 transform duration-200">
                Shop All Jewellery
              </button>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                currentSlide === index ? "bg-white" : "bg-white bg-opacity-50"
              }`}
              onClick={() => setCurrentSlide(index)}
            ></button>
          ))}
        </div>

        {/* Scroll Down */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white text-center">
          <p className="text-sm mb-2 tracking-wide">Scroll Down</p>
          <ChevronDown className="w-5 h-5 mx-auto animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
