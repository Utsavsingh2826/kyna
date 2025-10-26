import React from "react";
import { Ruler, Hand } from "lucide-react";
import { Link } from "react-router-dom";

const EducationPage: React.FC = () => {
  return (
    <div className="min-h-screen flex justify-center bg-gray-50 py-8">
      <div className="container ">
        {/* Breadcrumb */}
        <div className="bg-white">
          <div className="container mx-auto px-4 py-3">
            <nav className="text-sm text-gray-600">
              <Link to="/" className="hover:text-teal-600">
                Home
              </Link>
              <span className="mx-2">-</span>
              <span className="text-gray-800">Bangle & Bracelet</span>
            </nav>
          </div>
        </div>

        {/* Round Bangle Size Guide */}
        <div className="md:ml-40 bg-white rounded-lg shadow-sm p-8 mb-8">
          <h1 className="text-4xl font-bold mb-12 text-gray-800">
            Round Bangle Size Guide
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            {/* If You Have a Bangle */}
            <div>
              <h2 className="text-2xl font-medium mb-6 text-gray-800">
                If You Have a Bangle
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-teal-400 rounded-full flex-shrink-0 mt-1 flex items-center justify-center">
                    <Ruler className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      Place the bangle on a ruler
                    </p>
                    <p className="text-gray-600 text-sm">
                      Align the largest diameter with the ruler
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-teal-400 rounded-full flex-shrink-0 mt-1 flex items-center justify-center">
                    <Ruler className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      Measure the inner diameter
                    </p>
                    <p className="text-gray-600 text-sm">
                      Find the distance from edge to edge inside the bangle
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* If You Don't Have a Bangle */}
            <div>
              <h2 className="text-2xl font-medium mb-6 text-gray-800">
                If You Don't Have a Bangle
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-teal-400 rounded-full flex-shrink-0 mt-1 flex items-center justify-center">
                    <Hand className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      Bring your thumb and little finger together
                    </p>
                    <p className="text-gray-600 text-sm">
                      Measure the widest part of your hand
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-teal-400 rounded-full flex-shrink-0 mt-1 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      className="text-white lucide lucide-ruler-dimension-line-icon lucide-ruler-dimension-line"
                    >
                      <path d="M12 15v-3.014" />
                      <path d="M16 15v-3.014" />
                      <path d="M20 6H4" />
                      <path d="M20 8V4" />
                      <path d="M4 8V4" />
                      <path d="M8 15v-3.014" />
                      <rect x="3" y="12" width="18" height="7" rx="1" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      Use a measuring tape or string
                    </p>
                    <p className="text-gray-600 text-sm">
                      Wrap around the widest area & mark the meeting point
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-start">
            {/* Measurement Diagrams */}
            <div>
              <img
                src="/Education/bangel.png"
                className="sm:hidden w-80 mb-6"
                alt="Bangle Measurement"
              />
              <img
                src="/Education/bangel.png"
                className="hidden sm:flex sm:max-w-2xl"
                alt="Bangle Measurement"
              />
            </div>

            {/* Size Chart */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium h-20 sm:h-7 flex items-center justify-center text-gray-800 mb-2 text-center">
                    Bangle Size
                  </h3>
                  <div className="space-y-2">
                    {["2.2", "2.4", "2.6", "2.8", "3.0"].map((size, index) => (
                      <div
                        key={size}
                        className={`p-3 rounded text-center font-medium ${
                          index % 2 === 0 ? "bg-white" : "bg-[#EEFCFB]"
                        }`}
                      >
                        {size}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium sm:h-7 text-gray-800 mb-4 sm:mb-0 text-center">
                    Inner Diameter (mm)
                  </h3>
                  <div className="space-y-2">
                    {["54.8 mm", "57.2mm", "59.5 mm", "62.8 mm", "65.1mm"].map(
                      (diameter, index) => (
                        <div
                          key={diameter}
                          className={`p-3 rounded text-center ${
                            index % 2 === 0 ? "bg-white" : "bg-[#EEFCFB]"
                          }`}
                        >
                          {diameter}
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bracelet Size Guide */}
        <div className="bg-white md:ml-40 rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold mb-12 text-gray-800">
            Bracelet Size Guide
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            {/* Option 1: Wrist Measurement */}
            <div>
              <h2 className="text-xl font-medium mb-6 text-gray-800">
                Option 1: Wrist Measurement
              </h2>
              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-teal-400 rounded-full flex-shrink-0 mt-1 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      className="text-white lucide lucide-ruler-dimension-line-icon lucide-ruler-dimension-line"
                    >
                      <path d="M12 15v-3.014" />
                      <path d="M16 15v-3.014" />
                      <path d="M20 6H4" />
                      <path d="M20 8V4" />
                      <path d="M4 8V4" />
                      <path d="M8 15v-3.014" />
                      <rect x="3" y="12" width="18" height="7" rx="1" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      Use a string/thread/ribbon
                    </p>
                    <p className="text-gray-600 text-sm">
                      Wrap it around your wrist
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-teal-400 rounded-full flex-shrink-0 mt-1 flex items-center justify-center">
                    <Ruler className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      Measure the length
                    </p>
                    <p className="text-gray-600 text-sm">
                      Mark where the ends meet & measure in centimeters
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex-auto sm:flex w-60">
                <img src="/Education/1.png" alt="" />
                <img src="/Education/2.png" alt="" />
              </div>
            </div>

            {/* Option 2: Measuring Tape */}
            <div>
              <h2 className="text-xl font-medium mb-6 text-gray-800">
                Option 2: Measuring Tape
              </h2>
              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-teal-400 rounded-full flex-shrink-0 mt-1 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      className="text-white lucide lucide-ruler-dimension-line-icon lucide-ruler-dimension-line"
                    >
                      <path d="M12 15v-3.014" />
                      <path d="M16 15v-3.014" />
                      <path d="M20 6H4" />
                      <path d="M20 8V4" />
                      <path d="M4 8V4" />
                      <path d="M8 15v-3.014" />
                      <rect x="3" y="12" width="18" height="7" rx="1" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      Use a soft measuring tape
                    </p>
                    <p className="text-gray-600 text-sm">
                      Wrap around your wrist at desired looseness.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-400 rounded-full flex-shrink-0 mt-1 flex items-center justify-center">
                    <span className="text-white text-xs">!</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      Note the measurement
                    </p>
                    <p className="text-gray-600 text-sm">
                      Select the size that suits you best
                    </p>
                  </div>
                </div>
              </div>
              <img src="/Education/3.png" className="w-60" alt="" />
            </div>
          </div>
        </div>
        {/* Size Chart */}
        <div className="flex justify-center">
          <div className="bg-gray-50 container max-w-4xl rounded-lg p-6 mb-8">
            <div className="grid grid-cols-2 gap-4 ">
              <div>
                <h3 className="font-medium text-gray-800 sm:mb-4 text-center">
                  Wrist Size (Inches)
                </h3>
                <div className="space-y-2">
                  {[
                    "5 inches",
                    "5.5 inch",
                    "6 inches",
                    "6.5 inch",
                    "7 inches",
                    "7.5 inch",
                    "8 inches",
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
                <h3 className="font-medium text-gray-800 mb-4 text-center">
                  Wrist Size (CM)
                </h3>
                <div className="space-y-2">
                  {[
                    "12.7 cm",
                    "14 cm",
                    "15.3 cm",
                    "16.5 cm",
                    "17.8 cm",
                    "19 cm",
                    "20.3 cm",
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
        </div>

        {/* Tips for Best Fit */}
        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="text-xl font-medium mb-10  text-gray-800">
            Tips for the Best Fit
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Ruler className="w-6 text-black" />
              </div>
              <h4 className="font-medium text-gray-800 mb-2">Snug Fit</h4>
              <p className="text-sm text-gray-600">
                Choose a bracelet 0.5 inches larger than your wrist size
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  className="lucide lucide-ruler-dimension-line-icon lucide-ruler-dimension-line"
                >
                  <path d="M12 15v-3.014" />
                  <path d="M16 15v-3.014" />
                  <path d="M20 6H4" />
                  <path d="M20 8V4" />
                  <path d="M4 8V4" />
                  <path d="M8 15v-3.014" />
                  <rect x="3" y="12" width="18" height="7" rx="1" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-800 mb-2">Relaxed Fit</h4>
              <p className="text-sm text-gray-600">
                Select a bracelet 1inch larger than your wrist size
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Hand className="w-6 text-black" />
              </div>
              <h4 className="font-medium text-gray-800 mb-2">Stacking</h4>
              <p className="text-sm text-gray-600">
                For stacking multiple bracelets, go for slightly larger sizes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationPage;
