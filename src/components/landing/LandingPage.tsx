import React from 'react';
import ScrollProvider from '../../hooks/ScrollProvider';
import Nav from './Nav';
import Loader from './Loader';
import Hero from './Hero';
import About from './About';
import Achievements from './Achivements';
import Work from './Work';
import Footer from './Footer';

export function LandingPage() {
  return (
    <ScrollProvider>
      <main className="bg-black text-white min-h-screen selection:bg-cyan-500/30 selection:text-white relative">
        <Nav />
        <Loader />
        <Hero />
        <About />
        <Achievements />
        <Work />
        <Footer />
      </main>
    </ScrollProvider>
  );
}

export default LandingPage;
