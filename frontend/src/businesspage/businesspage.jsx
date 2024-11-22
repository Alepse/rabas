import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import Nav from '../components/nav';
import HeroAndGallery from './BusinessComponents/BusinessHero';
import Footer from '@/components/Footer';
import Info from '../businesspage/BusinessComponents/BuseinessInfo.jsx';
import Search from '@/components/Search';
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { AiOutlineLike } from "react-icons/ai";
import { Button, Spinner } from '@nextui-org/react';
import { IoStar, IoStarHalf, IoStarOutline } from "react-icons/io5";
import Section from './BusinessComponents/BusinessSectionDeals';
import Allproducts from '../businesspage/BusinessComponents/BusinessAllproducts';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const BusinessPage = () => {
  const { businessId: encryptedBusinessId } = useParams();
  const [businessData, setBusinessData] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showButton, setShowButton] = useState(false);

  // Function to decrypt the business_id
  const decryptId = (encryptedId) => {
    const secretKey = import.meta.env.VITE_SECRET_KEY;
    const bytes = CryptoJS.AES.decrypt(decodeURIComponent(encryptedId), secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        const decryptedBusinessId = decryptId(encryptedBusinessId);
        const response = await axios.get(`http://localhost:5000/getAllBusinesses`);
        const business = response.data.businesses.find(b => b.business_id === parseInt(decryptedBusinessId));
        setBusinessData(business);
        // console.log('Encrypted ID:', encryptedBusinessId);
        // console.log('Decrypted ID:', decryptedBusinessId);
      } catch (error) {
        console.error('Error fetching business data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, [encryptedBusinessId]);

  useEffect(() => {
    if (businessData) {
      document.title = `RabaSorsogon | ${businessData.businessName}`;
    }
  }, [businessData]);

  useEffect(() => {
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
    return (
      <Spinner 
        className='flex justify-center items-center h-screen' 
        size='lg' 
        label="Loading..." 
        color="primary" 
      />
    );
  }

  if (!businessData) {
    return <p className="text-center mt-10">Business not found.</p>;
  }

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<IoStar key={i} className="text-yellow-400" />);
      } else if (i - 0.5 <= rating) {
        stars.push(<IoStarHalf key={i} className="text-yellow-400" />);
      } else {
        stars.push(<IoStarOutline key={i} className="text-yellow-400" />);
      }
    }
    return stars;
  };

  const handleLikeClick = () => {
    setIsLiked(!isLiked);
  };

  return (
    <div className='mx-auto min-h-screen bg-light font-sans'>
      <Nav />

      <div className='container p-3 rounded-md mt-[5.2rem] flex justify-center'> 
        <Search/>
      </div>

      {/* Hero Section with Animation */}
      <AnimatedSection>
        <HeroAndGallery />
      </AnimatedSection>

      {/* Business Header Section */}
      <div className='container mx-auto px-4'>
        <AnimatedSection>
          <div className='flex flex-wrap items-center gap-4 py-4'>
            <img className='h-16 sm:h-24 rounded-full object-cover' src={`http://localhost:5000/${businessData.businessLogo}`} alt="Business Logo" />
            <h1 className='text-xl sm:text-2xl font-medium mr-16'>{businessData.businessName}</h1>
            <div className='flex flex-wrap items-center gap-3'>
              <Button className='h-9 px-3 bg-slate-300 hover:text-white hover:bg-color2/90'>
                <div className='text-sm flex items-center gap-2'>
                  <IoChatbubbleEllipsesOutline />Message
                </div>
              </Button>
              <Button
                className={`h-9 px-3 ${
                  isLiked ? 'bg-color2 text-white' : 'bg-slate-300 hover:text-white hover:bg-color2/90'
                }`}
                onClick={handleLikeClick}
              >
                <div className='text-sm flex items-center gap-2'>
                  <AiOutlineLike />
                  {isLiked ? 'Liked' : 'Like'}
                </div>
              </Button>
              <div className="flex items-center">
                {renderStars(businessData.rating)}
                <span className="ml-1 text-sm">{parseFloat(businessData.rating).toFixed(1)}</span>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>

      {/* Info Section with Animation */}
      <AnimatedSection>
        <Info />
      </AnimatedSection>

      {/* Deals Section with Animation */}
      <AnimatedSection>
        <Section />
      </AnimatedSection>

      {/* All Products Section with Animation */}
      <AnimatedSection>
        <Allproducts />
      </AnimatedSection>

      <Footer />

      {showButton && (
        <motion.button
          className="fixed bottom-5 right-5 p-3 rounded-full shadow-lg"
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

export default BusinessPage;
