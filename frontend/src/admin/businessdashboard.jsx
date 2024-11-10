import {useEffect} from 'react';
import Sidebar from '../components/sidebar';
import PropTypes from 'prop-types';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { AiFillStar } from 'react-icons/ai';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Sample data for most reviewed products
const sampleMostReviewedProducts = [
  {
    title: 'Luxury Mountain Cabin',
    description: 'Stay in a cozy cabin with scenic views and modern amenities.',
    price: 5000,
    imageUrl: 'https://via.placeholder.com/200',
    rating: 5,
  },
  {
    title: 'Beachfront Resort',
    description: 'Relax in a luxury resort right on the beach.',
    price: 8000,
    imageUrl: 'https://via.placeholder.com/200',
    rating: 4,
  },
  {
    title: 'Hiking Adventure',
    description: 'Explore scenic mountain trails. Guide and equipment included.',
    price: 1500,
    imageUrl: 'https://via.placeholder.com/200',
    rating: 4,
  },
  {
    title: 'City Tour',
    description: 'Discover the city with a guided tour.',
    price: 2000,
    imageUrl: 'https://via.placeholder.com/200',
    rating: 4,
  },
  {
    title: 'Wine Tasting',
    description: 'Enjoy a selection of fine wines.',
    price: 3000,
    imageUrl: 'https://via.placeholder.com/200',
    rating: 5,
  },
];

// Sample ongoing deals based on ActivityDeals.jsx structure
const sampleOngoingDeals = [
  {
    name: 'Hiking Adventure Deal',
    description: '20% off on all hiking adventures. Book now!',
    price: 1200,
    pricingUnit: 'per person',
    expirationDate: '2023-12-31',
    hasBookingOption: true,
    image: 'https://via.placeholder.com/200',
  },
  {
    name: 'Luxury Cabin Stay',
    description: '15% discount on luxury cabin stays.',
    price: 4250,
    pricingUnit: 'per night',
    expirationDate: '2023-11-30',
    hasBookingOption: true,
    image: 'https://via.placeholder.com/200',
  },
  {
    name: 'City Tour Special',
    description: '10% off on city tours.',
    price: 1800,
    pricingUnit: 'per tour',
    expirationDate: '2023-10-31',
    hasBookingOption: false,
    image: 'https://via.placeholder.com/200',
  },
  {
    name: 'Wine Tasting Experience',
    description: '5% off on wine tasting sessions.',
    price: 2850,
    pricingUnit: 'per session',
    expirationDate: '2023-09-30',
    hasBookingOption: true,
    image: 'https://via.placeholder.com/200',
  },
];

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

  
    // Title Tab
    useEffect(() => {
      document.title = 'BusinessName | Admin dashboard';
      });

  return (
    <div className="flex max-lg:flex-col min-h-screen bg-gray-50 font-sans">
      <Sidebar />
      <div className="flex-1 p-4 md:p-6 lg:p-8 max-h-screen overflow-y-auto">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-8 text-gray-800">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard title="My Events" value={5} icon="📅" />
          <DashboardCard title="My Deals" value={3} icon="💼" />
          <DashboardCard title="My Products" value={12} icon="📦" />
          <DashboardCard title="My Rate" value={4.5} icon="⭐" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className='flex justify-center '>
          <ChartSection title="Page Visitation" >
            <LineChart width={700} height={200} data={data}>
              <Line type="monotone" dataKey="visits" stroke="#4f46e5" />
              <CartesianGrid stroke="#e5e7eb" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
            </LineChart>
          </ChartSection>
          </div>
          <div className='flex justify-center '>
          <ChartSection title="Tourist Statistical Review">
            <BarChart width={700} height={200} data={reviewData}>
              <Bar dataKey="reviews" fill="#10b981" />
              <CartesianGrid stroke="#e5e7eb" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
            </BarChart>
          </ChartSection>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-8">
          <MostReviewedProducts products={sampleMostReviewedProducts} />
          <OngoingDeals deals={sampleOngoingDeals} />
        </div>
      </div>
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
  value: PropTypes.number.isRequired,
  icon: PropTypes.string.isRequired,
};

const ChartSection = ({ title, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
    <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>
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
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
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
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Most Reviewed Products</h2>
      <Slider {...settings}>
        {products.map((product, index) => (
          <div key={index} className="p-4">
            <div className="bg-gray-50 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <img src={product.imageUrl} alt={product.title} className="w-full h-40 object-cover rounded-md mb-2" />
              <h3 className="text-lg font-bold mb-1 text-gray-700">{product.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{product.description}</p>
              <div className="flex items-center mb-2">
                <span className="text-yellow-500 font-bold">{product.rating}</span>
                <AiFillStar className="text-yellow-500 ml-1" />
              </div>
              <p className="text-sm text-gray-600">Price: ₱{product.price}</p>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

const OngoingDeals = ({ deals }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
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
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Ongoing Deals</h2>
      <Slider {...settings}>
        {deals.map((deal, index) => (
          <div key={index} className="p-4">
            <div className="bg-gray-50 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <img src={deal.image} alt={deal.name} className="w-full h-40 object-cover rounded-md mb-2" />
              <h3 className="text-lg font-bold text-gray-700">{deal.name}</h3>
              <p className="text-sm text-gray-600">{deal.description}</p>
              <p className="text-sm text-gray-600">Price: ₱{deal.price} {deal.pricingUnit}</p>
              <p className="text-sm text-gray-600">Valid Until: {deal.expirationDate}</p>
              <p className="text-sm text-gray-600">Booking Option: {deal.hasBookingOption ? "Yes" : "No"}</p>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default BusinessDashboard;