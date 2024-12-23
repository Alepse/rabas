import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Pagination, Navigation } from 'swiper/modules';
import { Link } from 'react-router-dom';
import { Button } from '@nextui-org/react';
import { GiPositionMarker } from 'react-icons/gi';
import img from '@/assets/shop.webp';
import { AiOutlineLike } from "react-icons/ai";
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import CryptoJS from 'crypto-js';
import { Skeleton } from "@nextui-org/skeleton";

// Use the environment variable for the base URL
const BASE_URL = import.meta.env.VITE_BASE_URL; 

const formatNumber = (num) => {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'm';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num;
};

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

const AccommodationsTab = () => {
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccommodations = async () => {
      try {
        const response = await fetch(`${BASE_URL}/getBusinessesByBusinessType/accommodation`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAccommodations(data);
      } catch (error) {
        console.error('Error fetching accommodations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccommodations();
  }, []);

  // Sort accommodations for "Design Meets Comfort" by ratings (descending)
  const designMeetsComfort = [...accommodations].sort((a, b) => b.rating - a.rating);

  // Sort accommodations for "Traveler's Choice" by number of likes (descending)
  const travelersChoice = [...accommodations].sort((a, b) => b.likes - a.likes);

  return (
    <div className='lg:container'>
      <AccommodationSwiper title="Design Meets Comfort: Accommodation Recommendations" link="/accommodations" accommodations={designMeetsComfort} loading={loading} />
      <AccommodationSwiper title="Traveler's Choice: Most Liked Stays" link="/accommodations" accommodations={travelersChoice} loading={loading} />
      <AccommodationSwiper title="Experience Comfort: Recent Additions to Our Accommodations" isLast accommodations={accommodations} loading={loading} />
    </div>
  );
};

const AccommodationSwiper = ({ title, link, isLast, accommodations, loading }) => (
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
      modules={[Pagination, Navigation]}
      spaceBetween={20}
      slidesPerView={1}
      breakpoints={{
        320: { 
          slidesPerView: 1,
        },
        640: { 
          slidesPerView: 2,
        },
        768: { 
          slidesPerView: 3,
        },
        1024: { 
          slidesPerView: 4,
        },
        1440: { 
          slidesPerView: 5,
        },
      }}
      pagination={{ clickable: true }}
      navigation
      className='max-w-full p-4 md:p-6'
    >
      {loading ? (
        Array.from({ length: 4 }).map((_, index) => {
          const opacity = 1 - index * 0.25; // Adjust the values as needed (1, 0.8, 0.6, 0.4)
          return (
            <SwiperSlide key={index} className='flex justify-center' style={{ opacity }}>
              <div className="bg-white rounded-lg shadow-lg duration-300 flex flex-col justify-between mx-auto h-full p-2 relative"
                   style={{ width: '100%', maxWidth: '300px', height: '400px' }}>
                <Skeleton className="w-full h-56 md:h-64 rounded-t-lg overflow-hidden" />
                <div className="flex-grow flex flex-col justify-between mt-4 px-2">
                  <div className="p-2">
                    <Skeleton className="h-3 mb-4" />
                    <Skeleton className="h-6 mb-4" />
                    <Skeleton className="h-4 mb-4" />
                    <Skeleton className="h-5 mb-3" /> 
                    <Skeleton className="h-10" />
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })
      ) : (
        accommodations.map((accommodation, index) => (
          <SwiperSlide key={index} className='flex justify-center'>
            <div className="bg-white rounded-lg shadow-lg hover:shadow-slate-500 hover:scale-105 duration-300 flex flex-col justify-between mx-auto h-full p-2 relative"
                 style={{ width: '100%', maxWidth: '300px', height: '400px' }}>
              {accommodation.discount > 0 && (
                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold py-1 px-2 rounded">
                  {accommodation.discount}% OFF
                </div>
              )}
              <div className="w-full h-56 md:h-64 bg-gray-200 rounded-t-lg overflow-hidden">
                {accommodation.image ? (
                  <img
                    src={`${BASE_URL}/${accommodation.image}`}
                    alt={accommodation.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span>No Image</span>
                  </div>
                )}
              </div>
              <div className="flex-grow flex flex-col justify-between mt-4 px-2">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-1">
                      {accommodation.rating ? (
                        <>
                          <span className="text-[12px]">{parseFloat(accommodation.rating).toFixed(1)}</span>
                          <span className="text-yellow-500">
                            {'★'.repeat(accommodation.rating)}
                            {'☆'.repeat(5 - accommodation.rating)}
                          </span>
                        </>
                      ) : (
                        <span className="ml-1 text-sm">No ratings</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800 truncate">
                      {accommodation.name}
                    </h3>
                    {accommodation.likes > 0 && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <AiOutlineLike /> {formatNumber(accommodation.likes)}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mb-4 flex items-center">
                    <GiPositionMarker className="mr-1" />
                    {accommodation.destination}
                  </div>
                </div>
                <div className="mt-auto">
                  <p className="text-md font-semibold text-black mb-4">
                    {accommodation.lowest_price === null && accommodation.highest_price === null ? (
                      <span className="text-gray-500">Not Available</span>
                    ) : accommodation.discount ? (
                      <>
                        <span className="line-through text-gray-500">
                          ₱{accommodation.lowest_price} - ₱{accommodation.highest_price}
                        </span>
                        <span className="text-red-500 text-xl font-bold ml-2">
                          ₱{accommodation.lowest_price - (accommodation.highest_price * accommodation.discount) / 100}
                        </span>
                      </>
                    ) : (
                      <>
                        <span>₱{accommodation.lowest_price} - ₱{accommodation.highest_price}</span>
                      </>
                    )}
                  </p>
                  <Link to={`/business/${encryptId(accommodation.business_id)}`}>
                    <Button className="w-full bg-color1 text-white text-sm font-medium px-5 py-2 rounded hover:bg-color2">
                     Explore More
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))
      )}
      </Swiper>
  </div>
);

export default AccommodationsTab;