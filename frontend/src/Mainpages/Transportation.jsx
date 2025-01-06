import { useEffect, useState } from 'react';
import Nav from '@/components/nav';
import Search from '@/components/Search';
import { Spinner } from '@nextui-org/react';
import Hero from '@/components/heroTransportation';
import Terminal from '../assets/legazpi terminal.webp'
import Sitex from '../assets/sitex.webp'
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import wave from '@/assets/wave2.webp'
import { MdOutlineKeyboardArrowRight } from 'react-icons/md';
import { Link } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_BASE_URL;

const Transportation = () => {
  const [loading, setLoading] = useState(true);
  const [transportData, setTransportData] = useState([]); // State for transport data
  const [showButton, setShowButton] = useState(false); // State to show/hide button

  useEffect(() => {
    document.title = 'RabaSorsogon | Transportation';
  }, []);

  useEffect(() => {
    // Simulate data fetching
    setTimeout(() => setLoading(false), 250);

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

  useEffect(() => {
    // Fetch transport data from backend
    const fetchTransportData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/get-transport-data`);
        const data = await response.json();
        setTransportData(data);
      } catch (error) {
        console.error('Error fetching transport data:', error);
      }
    };
    fetchTransportData();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return <Spinner className='flex justify-center items-center h-screen' size='lg' label="Loading..." color="primary" />;
  }

  return (
    <div className="bg-gray-100 min-h-screen font-sans" style={{ backgroundImage: `url(${wave})`, backgroundSize: 'auto', backgroundRepeat: 'repeat', backgroundPosition: 'center' }}>
      <Nav />
      <Hero />
      <Search />

      <div className="container w-full flex justify-start mx-auto overflow-x-auto scrollbar-custom scrollbar-hide mb-4">
        <nav className="text-sm text-gray-500 whitespace-nowrap">
          <ol className="list-none p-0 inline-flex">
            <li className="flex items-center">
              <Link to="/" className="hover:text-color1 truncate">Home</Link>
              <span className="mx-2"><MdOutlineKeyboardArrowRight /></span>
            </li>
            <li className="flex items-center text-gray-700 truncate">
              <p className="truncate">Transportation</p>
            </li>
          </ol>
        </nav>
      </div>

      {/* Render the fetched transportation data */}
      {transportData.map((terminalData) => (
        <div key={terminalData.terminal_id} className="p-6">
          <div className="bg-white shadow-md rounded-lg p-6 mb-8 container mx-auto">
            <h2 className="text-2xl font-semibold mb-4">{terminalData.terminal}</h2>
            <div className="w-full h-64 rounded mb-6 flex items-center justify-center">
              <img className='bg-opacity-60 bg-black h-full w-full object-cover' src={terminalData.terminal === 'Legazpi Grand Central Terminal' ? Terminal : Sitex} alt={terminalData.terminal} />
            </div>
            <h3 className="text-lg font-semibold mb-4">{terminalData.terminal} Routes</h3>
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
              <table className="min-w-full border-collapse rounded-lg overflow-hidden shadow">
                <thead>
                  <tr className="bg-color1 text-white">
                    <th className="p-3 text-left border-b border-gray-300">Origin</th>
                    <th className="p-3 text-left border-b border-gray-300">Destination</th>
                    <th className="p-3 text-left border-b border-gray-300">Schedule</th>
                    <th className="p-3 text-left border-b border-gray-300">Fare</th>
                    <th className="p-3 text-left border-b border-gray-300">Mode</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {terminalData.routes.map((route, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-3">{route.origin}</td>
                      <td className="p-3">{route.destination}</td>
                      <td className="p-3">{route.schedule}</td>
                      <td className="p-3">{route.fare}</td>
                      <td className="p-3">{route.mode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}

      <Footer />

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
  );
};

export default Transportation;
