import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { Link } from 'react-router-dom';
import { Button } from '@nextui-org/react';
import { GiPositionMarker } from 'react-icons/gi';
import img from '@/assets/shop.webp';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const accommodationDetails = [
  {
    image: img,
    tags: ['Luxury', 'Comfort'],
    rating: 5,
    name: 'Luxury Resort',
    destination: 'Sorsogon',
    budget: 5000,
    discount: 15,
  },
  {
    image: img,
    tags: ['Budget', 'Convenience'],
    rating: 4,
    name: 'Budget Inn',
    destination: 'Sorsogon',
    budget: 1500,
    discount: 0,
  },
  {
    image: img,
    tags: ['Family', 'Spacious'],
    rating: 4,
    name: 'Family Suite',
    destination: 'Sorsogon',
    budget: 3000,
    discount: 10,
  },
];

const AccommodationSwiper = ({ title, link, isLast }) => (
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
      {accommodationDetails.map((accommodation, index) => (
        <SwiperSlide key={index} className='flex justify-center'>
          <div className="bg-white rounded-lg shadow-lg hover:shadow-slate-500 hover:scale-105 duration-300 flex flex-col justify-between max-w-xs md:max-w-lg lg:max-w-sm mx-auto h-[400px] p-2 relative"
               style={{ width: '300px', height: '400px' }}>
            {accommodation.discount > 0 && (
              <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold py-1 px-2 rounded">
                {accommodation.discount}% OFF
              </div>
            )}
            <img
              src={accommodation.image || 'path/to/placeholder.jpg'}
              alt={accommodation.name}
              className="w-full h-56 md:h-64 object-cover rounded-t-lg"
            />
            <div className="flex-grow flex flex-col justify-between mt-4">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-1">
                    <span className="text-[12px]">{accommodation.rating}</span>
                    <span className="text-yellow-500">
                      {'★'.repeat(accommodation.rating)}
                      {'☆'.repeat(5 - accommodation.rating)}
                    </span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 truncate mb-2">{accommodation.name}</h3>
                <div className="text-xs text-gray-500 mb-4 flex items-center">
                  <GiPositionMarker className="mr-1" />
                  {accommodation.destination}
                </div>
              </div>
              <div className="mt-auto">
                <p className="text-md font-semibold text-black mb-4">
                  {accommodation.discount ? (
                    <>
                      <span className="line-through text-gray-500">₱{accommodation.budget}</span>
                      <span className="text-red-500 text-xl font-bold ml-2">
                        ₱{accommodation.budget - (accommodation.budget * accommodation.discount) / 100}
                      </span>
                    </>
                  ) : (
                    `₱${accommodation.budget}`
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

const AccommodationsTab = () => (
  <div className='lg:container'>
    <AccommodationSwiper title="Design Meets Comfort: Accommodation Recommendations" link="/accommodations" />
    <AccommodationSwiper title="Traveler's Choice: Most Reviewed Stays" link="/accommodations" />
    <AccommodationSwiper title="Top Accommodation Offers" isLast />
  </div>
);

export default AccommodationsTab;