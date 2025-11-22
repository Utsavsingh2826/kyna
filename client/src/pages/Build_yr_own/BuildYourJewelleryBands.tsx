import { useState, useRef, useEffect, useCallback } from "react";
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

// Types for API response
interface ApiVariant {
  sku: string;
}

interface ApiProduct {
  parentSku: string;
  builderView: string;
  selectedImage: string;
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
  diamondSize: string[];
  diamondColorClarity: string[];
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
}

interface SubStyle {
  img: string;
  name: string;
  price: string;
  parentSku?: string;
  variants?: ApiVariant[];
  productDetails?: ProductModelResponse;
  thumbnailImages?: string[];
}

// Hardcoded category mappings
const categoryMappings: { [key: string]: string } = {
  "TENNIS BRACELET": "TENNIS BRACELET",
  "PAPPER CLIP": "PAPPER CLIP",
  "MULTI SHAPE": "MULTI SHAPE",
};

// Initial hardcoded structure that will be populated with API data
const getInitialStyleAndDesign = () => [
  {
    name: "PAPPER CLIP",
    substyles: [] as SubStyle[],
    isLoaded: false,
  },
  {
    name: "TENNIS BRACELET",
    substyles: [] as SubStyle[],
    isLoaded: false,
  },
  {
    name: "MULTI SHAPE",
    substyles: [] as SubStyle[],
    isLoaded: false,
  },
];
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
        1000
      );
      camera.position.set(0, 0, 5);

      // Renderer setup
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setSize(
        mountRef.current.clientWidth,
        mountRef.current.clientHeight
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
            diamondMaterial
          );
          smallDiamond.position.set(
            Math.cos(angle) * 1.3,
            0.1,
            Math.sin(angle) * 1.3
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
          "https://www.gstatic.com/draco/versioned/decoders/1.5.6/"
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
          (error) => {
            console.error("Error loading GLB model:", modelUrl, error);

            dracoLoader.dispose();
            createPlaceholderModel();
          }
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
          new THREE.Euler(deltaMove.y * 0.01, deltaMove.x * 0.01, 0, "XYZ")
        );

        modelRef.current.quaternion.multiplyQuaternions(
          deltaRotationQuaternion,
          modelRef.current.quaternion
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
          mountRef.current.clientHeight
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
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedDiamondOrigin, setSelectedDiamondOrigin] =
    useState("Natural Diamond");
  const [selectedDiamondShape, setSelectedDiamondShape] = useState("Oval");
  const [selectedMetalColor, setSelectedMetalColor] = useState("White Gold");
  const [selectedSize, setSelectedSize] = useState("");

  // API state
  const [styleAndDesign, setStyleAndDesign] = useState(
    getInitialStyleAndDesign()
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default to first category
  const [selectedStyleCategory, setSelectedStyleCategory] =
    useState("TENNIS BRACELET");
  const [selectedRingStyle, setSelectedRingStyle] = useState("");

  // Fetch data from API
  const fetchCategoryData = useCallback(async (categoryName: string) => {
    if (!categoryMappings[categoryName]) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:5000/api/products/builder?stylingName=${encodeURIComponent(
          categoryName
        )}`
      );
      const data: ApiResponse = await response.json();

      if (data.success && data.entries) {
        // Fetch detailed product data for each entry
        const substylePromises = data.entries.map(async (entry) => {
          try {
            // Get the first variant SKU to fetch product details
            const firstVariantSku = entry.variants[0]?.sku;
            if (firstVariantSku && entry.parentSku) {
              const colorCodeMap: { [key: string]: string } = {
                "White Gold": "WG",
                "Yellow Gold": "YG",
                "Rose Gold": "RG",
              };
              const metalCode = colorCodeMap[selectedMetalColor] || "WG";
              const productResponse = await fetch(
                `http://localhost:5000/api/products/model/${entry.parentSku}?variantId=${firstVariantSku}&metalColor=${metalCode}`
              );
              const productData: ProductModelResponse =
                await productResponse.json();

              // Price tracking: log API sellingPrice and formatted display price
              console.log(
                `Price tracking — parentSku: ${
                  entry.parentSku
                }, variant: ${firstVariantSku}, API sellingPrice: ${
                  productData.sellingPrice
                }, formatted: ₹${new Intl.NumberFormat("en-IN").format(
                  productData.sellingPrice
                )}`
              );

              if (productData.success) {
                return {
                  img: entry.selectedImage,
                  name: entry.builderView,
                  price: new Intl.NumberFormat("en-IN").format(
                    productData.sellingPrice
                  ), // Format price with commas
                  parentSku: entry.parentSku,
                  variants: entry.variants,
                  productDetails: productData,
                  thumbnailImages: productData.variantImages,
                };
              }
            }
            // Fallback if product details fail
            return {
              img: entry.selectedImage,
              name: entry.builderView,
              price: "5,224", // Fallback price
              parentSku: entry.parentSku,
              variants: entry.variants,
            };
          } catch (err) {
            console.error(
              `Failed to fetch product details for ${entry.parentSku}:`,
              err
            );
            return {
              img: entry.selectedImage,
              name: entry.builderView,
              price: "5,224", // Fallback price
              parentSku: entry.parentSku,
              variants: entry.variants,
            };
          }
        });

        const substyles = await Promise.all(substylePromises);

        setStyleAndDesign((prev) =>
          prev.map((category) =>
            category.name === categoryName
              ? { ...category, substyles, isLoaded: true }
              : category
          )
        );

        // Set first style as selected if none selected
        if (!selectedRingStyle && substyles.length > 0) {
          setSelectedRingStyle(substyles[0].name);
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
    async (parentSku: string, variantSku: string, metalColorName: string) => {
      try {
        const colorCodeMap: { [key: string]: string } = {
          "White Gold": "WG",
          "Yellow Gold": "YG",
          "Rose Gold": "RG",
        };
        const metalCode = colorCodeMap[metalColorName] || "WG";
        const res = await fetch(
          `http://localhost:5000/api/products/model/${parentSku}?variantId=${variantSku}&metalColor=${metalCode}`
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
                        data.sellingPrice
                      ),
                    }
                  : s
              ),
            }))
          );
        }
      } catch (err) {
        console.error("Failed to update substyle product details:", err);
      }
    },
    []
  );

  // Get current category's substyles and selected style data
  const currentCategory = styleAndDesign.find(
    (cat) => cat.name === selectedStyleCategory
  );
  const currentSubstyles = currentCategory?.substyles || [];
  const selectedStyleData =
    currentSubstyles.find((style) => style.name === selectedRingStyle) ||
    currentSubstyles[0];

  // When selectedMetalColor changes for the currently selected style, re-fetch its product details
  useEffect(() => {
    const parent = selectedStyleData?.parentSku;
    const variantSku = selectedStyleData?.variants?.[0]?.sku;
    if (parent && variantSku) {
      updateSubstyleProductDetails(parent, variantSku, selectedMetalColor);
    }
  }, [
    selectedMetalColor,
    selectedStyleData?.parentSku,
    selectedStyleData?.variants,
    updateSubstyleProductDetails,
  ]);

  // Load data for current category
  useEffect(() => {
    const currentCategory = styleAndDesign.find(
      (cat) => cat.name === selectedStyleCategory
    );
    if (currentCategory && !currentCategory.isLoaded) {
      fetchCategoryData(selectedStyleCategory);
    }
  }, [selectedStyleCategory, fetchCategoryData, styleAndDesign]);

  // Load Tennis Bracelet data on component mount
  useEffect(() => {
    fetchCategoryData("TENNIS BRACELET");
    fetchCategoryData("PAPPER CLIP");
  }, [fetchCategoryData]);

  // Add fallback for categories without API endpoints
  const getFallbackSubstyles = (categoryName: string): SubStyle[] => {
    if (categoryName === "PAPPER CLIP") {
      return [
        {
          img: "/build_yr_own/BR1-RD-025-WG-TRV.png",
          name: "BR1-RD-025-WG-TRV",
          price: "5,224",
        },
      ];
    }
    if (categoryName === "MULTI SHAPE") {
      return [
        {
          img: "/build_yr_own/BR8-MIX-025-WG-TRV.png",
          name: "BR8-MIX-025-WG-TRV",
          price: "5,224",
        },
        {
          img: "/build_yr_own/BR15-EMMQ-025-WG-TRV.png",
          name: "BR15-EMMQ-025-WG-TRV",
          price: "5,224",
        },
      ];
    }
    return [];
  };

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

  // Use the thumbnail images from the selected style data
  const thumbnailImages = selectedStyleData?.thumbnailImages || [
    "/product_detail/display.png",
    "/product_detail/glb.glb",
    "/product_detail/display.png",
    "/about/2.jpg",
    "/product_detail/display.png",
    "/about/3.jpg",
    "/product_detail/display.png",
    "/about/4.jpg",
  ];

  // Log when thumbnail images change
  useEffect(() => {
    // Removed console log for thumbnail changes
  }, [selectedRingStyle, selectedStyleData?.thumbnailImages]);

  // Function to check if image is a 3D model
  const is3DModel = (imagePath: string, index: number) => {
    const isGLB = index === 1 && imagePath.endsWith(".glb");
    return isGLB || imagePath.endsWith(".glb");
  };

  // Get available options from selected style's product details
  const getAvailableMetalTypes = useCallback(() => {
    if (!selectedStyleData?.productDetails?.metalTypes) {
      return sampleProductData.metalTypes; // Fallback to hardcoded data
    }
    return selectedStyleData.productDetails.metalTypes;
  }, [selectedStyleData?.productDetails?.metalTypes]);

  const getAvailableGoldKarats = useCallback(() => {
    if (!selectedStyleData?.productDetails?.goldKarats) {
      return ["14kt", "18kt", "22kt"]; // Fallback
    }
    return selectedStyleData.productDetails.goldKarats;
  }, [selectedStyleData?.productDetails?.goldKarats]);

  const getAvailableDiamondShapes = useCallback(() => {
    if (!selectedStyleData?.productDetails?.diamondShape) {
      return diamondShapes.shapes; // Fallback to hardcoded data
    }
    // Map API diamond shapes to our shape objects
    return selectedStyleData.productDetails.diamondShape.map((shape) => {
      const shapeData = diamondShapes.shapes.find(
        (s) => s.name.toUpperCase() === shape.toUpperCase()
      );
      return (
        shapeData || { name: shape, img: "/DIAMOND_SHAPES_WEBP/round.webp" }
      );
    });
  }, [selectedStyleData?.productDetails?.diamondShape]);

  const getAvailableDiamondSizes = useCallback(() => {
    if (!selectedStyleData?.productDetails?.diamondSize) {
      return ["0.5", "1.0", "1.5", "2.0"]; // Fallback
    }
    return selectedStyleData.productDetails.diamondSize;
  }, [selectedStyleData?.productDetails?.diamondSize]);

  // Ref for metal types scroll container
  const metalTypesRef = useRef<HTMLDivElement>(null);
  const [selectedMetalType, setSelectedMetalType] = useState(
    "GOLD" // Default to GOLD
  );

  // Add states for diamond size and gold karat
  const [selectedDiamondSize, setSelectedDiamondSize] = useState<string>("");
  const [selectedGoldKarat, setSelectedGoldKarat] = useState<string>("");

  // Function to get available karats based on selected metal type
  const getAvailableKarats = useCallback(() => {
    if (!selectedStyleData?.productDetails?.goldKarats) {
      return ["18kt", "14kt", "9kt"]; // Fallback for gold
    }

    const goldKarats = selectedStyleData.productDetails.goldKarats;

    if (selectedMetalType === "SILVER") {
      return ["925"]; // Silver is always 925
    } else if (selectedMetalType === "PLATINUM") {
      return ["950"]; // Platinum is 950
    } else {
      // For GOLD, filter out silver/platinum karats
      return goldKarats.filter((karat) => !["925", "950"].includes(karat));
    }
  }, [selectedStyleData?.productDetails?.goldKarats, selectedMetalType]);

  // Update selected options when style changes
  useEffect(() => {
    if (selectedStyleData?.productDetails) {
      const metalTypes = getAvailableMetalTypes();
      const goldKarats = getAvailableGoldKarats();
      const diamondShapes = getAvailableDiamondShapes();
      const diamondSizes = getAvailableDiamondSizes();
      const availableKarats = getAvailableKarats();

      // Set default selections from API data
      if (metalTypes.length > 0 && !metalTypes.includes(selectedMetalType)) {
        setSelectedMetalType("GOLD"); // Always default to GOLD
      }
      if (
        diamondShapes.length > 0 &&
        !diamondShapes.find((shape) => shape.name === selectedDiamondShape)
      ) {
        setSelectedDiamondShape(diamondShapes[0].name);
      }
      if (diamondSizes.length > 0 && selectedDiamondSize === "") {
        setSelectedDiamondSize(diamondSizes[0]);
      }
      if (
        availableKarats.length > 0 &&
        (selectedGoldKarat === "" ||
          !availableKarats.includes(selectedGoldKarat))
      ) {
        setSelectedGoldKarat(availableKarats[0]);
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
  ]);

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
                          <div className="relative w-full h-full bg-gradient-to-br from-gray-100 to-gray-200">
                            <GLBViewer
                              modelUrl={image}
                              className="w-full h-full"
                              isMain={false}
                            />
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
                        <GLBViewer
                          modelUrl={thumbnailImages[selectedImage]}
                          className="w-full h-full"
                          isMain={true}
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
                              <GLBViewer
                                modelUrl={image}
                                className="w-full h-full"
                                isMain={false}
                              />
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
                          {selectedStyleData?.name}
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
                        {styleAndDesign.map((category, index) => (
                          <button
                            key={`${category.name}-${index}`}
                            onClick={() => {
                              setSelectedStyleCategory(category.name);
                              // Load data if not loaded
                              if (!category.isLoaded) {
                                if (category.name === "TENNIS BRACELET") {
                                  fetchCategoryData(category.name);
                                } else {
                                  // Use fallback data for other categories
                                  const fallbackSubstyles =
                                    getFallbackSubstyles(category.name);
                                  setStyleAndDesign((prev) =>
                                    prev.map((cat) =>
                                      cat.name === category.name
                                        ? {
                                            ...cat,
                                            substyles: fallbackSubstyles,
                                            isLoaded: true,
                                          }
                                        : cat
                                    )
                                  );
                                  if (fallbackSubstyles.length > 0) {
                                    setSelectedRingStyle(
                                      fallbackSubstyles[0].name
                                    );
                                  }
                                }
                              } else if (category.substyles.length > 0) {
                                setSelectedRingStyle(
                                  category.substyles[0].name
                                );
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
                                setSelectedRingStyle(style.name);
                                setSelectedImage(0); // Reset to first image when style changes
                              }}
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
                                  onError={(e) => {
                                    // Fallback image on error
                                    const target = e.target as HTMLImageElement;
                                    target.src =
                                      "/build_yr_own/placeholder.png";
                                  }}
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
                    <span className="text-[#328F94] underline text-xs md:text-sm">
                      Stone Guide
                    </span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(isLabGrownVariant
                      ? ["Lab Grown Diamond"]
                      : ["Natural Diamond", "Lab Grown Diamond"]
                    ).map((origin) => (
                      <button
                        key={origin}
                        onClick={() => {
                          if (!isLabGrownVariant)
                            setSelectedDiamondOrigin(origin);
                        }}
                        className={`px-3 py-2 rounded-full border text-xs md:text-sm font-medium text-center ${
                          selectedDiamondOrigin === origin
                            ? "border-[#328F94] text-[#328F94] bg-[#328F94]/5"
                            : "border-neutral-600 text-neutral-600"
                        } ${
                          isLabGrownVariant && origin !== "Lab Grown Diamond"
                            ? "opacity-50 pointer-events-none"
                            : ""
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
                    {getAvailableDiamondShapes().map((diamond, index) => (
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
                {selectedStyleData?.productDetails?.diamondSize && (
                  <div className="w-full">
                    <h3 className="mb-3 text-sm md:text-base">
                      Diamond Size:{" "}
                      <span className="text-[#8D8A91]">
                        {selectedDiamondSize ||
                          selectedStyleData.productDetails.diamondSize[0]}{" "}
                        carat
                      </span>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 w-full">
                      {getAvailableDiamondSizes().map((size, index) => (
                        <button
                          key={`${size}-${index}`}
                          onClick={() => setSelectedDiamondSize(size)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                            selectedDiamondSize === size
                              ? "border-[#328F94] bg-[#328F94]/10 text-[#328F94]"
                              : "border-neutral-300 hover:bg-gray-50"
                          }`}
                        >
                          {size} ct
                        </button>
                      ))}
                    </div>
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
                            ? ["925"]
                            : value === "PLATINUM"
                            ? ["950"]
                            : selectedStyleData?.productDetails?.goldKarats?.filter(
                                (k) => !["925", "950"].includes(k)
                              ) || ["18kt", "14kt", "9kt"];
                        setSelectedGoldKarat(newKarats[0] || "");
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
                        {selectedGoldKarat || getAvailableKarats()[0]}
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
                        {getAvailableKarats().map((karat, index) => (
                          <button
                            key={`${karat}-${index}`}
                            onClick={() => setSelectedGoldKarat(karat)}
                            className={`px-3 py-1.5 rounded-full border text-xs min-w-max whitespace-nowrap transition-all ${
                              selectedGoldKarat === karat
                                ? "border-[#328F94] bg-[#328F94]/10 text-[#328F94]"
                                : "border-neutral-600 text-neutral-600 hover:bg-gray-50"
                            }`}
                          >
                            {karat}
                          </button>
                        ))}
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
                <AccordionContent className="pt-4">
                  {/* Three Column Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Item Details Column */}
                    <div>
                      <h4 className="text-[#328F94] font-semibold mb-4 text-sm">
                        ITEM DETAILS
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between py-2 border-b border-border">
                          <span className="text-muted-foreground">
                            SKU Number
                          </span>
                          <span className="font-medium">
                            {derivedProductId ||
                              selectedStyleData?.parentSku ||
                              "-"}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border">
                          <span className="text-muted-foreground">
                            Ring Size
                          </span>
                          <span className="font-medium">14 (20 mm)</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border">
                          <span className="text-muted-foreground">
                            Metal Type
                          </span>
                          <span className="font-medium">Gold 22KT</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border">
                          <span className="text-muted-foreground">
                            Metal Color
                          </span>
                          <span className="font-medium">Rose</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border">
                          <span className="text-muted-foreground">
                            Gold/Silver/Platinum Grams (Approx net grams)
                          </span>
                          <span className="font-medium">1.356 Grams</span>
                        </div>
                        <div className="py-2 border-b border-border">
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
                        <div className="py-2 border-b border-border flex justify-between">
                          <h4 className="font-medium mb-3 text-sm">
                            Disclaimer For Product Image
                          </h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Product Photography in Print Material and Website
                            may not reflect exact true color and/or scale.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Diamond & Gemstones Details Column */}
                    <div>
                      <h4 className="text-[#328F94] font-semibold mb-4 text-sm">
                        DIAMOND & GEMSTONES DETAILS
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between py-2 border-b border-border">
                          <span className="text-muted-foreground">
                            Diamond Origin
                          </span>
                          <span className="font-medium">
                            {selectedDiamondOrigin}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border">
                          <span className="text-muted-foreground">
                            Diamond Color & Clarity
                          </span>
                          <span className="font-medium">14K White Gold</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border">
                          <span className="text-muted-foreground">
                            Total Diamond Weight (Approx carats)
                          </span>
                          <span className="font-medium">8.60</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border">
                          <span className="text-muted-foreground">
                            Gemstone Origin
                          </span>
                          <span className="font-medium">11.86</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border">
                          <span className="text-muted-foreground">
                            Gemstone Color
                          </span>
                          <span className="font-medium">11.86</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border">
                          <span className="text-muted-foreground">
                            Gemstone Clarity
                          </span>
                          <span className="font-medium">11.86</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border">
                          <span className="text-muted-foreground">
                            Total Gemstone Weight (Approx carats)
                          </span>
                          <span className="font-medium">Oval</span>
                        </div>
                      </div>
                    </div>

                    {/* Price Breakup Column */}
                    <div>
                      <h4 className="text-[#328F94] font-semibold mb-4 text-sm">
                        Price Breakup
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between py-2 border-b border-border">
                          <span className="text-muted-foreground">
                            SKU Number
                          </span>
                          <span className="font-medium">
                            BRDTXR07400Q300GW4
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border">
                          <span className="text-muted-foreground">
                            Gold/Silver/Platinum Value
                          </span>
                          <span className="font-medium">
                            Rs{" "}
                            {/* {productData.priceBreakdown.metalCost.toLocaleString()} */}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border">
                          <span className="text-muted-foreground">
                            Diamond Value
                          </span>
                          <span className="font-medium">
                            Rs.
                            {/* {productData.priceBreakdown.diamondCost.toLocaleString()} */}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border">
                          <span className="text-muted-foreground">
                            Gemstones Value
                          </span>
                          <span className="font-medium">Rs.</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border">
                          <span className="text-muted-foreground">
                            Making Charges
                          </span>
                          <span className="font-medium">
                            Rs
                            {/* {productData.priceBreakdown.labourCost.toLocaleString()} */}
                            .
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border">
                          <span className="text-muted-foreground">GST</span>
                          <span className="font-medium">
                            Rs
                            {/* {productData.priceBreakdown.gstAmount.toLocaleString()} */}
                            .
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border font-semibold">
                          <span>Total</span>
                          <span>
                            Rs.
                            {/* {productData.priceBreakdown.totalWithGst.toLocaleString()} */}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border">
                          <span className="text-muted-foreground">
                            Certification
                          </span>
                          <span className="font-medium">IGI/SGL Certified</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border">
                          <span className="text-muted-foreground">
                            HallMark
                          </span>
                          <span className="font-medium">BIS HALLMARK</span>
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

                  {/* Full Width Disclaimer Section */}
                  <div className="border-t border-border pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Certification Logos */}
                      <div className="flex items-center gap-4 justify-start md:justify-end">
                        <img
                          src="/lovable-uploads/28cda72c-8974-4ea2-aecb-d264b8358551.png"
                          alt="BIS Hallmark"
                          className="h-16 w-16 object-contain"
                        />
                        <img
                          src="/lovable-uploads/5392cf55-b28f-4fbd-8889-824dfe20dc8f.png"
                          alt="IGI Certification"
                          className="h-16 w-16 object-contain"
                        />
                        <img
                          src="/lovable-uploads/9f89b073-535e-401e-88cd-4905a114937f.png"
                          alt="SGL Certification"
                          className="h-16 w-16 object-contain"
                        />
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
