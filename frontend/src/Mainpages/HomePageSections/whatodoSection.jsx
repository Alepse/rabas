import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

import { MapPin, Utensils, Building2, TreePine, ChevronLeft, ChevronRight } from 'lucide-react';
import Surf from '@/assets/surfing.webp';
import Room from '@/assets/room.webp';
import Food from '@/assets/puds.webp';
import Shop from '@/assets/Souvenirs.webp';
import { Skeleton } from '@nextui-org/react';
import Search from '@/components/Search';

const categories = [
  {
    title: 'Activities',
    description: 'Things To Do',
    icon: TreePine,
    image: Surf,
    gradient: 'from-[#1B4D3E]/80 to-[#1B4D3E]/80',
  },
  {
    title: 'Accommodation',
    description: 'Find perfect stays',
    icon: Building2,
    image: Room,
    gradient: 'from-[#1B4D3E]/80 to-[#1B4D3E]/80',
  },
  {
    title: 'Food Places',
    description: 'Discover local cuisine',
    icon: Utensils,
    image: Food,
    gradient: 'from-[#1B4D3E]/80 to-[#1B4D3E]/80',
  },
  {
    title: 'Shops',
    description: 'Local markets & stores',
    icon: MapPin,
    image: Shop,
    gradient: 'from-[#1B4D3E]/80 to-[#1B4D3E]/80',
  },
];

const links = [
  '/activities',
  '/accommodations',
  '/foodplaces',
  '/shops',
];

const WhatToDoSection = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <section className="py-16 bg-white relative">
      <div className="absolute top-0 left-0 right-0">
        <svg viewBox="0 0 1440 150" className="w-full h-auto fill-[#1B4D3E] opacity-60">
          <path d="M0,80L80,85.3C160,91,320,101,480,96C640,91,800,69,960,64C1120,59,1280,69,1360,74.7L1440,80L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z" />
        </svg>
      </div>
      <div className='md:mt-24 mb-9'>
        <Search />
      </div>
      <div className="container mx-auto px-4 pt-5">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mt-16 text-color1 mb-4">
            Unwind and Adventure
          </h2>
          <p className="text-gray-600 text-lg">Experience the Best of Sorsogon</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="relative overflow-hidden rounded-2xl aspect-[3/4]">
                <Skeleton className="h-full w-full" />
              </div>
            ))}
          </div>
        ) : (
          <Swiper
            modules={[Navigation]}
            slidesPerView={1}
            spaceBetween={16}
            navigation={{
              prevEl: '.prev-btn',
              nextEl: '.next-btn',
            }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 4 },
            }}
            className="w-full max-w-7xl mx-auto"
          >
            {categories.map((category, index) => (
              <SwiperSlide key={index}>
                <a href={links[index]}>
                  <div className="relative overflow-hidden rounded-2xl aspect-[3/4] group">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                      style={{ backgroundImage: `url(${category.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                      loading="lazy" // Lazy load the image
                      rel="preload"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${category.gradient}`} />
                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                      <div className="text-center">
                        <div className="mb-4 flex justify-center">
                          <category.icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">{category.title}</h3>
                        <p className="text-white/90 text-sm">{category.description}</p>
                      </div>
                    </div>
                  </div>
                </a>
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        <div className="flex justify-between mt-4 text-white text-xl">
          <button className="prev-btn absolute z-10 left-5 top-[69%]">
            <ChevronLeft className="cursor-pointer size-11" />
          </button>
          <button className="next-btn absolute z-10 right-5 top-[69%]">
            <ChevronRight className="cursor-pointer size-11" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default WhatToDoSection;
