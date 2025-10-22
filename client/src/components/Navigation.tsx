import React from "react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Navigation: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  const [activeTab, setActiveTab] = useState("upload");

  return (
    <nav className="bg-gray-50 border-b">
      <div className="px-4">
        <div className="">
          <div className="hidden sm:flex justify-around flex-wrap space-x-0 md:space-x-8 text-sm font-medium text-gray-700">
            {/* RINGS Dropdown */}
            <div className="relative group">
              <Link
                to="/rings"
                className={`px-3 py-4 block transition-colors hover:bg-[#68C5C0] hover:text-white ${
                  isActive("/rings") ? "bg-[#68C5C0] text-white" : ""
                }`}
              >
                RINGS
              </Link>
              <div className="absolute top-full left-0 bg-white shadow-lg border rounded-md w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <Link
                    to="/rings/solitaire"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#68C5C0] hover:text-white"
                  >
                    Solitaire Rings
                  </Link>
                  <Link
                    to="/rings/engagement"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#68C5C0] hover:text-white"
                  >
                    Engagement Rings
                  </Link>
                  <Link
                    to="/rings/fashion"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#68C5C0] hover:text-white"
                  >
                    Fashion Rings
                  </Link>
                </div>
              </div>
            </div>
            {/* EARRINGS Dropdown */}
            <div className="relative group">
              <Link
                to="/earrings"
                className={`px-3 py-4 block transition-colors hover:bg-[#68C5C0] hover:text-white ${
                  isActive("/earrings") ? "bg-[#68C5C0] text-white" : ""
                }`}
              >
                EARRINGS
              </Link>
              <div className="absolute top-full left-0 bg-white shadow-lg border rounded-md w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  {[
                    ["studs", "Studs"],
                    ["hoops", "Hoops / Huggies"],
                    ["halo", "Halo Earrings"],
                    ["fashion", "Fashion Earrings"],
                    ["drop", "Drop Earrings"],
                  ].map(([path, label]) => (
                    <Link
                      key={path}
                      to={`/earrings/${path}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#68C5C0] hover:text-white"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            {/* PENDANTS Dropdown */}
            <div className="relative group">
              <Link
                to="/pendants"
                className={`px-3 py-4 block transition-colors hover:bg-[#68C5C0] hover:text-white ${
                  isActive("/pendants") ? "bg-[#68C5C0] text-white" : ""
                }`}
              >
                PENDANTS
              </Link>
              <div className="absolute top-full left-0 bg-white shadow-lg border rounded-md w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  {[
                    ["solitaire", "Solitaire Pendants"],
                    ["fashion", "Fashion Pendants"],
                    ["halo", "Solitaire Halo"],
                  ].map(([path, label]) => (
                    <Link
                      key={path}
                      to={`/pendants/${path}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#68C5C0] hover:text-white"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            {/* JEWELLERY Dropdown */}
            <div className="relative group">
              <Link
                to="/jewellery"
                className={`px-3 py-4 block transition-colors hover:bg-[#68C5C0] hover:text-white ${
                  isActive("/jewellery") ? "bg-[#68C5C0] text-white" : ""
                }`}
              >
                JEWELLERY
              </Link>
              <div className="absolute top-full left-0 bg-white shadow-lg border rounded-md w-80 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2 grid grid-cols-2 gap-4 px-4">
                  <div>
                    {[
                      ["rings", "Rings"],
                      ["earrings", "Earrings"],
                      ["pendants", "Pendants"],
                      ["bracelets", "Bracelets"],
                      ["/design-your-own", "Design Your Own"],
                      ["/upload-design", "Upload Your Design"],
                      ["/build-jewellery", "Build Your Jewellery"],
                    ].map(([path, label]) => (
                      <Link
                        key={path}
                        to={`/jewellery${
                          path.startsWith("/") ? path : "/" + path
                        }`}
                        className="block px-2 py-2 text-sm text-gray-700 hover:bg-[#68C5C0] hover:text-white"
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                  <div>
                    {[
                      ["mens-rings", "Men's Rings"],
                      ["mens-studs", "Men's Studs"],
                      ["mens-bracelets", "Men's Bracelets"],
                      ["platinum", "Platinum Jewellery"],
                      ["silver", "Silver Jewellery"],
                      ["silver-gold-plated", "Silver Gold Plated Jewellery"],
                      ["/engraving", "Engraving"],
                    ].map(([path, label]) => (
                      <Link
                        key={path}
                        to={`/jewellery${
                          path.startsWith("/") ? path : "/" + path
                        }`}
                        className="block px-2 py-2 text-sm text-gray-700 hover:bg-[#68C5C0] hover:text-white"
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* ENGRAVING */}
            <Link
              to="/engravings"
              className={`px-3 py-4 block transition-colors hover:bg-[#68C5C0] hover:text-white ${
                isActive("/engravings") ? "bg-[#68C5C0] text-white" : ""
              }`}
            >
              ENGRAVING
            </Link>

            {/* DESIGN YOUR OWN Dropdown */}
            <div className="relative group hidden md:block">
              <div
                // to="/design-your-own"
                className={`px-3 py-4 block transition-colors hover:bg-[#68C5C0] hover:text-white ${
                  isActive("/design-your-own") ? "bg-[#68C5C0] text-white" : ""
                }`}
              >
                DESIGN YOUR OWN
              </div>
              <div className="absolute top-full left-0 bg-white shadow-lg border rounded-md w-[500px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-6 min-w-[300px] max-w-[500px]">
                  {/* Action buttons */}
                  <div className="flex gap-3 mb-6">
                    <Button
                      variant={activeTab === "upload" ? "default" : "outline"}
                      size="sm"
                      className={`flex-1 ${
                        activeTab === "upload"
                          ? "bg-[#68C5C0] hover:bg-[#68C5C0]/90 text-white border-[#68C5C0]"
                          : ""
                      }`}
                      onClick={() => setActiveTab("upload")}
                    >
                      Upload Your Design
                    </Button>
                    <Button
                      variant={activeTab === "build" ? "default" : "outline"}
                      size="sm"
                      className={`flex-1 ${
                        activeTab === "build"
                          ? "bg-[#68C5C0] hover:bg-[#68C5C0]/90 text-white border-[#68C5C0]"
                          : "hover:bg-[#68C5C0]/10 hover:border-[#68C5C0] hover:text-[#68C5C0]"
                      }`}
                      onClick={() => setActiveTab("build")}
                    >
                      Build Your Jewellery
                    </Button>
                  </div>{" "}
                  {/* Conditional content */}
                  {activeTab === "upload" && (
                    <>
                      <p className="text-sm text-muted-foreground mb-4">
                        Turn any design idea into reality by uploading a drawing
                        or an inspirational image.
                      </p>
                      <div className="grid grid-cols-3 gap-4">
                        <Link
                          to="/upload-your-design/rings"
                          className="flex flex-col items-center"
                        >
                          <img
                            src="/navigation/upload-your-design/ring.jpg"
                            alt="Rings"
                            className="h-30 object-cover rounded"
                          />
                          <span className="mt-2 text-sm">Rings</span>
                        </Link>
                        <Link
                          to="/upload-your-design/earrings"
                          className="flex flex-col items-center"
                        >
                          <img
                            src="/navigation/upload-your-design/earrings.png"
                            alt="Earrings"
                            className="h-30 object-cover rounded"
                          />
                          <span className="mt-2 text-sm">Earrings</span>
                        </Link>
                        <Link
                          to="/upload-your-design/bracelets"
                          className="flex flex-col items-center"
                        >
                          <img
                            src="/navigation/upload-your-design/bracelets.png"
                            alt="Bracelets"
                            className="h-30 object-cover rounded"
                          />
                          <span className="mt-2 text-sm">Bracelets</span>
                        </Link>
                        <Link
                          to="/upload-your-design/pendants"
                          className="flex flex-col items-center"
                        >
                          <img
                            src="/navigation/upload-your-design/pendants.png"
                            alt="Pendants"
                            className="h-30 object-cover rounded"
                          />
                          <span className="mt-2 text-sm">Pendants</span>
                        </Link>
                        <Link
                          to="/upload-your-design/necklaces"
                          className="flex flex-col items-center"
                        >
                          <img
                            src="/navigation/upload-your-design/necklace.jpg"
                            alt="Necklaces"
                            className="h-30 object-cover rounded"
                          />
                          <span className="mt-2 text-sm">Necklaces</span>
                        </Link>
                        <Link
                          to="/upload-your-design/bangles"
                          className="flex flex-col items-center"
                        >
                          <img
                            src="/navigation/upload-your-design/bangeldisplay.png"
                            alt="Bangles"
                            className="h-30 object-cover rounded"
                          />
                          <span className="mt-2 text-sm">Bangles</span>
                        </Link>
                      </div>
                    </>
                  )}
                  {activeTab === "build" && (
                    <>
                      <p className="text-sm text-muted-foreground mb-4">
                        Use our jewellery builder to create your unique look.
                        Style your way.
                      </p>
                      <div className="grid text-center grid-cols-3 gap-4">
                        <a
                          href="/build-your-jewellery/Rings"
                          className="flex flex-col items-center"
                        >
                          <img
                            src="/navigation/build-your-jewellery/rings.jpg"
                            alt="Rings"
                            className="h-40 object-cover rounded"
                          />
                          <span className="mt-2 text-sm">
                            Engagement / Solitaire Rings
                          </span>
                        </a>
                        <a
                          href="/build-your-jewellery/Earrings"
                          className="flex flex-col items-center"
                        >
                          <img
                            src="/navigation/build-your-jewellery/earrings.png"
                            alt="Earrings"
                            className="h-40 object-cover rounded"
                          />
                          <span className="mt-2 text-sm">Earring Studs</span>
                        </a>
                        <a
                          href="/build-your-jewellery/Bracelets"
                          className="flex flex-col items-center"
                        >
                          <img
                            src="/navigation/build-your-jewellery/bracelate.png"
                            alt="Bracelets"
                            className="h-40 object-cover rounded"
                          />
                          <span className="mt-2 text-sm">Tennis Bracelets</span>
                        </a>
                        <a
                          href="/build-your-jewellery/Pendants"
                          className="flex flex-col items-center"
                        >
                          <img
                            src="/navigation/build-your-jewellery/pendants.png"
                            alt="Pendants"
                            className="h-40 object-cover rounded"
                          />
                          <span className="mt-2 text-sm">
                            Solitaire Pendants
                          </span>
                        </a>
                        {/* <a
                          href="/build-your-jewellery/Necklaces"
                          className="flex flex-col items-center"
                        >
                          <img
                            src="/navigation/build-your-jewellery/necklace.png"
                            alt="Necklaces"
                            className="h-40 object-cover rounded"
                          />
                          <span className="mt-2 text-sm">Tennis Necklaces</span>
                        </a> */}
                        <a
                          href="/build-your-jewellery/Bands"
                          className="flex flex-col items-center"
                        >
                          <img
                            src="/navigation/build-your-jewellery/band.png"
                            alt="Bangles"
                            className="h-40 object-cover rounded"
                          />
                          <span className="mt-2 text-sm">Wedding Bands</span>
                        </a>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            {/* GIFTING Dropdown */}
            <div className="relative group">
              <Link
                to="/gifting"
                className={`px-3 py-4 block transition-colors hover:bg-[#68C5C0] hover:text-white ${
                  isActive("/gifting") ? "bg-[#68C5C0] text-white" : ""
                }`}
              >
                GIFTING
              </Link>
              <div className="absolute top-full left-0 bg-white shadow-lg border rounded-md w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  {[
                    ["0-25000", "Under 25,000/-"],
                    ["25000-50000", "Rs. 25,000/- to 50,000/-"],
                    ["gift-card", "Gift Card"],
                  ].map(([path, label]) => (
                    <Link
                      key={path}
                      to={`/gifting/${path}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#68C5C0] hover:text-white"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            {/* ABOUT */}
            <Link
              to="/about"
              className={`px-3 py-4 block transition-colors hover:bg-[#68C5C0] hover:text-white ${
                isActive("/about") ? "bg-[#68C5C0] text-white" : ""
              }`}
            >
              ABOUT
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
