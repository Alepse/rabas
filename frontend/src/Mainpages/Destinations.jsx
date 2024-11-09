import React, { useState, useEffect, lazy, Suspense, useRef } from 'react'
import Nav from '../components/nav'
import Footer from '../components/Footer'
import Hero from '../components/herodestination'
import bulusan from '../assets/bulusan-destination.jpg'
import bulan from '../assets/bulan.webp'
import barcelona from '../assets/barcelona.jpg'
import casiguran from '../assets/casiguran.jpg'
import castilla from '../assets/castilla.jpg'
import donsol from '../assets/donsol.jpg'
import gubat from '../assets/gubatpic4.jpg'
import irosin from '../assets/irosin.jpg'
import juban from '../assets/juban.jpg'
import magallanes from '../assets/magallanes.jpg'
import matnog from '../assets/matnog.webp'
import pilar from '../assets/pilar.jpg'
import prieto from '../assets/prieto.jpg'
import santa from '../assets/santa.jpg'
import Sorso from '../assets/sorsogon city.jpg'
import Search from '@/components/Search';
import { Spinner } from '@nextui-org/react'; // Add this import
import { motion } from 'framer-motion'; // Import Framer Motion
import { useLocation } from 'react-router-dom'; // Import useLocation
import Bulusan from './DestinationsSectioncomponent/Bulusan.jsx';
import Bulan from './DestinationsSectioncomponent/Bulan.jsx';
import Barcelona from './DestinationsSectioncomponent/Barcelona.jsx';
import Casiguran from './DestinationsSectioncomponent/Casiguran.jsx';
import Castilla from './DestinationsSectioncomponent/Castilla.jsx';
import Donsol from './DestinationsSectioncomponent/Donsol.jsx';
import Gubat from './DestinationsSectioncomponent/Gubat.jsx';
import Irosin from './DestinationsSectioncomponent/Irosin.jsx';
import Juban from './DestinationsSectioncomponent/Juban.jsx';
import Magallanes from './DestinationsSectioncomponent/Magallanes.jsx';
import Matnog from './DestinationsSectioncomponent/Matnog.jsx';
import Pilar from './DestinationsSectioncomponent/Pilar.jsx';
import PrietoDiaz from './DestinationsSectioncomponent/PrietoDiaz.jsx';
import StaMagdalena from './DestinationsSectioncomponent/StaMagdalena.jsx';
import Sorsogon from './DestinationsSectioncomponent/Sorsogon.jsx';



const Destinations = () => {

  const [showButton, setShowButton] = useState(false); // State to show/hide button


  const [loading, setLoading] = useState(true);

     // Title Tab
     useEffect(() => {
      document.title = 'RabaSorsogon | Destinations';
    });
  

    useEffect(() => {

      // Simulate data fetching
      setTimeout(() => setLoading(false), 1000);

      // Show button when scrolled down
      const handleScroll = () => {
        if (window.scrollY > 300) {
          setShowButton(true);
        } else {
          setShowButton(false);
        }
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);
  
    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialDestination = queryParams.get('name');

  const [selectedDestination, setSelectedDestination] = useState(initialDestination);
  const destinationSectionRef = useRef(null); // Create a ref for the destination section

  useEffect(() => {
    if (initialDestination) {
      setSelectedDestination(initialDestination);
    }
  }, [initialDestination]);

  useEffect(() => {
    if (selectedDestination && destinationSectionRef.current) {
      destinationSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedDestination]); // Scroll to the section when selectedDestination changes

  const handleDestinationClick = (destination) => {
    setSelectedDestination(destination);
  };

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
    <div className='mx-auto min-h-screen bg-light font-sans'>
      <div>
      <Nav/>
      </div>

      {/** hero */}
      <div>
        <Hero/>
      </div>

      <Search/>

  
    {/** Contents */}
<div className=' mt-4  mx-auto w-full container '>
  <div className='  p-4 mb-4  '>
    <h1 className='font-semibold text-2xl'>Discover the Beauty of Sorsogon</h1>
 
  </div>

  
   {/** Municipalities */}
<div className='bg-color3 text-sm grid grid-cols-1 sm:grid-cols-2 font-font1 md:grid-cols-4 lg:grid-cols-5 gap-4'>
  <div className="relative h-[200px] w-full border-2 hover:shadow-lg transition-transform duration-300 transform hover:scale-105 cursor-pointer" onClick={() => handleDestinationClick('Bulusan')}>
    <img
      className="h-full w-full object-cover rounded-sm shadow-md"
      src={bulusan}
      alt="Bulusan"
    />
    <div className="absolute bottom-0 left-0 right-0 bg-dark/60 text-white rounded-lg p-1 text-md text-center w-full">Bulusan</div>
  </div>
  <div className="relative h-[200px] w-full border-2 hover:shadow-lg transition-transform duration-300 transform hover:scale-105 cursor-pointer" onClick={() => handleDestinationClick('Bulan')}>
    <img
      className="h-full w-full object-cover rounded-sm shadow-md"
      src={bulan}
      alt="Bulan"
    />
    <div className="absolute bottom-0 left-0 right-0 bg-dark/60 text-white rounded-lg p-1 text-md text-center w-full">Bulan</div>
  </div>
  <div className="relative h-[200px] w-full border-2 hover:shadow-lg transition-transform duration-300 transform hover:scale-105 cursor-pointer" onClick={() => handleDestinationClick('Barcelona')}>
    <img
      className="h-full w-full object-cover rounded-sm shadow-md"
      src={barcelona}
      alt="Barcelona"
    />
    <div className="absolute bottom-0 left-0 right-0 bg-dark/60 text-white rounded-lg p-1 text-md text-center w-full">Barcelona</div>
  </div>
  <div className="relative h-[200px] w-full border-2 hover:shadow-lg transition-transform duration-300 transform hover:scale-105 cursor-pointer" onClick={() => handleDestinationClick('Casiguran')}>
    <img
      className="h-full w-full object-cover rounded-sm shadow-md"
      src={casiguran}
      alt="Casiguran"
    />
    <div className="absolute bottom-0 left-0 right-0 bg-dark/60 text-white rounded-lg p-1 text-md text-center w-full">Casiguran</div>
  </div>
  <div className="relative h-[200px] w-full border-2 hover:shadow-lg transition-transform duration-300 transform hover:scale-105 cursor-pointer" onClick={() => handleDestinationClick('Castilla')}>
    <img
      className="h-full w-full object-cover rounded-sm shadow-md"
      src={castilla}
      alt="Castilla"
    />
    <div className="absolute bottom-0 left-0 right-0 bg-dark/60 text-white rounded-lg p-1 text-md text-center w-full">Castilla</div>
  </div>
  <div className="relative h-[200px] w-full border-2 hover:shadow-lg transition-transform duration-300 transform hover:scale-105 cursor-pointer" onClick={() => handleDestinationClick('Donsol')}>
    <img
      className="h-full w-full object-cover rounded-sm shadow-md"
      src={donsol}
      alt="Donsol"
    />
    <div className="absolute bottom-0 left-0 right-0 bg-dark/60 text-white rounded-lg p-1 text-md text-center w-full">Donsol</div>
  </div>
  <div className="relative h-[200px] w-full border-2 hover:shadow-lg transition-transform duration-300 transform hover:scale-105 cursor-pointer" onClick={() => handleDestinationClick('Gubat')}>
    <img
      className="h-full w-full object-cover rounded-sm shadow-md"
      src={gubat}
      alt="Gubat"
    />
    <div className="absolute bottom-0 left-0 right-0 bg-dark/60 text-white rounded-lg p-1 text-md text-center w-full">Gubat</div>
  </div>
  <div className="relative h-[200px] w-full border-2 hover:shadow-lg transition-transform duration-300 transform hover:scale-105 cursor-pointer" onClick={() => handleDestinationClick('Irosin')}>
    <img
      className="h-full w-full object-cover rounded-sm shadow-md"
      src={irosin}
      alt="Irosin"
    />
    <div className="absolute bottom-0 left-0 right-0 bg-dark/60 text-white rounded-lg p-1 text-md text-center w-full">Irosin</div>
  </div>
  <div className="relative h-[200px] w-full border-2 hover:shadow-lg transition-transform duration-300 transform hover:scale-105 cursor-pointer" onClick={() => handleDestinationClick('Juban')}>
    <img
      className="h-full w-full object-cover rounded-sm shadow-md"
      src={juban}
      alt="Juban"
    />
    <div className="absolute bottom-0 left-0 right-0 bg-dark/60 text-white rounded-lg p-1 text-md text-center w-full">Juban</div>
  </div>
  <div className="relative h-[200px] w-full border-2 hover:shadow-lg transition-transform duration-300 transform hover:scale-105 cursor-pointer" onClick={() => handleDestinationClick('Magallanes')}>
    <img
      className="h-full w-full object-cover rounded-sm shadow-md"
      src={magallanes}
      alt="Magallanes"
    />
    <div className="absolute bottom-0 left-0 right-0 bg-dark/60 text-white rounded-lg p-1 text-md text-center w-full">Magallanes</div>
  </div>
  <div className="relative h-[200px] w-full border-2 hover:shadow-lg transition-transform duration-300 transform hover:scale-105 cursor-pointer" onClick={() => handleDestinationClick('Matnog')}>
    <img
      className="h-full w-full object-cover rounded-sm shadow-md"
      src={matnog}
      alt="Matnog"
    />
    <div className="absolute bottom-0 left-0 right-0 bg-dark/60 text-white rounded-lg p-1 text-md text-center w-full">Matnog</div>
  </div>
  <div className="relative h-[200px] w-full border-2 hover:shadow-lg transition-transform duration-300 transform hover:scale-105 cursor-pointer" onClick={() => handleDestinationClick('Pilar')}>
    <img
      className="h-full w-full object-cover rounded-sm shadow-md"
      src={pilar}
      alt="Pilar"
    />
    <div className="absolute bottom-0 left-0 right-0 bg-dark/60 text-white rounded-lg p-1 text-md text-center w-full">Pilar</div>
  </div>
  <div className="relative h-[200px] w-full border-2 hover:shadow-lg transition-transform duration-300 transform hover:scale-105 cursor-pointer" onClick={() => handleDestinationClick('PrietoDiaz')}>
    <img
      className="h-full w-full object-cover rounded-sm shadow-md"
      src={prieto}
      alt="Prieto"
    />
    <div className="absolute bottom-0 left-0 right-0 bg-dark/60 text-white rounded-lg p-1 text-md text-center w-full">Prieto Diaz</div>
  </div>
  <div className="relative h-[200px] w-full border-2 hover:shadow-lg transition-transform duration-300 transform hover:scale-105 cursor-pointer" onClick={() => handleDestinationClick('StaMagdalena')}>
    <img
      className="h-full w-full object-cover rounded-sm shadow-md"
      src={santa}
      alt="Sta"
    />
    <div className="absolute bottom-0 left-0 right-0 bg-dark/60 text-white rounded-lg p-1 text-md text-center w-full">Sta. Magdalena</div>
  </div>
  <div className="relative h-[200px] w-full border-2 hover:shadow-lg transition-transform duration-300 transform hover:scale-105 cursor-pointer" onClick={() => handleDestinationClick('Sorsogon')}>
    <img
      className="h-full w-full object-cover rounded-sm shadow-md"
      src={Sorso}
      alt="Sorsogon City"
    />
    <div className="absolute bottom-0 left-0 right-0 bg-dark/60 text-white rounded-lg p-1 text-md text-center w-full">Sorsogon City</div>
  </div>  
</div>

  <div ref={destinationSectionRef}>
    {renderDestinationSection()}
  </div>

  </div>
       
  {/** Footer */}

  <div className='mt-9'>
  <Footer/>
  </div>

  {showButton && (
        <motion.button
           className="fixed bottom-5 right-2 p-3 rounded-full shadow-lg z-10"
          onClick={scrollToTop}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatType: "loop" }}
          style={{
            background: 'linear-gradient(135deg, #688484  0%, #092635 100%)', // Gradient color
            color: 'white',
          }}
        >
          ↑
        </motion.button>
      )}



</div>

   
   
  )
}

export default Destinations
