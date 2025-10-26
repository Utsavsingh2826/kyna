import { useState, useRef, useEffect } from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Star,
  Heart,
} from "lucide-react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

// Extend the Window interface to include THREE
declare global {
  interface Window {
    THREE: typeof THREE;
  }
}

// 3D Model Viewer Component using Three.js
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
        console.log("Attempting to load GLB model:", modelUrl);

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
            console.log("Successfully loaded GLB model:", modelUrl, gltf);
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
            console.log("GLB model added to scene successfully");

            // Dispose of the DRACO loader after use
            dracoLoader.dispose();
          },
          (progress) => {
            const progressPercent = (progress.loaded / progress.total) * 100;
            console.log(
              "Loading progress for",
              modelUrl,
              ":",
              progressPercent + "%"
            );
          },
          (error) => {
            console.error("Error loading GLB model:", modelUrl, error);
            console.log("Falling back to placeholder model");
            dracoLoader.dispose();
            createPlaceholderModel();
          }
        );
      } else {
        console.log("No valid GLB URL provided, using placeholder model");
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

// Sample product data with mixed media types
const sampleProduct = {
  id: 1,
  name: "4 2/5 ctw Oval Lab Grown Diamond Bridal Set",
  rating: 4.9,
  reviewCount: 67,
  price: "₹5,224",
  monthlyPrice: "Starting at ₹988/mo",
  description:
    "This stunning 4 2/5 ctw Oval set features an oval lab-grown diamond surrounded by a halo of round diamonds, offering brilliant sparkle and timeless elegance.",
  media: [
    {
      type: "image",
      src: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400",
    },
    {
      type: "glb",
      src: "/product_detail/glb.glb",
      name: "3D Model - Ring View",
    },
    {
      type: "image",
      src: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400",
    },
    {
      type: "glb",
      src: "/product_detail/glb.glb", // Use the same working GLB file for testing
      name: "3D Model - Detail View",
    },
    {
      type: "image",
      src: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=400",
    },
    {
      type: "image",
      src: "https://images.unsplash.com/photo-1588444650733-09703e5562ac?w=400",
    },
    // Add more GLB models as needed
    {
      type: "glb",
      src: "/assets/models/diamond-ring.glb",
      name: "Diamond Ring 3D",
    },
    {
      type: "glb",
      src: "/product_detail/glb.glb", // Use the same working GLB file for testing
      name: "Wedding Band 3D",
    },
  ],
  diamondShapes: [
    { name: "Round" },
    { name: "Princess" },
    { name: "Emerald" },
    { name: "Asscher" },
    { name: "Radiant" },
    { name: "Cushion" },
    { name: "Oval" },
    { name: "Pear" },
    { name: "Marquise" },
    { name: "Heart" },
  ],
  metalTypes: ["Gold", "Silver", "Platinum", "Palladium", "Titanium", "Cobalt"],
  metalColors: [
    { name: "White Gold", color: "#F5F5F5" },
    { name: "Yellow Gold", color: "#FFD700" },
    { name: "Rose Gold", color: "#E8B4B8" },
    { name: "Silver", color: "#C0C0C0" },
    { name: "Platinum", color: "#E5E4E2" },
  ],
};

const ProductDetail = () => {
  const [selectedMedia, setSelectedMedia] = useState(0);
  const [selectedDiamondOrigin, setSelectedDiamondOrigin] =
    useState("Natural Diamond");
  const [selectedDiamondShape, setSelectedDiamondShape] = useState("Oval");
  const [selectedMetalColor, setSelectedMetalColor] = useState("White Gold");
  const [selectedSize, setSelectedSize] = useState("");

  const thumbnailsRef = useRef<HTMLDivElement>(null);

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

  return (
    <div style={{ fontFamily: "Poppins" }} className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto bg-white">
        {/* Breadcrumb */}
        <div className="px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <a href="/" className="hover:text-gray-800">
              Home
            </a>
            <span>›</span>
            <a href="/rings" className="hover:text-gray-800">
              Rings
            </a>
            <span>›</span>
            <span className="text-gray-800">
              Lab Grown Diamond Bridal Ring Set
            </span>
          </nav>
        </div>

        <div className="px-4 grid grid-cols-1 lg:grid-cols-2 gap-8 pb-8">
          {/* Left Column - Media Display */}
          <div className="flex gap-4 flex-col md:flex-row">
            {/* Thumbnails for desktop (vertical) */}
            <div className="hidden md:flex flex-col gap-2 relative">
              <button
                onClick={scrollThumbnailsUp}
                className="self-center p-2 hover:bg-gray-100 rounded-full transition-colors bg-white shadow-sm border"
                aria-label="Scroll thumbnails up"
              >
                <ChevronUp className="w-4 h-4 text-gray-600" />
              </button>
              <div
                ref={thumbnailsRef}
                className="flex flex-col gap-2 overflow-y-auto scrollbar-hide max-h-[400px]"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {sampleProduct.media.map((media, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedMedia(index)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all hover:scale-105 relative ${
                      selectedMedia === index
                        ? "border-teal-600 ring-2 ring-teal-600/20"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {media.type === "image" ? (
                      <img
                        src={media.src}
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="relative w-full h-full bg-gradient-to-br from-gray-100 to-gray-200">
                        <GLBViewer
                          modelUrl="/product_detail/glb.glb"
                          className="w-full h-full"
                          isMain={false}
                        />
                        <div className="absolute top-1 right-1 bg-teal-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                          3D
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <button
                onClick={scrollThumbnailsDown}
                className="self-center p-2 hover:bg-gray-100 rounded-full transition-colors bg-white shadow-sm border"
                aria-label="Scroll thumbnails down"
              >
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Main Media Display */}
            <div className="flex-1 relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden shadow-lg">
              {sampleProduct.media[selectedMedia].type === "image" ? (
                <img
                  src={sampleProduct.media[selectedMedia].src}
                  alt={sampleProduct.name}
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
              ) : (
                <div className="relative w-full h-full">
                  <GLBViewer
                    modelUrl={sampleProduct.media[selectedMedia].src}
                    className="w-full h-full"
                    isMain={true}
                  />
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
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
              )}
              <div className="absolute bg-gradient-to-r from-red-500 to-red-600 text-white top-4 right-16 px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                15% OFF
              </div>
              <button className="absolute top-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-200 shadow-lg hover:scale-110">
                <Heart size={20} className="text-gray-600 hover:text-red-500" />
              </button>
            </div>

            {/* Thumbnails for mobile (horizontal) */}
            <div className="flex justify-between md:hidden items-center gap-2 relative">
              <button
                onClick={scrollThumbnailsLeft}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 bg-white shadow-sm border"
                aria-label="Scroll thumbnails left"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <div
                ref={thumbnailsRef}
                className="flex gap-2 overflow-x-auto scrollbar-hide max-w-[260px]"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {sampleProduct.media.map((media, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedMedia(index)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all hover:scale-105 relative ${
                      selectedMedia === index
                        ? "border-teal-600 ring-2 ring-teal-600/20"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {media.type === "image" ? (
                      <img
                        src={media.src}
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="relative w-full h-full bg-gradient-to-br from-gray-100 to-gray-200">
                        <GLBViewer
                          modelUrl={media.src}
                          className="w-full h-full"
                          isMain={false}
                        />
                        <div className="absolute top-1 right-1 bg-teal-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                          3D
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <button
                onClick={scrollThumbnailsRight}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 bg-white shadow-sm border"
                aria-label="Scroll thumbnails right"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Right Column - Product Details */}
          <div className="space-y-6">
            {/* Product Info */}
            <div>
              <h1 className="text-3xl font-bold mb-3 text-gray-900">
                {sampleProduct.name}
              </h1>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">
                    {sampleProduct.rating}
                  </span>
                </div>
                <span className="text-teal-600 bg-teal-50 px-3 py-1 rounded-full text-sm font-medium">
                  {sampleProduct.reviewCount} Reviews
                </span>
              </div>
              <div className="flex items-end mb-4 gap-4">
                <div className="text-3xl font-bold text-gray-900">
                  {sampleProduct.price}
                </div>
                <div className="text-lg mb-1 text-teal-600 font-medium">
                  {sampleProduct.monthlyPrice}
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {sampleProduct.description}
              </p>
            </div>

            {/* Diamond Origin */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="flex items-center gap-3 mb-4 text-lg font-semibold">
                Diamond Origin
                <button className="w-6 h-6 bg-teal-600 text-white text-sm rounded-full hover:bg-teal-700 transition-colors">
                  ?
                </button>
                <span className="text-teal-600 underline text-sm cursor-pointer hover:text-teal-700">
                  Stone Guide
                </span>
              </h3>
              <div className="flex gap-3">
                {["Natural Diamond", "Lab Grown Diamond"].map((origin) => (
                  <button
                    key={origin}
                    onClick={() => setSelectedDiamondOrigin(origin)}
                    className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                      selectedDiamondOrigin === origin
                        ? "border-teal-600 text-teal-600 bg-white shadow-md"
                        : "border-gray-300 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    {origin}
                  </button>
                ))}
              </div>
            </div>

            {/* Diamond Shape */}
            <div>
              <h3 className="mb-4 text-lg font-semibold">
                Diamond Shape:{" "}
                <span className="text-teal-600">{selectedDiamondShape}</span>
              </h3>
              <div className="grid grid-cols-5 gap-3">
                {sampleProduct.diamondShapes.map((shape) => (
                  <button
                    key={shape.name}
                    onClick={() => setSelectedDiamondShape(shape.name)}
                    className={`group relative aspect-square border-2 rounded-xl flex items-center justify-center text-sm font-medium transition-all hover:scale-105 ${
                      selectedDiamondShape === shape.name
                        ? "border-teal-600 bg-teal-50 text-teal-600"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {shape.name.slice(0, 3)}
                    <span className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {shape.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Metal Color */}
            <div>
              <h3 className="mb-4 text-lg font-semibold">
                Metal Color:{" "}
                <span className="text-teal-600">{selectedMetalColor}</span>
              </h3>
              <div className="flex gap-3">
                {sampleProduct.metalColors.map((colorOption) => (
                  <button
                    key={colorOption.name}
                    onClick={() => setSelectedMetalColor(colorOption.name)}
                    className={`w-12 h-12 rounded-full border-3 transition-all hover:scale-110 ${
                      selectedMetalColor === colorOption.name
                        ? "border-teal-600 ring-4 ring-teal-200"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    style={{ backgroundColor: colorOption.color }}
                    title={colorOption.name}
                  />
                ))}
              </div>
            </div>

            {/* Ring Size */}
            <div>
              <label className="block text-lg font-semibold mb-3">
                Ring Size
              </label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-teal-600 focus:outline-none transition-colors"
              >
                <option value="">Select Size</option>
                {ringSizes.map((size) => (
                  <option key={size} value={size}>
                    Size {size}
                  </option>
                ))}
              </select>
              <a
                href="/ring-size-guide"
                className="text-sm text-teal-600 font-medium underline mt-2 inline-block hover:text-teal-700"
              >
                📏 Ring Size Guide
              </a>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 pt-6">
              <button className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                🛒 Buy Now
              </button>
              <button className="w-full border-2 border-teal-600 text-teal-600 hover:bg-teal-50 py-4 rounded-xl font-bold text-lg transition-all duration-200 hover:scale-105">
                💝 Add To Cart
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-6 pt-4 border-t border-gray-200">
              <div className="text-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1">
                  <span className="text-green-600 font-bold text-sm">✓</span>
                </div>
                <span className="text-xs text-gray-600">Certified</span>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
                  <span className="text-blue-600 font-bold text-sm">🚚</span>
                </div>
                <span className="text-xs text-gray-600">Free Shipping</span>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-1">
                  <span className="text-purple-600 font-bold text-sm">↺</span>
                </div>
                <span className="text-xs text-gray-600">Easy Returns</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
