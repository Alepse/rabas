import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { Link } from 'react-router-dom';
import { Button } from '@nextui-org/react';
import { GiPositionMarker } from 'react-icons/gi';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import img from '@/assets/shop.webp';

const foodPlaceDetails = [
  {
    image: img,
    tags: ['Local', 'Authentic'],
    rating: 5,
    name: 'Local Diner',
    destination: 'Sorsogon',
    budget: 500,
    discount: 0,
  },
  {
    image: img,
    tags: ['Fine Dining', 'Gourmet'],
    rating: 4,
    name: 'Gourmet Restaurant',
    destination: 'Sorsogon',
    budget: 2000,
    discount: 10,
  },
  {
    image: img,
    tags: ['Casual', 'Family'],
    rating: 4,
    name: 'Family Eatery',
    destination: 'Sorsogon',
    budget: 800,
    discount: 5,
  },
];

const FoodPlaceSwiper = ({ title, link, isLast }) => (
  <div className="p-4 md:p-6">
    <div className='flex flex-col md:flex-row justify-between items-center'>
      <h1 className={`text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center lg:text-start ${isLast ? 'text-light' : ''}`}>
        {title}
      </h1>
      {link && (
        <Link to={link} target='_blank' className='mb-4 md:mb-0'>
          <h1 className='text-md font-semibold text-color1 hover:tracking-wide duration-300 hover:underline cursor-pointer'>
            See More ⥬
          </h1>
        </Link>
      )}
    </div>
    <Swiper
      modules={[Navigation]}
      navigation={{ nextEl: '.custom-next', prevEl: '.custom-prev' }}
      spaceBetween={20}
      slidesPerView={1}
      breakpoints={{
        320: { slidesPerView: 1 },
        640: { slidesPerView: 1 },
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
        1440: { slidesPerView: 4 },
      }}
      className='max-w-full p-4 md:p-6'
    >
      {foodPlaceDetails.map((foodPlace, index) => (
        <SwiperSlide key={index} className='flex justify-center'>
          <div className="bg-white rounded-lg shadow-lg hover:shadow-slate-500 hover:scale-105 duration-300 flex flex-col justify-between max-w-xs md:max-w-lg lg:max-w-sm mx-auto h-[400px] p-2 relative"
               style={{ width: '300px', height: '400px' }}>
            {foodPlace.discount > 0 && (
              <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold py-1 px-2 rounded">
                {foodPlace.discount}% OFF
              </div>
            )}
            <img
              src={foodPlace.image || 'path/to/placeholder.jpg'}
              alt={foodPlace.name}
              className="w-full h-56 md:h-64 object-cover rounded-t-lg"
            />
            <div className="flex-grow flex flex-col justify-between mt-4">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-1">
                    <span className="text-[12px]">{foodPlace.rating}</span>
                    <span className="text-yellow-500">
                      {'★'.repeat(foodPlace.rating)}
                      {'☆'.repeat(5 - foodPlace.rating)}
                    </span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 truncate mb-2">{foodPlace.name}</h3>
                <div className="text-xs text-gray-500 mb-4 flex items-center">
                  <GiPositionMarker className="mr-1" />
                  {foodPlace.destination}
                </div>
              </div>
              <div className="mt-auto">
                <p className="text-md font-semibold text-black mb-4">
                  {foodPlace.discount ? (
                    <>
                      <span className="line-through text-gray-500">₱{foodPlace.budget}</span>
                      <span className="text-red-500 text-xl font-bold ml-2">
                        ₱{foodPlace.budget - (foodPlace.budget * foodPlace.discount) / 100}
                      </span>
                    </>
                  ) : (
                    `₱${foodPlace.budget}`
                  )}
                </p>
                <Link to="/business" target="_blank">
                  <Button className="w-full bg-color1 text-white text-sm font-medium px-5 py-2 rounded hover:bg-color2">
                    Explore More
                  </Button>
                </Link>
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
);

const FoodPlacesTab = () => (
  <div className='lg:container'>
    <FoodPlaceSwiper title="Culinary Delights: Must-Try Food Spots" link="/foodplaces" />
    <FoodPlaceSwiper title="Taste-Tested: Most Reviewed Eateries" link="/foodplaces" />
    <FoodPlaceSwiper title="Savor the Savings: Top Food Offers" isLast />
  </div>
);

export default FoodPlacesTab;