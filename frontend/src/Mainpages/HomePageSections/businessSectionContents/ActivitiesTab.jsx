import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { Link } from 'react-router-dom';
import { Button } from '@nextui-org/react';
import { GiPositionMarker } from 'react-icons/gi';
import { AiFillStar } from 'react-icons/ai';
import img from '@/assets/shop.webp';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const activityDetails = [
  {
    image: img,
    tags: ['Adventure', 'Nature'],
    rating: 4,
    name: 'Trekking in the Mountains',
    destination: 'Sorsogon',
    budget: 2000,
    discount: 10,
  },
  {
    image: img,
    tags: ['Beach', 'Relaxation'],
    rating: 5,
    name: 'Beach Relaxation',
    destination: 'Sorsogon',
    budget: 1000,
    discount: 5,
  },
  {
    image: img,
    tags: ['Cultural', 'Historical'],
    rating: 3,
    name: 'Historical Tour',
    destination: 'Sorsogon',
    budget: 900,
    discount: 0,
  },
  {
    image: img,
    tags: ['Wildlife', 'Photography'],
    rating: 4,
    name: 'Wildlife Safari',
    destination: 'Sorsogon',
    budget: 1200,
    discount: 0,
  },
  {
    image: img,
    tags: ['Wildlife', 'Photography'],
    rating: 4,
    name: 'Wildlife Safari',
    destination: 'Sorsogon',
    budget: 1200,
    discount: 0,
  },
];

const ActivityCard = ({ activity }) => (
  <div className="bg-white rounded-lg shadow-lg hover:shadow-slate-500 hover:scale-105 duration-300 flex flex-col justify-between max-w-xs md:max-w-lg lg:max-w-sm mx-auto h-[400px] p-2 relative"
       style={{ width: '300px', height: '400px' }}>
    {activity.discount > 0 && (
      <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold py-1 px-2 rounded">
        {activity.discount}% OFF
      </div>
    )}
    <img
      src={activity.image || 'path/to/placeholder.jpg'}
      alt={activity.name}
      className="w-full h-56 md:h-64 object-cover rounded-t-lg"
    />
    <div className="flex-grow flex flex-col justify-between mt-4">
      <div>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-1">
            <span className="text-[12px]">{activity.rating}</span>
            <span className="text-yellow-500">
              {'★'.repeat(activity.rating)}
              {'☆'.repeat(5 - activity.rating)}
            </span>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 truncate mb-2">{activity.name}</h3>
        <div className="text-xs text-gray-500 mb-4 flex items-center">
          <GiPositionMarker className="mr-1" />
          {activity.destination}
        </div>
      </div>
      <div className="mt-auto">
        <p className="text-md font-semibold text-black mb-4">
          {activity.discount ? (
            <>
              <span className="line-through text-gray-500">₱{activity.budget}</span>
              <span className="text-red-500 text-xl font-bold ml-2">
                ₱{activity.budget - (activity.budget * activity.discount) / 100}
              </span>
            </>
          ) : (
            `₱${activity.budget}`
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
);

const ActivitiesTab = () => (
  <div className='lg:container'>
    {['Adventure Awaits: Top Activity Spots', 'Popular Now: Most Reviewed Activities', 'Top Activity Offers'].map((title, idx) => (
      <div key={idx} className="p-4 md:p-6">
        <div className='flex flex-col md:flex-row justify-between items-center'>
          <h1 className={`text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center lg:text-start ${title === 'Top Activity Offers' ? 'text-white' : ''}`}>
            {title}
          </h1>
          {title !== 'Top Activity Offers' && (
            <Link to='/activities' target='_blank' className='mb-4 md:mb-0'>
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
            480: { slidesPerView: 1.5 },
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
            1440: { slidesPerView: 4 },
          }}
          className='max-w-full p-4 md:p-6 overflow-hidden'
        >
          {activityDetails.map((activity, index) => (
            <SwiperSlide key={index} className='flex justify-center'>
              <ActivityCard activity={activity} />
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
    ))}
  </div>
);

export default ActivitiesTab;