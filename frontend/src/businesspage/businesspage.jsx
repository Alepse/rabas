import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import Nav from '../components/nav';
import HeroAndGallery from './BusinessComponents/BusinessHero';
import Footer from '@/components/Footer';
import Info from '../businesspage/BusinessComponents/BuseinessInfo.jsx';
import Search from '@/components/Search';
import { AiOutlineLike } from "react-icons/ai";
import { Button, Spinner } from '@nextui-org/react';
import { IoStar, IoStarHalf, IoStarOutline } from "react-icons/io5";
import Section from './BusinessComponents/BusinessSectionDeals';
import Allproducts from '../businesspage/BusinessComponents/BusinessAllproducts';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Swal from 'sweetalert2';
import UserChatModal from '@/user/userChatSystem/UserChatModal';
// Use the environment variable for the base URL
const BASE_URL = import.meta.env.VITE_BASE_URL; 

const showSuccessAlert = (message) => {
  Swal.fire({
    title: 'Success!',
    text: message,
    icon: 'success',
    confirmButtonText: 'OK',
    confirmButtonColor: '#0BDA51', // Green color for confirmation
    cancelButtonColor: '#D33736',  // Red color for cancellation
  });
};

const showErrorAlert = (message) => {
  Swal.fire({
    title: 'Error!',
    text: message,
    icon: 'error',
    confirmButtonText: 'Try Again',
    confirmButtonColor: '#0BDA51', // Green color for confirmation
    cancelButtonText: 'Close',
    cancelButtonColor: '#D33736',  // Red color for cancellation
  });
};

const formatNumber = (num) => {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'm';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num;
};

const BusinessPage = () => {
  const { businessId: encryptedBusinessId } = useParams();
  const [businessData, setBusinessData] = useState(null);
  const [likesCount, setLikesCount] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showButton, setShowButton] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const checkLoginStatus = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/check-login`, {
        method: 'GET',
        credentials: 'include' // Include cookies
      });
      if (response.ok) {
        const data = await response.json();
        setIsLoggedIn(data.isLoggedIn); // Set login status
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    }
  }, []);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const fetchUserData = () => {
    axios.get(`${BASE_URL}/get-userData`, { withCredentials: true })
      .then(({ data }) => {
        setUserData(data.userData);
      })
      .catch(error => {
        console.error('Error fetching user data:', error.response ? error.response.data.message : 'An unknown error occurred');
      });
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchUserData();
    }
  }, [isLoggedIn]);

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
        const response = await axios.get(`${BASE_URL}/getAllBusinesses`);
        const business = response.data.businesses.find(b => b.business_id === parseInt(decryptedBusinessId));
        setBusinessData(business);
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

  const openChatModal = () => {
    if (!isLoggedIn){
      return  showErrorAlert('Please login to send a message.');
    }
    if(businessData){
    setIsChatModalOpen(true);}
  };

  const closeChatModal = () => {
    setIsChatModalOpen(false);
  };


  const fetchLikedBusinesses = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/liked-businesses`, { withCredentials: true });
      const likedBusinesses = response.data.likedBusinesses;
      setIsLiked(likedBusinesses.some(b => b.business_id === businessData.business_id));
    } catch (error) {
      console.error('Error fetching liked businesses:', error);
    }
  };

  useEffect(() => {
    if (isLoggedIn && businessData) {
      fetchLikedBusinesses();
      fetchLikeCounts(businessData.business_id);
    }
  }, [isLoggedIn, businessData]);

  const fetchLikeCounts = async (businessId) => {
    try {
      const response = await axios.get(`${BASE_URL}/getLikesCount/${businessId}`, { withCredentials: true });
      if (response.data.success) {
        const likes = response.data.businessLikes.likes; // Extract the likes count
        setLikesCount(likes); // Update the state with the likes count
      } else {
        showErrorAlert('Failed to fetch likes count for the business.');
      }
    } catch (error) {
      console.error('Error fetching likes count:', error);
      showErrorAlert('An error occurred while fetching the likes count.');
    }
  };

  useEffect(() => {
    fetchLikeCounts(decryptId(encryptedBusinessId));
  }, [likesCount]);
  
  const likeBusiness = async (businessId) => {
    try {
      const response = await axios.post(`${BASE_URL}/like-business`, { businessId }, { withCredentials: true });
      if (response.data.success) {
        setIsLiked(true);
        fetchLikeCounts(businessId); // Pass businessId here
      } else {
        // showErrorAlert('Failed to like the business.');
      }
    } catch (error) {
      console.error('Error liking business:', error);
      showErrorAlert('An error occurred while liking the business.');
    }
  };
  
  const unlikeBusiness = async (businessId) => {
    try {
      const response = await axios.delete(`${BASE_URL}/unlike-business/${businessId}`, { withCredentials: true });
      if (response.data.success) {
        setIsLiked(false);
        fetchLikeCounts(businessId); // Pass businessId here
      } else {
        // showErrorAlert('Failed to unlike the business.');
      }
    } catch (error) {
      console.error('Error unliking business:', error);
    }
  };  

  const handleLikeClick = () => {
    if (!isLoggedIn) {
      return showErrorAlert('Please login to like a page.');
    }
    if (!isLiked) {
      likeBusiness(businessData.business_id);
    } else {
      unlikeBusiness(businessData.business_id);
    }
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

  return (
    <div className='mx-auto min-h-screen bg-light font-sans'>
      <Nav />

      <div className='container p-3 rounded-md mt-[5.2rem] flex justify-center'> 
        <Search/>
      </div>

      {/* Hero Section with Animation */}
      <AnimatedSection>
        <HeroAndGallery images={businessData.coverPhotos} />
      </AnimatedSection>

      {/* Business Header Section */}
      <div className='container mx-auto px-4'>
        <AnimatedSection>
          <div className='flex flex-wrap items-center gap-4 py-4'>
            <img 
              className='w-16 h-16 sm:w-24 sm:h-24 rounded-full object-cover shadow-gray-400 p-5' 
              src={businessData.businessLogo ? `${BASE_URL}/${businessData.businessLogo}` : `https://ui-avatars.com/api/?name=${businessData?.businessName?.charAt(0).toUpperCase()}`} 
              alt={businessData.businessName}
            />
            <h1 className='text-xl sm:text-2xl font-medium mr-16'>{businessData.businessName}</h1>
            <div className='flex flex-wrap items-center gap-3'>
              <Button className='h-9 px-3 bg-slate-300 hover:text-white hover:bg-color2/90' onClick={openChatModal}>
                <div className='text-sm flex items-center gap-2'>
                  Message
                </div>
              </Button>
              <Button
                className={`h-9 px-3 ${
                  isLiked ? 'bg-color2 text-white' : 'bg-slate-300'
                }`}
                onClick={handleLikeClick}
              >
              <div className='text-sm flex items-center gap-2'>
                <AiOutlineLike />
                {likesCount > 0 ? formatNumber(likesCount) : ''}
              </div>
              </Button>
              {/* <span className="ml-1 text-sm">{businessData.likes}</span> */}
              <div className="flex items-center">
                {businessData.rating ? (
                  <>
                    {renderStars(businessData.rating)}
                    <span className="ml-1 text-sm">{parseFloat(businessData.rating).toFixed(1)}</span>
                  </>
                ) : (
                  <span className="ml-1 text-sm">No ratings</span>
                )}
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>

      {/* Info Section with Animation */}
      <AnimatedSection>
        <Info businessData={businessData} loading={loading} userData={userData} isLoggedIn={isLoggedIn} />
      </AnimatedSection>

      {/* Deals Section with Animation */}
      <AnimatedSection>
        <Section isLoggedIn={isLoggedIn} businessData={businessData} userData={userData} />
      </AnimatedSection>

      {/* All Products Section with Animation */}
      <AnimatedSection>
        <Allproducts isLoggedIn={isLoggedIn} businessData={businessData} userData={userData} />
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
      <UserChatModal isOpen={isChatModalOpen} onClose={closeChatModal} onOpenChat={businessData} />
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
