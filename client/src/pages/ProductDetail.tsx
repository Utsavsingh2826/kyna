import { useState, useRef, useEffect, useCallback, useMemo } from "react";
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
  Play,
} from "lucide-react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { addToCart } from "@/store/slices/cartSlice";
import type { RootState, AppDispatch } from "@/store";
import {
  addWishlistItem,
  removeWishlistItemThunk,
  fetchWishlist,
  selectWishlistEntryId,
  selectWishlistInitialized,
  selectWishlistLoading,
} from "@/store/slices/wishlistSlice";
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
import ProductDetailSkeleton from "@/components/ProductDetailSkeleton";

// Product interface for API data
interface ProductData {
  _id: string;
  success: boolean;
  modelSku: string;
  title: string;
  description: string;
  category?: string;
  metalTypes: string[];
  goldKarats: (string | number)[];
  diamondShape: string[];
  diamondSize: string[];
  diamondColorClarity: string[];
  isEngraving: boolean;
  priceBreakdown: {
    metalCost: number;
    diamondCost: number;
    labourCost: number;
    expense: number;
    gstPercent: number;
    gstAmount: number;
    totalBeforeGst: number;
    totalWithGst: number;
  };
  engraving: string[];
  engravingInfo?: {
    fontSize?: number;
  };
  variantCount: number;
  firstVariantSku: string;
  sellingPrice: number;
  priceIncomplete: boolean;
  variantImages?: string[];
  chosenVariantSku?: string;
  netWeightGrams?: number;
  availableColors?: string[];
}

const METAL_COLOR_CODE_MAP: Record<string, string> = {
  "White Gold": "WG",
  "Yellow Gold": "YG",
  "Rose Gold": "RG",
  Platinum: "PL",
  Silver: "SV",
};

// Map color codes to display info (handles both single and combination colors)
const getColorDisplayInfo = (
  code: string
): { name: string; colors: string[]; img: string } | null => {
  // Single colors
  const singleColorMap: Record<string, { name: string; img: string }> = {
    WG: { name: "White Gold", img: "/colors/white.png" },
    YG: { name: "Yellow Gold", img: "/colors/gold.png" },
    RG: { name: "Rose Gold", img: "/colors/rosegold.png" },
    "3T": { name: "Three Tone", img: "/colors/threetone.png" },
  };

  // Check if it's a single color
  if (singleColorMap[code]) {
    return {
      name: singleColorMap[code].name,
      colors: [code],
      img: singleColorMap[code].img,
    };
  }

  // Handle combination colors (e.g., "WG-YG", "WG-RG")
  const parts = code.split("-");
  if (parts.length === 2) {
    const color1 = parts[0];
    const color2 = parts[1];

    // Build combination name
    const getColorName = (c: string) => {
      switch (c) {
        case "WG":
          return "White Gold";
        case "YG":
          return "Yellow Gold";
        case "RG":
          return "Rose Gold";
        case "BR":
          return "Brown";
        default:
          return c;
      }
    };

    // For combinations, use the image from metal_colors folder
    // Check for both the original code and lowercase version
    const combinationImageUrl = `/metal_colors/${code}.png`;

    return {
      name: `${getColorName(color1)} - ${getColorName(color2)}`,
      colors: [color1, color2],
      img: combinationImageUrl, // Use combination image from metal_colors folder
    };
  }

  return null;
};

// Helper function to get hex color codes for fallback display
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
    { name: "Round", img: "/DIAMOND_SHAPES_WEBP/round.png" },
    { name: "Princess", img: "/DIAMOND_SHAPES_WEBP/princess.png" },
    { name: "Emerald", img: "/DIAMOND_SHAPES_WEBP/emerald.png" },
    { name: "Asscher", img: "/DIAMOND_SHAPES_WEBP/asscher.png" },
    { name: "Radiant", img: "/DIAMOND_SHAPES_WEBP/radient.png" },
    { name: "Cushion", img: "/DIAMOND_SHAPES_WEBP/cushion.png" },
    { name: "Oval", img: "/DIAMOND_SHAPES_WEBP/oval.png" },
    { name: "Pear", img: "/DIAMOND_SHAPES_WEBP/pear.png" },
    { name: "Marquise", img: "/DIAMOND_SHAPES_WEBP/marquise.png" },
    { name: "Heart", img: "/DIAMOND_SHAPES_WEBP/heart.png" },
  ],
  metalTypes: ["Gold", "Silver", "Platinum", "Palladium", "Titanium", "Cobalt"],
  metalColors: [
    { name: "White Gold", img: "/metal_colors/Platinum.svg" },
    { name: "Yellow Gold", img: "/colors/gold.png" },
    { name: "Rose Gold", img: "/colors/rosegold.png" },
    { name: "Silver", color: "#C0C0C0" },
    { name: "Platinum", color: "#E5E4E2" },
  ],
  ringSize: "Select Ring Size",
  estimatedShipDate: "Monday, October 21st",
  inStock: true,
};

const ProductDetail = () => {
  const { id, category } = useParams();
  const currentCategorySlug = category || "rings";
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const { loading: cartLoading } = useSelector(
    (state: RootState) => state.cart
  );

  const [productData, setProductData] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showEngraveModal, setShowEngraveModal] = useState(false);
  const [engravingText, setEngravingText] = useState("");
  const [engravingImageUrl, setEngravingImageUrl] = useState("");
  const [engravingMotifPath, setEngravingMotifPath] = useState("");
  const [hasEngraving, setHasEngraving] = useState(false);
  const [isUploadingEngraving, setIsUploadingEngraving] = useState(false);
  const [savedEngravingData, setSavedEngravingData] = useState<{
    text: string;
    motif: string;
    imageUrl: string;
  } | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedDiamondOrigin, setSelectedDiamondOrigin] =
    useState("Natural Diamond");
  const [selectedDiamondShape, setSelectedDiamondShape] = useState("Oval");
  const [selectedMetalColor, setSelectedMetalColor] = useState("White Gold");
  const [selectedColorCode, setSelectedColorCode] = useState("WG"); // Store the color code (e.g., "WG", "WG-RG")
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedBraceletSize, setSelectedBraceletSize] = useState("6");
  const [selectedDiamondSize, setSelectedDiamondSize] = useState("");
  const [selectedGoldKarat, setSelectedGoldKarat] = useState("");
  const [selectedMetalType, setSelectedMetalType] = useState("");
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const [selectedColorClarity, setSelectedColorClarity] = useState("");
  const [is3DModelLoaded, setIs3DModelLoaded] = useState(false);
  const [is3DViewerVisible, setIs3DViewerVisible] = useState(false);

  const activeVariantSku = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return (
      params.get("variantId") ||
      productData?.chosenVariantSku ||
      productData?.firstVariantSku ||
      null
    );
  }, [
    location.search,
    productData?.chosenVariantSku,
    productData?.firstVariantSku,
  ]);

  const currentMetalColorCode = selectedColorCode || "WG";

  const wishlistInitialized = useSelector(selectWishlistInitialized);
  const wishlistLoading = useSelector(selectWishlistLoading);
  const wishlistEntryId = useSelector((state: RootState) => {
    if (!productData?._id) return undefined;
    return selectWishlistEntryId(
      state,
      productData._id,
      activeVariantSku,
      currentMetalColorCode
    );
  });
  const isInWishlist = Boolean(wishlistEntryId);

  // Track the original variant format to preserve it
  const [originalVariantFormat, setOriginalVariantFormat] = useState<
    "5-part" | "3-part" | null
  >(null);

  useEffect(() => {
    if (isAuthenticated && !wishlistInitialized && !wishlistLoading) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated, wishlistInitialized, wishlistLoading]);

  // Separate refs for different scroll containers
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const metalTypesRef = useRef<HTMLDivElement>(null);
  const mainViewerRef = useRef<HTMLDivElement | null>(null);

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
        // console.log("Set metal type: GOLD, karat:", karatValue);
      } else if (goldKarat === "950") {
        // Platinum
        setSelectedMetalType("PLATINUM");
        setSelectedGoldKarat("950");
        // console.log("Set metal type: PLATINUM, purity: 950");
      } else if (goldKarat === "925") {
        // Silver
        setSelectedMetalType("SILVER");
        setSelectedGoldKarat("925");
        // console.log("Set metal type: SILVER, purity: 925");
      } else if (productData.goldKarats.includes(karatValue)) {
        // Fallback for other gold karats
        setSelectedMetalType("GOLD");
        setSelectedGoldKarat(karatValue);
        // console.log("Set metal type: GOLD (fallback), karat:", karatValue);
      }
    },
    []
  );

  // Parse variant SKU and update UI selections
  // Supports three formats:
  // 6-part (bracelets): BR1-RD-30-18-LGEFVVS-6 (modelSku-shape-carat-karat-specs-size)
  // 5-part: ENG101-CUS-30-18-LGEFVVS (modelSku-shape-carat-karat-specs)
  // 3-part: PD34-18-LGEFVS (modelSku-karat-specs)
  const parseVariantSku = useCallback(
    (variantSku: string, productData: ProductData) => {
      console.log("Parsing variant SKU:", variantSku);

      const parts = variantSku.split("-");
      console.log("Variant parts:", parts);

      if (parts.length === 6) {
        // 6-part format: modelSku-shape-carat-karat-specs-size (bracelets)
        setOriginalVariantFormat("5-part");
        const [
          ,
          diamondShape,
          caratSize,
          goldKarat,
          specifications,
          braceletSize,
        ] = parts;

        // Apply bracelet size
        if (braceletSize && ["6", "7", "8"].includes(braceletSize)) {
          setSelectedBraceletSize(braceletSize);
        }

        const shapeMap: { [key: string]: string } = {
          CUS: "CUSHION",
          EM: "EMERALD",
          OV: "OVAL",
          PRN: "PRINCESS",
          PRS: "PEAR",
          RD: "ROUND",
          MAR: "MARQUISE",
          MQ: "MARQUISE",
          HEA: "HEART",
        };

        if (
          shapeMap[diamondShape] &&
          productData.diamondShape.includes(shapeMap[diamondShape])
        ) {
          setSelectedDiamondShape(shapeMap[diamondShape]);
        }

        const caratValue = (parseInt(caratSize) / 100).toString();
        if (productData.diamondSize.includes(caratValue)) {
          setSelectedDiamondSize(caratValue);
        }

        parseKaratAndSetMetalType(goldKarat, productData);

        const diamondOrigin = specifications.startsWith("LG")
          ? "Lab Grown Diamond"
          : "Natural Diamond";
        setSelectedDiamondOrigin(diamondOrigin);

        const clarity = specifications.replace(/^LG|^ND/, "");
        setSelectedColorClarity((prev) => {
          if (prev) return prev;
          if (productData.diamondColorClarity.includes(clarity)) return clarity;
          return prev;
        });
      } else if (parts.length === 5) {
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

        const clarity = specifications.replace(/^LG|^ND/, "");
        // Only set clarity IF user has NOT selected one
        setSelectedColorClarity((prev) => {
          if (prev) return prev; // user-selected -> do not override
          if (productData.diamondColorClarity.includes(clarity)) return clarity;
          return prev;
        });

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
        let response = await fetch(`/api/products/model/slug/${id}?var`);

        // If slug endpoint doesn't work, try the model endpoint
        if (!response.ok) {
          const params = new URLSearchParams(location.search);
          const variantId = params.get("variantId");
          const modelUrl = variantId
            ? `/api/products/model/${id}?variantId=${encodeURIComponent(
                variantId
              )}/&metalColor=${params.get("metalColor") || "WG"}`
            : `/api/products/model/${id}`;

          response = await fetch(modelUrl);
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch product: ${response.status}`);
        }

        const data: ProductData = await response.json();
        // Apply API data to component state so the ProductDetail page renders
        // real product information (images, options, price, etc.).
        // Log the response for debugging as well.
        setProductData(data);
        // If metal type is still empty, set default
        if (!selectedMetalType) {
          if (data.metalTypes.includes("GOLD")) {
            setSelectedMetalType("GOLD");
          } else {
            setSelectedMetalType(data.metalTypes[0]);
          }
        }

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

        if (variantId) {
          parseVariantSku(variantId, data);
          // If parsed variant did not yield a clarity selection, default to first available
          // This ensures pendants/earrings also get a sensible default clarity like rings.
          if (
            (!selectedColorClarity || selectedColorClarity.length === 0) &&
            data.diamondColorClarity &&
            data.diamondColorClarity.length > 0
          ) {
            setSelectedColorClarity(String(data.diamondColorClarity[0]));
          }
        } else {
          // Set default metal type if no variant is parsed
          if (data.metalTypes && data.metalTypes.length > 0) {
            setSelectedMetalType(data.metalTypes[0]);
          }
        }

        // Set metal color based on URL parameter AFTER variant parsing
        // This supports both single colors (WG, YG, RG) and combinations (WG-YG, WG-RG)
        if (metalColorParam) {
          const colorInfo = getColorDisplayInfo(metalColorParam);
          if (colorInfo) {
            console.log(
              `Setting metal color from URL: ${metalColorParam} -> ${colorInfo.name}`
            );
            setSelectedMetalColor(colorInfo.name);
            setSelectedColorCode(metalColorParam);
          } else {
            console.log("Invalid metal color in URL:", metalColorParam);
            // Fallback to first available color if available
            if (data.availableColors && data.availableColors.length > 0) {
              const firstColorInfo = getColorDisplayInfo(
                data.availableColors[0]
              );
              if (firstColorInfo) {
                setSelectedMetalColor(firstColorInfo.name);
                setSelectedColorCode(data.availableColors[0]);
              }
            }
          }
        } else {
          // No metalColor in URL, use first available color
          if (data.availableColors && data.availableColors.length > 0) {
            const firstColorInfo = getColorDisplayInfo(data.availableColors[0]);
            if (firstColorInfo) {
              console.log(
                `Setting default metal color: ${firstColorInfo.name}`
              );
              setSelectedMetalColor(firstColorInfo.name);
              setSelectedColorCode(data.availableColors[0]);
            }
          }
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

  // ---------- iJewel Preload (Silent) ----------
  useEffect(() => {
    if (!productData) return;
    if ((window as any).__ijewelPreloadLoaded) return;

    const glb =
      (productData.variantImages || []).find(
        (u: string) => !!u && u.endsWith && u.endsWith(".glb")
      ) ||
      (productData.variantImages && productData.variantImages[1]) ||
      "";

    const preloadContainerId = "ijewel-preload";

    // ensure hidden container exists
    let hidden = document.getElementById(preloadContainerId);
    if (!hidden) {
      hidden = document.createElement("div");
      hidden.id = preloadContainerId;
      hidden.style.width = "0px";
      hidden.style.height = "0px";
      hidden.style.overflow = "hidden";
      hidden.style.position = "absolute";
      hidden.style.left = "-9999px";
      hidden.style.top = "-9999px";
      document.body.appendChild(hidden);
    }

    const script = document.createElement("script");
    script.src =
      "https://releases.ijewel3d.com/libs/mini-viewer/0.3.20/bundle.iife.js";
    script.async = true;

    script.onload = () => {
      try {
        const container = document.getElementById(preloadContainerId);
        if (!container || !(window as any).ijewelViewer) return;
        const project = {
          modelUrl: glb || "/product_detail/glb.glb",
          basePath: "",
        };
        const viewerOptions = {
          showCard: false,
          showUiButtons: false,
          showLogo: false,
          showConfigurator: false,
        };
        const pre = new (window as any).ijewelViewer.Viewer(
          container,
          project,
          viewerOptions
        );
        (window as any).__ijewelPreloadViewer = pre;
        (window as any).__ijewelPreloadLoaded = true;
        setIs3DModelLoaded(true);
      } catch (err) {
        console.warn("iJewel preload failed:", err);
      }
    };

    script.onerror = (e) => {
      console.warn("Failed to load iJewel script for preload", e);
    };

    document.body.appendChild(script);

    // Do not remove script/container on cleanup — keep preload alive
    return () => {};
  }, [productData]);

  // Separate useEffect to handle URL parameter changes for metal color
  // This ensures that URL parameters always take precedence
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const metalColorParam = params.get("metalColor");

    const metalColorMap: { [key: string]: string } = {
      WG: "White Gold",
      YG: "Yellow Gold",
      RG: "Rose Gold",
    };

    if (metalColorParam && metalColorMap[metalColorParam]) {
      const targetColor = metalColorMap[metalColorParam];
      if (selectedMetalColor !== targetColor) {
        console.log(
          `URL parameter override - Setting metal color: ${metalColorParam} -> ${targetColor}`
        );
        setSelectedMetalColor(targetColor);
      }
    }
  }, [location.search, selectedMetalColor]);

  // Generate variant ID based on current selections
  const generateVariantId = useCallback(() => {
    if (!productData) return null;

    // Bracelets always use 6-part SKU with size as last token
    if (category === "bracelets") {
      const modelSku = productData.modelSku;
      const originCode =
        selectedDiamondOrigin === "Lab Grown Diamond" ? "LG" : "ND";
      const specifications = `${originCode}${selectedColorClarity}`;

      const shapeCodeMap: { [key: string]: string } = {
        CUSHION: "CUS",
        EMERALD: "EM",
        OVAL: "OV",
        PRINCESS: "PRN",
        PEAR: "PRS",
        ROUND: "RD",
        MARQUISE: "MQ",
        HEART: "HRT",
      };

      const shapeCode = shapeCodeMap[selectedDiamondShape] || "CUS";
      const caratCode = selectedDiamondSize
        ? String(Math.round(parseFloat(selectedDiamondSize) * 100)).padStart(
            2,
            "0"
          )
        : "30";

      const metalCodeMap: { [key: string]: string } = {
        GOLD: "",
        PLATINUM: "PT",
        SILVER: "SLV",
      };

      let karatCode = "18";
      if (selectedMetalType === "GOLD") {
        karatCode = selectedGoldKarat.includes("kt")
          ? selectedGoldKarat.replace("kt", "")
          : selectedGoldKarat;
      } else {
        karatCode = metalCodeMap[selectedMetalType];
      }

      return `${modelSku}-${shapeCode}-${caratCode}-${karatCode}-${specifications}-${selectedBraceletSize}`;
    }

    const modelSku = productData.modelSku;

    // Get karat/purity code
    // let karatCode = "18";
    // if (selectedGoldKarat) {
    //   if (selectedGoldKarat.includes("kt")) {
    //     karatCode = selectedGoldKarat.replace("kt", "");
    //   } else {
    //     karatCode = selectedGoldKarat; // For 950, 925
    //   }
    // }

    let karatCode = "18";

    // Prefix mapping for metal types
    const metalCodeMap: { [key: string]: string } = {
      GOLD: "", // Gold → no prefix, numbers only
      PLATINUM: "PT", // Platinum → PT
      SILVER: "SLV", // Silver → SLV
    };

    if (selectedMetalType === "GOLD") {
      // For gold use numeric karat 18kt → 18
      karatCode = selectedGoldKarat.includes("kt")
        ? selectedGoldKarat.replace("kt", "")
        : selectedGoldKarat; // fallback
    } else {
      // PLATINUM or SILVER → return PT or SLV only
      karatCode = metalCodeMap[selectedMetalType];
    }

    // Determine diamond origin and specifications
    const originCode =
      selectedDiamondOrigin === "Lab Grown Diamond" ? "LG" : "ND";
    const specifications = `${originCode}${selectedColorClarity}`;

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
    selectedMetalType,
    originalVariantFormat,
    selectedColorClarity,
    category,
    selectedBraceletSize,
  ]);

  // Update variant ID and refetch data
  const updateVariantSelection = useCallback(() => {
    const newVariantId = generateVariantId();
    if (!newVariantId || !id) return;

    console.log("Updating to variant:", newVariantId);
    console.log(productData?.diamondColorClarity);

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
  }, [
    generateVariantId,
    id,
    category,
    navigate,
    productData?.diamondColorClarity,
  ]);

  // Refetch product data with current variant and metal color
  const refetchProductData = useCallback(async () => {
    if (!id) return;

    const currentVariantId = generateVariantId();
    if (!currentVariantId) return;

    // Use the selectedColorCode directly since it can be single or combination
    const metalCode = selectedColorCode || "WG";

    const response = await fetch(
      `/api/products/model/${id}?variantId=${currentVariantId}&metalColor=${metalCode}`
    );

    if (!response.ok) return;

    const newData = await response.json();

    // Only update if price and image actually changed
    if (
      newData.sellingPrice !== productData?.sellingPrice ||
      newData.variantImages?.[0] !== productData?.variantImages?.[0]
    ) {
      setProductData(newData);
    }
  }, [
    id,
    selectedColorCode,
    generateVariantId,
    productData?.sellingPrice,
    productData?.variantImages,
  ]);

  useEffect(() => {
    if (!productData) return;

    const newVariantId = generateVariantId();
    if (!newVariantId) return;

    // If the generated variantId is same as API one => do NOT refetch
    if (productData.chosenVariantSku === newVariantId) {
      return;
    }

    // Debounce to prevent spam
    const debounce = setTimeout(() => {
      updateVariantSelection(); // updates URL
      refetchProductData(); // fetch new data
    }, 600);

    return () => clearTimeout(debounce);
  }, [
    selectedDiamondShape,
    selectedDiamondSize,
    selectedDiamondOrigin,
    selectedGoldKarat,
    selectedMetalType,
    selectedMetalColor,
    selectedColorClarity,
    selectedBraceletSize,
    productData,
    generateVariantId,
    updateVariantSelection,
    refetchProductData,
  ]);

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

  // Reset engraving when diamond shape or metal color changes
  useEffect(() => {
    if (hasEngraving) {
      // console.log("🔄 Resetting engraving due to product variant change");
      setEngravingText("");
      setEngravingImageUrl("");
      setEngravingMotifPath("");
      setHasEngraving(false);
      setSavedEngravingData(null);
    }
  }, [selectedDiamondShape, selectedMetalColor]);

  // Update metal color and URL parameter
  const updateMetalColor = useCallback(
    (colorCode: string) => {
      // Get display info from color code
      const colorInfo = getColorDisplayInfo(colorCode);

      if (colorInfo) {
        setSelectedMetalColor(colorInfo.name);
        setSelectedColorCode(colorCode); // Store the code for API requests

        // Update URL with new metal color parameter
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set("metalColor", colorCode); // Use the actual code

        navigate(`${currentUrl.pathname}${currentUrl.search}`, {
          replace: true,
        });
      }
    },
    [navigate]
  );

  const handleWishlistToggle = useCallback(
    (event?: React.MouseEvent) => {
      event?.preventDefault();
      event?.stopPropagation();

      if (!isAuthenticated) {
        navigate("/login");
        return;
      }

      if (!productData?._id) {
        alert("Product information is missing. Please try again.");
        return;
      }

      if (wishlistEntryId) {
        dispatch(removeWishlistItemThunk(wishlistEntryId));
        return;
      }

      const primaryImage =
        productData.variantImages?.[selectedImage] ||
        productData.variantImages?.[0] ||
        null;

      dispatch(
        addWishlistItem({
          productId: productData._id,
          modelSku: productData.modelSku || id || "",
          categorySlug: currentCategorySlug,
          categoryLabel: productData.category || currentCategorySlug,
          variantSku: activeVariantSku,
          metalColorName: selectedMetalColor,
          metalColorCode: currentMetalColorCode,
          primaryImage,
          price:
            typeof productData.sellingPrice === "number"
              ? productData.sellingPrice
              : typeof productData.priceBreakdown?.totalWithGst === "number"
              ? productData.priceBreakdown.totalWithGst
              : null,
          engraving:
            hasEngraving &&
            (engravingText || engravingMotifPath || engravingImageUrl)
              ? {
                  text: engravingText || undefined,
                  motif: engravingMotifPath || undefined,
                  imageUrl: engravingImageUrl || undefined,
                }
              : undefined,
        })
      );
    },
    [
      activeVariantSku,
      currentCategorySlug,
      currentMetalColorCode,
      dispatch,
      engravingImageUrl,
      engravingMotifPath,
      engravingText,
      hasEngraving,
      id,
      isAuthenticated,
      navigate,
      productData,
      selectedMetalColor,
      wishlistEntryId,
      selectedImage,
    ]
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
    selectedColorClarity,
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

  // Handle Add to Cart
  const handleAddToCart = useCallback(async () => {
    if (!isAuthenticated) {
      alert("Please log in to add items to cart");
      navigate("/login");
      return;
    }

    if (!productData || !productData.chosenVariantSku) {
      alert("Please select all product options");
      return;
    }

    try {
      const currentVariantSku =
        generateVariantId() ||
        productData.chosenVariantSku ||
        productData.firstVariantSku;

      const variantData = {
        variantSku: currentVariantSku,
        variantConfig: {
          metalColor: selectedMetalColor,
          metalColorCode: selectedColorCode, // Add the color code for API requests
          metalType: selectedMetalType,
          goldKarat: selectedGoldKarat,
          diamondShape: selectedDiamondShape,
          diamondSize: selectedDiamondSize,
          diamondOrigin: selectedDiamondOrigin,
          ringSize: selectedSize,
          variantImages: productData.variantImages || [], // Include variant images
          sellingPrice: productData.sellingPrice || 0, // Include variant price
          priceBreakdown: productData.priceBreakdown || null, // Include price breakdown
          // Include engraving data
          hasEngraving: hasEngraving,
          engravingText: hasEngraving ? engravingText : undefined,
          engravingMotifPath: hasEngraving ? engravingMotifPath : undefined,
          engravingImageUrl: hasEngraving ? engravingImageUrl : undefined,
        },
      };

      console.log("Adding to cart - Product:", {
        productId: productData._id,
        modelSku: productData.modelSku,
        variantSku: currentVariantSku,
        title: productData.title,
        price: productData.sellingPrice,
        variantConfig: variantData.variantConfig,
        variantImages: productData.variantImages,
      });

      // Use the product's MongoDB _id for cart operations with variant data
      await dispatch(addToCart(productData._id, 1, variantData));
      alert("Product added to cart successfully!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add product to cart");
    }
  }, [
    isAuthenticated,
    navigate,
    productData,
    selectedMetalColor,
    selectedColorCode,
    selectedMetalType,
    selectedGoldKarat,
    selectedDiamondShape,
    selectedDiamondSize,
    selectedDiamondOrigin,
    selectedSize,
    dispatch,
    hasEngraving,
    engravingText,
    engravingMotifPath,
    engravingImageUrl,
    generateVariantId,
  ]);

  // Upload engraving data to backend
  const uploadEngravingToBackend = useCallback(
    async (text: string, motifPath: string): Promise<string | null> => {
      try {
        const formData = new FormData();

        // Fetch the actual engraved image blob from the blob URL
        if (engravingImageUrl && engravingImageUrl.startsWith("blob:")) {
          console.log(
            "🎨 Fetching engraved image from blob URL:",
            engravingImageUrl
          );
          const response = await fetch(engravingImageUrl);
          const blob = await response.blob();
          formData.append("image", blob, "engraving.png");
        } else {
          console.warn(
            "⚠️ No valid engraving image URL found, using placeholder"
          );
          const response = await fetch("/rings.jpg");
          const blob = await response.blob();
          formData.append("image", blob, "engraving.png");
        }

        formData.append("text", text);
        formData.append("motifPath", motifPath);

        const uploadResponse = await fetch("/api/upload/engraving", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error(`Upload failed: ${uploadResponse.status}`);
        }

        const result = await uploadResponse.json();
        return result.data.imageUrl;
      } catch (error) {
        console.error("Error uploading engraving to backend:", error);
        return null;
      }
    },
    [engravingImageUrl]
  );

  // Generate and upload engraving data
  const generateAndUploadEngravingImage = useCallback(async (): Promise<
    string | null
  > => {
    if (!hasEngraving) return null;

    try {
      console.log("🎨 Uploading engraving data:", {
        engravingText,
        motifPath: engravingMotifPath,
      });

      // Upload engraving data to backend
      const uploadedUrl = await uploadEngravingToBackend(
        engravingText,
        engravingMotifPath
      );
      return uploadedUrl;
    } catch (error) {
      console.error("Error generating and uploading engraving image:", error);
      return null;
    }
  }, [
    hasEngraving,
    engravingText,
    engravingMotifPath,
    productData,
    uploadEngravingToBackend,
  ]);

  // Handle Buy Now
  const handleBuyNow = useCallback(async () => {
    if (!isAuthenticated) {
      alert("Please log in to purchase");
      navigate("/login");
      return;
    }

    if (category === "rings") {
      if (!selectedSize) {
        alert("Please select a ring size");
        return;
      }
    }

    if (!productData || !productData.chosenVariantSku) {
      alert("Please select all product options");
      return;
    }

    // Upload engraving image to Cloudinary if engraving is applied
    let cloudinaryEngravingUrl = null;
    if (hasEngraving) {
      console.log("🎨 Uploading engraving image to Cloudinary...");
      setIsUploadingEngraving(true);

      try {
        cloudinaryEngravingUrl = await generateAndUploadEngravingImage();
        if (!cloudinaryEngravingUrl) {
          alert("Failed to upload engraving image. Please try again.");
          return;
        }
        console.log(
          "✅ Engraving uploaded successfully:",
          cloudinaryEngravingUrl
        );
      } catch (error) {
        console.error("❌ Engraving upload error:", error);
        alert("Failed to upload engraving image. Please try again.");
        return;
      } finally {
        setIsUploadingEngraving(false);
      }
    }

    // Determine variant SKU (prefer freshly generated SKU reflecting current selections)
    const currentVariantSku =
      generateVariantId() ||
      productData?.chosenVariantSku ||
      productData?.firstVariantSku;

    // Create order data for console logging and payment
    const orderData = {
      orderId: `ORD_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 15)}`, // Match CheckoutPage format
      customer: {
        userId: user?.id || user?.id,
        name: `${user?.firstName} ${user?.lastName}`,
        email: user?.email,
        phone: user?.phone,
      },
      product: {
        modelSku: productData.modelSku,
        variantSku: currentVariantSku,
        title: productData.title,
        description: productData.description,
        price: productData.sellingPrice,
        priceBreakdown: productData.priceBreakdown,
        images: productData.variantImages,
      },
      customization: {
        metalColor: selectedMetalColor,
        metalColorCode: selectedColorCode, // Add color code for API requests
        metalType: selectedMetalType,
        goldKarat: selectedGoldKarat,
        diamondShape: selectedDiamondShape,
        diamondSize: selectedDiamondSize,
        diamondOrigin: selectedDiamondOrigin,
        ringSize: selectedSize,
        engraving: engravingText,
        diamondColorClarity: selectedColorClarity,
        engravingImageUrl: cloudinaryEngravingUrl || engravingImageUrl, // Use Cloudinary URL if available
        engravingMotifPath: engravingMotifPath, // Include motif path
        hasEngraving: hasEngraving,
      },
      quantity: 1,
      totalAmount: productData.sellingPrice,
      orderDate: new Date().toISOString(),
      status: "pending",
    };

    // Console log the order data
    console.log("=== ORDER CREATED ===");
    console.log("Order Data:", JSON.stringify(orderData, null, 2));
    console.log("=== DETAILED BREAKDOWN ===");
    console.log("Product SKU:", currentVariantSku);
    console.log("Metal Color:", selectedMetalColor);
    console.log("Metal Type:", selectedMetalType);
    console.log("Gold Karat:", selectedGoldKarat);
    console.log("Ring Size:", selectedSize);
    console.log("Diamond Shape:", selectedDiamondShape);
    console.log("Diamond Size:", selectedDiamondSize);
    console.log("Engraving Text:", engravingText);
    console.log("Engraving Motif Path:", engravingMotifPath);
    console.log("Cloudinary Engraving URL:", cloudinaryEngravingUrl);
    console.log("Has Engraving:", hasEngraving);
    console.log("===================");

    // Navigate to payment page with product data
    navigate("/payment", {
      state: {
        orderData,
        directPurchase: true,
        items: [
          {
            product: {
              _id: productData.modelSku,
              title: productData.title,
              price: productData.sellingPrice,
              priceBreakdown: productData.priceBreakdown,
              images: productData.variantImages,
              sku: currentVariantSku,
            },
            quantity: 1,
            price: productData.sellingPrice,
            customization: {
              metalColor: selectedMetalColor,
              metalColorCode: selectedColorCode, // Add color code for API requests
              metalType: selectedMetalType,
              goldKarat: selectedGoldKarat,
              diamondShape: selectedDiamondShape,
              diamondSize: selectedDiamondSize,
              diamondOrigin: selectedDiamondOrigin,
              ringSize: selectedSize,
              engraving: engravingText,
              engravingImageUrl: cloudinaryEngravingUrl || engravingImageUrl,
              engravingMotifPath: engravingMotifPath,
              hasEngraving: hasEngraving,
              diamondColorClarity: selectedColorClarity,
            },
          },
        ],
        totalAmount: productData.sellingPrice,
      },
    });
  }, [
    isAuthenticated,
    navigate,
    productData,
    selectedMetalColor,
    selectedMetalType,
    selectedGoldKarat,
    selectedDiamondShape,
    selectedDiamondSize,
    selectedDiamondOrigin,
    selectedSize,
    user,
    engravingText,
    engravingImageUrl,
    engravingMotifPath,
    hasEngraving,
    generateAndUploadEngravingImage,
    category,
    generateVariantId,
    selectedColorClarity,
    selectedColorCode,
  ]);

  // Handle engraving save callback
  const handleEngravingSave = useCallback(
    (text: string, imageUrl?: string, motifPath?: string) => {
      setEngravingText(text);
      setEngravingImageUrl(imageUrl || "");
      setEngravingMotifPath(motifPath || "");
      setHasEngraving(!!(text || motifPath));

      // Save engraving data for undo functionality
      setSavedEngravingData({
        text: text,
        motif: motifPath || "",
        imageUrl: imageUrl || "",
      });

      setShowEngraveModal(false);
      console.log("Engraving saved:", { text, imageUrl, motifPath });
    },
    []
  );

  // Handle undo engraving
  const handleUndoEngraving = useCallback(() => {
    setEngravingText("");
    setEngravingImageUrl("");
    setEngravingMotifPath("");
    setHasEngraving(false);
    setSavedEngravingData(null);
    console.log("Engraving undone");
  }, []);

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

  const braceletSizes = ["6", "7", "8"];

  // Show images fetched from API only; do not fall back to local sample images
  const thumbnailImages = productData?.variantImages ?? [];

  // Debug: log the thumbnail images to see what we have
  // console.log("Thumbnail images:", thumbnailImages);

  // Function to check if image is a 3D model
  const is3DModel = (imagePath: string, index: number) => {
    const isGLB = index === 1 && imagePath.endsWith(".glb");
    return isGLB || imagePath.endsWith(".glb");
  };

  // Function to check if file is a video
  const isVideo = (filePath: string) => {
    return (
      filePath.endsWith(".mp4") ||
      filePath.endsWith(".webm") ||
      filePath.endsWith(".mov")
    );
  };

  // Share functionality
  const getCurrentUrl = () => {
    const currentUrl = new URL(window.location.href);
    return currentUrl.href;
  };

  const handleEmailShare = () => {
    const url = getCurrentUrl();
    const subject = encodeURIComponent(
      `Check out this jewelry: ${productData?.title || "Product"}`
    );
    const body = encodeURIComponent(
      `I thought you might be interested in this jewelry piece:\n\n${
        productData?.title || "Product"
      }\n\nView it here: ${url}`
    );
    const gmailUrl = `https://mail.google.com/mail/?view=cm&to=ranju.prpk@gmail.com&su=${subject}&body=${body}`;
    window.open(gmailUrl, "_blank");
  };

  const handleWhatsAppShare = () => {
    const url = getCurrentUrl();
    const message = encodeURIComponent(`I am looking for more details ${url}`);
    const whatsappUrl = `https://wa.me/918928610682?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleCopyLink = async () => {
    const url = getCurrentUrl();
    try {
      await navigator.clipboard.writeText(url);
      // You could add a toast notification here if you have one
      alert("Link copied to clipboard");
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      console.log("Link copied to clipboard (fallback)");
    }
  };

  // Handle diamond origin selection with silver metal validation
  const handleDiamondOriginSelect = (origin: string) => {
    // Check if trying to select natural diamond with silver metal
    if (origin === "Natural Diamond" && selectedMetalType === "SILVER") {
      alert(
        "Natural diamonds are not available for silver metals. Please select Lab Grown Diamond or change the metal type."
      );
      return;
    }

    setSelectedDiamondOrigin(origin);
    // Price will update automatically via useEffect
  };

  // Attach preloaded viewer canvas to main viewer container when selected image is 3D
  useEffect(() => {
    const currentImage = (thumbnailImages || [])[selectedImage] || "";
    if (!mainViewerRef?.current) return;
    const main = mainViewerRef.current;

    if (is3DModel(currentImage || "", selectedImage)) {
      const pre = (window as any).__ijewelPreloadViewer;
      if (pre && pre.canvas) {
        try {
          // Move canvas from hidden preload container into the visible container
          main.innerHTML = "";
          main.appendChild(pre.canvas);
          setIs3DViewerVisible(true);
          return;
        } catch (err) {
          console.warn("Error moving preloaded canvas:", err);
        }
      }

      // Fallback: if no preload viewer, initialize directly in main
      if ((window as any).ijewelViewer) {
        try {
          main.innerHTML = "";
          new (window as any).ijewelViewer.Viewer(
            main,
            { modelUrl: currentImage },
            {
              showCard: false,
              showUiButtons: false,
              showLogo: false,
              showConfigurator: false,
            }
          );
          setIs3DViewerVisible(true);
        } catch (err) {
          console.warn("Failed to init ijewel viewer fallback:", err);
        }
      }
    } else {
      // Optionally move canvas back to preload container if not viewing 3D
      const pre = (window as any).__ijewelPreloadViewer;
      if (pre && pre.canvas) {
        const preloadContainer = document.getElementById("ijewel-preload");
        if (preloadContainer && pre.canvas.parentElement !== preloadContainer) {
          try {
            preloadContainer.appendChild(pre.canvas);
          } catch (err) {
            // ignore
          }
        }
      }
    }
  }, [selectedImage, thumbnailImages]);

  // Loading state
  if (loading) {
    return <ProductDetailSkeleton />;
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
                              3D
                            </div>
                          </div>
                        ) : isVideo(image) ? (
                          <div className="relative w-full h-full">
                            <video
                              src={image}
                              className="w-full h-full object-cover"
                              muted
                              preload="metadata"
                            />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                              <div className="bg-white/90 rounded-full p-2">
                                <Play
                                  className="w-3 h-3 text-gray-700"
                                  fill="currentColor"
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={image}
                            alt={`Product ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={() => {
                              console.error(
                                `Failed to load desktop thumbnail ${
                                  index + 1
                                }:`,
                                image
                              );
                            }}
                            onLoad={() => {
                              console.error(
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
                    // const currentImage = thumbnailImages[selectedImage];
                    // console.log(
                    //   `Main image - selectedImage: ${selectedImage}, currentImage:`,
                    //   currentImage
                    // );
                    const currentImage = thumbnailImages[selectedImage] || "";
                    if (is3DModel(currentImage || "", selectedImage)) {
                      return (
                        <div className="w-full h-full object-contain">
                          <div
                            ref={mainViewerRef}
                            id="ijewel-viewer-main"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      );
                    }

                    // Check if current media is video
                    if (currentImage && isVideo(currentImage)) {
                      return (
                        <div className="relative w-full h-full">
                          <video
                            ref={(el) => setVideoRef(el)}
                            src={currentImage}
                            className="w-full h-full object-cover"
                            controls
                            muted
                            autoPlay
                            playsInline
                            onPlay={() => setIsVideoPlaying(true)}
                            onPause={() => setIsVideoPlaying(false)}
                            onEnded={() => setIsVideoPlaying(false)}
                          />
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
                            console.error(
                              `Failed to load main image:`,
                              currentImage
                            );
                          }}
                          // onLoad={() => {
                          //   console.log(`Loaded main image:`, currentImage);
                          // }}
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
                  <button
                    onClick={handleWishlistToggle}
                    disabled={wishlistLoading}
                    aria-pressed={isInWishlist}
                    className={`absolute top-4 right-4 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors ${
                      isInWishlist ? "text-red-500" : "text-gray-600"
                    } ${
                      wishlistLoading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    <Heart
                      size={20}
                      className={isInWishlist ? "fill-current" : ""}
                    />
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
                              3D
                            </div>
                          </div>
                        ) : isVideo(image) ? (
                          <div className="relative w-full h-full">
                            <video
                              src={image}
                              className="w-full h-full object-cover"
                              muted
                              preload="metadata"
                            />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                              <div className="bg-white/90 rounded-full p-2">
                                <Play
                                  className="w-3 h-3 text-gray-700"
                                  fill="currentColor"
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={image}
                            alt={`Product ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={() => {
                              console.error(
                                `Failed to load mobile thumbnail ${index + 1}:`,
                                image
                              );
                            }}
                            // onLoad={() => {
                            //   console.log(
                            //     `Loaded mobile thumbnail ${index + 1}`
                            //   );
                            // }}
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
              <div className="">
                <div>
                  <h1 className="text-2xl my-6 mb-2">{productData.title}</h1>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">4.9</span>
                    </div>
                    {/* <span className="text-primary text-[#328F94] bg-[#328F94]/5 text-sm">
                      {productData.variantCount} Variants
                    </span> */}
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">
                    {productData.description}
                  </p>
                  <div className="flex items-end mb-4 gap-4">
                    <div className="text-2xl mb-1">
                      ₹{productData.sellingPrice.toLocaleString()}
                    </div>
                    {/* <div className=" text-sm mb-2 text-[#328F94] ">
                      Starting at ₹
                      {Math.round(
                        productData.sellingPrice / 12
                      ).toLocaleString()}
                      /mo
                    </div> */}
                  </div>
                </div>

                {/* Diamond Origin */}
                <div className="mb-6">
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
                    {["Natural Diamond", "Lab Grown Diamond"].map((origin) => {
                      const isDisabled =
                        origin === "Natural Diamond" &&
                        selectedMetalType === "SILVER";
                      return (
                        <button
                          key={origin}
                          onClick={() => handleDiamondOriginSelect(origin)}
                          disabled={isDisabled}
                          className={`px-3 py-2 rounded-full border text-xs font-medium transition-all ${
                            isDisabled
                              ? "border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed opacity-60"
                              : selectedDiamondOrigin === origin
                              ? "border-[#328F94] text-[#328F94] bg-[#328F94]/5"
                              : "border-neutral-600 text-neutral-600 hover:border-[#328F94] hover:text-[#328F94]"
                          }`}
                        >
                          {origin}
                          {isDisabled && (
                            <span className="ml-1 text-[10px]">❌</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Information text when natural diamond is disabled */}
                  {selectedMetalType === "SILVER" && (
                    <p className="text-xs text-red-500 mt-2 italic">
                      Natural diamond not available on silver metal type
                    </p>
                  )}
                </div>

                {/* Diamond Shape - Only show if diamond shapes are available */}
                {productData.diamondShape &&
                  productData.diamondShape.length > 1 && (
                    <div>
                      <h3 className="mb-3 text-sm">
                        Diamond Shape:{" "}
                        <span className="text-[#8D8A91]">
                          {selectedDiamondShape.charAt(0) +
                            selectedDiamondShape.slice(1).toLowerCase()}
                        </span>
                      </h3>
                      <div className="flex flex-wrap gap-2 overflow-x-auto no-scrollbar py-2">
                        {sampleProduct.diamondShapes
                          .filter((shape) =>
                            productData.diamondShape.includes(
                              shape.name.toUpperCase()
                            )
                          )
                          .map((shape) => (
                            <button
                              key={shape.name}
                              onClick={() => {
                                const newShape = shape.name.toUpperCase();
                                setSelectedDiamondShape(newShape);
                              }}
                              className={`group relative w-[50px] h-[50px] border rounded-lg p-1 
          ${
            selectedDiamondShape === shape.name.toUpperCase()
              ? "border-primary bg-primary/5"
              : "border-neutral-300"
          }`}
                            >
                              {/* FIXED: remove full flex-center, add controlled padding */}
                              <div className="w-full h-full flex items-end justify-center">
                                <img
                                  src={shape.img}
                                  alt={shape.name}
                                  className="max-h-[85%] max-w-[85%] pb-1 object-contain"
                                />
                              </div>

                              {/* Tooltip */}
                              <span
                                className="absolute bottom-[-16px] right-[-32px] px-3 py-2 rounded bg-black text-white text-base opacity-0 pointer-events-none transition-opacity duration-150 group-hover:opacity-100 z-50"
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
                  <div className="grid grid-cols-2 pt-0 mt-0 gap-4">
                    {productData.diamondShape.length > 1 && (
                      <div>
                        <label className="block text-xs mb-2">
                          Diamond Size
                        </label>
                        <Select
                          value={selectedDiamondSize}
                          onValueChange={(value) => {
                            setSelectedDiamondSize(value);
                          }}
                        >
                          <SelectTrigger className="text-sm border-neutral-300">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            {productData.diamondSize
                              .filter((size) => {
                                // For Natural Diamond, only show sizes <= 1 carat
                                if (
                                  selectedDiamondOrigin === "Natural Diamond"
                                ) {
                                  return parseFloat(size) <= 1;
                                }
                                // For Lab Grown Diamond, show all sizes
                                return true;
                              })
                              .map((size, index) => (
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
                        <Select
                          value={selectedColorClarity}
                          onValueChange={(value) => {
                            setSelectedColorClarity(value);
                          }}
                        >
                          <SelectTrigger className="text-sm border-neutral-300">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>

                          <SelectContent className="bg-white">
                            {productData.diamondColorClarity.map(
                              (cc, index) => (
                                <SelectItem key={index} value={cc}>
                                  {cc}
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
                <div className="my-6 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs mb-2">Metal Type</label>
                    <Select
                      value={selectedMetalType}
                      onValueChange={(value) => {
                        setSelectedMetalType(value);
                        // Clear karat selection when metal type changes
                        setSelectedGoldKarat("");

                        // Auto-switch to Lab Grown Diamond if Silver is selected and Natural Diamond is currently selected
                        if (
                          value === "SILVER" &&
                          selectedDiamondOrigin === "Natural Diamond"
                        ) {
                          setSelectedDiamondOrigin("Lab Grown Diamond");
                        }
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
                              onClick={() => {
                                const newKarat = karat.toString();
                                setSelectedGoldKarat(newKarat);
                              }}
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
                <div className="my-6">
                  <h3 className="mb-3 text-sm">
                    Metal Color: {selectedMetalColor}
                  </h3>

                  <div className="flex gap-3 flex-wrap">
                    {productData?.availableColors?.map((code) => {
                      // Use the centralized color display info function
                      const colorInfo = getColorDisplayInfo(code);
                      if (!colorInfo) return null;

                      // Determine if this is a combination
                      const isCombination = colorInfo.colors.length > 1;

                      return (
                        <button
                          key={code}
                          onClick={() => updateMetalColor(code)}
                          className={`relative flex justify-center items-center rounded-full border-2 transition-all ${
                            selectedColorCode === code
                              ? "border-[#328F94] ring-2 ring-[#328F94]/30"
                              : "border-neutral-300 hover:border-[#328F94]"
                          } ${isCombination ? "w-8 h-8" : "w-8 h-8"}`}
                          title={colorInfo.name}
                        >
                          {isCombination ? (
                            // For combination colors, show the combination image from metal_colors folder
                            <img
                              src={colorInfo.img}
                              alt={colorInfo.name}
                              className="w-6 h-6 object-cover rounded-full"
                            />
                          ) : (
                            // For single colors, show the standard image
                            <img
                              src={colorInfo.img}
                              alt={colorInfo.name}
                              className="w-full h-full object-cover rounded-full"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {category === "rings" && (
                  <div className="my-6 space-y-2">
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
                          <SelectContent className="bg-white">
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
                      to={"/RingSize-Education"}
                      className="text-sm text-primary font-medium underline block"
                    >
                      Ring Size Guide
                    </Link>
                  </div>
                )}

                {category === "bracelets" && (
                  <div className="my-6 space-y-2">
                    {/* Bracelet Size */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-2">
                          Bracelet Size
                        </label>
                        <Select
                          value={selectedBraceletSize}
                          onValueChange={setSelectedBraceletSize}
                        >
                          <SelectTrigger className="text-sm border-neutral-300">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            {braceletSizes.map((size) => (
                              <SelectItem key={size} value={size}>
                                Size {size}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Free Engraving - Only show if engraving is available */}
                {productData.isEngraving && (
                  <div className="space-y-3">
                    {!hasEngraving ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="engraving"
                          checked={showEngraveModal}
                          onChange={(e) =>
                            setShowEngraveModal(e.target.checked)
                          }
                          className="border-primary accent-[#68C5C0] w-4 h-4"
                        />
                        <label
                          htmlFor="engraving"
                          className="text-sm text-primary cursor-pointer"
                        >
                          Add Free Engraving
                        </label>
                      </div>
                    ) : (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-green-700">
                              Engraving Added
                            </span>
                          </div>
                          <button
                            onClick={handleUndoEngraving}
                            className="text-xs text-red-600 hover:text-red-800 underline"
                          >
                            Undo
                          </button>
                        </div>
                        {savedEngravingData && (
                          <div className="mt-2 text-xs text-gray-600">
                            {savedEngravingData.text && (
                              <div>Text: {savedEngravingData.text}</div>
                            )}
                            {savedEngravingData.motif && (
                              <div>
                                Motif:{" "}
                                {savedEngravingData.motif
                                  .replace("/motif/", "")
                                  .replace(".svg", "")}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Engrave Modal Pop-Up */}
                {showEngraveModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="relative w-full h-full bg-white overflow-auto">
                      <Engrave
                        onClose={() => setShowEngraveModal(false)}
                        onSave={handleEngravingSave}
                        selectedImage={productData?.variantImages?.[0]}
                        jewelryType={productData?.title}
                        userId={user?.id}
                        fontSize={productData?.engravingInfo?.fontSize}
                      />
                    </div>
                  </div>
                )}

                {/* Estimated Ship Date */}
                <div className="my-6 text-sm">
                  <div className="font-medium">
                    Estimated Ship Date: {sampleProduct.estimatedShipDate}
                  </div>
                  <div className="text-muted-foreground">
                    Free Shipping | Free Returns
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="my-6 grid grid-cols-2 gap-4">
                  <Button
                    onClick={handleBuyNow}
                    disabled={cartLoading || isUploadingEngraving}
                    className="w-full bg-[#328F94] hover:bg-[#328F94]/90 text-white py-3"
                  >
                    {isUploadingEngraving
                      ? "Uploading Engraving..."
                      : cartLoading
                      ? "Processing..."
                      : "Buy Now"}
                  </Button>
                  <Button
                    onClick={handleAddToCart}
                    disabled={cartLoading}
                    variant="outline"
                    className="w-full border-[#328F94] text-[#328F94] py-3"
                  >
                    {cartLoading ? "Adding..." : "Add To Cart"}
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
                <div className="mt-3">
                  {/* <h3 className="font-medium mb-3 text-sm">Share</h3> */}
                  <div className="flex flex-row flex-nowrap text-[#328F94] gap-3">
                    <Button
                      size="sm"
                      className="flex items-center gap-2 text-xs"
                      onClick={handleEmailShare}
                    >
                      <Mail size={14} />
                      Email
                    </Button>
                    <Button
                      size="sm"
                      className="flex items-center gap-2 text-xs"
                      onClick={handleWhatsAppShare}
                    >
                      <MessageCircle size={14} />
                      WhatsApp
                    </Button>
                    <Button
                      size="sm"
                      className="flex items-center gap-2 text-xs"
                      onClick={handleCopyLink}
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
          {/* <div className="mt-16">
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
          </div> */}
          <div className="mt-16">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="details">
                <AccordionTrigger className="text-lg text-[#328F94] font-semibold">
                  Details
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  {/* Three Column Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Item Details Column */}
                    <div>
                      <h4 className="text-[#328F94] font-semibold mb-4 text-sm">
                        ITEM DETAILS
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between py-2 border-b border-[#328F94]">
                          <span className="text-muted-foreground">
                            SKU Number
                          </span>
                          <span className="font-medium">
                            {productData.modelSku}
                          </span>
                        </div>
                        {category === "rings" && (
                          <div className="flex justify-between py-2 border-b border-[#328F94]">
                            <span className="text-muted-foreground">
                              Ring Size
                            </span>
                            <span className="font-medium">
                              {selectedSize || "Not Selected"}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between py-2 border-b border-[#328F94]">
                          <span className="text-muted-foreground">
                            Metal Type
                          </span>
                          <span className="font-medium">
                            {selectedMetalType}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-[#328F94]">
                          <span className="text-muted-foreground">
                            Metal Color
                          </span>
                          <span className="font-medium">
                            {selectedMetalColor}
                          </span>
                        </div>
                        {productData.netWeightGrams && (
                          <div className="flex justify-between text-sm py-1">
                            <span>Net Weight:</span>
                            <span>{productData.netWeightGrams} g</span>
                          </div>
                        )}

                        {/* <div className="py-2 border-b border-[#328F94]">
                          <div className="text-muted-foreground mb-2">
                            Product Dimensions (In mm)
                          </div>
                          <div className="space-y-1 ml-4">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Length :
                              </span>
                              <span className="font-medium">1.356 mm</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Width :
                              </span>
                              <span className="font-medium">1.356 mm</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Height :
                              </span>
                              <span className="font-medium">1.356 mm</span>
                            </div>
                          </div>
                        </div> */}
                        <div className="py-2 border-y border-[#328F94] flex justify-between">
                          <h4 className="font-medium mb-3 text-sm">
                            Disclaimer For Product Image
                          </h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Product Photography in Print Material and Website
                            may not reflect exact true color and/or scale.
                          </p>
                        </div>
                        {/* Certification Logos */}
                        <div className="flex items-center gap-4 justify-start md:justify-end">
                          <img
                            src="/Hallmarks/BIS.png"
                            alt="BIS Hallmark"
                            className="h-16 w-16 object-contain"
                          />
                          <img
                            src="/Hallmarks/IGI.png"
                            alt="IGI Certification"
                            className="h-16 w-16 object-contain"
                          />
                          <img
                            src="/Hallmarks/SGL.png"
                            alt="SGL Certification"
                            className="h-16 w-16 object-contain"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Diamond & Gemstones Details Column */}
                    <div>
                      <h4 className="text-[#328F94] font-semibold mb-4 text-sm">
                        DIAMOND & GEMSTONES DETAILS
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between py-2 border-b border-[#328F94]">
                          <span className="text-muted-foreground">
                            Diamond Origin
                          </span>
                          <span className="font-medium">
                            {selectedDiamondOrigin}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-[#328F94]">
                          <span className="text-muted-foreground">
                            Diamond Color & Clarity
                          </span>
                          <span className="font-medium">
                            {selectedColorClarity}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-[#328F94]">
                          <span className="text-muted-foreground">
                            Certification
                          </span>
                          <span className="font-medium">IGI/SGL Certified</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-[#328F94]">
                          <span className="text-muted-foreground">
                            HallMark
                          </span>
                          <span className="font-medium">BIS HALLMARK</span>
                        </div>
                      </div>
                    </div>

                    {/* Price Breakup Column */}
                    <div>
                      <h4 className="text-[#328F94] font-semibold mb-4 text-sm">
                        Price Breakup
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between py-2 border-b border-[#328F94]">
                          <span className="text-muted-foreground">
                            Gold/Silver/Platinum Value
                          </span>
                          <span className="font-medium">
                            Rs.{" "}
                            {productData.priceBreakdown.metalCost.toLocaleString()}
                            /-
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-[#328F94]">
                          <span className="text-muted-foreground">
                            Diamond Value
                          </span>
                          <span className="font-medium">
                            Rs.{" "}
                            {productData.priceBreakdown.diamondCost.toLocaleString()}
                            /-
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-[#328F94]">
                          <span className="text-muted-foreground">
                            Making Charges
                          </span>
                          <span className="font-medium">
                            Rs.{" "}
                            {productData.priceBreakdown.labourCost.toLocaleString()}
                            /-
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-[#328F94]">
                          <span className="text-muted-foreground">GST</span>
                          <span className="font-medium">
                            Rs.{" "}
                            {productData.priceBreakdown.gstAmount.toLocaleString()}
                            /-
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-[#328F94] font-semibold">
                          <span>Total</span>
                          <span>
                            Rs.{" "}
                            {productData.priceBreakdown.totalWithGst.toLocaleString()}
                            /-
                          </span>
                        </div>
                        <div className="py-2">
                          <div className="text-muted-foreground mb-2">
                            Disclaimer For Price
                          </div>
                          <p className="text-xs leading-relaxed">
                            Jewellery weights for metals, diamonds, or
                            gemstones, may slightly vary post-crafting, but rest
                            assured the agreed-upon price will stay the same.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Reviews Section */}
          <div className="mt-16">
            {productData ? (
              <ProductReviews productId={productData.modelSku || id} />
            ) : (
              <ProductReviews productId={id} />
            )}
          </div>
        </div>

        {/* Engrave Modal Overlay - Show as full-screen overlay */}
        {showEngraveModal &&
          (() => {
            const originalImage = productData?.variantImages?.[0];
            const evImage =
              originalImage?.replace(
                /-(FV|SV|TV|BV|LV|RV|GP)\.webp$/i,
                "-EV.webp"
              ) || originalImage;

            console.log("🎨 ENGRAVE COMPONENT - Image URLs:");
            console.log("📸 Original image:", originalImage);
            console.log("🖼️ EV image passed to Engrave:", evImage);
            console.log("✅ Conversion applied:", originalImage !== evImage);

            return (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                <div className="relative w-full h-full bg-white overflow-auto">
                  <Engrave
                    onClose={() => setShowEngraveModal(false)}
                    onSave={handleEngravingSave}
                    selectedImage={evImage}
                    jewelryType={productData?.title}
                    userId={user?.id}
                    initialText={engravingText}
                    initialMotif={engravingMotifPath}
                    fontSize={productData?.engravingInfo?.fontSize}
                  />
                </div>
              </div>
            );
          })()}
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
