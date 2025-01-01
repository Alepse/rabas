import React, { useState, useEffect, useCallback } from 'react';
import Nav from '@/components/nav';
import Footer from '@/components/Footer';
import { Avatar } from '@nextui-org/react';
import Search from '@/components/Search';
import { Tabs, Tab, Card, CardBody, Button, useDisclosure } from "@nextui-org/react";
import BusinessApplicationModal from '@/businesspage/BusinessComponents/BusinessApplicationModal';
import { GiPositionMarker } from 'react-icons/gi';
import { Spinner } from "@nextui-org/react";
import { AiOutlineDislike  } from 'react-icons/ai';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import wave from '@/assets/wave2.webp';
import CryptoJS from 'crypto-js';
import axios from 'axios';
import { FaCamera, FaBusinessTime } from 'react-icons/fa';
import { FaCalendarAlt, FaClock, FaUser, FaEnvelope, FaPhone, FaMoneyBillWave , FaComment, } from 'react-icons/fa';
import { BsFillPersonLinesFill } from "react-icons/bs";
import { MdOutlineKeyboardArrowRight } from 'react-icons/md';

// Use the environment variable for the base URL
const BASE_URL = import.meta.env.VITE_BASE_URL; 

const encryptId = (id) => {
  // console.log('Encrypting ID:', id); // Debugging log
  const secretKey = import.meta.env.VITE_SECRET_KEY;
  if (!secretKey) {
    // console.error('Secret key is not defined');
    return null;
  }
  if (!id) {
    // console.error('ID is null or undefined');
    return null;
  }
  const ciphertext = CryptoJS.AES.encrypt(id.toString(), secretKey).toString();
  return encodeURIComponent(ciphertext);
};

const renderLikedPages = (likedPages, handleUnlikePage) => {
  return likedPages.length === 0 ? (
    <p className="text-slate-500">You haven't liked any pages yet.</p>
  ) : (
    <div className="flex flex-col gap-4 w-full">
      {likedPages.map((item) => (
        <div
          key={item.id || item.business_id} // Use a fallback if business_id is unavailable
          className="flex flex-col sm:flex-row items-start bg-white w-full rounded-lg shadow-lg hover:shadow-slate-500 duration-300 mb-4 p-4"
        >
          {item.business_id ? (
            <>
              {/* Image Section */}
              <img
                src={`${BASE_URL}/${item.image}`}
                alt={item.name}
                className="w-full sm:w-48 h-[10.6rem] object-cover rounded-t-lg sm:rounded-none sm:rounded-l-lg"
              />

              {/* Content Section */}
              <div className="flex-1 p-4">
                {/* Category and Ratings */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    {item.rating ? (
                      <>
                        <span className="text-black text-[12px]">
                          {parseFloat(item.rating).toFixed(1)}
                        </span>
                        <span className="text-yellow-500">
                          {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                        </span>
                      </>
                    ) : (
                      <span className="text-black text-[12px]">No ratings</span>
                    )}
                  </div>
                </div>

                {/* Title and Description */}
                <h3 className="font-semibold text-md text-color1 mb-1">
                  {item.name}
                </h3>
                <div className="text-xs text-gray-500 mb-1 flex items-center">
                  <GiPositionMarker /> {item.destination}
                </div>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {item.description}
                </p>

                <div className="flex gap-4 justify-between items-center">
                  {/* Price Range */}
                  <div className="text-sm font-semibold text-black">
                    {item.lowest_price && item.highest_price ? (
                      `₱${item.lowest_price} - ₱${item.highest_price}`
                    ) : (
                      <span className="text-gray-400 italic">
                        Price Range Not Available
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {/* Actions */}
              <div className="flex-1">
                <div className="flex flex-col items-center mt-2 justify-center justify-between gap-2 lg:gap-8">
                  <Button
                    className="px-10 py-6 rounded-lg bg-color2 text-white text-sm"
                    onClick={() => handleUnlikePage(item.id)}
                  >
                    <div className="flex items-center gap-2">
                      <AiOutlineDislike />Unlike
                    </div>
                  </Button>
                  <Link to={`/business/${encryptId(item?.business_id)}`}>
                    <Button
                      size="sm"
                      className="px-14 py-6 rounded-lg bg-color1 text-white hover:bg-color2 text-sm"
                    >
                      Visit
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 p-4">
              <div className="w-full sm:w-48 h-[10.6rem] flex items-center justify-center p-4 bg-gray-300">
                <p className="text-gray-500 italic">Business is deleted or unavailable.</p>
              </div>
              {/* Actions */}
              <div className="flex items-center mt-2 md:justify-end justify-between gap-2">
                  <Button
                    className="h-8 px-3 bg-color2 text-white text-sm"
                    onClick={() => handleUnlikePage(item.id)}
                  >
                    <div className="flex items-center gap-1">
                      Remove
                    </div>
                  </Button>
                </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};


// Simplified component for the "My Booking" tab
const MyBookingTab = ({ bookings, onCancelBooking }) => {
  const [activeTab, setActiveTab] = useState("active");

  const filterBookings = (status) => {
    if (!Array.isArray(bookings)) return [];
    
    return bookings.filter(booking => {
      switch(status) {
        case "active":
          return booking.status === 'confirmed' || booking.status === 'pending';
        case "completed":
          return booking.status === 'completed';
        case "cancelled":
          return booking.status === 'cancelled';
        default:
          return false;
      }
    });
  };

  return (
    <div className="p-6">
      {/* Page Title */}
      <h3 className="text-4xl font-bold mb-4">My Bookings</h3>
      <div className="bg-gray-300 h-[1px] mb-8"></div>

      {/* Tabs */}
      <Tabs
        aria-label="Booking Status"
        selectedKey={activeTab}
        onSelectionChange={setActiveTab}
        className="overflow-x-auto"
      >
        {/* Active Tab */}
        <Tab key="active" title="Active">
          <div className="overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
            {filterBookings('active').length === 0 ? (
              <p className="text-gray-500 text-center">No active bookings at the moment.</p>
            ) : (
              filterBookings('active').map((booking) => (
                <div
                  key={booking.booking_id}
                  className="bg-white shadow-lg rounded-lg p-4 border border-gray-200 mb-4"
                >
                  {/* Booking Title */}
                  <h4 className="font-bold text-xl mb-2">{booking.productName}</h4>
                  <h1 className='mb-3 flex items-center gap-3'><BsFillPersonLinesFill/><strong > Name: </strong>{booking.customerName}</h1>
                  {/* Booking Details with Icons */}

                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <FaCalendarAlt className="text-gray-500" />
                      <p>
                        <strong>Date:</strong>{' '}
                        {new Date(booking.dateIn).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FaClock className="text-gray-500" />
                      <p>
                        <strong>Time:</strong> {new Date(booking.dateIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FaUser className="text-gray-500" />
                      <p>
                        <strong>Guests:</strong> {booking.numberOfGuests}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FaEnvelope className="text-gray-500" />
                      <p>
                        <strong>Email:</strong> {booking.email}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FaPhone className="text-gray-500" />
                      <p>
                        <strong>Phone:</strong> {booking.phone}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                    <FaComment className="text-gray-500" />
                    <p>
                      <strong>Special Requests:</strong> {booking.specialRequests ? booking.specialRequests : 'None'}
                    </p>
                  </div>
                    
                    <div className="flex items-center space-x-3">
                      <FaMoneyBillWave className="text-gray-500" />
                      <p>
                        <strong>Amount:</strong> ₱{parseFloat(booking.priceDetails.discountedPrice).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Cancel Button */}
                  {booking.status === 'pending' && (
                    <div className="mt-6">
                      <button
                        onClick={() => onCancelBooking(booking.booking_id)}
                        className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition"
                      >
                        Cancel Booking
                      </button>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Cancellation is free up to 24 hours before the booking
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Tab>

        {/* Completed Tab */}
        <Tab key="completed" title="Completed">
          <div className="overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
            {filterBookings('completed').length === 0 ? (
              <p className="text-gray-500 text-center">No completed bookings at the moment.</p>
            ) : (
              filterBookings('completed').map((booking) => (
                <div
                  key={booking.booking_id}
                  className="bg-white shadow-lg rounded-lg p-4 border border-gray-200 mb-4"
                >
                  {/* Booking Title */}
                  <h4 className="font-bold text-xl mb-2">{booking.productName}</h4>
                  <h1 className='mb-3 flex items-center gap-3'><BsFillPersonLinesFill/><strong > Name: </strong>{booking.customerName}</h1>
                  {/* Booking Details with Icons */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <FaCalendarAlt className="text-gray-500" />
                      <p>
                        <strong>Date:</strong>{' '}
                        {new Date(booking.dateIn).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FaClock className="text-gray-500" />
                      <p>
                        <strong>Time:</strong> {new Date(booking.dateIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FaUser className="text-gray-500" />
                      <p>
                        <strong>Guests:</strong> {booking.numberOfGuests}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FaEnvelope className="text-gray-500" />
                      <p>
                        <strong>Email:</strong> {booking.email}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FaPhone className="text-gray-500" />
                      <p>
                        <strong>Phone:</strong> {booking.phone}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                    <FaComment className="text-gray-500" />
                    <p>
                      <strong>Special Requests:</strong> {booking.specialRequests ? booking.specialRequests : 'None'}
                    </p>
                  </div>
                    
                    <div className="flex items-center space-x-3">
                      <FaMoneyBillWave className="text-gray-500" />
                      <p>
                        <strong>Amount:</strong> ₱{parseFloat(booking.priceDetails.discountedPrice).toLocaleString()}
                      </p>
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>
        </Tab>

        {/* Cancelled Tab */}
        <Tab key="cancelled" title="Cancelled">
          <div className="overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
            {filterBookings('cancelled').length === 0 ? (
              <p className="text-gray-500 text-center">No cancelled bookings at the moment.</p>
            ) : (
              filterBookings('cancelled').map((booking) => (
                <div
                  key={booking.booking_id}
                  className="bg-white shadow-lg rounded-lg p-4 border border-gray-200 mb-4"
                >
                  {/* Booking Title */}
                  <h4 className="font-bold text-xl mb-2">{booking.productName}</h4>
                  <h1 className='mb-3 flex items-center gap-3'><BsFillPersonLinesFill/><strong > Name: </strong>{booking.customerName}</h1>

                  {/* Booking Details with Icons */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <FaCalendarAlt className="text-gray-500" />
                      <p>
                        <strong>Date:</strong>{' '}
                        {new Date(booking.dateIn).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FaClock className="text-gray-500" />
                      <p>
                        <strong>Time:</strong> {new Date(booking.dateIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FaUser className="text-gray-500" />
                      <p>
                        <strong>Guests:</strong> {booking.numberOfGuests}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FaEnvelope className="text-gray-500" />
                      <p>
                        <strong>Email:</strong> {booking.email}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FaPhone className="text-gray-500" />
                      <p>
                        <strong>Phone:</strong> {booking.phone}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                    <FaComment className="text-gray-500" />
                    <p>
                      <strong>Special Requests:</strong> {booking.specialRequests ? booking.specialRequests : 'None'}
                    </p>
                  </div>
                    
                    <div className="flex items-center space-x-3">
                      <FaMoneyBillWave className="text-gray-500" />
                      <p>
                        <strong>Amount:</strong> ₱{parseFloat(booking.priceDetails.discountedPrice).toLocaleString()}
                      </p>
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

const UserProfile = ({ activities = [] }) => {
  const [selected, setSelected] = useState("profile");
  const [profilePic, setProfilePic] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isBusinessOpen, onOpen: onBusinessOpen, onOpenChange: onBusinessOpenChange } = useDisclosure();
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [userData, setUserData] = useState(null);
  const [likedPages, setLikedPages] = useState([]);
  const [businessApplications, setBusinessApplications] = useState([]);
  const [businessData, setBusinessData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showButton, setShowButton] = useState(false);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    document.title = 'RabaSorsogon | Profile';
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

  const handleCancelBooking = async (bookingId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Do you really want to cancel this booking?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0BDA51',
      cancelButtonColor: '#D33736',
      confirmButtonText: 'Yes, cancel it!',
      cancelButtonText: 'No, keep it'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${BASE_URL}/cancel-booking/${bookingId}`, {
          method: 'PUT',
          credentials: 'include'
        });

        const data = await response.json();

        if (data.success) {
          setBookings(prevBookings => 
            prevBookings.map(booking => 
              booking.booking_id === bookingId 
                ? { ...booking, status: 'cancelled' } 
                : booking
            )
          );

          Swal.fire({
            title: 'Cancelled!',
            text: 'Your booking has been cancelled.',
            icon: 'success',
            confirmButtonColor: '#0BDA51'
          });
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        console.error('Error cancelling booking:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to cancel booking',
          icon: 'error',
          confirmButtonColor: '#D33736'
        });
      }
    }
  };

  const checkLoginStatus = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/check-login`, {
        method: 'GET',
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setIsLoggedIn(data.isLoggedIn);

        if (!data.isLoggedIn) {
          window.location.href = '/';
        }
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    }
  }, []);
  
  const fetchUserData = async () => {
    try {
      const response = await fetch(`${BASE_URL}/get-userData`, {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();
      setUserData(data.userData);
      setUsername(data.userData.username);
      setEmail(data.userData.email);
      setPhoneNumber(data.userData.contact || '');
      setAddress(data.userData.address || '');
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchLikedPages = async () => {
    try {
      const response = await fetch(`${BASE_URL}/liked-pages`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      setLikedPages(data.likedPages || []);
    } catch (error) {
      console.error('Error fetching liked pages:', error);
    }
  };

  const fetchBusinessApplications = async () => {
    try {
      const response = await fetch(`${BASE_URL}/businesses-application`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      
      if (response.ok) {
        setBusinessApplications(data.business_applications);

        const approvedApplication = data.business_applications.find(application => application.status === 1);
        
        if (approvedApplication) {
          try {
            const response = await fetch(`${BASE_URL}/get-businessData`, {
              method: 'GET',
              credentials: 'include',
            });
            const businessData = await response.json();
            
            if (response.ok) {
              setBusinessData(businessData.businessData[0]);
            }
          } catch (error) {
            console.error('Error fetching business data:', error);
          }
        }
      } else {
        console.error('Failed to fetch business applications:', data.message);
      }
    } catch (error) {
      console.error('Error fetching business applications:', error);
    }
  };

  useEffect(() => {
    checkLoginStatus();

    const hash = window.location.hash.substring(1);
    if (hash) {
      setSelected(hash);
    }
  }, [checkLoginStatus]);

  useEffect(() => {
    if (isLoggedIn) {
      Promise.all([fetchUserData(), fetchBusinessApplications(), fetchLikedPages()])
        .then(() => setLoading(false))
        .catch((error) => console.error('Error fetching initial data:', error));
    }
  }, [isLoggedIn]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(URL.createObjectURL(file));
      e.target.value = ''; // Clear the input value to allow re-uploading the same file
      updateProfilePic(file); // Call the update function with the new file
    }
  };
  
  const updateProfilePic = async (file) => {
    if (!file) {
      Swal.fire({
        title: 'Error!',
        text: 'No file selected for upload',
        icon: 'error',
        confirmButtonColor: '#D33736'
      });
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append('profilePic', file);
  
      const response = await axios.put(`${BASE_URL}/updateUserProfile/${userData.user_id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
  
      if (response.data.success) {
        Swal.fire({
          title: 'Success!',
          text: 'Profile picture updated successfully!',
          icon: 'success',
          confirmButtonColor: '#0BDA51'
        }).then(() => {
          setTimeout(() => {
            window.location.reload();
          });
        });
      } else {
        console.error('Failed to update profile picture:', response.data.message);
        throw new Error('Failed to update profile picture');
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update profile picture',
        icon: 'error',
        confirmButtonColor: '#D33736'
      });
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      formData.append('phoneNumber', phoneNumber);
      formData.append('address', address);

      const response = await fetch(`${BASE_URL}/updateUserProfile/${userData.user_id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      Swal.fire({
        title: 'Success!',
        text: 'Profile updated successfully!',
        icon: 'success',
        confirmButtonColor: '#0BDA51'
      });

      setUserData(prevUserData => ({
        ...prevUserData,
        username: username,
        email: email,
        phoneNumber: phoneNumber,
        address: address,
      }));

    } catch (error) {
      console.error(error);
      Swal.fire({
        title: 'Error!',
        text: 'There was an error updating the profile',
        icon: 'error',
        confirmButtonColor: '#D33736'
      });
    }
  };

  const handleUnlikePage = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to unlike this page?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0BDA51',
      cancelButtonColor: '#D33736',
      confirmButtonText: 'Yes, unlike it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(`${BASE_URL}/unlike-businessInProfile/${id}`, { withCredentials: true });
          if (response.data.success) {
            setLikedPages((prevLikedPages) => {
              // Filter out the page with the specified businessId
              const updatedPages = prevLikedPages.filter(page => page.id !== id);
              return updatedPages;
            });
            Swal.fire({
              title: 'Unliked!',
              text: 'Page unliked successfully!',
              icon: 'success',
              confirmButtonColor: '#0BDA51',
            });
          } else {
            Swal.fire({
              title: 'Error!',
              text: response.data.message || 'Failed to unlike the page.',
              icon: 'error',
              confirmButtonColor: '#D33736'
            });
          }
        } catch (error) {
          console.error('Error unliking page:', error);
          Swal.fire({
            title: 'Error!',
            text: 'Failed to unlike the page.',
            icon: 'error',
            confirmButtonColor: '#D33736'
          });
        }
      }
    });
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch(`${BASE_URL}/bookings`, {
          credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
          setBookings(data.bookings);
        } else {
          console.error('Failed to fetch bookings:', data.message);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };

    fetchBookings();
  }, []);

  const handleBusinessClick = async (businessId) => {
    try {
      const response = await fetch(`${BASE_URL}/set-business-id`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ businessId })
      });

      console.log(businessId);

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to set business ID');
      }

      window.location.href = '/businessprofileadmin';
    } catch (error) {
      console.error('Error setting business ID:', error);
    }
  };

  if (loading) {
    return <Spinner className='flex justify-center items-center h-screen ' size='lg' label="Loading..." color="primary" />;
  }

  return (
    <div className='mx-auto min-h-screen font-sans bg-light' style={{ backgroundImage: `url(${wave})`, backgroundSize: 'auto', backgroundRepeat: 'repeat', backgroundPosition: 'center' }}>
      <Nav />
      <div className='container p-3 rounded-md mt-[7.2rem] flex justify-center'>
        <Search />
      </div>

        <div className="container w-full flex justify-start mx-auto overflow-x-auto scrollbar-custom scrollbar-hide mb-4">
        <nav className="text-sm text-gray-500 whitespace-nowrap">
          <ol className="list-none p-0 inline-flex">
            <li className="flex items-center">
              <Link to="/" className="hover:text-color1 truncate">Home</Link>
              <span className="mx-2"><MdOutlineKeyboardArrowRight /></span>
            </li>
            <li className="flex items-center text-gray-700 truncate">
              <p className="truncate">Profile</p>
            </li>
          </ol>
        </nav>
      </div>

      {/* Header Section */}
      <div className='container mx-auto flex flex-col items-center mb-8 bg-white mt-2 shadow-md rounded-xl shadow-gray-400 p-5 ' >
        <div className='relative flex items-center w-36 h-36 mb-4'>
          <Avatar className='w-full h-full object-cover rounded-full border-4 border-color1' 
            src={profilePic 
              ? profilePic 
              : (userData?.image_path 
                ? `${BASE_URL}/${userData.image_path}`
                : userData?.google_id
                  ? userData.image
                  : `https://ui-avatars.com/api/?name=${username?.charAt(0).toUpperCase()}`)}  
          />
          <input type='file' className='hidden' accept='image/*' onChange={handleFileChange} id='fileInput' />
          <div
            onClick={() => document.getElementById('fileInput').click()}
            className='absolute bottom-0 right-0 bg-color1 text-white rounded-full w-10 h-10 hover:bg-color2 flex justify-center items-center cursor-pointer'
          >
            +
          </div>
        </div>
        <div className='text-3xl font-semibold mb-4'>
          {userData?.username ? userData.username : 'Loading...'}
        </div>
        {businessApplications.length > 0 ? (
          businessApplications.map((application) => {
            if (application.status === 0) {
              return (
                <Button key={`pending-${application.application_id}`} className='text-white bg-yellow-500 hover:bg-yellow-600 mb-4'>
                  Pending Application
                </Button>
              );
            } else if (application.status === 1) {
              return (
                <div key={`approved-${application.application_id}`} className='mb-4 flex justify-center items-center flex-col'>
                  <h1 className='font-bold mb-2'>Switch to Business:</h1>
                  <button 
                    className='text-gray-500 hover:bg-color2 hover:text-white flex items-center p-2 rounded-md gap-1 border-1 border-color1 shadow-md transition duration-300 ease-in-out transform hover:scale-105'
                    onClick={() => handleBusinessClick(businessData?.business_id)} // Use optional chaining
                    key={application.application_id}
                  >
                    {/* Check if businessData is available before accessing its properties */}
                    {businessData && businessData.businessLogo ? (
                      <Avatar 
                        src={`${BASE_URL}/${businessData.businessLogo}`} 
                        alt={businessData.businessName} // Alt text for accessibility
                      />
                    ) : (
                      <div className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full"> {/* Optional styling for the icon container */}
                        <FaBusinessTime className="text-gray-500" size={24} /> {/* Display the icon */}
                      </div>
                    )}
                    <p>{businessData ? businessData.businessName : 'Loading...'}</p> {/* Show loading text if businessData is not available */}
                  </button>
                </div>
              );
            } else if (application.status === -1) {
              return (
                <Button key={`denied-${application.application_id}`} className='text-white bg-red-500 hover:bg-red-600 mb-4'>
                  Denied
                </Button>
              );
            }
          })
        ) : (
          <Button className='text-white bg-color1 hover:bg-color2 mb-4' onPress={onBusinessOpen}> 
            + Apply Business Account 
          </Button>
        )}
      </div>

      {/* Main content */}
      <div className='container mx-auto'>
        <Tabs aria-label="Options" selectedKey={selected} onSelectionChange={setSelected}    variant="underlined"  
        classNames={{
          base: "w-full overflow-x-auto mb-4",
          tabList: "gap-6 w-full p-0 flex  container",
          tab: "max-w-fit px-0 h-12",
          tabContent: "text-color1 "
        }}>
          {/* Profile Tab */}
          <Tab key="profile" title="Profile">
            <Card className='p-4 shadow-lg'>
              <CardBody className='p-6'>
                <h1 className='text-4xl font-bold mb-6'>User Profile</h1>
                <div className='bg-gray-300 w-full h-[1px] mb-8'></div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  {/* Username field */}
                  <div>
                    <h1 className='text-slate-500 mb-2'>Username</h1>
                    <input
                      className='border-[.5px] rounded-md p-3 w-full focus:border-gray-500 focus:outline-none'
                      placeholder='Enter your username'
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  
                  {/* Email field */}
                  <div>
                    <h1 className='text-slate-500 mb-2'>Email</h1>
                    <div className="flex items-center">
                      <input
                        className='border-[.5px] rounded-md p-3 w-full focus:border-gray-500 focus:outline-none'
                        placeholder='Enter your email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type='email'
                      />
                      <span className="ml-2 text-green-500">Verified</span>
                    </div>
                  </div>

                  {/* Phone number field */}
                  <div>
                    <h1 className='text-slate-500 mb-2'>Phone Number</h1>
                    <input
                      className='border-[.5px] rounded-md p-3 w-full focus:border-gray-500 focus:outline-none'
                      placeholder='Add your phone number'
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      type='tel'
                    />
                  </div>

                  {/* Address field */}
                  <div>
                    <h1 className='text-slate-500 mb-2'>Address</h1>
                    <input
                      className='border-[.5px] rounded-md p-3 w-full focus:border-gray-500 focus:outline-none'
                      placeholder='Enter your address'
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>      
                </div>
                <Button className='mt-6 bg-color1 text-white hover:bg-color2 w-full md:w-auto' onPress={handleUpdateProfile}>Update Profile</Button>
              </CardBody>
            </Card>
          </Tab>
          {/* Liked Pages Tab */}
          <Tab key="likedPages" title="Liked Pages">
            <Card >
              <CardBody className="p-4 sm:p-6 ">
                {/* Header */}
                <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center sm:text-left">
                  Liked Pages
                </h1>
                <div className="bg-gray-300 w-full h-[1px] mb-6"></div>

                {/* Content Container */}
                <div className="overflow-y-auto  max-h-[600px] p-4 scrollbar-custom">
                  {likedPages.length > 0 ? (
                    <div className="flex flex-col gap-4 items-center">
                      {renderLikedPages(likedPages, handleUnlikePage)}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center mt-4">
                      You haven't liked any pages yet.
                    </p>
                  )}
                </div>
              </CardBody>
            </Card>
          </Tab>

          {/* My Booking Tab */}
          <Tab key="myBookings" title="My Bookings">
            <Card>
              <CardBody className='p-6 min-h-[700px]'>
                <MyBookingTab bookings={bookings} onCancelBooking={handleCancelBooking} />
              </CardBody>
            </Card>
          </Tab>
        </Tabs>
      </div>

      <BusinessApplicationModal
        isBusinessOpen={isBusinessOpen}
        onBusinessOpenChange={onBusinessOpenChange}
        userData={userData}
      />

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
            background: 'linear-gradient(135deg, #688484  0%, #092635 100%)',
            color: 'white',
          }}
        >
          ↑
        </motion.button>
      )}
    </div>
  );
};

export default UserProfile;