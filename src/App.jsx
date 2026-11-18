import { useState } from 'react';
import SmoothScroll from './components/layout/SmoothScroll';
import Preloader from './components/layout/Preloader';
import CursorGlow from './components/layout/CursorGlow';
import ErrorBoundary from './components/layout/ErrorBoundary';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import MobileActions from './components/layout/MobileActions';
import { BookingDateProvider } from './lib/bookingDate';

import Hero from './components/sections/Hero';
import Marquee from './components/sections/Marquee';
import About from './components/sections/About';
import Stats from './components/sections/Stats';
import WhyUs from './components/sections/WhyUs';
import Gallery from './components/sections/Gallery';
import Occasions from './components/sections/Occasions';
import Testimonials from './components/sections/Testimonials';
import Availability from './components/sections/Availability';
import Contact from './components/sections/Contact';
import MapSection from './components/sections/MapSection';

export default function App() {
  const [ready, setReady] = useState(false);

  return (
    <SmoothScroll>
      <Preloader onDone={() => setReady(true)} />
      <ErrorBoundary silent>
        <CursorGlow />
      </ErrorBoundary>
      <a
        href="#main"
        className="fixed left-3 top-3 z-[9000] -translate-y-20 rounded bg-gold-glow px-4 py-2 text-sm font-semibold text-green-950 focus:translate-y-0"
      >
        Skip to content
      </a>
      <Navbar />

      <main id="main">
        <Hero ready={ready} />
        <Marquee />
        <About />
        <Stats />
        <WhyUs />
        <Gallery />
        <Occasions />
        <Testimonials />
        <BookingDateProvider>
          <Availability />
          <Contact />
        </BookingDateProvider>
        <MapSection />
      </main>

      <Footer />
      <MobileActions />
    </SmoothScroll>
  );
}
