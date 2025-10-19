import React from "react";
import { Ruler, Grid3X3, Radius } from "lucide-react";
import { Link } from "react-router-dom";

const RingSizeGuidePage: React.FC = () => {
  return (
    <>
      <div className="flex justify-center min-h-screen bg-gray-50 py-8">
        <div className="container ">
          {/* Breadcrumb */}
          <div className="bg-white">
            <div className="container mx-auto px-4 py-3">
              <nav className="text-sm text-gray-600">
                <Link to="/" className="hover:text-teal-600">
                  Home
                </Link>
                <span className="mx-2">-</span>
                <span className="text-gray-800">Ring Size and Guide</span>
              </nav>
            </div>
          </div>

          {/* Main Title Section */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8 text-center">
            <h1 className="text-4xl font-bold mb-4 text-gray-800">
              Find Your Perfect Ring Size
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Professional guide to measure your ring size accurately.
            </p>
          </div>

          {/* Three Methods Section */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {/* Method 1: Measure with String */}
              <div className="text-center">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Ruler className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-medium mb-4 text-gray-800">
                  Measure with a String
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Wrap a string around your finger and measure the length where
                  it overlaps.
                </p>
              </div>

              {/* Method 2: Ring Sizer Tool */}
              <div className="text-center">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Radius className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-medium mb-4 text-gray-800">
                  Ring Sizer Tool
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Use a specialized ring sizer tool for the most accurate
                  measurement.
                </p>
              </div>

              {/* Method 3: Compare with Existing Ring */}
              <div className="text-center">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Grid3X3 className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-medium mb-4 text-gray-800">
                  Compare with Existing Ring
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Match the size with a ring that fits you perfectly.
                </p>
              </div>
            </div>

            {/* Inner Diameter Measurement Section */}
            <div className="bg-gray-50 rounded-lg p-8 mb-8">
              <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
                <div className="text-center">
                  <h3 className="text-2xl font-medium mb-4 text-gray-800">
                    Inner diameter measurement
                  </h3>
                  <p className="text-xl text-gray-700 mb-6">2 cm = 20mm</p>
                </div>
                <img src="/Education/ring.png" alt="" />
              </div>
            </div>
          </div>
          {/* Ring Size Chart */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
              Indian Ring Size Chart
            </h2>
            <div className="grid grid-cols-2 gap-4 max-w-5xl mx-auto">
              <div>
                <h3 className="bg-[#67C3BE] h-10 flex items-center justify-center text-white font-medium mb-4 text-center">
                  Diameter (mm)
                </h3>
                <div className="space-y-2">
                  {[
                    "16.3 mm",
                    "16.5 mm",
                    "16.9 mm",
                    "17.3 mm",
                    "17.5 mm",
                    "17.9 mm",
                    "18.1 mm",
                    "18.5 mm",
                    "18.7 mm",
                    "19.2 mm",
                    "19.4 mm",
                    "19.8 mm",
                    "20.0 mm",
                    "20.4 mm",
                    "20.6 mm",
                  ].map((size, index) => (
                    <div
                      key={size}
                      className={`p-3 rounded text-center ${
                        index % 2 === 0 ? "bg-white" : "bg-[#EEFCFB]"
                      }`}
                    >
                      {size}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium bg-[#67C3BE] h-10 flex items-center justify-center text-white mb-4 text-center">
                  India Standard Size
                </h3>
                <div className="space-y-2">
                  {[
                    "11 (16.3MM)",
                    "12 (16.5MM)",
                    "13 (16.9 MM)",
                    "14 (17.3MM)",
                    "15 (17.5 MM)",
                    "16 (17.9MM)",
                    "17 (18.1 MM)",
                    "18 (18.5 MM)",
                    "19 (18.7 MM)",
                    "20 (19.2MM)",
                    "21 (19.4MM)",
                    "22 (19.8 MM)",
                    "23 (20MM)",
                    "24 (20.4MM)",
                    "25 (20.6MM)",
                  ].map((size, index) => (
                    <div
                      key={size}
                      className={`p-3 rounded text-center ${
                        index % 2 === 0 ? "bg-white" : "bg-[#EEFCFB]"
                      }`}
                    >
                      {size}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Size Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* For Women */}
            <div className="bg-pink-50 rounded-lg p-6">
              <h3 className="text-xl font-medium mb-3 text-gray-800">
                For Women
              </h3>
              <p className="text-gray-700">Recommended sizes: 8 to 20</p>
            </div>

            {/* For Men */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-xl font-medium mb-3 text-gray-800">
                For Men
              </h3>
              <p className="text-gray-700">Recommended sizes: 16 to 30</p>
            </div>
          </div>
        </div>
      </div>
      {/* Expert Help Section */}
      <div className="bg-[#67C3BE] text-white rounded-lg p-8 text-center">
        <h2 className="text-3xl font-light mb-4">
          Need Help Finding a Diamond?
        </h2>
        <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
          At HYUN we're passionate about diamonds, and every piece of diamond
          jewellery we offer has been selected with love and care. Let our
          experts guide you through your diamond journey.
        </p>
        <button className="bg-white text-teal-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
          Contact Our Experts
        </button>
      </div>
    </>
  );
};

export default RingSizeGuidePage;
