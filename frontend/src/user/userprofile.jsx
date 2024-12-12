import React, { useState, useEffect, useCallback } from 'react';
import Nav from '@/components/nav';
import Footer from '@/components/Footer';
import { Avatar } from '@nextui-org/react';
import Search from '@/components/Search';
import { Tabs, Tab, Card, CardBody, Button, useDisclosure } from "@nextui-org/react";
import BusinessApplicationModal from '@/businesspage/BusinessComponents/BusinessApplicationModal';
import { GiPositionMarker } from 'react-icons/gi';
import { Spinner } from "@nextui-org/react";
import { AiOutlineLike } from 'react-icons/ai';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import wave from '@/assets/wave2.webp';
import CryptoJS from 'crypto-js';
import axios from 'axios';

// Function to encrypt the business_id
const encryptId = (id) => {
  const secretKey = import.meta.env.VITE_SECRET_KEY;
  if (!secretKey) {
    console.error('Secret key is not defined');
    return null;
  }
  const ciphertext = CryptoJS.AES.encrypt(id.toString(), secretKey).toString();
  return encodeURIComponent(ciphertext);
};

// Function to render liked pages
const renderLikedPages = (likedPages, handleUnlikePage) => {
  return likedPages.length === 0 ? (
    <p className='text-slate-500'>You haven't liked any pages yet.</p>
  ) : (
    likedPages.map((item, index) => (
      <div key={item.id || index} className='bg-white max-w-[800px] w-full rounded-lg shadow-lg hover:shadow-slate-500 duration-300 mb-4'>
        <img
          src={`http://localhost:5000/${item.image}`}
          alt={item.name}
          className='w-full h-48 object-cover rounded-t-lg'
        />
        <div className='p-4'>
          <div className='flex items-center justify-between gap-2'>
            <div className='mb-2'>
              <span className='inline-block bg-color2 text-white text-xs px-2 py-1 rounded-full'>
                {item.category}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='flex items-center gap-1'>
                {item.rating ? (
                  <>
                    <span className='text-black text-[12px]'>{parseFloat(item.rating).toFixed(1)}</span>
                    <span className='text-yellow-500'>
                      {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                    </span>
                  </>
                ) : (
                  <span className='text-black text-[12px]'>No ratings</span>
                )}
              </div>
            </div>
          </div>
          <h3 className='font-semibold text-lg text-color1'>{item.name}</h3>
          <div className='text-xs text-gray-500 mb-2 flex items-center'>
            <GiPositionMarker /> {item.destination}
          </div>
          <p className='text-sm text-gray-600 mb-2'>{item.description}</p>
          <p className='font-semibold text-md mb-2'>₱{item.lowest_price} - ₱{item.highest_price}</p>
          <div className='flex items-center justify-between'>
            <Link to={`/business/${encryptId(item.business_id)}`}>
              <Button className='bg-color1 text-white hover:bg-color2'>Visit</Button>
            </Link>
            <Button
              className='h-9 px-3 bg-color2 text-white'
              onClick={() => handleUnlikePage(item.business_id)}
            >
              <div className='text-sm flex items-center gap-2'>
                <AiOutlineLike />
                Unlike
              </div>
            </Button>
          </div>
        </div>
      </div>
    ))
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
      <h3 className="text-2xl font-bold ">My Bookings</h3>
      <Tabs aria-label="Booking Status" selectedKey={activeTab} onSelectionChange={setActiveTab} className='overflow-x-auto w-full'>
        <Tab key="active" title="Active">
          <div className="overflow-y-auto max-h-[450px] scrollbar-custom">
            {filterBookings("active").map((booking) => (
              <div key={booking.booking_id} className="bg-white shadow-lg p-4 rounded-lg mb-4">
                <div className="p-3 bg-gray-50 rounded-lg text-sm text-black border border-gray-200">
                  <h4 className="font-semibold mb-2">Booking Details:</h4>
                  <ul className="space-y-1">
                    <li><strong>Product:</strong> {booking.productName}</li>
                    <li><strong>Guests:</strong> {booking.numberOfGuests}</li>
                    <li><strong>Email:</strong> {booking.email}</li>
                    <li><strong>Phone:</strong> {booking.phone}</li>
                    <li><strong>Date:</strong> {new Date(booking.dateIn).toLocaleDateString()}</li>
                    <li><strong>Time:</strong> {new Date(booking.dateIn).toLocaleTimeString()}</li>
                    <li><strong>Special Requests:</strong> {booking.specialRequests}</li>
                    <li><strong>Amount:</strong> ₱{parseFloat(booking.priceDetails.discountedPrice).toLocaleString()}</li>
                    <li><strong>Status:</strong> {booking.status}</li>
                  </ul>
                </div>
                {booking.status === 'pending' && (
                  <Button 
                    className="mt-2 bg-red-500 text-white hover:bg-red-600" 
                    onClick={() => onCancelBooking(booking.booking_id)}
                  >
                    Cancel Booking
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Tab>
        <Tab key="completed" title="Completed">
          <div className="overflow-y-auto max-h-[500px] scrollbar-custom">
            {filterBookings("completed").map((booking) => (
              <div key={booking.booking_id} className="bg-white shadow-lg p-4 rounded-lg ">
                <div className="p-3 bg-gray-50 rounded-lg text-sm text-black border border-gray-200">
                  <h4 className="font-semibold mb-2">Booking Details:</h4>
                  <ul className="space-y-1">
                    <li><strong>Product:</strong> {booking.productName}</li>
                    <li><strong>Guests:</strong> {booking.numberOfGuests}</li>
                    <li><strong>Email:</strong> {booking.email}</li>
                    <li><strong>Phone:</strong> {booking.phone}</li>
                    <li><strong>Date:</strong> {new Date(booking.dateIn).toLocaleDateString()}</li>
                    <li><strong>Time:</strong> {new Date(booking.dateIn).toLocaleTimeString()}</li>
                    <li><strong>Special Requests:</strong> {booking.specialRequests}</li>
                    <li><strong>Amount:</strong> ₱{parseFloat(booking.priceDetails.discountedPrice).toLocaleString()}</li>
                    <li><strong>Status:</strong> {booking.status}</li>
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </Tab>
        <Tab key="cancelled" title="Cancelled">
          <div className="overflow-y-auto max-h-[500px] scrollbar-custom">
            {filterBookings("cancelled").map((booking) => (
              <div key={booking.booking_id} className="bg-white shadow-lg p-4 rounded-lg ">
                <div className="p-3 bg-gray-50 rounded-lg text-sm text-black border border-gray-200">
                  <h4 className="font-semibold mb-2">Booking Details:</h4>
                  <ul className="space-y-1">
                    <li><strong>Product:</strong> {booking.productName}</li>
                    <li><strong>Guests:</strong> {booking.numberOfGuests}</li>
                    <li><strong>Email:</strong> {booking.email}</li>
                    <li><strong>Phone:</strong> {booking.phone}</li>
                    <li><strong>Date:</strong> {new Date(booking.dateIn).toLocaleDateString()}</li>
                    <li><strong>Time:</strong> {new Date(booking.dateIn).toLocaleTimeString()}</li>
                    <li><strong>Special Requests:</strong> {booking.specialRequests}</li>
                    <li><strong>Amount:</strong> ₱{parseFloat(booking.priceDetails.discountedPrice).toLocaleString()}</li>
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

const UserProfile = ({ activities = [] }) => {
  const [selected, setSelected] = useState("profile");
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePic, setProfilePic] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
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
    try {
      const response = await fetch(`http://localhost:5000/cancel-booking/${bookingId}`, {
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
          title: 'Success!',
          text: 'Booking cancelled successfully',
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
  };

  const checkLoginStatus = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/check-login', {
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
      const response = await fetch('http://localhost:5000/get-userData', {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();
      setUserData(data.userData);
      setUsername(data.userData.username);
      setEmail(data.userData.email);
      setPhoneNumber(data.userData.contact || '');
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchLikedPages = async () => {
    try {
      const response = await fetch('http://localhost:5000/liked-pages', {
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
      const response = await fetch('http://localhost:5000/businesses-application', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      
      if (response.ok) {
        setBusinessApplications(data.business_applications);

        const approvedApplication = data.business_applications.find(application => application.status === 1);
        
        if (approvedApplication) {
          try {
            const response = await fetch('http://localhost:5000/get-businessData', {
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
      setProfilePicFile(file);
      setProfilePic(URL.createObjectURL(file));
      e.target.value = '';
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      formData.append('phoneNumber', phoneNumber);
      formData.append('password', password);

      if (profilePicFile) {
        formData.append('profilePic', profilePicFile);
      }

      const response = await fetch(`http://localhost:5000/updateUserProfile/${userData.user_id}`, {
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
      }).then(() => {
        setTimeout(() => {
          window.location.reload();
        });
      });

      setUsername('');
      setProfilePicFile(null);

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

  const handleUnlikePage = async (businessId) => {
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
          const response = await axios.delete(`http://localhost:5000/unlike-business/${businessId}`, { withCredentials: true });
          if (response.data.success) {
            setLikedPages((prevLikedPages) => {
              // Filter out the page with the specified businessId
              const updatedPages = prevLikedPages.filter(page => page.business_id !== businessId);
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
        const response = await fetch('http://localhost:5000/bookings', {
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
      const response = await fetch('http://localhost:5000/set-business-id', {
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
    <div className='mx-auto min-h-screen font-sans bg-light' style={{ backgroundImage: `url(${wave})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}>
      <Nav />
      <div className='container p-3 rounded-md mt-[7.2rem] flex justify-center'>
        <Search />
      </div>

      {/* Header Section */}
      <div className='container mx-auto flex flex-col items-center mb-8 bg-white mt-2 shadow-md rounded-xl shadow-gray-400 p-5 ' style={{ backgroundImage: `url(${wave})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}>
        <div className='relative flex items-center w-36 h-36 mb-4'>
          <Avatar className='w-full h-full object-cover rounded-full border-4 border-color1' 
            src={profilePic 
              ? profilePic 
              : (userData?.image_path 
                ? `http://localhost:5000/${userData.image_path}`
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
                    className='text-gray-500 hover:bg-color2 hover:text-white flex items-center p-2 rounded-lg gap-1'
                    onClick={() => handleBusinessClick(businessData.business_id)}
                    key={application.application_id}>
                    <Avatar src=''/>
                    <p>{businessData.businessName}</p>
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
          tabList: "gap-6 w-full p-4 container",
          tab: "max-w-fit px-0 h-12",
          tabContent: "text-color1"
        }}>
          {/* Profile Tab */}
          <Tab key="profile" title="Profile">
            <Card className='p-4 shadow-lg'>
              <CardBody className='p-6'>
                <h1 className='text-4xl font-bold mb-6'>User Profile</h1>
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

                  {/* Password field */}
                  <div>
                    <h1 className='text-slate-500 mb-2'>Password</h1>
                    <input
                      className='border-[.5px] rounded-md p-3 w-full focus:border-gray-500 focus:outline-none'
                      placeholder='Enter your new password'
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type='password'
                    />
                  </div>      
                </div>
                <Button className='mt-6 bg-color1 text-white hover:bg-color2 w-full md:w-auto' onPress={handleUpdateProfile}>Update Profile</Button>
              </CardBody>
            </Card>
          </Tab>

          {/* Liked Pages Tab */}
          <Tab key="likedPages" title="Liked Pages">
            <Card>
              <CardBody className='p-6 min-h-[700px]'>
                <h1 className='text-4xl font-bold mb-3'>Liked Pages</h1>
                <div className='bg-gray-300 w-full h-[1px] mb-8'></div>
                <div className='overflow-y-auto max-h-[600px] scrollbar-custom flex flex-col items-center'>
                  {renderLikedPages(likedPages, handleUnlikePage)}
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