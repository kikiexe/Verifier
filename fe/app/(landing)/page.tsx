"use client";

import { GLOBAL_CSS } from "@/components/landing/landing-styles";
import LandingNavbar from "@/components/landing/LandingNavbar";
import HeroSection from "@/components/landing/HeroSection";
import MarqueeTicker from "@/components/landing/MarqueeTicker";
import AboutSection from "@/components/landing/AboutSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorks from "@/components/landing/HowItWorks";
import SecurityCallout from "@/components/landing/SecurityCallout";
import FaqSection from "@/components/landing/FaqSection";
import CtaSection from "@/components/landing/CtaSection";
import LandingFooter from "@/components/landing/LandingFooter";

export default function LandingPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <LandingNavbar />
      <HeroSection />
      <MarqueeTicker />
      <AboutSection />
      <FeaturesSection />
      <HowItWorks />
      <SecurityCallout />
      <FaqSection />
      <CtaSection />
      <LandingFooter />
    </>
  );
}