import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Nav from '../components/nav';
import Hero from '../components/heroshop';
import Footer from '@/components/Footer';
import ShopImage from '../assets/shop.webp';
import { Button } from "@nextui-org/react";
import { Checkbox, CheckboxGroup, Select, SelectItem, Slider } from "@nextui-org/react";
import { GiPositionMarker } from "react-icons/gi";
import { Link } from 'react-router-dom';
import { Spinner } from '@nextui-org/react'; // Add this import
import Search from '@/components/Search';



const Shop = () => {
    const [selectedType, setSelectedType] = useState([]);
    const [selectedDestination, setSelectedDestination] = useState('All');
    const [selectedCategory, setSelectedCategory] = useState([]);
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [selectedRatings, setSelectedRatings] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 5000]); // Price range slider
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedTags, setSelectedTags] = useState([]); // New state for selected tags
    const [showButton, setShowButton] = useState(false); // State to show/hide button
       // Title Tab
  useEffect(() => {
    document.title = 'RabaSorsogon | Shops';
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

    // Shop Details (mock data)
    const shopDetails = [
        {
            name: 'Sample Souvenir Shop 1',
            description: 'A charming shop offering unique local souvenirs and handicrafts.',
            image: ShopImage,
            tags: ['Souvenir Shop', 'Local'],
            category: 'Handicrafts',
            Amenities: ['Local Products', 'Gift Wrapping'],
            destination: 'Sorsogon City',
            rating: 4,
            price: '500-1500',
        },
        {
            name: 'Sample Clothing Boutique 1',
            description: 'Trendy clothing store featuring both local and international fashion brands.',
            image: ShopImage,
            tags: ['Clothing Store', 'Fashion'],
            category: 'Fashion',
            Amenities: ['Fitting Rooms', 'Seasonal Sales'],
            destination: 'Gubat',
            rating: 5,
            price: '1000-3000',
        },
        {
            name: 'Sample Bookstore',
            description: 'A quaint bookstore with a vast selection of local and international books.',
            image: ShopImage,
            tags: ['Bookstore', 'Literature'],
            category: 'Books',
            Amenities: ['Reading Areas', 'Custom Orders'],
            destination: 'Matnog',
            rating: 3,
            price: '200-800',
        },
        {
            name: 'Sample Electronics Store',
            description: 'A store with a variety of electronic devices and accessories.',
            image: ShopImage,
            tags: ['Electronics Store', 'Gadgets'],
            category: 'Electronics',
            Amenities: ['Online Shopping', 'Custom Orders'],
            destination: 'Bulusan',
            rating: 4,
            price: '1500-5000',
        },
    ];

    const destinations = [
        'All', 'Bulusan', 'Bulan', 'Barcelona', 'Casiguran', 'Castilla', 'Donsol', 'Gubat', 'Irosin', 'Juban', 'Magallanes', 'Matnog', 'Pilar', 'Prieto Diaz', 'Sta. Magdalena', 'Sorsogon City'
    ];

    const shopTypes = [...new Set(shopDetails.flatMap(shop => shop.tags))];
    const categories = ['Handicrafts', 'Fashion', 'Food', 'Electronics', 'Books', 'Home Decor'];
    const amenitiesList = ['Local Products', 'Gift Wrapping', 'Fitting Rooms', 'Seasonal Sales', 'Online Shopping', 'Custom Orders'];

    // Handle Amenities selection
    const handleAmenitiesChange = (selected) => {
        setSelectedAmenities(selected);
    };

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

    const handleTypeChange = (selected) => {
        setSelectedType(selected);
    };

    const handleCategoryChange = (selected) => {
        setSelectedCategory(selected);
    };

    const handleDestinationChange = (destination) => {
        setSelectedDestination(destination);
    };

    const handleTagChange = (selected) => {
        setSelectedTags(selected);
    };

    // Filtering the shops based on selected filters
    const filteredShops = shopDetails.filter((shop) => {
        const matchType = selectedType.length === 0 || selectedType.every((type) => shop.tags.includes(type));
        const matchCategory = selectedCategory.length === 0 || selectedCategory.includes(shop.category);
        const matchAmenities = selectedAmenities.length === 0 || selectedAmenities.every(amenity => shop.Amenities.includes(amenity));
        const matchRating = selectedRatings.length === 0 || selectedRatings.includes(shop.rating);
        const matchDestination = selectedDestination === 'All' || shop.destination === selectedDestination;
        const [minPrice, maxPrice] = shop.price.split('-').map(Number);
        const matchPrice = minPrice <= priceRange[1] && maxPrice >= priceRange[0];
        const matchTags = selectedTags.length === 0 || selectedTags.every(tag => shop.tags.includes(tag));

        return matchType && matchCategory && matchAmenities && matchRating && matchDestination && matchPrice && matchTags;
    });

    // Animation variants for the container
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    // Animation variants for each shop card
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

    return (
        <div className='mx-auto bg-light min-h-screen font-sans'>
            <Nav />
            <Hero />
            <Search/>

            <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12'>
                <h1 className='font-semibold text-3xl text-color1 mb-8'>Shops in Sorsogon</h1>

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

                                {/* Shop Type Filter */}
                                <div className='mb-6 max-h-[230px] overflow-auto scrollbar-custom'>
                                    <h3 className='text-sm font-medium sticky top-0 bg-white z-10 text-gray-700 mb-2'>Shop Type</h3>
                                    <CheckboxGroup
                                        value={selectedType}
                                        onChange={handleTypeChange}
                                    >
                                        {shopTypes.map((type) => (
                                            <Checkbox key={type} value={type}>
                                                {type}
                                            </Checkbox>
                                        ))}
                                    </CheckboxGroup>
                                </div>

                                {/* Category Filter */}
                                <div className='mb-6 max-h-[230px] overflow-auto scrollbar-custom'>
                                    <h3 className='text-sm font-medium sticky top-0 bg-white z-10 text-gray-700 mb-2'>Category</h3>
                                    <CheckboxGroup
                                        value={selectedCategory}
                                        onChange={handleCategoryChange}
                                    >
                                        {categories.map((category) => (
                                            <Checkbox key={category} value={category}>
                                                {category}
                                            </Checkbox>
                                        ))}
                                    </CheckboxGroup>
                                </div>

                                {/* AmenitiesFilter */}
                                <div className='mb-6 max-h-[230px] overflow-auto scrollbar-custom'>
                                    <h3 className='text-sm font-medium sticky top-0 bg-white z-10 text-gray-700 mb-2'>Amenities</h3>
                                    <CheckboxGroup
                                        value={selectedAmenities}
                                        onChange={handleAmenitiesChange}
                                    >
                                        {amenitiesList.map((amenities) => (
                                            <Checkbox key={amenities} value={amenities}>
                                                {amenities}
                                            </Checkbox>
                                        ))}
                                    </CheckboxGroup>
                                </div>

                                {/* Price Range Filter */}
                                <div className='mb-6'>
                                    <h3 className='text-sm font-medium text-gray-700 mb-2'>Price Range (PHP)</h3>
                                    <Slider
                                        step={100}
                                        minValue={0}
                                        maxValue={5000}
                                        value={priceRange}
                                        onChange={setPriceRange}
                                        formatOptions={{ style: 'currency', currency: 'PHP' }}
                                        className="max-w-md flex"
                                    />
                                    <div className='flex justify-between text-xs'>
                                        <span>₱{priceRange[0]}</span>
                                        <span>₱{priceRange[1]}+</span>
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

                                {/* Tags Filter */}
                                <div className='mb-6 max-h-[230px] overflow-auto scrollbar-custom'>
                                    <h3 className='text-sm font-medium sticky top-0 bg-white z-10 text-gray-700 mb-2'>Tags</h3>
                                    <CheckboxGroup
                                        value={selectedTags}
                                        onChange={handleTagChange}
                                    >
                                        {shopTypes.map((tag) => (
                                            <Checkbox key={tag} value={tag}>
                                                {tag}
                                            </Checkbox>
                                        ))}
                                    </CheckboxGroup>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Shop List */}
                    <div className='w-full'>
                        <motion.div 
                            className='grid grid-cols-1 gap-6 overflow-y-auto max-h-[1000px] scrollbar-custom  p-4'
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {filteredShops.length > 0 ? (
                                filteredShops.map((shop, index) => (
                                    <motion.div
                                        key={index}
                                        className='bg-white rounded-lg shadow-lg hover:shadow-slate-500 hover:scale-105 duration-300'
                                        variants={cardVariants}
                                    >
                                        <img
                                            src={shop.image}
                                            alt={shop.name}
                                            className='w-full h-48 object-cover rounded-t-lg'
                                        />
                                        <div className='p-4'>
                                        <div className='flex justify-between items-center mb-2'>
                                            <div className='flex flex-wrap gap-2 mb-2'>
                                                {shop.tags.map((tag, index) => (
                                                    <span 
                                                        key={index} 
                                                        className={`text-xs px-2 py-1 rounded-full ${selectedType.includes(tag) ? 'bg-color2 text-white' : 'bg-gray-200 text-gray-700'}`}
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className='flex items-center mb-4'>
                                              <span className='text-[12px]'>{shop.rating}</span>  <span className='text-yellow-500'>{'★'.repeat(shop.rating)}{'☆'.repeat(5 - shop.rating)}</span>
                                            </div>
                                            </div>
                                            <h2 className='text-lg font-semibold mb-2'>{shop.name}</h2>
                                            <div className='text-xs text-gray-500 mb-2 flex items-center'><GiPositionMarker/>{shop.destination}</div>
                                            <div className=' flex mb-2  max-w-[500px] max-h-[5rem] overflow-y-auto scrollbar-custom  flex-col '>
                                            <p className='text-sm text-gray-600 mb-2'>{shop.description}</p>
                                            </div>
                                             <p className='text-md font-semibold mb-2'>₱{shop.price}</p>
                                            <Link to='/business' target='_blank'>
                                            <Button  className='w-full bg-color1 text-color3 hover:bg-color2'>
                                               Explore More
                                            </Button>
                                            </Link>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <p className='col-span-full text-center text-gray-500'>No shops match your selected filters.</p>
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

export default Shop;
