import { useState, useRef, useEffect } from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Mail,
  MessageCircle,
  Share2,
} from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import Engrave from "../Engrave";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ProductReviews from "@/components/ProductReviews";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StickyTwoColumnLayout } from "@/components/StickyTwoColumnLayout";


type ApiVariant = {
  variantId: string;
  stylingName: string;
  builderImage: string;
  basePrice: number;
};

type StyleGroup = {
  name: string;
  substyles: { img: string; name: string; price: string }[];
};

// removed duplicate type declarations
const diamondShapes = {
  shapes: [
    { name: "Round", img: "/DIAMOND_SHAPES_WEBP/round.webp" },
    { name: "Princess", img: "/DIAMOND_SHAPES_WEBP/princess.webp" },
    { name: "Emerald", img: "/DIAMOND_SHAPES_WEBP/emerald.webp" },
    { name: "Asscher", img: "/DIAMOND_SHAPES_WEBP/asscher.jpg" },
    { name: "Radiant", img: "/DIAMOND_SHAPES_WEBP/radient.jpg" },
    { name: "Cushion", img: "/DIAMOND_SHAPES_WEBP/cushion.webp" },
    { name: "Oval", img: "/DIAMOND_SHAPES_WEBP/oval.webp" },
    { name: "Pear", img: "/DIAMOND_SHAPES_WEBP/pear.webp" },
    { name: "Marquise", img: "/DIAMOND_SHAPES_WEBP/marquise.webp" },
    { name: "Heart", img: "/DIAMOND_SHAPES_WEBP/heart.jpg" },
  ],
};
const ProductDetail = () => {
  const [styleData, setStyleData] = useState<StyleGroup[]>([]);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showEngraveModal, setShowEngraveModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedDiamondOrigin, setSelectedDiamondOrigin] =
    useState("Natural Diamond");
  const [selectedDiamondShape, setSelectedDiamondShape] = useState("Oval");
  const [selectedMetalColor, setSelectedMetalColor] = useState("White Gold");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedClarity, setSelectedClarity] = useState("");

  // Default to "Most Popular" and first substyle
  const [selectedStyleCategory, setSelectedStyleCategory] = useState("");
  const [selectedRingStyle, setSelectedRingStyle] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fetchVariants = async () => {
      try {
        const res = await fetch("/api/build-your-jewelry/categories/BRACELET");
        const json = await res.json();
        const variants: ApiVariant[] = json?.data?.variants || [];

        const groupsMap = new Map<string, StyleGroup>();
        variants.forEach((v) => {
          const key = (v.stylingName || "OTHER").toUpperCase();
          const sub = {
            img: `/build_yr_own/${v.builderImage}.png`,
            name: v.builderImage,
            price: new Intl.NumberFormat("en-IN").format(v.basePrice || 0),
          };
          if (!groupsMap.has(key)) {
            groupsMap.set(key, { name: key, substyles: [sub] });
          } else {
            groupsMap.get(key)!.substyles.push(sub);
          }
        });
        const groups = Array.from(groupsMap.values());
        if (!isMounted) return;
        setStyleData(groups);
        if (groups.length > 0) {
          setSelectedStyleCategory(groups[0].name);
          if (groups[0].substyles.length > 0) {
            setSelectedRingStyle(groups[0].substyles[0].name);
          }
        }
      } catch (e) {
        console.error("Failed to fetch bracelet variants", e);
      }
    };
    fetchVariants();
    return () => {
      isMounted = false;
    };
  }, []);

  // Separate refs for different scroll containers
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const styleCategoryRef = useRef<HTMLDivElement>(null);
  const ringStylesRef = useRef<HTMLDivElement>(null);

  // Thumbnail scroll handlers
  const scrollThumbnailsUp = () => {
    if (thumbnailsRef.current) {
      thumbnailsRef.current.scrollBy({ top: -72, behavior: "smooth" });
    }
  };

  const scrollThumbnailsDown = () => {
    if (thumbnailsRef.current) {
      thumbnailsRef.current.scrollBy({ top: 72, behavior: "smooth" });
    }
  };

  const scrollThumbnailsLeft = () => {
    if (thumbnailsRef.current) {
      thumbnailsRef.current.scrollBy({ left: -72, behavior: "smooth" });
    }
  };

  const scrollThumbnailsRight = () => {
    if (thumbnailsRef.current) {
      thumbnailsRef.current.scrollBy({ left: 72, behavior: "smooth" });
    }
  };

  // Style category scroll handlers
  const scrollStyleCategoryLeft = () => {
    if (styleCategoryRef.current) {
      styleCategoryRef.current.scrollBy({ left: -120, behavior: "smooth" });
    }
  };

  const scrollStyleCategoryRight = () => {
    if (styleCategoryRef.current) {
      styleCategoryRef.current.scrollBy({ left: 120, behavior: "smooth" });
    }
  };

  // Ring styles scroll handlers
  const scrollRingStylesLeft = () => {
    if (ringStylesRef.current) {
      ringStylesRef.current.scrollBy({ left: -120, behavior: "smooth" });
    }
  };

  const scrollRingStylesRight = () => {
    if (ringStylesRef.current) {
      ringStylesRef.current.scrollBy({ left: 120, behavior: "smooth" });
    }
  };

  // Get current category's substyles and selected style data
  const currentCategory = styleData.find(
    (cat) => cat.name === selectedStyleCategory
  );
  const currentSubstyles = currentCategory?.substyles || [];
  const selectedStyleData =
    currentSubstyles.find((style) => style.name === selectedRingStyle) ||
    currentSubstyles[0];

  const ringSizes = [
    "4",
    "4.5",
    "5",
    "5.5",
    "6",
    "6.5",
    "7",
    "7.5",
    "8",
    "8.5",
    "9",
    "9.5",
    "10",
  ];

  const metalColors = [
    { name: "White Gold", img: "/colors/white.png" },
    { name: "Yellow Gold", img: "/colors/gold.png" },
    { name: "Rose Gold", img: "/colors/rosegold.png" },
    { name: "Silver", img: "/colors/white.png" },
    { name: "Platinum", img: "/colors/white.png" },
    { name: "14K White Gold", img: "/colors/white.png" },
    { name: "14K Yellow Gold", img: "/colors/gold.png" },
    { name: "14K Rose Gold", img: "/colors/rosegold.png" },
    { name: "18K White Gold", img: "/colors/white.png" },
    { name: "18K Yellow Gold", img: "/colors/gold.png" },
    { name: "18K Rose Gold", img: "/colors/rosegold.png" },
    { name: "22K Gold", img: "/colors/gold.png" },
    { name: "Palladium", img: "/colors/white.png" },
    { name: "Titanium", img: "/colors/white.png" },
  ];

  // Add state for showing more colors on mobile
  const [showAllColors, setShowAllColors] = useState(false);

  // Hardcoded thumbnail images
  const thumbnailImages = [
    "/product_detail/display.png",
    "/product_detail/glb.glb",
    "/product_detail/display.png",
    "/about/2.jpg",
    "/product_detail/display.png",
    "/about/3.jpg",
    "/product_detail/display.png",
    "/about/4.jpg",
  ];

  // Function to check if image is a 3D model
  const is3DModel = (imagePath: string, index: number) => {
    const isGLB = index === 1 && imagePath.endsWith(".glb");
    return isGLB || imagePath.endsWith(".glb");
  };

  // Sample product data for metal types
  const sampleProduct = {
    metalTypes: [
      "14K White Gold",
      "14K Yellow Gold",
      "14K Rose Gold",
      "18K White Gold",
      "18K Yellow Gold",
      "18K Rose Gold",
      "22K Gold",
      "Platinum",
      "Palladium",
      "Titanium",
      "Silver",
    ],
  };

  // Ref for metal types scroll container
  const metalTypesRef = useRef<HTMLDivElement>(null);
  const [selectedMetalType, setSelectedMetalType] = useState(
    sampleProduct.metalTypes[0]
  );

  function scrollMetalTypesLeft(): void {
    if (metalTypesRef.current) {
      metalTypesRef.current.scrollBy({ left: -120, behavior: "smooth" });
    }
  }

  function scrollMetalTypesRight(): void {
    if (metalTypesRef.current) {
      metalTypesRef.current.scrollBy({ left: 120, behavior: "smooth" });
    }
  }

  return (
    <div
      style={{ fontFamily: "Poppins" }}
      className="flex justify-center overflow-x-hidden w-full"
    >
      <SEO
        title="Build Your Bracelet - Custom Diamond Bracelet Builder"
        description="Design your perfect bracelet with our custom builder. Choose from premium settings and diamonds."
        canonical="/build-your-jewellery/Bracelets"
      />
      <main className="min-h-screen w-full max-w-6xl bg-background overflow-x-hidden">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
            <span>›</span>
            <div className="hover:text-foreground">Build Your Jewellery</div>
            <span>›</span>
            <span className="text-foreground">Bracelet</span>
          </nav>
        </div>

        <div className="container mx-auto px-4 overflow-x-hidden w-full">
          <StickyTwoColumnLayout
            leftColumn={
              <div className="flex gap-4 flex-col md:flex-row w-full overflow-x-hidden">
                {/* Thumbnails for desktop (vertical) */}
                <div className="hidden md:flex flex-col gap-2 relative">
                  <button
                    onClick={scrollThumbnailsUp}
                    aria-label="Scroll thumbnails up"
                    className="self-center p-2 hover:bg-gray-100 rounded-full transition-colors bg-white shadow-sm border"
                  >
                    <ChevronUp className="w-4 h-4 text-gray-600" />
                  </button>
                  <div
                    ref={thumbnailsRef}
                    className="flex flex-col gap-2 overflow-y-auto scrollbar-hide max-h-[400px]"
                    style={{
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                    }}
                  >
                    {thumbnailImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all hover:scale-105 relative ${
                          selectedImage === index
                            ? "border-[#328F94] ring-2 ring-[#328F94]/20"
                            : "border-neutral-200 hover:border-neutral-300"
                        }`}
                      >
                        {is3DModel(image, index) ? (
                          <div className="relative w-full h-full bg-gradient-to-br from-gray-100 to-gray-200">
                            <div className="absolute top-1 right-1 bg-[#328F94] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                              3D
                            </div>
                          </div>
                        ) : (
                          <img
                            src={image}
                            alt={`Product ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={scrollThumbnailsDown}
                    aria-label="Scroll thumbnails down"
                    className="self-center p-2 hover:bg-gray-100 rounded-full transition-colors bg-white shadow-sm border"
                  >
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                {/* Main Image */}
                <div className="flex-1 w-full min-w-0">
                  <div className="aspect-square bg-neutral-50 rounded-lg overflow-hidden mb-4 w-full">
                    {is3DModel(
                      thumbnailImages[selectedImage],
                      selectedImage
                    ) ? (
                      <div className="relative w-full h-full">
                        <h1>3D</h1>
                        <div className="absolute bottom-16 left-4 bg-gradient-to-r from-[#328F94] to-[#2a7a7e] text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                          🔄 Interactive 3D Model
                        </div>
                        <div className="absolute bottom-4 left-4 right-4 text-sm text-gray-600 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Controls:</span>
                            <div className="flex gap-4 text-xs">
                              <span>🖱️ Drag to rotate</span>
                              <span>🎯 Scroll to zoom</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={
                          selectedStyleData?.img || "/build_yr_own/sample1.png"
                        }
                        alt={selectedStyleData?.name || "Ring Style"}
                        className="w-full h-full object-cover transition-opacity duration-300"
                      />
                    )}

                    <div className="absolute bg-[#68C5C0] text-white top-4 right-4 px-2 py-1 rounded-md text-xs font-semibold">
                      RESET
                    </div>
                  </div>
                  {/* Thumbnails for mobile (horizontal) */}
                  <div className="flex justify-between md:hidden items-center gap-2 mt-4 w-full">
                    <button
                      onClick={scrollThumbnailsLeft}
                      aria-label="Scroll thumbnails left"
                      className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-full transition-colors bg-white shadow-sm border"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    <div
                      ref={thumbnailsRef}
                      className="flex gap-2 overflow-x-auto scrollbar-hide flex-1  max-w-[270px] py-1"
                      style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        scrollBehavior: "smooth",
                      }}
                    >
                      {thumbnailImages.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all hover:scale-105 relative ${
                            selectedImage === index
                              ? "border-[#328F94] ring-2 ring-[#328F94]/20"
                              : "border-neutral-200 hover:border-neutral-300"
                          }`}
                        >
                          {is3DModel(image, index) ? (
                            <div className="relative w-full h-full bg-gradient-to-br from-gray-100 to-gray-200">
                              <h1>3D</h1>
                              <div className="absolute top-1 right-1 bg-[#328F94] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                3D
                              </div>
                            </div>
                          ) : (
                            <img
                              src={image}
                              alt={`Product ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={scrollThumbnailsRight}
                      aria-label="Scroll thumbnails right"
                      className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-full transition-colors bg-white shadow-sm border"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>

                  {/* Name and Price Display - Responsive like ProductDetail */}
                  <div className="flex flex-col gap-4 md:gap-0 w-full">
                    <div className="flex flex-row  gap-3 w-full">
                      <div className="flex flex-col min-w-0 flex-1">
                        <p className="text-sm text-[#328F94] mb-1">
                          Ring Style & Design
                        </p>
                        <h2 className="text-xl md:text-2xl font-medium leading-tight truncate">
                          {selectedStyleData?.name || selectedRingStyle || ""}
                        </h2>
                      </div>
                      <div className="text-left sm:text-right flex-shrink-0">
                        <p className="text-sm text-[#328F94] mb-1">
                          Estimate Amount
                        </p>
                        <div className="text-xl md:text-2xl font-bold text-[#328F94]">
                          ₹{selectedStyleData?.price}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
            rightColumn={
              <div className="space-y-6 w-full overflow-x-hidden">
                <div className="w-full">
                  <h3 className="text-base md:text-lg font-medium mb-4 truncate">
                    Ring Style & Design:{" "}
                    <span className="text-[#328F94]">{selectedRingStyle}</span>
                  </h3>

                  {/* Style Category Selection - Enhanced Mobile Responsiveness */}
                  <div className="mb-6 w-full">
                    <div className="flex items-center gap-2 md:gap-3 w-full">
                      <button
                        onClick={scrollStyleCategoryLeft}
                        aria-label="Scroll style categories left"
                        className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                      >
                        <ChevronLeft className="w-3 h-3 md:w-4 md:h-4 text-[#8D8A91]" />
                      </button>
                      <div
                        ref={styleCategoryRef}
                        className="flex gap-2 md:gap-3 overflow-x-hidden scroll-smooth flex-1 w-[200px] md:w-full"
                      >
                        {styleData.map((category, index) => (
                          <button
                            key={`${category.name}-${index}`}
                            onClick={() => {
                              setSelectedStyleCategory(category.name);
                              setSelectedRingStyle(category.substyles[0].name);
                            }}
                            className={`px-3 md:px-4 py-2 md:py-2.5 rounded-lg border text-xs md:text-sm font-medium min-w-max whitespace-nowrap transition-all capitalize flex-shrink-0 ${
                              selectedStyleCategory === category.name
                                ? "border-[#328F94] bg-[#328F94]/10 text-[#328F94] shadow-sm"
                                : "border-neutral-300 text-neutral-600 hover:border-neutral-400 hover:bg-gray-50"
                            }`}
                          >
                            {category.name}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={scrollStyleCategoryRight}
                        aria-label="Scroll style categories right"
                        className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                      >
                        <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-[#8D8A91]" />
                      </button>
                    </div>
                  </div>

                  {/* Ring Design Selection - Enhanced Mobile Layout */}
                  <div className="mb-6 w-full">
                    <div className="flex items-center gap-2 md:gap-3 w-full">
                      <button
                        onClick={scrollRingStylesLeft}
                        aria-label="Scroll ring styles left"
                        className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                      >
                        <ChevronLeft className="w-3 h-3 md:w-4 md:h-4 text-[#8D8A91]" />
                      </button>
                      <div
                        ref={ringStylesRef}
                        className="flex gap-2 md:gap-4 overflow-x-hidden scroll-smooth flex-1 w-[200px]"
                      >
                        {currentSubstyles.map((style, index) => (
                          <button
                            key={`${style.name}-${index}`}
                            onClick={() => setSelectedRingStyle(style.name)}
                            className={`flex flex-col items-center gap-2 md:gap-3 p-2 md:p-3 rounded-xl border min-w-[75px] md:min-w-[100px] transition-all flex-shrink-0 ${
                              selectedRingStyle === style.name
                                ? "border-[#328F94] bg-[#328F94]/5 shadow-sm"
                                : "border-neutral-300 hover:border-neutral-400 hover:bg-gray-50"
                            }`}
                          >
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden bg-gray-100">
                              <img
                                src={style.img}
                                alt={style.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span
                              className={`text-xs font-medium text-center leading-tight ${
                                selectedRingStyle === style.name
                                  ? "text-[#328F94]"
                                  : "text-neutral-600"
                              }`}
                            >
                              {style.name}
                            </span>
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={scrollRingStylesRight}
                        aria-label="Scroll ring styles right"
                        className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                      >
                        <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-[#8D8A91]" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Diamond Origin - Mobile-First Responsive */}
                <div>
                  <h3 className="flex items-center gap-2 md:gap-3 mb-3 text-sm md:text-base">
                    Diamond Origin{" "}
                    <button
                      type="button"
                      className={`w-4 h-4 flex items-center justify-center rounded-full transition-colors text-white text-[0.5rem] relative ${
                        showTooltip ? "bg-[#328F94]" : "bg-[#ABA7AF]"
                      }`}
                      onClick={() => setShowTooltip((prev) => !prev)}
                    >
                      i
                      {showTooltip && (
                        <div className="absolute -top-16 left-[60%] w-[280px] md:w-[400px] -translate-y-1/2 ml-2 px-3 py-2 rounded bg-black text-white text-xs shadow-lg z-20">
                          <ol className="text-start">
                            <li>
                              1. Natural Diamond:
                              <br /> Formed deep in the Earth over billions of
                              years; rare and unique.
                            </li>
                            <li>
                              2. Lab Grown Diamond:
                              <br /> Created in a lab using advanced technology;
                              environmentally friendly.
                            </li>
                          </ol>
                        </div>
                      )}
                    </button>
                    <span className="text-[#328F94] underline text-xs md:text-sm">
                      Stone Guide
                    </span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {["Natural Diamond", "Lab Grown Diamond"].map((origin) => (
                      <button
                        key={origin}
                        onClick={() => setSelectedDiamondOrigin(origin)}
                        className={`px-3 py-2 rounded-full border text-xs md:text-sm font-medium text-center ${
                          selectedDiamondOrigin === origin
                            ? "border-[#328F94] text-[#328F94] bg-[#328F94]/5"
                            : "border-neutral-600 text-neutral-600"
                        }`}
                      >
                        {origin}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Diamond Shape - Mobile Grid Adjustment */}
                <div className="w-full">
                  <h3 className="mb-3 text-sm md:text-base">
                    Diamond Shape:{" "}
                    <span className="text-[#8D8A91]">
                      {selectedDiamondShape}
                    </span>
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 w-full">
                    {diamondShapes.shapes.map((diamond, index) => (
                      <button
                        key={`${diamond.name}-${index}`}
                        onClick={() => setSelectedDiamondShape(diamond.name)}
                        className={`group relative aspect-square border rounded-lg flex flex-col items-center justify-center text-xs p-2 ${
                          selectedDiamondShape === diamond.name
                            ? "border-primary bg-primary/5"
                            : "border-neutral-300"
                        }`}
                      >
                        <img
                          className="w-8 sm:w-12 md:w-16 lg:w-20 max-w-full h-auto"
                          src={diamond.img}
                          alt={diamond.name}
                        />
                        <span className="absolute bottom-[-16px] right-[-32px] px-3 py-2 rounded bg-black text-white text-base opacity-0 pointer-events-none transition-opacity duration-150 group-hover:opacity-100 z-10 whitespace-nowrap">
                          <p className="text-xs">{diamond.name}</p>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Diamond Lab & Clarity */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs mb-2">Diamond Size</label>
                    <Select
                      value={selectedClarity}
                      onValueChange={setSelectedClarity}
                    >
                      <SelectTrigger className="text-sm border-neutral-300">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="vvs1">Center Stone</SelectItem>
                        <SelectItem value="vvs2">VVS2</SelectItem>
                        <SelectItem value="vs1">VS1</SelectItem>
                        <SelectItem value="vs2">VS2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-xs mb-2">Color Band</label>
                    <Select>
                      <SelectTrigger className="text-sm border-neutral-300">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="d">D</SelectItem>
                        <SelectItem value="e">E</SelectItem>
                        <SelectItem value="f">F</SelectItem>
                        <SelectItem value="g">G</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Metal Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs mb-2">Metal Type</label>
                    <Select>
                      <SelectTrigger className="text-sm border-neutral-300">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {sampleProduct.metalTypes.map((type, index) => (
                          <SelectItem key={index} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <h3 className="mb-1 text-sm">Select Gold Karat</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={scrollMetalTypesLeft}
                        aria-label="Scroll metal types left"
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <ChevronLeft className="w-5 h-5 text-[#8D8A91]" />
                      </button>
                      <div
                        ref={metalTypesRef}
                        className="flex gap-2 overflow-x-hidden scroll-smooth flex-1"
                      >
                        {sampleProduct.metalTypes.map((type) => (
                          <button
                            key={type}
                            onClick={() => setSelectedMetalType(type)}
                            className={`px-3 py-1.5 rounded-full border text-xs min-w-max whitespace-nowrap ${
                              selectedMetalType === type
                                ? "border-[#328F94] bg-[#328F94]/10 text-[#328F94]"
                                : "border-neutral-600 text-neutral-600"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={scrollMetalTypesRight}
                        aria-label="Scroll metal types right"
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <ChevronRight className="w-5 h-5 text-[#8D8A91]" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Metal Color - Same responsive pattern as ProductDetail */}
                <div className="w-full">
                  <h3 className="mb-3 text-sm md:text-base">
                    Metal Color: {selectedMetalColor}
                  </h3>

                  {/* Desktop View - 7 columns, 2 rows */}
                  <div className="hidden md:grid grid-cols-7 gap-3">
                    {metalColors.map((colorOption, index) => (
                      <button
                        key={`${colorOption.name}-${index}`}
                        onClick={() => setSelectedMetalColor(colorOption.name)}
                        className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-105 ${
                          selectedMetalColor === colorOption.name
                            ? "border-[#328F94] ring-2 ring-[#328F94]/20"
                            : "border-neutral-300 hover:border-neutral-400"
                        }`}
                        title={colorOption.name}
                      >
                        <img
                          className="w-full h-full object-cover rounded-full"
                          src={colorOption.img}
                          alt={colorOption.name}
                        />
                      </button>
                    ))}
                  </div>

                  {/* Mobile View - 5 columns with show more */}
                  <div className="md:hidden w-full">
                    <div className="grid grid-cols-5 gap-2 sm:gap-3">
                      {(showAllColors
                        ? metalColors
                        : metalColors.slice(0, 10)
                      ).map((colorOption, index) => (
                        <button
                          key={`${colorOption.name}-${index}`}
                          onClick={() =>
                            setSelectedMetalColor(colorOption.name)
                          }
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all hover:scale-105 ${
                            selectedMetalColor === colorOption.name
                              ? "border-[#328F94] ring-2 ring-[#328F94]/20"
                              : "border-neutral-300 hover:border-neutral-400"
                          }`}
                          title={colorOption.name}
                        >
                          <img
                            className="w-full h-full object-cover rounded-full"
                            src={colorOption.img}
                            alt={colorOption.name}
                          />
                        </button>
                      ))}
                    </div>

                    {/* Show More/Less buttons */}
                    {!showAllColors && metalColors.length > 10 && (
                      <button
                        onClick={() => setShowAllColors(true)}
                        className="mt-3 text-sm text-[#328F94] font-medium hover:underline"
                      >
                        Show More ({metalColors.length - 10} more)
                      </button>
                    )}

                    {showAllColors && (
                      <button
                        onClick={() => setShowAllColors(false)}
                        className="mt-3 text-sm text-[#328F94] font-medium hover:underline"
                      >
                        Show Less
                      </button>
                    )}
                  </div>
                </div>

                {/* Ring Size - Full width on mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2">Ring Size</label>
                    <Select
                      value={selectedSize}
                      onValueChange={setSelectedSize}
                    >
                      <SelectTrigger className="text-sm border-neutral-300 h-10 md:h-11">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {ringSizes.map((size) => (
                          <SelectItem key={size} value={size}>
                            Size {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Ring Size Guide */}
                <Link
                  to={"/ring-size-guide"}
                  className="text-sm text-primary font-medium underline block"
                >
                  Ring Size Guide
                </Link>

                {/* Free Engraving */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="engraving"
                    checked={showEngraveModal}
                    onChange={(e) => setShowEngraveModal(e.target.checked)}
                    className="border-primary accent-[#68C5C0] w-4 h-4"
                  />
                  <label
                    htmlFor="engraving"
                    className="text-sm text-primary cursor-pointer"
                  >
                    Add Free Engraving
                  </label>
                </div>

                {/* Engrave Modal Pop-Up */}
                {showEngraveModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="relative w-full h-full bg-white overflow-auto">
                      <Engrave onClose={() => setShowEngraveModal(false)} />
                    </div>
                  </div>
                )}

                {/* Estimated Ship Date */}
                <div className="text-sm">
                  <div className="font-medium">
                    Estimated Ship Date: Monday, October 21st
                  </div>
                  <div className="text-muted-foreground">
                    Free Shipping | Free Returns
                  </div>
                </div>

                {/* Action Buttons - Stack on very small screens */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <Button className="w-full bg-[#328F94] hover:bg-[#328F94]/90 text-white py-3">
                    Buy Now
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-[#328F94] text-[#328F94] py-3"
                  >
                    Add To Cart
                  </Button>
                </div>

                {/* Trust Badges - Center on mobile */}
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <img
                    className="w-6 h-6 md:w-8 md:h-8"
                    src="/Hallmarks/BIS.png"
                    alt="Hallmark"
                  />
                  <img
                    className="w-6 h-6 md:w-8 md:h-8"
                    src="/Hallmarks/IGI.png"
                    alt="IGI"
                  />
                  <img
                    className="w-6 h-6 md:w-8 md:h-8"
                    src="/Hallmarks/SGL.png"
                    alt="SGA"
                  />
                </div>

                {/* Share Options - Stack on mobile */}
                <div>
                  <h3 className="font-medium mb-3 text-sm">Share</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 text-[#328F94] gap-2 md:gap-3">
                    <Button
                      size="sm"
                      className="flex items-center justify-center gap-2 text-xs"
                    >
                      <Mail size={14} />
                      Email
                    </Button>
                    <Button
                      size="sm"
                      className="flex items-center justify-center gap-2 text-xs"
                    >
                      <MessageCircle size={14} />
                      WhatsApp
                    </Button>
                    <Button
                      size="sm"
                      className="flex items-center justify-center gap-2 text-xs"
                    >
                      <Share2 size={14} />
                      Copy Link
                    </Button>
                  </div>
                </div>
              </div>
            }
          />

          {/* FAQ Section */}
          <div className="mt-16">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="details">
                <AccordionTrigger className="text-lg text-[#328F94] font-semibold">
                  Details
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <div>
                    <h4 className="font-medium mb-2">Product Specifications</h4>
                    <p className="text-muted-foreground text-sm">
                      This exquisite piece features premium lab-grown diamonds
                      with exceptional clarity and brilliance. Crafted with
                      precision in your choice of metals, ensuring durability
                      and timeless elegance.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Care Instructions</h4>
                    <p className="text-muted-foreground text-sm">
                      Clean gently with a soft brush and mild soap solution.
                      Store in a dry place away from other jewelry to prevent
                      scratching. Avoid exposure to harsh chemicals and extreme
                      temperatures.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Warranty & Returns</h4>
                    <p className="text-muted-foreground text-sm">
                      Comes with a lifetime warranty against manufacturing
                      defects. 15-day hassle-free returns policy. Free resizing
                      within the first 30 days of purchase.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Reviews Section */}
          <div className="mt-16">
            <ProductReviews />
          </div>
        </div>

        {/* Engrave Modal Overlay - Show as full-screen overlay */}
        {showEngraveModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="relative w-full h-full bg-white overflow-auto">
              <Engrave onClose={() => setShowEngraveModal(false)} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductDetail;
