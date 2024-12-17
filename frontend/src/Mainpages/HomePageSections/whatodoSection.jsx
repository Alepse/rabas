import React from 'react'
import { motion } from 'framer-motion'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { MapPin, Utensils, Building2, TreePine } from 'lucide-react'
import Surf from '@/assets/surfing.jpg'
import Room from '@/assets/room.webp'
import Food from '@/assets/Food.jpg'
import Shop from '@/assets/Souvenirs.jpg'

const categories = [
  {
    title: 'Activities',
    description: 'Things To Do',
    icon: TreePine, // Ensure this is imported or defined
    image: Surf, // Updated to use imported image
    gradient: 'from-[#1B4D3E]/80 to-[#1B4D3E]/80'
  },
  {
    title: 'Accommodation',
    description: 'Find perfect stays',
    icon: Building2, 
    image: Room, // Updated to use imported image
    gradient: 'from-[#1B4D3E]/80 to-[#1B4D3E]/80'
  },
  {
    title: 'Food Places',
    description: 'Discover local cuisine',
    icon: Utensils, 
    image: Food, // Updated to use imported image
    gradient: 'from-[#1B4D3E]/80 to-[#1B4D3E]/80'
  },
  {
    title: 'Shops',
    description: 'Local markets & stores',
    icon: MapPin, 
    image: Shop, // Updated to use imported image
    gradient: 'from-[#1B4D3E]/80 to-[#1B4D3E]/80'
  }
]

const links = [
  '/activities',
  '/accommodations',
  '/foodplaces',
  '/shops'
];

const whatodoSection = () => {
  return (
    <section className="py-24 mt-24 bg-white relative ">
      {/* Top Wave */}

      
      <div className="absolute top-0 left-0 right-0">
        <svg viewBox="0 0 1440 150" className="w-full h-auto fill-[#1B4D3E] opacity-65 ">
          <path d="M0,80L80,85.3C160,91,320,101,480,96C640,91,800,69,960,64C1120,59,1280,69,1360,74.7L1440,80L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z" />
        </svg>
        
      </div>


      <div className="container mx-auto px-4 pt-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mt-16 text-color1 mb-4">
          Unwind and Adventure
          </h2>
          <p className="text-gray-600 text-lg">
          Experience the Best of Sorsogon
          </p>
        </motion.div>

        <Carousel className="w-full max-w-7xl mx-auto">
          <CarouselContent className="-ml-4">
            {categories.map((category, index) => (
              <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/4">
                <a href={links[index]}>
                  <motion.div
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                    className="relative overflow-hidden rounded-2xl aspect-[3/4] group"
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                      style={{ backgroundImage: `url(${category.image})` }}
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${category.gradient}`} />
                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="text-center"
                      >
                        <div className="mb-4 flex justify-center">
                          <category.icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                          {category.title}
                        </h3>
                        <p className="text-white/90 text-sm">
                          {category.description}
                        </p>
                      </motion.div>
                    </div>
                  </motion.div>
                </a>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  )
}

export default whatodoSection