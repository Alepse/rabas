import {useEffect, useState, useCallback} from 'react';
import Sidebar from '../components/sidebar';
import PropTypes from 'prop-types';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { AiFillStar } from 'react-icons/ai';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { Skeleton } from "@nextui-org/skeleton";
import axios from 'axios';
// Use the environment variable for the base URL
const BASE_URL = import.meta.env.VITE_BASE_URL; 

const data = [
  { name: 'Oct', visits: 40 },
  { name: 'Nov', visits: 70 },
  { name: 'Dec', visits: 50 },
  { name: 'Jan', visits: 30 },
  { name: 'Feb', visits: 60 },
  { name: 'Mar', visits: 80 },
];

const reviewData = [
  { year: 2019, reviews: 200 },
  { year: 2020, reviews: 300 },
  { year: 2021, reviews: 500 },
  { year: 2022, reviews: 700 },
  { year: 2023, reviews: 800 },
];

const BusinessDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [businessProducts, setBusinessProducts] = useState([]);
  const [productsWithActiveDeals, setProductsWithActiveDeals] = useState([]);
  const [mostReviewedProducts, setMostReviewedProducts] = useState([]);
  const [averageRating, setAverageRating] = useState(0); // State to hold the average rating
  const [businessRating, setBusinessRating] = useState(0);
  

  // Function to calculate the average rating
  const calculateAverageRating = (products) => {
    let totalRatingPoints = 0;
    let totalReviews = 0;

    // Sum the total rating points and review count
    products.forEach(product => {
      totalRatingPoints += product.rating * product.review_count;
      totalReviews += product.review_count;
    });

    // Calculate the average rating
    const averageRating = totalReviews === 0 ? 0 : totalRatingPoints / totalReviews;

    return averageRating;
  };

  // Function to check login status
  const checkLoginStatus = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/check-login`, {
        method: 'GET',
        credentials: 'include', // Include cookies
      });
      if (response.ok) {
        const data = await response.json();
        setIsLoggedIn(data.isLoggedIn); // Set login status

        if (!data.isLoggedIn) {
          window.location.href = '/';
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

  useEffect(() => {
    const fetchAllData = async () => {
      if (isLoggedIn) {
        try {
  
          // Execute all fetch operations concurrently
          const [productsResponse, activeDealsResponse, mostReviewedResponse, businessData] = await Promise.all([
            axios.get(`${BASE_URL}/getProducts`, { withCredentials: true }),
            axios.get(`${BASE_URL}/getProductsWithActiveDeals`, { withCredentials: true }),
            axios.get(`${BASE_URL}/getMostReviewedProducts`, { withCredentials: true }),
            axios.get(`${BASE_URL}/getBusinessRatings`, { withCredentials: true }),
          ]);
  
          // Process the fetched data
          const products = productsResponse.data.businessProducts;
          const activeDeals = activeDealsResponse.data.productsWithDeals;
          const mostReviewed = mostReviewedResponse.data.products;
          const businessRating = businessData.data.rating;
          // console.log(businessRating);
          // Update state with the fetched data
          setBusinessProducts(products);
          setProductsWithActiveDeals(activeDeals);
          setMostReviewedProducts(mostReviewed);
          setBusinessRating(businessRating); // Update business rating
  
          // Calculate and set average rating for most reviewed products
          const avgRating = calculateAverageRating(mostReviewed);
          setAverageRating(avgRating);
        } catch (error) {
          console.error('Error fetching business data:', error);
        } finally {
          // Ensure loading state is updated regardless of success or failure
          setLoading(false);
        }
      }
    };
  
    fetchAllData();
  }, [isLoggedIn]);
  

  // console.log("produysss", businessProducts);

  // Title Tab
  useEffect(() => {
    document.title = 'BusinessName | Admin dashboard';
  });

  return (
    <div className="flex max-lg:flex-col min-h-screen bg-gray-50 font-sans">
      <Sidebar />
      {loading ?
      (
        <div className="flex-1 p-4 md:p-6 lg:p-8 max-h-screen overflow-y-auto">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-8 text-gray-800">Dashboard</h1>
          <div className="py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Skeleton className="rounded-lg h-40 "/>
              <Skeleton className="rounded-lg h-40 "/>
              <Skeleton className="rounded-lg h-40 "/>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Skeleton className="rounded-lg h-[400px] md:h-[500px] w-full "/>
            <Skeleton className="rounded-lg h-[400px] md:h-[500px] w-full "/>
            </div>
          </div>
        </div>
      ) : (     
      <div className="flex-1 px-8 py-4 md:p-6 lg:p-8 max-h-screen overflow-y-auto">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-8 text-gray-800">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard title="Products" value={businessProducts.length} icon="📦" />
          <DashboardCard title="Active Deals" value={productsWithActiveDeals.length} icon="💼" />
          <DashboardCard title="Products Average Rate" value={averageRating.toFixed(1)} icon="⭐" />
          <DashboardCard title="Business Rating" value={businessRating.toFixed(1)} icon="📈" /> {/* New Card */}
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-2  gap-8 mb-8">
          <div className='flex justify-center'>
            <ChartSection title="Page Visitation">
              <div className=" w-full flex items-center justify-center">
                <LineChart 
                   width={window.innerWidth < 868 ? 850 : 1000}
                   height={window.innerWidth < 768 ? 300 : 500} 
                  data={data}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <Line 
                    type="monotone" 
                    dataKey="visits" 
                    stroke="#4f46e5" 
                    strokeWidth={2}
                  />
                  <CartesianGrid stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: window.innerWidth < 768 ? 12 : 14 }}
                  />
                  <YAxis 
                    tick={{ fontSize: window.innerWidth < 768 ? 12 : 14 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      fontSize: window.innerWidth < 768 ? 12 : 14,
                      backgroundColor: 'rgba(255, 255, 255, 0.9)'
                    }} 
                  />
                </LineChart>
              </div>
            </ChartSection>

           
          </div>

          <MostReviewedProducts products={mostReviewedProducts} />
         
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         
          <OngoingDeals deals={productsWithActiveDeals} />
          <AllProducts products={businessProducts} />
        </div>
      </div>
      )
    }
    </div>
  );
};


const DashboardCard = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 text-center transition-transform transform hover:scale-105">
    <div className="text-4xl mb-2 text-indigo-600">{icon}</div>
    <h3 className="text-lg font-medium mb-1 text-gray-700">{title}</h3>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
  </div>
);

DashboardCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  icon: PropTypes.string.isRequired,
};

const ChartSection = ({ title, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 w-full">
    <h2 className="text-xl font-semibold mb-6 text-gray-800 text-center">{title}</h2>
    {children}
  </div>
);

ChartSection.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
};

const MostReviewedProducts = ({ products }) => {
  const settings = {
    dots: true,
    infinite: products.length > 1,
    speed: 500,
    slidesToShow: Math.min(3, products.length),
    slidesToScroll: Math.min(3, products.length),
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(2, products.length),
          slidesToScroll: Math.min(2, products.length),
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="bg-white  p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Most Reviewed Products</h2>
      <div className="p-4">
  <div className="space-y-4 max-h-[420px] scrollbar-custom overflow-y-auto">
    {products.map((product) => (
      <div
        key={product.product_id}
        className="bg-gray-50 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col sm:flex-row items-start"
      >
        {/* Image Section */}
        {product.images && Array.isArray(product.images) && product.images.length > 0 ? (
          <img
            src={`${BASE_URL}/${product.images[0].path}`}
            alt={product.images[0].title}
            className="w-full sm:w-40 h-40 object-cover rounded-md sm:mr-4 mb-4 sm:mb-0"
          />
        ) : (
          <div className="w-full sm:w-40 h-40 flex items-center justify-center rounded-md bg-gray-300 sm:mr-4 mb-4 sm:mb-0">
            <p className="text-sm text-gray-500">No images available</p>
          </div>
        )}

        {/* Content Section */}
        <div className="flex-grow">
          <h3 className="text-lg font-bold mb-1 text-gray-700">{product.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{product.description}</p>
          <div className="flex items-center mb-2">
            <span className="text-yellow-500 font-bold">{parseFloat(product.rating).toFixed(1)}</span>
            <AiFillStar className="text-yellow-500 ml-1" />
          </div>
          <p className="text-sm text-gray-600">Price: ₱{product.price}</p>
          <p className="text-sm text-gray-600">{product.review_count} review/s</p>
        </div>
      </div>
    ))}
  </div>
</div>


    </div>
  );
};

const OngoingDeals = ({ deals }) => {
  const settings = {
    dots: true,
    infinite: deals.length > 1 ,
    speed: 500,
    slidesToShow: Math.min(3, deals.length),
    slidesToScroll: Math.min(3, deals.length),
    arrows: deals.length > 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(2, deals.length),
          slidesToScroll: Math.min(2, deals.length),
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Active Deals</h2>
      <div className="p-4">
      <div className="space-y-4 max-h-[420px] scrollbar-custom overflow-y-auto ">
    {deals.map((deal) => (
      <div
        key={deal.product_id}
        className="bg-gray-50 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col sm:flex-row items-start"
      >
        {/* Image Section */}
        {deal.images && Array.isArray(deal.images) && deal.images.length > 0 ? (
          <img
            src={`${BASE_URL}/${deal.images[0].path}`}
            alt={deal.images[0].title}
            className="w-full sm:w-40 h-40 object-cover rounded-md sm:mr-4 mb-4 sm:mb-0"
          />
        ) : (
          <div className="w-full sm:w-40 h-40 flex items-center justify-center rounded-md bg-gray-300 sm:mr-4 mb-4 sm:mb-0">
            <p className="text-sm text-gray-500">No images available</p>
          </div>
        )}

        {/* Content Section */}
        <div className="flex-grow">
          <h3 className="text-lg font-bold text-gray-700 mb-2">{deal.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{deal.description}</p>
          <p className="text-sm text-gray-600 mb-1">
            Price: ₱{deal.price} {deal.pricingUnit}
          </p>
          {deal.discount && (
            <>
              <p className="text-sm text-gray-600 mb-1">
                Discount: {deal.discount}% off
              </p>
              <p className="text-sm text-gray-600 mb-1">
                Discounted Price: ₱{(deal.price - (deal.price * deal.discount / 100)).toFixed(2)} {deal.pricingUnit}
              </p>
            </>
          )}
          <p className="text-sm text-gray-600 mb-1">
            Valid Until: {new Date(deal.expirationDate).toLocaleDateString('en-US')}
          </p>
          <p className="text-sm text-gray-600">
            Booking Option: {deal.hasBookingOption ? "Yes" : "No"}
          </p>
        </div>
      </div>
    ))}
  </div>
</div>


    </div>
  );
};

const AllProducts = ({ products }) => {
  const settings = {
    dots: true,
    infinite: products.length >1 ,
    speed: 500,
    slidesToShow: Math.min(3, products.length),
    slidesToScroll: Math.min(3, products.length),
    arrows: products.length > 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(2, products.length),
          slidesToScroll: Math.min(2, products.length),
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">All Products</h2>
      <div className="p-4">
      <div className="space-y-4 max-h-[420px] scrollbar-custom overflow-y-auto ">
    {products.map((product) => (
      <div
        key={product.product_id}
        className="bg-gray-50 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col sm:flex-row items-start"
      >
        {/* Image Section */}
        {product.images && Array.isArray(product.images) && product.images.length > 0 ? (
          <img
            src={`${BASE_URL}/${product.images[0].path}`}
            alt={product.images[0].title}
            className="w-full sm:w-40 h-40 object-cover rounded-md sm:mr-4 mb-4 sm:mb-0"
          />
        ) : (
          <div className="w-full sm:w-40 h-40 flex items-center justify-center rounded-md bg-gray-300 sm:mr-4 mb-4 sm:mb-0">
            <p className="text-sm text-gray-500">No images available</p>
          </div>
        )}

        {/* Content Section */}
        <div className="flex-grow">
          <h3 className="text-lg font-bold text-gray-700 mb-2">{product.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{product.description}</p>
          <p className="text-sm text-gray-600 mb-1">
            Price: ₱{product.price} {product.pricing_unit}
          </p>
          <p className="text-sm text-gray-600">
            Booking Option: {product.booking_operation ? "Yes" : "No"}
          </p>
        </div>
      </div>
    ))}
  </div>
</div>


    </div>
  );
};

export default BusinessDashboard;