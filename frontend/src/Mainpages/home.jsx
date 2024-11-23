import React, { useState, useEffect } from 'react';  
import Nav from '../components/nav';
import Hero from '../components/hero';
import Footer from '../components/Footer';
import Search from '../components/Search';
import { Spinner } from '@nextui-org/react';
import DestinationSection from './HomePageSections/DestinationSection';
import BusinessSection from './HomePageSections/BusinessSection';
import PlanTripSection from './HomePageSections/PlanTripSection';
import AboutSection from './HomePageSections/AboutSection';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import wave from '@/assets/wave2.webp'

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [showButton, setShowButton] = useState(false);

  // Title Tab
  useEffect(() => {
    document.title = 'RabaSorsogon | Home';
  }, []);

  useEffect(() => {
    // Simulate data fetching
    setTimeout(() => setLoading(false), 1000);

    // Show button when scrolled down
    const handleScroll = () => {
      setShowButton(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return <Spinner className='flex justify-center items-center h-screen' size='lg' label="Loading..." color="primary" />;
  }

  return (  
    <div className='mx-auto min-h-screen bg-light font-sans'style={{ backgroundImage: `url(${wave})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}>
      <Nav />
      
      {/* Hero Section */}
      <AnimatedSection>
        <Hero />
      </AnimatedSection>
      
      {/* Search Section */}
      <AnimatedSection>
        <Search />
      </AnimatedSection>

      {/* Destination Section */}
      <AnimatedSection>
        <DestinationSection />
      </AnimatedSection>

      {/* Business Section */}
     
      
        <AnimatedSection>
          <BusinessSection />
        </AnimatedSection>
  
      {/* Plan Trip Section */}
      <AnimatedSection>
        <PlanTripSection />
      </AnimatedSection>

      {/* About Section */}
      <AnimatedSection>
        <AboutSection />
      </AnimatedSection>

      {/* Footer */}
      <Footer />

      {/* Scroll-to-Top Button */}
      {showButton && (
        <motion.button
          className="fixed bottom-5 right-2 p-3 rounded-full shadow-lg z-10"
          onClick={scrollToTop}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatType: "loop" }}
          style={{
            background: 'linear-gradient(135deg, #688484  0%, #092635 100%)',
            color: 'white',
          }}
        >
          ↑
        </motion.button>
      )}
    </div>  
  );  
};  

// Separate AnimatedSection component to handle the animation logic for each section
const AnimatedSection = ({ children }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });

  useEffect(() => {
    if (inView) {
      controls.start({ opacity: 1, y: 0, transition: { duration: 0.8 } });
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={controls}
    >
      {children}
    </motion.div>
  );
};

export default Home;
