import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FaImage, FaSearch, FaTimes, FaMapMarkerAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import debounce from 'lodash.debounce';

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Encrypt the business_id
const encryptId = (id) => {
  const secretKey = import.meta.env.VITE_SECRET_KEY;
  if (!secretKey) {
    console.error('Secret key is not defined');
    return null;
  }
  const ciphertext = CryptoJS.AES.encrypt(id.toString(), secretKey).toString();
  return encodeURIComponent(ciphertext);
};

// Highlight matching search terms
const Highlight = ({ content, match }) => {
  if (!match || !content) return <span>{content}</span>;
  const regex = new RegExp(`(${match.trim()})`, 'gi');
  return (
    <span>
      {content.split(regex).map((part, i) =>
        regex.test(part) ? (
          <span key={i} className=" text-color2/80  font-extrabold round-md ">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  );
};

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [businessListings, setBusinessListings] = useState({
    activitiesAndAttractions: [],
    accommodations: [],
    foodPlaces: [],
    shops: []
  });
  const [allProducts, setAllProducts] = useState([]);
  console.log(allProducts);
  const locations = useMemo(() => [
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
  ], []);

  const fetchBusinessListings = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/superAdmin-fetchAllBusinessListings`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch business listings');

      const data = await response.json();
      if (data.success) {
        const categorized = {
          activitiesAndAttractions: [],
          accommodations: [],
          foodPlaces: [],
          shops: [],
        };

        data.businesses.forEach((business) => {
          const type = (business.businessType || '').toLowerCase();
          const businessData = {
            title: business.businessName,
            description: business.aboutUs || 'No description available',
            imageUrl: business.businessLogo ? `${BASE_URL}/${business.businessLogo}` : 'https://via.placeholder.com/200',
            businessInfo: { id: business.business_id },
          };
          if (type.includes('activity')) categorized.activitiesAndAttractions.push(businessData);
          else if (type.includes('accommodation')) categorized.accommodations.push(businessData);
          else if (type.includes('restaurant')) categorized.foodPlaces.push(businessData);
          else categorized.shops.push(businessData);
        });

        setBusinessListings(categorized);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  // Fetch data for each category from the backend
    const fetchAllProducts = async (category) => {
      try {
        const response = await fetch(`${BASE_URL}/getAllBusinessProduct`);
        const contentType = response.headers.get("content-type");
  
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
  
          if (data.success) {
            setAllProducts(data.businessProducts);
          } else {
            console.error(`Failed to fetch ${category} data:`, data.message);
          }
        } else {
          console.error(`Unexpected response format for ${category}:`, response);
        }
      } catch (error) {
        console.error(`Error fetching ${category} data:`, error);
      }
    };
  
    useEffect(() => {
      fetchAllProducts();
    }, []);


  const matchesSearch = useMemo(() => {
    return (str) => str.toLowerCase().includes(searchQuery.toLowerCase());
  }, [searchQuery]);

  const performSearch = useCallback(() => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }

    const results = [
      ...businessListings.activitiesAndAttractions.filter((item) => matchesSearch(item.title || '')),
      ...businessListings.accommodations.filter((item) => matchesSearch(item.title || '')),
      ...businessListings.foodPlaces.filter((item) => matchesSearch(item.title || '')),
      ...businessListings.shops.filter((item) => matchesSearch(item.title || '')),
      ...allProducts.filter((item) => matchesSearch(item.name || '')),
      ...allProducts.filter((item) => matchesSearch(item.description || '')),
      ...allProducts.filter((item) => matchesSearch(item.type || '')),
      ...locations.filter((location) => matchesSearch(location.name || '')),
    ];

    setSearchResults(results);
  }, [searchQuery, businessListings, matchesSearch, locations]);

  const debouncedSearch = useMemo(() => debounce(performSearch, 300), [performSearch]);

  useEffect(() => {
    fetchBusinessListings();
  }, [fetchBusinessListings]);

  useEffect(() => {
    debouncedSearch();
    return () => debouncedSearch.cancel();
  }, [searchQuery, debouncedSearch]);

  return (
    <div className="flex mt-16 flex-col items-center p-5 w-full max-w-4xl mx-auto">
      <h1 className="font-semibold text-2xl mb-4">Explore Everything</h1>
      <div className="flex items-center w-full mb-4">
        <FaSearch className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-grow p-2 border border-gray-300 shadow-md focus:outline-none rounded-xl"
        />
        {searchQuery && <FaTimes onClick={() => setSearchQuery('')} className="text-gray-500 cursor-pointer ml-2" />}
      </div>
      {searchResults.length > 0 && (
        <motion.div
          className="relative w-full max-h-60 overflow-y-auto bg-white shadow-lg rounded-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {searchResults.map((result, index) => (
            <Link
              key={index}
              to={
                result.businessInfo
                  ? `/business/${encryptId(result.businessInfo.id)}`
                  : result.product_category
                  ? `/business/${encryptId(result.business_id)}?id=${result.product_id}`
                  : `/destinations?name=${result.value}`
              }
              onClick={() => setSearchQuery('')}
              className="block p-2 hover:bg-gray-200"
            >
              <div className="flex items-center">
                {result.imageUrl ? (
                  <>
                    <img src={result.imageUrl} alt="" className="w-12 h-12 rounded-full mr-3" />
                    <Highlight content={result.title || result.name} match={searchQuery} />
                  </>
                ) : result.product_category && result.product_category.length > 0 ? (
                  <>
                    <div className="flex items-center">
                      {result.images.length > 0 ? (
                        <img
                          src={`${BASE_URL}/${result.images[0].path}`}
                          alt={result.images[0].title}
                          className="w-12 h-12 rounded-full mr-3"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          <FaImage className="text-gray-500 w-6 h-6" />
                        </div>
                      )}
                      <div>
                        {/* Highlight the title or name */}
                        <Highlight content={result.title || result.name} match={searchQuery} />
                        {result.description && (
                          <div className="text-sm text-gray-500 mt-1">
                            {/* Highlight the description */}
                            <Highlight
                              content={
                                result.description.length > 100
                                  ? result.description.substring(0, 100) + '...'
                                  : result.description
                              }
                              match={searchQuery}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </>                
                ) : (
                  <>
                    <FaMapMarkerAlt className="w-12 h-12 text-gray-500 mr-3" />
                    <Highlight content={result.title || result.name} match={searchQuery} />
                  </>
                )}                
              </div>
            </Link>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Search;
