import { useEffect, useRef, useState } from "react";

interface ThreeDViewerProps {
  modelUrl: string;
  isMain?: boolean;
}

const IJEWEL_SCRIPT_SRC =
  "https://releases.ijewel3d.com/libs/mini-viewer/0.3.20/bundle.iife.js";

// Load the iJewel script once and share the promise across all viewer
// instances (same bundle ProductDetail preloads, so it may already be there).
let ijewelScriptPromise: Promise<void> | null = null;

function loadIjewelScript(): Promise<void> {
  if ((window as any).ijewelViewer) return Promise.resolve();
  if (ijewelScriptPromise) return ijewelScriptPromise;

  ijewelScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(
      `script[src="${IJEWEL_SCRIPT_SRC}"]`,
    ) as HTMLScriptElement | null;

    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load iJewel viewer script")),
      );
      return;
    }

    const script = document.createElement("script");
    script.src = IJEWEL_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      ijewelScriptPromise = null;
      reject(new Error("Failed to load iJewel viewer script"));
    };
    document.body.appendChild(script);
  });

  return ijewelScriptPromise;
}

export default function ThreeDViewer({
  modelUrl,
  isMain = false,
}: ThreeDViewerProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      setLoading(true);
      setError(null);

      try {
        await loadIjewelScript();
        if (cancelled || !mountRef.current) return;

        const ijewel = (window as any).ijewelViewer;
        if (!ijewel?.Viewer) {
          throw new Error("iJewel viewer not available");
        }

        mountRef.current.innerHTML = "";
        viewerRef.current = new ijewel.Viewer(
          mountRef.current,
          { modelUrl, basePath: "" },
          {
            showCard: false,
            showUiButtons: false,
            showLogo: false,
            showConfigurator: false,
          },
        );

        if (!cancelled) setLoading(false);
      } catch (err) {
        console.error("ThreeDViewer (iJewel) init error:", err);
        if (!cancelled) {
          setError((err as Error).message || "Failed to load 3D model");
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      cancelled = true;
      try {
        viewerRef.current?.dispose?.();
      } catch {
        // ignore dispose errors
      }
      viewerRef.current = null;
      if (mountRef.current) {
        mountRef.current.innerHTML = "";
      }
    };
  }, [modelUrl]);

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

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden">
      <div ref={mountRef} className="w-full h-full" />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-50 rounded-lg">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
            <div className="text-sm text-blue-700 font-medium">
              Loading 3D Model...
            </div>
            <div className="text-xs text-gray-600 mt-2">
              File: {modelUrl.split("/").pop()}
            </div>
          </div>
        </div>
      )}

      {isMain && !loading && (
        <div className="absolute bottom-3 left-3 bg-black/70 text-white px-3 py-2 rounded-lg text-xs font-medium">
          🖱️ Drag to rotate • 🖱️ Scroll to zoom
        </div>
      )}

      {!isMain && !loading && (
        <div className="absolute top-2 right-2 bg-teal-500 text-white px-2 py-1 rounded-md text-[10px] font-bold shadow-lg">
          360°
        </div>
      )}
    </div>
  );
}
