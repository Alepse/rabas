import React from 'react'
import { MapPin, Star, Info } from 'lucide-react'
import castillapic1 from '@/assets/castillapic4.jpg'
import castillapic2  from '@/assets/castillapic2.jpg'
import castillapic3 from '@/assets/castillapic3.jpg'
import castillapic4 from '@/assets/castillapic1.jpg'
import castillapic5 from '@/assets/castillapic5.jpg'
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { Link } from 'react-router-dom';
import { Button } from '@nextui-org/react';
import { GiPositionMarker } from 'react-icons/gi';
import img from '@/assets/shop.webp'; // Sample image

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

const Castilla = () => {
  return (
    <div className="font-sans mt-5 p-5 mx-auto w-full max-w-7xl">
      <h1 className="text-4xl font-bold mb-6 text-center">Castilla, Sorsogon</h1>
      
      {/* Image Collage */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
        <img src={castillapic1 } className="col-span-2 md:col-span-2 row-span-2 rounded-lg w-full h-full  " />
        <img src={castillapic2 } className="rounded-lg w-full h-60 " />
        <img src={castillapic3 }  className="rounded-lg object-cover w-full h-60" />
        <img src={castillapic4 }  className="rounded-lg object-cover w-full h-60" />
        <img src={castillapic5 }  className="rounded-lg object-cover w-full h-60" />
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <section className='bg-white rounded-lg p-6 shadow-md'>
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <Info className="mr-2" /> History
          </h2>
          <p className="text-gray-700">
          Castilla, originally part of Sorsogon City, was founded as a separate municipality in the early 20th century. The town has historically been an agricultural center, with farming playing a central role in its development.
          </p>
        </section>

        <section className='bg-white rounded-lg p-6 shadow-md'>
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <MapPin className="mr-2" /> Geography
          </h2>
          <p className="text-gray-700">
          Castilla’s landscape is mostly flat, surrounded by vast rice fields and agricultural lands. The coastal location supports a strong fishing industry, with warm tropical weather that favors year-round farming activities.
          </p>
        </section>

        <section className='bg-white rounded-lg p-6 shadow-md'>
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <Star className="mr-2" /> Known For
          </h2>
          <p className="text-gray-700">
          Castilla is known as the “Rice Granary of Sorsogon” due to its extensive rice fields. The town celebrates the “Ani Festival,” a vibrant event that honors Castilla’s agricultural roots. Its countryside views and rural charm make it a peaceful destination for those interested in traditional farming life.
          </p>
        </section>
      </div>

      {/* Map Placeholder */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Location</h2>
        <div className="bg-gray-200 h-96 rounded-lg flex items-center justify-center p-4">
          <p className="text-gray-500">Map of Castilla, Sorsogon (Placeholder)</p>
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
              <div className='bg-white rounded-sm shadow-md hover:shadow-xl transform transition-all duration-500 p-4 w-full max-w-[280px] md:max-w-[320px] h-[380px] flex flex-col'>
                <div className='relative w-full h-40 md:h-44'>
                  <img
                    src={spot.image || 'path/to/placeholder.jpg'}
                    alt={spot.name}
                    className='w-full h-full object-cover rounded-t-lg'
                  />
                  {!spot.image && (
                    <div className='absolute inset-0 flex items-center justify-center bg-gray-200'>
                      <span className='text-gray-500'>Image Not Available</span>
                    </div>
                  )}
                </div>
                <div className='p-4 flex flex-col justify-between h-full'>
                  <div>
                    <h3 className='font-semibold text-base md:text-lg text-color1 mb-1'>{spot.name}</h3>
                    <div className='text-xs text-gray-500 mb-2 flex items-center'>
                      <GiPositionMarker /> {spot.destination}
                    </div>
                    <div className='flex items-center justify-between gap-2 mb-3'>
                      <div className='flex flex-wrap gap-1'>
                        {spot.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className='text-xs px-2 py-1 rounded-full bg-gray-200 text-black'
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className='flex items-center gap-1'>
                        <span className='text-black text-sm'>{spot.rating}</span>
                        <span className='text-yellow-500'>
                          {'★'.repeat(spot.rating)}{'☆'.repeat(5 - spot.rating)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className='flex justify-between items-center'>
                    <p className='font-semibold text-sm md:text-md'>
                      ₱{spot.budget}
                    </p>
                    <Link to="/business" target='_blank'>
                      <Button className='bg-color1 text-color3 hover:bg-color2 px-4 py-2 text-xs'>
                       View
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
          <div className="custom-prev absolute left-2 top-1/2 transform -translate-y-1/2 bg-light p-2 rounded-full shadow-md z-10 cursor-pointer hover:-translate-x-2 duration-300">
            ←
          </div>
          <div className="custom-next absolute right-2 top-1/2 transform -translate-y-1/2 bg-light p-2 rounded-full shadow-md z-10 cursor-pointer hover:bg-gray-200 text-xl hover:translate-x-2 duration-300">
            →
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
              <div className='bg-white rounded-sm shadow-md hover:shadow-xl transform transition-all duration-500 p-4 w-full max-w-[280px] md:max-w-[320px] h-[380px] flex flex-col'>
                <div className='relative w-full h-40 md:h-44'>
                  <img
                    src={spot.image || 'path/to/placeholder.jpg'}
                    alt={spot.name}
                    className='w-full h-full object-cover rounded-t-lg'
                  />
                  {!spot.image && (
                    <div className='absolute inset-0 flex items-center justify-center bg-gray-200'>
                      <span className='text-gray-500'>Image Not Available</span>
                    </div>
                  )}
                </div>
                <div className='p-4 flex flex-col justify-between h-full'>
                  <div>
                    <h3 className='font-semibold text-base md:text-lg text-color1 mb-1'>{spot.name}</h3>
                    <div className='text-xs text-gray-500 mb-2 flex items-center'>
                      <GiPositionMarker /> {spot.destination}
                    </div>
                    <div className='flex items-center justify-between gap-2 mb-3'>
                      <div className='flex flex-wrap gap-1'>
                        {spot.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className='text-xs px-2 py-1 rounded-full bg-gray-200 text-black'
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className='flex items-center gap-1'>
                        <span className='text-black text-sm'>{spot.rating}</span>
                        <span className='text-yellow-500'>
                          {'★'.repeat(spot.rating)}{'☆'.repeat(5 - spot.rating)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className='flex justify-between items-center'>
                    <p className='font-semibold text-sm md:text-md'>
                      ₱{spot.budget}
                    </p>
                    <Link to="/business" target='_blank'>
                      <Button className='bg-color1 text-color3 hover:bg-color2 px-4 py-2 text-xs'>
                       View
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
          <div className="custom-prev absolute left-2 top-1/2 transform -translate-y-1/2 bg-light p-2 rounded-full shadow-md z-10 cursor-pointer hover:-translate-x-2 duration-300">
            ←
          </div>
          <div className="custom-next absolute right-2 top-1/2 transform -translate-y-1/2 bg-light p-2 rounded-full shadow-md z-10 cursor-pointer hover:bg-gray-200 text-xl hover:translate-x-2 duration-300">
            →
          </div>
        </Swiper>
      </div>
          


      <div>
      <div className='flex flex-col md:flex-row justify-between items-center mt-5'>
        <h1 className='text-xl md:text-2xl font-bold  p-2 text-center lg:text-start'>
        Eateries Worth Exploring Nearby
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
              <div className='bg-white rounded-sm shadow-md hover:shadow-xl transform transition-all duration-500 p-4 w-full max-w-[280px] md:max-w-[320px] h-[380px] flex flex-col'>
                <div className='relative w-full h-40 md:h-44'>
                  <img
                    src={spot.image || 'path/to/placeholder.jpg'}
                    alt={spot.name}
                    className='w-full h-full object-cover rounded-t-lg'
                  />
                  {!spot.image && (
                    <div className='absolute inset-0 flex items-center justify-center bg-gray-200'>
                      <span className='text-gray-500'>Image Not Available</span>
                    </div>
                  )}
                </div>
                <div className='p-4 flex flex-col justify-between h-full'>
                  <div>
                    <h3 className='font-semibold text-base md:text-lg text-color1 mb-1'>{spot.name}</h3>
                    <div className='text-xs text-gray-500 mb-2 flex items-center'>
                      <GiPositionMarker /> {spot.destination}
                    </div>
                    <div className='flex items-center justify-between gap-2 mb-3'>
                      <div className='flex flex-wrap gap-1'>
                        {spot.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className='text-xs px-2 py-1 rounded-full bg-gray-200 text-black'
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className='flex items-center gap-1'>
                        <span className='text-black text-sm'>{spot.rating}</span>
                        <span className='text-yellow-500'>
                          {'★'.repeat(spot.rating)}{'☆'.repeat(5 - spot.rating)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className='flex justify-between items-center'>
                    <p className='font-semibold text-sm md:text-md'>
                      ₱{spot.budget}
                    </p>
                    <Link to="/business" target='_blank'>
                      <Button className='bg-color1 text-color3 hover:bg-color2 px-4 py-2 text-xs'>
                       View
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
          <div className="custom-prev absolute left-2 top-1/2 transform -translate-y-1/2 bg-light p-2 rounded-full shadow-md z-10 cursor-pointer hover:-translate-x-2 duration-300">
            ←
          </div>
          <div className="custom-next absolute right-2 top-1/2 transform -translate-y-1/2 bg-light p-2 rounded-full shadow-md z-10 cursor-pointer hover:bg-gray-200 text-xl hover:translate-x-2 duration-300">
            →
          </div>
        </Swiper>
      </div>
      

      <div>
      <div className='flex flex-col md:flex-row justify-between items-center mt-5'>
        <h1 className='text-xl md:text-2xl font-bold  p-2 text-center lg:text-start'>
        Explore Local Shops
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
              <div className='bg-white rounded-sm shadow-md hover:shadow-xl transform transition-all duration-500 p-4 w-full max-w-[280px] md:max-w-[320px] h-[380px] flex flex-col'>
                <div className='relative w-full h-40 md:h-44'>
                  <img
                    src={spot.image || 'path/to/placeholder.jpg'}
                    alt={spot.name}
                    className='w-full h-full object-cover rounded-t-lg'
                  />
                  {!spot.image && (
                    <div className='absolute inset-0 flex items-center justify-center bg-gray-200'>
                      <span className='text-gray-500'>Image Not Available</span>
                    </div>
                  )}
                </div>
                <div className='p-4 flex flex-col justify-between h-full'>
                  <div>
                    <h3 className='font-semibold text-base md:text-lg text-color1 mb-1'>{spot.name}</h3>
                    <div className='text-xs text-gray-500 mb-2 flex items-center'>
                      <GiPositionMarker /> {spot.destination}
                    </div>
                    <div className='flex items-center justify-between gap-2 mb-3'>
                      <div className='flex flex-wrap gap-1'>
                        {spot.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className='text-xs px-2 py-1 rounded-full bg-gray-200 text-black'
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className='flex items-center gap-1'>
                        <span className='text-black text-sm'>{spot.rating}</span>
                        <span className='text-yellow-500'>
                          {'★'.repeat(spot.rating)}{'☆'.repeat(5 - spot.rating)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className='flex justify-between items-center'>
                    <p className='font-semibold text-sm md:text-md'>
                      ₱{spot.budget}
                    </p>
                    <Link to="/business" target='_blank'>
                      <Button className='bg-color1 text-color3 hover:bg-color2 px-4 py-2 text-xs'>
                       View
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
          <div className="custom-prev absolute left-2 top-1/2 transform -translate-y-1/2 bg-light p-2 rounded-full shadow-md z-10 cursor-pointer hover:-translate-x-2 duration-300">
            ←
          </div>
          <div className="custom-next absolute right-2 top-1/2 transform -translate-y-1/2 bg-light p-2 rounded-full shadow-md z-10 cursor-pointer hover:bg-gray-200 text-xl hover:translate-x-2 duration-300">
            →
          </div>
        </Swiper>
      </div>
    </div>
  )
}

export default Castilla;
