import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Swal from 'sweetalert2';
import wave from '@/assets/wave3.svg';

// Import images
import Kayak from '@/assets/kayak.jpg';
import View from '@/assets/view.jpg';
import Surf from '@/assets/surf.jpg';
import Dive from '@/assets/dive.jpg';
import { Modal, ModalContent, ModalBody, useDisclosure } from "@nextui-org/react";
import LoginSignup from '@/auth/LoginSignup';

const BASE_URL = import.meta.env.VITE_BASE_URL; // Ensure you have the base URL

const PlanTripSection = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const images = [
    { src: View, alt: "Scenic view", className: "col-span-4 row-span-2 rounded-lg" },
    { src: Kayak, alt: "Kayaking" },
    { src: Surf, alt: "Surfing" },
    { src: Dive, alt: "Beach", className: "col-span-2 rounded-lg" },
  ];

  const checkLoginStatus = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/check-login`, {
        method: 'GET',
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        if (!data.isLoggedIn) {
          // Show alert if not logged in
          // await Swal.fire({
          //   icon: 'warning',
          //   title: 'Not Logged In',
          //   text: 'You need to log in to access this page.',
          //   confirmButtonText: 'OK',
          //   confirmButtonColor: '#0BDA51'
          // });
          return onOpen(); // Not logged in
        }
        return true; // Logged in
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    }
    return onOpen(); // Default to not logged in on error
  }, []);

  const handlePlanAdventureClick = async () => {
    const isLoggedIn = await checkLoginStatus();
    if (isLoggedIn) {
      window.location.href = '/trip'; // Redirect to the trip page if logged in
    }
  };

  return (
    <section className="bg-white" style={{ backgroundImage: `url(${wave})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}>
      <div className="mx-auto p-9 container">
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
            <p className="text-lg md:text-xl text-gray-600 ">
              Create your itinerary with Map Navigation and explore amazing destinations. 
              Let us help you make unforgettable memories.
            </p>
            
            <Button 
              size="lg" 
              className="mt-7 font-semibold bg-color1 text-white hover:bg-color2 transition-colors duration-300" 
              onClick={handlePlanAdventureClick} // Use the onClick handler
            >
              <CalendarIcon className="mr-2 h-5 w-5" />
              Plan Your Adventure
            </Button>
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
      <Modal
       disableAnimation
        backdrop="opaque"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isDismissable={false}
        className='max-h-full  w-full max-w-[600px] overflow-auto scrollbar-custom'
      >
        <ModalContent>
          {() => (
            <>
              <ModalBody>
                <LoginSignup />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

    </section>
  );
};

export default PlanTripSection;