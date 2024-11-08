import React from 'react'
import { Card,CardBody, CardHeader, } from "@nextui-org/react"
import { MapPin, Heart, Compass, ChevronRight} from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'




const AboutSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-8">Why Choose Us</h2>
        
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-lg text-gray-700">
            At Rabasorsogon, we're passionate about showcasing the vibrant culture and natural beauty of Sorsogon. 
            Our expert local knowledge and commitment to authentic experiences set us apart.
          </p>
        </div>

        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex flex-wrap justify-center gap-16
            mb-5">
              {[
        
                { icon: MapPin, title: 'Hidden Gems', description: 'As locals who love exploring our own province, we offer authentic insights into Sorsogon\'s hidden treasures.'  },
                { icon: Heart, title: 'Sustainable Tourism', description: 'We promote responsible travel that respects our heritage and uplifts our community.' },
                { icon: Compass, title: 'Tailored Experiences', description: 'We craft unique itineraries that cater to diverse interests and travel styles.' },
              ].map((item, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow max-h-56 max-w-[14rem] justify-center flex items-center">
                  <CardHeader className="flex gap-3">
                    <item.icon className="w-8 h-8 text-primary" />
                    <p className="text-md font-semibold">{item.title}</p>
                  </CardHeader>
                  <CardBody>
                    <p className="text-gray-600">{item.description}</p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </motion.div>
        </section>

        <div className="text-center">
          <p className="text-lg text-gray-700 mb-6">
            Choose Rabasorsogon for an unforgettable journey through the heart of Sorsogon. 
            We're dedicated to unveiling the province's hidden treasures and creating memories that last a lifetime.
          </p>
          <Link to='/about' target='_blank'>
          <button className="bg-color1 hover:bg-color2 hover:translate-x-1 text-white font-bold py-2 px-4 rounded inline-flex items-center transition duration-300 ease-in-out">
            Read More
            <ChevronRight className="w-5 h-5 ml-2" />
          </button>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default AboutSection