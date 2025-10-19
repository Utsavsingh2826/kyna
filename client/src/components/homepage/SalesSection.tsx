import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import banner from "/image.png";

const SaleSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 40,
    seconds: 5,
  });

  const slides = [
    {
      image: banner,
      title: "Sparkle Like Never Before! Limited-Time Diamond Offer",
      subtitle: "Your Moment of Elegance Awaits",
      discount: "20%",
    },
    {
      image:
        "https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=1600&h=500&dpr=1",
      title: "Sparkle Like Never Before! Limited-Time Diamond Offer",
      subtitle: "Your Moment of Elegance Awaits",
      discount: "20%",
    },
    {
      image:
        "https://images.pexels.com/photos/164821/pexels-photo-164821.jpeg?auto=compress&cs=tinysrgb&w=1600&h=500&dpr=1",
      title: "Exclusive Ring Collection Sale",
      subtitle: "Timeless Beauty at Unbeatable Prices",
      discount: "25%",
    },
    {
      image:
        "https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=1600&h=500&dpr=1",
      title: "Premium Jewelry Flash Sale",
      subtitle: "Luxury Craftsmanship for Less",
      discount: "30%",
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (time: number) => time.toString().padStart(2, "0");

  return (
    <section className="py-8 sm:py-12 px-4 md:px-8 lg:px-16 bg-white">
      <div
        className="relative overflow-hidden group rounded-lg shadow-lg"
        style={{ height: "465px" }}
      >
        {/* Background Image Slider */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out"
          style={{
            backgroundImage: `url(${slides[currentSlide].image})`,
          }}
        >
          <div className=""></div>
        </div>

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

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10 h-full">
          <div className="flex flex-col lg:flex-row items-center justify-between h-full">
            <div className="lg:w-1/2 mb-8 lg:mb-0 text-white">
              <h3 className="text-2xl md:text-4xl font-light mb-4">
                {slides[currentSlide].title}
              </h3>
              <button className="border border-white bg-transparent text-white px-8 py-3 hover:bg-white hover:text-blue-900 transition-all duration-300 mb-4 rounded">
                Buy Now
              </button>
              <p className="text-sm opacity-90 mb-4">
                {slides[currentSlide].subtitle}
              </p>
              <div className="bg-black bg-opacity-30 inline-block px-4 py-2 rounded">
                <p className="text-lg font-semibold">
                  Only{" "}
                  <span className="text-yellow-400">
                    {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:
                    {formatTime(timeLeft.seconds)}
                  </span>{" "}
                  Left
                </p>
              </div>
            </div>
            <div className="lg:w-1/2 flex justify-center lg:justify-end relative">
              <div className="relative">
                <div className="absolute -top-4 -right-4 bg-white text-orange-600 rounded-full w-20 h-20 flex flex-col items-center justify-center shadow-lg z-10">
                  <span className="text-xs font-bold">SALE</span>
                  <span className="text-lg font-bold">
                    {slides[currentSlide].discount}
                  </span>
                  <span className="text-xs">OFF</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3">
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
      </div>
    </section>
  );
};

export default SaleSection;
