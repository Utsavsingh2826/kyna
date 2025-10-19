import React from "react";
import HeroSection from "../components/homepage/HeroSection";
import SalesSection from "../components/homepage/SalesSection";
import EngravingSection from "@/components/homepage/EngravingSection";
import CollectionsSection from "@/components/homepage/CollectionsItem";
import DesignBanner from "@/components/homepage/DesignBanner";

const HomePage: React.FC = () => {
  return (
    <main>
      <HeroSection />
      <SalesSection />
      <EngravingSection />
      <DesignBanner />
      <CollectionsSection />
    </main>
  );
};

export default HomePage;
