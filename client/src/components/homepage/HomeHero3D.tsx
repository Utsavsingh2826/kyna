import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const TEXT_CYCLE_MS = 5000;

export default function HomeHero3D() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const animationRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);

  const [loaded, setLoaded] = useState(false);
  const [textPhase, setTextPhase] = useState(0);

  // Alternate the two hero texts on a timer (was scroll-driven before)
  useEffect(() => {
    const id = setInterval(
      () => setTextPhase((p) => (p === 0 ? 1 : 0)),
      TEXT_CYCLE_MS,
    );
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;
    const mount = mountRef.current;

    const W = mount.clientWidth || window.innerWidth;
    const H = mount.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfaf9f7);

    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
    camera.position.set(0, 0, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.8;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const key = new THREE.DirectionalLight(0xffffff, 2.0);
    key.position.set(4, 8, 6);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xfff8f0, 0.8);
    fill.position.set(-5, 3, 5);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffffff, 1.0);
    rim.position.set(0, 5, -5);
    scene.add(rim);
    const pt1 = new THREE.PointLight(0xffffff, 2.0, 20);
    pt1.position.set(3, 6, 5);
    scene.add(pt1);
    const pt2 = new THREE.PointLight(0xfff5e0, 1.5, 20);
    pt2.position.set(-4, 2, 6);
    scene.add(pt2);

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");
    dracoLoader.preload();
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      "https://cdn.kynajewels.com/RENDERING%20PHOTOS/SRAER/ENG1-10/ENG1-CUS-100-YG-360.glb",
      (gltf) => {
        const model = gltf.scene;

        model.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          const mat = child.material as THREE.MeshStandardMaterial;
          if (!mat) return;

          if (mat.metalness < 0.4) {
            child.material = new THREE.MeshPhysicalMaterial({
              color: new THREE.Color(0xeef6ff),
              metalness: 0,
              roughness: 0,
              ior: 2.42,
              clearcoat: 1.0,
              clearcoatRoughness: 0,
              envMapIntensity: 6.0,
              reflectivity: 1.0,
              specularIntensity: 2.0,
              specularColor: new THREE.Color(0xffffff),
            });
          } else {
            mat.metalness = Math.max(mat.metalness, 0.9);
            mat.roughness = Math.min(mat.roughness, 0.15);
            mat.envMapIntensity = 3.0;
            mat.needsUpdate = true;
          }
        });

        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3()).length();
        const center = box.getCenter(new THREE.Vector3());
        const scale = 6 / size;
        model.scale.setScalar(scale);
        model.position.copy(center).multiplyScalar(-scale);
        model.rotation.x = -0.15;
        scene.add(model);
        modelRef.current = model;
        dracoLoader.dispose();
        setLoaded(true);
      },
      undefined,
      (err) => { console.error("HomeHero3D load error:", err); dracoLoader.dispose(); }
    );

    // Mouse / touch drag rotation, like the product page viewer. Wheel is left
    // alone so the page scrolls normally down to the banner.
    let prev = { x: 0, y: 0 };

    const startDrag = (x: number, y: number) => {
      isDraggingRef.current = true;
      prev = { x, y };
      mount.style.cursor = "grabbing";
    };
    const moveDrag = (x: number, y: number) => {
      if (!isDraggingRef.current || !modelRef.current) return;
      const dx = x - prev.x;
      const dy = y - prev.y;
      modelRef.current.rotation.y += dx * 0.01;
      modelRef.current.rotation.x += dy * 0.01;
      modelRef.current.rotation.x = Math.max(
        -Math.PI / 2,
        Math.min(Math.PI / 2, modelRef.current.rotation.x),
      );
      prev = { x, y };
    };
    const endDrag = () => {
      isDraggingRef.current = false;
      mount.style.cursor = "grab";
    };

    const onMouseDown = (e: MouseEvent) => startDrag(e.clientX, e.clientY);
    const onMouseMove = (e: MouseEvent) => moveDrag(e.clientX, e.clientY);
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1)
        startDrag(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1)
        moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    };

    mount.style.cursor = "grab";
    mount.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", endDrag);
    mount.addEventListener("mouseleave", endDrag);
    mount.addEventListener("touchstart", onTouchStart, { passive: true });
    mount.addEventListener("touchmove", onTouchMove, { passive: true });
    mount.addEventListener("touchend", endDrag);

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      // Slow auto-rotate while the user is not dragging
      if (modelRef.current && !isDraggingRef.current) {
        modelRef.current.rotation.y += 0.004;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const nW = mount.clientWidth || window.innerWidth;
      const nH = mount.clientHeight || window.innerHeight;
      camera.aspect = nW / nH;
      camera.updateProjectionMatrix();
      renderer.setSize(nW, nH);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", endDrag);
      mount.removeEventListener("mousedown", onMouseDown);
      mount.removeEventListener("mouseleave", endDrag);
      mount.removeEventListener("touchstart", onTouchStart);
      mount.removeEventListener("touchmove", onTouchMove);
      mount.removeEventListener("touchend", endDrag);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      renderer.dispose();
      scene.clear();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        background: "#faf9f7",
        overflow: "hidden",
      }}
    >
      <div ref={mountRef} className="w-full h-full" />

      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-8 h-8 border-2 border-[#328F94] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Phase 1 — left; the two texts alternate on a timer */}
      <div
        className="absolute inset-0 flex flex-col justify-center pl-16 md:pl-24 pb-20 pointer-events-none transition-all duration-1000 ease-in-out"
        style={{
          opacity: textPhase === 0 ? 1 : 0,
          transform: textPhase === 0 ? "translateX(0)" : "translateX(-40px)",
        }}
      >
        <p className="text-[9px] tracking-[0.45em] uppercase text-[#328F94] mb-5">
          Kyna Jewels
        </p>
        <h1 className="text-5xl md:text-7xl font-light tracking-[0.18em] uppercase text-gray-800 leading-none">
          Crafted
        </h1>
        <h1 className="text-5xl md:text-7xl font-light tracking-[0.18em] uppercase text-gray-700 leading-none mt-2">
          with Love
        </h1>
      </div>

      {/* Phase 2 — right */}
      <div
        className="absolute inset-0 flex flex-col justify-center items-end pr-16 md:pr-24 pb-20 pointer-events-none transition-all duration-1000 ease-in-out"
        style={{
          opacity: textPhase === 1 ? 1 : 0,
          transform: textPhase === 1 ? "translateX(0)" : "translateX(40px)",
        }}
      >
        <p className="text-[9px] tracking-[0.45em] uppercase text-[#328F94] mb-5">
          Kyna Jewels
        </p>
        <h1 className="text-5xl md:text-7xl font-light tracking-[0.18em] uppercase text-gray-800 leading-none text-right">
          Love in Every
        </h1>
        <h1 className="text-5xl md:text-7xl font-light tracking-[0.18em] uppercase text-gray-700 leading-none mt-2 text-right">
          Milestone
        </h1>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
        <p className="text-[9px] tracking-[0.3em] uppercase text-gray-400">
          Scroll to explore
        </p>
        <div className="w-px h-8 bg-gray-300 animate-pulse" />
      </div>

      {loaded && (
        <div className="absolute top-6 right-6 text-[9px] tracking-[0.2em] uppercase text-[#328F94] border border-[#328F94]/40 px-3 py-1.5 pointer-events-none">
          360°
        </div>
      )}
    </div>
  );
}
