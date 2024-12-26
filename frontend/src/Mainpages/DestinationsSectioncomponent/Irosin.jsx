import React, { useState, useEffect } from 'react'
import { MapPin, Star, Info } from 'lucide-react'
import irosinpic1 from '@/assets/irosinpic3.jpg'
import irosinpic2 from '@/assets/irosinpic2.jpg'
import irosinpic3  from '@/assets/irosin.jpg'
import irosinpic4  from '@/assets/irosinpic4.jpg'
import irosinpic5   from '@/assets/irosinpic5.jpg'
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { Link } from 'react-router-dom';
import { Button } from '@nextui-org/react';
import { GiPositionMarker } from 'react-icons/gi';
import img from '@/assets/shop.webp'; // Sample image
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import CryptoJS from 'crypto-js';
import { Skeleton } from "@nextui-org/skeleton";
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
const Irosin = () => {
  const [businesses, setBusinesses] = useState([]);
  const [currentZoom, setCurrentZoom] = useState(10); // Initial zoom level
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/getBusinessesByLocation/Irosin`);
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
      <h1 className="text-4xl font-bold mb-6 text-center">Irosin, Sorsogon</h1>
      
      {/* Image Collage */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
        <img src={irosinpic1 }  className="col-span-2 md:col-span-2 row-span-2 rounded-lg w-full h-full  " />
        <img src={irosinpic2 }  className="rounded-lg w-full h-32 md:h-60 " />
        <img src={irosinpic3 }  className="rounded-lg object-cover w-full h-32 md:h-60" />
        <img src={irosinpic4 }  className="rounded-lg object-cover w-full h-32 md:h-60" />
        <img src={irosinpic5 }  className="rounded-lg object-cover w-full h-32 md:h-60" />
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <section className='bg-white rounded-lg p-6 shadow-md'>
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <Info className="mr-2" /> History
          </h2>
          <p className="text-gray-700">
          Irosin’s history is connected to its abundant natural springs, which provided water to early settlements. The town was originally a small community and has since become known for its hot springs, which have become a popular attraction.
          </p>
        </section>

        <section className='bg-white rounded-lg p-6 shadow-md'>
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <MapPin className="mr-2" /> Geography
          </h2>
          <p className="text-gray-700">
          Nestled in a valley surrounded by mountains, Irosin has a unique topography that includes hot springs and rivers. Its tropical climate is tempered by the mountains, creating a cooler environment. Irosin’s fertile soil supports diverse crops, making agriculture a primary livelihood.
          </p>
        </section>

        <section className='bg-white rounded-lg p-6 shadow-md'>
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <Star className="mr-2" /> Known For
          </h2>
          <p className="text-gray-700">
          Irosin is celebrated for its natural hot springs, a popular destination for relaxation and wellness. The town also hosts the “Salog Festival,” which highlights the importance of water in the lives of its people and the beauty of its natural landscape.


          </p>
        </section>
      </div>

      {/* Map Placeholder */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Location</h2>
        <div className='flex justify-center'>
          {/* Map Section */}
          <div className="mt-8 z-10  bg-color1 rounded-lg shadow-md p-4 w-full bg-gradient-to-r from-color1 to-color2">
            <h2 className="text-lg font-semibold text-light mb-4">Locations</h2>
            <MapContainer center={[12.9738, 123.9807]} zoom={10} className="w-full h-96">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <MapEvents setCurrentZoom={setCurrentZoom} />
              {businesses.map((business, index) => {
                const { pin_location } = business;
                if (pin_location && currentZoom >= 7) { // Adjust zoom level as needed
                  const position = [pin_location.latitude, pin_location.longitude];
                  const locationName = business.name;
                  const showLogo = currentZoom >= 12; // Set zoom level to show/hide logo
                  const fontSize = currentZoom >= 12 ? '1rem' : '0.85rem';
                  const customDivIcon = L.divIcon({
                    className: 'custom-icon',
                    html: `
                      <div class="custom-popup flex items-center whitespace-nowrap font-bold text-color1" style="font-size: ${fontSize};">
                        ${showLogo ? `<div class="pin-container">
                          <div class="pin-head">
                            <img src="${BASE_URL}/${business.image}" alt="${business.name}" class="pin-logo" />
                          </div>
                          <div class="pin-point"></div>
                        </div><span>${locationName}</span>` : `<div class="business-name">${locationName}</div>`}
                      </div>
                    `,
                    iconSize: [50, 70], 
                    iconAnchor: [25, 70] 
                  });      
                  return (
                    <Marker key={index} position={position} icon={customDivIcon} />
                  );
                }
                return null;
              })}
            </MapContainer>
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
  );
};

// Component to handle map events
const MapEvents = ({ setCurrentZoom }) => {
  useMapEvents({
    zoomend: (e) => {
      setCurrentZoom(e.target.getZoom());
    },
  });
  return null;
};

export default Irosin;
