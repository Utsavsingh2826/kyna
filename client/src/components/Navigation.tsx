import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Navigation: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [hoveredGiftCard, setHoveredGiftCard] = useState<string | null>(null);

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  const leftLinks = [
    ["/rings", "Rings"],
    ["/earrings", "Earrings"],
    ["/pendants", "Pendants"],
    ["/bracelets", "Bracelets"],
    ["/engravings", "Engraving"],
    // ["/upload-your-design/rings", "Upload Your Design"],
    // ["/build-your-jewellery/Rings", "Build Your Jewellery"],
  ];
  const rightLinks = [
    ["/rings?ring_category=Mens+Rings", "Men's Rings"],
    ["/earrings?category1=stud%27s&category3=men%27s+stud", "Men's Studs"],
    ["/earrings?category1=fashion", "Fashion Earrings"],
    ["/pendants?ring_category=fashion", "Fashion Pendants"],
  ];

  return (
    <nav className="bg-white border-b border-gray-100 relative">
      <div className="px-4">
        <div className="">
          <div className="hidden sm:flex justify-around flex-wrap space-x-0 md:space-x-8 text-sm font-medium text-gray-600 tracking-wide">
            {/* RINGS Dropdown */}
            <div className="relative group">
              <Link
                to="/rings"
                className={`px-3 py-4 block transition-colors border-b-2 hover:text-[#68C5C0] hover:border-[#68C5C0] ${
                  isActive("/rings") ? "text-[#68C5C0] border-[#68C5C0]" : "border-transparent"
                }`}
              >
                RINGS
              </Link>
              <div className="absolute top-full left-0 bg-white shadow-xl border-0 rounded-md w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <Link
                    to="/rings?ring_category=Solitaire+Rings"
                    className="block px-4 py-2 text-sm text-gray-600 hover:text-[#68C5C0] hover:bg-[#68C5C0]/8 transition-colors"
                  >
                    Solitaire Rings
                  </Link>
                  <Link
                    to="/rings?ring_category=Engagement+Rings"
                    className="block px-4 py-2 text-sm text-gray-600 hover:text-[#68C5C0] hover:bg-[#68C5C0]/8 transition-colors"
                  >
                    Engagement Rings
                  </Link>
                  <Link
                    to="/rings?ring_category=Fashion+Rings"
                    className="block px-4 py-2 text-sm text-gray-600 hover:text-[#68C5C0] hover:bg-[#68C5C0]/8 transition-colors"
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
                className={`px-3 py-4 block transition-colors border-b-2 hover:text-[#68C5C0] hover:border-[#68C5C0] ${
                  isActive("/earrings") ? "text-[#68C5C0] border-[#68C5C0]" : "border-transparent"
                }`}
              >
                EARRINGS
              </Link>
              <div className="absolute top-full left-0 bg-white shadow-xl border-0 rounded-md w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  {[
                    ["?category1=stud%27s&category3=&category2=", "Studs"],
                    [
                      "?category1=hoops%2Fhuggies&category3=&category2=",
                      "Hoops / Huggies",
                    ],
                    ["?category1=halo&category3=&category2=", "Halo Earrings"],
                    [
                      "?category1=fashion+earrings&category3=&category2=",
                      "Fashion Earrings",
                    ],
                    [
                      "?category1=drop+earrings&category3=&category2=",
                      "Drop Earrings",
                    ],
                  ].map(([path, label]) => (
                    <Link
                      key={path}
                      to={`/earrings/${path}`}
                      className="block px-4 py-2 text-sm text-gray-600 hover:text-[#68C5C0] hover:bg-[#68C5C0]/8 transition-colors"
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
                className={`px-3 py-4 block transition-colors border-b-2 hover:text-[#68C5C0] hover:border-[#68C5C0] ${
                  isActive("/pendants") ? "text-[#68C5C0] border-[#68C5C0]" : "border-transparent"
                }`}
              >
                PENDANTS
              </Link>
              <div className="absolute top-full left-0 bg-white shadow-xl border-0 rounded-md w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  {[
                    [
                      "?pendant_category=Solitaire+Pendants",
                      "Solitaire Pendants",
                    ],
                    ["?pendant_category=Fashion+Pendants", "Fashion Pendants"],
                    ["?pendant_category=Solitaire+Halo", "Solitaire Halo"],
                  ].map(([path, label]) => (
                    <Link
                      key={path}
                      to={`/pendants/${path}`}
                      className="block px-4 py-2 text-sm text-gray-600 hover:text-[#68C5C0] hover:bg-[#68C5C0]/8 transition-colors"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            {/* JEWELLERY Dropdown */}
            {/* <div className="relative group">
              <div
                // to="/jewellery"
                className={`px-3 py-4 block transition-colors hover:bg-[#68C5C0] hover:text-white ${
                  isActive("/") ? "bg-[#68C5C0] text-white" : ""
                }`}
              >
                JEWELLERY
              </div>
              <div className="absolute top-full left-0 bg-white shadow-lg border rounded-md w-80 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2 grid grid-cols-2 gap-4 px-4">
                  <div>
                    {[
                      ["/rings", "Rings"],
                      ["/earrings", "Earrings"],
                      ["/pendants", "Pendants"],
                      ["/bracelets", "Bracelets"],
                      ["/design-your-own", "Design Your Own"],
                      ["/upload-design", "Upload Your Design"],
                      ["/build-jewellery", "Build Your Jewellery"],
                    ].map(([path, label]) => (
                      <Link
                        key={path}
                        to={`/${path.startsWith("/") ? path : "/" + path}`}
                        className="block px-2 py-2 text-sm text-gray-700 hover:bg-[#68C5C0] hover:text-white"
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                  <div>
                    {[
                      ["/rings?ring_category=Men's Rings", "Men's Rings"],
                      ["/earrings?earring_category=Men's Studs", "Men's Studs"],
                      [
                        "/bracelets?bracelet_category=Men's Bracelets",
                        "Men's Bracelets",
                      ],
                      ["/platinum", "Platinum Jewellery"],
                      ["/silver", "Silver Jewellery"],
                      ["/silver-gold-plated", "Silver Gold Plated Jewellery"],
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
            </div> */}
            <div className="relative group">
              <Link
                to="/rings"
                className={`px-3 py-4 block transition-colors border-b-2 hover:text-[#68C5C0] hover:border-[#68C5C0] ${
                  isActive("/jewellery") ? "text-[#68C5C0] border-[#68C5C0]" : "border-transparent"
                }`}
              >
                JEWELLERY
              </Link>

              <div className="absolute top-full left-0 bg-white shadow-xl border-0 rounded-md w-80 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2 grid grid-cols-2 gap-4 px-4">
                  {/* LEFT SIDE */}
                  <div>
                    {leftLinks.map(([path, label]) => (
                      <Link
                        key={path}
                        to={path}
                        className="block px-2 py-2 text-sm text-gray-700 hover:bg-[#68C5C0] hover:text-white"
                      >
                        {label}
                      </Link>
                    ))}
                  </div>

                  {/* RIGHT SIDE */}
                  <div>
                    {rightLinks.map(([path, label]) => (
                      <Link
                        key={label}
                        to={path}
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
              className={`px-3 py-4 block transition-colors border-b-2 hover:text-[#68C5C0] hover:border-[#68C5C0] ${
                isActive("/engravings") ? "text-[#68C5C0] border-[#68C5C0]" : "border-transparent"
              }`}
            >
              ENGRAVING
            </Link>

            {/* DESIGN YOUR OWN Mega Menu */}
            <div className="group hidden md:block">
              <div
                className={`px-3 py-4 block transition-colors border-b-2 cursor-default hover:text-[#68C5C0] hover:border-[#68C5C0] ${
                  isActive("/design-your-own") ? "text-[#68C5C0] border-[#68C5C0]" : "border-transparent"
                }`}
              >
                DESIGN YOUR OWN
              </div>
              <div className="absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="max-w-screen-xl mx-auto px-10 py-8 grid grid-cols-2 divide-x divide-gray-100">

                  {/* ── Left: Upload Your Design ── */}
                  <div className="pr-10">
                    <p className="text-[10px] tracking-[0.22em] uppercase text-[#328F94] mb-2 font-medium">
                      Upload Your Design
                    </p>
                    <p className="text-[11px] text-gray-400 tracking-wide mb-5 leading-relaxed">
                      Turn any design idea into reality by uploading a drawing or inspirational image.
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { to: "/upload-your-design/rings",     src: "/navigation/upload-your-design/ring.jpg",           label: "Rings" },
                        { to: "/upload-your-design/earrings",  src: "/navigation/upload-your-design/earrings.png",       label: "Earrings" },
                        { to: "/upload-your-design/bracelets", src: "/navigation/upload-your-design/bracelets.png",      label: "Bracelets" },
                        { to: "/upload-your-design/pendants",  src: "/navigation/upload-your-design/pendants.png",       label: "Pendants" },
                        { to: "/upload-your-design/necklaces", src: "/navigation/upload-your-design/necklace.jpg",       label: "Necklaces" },
                        { to: "/upload-your-design/bangles",   src: "/navigation/upload-your-design/bangeldisplay.jpeg", label: "Bangles" },
                      ].map(item => (
                        <Link key={item.to} to={item.to} className="group/card flex flex-col items-center">
                          <div className="w-full aspect-square overflow-hidden mb-2">
                            <img src={item.src} alt={item.label}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover/card:scale-105" />
                          </div>
                          <span className="text-[10px] tracking-[0.1em] uppercase text-gray-500 group-hover/card:text-[#328F94] transition-colors">
                            {item.label}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* ── Right: Build Your Jewellery ── */}
                  <div className="pl-10">
                    <p className="text-[10px] tracking-[0.22em] uppercase text-[#328F94] mb-2 font-medium">
                      Build Your Jewellery
                    </p>
                    <p className="text-[11px] text-gray-400 tracking-wide mb-5 leading-relaxed">
                      Use our jewellery builder to create your unique look. Style your way.
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { href: "/build-your-jewellery/Rings",       src: "/navigation/build-your-jewellery/rings.png",    label: "Engagement / Solitaire Rings" },
                        { href: "/build-your-jewellery/Earrings",    src: "/navigation/build-your-jewellery/earrings.png", label: "Earring Studs" },
                        { href: "/build-your-jewellery/Bracelets",   src: "/navigation/build-your-jewellery/bracelate.png",label: "Tennis Bracelets" },
                        { href: "/build-your-jewellery/Pendants",    src: "/navigation/build-your-jewellery/pendants.png", label: "Solitaire Pendants" },
                        { href: "/build-your-jewellery/Gents-Rings", src: "/navigation/build-your-jewellery/band.png",     label: "Men's Ring" },
                      ].map(item => (
                        <a key={item.href} href={item.href} className="group/card flex flex-col items-center">
                          <div className="w-full aspect-square overflow-hidden mb-2">
                            <img src={item.src} alt={item.label}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover/card:scale-105" />
                          </div>
                          <span className="text-[10px] tracking-[0.1em] uppercase text-gray-500 group-hover/card:text-[#328F94] transition-colors text-center leading-snug">
                            {item.label}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>
            {/* GIFTING Dropdown */}
            <div className="relative group">
              <Link
                to="/gifting"
                className={`px-3 py-4 block transition-colors border-b-2 hover:text-[#68C5C0] hover:border-[#68C5C0] ${
                  isActive("/gifting") ? "text-[#68C5C0] border-[#68C5C0]" : "border-transparent"
                }`}
              >
                GIFTING
              </Link>
              <div className="absolute top-full right-0 bg-white border border-gray-100 shadow-lg w-[380px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-5">
                  <p className="text-[10px] tracking-[0.22em] uppercase text-[#328F94] mb-4 font-medium">Shop by Budget</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        to: "/gifting/?min_price=0&max_price=25000",
                        label: "Under ₹25,000",
                        img: "/navigation/build-your-jewellery/earrings.png",
                        hoverImg: "/navigation/upload-your-design/eardisplay.png",
                      },
                      {
                        to: "/gifting/?min_price=25000&max_price=50000",
                        label: "₹25k – ₹50k",
                        img: "/navigation/build-your-jewellery/rings.png",
                        hoverImg: "/navigation/upload-your-design/ringdisplay.jpg",
                      },
                      {
                        to: "/gifting/gift-card",
                        label: "Gift Card",
                        img: "/gifting/card.png",
                        hoverImg: "/gifting/banner.png",
                      },
                    ].map(item => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onMouseEnter={() => setHoveredGiftCard(item.to)}
                        onMouseLeave={() => setHoveredGiftCard(null)}
                        className="flex flex-col items-center"
                      >
                        <div className="relative w-full aspect-square overflow-hidden mb-2">
                          <img src={item.img} alt={item.label}
                            className="w-full h-full object-cover" />
                          <img src={item.hoverImg} alt=""
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out ${hoveredGiftCard === item.to ? "opacity-100" : "opacity-0"}`} />
                        </div>
                        <span className={`text-[10px] tracking-[0.1em] uppercase transition-colors text-center leading-snug ${hoveredGiftCard === item.to ? "text-[#328F94]" : "text-gray-500"}`}>
                          {item.label}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* ABOUT */}
            <Link
              to="/about"
              className={`px-3 py-4 block transition-colors border-b-2 hover:text-[#68C5C0] hover:border-[#68C5C0] ${
                isActive("/about") ? "text-[#68C5C0] border-[#68C5C0]" : "border-transparent"
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
