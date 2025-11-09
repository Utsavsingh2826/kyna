import { useState, useRef, useEffect, useCallback } from "react";
import {
  Star,
  Heart,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Mail,
  MessageCircle,
  Share2,
} from "lucide-react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import Engrave from "./Engrave";
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
// import { Checkbox } from "@/components/ui/checkbox";
import { StickyTwoColumnLayout } from "@/components/StickyTwoColumnLayout";

// Product interface for API data
interface ProductData {
  success: boolean;
  modelSku: string;
  title: string;
  description: string;
  metalTypes: string[];
  goldKarats: (string | number)[];
  diamondShape: string[];
  diamondSize: string[];
  diamondColorClarity: string[];
  isEngraving: boolean;
  engraving: string[];
  variantCount: number;
  firstVariantSku: string;
  sellingPrice: number;
  priceIncomplete: boolean;
  variantImages?: string[];
  chosenVariantSku?: string;
}

// Sample product data - in a real app this would come from API/database
const sampleProduct = {
  id: 1,
  name: "4 2/5 ctw Oval Lab Grown Diamond Bridal Set",
  rating: 4.9,
  reviewCount: 67,
  price: "₹5,224",
  monthlyPrice: "Starting at ₹988/mo",
  description:
    "This stunning 4 2/5 ctw Oval set features an oval lab-grown diamond surrounded by a halo of round diamonds, offering brilliant sparkle and timeless elegance.",
  // images: [
  //   "/product_detail/display.png",
  //   "/product_detail/glb.glb", // This will be rendered as 3D
  //   "/product_detail/display.png",
  //   "/about/2.jpg",
  //   "/product_detail/display.png",
  //   "/about/3.jpg",
  //   "/product_detail/display.png",
  //   "/about/4.jpg",
  // ],
  diamondShapes: [
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
  metalTypes: ["Gold", "Silver", "Platinum", "Palladium", "Titanium", "Cobalt"],
  metalColors: [
    { name: "White Gold", img: "/colors/white.png" },
    { name: "Yellow Gold", img: "/colors/gold.png" },
    { name: "Rose Gold", img: "/colors/rosegold.png" },
    { name: "Silver", color: "#C0C0C0" },
    { name: "Platinum", color: "#E5E4E2" },
  ],
  ringSize: "Select Ring Size",
  estimatedShipDate: "Monday, October 21st",
  inStock: true,
  matchingBands: [
    {
      id: 1,
      name: "Comfort Fit Band",
      image: "/images/collections/bracelet.jpg",
      price: "₹2,999",
    },
    {
      id: 2,
      name: "Petite Shared Prong Half",
      image: "/images/collections/earrings.jpg",
      price: "₹3,999",
    },
    {
      id: 3,
      name: "Petite Shared Prong Three",
      image: "/images/collections/pendant.jpg",
      price: "₹4,999",
    },
  ],
};

interface IjewelViewerProps {
  modelUrl?: string;
  className?: string;
}

const IjewelViewer: React.FC<IjewelViewerProps> = ({ modelUrl, className }) => {
  useEffect(() => {
    // Create script element to load iJewel viewer SDK
    const script = document.createElement("script");
    script.src =
      "https://releases.ijewel3d.com/libs/mini-viewer/0.3.20/bundle.iife.js";
    script.async = true;

    script.onload = () => {
      const container = document.getElementById("ijewel-viewer-container");
      if (!container) return;

      // Project configuration using dynamic modelUrl from props
      const project = {
        modelUrl: modelUrl || "/product_detail/glb.glb", // Fallback to default if no modelUrl provided
        basePath: "",
      };

      // Viewer configuration options
      const viewerOptions = {
        showCard: false,
        showUiButtons: false,
        showLogo: false,
        showConfigurator: false,
      };
      // Initialize the iJewel Viewer on the container element
      new window.ijewelViewer.Viewer(container, project, viewerOptions);
    };

    document.body.appendChild(script);

    // Cleanup script on unmount
    return () => {
      document.body.removeChild(script);
    };
  }, [modelUrl]); // Add modelUrl as dependency

  // Adjust the style of the iJewel Viewer container to make it responsive
  return (
    <div
      id="ijewel-viewer-container"
      className={className}
      style={{
        width: "100%",
        height: "100%",
        aspectRatio: window.innerWidth <= 767 ? "1" : "1 / 2", // Use aspect ratio 1 for mobile view
        maxWidth: window.innerWidth <= 767 ? "100%" : "40vw", // Full width for mobile view
        maxHeight: window.innerWidth <= 767 ? "auto" : "80vh", // Adjust height for mobile view
      }}
    />
  );
};

const ProductDetail = () => {
  const { id, category } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showEngraveModal, setShowEngraveModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedDiamondOrigin, setSelectedDiamondOrigin] =
    useState("Natural Diamond");
  const [selectedDiamondShape, setSelectedDiamondShape] = useState("Oval");
  const [selectedMetalColor, setSelectedMetalColor] = useState("White Gold");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedDiamondSize, setSelectedDiamondSize] = useState("");
  const [selectedGoldKarat, setSelectedGoldKarat] = useState("");
  const [selectedMetalType, setSelectedMetalType] = useState("");

  // Track the original variant format to preserve it
  const [originalVariantFormat, setOriginalVariantFormat] = useState<
    "5-part" | "3-part" | null
  >(null);

  // Separate refs for different scroll containers
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const metalTypesRef = useRef<HTMLDivElement>(null);

  // Helper function to parse karat and set metal type
  const parseKaratAndSetMetalType = useCallback(
    (goldKarat: string, productData: ProductData) => {
      const karatValue = `${goldKarat}kt`;

      // Determine metal type based on karat value
      if (
        karatValue === "18kt" ||
        karatValue === "14kt" ||
        karatValue === "9kt"
      ) {
        // Gold types
        setSelectedMetalType("GOLD");
        setSelectedGoldKarat(karatValue);
        console.log("Set metal type: GOLD, karat:", karatValue);
      } else if (goldKarat === "950") {
        // Platinum
        setSelectedMetalType("PLATINUM");
        setSelectedGoldKarat("950");
        console.log("Set metal type: PLATINUM, purity: 950");
      } else if (goldKarat === "925") {
        // Silver
        setSelectedMetalType("SILVER");
        setSelectedGoldKarat("925");
        console.log("Set metal type: SILVER, purity: 925");
      } else if (productData.goldKarats.includes(karatValue)) {
        // Fallback for other gold karats
        setSelectedMetalType("GOLD");
        setSelectedGoldKarat(karatValue);
        console.log("Set metal type: GOLD (fallback), karat:", karatValue);
      }
    },
    []
  );

  // Parse variant SKU and update UI selections
  // Supports two formats:
  // 5-part: ENG101-CUS-30-18-LGEFVVS (modelSku-shape-carat-karat-specs)
  // 3-part: PD34-18-LGEFVS (modelSku-karat-specs)
  const parseVariantSku = useCallback(
    (variantSku: string, productData: ProductData) => {
      console.log("Parsing variant SKU:", variantSku);

      const parts = variantSku.split("-");
      console.log("Variant parts:", parts);

      if (parts.length === 5) {
        // 5-part format: modelSku-shape-carat-karat-specs
        setOriginalVariantFormat("5-part");
        const [, diamondShape, caratSize, goldKarat, specifications] = parts;

        // Parse diamond shape (CUS = Cushion, etc.)
        const shapeMap: { [key: string]: string } = {
          CUS: "CUSHION",
          EM: "EMERALD",
          OV: "OVAL",
          PRN: "PRINCESS",
          PRS: "PEAR",
          RD: "ROUND",
          MAR: "MARQUISE", // Alternative mapping
          MQ: "MARQUISE", // Primary mapping
          HEA: "HEART",
        };

        if (
          shapeMap[diamondShape] &&
          productData.diamondShape.includes(shapeMap[diamondShape])
        ) {
          setSelectedDiamondShape(shapeMap[diamondShape]);
          console.log("Set diamond shape:", shapeMap[diamondShape]);
        }

        // Parse diamond carat size (30 = 0.30 carat)
        const caratValue = (parseInt(caratSize) / 100).toString();
        if (productData.diamondSize.includes(caratValue)) {
          setSelectedDiamondSize(caratValue);
          console.log("Set diamond carat size:", caratValue);
        }

        // Parse karat and set metal type
        parseKaratAndSetMetalType(goldKarat, productData);

        // Parse diamond origin
        const diamondOrigin = specifications.startsWith("LG")
          ? "Lab Grown Diamond"
          : "Natural Diamond";
        setSelectedDiamondOrigin(diamondOrigin);
        console.log("Set diamond origin:", diamondOrigin);
      } else if (parts.length === 3) {
        // 3-part format: modelSku-karat-specs
        setOriginalVariantFormat("3-part");
        const [, goldKarat, specifications] = parts;

        // Auto-select first available diamond shape
        if (productData.diamondShape && productData.diamondShape.length > 0) {
          setSelectedDiamondShape(productData.diamondShape[0]);
          console.log(
            "Auto-selected diamond shape:",
            productData.diamondShape[0]
          );
        }

        // Auto-select first available diamond size
        if (productData.diamondSize && productData.diamondSize.length > 0) {
          setSelectedDiamondSize(productData.diamondSize[0]);
          console.log(
            "Auto-selected diamond size:",
            productData.diamondSize[0]
          );
        }

        // Parse karat and set metal type
        parseKaratAndSetMetalType(goldKarat, productData);

        // Parse diamond origin
        const diamondOrigin = specifications.startsWith("LG")
          ? "Lab Grown Diamond"
          : "Natural Diamond";
        setSelectedDiamondOrigin(diamondOrigin);
        console.log("Set diamond origin:", diamondOrigin);
      } else {
        console.warn("Invalid variant SKU format:", variantSku);

        // Fallback: auto-select first available options and default to 5-part
        setOriginalVariantFormat("5-part");
        if (productData.diamondShape && productData.diamondShape.length > 0) {
          setSelectedDiamondShape(productData.diamondShape[0]);
        }
        if (productData.diamondSize && productData.diamondSize.length > 0) {
          setSelectedDiamondSize(productData.diamondSize[0]);
        }
        return;
      }
    },
    [parseKaratAndSetMetalType]
  );

  // Fetch product data from API
  useEffect(() => {
    const fetchProductData = async () => {
      if (!id) return;

      console.log("Product Detail params - id:", id, "category:", category);

      try {
        setLoading(true);
        setError(null);

        // First try to fetch by slug, if that fails try by modelSku
        let response = await fetch(
          `http://localhost:5000/api/products/model/${id}`
        );

        // If slug endpoint doesn't work, try the model endpoint
        if (!response.ok) {
          const params = new URLSearchParams(location.search);
          const variantId = params.get("variantId");
          const modelUrl = variantId
            ? `http://localhost:5000/api/products/model/${id}?variantId=${encodeURIComponent(
                variantId
              )}`
            : `http://localhost:5000/api/products/model/${id}`;

          response = await fetch(modelUrl);
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch product: ${response.status}`);
        }

        const data: ProductData = await response.json();
        // Apply API data to component state so the ProductDetail page renders
        // real product information (images, options, price, etc.).
        // Log the response for debugging as well.
        console.log("Product API response:", data);
        setProductData(data);

        // Set initial selected metal type from API data
        if (data.metalTypes && data.metalTypes.length > 0) {
          // This sets the general metal type, keeping for metal color selection
        }

        // Set initial diamond shape if available
        if (data.diamondShape && data.diamondShape.length > 0) {
          setSelectedDiamondShape(String(data.diamondShape[0]));
        }

        // If the API returned images, start on the first one
        if (data.variantImages && data.variantImages.length > 0) {
          setSelectedImage(0);
        }

        // Parse variant SKU from URL and set selections accordingly
        const params = new URLSearchParams(location.search);
        const variantId = params.get("variantId");
        const metalColorParam = params.get("metalColor");

        // Map metal color codes to full names
        const metalColorMap: { [key: string]: string } = {
          WG: "White Gold",
          YG: "Yellow Gold",
          RG: "Rose Gold",
        };

        if (variantId) {
          parseVariantSku(variantId, data);
        } else {
          // Set default metal type if no variant is parsed
          if (data.metalTypes && data.metalTypes.length > 0) {
            setSelectedMetalType(data.metalTypes[0]);
          }
        }

        // Set metal color based on URL parameter
        if (metalColorParam && metalColorMap[metalColorParam]) {
          setSelectedMetalColor(metalColorMap[metalColorParam]);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id, category, location.search, parseVariantSku]);

  // Auto-select appropriate karat when metal type changes
  useEffect(() => {
    if (!selectedMetalType || !productData) return;

    // Get available karats for the selected metal type
    let availableKarats: (string | number)[] = [];
    switch (selectedMetalType) {
      case "GOLD":
        availableKarats = productData.goldKarats.filter((karat) =>
          karat.toString().includes("kt")
        );
        break;
      case "PLATINUM":
        availableKarats = productData.goldKarats.filter(
          (karat) => karat.toString() === "950"
        );
        break;
      case "SILVER":
        availableKarats = productData.goldKarats.filter(
          (karat) => karat.toString() === "925"
        );
        break;
      default:
        availableKarats = productData.goldKarats;
    }

    // Auto-select the appropriate karat based on metal type
    switch (selectedMetalType) {
      case "GOLD":
        // Keep current selection if it's a valid gold karat, otherwise select first available
        if (!selectedGoldKarat || !selectedGoldKarat.includes("kt")) {
          const firstGoldKarat = availableKarats[0];
          if (firstGoldKarat) {
            setSelectedGoldKarat(firstGoldKarat.toString());
          }
        }
        break;
      case "PLATINUM":
        setSelectedGoldKarat("950");
        break;
      case "SILVER":
        setSelectedGoldKarat("925");
        break;
    }
  }, [selectedMetalType, productData, selectedGoldKarat]);

  // Generate variant ID based on current selections
  const generateVariantId = useCallback(() => {
    if (!productData) return null;

    const modelSku = productData.modelSku;

    // Get karat/purity code
    let karatCode = "18";
    if (selectedGoldKarat) {
      if (selectedGoldKarat.includes("kt")) {
        karatCode = selectedGoldKarat.replace("kt", "");
      } else {
        karatCode = selectedGoldKarat; // For 950, 925
      }
    }

    // Determine diamond origin and specifications
    const originCode =
      selectedDiamondOrigin === "Lab Grown Diamond" ? "LG" : "ND";
    const specifications = `${originCode}EFVVS`; // Default specifications

    // Use the original format from the URL instead of auto-determining
    if (originalVariantFormat === "5-part") {
      // Use 5-part format: modelSku-shape-carat-karat-specs
      const shapeCodeMap: { [key: string]: string } = {
        CUSHION: "CUS",
        EMERALD: "EM",
        OVAL: "OV",
        PRINCESS: "PRN",
        PEAR: "PRS",
        ROUND: "RD",
        MARQUISE: "MQ", // Changed to MQ for consistency
        HEART: "HRT",
      };

      const shapeCode = shapeCodeMap[selectedDiamondShape] || "CUS";

      // Convert carat size to integer (0.30 -> 30)
      const caratCode = selectedDiamondSize
        ? String(Math.round(parseFloat(selectedDiamondSize) * 100)).padStart(
            2,
            "0"
          )
        : "30";

      return `${modelSku}-${shapeCode}-${caratCode}-${karatCode}-${specifications}`;
    } else {
      // Use 3-part format: modelSku-karat-specs (default for new products or 3-part format)
      return `${modelSku}-${karatCode}-${specifications}`;
    }
  }, [
    productData,
    selectedDiamondShape,
    selectedDiamondSize,
    selectedGoldKarat,
    selectedDiamondOrigin,
    originalVariantFormat,
  ]);

  // Update variant ID and refetch data
  const updateVariantSelection = useCallback(() => {
    const newVariantId = generateVariantId();
    if (!newVariantId || !id) return;

    console.log("Updating to variant:", newVariantId);

    // Preserve existing metal color parameter
    const currentUrl = new URL(window.location.href);
    const metalColor = currentUrl.searchParams.get("metalColor") || "WG";

    // Update URL with new variant ID and preserve metal color
    const currentPath = category
      ? `/product/${category}/${id}`
      : `/product/${id}`;
    navigate(
      `${currentPath}?variantId=${encodeURIComponent(
        newVariantId
      )}&metalColor=${metalColor}`,
      {
        replace: true,
      }
    );
  }, [generateVariantId, id, category, navigate]);

  // Update metal color and URL parameter
  const updateMetalColor = useCallback(
    (colorName: string) => {
      setSelectedMetalColor(colorName);

      // Map color names to URL codes
      const colorCodeMap: { [key: string]: string } = {
        "White Gold": "WG",
        "Yellow Gold": "YG",
        "Rose Gold": "RG",
      };

      const colorCode = colorCodeMap[colorName] || "WG";

      // Update URL with new metal color parameter
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set("metalColor", colorCode);

      navigate(`${currentUrl.pathname}${currentUrl.search}`, { replace: true });
    },
    [navigate]
  );

  // Update variant when selections change (with debounce)
  useEffect(() => {
    if (
      !productData ||
      !selectedDiamondShape ||
      !selectedDiamondSize ||
      !selectedGoldKarat ||
      !selectedMetalType
    ) {
      return; // Don't update if not all selections are made
    }

    // Debounce the variant update to avoid excessive API calls
    const timeoutId = setTimeout(() => {
      updateVariantSelection();
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [
    selectedDiamondShape,
    selectedDiamondSize,
    selectedGoldKarat,
    selectedMetalType,
    selectedDiamondOrigin,
    productData,
    updateVariantSelection,
  ]);

  // Get available karat values based on selected metal type
  const getAvailableKarats = () => {
    if (!productData || !selectedMetalType) return [];

    switch (selectedMetalType) {
      case "GOLD":
        // Show only kt values for gold (filter out 950 and 925)
        return productData.goldKarats.filter((karat) =>
          karat.toString().includes("kt")
        );
      case "PLATINUM":
        // Show only 950 for platinum
        return productData.goldKarats.filter(
          (karat) => karat.toString() === "950"
        );
      case "SILVER":
        // Show only 925 for silver
        return productData.goldKarats.filter(
          (karat) => karat.toString() === "925"
        );
      default:
        return productData.goldKarats;
    }
  };

  // Get display label for karat values
  const getKaratDisplayLabel = (karat: string | number) => {
    const karatStr = karat.toString();
    if (selectedMetalType === "PLATINUM" && karatStr === "950") {
      return "PT 950";
    } else if (selectedMetalType === "SILVER" && karatStr === "925") {
      return "SLV 925";
    }
    return karatStr;
  };

  // Get section title based on metal type
  const getKaratSectionTitle = () => {
    switch (selectedMetalType) {
      case "GOLD":
        return "Select Gold Karat";
      case "PLATINUM":
        return "Select Platinum Purity";
      case "SILVER":
        return "Select Silver Purity";
      default:
        return "Select Karat/Purity";
    }
  };

  // Improved thumbnail scroll handlers with proper scroll amount
  const scrollThumbnailsUp = () => {
    if (thumbnailsRef.current) {
      thumbnailsRef.current.scrollBy({ top: -72, behavior: "smooth" }); // 64px thumbnail + 8px gap
    }
  };

  const scrollThumbnailsDown = () => {
    if (thumbnailsRef.current) {
      thumbnailsRef.current.scrollBy({ top: 72, behavior: "smooth" }); // 64px thumbnail + 8px gap
    }
  };

  const scrollThumbnailsLeft = () => {
    if (thumbnailsRef.current) {
      thumbnailsRef.current.scrollBy({ left: -72, behavior: "smooth" }); // 64px thumbnail + 8px gap
    }
  };

  const scrollThumbnailsRight = () => {
    if (thumbnailsRef.current) {
      thumbnailsRef.current.scrollBy({ left: 72, behavior: "smooth" }); // 64px thumbnail + 8px gap
    }
  };

  // Metal types scroll handlers
  const scrollMetalTypesLeft = () => {
    if (metalTypesRef.current) {
      metalTypesRef.current.scrollBy({ left: -100, behavior: "smooth" });
    }
  };

  const scrollMetalTypesRight = () => {
    if (metalTypesRef.current) {
      metalTypesRef.current.scrollBy({ left: 100, behavior: "smooth" });
    }
  };

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

  // Show images fetched from API only; do not fall back to local sample images
  const thumbnailImages = productData?.variantImages ?? [];

  // Debug: log the thumbnail images to see what we have
  console.log("Thumbnail images:", thumbnailImages);

  // Function to check if image is a 3D model
  const is3DModel = (imagePath: string, index: number) => {
    const isGLB = index === 1 && imagePath.endsWith(".glb");
    return isGLB || imagePath.endsWith(".glb");
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ fontFamily: "Poppins" }} className="flex justify-center">
        <main className="min-h-screen max-w-6xl bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#328F94] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading product...</p>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error || !productData) {
    return (
      <div style={{ fontFamily: "Poppins" }} className="flex justify-center">
        <main className="min-h-screen max-w-6xl bg-background flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || "Product not found"}</p>
            <Link to="/products" className="text-[#328F94] hover:underline">
              ← Back to Products
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Poppins" }} className="flex justify-center ">
      <SEO
        title={`${productData.title} - Premium Jewelry Collection`}
        description={productData.description}
        canonical={`/product/${id}`}
      />
      <main className="min-h-screen max-w-6xl bg-background">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
            <span>›</span>
            <Link
              to={`/${category || "products"}`}
              className="hover:text-foreground"
            >
              {category
                ? category.charAt(0).toUpperCase() + category.slice(1)
                : "Products"}
            </Link>
            <span>›</span>
            <span className="text-foreground">{productData.title}</span>
          </nav>
        </div>

        <div className="container mx-auto px-4">
          <StickyTwoColumnLayout
            leftColumn={
              <div className="flex gap-4 flex-col md:flex-row">
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
                              This is 3D model
                            </div>
                          </div>
                        ) : (
                          <img
                            src={image}
                            alt={`Product ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={() => {
                              console.log(
                                `Failed to load desktop thumbnail ${
                                  index + 1
                                }:`,
                                image
                              );
                            }}
                            onLoad={() => {
                              console.log(
                                `Loaded desktop thumbnail ${index + 1}`
                              );
                            }}
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
                <div className="flex-1 relative aspect-square bg-neutral-50 rounded-lg overflow-hidden">
                  {/* use the fetched images only */}
                  {(() => {
                    const currentImage = thumbnailImages[selectedImage];
                    console.log(
                      `Main image - selectedImage: ${selectedImage}, currentImage:`,
                      currentImage
                    );
                    if (is3DModel(currentImage || "", selectedImage)) {
                      return (
                        <div className="">
                          <IjewelViewer
                            modelUrl={currentImage}
                            className="w-full h-full object-contain"
                          />
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
                      );
                    }

                    // Static image (non-3D) or no image available
                    if (currentImage) {
                      return (
                        <img
                          src={currentImage}
                          alt={productData?.title || sampleProduct.name}
                          className="w-full h-full object-cover transition-opacity duration-300"
                          onError={() => {
                            console.log(
                              `Failed to load main image:`,
                              currentImage
                            );
                          }}
                          onLoad={() => {
                            console.log(`Loaded main image:`, currentImage);
                          }}
                        />
                      );
                    }

                    return (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        No image available
                      </div>
                    );
                  })()}

                  <div className="absolute bg-[#68C5C0] text-white top-4 left-4 px-2 py-1 rounded-md text-xs font-semibold">
                    15% OFF
                  </div>
                  <button className="absolute top-4 right-4 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                    <Heart size={20} />
                  </button>
                </div>

                {/* Thumbnails for mobile (horizontal) */}
                <div className="flex justify-between md:hidden items-center gap-2 relative">
                  <button
                    onClick={scrollThumbnailsLeft}
                    aria-label="Scroll thumbnails left"
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 bg-white shadow-sm border"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  <div
                    ref={thumbnailsRef}
                    className="flex gap-2 overflow-x-auto scrollbar-hide max-w-[260px]"
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
                              This is 3D model
                            </div>
                          </div>
                        ) : (
                          <img
                            src={image}
                            alt={`Product ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={() => {
                              console.log(
                                `Failed to load mobile thumbnail ${index + 1}:`,
                                image
                              );
                            }}
                            onLoad={() => {
                              console.log(
                                `Loaded mobile thumbnail ${index + 1}`
                              );
                            }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={scrollThumbnailsRight}
                    aria-label="Scroll thumbnails right"
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 bg-white shadow-sm border"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            }
            rightColumn={
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl mb-2">{productData.title}</h1>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">4.9</span>
                    </div>
                    <span className="text-primary text-[#328F94] bg-[#328F94]/5 text-sm">
                      {productData.variantCount} Variants
                    </span>
                  </div>
                  <div className="flex items-end mb-4 gap-4">
                    <div className="text-2xl mb-1">
                      ₹{productData.sellingPrice.toLocaleString()}
                    </div>
                    <div className=" text-sm mb-2 text-[#328F94] ">
                      Starting at ₹
                      {Math.round(
                        productData.sellingPrice / 12
                      ).toLocaleString()}
                      /mo
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">
                    {productData.description}
                  </p>
                </div>

                {/* Diamond Origin */}
                <div>
                  <h3 className="flex items-center gap-3 mb-3 text-sm">
                    Diamond Origin{" "}
                    <button
                      type="button"
                      className={`w-4 h-4 flex items-center justify-center rounded-full transition-colors text-white text-[0.5rem] relative ${
                        showTooltip ? "bg-[#328F94]" : "bg-[#ABA7AF]"
                      }`}
                      onClick={() => setShowTooltip((prev) => !prev)}
                    >
                      i{/* Tooltip: appears on click */}
                      {showTooltip && (
                        <div className="absolute  -top-16 left-[60%] w-[200px] sm:w-[400px] -translate-y-1/2 ml-2 px-3 py-2 rounded bg-black text-white text-xs  shadow-lg z-20">
                          <ol className="text-start ">
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
                    <span className="text-[#328F94] underline">
                      Stone Guide
                    </span>
                  </h3>

                  <div className="flex gap-2">
                    {["Natural Diamond", "Lab Grown Diamond"].map((origin) => (
                      <button
                        key={origin}
                        onClick={() => setSelectedDiamondOrigin(origin)}
                        className={`px-3 py-2 rounded-full border text-xs font-medium ${
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

                {/* Diamond Shape - Only show if diamond shapes are available */}
                {productData.diamondShape &&
                  productData.diamondShape.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-sm">
                        Diamond Shape:{" "}
                        <span className="text-[#8D8A91]">
                          {selectedDiamondShape.charAt(0) +
                            selectedDiamondShape.slice(1).toLowerCase()}
                        </span>
                      </h3>
                      <div className="grid grid-cols-5 gap-2">
                        {sampleProduct.diamondShapes
                          .filter((shape) =>
                            productData.diamondShape.includes(
                              shape.name.toUpperCase()
                            )
                          )
                          .map((shape) => (
                            <button
                              key={shape.name}
                              onClick={() =>
                                setSelectedDiamondShape(
                                  shape.name.toUpperCase()
                                )
                              }
                              className={`group relative aspect-square border rounded-lg flex flex-col items-center justify-center text-xs ${
                                selectedDiamondShape ===
                                shape.name.toUpperCase()
                                  ? "border-primary bg-primary/5"
                                  : "border-neutral-300"
                              }`}
                            >
                              <img
                                className="w-20"
                                src={shape.img}
                                alt={shape.name}
                              />
                              {/* Tooltip: shape name */}
                              <span
                                className="absolute bottom-[-16px] right-[-32px] px-3 py-2 rounded bg-black text-white text-base opacity-0 pointer-events-none transition-opacity duration-150 group-hover:opacity-100"
                                style={{ zIndex: 10 }}
                              >
                                <p className="text-xs">{shape.name}</p>
                              </span>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}

                {/* Diamond Size & Color/Clarity - Only show if data is available */}
                {(productData.diamondSize.length > 0 ||
                  productData.diamondColorClarity.length > 0) && (
                  <div className="grid grid-cols-2 gap-4">
                    {productData.diamondSize.length > 0 && (
                      <div>
                        <label className="block text-xs mb-2">
                          Diamond Size
                        </label>
                        <Select
                          value={selectedDiamondSize}
                          onValueChange={setSelectedDiamondSize}
                        >
                          <SelectTrigger className="text-sm border-neutral-300">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            {productData.diamondSize.map((size, index) => (
                              <SelectItem key={index} value={size}>
                                {parseFloat(size).toFixed(2)} Carat
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {productData.diamondColorClarity.length > 0 && (
                      <div>
                        <label className="block text-xs mb-2">
                          Color & Clarity
                        </label>
                        <Select>
                          <SelectTrigger className="text-sm border-neutral-300">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            {productData.diamondColorClarity.map(
                              (colorClarity, index) => (
                                <SelectItem key={index} value={colorClarity}>
                                  {colorClarity}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                )}

                {/* Metal Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs mb-2">Metal Type</label>
                    <Select
                      value={selectedMetalType}
                      onValueChange={(value) => {
                        setSelectedMetalType(value);
                        // Clear karat selection when metal type changes
                        setSelectedGoldKarat("");
                      }}
                    >
                      <SelectTrigger className="text-sm border-neutral-300">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {productData.metalTypes.map((type, index) => (
                          <SelectItem key={index} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedMetalType && getAvailableKarats().length > 0 && (
                    <div>
                      <h3 className="mb-1 text-sm">{getKaratSectionTitle()}</h3>
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
                          {getAvailableKarats().map((karat, index) => (
                            <button
                              key={index}
                              onClick={() =>
                                setSelectedGoldKarat(karat.toString())
                              }
                              className={`px-3 py-1.5 rounded-full border text-xs min-w-max whitespace-nowrap ${
                                selectedGoldKarat === karat.toString()
                                  ? "border-[#328F94] bg-[#328F94]/10 text-[#328F94]"
                                  : "border-neutral-600 text-neutral-600"
                              }`}
                            >
                              {getKaratDisplayLabel(karat)}
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
                  )}
                </div>

                {/* Metal Color */}
                <div>
                  <h3 className=" mb-3 text-sm">
                    Metal Color: {selectedMetalColor}
                  </h3>
                  <div className="flex gap-3">
                    {sampleProduct.metalColors.map((colorOption) => (
                      <button
                        key={colorOption.name}
                        onClick={() => updateMetalColor(colorOption.name)}
                        className={`w-8 h-8 rounded-full border-2 ${
                          selectedMetalColor === colorOption.name
                            ? "border-[#328F94]"
                            : "border-neutral-300"
                        }`}
                        title={colorOption.name}
                      >
                        <img
                          className="w-full h-full object-cover"
                          src={colorOption.img}
                          alt={colorOption.name}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {category === "rings" && (
                  <>
                    {" "}
                    {/* Ring Size */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-2">Ring Size</label>
                        <Select
                          value={selectedSize}
                          onValueChange={setSelectedSize}
                        >
                          <SelectTrigger className="text-sm border-neutral-300">
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
                  </>
                )}

                {/* Free Engraving - Only show if engraving is available */}
                {productData.isEngraving && (
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
                )}

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
                    Estimated Ship Date: {sampleProduct.estimatedShipDate}
                  </div>
                  <div className="text-muted-foreground">
                    Free Shipping | Free Returns
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <Button className="w-full bg-[#328F94] hover:bg-[#328F94]/90 text-white  py-3">
                    Buy Now
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-[#328F94] text-[#328F94]  py-3"
                  >
                    Add To Cart
                  </Button>
                </div>

                {/* Trust Badges */}
                <div className="flex items-center gap-4">
                  <img
                    className="w-8 h-8"
                    src="/Hallmarks/BIS.png"
                    alt="Hallmark"
                  />
                  <img className="w-8 h-8" src="/Hallmarks/IGI.png" alt="IGI" />
                  <img className="w-8 h-8" src="/Hallmarks/SGL.png" alt="SGA" />
                </div>

                {/* Share Options */}
                <div>
                  <h3 className="font-medium mb-3 text-sm">Share</h3>
                  <div className="flex text-[#328F94] gap-3">
                    <Button
                      size="sm"
                      className="flex items-center gap-2 text-xs"
                    >
                      <Mail size={14} />
                      Email
                    </Button>
                    <Button
                      size="sm"
                      className="flex items-center gap-2 text-xs"
                    >
                      <MessageCircle size={14} />
                      WhatsApp
                    </Button>
                    <Button
                      size="sm"
                      className="flex items-center gap-2 text-xs"
                    >
                      <Share2 size={14} />
                      Copy Link
                    </Button>
                  </div>
                </div>
              </div>
            }
          />

          {/* Matching Wedding Bands */}
          <div className="mt-16">
            <h2 className="text-xl font-bold mb-6">Matching Wedding Bands</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {sampleProduct.matchingBands.map((band) => (
                <div key={band.id} className="text-center">
                  <div className="aspect-square bg-neutral-50 rounded-lg mb-3 overflow-hidden">
                    <img
                      src={band.image}
                      alt={band.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-medium text-sm mb-1">{band.name}</h3>
                  <p className="text-sm text-muted-foreground">{band.price}</p>
                </div>
              ))}
            </div>
          </div>

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

// Refine the type for `ijewelViewer`
declare global {
  interface Window {
    ijewelViewer: {
      Viewer: new (
        container: HTMLElement,
        project: object,
        options: object
      ) => void;
    };
  }
}
