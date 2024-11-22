import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Nav from '../components/nav';
import Hero from '../components/heroaccomodation';
import Footer from '@/components/Footer';
import Antonio from '../assets/antonio.jpg';
import {  Button, Slider, Spinner } from "@nextui-org/react";
import { Checkbox, CheckboxGroup, Select, SelectItem } from "@nextui-org/react";
import { GiPositionMarker } from "react-icons/gi";
import Search from '@/components/Search';
import { Link } from 'react-router-dom';
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

const Accommodations = () => {
  // State Variables
  const [accommodationDetails, setAccommodationDetails] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState('All');
  const [budgetRange, setBudgetRange] = useState([0, 10000]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const fetchAccommodations = async () => {
      try {
        const response = await fetch(`http://localhost:5000/getAllBusinesses?businessType=accommodation`);
        const data = await response.json();
        if (data.success) {
          const accommodations = data.businesses.filter(business => business.businessType === 'accommodation');
          setAccommodationDetails(accommodations);
        } else {
          console.error('Failed to fetch accommodations:', data.message);
        }
      } catch (error) {
        console.error('Error fetching accommodations:', error);
      }
    };

    fetchAccommodations();
  }, []);

  useEffect(() => {
    document.title = 'RabaSorsogon | Accommodations';
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

  const handleTagChange = (selected) => {
    setSelectedTags(selected);
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

  // Define the accommodation types based on the tags used in your accommodation data
  const accommodationTypes = ['Hotel', 'Inn', 'Lodge', 'Resort'];

  // Filtering logic
  const filteredAccommodations = accommodationDetails.filter((accommodation) => {
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every((selected) => 
        accommodation.category.map(tag => tag.toLowerCase().replace(/s$/, '')).includes(selected.toLowerCase().replace(/s$/, ''))
      );
    const matchesAmenities = selectedAmenities.length === 0 || 
      selectedAmenities.every((amenity) => 
        accommodation.amenities.map(a => a.toLowerCase().replace(/s$/, '')).includes(amenity.toLowerCase().replace(/s$/, ''))
      );
      const matchesRating = selectedRatings.length === 0 || 
      selectedRatings.includes(Math.floor(accommodation.rating || 0));
    const matchesDestination = selectedDestination === 'All' || accommodation.destination === selectedDestination;

     // Ensure lowest_price and highest_price are numbers
     const minPrice = parseFloat(accommodation.lowest_price) || 0;
     const maxPrice = parseFloat(accommodation.highest_price) || Infinity;
    const matchesBudget = minPrice <= budgetRange[1] && maxPrice >= budgetRange[0];

    return matchesTags && matchesAmenities && matchesRating && matchesDestination && matchesBudget;
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
    <div className='mx-auto bg-light min-h-screen font-sans'>
      <Nav />
      <Hero />
      <Search/>

      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12'>
        <h1 className='font-semibold text-3xl text-color1 mb-8'>Accommodations in Sorsogon</h1>

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

                {/* Accommodation Type Filter */}
                <div className='mb-6 max-h-[230px] overflow-auto scrollbar-custom'>
                    <h3 className='text-sm font-medium sticky top-0 bg-white z-10 text-gray-700 mb-2'>Accommodation Type</h3>
                    <CheckboxGroup
                        value={selectedTags}
                        onChange={handleTagChange}
                    >
                        {accommodationTypes.map((type) => (
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
                        {['Wi-Fi', 'Breakfast', 'Parking', 'Pool'].map((amenity) => (
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

          {/* Accommodation List */}
          <div className='w-full'>
            <motion.div 
              className='grid grid-cols-1 gap-6 overflow-y-auto max-h-[1000px] scrollbar-custom  p-4'
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredAccommodations.length > 0 ? (
                filteredAccommodations.map((accommodation, index) => (
                  <motion.div
                    key={index}
                    className='bg-white rounded-lg shadow-lg hover:shadow-slate-500 hover:scale-105 duration-300'
                    variants={cardVariants}
                  >
                    <img
                      src={`http://localhost:5000/${accommodation.businessLogo}`}
                      alt={accommodation.businessName}
                      className='w-full h-48 object-cover rounded-t-lg'
                    />
                    <div className='p-4'>
                      <div className='flex items-center justify-between gap-2'>
                      {/* tags */}
                      <div className='flex flex-wrap gap-2 mb-2'>
                        {accommodation.category.map((tag, index) => (
                          <span 
                            key={index} 
                            className={`text-xs px-2 py-1 rounded-full ${selectedTags.map(t => t.toLowerCase()).includes(tag.toLowerCase()) ? 'bg-color2 text-white' : 'bg-gray-200 text-gray-700'}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                       
                        <div className='flex items-center gap-2'>
                          <div className='flex items-center gap-1 '>
                            {accommodation.rating ? (
                              <>
                                <span className='text-black text-[12px] '>{accommodation.rating}</span> 
                                <span className='text-yellow-500'>
                                  {'★'.repeat(Math.floor(accommodation.rating))}
                                  {'☆'.repeat(5 - Math.floor(accommodation.rating))}
                                </span>
                              </>
                            ) : (
                              <span className="text-gray-500 text-[12px]">No ratings</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <h3 className='font-semibold text-lg text-color1'>{accommodation.businessName}</h3>
                      <div className='text-xs text-gray-500 mb-2 flex items-center'>
                        <GiPositionMarker/> {accommodation.destination}
                      </div>
                      
                      <div className='flex mb-2 max-w-[500px] max-h-[5rem] overflow-y-auto scrollbar-custom flex-col'>      
                        {accommodation.description ? (
                          <p className='text-sm text-gray-600 mb-2'>{accommodation.description}</p>
                        ) : (
                          <p className='text-sm text-gray-400 italic mb-2'>No description</p>
                        )}
                      </div>
                      <p className='font-semibold text-md mb-2'>
                        {accommodation.lowest_price && accommodation.highest_price ? (
                          `₱${accommodation.lowest_price} - ₱${accommodation.highest_price}`
                        ) : (
                          <span className="text-gray-400 italic">Price Range Not available</span>
                        )}
                      </p>
                      <Link to="/business" target='_blank'>
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
                <p className='col-span-full text-center text-gray-500'>No accommodations match your selected filters.</p>
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

export default Accommodations;
