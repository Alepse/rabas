import React, { useState, useEffect } from 'react'
import { MapPin, Star, Info } from 'lucide-react'
import bulusanpic1 from '@/assets/bulusan-destination.webp'
import bulusanpic2 from '@/assets/bulusanpic2.webp'
import bulusanpic3 from '@/assets/bulusanpic3.webp'
import bulusanpic4 from '@/assets/bulusanpic4.webp'
import bulusanpic5 from '@/assets/bulusanpic5.webp'
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { Link } from 'react-router-dom';
import { Button } from '@nextui-org/react';
import { GiPositionMarker } from 'react-icons/gi';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { Skeleton } from "@nextui-org/skeleton";
import MapSection from '@/components/mapsection';

// Use the environment variable for the base URL
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


const renderSwiperActivitySection = (title, link, spots) => {
  const activitySpots = spots.filter(spot => spot.businessType === 'attraction');

  return (
    <div className="p-2 md:p-6">
      <div className='flex flex-col md:flex-row justify-between items-center mt-5'>
        <h1 className='text-xl md:text-2xl font-bold p-2 text-center lg:text-start'>
          {title}
        </h1>
        <Link to={link} target='_blank' className='mb-4 md:mb-0'>
          <h1 className='text-md font-semibold text-color1 hover:tracking-wide duration-300 hover:underline cursor-pointer'>
            See More ⥬
          </h1>
        </Link>
      </div>
      {activitySpots.length > 0 ? (
        <Swiper
          modules={[Navigation]}
          navigation={{ nextEl: '.custom-next', prevEl: '.custom-prev' }}
          spaceBetween={24}
          slidesPerView={3}
          breakpoints={{
            320: { slidesPerView: 1 },
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1440: { slidesPerView: 4 },
          }}
          className='max-w-full p-4 md:p-6'
        >
          {activitySpots.map((spot, index) => (
            <SwiperSlide key={index} className='flex justify-center'>
              <div className="bg-white rounded-lg shadow-lg hover:shadow-slate-500 hover:scale-105 duration-300 flex flex-col justify-between mx-auto h-full p-2 relative"
                 style={{ width: '100%', maxWidth: '300px', height: '400px' }}>
                <div className="w-full h-56 md:h-64 bg-gray-200 rounded-t-lg overflow-hidden">
                  {spot.image ? (
                    <img
                      src={spot.image ? `${BASE_URL}/${spot.image}` : `${BASE_URL}/${spot.businessLogo}`}
                      alt={spot.name}
                      className="w-full h-48 object-cover rounded-t-lg"
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
                        {spot.rating ? (
                          <>
                            <span className="text-[12px]">{parseFloat(spot.rating).toFixed(1)}</span>
                            <span className="text-yellow-500">
                              {'★'.repeat(Math.floor(spot.rating))}
                              {'☆'.repeat(5 - Math.floor(spot.rating))}
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-500 text-[12px]">No ratings</span>
                        )}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 truncate mb-2">{spot.name}</h3>
                    <div className="text-xs text-gray-500 mb-4 flex items-center">
                      <GiPositionMarker className="mr-1" />
                      {spot.destination}
                    </div>
                  </div>
                  <div className="mt-auto">
                    <p className="text-md font-semibold text-black mb-4">
                      ₱{spot.lowest_price} - ₱{spot.highest_price}
                    </p>
                    <Link to={`/business/${encryptId(spot.business_id)}`}>
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
      ) : (
        <p className="h-48 bg-gray-100 flex items-center justify-center italic text-center text-gray-500 mt-4 rounded-t-lg">No activities available at the moment.</p>
      )}
    </div>
  );
};

const renderSwiperAccommodationSection = (title, link, spots) => {
  const accommodationSpots = spots.filter(spot => spot.businessType === 'accommodation');

  return (
    <div className="p-2 md:p-6">
      <div className='flex flex-col md:flex-row justify-between items-center mt-5'>
        <h1 className='text-xl md:text-2xl font-bold p-2 text-center lg:text-start'>
          {title}
        </h1>
        <Link to={link} target='_blank' className='mb-4 md:mb-0'>
          <h1 className='text-md font-semibold text-color1 hover:tracking-wide duration-300 hover:underline cursor-pointer'>
            See More ⥬
          </h1>
        </Link>
      </div>
      {accommodationSpots.length > 0 ? (
        <Swiper
          modules={[Navigation]}
          navigation={{ nextEl: '.custom-next', prevEl: '.custom-prev' }}
          spaceBetween={24}
          slidesPerView={3}
          breakpoints={{
            320: { slidesPerView: 1 },
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1440: { slidesPerView: 4 },
          }}
          className='max-w-full p-4 md:p-6'
        >
          {accommodationSpots.map((spot, index) => (
            <SwiperSlide key={index} className='flex justify-center'>
              <div className="bg-white rounded-lg shadow-lg hover:shadow-slate-500 hover:scale-105 duration-300 flex flex-col justify-between mx-auto h-full p-2 relative"
                style={{ width: '100%', maxWidth: '300px', height: '400px' }}>
                <div className="w-full h-56 md:h-64 bg-gray-200 rounded-t-lg overflow-hidden">
                  {spot.image ? (
                    <img
                      src={spot.image ? `${BASE_URL}/${spot.image}` : `${BASE_URL}/${spot.businessLogo}`}
                      alt={spot.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span>No Image</span>
                    </div>
                  )}
                </div>
                <div className="flex-grow flex flex-col justify-between mt-4">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-1">
                        {spot.rating ? (
                          <>
                            <span className="text-[12px]">{parseFloat(spot.rating).toFixed(1)}</span>
                            <span className="text-yellow-500">
                              {'★'.repeat(Math.floor(spot.rating))}
                              {'☆'.repeat(5 - Math.floor(spot.rating))}
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-500 text-[12px]">No ratings</span>
                        )}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 truncate mb-2">{spot.name}</h3>
                    <div className="text-xs text-gray-500 mb-4 flex items-center">
                      <GiPositionMarker className="mr-1" />
                      {spot.destination}
                    </div>
                  </div>
                  <div className="mt-auto">
                    <p className="text-md font-semibold text-black mb-4">
                      ₱{spot.lowest_price} - ₱{spot.highest_price}
                    </p>
                    <Link to={`/business/${encryptId(spot.business_id)}`}>
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
      ) : (
        <p className="h-48 bg-gray-100 flex items-center justify-center italic text-center text-gray-500 mt-4 rounded-t-lg">No accommodations available at the moment.</p>
      )}
    </div>
  );
};

const renderSwiperEaterySection = (title, link, spots) => {
  const eaterySpots = spots.filter(spot => spot.businessType === 'restaurant');

  return (
    <div className="p-2 md:p-6">
      <div className='flex flex-col md:flex-row justify-between items-center mt-5'>
        <h1 className='text-xl md:text-2xl font-bold p-2 text-center lg:text-start'>
          {title}
        </h1>
        <Link to={link} target='_blank' className='mb-4 md:mb-0'>
          <h1 className='text-md font-semibold text-color1 hover:tracking-wide duration-300 hover:underline cursor-pointer'>
            See More ⥬
          </h1>
        </Link>
      </div>
      {eaterySpots.length > 0 ? (
        <Swiper
          modules={[Navigation]}
          navigation={{ nextEl: '.custom-next', prevEl: '.custom-prev' }}
          spaceBetween={24}
          slidesPerView={3}
          breakpoints={{
            320: { slidesPerView: 1 },
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1440: { slidesPerView: 4 },
          }}
          className='max-w-full p-4 md:p-6'
        >
          {eaterySpots.map((spot, index) => (
            <SwiperSlide key={index} className='flex justify-center'>
              <div className="bg-white rounded-lg shadow-lg hover:shadow-slate-500 hover:scale-105 duration-300 flex flex-col justify-between mx-auto h-full p-2 relative"
                style={{ width: '100%', maxWidth: '300px', height: '400px' }}>
                <div className="w-full h-56 md:h-64 bg-gray-200 rounded-t-lg overflow-hidden">
                  {spot.image ? (
                    <img
                      src={spot.image ? `${BASE_URL}/${spot.image}` : `${BASE_URL}/${spot.businessLogo}`}
                      alt={spot.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span>No Image</span>
                    </div>
                  )}
                </div>
                <div className="flex-grow flex flex-col justify-between mt-4">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-1">
                        {spot.rating ? (
                          <>
                            <span className="text-[12px]">{parseFloat(spot.rating).toFixed(1)}</span>
                            <span className="text-yellow-500">
                              {'★'.repeat(Math.floor(spot.rating))}
                              {'☆'.repeat(5 - Math.floor(spot.rating))}
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-500 text-[12px]">No ratings</span>
                        )}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 truncate mb-2">{spot.name}</h3>
                    <div className="text-xs text-gray-500 mb-4 flex items-center">
                      <GiPositionMarker className="mr-1" />
                      {spot.destination}
                    </div>
                  </div>
                  <div className="mt-auto">
                    <p className="text-md font-semibold text-black mb-4">
                      ₱{spot.lowest_price} - ₱{spot.highest_price}
                    </p>
                    <Link to={`/business/${encryptId(spot.business_id)}`}>
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
      ) : (
        <p className="h-48 bg-gray-100 flex items-center justify-center italic text-center text-gray-500 mt-4 rounded-t-lg">No eateries available at the moment.</p>
      )}
    </div>
  );
};

const renderSwiperShopSection = (title, link, spots) => {
  // Filter spots to include only those with businessType 'shop'
  const shopSpots = spots.filter(spot => spot.businessType === 'shop');

  return (
    <div className="p-2 md:p-6">
      <div className='flex flex-col md:flex-row justify-between items-center mt-5'>
        <h1 className='text-xl md:text-2xl font-bold p-2 text-center lg:text-start'>
          {title}
        </h1>
        <Link to={link} target='_blank' className='mb-4 md:mb-0'>
          <h1 className='text-md font-semibold text-color1 hover:tracking-wide duration-300 hover:underline cursor-pointer'>
            See More ⥬
          </h1>
        </Link>
      </div>
      {shopSpots.length > 0 ? (
        <Swiper
          modules={[Navigation]}
          navigation={{ nextEl: '.custom-next', prevEl: '.custom-prev' }}
          spaceBetween={24}
          slidesPerView={3}
          breakpoints={{
            320: { slidesPerView: 1 },
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1440: { slidesPerView: 4 },
          }}
          className='max-w-full p-4 md:p-6'
        >
          {shopSpots.map((spot, index) => (
            <SwiperSlide key={index} className='flex justify-center'>
              <div className="bg-white rounded-lg shadow-lg hover:shadow-slate-500 hover:scale-105 duration-300 flex flex-col justify-between mx-auto h-full p-2 relative"
                style={{ width: '100%', maxWidth: '300px', height: '400px' }}>
                <div className="w-full h-56 md:h-64 bg-gray-200 rounded-t-lg overflow-hidden">
                  {spot.image ? (
                    <img
                      src={spot.image ? `${BASE_URL}/${spot.image}` : `${BASE_URL}/${spot.businessLogo}`}
                      alt={spot.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span>No Image</span>
                    </div>
                  )}
                </div>
                <div className="flex-grow flex flex-col justify-between mt-4">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-1">
                        {spot.rating ? (
                          <>
                            <span className="text-[12px]">{parseFloat(spot.rating).toFixed(1)}</span>
                            <span className="text-yellow-500">
                              {'★'.repeat(Math.floor(spot.rating))}
                              {'☆'.repeat(5 - Math.floor(spot.rating))}
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-500 text-[12px]">No ratings</span>
                        )}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 truncate mb-2">{spot.name}</h3>
                    <div className="text-xs text-gray-500 mb-4 flex items-center">
                      <GiPositionMarker className="mr-1" />
                      {spot.destination}
                    </div>
                  </div>
                  <div className="mt-auto">
                    <p className="text-md font-semibold text-black mb-4">
                      ₱{spot.lowest_price} - ₱{spot.highest_price}
                    </p>
                    <Link to={`/business/${encryptId(spot.business_id)}`}>
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
      ) : (
        <p className="h-48 bg-gray-100 flex items-center justify-center italic text-center text-gray-500 mt-4 rounded-t-lg">No shops available at the moment.</p>
      )}
    </div>
  );
};

const Bulusan = () => {
  const [businesses, setBusinesses] = useState([]);
  const [currentZoom, setCurrentZoom] = useState(14); // Initial zoom level
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/getBusinessesByLocation/Bulusan`);
        // console.log(response.data);
        setBusinesses(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching businesses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  return (
    <div className="font-sans mt-5  mx-auto w-full  ">
       <div className='p-[4rem]'>
      <h1 className="text-4xl font-bold  text-center">Bulusan, Sorsogon</h1>
      </div>
      
      {/* Image Collage */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
        <img src={bulusanpic2}  className="col-span-2 md:col-span-2 row-span-2 rounded-lg w-full h-full  " />
        <img src={bulusanpic1} className="rounded-lg w-full h-32 md:h-52 " />
        <img src={bulusanpic3}  className="rounded-lg object-cover w-full h-32 md:h-52" />
        <img src={bulusanpic4}  className="rounded-lg object-cover w-full h-32 md:h-48" />
        <img src={bulusanpic5}  className="rounded-lg object-cover w-full h-32 md:h-48" />
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <section className='bg-white rounded-lg p-6 shadow-md'>
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <Info className="mr-2" /> History
          </h2>
          <p className="text-gray-700">
          Bulusan has a long history tied to its natural surroundings, dating back to pre-colonial times. The town is named after the local term “Bulusan,” meaning “spring,” due to its abundant water resources. It has maintained its cultural heritage while embracing eco-tourism as a cornerstone of its identity.
          </p>
        </section>

        <section className='bg-white rounded-lg p-6 shadow-md'>
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <MapPin className="mr-2" /> Geography
          </h2>
          <p className="text-gray-700">
          Nestled at the base of the Bulusan Volcano, the town has a unique landscape of forests, rivers, and lakes. Its proximity to the volcano gives it a cooler climate, attracting tourists to its mountainous terrain and natural parks. The Bulusan Volcano Natural Park is a protected area that showcases diverse flora and fauna.
          </p>
        </section>

        <section className='bg-white rounded-lg p-6 shadow-md'>
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <Star className="mr-2" /> Known For
          </h2>
          <p className="text-gray-700">
          Bulusan is famous for the Bulusan Volcano and Lake, drawing eco-tourists for hiking, kayaking, and bird-watching. The annual “Kasanggayahan Festival” celebrates the town’s natural wonders, emphasizing conservation and respect for nature. The volcano’s scenic beauty makes it a popular destination for adventure seekers.
          </p>
        </section>
      </div>

      {/* Map Placeholder */}
      <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Locations</h2>
        <div className='flex justify-center'>
          {/* Map Section */}
          <div className="mt-8 z-10  bg-color1 rounded-lg shadow-md p-1 w-full bg-gradient-to-r from-color1 to-color2">
            <MapSection businesses={businesses} initialCenter={[12.751501083691833,124.13498929288217]} currentZoom={currentZoom} setCurrentZoom={setCurrentZoom} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="font-sans mx-auto w-full">
        {Array.from({ length: 1 }).map((_, index) => {
          const opacity = 1 - index * 0.25; // Adjust the values as needed (1, 0.75, 0.5, 0.25)
          return (
            <div className="p-2 md:p-6">
              <div key={index} className='flex justify-center' style={{ opacity }}>
                <div className="bg-white rounded-lg shadow-lg duration-300 flex flex-col justify-between max-w-xs md:max-w-lg lg:max-w-sm mx-auto h-[400px] p-2 relative"
                    style={{ width: '300px', height: '400px' }}>
                  <Skeleton className="w-full h-56 md:h-64 bg-gray-200 rounded-t-lg overflow-hidden" />
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
              </div>
            </div>
          );
        })}
        </div>
      ) : (
        <>
          {/* Swiper Sections */}
          {Array.isArray(businesses) && businesses.length > 0 ? (
            <>
              {renderSwiperActivitySection('Top-Rated Activity Destinations: Your Guide to the Best Experiences', '/activities', businesses)}
              {renderSwiperAccommodationSection('Nearby Accommodation Options', '/accomodations', businesses)}
              {renderSwiperEaterySection('Eateries Worth Exploring Nearby', '/foodplaces', businesses)}
              {renderSwiperShopSection('Explore Local Shops', '/shops', businesses)}
            </>
          ) : (
            <p className="h-48 bg-gray-100 flex items-center justify-center italic text-center text-gray-500 mt-4 rounded-t-lg">No businesses available at the moment.</p>
          )}
        </>
      )}
    </div>
  )
}

export default Bulusan;
