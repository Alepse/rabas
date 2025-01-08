import React, { useState, useEffect, useCallback } from 'react';
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
import Swal from 'sweetalert2'; // Ensure SweetAlert is imported
// Use the environment variable for the base URL
const BASE_URL = import.meta.env.VITE_BASE_URL; 

// Dashboard component for product counts
const Dashboard = ({ productCounts }) => (
  <div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 py-4 md:py-6">
      <div className="bg-red-400 text-white p-4 flex flex-col justify-center items-center rounded-lg shadow-lg hover:shadow-xl transition-shadow">
        <p className="text-base md:text-lg">Activities</p>
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
            labels: ['Activities', 'Accommodations', 'Foods', 'Shops', 'Total'],
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
      <p className="text-base md:text-lg">Activities</p>
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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
    if(isLoggedIn) {
      fetchBusinessProducts();
      fetchBusinessListings();
    }
  }, [isLoggedIn]);

  // Function to check login status
  const checkLoginStatus = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/superadmin/check-login`, {
        method: 'GET',
        credentials: 'include', // Include cookies
      });
      if (response.ok) {
        const data = await response.json();
        setIsLoggedIn(data.isLoggedIn); // Set login status

        if (!data.isLoggedIn) {
          window.location.href = '/superadminlogin';
        }
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    }
  }, []);

  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);  

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
            id: business.business_id,
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

  const handleDelete = (productId) => {
    if (!productId) {
      console.error('Error: productId is undefined or invalid.');
      return Swal.fire('Error!', 'Invalid product ID.', 'error');
    }
  
    Swal.fire({
      title: 'Are you sure?',
      text: "This action will permanently delete the product!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        // Log the product ID being deleted
        // console.log('Deleting product with ID:', productId);
  
        fetch(`${BASE_URL}/deleteProduct/${productId}`, {
          method: 'DELETE',
          credentials: 'include',
        })
          .then((response) => response.json())  // Ensure response is parsed as JSON
          .then((data) => {
            if (data.success) {
              Swal.fire('Deleted!', 'Your product has been deleted.', 'success');
              
              // Update the products list after successful deletion
              setProducts((prevProducts) =>
                prevProducts.filter((product) => product.product_id !== productId)
              );
  
            } else {
              Swal.fire('Error!', 'There was an issue deleting the product.', 'error');
              console.error('Error response:', data.message);
            }
          })
          .catch((error) => {
            Swal.fire('Error!', 'Could not delete the product.', 'error');
            console.error('Fetch error:', error);  // Log the actual error to the console
          });
      }
    });
  };

  const handleDeleteBusiness = (businessId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "This action will permanently delete the business!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        // Call your delete API or perform deletion logic here
        fetch(`${BASE_URL}/deleteBusiness/${businessId}`, {
          method: 'DELETE',
          credentials: 'include',
        })
          .then((response) => response.json()) 
          .then((response) => {
            if (response.success) {
              Swal.fire('Deleted!', 'The business has been deleted.', 'success');
              // Optionally, refresh the business list or state here
              setBusinessListings((prevListings) => {
                const updatedListings = { ...prevListings };
                for (const key in updatedListings) {
                  updatedListings[key] = updatedListings[key].filter(
                    (business) => business.id !== businessId
                  );
                }
                return updatedListings;
              });
            } else {
              Swal.fire('Error!', 'There was an issue deleting the business.', 'error');
            }
          })
          .catch(() => {
            Swal.fire('Error!', 'Could not delete the business.', 'error');
          });
      }
    });
  };
  

  const renderProductCards = (productList) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {productList.map((product) => (
        <Card
          key={product.product_id}
          className="shadow-lg rounded-lg transition-transform hover:scale-105 flex flex-col"
        >
          {/* Product Image */}
          <div className="relative h-40 md:h-48 overflow-hidden rounded-t-lg">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="object-cover w-full h-full"
            />
          </div>

          {/* Product Details */}
          <CardBody className="p-4 flex flex-col justify-between flex-1">
            <div className="mb-4">
              {/* Title */}
              <h3 className="font-semibold text-lg text-gray-800 truncate">
                {product.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {product.description || 'No description available.'}
              </p>
            </div>

            {/* Additional Info */}
            <div className="mt-auto">
              <p className="text-sm text-gray-500 mb-2">
                <span className="font-semibold">Business:</span> {product.businessName || 'N/A'}
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-semibold">Owner:</span> {product.ownerName || 'N/A'}
              </p>
            </div>
          </CardBody>

          {/* Footer */}
          <div className="p-4 flex justify-between items-center border-t border-gray-200">
            {/* Price */}
            <span className="text-lg font-semibold text-gray-800">
              ₱{product.price.toFixed(2)}
            </span>

            {/* Delete Button */}
            <button
              className="text-red-500 hover:text-red-700"
              onClick={() => handleDelete(product.product_id)}
            >
              Delete
            </button>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderBusinessCards = (businessList) => {
    console.log(businessList);
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {businessList.map((business) => (
          <Card key={business.id} className="shadow-lg rounded-lg hover:scale-105 transition-transform">
            <CardBody className="p-3 md:p-4">
              <img
                src={business.imageUrl}
                alt={business.title}
                className="object-cover w-full h-32 md:h-40 rounded-lg mb-2"
              />
              <h3 className="font-bold text-base md:text-lg">{business.title}</h3>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-600">{business.type}</span>
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDeleteBusiness(business.id)}
                >
                  Delete
                </button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    )
  };

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
              {renderProductCards(filteredProducts.filter((product) => 
                product.type.toLowerCase().includes('accommodation') || 
                product.type.toLowerCase().includes('hotel') || 
                product.type.toLowerCase().includes('resort')
              ))}
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


      </div>
    </div>
  );
};

export default SuperAdminProducts;
