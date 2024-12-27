import React, { useEffect, useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import "swiper/css/pagination";
import 'swiper/css/navigation';
import { Pagination, Navigation } from 'swiper/modules';
import { Link } from 'react-router-dom';
import { Button } from '@nextui-org/react';
import { GiPositionMarker } from 'react-icons/gi';
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

const ActivitiesTab = ({ activitiesData, loading }) => {
    const [activities, setActivities] = useState([]);

    useEffect(() => {
      if (!loading && activitiesData) {
        setActivities(activitiesData);
      } else if (loading) {
        setActivities([]); // Clear activities while loading
      }
      // console.log(loading);
    }, [activitiesData, loading]);

  // Sort activities for "Adventure Awaits" by ratings (descending)
  const adventureAwaits = [...activities].sort((a, b) => b.rating - a.rating);

  // Sort activities for "Things To Do" by number of likes (descending)
  const thingsToDo = [...activities].sort((a, b) => b.likes - a.likes);

  return (
    <div className='lg:container'>
      <ActivitySwiper 
        title="Adventure Awaits: Top Activity Spots" 
        link="/activities" 
        activities={adventureAwaits} 
        loading={loading} 
        uniqueId="adventureAwaits"
      />
      <ActivitySwiper 
        title="Things To Do: Most Liked Activities" 
        link="/activities" 
        activities={thingsToDo} 
        loading={loading} 
        uniqueId="thingsToDo"
      />
      <ActivitySwiper 
        title="Explore New Adventures: Latest Activities" 
        isLast 
        activities={activities} 
        loading={loading} 
        uniqueId="exploreNewAdventures"
      />
    </div>
  );
};

const ActivitySwiper = ({ title, link, isLast, activities, loading, uniqueId }) => {
  const swiperRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [showArrows, setShowArrows] = useState(false);

  const handleInit = (swiper) => {
    swiperRef.current = swiper;
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
    adjustArrowVisibility(swiper);
  };

  const handleSlideChange = (swiper) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  const adjustArrowVisibility = (swiper) => {
    const currentSlides = swiper.slides.length;
    const visibleSlides = swiper.params.slidesPerView;
    setShowArrows(currentSlides > visibleSlides);
  };

  const prevClass = `custom-prev-${uniqueId}`;
  const nextClass = `custom-next-${uniqueId}`;

  return (
    <div className="p-4 md:p-6 min-h-[400px]">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <h1
          className={`text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center lg:text-start ${
            isLast ? "text-light" : ""
          }`}
        >
          {title}
        </h1>
        {link && (
          <Link to={link} target="_blank" className="mb-4 md:mb-0">
            <h1 className="text-md font-semibold text-color1 hover:tracking-wide duration-300 hover:underline cursor-pointer">
              See More ⥬
            </h1>
          </Link>
        )}
      </div>
      <div className="relative min-h-[400px]">
        <Swiper
          modules={[Pagination, Navigation]}
          navigation={{ nextEl: `.${nextClass}`, prevEl: `.${prevClass}` }}
          spaceBetween={24}
          slidesPerView={1}
          onInit={handleInit}
          onSlideChange={handleSlideChange}
          onBreakpoint={(swiper) => adjustArrowVisibility(swiper)}
          breakpoints={{
            320: { slidesPerView: 1 },
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1440: { slidesPerView: 4 },
          }}
          className="max-w-full p-4 md:p-6 min-h-[400px]"
        >
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <SwiperSlide key={index} className="flex justify-center min-h-[400px]">
                  <div
                    className="bg-white rounded-lg shadow-lg duration-300 flex flex-col justify-between mx-auto h-full p-2 relative min-h-[400px]"
                    style={{
                      width: "100%",
                      maxWidth: "300px",
                      height: "400px",
                      opacity: 1 - index * 0.25,
                    }}
                  >
                    <Skeleton className="w-full h-56 md:h-64 bg-gray-200 rounded-t-lg overflow-hidden" />
                    <div className="flex-grow flex flex-col justify-between mt-4 px-2">
                      <Skeleton className="h-3 mb-4" />
                      <Skeleton className="h-6 mb-4" />
                      <Skeleton className="h-4 mb-4" />
                      <Skeleton className="h-5 mb-3" />
                      <Skeleton className="h-10" />
                    </div>
                  </div>
                </SwiperSlide>
              ))
            : activities.map((activity, index) => (
                <SwiperSlide key={index} className="flex justify-center">
                  <div
                    className="bg-white rounded-lg shadow-lg hover:shadow-slate-500 hover:scale-105 duration-300 flex flex-col justify-between mx-auto h-full p-2 relative"
                    style={{
                      width: "100%",
                      maxWidth: "300px",
                      height: "400px",
                    }}
                  >
                    {activity.discount > 0 && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold py-1 px-2 rounded">
                        {activity.discount}% OFF
                      </div>
                    )}
                    <div className="w-full h-56 md:h-64 bg-gray-200 rounded-t-lg overflow-hidden">
                      {activity.image ? (
                        <img
                          src={`${BASE_URL}/${activity.image}`}
                          alt={activity.name}
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
                            {activity.rating ? (
                              <>
                                <span className="text-[12px]">
                                  {parseFloat(activity.rating).toFixed(1)}
                                </span>
                                <span className="text-yellow-500">
                                  {"★".repeat(activity.rating)}
                                  {"☆".repeat(5 - activity.rating)}
                                </span>
                              </>
                            ) : (
                              <span className="ml-1 text-sm">No ratings</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <h3 className="flex items-center text-lg font-semibold text-gray-800 truncate">
                            {activity.name}
                          </h3>
                          {activity.likes > 0 && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <AiOutlineLike /> {formatNumber(activity.likes)}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mb-4 flex items-center">
                          <GiPositionMarker className="mr-1" />
                          {activity.destination}
                        </div>
                      </div>
                      <div className="mt-auto">
                        <p className="text-md font-semibold text-black mb-4">
                          {activity.lowest_price === null &&
                          activity.highest_price === null ? (
                            <span className="text-gray-500">Not Available</span>
                          ) : activity.discount ? (
                            <>
                              <span className="line-through text-gray-500">
                                ₱{activity.lowest_price} - ₱
                                {activity.highest_price}
                              </span>
                              <span className="text-red-500 text-xl font-bold ml-2">
                                ₱
                                {activity.lowest_price -
                                  (activity.highest_price *
                                    activity.discount) /
                                    100}
                              </span>
                            </>
                          ) : (
                            <>
                              ₱{activity.lowest_price} - ₱
                              {activity.highest_price}
                            </>
                          )}
                        </p>
                        <Link to={`/business/${encryptId(activity.business_id)}`}>
                          <Button className="w-full bg-color1 text-white text-sm font-medium px-5 py-2 rounded hover:bg-color2">
                            Explore More
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
        </Swiper>
        {showArrows && !isBeginning && (
          <div
            className={`custom-prev absolute left-2 top-[50%] transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md z-10 cursor-pointer hover:bg-gray-300 text-xl duration-300`}
            onClick={() => swiperRef.current?.slidePrev()}
          >
            <FaArrowLeft />
          </div>
        )}
        {showArrows && !isEnd && (
          <div
            className={`custom-next absolute right-2 top-[50%] transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md z-10 cursor-pointer hover:bg-gray-300 text-xl duration-300`}
            onClick={() => swiperRef.current?.slideNext()}
          >
            <FaArrowRight />
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivitiesTab;