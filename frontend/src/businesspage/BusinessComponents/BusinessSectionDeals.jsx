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
import { FiSend } from 'react-icons/fi';
import axios from 'axios';
import UserChatModal from '@/user/userChatSystem/UserChatModal';
// Use the environment variable for the base URL
const BASE_URL = import.meta.env.VITE_BASE_URL; 

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


const BusinessSection = ({isLoggedIn, businessData, userData}) => {
  const [activeModal, setActiveModal] = useState(null);
  const [mockData, setMockData] = useState({
    activities: [],
    accommodations: [],
    restaurant: [],
    shop: []
  });
  const categories = ['activity', 'accommodation', 'restaurant', 'shop'];
  const { businessId: encryptedBusinessId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const openBookingModal = (product) => {
    // console.log('Opening booking modal for product:', product);
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
    // console.log('Closing booking modal');
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
        const response = await fetch(`${BASE_URL}/getAllBusinessProduct?category=${category}`);
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

  const handleClickInquire = (product) => {
    if (!isLoggedIn){
      return  showErrorAlert('Please login to send a message.');
    }
    setSelectedProduct(product);
    handleModalOpen();
    // console.log(product);
  };

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };
  

  const handleModalClose = () => {
    setIsModalOpen(false);
    setMessage('');
  };

  const handleChatModalClose = () => {
    setIsChatModalOpen(false);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    const formData = new FormData();
    formData.append('sender_id', userData.user_id);
    formData.append('sender_account', 'user');
    formData.append('receiver_id', businessData.user_id);
    formData.append('receiver_account', 'business');
    formData.append('text', message);
    formData.append('formType', "inquire");
    formData.append('form_details', JSON.stringify({selectedProduct}));
    try {
      const response = await axios.post(`${BASE_URL}/sendMessage`, formData);
      setIsChatModalOpen(true);
    } catch (error) {
      console.error('Error sending message:', error);
    }
    handleModalClose();
  };

  return (
    <div className='mx-auto mt-4 container p-4 bg-white rounded-md shadow-md mb-4'>
      <div className='flex justify-between items-center p-2'>
        <h1 className='text-2xl font-semibold'>Deals</h1>
{/*         
          <h1 className='text-md font-semibold text-color1 hover:tracking-wide duration-300 hover:underline cursor-pointer'>
            See More
          </h1> */}
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
                <div className='shadow-lg rounded-lg overflow-hidden bg-white relative max-w-sm mx-1 transform transition-transform duration-300 hover:scale-105 hover:shadow-xl' style={{ height: '450px', width: '320px' }}>
                  {deal.images.length > 0 ? (
                    <div className="w-full h-48 p-4 ">
                      <img src={`${BASE_URL}/${deal.images[0].path}`} alt={deal.name} className='object-cover w-full h-full rounded-lg' />
                    </div>
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center text-gray-500 p-4">
                      <div className="w-full h-full flex items-center justify-center text-gray-500 bg-gray-200 rounded-lg">
                        No images available
                      </div>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    {deal.discount}% OFF
                  </div>
                  <div className='p-4 flex flex-col justify-between h-[calc(100%-12rem)]'>
                    <div className='mb-4'>
                      <h3 className='text-lg font-semibold text-gray-800'>{deal.name}</h3>
                      <p className='text-sm text-gray-600 mt-1'>{deal.description}</p>
                      <p className='text-xs text-red-500 mt-1'>Expires on: {new Date(deal.expiration).toLocaleDateString()}</p>
                    </div>
                    <div className='flex justify-between items-center mt-4'>
                      <p className='font-bold text-gray-800'>
                        <span className="line-through text-gray-500">₱{parseFloat(deal.price).toFixed(2)}</span> 
                        <span className="text-red-500 ml-2">
                          ₱{(parseFloat(deal.price) * (1 - deal.discount / 100)).toFixed(2)}
                        </span> {deal.pricing_unit}
                      </p>
                    </div>
                    <div className='flex justify-between gap-2 mt-4'>
                      <Button
                        auto
                        size="sm"
                        onClick={() => handleClickInquire(deal)}
                        color="primary"
                        className='w-full'
                      >
                        Inquire
                      </Button>
                      <Button
                        auto size="sm"
                        color="success"
                        className='w-full text-white'
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

      {/* Modal for sending message */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-5 rounded-md shadow-lg w-full max-w-md mx-4 relative">
            <button 
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 bg-transparent rounded-full w-8 h-8 flex items-center justify-center"
              onClick={handleModalClose}
            >
              <span className="text-xl">&times;</span>
            </button>
            <h2 className="text-lg font-medium mb-4">Inquire About {selectedProduct.name}</h2>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center border rounded-md p-2">
                <input
                  type="text"
                  placeholder="Write your inquiry here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="w-full outline-none text-gray-800"
                />
              </div>
              <Button
                auto
                color="primary"
                size="sm"
                icon={<FiSend />}
                onClick={handleSendMessage}
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      )}
      {activeModal?.type === 'accommodation' && (
        <AccommodationBookingForm isOpen={true} onClose={closeBookingModal} product={activeModal.product} />
      )}
      {activeModal?.type === 'restaurant' && (
        <TableReservationForm isOpen={true} onClose={closeBookingModal} product={activeModal.product} />
      )}
      {activeModal?.type === 'activities' && (
        <AttractionActivitiesBookingForm isOpen={true} onClose={closeBookingModal} product={activeModal.product} />
      )}

      <UserChatModal isOpen={isChatModalOpen} onClose={handleChatModalClose} onOpenChat={businessData} />
    </div>
  );
};

export default BusinessSection;
