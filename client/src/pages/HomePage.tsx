import React from "react";
import HeroSection from "../components/homepage/HeroSection";
import SalesSection from "../components/homepage/SalesSection";
import EngravingSection from "@/components/homepage/EngravingSection";
import CollectionsSection from "@/components/homepage/CollectionsItem";
import DesignBanner from "@/components/homepage/DesignBanner";
import HomeHero3D from "@/components/homepage/HomeHero3D";

const HomePage: React.FC = () => {
  return (
    <main>
      <HomeHero3D />
      {/* z-index 20 ensures these always paint over the fixed 3D canvas (z-index 10) */}
      <div style={{ position: "relative", zIndex: 20, background: "#fff" }}>
        <HeroSection />
        <SalesSection />
        <DesignBanner />
        <EngravingSection />
        <CollectionsSection />
      </div>
    </main>
  );
};

export default HomePage;
