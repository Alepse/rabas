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

const Search = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  // console.log(searchResults);
  const [products, setProducts] = useState([]);
  const [businessProducts, setBusinessProducts] = useState({
    activities: [],
    accommodations: [],
    restaurant: [],
    shop: []
  });

  const [businessListings, setBusinessListings] = useState({
    activitiesAndAttractions: [],
    accommodations: [],
    foodPlaces: [],
    shops: []
  });

  // console.log(businessListings.foodPlaces);
  const fetchBusinessProducts = async () => {
    try {
      const response = await fetch(`${BASE_URL}/superAdmin-fetchAllBusinessProducts`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      
      if (data.success) {
        // console.log('Received products data:', data.products);

        // Categorize products
        const categorizedProducts = {
          activities: [],
          accommodations: [],
          restaurant: [],
          shop: []
        };

        // Create enhanced products array
        const enhancedProducts = data.products.map(product => {
          // Parse JSON fields
          const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
          const inclusions = typeof product.inclusions === 'string' ? JSON.parse(product.inclusions) : product.inclusions;
          const terms = typeof product.termsAndConditions === 'string' ? JSON.parse(product.termsAndConditions) : product.termsAndConditions;

          return {
            ...product,
            title: product.name || 'Untitled Product',
            description: product.description || 'No description available',
            price: parseFloat(product.price) || 0,
            imageUrl: images && images.length > 0 ?  `${BASE_URL}/${images[0].path}` : 'https://via.placeholder.com/200',
            rating: product.rating || 0,
            type: product.type || 'Uncategorized',
            businessName: product.businessName || 'Unknown Business',
            ownerName: product.owner_name || 'Unknown Owner',
            discount: product.discount || 0,
            expirationDate: product.expiration || 'No Expiration',
            inclusions: inclusions || [],
            termsAndConditions: terms || [],
            images: images || [],
            pricingUnit: product.pricing_unit || 'per item'
          };
        });

        // Categorize the enhanced products
        enhancedProducts.forEach(product => {
          const category = (product.product_category || '').toLowerCase();
          
          if (category.includes('activit') || category.includes('attract')) {
            categorizedProducts.activities.push(product);
          } else if (category.includes('accommodat') || category.includes('hotel') || category.includes('resort')) {
            categorizedProducts.accommodations.push(product);
          } else if (category.includes('restaurant') || category.includes('food')) {
            categorizedProducts.restaurant.push(product);
          } else if (category.includes('shop') || category.includes('souvenir')) {
            categorizedProducts.shop.push(product);
          } else {
            // console.log('Uncategorized product:', product.name, 'Category:', category);
            categorizedProducts.shop.push(product);
          }
        });

        setBusinessProducts(categorizedProducts);
        
        // Update product counts
        // setProductCounts({
        //   activities: categorizedProducts.activities.length,
        //   accommodations: categorizedProducts.accommodations.length,
        //   foods: categorizedProducts.restaurant.length,
        //   shops: categorizedProducts.shop.length,
        //   total: enhancedProducts.length
        // });

        // Update the products state
        setProducts(enhancedProducts);

      } else {
        console.error('Failed to fetch products:', data.message);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

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
    fetchBusinessProducts();
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
  
    switch (activeTab) {
      case 'all':
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
        break;
      case 'activities':
        results = businessListings.activitiesAndAttractions.filter((activity) =>
          matchesSearch(activity.title)
        );
        break;
      case 'accommodation':
        results = businessListings.accommodations.filter((accommodation) =>
          matchesSearch(accommodation.title)
        );
        break;
      case 'food':
        results = businessListings.foodPlaces.filter((food) =>
          matchesSearch(food.title)
        );
        break;
      case 'shops':
        results = businessListings.shops.filter((shop) =>
          matchesSearch(shop.title)
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
                      <h3 className="text-md font-semibold">{result.title}</h3>
                    </div>
                  )}
                  {result.name && (
                    <div className="w-full flex items-center">
                      <FaMapMarkerAlt className="w-12 h-12 text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">{result.name}</p>
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
