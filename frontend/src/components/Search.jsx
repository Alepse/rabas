import React, { useState, useEffect } from 'react';
import { FaSearch, FaTimes, FaHiking, FaBed, FaUtensils, FaShoppingBag, FaMapMarkerAlt } from 'react-icons/fa';
import { Tabs, Tab } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import CryptoJS from 'crypto-js';
const BASE_URL = import.meta.env.VITE_BASE_URL; 

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

const Highlight = ({ content, match }) => {
  if (!match || !match.trim() || !content) return <span>{content}</span>;

  const regex = new RegExp(`(${match.trim()})`, 'gi');
  const parts = content.toString().split(regex);

  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === match.toLowerCase().trim() ? (
          <span key={i} className="bg-yellow-200 font-bold text-black rounded">
            {part.trim()}
          </span>
        ) : (
          part.replace(/\s+$/, '') // Remove trailing spaces from non-highlighted parts
        )
      )}
    </span>
  );
};

const Search = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const [businessListings, setBusinessListings] = useState({
    activitiesAndAttractions: [],
    accommodations: [],
    foodPlaces: [],
    shops: []
  });

  const fetchBusinessListings = async () => {
    try {
      const response = await fetch(`${BASE_URL}/superAdmin-fetchAllBusinessListings`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch business listings');
      }

      const data = await response.json();
      
      if (data.success) {
        // console.log('Received business listings data:', data.businesses);
        const categorizedBusinesses = {
          activitiesAndAttractions: [],
          accommodations: [],
          foodPlaces: [],
          shops: []
        };

        data.businesses.forEach(business => {
          // Create a standardized business object
          const enhancedBusiness = {
            title: business.businessName,
            description: business.aboutUs || 'No description available',
            imageUrl: business.businessLogo ? `${BASE_URL}/${business.businessLogo}` : 'https://via.placeholder.com/200',
            type: business.businessType,
            businessInfo: {
              id: business.business_id || [],
              category: business.category || [],
              facilities: business.facilities || [],
              policies: business.policies || [],
              contactInfo: business.contactInfo || [],
              openingHours: business.openingHours || [],
              businessCard: business.businessCard || {}
            },
            owner: {
              name: business.owner_name || 'Unknown Owner',
              email: business.owner_email || 'No email provided'
            },
            status: business.displayStatus,
            heroImages: business.heroImages || []
          };

          // Categorize based on businessType
          const type = (business.businessType || '').toLowerCase();
          if (type.includes('activity') || type.includes('attraction')) {
            categorizedBusinesses.activitiesAndAttractions.push(enhancedBusiness);
          } else if (type.includes('accommodation') || type.includes('hotel') || type.includes('resort')) {
            categorizedBusinesses.accommodations.push(enhancedBusiness);
          } else if (type.includes('restaurant') || type.includes('food') || type.includes('cafe')) {
            categorizedBusinesses.foodPlaces.push(enhancedBusiness);
          } else if (type.includes('shop') || type.includes('store') || type.includes('souvenir')) {
            categorizedBusinesses.shops.push(enhancedBusiness);
          } else {
            // Default to shops if type is unknown
            // console.log('Uncategorized business:', business.businessName, 'Type:', type);
            categorizedBusinesses.shops.push(enhancedBusiness);
          }
        });

        setBusinessListings(categorizedBusinesses);

      } else {
        console.error('Failed to fetch business listings:', data.message);
      }
    } catch (error) {
      console.error('Error fetching business listings:', error);
    }
  };

  useEffect(() => {
    fetchBusinessListings();
  }, []);

  const locations = [
    { name: 'Bulusan', value: "Bulusan" },
    { name: 'Bulan', value: "Bulan" },
    { name: 'Barcelona', value: "Barcelona" },
    { name: 'Casiguran', value: "Casiguran" },
    { name: 'Castilla', value: "Castilla" },
    { name: 'Donsol', value: "Donsol" },
    { name: 'Gubat', value: "Gubat" },
    { name: 'Irosin', value: "Irosin" },
    { name: 'Juban', value: "Juban" },
    { name: 'Magallanes', value: "Magallanes" },
    { name: 'Matnog', value: "Matnog" },
    { name: 'Pilar', value: "Pilar" },
    { name: 'Prieto Diaz', value: "PrietoDiaz" },
    { name: 'Sta. Magdalena', value: "StaMagdalena" },
    { name: 'Sorsogon', value: "Sorsogon" },
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
    const searchInput = query.toLowerCase();
  
    const matchesSearch = (str) => str.toLowerCase().includes(searchInput);
  
    // Search across all categories
    results = [
      ...businessListings.activitiesAndAttractions.filter((activity) => 
        matchesSearch(activity.title)
      ),
      ...businessListings.accommodations.filter((accommodation) => 
        matchesSearch(accommodation.title)
      ),
      ...businessListings.foodPlaces.filter((food) => 
        matchesSearch(food.title)
      ),
      ...businessListings.shops.filter((shop) => 
        matchesSearch(shop.title)
      ),
      ...locations.filter((location) => 
        matchesSearch(location.name)
      ),
    ];
  
    setSearchResults(results);
  };
  
  const clearSearchField = () => {
    setSearchQuery('');
    setSearchResults([]);
  };
  
  return (
    <div className="flex flex-col items-center p-5 w-full max-w-4xl mx-auto">
      <div>
        <h1 className="font-semibold text-2xl m-9">Explore Everything</h1>
      </div>
      
      <div className="flex items-center w-full mb-4">
        <FaSearch className="text-color1 mr-2" />
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleInputChange}
          className="flex-grow p-2 border border-gray-300 shadow-md focus:outline-none rounded-xl"
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
            className="absolute w-full max-h-[300px] z-10 overflow-y-auto scrollbar-custom bg-white shadow-lg rounded-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {searchResults.map((result, index) => {
              const handleClick = () => {
                setSearchQuery('');
                setSearchResults([]);
              };
              const content = (
                <div className="flex p-2 hover:bg-gray-200 cursor-pointer">
                  {result.title && (
                    <div className="w-full flex items-center">
                      <img
                        src={result.imageUrl}
                        alt={result.imageUrl}
                        className="w-12 h-12 rounded-full mr-3 object-cover"
                      />
                      <h3 className="text-md">
                        <Highlight
                          content={result.title}
                          match={searchQuery}
                        />
                      </h3>
                    </div>
                  )}
                  {result.name && (
                    <div className="w-full flex items-center">
                      <FaMapMarkerAlt className="w-12 h-12 text-gray-500 mr-3" />
                      <div>
                        <p className="text-md">
                          <Highlight
                            content={result.name}
                            match={searchQuery}
                          />
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
  
              return result.title ? (
                <Link
                  key={index}
                  to={`/business/${encryptId(result.businessInfo.id)}`}
                  className="block"
                  onClick={handleClick}
                >
                  {content}
                </Link>
              ) : (
                <Link
                  key={index}
                  to={`/destinations?name=${result.value}`}
                  className="block"
                  onClick={handleClick}
                >
                  {content}
                </Link>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
};  
export default Search;
