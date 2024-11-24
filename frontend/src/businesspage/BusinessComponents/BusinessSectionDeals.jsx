import React, { useState, useEffect, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { Button } from '@nextui-org/react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import AccommodationBookingForm from './bookingFormModal/AccommodationBookingForm';
import TableReservationForm from './bookingFormModal/TableReservationForm';
import AttractionActivitiesBookingForm from './bookingFormModal/AttractionActivitiesBookingForm';
import { useParams } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import Swal from 'sweetalert2';

// SweetAlert functions
const showSuccessAlert = (message) => {
  Swal.fire({
    title: 'Success!',
    text: message,
    icon: 'success',
    confirmButtonText: 'OK',
    confirmButtonColor: '#0BDA51', // Green color for confirmation
    cancelButtonColor: '#D33736',  // Red color for cancellation
  });
};

const showErrorAlert = (message) => {
  Swal.fire({
    title: 'Error!',
    text: message,
    icon: 'error',
    confirmButtonText: 'Try Again',
    confirmButtonColor: '#0BDA51', // Green color for confirmation
    cancelButtonText: 'Close',
    cancelButtonColor: '#D33736',  // Red color for cancellation
  });
};


const BusinessSection = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Initialize login status

   // Function to check login status
  const checkLoginStatus = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/check-login', {
        method: 'GET',
        credentials: 'include' // Include cookies
      });
      if (response.ok) {
        const data = await response.json();
        setIsLoggedIn(data.isLoggedIn); // Set login status
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    }
  }, []);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const [activeModal, setActiveModal] = useState(null);
  const [mockData, setMockData] = useState({
    activities: [],
    accommodations: [],
    restaurant: [],
    shop: []
  });
  const categories = ['activity', 'accommodation', 'restaurant', 'shop'];
  const { businessId: encryptedBusinessId } = useParams();

  const [discountedProducts, setDiscountedProducts] = useState([]);
  const openBookingModal = (product) => {
    console.log('Opening booking modal for product:', product);
    if (product.product_category === 'accommodation') {
      setActiveModal({ type: 'accommodation', product });
    } else if (product.product_category === 'restaurant') {
      setActiveModal({ type: 'restaurant', product });
    } else if (product.product_category === 'activity') {
      setActiveModal({ type: 'activities', product });
    } else {
      console.warn('Product type not recognized:', product.type);
    }
  };

  const closeBookingModal = () => {
    console.log('Closing booking modal');
    setActiveModal(null);
  };

  const decryptId = (encryptedId) => {
    const secretKey = import.meta.env.VITE_SECRET_KEY;
    const bytes = CryptoJS.AES.decrypt(decodeURIComponent(encryptedId), secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  };
  
  useEffect(() => {
    const fetchCategoryData = async (category) => {
      try {
        const decryptedBusinessId = decryptId(encryptedBusinessId);
        const response = await fetch(`http://localhost:5000/getAllBusinessProduct?category=${category}`);
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();

          if (data.success) {
            const filteredProducts = data.businessProducts.filter((product) => {
              return product.product_category === category && product.business_id === parseInt(decryptedBusinessId) && product.discount > 0;
            });

            const categoryKey = category === 'activity' ? 'activities' :
                                category === 'accommodation' ? 'accommodations' :
                                category === 'restaurant' ? 'restaurant' : 'shop';

            setMockData((prevData) => ({
              ...prevData,
              [categoryKey]: filteredProducts,
            }));
          } else {
            console.error(`Failed to fetch ${category} data:`, data.message);
          }
        } else {
          console.error(`Unexpected response format for ${category}:`, response);
        }
      } catch (error) {
        console.error(`Error fetching ${category} data:`, error);
      }
    };

    categories.forEach((category) => {
      fetchCategoryData(category);
    });
  }, [encryptedBusinessId]);

  useEffect(() => {
    setDiscountedProducts([
      ...mockData.activities,
      ...mockData.accommodations,
      ...mockData.restaurant,
      ...mockData.shop,
    ]);
  }, [mockData.activities, mockData.accommodations, mockData.restaurant, mockData.shop]);

  return (
    <div className='mx-auto mt-4 container p-4 bg-white rounded-md shadow-md mb-4'>
      <div className='flex justify-between items-center p-2'>
        <h1 className='text-2xl font-semibold'>Deals</h1>
        <h1 className='text-md font-semibold text-color1 hover:tracking-wide duration-300 hover:underline cursor-pointer'>
          See More
        </h1>
      </div>

      <div className='mt-8'>
        {discountedProducts.length === 0 ? (
          <p className='text-center italic text-gray-500'>No deals available at the moment.</p>
        ) : (
          <Swiper
            modules={[Navigation]}
            navigation={{ nextEl: '.custom-next', prevEl: '.custom-prev' }}
            spaceBetween={10}
            slidesPerView={1}
            breakpoints={{
              320: { slidesPerView: 1 },
              480: { slidesPerView: 1.5 },
              640: { slidesPerView: 2 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className='max-w-full p-4 overflow-hidden'
          >
            {discountedProducts.map((deal, index) => (
              <SwiperSlide key={`${deal.id}-${index}`} className='flex justify-center'>
                <div className='shadow-lg rounded-lg overflow-hidden bg-white relative max-w-sm mx-1 transform transition-transform duration-300 hover:scale-105 hover:shadow-xl' style={{ height: '400px' }}>
                  {deal.images && deal.images.length > 0 && (
                    <img src={`http://localhost:5000/${deal.images[0].path}`} alt={deal.name} className='w-full h-48 object-cover' />
                  )}
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    {deal.discount}% OFF
                  </div>
                  {/* <Button size="sm" className="absolute top-2 right-2 text-white bg-color1">
                    View Images
                  </Button> */}
                  <div className='p-4'>
                    <h3 className='text-lg font-semibold text-gray-800'>{deal.name}</h3>
                    <p className='text-sm text-gray-600 mt-1'>{deal.description}</p>
                    <p className='text-xs text-red-500 mt-1'>Expires on: {new Date(deal.expiration).toLocaleDateString()}</p>
                    <div className='flex justify-between mt-3'>
                      <p className='mt-2 font-bold text-gray-800'>
                        <span className="line-through text-gray-500">₱{parseFloat(deal.price).toFixed(2)}</span> 
                        <span className="text-red-500">
                          ₱{(parseFloat(deal.price) * (1 - deal.discount / 100)).toFixed(2)}
                        </span>
                      </p>
                      <div className='flex gap-2'>
                        <Button auto size="sm" color="primary">Inquire</Button>
                        <Button
                          auto size="sm"
                          color="primary"
                          onClick={() => {
                            if (isLoggedIn) {
                              openBookingModal(deal);
                            } else {
                              showErrorAlert('Please log in to book this product.');
                            }
                          }}
                        >
                          {deal.product_category === 'restaurant' ? 'Reserve Table' : 
                          deal.product_category === 'activity' ? 'Book Activity' : 
                          deal.product_category === 'accommodation' ? 'Book Stay' : 
                          'Book'}
                        </Button>
                      </div>
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
        )}
      </div>

      {activeModal?.type === 'accommodation' && (
        <AccommodationBookingForm isOpen={true} onClose={closeBookingModal} product={activeModal.product} />
      )}
      {activeModal?.type === 'restaurant' && (
        <TableReservationForm isOpen={true} onClose={closeBookingModal} product={activeModal.product} />
      )}
      {activeModal?.type === 'activities' && (
        <AttractionActivitiesBookingForm isOpen={true} onClose={closeBookingModal} product={activeModal.product} />
      )}
    </div>
  );
};

export default BusinessSection;
