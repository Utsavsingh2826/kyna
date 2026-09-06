import React from "react";
import HeroSection from "../components/homepage/HeroSection";
import SalesSection from "../components/homepage/SalesSection";
import EngravingSection from "@/components/homepage/EngravingSection";
import CollectionsSection from "@/components/homepage/CollectionsItem";
import DesignBanner from "@/components/homepage/DesignBanner";
import SEO from "@/components/SEO";

const HomePage: React.FC = () => {
  return (
    <main>
      <SEO
        title="Kyna Jewels | Fine Jewellery Collection"
        description="Explore our exquisite collection of fine jewellery. From rings and earrings to pendants and bracelets, find your perfect sparkle at Kyna."
        canonical="/"
      />
      <HeroSection />
      <SalesSection />
      <DesignBanner />
      <EngravingSection />
      <CollectionsSection />
    </main>
  );
};

export default HomePage;
