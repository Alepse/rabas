import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { Link } from 'react-router-dom';
import { Button } from '@nextui-org/react';
import { GiPositionMarker } from 'react-icons/gi';
import { AiOutlineLike } from 'react-icons/ai';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const formatNumber = (num) => {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'm';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num;
};

const ShopsTab = () => {
  const [shops, setShops] = useState([]);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await fetch('http://localhost:5000/getBusinessesByBusinessType/shop');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched data:', data);
        setShops(data);
      } catch (error) {
        console.error('Error fetching shops:', error);
      }
    };

    fetchShops();
  }, []);

  // Sort shops for "Must-Visit" by ratings (descending)
  const mustVisit = [...shops].sort((a, b) => b.rating - a.rating);

  // Sort shops for "Shopper's Picks" by number of likes (descending)
  const shoppersPicks = [...shops].sort((a, b) => b.likes - a.likes);

  return (
    <div className='lg:container'>
      <ShopSwiper title="Must-Visit: Recommended Stores" link="/shops" shops={mustVisit} />
      <ShopSwiper title="Shopper's Picks: Liked Shops" link="/shops" shops={shoppersPicks} />
      <ShopSwiper title="Retail Therapy: Top Shopping Offers" isLast shops={shops} />
    </div>
  );
};

const ShopSwiper = ({ title, link, isLast, shops }) => (
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
      {shops.map((shop, index) => (
        <SwiperSlide key={index} className='flex justify-center'>
          <div className="bg-white rounded-lg shadow-lg hover:shadow-slate-500 hover:scale-105 duration-300 flex flex-col justify-between max-w-xs md:max-w-lg lg:max-w-sm mx-auto h-[400px] p-2 relative"
               style={{ width: '300px', height: '400px' }}>
            {shop.discount > 0 && (
              <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold py-1 px-2 rounded">
                {shop.discount}% OFF
              </div>
            )}
            {shop.image ? (
              <img
                src={`http://localhost:5000/${shop.image}`}
                alt={shop.name}
                className="w-full h-56 md:h-64 object-cover rounded-t-lg"
              />
            ) : (
              <div className="w-full h-56 md:h-64 flex items-center justify-center bg-gray-200 rounded-t-lg">
                <span>No Image</span>
              </div>
            )}
            <div className="flex-grow flex flex-col justify-between mt-4">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-1">
                    {shop.rating ? (
                      <>
                        <span className="text-[12px]">{parseFloat(shop.rating).toFixed(1)}</span>
                        <span className="text-yellow-500">
                          {'★'.repeat(shop.rating)}
                          {'☆'.repeat(5 - shop.rating)}
                        </span>
                      </>
                    ) : (
                      <span className="ml-1 text-sm">No ratings</span>
                    )}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 truncate mb-2">{shop.name}</h3>
                <div className="text-xs text-gray-500 mb-4 flex items-center">
                  <GiPositionMarker className="mr-1" />
                  {shop.destination}
                </div>
              </div>
              <div className="mt-auto">
                <p className="text-md font-semibold text-black mb-4">
                  {shop.lowest_price === null && shop.highest_price === null ? (
                    <span className="text-gray-500">Not Available</span>
                  ) : shop.discount ? (
                    <>
                      <span className="line-through text-gray-500">
                        ₱{shop.lowest_price} - ₱{shop.highest_price}
                      </span>
                      <span className="text-red-500 text-xl font-bold ml-2">
                        ₱{shop.lowest_price - (shop.highest_price * shop.discount) / 100}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>₱{shop.lowest_price} - ₱{shop.highest_price}</span>
                    </>
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

export default ShopsTab;