import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { motion } from 'framer-motion';
import Nav from '../components/nav';
import Hero from '../components/heroactivity';
import Footer from '@/components/Footer';
import pic1 from '../assets/donsol.jpg';
import { Button, Spinner } from "@nextui-org/react";
import { Checkbox, CheckboxGroup, Select, SelectItem, Slider , Tooltip} from "@nextui-org/react";
import { GiPositionMarker } from "react-icons/gi";
import { Link } from 'react-router-dom';
import Search from '@/components/Search';
import wave from '@/assets/wave2.webp'
import CryptoJS from 'crypto-js';
import { Skeleton } from "@nextui-org/skeleton";
import { IoInformationCircleOutline } from "react-icons/io5";
// Use the environment variable for the base URL
const BASE_URL = import.meta.env.VITE_BASE_URL; 

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

const Activities = () => {
  // State Variables
  const [activityDetails, setActivityDetails] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState('All');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [budgetRange, setBudgetRange] = useState([0, 10000]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showButton, setShowButton] = useState(false); // State to show/hide button
 const [openTooltip, setOpenTooltip] = useState(null); // Store the ID of the open tooltip
  
  // Function to toggle a specific tooltip
  const toggleTooltip = (id) => {
    setOpenTooltip((prev) => (prev === id ? null : id)); // Toggle the tooltip visibility
  };

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch(`${BASE_URL}/getAllBusinesses?businessType=attraction`);
        const data = await response.json();
        if (data.success) {
          const attractions = data.businesses.filter(business => business.businessType === 'attraction');
          setActivityDetails(attractions);
        } else {
          console.error('Failed to fetch activities:', data.message);
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchActivities();
  }, []);

     // Title Tab
     useEffect(() => {
      document.title = 'RabaSorsogon | Activities';
    });
  

  const isLargeScreen = useIsLargeScreen();

  useEffect(() => {

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

  const handleActivityChange = (selected) => {
    setSelectedActivities(selected);
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

  // Define the activity types based on the tags used in your activity data
  const activityTypes = [ 'Adventure', 'Swimming', 'Surfing', 'Hiking', 'Camping', 'Tour', 'History', 'Snorkeling'];

  // Filtering logic
  const filteredActivities = activityDetails.filter((activity) => {
    const matchesActivityType = selectedActivities.length === 0 || 
      selectedActivities.every((selected) => 
        activity.category.map(cat => cat.toLowerCase().replace(/s$/, '')).includes(selected.toLowerCase().replace(/s$/, ''))
      );

      // console.log('selectedActivities', selectedActivities);
      // console.log('activity.category', activity.category);
    const matchesAmenities = selectedAmenities.length === 0 || 
      selectedAmenities.every((amenity) => 
        activity.amenities.map(a => a.toLowerCase().replace(/s$/, '')).includes(amenity.toLowerCase().replace(/s$/, ''))
      );
      const matchesRating = selectedRatings.length === 0 || 
      selectedRatings.includes(Math.floor(activity.rating || 0));
    const matchesDestination = selectedDestination === 'All' || activity.destination === selectedDestination;
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(activity.category);

    // Ensure lowest_price and highest_price are numbers
    const minBudget = parseFloat(activity.lowest_price) || 0;
    const maxBudget = parseFloat(activity.highest_price) || Infinity;

    const matchesBudget = minBudget <= budgetRange[1] && maxBudget >= budgetRange[0];

    return matchesActivityType && matchesAmenities && matchesRating && matchesDestination && matchesCategory && matchesBudget;
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
    <div className='mx-auto bg-light min-h-screen font-sans' style={{ backgroundImage: `url(${wave})`, backgroundSize: 'auto', backgroundRepeat: 'repeat', backgroundPosition: 'center' }}>
      <Nav />
      <Hero />
      <Search/>

      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12'>
        <h1 className='font-semibold text-3xl text-color1 mb-8'>Activities in Sorsogon</h1>

        {/* Toggle Button for Filters */}
        <div className="lg:hidden mb-4 bg-white">
          <Button aria-label="Close menu" onClick={toggleFilters} className="w-full bg-color1 text-color3">
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

                {/* Activity Type Filter */}
                <div className='mb-6 max-h-[230px] overflow-auto scrollbar-custom'>
                    <h3 className='text-sm font-medium sticky top-0 bg-white z-10 text-gray-700 mb-2'>Activity Type</h3>
                    <CheckboxGroup
                        value={selectedActivities}
                        onChange={handleActivityChange}
                    >
                        {activityTypes.map((type) => (
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
                        {['Parking', 'Restrooms', 'Guides'].map((amenity) => (
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
          {/* Activity List */}
          <div className="w-full lg:w-3/4 max-h-[1300px] overflow-y-auto scrollbar-custom p-2">
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {loading ? (
                Array.from({ length: 2 }).map((_, index) => {
                  const opacity = 1 - index * 0.25;
                  return (
                    <SwiperSlide key={index} className="flex justify-center" style={{ opacity }}>
                      <div className="bg-white rounded-lg shadow-lg duration-300 flex flex-col justify-between w-full mx-auto h-[400px] p-2 relative gap-2">
                        <Skeleton className="w-full h-56 rounded-t-lg" />
                        <div className="flex-grow flex flex-col justify-between mt-4 px-2">
                          <div className="p-2">
                            <Skeleton className="h-3 mb-4" />
                            <Skeleton className="h-6 mb-4" />
                            <Skeleton className="h-4 mb-4" />
                            <Skeleton className="h-5 mb-3" />
                            <Skeleton className="h-10" />
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  );
                })
              ) : (
                filteredActivities.length > 0 ? (
                  filteredActivities.map((activity, index) => (
                    <motion.div
                      key={index}
                      className="bg-white rounded-lg shadow-lg p-2 hover:shadow-slate-500 hover:scale-105 duration-300 flex flex-col justify-between w-full mx-auto h-[400px]"
                      variants={cardVariants}
                    >
                      {/* Card Image */}
                      <div className="w-full h-48 border bg-gray-200 rounded-t-lg overflow-hidden">
                        {activity.cardImage ? (
                          <img
                            src={activity.cardImage ? `${BASE_URL}/${activity.cardImage}` : `${BASE_URL}/${activity.businessLogo}`}
                            alt={activity.businessName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span>No Image</span>
                          </div>
                        )}
                      </div>

                      {/* Card Content */}
                      <div className="p-4 flex-grow">
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-2">
                          {activity.category.map((cat, index) => (
                            <span
                              key={index}
                              className={`text-xs px-2 py-1 rounded-full ${
                                selectedActivities
                                  .map((a) => a.toLowerCase())
                                  .includes(cat.toLowerCase().replace(/s$/, ''))
                                  ? 'bg-color2 text-white'
                                  : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              {cat}
                            </span>
                          ))}
                        </div>

                        <div className='flex gap-2 items-center flex-wrap'>
                          {/* Business Name */}
                          <h3 className="text-lg sm:text-base lg:text-lg font-semibold text-gray-800 truncate">{activity.businessName}</h3>
                          <Tooltip className='bg-color1 '
                            content={
                              <div className="max-w-[300px] flex justify-center    p-1">
                                <div className="text-sm flex gap-1  font-light text-white    md:text-md text-start break-words">
            
                                <IoInformationCircleOutline className='text-light text-xl'/> {activity.description}
                                </div>
                              </div>
                            }
                            isOpen={openTooltip === activity.business_id} // Only open for the active item
                            onOpenChange={(open) => setOpenTooltip(open ? activity.business_id : null)} // Sync state
                          >
                            <button
                              className="bg-transparent z-10"
                              onClick={() => toggleTooltip(activity.business_id)}
                              aria-expanded={openTooltip === activity.business_id}
                            >
                              <IoInformationCircleOutline className="text-xl cursor-pointer" />
                            </button>
                          </Tooltip>
                        </div>

                        {/* Location */}
                        <div className="text-xs text-gray-500 mb-2 flex items-center">
                          <GiPositionMarker /> {activity.destination}
                        </div>

                      </div>
                      
                        {/* Ratings & Price */}
                        <div className="flex justify-between items-center p-2 mb-2 gap-2">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {activity.rating ? (
                                <>
                                  <span className="text-black text-[12px]">{activity.rating}</span>
                                  <span className="text-yellow-500">
                                    {'★'.repeat(Math.floor(activity.rating))}
                                    {'☆'.repeat(5 - Math.floor(activity.rating))}
                                  </span>
                                </>
                              ) : (
                                <span className="text-gray-500 text-[12px]">No ratings</span>
                              )}
                            </div>
                          </div>

                          <p className="font-semibold text-md">
                            {activity.lowest_price && activity.highest_price ? (
                              `₱${activity.lowest_price} - ₱${activity.highest_price}`
                            ) : (
                              <span className="text-gray-400 italic text-[12px]">Price Range Not available</span>
                            )}
                          </p>
                        </div>
                      {/* Explore More Button */}
                      <Link to={`/business/${encryptId(activity.business_id)}`} target="_blank">
                        <Button className="w-full rounded-md bg-color1 text-color3 hover:bg-color2">
                          Explore More
                        </Button>
                      </Link>
                    </motion.div>
                  ))
                ) : (
                  <p className="col-span-full text-center text-gray-500">No activities match your selected filters.</p>
                )
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

export default Activities;