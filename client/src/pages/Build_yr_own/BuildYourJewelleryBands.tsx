import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Mail,
  MessageCircle,
  Share2,
} from "lucide-react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { addToCart } from "@/store/slices/cartSlice";
import type { RootState, AppDispatch } from "@/store";
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
import { toast } from "sonner";

// Map color codes to display info (handles both single and combination colors)
const getColorDisplayInfo = (
  code: string,
): { name: string; colors: string[]; img: string } | null => {
  // Single colors
  const singleColorMap: Record<string, { name: string; img: string }> = {
    WG: { name: "White Gold", img: "/colors/white.png" },
    YG: { name: "Yellow Gold", img: "/colors/gold.png" },
    RG: { name: "Rose Gold", img: "/colors/rosegold.png" },
    "3T": { name: "Three Tone", img: "/colors/threetone.png" },
    BR: { name: "Black Rhodium", img: "/colors/br.png" },
    SLV: { name: "Silver", img: "/colors/white.png" },
    PT: { name: "Platinum", img: "/colors/white.png" },
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
    const combinationImageUrl = `/metal_colors/${code}.png`;

    return {
      name: `${getColorName(color1)} - ${getColorName(color2)}`,
      colors: [color1, color2],
      img: combinationImageUrl,
    };
  }

  return null;
};

// Types for API response
interface ApiVariant {
  sku: string;
}

interface ApiProduct {
  parentSku: string;
  builderView: string;
  selectedImage: {
    url: string;
    color: string;
    metalType: string;
    metalKt: string;
  };
  variants: ApiVariant[];
}

interface ApiResponse {
  success: boolean;
  stylingName: string;
  count: number;
  entries: ApiProduct[];
}

// Product Model API interfaces
interface ProductModelResponse {
  _id: string;
  success: boolean;
  modelSku: string;
  title: string;
  description: string;
  metalTypes: string[];
  goldKarats: string[];
  diamondShape: string[];
  diamondSize:
    | {
        GOLD?: string[];
        PLATINUM?: string[];
        SILVER?: string[];
      }
    | string[];
  diamondColorClarity: string[];
  diamondOptions?: {
    LAB: {
      GOLD: string[];
      PLATINUM: string[];
    };
    NATURAL: {
      GOLD: string[];
      PLATINUM: string[];
    };
  };
  isEngraving: boolean;
  engravingInfo: {
    fontSize: number;
    maxCharacters: number;
  };
  variantCount: number;
  firstVariantSku: string;
  sellingPrice: number;
  priceIncomplete: boolean;
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
  priceIncompleteReasons: string[];
  chosenVariantSku: string;
  variantImages: string[];
  availableColors?: string[];
  netWeightGrams?: number;
  bandwidth?: string[];
  finishing?: Array<{ code: string; type: string }>;
  totalDiamondWeight?: number;
  deliveryDays?: number;
}

interface SubStyle {
  img: string;
  name: string;
  price: string;
  parentSku?: string;
  variants?: ApiVariant[];
  productDetails?: ProductModelResponse;
  availableColors?: string[];
  thumbnailImages?: string[];
}

// Hardcoded category mappings
const categoryMappings: { [key: string]: string } = {
  "CHANNEL SET": "CHANNEL SET",
  "DOUBLE ROW": "DOUBLE ROW",
  LUXURY: "LUXURY",
  SPORT: "SPORT",
};

// Initial hardcoded structure that will be populated with API data
const getInitialStyleAndDesign = () => [
  { name: "CHANNEL SET", substyles: [] as SubStyle[], isLoaded: false },
  { name: "DOUBLE ROW", substyles: [] as SubStyle[], isLoaded: false },
  { name: "LUXURY", substyles: [] as SubStyle[], isLoaded: false },
  { name: "SPORT", substyles: [] as SubStyle[], isLoaded: false },
];

const diamondShapes = {
  shapes: [
    { name: "Round", img: "/DIAMOND_SHAPES_WEBP/round.png" },
    { name: "Princess", img: "/DIAMOND_SHAPES_WEBP/princess.png" },
    { name: "Emerald", img: "/DIAMOND_SHAPES_WEBP/emerald.png" },
    { name: "Asscher", img: "/DIAMOND_SHAPES_WEBP/asscher.png" },
    { name: "Radiant", img: "/DIAMOND_SHAPES_WEBP/radient.jpg" },
    { name: "Cushion", img: "/DIAMOND_SHAPES_WEBP/cushion.png" },
    { name: "Oval", img: "/DIAMOND_SHAPES_WEBP/oval.png" },
    { name: "Pear", img: "/DIAMOND_SHAPES_WEBP/pear.png" },
    { name: "Marquise", img: "/DIAMOND_SHAPES_WEBP/marquise.png" },
    { name: "Heart", img: "/DIAMOND_SHAPES_WEBP/heart.png" },
  ],
};

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

const GLBViewer = ({
  modelUrl,
  className,
  isMain = false,
}: {
  modelUrl: string;
  className?: string;
  isMain?: boolean;
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const initThreeJS = () => {
      if (!mountRef.current) return;

      // Scene setup
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf5f5f5);
      sceneRef.current = scene;

      // Camera setup
      const camera = new THREE.PerspectiveCamera(
        75,
        mountRef.current.clientWidth / mountRef.current.clientHeight,
        0.1,
        1000,
      );
      camera.position.set(0, 0, 5);

      // Renderer setup
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setSize(
        mountRef.current.clientWidth,
        mountRef.current.clientHeight,
      );
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      mountRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(10, 10, 5);
      directionalLight.castShadow = true;
      scene.add(directionalLight);

      const pointLight = new THREE.PointLight(0xffffff, 0.3);
      pointLight.position.set(-10, -10, -5);
      scene.add(pointLight);

      let diamond: THREE.Mesh | null = null;

      function createPlaceholderModel() {
        const group = new THREE.Group();

        // Ring band
        const ringGeometry = new THREE.TorusGeometry(1.2, 0.15, 8, 32);
        const ringMaterial = new THREE.MeshStandardMaterial({
          color: 0xffd700,
          metalness: 0.9,
          roughness: 0.1,
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.castShadow = true;
        group.add(ring);

        // Center diamond (simplified)
        const diamondGeometry = new THREE.OctahedronGeometry(0.3);
        const diamondMaterial = new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.9,
          roughness: 0,
          metalness: 0,
          reflectivity: 1,
          clearcoat: 1,
          clearcoatRoughness: 0,
        });
        diamond = new THREE.Mesh(diamondGeometry, diamondMaterial);
        diamond.position.y = 0.2;
        diamond.castShadow = true;
        group.add(diamond);

        // Small accent diamonds
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const smallDiamondGeometry = new THREE.OctahedronGeometry(0.08);
          const smallDiamond = new THREE.Mesh(
            smallDiamondGeometry,
            diamondMaterial,
          );
          smallDiamond.position.set(
            Math.cos(angle) * 1.3,
            0.1,
            Math.sin(angle) * 1.3,
          );
          smallDiamond.scale.set(0.7, 0.7, 0.7);
          group.add(smallDiamond);
        }

        scene.add(group);
        modelRef.current = group;
      }

      // Load GLB Model
      if (modelUrl && modelUrl.endsWith(".glb")) {
        const loader = new GLTFLoader();

        // Setup DRACO loader for compressed models
        const dracoLoader = new DRACOLoader();
        // Use CDN for DRACO decoder files
        dracoLoader.setDecoderPath(
          "https://www.gstatic.com/draco/versioned/decoders/1.5.6/",
        );
        dracoLoader.preload();
        loader.setDRACOLoader(dracoLoader);

        loader.load(
          modelUrl,
          (gltf) => {
            const model = gltf.scene;

            // Clear any existing models
            if (modelRef.current) {
              scene.remove(modelRef.current);
            }

            // Auto-scale the model to fit the scene
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3()).length();
            const center = box.getCenter(new THREE.Vector3());

            // Scale the model to fit in the view
            const scale = isMain ? 2 / size : 1.6 / size;
            model.scale.setScalar(scale);

            // Center the model
            model.position.copy(center).multiplyScalar(-scale);

            scene.add(model);
            modelRef.current = model;

            // Dispose of the DRACO loader after use
            dracoLoader.dispose();
          },
          // (progress) => {},
          (error) => {
            console.error("Error loading GLB model:", modelUrl, error);

            dracoLoader.dispose();
            createPlaceholderModel();
          },
        );
      } else {
        createPlaceholderModel();
      }

      // Controls for main viewer (mouse interaction)
      let isDragging = false;
      let previousMousePosition = { x: 0, y: 0 };

      const handleMouseDown = (event: MouseEvent) => {
        if (!isMain) return;
        isDragging = true;
        previousMousePosition = { x: event.clientX, y: event.clientY };
        renderer.domElement.style.cursor = "grabbing";
      };

      const handleMouseMove = (event: MouseEvent) => {
        if (!isDragging || !isMain || !modelRef.current) return;

        const deltaMove = {
          x: event.clientX - previousMousePosition.x,
          y: event.clientY - previousMousePosition.y,
        };

        const deltaRotationQuaternion = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(deltaMove.y * 0.01, deltaMove.x * 0.01, 0, "XYZ"),
        );

        modelRef.current.quaternion.multiplyQuaternions(
          deltaRotationQuaternion,
          modelRef.current.quaternion,
        );
        previousMousePosition = { x: event.clientX, y: event.clientY };
      };

      const handleMouseUp = () => {
        isDragging = false;
        if (rendererRef.current) {
          rendererRef.current.domElement.style.cursor = isMain
            ? "grab"
            : "pointer";
        }
      };

      const handleWheel = (event: WheelEvent) => {
        if (!isMain) return;
        event.preventDefault();
        camera.position.z += event.deltaY * 0.01;
        camera.position.z = Math.max(2, Math.min(10, camera.position.z));
      };

      if (isMain) {
        renderer.domElement.style.cursor = "grab";
        renderer.domElement.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        renderer.domElement.addEventListener("wheel", handleWheel);
      }

      // Animation loop
      const animate = () => {
        animationIdRef.current = requestAnimationFrame(animate);

        // Auto-rotate for thumbnail
        if (!isMain && modelRef.current) {
          modelRef.current.rotation.y += 0.01;
        }

        // Sparkle effect for diamond
        if (diamond) {
          diamond.rotation.y += 0.02;
        }

        renderer.render(scene, camera);
      };
      animate();

      // Handle resize
      const handleResize = () => {
        if (!mountRef.current || !camera || !renderer) return;
        camera.aspect =
          mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(
          mountRef.current.clientWidth,
          mountRef.current.clientHeight,
        );
      };

      window.addEventListener("resize", handleResize);

      // Store cleanup functions
      const cleanup = () => {
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
        }
        if (isMain) {
          renderer.domElement.removeEventListener("mousedown", handleMouseDown);
          window.removeEventListener("mousemove", handleMouseMove);
          window.removeEventListener("mouseup", handleMouseUp);
          renderer.domElement.removeEventListener("wheel", handleWheel);
        }
        window.removeEventListener("resize", handleResize);
        if (
          mountRef.current &&
          renderer.domElement &&
          mountRef.current.contains(renderer.domElement)
        ) {
          mountRef.current.removeChild(renderer.domElement);
        }
        renderer.dispose();
      };

      return cleanup;
    };

    const cleanup = initThreeJS();

    // Cleanup on unmount
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [modelUrl, isMain]);

  return <div ref={mountRef} className={className} />;
};

// Sample product data for metal types (moved outside component to avoid dependency issues)
const sampleProductData = {
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

const ProductDetail = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showEngraveModal, setShowEngraveModal] = useState(false);
  // Engraving state: only one engraving allowed for rings
  const [hasEngraving, setHasEngraving] = useState(false);
  const [engravingText, setEngravingText] = useState("");
  const [engravingImageUrl, setEngravingImageUrl] = useState("");
  const [engravingMotifPath, setEngravingMotifPath] = useState("");

  const [totalDiamondWeight, setTotalDiamondWeight] = useState(0);
  const [deliveryDays, setDeliveryDays] = useState<number | 25>(25);

  /* State for share modal */
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const formattedDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + deliveryDays);
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, [deliveryDays]);

  const handleShare = async (platform: "whatsapp" | "email" | "copy") => {
    const currentUrl = window.location.href;
    const productName = "this beautiful band";

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
        `I found this beautiful piece at Kyna Jewels and thought of you! 💎\n\nCheck out ${productName} here. Kyna Jewels is the best online jewellery business for premium designs!`,
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

  // Add states for diamond size and gold karat
  const [selectedDiamondSize, setSelectedDiamondSize] = useState<string>("");
  const [savedEngravingData, setSavedEngravingData] = useState<{
    text: string;
    motif: string;
    imageUrl: string;
  } | null>(null);
  const [isUploadingEngraving, setIsUploadingEngraving] = useState(false);
  const [selectedGoldKarat, setSelectedGoldKarat] = useState<string>("");

  const [isPdfPopupOpen, setIsPdfPopupOpen] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );
  const { loading: cartLoading } = useSelector(
    (state: RootState) => state.cart,
  );
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedDiamondOrigin, setSelectedDiamondOrigin] =
    useState("Natural Diamond");
  const [selectedDiamondShape, setSelectedDiamondShape] = useState("Oval");
  const [selectedMetalColor, setSelectedMetalColor] = useState("Yellow Gold");
  const [selectedColorCode, setSelectedColorCode] = useState("YG"); // Store the color code
  const [selectedMetalType, setSelectedMetalType] = useState<string>("GOLD");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColorClarity, setSelectedColorClarity] = useState<string>("");
  const [selectedBandwidth, setSelectedBandwidth] = useState("");
  const [selectedFinishing, setSelectedFinishing] = useState("");

  // Track the last valid state for reverting when variant not found
  const lastValidStateRef = useRef({
    metalColor: "Yellow Gold",
    colorCode: "YG",
    diamondShape: "Oval",
    diamondSize: "",
    diamondOrigin: "Natural Diamond",
    colorClarity: "",
    goldKarat: "",
    metalType: "GOLD",
    bandwidth: "",
    finishing: "",
  });

  // API state
  const [styleAndDesign, setStyleAndDesign] = useState(
    getInitialStyleAndDesign(),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default to first category
  const [selectedStyleCategory, setSelectedStyleCategory] =
    useState("CHANNEL SET");
  const [selectedParentSku, setSelectedParentSku] = useState("");

  // Fetch data from API
  const fetchCategoryData = useCallback(async (categoryName: string) => {
    if (!categoryMappings[categoryName]) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/products/builder?stylingName=${encodeURIComponent(categoryName)}`,
      );
      const data: ApiResponse = await response.json();

      if (data.success && data.entries) {
        // Fetch detailed product data for each entry
        const validEntries = data.entries.filter(
          (e) => e.variants && e.variants.length > 0,
        );

        const mappedSubstyles = validEntries.map((entry) => ({
          img: entry.selectedImage.url,
          name: entry.builderView,
          price: "",
          parentSku: entry.parentSku,
          variants: entry.variants,
        }));

        setStyleAndDesign((prev) =>
          prev.map((category) =>
            category.name === categoryName
              ? { ...category, substyles: mappedSubstyles, isLoaded: true }
              : category,
          ),
        );

        // Set first style as selected if none selected
        if (!selectedParentSku && mappedSubstyles.length > 0) {
          setSelectedParentSku(mappedSubstyles[0].parentSku || "");
        }
      }
    } catch (err) {
      console.error("Failed to fetch category data:", err);
      setError(`Failed to load ${categoryName} data`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper to re-fetch product model for a specific substyle and metal color
  const updateSubstyleProductDetails = useCallback(
    async (parentSku: string, variantSku: string, metalColorCode: string) => {
      try {
        // Use the color code directly
        const metalCode = metalColorCode;
        const res = await fetch(
          `/api/products/model/${parentSku}?variantId=${variantSku}&metalColor=${metalCode}`,
        );
        const data: ProductModelResponse = await res.json();
        if (data && data.success) {
          setStyleAndDesign((prev) =>
            prev.map((cat) => ({
              ...cat,
              substyles: cat.substyles.map((s) =>
                s.parentSku === parentSku
                  ? {
                      ...s,
                      productDetails: data,
                      thumbnailImages: data.variantImages,
                      price: new Intl.NumberFormat("en-IN").format(
                        data.sellingPrice,
                      ),
                    }
                  : s,
              ),
            })),
          );
          if (data.totalDiamondWeight) {
            setTotalDiamondWeight(data.totalDiamondWeight);
          }
          if (data.deliveryDays) {
            setDeliveryDays(data.deliveryDays);
          }
        }
      } catch (err) {
        console.error("Failed to update substyle product details:", err);
      }
    },
    [],
  );

  // Get current category's substyles and selected style data
  const currentCategory = styleAndDesign.find(
    (cat) => cat.name === selectedStyleCategory,
  );
  const currentSubstyles = currentCategory?.substyles || [];
  const selectedStyleData =
    currentSubstyles.find((style) => style.parentSku === selectedParentSku) ||
    currentSubstyles[0];

      // Keep total diamond weight in sync with product data changes (variant updates)
  // Prioritize the API-provided totalDiamondWeight as it reflects the actual variant weight
  useEffect(() => {
    const currentProduct = styleAndDesign
      .find((cat) => cat.name === selectedStyleCategory)
      ?.substyles.find((s) => s.parentSku === selectedParentSku)
      ?.productDetails;

    if (currentProduct?.totalDiamondWeight && typeof currentProduct.totalDiamondWeight === "number") {
      setTotalDiamondWeight(currentProduct.totalDiamondWeight);
    } else if (selectedDiamondSize) {
      const parsed = parseFloat(String(selectedDiamondSize));
      if (!Number.isNaN(parsed)) {
        setTotalDiamondWeight(parsed);
      }
    }
  }, [styleAndDesign, selectedStyleCategory, selectedParentSku, selectedDiamondSize]);

  // Function to check if image is a 3D model
  const is3DModel = (imagePath: string, index: number) => {
    const isGLB = index === 1 && imagePath.endsWith(".glb");
    return isGLB || imagePath.endsWith(".glb");
  };

  // Use the thumbnail images from the selected style data
  const thumbnailImages = selectedStyleData?.thumbnailImages || [];
  
  // Check if images are still loading (no real thumbnail data yet)
  const isImagesLoading = loading || !selectedStyleData?.thumbnailImages || selectedStyleData.thumbnailImages.length === 0;
  
  // Skeleton placeholder count for loading state
  const skeletonCount = 4;

  // When selectedColorCode changes for the currently selected style, re-fetch its product details
  useEffect(() => {
    try {
      if (!selectedStyleData) return;
      const parent = selectedStyleData?.parentSku;
      const variantSku = selectedStyleData?.variants?.[0]?.sku;
      if (parent && variantSku && typeof updateSubstyleProductDetails === "function") {
        // Always use the first variant of the parent SKU with the user's selected color
        updateSubstyleProductDetails(parent, variantSku, selectedColorCode);
      }
    } catch (err) {
      console.error("Error in colorCode useEffect:", err);
    }
  }, [
    selectedColorCode,
    selectedStyleData?.parentSku,
    selectedStyleData?.variants,
    updateSubstyleProductDetails,
  ]);

  // Load data for current category
  useEffect(() => {
    try {
      if (!selectedStyleCategory || typeof fetchCategoryData !== "function") return;
      const currentCategory = styleAndDesign.find(
        (cat) => cat.name === selectedStyleCategory,
      );
      if (currentCategory && !currentCategory.isLoaded) {
        fetchCategoryData(selectedStyleCategory);
      }
    } catch (err) {
      console.error("Error in category load useEffect:", err);
    }
  }, [selectedStyleCategory, fetchCategoryData, styleAndDesign]);

  // Add fallback for categories without API endpoints
  // const getFallbackSubstyles = (categoryName: string): SubStyle[] => {
  //   if (categoryName === "PAPPER CLIP") {
  //     return [
  //       {
  //         img: "/build_yr_own/BR1-RD-025-WG-TRV.png",
  //         name: "BR1-RD-025-WG-TRV",
  //         price: "5,224",
  //       },
  //     ];
  //   }
  //   if (categoryName === "MULTI SHAPE") {
  //     return [
  //       {
  //         img: "/build_yr_own/BR8-MIX-025-WG-TRV.png",
  //         name: "BR8-MIX-025-WG-TRV",
  //         price: "5,224",
  //       },
  //       {
  //         img: "/build_yr_own/BR15-EMMQ-025-WG-TRV.png",
  //         name: "BR15-EMMQ-025-WG-TRV",
  //         price: "5,224",
  //       },
  //     ];
  //   }
  //   return [];
  // };

  // Separate refs for different scroll containers
  const thumbnailsDesktopRef = useRef<HTMLDivElement>(null);
  const thumbnailsMobileRef = useRef<HTMLDivElement>(null);
  const styleCategoryRef = useRef<HTMLDivElement>(null);
  const ringStylesRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement | null>(null);
  const mainViewerRef = useRef<HTMLDivElement | null>(null);

   // Track previous parent SKU to detect changes and reset colors
  const previousParentSkuRef = useRef<string>("");

  // Reset color to YG when parent SKU actually changes
  useEffect(() => {
    if (selectedParentSku && selectedParentSku !== previousParentSkuRef.current) {
      console.log("Parent SKU changed from", previousParentSkuRef.current, "to", selectedParentSku, "- resetting color to YG");
      previousParentSkuRef.current = selectedParentSku;
      setSelectedMetalColor("Yellow Gold");
      setSelectedColorCode("YG");
      setSelectedMetalType("GOLD");
    }
  }, [selectedParentSku]);


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

  // Thumbnail scroll handlers
  const scrollThumbnailsUp = () => {
    if (thumbnailsDesktopRef.current) {
      thumbnailsDesktopRef.current.scrollBy({ top: -72, behavior: "smooth" });
    }
  };

  const scrollThumbnailsDown = () => {
    if (thumbnailsDesktopRef.current) {
      thumbnailsDesktopRef.current.scrollBy({ top: 72, behavior: "smooth" });
    }
  };

  const scrollThumbnailsLeft = () => {
    if (thumbnailsMobileRef.current) {
      thumbnailsMobileRef.current.scrollBy({ left: -72, behavior: "smooth" });
    }
  };

  const scrollThumbnailsRight = () => {
    if (thumbnailsMobileRef.current) {
      thumbnailsMobileRef.current.scrollBy({ left: 72, behavior: "smooth" });
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

  // currentCategory, currentSubstyles and selectedStyleData are already declared above to avoid redeclaration.

  // Derive a productId to feed into the ProductReviews component
  const derivedProductId =
    selectedStyleData?.productDetails?.modelSku ||
    selectedStyleData?.parentSku ||
    selectedStyleData?.variants?.[0]?.sku ||
    selectedStyleData?.productDetails?._id ||
    undefined;

  // Detect lab-grown variants
  const _braceletVariantIdentifier =
    (selectedStyleData as any)?.variants?.[0]?.sku ||
    selectedStyleData?.parentSku ||
    (derivedProductId as string) ||
    "";
  const isLabGrownVariant = /(^|-)LG/i.test(_braceletVariantIdentifier);

  useEffect(() => {
    if (isLabGrownVariant) {
      setSelectedDiamondOrigin("Lab Grown Diamond");
    }
  }, [isLabGrownVariant]);

  // ---------- iJewel Preload (Silent) ----------
  useEffect(() => {
    if (!thumbnailImages || thumbnailImages.length === 0) return;
    // Don't re-preload if already loaded for a GLB.
    // In builder, we might want to re-preload if style changes, but for now let's follow ProductDetail logic
    if ((window as any).__ijewelPreloadLoaded) return;

    const glb =
      thumbnailImages.find(
        (u: any) => typeof u === "string" && u.endsWith(".glb"),
      ) || "";
    if (!glb) return;

    const preloadContainerId = "ijewel-preload";
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

    const scriptId = "ijewel-sdk-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src =
        "https://releases.ijewel3d.com/libs/mini-viewer/0.3.20/bundle.iife.js";
      script.async = true;
      document.body.appendChild(script);
    }

    const initViewer = () => {
      try {
        const container = document.getElementById(preloadContainerId);
        if (!container || !(window as any).ijewelViewer) return;
        const project = {
          modelUrl: glb,
          basePath: "",
        };
        const viewerOptions = {
          showCard: false,
          showUiButtons: false,
          showLogo: true, // Show logo eventually
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

    if ((window as any).ijewelViewer) {
      initViewer();
    } else {
      script.onload = initViewer;
    }
  }, [thumbnailImages]);

  // Attach preloaded viewer canvas to main viewer container when selected image is 3D
  useEffect(() => {
    const currentImage = thumbnailImages[selectedImage] || "";
    if (!mainViewerRef?.current) return;
    const main = mainViewerRef.current;

    if (is3DModel(currentImage, selectedImage)) {
      const pre = (window as any).__ijewelPreloadViewer;
      if (pre && pre.canvas) {
        try {
          main.innerHTML = "";
          main.appendChild(pre.canvas);
          return;
        } catch (err) {
          console.warn("Error moving preloaded canvas:", err);
        }
      }

      // Fallback
      if ((window as any).ijewelViewer) {
        try {
          main.innerHTML = "";
          new (window as any).ijewelViewer.Viewer(
            main,
            { modelUrl: currentImage },
            {
              showCard: false,
              showUiButtons: false,
              showLogo: true,
              showConfigurator: false,
            },
          );
        } catch (err) {
          console.warn("Failed to init ijewel viewer fallback:", err);
        }
      }
    } else {
      // Move back to preload container
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

  // Get available metal color codes from API
  const availableColorCodes = selectedStyleData?.productDetails
    ?.availableColors ||
    selectedStyleData?.availableColors || ["WG", "YG", "RG"]; // Fallback to basic colors if not provided

  // Add state for showing more colors on mobile
  const [showAllColors, setShowAllColors] = useState(false);

  const generateVariantId = (substyle: SubStyle) => {
    const modelSku = substyle.parentSku;
    const variants = substyle.variants;

    // Use first variant if no variant selected
    const base = variants?.[0]?.sku.split("-");
    if (!base) return null;

    // For bands, only goldKarat is strictly required
    // Diamond shape and size are optional (3-part format: modelSku-karat-specs)
    if (!selectedGoldKarat) {
      console.warn("Missing required karat for variant ID generation");
      return null;
    }

    const shapeCodeMap: any = {
      ROUND: "RD",
      OVAL: "OV",
      PRINCESS: "PRN",
      EMERALD: "EM",
      MARQUISE: "MQ",
      PEAR: "PRS",
      HEART: "HRT",
      CUSHION: "CUS",
    };

    // Only use shape if it's selected
    const shapeCode = selectedDiamondShape
      ? shapeCodeMap[selectedDiamondShape.toUpperCase()] || "RD"
      : null;

    // Only calculate carat code if diamond size is selected
    let caratCode = null;
    if (selectedDiamondSize) {
      const parsedSize = parseFloat(selectedDiamondSize);
      if (isNaN(parsedSize)) {
        console.warn("Invalid diamond size:", selectedDiamondSize);
        return null;
      }
      caratCode = String(Math.round(parsedSize * 100));
    }

    const karat = selectedGoldKarat.replace(/kt/i, "");
    if (!karat) {
      console.warn("Invalid gold karat:", selectedGoldKarat);
      return null;
    }

    const originCode =
      selectedDiamondOrigin === "Lab Grown Diamond" ? "LG" : "ND";

    let clarityToken =
      selectedColorClarity ||
      substyle?.productDetails?.diamondColorClarity?.[0] ||
      "EFVVS";
    
    // Remove spaces from clarity token (e.g. "EF VVS" -> "EFVVS") for SKU matching
    clarityToken = clarityToken.replace(/\s+/g, "");

    const specifications = `${originCode}${clarityToken}`;

    // Build variant ID based on what's selected
    let variantId: string;
    
    if (shapeCode && caratCode) {
      // 5-part format with shape and size
      variantId = `${modelSku}-${shapeCode}-${caratCode}-${karat}-${specifications}`;
    } else {
      // 3-part format without shape and size (common for men's bands)
      variantId = `${modelSku}-${karat}-${specifications}`;
    }

    // Add bandwidth: prefer selected, otherwise fallback to first available option
    const bandwidthOptions = substyle.productDetails?.bandwidth || [];
    let bandwidthToUse = "";
    
    if (selectedBandwidth && bandwidthOptions.includes(selectedBandwidth)) {
      bandwidthToUse = selectedBandwidth;
    } else if (bandwidthOptions.length > 0) {
      // Sort to ensure we pick the "smallest" or first consistent option
      const sortedBw = [...bandwidthOptions].sort((a,b) => parseFloat(a) - parseFloat(b));
      bandwidthToUse = sortedBw[0];
    }

    if (bandwidthToUse) {
      variantId += `-${bandwidthToUse}`;
    }

    // Add finishing: prefer selected, otherwise fallback to first available option
    const finishingOptions = substyle.productDetails?.finishing || [];
    // finishingOptions can be string[] or {code, type}[]
    const finishingCodes = finishingOptions.map(f => typeof f === 'string' ? f : f.code);
    let finishingToUse = "";

    if (selectedFinishing && finishingCodes.includes(selectedFinishing)) {
      finishingToUse = selectedFinishing;
    } else if (finishingCodes.length > 0) {
      finishingToUse = finishingCodes[0];
    }
    
    if (finishingToUse) {
      variantId += `-${finishingToUse}`;
    }

    return variantId;
  };

  const refetchUpdatedProduct = async (substyle: SubStyle) => {
    const variantId = generateVariantId(substyle);
    if (!variantId) return;

    // Use selectedColorCode directly
    const metalColor = selectedColorCode;

    try {
      const res = await fetch(
        `/api/products/model/${substyle.parentSku}?variantId=${variantId}&metalColor=${metalColor}`,
      );

      const data: ProductModelResponse = await res.json();

      // Check if the response indicates variant not found
      if (!res.ok || !data.success) {
        console.warn(
          "Variant not found, reverting to last valid state:",
          lastValidStateRef.current,
        );
        toast.error(
          "This combination is not available. Reverted to previous selection.",
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
        setSelectedBandwidth(lastValidStateRef.current.bandwidth);
        setSelectedFinishing(lastValidStateRef.current.finishing);
        return;
      }

      if (data.success) {
        setStyleAndDesign((prev) =>
          prev.map((cat) => ({
            ...cat,
            substyles: cat.substyles.map((s) =>
              s.parentSku === substyle.parentSku
                ? {
                    ...s,
                    productDetails: data,
                    price: new Intl.NumberFormat("en-IN").format(
                      data.sellingPrice,
                    ),
                    thumbnailImages: data.variantImages,
                  }
                : s,
            ),
          })),
        );

        // Update total diamond weight from the new product data
        if (data.totalDiamondWeight && typeof data.totalDiamondWeight === 'number') {
          setTotalDiamondWeight(data.totalDiamondWeight);
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
          bandwidth: selectedBandwidth,
          finishing: selectedFinishing,
        };
      }
    } catch (error) {
      console.error("Error refetching product data:", error);
      toast.error(
        "Failed to load variant. Reverted to previous selection.",
      );
      setSelectedMetalColor(lastValidStateRef.current.metalColor);
      setSelectedColorCode(lastValidStateRef.current.colorCode);
      setSelectedDiamondShape(lastValidStateRef.current.diamondShape);
      setSelectedDiamondSize(lastValidStateRef.current.diamondSize);
      setSelectedDiamondOrigin(lastValidStateRef.current.diamondOrigin);
      setSelectedColorClarity(lastValidStateRef.current.colorClarity);
      setSelectedGoldKarat(lastValidStateRef.current.goldKarat);
      setSelectedMetalType(lastValidStateRef.current.metalType);
      setSelectedBandwidth(lastValidStateRef.current.bandwidth);
      setSelectedFinishing(lastValidStateRef.current.finishing);
    }
  };

  // Log when thumbnail images change
  useEffect(() => {
    // Removed console log for thumbnail changes
  }, [selectedParentSku, selectedStyleData?.thumbnailImages]);

  // Get available options from selected style's product details
  const getAvailableMetalTypes = useCallback(() => {
    if (!selectedStyleData?.productDetails?.metalTypes) {
      return sampleProductData.metalTypes; // Fallback to hardcoded data
    }
    return selectedStyleData.productDetails.metalTypes;
  }, [selectedStyleData?.productDetails?.metalTypes]);

  const getAvailableGoldKarats = useCallback(() => {
    if (!selectedStyleData?.productDetails?.goldKarats) {
      return ["18kt", "14kt", "9kt"]; // Fallback - descending order
    }
    // Sort gold karats in descending order (18kt, 14kt, 9kt)
    return [...selectedStyleData.productDetails.goldKarats].sort((a, b) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      return numB - numA;
    });
  }, [selectedStyleData?.productDetails?.goldKarats]);

  const getAvailableDiamondShapes = useCallback(() => {
    if (!selectedStyleData?.productDetails?.diamondShape) {
      return []; // Return empty array if no diamond shape data
    }
    // Return empty array if diamondShape is empty array
    if (selectedStyleData.productDetails.diamondShape.length === 0) {
      return [];
    }
    // Map API diamond shapes to our shape objects
    return selectedStyleData.productDetails.diamondShape.map((shape) => {
      const shapeData = diamondShapes.shapes.find(
        (s) => s.name.toUpperCase() === shape.toUpperCase(),
      );
      return (
        shapeData || { name: shape, img: "/DIAMOND_SHAPES_WEBP/round.webp" }
      );
    });
  }, [selectedStyleData?.productDetails?.diamondShape]);

  const getAvailableDiamondSizes = useCallback(() => {
    if (!selectedStyleData?.productDetails?.diamondSize) {
      return []; // Return empty array if no diamond size data
    }

    const diamondSize = selectedStyleData.productDetails.diamondSize;

    // If diamondSize is an object with metal type keys
    if (typeof diamondSize === "object" && !Array.isArray(diamondSize)) {
      // Check if object is empty
      if (Object.keys(diamondSize).length === 0) {
        return [];
      }
      const metalTypeKey = selectedMetalType || "GOLD";
      const sizes = diamondSize[metalTypeKey as keyof typeof diamondSize] || [];
      // Sort diamond sizes in ascending order (small to big)
      return [...sizes].sort((a, b) => parseFloat(a) - parseFloat(b));
    }

    // If diamondSize is an array
    if (Array.isArray(diamondSize)) {
      // Return empty array if array is empty
      if (diamondSize.length === 0) {
        return [];
      }
      return [...diamondSize].sort((a, b) => parseFloat(a) - parseFloat(b));
    }

    return []; // Return empty array as fallback
  }, [selectedStyleData?.productDetails?.diamondSize, selectedMetalType]);

  // Get available bandwidth options
  // Get available bandwidth options
  const getAvailableBandwidth = useCallback(() => {
    if (!selectedStyleData?.productDetails?.bandwidth) {
      return [];
    }
    // Sort numerical bandwidths in ascending order
    return [...selectedStyleData.productDetails.bandwidth].sort(
      (a, b) => parseFloat(a) - parseFloat(b)
    );
  }, [selectedStyleData?.productDetails?.bandwidth]);

  // Get available finishing options
  const getAvailableFinishing = useCallback(() => {
    if (!selectedStyleData?.productDetails?.finishing) {
      return [];
    }
    return selectedStyleData.productDetails.finishing;
  }, [selectedStyleData?.productDetails?.finishing]);

  // Engraving upload helpers (mirror ProductDetail behavior)
  const uploadEngravingToBackend = useCallback(
    async (
      text: string,
      motifPath: string,
      imageUrl?: string,
    ): Promise<string | null> => {
      try {
        const formData = new FormData();

        if (imageUrl) {
          try {
            const res = await fetch(imageUrl);
            const blob = await res.blob();
            formData.append("image", blob, "engraving.png");
          } catch (err) {
            console.warn(
              "Failed to fetch engraving image URL, skipping appending image:",
              err,
            );
          }
        }

        formData.append("text", text);
        formData.append("motifPath", motifPath);

        const uploadResponse = await fetch("/api/upload/engravingOnly", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error(`Upload failed: ${uploadResponse.status}`);
        }

        const result = await uploadResponse.json();
        return result.data?.imageUrl || null;
      } catch (error) {
        console.error("Error uploading engraving to backend:", error);
        return null;
      }
    },
    [],
  );

  const generateAndUploadEngravingImage = useCallback(async (): Promise<
    string | null
  > => {
    if (!hasEngraving || !savedEngravingData) return null;
    setIsUploadingEngraving(true);
    try {
      const uploadedUrl = await uploadEngravingToBackend(
        savedEngravingData.text,
        savedEngravingData.motif,
        savedEngravingData.imageUrl,
      );
      return uploadedUrl;
    } catch (err) {
      console.error("Error generating/uploading engraving image:", err);
      return null;
    } finally {
      setIsUploadingEngraving(false);
    }
  }, [hasEngraving, savedEngravingData, uploadEngravingToBackend]);

  const handleAddToCart = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to add items to cart");
      navigate("/login");
      return;
    }

    if (!selectedSize) {
      toast.error("Please select a ring size");
      return;
    }

    const productDetails = selectedStyleData?.productDetails;
    const productId =
      productDetails?._id || selectedStyleData?.parentSku || derivedProductId;
    const variantSku =
      productDetails?.chosenVariantSku ||
      selectedStyleData?.variants?.[0]?.sku ||
      derivedProductId;

    if (!productId || !variantSku) {
      toast.error("Please select a product variant");
      return;
    }

    // Upload engraving if present
    let cloudinaryEngravingUrl: string | null = null;
    if (hasEngraving && savedEngravingData) {
      cloudinaryEngravingUrl = await generateAndUploadEngravingImage();
      if (!cloudinaryEngravingUrl) {
        toast.error("Failed to upload engraving image. Please try again.");
        return;
      }
    }

    const variantData = {
      variantSku,
      variantConfig: {
        metalColor: selectedMetalColor,
        metalColorCode: selectedColorCode,
        metalType: selectedMetalType,
        goldKarat: selectedGoldKarat,
        diamondShape: selectedDiamondShape,
        diamondSize: selectedDiamondSize,
        diamondOrigin: selectedDiamondOrigin,
        ringSize: selectedSize,
        bandwidth: selectedBandwidth,
        finishing: selectedFinishing,
        engraving: engravingText,
        engravingImageUrl:
          cloudinaryEngravingUrl ||
          engravingImageUrl ||
          savedEngravingData?.imageUrl ||
          "",
        engravingMotifPath:
          engravingMotifPath || savedEngravingData?.motif || "",
        variantImages:
          productDetails?.variantImages ||
          selectedStyleData?.thumbnailImages ||
          [],
        sellingPrice: productDetails?.sellingPrice || 0,
        priceBreakdown: productDetails?.priceBreakdown || null,
      },
    };

    try {
      await dispatch(addToCart(productId as string, 1, variantData));
      toast.success("Product added to cart successfully!");
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error("Failed to add product to cart");
    }
  }, [
    isAuthenticated,
    navigate,
    selectedSize,
    selectedStyleData,
    derivedProductId,
    hasEngraving,
    savedEngravingData,
    generateAndUploadEngravingImage,
    selectedMetalColor,
    selectedColorCode,
    selectedMetalType,
    selectedGoldKarat,
    selectedDiamondShape,
    selectedDiamondSize,
    selectedDiamondOrigin,
    selectedBandwidth,
    selectedFinishing,
    engravingText,
    engravingImageUrl,
    engravingMotifPath,
    dispatch,
  ]);

  const handleBuyNow = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to purchase");
      navigate("/login");
      return;
    }

    if (!selectedSize) {
      toast.error("Please select a ring size");
      return;
    }

    const productDetails = selectedStyleData?.productDetails;
    const productId =
      productDetails?._id || selectedStyleData?.parentSku || derivedProductId;
    const variantSku =
      productDetails?.chosenVariantSku ||
      selectedStyleData?.variants?.[0]?.sku ||
      derivedProductId;

    if (!productId || !variantSku) {
      toast.error("Please select a product variant");
      return;
    }

    let cloudinaryEngravingUrl: string | null = null;
    if (hasEngraving && savedEngravingData) {
      setIsUploadingEngraving(true);
      cloudinaryEngravingUrl = await generateAndUploadEngravingImage();
      setIsUploadingEngraving(false);
      if (!cloudinaryEngravingUrl) {
        toast.error("Failed to upload engraving image. Please try again.");
        return;
      }
    }

    const productTitle = productDetails?.title || selectedStyleData?.name || "";
    const price = productDetails?.sellingPrice || 0;

    const orderData = {
      orderId: `ORD_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 15)}`, // Match CheckoutPage format
      customer: {
        userId: user?.id,
        name: `${user?.firstName || ""} ${user?.lastName || ""}`,
        email: user?.email,
        phone: user?.phone,
      },
      product: {
        modelSku: selectedStyleData?.parentSku,
        variantSku,
        title: productTitle,
        price,
        images:
          productDetails?.variantImages ||
          selectedStyleData?.thumbnailImages ||
          [],
      },
      customization: {
        metalColor: selectedMetalColor,
        metalColorCode: selectedColorCode,
        metalType: selectedMetalType,
        goldKarat: selectedGoldKarat,
        diamondShape: selectedDiamondShape,
        diamondSize: selectedDiamondSize,
        diamondOrigin: selectedDiamondOrigin,
        ringSize: selectedSize,
        bandwidth: selectedBandwidth,
        finishing: selectedFinishing,
        engraving: engravingText,
        engravingImageUrl:
          cloudinaryEngravingUrl ||
          engravingImageUrl ||
          savedEngravingData?.imageUrl ||
          "",
        engravingMotifPath:
          engravingMotifPath || savedEngravingData?.motif || "",
        hasEngraving: hasEngraving,
      },
      quantity: 1,
      totalAmount: price,
      orderDate: new Date().toISOString(),
      status: "pending",
    };

    navigate("/payment", {
      state: {
        orderData,
        directPurchase: true,
        items: [
          {
            product: {
              _id: selectedStyleData?.parentSku,
              title: productTitle,
              price,
              priceBreakdown: productDetails?.priceBreakdown,
              images: {
                main: productDetails?.variantImages?.[0] || "",
                sub: productDetails?.variantImages?.slice(1) || [],
              },
              sku: variantSku,
            },
            quantity: 1,
            price,
            customization: {
              metalColor: selectedMetalColor,
              metalType: selectedMetalType,
              goldKarat: selectedGoldKarat,
              diamondShape: selectedDiamondShape,
              diamondSize: selectedDiamondSize,
              diamondOrigin: selectedDiamondOrigin,
              ringSize: selectedSize,
              bandwidth: selectedBandwidth,
              finishing: selectedFinishing,
              engraving: engravingText,
              engravingImageUrl:
                cloudinaryEngravingUrl ||
                engravingImageUrl ||
                savedEngravingData?.imageUrl ||
                "",
              engravingMotifPath:
                engravingMotifPath || savedEngravingData?.motif || "",
              hasEngraving: hasEngraving,
            },
          },
        ],
        totalAmount: price,
      },
    });
  }, [
    isAuthenticated,
    navigate,
    selectedSize,
    selectedStyleData,
    derivedProductId,
    hasEngraving,
    savedEngravingData,
    generateAndUploadEngravingImage,
    selectedMetalColor,
    selectedColorCode,
    selectedMetalType,
    selectedGoldKarat,
    selectedDiamondShape,
    selectedDiamondSize,
    selectedDiamondOrigin,
    selectedBandwidth,
    selectedFinishing,
    engravingText,
    engravingImageUrl,
    engravingMotifPath,
    user,
  ]);

  // Ref for metal types scroll container
  const metalTypesRef = useRef<HTMLDivElement>(null);

  // Function to get available karats based on selected metal type
  const getAvailableKarats = useCallback(() => {
    if (!selectedStyleData?.productDetails?.goldKarats) {
      return ["18kt", "14kt", "9kt"]; // Fallback for gold
    }

    const goldKarats = selectedStyleData.productDetails.goldKarats;

    if (selectedMetalType === "SILVER") {
      return ["SLV"]; // Silver is always 925
    } else if (selectedMetalType === "PLATINUM") {
      return ["PT"]; // Platinum is 950
    } else {
      // For GOLD, filter out silver/platinum karats and sort in descending order (18kt, 14kt, 9kt)
      return goldKarats
        .filter((karat) => !["925", "950"].includes(karat))
        .sort((a, b) => {
          const numA = parseInt(a);
          const numB = parseInt(b);
          return numB - numA;
        });
    }
  }, [selectedStyleData?.productDetails?.goldKarats, selectedMetalType]);

  const getAvailableColorClarity = useCallback(() => {
    const details = selectedStyleData?.productDetails;
    if (!details) return [];

    // If we have the new diamondOptions structure
    if (details.diamondOptions) {
      const originKey =
        selectedDiamondOrigin === "Lab Grown Diamond" ? "LAB" : "NATURAL";
      
      // Map metal type to key - SILVER uses its own key if available
      let metalKey: "GOLD" | "PLATINUM" | "SILVER" = "GOLD";
      if (selectedMetalType === "PLATINUM") {
        metalKey = "PLATINUM";
      } else if (selectedMetalType === "SILVER") {
        metalKey = "SILVER";
      }

      // Try to get options for the selected combination
      let options = details.diamondOptions[originKey] && metalKey in details.diamondOptions[originKey]
        ? (details.diamondOptions[originKey as keyof typeof details.diamondOptions] as Record<string, string[]>)[metalKey]
        : undefined;
      
      // Fallback logic if specific combination doesn't exist
      if (!options || options.length === 0) {
        // If NATURAL + SILVER doesn't exist, try NATURAL + GOLD
        if (originKey === "NATURAL" && metalKey === "SILVER") {
          options = details.diamondOptions["NATURAL"]?.["GOLD"];
        }
        // If still no options, try LAB with same metal type
        if (!options || options.length === 0) {
          options = metalKey in details.diamondOptions["LAB"]
            ? details.diamondOptions["LAB"][metalKey as keyof typeof details.diamondOptions["LAB"]]
            : undefined;
        }
        // Last resort: try LAB + GOLD
        if (!options || options.length === 0) {
          options = details.diamondOptions["LAB"]?.["GOLD"];
        }
      }

      if (options && options.length > 0) {
        return options;
      }
    }

    // Fallback to old structure if diamondOptions not available
    return details.diamondColorClarity || [];
  }, [
    selectedStyleData?.productDetails,
    selectedDiamondOrigin,
    selectedMetalType,
  ]);

  // Update selected options when style changes
  useEffect(() => {
    if (selectedStyleData?.productDetails) {
      const metalTypes = getAvailableMetalTypes();

      const diamondShapes = getAvailableDiamondShapes();
      const diamondSizes = getAvailableDiamondSizes();
      const availableKarats = getAvailableKarats();
      const availableBandwidth = getAvailableBandwidth();
      const availableFinishing = getAvailableFinishing();

      // Set default selections from API data
      if (metalTypes.length > 0 && !metalTypes.includes(selectedMetalType)) {
        setSelectedMetalType("GOLD"); // Always default to GOLD
      }
      // Only set default shape if shapes are available
      if (diamondShapes.length > 0) {
        if (!diamondShapes.find((shape) => shape.name === selectedDiamondShape)) {
          setSelectedDiamondShape(diamondShapes[0].name);
        }
      } else {
        // Clear shape if no shapes available
        setSelectedDiamondShape("");
      }
      
      // Only set default size if sizes are available
      if (diamondSizes.length > 0) {
        if (selectedDiamondSize === "" || !diamondSizes.includes(selectedDiamondSize)) {
          setSelectedDiamondSize(diamondSizes[0]);
        }
      } else {
        // Clear size if no sizes available
        setSelectedDiamondSize("");
      }
      // Initialize clarity from product details
      const availableColorClarity = getAvailableColorClarity();
      if (
        availableColorClarity.length > 0 &&
        (selectedColorClarity === "" ||
          !availableColorClarity.includes(selectedColorClarity))
      ) {
        setSelectedColorClarity(availableColorClarity[0]);
      }
      if (
        availableKarats.length > 0 &&
        (selectedGoldKarat === "" ||
          !availableKarats.includes(selectedGoldKarat))
      ) {
        setSelectedGoldKarat(availableKarats[0]);
      }

      // Parse first variant SKU to extract bandwidth and finishing
      const firstVariantSku = selectedStyleData?.variants?.[0]?.sku;
      if (firstVariantSku) {
        const parts = firstVariantSku.split("-");
        
        let extractedBandwidth = "";
        let extractedFinishing = "";

        // Robust parsing: check tokens against available options
        // Skip the first 3 parts: Model SKU, Karat/Type, Specs
        // Example: GR40-14-LGEFVS-10 (parts[3] = "10")
        // Example: GR49-14-LGEFVS-4-BF (parts[3] = "4", parts[4] = "BF")
        
        if (parts.length > 3) {
            const potentialOptions = parts.slice(3);
            
            // Try to find bandwidth
            if (availableBandwidth.length > 0) {
                 const foundBw = potentialOptions.find(p => availableBandwidth.includes(p));
                 if (foundBw) {
                     extractedBandwidth = foundBw;
                 }
            }

            // Try to find finishing
            if (availableFinishing.length > 0) {
                const finishingCodes = availableFinishing.map(f => typeof f === 'string' ? f : f.code);
                const foundFin = potentialOptions.find(p => finishingCodes.includes(p));
                if (foundFin) {
                    extractedFinishing = foundFin;
                }
            }
        }

        // Set bandwidth if available and not already set
        if (extractedBandwidth) {
             if (availableBandwidth.length > 0) {
                 // Validate it exists in available options
                 if (availableBandwidth.includes(extractedBandwidth)) {
                    // Only update if not currently set or if we need to force sync with SKU
                     if (!selectedBandwidth) {
                        setSelectedBandwidth(extractedBandwidth);
                     }
                 }
             }
        } else {
             // Fallback: if no bandwidth extracted but options exist, select first
             if (availableBandwidth.length > 0 && !selectedBandwidth) {
                setSelectedBandwidth(availableBandwidth[0]);
             }
        }

        // Set finishing if available and not already set
        if (extractedFinishing) {
             if (availableFinishing.length > 0) {
                const finishingMatch = availableFinishing.find(
                  (f) => (typeof f === "string" ? f : f.code) === extractedFinishing
                );
                
                if (finishingMatch && !selectedFinishing) {
                   setSelectedFinishing(typeof finishingMatch === "string" ? finishingMatch : finishingMatch.code); 
                }
             }
        } else {
             // Fallback: if no finishing extracted but options exist, select first
             if (availableFinishing.length > 0 && !selectedFinishing) {
                const firstFinishing = availableFinishing[0];
                setSelectedFinishing(typeof firstFinishing === "string" ? firstFinishing : firstFinishing.code);
             }
        }
      }
    }
  }, [
    selectedStyleData,
    selectedMetalType,
    selectedDiamondShape,
    selectedDiamondSize,
    selectedGoldKarat,
    getAvailableMetalTypes,
    getAvailableGoldKarats,
    getAvailableDiamondShapes,
    getAvailableDiamondSizes,
    getAvailableKarats,
    getAvailableColorClarity,
    getAvailableBandwidth,
    getAvailableFinishing,
  ]);

  // Initialize lastValidStateRef with the first loaded state
  const initialStateSetRef = useRef(false);
  useEffect(() => {
    if (
      selectedStyleData?.productDetails &&
      !initialStateSetRef.current &&
      selectedMetalColor &&
      selectedColorCode &&
      selectedMetalType
    ) {
      lastValidStateRef.current = {
        metalColor: selectedMetalColor,
        colorCode: selectedColorCode,
        diamondShape: selectedDiamondShape,
        diamondSize: selectedDiamondSize,
        diamondOrigin: selectedDiamondOrigin,
        colorClarity: selectedColorClarity,
        goldKarat: selectedGoldKarat,
        metalType: selectedMetalType,
        bandwidth: selectedBandwidth,
        finishing: selectedFinishing,
      };
      initialStateSetRef.current = true;
    }
  }, [
    selectedStyleData?.productDetails,
    selectedMetalColor,
    selectedColorCode,
    selectedDiamondShape,
    selectedDiamondSize,
    selectedDiamondOrigin,
    selectedColorClarity,
    selectedGoldKarat,
    selectedMetalType,
    selectedBandwidth,
    selectedFinishing,
  ]);

  useEffect(() => {
    if (!selectedStyleData?.parentSku) return;
    
    // For bands, only karat is strictly required
    // Diamond shape and size are optional
    if (!selectedGoldKarat) {
      return;
    }
    
    console.log("Refetching product for parent SKU:", selectedStyleData.parentSku, "with color:", selectedColorCode);
    refetchUpdatedProduct(selectedStyleData);
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedDiamondOrigin,
    selectedDiamondShape,
    selectedDiamondSize,
    selectedMetalColor,
    selectedMetalType,
    selectedGoldKarat,
    selectedColorClarity,
    selectedBandwidth,
    selectedFinishing,
  ]);

  return (
    <div style={{ fontFamily: "Poppins" }} className="flex justify-center">
      <SEO
        title="Build Your Gents Rings - Custom Diamond Rings Builder"
        description="Design your perfect gents ring with our custom builder. Choose from premium settings and diamonds."
        canonical="/build-your-jewellery/Gents-Rings"
      />
      <main className="min-h-screen max-w-6xl bg-background">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
            <span>›</span>
            <div className="hover:text-foreground">Build Your Jewellery</div>
            <span>›</span>
            <span className="text-foreground">Gents Rings</span>
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
                    {isImagesLoading
                      ? // Show skeleton placeholders when loading
                        Array.from({ length: skeletonCount }).map((_, index) => (
                          <div
                            key={`skeleton-${index}`}
                            className="w-16 h-16 rounded-lg overflow-hidden border-2 border-neutral-200 flex-shrink-0 bg-gray-200 animate-pulse"
                          />
                        ))
                      : // Show actual images when loaded
                        thumbnailImages.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setSelectedImage(index);
                            }}
                            className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all hover:scale-105 relative ${
                              selectedImage === index
                                ? "border-[#328F94] ring-2 ring-[#328F94]/20"
                                : "border-neutral-200 hover:border-neutral-300"
                            }`}
                          >
                            {is3DModel(image, index) ? (
                              <div className="relative flex justify-center items-center w-full h-full bg-gradient-to-br from-gray-100 to-gray-200">
                                <img
                                  src="/3D/green.svg"
                                  className="w-16 h-16"
                                  alt=""
                                />
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
                <div
                  ref={imageContainerRef}
                  style={{ scrollMarginTop: "160px" }}
                  className="flex-1 w-full min-w-0"
                >
                  <div className="relative aspect-square bg-neutral-50 rounded-lg overflow-hidden mb-4 w-full">
                    {isImagesLoading ? (
                      // Skeleton placeholder for main image
                      <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
                        <div className="w-16 h-16 bg-gray-300 rounded-full animate-pulse" />
                      </div>
                    ) : is3DModel(
                      thumbnailImages[selectedImage],
                      selectedImage,
                    ) ? (
                      <div
                        id="ijewel-viewer-main"
                        ref={mainViewerRef}
                        className="w-full h-full"
                        style={{
                          width: "100%",
                          height: "100%",
                          aspectRatio: window.innerWidth <= 767 ? "1" : "1",
                          maxWidth: window.innerWidth <= 767 ? "100%" : "100%",
                          maxHeight: window.innerWidth <= 767 ? "auto" : "100%",
                        }}
                      ></div>
                    ) : (
                      <img
                        src={
                          thumbnailImages[selectedImage] || thumbnailImages[0]
                        }
                        alt={selectedStyleData?.name || "Ring Style"}
                        className="w-full h-full object-cover transition-opacity duration-300"
                      />
                    )}

                    <Button
                      onClick={() => setSelectedStyleCategory("CHANNEL SET")}
                      className="hidden absolute bg-[#68C5C0] text-white top-4 right-4 px-2 py-1 rounded-md text-xs font-semibold z-10"
                    >
                      RESET
                    </Button>
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
                      ref={thumbnailsMobileRef}
                      className="flex gap-2 overflow-x-auto scrollbar-hide flex-1  max-w-[270px] py-1"
                      style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        scrollBehavior: "smooth",
                      }}
                    >
                      {isImagesLoading
                        ? // Show skeleton placeholders when loading
                          Array.from({ length: skeletonCount }).map((_, index) => (
                            <div
                              key={`skeleton-mobile-${index}`}
                              className="w-16 h-16 rounded-lg overflow-hidden border-2 border-neutral-200 flex-shrink-0 bg-gray-200 animate-pulse"
                            />
                          ))
                        : // Show actual images when loaded
                          thumbnailImages.map((image, index) => (
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
                                <div className="relative flex justify-center items-center w-full h-full bg-gradient-to-br from-gray-100 to-gray-200">
                                  <img
                                    src="/3D/green.svg"
                                    className="w-16 h-16"
                                    alt=""
                                  />
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
                          {selectedStyleCategory}
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
                    <span className="text-[#328F94]">
                      {selectedStyleCategory}
                    </span>
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
                        {styleAndDesign.map((category, index) => (
                          <button
                            key={`${category.name}-${index}`}
                            onClick={() => {
                              setSelectedStyleCategory(category.name);

                              // Load category data if not loaded
                              if (!category.isLoaded) {
                                fetchCategoryData(category.name);
                              } else {
                                // If already loaded, select first substyle
                                if (category.substyles.length > 0) {
                                  setSelectedParentSku(
                                    category.substyles[0].parentSku || "",
                                  );
                                }
                              }
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
                        {loading && currentSubstyles.length === 0 ? (
                          // Loading state
                          Array.from({ length: 3 }).map((_, index) => (
                            <div
                              key={`loading-${index}`}
                              className="flex flex-col items-center gap-2 md:gap-3 p-2 md:p-3 rounded-xl border border-neutral-300 min-w-[75px] md:min-w-[100px] animate-pulse"
                            >
                              <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg bg-gray-200" />
                              <div className="w-16 h-3 bg-gray-200 rounded" />
                            </div>
                          ))
                        ) : error ? (
                          // Error state
                          <div className="flex items-center justify-center p-4 text-sm text-red-600 bg-red-50 rounded-lg min-w-[200px]">
                            {error}
                          </div>
                        ) : currentSubstyles.length === 0 ? (
                          // Empty state
                          <div className="flex items-center justify-center p-4 text-sm text-gray-500 min-w-[200px]">
                            No designs available
                          </div>
                        ) : (
                          currentSubstyles.map((style, index) => (
                            <button
                              key={`${style.name}-${index}`}
                              onClick={() => {
                                setSelectedParentSku(style.parentSku || "");
                                setSelectedImage(0); // Reset to first image when style changes
                              }}
                              className={`flex flex-col items-center rounded-xl border min-w-[75px] md:min-w-[100px] transition-all flex-shrink-0 ${
                                selectedParentSku === style.parentSku
                                  ? "border-[#328F94] bg-[#328F94]/5 shadow-sm"
                                  : "border-neutral-300 hover:border-neutral-400 hover:bg-gray-50"
                              }`}
                            >
                              <div className="w-12 h-12 md:w-48 md:h-48 rounded-lg overflow-hidden bg-gray-100">
                                <img
                                  src={style.img}
                                  alt={style.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    // Fallback image on error
                                    const target = e.target as HTMLImageElement;
                                    target.src =
                                      "/build_yr_own/placeholder.png";
                                  }}
                                />
                              </div>
                              {/* <span
                                className={`text-xs font-medium text-center leading-tight ${
                                  selectedRingStyle === style.name
                                    ? "text-[#328F94]"
                                    : "text-neutral-600"
                                }`}
                              >
                                {style.name}
                              </span> */}
                            </button>
                          ))
                        )}
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
                    <button
                      onClick={() => setIsPdfPopupOpen(true)}
                      className="text-[#328F94] underline"
                    >
                      Stone Guide
                    </button>
                  </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(isLabGrownVariant
                      ? ["Natural Diamond","Lab Grown Diamond"]
                      : ["Natural Diamond", "Lab Grown Diamond"]
                    ).map((origin) => (
                      <button
                        key={origin}
                        onClick={() => {
                            setSelectedDiamondOrigin(origin);
                        }}
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
                {/* Diamond Shape */}
               {getAvailableDiamondShapes().length > 1 && ( <div className="mb-6">
                  <h3 className="mb-3 text-sm md:text-base">
                    Diamond Shape:{" "}
                    <span className="text-[#8D8A91]">
                      {selectedDiamondShape.charAt(0) +
                        selectedDiamondShape.slice(1).toLowerCase()}
                    </span>
                  </h3>

                  <div className="flex flex-wrap gap-3">
                    {getAvailableDiamondShapes().map((shape) => (
                      <div key={shape.name} className="relative group">
                        <button
                          onClick={() => {
                            setSelectedDiamondShape(shape.name);
                            scrollToImageOnMobile();
                          }}
                          className={`w-14 h-14 md:w-16 md:h-16 border rounded-lg overflow-hidden grid place-items-center p-1 transition-all
            ${
              selectedDiamondShape === shape.name
                ? "border-[#328F94] ring-2 ring-[#328F94]/20"
                : "border-neutral-300 hover:border-neutral-400"
            }`}
                        >
                          <img
                            src={shape.img}
                            alt={shape.name}
                            className="h-12"
                          />
                        </button>

                        {/* Tooltip */}
                        <span
                          className="absolute bottom-[-16px] right-[-32px] px-3 py-2 rounded bg-black text-white text-base opacity-0 pointer-events-none transition-opacity duration-150 group-hover:opacity-100 z-50"
                          style={{ zIndex: 10 }}
                        >
                          <p className="text-xs">{shape.name}</p>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>)}

                {/* Diamond Lab & Clarity */}
                {/* <div className="grid grid-cols-2 gap-4">
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
                </div> */}

                {/* Diamond Size Section */}
                {getAvailableDiamondSizes().length > 0 && (
                  <div className="w-full">
                    <div className="mb-6 w-1/2">
                      <h3 className="mb-3 text-sm md:text-base">
                        Diamond Size (Center Stone){" "}
                        {/* <span className="text-[#8D8A91]">
                          {selectedDiamondSize || getAvailableDiamondSizes()[0]}{" "}
                          carat
                        </span> */}
                      </h3>

                      <Select
                        value={selectedDiamondSize}
                        onValueChange={(value) => {
                          setSelectedDiamondSize(value);
                          scrollToImageOnMobile();
                        }}
                      >
                        <SelectTrigger className="w-full text-sm border-neutral-300">
                          <SelectValue placeholder="Select Diamond Size" />
                        </SelectTrigger>

                        <SelectContent className="bg-white">
                          {getAvailableDiamondSizes()
                            .filter((size) => {
                              // For Natural Diamond, only show sizes <= 1 carat
                              if (selectedDiamondOrigin === "Natural Diamond") {
                                return parseFloat(size) <= 1;
                              }
                              // For Lab Grown Diamond, show all sizes
                              return true;
                            })
                            .map((size) => (
                              <SelectItem key={size} value={size}>
                                {size} ct
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Diamond Color & Clarity Section */}
                {getAvailableColorClarity().length > 0 && (
                    <div className="w-1/2 mb-6">
                      <h3 className="mb-3 text-sm md:text-base">
                        Diamond Color & Clarity:{" "}
                        <span className="text-[#8D8A91]">
                          {selectedColorClarity ||
                            getAvailableColorClarity()[0]}
                        </span>
                      </h3>

                      <Select
                        value={selectedColorClarity}
                        onValueChange={(value) => {
                          setSelectedColorClarity(value);
                        }}
                      >
                        <SelectTrigger className="w-full text-sm border-neutral-300">
                          <SelectValue placeholder="Select Color & Clarity" />
                        </SelectTrigger>

                        <SelectContent className="bg-white">
                          {getAvailableColorClarity().map((clarity) => (
                              <SelectItem key={clarity} value={clarity}>
                                {clarity}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                {/* Select Gold Karat Section - Dynamic based on Metal Type */}

                {/* Metal Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs mb-2">Metal Type</label>
                    <Select
                      value={selectedMetalType}
                      onValueChange={(value) => {
                        setSelectedMetalType(value);
                        // Reset karat selection when metal type changes
                        const newKarats =
                          value === "SILVER"
                            ? ["SLV"]
                            : value === "PLATINUM"
                              ? ["PT"]
                              : selectedStyleData?.productDetails?.goldKarats?.filter(
                                  (k) => !["925", "950"].includes(k),
                                ) || ["18kt", "14kt", "9kt"];
                        setSelectedGoldKarat(newKarats[0] || "");
                        scrollToImageOnMobile();
                      }}
                    >
                      <SelectTrigger className="text-sm border-neutral-300">
                        <SelectValue placeholder="Select Metal Type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {getAvailableMetalTypes().map((type, index) => (
                          <SelectItem key={index} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full">
                    <h3 className="mb-3 text-sm md:text-base">
                      {selectedMetalType === "GOLD"
                        ? "Select Gold Karat"
                        : selectedMetalType === "SILVER"
                          ? "Silver Purity"
                          : selectedMetalType === "PLATINUM"
                            ? "Platinum Purity"
                            : "Metal Purity"}
                      :{" "}
                      <span className="text-[#8D8A91]">
                        {selectedMetalType === "GOLD"
                          ? `${selectedGoldKarat || getAvailableKarats()[0]}`
                          : selectedMetalType === "SILVER"
                            ? "925"
                            : selectedMetalType === "PLATINUM"
                              ? "950"
                              : ""}
                      </span>
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (metalTypesRef.current) {
                            metalTypesRef.current.scrollBy({
                              left: -120,
                              behavior: "smooth",
                            });
                          }
                        }}
                        aria-label="Scroll karats left"
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <ChevronLeft className="w-5 h-5 text-[#8D8A91]" />
                      </button>
                      <div
                        ref={metalTypesRef}
                        className="flex gap-2 overflow-x-hidden scroll-smooth flex-1"
                      >
                        {selectedMetalType === "GOLD" ? (
                          getAvailableKarats().map((karat, index) => (
                            <button
                              key={`${karat}-${index}`}
                              onClick={() => {
                                setSelectedGoldKarat(karat);
                              }}
                              className={`px-3 py-1.5 rounded-full border text-xs min-w-max whitespace-nowrap transition-all ${
                                selectedGoldKarat === karat
                                  ? "border-[#328F94] bg-[#328F94]/10 text-[#328F94]"
                                  : "border-neutral-600 text-neutral-600 hover:bg-gray-50"
                              }`}
                            >
                              {karat}
                            </button>
                          ))
                        ) : selectedMetalType === "SILVER" ? (
                          <button
                            onClick={() => setSelectedGoldKarat("SLV")}
                            className={`px-3 py-1.5 rounded-full border text-xs min-w-max whitespace-nowrap transition-all ${
                              selectedGoldKarat === "SLV"
                                ? "border-[#328F94] bg-[#328F94]/10 text-[#328F94]"
                                : "border-neutral-600 text-neutral-600 hover:bg-gray-50"
                            }`}
                          >
                            925
                          </button>
                        ) : selectedMetalType === "PLATINUM" ? (
                          <button
                            onClick={() => setSelectedGoldKarat("PLT")}
                            className={`px-3 py-1.5 rounded-full border text-xs min-w-max whitespace-nowrap transition-all ${
                              selectedGoldKarat === "PLT"
                                ? "border-[#328F94] bg-[#328F94]/10 text-[#328F94]"
                                : "border-[#328F94] bg-[#328F94]/10 text-[#328F94]"
                            }`}
                          >
                            950
                          </button>
                        ) : null}
                      </div>
                      <button
                        onClick={() => {
                          if (metalTypesRef.current) {
                            metalTypesRef.current.scrollBy({
                              left: 120,
                              behavior: "smooth",
                            });
                          }
                        }}
                        aria-label="Scroll karats right"
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
                    Metal Color:{" "}
                    <span className="text-[#8D8A91]">{selectedMetalColor}</span>
                  </h3>

                  {/* Desktop View - 7 columns, 2 rows */}
                  <div className="hidden md:flex md:flex-wrap gap-3">
                    {availableColorCodes.map((code) => {
                      const colorInfo = getColorDisplayInfo(code);
                      if (!colorInfo) return null;
                      const isCombination = colorInfo.colors.length > 1;

                      return (
                        <button
                          key={code}
                          onClick={() => {
                            setSelectedMetalColor(colorInfo.name);
                            setSelectedColorCode(code);
                            scrollToImageOnMobile();
                          }}
                          className={`w-10 h-10 flex justify-center items-center rounded-full border-2 transition-all hover:scale-105 ${
                            selectedColorCode === code
                              ? "border-[#328F94] ring-2 ring-[#328F94]/20"
                              : "border-neutral-300 hover:border-neutral-400"
                          }`}
                          title={colorInfo.name}
                        >
                          {isCombination ? (
                            <img
                              src={colorInfo.img}
                              alt={colorInfo.name}
                              className="w-7 h-7 object-cover rounded-full"
                            />
                          ) : (
                            <img
                              className="w-full h-full object-cover rounded-full"
                              src={colorInfo.img}
                              alt={colorInfo.name}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Mobile View - 5 columns with show more */}
                  <div className="md:hidden w-full">
                    <div className="grid grid-cols-5 gap-2 sm:gap-3">
                      {(showAllColors
                        ? availableColorCodes
                        : availableColorCodes.slice(0, 10)
                      ).map((code) => {
                        const colorInfo = getColorDisplayInfo(code);
                        if (!colorInfo) return null;
                        const isCombination = colorInfo.colors.length > 1;

                        return (
                          <button
                            key={code}
                            onClick={() => {
                              setSelectedMetalColor(colorInfo.name);
                              setSelectedColorCode(code);
                              scrollToImageOnMobile();
                            }}
                            className={`w-6 h-6 flex justify-center items-center sm:w-10 sm:h-10 rounded-full border-2 transition-all hover:scale-105 ${
                              selectedColorCode === code
                                ? "border-[#328F94] ring-2 ring-[#328F94]/20"
                                : "border-neutral-300 hover:border-neutral-400"
                            }`}
                            title={colorInfo.name}
                          >
                            {isCombination ? (
                              <img
                                src={colorInfo.img}
                                alt={colorInfo.name}
                                className="w-4 h-4 sm:w-8 sm:h-8 object-cover rounded-full"
                              />
                            ) : (
                              <img
                                className="w-full h-full object-cover rounded-full"
                                src={colorInfo.img}
                                alt={colorInfo.name}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Show More/Less buttons */}
                    {!showAllColors && availableColorCodes.length > 10 && (
                      <button
                        onClick={() => setShowAllColors(true)}
                        className="mt-3 text-sm text-[#328F94] font-medium hover:underline"
                      >
                        Show More ({availableColorCodes.length - 10} more)
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

                {/* Bandwidth and Finishing Selection */}
                {((selectedStyleData?.productDetails?.bandwidth?.length ?? 0) >
                  0 ||
                  (selectedStyleData?.productDetails?.finishing?.length ?? 0) >
                    0) && (
                  <div className="my-6">
                    <div
                      className={`grid ${
                        (selectedStyleData?.productDetails?.bandwidth?.length ??
                          0) > 0 &&
                        (selectedStyleData?.productDetails?.finishing?.length ??
                          0) > 0
                          ? "grid-cols-2"
                          : "grid-cols-1"
                      } gap-4`}
                    >
                      {/* Bandwidth Selection */}
                      {(selectedStyleData?.productDetails?.bandwidth?.length ??
                        0) > 0 && (
                        <div>
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
                            <SelectTrigger className="text-sm border-neutral-300">
                              <SelectValue placeholder="Select Width" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              {selectedStyleData?.productDetails?.bandwidth?.map(
                                (width) => (
                                  <SelectItem key={width} value={width}>
                                    {width}mm
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Finishing Selection */}
                      {(selectedStyleData?.productDetails?.finishing?.length ??
                        0) > 0 && (
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
                            <SelectTrigger className="text-sm border-neutral-300">
                              <SelectValue placeholder="Select Finish" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              {selectedStyleData?.productDetails?.finishing?.map(
                                (finish) => (
                                  <SelectItem
                                    key={finish.code}
                                    value={finish.code}
                                  >
                                    {finish.type}
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Ring Size - Full width on mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2">Ring Size</label>
                    <Select
                      value={selectedSize}
                      onValueChange={(value) => {
                        setSelectedSize(value);
                      }}
                    >
                      <SelectTrigger className="text-sm border-neutral-300 h-10 md:h-11">
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

                {/* Free Engraving */}
                <div className={`${selectedStyleData?.productDetails?.isEngraving ? "flex items-center space-x-2" : "hidden"}`}>
                  <input
                    type="checkbox"
                    id="engraving"
                    checked={hasEngraving}
                    onChange={(e) => {
                      const willEnable = e.target.checked;
                      if (willEnable) {
                        // If no engraving exists, open the engrave modal with EV image
                        if (!hasEngraving) {
                          setShowEngraveModal(true);
                        }
                      } else {
                        // Undo engraving
                        setHasEngraving(false);
                        setSavedEngravingData(null);
                        setEngravingText("");
                        setEngravingImageUrl("");
                        setEngravingMotifPath("");
                      }
                    }}
                    className="border-primary accent-[#68C5C0] w-4 h-4"
                  />
                  <label
                    htmlFor="engraving"
                    className="text-sm text-primary cursor-pointer"
                  >
                    Add Free Engraving
                  </label>
                </div>

                {/* Show saved engraving summary with Undo when present */}
                {hasEngraving && savedEngravingData && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2 flex items-center justify-between">
                    <div className="text-sm">
                      <div className="font-medium">Engraving added</div>
                      <div className="text-muted-foreground text-xs">
                        {savedEngravingData.text || savedEngravingData.motif}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="text-sm text-[#328F94] underline"
                        onClick={() => {
                          // Undo engraving
                          setHasEngraving(false);
                          setSavedEngravingData(null);
                          setEngravingText("");
                          setEngravingImageUrl("");
                          setEngravingMotifPath("");
                        }}
                      >
                        Undo
                      </button>
                    </div>
                  </div>
                )}

                {/* Engrave Modal Pop-Up */}
                {showEngraveModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="relative w-full h-full bg-white overflow-auto">
                      {(() => {
                        // Determine EV image from selected style data (prefer productDetails.variantImages)
                        const originalImage =
                          selectedStyleData?.productDetails
                            ?.variantImages?.[0] ||
                          selectedStyleData?.thumbnailImages?.[0] ||
                          selectedStyleData?.img ||
                          "";

                        let evImage = originalImage || "";
                        if (evImage) {
                          evImage = evImage.replace(
                            /-(FV|SV|TV|BV|LV|RV|GP)\.webp$/i,
                            "-EV.webp",
                          );
                          if (evImage === originalImage) {
                            // Fallback: replace extension with -EV.webp
                            evImage = originalImage.replace(
                              /\.webp$/i,
                              "-EV.webp",
                            );
                          }
                        }

                        return (
                          <Engrave
                            onClose={() => setShowEngraveModal(false)}
                            onSave={(
                              text?: string,
                              imageUrl?: string,
                              motifPath?: string,
                            ) => {
                              // Save a single engraving entry
                              const img = (imageUrl || evImage) as string;
                              setSavedEngravingData({
                                text: text || "",
                                motif: motifPath || "",
                                imageUrl: img || "",
                              });
                              setEngravingText(text || "");
                              setEngravingImageUrl(img || "");
                              setEngravingMotifPath(motifPath || "");
                              setHasEngraving(true);
                              setShowEngraveModal(false);
                            }}
                            selectedImage={
                              // Pass EV image to Engrave component
                              evImage || undefined
                            }
                            jewelryType={selectedStyleData?.name || ""}
                          />
                        );
                      })()}
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

                {/* Action Buttons - Stack on very small screens */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <Button
                    onClick={handleBuyNow}
                    disabled={cartLoading || isUploadingEngraving}
                    className="w-full bg-[#328F94] hover:bg-[#328F94]/90 text-white py-3"
                  >
                    Buy Now
                  </Button>
                  <Button
                    onClick={handleAddToCart}
                    disabled={cartLoading || isUploadingEngraving}
                    variant="outline"
                    className="w-full border-[#328F94] text-[#328F94] py-3"
                  >
                    Add To Cart
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

                {/* Share Options - Stack on mobile */}
                <div>
                  <h3 className="font-medium mb-3 text-sm">Share</h3>
                  <div className="grid grid-cols-3 text-[#328F94] gap-2 md:gap-3">
                    {socialLinks.map((link, index) => (
                      <Button
                        key={index}
                        size="sm"
                        className="flex items-center justify-center gap-2 text-xs"
                        onClick={link.action}
                      >
                        {link.isImage ? (
                          <img
                            src={link.icon as string}
                            alt={link.label}
                            className={`${link.height} ${link.width}`}
                          />
                        ) : (
                          (() => {
                            const IconComponent =
                              link.icon as React.ElementType;
                            return <IconComponent size={14} />;
                          })()
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
                            {selectedStyleData?.productDetails?.modelSku ||
                              derivedProductId ||
                              selectedStyleData?.parentSku ||
                              "-"}
                          </span>
                        </div>

                        <div className="flex justify-between py-2 border-b border-[#328F94]">
                          <span className="text-muted-foreground">
                            Ring Size
                          </span>
                          <span className="font-medium">
                            {selectedSize || "Not Selected"}
                          </span>
                        </div>

                        {selectedGoldKarat && (
                          <div className="flex justify-between py-2 border-b border-[#328F94]">
                            <span className="text-muted-foreground">
                              Metal Purity
                            </span>
                            <span className="font-medium">
                              {selectedGoldKarat}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between py-2 border-b border-[#328F94]">
                          <span className="text-muted-foreground">
                            Metal Type
                          </span>
                          <span className="font-medium">
                            {selectedMetalType || "Not Selected"}
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
                        {selectedStyleData?.productDetails?.netWeightGrams && (
                          <div className="flex justify-between text-sm py-1">
                            <span>Net Weight:</span>
                            <span>
                              {selectedStyleData.productDetails.netWeightGrams.toFixed(
                                2,
                              )}{" "}
                              g
                            </span>
                          </div>
                        )}

                        <div className="hidden py-2 border-b border-[#328F94]">
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
                        </div>
                        <div className="py-2 border-b border-t border-[#328F94] flex justify-between">
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
                            Diamond Shape
                          </span>
                          <span className="font-medium">
                            {selectedDiamondShape || "-"}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-[#328F94]">
                          <span className="text-muted-foreground">
                            Diamond Color & Clarity
                          </span>
                          <span className="font-medium">
                            {selectedColorClarity || "-"}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-[#328F94]">
                          <span className="text-muted-foreground">
                            Total Diamond Weight 
                          </span>
                          <span className="font-medium">
                            {totalDiamondWeight.toFixed(3) || "-"}
                          </span>
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
                            {selectedMetalType} Value
                          </span>
                          <span className="font-medium">
                            ₹{" "}
                            {selectedStyleData?.productDetails?.priceBreakdown
                              ?.metalCost
                              ? Math.round(
                                  selectedStyleData.productDetails
                                    .priceBreakdown.metalCost,
                                ).toLocaleString()
                              : "0"}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-[#328F94]">
                          <span className="text-muted-foreground">
                            Diamond Value
                          </span>
                          <span className="font-medium">
                            ₹{" "}
                            {selectedStyleData?.productDetails?.priceBreakdown
                              ?.diamondCost
                              ? Math.round(
                                  selectedStyleData.productDetails
                                    .priceBreakdown.diamondCost,
                                ).toLocaleString()
                              : "0"}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-[#328F94]">
                          <span className="text-muted-foreground">
                            Making Charges
                          </span>
                          <span className="font-medium">
                            ₹{" "}
                            {Math.round(
                              (selectedStyleData?.productDetails?.priceBreakdown
                                ?.labourCost || 0)
                            ).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-[#328F94]">
                          <span className="text-muted-foreground">GST</span>
                          <span className="font-medium">
                            ₹{" "}
                            {selectedStyleData?.productDetails?.priceBreakdown
                              ?.gstAmount
                              ? Math.round(
                                  selectedStyleData.productDetails
                                    .priceBreakdown.gstAmount,
                                ).toLocaleString()
                              : "0"}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-[#328F94] font-semibold">
                          <span>Total</span>
                          <span>
                            ₹{" "}
                            {selectedStyleData?.productDetails?.priceBreakdown
                              ?.totalWithGst
                              ? Math.round(
                                  selectedStyleData.productDetails
                                    .priceBreakdown.totalWithGst,
                                ).toLocaleString()
                              : "0"}
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
            <ProductReviews productId={derivedProductId} />
          </div>
        </div>

        {/* Engrave Modal Overlay is handled inline where the checkbox opens the Engrave modal (EV-aware). */}
      </main>
    </div>
  );
};

export default ProductDetail;
