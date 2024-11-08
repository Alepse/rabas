import React, { useState, useEffect } from 'react';
import {Link} from 'react-router-dom';
import { motion } from 'framer-motion';
import Nav from '../components/nav';
import Hero from '../components/heroaccomodation';
import Footer from '@/components/Footer';
import Antonio from '../assets/antonio.jpg';
import {  Button, Slider, Spinner } from "@nextui-org/react";
import { Checkbox, CheckboxGroup, Select, SelectItem } from "@nextui-org/react";
import { GiPositionMarker } from "react-icons/gi";
import Search from '@/components/Search';





const Accomodation = () => {
    const [selectedAccommodation, setSelectedAccommodation] = useState([]);
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [selectedRatings, setSelectedRatings] = useState([]);
    const [selectedDestination, setSelectedDestination] = useState('All');
    const [budgetRange, setBudgetRange] = useState([0, 10000]); // Budget range slider
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedTags, setSelectedTags] = useState([]); // New state for selected tags
    const [showButton, setShowButton] = useState(false); // State to show/hide button



       // Title Tab
  useEffect(() => {
    document.title = 'RabaSorsogon | Accomodations';
  });


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

    const isLargeScreen = useIsLargeScreen();

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

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
  

    if (loading) {
        return <Spinner className='flex justify-center items-center h-screen' size='lg' label="Loading..." color="primary" />;
    }

    // Accommodation details (mock data)
    const accommodationDetails = [
        {
            name: 'Luxury Hotel',
            description: 'A luxurious stay with world-class facilities and services',
            image: Antonio,
            tags: ['Hotel'],
            amenities: ['Wi-Fi', 'Breakfast', 'Parking'],
            rating: 5,
            destination: 'Sorsogon City',
            price: '4000-10000',
        },
        {
            name: 'Cozy Inn',
            description: 'A comfortable and budget-friendly inn, perfect for short stays.',
            image: Antonio,
            tags: ['Inn'],
            amenities: ['Parking', 'Wi-Fi'],
            rating: 4,
            destination: 'Gubat',
            price: '1500-3000',
        },
        {
            name: 'Beachfront Lodge',
            description: 'A lodge with a perfect view of the beach and peaceful surroundings.',
            image: Antonio,
            tags: ['Lodge'],
            amenities: ['Breakfast', 'Wi-Fi'],
            rating: 3,
            destination: 'Barcelona',
            price: '2000-5000',
        },
        {
            name: 'Mountain Resort',
            description: 'A serene resort in the mountains, ideal for a relaxing getaway.',
            image: Antonio,
            tags: ['Resort'],
            amenities: ['Parking', 'Wi-Fi', 'Pool'],
            rating: 5,
            destination: 'Bulusan',
            price: '3000-7000',
        },
        // Add more accommodations as needed
    ];

    const destinations = [
        'All', 'Bulusan', 'Bulan', 'Barcelona', 'Casiguran', 'Castilla', 'Donsol', 'Gubat', 'Irosin', 'Juban', 'Magallanes', 'Matnog', 'Pilar', 'Prieto Diaz', 'Sta. Magdalena', 'Sorsogon City'
    ];

    const accommodationTypes = ['Hotel', 'Inn', 'Lodge', 'Resort'];
    const amenitiesList = ['Wi-Fi', 'Breakfast', 'Parking', 'Pool'];

    // Handle rating selection
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

    const handleAccommodationTypeChange = (selected) => {
        setSelectedAccommodation(selected);
        setSelectedTags(selected); // Sync selected tags with accommodation types
    };

    const handleAmenitiesChange = (selected) => {
        setSelectedAmenities(selected);
    };

    const handleDestinationChange = (destination) => {
        setSelectedDestination(destination);
    };

    const handleBudgetChange = (value) => {
        setBudgetRange(value);
    };

    // Filtering the accommodations based on selected filters
    const filteredAccommodations = accommodationDetails.filter((accommodation) => {
        const matchesType = selectedAccommodation.length === 0 || selectedAccommodation.every((type) => accommodation.tags.includes(type));
        const matchesAmenities = selectedAmenities.length === 0 || selectedAmenities.every((amenity) => accommodation.amenities.includes(amenity));
        const matchesRating = selectedRatings.length === 0 || selectedRatings.includes(accommodation.rating);
        const matchesDestination = selectedDestination === 'All' || accommodation.destination === selectedDestination;
        const [minPrice, maxPrice] = accommodation.price.split('-').map(Number);
        const matchesBudget = minPrice >= budgetRange[0] && maxPrice <= budgetRange[1];
        const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => accommodation.tags.includes(tag)); // Match all selected tags

        return matchesType && matchesAmenities && matchesRating && matchesDestination && matchesBudget && matchesTags;
    });

    // Animation variants (same as Activities.jsx)
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
                <div className="lg:hidden mb-4  bg-white">
                    <Button onClick={toggleFilters} className="w-full bg-color1 text-color3">
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
                                        value={selectedAccommodation}
                                        onChange={handleAccommodationTypeChange}
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
                                        {amenitiesList.map((amenity) => (
                                            <Checkbox key={amenity} value={amenity}>
                                                {amenity}
                                            </Checkbox>
                                        ))}
                                    </CheckboxGroup>
                                </div>

                                {/* Budget Filter */}
                                <div className='mb-6'>
                                    <h3 className='text-sm font-medium text-gray-700 mb-2'>Budget (PHP)</h3>
                                    <Slider
                                        step={100}
                                        minValue={0}
                                        maxValue={10000}
                                        value={budgetRange}
                                        onChange={handleBudgetChange}
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
                            className='grid grid-cols-1 gap-6 overflow-y-auto max-h-[1000px] scrollbar-custom p-4'
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
                                            src={accommodation.image}
                                            alt={accommodation.name}
                                            className='w-full h-48 object-cover rounded-t-lg'
                                        />
                                        <div className='p-4'>
                                            <div className='flex justify-between items-center mb-4'>
                                                <div className='flex flex-wrap gap-2'>
                                                    {accommodation.tags.map((tag, index) => (
                                                        <span 
                                                            key={index} 
                                                            className={`text-xs px-2 py-1 rounded-full ${selectedTags.includes(tag) ? 'bg-color2 text-white' : 'bg-gray-200 text-gray-700'}`}
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className='flex items-center gap-1'>
                                                    <span className='text-[12px]'>{accommodation.rating}</span> 
                                                    <span className='text-yellow-500'>{'★'.repeat(accommodation.rating)}{'☆'.repeat(5 - accommodation.rating)}</span>
                                                </div>
                                            </div>
                                            <h2 className='text-lg font-semibold mb-2'>{accommodation.name}</h2>
                                            <div className='text-xs text-gray-500 mb-2 flex items-center'>
                                                <GiPositionMarker className="mr-1" />{accommodation.destination}
                                            </div>
                                            <div className='flex mb-2 max-w-[500px] max-h-[5rem] overflow-y-auto scrollbar-custom flex-col'>
                                                <p className='text-sm text-gray-600'>{accommodation.description}</p>
                                            </div>
                                            <p className='text-md mb-2 font-semibold'>₱{accommodation.price}</p>
                                            <Link to='/business' target='_blank'>
                                                <Button className='w-full bg-color1 text-color3 hover:bg-color2'>
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

export default Accomodation;
