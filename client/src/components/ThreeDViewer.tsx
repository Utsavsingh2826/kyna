import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface ThreeDViewerProps {
  modelUrl: string;
  isMain?: boolean;
}

export default function ThreeDViewer({
  modelUrl,
  isMain = false,
}: ThreeDViewerProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const animationRef = useRef<number | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    console.log("ThreeDViewer: Attempting to load model from:", modelUrl);

    // Add timeout for loading
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.error(
          "Loading timeout - GLB file may not exist or is too large"
        );
        setError("Loading timeout - Check if GLB file exists");
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    const initViewer = async () => {
      try {
        // Test if file exists with a simple fetch
        console.log("Testing file existence...");
        const testResponse = await fetch(modelUrl, { method: "HEAD" });
        console.log(
          "File test response:",
          testResponse.status,
          testResponse.statusText
        );

        if (!testResponse.ok) {
          throw new Error(
            `GLB file not found (${testResponse.status}): ${modelUrl}`
          );
        }

        // Scene setup
        const scene = new THREE.Scene();
        sceneRef.current = scene;
        scene.background = new THREE.Color(0xf8f9fa);

        // Camera setup
        const camera = new THREE.PerspectiveCamera(
          45,
          mountRef.current!.clientWidth / mountRef.current!.clientHeight,
          0.1,
          1000
        );
        cameraRef.current = camera;
        camera.position.set(0, 0, 5);

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
        });
        rendererRef.current = renderer;
        renderer.setSize(
          mountRef.current!.clientWidth,
          mountRef.current!.clientHeight
        );
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Set proper color space
        try {
          (
            renderer as THREE.WebGLRenderer & {
              outputColorSpace?: THREE.ColorSpace;
            }
          ).outputColorSpace = THREE.SRGBColorSpace;
          renderer.toneMapping = THREE.ACESFilmicToneMapping;
          renderer.toneMappingExposure = 1;
        } catch {
          console.log(
            "Using older Three.js version - color space settings skipped"
          );
        }

        mountRef.current!.appendChild(renderer.domElement);

        // Lighting setup
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0xffffff, 1);
        keyLight.position.set(5, 5, 5);
        keyLight.castShadow = true;
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
        fillLight.position.set(-5, 3, 2);
        scene.add(fillLight);

        // Load GLB model
        console.log("Starting GLB load...");
        const loader = new GLTFLoader();

        loader.load(
          modelUrl,
          (gltf) => {
            console.log("GLB loaded successfully! Model:", gltf);
            clearTimeout(loadingTimeout);

            const model = gltf.scene;
            modelRef.current = model;

            // Calculate bounding box
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());

            console.log("Model size:", size);
            console.log("Model center:", center);

            // Center the model
            model.position.sub(center);

            // Scale appropriately
            const maxDim = Math.max(size.x, size.y, size.z);
            if (maxDim > 0) {
              const scale = 2 / maxDim;
              model.scale.setScalar(scale);
              console.log("Applied scale:", scale);
            }

            // Enhance materials
            model.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;

                if (child.material) {
                  const material = child.material as THREE.MeshStandardMaterial;
                  if ("metalness" in material) material.metalness = 0.8;
                  if ("roughness" in material) material.roughness = 0.2;
                }
              }
            });

            scene.add(model);
            setLoading(false);
            setError(null);
            console.log("Model added to scene successfully");

            // Animation loop
            const animate = () => {
              if (
                !rendererRef.current ||
                !sceneRef.current ||
                !cameraRef.current
              )
                return;

              animationRef.current = requestAnimationFrame(animate);

              // Auto-rotate thumbnails
              if (!isMain && modelRef.current) {
                modelRef.current.rotation.y += 0.01;
              }

              rendererRef.current.render(sceneRef.current, cameraRef.current);
            };
            animate();
          },
          (progress) => {
            if (progress.total > 0) {
              const percent = (progress.loaded / progress.total) * 100;
              setLoadingProgress(percent);
              console.log(`Loading progress: ${percent.toFixed(1)}%`);
            } else {
              console.log("Loading progress:", progress.loaded, "bytes loaded");
            }
          },
          (error) => {
            console.error("GLB loading failed:", error);
            clearTimeout(loadingTimeout);
            setError(`Failed to load 3D model: ${error}`);
            setLoading(false);
          }
        );

        // Mouse controls for main viewer
        let isMouseDown = false;
        let previousMousePosition = { x: 0, y: 0 };

        const handleMouseDown = (event: MouseEvent) => {
          if (!isMain) return;
          isMouseDown = true;
          previousMousePosition = { x: event.clientX, y: event.clientY };
          if (mountRef.current) {
            mountRef.current.style.cursor = "grabbing";
          }
        };

        const handleMouseMove = (event: MouseEvent) => {
          if (!isMain || !isMouseDown || !modelRef.current) return;

          const deltaMove = {
            x: event.clientX - previousMousePosition.x,
            y: event.clientY - previousMousePosition.y,
          };

          modelRef.current.rotation.y += deltaMove.x * 0.01;
          modelRef.current.rotation.x += deltaMove.y * 0.01;

          // Clamp rotation
          modelRef.current.rotation.x = Math.max(
            -Math.PI / 2,
            Math.min(Math.PI / 2, modelRef.current.rotation.x)
          );

          previousMousePosition = { x: event.clientX, y: event.clientY };
        };

        const handleMouseUp = () => {
          isMouseDown = false;
          if (mountRef.current) {
            mountRef.current.style.cursor = "grab";
          }
        };

        const handleWheel = (event: WheelEvent) => {
          if (!isMain || !cameraRef.current) return;
          event.preventDefault();

          const scale = event.deltaY > 0 ? 1.1 : 0.9;
          cameraRef.current.position.multiplyScalar(scale);
          cameraRef.current.position.clampLength(2, 15);
        };

        if (isMain && mountRef.current) {
          mountRef.current.addEventListener("mousedown", handleMouseDown);
          mountRef.current.addEventListener("mousemove", handleMouseMove);
          mountRef.current.addEventListener("mouseup", handleMouseUp);
          mountRef.current.addEventListener("mouseleave", handleMouseUp);
          mountRef.current.addEventListener("wheel", handleWheel, {
            passive: false,
          });
          mountRef.current.style.cursor = "grab";
        }

        // Handle resize
        const handleResize = () => {
          if (!mountRef.current || !cameraRef.current || !rendererRef.current)
            return;

          const width = mountRef.current.clientWidth;
          const height = mountRef.current.clientHeight;

          cameraRef.current.aspect = width / height;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(width, height);
        };

        window.addEventListener("resize", handleResize);

        // Cleanup
        return () => {
          clearTimeout(loadingTimeout);
          window.removeEventListener("resize", handleResize);

          if (isMain && mountRef.current) {
            mountRef.current.removeEventListener("mousedown", handleMouseDown);
            mountRef.current.removeEventListener("mousemove", handleMouseMove);
            mountRef.current.removeEventListener("mouseup", handleMouseUp);
            mountRef.current.removeEventListener("mouseleave", handleMouseUp);
            mountRef.current.removeEventListener("wheel", handleWheel);
          }

          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
          }

          if (rendererRef.current) {
            rendererRef.current.dispose();
            if (mountRef.current?.contains(rendererRef.current.domElement)) {
              mountRef.current.removeChild(rendererRef.current.domElement);
            }
          }

          if (sceneRef.current) {
            sceneRef.current.clear();
          }
        };
      } catch (error) {
        console.error("ThreeDViewer initialization error:", error);
        clearTimeout(loadingTimeout);
        setError(`Initialization failed: ${(error as Error).message}`);
        setLoading(false);
      }
    };

    initViewer();
  }, [modelUrl, isMain]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
        <div className="text-center p-4">
          <div className="text-2xl mb-2">⚠️</div>
          <div className="font-semibold">3D Model Error</div>
          <div className="text-xs mt-2 text-red-600">{error}</div>
          <div className="text-xs mt-1 text-gray-600">{modelUrl}</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-blue-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <div className="text-sm text-blue-700 font-medium">
            Loading 3D Model...
          </div>
          {loadingProgress > 0 && (
            <div className="text-xs text-blue-600 mt-1">
              {loadingProgress.toFixed(0)}%
            </div>
          )}
          <div className="text-xs text-gray-600 mt-2">
            File: {modelUrl.split("/").pop()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden">
      <div ref={mountRef} className="w-full h-full" />

      {isMain && (
        <div className="absolute bottom-3 left-3 bg-black/70 text-white px-3 py-2 rounded-lg text-xs font-medium">
          🖱️ Drag to rotate • 🖱️ Scroll to zoom
        </div>
      )}

      {!isMain && (
        <div className="absolute top-2 right-2 bg-teal-500 text-white px-2 py-1 rounded-md text-[10px] font-bold shadow-lg">
          360°
        </div>
      )}
    </div>
  );
}
