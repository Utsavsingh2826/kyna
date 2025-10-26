// import React from "react";
// import HeroSection from "../components/homepage/HeroSection";
// import SalesSection from "../components/homepage/SalesSection";
// import EngravingSection from "@/components/homepage/EngravingSection";
// import CollectionsSection from "@/components/homepage/CollectionsItem";
// import DesignBanner from "@/components/homepage/DesignBanner";

// const HomePage: React.FC = () => {
//   return (
//     <main>
//       <HeroSection />
//       <SalesSection />
//       <EngravingSection />
//       <DesignBanner />
//       <CollectionsSection />
//     </main>
//   );
// };

// export default HomePage;



import React, { useEffect } from "react";

const IjewelViewer: React.FC = () => {
  useEffect(() => {
    // Create script element to load iJewel viewer SDK
    const script = document.createElement("script");
    script.src = "https://releases.ijewel3d.com/libs/mini-viewer/0.3.20/bundle.iife.js";
    script.async = true;

    script.onload = () => {
      const container = document.getElementById("ijewel-viewer-container");
      if (!container) return;

      // Project configuration with local GLB file path relative to public folder
      const project = {
        modelUrl: "https://demo-assets.pixotronics.com/pixo/gltf/jewlr1.glb",
        basePath: "",
      };

      // Viewer configuration options
      const viewerOptions = {
        showUiButtons: false,
        showLogo: false,
        showCard: false,
        showSwitchNodes: false,
      };

      // Initialize the iJewel Viewer on the container element
      new window.ijewelViewer.Viewer(container, project, viewerOptions);
    };

    document.body.appendChild(script);

    // Cleanup script on unmount
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Set container size explicitly to avoid zero size framebuffer errors
  return <div id="ijewel-viewer-container" style={{ width: "100vw", height: "100vh" }} />;
};

export default IjewelViewer;
