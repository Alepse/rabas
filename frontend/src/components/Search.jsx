import React, { useState } from 'react';
import { FaSearch, FaTimes, FaHiking, FaBed, FaUtensils, FaShoppingBag, FaMapMarkerAlt } from 'react-icons/fa';
import { Tabs, Tab } from '@nextui-org/react';
import { motion } from 'framer-motion';

const Search = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const activities = [
    { name: 'Hiking Adventure', destination: 'Bulusan', image: 'https://via.placeholder.com/50' },
    // Add more activities as needed
  ];

  const accommodations = [
    { name: 'Luxury Hotel', destination: 'Sorsogon City', image: 'https://via.placeholder.com/50' },
    // Add more accommodations as needed
  ];

  const foodPlaces = [
    { name: 'Mountain View Dining', destination: 'Sorsogon City', image: 'https://via.placeholder.com/50' },
    // Add more food places as needed
  ];

  const shops = [
    { name: 'Sample Souvenir Shop', destination: 'Sorsogon City', image: 'https://via.placeholder.com/50' },
    // Add more shops as needed
  ];

  const locations = [
    { name: 'Bulusan' },
    { name: 'Bulan' },
    { name: 'Barcelona' },
    { name: 'Casiguran' },
    { name: 'Castilla' },
    { name: 'Donsol' },
    { name: 'Gubat' },
    { name: 'Irosin' },
    { name: 'Juban' },
    { name: 'Magallanes' },
    { name: 'Matnog' },
    { name: 'Pilar' },
    { name: 'Prieto Diaz' },
    { name: 'Sta. Magdalena' },
    { name: 'Sorsogon City' },
  ];

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.length > 0) {
      performSearch(value);
    } else {
      setSearchResults([]);
    }
  };

  const performSearch = (query) => {
    let results = [];
    const firstLetter = query.charAt(0).toLowerCase();

    const matchesFirstLetter = (str) => str.charAt(0).toLowerCase() === firstLetter;

    switch (activeTab) {
      case 'all':
        results = [
          ...activities.filter((activity) => 
            matchesFirstLetter(activity.name)
          ),
          ...accommodations.filter((accommodation) => 
            matchesFirstLetter(accommodation.name)
          ),
          ...foodPlaces.filter((food) => 
            matchesFirstLetter(food.name)
          ),
          ...shops.filter((shop) => 
            matchesFirstLetter(shop.name)
          ),
          ...locations.filter((location) => 
            matchesFirstLetter(location.name)
          ),
        ];
        break;
      case 'activities':
        results = activities.filter((activity) =>
          matchesFirstLetter(activity.name)
        );
        break;
      case 'accommodation':
        results = accommodations.filter((accommodation) =>
          matchesFirstLetter(accommodation.name)
        );
        break;
      case 'food':
        results = foodPlaces.filter((food) =>
          matchesFirstLetter(food.name)
        );
        break;
      case 'shops':
        results = shops.filter((shop) =>
          matchesFirstLetter(shop.name)
        );
        break;
      default:
        break;
    }

    setSearchResults(results);
  };

  const clearSearchField = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    setSearchQuery('');
    setSearchResults([]);
  };

  const getTitleForTab = (tab) => {
    switch (tab) {
      case 'all':
        return 'Explore Everything';
      case 'activities':
        return 'Find Exciting Activities';
      case 'accommodation':
        return 'Discover Comfortable Stays';
      case 'food':
        return 'Taste Delicious Food';
      case 'shops':
        return 'Shop Till You Drop';
      default:
        return 'What to Visit';
    }
  };

  const scrollTabs = (direction) => {
    const tabsContainer = document.querySelector('.tabs-container');
    const scrollAmount = 100; // Adjust this value as needed
    if (direction === 'left') {
      tabsContainer.scrollLeft -= scrollAmount;
    } else {
      tabsContainer.scrollLeft += scrollAmount;
    }
  };

  return (
    <div className="flex flex-col  mt-8 items-center  p-6 w-full max-w-4xl mx-auto ">
      <div>
        <h1 className='font-semibold text-2xl mt-9'>{getTitleForTab(activeTab)}</h1>
      </div>
      <div className="w-full mb-6 overflow-x-auto">
        <Tabs
          aria-label="Search Options"
          onSelectionChange={handleTabChange}
          variant="underlined"
          classNames={{
            base: "w-full overflow-x-auto rounded-full",
            tabList: "gap-6 w-full p-4 flex md:justify-center",
            tab: "max-w-fit px-0 h-12",
            tabContent: "text-color1",
            cursor: "w-full bg-color1",
          }}
          defaultValue="all"
        >
          <Tab key="all" title={<span className="flex items-center"><FaSearch className="mr-2" />Search All</span>} />
          <Tab key="activities" title={<span className="flex items-center"><FaHiking className="mr-2" />Activities</span>} />
          <Tab key="accommodation" title={<span className="flex items-center"><FaBed className="mr-2" />Accommodation</span>} />
          <Tab key="food" title={<span className="flex items-center"><FaUtensils className="mr-2" />Food Places</span>} />
          <Tab key="shops" title={<span className="flex items-center"><FaShoppingBag className="mr-2" />Shops</span>} />
        </Tabs>
      </div>

      <div className="flex items-center w-full mb-4">
        <FaSearch className="text-color1 mr-2" />
        <input
          type="text"
          placeholder={`Search for ${activeTab}`}
          value={searchQuery}
          onChange={handleInputChange}
          className="flex-grow p-2 border border-gray-300 focus:outline-none rounded-xl"
        />
        {searchQuery && (
          <FaTimes
            onClick={clearSearchField}
            className="text-color1 cursor-pointer ml-2"
          />
        )}
      </div>

      <div className="relative w-full">
        {searchResults.length > 0 && (
          <motion.div
            className="absolute w-full max-h-[500px] z-10 overflow-y-auto scrollbar-custom bg-white shadow-lg rounded-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {searchResults.map((result, index) => (
              <div key={index} className="flex items-center p-2 hover:bg-gray-200 cursor-pointer">
                {result.image ? (
                  <img src={result.image} alt={result.name} className="w-12 h-12 rounded-full mr-3" />
                ) : (
                  <FaMapMarkerAlt className="w-12 h-12 text-gray-500 mr-3" />
                )}
                <div>
                  <h3 className="text-md font-semibold">{result.name}</h3>
                  {result.destination && <p className="text-sm text-gray-500">{result.destination}</p>}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Search;
