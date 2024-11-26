import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Checkbox, CheckboxGroup, Select, SelectItem, Slider, Tabs, Tab, Textarea } from "@nextui-org/react";
import { motion } from 'framer-motion';
import { GiPositionMarker } from 'react-icons/gi';
import { Link } from 'react-router-dom';
import { FaSearch, FaPlus, FaTimes } from 'react-icons/fa';
import Swal from 'sweetalert2';
import CryptoJS from 'crypto-js';

// Function to encrypt the business_id
const encryptId = (id) => {
    const secretKey = import.meta.env.VITE_SECRET_KEY;
    if (!secretKey) {
      console.error('Secret key is not defined');
      return null;
    }
    const ciphertext = CryptoJS.AES.encrypt(id.toString(), secretKey).toString();
    return encodeURIComponent(ciphertext);
  };

const AddItemModal = ({ isOpen, onClose, onAddItem }) => {
    // State and mock data from Discover.jsx
    const [activeTab, setActiveTab] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const initialState = {
        priceRange: [0, 5000],
        selectedType: [],
        selectedAmenities: [],
        selectedRatings: [],
        selectedDestination: 'All',
    };
    const [allFilters, setAllFilters] = useState(initialState);
    const [activitiesFilters, setActivitiesFilters] = useState(initialState);
    const [accommodationsFilters, setAccommodationsFilters] = useState(initialState);
    const [foodFilters, setFoodFilters] = useState({ ...initialState, selectedCuisine: [] });
    const [shopFilters, setShopFilters] = useState({ ...initialState, selectedCategory: [] });

    const destinations = [
        'All', 'Bulusan', 'Bulan', 'Barcelona', 'Casiguran', 'Castilla', 'Donsol', 'Gubat', 'Irosin', 'Juban', 'Magallanes', 'Matnog', 'Pilar', 'Prieto Diaz', 'Sta. Magdalena', 'Sorsogon City'
    ];

    const activityTypes = ['Hiking', 'Water Sports', 'Relaxation', 'Adventure'];
    const accommodationTypes = ['Cabins', 'Resorts', 'Hotels', 'Hostels'];
    const foodTypes = ['Restaurant', 'Bar', 'Cafe'];
    const cuisines = ['Filipino', 'International', 'Chinese', 'Japanese', 'Italian', 'Cafe'];
    const amenitiesList = ['WiFi', 'Outdoor Seating', 'Live Music', 'Happy Hour', 'Family-Friendly', 'Vegan Options'];
    const shopTypes = ['Souvenir Shop', 'Clothing Store', 'Grocery Store', 'Electronics Store', 'Bookstore'];
    const categories = ['Handicrafts', 'Fashion', 'Food', 'Electronics', 'Books', 'Home Decor' , 'Souvenir Shop'];

    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value.toLowerCase());
    };

    const [mockData, setMockData] = useState({
    activities: [],
    accommodations: [],
    restaurant: [],
    shop: []
    });

    const [businesses, setBusinesses] = useState([]);
    const businesscategories = ['activity', 'accommodation', 'restaurant', 'shop'];
    
    // Fetch businesses from the backend
  useEffect(() => {
    const fetchBusinesses = async (businessType) => {
      try {
        const response = await fetch(`http://localhost:5000/getAllBusinesses?businessType=${businessType}`);
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          // console.log('Data:', data);
          if (data.success) {
            // console.log(`Fetching data for businessType: ${businessType}`);

            const filteredBusinesses = data.businesses.filter((business) => {
              return business.businessType === businessType || (businessType === 'activity' && business.businessType === 'attraction');
            });

            const businessTypeKey = businessType === 'activity' || businessType === 'attraction' ? 'activities' :
                                    businessType === 'accommodation' ? 'accommodations' :
                                    businessType === 'restaurant' ? 'restaurant' : 'shop';

            setMockData((prevData) => ({
              ...prevData,
              [businessTypeKey]: filteredBusinesses,
            }));

            // console.log('Filtered Businesses:', filteredBusinesses);
          } else {
            console.error(`Failed to fetch ${businessType} data:`, data.message);
          }
        } else {
          console.error(`Unexpected response format for ${businessType}:`, response);
        }
      } catch (error) {
        console.error(`Error fetching ${businessType}:`, error);
      }
    };

    // Initiate data fetching for each businessType
    businesscategories.forEach((businessType) => {
      fetchBusinesses(businessType);
    });
  }, []);

  // Update businesses state and document title
  useEffect(() => {
    setBusinesses([
      ...mockData.activities,
      ...mockData.accommodations,
      ...mockData.restaurant,
      ...mockData.shop,
    ]);
    document.title = 'RabaSorsogon | Discover';
    // setLoading(false); // Set loading to false after data is set
  }, [mockData.activities, mockData.accommodations, mockData.restaurant, mockData.shop]);


    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring',
                stiffness: 100,
                damping: 12,
            },
        },
    };

    // Functions from Discover.jsx
    const handleRatingClick = (rating, setFilters) => {
        setFilters((prevFilters) => {
            const prevSelectedRatings = prevFilters.selectedRatings || [];
            if (rating === 'All') {
            return { ...prevFilters, selectedRatings: [] }; // Reset to an empty array
            } else {
            const newSelectedRatings = prevSelectedRatings.includes(rating)
                ? prevSelectedRatings.filter((r) => r !== rating)
                : [...prevSelectedRatings, rating];
            return { ...prevFilters, selectedRatings: newSelectedRatings };
            }
        });
    };

    const filterData = (data, filters) => {
        return data.filter(item => {
          const matchesType = filters.selectedType.length === 0 || 
            filters.selectedType.every(type => 
              item.category.map(cat => cat.toLowerCase().replace(/s$/, '')).includes(type.toLowerCase().replace(/s$/, ''))
            );
         
          const matchesCategory = filters.selectedCategory?.length === 0 || 
            filters.selectedCategory.every(category => 
              item.category.map(cat => cat.toLowerCase().replace(/s$/, '')).includes(category.toLowerCase().replace(/s$/, ''))
            );
          
          const matchesCuisine = filters.selectedCuisine?.length === 0 || 
            filters.selectedCuisine.every(cuisine => 
              item.category.map(cat => cat.toLowerCase().replace(/s$/, '')).includes(cuisine.toLowerCase().replace(/s$/, ''))
            );
    
          // console.log('selectedCuisine', filters.selectedCuisine);
          // console.log('item.category', item.category);
    
          const matchesAmenities = filters.selectedAmenities.length === 0 || 
            filters.selectedAmenities.every(amenity => 
              item.amenities.map(a => a.toLowerCase().replace(/s$/, '')).includes(amenity.toLowerCase().replace(/s$/, ''))
            );
    
          const matchesRatings = filters.selectedRatings.length === 0 || 
            filters.selectedRatings.includes(Math.floor(item.rating || 0));
    
          const matchesDestination = filters.selectedDestination === 'All' || filters.selectedDestination === item.destination;
          
          const matchesPriceRange = item.lowest_price <= filters.priceRange[1] && item.highest_price >= filters.priceRange[0];
    
          return matchesType && matchesCategory && matchesCuisine && matchesAmenities && matchesRatings && matchesDestination && matchesPriceRange;
        });
    };
    

    const renderFilters = (filters, setFilters, types, additionalFilters = null, isAllTab = false) => (
        <div className="w-full max-h-screen overflow-auto scrollbar-custom  ">
            <div className="bg-white shadow-slate-500  p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Filters</h2>
                
                {/* Destination Dropdown */}
                <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Destination</h3>
                    <Select
                        placeholder="Select Destination"
                        selectedKeys={[filters.selectedDestination]}
                        onSelectionChange={(value) => setFilters(prev => ({ ...prev, selectedDestination: value.currentKey }))}
                    >
                        {destinations.map((destination) => (
                            <SelectItem key={destination} value={destination}>
                                {destination}
                            </SelectItem>
                        ))}
                    </Select>
                </div>

                {/* Type Filter */}
                {isAllTab && (
                    <>
                        <div className="mb-6 max-h-screen overflow-auto scrollbar-custom ">
                            <h3 className="text-sm font-medium sticky top-0 bg-white z-10 text-gray-700 mb-2">Activity Type</h3>
                            <CheckboxGroup
                                value={filters.selectedType}
                                onChange={(value) => setFilters(prev => ({ ...prev, selectedType: value }))}
                            >
                                {activityTypes.map((type) => (
                                    <Checkbox key={type} value={type}>
                                        {type}
                                    </Checkbox>
                                ))}
                            </CheckboxGroup>
                        </div>

                        <div className="mb-6 max-h-[230px] overflow-auto scrollbar-custom">
                            <h3 className="text-sm font-medium sticky top-0 bg-white z-10 text-gray-700 mb-2">Accommodation Type</h3>
                            <CheckboxGroup
                                value={filters.selectedType}
                                onChange={(value) => setFilters(prev => ({ ...prev, selectedType: value }))}
                            >
                                {accommodationTypes.map((type) => (
                                    <Checkbox key={type} value={type}>
                                        {type}
                                    </Checkbox>
                                ))}
                            </CheckboxGroup>
                        </div>

                        <div className="mb-6 max-h-[230px] overflow-auto scrollbar-custom">
                            <h3 className="text-sm font-medium sticky top-0 bg-white z-10 text-gray-700 mb-2">Food Type</h3>
                            <CheckboxGroup
                                value={filters.selectedType}
                                onChange={(value) => setFilters(prev => ({ ...prev, selectedType: value }))}
                            >
                                {foodTypes.map((type) => (
                                    <Checkbox key={type} value={type}>
                                        {type}
                                    </Checkbox>
                                ))}
                            </CheckboxGroup>
                        </div>

                        <div className="mb-6 max-h-[230px] overflow-auto scrollbar-custom">
                            <h3 className="text-sm font-medium sticky top-0 bg-white z-10 text-gray-700 mb-2">Shop Type</h3>
                            <CheckboxGroup
                                value={filters.selectedType}
                                onChange={(value) => setFilters(prev => ({ ...prev, selectedType: value }))}
                            >
                                {shopTypes.map((type) => (
                                    <Checkbox key={type} value={type}>
                                        {type}
                                    </Checkbox>
                                ))}
                            </CheckboxGroup>
                        </div>
                    </>
                )}

                {/* Additional Filters */}
                {additionalFilters}

                {/* Amenities Filter */}
                <div className="mb-6 max-h-[230px] overflow-auto scrollbar-custom">
                    <h3 className="text-sm font-medium  bg-white z-10 text-gray-700 mb-2">Amenities</h3>
                    <CheckboxGroup
                        value={filters.selectedAmenities}
                        onChange={(value) => setFilters(prev => ({ ...prev, selectedAmenities: value }))}
                    >
                        {amenitiesList.map((amenity) => (
                            <Checkbox key={amenity} value={amenity}>
                                {amenity}
                            </Checkbox>
                        ))}
                    </CheckboxGroup>
                </div>

                {/* Price Range Filter */}
                <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Price Range (PHP)</h3>
                    <Slider
                        step={100}
                        minValue={0}
                        maxValue={5000}
                        value={filters.priceRange}
                        onChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}
                        formatOptions={{ style: 'currency', currency: 'PHP' }}
                        className="max-w-md flex"
                    />
                    <div className="flex justify-between text-xs">
                        <span>₱{filters.priceRange[0]}</span>
                        <span>₱{filters.priceRange[1]}+</span>
                    </div>
                </div>

                {/* Ratings Filter */}
                <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Ratings</h3>
                    <div className="space-y-2">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                onChange={() => handleRatingClick('All', setFilters)}
                                checked={Array.isArray(filters.selectedRatings) && filters.selectedRatings.length === 0}
                                className="form-checkbox text-color2"
                            />
                            <span className="ml-2 text-sm">All Ratings</span>
                        </label>
                        {[5, 4, 3, 2, 1].map((star) => (
                            <label key={star} className="flex items-center">
                                <input
                                type="checkbox"
                                onChange={() => handleRatingClick(star, setFilters)}
                                checked={Array.isArray(filters.selectedRatings) && filters.selectedRatings.includes(star)}
                                className="form-checkbox text-color2"
                                />
                                <span className="ml-2 text-sm flex items-center">
                                {'★'.repeat(star)}{'☆'.repeat(5 - star)}
                                <span className="ml-1">{star} Star{star > 1 ? 's' : ''}</span>
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

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

    const renderTitleWithBoldSearch = (title) => {
        const words = title.split(' ');
        return words.map((word, index) => {
            const lowerCaseWord = word.toLowerCase();
            const isMatch = searchQuery && lowerCaseWord.includes(searchQuery);
            return (
                <span key={index} style={{ fontWeight: isMatch ? 'bold' : 'normal' }}>
                    {word}{' '}
                </span>
            );
        });
    };

    const [selectedItems, setSelectedItems] = useState([]);

    const [isSideUIVisible, setIsSideUIVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [itineraryTime, setItineraryTime] = useState('');
    const [checkInTime, setCheckInTime] = useState('');
    const [checkOutTime, setCheckOutTime] = useState('');
    const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);
    const [notes, setNotes] = useState('');

    const handleAddItemClick = (item) => {
        setSelectedItem(item);
        setIsSideUIVisible(true);
    };

    const formatTime = (time) => {
        if (!time) return 'Not specified';
        const [hour, minute] = time.split(':');
        return `${hour}:${minute || '00'} ${hour >= 12 ? 'PM' : 'AM'}`;
    };

    const handleAddToItinerary = () => {
        Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to add this to your itinerary?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#0BDA51',
            cancelButtonColor: '#D33736',
            confirmButtonText: 'Yes, add it!'
        }).then((result) => {
            if (result.isConfirmed) {
                onAddItem({
                    title: selectedItem.businessName,
                    imageUrl: selectedItem.imageUrl,
                    time: itineraryTime || '',
                    isBooked: isBookingConfirmed,
                    notes: notes || 'No additional notes',
                });
                setIsSideUIVisible(false);
                Swal.fire({
                    title: 'Added!',
                    icon: 'success',
                    confirmButtonColor: '#0BDA51'
                }).then(() => {
                    onClose();
                });
            }
        });
    };

    return (
        <Modal 
            hideCloseButton 
            isOpen={isOpen} 
            onClose={onClose}
            isDismissable={false}
            className="rounded-lg shadow-lg mx-auto p-0 max-h-screen overflow-auto scrollbar-custom" 
            size='full'
        >
            <ModalContent>
                <ModalHeader className='w-full text-white flex justify-end items-center bg-color1 p-4'>
                   
                    <button 
                        aria-label="Close" 
                        className='text-white hover:text-gray-300 transition-colors duration-200'
                        onClick={onClose}
                    >
                        <FaTimes />
                    </button>
                </ModalHeader>
                <ModalBody className='bg-light'>
                <h1 className="text-center text-lg md:text-xl lg:text-2xl flex-grow">
                        Your Travel Itinerary: Must-Do Activities, Stay Options, Food Spots & Shopping Spots
                    </h1>
                    {/* Search Input */}
                    <div className="mb-4 relative">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="w-full p-2 pl-10 border border-gray-300 rounded"
                        />
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>

                    {/* Tabs and Filters */}
                    <Tabs
                        aria-label="Discover Tabs"
                        variant="underlined"
                        className="mb-4 overflow-x-auto w-full"
                        onSelectionChange={(key) => setActiveTab(key)}
                        selectedKey={activeTab}
                    >
                        <Tab key="all" title="All" />
                        <Tab key="activities" title="Activities" />
                        <Tab key="accommodations" title="Accommodations" />
                        <Tab key="restaurant" title="Food Places" />
                        <Tab key="shop" title="Shops" />
                    </Tabs>

                    {/* Toggle Button for Filters */}
                    <div className="lg:hidden mb-4  bg-white">
                        <Button onClick={toggleFilters} className="w-full bg-color1 text-color3">
                            {showFilters ? 'Hide Filters' : 'Show Filters'}
                        </Button>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Conditionally render filters based on screen size and toggle state */}
                        {(showFilters || isLargeScreen) && (
                            <div className="w-full lg:w-1/3 max-h-screen lg:sticky lg:top-0 lg:z-30">
                                {activeTab === 'all' && renderFilters(allFilters, setAllFilters, [...activityTypes, ...accommodationTypes, ...foodTypes, ...shopTypes], null, true)}
                                {activeTab === 'activities' && renderFilters(activitiesFilters, setActivitiesFilters, activityTypes)}
                                {activeTab === 'accommodations' && renderFilters(accommodationsFilters, setAccommodationsFilters, accommodationTypes)}
                                {activeTab === 'restaurant' && renderFilters(foodFilters, setFoodFilters, foodTypes, (
                                    <div className="mb-6 overflow-auto scrollbar-custom">
                                        <h3 className="text-sm font-medium sticky top-0 bg-white z-10 text-gray-700 mb-2">Cuisine</h3>
                                        <CheckboxGroup
                                            value={foodFilters.selectedCuisine}
                                            onChange={(value) => setFoodFilters(prev => ({ ...prev, selectedCuisine: value }))}
                                        >
                                            {cuisines.map((cuisine) => (
                                                <Checkbox key={cuisine} value={cuisine}>
                                                    {cuisine}
                                                </Checkbox>
                                            ))}
                                        </CheckboxGroup>
                                    </div>
                                ))}
                                {activeTab === 'shop' && renderFilters(shopFilters, setShopFilters, shopTypes, (
                                    <div className="mb-6 overflow-auto scrollbar-custom">
                                        <h3 className="text-sm font-medium sticky top-0 bg-white z-10 text-gray-700 mb-2">Category</h3>
                                        <CheckboxGroup
                                            value={shopFilters.selectedCategory}
                                            onChange={(value) => setShopFilters(prev => ({ ...prev, selectedCategory: value }))}
                                        >
                                            {categories.map((category) => (
                                                <Checkbox key={category} value={category}>
                                                    {category}
                                                </Checkbox>
                                            ))}
                                        </CheckboxGroup>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Content Section */}
                        <div className="w-full max-h-screen overflow-auto scrollbar-hide p-4">
                            <motion.div 
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                {Object.keys(mockData).map((category) => {
                                // console.log('Category:', category);
                                // console.log('Active Tab:', activeTab);
                                // console.log('mockData:', mockData[category]);

                                if (activeTab !== 'all' && activeTab !== category) return null;

                                const filters = {
                                selectedType: activeTab === 'restaurant' ? foodFilters.selectedType :
                                                activeTab === 'shop' ? shopFilters.selectedType :
                                                activeTab === 'activities' ? activitiesFilters.selectedType :
                                                activeTab === 'accommodations' ? accommodationsFilters.selectedType :
                                                allFilters.selectedType,
                                selectedCategory: activeTab === 'shop' ? shopFilters.selectedCategory : [],
                                selectedAmenities: activeTab === 'restaurant' ? foodFilters.selectedAmenities :
                                                    activeTab === 'shop' ? shopFilters.selectedAmenities :
                                                    activeTab === 'activities' ? activitiesFilters.selectedAmenities :
                                                    activeTab === 'accommodations' ? accommodationsFilters.selectedAmenities :
                                                    allFilters.selectedAmenities,
                                selectedRatings: activeTab === 'restaurant' ? foodFilters.selectedRatings :
                                                activeTab === 'shop' ? shopFilters.selectedRatings :
                                                activeTab === 'activities' ? activitiesFilters.selectedRatings :
                                                activeTab === 'accommodations' ? accommodationsFilters.selectedRatings :
                                                allFilters.selectedRatings,
                                selectedDestination: activeTab === 'restaurant' ? foodFilters.selectedDestination :
                                                    activeTab === 'shop' ? shopFilters.selectedDestination :
                                                    activeTab === 'activities' ? activitiesFilters.selectedDestination :
                                                    activeTab === 'accommodations' ? accommodationsFilters.selectedDestination :
                                                    allFilters.selectedDestination,
                                priceRange: activeTab === 'restaurant' ? foodFilters.priceRange :
                                            activeTab === 'shop' ? shopFilters.priceRange :
                                            activeTab === 'activities' ? activitiesFilters.priceRange :
                                            activeTab === 'accommodations' ? accommodationsFilters.priceRange :
                                            allFilters.priceRange,
                                selectedCuisine: activeTab === 'restaurant' ? foodFilters.selectedCuisine : [],
                                };

                                const filteredItems = filterData(mockData[category], filters);

                                // console.log('filteredItems:', filteredItems);

                                return filteredItems.map((item, index) => (
                                        <motion.div
                                            key={index}
                                            className="bg-white rounded-lg shadow-lg hover:shadow-slate-500 hover:scale-105 duration-300 relative"
                                            variants={cardVariants}
                                        >
                                            <button
                                                className="absolute top-2 right-2 bg-color1 text-color3 p-1 rounded-full"
                                                onClick={() => handleAddItemClick(item)}
                                            >
                                                <FaPlus />
                                            </button>
                                            <img
                                                src={`http://localhost:5000/${item.businessLogo}`}
                                                alt={item.businessName}
                                                className="w-full h-48 object-cover rounded-t-lg"
                                            />
                                            <div className="p-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <div className="flex flex-wrap gap-2">
                                                        {item.category.map((cat, idx) => (
                                                            <span key={idx} className="bg-color2 text-color3 text-xs px-2 py-1 rounded-full">
                                                                {cat}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                    {item.rating ? (
                                                        <>
                                                        <span className="text-[12px]">{parseFloat(item.rating).toFixed(1)}</span>
                                                        <span className="text-yellow-500">
                                                            {'★'.repeat(Math.floor(item.rating))}
                                                            {'☆'.repeat(5 - Math.floor(item.rating))}
                                                        </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-500 text-[12px]">No ratings</span>
                                                    )}
                                                    </div>
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-800">
                                                    {renderTitleWithBoldSearch(item.businessName)}
                                                </h3>
                                                <div className="text-xs text-gray-500 mb-2 flex items-center">
                                                    <GiPositionMarker className="mr-1" />
                                                    {item.destination}
                                                </div>
                                                <div className="flex mb-2 max-w-[500px] max-h-[5rem] overflow-y-auto scrollbar-custom flex-col">
                                                {item.description ? (
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        {item.description}
                                                    </p>
                                                    ) : (
                                                    <p className="text-sm text-gray-400 italic mb-2">
                                                        No description
                                                    </p>
                                                    )}
                                                </div>
                                                <p className="text-md font-semibold text-black mb-2">
                                                {item.lowest_price && item.highest_price ? (
                                                    `₱${item.lowest_price} - ₱${item.highest_price}`
                                                    ) : (
                                                    <span className="text-gray-400 italic">Price Range Not available</span>
                                                    )}
                                                </p>
                                                <Button as={Link} to={`/business/${encryptId(item.business_id)}`} target="_blank" className="w-full bg-color1 text-color3 hover:bg-color2">
                                                    View
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ))
                                })}
                                {/* No Results Message */}
                                {Object.keys(mockData).every(category => 
                                    filterData(mockData[category], {
                                        selectedType: activeTab === 'restaurant' ? foodFilters.selectedType :
                                                        activeTab === 'shop' ? shopFilters.selectedType :
                                                        activeTab === 'activities' ? activitiesFilters.selectedType :
                                                        activeTab === 'accommodations' ? accommodationsFilters.selectedType :
                                                        allFilters.selectedType,
                                        selectedCategory: activeTab === 'shop' ? shopFilters.selectedCategory : [],
                                        selectedAmenities: activeTab === 'restaurant' ? foodFilters.selectedAmenities :
                                                            activeTab === 'shop' ? shopFilters.selectedAmenities :
                                                            activeTab === 'activities' ? activitiesFilters.selectedAmenities :
                                                            activeTab === 'accommodations' ? accommodationsFilters.selectedAmenities :
                                                            allFilters.selectedAmenities,
                                        selectedRatings: activeTab === 'restaurant' ? foodFilters.selectedRatings :
                                                        activeTab === 'shop' ? shopFilters.selectedRatings :
                                                        activeTab === 'activities' ? activitiesFilters.selectedRatings :
                                                        activeTab === 'accommodations' ? accommodationsFilters.selectedRatings :
                                                        allFilters.selectedRatings,
                                        selectedDestination: activeTab === 'restaurant' ? foodFilters.selectedDestination :
                                                            activeTab === 'shop' ? shopFilters.selectedDestination :
                                                            activeTab === 'activities' ? activitiesFilters.selectedDestination :
                                                            activeTab === 'accommodations' ? accommodationsFilters.selectedDestination :
                                                            allFilters.selectedDestination,
                                        priceRange: activeTab === 'restaurant' ? foodFilters.priceRange :
                                                    activeTab === 'shop' ? shopFilters.priceRange :
                                                    activeTab === 'activities' ? activitiesFilters.priceRange :
                                                    activeTab === 'accommodations' ? accommodationsFilters.priceRange :
                                                    allFilters.priceRange,
                                        selectedCuisine: activeTab === 'restaurant' ? foodFilters.selectedCuisine : [],
                                    }).length === 0
                                ) && (
                                    <div className="flex text-center text-gray-500 italic">
                                        No results found
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </div>

                    {/* Side UI for adding to itinerary */}
                    {isSideUIVisible && selectedItem && (
                        <motion.div
                            className="fixed right-0 top-0 h-full w-full md:w-2/3 lg:w-1/3 bg-white shadow-lg p-4 overflow-y-auto z-50"
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Add to Itinerary</h2>
                                <Button auto color='danger' flat onClick={() => setIsSideUIVisible(false)}>Close</Button>
                            </div>
                            <div className="mb-4">
                                <img src={`http://localhost:5000/${selectedItem.businessLogo}`} alt={selectedItem.businessName} className="w-full h-48 object-cover rounded-md" />
                            </div>
                            <h3 className="text-lg font-bold">{selectedItem.title}</h3>
                            <p className="text-sm text-gray-500 mb-2">{selectedItem.destination}</p>
                            <p className="text-sm text-gray-600 mb-2">{selectedItem.description}</p>
                            <p className="text-md font-semibold text-black mb-2">
                                {selectedItem.lowest_price && selectedItem.highest_price ? (
                                `₱${selectedItem.lowest_price} - ₱${selectedItem.highest_price}`
                                ) : (
                                <span className="text-gray-400 italic">Price Range Not available</span>
                                )}
                            </p>
                            <div className="flex items-center mb-4">
                                {selectedItem.rating ? (
                                    <>
                                    <span className="text-yellow-500">
                                        {'★'.repeat(Math.floor(selectedItem.rating))}
                                        {'☆'.repeat(5 - Math.floor(selectedItem.rating))}
                                    </span>
                                    <span className="ml-2 text-sm">{parseFloat(selectedItem.rating).toFixed(1)} Stars</span>
                                    </>
                                ) : (
                                    <span className="text-gray-500 text-[12px]">No ratings</span>
                                )}
                            </div>
                            {selectedItem.type === 'Accommodations' ? (
                                <>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700">Check-In Time</label>
                                        <input
                                            type="time"
                                            value={checkInTime}
                                            onChange={(e) => setCheckInTime(e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-md"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700">Check-Out Time</label>
                                        <input
                                            type="time"
                                            value={checkOutTime}
                                            onChange={(e) => setCheckOutTime(e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 rounded-md"
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Time</label>
                                    <input
                                        type="time"
                                        value={itineraryTime}
                                        onChange={(e) => setItineraryTime(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md"
                                    />
                                </div>
                            )}
                            <div className="mb-4">
                                <Checkbox
                                    isSelected={isBookingConfirmed}
                                    onChange={() => setIsBookingConfirmed(!isBookingConfirmed)}
                                    color="primary"
                                >
                                    Yes, I have booked this
                                </Checkbox>
                            </div>
                            <Textarea
                                label="Notes"
                                placeholder="Enter any notes here..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                fullWidth
                            />
                            <Button onClick={handleAddToItinerary} className="w-full bg-color1 text-color3">
                                Add to Itinerary
                            </Button>
                        </motion.div>
                    )}
                </ModalBody>
                <ModalFooter className=' bg-white flex items-center w-full border'>
                    <Button className='max-md:w-full' color='danger' onClick={onClose}>Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default AddItemModal;