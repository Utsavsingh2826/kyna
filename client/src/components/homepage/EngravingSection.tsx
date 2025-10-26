import React from "react";
import { Link } from "react-router-dom";

const EngravingSection: React.FC = () => {
  return (
    <section className="relative py-16 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/ring.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      </div>

      {/* Content Container */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex justify-end items-end min-h-[400px]">
          {/* White Content Box */}
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full md:w-1/3 relative z-20">
            <h3 className="text-2xl md:text-3xl font-light mb-6 text-gray-800">
              Engraving
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Engravable jewellery is a special gift idea for people who are
              close to each other. That is why you can have our jewellery
              personalised with an engraving, as our gift to you. Start
              engraving and explore the full range of our creations with
              engraving options here.
            </p>
            <Link to="/engrave-your-ring">
              <button className="border-2 border-[#68C5C0] text-[#68C5C0] px-8 py-3 rounded hover:bg-[#68C5C0] hover:text-white transition-all duration-300 font-medium">
                Start Engraving
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EngravingSection;
