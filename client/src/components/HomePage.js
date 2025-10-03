import React from "react";
import HeroSection from "./sections/HeroSection";
import PricingSection from "./sections/PricingSection";
import EnhancedTestimonials from "./EnhancedTestimonials";
import SocialProof from "./SocialProof";
import StudentProfiles from "./sections/StudentProfiles";
import HowItWorksSection from "./sections/HowItWorksSection";
import FAQSection from "./sections/FAQSection";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";
import Header from "./Header";

const HomePage = () => {
  return (
    <div className="homepage">
      <Header />
      <HeroSection />
      <PricingSection />
      <SocialProof />
      <StudentProfiles />
      <EnhancedTestimonials />
      <HowItWorksSection />
      <FAQSection />
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default HomePage;
