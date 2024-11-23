import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Nav from '../components/nav';
import Hero from '../components/herofood';
import Footer from '@/components/Footer';
import { Button, Spinner } from "@nextui-org/react";
import { Checkbox, CheckboxGroup, Select, SelectItem, Slider } from "@nextui-org/react";
import { GiPositionMarker } from "react-icons/gi";
import { Link } from 'react-router-dom';
import Search from '@/components/Search';
import wave from '@/assets/wave2.webp'
import CryptoJS from 'crypto-js';

// Custom hook to detect if the screen is large
const useIsLargeScreen = () => {
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isLargeScreen;
};

const Foods = () => {
  // State Variables
  const [foodDetails, setFoodDetails] = useState([]);
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState('All');
  const [budgetRange, setBudgetRange] = useState([0, 10000]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const response = await fetch(`http://localhost:5000/getAllBusinesses?businessType=restaurant`);
        const data = await response.json();
        if (data.success) {
          const foods = data.businesses.filter(business => business.businessType === 'restaurant');
          setFoodDetails(foods);
        } else {
          console.error('Failed to fetch foods:', data.message);
        }
      } catch (error) {
        console.error('Error fetching foods:', error);
      }
    };

    fetchFoods();
  }, []);

  useEffect(() => {
    document.title = 'RabaSorsogon | Foods';
  });

  const isLargeScreen = useIsLargeScreen();

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);

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

  if (loading) {
    return <Spinner className='flex justify-center items-center h-screen' size='lg' label="Loading..." color="primary" />;
  }

  const handleCuisineChange = (selected) => {
    setSelectedCuisines(selected);
  };

  const handleAmenitiesChange = (selected) => {
    setSelectedAmenities(selected);
  };

  const handleRatingClick = (rating) => {
    if (rating === 'All') {
      setSelectedRatings([]);
    } else {
      setSelectedRatings((prevSelected) =>
        prevSelected.includes(rating)
          ? prevSelected.filter((r) => r !== rating)
          : [...prevSelected, rating]
      );
    }
  };

  const handleDestinationChange = (destination) => {
    setSelectedDestination(destination);
  };

  const handleBudgetChange = (value) => {
    setBudgetRange(value);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Function to encrypt the business_id
  const encryptId = (id) => {
    const secretKey = import.meta.env.VITE_SECRET_KEY;
    const ciphertext = CryptoJS.AES.encrypt(id.toString(), secretKey).toString();
    return encodeURIComponent(ciphertext);
  };

  // Define the cuisine types based on the tags used in your food data
  const cuisineTypes = ['Filipino', 'Italian', 'Chinese', 'Japanese', 'Mexican', 'Cafe'];

  // Filtering logic
  const filteredFoods = foodDetails.filter((food) => {
    const matchesCuisines = selectedCuisines.length === 0 || 
      selectedCuisines.every((selected) => 
        food.category.map(tag => tag.toLowerCase().replace(/s$/, '')).includes(selected.toLowerCase().replace(/s$/, ''))
      );
    const matchesAmenities = selectedAmenities.length === 0 || 
      selectedAmenities.every((amenity) => 
        food.amenities.map(a => a.toLowerCase().replace(/s$/, '')).includes(amenity.toLowerCase().replace(/s$/, ''))
      );
    const matchesRating = selectedRatings.length === 0 || 
      selectedRatings.includes(Math.floor(food.rating || 0));
    const matchesDestination = selectedDestination === 'All' || food.destination === selectedDestination;

    const minPrice = parseFloat(food.lowest_price) || 0;
    const maxPrice = parseFloat(food.highest_price) || Infinity;
    const matchesBudget = minPrice <= budgetRange[1] && maxPrice >= budgetRange[0];

    return matchesCuisines && matchesAmenities && matchesRating && matchesDestination && matchesBudget;
  });

  // Dropdown Options
  const destinations = [
    'All', 'Bulusan', 'Bulan', 'Barcelona', 'Casiguran', 'Castilla', 'Donsol', 'Gubat', 'Irosin', 'Juban', 'Magallanes', 'Matnog', 'Pilar', 'Prieto Diaz', 'Sta. Magdalena', 'Sorsogon City',
  ];

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <div className='mx-auto bg-light min-h-screen font-sans'style={{ backgroundImage: `url(${wave})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}>
      <Nav />
      <Hero />
      <Search/>

      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12'>
        <h1 className='font-semibold text-3xl text-color1 mb-8'>Foods in Sorsogon</h1>

        {/* Toggle Button for Filters */}
        <div className="lg:hidden mb-4 bg-white">
          <Button aria-label="Toggle filters" onClick={toggleFilters} className="w-full bg-color1 text-color3">
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>

        <div className='flex flex-col lg:flex-row gap-8'>
          {/* Conditionally render filters based on screen size and toggle state */}
          {(showFilters || isLargeScreen) && (
            <div className='w-full lg:w-1/4'>
              <div className='bg-white p-6 rounded-lg shadow-md'>
                <h2 className='text-xl font-semibold mb-4'>Filters</h2>
                
                {/* Destination Dropdown */}
                <div className='mb-6'>
                    <h3 className='text-sm font-medium text-gray-700 mb-2'>Destination</h3>
                    <Select
                        placeholder="Select Destination"
                        selectedKeys={[selectedDestination]}
                        onSelectionChange={(value) => handleDestinationChange(value.currentKey)}
                    >
                        {destinations.map((destination) => (
                            <SelectItem key={destination} value={destination}>
                                {destination}
                            </SelectItem>
                        ))}
                    </Select>
                </div>

                {/* Cuisine Type Filter */}
                <div className='mb-6 max-h-[230px] overflow-auto scrollbar-custom'>
                    <h3 className='text-sm font-medium sticky top-0 bg-white z-10 text-gray-700 mb-2'>Cuisine Type</h3>
                    <CheckboxGroup
                        value={selectedCuisines}
                        onChange={handleCuisineChange}
                    >
                        {cuisineTypes.map((type) => (
                            <Checkbox key={type} value={type}>
                                {type}
                            </Checkbox>
                        ))}
                    </CheckboxGroup>
                </div>

                {/* Amenities Filter */}
                <div className='mb-6 max-h-[230px] overflow-auto scrollbar-custom'>
                    <h3 className='text-sm font-medium sticky top-0 bg-white z-10 text-gray-700 mb-2'>Amenities</h3>
                    <CheckboxGroup
                        value={selectedAmenities}
                        onChange={handleAmenitiesChange}
                    >
                        {['Wi-Fi', 'Parking', 'Delivery'].map((amenity) => (
                            <Checkbox key={amenity} value={amenity}>
                                {amenity}
                            </Checkbox>
                        ))}
                    </CheckboxGroup>
                </div>

                {/* Budget Range Filter */}
                <div className='mb-6'>
                    <h3 className='text-sm font-medium text-gray-700 mb-2'>Budget Range (PHP)</h3>
                    <Slider
                        step={100}
                        minValue={0}
                        maxValue={10000}
                        value={budgetRange}
                        onChange={setBudgetRange}
                        formatOptions={{ style: 'currency', currency: 'PHP' }}
                        className="max-w-md flex"
                    />
                    <div className='flex justify-between text-xs'>
                        <span>₱{budgetRange[0]}</span>
                        <span>₱{budgetRange[1]}+</span>
                    </div>
                </div>

                {/* Ratings Filter */}
                <div>
                    <h3 className='text-sm font-medium text-gray-700 mb-2'>Ratings</h3>
                    <div className='space-y-2'>
                        <label className='flex items-center'>
                            <input
                                type='checkbox'
                                onChange={() => handleRatingClick('All')}
                                checked={selectedRatings.length === 0}
                                className='form-checkbox text-color2'
                            />
                            <span className='ml-2 text-sm'>All Ratings</span>
                        </label>
                        {[5, 4, 3, 2, 1].map((star) => (
                            <label key={star} className='flex items-center'>
                                <input
                                    type='checkbox'
                                    onChange={() => handleRatingClick(star)}
                                    checked={selectedRatings.includes(star)}
                                    className='form-checkbox text-color2'
                                />
                                <span className='ml-2 text-sm flex items-center'>
                                    {'★'.repeat(star)}{'☆'.repeat(5 - star)}
                                    <span className='ml-1'>{star} Star{star > 1 ? 's' : ''}</span>
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
              </div>
            </div>
          )}

          {/* Food List */}
          <div className='w-full'>
            <motion.div 
              className='grid grid-cols-1 gap-6 overflow-y-auto max-h-[1000px] scrollbar-custom  p-4'
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredFoods.length > 0 ? (
                filteredFoods.map((food, index) => (
                  <motion.div
                    key={index}
                    className='bg-white rounded-lg shadow-lg hover:shadow-slate-500 hover:scale-105 duration-300'
                    variants={cardVariants}
                  >
                    <img
                      src={`http://localhost:5000/${food.businessLogo}`}
                      alt={food.busineName}
                      className='w-full h-48 object-cover rounded-t-lg'
                    />
                    <div className='p-4'>
                      <div className='flex items-center justify-between gap-2'>
                      {/* tags */}
                      <div className='flex flex-wrap gap-2 mb-2'>
                        {food.category.map((tag, index) => (
                          <span 
                            key={index} 
                            className={`text-xs px-2 py-1 rounded-full ${selectedCuisines.map(c => c.toLowerCase()).includes(tag.toLowerCase()) ? 'bg-color2 text-white' : 'bg-gray-200 text-gray-700'}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                       
                        <div className='flex items-center gap-2'>
                          <div className='flex items-center gap-1 '>
                            {food.rating ? (
                              <>
                                <span className='text-black text-[12px] '>{food.rating.toFixed(1)}</span> 
                                <span className='text-yellow-500'>
                                  {'★'.repeat(Math.floor(food.rating))}
                                  {'☆'.repeat(5 - Math.floor(food.rating))}
                                </span>
                              </>
                            ) : (
                              <span className="text-gray-500 text-[12px]">No ratings</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <h3 className='font-semibold text-lg text-color1'>{food.businessName}</h3>
                      <div className='text-xs text-gray-500 mb-2 flex items-center'>
                        <GiPositionMarker/> {food.destination}
                      </div>
                      
                      <div className='flex mb-2 max-w-[500px] max-h-[5rem] overflow-y-auto scrollbar-custom flex-col'>      
                        {food.description ? (
                          <p className='text-sm text-gray-600 mb-2'>{food.description}</p>
                        ) : (
                          <p className='text-sm text-gray-400 italic mb-2'>No description</p>
                        )}
                      </div>
                      <p className='font-semibold text-md mb-2'>
                        {food.lowest_price && food.highest_price ? (
                          `₱${food.lowest_price} - ₱${food.highest_price}`
                        ) : (
                          <span className="text-gray-400 italic">Price Range Not available</span>
                        )}
                      </p>
                      <Link to={`/business/${encryptId(food.business_id)}`} target='_blank'>
                        <Button 
                          className='w-full bg-color1 text-color3 hover:bg-color2'
                        >
                          Explore More
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className='col-span-full text-center text-gray-500'>No foods match your selected filters.</p>
              )}
            </motion.div>
          </div>
        </div>
      </div>

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

export default Foods;
