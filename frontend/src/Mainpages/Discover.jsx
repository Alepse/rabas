import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Nav from '@/components/nav';
import Hero from '@/components/herodiscover';
import Footer from '@/components/Footer';
import { Button, Checkbox, CheckboxGroup, Select, SelectItem, Slider, Tabs, Tab, Spinner} from '@nextui-org/react';
import { GiPositionMarker } from 'react-icons/gi';
import { Link } from 'react-router-dom';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Search from '@/components/Search';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';





// Mock Data
// const mockData = {
//   activities: [
//     {
//       title: 'Hiking Adventure',
//       description: 'Explore scenic mountain trails. Guide and equipment included.',
//       price: 1500,
//       imageUrl: 'https://via.placeholder.com/200',
//       rating: 4,
//       type: 'Hiking',
//       tags: ['Swimming', 'Surfing'],
//       amenities: ['Parking', 'Restrooms'],
//       destination: 'Donsol',
//       budget: '500-2000',
//       category: 'Relaxation',
//     },
//     {
//       title: 'Snorkeling Tour',
//       description: 'Discover the underwater world with a guided snorkeling tour.',
//       price: 1200,
//       imageUrl: 'https://via.placeholder.com/200',
//       rating: 3,
//       type: 'Water Sports',
//       tags: ['Swimming', 'Snorkeling'],
//       amenities: ['Guides', 'Restrooms'],
//       destination: 'Matnog',
//       budget: '500-3500',
//       category: 'Adventure',
//     },
//   ],
//   accommodations: [
//     {
//       title: 'Luxury Mountain Cabin',
//       description: 'Stay in a cozy cabin with scenic views and modern amenities.',
//       price: 5000,
//       imageUrl: 'https://via.placeholder.com/200',
//       rating: 5,
//       type: 'Cabins',
//       amenities: ['Wi-Fi', 'Breakfast', 'Parking'],
//       destination: 'Sorsogon City',
//       budget: '4000-10000',
//     },
//     {
//       title: 'Beachfront Resort',
//       description: 'Relax in a luxury resort right on the beach.',
//       price: 8000,
//       imageUrl: 'https://via.placeholder.com/200',
//       rating: 4,
//       type: 'Resorts',
//       amenities: ['Parking', 'Wi-Fi', 'Pool'],
//       destination: 'Bulusan',
//       budget: '3000-7000',
//     },
//   ],
//   restaurant: [
//     {
//       title: 'Mountain View Dining',
//       description: 'Experience local cuisine with a view of the mountains.',
//       price: 1000,
//       imageUrl: 'https://via.placeholder.com/200',
//       rating: 2,
//       type: 'Fine Dining',
//       amenities: ['Wi-Fi', 'Outdoor Seating'],
//       destination: 'Sorsogon City',
//       budget: '1000-2000',
//     },
//     {
//       title: 'Coastal Seafood Feast',
//       description: 'Indulge in fresh seafood dishes by the shore.',
//       price: 1500,
//       imageUrl: 'https://via.placeholder.com/200',
//       rating: 4,
//       type: 'Buffet',
//       amenities: ['Live Music', 'Happy Hour'],
//       destination: 'Gubat',
//       budget: '500-1000',
//     },
//   ],
//   shop: [
//     {
//       title: 'Local Handicrafts',
//       description: 'Shop unique handmade items from local artisans.',
//       price: 500,
//       imageUrl: 'https://via.placeholder.com/200',
//       rating: 3,
//       type: 'Local Crafts',
//       amenities: ['Local Products', 'Gift Wrapping'],
//       destination: 'Sorsogon City',
//       budget: '500-1500',
//     },
//     {
//       title: 'Souvenir Shop',
//       description: 'Get your souvenirs and take home memories of the trip.',
//       price: 700,
//       imageUrl: 'https://via.placeholder.com/200',
//       rating: 2,
//       type: 'Souvenirs',
//       amenities: ['Fitting Rooms', 'Seasonal Sales'],
//       destination: 'Gubat',
//       budget: '1000-3000',
//     },
//   ],
// };


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

const Discover = () => {
  //for maps
  const [currentZoom, setCurrentZoom] = useState(10); // Initial zoom level

  const [mockData, setMockData] = useState({
    activities: [],
    accommodations: [],
    restaurant: [],
    shop: []
  });
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showButton, setShowButton] = useState(false); // State to show/hide button

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
    setLoading(false); // Set loading to false after data is set
  }, [mockData.activities, mockData.accommodations, mockData.restaurant, mockData.shop]);

  const initialState = {
    priceRange: [0, 10000],
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

  const activityTypes = ['Hiking', 'Water Sports', 'Relaxation', 'Adventure', 'Attraction'];
  const accommodationTypes = ['Cabins', 'Resorts', 'Hotels', 'Hostels'];
  const foodTypes = ['Restaurant', 'Bar', 'Cafe'];
  const cuisines = ['Filipino', 'International', 'Chinese', 'Japanese', 'Italian', 'cafe'];
  const amenitiesList = ['WiFi', 'Outdoor Seating', 'Live Music', 'Happy Hour', 'Family-Friendly', 'Vegan Options'];
  const shopTypes = ['Souvenir Shop', 'Clothing Store', 'Grocery Store', 'Electronics Store', 'Bookstore'];
  const categories = ['Souvenir Shop', 'Handicrafts', 'Fashion', 'Food', 'Electronics', 'Books', 'Home Decor'];

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
    <div className="w-full lg:w-1/4  ">
      <div className="bg-white p-4 rounded-lg shadow-md max-h-screen overflow-y-auto scrollbar-custom">
        <h2 className="text-xl font-semibold mb-4">Filters</h2>
        
        {/* Destination Dropdown */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Destination</h3>
          <Select
            aria-label="Select Destination"
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
            <div className="mb-6 max-h-[230px] overflow-auto scrollbar-custom">
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

            <div className="mb-6 max-h-[230px] overflow-auto scrollbar-custom ">
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
          <h3 className="text-sm font-medium sticky top-0 bg-white z-10 text-gray-700 mb-2">Amenities</h3>
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
            aria-label="Price Range"
            step={100}
            minValue={0}
            maxValue={10000}
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
    <div className="mx-auto bg-light min-h-screen font-sans">
      <Nav />
      <Hero />
      <Search/>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-semibold text-3xl text-color1 mb-8">
          What To Discover in Sorsogon
        </h1>

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
            <>
              {activeTab === 'all' && renderFilters(allFilters, setAllFilters, [...activityTypes, ...accommodationTypes, ...foodTypes, ...shopTypes], null, true)}
              {activeTab === 'activities' && renderFilters(activitiesFilters, setActivitiesFilters, activityTypes)}
              {activeTab === 'accommodations' && renderFilters(accommodationsFilters, setAccommodationsFilters, accommodationTypes)}
              {activeTab === 'restaurant' && renderFilters(foodFilters, setFoodFilters, foodTypes, (
                <div className="mb-6 max-h-[230px] overflow-auto scrollbar-custom">
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
                <div className="mb-6 max-h-[230px] overflow-auto scrollbar-custom">
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
            </>
          )}

          {/* Content Section */}
          <div className="w-full lg:w-3/4 max-h-screen overflow-y-auto scrollbar-custom p-2">
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
                    className="bg-white rounded-lg shadow-lg hover:shadow-slate-500 hover:scale-105 duration-300"
                    variants={cardVariants}
                  >
                    <img
                      src={`http://localhost:5000/${item.businessLogo}`}
                      alt={item.businessName}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex flex-wrap gap-2">
                          {item.category.map((cat, idx) => {
                            const isSelected = filters.selectedType.some(type => 
                              type.toLowerCase().replace(/s$/, '') === cat.toLowerCase().replace(/s$/, '') 
                            ) || shopFilters.selectedCategory.some(type => 
                              type.toLowerCase() === cat.toLowerCase() 
                            ) || foodFilters.selectedCuisine.some(type => 
                              type.toLowerCase() === cat.toLowerCase() 
                            );

                            return (
                              <span
                                key={idx}
                                className={`text-xs px-2 py-1 rounded-full ${
                                  isSelected ? 'bg-color2 text-white' : 'bg-gray-200 text-gray-700'
                                }`}
                              >
                                {cat}
                              </span>
                            );
                          })}
                        </div>
                        <div className="flex items-center gap-1">
                          {item.rating ? (
                            <>
                              <span className="text-[12px]">{parseFloat(item.rating).toFixed(1)}</span>
                              <span className="text-yellow-500">
                                {'★'.repeat(Math.round(item.rating))}
                                {'☆'.repeat(5 - Math.round(item.rating))}
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-500 text-[12px]">No ratings</span>
                          )}
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {item.businessName}
                      </h3>
                      <div className="text-xs text-gray-500 mb-2 flex items-center">
                        <GiPositionMarker className="mr-1" />
                        {item.destination}
                      </div>
                      <div className="flex mb-2 max-w-[500px] max-h-[5rem] overflow-y-auto scrollbar-custom flex-col">
                        <p className="text-sm text-gray-600 mb-2">
                          {item.description}
                        </p>
                      </div>
                      <p className="text-md font-semibold text-black mb-2">
                        ₱{item.lowest_price} - ₱{item.highest_price}
                      </p>
                      <Link to="/business" target="_blank">
                        <Button className="w-full bg-color1 text-color3 hover:bg-color2">
                          Explore More
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                ));
              })}
            </motion.div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-8 bg-gray-200 rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold mb-4">Locations</h2>
          <MapContainer center={[12.9738, 123.9807]} zoom={10} className="w-full h-96">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapEvents setCurrentZoom={setCurrentZoom} />
            {businesses.map((business, index) => {
              const { pin_location } = business;
              if (pin_location && currentZoom >= 7) { // Adjust zoom level as needed
                const position = [pin_location.latitude, pin_location.longitude];
                const showLogo = currentZoom >= 12; // Set zoom level to show/hide logo
                const customDivIcon = L.divIcon({
                  className: 'custom-icon',
                  html: `<div class="custom-popup flex items-center whitespace-nowrap font-bold text-pink-600" style="font-size: 0.85rem;">
                          ${showLogo ? `<img src="http://localhost:5000/${business.businessLogo}" alt="${business.businessName}" class="w-10 h-10" />` : ''}
                          <span class="ml-2">${business.businessName}</span>
                        </div>`,
                  iconAnchor: [20, 20] // Adjust these values to center the logo
                });
                return (
                  <Marker key={index} position={position} icon={customDivIcon}/>
                );
              }
              return null;
            })}
          </MapContainer>
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

// Component to handle map events
const MapEvents = ({ setCurrentZoom }) => {
  useMapEvents({
    zoomend: (e) => {
      setCurrentZoom(e.target.getZoom());
    },
  });
  return null;
};

export default Discover;
