import React from 'react'
import { motion } from 'framer-motion'
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from 'react-router-dom'


// Import images
import Kayak from '@/assets/kayak.jpg'
import View from '@/assets/view.jpg'
import Surf from '@/assets/surf.jpg'
import Dive from '@/assets/dive.jpg'

export default function PlanTripSection() {
  const images = [
    { src: View, alt: "Scenic view", className: "col-span-4 row-span-2 rounded-lg" },
    { src: Kayak, alt: "Kayaking", },
    { src: Surf, alt: "Surfing", },
    { src: Dive, alt: "Beach", className: "col-span-2 rounded-lg" },
  ]

  return (
    <section className="py-24 bg-gradient-to-tr from-white to-light">
      <div className="container mx-auto p-9">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-color1 mb-9">
              Want To Plan <span className="text-color2">A Trip?</span>
            </h2>
            <p className="text-lg md:text-xl  text-gray-600 ">
              Create your itinerary with Map Navigation and explore amazing destinations. 
              Let us help you make unforgettable memories.
            </p>
            
            <Link to="/trip" target='_blank'>
              <Button size="lg" className="mt-7 font-semibold bg-color1 text-white hover:bg-color2 transition-colors duration-300"> 
                <CalendarIcon className="mr-2 h-5 w-5" />
                Plan Your Adventure
              </Button>
            </Link>
          </motion.div>
          <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <motion.div
                key={index}
                className={`${image.className} transition-transform hover:shadow-xl hover:shadow-color2 duration-500 `}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover shadow-lg"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}