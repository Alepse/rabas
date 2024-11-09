import React, { useState, useEffect, lazy, Suspense, useRef } from 'react'
import Nav from '../components/nav'
import Footer from '../components/Footer'
import Hero from '../components/herodestination'
import Bulusan from '../assets/bulusan-destination.jpg'
import Bulan from '../assets/bulan.webp'
import Barcelona from '../assets/barcelona.jpg'
import Casiguran from '../assets/casiguran.jpg'
import Castilla from '../assets/castilla.jpg'
import Donsol from '../assets/donsol.jpg'
import Gubat from '../assets/gubatpic4.jpg'
import Irosin from '../assets/irosin.jpg'
import Juban from '../assets/juban.jpg'
import Magallanes from '../assets/magallanes.jpg'
import Matnog from '../assets/matnog.webp'
import Pilar from '../assets/pilar.jpg'
import Prieto from '../assets/prieto.jpg'
import Santa from '../assets/santa.jpg'
import Sorso from '../assets/sorsogon city.jpg'
import Search from '@/components/Search';
import { Spinner } from '@nextui-org/react'; // Add this import
import { motion } from 'framer-motion'; // Import Framer Motion
import { useLocation } from 'react-router-dom'; // Import useLocation


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
    Bulusan: './DestinationsSectioncomponent/Bulusan.jsx',
    Bulan: './DestinationsSectioncomponent/Bulan.jsx',
    Barcelona: './DestinationsSectioncomponent/Barcelona.jsx',
    Casiguran: './DestinationsSectioncomponent/Casiguran.jsx',
    Castilla: './DestinationsSectioncomponent/Castilla.jsx',
    Donsol: './DestinationsSectioncomponent/Donsol.jsx',
    Gubat: './DestinationsSectioncomponent/Gubat.jsx',
    Irosin: './DestinationsSectioncomponent/Irosin.jsx',
    Juban: './DestinationsSectioncomponent/Juban.jsx',
    Magallanes: './DestinationsSectioncomponent/Magallanes.jsx',
    Matnog: './DestinationsSectioncomponent/Matnog.jsx',
    Pilar: './DestinationsSectioncomponent/Pilar.jsx',
    PrietoDiaz: './DestinationsSectioncomponent/PrietoDiaz.jsx',
    StaMagdalena: './DestinationsSectioncomponent/StaMagdalena.jsx',
    Sorsogon: './DestinationsSectioncomponent/Sorsogon.jsx',
  };

  const renderDestinationSection = () => {
    if (!selectedDestination) return null;

    const componentPath = destinationComponents[selectedDestination];
    if (!componentPath) return null;

    const DestinationComponent = lazy(() => import(/* @vite-ignore */ `${componentPath}`));

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
      src={Bulusan}
      alt="Bulusan"
    />
    <div className="absolute bottom-0 left-0 right-0 bg-dark/60 text-white rounded-lg p-1 text-md text-center w-full">Bulusan</div>
  </div>
  <div className="relative h-[200px] w-full border-2 hover:shadow-lg transition-transform duration-300 transform hover:scale-105 cursor-pointer" onClick={() => handleDestinationClick('Bulan')}>
    <img
      className="h-full w-full object-cover rounded-sm shadow-md"
      src={Bulan}
      alt="Bulan"
    />
    <div className="absolute bottom-0 left-0 right-0 bg-dark/60 text-white rounded-lg p-1 text-md text-center w-full">Bulan</div>
  </div>
  <div className="relative h-[200px] w-full border-2 hover:shadow-lg transition-transform duration-300 transform hover:scale-105 cursor-pointer" onClick={() => handleDestinationClick('Barcelona')}>
    <img
      className="h-full w-full object-cover rounded-sm shadow-md"
      src={Barcelona}
      alt="Barcelona"
    />
    <div className="absolute bottom-0 left-0 right-0 bg-dark/60 text-white rounded-lg p-1 text-md text-center w-full">Barcelona</div>
  </div>
  <div className="relative h-[200px] w-full border-2 hover:shadow-lg transition-transform duration-300 transform hover:scale-105 cursor-pointer" onClick={() => handleDestinationClick('Casiguran')}>
    <img
      className="h-full w-full object-cover rounded-sm shadow-md"
      src={Casiguran}
      alt="Casiguran"
    />
    <div className="absolute bottom-0 left-0 right-0 bg-dark/60 text-white rounded-lg p-1 text-md text-center w-full">Casiguran</div>
  </div>
  <div className="relative h-[200px] w-full border-2 hover:shadow-lg transition-transform duration-300 transform hover:scale-105 cursor-pointer" onClick={() => handleDestinationClick('Castilla')}>
    <img
      className="h-full w-full object-cover rounded-sm shadow-md"
      src={Castilla}
      alt="Castilla"
    />
    <div className="absolute bottom-0 left-0 right-0 bg-dark/60 text-white rounded-lg p-1 text-md text-center w-full">Castilla</div>
  </div>
  <div className="relative h-[200px] w-full border-2 hover:shadow-lg transition-transform duration-300 transform hover:scale-105 cursor-pointer" onClick={() => handleDestinationClick('Donsol')}>
    <img
      className="h-full w-full object-cover rounded-sm shadow-md"
      src={Donsol}
      alt="Donsol"
    />
    <div className="absolute bottom-0 left-0 right-0 bg-dark/60 text-white rounded-lg p-1 text-md text-center w-full">Donsol</div>
  </div>
  <div className="relative h-[200px] w-full border-2 hover:shadow-lg transition-transform duration-300 transform hover:scale-105 cursor-pointer" onClick={() => handleDestinationClick('Gubat')}>
    <img
      className="h-full w-full object-cover rounded-sm shadow-md"
      src={Gubat}
      alt="Gubat"
    />
    <div className="absolute bottom-0 left-0 right-0 bg-dark/60 text-white rounded-lg p-1 text-md text-center w-full">Gubat</div>
  </div>
  <div className="relative h-[200px] w-full border-2 hover:shadow-lg transition-transform duration-300 transform hover:scale-105 cursor-pointer" onClick={() => handleDestinationClick('Irosin')}>
    <img
      className="h-full w-full object-cover rounded-sm shadow-md"
      src={Irosin}
      alt="Irosin"
    />
    <div className="absolute bottom-0 left-0 right-0 bg-dark/60 text-white rounded-lg p-1 text-md text-center w-full">Irosin</div>
  </div>
  <div className="relative h-[200px] w-full border-2 hover:shadow-lg transition-transform duration-300 transform hover:scale-105 cursor-pointer" onClick={() => handleDestinationClick('Juban')}>
    <img
      className="h-full w-full object-cover rounded-sm shadow-md"
      src={Juban}
      alt="Juban"
    />
    <div className="absolute bottom-0 left-0 right-0 bg-dark/60 text-white rounded-lg p-1 text-md text-center w-full">Juban</div>
  </div>
  <div className="relative h-[200px] w-full border-2 hover:shadow-lg transition-transform duration-300 transform hover:scale-105 cursor-pointer" onClick={() => handleDestinationClick('Magallanes')}>
    <img
      className="h-full w-full object-cover rounded-sm shadow-md"
      src={Magallanes}
      alt="Magallanes"
    />
    <div className="absolute bottom-0 left-0 right-0 bg-dark/60 text-white rounded-lg p-1 text-md text-center w-full">Magallanes</div>
  </div>
  <div className="relative h-[200px] w-full border-2 hover:shadow-lg transition-transform duration-300 transform hover:scale-105 cursor-pointer" onClick={() => handleDestinationClick('Matnog')}>
    <img
      className="h-full w-full object-cover rounded-sm shadow-md"
      src={Matnog}
      alt="Matnog"
    />
    <div className="absolute bottom-0 left-0 right-0 bg-dark/60 text-white rounded-lg p-1 text-md text-center w-full">Matnog</div>
  </div>
  <div className="relative h-[200px] w-full border-2 hover:shadow-lg transition-transform duration-300 transform hover:scale-105 cursor-pointer" onClick={() => handleDestinationClick('Pilar')}>
    <img
      className="h-full w-full object-cover rounded-sm shadow-md"
      src={Pilar}
      alt="Pilar"
    />
    <div className="absolute bottom-0 left-0 right-0 bg-dark/60 text-white rounded-lg p-1 text-md text-center w-full">Pilar</div>
  </div>
  <div className="relative h-[200px] w-full border-2 hover:shadow-lg transition-transform duration-300 transform hover:scale-105 cursor-pointer" onClick={() => handleDestinationClick('PrietoDiaz')}>
    <img
      className="h-full w-full object-cover rounded-sm shadow-md"
      src={Prieto}
      alt="Prieto"
    />
    <div className="absolute bottom-0 left-0 right-0 bg-dark/60 text-white rounded-lg p-1 text-md text-center w-full">Prieto Diaz</div>
  </div>
  <div className="relative h-[200px] w-full border-2 hover:shadow-lg transition-transform duration-300 transform hover:scale-105 cursor-pointer" onClick={() => handleDestinationClick('StaMagdalena')}>
    <img
      className="h-full w-full object-cover rounded-sm shadow-md"
      src={Santa}
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
