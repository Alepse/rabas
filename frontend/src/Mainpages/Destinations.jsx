import React, { useState, useEffect, lazy, Suspense, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Spinner } from '@nextui-org/react';
import Nav from '../components/nav';
import Footer from '../components/Footer';
import Hero from '../components/herodestination';
import Search from '@/components/Search';
import wave from '@/assets/wave2.webp';
import { MdOutlineKeyboardArrowRight } from 'react-icons/md';
import EmergencyHotlines from '../Mainpages/DestinationsSectioncomponent/EmergencyHotlines';


// Assets
import bulusan from '../assets/bulusan-destination.webp';
import bulan from '../assets/bulan.webp';
import barcelona from '../assets/barcelona.webp';
import casiguran from '../assets/casiguran.webp';
import castilla from '../assets/castilla.webp';
import donsol from '../assets/donsol.webp';
import gubat from '../assets/gubatpic4.webp';
import irosin from '../assets/irosin.webp';
import juban from '../assets/juban.webp';
import magallanes from '../assets/magallanes.webp';
import matnog from '../assets/matnog.webp';
import pilar from '../assets/pilar.webp';
import prieto from '../assets/prieto.webp';
import santa from '../assets/santa.webp';
import Sorso from '../assets/sorsogon city.webp';

// Lazy-loaded destination components
const destinationComponents = {
  Bulusan: lazy(() => import('./DestinationsSectioncomponent/Bulusan')),
  Bulan: lazy(() => import('./DestinationsSectioncomponent/Bulan')),
  Barcelona: lazy(() => import('./DestinationsSectioncomponent/Barcelona')),
  Casiguran: lazy(() => import('./DestinationsSectioncomponent/Casiguran')),
  Castilla: lazy(() => import('./DestinationsSectioncomponent/Castilla')),
  Donsol: lazy(() => import('./DestinationsSectioncomponent/Donsol')),
  Gubat: lazy(() => import('./DestinationsSectioncomponent/Gubat')),
  Irosin: lazy(() => import('./DestinationsSectioncomponent/Irosin')),
  Juban: lazy(() => import('./DestinationsSectioncomponent/Juban')),
  Magallanes: lazy(() => import('./DestinationsSectioncomponent/Magallanes')),
  Matnog: lazy(() => import('./DestinationsSectioncomponent/Matnog')),
  Pilar: lazy(() => import('./DestinationsSectioncomponent/Pilar')),
  PrietoDiaz: lazy(() => import('./DestinationsSectioncomponent/PrietoDiaz')),
  StaMagdalena: lazy(() => import('./DestinationsSectioncomponent/StaMagdalena')),
  Sorsogon: lazy(() => import('./DestinationsSectioncomponent/Sorsogon')),
};

const Destinations = () => {
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
    const handleScroll = () => setShowButton(window.scrollY > 200);
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
      <Suspense fallback={<Spinner size="lg" label="Loading destination..." color="primary" className="flex justify-center items-center h-20" />}>
        <DestinationComponent />
      </Suspense>
    );
  };

  const municipalities = [
    { id: 1, name: 'Barcelona', value: 'Barcelona', img: barcelona },
    { id: 2, name: 'Bulan', value: 'Bulan', img: bulan },
    { id: 3, name: 'Bulusan', value: 'Bulusan', img: bulusan },
    { id: 4, name: 'Casiguran', value: 'Casiguran', img: casiguran },
    { id: 5, name: 'Castilla', value: 'Castilla', img: castilla },
    { id: 6, name: 'Donsol', value: 'Donsol', img: donsol },
    { id: 7, name: 'Gubat', value: 'Gubat', img: gubat },
    { id: 8, name: 'Irosin', value: 'Irosin', img: irosin },
    { id: 9, name: 'Juban', value: 'Juban', img: juban },
    { id: 10, name: 'Magallanes', value: 'Magallanes', img: magallanes },
    { id: 11, name: 'Matnog', value: 'Matnog', img: matnog },
    { id: 12, name: 'Pilar', value: 'Pilar', img: pilar },
    { id: 13, name: 'Prieto Diaz', value: 'PrietoDiaz', img: prieto },
    { id: 14, name: 'Sta. Magdalena', value: 'StaMagdalena', img: santa },
    { id: 15, name: 'Sorsogon', value: 'Sorsogon', img: Sorso },
  ];

  return (
    <div className="mx-auto min-h-screen bg-light font-sans" style={{ backgroundImage: `url(${wave})`, backgroundSize: 'auto', backgroundRepeat: 'repeat', backgroundPosition: 'center' }}>
      <Nav />
      <AnimatedSection>
        <Hero />
      </AnimatedSection>
      <AnimatedSection>
        <Search />
      </AnimatedSection>
      <div className="container w-full flex justify-start mx-auto overflow-x-auto scrollbar-custom scrollbar-hide mb-4">
        <nav className="text-sm text-gray-500 whitespace-nowrap">
          <ol className="list-none p-0 inline-flex">
            <li className="flex items-center">
              <Link to="/" className="hover:text-color1 truncate">Home</Link>
              <span className="mx-2"><MdOutlineKeyboardArrowRight /></span>
            </li>
            <li className="flex items-center">
              <Link to="/destinations" className="hover:text-color1 truncate">Destination</Link>
            </li>
            <li className="flex items-center text-gray-700 truncate">
              <span className="mx-2"><MdOutlineKeyboardArrowRight /></span>
              <p className="truncate">{initialDestination}</p>
            </li>
          </ol>
        </nav>
      </div>
      <div className="mt-4 mx-auto w-full container">
        <div ref={destinationSectionRef}>
          {renderDestinationSection()}
        </div>
      </div>
      <div className="p-6 mb-3 container mx-auto">
        <h1 className="font-semibold text-2xl">Discover the Beauty of Sorsogon</h1>
      </div>
      <div className="container mx-auto mb-3 grid grid-cols-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {municipalities.map(({ id, name, value, img }) => (
          <AnimatedSection key={id}>
            <div
              className="relative h-[100px] md:h-[200px] w-full border-2 hover:shadow-lg transition-transform duration-300 transform hover:scale-105 cursor-pointer"
              onClick={() => handleDestinationClick(value)}
            >
              <img className="h-full w-full object-cover rounded-sm shadow-md" src={img} alt={name} />
              <div className="absolute bottom-0 left-0 right-0 bg-dark/60 text-white rounded-lg p-1 text-md text-center w-full">
                {name}
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>
      {!selectedDestination && (
        <AnimatedSection>
          <EmergencyHotlines />
        </AnimatedSection>
      )}
      <Footer />
      {showButton && (
        <motion.button
          className="fixed bottom-5 right-2 p-3 rounded-full shadow-lg z-10"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatType: 'loop' }}
          style={{
            background: 'linear-gradient(135deg, #688484 0%, #092635 100%)',
            color: 'white',
          }}
        >
          ↑
        </motion.button>
      )}
    </div>
  );
};

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
      initial={{ opacity: 0, y: 50 }}
      animate={controls}
    >
      {children}
    </motion.div>
  );
};

export default Destinations;
