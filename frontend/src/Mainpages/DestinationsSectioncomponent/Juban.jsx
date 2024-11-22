import React from 'react'
import { MapPin, Star, Info } from 'lucide-react'
import jubanpic1 from '@/assets/jubanpic1.jpg'
import jubanpic2 from '@/assets/jubanpic2.jpg'
import jubanpic3 from '@/assets/jubanpic3.jpg'
import jubanpic4 from '@/assets/juban.jpg'
import jubanpic5  from '@/assets/jubanpic4.jpg'
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { Link } from 'react-router-dom';
import { Button } from '@nextui-org/react';
import { GiPositionMarker } from 'react-icons/gi';
import img from '@/assets/shop.webp'; // Sample image
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'

const recommendedSpots = [
  {
    image: img,
    tags: ['Surfing', 'Beach'],
    rating: 5,
    name: 'Rizal Beach Surfing',
    destination: 'Gubat, Sorsogon',
    budget: '1500-200',
  },
  {
    image: img,
    tags: ['Nature', 'Relaxation'],
    rating: 4,
    name: 'Mangrove Forest Tour',
    destination: 'Gubat, Sorsogon',
    budget: '800-1200',
  },
  {
    image: img,
    tags: ['Cultural', 'Historical'],
    rating: 4,
    name: 'Gubat Heritage Walk',
    destination: 'Gubat, Sorsogon',
    budget: '500-2000',
  },
  {
    image: img,
    tags: ['Cultural', 'Historical'],
    rating: 4,
    name: 'Gubat Heritage Walk',
    destination: 'Gubat, Sorsogon',
    budget: '500-2000',
  },
  {
    image: img,
    tags: ['Cultural', 'Historical'],
    rating: 4,
    name: 'Gubat Heritage Walk',
    destination: 'Gubat, Sorsogon',
    budget: '500-2000',
  },
];

const Juban = () => {
  return (
    <div className="font-sans mt-5 p-5 mx-auto w-full max-w-7xl">
      <h1 className="text-4xl font-bold mb-6 text-center">Juban, Sorsogon</h1>
      
      {/* Image Collage */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
        <img src={jubanpic1 } className="col-span-2 md:col-span-2 row-span-2 rounded-lg w-full h-[31rem]  " />
        <img src={jubanpic2 }  className="rounded-lg w-full h-60 " />
        <img src={jubanpic3 } className="rounded-lg object-cover w-full h-60" />
        <img src={jubanpic4}  className="rounded-lg object-cover w-full h-60" />
        <img src={jubanpic5 }  className="rounded-lg object-cover w-full h-60" />
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <section className='bg-white rounded-lg p-6 shadow-md'>
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <Info className="mr-2" /> History
          </h2>
          <p className="text-gray-700">
          Juban is one of Sorsogon’s historic towns, known for its Spanish colonial houses and ancestral homes that have been preserved for generations. The town reflects the traditional architecture of the Bicol region, with houses made from nipa and bamboo.
          </p>
        </section>

        <section className='bg-white rounded-lg p-6 shadow-md'>
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <MapPin className="mr-2" /> Geography
          </h2>
          <p className="text-gray-700">
          Located in a valley, Juban’s geography includes flatlands and rolling hills. Its mild climate and fertile land make it ideal for farming, and its location provides easy access to surrounding areas.
          </p>
        </section>

        <section className='bg-white rounded-lg p-6 shadow-md'>
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <Star className="mr-2" /> Known For
          </h2>
          <p className="text-gray-700">
          Juban is known for its ancestral houses, which stand as testaments to the town’s rich history. The annual “Kinsa Festival” celebrates the preservation of Juban’s heritage, offering a glimpse into the town’s past through performances and parades.


          </p>
        </section>
      </div>

      {/* Map Placeholder */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Location</h2>
        <div className="bg-gray-200 h-96 rounded-lg flex items-center justify-center p-4">
          <p className="text-gray-500">Map of Juban, Sorsogon (Placeholder)</p>
        </div>
      </div>

      <div>
      <div className='flex flex-col md:flex-row justify-between items-center mt-5'>
        <h1 className='text-xl md:text-2xl font-bold  p-2 text-center lg:text-start'>
        Top-Rated Activity Destinations: Your Guide to the Best Experiences
        </h1>
        <Link to='/activities' target='_blank' className='mb-4 md:mb-0'>
          <h1 className='text-md font-semibold text-color1 hover:tracking-wide duration-300 hover:underline cursor-pointer'>
            See More ⥬
          </h1>
        </Link>
      </div>
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
          {recommendedSpots.map((spot, index) => (
            <SwiperSlide key={index} className='flex justify-center'>
              <div className="bg-white rounded-lg shadow-lg hover:shadow-slate-500 hover:scale-105 duration-300 flex flex-col justify-between max-w-xs md:max-w-lg lg:max-w-sm mx-auto h-[400px] p-2 relative"
                   style={{ width: '300px', height: '400px' }}>
                <img
                  src={spot.image || 'path/to/placeholder.jpg'}
                  alt={spot.name}
                  className="w-full h-56 md:h-64 object-cover rounded-t-lg"
                />
                <div className="flex-grow flex flex-col justify-between mt-4">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-1">
                        <span className="text-[12px]">{spot.rating}</span>
                        <span className="text-yellow-500">
                          {'★'.repeat(spot.rating)}
                          {'☆'.repeat(5 - spot.rating)}
                        </span>
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
                      ₱{spot.budget}
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
     


      <div>
      <div className='flex flex-col md:flex-row justify-between items-center mt-5'>
        <h1 className='text-xl md:text-2xl font-bold  p-2 text-center lg:text-start'>
        Nearby Accommodation Options
        </h1>
        <Link to='/accomodations' target='_blank' className='mb-4 md:mb-0'>
          <h1 className='text-md font-semibold text-color1 hover:tracking-wide duration-300 hover:underline cursor-pointer'>
            See More ⥬
          </h1>
        </Link>
      </div>
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
          {recommendedSpots.map((spot, index) => (
            <SwiperSlide key={index} className='flex justify-center'>
              <div className="bg-white rounded-lg shadow-lg hover:shadow-slate-500 hover:scale-105 duration-300 flex flex-col justify-between max-w-xs md:max-w-lg lg:max-w-sm mx-auto h-[400px] p-2 relative"
                   style={{ width: '300px', height: '400px' }}>
                <img
                  src={spot.image || 'path/to/placeholder.jpg'}
                  alt={spot.name}
                  className="w-full h-56 md:h-64 object-cover rounded-t-lg"
                />
                <div className="flex-grow flex flex-col justify-between mt-4">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-1">
                        <span className="text-[12px]">{spot.rating}</span>
                        <span className="text-yellow-500">
                          {'★'.repeat(spot.rating)}
                          {'☆'.repeat(5 - spot.rating)}
                        </span>
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
                      ₱{spot.budget}
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
          


      <div>
      <div className='flex flex-col md:flex-row justify-between items-center mt-5'>
        <h1 className='text-xl md:text-2xl font-bold  p-2 text-center lg:text-start'>
        Eateries Worth Exploring Nearby
        </h1>
        <Link to='/foodplaces' target='_blank' className='mb-4 md:mb-0'>
          <h1 className='text-md font-semibold text-color1 hover:tracking-wide duration-300 hover:underline cursor-pointer'>
            See More ⥬
          </h1>
        </Link>
      </div>
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
          {recommendedSpots.map((spot, index) => (
            <SwiperSlide key={index} className='flex justify-center'>
              <div className="bg-white rounded-lg shadow-lg hover:shadow-slate-500 hover:scale-105 duration-300 flex flex-col justify-between max-w-xs md:max-w-lg lg:max-w-sm mx-auto h-[400px] p-2 relative"
                   style={{ width: '300px', height: '400px' }}>
                <img
                  src={spot.image || 'path/to/placeholder.jpg'}
                  alt={spot.name}
                  className="w-full h-56 md:h-64 object-cover rounded-t-lg"
                />
                <div className="flex-grow flex flex-col justify-between mt-4">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-1">
                        <span className="text-[12px]">{spot.rating}</span>
                        <span className="text-yellow-500">
                          {'★'.repeat(spot.rating)}
                          {'☆'.repeat(5 - spot.rating)}
                        </span>
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
                      ₱{spot.budget}
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
      

      <div>
      <div className='flex flex-col md:flex-row justify-between items-center mt-5'>
        <h1 className='text-xl md:text-2xl font-bold  p-2 text-center lg:text-start'>
        Explore Local Shops
        </h1>
        <Link to='/shops' target='_blank' className='mb-4 md:mb-0'>
          <h1 className='text-md font-semibold text-color1 hover:tracking-wide duration-300 hover:underline cursor-pointer'>
            See More ⥬
          </h1>
        </Link>
      </div>
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
          {recommendedSpots.map((spot, index) => (
            <SwiperSlide key={index} className='flex justify-center'>
              <div className="bg-white rounded-lg shadow-lg hover:shadow-slate-500 hover:scale-105 duration-300 flex flex-col justify-between max-w-xs md:max-w-lg lg:max-w-sm mx-auto h-[400px] p-2 relative"
                   style={{ width: '300px', height: '400px' }}>
                <img
                  src={spot.image || 'path/to/placeholder.jpg'}
                  alt={spot.name}
                  className="w-full h-56 md:h-64 object-cover rounded-t-lg"
                />
                <div className="flex-grow flex flex-col justify-between mt-4">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-1">
                        <span className="text-[12px]">{spot.rating}</span>
                        <span className="text-yellow-500">
                          {'★'.repeat(spot.rating)}
                          {'☆'.repeat(5 - spot.rating)}
                        </span>
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
                      ₱{spot.budget}
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
    </div>
  )
}

export default Juban;
