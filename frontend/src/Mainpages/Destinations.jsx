import React, { useState, useEffect, lazy, Suspense, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Nav from '../components/nav';
import Footer from '../components/Footer';
import Hero from '../components/herodestination';
import Search from '@/components/Search';
import { Spinner } from '@nextui-org/react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import bulusan from '../assets/bulusan-destination.jpg';
import bulan from '../assets/bulan.webp';
import barcelona from '../assets/barcelona.jpg';
import casiguran from '../assets/casiguran.jpg';
import castilla from '../assets/castilla.jpg';
import donsol from '../assets/donsol.jpg';
import gubat from '../assets/gubatpic4.jpg';
import irosin from '../assets/irosin.jpg';
import juban from '../assets/juban.jpg';
import magallanes from '../assets/magallanes.jpg';
import matnog from '../assets/matnog.webp';
import pilar from '../assets/pilar.jpg';
import prieto from '../assets/prieto.jpg';
import santa from '../assets/santa.jpg';
import Sorso from '../assets/sorsogon city.jpg';
import Bulusan from './DestinationsSectioncomponent/Bulusan';
import Bulan from './DestinationsSectioncomponent/Bulan';
import Barcelona from './DestinationsSectioncomponent/Barcelona';
import Casiguran from './DestinationsSectioncomponent/Casiguran';
import Castilla from './DestinationsSectioncomponent/Castilla';
import Donsol from './DestinationsSectioncomponent/Donsol';
import Gubat from './DestinationsSectioncomponent/Gubat';
import Irosin from './DestinationsSectioncomponent/Irosin';
import Juban from './DestinationsSectioncomponent/Juban';
import Magallanes from './DestinationsSectioncomponent/Magallanes';
import Matnog from './DestinationsSectioncomponent/Matnog';
import Pilar from './DestinationsSectioncomponent/Pilar';
import PrietoDiaz from './DestinationsSectioncomponent/PrietoDiaz';
import StaMagdalena from './DestinationsSectioncomponent/StaMagdalena';
import Sorsogon from './DestinationsSectioncomponent/Sorsogon';
import EmergencyHotlines from '../Mainpages/DestinationsSectioncomponent/EmergencyHotlines';
import wave from '@/assets/wave2.webp'

const destinationComponents = {
  Bulusan,
  Bulan,
  Barcelona,
  Casiguran,
  Castilla,
  Donsol,
  Gubat,
  Irosin,
  Juban,
  Magallanes,
  Matnog,
  Pilar,
  PrietoDiaz,
  StaMagdalena,
  Sorsogon,
};

const Destinations = () => {
  const [loading, setLoading] = useState(true);
  const [showButton, setShowButton] = useState(false);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialDestination = queryParams.get('name');
  const [selectedDestination, setSelectedDestination] = useState(initialDestination);
  const destinationSectionRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'RabaSorsogon | Destinations';
  }, []);

  useEffect(() => {
    const loadTimer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(loadTimer);
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowButton(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setSelectedDestination(initialDestination);
  }, [location.search]);

  useEffect(() => {
    if (selectedDestination && destinationSectionRef.current) {
      destinationSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedDestination]);

  const handleDestinationClick = (destination) => {
    setSelectedDestination(destination);
    navigate(`?name=${destination}`);
  };

  const renderDestinationSection = () => {
    if (!selectedDestination) return null;
    const DestinationComponent = destinationComponents[selectedDestination];
    if (!DestinationComponent) return null;
    return (
      <Suspense fallback={<Spinner size='lg' label="Loading destination..." color="primary" className='flex justify-center items-center h-20' />}>
        <DestinationComponent />
      </Suspense>
    );
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

      <AnimatedSection>
        <Search />
      </AnimatedSection>


      {/* Main content */}
      <div className='mt-4 mx-auto w-full container'>
        <div className='p-4 mb-4'>
          <h1 className='font-semibold text-2xl'>Discover the Beauty of Sorsogon</h1>
        </div>

        {/* Municipalities grid */}
        <div className='bg-color3 text-sm grid grid-cols-1 sm:grid-cols-2 font-font1 md:grid-cols-4 lg:grid-cols-5 gap-4'>
          {[
            { name: 'Bulusan', img: bulusan },
            { name: 'Bulan', img: bulan },
            { name: 'Barcelona', img: barcelona },
            { name: 'Casiguran', img: casiguran },
            { name: 'Castilla', img: castilla },
            { name: 'Donsol', img: donsol },
            { name: 'Gubat', img: gubat },
            { name: 'Irosin', img: irosin },
            { name: 'Juban', img: juban },
            { name: 'Magallanes', img: magallanes },
            { name: 'Matnog', img: matnog },
            { name: 'Pilar', img: pilar },
            { name: 'PrietoDiaz', img: prieto },
            { name: 'StaMagdalena', img: santa },
            { name: 'Sorsogon', img: Sorso },
          ].map(({ name, img }) => (
            <AnimatedSection key={name}>
              <div
                className="relative h-[200px] w-full border-2 hover:shadow-lg transition-transform duration-300 transform hover:scale-105 cursor-pointer"
                onClick={() => handleDestinationClick(name)}
              >
                <img className="h-full w-full object-cover rounded-sm shadow-md" src={img} alt={name} />
                <div className="absolute bottom-0 left-0 right-0 bg-dark/60 text-white rounded-lg p-1 text-md text-center w-full">
                  {name}
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
     

        {/* Selected destination section */}
        <div ref={destinationSectionRef}>
          {renderDestinationSection()}
        </div>
      </div>

         {/* Emergency Hotlines Section */}
         <AnimatedSection>
        <EmergencyHotlines />
      </AnimatedSection>

      <Footer />

      {/* Scroll-to-top button */}
      {showButton && (
        <motion.button
          className="fixed bottom-5 right-2 p-3 rounded-full shadow-lg z-10"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
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

// AnimatedSection component to apply entry animations
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

export default Destinations;
