import { useEffect, useState } from 'react';
import Nav from '@/components/nav';
import Search from '../components/Search';
import {  Card,  CardBody, CardHeader, Spinner,  } from '@nextui-org/react';
import { motion } from 'framer-motion';
import Hero from '@/components/heroabout';
import Footer from '@/components/Footer';
import Logo from '@/assets/rabas.png';
// Import icons from react-icons
import { Users, MapPin, Heart, Compass, Coffee } from 'lucide-react'



const About = () => {
  const [loading, setLoading] = useState(true);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    document.title = 'RabaSorsogon | About';
  });

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);

    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return <Spinner className='flex justify-center items-center h-screen' size='lg' label="Loading..." color="primary" />;
  }

  return (
    <div className="min-h-screen bg-light mx-auto font-sans">
      <Nav />
      <Hero />
      <Search />

      <main className="container mx-auto px-4 py-12 space-y-20">
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardBody className="p-6 sm:p-10">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h2 className="text-3xl font-bold text-primary">About Us</h2>
                    <p className="text-lg text-gray-600 leading-relaxed">
                    Welcome to Rabasorsogon, your trusted guide to experiencing the vibrant and unique culture of Sorsogon, a province brimming with natural beauty, rich heritage, and warm hospitality. Our mission is to connect you with the heart of Sorsogon, unveiling its hidden gems, local flavors, and authentic experiences that make this place truly special
                    </p>
                    <p className="text-lg text-gray-600 leading-relaxed">
                    <h2 className="text-3xl font-bold text-primary">Our Story</h2>
                    Founded with a passion for Sorsogon and its thriving tourism potential, Rabasorsogon was established to celebrate and promote the wonders of our beloved province. We believe that tourism is more than sightseeing—it’s about immersing yourself in the stories, people, and places that create lifelong memories.
                    </p>
                  </div>
                  <div className="relative flex justify-center items-center hover:scale-80 duration-500  rounded-lg overflow-hidden">
                    <img
                      src={Logo}
                      alt="RabaSorsogon Logo"
                      className="object-cover  max-h-[400px] max-w-[400px] "
                    />
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </section>

        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-center text-primary mb-10">Why Choose RabaSorsogon?</h2>
            <div className="flex flex-wrap justify-center gap-8">
              {[
                { icon: Users, title: 'Local Expertise', description: 'Our team of college students brings a fresh, youthful perspective to what makes Sorsogon truly special.' },
                { icon: MapPin, title: 'Hidden Gems', description: 'As locals who love exploring our own province, we offer authentic insights into Sorsogon\'s hidden treasures.' },
                { icon: Heart, title: 'Sustainable Tourism', description: 'We promote responsible travel that respects our heritage and uplifts our community.' },
          
                { icon: Compass, title: 'Tailored Experiences', description: 'We craft unique itineraries that cater to diverse interests and travel styles.' },
                { icon: Coffee, title: 'Local Connections', description: 'Our partnerships with local businesses ensure you get the most authentic Sorsogon experience.' },
              ].map((item, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow max-h-56 max-w-48 justify-center flex items-center">
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

        
        </main>

      <Footer />

      {showButton && (
        <motion.button
           className="fixed bottom-5 right-2 p-3 rounded-full shadow-lg z-10"
          onClick={scrollToTop}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatType: "loop" }}
          style={{
            background: 'linear-gradient(135deg, #688484  0%, #092635 100%)', // Gradient color
            color: 'white',
          }}
        >
          ↑
        </motion.button>
      )}

    </div>
  );
};

export default About;