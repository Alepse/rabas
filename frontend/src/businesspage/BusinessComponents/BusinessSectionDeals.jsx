import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { Button } from '@nextui-org/react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

// Discounted products from BusinessAllproducts.jsx
const discountedProducts = [
  {
    id: 'Hiking Adventure',
    name: 'Hiking Adventure',
    description: 'Explore scenic mountain trails. Guide and equipment included.',
    price: 1500,
    discountedPrice: 1350,
    image: 'https://via.placeholder.com/200',
    expiration: '10/4/2024',
  },
  {
    id: 'Snorkeling Tour',
    name: 'Snorkeling Tour',
    description: 'Discover the underwater world with a guided snorkeling tour.',
    price: 1200,
    discountedPrice: 1080,
    image: 'https://via.placeholder.com/200',
    expiration: '10/4/2024',
  },
  {
    id: 'Snorkeling Tour',
    name: 'Snorkeling Tour',
    description: 'Discover the underwater world with a guided snorkeling tour.',
    price: 1200,
    discountedPrice: 1080,
    image: 'https://via.placeholder.com/200',
    expiration: '10/4/2024',
  },
  {
    id: 'Snorkeling Tour',
    name: 'Snorkeling Tour',
    description: 'Discover the underwater world with a guided snorkeling tour.',
    price: 1200,
    discountedPrice: 1080,
    image: 'https://via.placeholder.com/200',
    expiration: '10/4/2024',
  },

  
  // Add more discounted products as needed
];

const BusinessSection = () => {
  return (
    <div className='mx-auto mt-4 container p-4 rounded-xl mb-4'>
      {/* Header Section */}
      <div className='flex justify-between items-center p-2'>
        <h1 className='text-2xl font-semibold'>Deals</h1>
        <h1 className='text-md font-semibold text-color1 hover:tracking-wide duration-300 hover:underline cursor-pointer'>
          See More
        </h1>
      </div>

      {/* Swiper Section */}
      <div className='mt-8'>
        <Swiper
          modules={[Navigation]}
          navigation={{ nextEl: '.custom-next', prevEl: '.custom-prev' }}
          spaceBetween={10}
          slidesPerView={1}
          breakpoints={{
            320: { slidesPerView: 1 },
            480: { slidesPerView: 1.5 },
            640: { slidesPerView: 2 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className='max-w-full p-4 overflow-hidden'
        >
          {discountedProducts.map(deal => (
            <SwiperSlide key={deal.id} className='flex justify-center'>
              <div className='shadow-lg rounded-lg overflow-hidden bg-white relative max-w-sm mx-1 transform transition-transform duration-300 hover:scale-105 hover:shadow-xl'>
                <img src={deal.image} alt={deal.name} className='w-full h-48 object-cover' />
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  10% OFF
                </div>
                <Button size="sm" className="absolute top-2 right-2 text-white bg-color1">
                  View Images
                </Button>
                <div className='p-4'>
                  <h3 className='text-lg font-semibold text-gray-800'>{deal.name}</h3>
                  <p className='text-sm text-gray-600 mt-1'>{deal.description}</p>
                  <p className='text-xs text-red-500 mt-1'>Expires on: {deal.expiration}</p>
                  <div className='flex justify-between mt-3'>
                    <p className='mt-2 font-bold text-gray-800'>
                      <span className="line-through text-gray-500">₱{deal.price.toFixed(2)}</span> <span className="text-red-500">₱{deal.discountedPrice.toFixed(2)}</span>
                    </p>
                    <div className='flex gap-2'>
                      <Button auto size="sm" color="primary">Inquire</Button>
                      <Button auto size="sm" color="primary">Book Now</Button>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
          <div className="custom-prev absolute left-2 top-[25%] transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md z-10 cursor-pointer hover:bg-gray-300 text-xl duration-300">
            <FaArrowLeft />
          </div>
          <div className="custom-next absolute right-2 top-[25%] transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md z-10 cursor-pointer hover:bg-gray-300 text-xl duration-300">
            <FaArrowRight />
          </div>
        </Swiper>
      </div>
    </div>
  );
};

export default BusinessSection;
