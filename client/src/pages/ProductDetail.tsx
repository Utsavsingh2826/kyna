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
import { toast } from "sonner";
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
import PdfPopup from "../components/PdfPopup";
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
import RingSizeGuidePopup from "@/components/RingSizeGuidePopup";
import BraceletSizeGuidePopup from "@/components/BraceletSizeGuidePopup";
import { ShareEmailModal } from "@/components/ShareEmailModal";
import "@/styles/image-loading.css"; // Ensure CSS for blur/skeleton is included

// Product interface for API data
interface ProductData {
  _id: string;
  success: boolean;
  modelSku: string;
  title: string;
  description: string;
  category?: string;
  chainOption?: string;
  chainLengthInches?: string;
  metalTypes: string[];
  goldKarats: (string | number)[];
  diamondShape: string[];
  diamondSize: string[] | {
    GOLD?: string[];
    PLATINUM?: string[];
    SILVER?: string[];
  };
  diamondColorClarity: string[];
  diamondOptions?: {
    NATURAL?: {
      GOLD?: string[];
      PLATINUM?: string[];
    };
    LAB?: {
      GOLD?: string[];
      PLATINUM?: string[];
    };
  };
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
  bandwidth?: string[];
  finishing?: Array<{ code: string; type: string }>;
   totalDiamondWeight?: number;
   deliveryDays?: number;
}

// Map color codes to display info (handles both single and combination colors)
const getColorDisplayInfo = (
  code: string,
): { name: string; colors: string[]; img: string } | null => {
  // Single colors
  const singleColorMap: Record<string, { name: string; img: string }> = {
    WG: { name: "White", img: "/colors/white.png" },
    YG: { name: "Yellow", img: "/colors/gold.png" },
    RG: { name: "Rose", img: "/colors/rosegold.png" },
    BR: { name: "Black Rhodium", img: "/colors/br.png" },
    "3T": { name: "Three Tone", img: "/colors/3T.png" },
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
          return "White";
        case "YG":
          return "Yellow";
        case "RG":
          return "Rose";
        case "BR":
          return "Black Rhodium";
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
    { name: "White", img: "/metal_colors/Platinum.svg" },
    { name: "Yellow", img: "/colors/gold.png" },
    { name: "Rose", img: "/colors/rosegold.png" },
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
    (state: RootState) => state.auth,
  );
  const { loading: cartLoading } = useSelector(
    (state: RootState) => state.cart,
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
  const [isPdfPopupOpen, setIsPdfPopupOpen] = useState(false);
  const [selectedDiamondShape, setSelectedDiamondShape] = useState("Oval");
  const [selectedMetalColor, setSelectedMetalColor] = useState("White");
  const [selectedColorCode, setSelectedColorCode] = useState("WG"); // Store the color code (e.g., "WG", "WG-RG")
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedBraceletSize, setSelectedBraceletSize] = useState("6");
  const [selectedDiamondSize, setSelectedDiamondSize] = useState("");
  const [selectedGoldKarat, setSelectedGoldKarat] = useState("");
  const [selectedMetalType, setSelectedMetalType] = useState("");
  const [selectedColorClarity, setSelectedColorClarity] = useState("");
  const [selectedFinishing, setSelectedFinishing] = useState("");
  const [selectedBandwidth, setSelectedBandwidth] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isRingSizePopupOpen, setIsRingSizePopupOpen] = useState(false);
  const [totalDiamondWeight, setTotalDiamondWeight] = useState(0);
  const [deliveryDays, setDeliveryDays] = useState<number | 25>(25);
  /* State for share modal */
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [shareMessage, setShareMessage] = useState("");

  // Keep total diamond weight in sync with product data changes (variant updates)
  // Prioritize the API-provided totalDiamondWeight as it reflects the actual variant weight
  useEffect(() => {
    if (productData?.totalDiamondWeight && typeof productData.totalDiamondWeight === "number") {
      setTotalDiamondWeight(productData.totalDiamondWeight);
    } else if (selectedDiamondSize) {
      const parsed = parseFloat(String(selectedDiamondSize));
      if (!Number.isNaN(parsed)) {
        setTotalDiamondWeight(parsed);
      }
    }
  }, [productData?.totalDiamondWeight, selectedDiamondSize]);

  const handleShare = async (platform: "whatsapp" | "email" | "copy") => {
    // Construct the correct URL for the current variant
    const currentUrl = window.location.href;
    const productName = productData?.title || "Check out this product";

    if (platform === "copy") {
      try {
        await navigator.clipboard.writeText(currentUrl);
        toast.success("Link copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy link");
      }
      return;
    }

    const message = `I found this beautiful piece at Kyna Jewels and thought of you! 💎\n\n${productName}\n\nCheck it out here: ${currentUrl}\n\nKyna Jewels is the best online jewellery business for premium designs!`;

    if (platform === "whatsapp") {
      const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank");
    } else if (platform === "email") {
      setShareUrl(currentUrl);
      setShareMessage(
        `I found this beautiful piece at Kyna Jewels and thought of you! 💎\n\nCheck out the ${productName} here. Kyna Jewels is the best online jewellery business for premium designs!`,
      );
      setShareModalOpen(true);
    }
  };

  const socialLinks = [
    {
      icon: "/Jan/Vector.png",
      label: "WhatsApp",
      action: () => handleShare("whatsapp"),
      height: "h-5",
      width: "w-5",
      isImage: true,
    },
    {
      icon: Mail,
      label: "Email",
      action: () => handleShare("email"),
      height: "h-5",
      width: "w-5",
      isImage: false,
    },
    {
      icon: Share2,
      label: "Copy Link",
      action: () => handleShare("copy"),
      height: "h-5",
      width: "w-5",
      isImage: false,
    },
  ];

  const [isBraceletSizePopupOpen, setIsBraceletSizePopupOpen] = useState(false);

  // Track the last valid state for reverting when variant not found
  const lastValidStateRef = useRef({
    metalColor: "White",
    colorCode: "WG",
    diamondShape: "Round",
    diamondSize: "",
    diamondOrigin: "Natural Diamond",
    colorClarity: "",
    goldKarat: "",
    metalType: "",
    braceletSize: "6",
    bandwidth: "",
    finishing: "",
  });

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
      currentMetalColorCode,
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
  const thumbnailsDesktopRef = useRef<HTMLDivElement>(null);
  const thumbnailsMobileRef = useRef<HTMLDivElement>(null);
  const metalTypesRef = useRef<HTMLDivElement>(null);
  const mainViewerRef = useRef<HTMLDivElement | null>(null);
  const imageContainerRef = useRef<HTMLDivElement | null>(null);

  // Helper function to scroll to image in mobile/tablet view
  const scrollToImageOnMobile = () => {
    // Increase threshold to include more devices and wrap in timeout to ensure state/UI updates finish
    if (window.innerWidth < 1280 && imageContainerRef.current) {
      setTimeout(() => {
        imageContainerRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 150);
    }
  };

  // Helper function to normalize karat values (handles both 14KT and 14kt formats)
  const normalizeKarat = useCallback((karat: string | number): string => {
    const karatStr = karat.toString();
    // Convert to lowercase for consistent comparison
    const lowerKarat = karatStr.toLowerCase();
    // If it contains 'kt', ensure it's lowercase
    if (lowerKarat.includes("kt")) {
      return lowerKarat;
    }
    return karatStr;
  }, []);

  // Helper function to get available diamond sizes based on metal type
  const getDiamondSizes = useCallback(() => {
    if (!productData || !productData.diamondSize) return [];

    if (Array.isArray(productData.diamondSize)) {
      return productData.diamondSize;
    }

    // If it's an object, get sizes for the selected metal type
    const metalType = selectedMetalType || "GOLD";
    const sizesObj = productData.diamondSize as Record<string, string[]>;
    return sizesObj[metalType] || sizesObj["GOLD"] || [];
  }, [productData, selectedMetalType]);

  // Helper function to get available clarity options based on diamond origin and metal type
  const getAvailableClarityOptions = useCallback(() => {
    if (!productData) return [];

    // Check if diamondOptions exists and has data
    if (
      !productData.diamondOptions ||
      Object.keys(productData.diamondOptions).length === 0
    ) {
      // Fallback to diamondColorClarity if diamondOptions is missing/empty
      return (productData.diamondColorClarity || []).map((c) =>
        c.replace(/\s+/g, ""),
      );
    }

    const diamondType =
      selectedDiamondOrigin === "Lab Grown Diamond" ? "LAB" : "NATURAL";
    const metalTypeKey = selectedMetalType || "GOLD";

    // Get clarity options with proper typing
    const clarityOptions: string[] = 
      (productData.diamondOptions as any)?.[diamondType]?.[metalTypeKey] || [];
    
    // Return the clarity options with spaces removed for consistency
    return clarityOptions.map((option: string) => option.replace(/\s+/g, ""));
  }, [productData, selectedDiamondOrigin, selectedMetalType]);

  // Parameterized version for use during SKU parsing when state variables might not be set yet
  // const getAvailableClarityOptionsForParsing = useCallback((
  //   diamondOrigin: string,
  //   metalType: string,
  //   productDataParam: ProductData
  // ) => {
  //   // Check if diamondOptions exists and has data
  //   if (
  //     !productDataParam.diamondOptions ||
  //     Object.keys(productDataParam.diamondOptions).length === 0
  //   ) {
  //     // Fallback to diamondColorClarity if diamondOptions is missing/empty
  //     return (productDataParam.diamondColorClarity || []).map((c) =>
  //       c.replace(/\s+/g, ""),
  //     );
  //   }

  //   const diamondType = diamondOrigin === "Lab Grown Diamond" ? "LAB" : "NATURAL";
  //   const metalTypeKey = metalType || "GOLD";

  //   const clarityOptions =
  //     productDataParam.diamondOptions?.[diamondType]?.[metalTypeKey] || [];
    
  //   // Return the clarity options with spaces removed for consistency
  //   return clarityOptions.map((option) => option.replace(/\s+/g, ""));
  // }, []);

  // Helper function to parse karat and set metal type
  const parseKaratAndSetMetalType = useCallback(
    (goldKarat: string, productData: ProductData) => {
      // Handle letter codes for Silver and Platinum
      if (goldKarat === "SLV") {
        setSelectedMetalType("SILVER");
        setSelectedGoldKarat("925");
        console.log("Set metal type: SILVER (from SLV code), purity: 925");
        return;
      } else if (goldKarat === "PT") {
        setSelectedMetalType("PLATINUM");
        setSelectedGoldKarat("950");
        console.log("Set metal type: PLATINUM (from PT code), purity: 950");
        return;
      }

      const karatValue = normalizeKarat(`${goldKarat}kt`);

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
      } else if (
        productData.goldKarats.some((k) => normalizeKarat(k) === karatValue)
      ) {
        // Fallback for other gold karats
        setSelectedMetalType("GOLD");
        setSelectedGoldKarat(karatValue);
        // console.log("Set metal type: GOLD (fallback), karat:", karatValue);
      }
    },
    [normalizeKarat],
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

        parseKaratAndSetMetalType(goldKarat, productData);

        const caratValue = (parseInt(caratSize) / 100).toString();
        const availableSizes = Array.isArray(productData.diamondSize)
          ? productData.diamondSize
          : ((productData.diamondSize as any)[selectedMetalType] || (productData.diamondSize as any)["GOLD"] || []);

        if (availableSizes.includes(caratValue)) {
          setSelectedDiamondSize(caratValue);
        }

        const diamondOrigin = specifications.startsWith("LG")
          ? "Lab Grown Diamond"
          : "Natural Diamond";
        setSelectedDiamondOrigin(diamondOrigin);

        const clarity = specifications.replace(/^LG|^ND/, "");
        if (productData.diamondColorClarity.includes(clarity)) {
          setSelectedColorClarity(clarity);
        }
      } else if (parts.length === 5) {
        // 5-part format could be:
        // - modelSku-karat-specs-bandwidth-finish (Men's rings: GR25-14-LGEFVS-8-BF)
        // - modelSku-shape-carat-karat-specs (Women's rings/pendants)
        const [, part2, , , part5] = parts;

        const finishingCodes = ["BF", "HM", "MF", "NF"];
        const shapeCodeMap: { [key: string]: string } = {
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

        // Check if it's Men's ring format (karat-specs-bandwidth-finish)
        if (finishingCodes.includes(part5) && !shapeCodeMap[part2]) {
          // Format: modelSku-karat-specs-bandwidth-finish
          setOriginalVariantFormat("3-part");
          const [, goldKarat, specifications, bandwidth, finishing] = parts;
          setSelectedBandwidth(bandwidth);
          setSelectedFinishing(finishing);
          parseKaratAndSetMetalType(goldKarat, productData);

          const diamondOrigin = specifications.startsWith("LG")
            ? "Lab Grown Diamond"
            : "Natural Diamond";
          setSelectedDiamondOrigin(diamondOrigin);

          const clarity = specifications.replace(/^LG|^ND/, "");
          if (productData.diamondColorClarity.includes(clarity)) {
            setSelectedColorClarity(clarity);
          }

          // Don't set diamond shape/size for Men's rings
          setSelectedDiamondShape("");
          setSelectedDiamondSize("");
          console.log("Men's ring 5-part format: bandwidth + finish");
        } else {
          // Format: modelSku-shape-carat-karat-specs (5-part women's rings)
          setOriginalVariantFormat("5-part");
          const [, diamondShape, caratSize, goldKarat, specifications] = parts;

          if (
            shapeCodeMap[diamondShape] &&
            productData.diamondShape.includes(shapeCodeMap[diamondShape])
          ) {
            setSelectedDiamondShape(shapeCodeMap[diamondShape]);
            console.log("Set diamond shape:", shapeCodeMap[diamondShape]);
          }

          parseKaratAndSetMetalType(goldKarat, productData);

          const caratValue = (parseInt(caratSize) / 100).toString();
          const availableSizes = Array.isArray(productData.diamondSize)
            ? productData.diamondSize
            : ((productData.diamondSize as any)[selectedMetalType] || (productData.diamondSize as any)["GOLD"] || []);

          if (availableSizes.includes(caratValue)) {
            setSelectedDiamondSize(caratValue);
            console.log("Set diamond carat size:", caratValue);
          }

          const diamondOrigin = specifications.startsWith("LG")
            ? "Lab Grown Diamond"
            : "Natural Diamond";
          setSelectedDiamondOrigin(diamondOrigin);

          const clarity = specifications.replace(/^LG|^ND/, "");
          if (productData.diamondColorClarity.includes(clarity)) {
            setSelectedColorClarity(clarity);
          }

          console.log("Set diamond origin:", diamondOrigin);
        }
      } else if (parts.length === 4) {
        // 4-part format could be:
        // - modelSku-karat-specs-size (bracelets)
        // - modelSku-karat-specs-bandwidth (Men's rings: GR25-14-LGEFVS-8)
        // - modelSku-karat-specs-finish (Men's rings: GR25-14-LGEFVS-BF)
        setOriginalVariantFormat("3-part");
        const [, goldKarat, specifications, lastPart] = parts;

        // Check if last part is a finishing code
        const finishingCodes = ["BF", "HM", "MF", "NF"];
        if (finishingCodes.includes(lastPart)) {
          // Format: modelSku-karat-specs-finish
          setSelectedFinishing(lastPart);
          console.log("Men's ring 4-part format: finish only");
        } else if (["4", "5", "6", "7", "8", "9", "10"].includes(lastPart)) {
          // Could be bracelet size or bandwidth
          if (category === "bracelets") {
            setSelectedBraceletSize(lastPart);
            console.log("Bracelet 4-part format: size", lastPart);
          } else {
            // Men's ring bandwidth
            setSelectedBandwidth(lastPart);
            console.log("Men's ring 4-part format: bandwidth", lastPart);
          }
        }

        // DO NOT auto-select diamond shape or size - keep them empty
        setSelectedDiamondShape("");
        setSelectedDiamondSize("");

        // Parse karat and set metal type
        parseKaratAndSetMetalType(goldKarat, productData);

        // Parse diamond origin
        const diamondOrigin = specifications.startsWith("LG")
          ? "Lab Grown Diamond"
          : "Natural Diamond";
        setSelectedDiamondOrigin(diamondOrigin);

        const clarity = specifications.replace(/^LG|^ND/, "");
        if (productData.diamondColorClarity.includes(clarity)) {
          setSelectedColorClarity(clarity);
        }

        console.log("Set diamond origin:", diamondOrigin);
      } else if (parts.length === 3) {
        // 3-part format: modelSku-karat-specs (Base Men's rings: GR25-14-LGEFVS)
        setOriginalVariantFormat("3-part");
        const [, goldKarat, specifications] = parts;

        // For Men's rings, don't auto-select diamond shape/size
        // They might have bandwidth/finishing options instead
        setSelectedDiamondShape("");
        setSelectedDiamondSize("");

        // Parse karat and set metal type
        parseKaratAndSetMetalType(goldKarat, productData);

        // Parse diamond origin
        const diamondOrigin = specifications.startsWith("LG")
          ? "Lab Grown Diamond"
          : "Natural Diamond";
        setSelectedDiamondOrigin(diamondOrigin);

        const clarity = specifications.replace(/^LG|^ND/, "");
        if (productData.diamondColorClarity.includes(clarity)) {
          setSelectedColorClarity(clarity);
        }

        console.log("Set diamond origin:", diamondOrigin);
        console.log("3-part Men's ring format detected");
      } else {
        console.warn("Invalid variant SKU format:", variantSku);

        // Fallback: auto-select first available options and default to 5-part
        setOriginalVariantFormat("5-part");
        if (productData.diamondShape && productData.diamondShape.length > 0) {
          setSelectedDiamondShape(productData.diamondShape[0]);
        }
        const availableSizes = Array.isArray(productData.diamondSize)
          ? productData.diamondSize
          : ((productData.diamondSize as any)[selectedMetalType] || (productData.diamondSize as any)["GOLD"] || []);

        if (availableSizes && availableSizes.length > 0) {
          setSelectedDiamondSize(availableSizes[0]);
        }
        return;
      }
    },
    [parseKaratAndSetMetalType],
  );

  // Fetch product data from API
  useEffect(() => {
    const fetchProductData = async () => {
      if (!id || productData) return; // Do not refetch if productData already exists

      console.log("Product Detail params - id:", id, "category:", category);

      try {
        // Only show full-page skeleton on initial load
        if (!productData) {
          setLoading(true);
        }
        setError(null);

        // First try to fetch by slug, if that fails try by modelSku
        let response = await fetch(`/api/products/model/slug/${id}?var`);

        // If slug endpoint doesn't work, try the model endpoint
        if (!response.ok) {
          const params = new URLSearchParams(location.search);
          const variantId = params.get("variantId");
          const modelUrl = variantId
            ? `/api/products/model/${id}?variantId=${encodeURIComponent(
              variantId,
            )}&metalColor=${params.get("metalColor") || "WG"}`
            : `/api/products/model/${id}`;
          response = await fetch(modelUrl);
          if (!response.ok) {
            throw new Error(
              `Failed to fetch product by modelSku: ${response.status}`,
            );
          }
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

        //set total diamond weight
        if (data.totalDiamondWeight) {
          setTotalDiamondWeight(data.totalDiamondWeight);
        }

        //set delivery days
        if (data.deliveryDays) {
          setDeliveryDays(data.deliveryDays);
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

          const availableSizes = Array.isArray(data.diamondSize)
            ? data.diamondSize
            : ((data.diamondSize as any)[selectedMetalType || "GOLD"] || (data.diamondSize as any)["GOLD"] || []);
          if (availableSizes && availableSizes.length > 0) {
            setSelectedDiamondSize(availableSizes[0]);
          }
        }

        // Set metal color based on URL parameter AFTER variant parsing
        // This supports both single colors (WG, YG, RG) and combinations (WG-YG, WG-RG)
        if (metalColorParam) {
          const colorInfo = getColorDisplayInfo(metalColorParam);
          if (colorInfo) {
            console.log(
              `Setting metal color from URL: ${metalColorParam} -> ${colorInfo.name}`,
            );
            setSelectedMetalColor(colorInfo.name);
            setSelectedColorCode(metalColorParam);
          } else {
            console.log("Invalid metal color in URL:", metalColorParam);
            // Fallback to first available color if available
            if (data.availableColors && data.availableColors.length > 0) {
              const firstColorInfo = getColorDisplayInfo(
                data.availableColors[0],
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
                `Setting default metal color: ${firstColorInfo.name}`,
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
  }, [id, category, parseVariantSku]);

    const formattedDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + deliveryDays);
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, [deliveryDays]);

  // Reset clarity selection when metal type or diamond origin changes
  useEffect(() => {
    if (!productData) return;

    const normalizedClarityOptions = getAvailableClarityOptions();

    // If current selection is not in the new options, reset to first available
    if (
      selectedColorClarity &&
      normalizedClarityOptions.length > 0 &&
      !normalizedClarityOptions.includes(selectedColorClarity)
    ) {
      setSelectedColorClarity(normalizedClarityOptions[0]);
    } else if (normalizedClarityOptions.length > 0 && !selectedColorClarity) {
      // If no selection yet, pick first available
      setSelectedColorClarity(normalizedClarityOptions[0]);
    }
  }, [selectedMetalType, selectedDiamondOrigin, productData, getAvailableClarityOptions]);

  // ---------- iJewel Preload (Silent) ----------
  useEffect(() => {
    if (!productData) return;
    if ((window as any).__ijewelPreloadLoaded) return;

    const glb =
      (productData.variantImages || []).find(
        (u: string) => !!u && u.endsWith && u.endsWith(".glb"),
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
          viewerOptions,
        );
        (window as any).__ijewelPreloadViewer = pre;
        (window as any).__ijewelPreloadLoaded = true;
      } catch (err) {
        console.warn("iJewel preload failed:", err);
      }
    };

    script.onerror = (e) => {
      console.warn("Failed to load iJewel script for preload", e);
    };

    document.body.appendChild(script);

    // Do not remove script/container on cleanup — keep preload alive
    return () => { };
  }, [productData]);

  // Separate useEffect to handle URL parameter changes for metal color
  // This ensures that URL parameters always take precedence
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const metalColorParam = params.get("metalColor");
    if (!metalColorParam) return;

    const colorInfo = getColorDisplayInfo(metalColorParam);
    if (!colorInfo) return;

    // IMPORTANT: update BOTH name + code together
    if (
      selectedColorCode !== metalColorParam ||
      selectedMetalColor !== colorInfo.name
    ) {
      setSelectedMetalColor(colorInfo.name);
      setSelectedColorCode(metalColorParam);
    }
  }, [location.search]);

  // Initialize lastValidStateRef with the first loaded variant state
  // This runs once after product data is loaded and all selections are set
  const initialStateSetRef = useRef(false);
  useEffect(() => {
    if (
      productData &&
      !initialStateSetRef.current &&
      selectedMetalColor &&
      selectedColorCode &&
      selectedMetalType
    ) {
      // Set the initial valid state from the loaded variant
      lastValidStateRef.current = {
        metalColor: selectedMetalColor,
        colorCode: selectedColorCode,
        diamondShape: selectedDiamondShape,
        diamondSize: selectedDiamondSize,
        diamondOrigin: selectedDiamondOrigin,
        colorClarity: selectedColorClarity,
        goldKarat: selectedGoldKarat,
        metalType: selectedMetalType,
        braceletSize: selectedBraceletSize,
        bandwidth: selectedBandwidth,
        finishing: selectedFinishing,
      };
      initialStateSetRef.current = true;
      console.log(
        "Initial lastValidStateRef set from loaded variant:",
        lastValidStateRef.current,
      );
    }
  }, [
    productData,
    selectedMetalColor,
    selectedColorCode,
    selectedDiamondShape,
    selectedDiamondSize,
    selectedDiamondOrigin,
    selectedColorClarity,
    selectedGoldKarat,
    selectedMetalType,
    selectedBraceletSize,
  ]);

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

      // Preserve original values if not explicitly set
      const shapeCode = selectedDiamondShape
        ? shapeCodeMap[selectedDiamondShape] || ""
        : ""; // Keep empty if not explicitly set

      const caratCode = selectedDiamondSize
        ? String(Math.round(parseFloat(selectedDiamondSize) * 100))
        : ""; // Keep empty if not explicitly set

      const metalCodeMap: { [key: string]: string } = {
        GOLD: "",
        PLATINUM: "PT",
        SILVER: "SLV",
      };

      let karatCode = "18";
      if (selectedMetalType === "GOLD") {
        const normalizedKarat = normalizeKarat(selectedGoldKarat);
        karatCode = normalizedKarat.includes("kt")
          ? normalizedKarat.replace("kt", "")
          : normalizedKarat;
      } else if (selectedMetalType === "PLATINUM") {
        karatCode = "PT";
      } else if (selectedMetalType === "SILVER") {
        karatCode = "SLV";
      }

      // If both shape and carat are empty, use 4-part format: modelSku-karat-specs-size
      // Otherwise use 6-part format: modelSku-shape-carat-karat-specs-size
      if (!shapeCode && !caratCode) {
        return `${modelSku}-${karatCode}-${specifications}-${selectedBraceletSize}`;
      } else {
        return `${modelSku}-${shapeCode}-${caratCode}-${karatCode}-${specifications}-${selectedBraceletSize}`;
      }
    }

    const modelSku = productData.modelSku;

    let karatCode = "18";

    // Determine metal code based on metal type
    if (selectedMetalType === "GOLD") {
      // For gold, extract just the number from "18kt", "14kt", "9kt"
      const normalizedKarat = normalizeKarat(selectedGoldKarat);
      karatCode = normalizedKarat.includes("kt")
        ? normalizedKarat.replace("kt", "")
        : normalizedKarat;
    } else if (selectedMetalType === "PLATINUM") {
      // For platinum, use "PT" directly
      karatCode = "PT";
    } else if (selectedMetalType === "SILVER") {
      // For silver, use "SLV" directly
      karatCode = "SLV";
    }

    const originCode =
      selectedDiamondOrigin === "Lab Grown Diamond" ? "LG" : "ND";
    const specifications = `${originCode}${selectedColorClarity}`;

    if (originalVariantFormat === "5-part") {
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
          "0",
        )
        : "30";

      return `${modelSku}-${shapeCode}-${caratCode}-${karatCode}-${specifications}`;
    } else {
      // 3-part base with optional bandwidth and finishing (Men's rings)
      let variantId = `${modelSku}-${karatCode}-${specifications}`;

      // Add bandwidth if selected (Men's Rings)
      if (selectedBandwidth) {
        variantId += `-${selectedBandwidth}`;
      }

      // Add finishing if selected (Men's Rings)
      if (selectedFinishing) {
        variantId += `-${selectedFinishing}`;
      }

      return variantId;
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
    selectedBandwidth,
    selectedFinishing,
    activeVariantSku,
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
        newVariantId,
      )}&metalColor=${metalColor}`,
      {
        replace: true,
      },
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

    setIsUpdating(true); // Start subtle loading state

    // Use the selectedColorCode directly since it can be single or combination
    const metalCode = selectedColorCode || "WG";

    try {
      const response = await fetch(
        `/api/products/model/${id}?variantId=${currentVariantId}&metalColor=${metalCode}`,
      );

      const newData = await response.json();

      // Check if the response indicates variant not found
      // The API returns 404 with {"success": true, "data": "Variant not found for the provided variantId"}
      if (
        !response.ok ||
        (newData.success &&
          typeof newData.data === "string" &&
          newData.data.includes("Variant not found"))
      ) {
        console.log(
          "Variant not found for:",
          currentVariantId,
          "with metal color:",
          metalCode,
        );

        // Revert to last valid state
        setSelectedMetalColor(lastValidStateRef.current.metalColor);
        setSelectedColorCode(lastValidStateRef.current.colorCode);
        setSelectedDiamondShape(lastValidStateRef.current.diamondShape);
        setSelectedDiamondSize(lastValidStateRef.current.diamondSize);
        setSelectedDiamondOrigin(lastValidStateRef.current.diamondOrigin);
        setSelectedColorClarity(lastValidStateRef.current.colorClarity);
        setSelectedGoldKarat(lastValidStateRef.current.goldKarat);
        setSelectedMetalType(lastValidStateRef.current.metalType);
        setSelectedBraceletSize(lastValidStateRef.current.braceletSize);

        // Also revert the URL to the last valid variant
        // Use the last valid variant from productData if available
        if (productData?.chosenVariantSku) {
          const currentPath = category
            ? `/product/${category}/${id}`
            : `/product/${id}`;
          navigate(
            `${currentPath}?variantId=${encodeURIComponent(
              productData.chosenVariantSku,
            )}&metalColor=${lastValidStateRef.current.colorCode}`,
            {
              replace: true,
            },
          );
        }

        toast.error(
          "This combination is not available. Please select a different option.",
        );
        return;
      }

      // Update product data with valid response
      setProductData(newData);

      // Update total diamond weight from the new product data
      if (newData.totalDiamondWeight && typeof newData.totalDiamondWeight === 'number') {
        setTotalDiamondWeight(newData.totalDiamondWeight);
      } else if (selectedDiamondSize) {
        const parsed = parseFloat(String(selectedDiamondSize));
        if (!Number.isNaN(parsed)) {
          setTotalDiamondWeight(parsed);
        }
      }

      // Update last valid state since this variant exists
      lastValidStateRef.current = {
        metalColor: selectedMetalColor,
        colorCode: selectedColorCode,
        diamondShape: selectedDiamondShape,
        diamondSize: selectedDiamondSize,
        diamondOrigin: selectedDiamondOrigin,
        colorClarity: selectedColorClarity,
        goldKarat: selectedGoldKarat,
        metalType: selectedMetalType,
        braceletSize: selectedBraceletSize,
        bandwidth: selectedBandwidth,
        finishing: selectedFinishing,
      };

      // Reset to first image to avoid showing wrong cached images
      setSelectedImage(0);
    } catch (error) {
      console.error("Error refetching product data:", error);
      // On error, also revert to last valid state
      setSelectedMetalColor(lastValidStateRef.current.metalColor);
      setSelectedColorCode(lastValidStateRef.current.colorCode);
      setSelectedDiamondShape(lastValidStateRef.current.diamondShape);
      setSelectedDiamondSize(lastValidStateRef.current.diamondSize);
      setSelectedDiamondOrigin(lastValidStateRef.current.diamondOrigin);
      setSelectedColorClarity(lastValidStateRef.current.colorClarity);
      setSelectedGoldKarat(lastValidStateRef.current.goldKarat);
      setSelectedMetalType(lastValidStateRef.current.metalType);
      setSelectedBraceletSize(lastValidStateRef.current.braceletSize);

      // Also revert the URL on network error
      if (productData?.chosenVariantSku) {
        const currentPath = category
          ? `/product/${category}/${id}`
          : `/product/${id}`;
        navigate(
          `${currentPath}?variantId=${encodeURIComponent(
            productData.chosenVariantSku,
          )}&metalColor=${lastValidStateRef.current.colorCode}`,
          {
            replace: true,
          },
        );
      }
    } finally {
      setIsUpdating(false); // End subtle loading state
    }
  }, [
    id,
    category,
    navigate,
    productData,
    selectedColorCode,
    generateVariantId,
    selectedMetalColor,
    selectedDiamondShape,
    selectedDiamondSize,
    selectedDiamondOrigin,
    selectedColorClarity,
    selectedGoldKarat,
    selectedMetalType,
    selectedBraceletSize,
  ]);

  // Track previous variant and color to prevent unnecessary refetches
  const prevVariantRef = useRef<string | null>(null);
  const prevColorCodeRef = useRef<string | null>(null);

  useEffect(() => {
    if (!productData) return;

    const newVariantId = generateVariantId();
    if (!newVariantId) return;

    // Check if color actually changed
    const colorChanged =
      prevColorCodeRef.current !== null &&
      prevColorCodeRef.current !== selectedColorCode;

    // If the generated variantId is same as API one and color hasn't changed => do NOT refetch
    if (productData.chosenVariantSku === newVariantId && !colorChanged) {
      prevVariantRef.current = newVariantId;
      prevColorCodeRef.current = selectedColorCode;
      return;
    }

    // Check if nothing changed
    if (prevVariantRef.current === newVariantId && !colorChanged) {
      return;
    }

    // Debounce to prevent spam
    const debounce = setTimeout(() => {
      prevVariantRef.current = newVariantId;
      prevColorCodeRef.current = selectedColorCode;
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
    selectedColorCode,
    selectedColorClarity,
    selectedBraceletSize,
    selectedBandwidth,
    selectedFinishing,
  ]);

  // Auto-select appropriate karat and default metal color when metal type changes
  const prevMetalTypeRef = useRef<string | null>(null);

  useEffect(() => {
    if (!selectedMetalType || !productData) return;

    // Only run this logic when metal type actually changes
    if (prevMetalTypeRef.current === null) {
      // First render, just track the metal type
      prevMetalTypeRef.current = selectedMetalType;
      return;
    }

    if (prevMetalTypeRef.current === selectedMetalType) return;
    prevMetalTypeRef.current = selectedMetalType;

    // When metal type changes, reset to WG (White Gold) or first available color
    // This ensures we don't keep combination colors like RG-WG when switching to Silver/Platinum
    let defaultColorCode = "WG"; // Default to White Gold

    if (productData.availableColors && productData.availableColors.length > 0) {
      // Check if WG is available, otherwise use first available
      if (productData.availableColors.includes("WG")) {
        defaultColorCode = "WG";
      } else {
        defaultColorCode = productData.availableColors[0];
      }

      const colorInfo = getColorDisplayInfo(defaultColorCode);
      if (colorInfo) {
        setSelectedMetalColor(colorInfo.name);
        setSelectedColorCode(defaultColorCode);

        // Update URL with new metal color parameter
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set("metalColor", defaultColorCode);
        navigate(`${currentUrl.pathname}${currentUrl.search}`, {
          replace: true,
        });
      }
    }

    // Get available karats for the selected metal type
    let availableKarats: (string | number)[] = [];
    switch (selectedMetalType) {
      case "GOLD":
        availableKarats = productData.goldKarats.filter((karat) =>
          karat.toString().includes("kt"),
        );
        break;
      case "PLATINUM":
        availableKarats = productData.goldKarats.filter(
          (karat) => karat.toString() === "950",
        );
        break;
      case "SILVER":
        availableKarats = productData.goldKarats.filter(
          (karat) => karat.toString() === "925",
        );
        break;
      default:
        availableKarats = productData.goldKarats;
    }

    // Auto-select the appropriate karat based on metal type
    switch (selectedMetalType) {
      case "GOLD":
        // Keep current selection if it's a valid gold karat, otherwise select first available
        if (
          !selectedGoldKarat ||
          !normalizeKarat(selectedGoldKarat).includes("kt")
        ) {
          const firstGoldKarat = availableKarats[0];
          if (firstGoldKarat) {
            setSelectedGoldKarat(normalizeKarat(firstGoldKarat));
          }
        }
        break;
      case "PLATINUM":
        if (selectedGoldKarat !== "950") {
          setSelectedGoldKarat("950");
        }
        break;
      case "SILVER":
        if (selectedGoldKarat !== "925") {
          setSelectedGoldKarat("925");
        }
        break;
    }

    // Check if currently selected diamond size is available in the new metal type
    const newAvailableSizes = getDiamondSizes();
    if (
      selectedDiamondSize &&
      newAvailableSizes.length > 0 &&
      !newAvailableSizes.includes(selectedDiamondSize)
    ) {
      setSelectedDiamondSize(newAvailableSizes[0]);
    }
  }, [selectedMetalType, productData?.modelSku, navigate, getDiamondSizes, selectedDiamondSize]);

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

        // Don't call refetchProductData here - let the main useEffect handle it
      }
    },
    [navigate],
  );

  // Removed: Refetch is now handled by the main variant update useEffect

  const handleWishlistToggle = useCallback(
    (event?: React.MouseEvent) => {
      event?.preventDefault();
      event?.stopPropagation();

      if (!isAuthenticated) {
        navigate("/login");
        return;
      }

      if (!productData?._id) {
        toast.error("Product information is missing. Please try again.");
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
          title: productData.title,
          categorySlug: currentCategorySlug,
          categoryLabel: productData.category || currentCategorySlug,
          variantSku: activeVariantSku,
          metalColorName: selectedMetalColor,
          metalColorCode: currentMetalColorCode,
          primaryImage,
          price:
            typeof productData.sellingPrice === "number"
              ? productData.sellingPrice
              : typeof productData.priceBreakdown?.totalBeforeGst === "number"
                ? productData.priceBreakdown.totalBeforeGst
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
        }),
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
    ],
  );

  // REMOVED: Duplicate useEffect that was causing infinite loop
  // The variant update is now handled by the main useEffect above

  // Get available karat values based on selected metal type
  const getAvailableKarats = () => {
    if (!productData || !selectedMetalType) return [];

    switch (selectedMetalType) {
      case "GOLD":
        // Show only kt values for gold (filter out 950 and 925)
        // Sort in descending order (18kt, 14kt, 9kt)
        return productData.goldKarats
          .filter((karat) => normalizeKarat(karat).includes("kt"))
          .sort((a, b) => {
            const numA = parseInt(normalizeKarat(a));
            const numB = parseInt(normalizeKarat(b));
            return numB - numA; // Descending order
          });
      case "PLATINUM":
        // Show only 950 for platinum
        return productData.goldKarats.filter(
          (karat) => karat.toString() === "950",
        );
      case "SILVER":
        // Show only 925 for silver
        return productData.goldKarats.filter(
          (karat) => karat.toString() === "925",
        );
      default:
        return productData.goldKarats;
    }
  };

  // Get display label for karat values
  const getKaratDisplayLabel = (karat: string | number) => {
    const karatStr = normalizeKarat(karat);
    if (selectedMetalType === "PLATINUM" && karatStr === "950") {
      return "PT 950";
    } else if (selectedMetalType === "SILVER" && karatStr === "925") {
      return "SLV 925";
    }
    // Convert to uppercase for display (14kt -> 14KT)
    return karatStr.toUpperCase();
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
    if (thumbnailsDesktopRef.current) {
      thumbnailsDesktopRef.current.scrollBy({ top: -72, behavior: "smooth" }); // 64px thumbnail + 8px gap
    }
  };

  const scrollThumbnailsDown = () => {
    if (thumbnailsDesktopRef.current) {
      thumbnailsDesktopRef.current.scrollBy({ top: 72, behavior: "smooth" }); // 64px thumbnail + 8px gap
    }
  };

  const scrollThumbnailsLeft = () => {
    if (thumbnailsMobileRef.current) {
      thumbnailsMobileRef.current.scrollBy({ left: -72, behavior: "smooth" }); // 64px thumbnail + 8px gap
    }
  };

  const scrollThumbnailsRight = () => {
    if (thumbnailsMobileRef.current) {
      thumbnailsMobileRef.current.scrollBy({ left: 72, behavior: "smooth" }); // 64px thumbnail + 8px gap
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
      toast.error("Please log in to add items to cart");
      navigate("/login");
      return;
    }

    if (!productData || !productData.chosenVariantSku) {
      toast.error("Please select all product options");
      return;
    }

    // Validate ring size for rings
    if (category === "rings" && !selectedSize) {
      toast.error("Please select a ring size before adding to cart");
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
          title: productData.title, // Include product title for cart display
          metalColor: selectedMetalColor,
          metalColorCode: selectedColorCode, // Add the color code for API requests
          metalType: selectedMetalType,
          goldKarat: selectedGoldKarat,
          diamondShape: selectedDiamondShape,
          diamondSize: selectedDiamondSize,
          diamondOrigin: selectedDiamondOrigin,
          ringSize: category === "rings" ? selectedSize : undefined,
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
      toast.success("Product added to cart successfully!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add product to cart");
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
            engravingImageUrl,
          );
          const response = await fetch(engravingImageUrl);
          const blob = await response.blob();
          formData.append("image", blob, "engraving.png");
        } else {
          console.warn(
            "⚠️ No valid engraving image URL found, using placeholder",
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
    [engravingImageUrl],
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
        engravingMotifPath,
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
      toast.error("Please log in to purchase");
      // Store full pathname + search params for redirect after login
      const fullPath = location.pathname + location.search;
      navigate("/login", {
        state: { from: fullPath },
      });
      return;
    }

    if (category === "rings") {
      if (!selectedSize) {
        toast.error("Please select a ring size");
        return;
      }
    }

    if (!productData || !productData.chosenVariantSku) {
      toast.error("Please select all product options");
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
          toast.error("Failed to upload engraving image. Please try again.");
          return;
        }
        console.log(
          "✅ Engraving uploaded successfully:",
          cloudinaryEngravingUrl,
        );
      } catch (error) {
        console.error("❌ Engraving upload error:", error);
        toast.error("Failed to upload engraving image. Please try again.");
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
              _id: productData.title,
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
    [],
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
    "11 (16.3MM)",
    "12 (16.5MM)",
    "13 (16.9MM)",
    "14 (17.3MM)",
    "15 (17.5MM)",
    "16 (17.9MM)",
    "17 (18.1MM)",
    "18 (18.5MM)",
    "19 (18.7MM)",
    "20 (19.2MM)",
    "21 (19.4MM)",
    "22 (19.8MM)",
    "23 (20MM)",
    "24 (20.4MM)",
    "25 (20.6MM)",
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

  // Handle diamond origin selection with silver metal validation
  const handleDiamondOriginSelect = (origin: string) => {
    // Check if trying to select natural diamond with silver metal
    if (origin === "Natural Diamond" && selectedMetalType === "SILVER") {
      toast.error(
        "Natural diamonds are not available for silver metals. Please select Lab Grown Diamond or change the metal type.",
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
            },
          );
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
            <Link
              to={`/${category || ""}`}
              className="text-[#328F94] hover:underline"
            >
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
        image={
          productData?.variantImages?.[0] ||
          "https://cdn.kynajewels.com/RENDERING%20PHOTOS/SRAER/ENG1-10/ENG1-CUS-100-WG-GP.web"
        }
      />
      <ShareEmailModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        defaultMessage={shareMessage}
        shareUrl={shareUrl}
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
                    ref={thumbnailsDesktopRef}
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
                        className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all hover:scale-105 relative ${selectedImage === index
                            ? "border-[#328F94] ring-2 ring-[#328F94]/20"
                            : "border-neutral-200 hover:border-neutral-300"
                          }`}
                      >
                        {is3DModel(image, index) ? (
                          <div className="relative flex justify-center items-center w-full h-full bg-gradient-to-br from-gray-100 to-gray-200">
                            {/* <div className="absolute top-1 right-1 bg-[#328F94] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                              3D
                            </div> */}
                            <img
                              src="/3D/green.svg"
                              alt="3D model thumbnail"
                              className="w-16 h-16"
                            />
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
                                `Failed to load desktop thumbnail ${index + 1
                                }:`,
                                image,
                              );
                            }}
                            onLoad={() => {
                              console.error(
                                `Loaded desktop thumbnail ${index + 1}`,
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
                <div
                  ref={imageContainerRef}
                  style={{ scrollMarginTop: "160px" }}
                  className={`flex-1 relative aspect-square rounded-lg overflow-hidden transition-opacity duration-300 ${isUpdating ? "opacity-50" : "opacity-100"
                    }`}
                >
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
                            src={currentImage}
                            className="w-full h-full object-cover"
                            controls
                            muted
                            autoPlay
                            playsInline
                          />
                        </div>
                      );
                    }

                    // Static image (non-3D) or no image available
                    if (currentImage) {
                      return (
                        <div className="image-container">
                          {isImageLoading && (
                            <div className="image-placeholder" /> // Placeholder remains visible until the image loads
                          )}
                          <img
                            src={
                              productData?.variantImages?.[selectedImage] || ""
                            }
                            alt="Product Image"
                            className={isImageLoading ? "hidden" : "visible"} // Hide image until fully loaded
                            onLoad={() => setIsImageLoading(false)}
                            onError={() => setIsImageLoading(false)}
                            onLoadStart={() => setIsImageLoading(true)}
                          />
                        </div>
                      );
                    }

                    return (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        No image available
                      </div>
                    );
                  })()}

                  <div className="hidden absolute bg-[#68C5C0] text-white top-4 left-4 px-2 py-1 rounded-md text-xs font-semibold">
                    15% OFF
                  </div>
                  <button
                    onClick={handleWishlistToggle}
                    disabled={wishlistLoading}
                    aria-pressed={isInWishlist}
                    className={`absolute top-4 right-4 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors ${isInWishlist ? "text-red-500" : "text-gray-600"
                      } ${wishlistLoading ? "opacity-70 cursor-not-allowed" : ""
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
                    ref={thumbnailsMobileRef}
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
                        className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all hover:scale-105 relative ${selectedImage === index
                            ? "border-[#328F94] ring-2 ring-[#328F94]/20"
                            : "border-neutral-200 hover:border-neutral-300"
                          }`}
                      >
                        {is3DModel(image, index) ? (
                          <div className="relative w-full h-full flex justify-center items-center bg-gradient-to-br from-gray-100 to-gray-200">
                            {/* <div className="absolute top-1 right-1 bg-[#328F94] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                              3D
                            </div> */}
                            <img
                              src="/3D/green.svg"
                              className="w-10 h-10"
                              alt=""
                            />
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
                                image,
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
                  {/*  <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">4.9</span>
                    </div> */}
                    {/* <span className="text-primary text-[#328F94] bg-[#328F94]/5 text-sm">
                      {productData.variantCount} Variants
                    </span> */}
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">
                    {productData.description}
                  </p>
                  <div className="flex items-end gap-4">
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

                  {/* Chain Information for Pendants */}
                  {productData.category === "PENDANTS" && (
                      <div
                        style={{
                          backgroundColor: "#EDF8F1",
                          color: "#328F94",
                          padding: "12px 16px",
                          marginBottom: "16px",
                          fontSize: "14px",
                        }}
                        className="w-fit pt-1 pb-1 pl-4 pr-4 rounded-full mb-4"
                      >
                        <p style={{ marginBottom: "0" }}>
                          Pricing {productData.chainOption}  {productData.chainLengthInches !== null
                            ? `| Chain length ${productData.chainLengthInches} inches`
                            : ""
                          }
                        </p>
                      </div>
                    )}
                </div>

                {/* Diamond Origin */}
                <div className="mb-6">
                  <h3 className="flex items-center gap-3 mb-3 text-sm">
                    Diamond Origin{" "}
                    <button
                      type="button"
                      className={`w-4 h-4 flex items-center justify-center rounded-full transition-colors text-white text-[0.5rem] relative ${showTooltip ? "bg-[#328F94]" : "bg-[#ABA7AF]"
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
                    <button
                      onClick={() => setIsPdfPopupOpen(true)}
                      className="text-[#328F94] underline"
                    >
                      Stone Guide
                    </button>
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
                          className={`px-3 py-2 rounded-full border text-xs font-medium transition-all ${isDisabled
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
                      <div className="flex flex-wrap gap-2 overflow-x-auto overflow-hidden no-scrollbar py-2">
                        {sampleProduct.diamondShapes
                          .filter((shape) =>
                            productData.diamondShape.includes(
                              shape.name.toUpperCase(),
                            ),
                          )
                          .map((shape) => (
                            <button
                              key={shape.name}
                              onClick={() => {
                                const newShape = shape.name.toUpperCase();
                                setSelectedDiamondShape(newShape);
                                scrollToImageOnMobile();
                              }}
                              className={`group relative w-[50px] h-[50px] border rounded-lg p-1 
          ${selectedDiamondShape === shape.name.toUpperCase()
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

                <div className="grid grid-cols-2 pt-0 mt-0 gap-4">
                  {getDiamondSizes().length > 0 &&
                    !(
                      getDiamondSizes().length === 1 &&
                      getDiamondSizes()[0] === "0"
                    ) && (
                      <div>
                        <label className="block text-xs mb-2">
                          Diamond Size {productData.category === "RINGS" || productData.category === "PENDANTS" || productData.category === "EARRINGS" ? (<span>(Center Stone)</span>) : productData.category === "BRACELETS" ? (<span>(Per Stone)</span>) : null}:{" "}
                        </label>
                        <Select
                          value={selectedDiamondSize}
                          onValueChange={(value) => {
                            setSelectedDiamondSize(value);
                            scrollToImageOnMobile();
                          }}
                        >
                          <SelectTrigger className="text-sm border-neutral-300">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            {getDiamondSizes()
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
                              .sort((a, b) => parseFloat(a) - parseFloat(b))
                              .map((size, index) => (
                                <SelectItem key={index} value={size}>
                                  {parseFloat(size).toFixed(2)} Carat
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  {(() => {
                    // Get available clarity options based on diamond type and metal type using the helper function
                    const availableClarityOptions = getAvailableClarityOptions();

                    return availableClarityOptions.length > 0 ? (
                      <div>
                        <label className="block text-xs mb-2">
                          Color & Clarity:{" "}<span className="text-xs text-[#8D8A91]">{selectedColorClarity}</span>
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
                            {availableClarityOptions.map((cc, index) => (
                              <SelectItem key={index} value={cc}>
                                {cc}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* Metal Type */}
                <div className="my-6 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs mb-2">Metal Type:{" "}<span className="text-xs text-[#8D8A91]">{selectedMetalType}</span></label>
                    <Select
                      value={selectedMetalType}
                      onValueChange={(value) => {
                        setSelectedMetalType(value);
                        // Set appropriate karat/purity based on metal type
                        let newKarat = "";
                        if (value === "SILVER") {
                          newKarat = "925";
                        } else if (value === "PLATINUM") {
                          newKarat = "950";
                        } else {
                          // For GOLD, filter and get first available gold karat
                          const availableGoldKarats = (productData?.goldKarats || [])
                            .filter((k) => normalizeKarat(k).includes("kt"))
                            .sort((a, b) => {
                              const numA = parseInt(normalizeKarat(a));
                              const numB = parseInt(normalizeKarat(b));
                              return numB - numA; // Descending order
                            });
                          newKarat = availableGoldKarats.length > 0 ? normalizeKarat(availableGoldKarats[0]) : "18kt";
                        }
                        setSelectedGoldKarat(newKarat);

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
                      <h3 className="mb-1 text-sm">{getKaratSectionTitle()}:{" "}<span className="text-xs text-[#8D8A91]">{selectedGoldKarat}</span></h3>
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
                                const newKarat = normalizeKarat(karat);
                                setSelectedGoldKarat(newKarat);
                              }}
                              className={`px-3 py-1.5 rounded-full border text-xs min-w-max whitespace-nowrap ${normalizeKarat(selectedGoldKarat) ===
                                  normalizeKarat(karat)
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
                          onClick={() => {
                            updateMetalColor(code);
                            scrollToImageOnMobile();
                          }}
                          className={`relative flex justify-center items-center rounded-full border-2 transition-all ${selectedColorCode === code
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

                {/* Bandwidth and Finishing for Men's Rings */}
                {originalVariantFormat === "3-part" &&
                  ((productData?.bandwidth?.length ?? 0) > 0 ||
                    (productData?.finishing?.length ?? 0) > 0) && (
                    <div className="my-6">
                      <div
                        className={`grid ${(productData?.bandwidth?.length ?? 0) > 0 &&
                            (productData?.finishing?.length ?? 0) > 0
                            ? "grid-cols-2"
                            : "grid-cols-1"
                          } gap-4`}
                      >
                        {/* Bandwidth Selection */}
                        {(productData?.bandwidth?.length ?? 0) > 0 && (
                          <div className=" ">
                            <label className="block text-sm mb-2">
                              Band Width (mm)
                            </label>
                            <Select
                              value={selectedBandwidth}
                              onValueChange={(value) => {
                                setSelectedBandwidth(value);
                                scrollToImageOnMobile();
                              }}
                            >
                              <SelectTrigger
                                className={`text-sm border-neutral-300 ${(productData?.bandwidth?.length ?? 0) > 0 &&
                                    (productData?.finishing?.length ?? 0) > 0
                                    ? "w-full"
                                    : "w-1/2"
                                  }`}
                              >
                                <SelectValue placeholder="Select Width" />
                              </SelectTrigger>
                              <SelectContent className="bg-white">
                                {productData.bandwidth?.map((width) => (
                                  <SelectItem key={width} value={width}>
                                    {width}mm
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {/* Finishing Selection */}
                        {(productData?.finishing?.length ?? 0) > 0 && (
                          <div>
                            <label className="block text-sm mb-2">
                              Finish Type
                            </label>
                            <Select
                              value={selectedFinishing}
                              onValueChange={(value) => {
                                setSelectedFinishing(value);
                                scrollToImageOnMobile();
                              }}
                            >
                              <SelectTrigger
                                className={`${(productData?.bandwidth?.length ?? 0) > 0 &&
                                    (productData?.finishing?.length ?? 0) > 0
                                    ? "w-full"
                                    : "w-1/2"
                                  } border-neutral-300`}
                              >
                                <SelectValue placeholder="Select Finish" />
                              </SelectTrigger>
                              <SelectContent className="bg-white">
                                {productData.finishing?.map((finish) => (
                                  <SelectItem
                                    key={finish.code}
                                    value={finish.code}
                                  >
                                    {finish.type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                {category === "rings" && (
                  <div className="my-6 space-y-2">
                    {" "}
                    {/* Ring Size */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-2">
                          Ring Size
                          <span className="text-xs text-gray-500 font-normal ml-1">
                            Indian size (dimensions in mm)
                          </span>
                        </label>
                        <Select
                          value={selectedSize}
                          onValueChange={(value) => {
                            setSelectedSize(value);
                          }}
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
                    <Button
                      variant="link"
                      size="sm"
                      className="text-[#328F94] hover:underline p-0 mt-1"
                      onClick={() => setIsRingSizePopupOpen(true)}
                    >
                      Ring Size Guide
                    </Button>
                  </div>
                )}

                {category === "bracelets" && (
                  <>
                    <div className="">
                      {/* Bracelet Size */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm mb-2">
                            Bracelet Size <span className="text-gray-500">(inches)</span>
                          </label>
                          <Select
                            value={selectedBraceletSize}
                            onValueChange={(value) => {
                              setSelectedBraceletSize(value);
                            }}
                          >
                            <SelectTrigger className="text-sm border-neutral-300">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              {braceletSizes.map((size) => (
                                <SelectItem key={size} value={size}>
                                  {size} inches
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-[#328F94] p-0"
                      onClick={() => setIsBraceletSizePopupOpen(true)}
                    >
                      Bracelet Size Guide
                    </Button>
                  </>
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
                    Estimated Ship Date: {formattedDate}
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

                {/* Certification Logos */}
                <div className="flex items-center gap-4 justify-start">
                  <img
                    src="/Hallmarks/GIA.png"
                    className="h-20 w-20 object-contain"
                    alt="GIA Certification"
                  />
                  <img
                    src="/Hallmarks/IGI.png"
                    alt="IGI Certification"
                    className="h-14 w-14 object-contain"
                  />
                  <img
                    src="/Hallmarks/SGL.png"
                    alt="SGL Certification"
                    className="h-20 w-20 object-contain"
                  />
                  <img
                    src="/Hallmarks/BIS.png"
                    alt="BIS Hallmark"
                    className="h-14 w-14 object-contain"
                  />
                </div>

                {/* Share Options */}
                <div className="mt-3">
                  {/* <h3 className="font-medium mb-3 text-sm">Share</h3> */}
                  <div className="flex flex-row flex-nowrap justify-between text-[#328F94] gap-3">
                    {socialLinks.map((link, index) => (
                      <Button
                        key={index}
                        size="sm"
                        className="flex items-center w-full gap-2 text-xs"
                        onClick={link.action}
                      >
                        {link.isImage ? (
                          <img
                            src={link.icon as string}
                            alt={link.label}
                            className={`${link.height} ${link.width}`}
                          />
                        ) : (
                          // @ts-ignore
                          <link.icon size={14} />
                        )}
                        {link.label}
                      </Button>
                    ))}
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
                        {productData.category === "PENDANTS" && (
                          <>
                            {productData.chainOption && (
                              <div className="flex justify-between py-2 border-b border-[#328F94]">
                                <span className="text-muted-foreground">
                                  With Chain
                                </span>
                                <span className="font-medium">
                                  {productData.chainOption
                                    .toLowerCase()
                                    .includes("with chain")
                                    ? "Yes"
                                    : "No"}
                                </span>
                              </div>
                            )}
                            {productData.chainLengthInches && (
                              <div className="flex justify-between py-2 border-b border-[#328F94]">
                                <span className="text-muted-foreground">
                                  Chain Length
                                </span>
                                <span className="font-medium">
                                  {productData.chainLengthInches} inches
                                </span>
                              </div>
                            )}
                          </>
                        )}
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
                        {selectedGoldKarat && (
                          <div className="flex justify-between py-2 border-b border-[#328F94]">
                            <span className="text-muted-foreground">
                              Metal Purity
                            </span>
                            <span className="font-medium">
                              {getKaratDisplayLabel(selectedGoldKarat)}
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
                            <span>
                              {productData.netWeightGrams.toFixed(2)} g
                            </span>
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
                        <div className="flex items-center gap-4 justify-start md:justify-center">
                          <img
                            src="/Hallmarks/GIA.png"
                            className="h-20 w-20 object-contain"
                            alt="GIA Certification"
                          />
                          <img
                            src="/Hallmarks/IGI.png"
                            alt="IGI Certification"
                            className="h-14 w-14 object-contain"
                          />
                          <img
                            src="/Hallmarks/SGL.png"
                            alt="SGL Certification"
                            className="h-20 w-20 object-contain"
                          />
                          <img
                            src="/Hallmarks/BIS.png"
                            alt="BIS Hallmark"
                            className="h-14 w-14 object-contain"
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
                            Total Diamond Weight
                          </span>
                          <span className="font-medium">{totalDiamondWeight.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-[#328F94]">
                          <span className="text-muted-foreground">
                            Certification
                          </span>
                          <span className="font-medium">GIA/IGI/SGL Certified</span>
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
                            {`${selectedMetalType} Value`}
                          </span>
                          <span className="font-medium">
                            Rs.{" "}
                            {Math.round(
                              productData.priceBreakdown.metalCost,
                            ).toLocaleString()}
                            /-
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-[#328F94]">
                          <span className="text-muted-foreground">
                            Diamond Value
                          </span>
                          <span className="font-medium">
                            Rs.{" "}
                            {Math.round(
                              productData.priceBreakdown.diamondCost +
                              productData.priceBreakdown.expense,
                            ).toLocaleString()}
                            /-
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-[#328F94]">
                          <span className="text-muted-foreground">
                            Making Charges
                          </span>
                          <span className="font-medium">
                            Rs.{" "}
                            {Math.round(
                              (productData.priceBreakdown.labourCost)
                            ).toLocaleString()}
                            /-
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-[#328F94]">
                          <span className="text-muted-foreground">GST</span>
                          <span className="font-medium">
                            Rs.{" "}
                            {Math.round(
                              productData.priceBreakdown.gstAmount,
                            ).toLocaleString()}
                            /-
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-[#328F94] font-semibold">
                          <span>Total</span>
                          <span>
                            Rs.{" "}
                            {Math.round(
                              productData.priceBreakdown.totalWithGst,
                            ).toLocaleString()}
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
                "-EV.webp",
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
      <RingSizeGuidePopup
        isOpen={isRingSizePopupOpen}
        onClose={() => setIsRingSizePopupOpen(false)}
      />
      <BraceletSizeGuidePopup
        isOpen={isBraceletSizePopupOpen}
        onClose={() => setIsBraceletSizePopupOpen(false)}
      />
      <PdfPopup
        isOpen={isPdfPopupOpen}
        onClose={() => setIsPdfPopupOpen(false)}
        pdfUrl="/Stone_Guide.pdf"
        title="Quality & Certification"
      />
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
        options: object,
      ) => void;
    };
  }
}
