import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@nextui-org/react';
import { Tabs, Tab } from '@nextui-org/tabs';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { CheckboxGroup, Checkbox } from "@nextui-org/checkbox";
import SuperAdminSidebar from './superadmincomponents/superadminsidebar';
import SearchBar from './superadmincomponents/SearchBar'; // Import the SearchBar component
import { Bar } from 'react-chartjs-2';
// Use the environment variable for the base URL
const BASE_URL = import.meta.env.VITE_BASE_URL; 

// Sample Business Listings Data
const businessListings = {
  activitiesAndAttractions: [
    {
      title: 'Beautiful Beach',
      description: 'Relax and enjoy the scenic beach view.',
      price: 2000,
      imageUrl: 'https://via.placeholder.com/200',
      rating: 5,
      type: 'Activities',
    },
    {
      title: 'Mountain Adventure',
      description: 'Hike through the mountains and enjoy nature.',
      price: 3000,
      imageUrl: 'https://via.placeholder.com/200',
      rating: 4,
      type: 'Attractions',
    },
  ],
  accommodations: [
    {
      title: 'Luxury Hotel',
      description: 'A luxurious stay with world-class facilities.',
      price: 8000,
      imageUrl: 'https://via.placeholder.com/200',
      rating: 5,
      type: 'Accommodations',
    },
  ],
  foodPlaces: [
    {
      title: 'Sample Restaurant 1',
      description: 'A popular Filipino restaurant offering traditional dishes.',
      price: 1500,
      imageUrl: 'https://via.placeholder.com/200',
      rating: 4,
      type: 'Food',
    },
  ],
  shops: [
    {
      title: 'Sample Souvenir Shop 1',
      description: 'A charming shop offering unique local souvenirs.',
      price: 1000,
      imageUrl: 'https://via.placeholder.com/200',
      rating: 4,
      type: 'Shop',
    },
  ],
};

// Dashboard component for product counts
const Dashboard = ({ productCounts }) => (
  <div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 py-4 md:py-6">
      <div className="bg-red-400 text-white p-4 flex flex-col justify-center items-center rounded-lg shadow-lg hover:shadow-xl transition-shadow">
        <p className="text-base md:text-lg">Attractions</p>
        <p className="text-2xl md:text-4xl font-bold">{productCounts.activities}</p>
      </div>
      <div className="bg-teal-400 text-white p-4 flex flex-col justify-center items-center rounded-lg shadow-lg hover:shadow-xl transition-shadow">
        <p className="text-base md:text-lg">Accommodations</p>
        <p className="text-2xl md:text-4xl font-bold">{productCounts.accommodations}</p>
      </div>
      <div className="bg-purple-400 text-white p-4 flex flex-col justify-center items-center rounded-lg shadow-lg hover:shadow-xl transition-shadow">
        <p className="text-base md:text-lg">Foods</p>
        <p className="text-2xl md:text-4xl font-bold">{productCounts.foods}</p>
      </div>
      <div className="bg-yellow-400 text-white p-4 flex flex-col justify-center items-center rounded-lg shadow-lg hover:shadow-xl transition-shadow">
        <p className="text-base md:text-lg">Shops</p>
        <p className="text-2xl md:text-4xl font-bold">{productCounts.shops}</p>
      </div>
      <div className="bg-pink-400 text-white p-4 flex flex-col justify-center items-center rounded-lg shadow-lg hover:shadow-xl transition-shadow">
        <p className="text-base md:text-lg">Total Products</p>
        <p className="text-2xl md:text-4xl font-bold">{productCounts.total}</p>
      </div>
    </div>
    
    {/* Add Chart Container */}
    <div className="mb-6 md:mb-8 container max-h-[500px] md:max-h-[600px] flex justify-center flex-col items-center">
      <h2 className="text-xl md:text-2xl font-bold mb-4">Products Summary</h2>
      <div className="w-full max-w-4xl h-[400px] md:h-[500px]">
        <Bar 
          data={{
            labels: ['Attractions', 'Accommodations', 'Foods', 'Shops', 'Total'],
            datasets: [{
              label: '# of Products',
              data: [
                productCounts.activities,
                productCounts.accommodations,
                productCounts.foods,
                productCounts.shops,
                productCounts.total
              ],
              backgroundColor: [
                '#f87171',  // red-400
                '#2dd4bf', // teal-400
                '#c084fc', // purple-400
                '#facc15', // yellow-400
                '#f472b6'  // pink-400
              ]
            }]
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                labels: {
                  font: {
                    size: window.innerWidth < 768 ? 12 : 14
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  font: {
                    size: window.innerWidth < 768 ? 12 : 14
                  }
                }
              },
              x: {
                ticks: {
                  font: {
                    size: window.innerWidth < 768 ? 12 : 14
                  }
                }
              }
            }
          }}
        />
      </div>
    </div>
  </div>
);

// Dashboard component for business counts
const BusinessDashboard = ({ businessCounts }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 py-4 md:py-6">
    <div className="bg-blue-400 text-white p-4 flex flex-col justify-center text-center items-center rounded-lg shadow-lg hover:shadow-xl transition-shadow">
      <p className="text-base md:text-lg">Activities & Attractions</p>
      <p className="text-2xl md:text-4xl font-bold">{businessCounts.activitiesAndAttractions}</p>
    </div>
    <div className="bg-green-400 text-white p-4 flex flex-col justify-center items-center rounded-lg shadow-lg hover:shadow-xl transition-shadow">
      <p className="text-base md:text-lg">Accommodations</p>
      <p className="text-2xl md:text-4xl font-bold">{businessCounts.accommodations}</p>
    </div>
    <div className="bg-yellow-400 text-white p-4 flex flex-col justify-center items-center rounded-lg shadow-lg hover:shadow-xl transition-shadow">
      <p className="text-base md:text-lg">Food Places</p>
      <p className="text-2xl md:text-4xl font-bold">{businessCounts.foodPlaces}</p>
    </div>
    <div className="bg-orange-400 text-white p-4 flex flex-col justify-center items-center rounded-lg shadow-lg hover:shadow-xl transition-shadow">
      <p className="text-base md:text-lg">Shops</p>
      <p className="text-2xl md:text-4xl font-bold">{businessCounts.shops}</p>
    </div>
    <div className="bg-gray-500 text-white p-4 flex flex-col justify-center items-center rounded-lg shadow-lg hover:shadow-xl transition-shadow">
        <p className="text-base md:text-lg">Total Businesses</p>
        <p className="text-2xl md:text-4xl font-bold">{businessCounts.total}</p>
      </div>
  </div>
);

// Remove the Highlight import and add this custom component
const Highlight = ({ content, match }) => {
  if (!match.trim() || !content) return content;

  const parts = content.toString().split(new RegExp(`(${match})`, 'gi'));
  
  return (
    <span>
      {parts.map((part, i) => 
        part.toLowerCase() === match.toLowerCase() ? (
          <span key={i} className="bg-yellow-200 text-black px-1 rounded">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  );
};

const SuperAdminProducts = () => {
  const [products, setProducts] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [businessSearchTerm, setBusinessSearchTerm] = useState('');
  const [productCounts, setProductCounts] = useState({
    activities: 0,
    accommodations: 0,
    foods: 0,
    shops: 0,
    total: 0,
  });
  const [businessCounts, setBusinessCounts] = useState({
    activitiesAndAttractions: 0,
    accommodations: 0,
    foodPlaces: 0,
    shops: 0,
    total: 0,
  });
  const [selectedSections, setSelectedSections] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const { isOpen: isBusinessModalOpen, onOpen: onBusinessModalOpen, onClose: onBusinessModalClose } = useDisclosure();

  const [selectedProductFilter, setSelectedProductFilter] = useState('all');
  const [selectedBusinessFilter, setSelectedBusinessFilter] = useState('all');
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

  useEffect(() => {
    fetchBusinessProducts();
    fetchBusinessListings();
  }, []);

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
        console.log('Received products data:', data.products);

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
            console.log('Uncategorized product:', product.name, 'Category:', category);
            categorizedProducts.shop.push(product);
          }
        });

        setBusinessProducts(categorizedProducts);
        
        // Update product counts
        setProductCounts({
          activities: categorizedProducts.activities.length,
          accommodations: categorizedProducts.accommodations.length,
          foods: categorizedProducts.restaurant.length,
          shops: categorizedProducts.shop.length,
          total: enhancedProducts.length
        });

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
        console.log('Received business listings data:', data.businesses);
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
            console.log('Uncategorized business:', business.businessName, 'Type:', type);
            categorizedBusinesses.shops.push(enhancedBusiness);
          }
        });

        setBusinessListings(categorizedBusinesses);
        
        // Update business counts
        setBusinessCounts({
          activitiesAndAttractions: categorizedBusinesses.activitiesAndAttractions.length,
          accommodations: categorizedBusinesses.accommodations.length,
          foodPlaces: categorizedBusinesses.foodPlaces.length,
          shops: categorizedBusinesses.shops.length,
          total: categorizedBusinesses.activitiesAndAttractions.length +
                 categorizedBusinesses.accommodations.length +
                 categorizedBusinesses.foodPlaces.length +
                 categorizedBusinesses.shops.length
        });

      } else {
        console.error('Failed to fetch business listings:', data.message);
      }
    } catch (error) {
      console.error('Error fetching business listings:', error);
    }
  };

  const filterProducts = (products) => {
    let filtered = products;
    
    // First apply the filter type
    switch (selectedProductFilter) {
      case 'topRated':
        filtered = filtered.filter(product => product.rating >= 4);
        break;
      case 'budgetFriendly':
        filtered = filtered.filter(product => product.price <= 1500);
        break;
      case 'luxury':
        filtered = filtered.filter(product => product.price >= 5000);
        break;
    }

    // Then apply the search term if it exists
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        product.title?.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.businessName?.toLowerCase().includes(searchLower) ||
        product.ownerName?.toLowerCase().includes(searchLower) ||
        product.type?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  };

  const filterBusinesses = (businesses) => {
    if (!businessSearchTerm) return businesses;

    const searchLower = businessSearchTerm.toLowerCase();
    return businesses.filter(business => 
      business.title?.toLowerCase().includes(searchLower) ||
      business.description?.toLowerCase().includes(searchLower) ||
      business.type?.toLowerCase().includes(searchLower) ||
      business.owner?.name?.toLowerCase().includes(searchLower) ||
      business.owner?.email?.toLowerCase().includes(searchLower) ||
      (Array.isArray(business.businessInfo?.category) 
        ? business.businessInfo.category.some(cat => cat.toLowerCase().includes(searchLower))
        : business.businessInfo?.category?.toLowerCase().includes(searchLower)) ||
      business.businessInfo?.businessCard?.priceRange?.toLowerCase().includes(searchLower) ||
      JSON.stringify(business.businessInfo?.contactInfo)?.toLowerCase().includes(searchLower)
    );
  };

  const filteredProducts = filterProducts(
    products.filter(
      (product) =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.businessName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const filteredBusinesses = {
    activitiesAndAttractions: filterBusinesses(
      businessListings.activitiesAndAttractions.filter(
        (business) =>
          business.title.toLowerCase().includes(businessSearchTerm.toLowerCase()) ||
          business.description.toLowerCase().includes(businessSearchTerm.toLowerCase())
      )
    ),
    accommodations: filterBusinesses(
      businessListings.accommodations.filter(
        (business) =>
          business.title.toLowerCase().includes(businessSearchTerm.toLowerCase()) ||
          business.description.toLowerCase().includes(businessSearchTerm.toLowerCase())
      )
    ),
    foodPlaces: filterBusinesses(
      businessListings.foodPlaces.filter(
        (business) =>
          business.title.toLowerCase().includes(businessSearchTerm.toLowerCase()) ||
          business.description.toLowerCase().includes(businessSearchTerm.toLowerCase())
      )
    ),
    shops: filterBusinesses(
      businessListings.shops.filter(
        (business) =>
          business.title.toLowerCase().includes(businessSearchTerm.toLowerCase()) ||
          business.description.toLowerCase().includes(businessSearchTerm.toLowerCase())
      )
    ),
  };

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    onOpen();
  };

  const handleOpenBusinessModal = (business) => {
    setSelectedBusiness(business);
    onBusinessModalOpen();
  };

  const handleSectionChange = (values) => {
    setSelectedSections(values);
  };

  const getProductRank = (product) => {
    if (!product) return null;
    const sortedProducts = [...products].sort((a, b) => b.rating - a.rating);
    return sortedProducts.findIndex((p) => p.title === product.title) + 1;
  };

  const renderProductCards = (productList) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {productList.map((product, index) => (
        <Card key={index} className="shadow-lg rounded-lg hover:scale-105 transition-transform">
          <CardBody className="p-3 md:p-4">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="object-cover w-full h-32 md:h-40 rounded-lg mb-2"
            />
            <h3 className="font-bold text-base md:text-lg">
              <Highlight content={product.title} match={searchTerm} />
            </h3>
            <p className="text-gray-700 text-sm md:text-base">
              <Highlight content={product.description} match={searchTerm} />
            </p>
            {product.businessName && (
              <p className="text-sm text-gray-600 mt-1">
                Business: <Highlight
                  content={product.businessName}
                  match={searchTerm}
                />
              </p>
            )}
            {product.ownerName && (
              <p className="text-sm text-gray-600">
                Owner: <Highlight
                  content={product.ownerName}
                  match={searchTerm}
                />
              </p>
            )}
            {product.discount > 0 && (
              <p className="text-sm text-green-600">Discount: {product.discount}%</p>
            )}
            <div className="flex justify-between items-center mt-2">
              <span className="text-lg font-semibold">₱{product.price}</span>
              <HiOutlineDotsVertical
                className="cursor-pointer"
                onClick={() => handleOpenModal(product)}
              />
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );

  const renderBusinessCards = (businessList) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {businessList.map((business, index) => (
        <Card key={index} className="shadow-lg rounded-lg hover:scale-105 transition-transform">
          <CardBody className="p-3 md:p-4">
            <img
              src={business.imageUrl}
              alt={business.title}
              className="object-cover w-full h-32 md:h-40 rounded-lg mb-2"
            />
            <h3 className="font-bold text-base md:text-lg">
              <Highlight content={business.title} match={businessSearchTerm} />
            </h3>
            <p className="text-gray-700 text-sm md:text-base mb-2">
              <Highlight content={business.description} match={businessSearchTerm} />
            </p>
            <div className="text-sm space-y-1">
              <p className="text-gray-600">
                Type: <Highlight content={business.type} match={businessSearchTerm} />
              </p>
              <p className="text-gray-600">
                Owner: <Highlight content={business.owner.name} match={businessSearchTerm} />
              </p>
              <p className="text-gray-600">
                Email: <Highlight content={business.owner.email} match={businessSearchTerm} />
              </p>
              {business.businessInfo.category && (
                <p className="text-gray-600">
                  Category: <Highlight 
                    content={Array.isArray(business.businessInfo.category) 
                      ? business.businessInfo.category.join(', ') 
                      : business.businessInfo.category} 
                    match={businessSearchTerm} 
                  />
                </p>
              )}
              {business.businessInfo.businessCard?.priceRange && (
                <p className="text-gray-600">
                  Price Range: <Highlight 
                    content={business.businessInfo.businessCard.priceRange} 
                    match={businessSearchTerm} 
                  />
                </p>
              )}
              <p className="text-gray-600">
                Status: <span className={`px-2 py-1 rounded-full text-xs ${
                  business.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {business.status}
                </span>
              </p>
            </div>
            {/* Display hero images */}
            {business.heroImages && business.heroImages.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-sm mb-2">Hero Images:</h4>
                <div className="flex space-x-2 overflow-x-auto">
                  {business.heroImages.map((img, idx) => (
                    <img
                      key={idx}
                      src={`${BASE_URL}/${img.path}`}
                      alt={`Hero ${idx + 1}`}
                      className="w-20 h-20 object-cover rounded"
                    />
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end mt-2">
              <HiOutlineDotsVertical
                className="cursor-pointer"
                onClick={() => handleOpenBusinessModal(business)}
              />
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );

  // Combine all businesses into a single array
  const allBusinesses = [
    ...businessListings.activitiesAndAttractions,
    ...businessListings.accommodations,
    ...businessListings.foodPlaces,
    ...businessListings.shops
  ];

  // Filter all businesses based on the search term
  const filteredAllBusinesses = filterBusinesses(allBusinesses);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <SuperAdminSidebar />

      <div className="flex-1 p-4 md:p-6 max-h-screen overflow-y-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">Products and Businesses</h1>

        <Tabs className="mb-4 md:mb-6" variant="highlight" color="primary">
          <Tab title="Products List">
            <Dashboard productCounts={productCounts} />
            <div className="mb-4 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label htmlFor="productFilter" className="text-sm md:text-base">
                  Filter Products:
                </label>
                <select
                  id="productFilter"
                  value={selectedProductFilter}
                  onChange={(e) => setSelectedProductFilter(e.target.value)}
                  className="p-2 rounded border text-sm md:text-base"
                >
                  <option value="all">All Products</option>
                  <option value="topRated">Top Rated</option>
                  <option value="budgetFriendly">Budget Friendly</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>
              <SearchBar
                placeholder="Search products..."
                onSearch={setSearchTerm}
                className="w-full"
              />
            </div>

            <Tabs>
              <Tab title="All Products">{renderProductCards(filteredProducts)}</Tab>
              <Tab title="Activities">
                {renderProductCards(filteredProducts.filter((product) => 
                  product.type === 'Hiking' || product.type === 'Water Sports'))}
              </Tab>
              <Tab title="Accommodations">
                {renderProductCards(filteredProducts.filter((product) => product.type === 'Cabins' || product.type === 'Resorts'))}
              </Tab>
              <Tab title="Restaurant Service">
                {renderProductCards(filteredProducts.filter((product) => product.type === 'Fine Dining' || product.type === 'Buffet'))}
              </Tab>
              <Tab title="Shop">
                {renderProductCards(filteredProducts.filter((product) => product.type === 'Local Crafts' || product.type === 'Souvenirs'))}
              </Tab>
            </Tabs>
          </Tab>

          <Tab title="Business List">
            <BusinessDashboard businessCounts={businessCounts} />
            <div className="mb-4">
              <label htmlFor="businessFilter" className="mr-2">Filter Businesses: </label>
              <select
                id="businessFilter"
                value={selectedBusinessFilter}
                onChange={(e) => setSelectedBusinessFilter(e.target.value)}
              >
                <option value="all">All Businesses</option>
                <option value="topRated">Top Rated</option>
                <option value="budgetFriendly">Budget Friendly</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>
            <SearchBar
              placeholder="Search businesses..."
              onSearch={setBusinessSearchTerm}
            />
            <Tabs>
              <Tab title="All Businesses">
                {renderBusinessCards(filteredAllBusinesses)}
              </Tab>
              <Tab title="Activities">
                {renderBusinessCards(filteredBusinesses.activitiesAndAttractions)}
              </Tab>
              <Tab title="Accommodations">
                {renderBusinessCards(filteredBusinesses.accommodations)}
              </Tab>
              <Tab title="Food Places">
                {renderBusinessCards(filteredBusinesses.foodPlaces)}
              </Tab>
              <Tab title="Shops">
                {renderBusinessCards(filteredBusinesses.shops)}
              </Tab>
            </Tabs>
          </Tab>
        </Tabs>

        <Modal 
          isOpen={isOpen} 
          onClose={onClose}
          className="max-w-[90%] md:max-w-[500px] mx-auto"
        >
          <ModalContent>
            <ModalHeader>
              <h2 className="text-xl md:text-2xl font-bold">{selectedProduct?.title}</h2>
            </ModalHeader>
            <ModalBody className="text-sm md:text-base">
              <p className="mb-4">{selectedProduct?.description}</p>
              <p className="mb-2 font-semibold">
                Price: {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(selectedProduct?.price || 0)}
              </p>
              {selectedProduct && (
                <p className="mb-4">Ranking based on rating: #{getProductRank(selectedProduct)}</p>
              )}
              <CheckboxGroup
                label="Add to Section"
                className="mb-4"
                onChange={handleSectionChange}
                value={selectedSections}
              >
                <Checkbox value="topProducts">Top Products</Checkbox>
                <Checkbox value="featuredProducts">Featured Products</Checkbox>
                <Checkbox value="popularProducts">Popular Products</Checkbox>
                <Checkbox value="budgetFriendly">Budget Friendly</Checkbox>
                <Checkbox value="luxurySpots">Luxury Spots</Checkbox>
                <Checkbox value="ecoFriendly">Eco Friendly Spots</Checkbox>
              </CheckboxGroup>
            </ModalBody>
            <ModalFooter>
              <button className="bg-blue-500 text-white px-4 py-2 rounded text-sm md:text-base" onClick={onClose}>
                Close
              </button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal isOpen={isBusinessModalOpen} onClose={onBusinessModalClose}>
          <ModalContent>
            <ModalHeader>
              <h2 className="text-xl md:text-2xl font-bold">{selectedBusiness?.title}</h2>
            </ModalHeader>
            <ModalBody className="text-sm md:text-base">
              <p className="mb-4">{selectedBusiness?.description}</p>
              <p className="mb-2 font-semibold">
                Price Range: {selectedBusiness?.businessInfo?.businessCard?.priceRange || 'Price range not available'}
              </p>
              {selectedBusiness && (
                <p className="mb-4">Ranking based on rating: #{getProductRank(selectedBusiness)}</p>
              )}
              <CheckboxGroup
                label="Add to Section"
                className="mb-4"
                onChange={handleSectionChange}
                value={selectedSections}
              >
                <Checkbox value="popular">Popular</Checkbox>
                <Checkbox value="topRated">Top Rated</Checkbox>
                <Checkbox value="newArrivals">New Arrivals</Checkbox>
                <Checkbox value="bestValue">Best Value</Checkbox>
                <Checkbox value="familyFriendly">Family Friendly</Checkbox>
                <Checkbox value="luxury">Luxury</Checkbox>
              </CheckboxGroup>
            </ModalBody>
            <ModalFooter>
              <button className="bg-blue-500 text-white px-4 py-2 rounded text-sm md:text-base" onClick={onBusinessModalClose}>
                Close
              </button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
};

export default SuperAdminProducts;
