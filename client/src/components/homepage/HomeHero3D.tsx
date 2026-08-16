import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export default function HomeHero3D() {
  const spacerRef = useRef<HTMLDivElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const overlay1Ref = useRef<HTMLDivElement>(null);
  const overlay2Ref = useRef<HTMLDivElement>(null);
  const scrollCueRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const animationRef = useRef<number | null>(null);
  const scrollYRef = useRef(0);

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;
    const mount = mountRef.current;

    const W = window.innerWidth;
    const H = window.innerHeight;

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

    const onScroll = () => {
      scrollYRef.current = window.scrollY || document.documentElement.scrollTop || 0;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("scroll", onScroll, { passive: true });

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      const spacer = spacerRef.current;
      const wrap   = canvasWrapRef.current;

      if (spacer && wrap) {
        // offsetTop = absolute Y from document top, unaffected by sticky nav
        const spacerTop   = spacer.offsetTop;
        const spacerH     = spacer.offsetHeight;
        const vph         = window.innerHeight;
        const totalScroll = spacerH - vph;
        const scrollY     = window.scrollY || document.documentElement.scrollTop || scrollYRef.current;
        const relScroll   = scrollY - spacerTop;

        const inSection = relScroll > -vph && relScroll < spacerH;
        wrap.style.display = inSection ? "block" : "none";

        if (inSection && totalScroll > 0) {
          const progress = Math.max(0, Math.min(1, relScroll / totalScroll));

          if (modelRef.current) {
            modelRef.current.rotation.y = progress * Math.PI;
          }

          if (overlay1Ref.current) {
            const op1 = progress < 0.5 ? Math.max(0, 1 - progress * 2) : 0;
            overlay1Ref.current.style.opacity = String(op1);
            overlay1Ref.current.style.transform = `translateX(${progress * 80}px)`;
          }

          if (overlay2Ref.current) {
            const op2 = progress < 0.5 ? 0 : Math.min(1, (progress - 0.5) * 6);
            const tx2 = progress < 0.5 ? 40 : Math.max(0, 40 - (progress - 0.5) * 80);
            overlay2Ref.current.style.opacity = String(op2);
            overlay2Ref.current.style.transform = `translateX(${tx2}px)`;
          }

          if (scrollCueRef.current) {
            scrollCueRef.current.style.opacity = String(Math.max(0, 1 - progress * 10));
          }
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const nW = window.innerWidth;
      const nH = window.innerHeight;
      camera.aspect = nW / nH;
      camera.updateProjectionMatrix();
      renderer.setSize(nW, nH);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      renderer.dispose();
      scene.clear();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <>
      <div ref={spacerRef} style={{ height: "300vh" }} />

      <div
        ref={canvasWrapRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100vh",
          zIndex: 10,
          background: "#faf9f7",
          pointerEvents: "none",
        }}
      >
        <div ref={mountRef} className="w-full h-full" />

        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#328F94] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Phase 1 — left, fades out at 90° */}
        <div
          ref={overlay1Ref}
          className="absolute inset-0 flex flex-col justify-center pl-16 md:pl-24 pb-20"
          style={{ transformOrigin: "left center" }}
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

        {/* Phase 2 — right, appears at 90° */}
        <div
          ref={overlay2Ref}
          className="absolute inset-0 flex flex-col justify-center items-end pr-16 md:pr-24 pb-20"
          style={{ opacity: 0, transform: "translateX(40px)", transformOrigin: "right center" }}
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

        <div
          ref={scrollCueRef}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <p className="text-[9px] tracking-[0.3em] uppercase text-gray-400">
            Scroll to explore
          </p>
          <div className="w-px h-8 bg-gray-300 animate-pulse" />
        </div>

        {loaded && (
          <div className="absolute top-6 right-6 text-[9px] tracking-[0.2em] uppercase text-[#328F94] border border-[#328F94]/40 px-3 py-1.5">
            180°
          </div>
        )}
      </div>
    </>
  );
}
