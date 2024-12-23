import { useState, useRef } from 'react';
import Slider from 'react-slick';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
// Use the environment variable for the base URL
const BASE_URL = import.meta.env.VITE_BASE_URL;

const BusinessHero = (coverPhotos) => {
  const [imageLoadError, setImageLoadError] = useState(false);
  const images = coverPhotos?.images || [];

  const [, setCurrentSlide] = useState(0);
  const { isOpen, onOpen, onOpenChange } = useDisclosure(); // For "View All Images" modal
  const [previewImage, setPreviewImage] = useState(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const sliderRef = useRef(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false); // For single image preview modal

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    beforeChange: (_, next) => setCurrentSlide(next),
    arrows: false,
  };

  const handleImageError = () => {
    setImageLoadError(true);
  };

  const goToSlide = (index) => {
    sliderRef.current.slickGoTo(index);
  };

  const goToNextSlide = () => {
    sliderRef.current.slickNext();
  };

  const goToPrevSlide = () => {
    sliderRef.current.slickPrev();
  };

  const handleThumbnailClick = (index) => {
    setPreviewImage(`${BASE_URL}/${images[index].path}`);
    setPreviewIndex(index);
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setPreviewImage(null);
    setIsPreviewOpen(false);
  };

  const goToNextImage = () => {
    const nextIndex = (previewIndex + 1) % images.length;
    setPreviewImage(`${BASE_URL}/${images[nextIndex].path}`);
    setPreviewIndex(nextIndex);
  };

  const goToPrevImage = () => {
    const prevIndex = (previewIndex - 1 + images.length) % images.length;
    setPreviewImage(`${BASE_URL}/${images[prevIndex].path}`);
    setPreviewIndex(prevIndex);
  };

  return (
    <div className="mx-auto container px-4 mt-3 sm:px-6 lg:px-8">
      {images.length > 1 ? (
        <div className="flex flex-col lg:flex-row items-start gap-6">
          <div className="w-full lg:w-2/3 relative">
            {imageLoadError ? (
              <div className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] bg-gray-200 flex items-center justify-center rounded-lg">
                <p className="text-gray-500 text-lg">Failed to load images</p>
              </div>
            ) : (
              <div className="rounded-lg overflow-hidden shadow-xl relative">
                {/* Render slider if there are multiple images */}
                <Slider ref={sliderRef} {...settings}>
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={`${BASE_URL}/${image.path}`}
                        alt={`Gallery image ${index + 1}`}
                        className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] object-cover"
                        onError={handleImageError}
                      />
                    </div>
                  ))}
                </Slider>
                <div className="absolute bottom-0 left-0 right-0 flex justify-end items-center p-4 bg-gradient-to-t from-black to-transparent">
                  <Button
                    auto
                    className="bg-color1 text-white hover:bg-color2 transition-colors duration-300 px-4 sm:px-6 py-2 rounded-full text-sm font-semibold"
                    onPress={onOpen}
                  >
                    View All Images ({images.length})
                  </Button>
                </div>
                <button
                  className="absolute top-1/2 left-2 sm:left-4 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-1 sm:p-2 transition-all duration-300"
                  onClick={goToPrevSlide}
                  aria-label="Previous slide"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 sm:w-6 sm:h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  className="absolute top-1/2 right-2 sm:right-4 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-1 sm:p-2 transition-all duration-300"
                  onClick={goToNextSlide}
                  aria-label="Next slide"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 sm:w-6 sm:h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          <div className={`w-full lg:w-1/3 mt-6 lg:mt-0 hidden lg:block ${isPreviewOpen ? 'hidden' : ''}`}>
            <div className="grid grid-cols-2 gap-2 cursor-pointer">
              {images.slice(0, 6).map((image, index) => (
                <div
                  key={index}
                  className="relative group overflow-hidden rounded-lg shadow-md aspect-square"
                  onClick={() => handleThumbnailClick(index)}
                >
                  <img
                    src={`${BASE_URL}/${image.path}`}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : images.length === 1 ? (
        <div className="relative">
          <img
            src={`${BASE_URL}/${images[0].path}`}
            alt="Single cover photo"
            className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] object-cover"
            onError={handleImageError}
          />
          <div className="absolute bottom-0 left-0 right-0 flex justify-end items-center p-4 bg-gradient-to-t from-black to-transparent">
            <Button
              auto
              className="bg-color1 text-white hover:bg-color2 transition-colors duration-300 px-4 sm:px-6 py-2 rounded-full text-sm font-semibold"
              onPress={onOpen}
            >
              View Image
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-full h-[200px] sm:h-[300px] md:h-[400px] lg:h-[500px] bg-gray-300"></div>
      )}
  
      {/* Modal for "View All Images" Button */}
      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        scrollBehavior="inside"
        size="5xl"
        className='max-h-[90vh] z-40'
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Image Gallery</ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 cursor-pointer">
                  {images.map((image, index) => (
                    <div 
                      key={index} 
                      className="relative group overflow-hidden rounded-lg shadow-md"
                      onClick={() => handleThumbnailClick(index)}
                    >
                      <img
                        src={`${BASE_URL}/${image.path}`}
                        alt={`Gallery image ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300"></div>
                    </div>
                  ))}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color='danger' onPress={onClose}>Close</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Single Image Preview Modal */}
      <Modal 
        isOpen={isPreviewOpen} 
        onOpenChange={setIsPreviewOpen}
        hideCloseButton
        size="full"
        className='z-50 bg-black bg-opacity-75 flex justify-center items-center'
      >
        <ModalContent className="relative flex justify-center items-center">
          <ModalBody className="relative max-w-full h-full flex justify-center items-center bg-white">
            <img
              src={previewImage}
              alt="Preview"
              className="w-auto h-[80vh] object-contain rounded-md shadow-lg"
            />
            <div className="absolute bottom-4 left-0 right-0 text-center text-black text-2xl font-semibold py-2">
              {images[previewIndex]?.title}
            </div>
            <button
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-70 hover:bg-opacity-90 rounded-full p-3 transition-all duration-300"
              onClick={goToPrevImage}
              aria-label="Previous image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-70 hover:bg-opacity-90 rounded-full p-3 transition-all duration-300"
              onClick={goToNextImage}
              aria-label="Next image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              className="absolute top-4 right-4 bg-red-500  bg-opacity-70 hover:bg-opacity-90 rounded-full p-2 transition-all duration-300"
              onClick={closePreview}
              aria-label="Close preview"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default BusinessHero;
