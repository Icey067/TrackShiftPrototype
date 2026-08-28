import React from 'react';
import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';
import { FeatureCards } from './FeatureCards';
import { Footer } from './Footer';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-carbon-base text-slate-200 data-grid selection:bg-kinetic-cyan/30 selection:text-white">
      <Navbar />
      <HeroSection />
      <FeatureCards />
      <Footer />
    </div>
  );
}
