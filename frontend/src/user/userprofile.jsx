import React, { useState, useEffect, useCallback } from 'react';
import Nav from '@/components/nav';
import Footer from '@/components/Footer';
import { Avatar } from '@nextui-org/react';
import Search from '@/components/Search';
import { Tabs, Tab, Card, CardBody, Button, useDisclosure } from "@nextui-org/react";
import BusinessApplicationModal from '@/businesspage/BusinessComponents/BusinessApplicationModal'; // Import the modal
import { GiPositionMarker } from 'react-icons/gi';
import {Spinner} from "@nextui-org/react";
import { AiOutlineLike } from 'react-icons/ai';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion'; // Import Framer Motion
import wave from '@/assets/wave2.svg'


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
  // Debugging: Log activities to ensure data is passed correctly
  // console.log('Activities:', activities);

  const [selected, setSelected] = useState("profile");
  const [profilePicFile, setProfilePicFile] = useState(null); // State to hold uploaded file for profile pic
  const [profilePic, setProfilePic] = useState(''); // URL of the current or uploaded profile picture
  const [username, setUsername] = useState(''); // Username of the logged-in user
  const [email, setEmail] = useState(''); // Email of the logged-in user
  const [phoneNumber, setPhoneNumber] = useState(''); // Phone number of the logged-in user
  const [password, setPassword] = useState(''); // Password of the logged-in user
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isBusinessOpen, onOpen: onBusinessOpen, onOpenChange: onBusinessOpenChange } = useDisclosure(); // Modal state for business account application
  const [isLoggedIn, setIsLoggedIn] = useState(null); // User login status
  const [userData, setUserData] = useState(null); // State to store fetched user data
  const [likedPages, setLikedPages] = useState([]); // Initialize with an empty array
  const [businessApplications, setBusinessApplications] = useState([]);
  const [businessData, setBusinessData] = useState(null); // State
  const [loading, setLoading] = useState(true);
  const [showButton, setShowButton] = useState(false); // State to show/hide button
  const [bookings, setBookings] = useState([]);

  
     // Title Tab
     useEffect(() => {
      document.title = 'RabaSorsogon | Profile';
    });
    useEffect(() => {

      // Simulate data fetching
      setTimeout(() => setLoading(false), 1000);

      // Show button when scrolled down
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


  // Function to handle booking cancellation
  const handleCancelBooking = async (bookingId) => {
    try {
      const response = await fetch(`http://localhost:5000/cancel-booking/${bookingId}`, {
        method: 'PUT',
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update the local state to reflect the cancellation
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
  
  // Fetching user data
  const fetchUserData = async () => {
    try {
      const response = await fetch('http://localhost:5000/get-userData', {
        method: 'GET',
        credentials: 'include' // Include cookies
      });
      const data = await response.json();
      setUserData(data.userData);
      setUsername(data.userData.username); // Set username
      setEmail(data.userData.email); // Set email
      setPhoneNumber(data.userData.contact || ''); // Set phone number (if available)
      // Fetch liked pages
      setLikedPages(data.userData.likedPages || []); // Set liked pages (default to empty array if not present)
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Fetching business applications for the logged-in user
  const fetchBusinessApplications = async () => {
    try {
      const response = await fetch('http://localhost:5000/businesses-application', {
        method: 'GET',
        credentials: 'include', // Include cookies for session-based authentication
      });
      const data = await response.json();
      
      if (response.ok) {
        setBusinessApplications(data.business_applications); // Set fetched applications

        // Check if there's any application with status 1
        const approvedApplication = data.business_applications.find(application => application.status === 1);
        
        if (approvedApplication) {
          // Fetch business data if there's an approved application
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
    checkLoginStatus(); // Check login status when component mounts

    // Set the initial tab based on the URL hash
    const hash = window.location.hash.substring(1); // Remove the '#' character
    if (hash) {
      setSelected(hash);
    }
  }, [checkLoginStatus]);

  useEffect(() => {
    if (isLoggedIn) {
      Promise.all([fetchUserData(), fetchBusinessApplications()])
        .then(() => setLoading(false)) // Set loading to false when all data is fetched
        .catch((error) => console.error('Error fetching initial data:', error));
    }
  }, [isLoggedIn]);

  // Handle profile picture file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      setProfilePic(URL.createObjectURL(file)); // Preview image
      e.target.value = ''; // Clear input
    }
  };

  // Handle profile update
  const handleUpdateProfile = async () => {
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      formData.append('phoneNumber', phoneNumber);
      formData.append('password', password);

      // Append profile picture if updated
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
      });

      fetchUserData(); // Refresh user data after update

      // Clear username and profilePicFile states
      setUsername('');  // Clear the username field
      setProfilePicFile(null);  // Clear the profilePicFile

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

  // Function to handle unliking a page
  const handleUnlikePage = (index) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to unlike this page?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0BDA51',
      cancelButtonColor: '#D33736',
      confirmButtonText: 'Yes, unlike it!'
    }).then((result) => {
      if (result.isConfirmed) {
        // Simulate unliking by updating the local state
        setLikedPages((prevLikedPages) => {
          const updatedPages = [...prevLikedPages];
          updatedPages.splice(index, 1); // Remove the unliked page
          return updatedPages;
        });
        Swal.fire({
          title: 'Unliked!',
          text: 'Page unliked successfully!',
          icon: 'success',
          confirmButtonColor: '#0BDA51',
        });
      }
    });
  };

  // Add this useEffect to fetch bookings
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
      // Handle error (e.g., show a notification)
    }
  };

  if (loading) {
    return     <Spinner className='flex justify-center items-center h-screen ' size='lg' label="Loading..." color="primary" />;  // dapat may design to
  }

  return (
    <div className='mx-auto min-h-screen font-sans bg-light' style={{ backgroundImage: `url(${wave})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}>
      <Nav />
      <div className='container p-3 rounded-md mt-[7.2rem] flex justify-center'>
        <Search />
      </div>

      <div className='container mx-auto flex flex-col md:flex-row mb-4 gap-4'>
        {/* Sidebar */}
        <div className='bg-white p-4 w-full md:w-1/4 flex flex-col justify-between shadow-lg rounded-md items-center'>
          <div className='flex flex-col items-center gap-2 flex-grow justify-center'>
            <div className='relative flex items-center w-28 h-28'>
              <Avatar className='w-full h-full object-cover rounded-full' 
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
                className='absolute bottom-0 right-0 bg-color1 text-white rounded-full w-9 h-9 hover:bg-color2 flex justify-center items-center cursor-pointer'
              >
                +
              </div>
            </div>
            <div className='text-2xl font-light'>
              {userData?.username ? userData.username : 'Loading...'}
            </div>
          </div>
          {businessApplications.length > 0 ? (
            businessApplications.map((application) => {
              if (application.status === 0) {
                // Show 'Pending Application' button if status is 0
                return (
                  <div key={`pending-${application.application_id}`}>
                    <Button className='text-white bg-yellow-500 hover:bg-yellow-600'>
                      Pending Application
                    </Button>
                  </div>
                );
              } else if (application.status === 1) {
                // Show business name if status is 1
                return (
                  <div key={`approved-${application.application_id}`}>
                    <h1 className='font-bold mb-2'>Switch to Business:</h1>
                    {/* <div className='max-h-[130px] bg-light shadow-md rounded-md shadow-slate-600 ring-gray-200 ring-1   p-3 flex flex-col gap-2 overflow-y-auto scrollbar-custom'>         */}
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
                // Show 'Denied' message if status is -1
                return (
                  <div key={`denied-${application.application_id}`}>
                    <Button className='text-white bg-red-500 hover:bg-red-600'>
                      Denied
                    </Button>
                  </div>
                  
                );
              }
            })
          ) : (
            // If no application exists, show 'Apply Business Account' button
            <Button className='text-white bg-color1 hover:bg-color2' onPress={onBusinessOpen}> 
              + Apply Business Account 
            </Button>
          )}

        </div>

        {/* Main content */}
        <div className='w-full md:w-3/4'>
          <Tabs aria-label="Options" selectedKey={selected} onSelectionChange={setSelected} className='overflow-y-auto scrollbar-hide'>
            {/* Profile Tab */}
            <Tab key="profile" title="Profile">
              <Card className='p-2'>
                <CardBody className='p-6 min-h-[600px]'>
                
                    <h1 className='text-4xl font-bold mb-3'>User Profile</h1>
                    <div className='bg-gray-300 w-full h-[1px] mb-8'></div>
                    
                    {/* Username field */}
                    <div className='mb-6'>
                      <h1 className='text-slate-500'>Username</h1>
                      <input
                        className='border-[.5px] rounded-md p-2 w-full md:w-64 focus:border-gray-500 focus:outline-none'
                        placeholder='Enter your username'
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                    
                    {/* Email field */}
                    <div className='mb-6'>
                      <h1 className='text-slate-500'>Email</h1>
                      <div className="flex items-center">
                        <input
                          className='border-[.5px] rounded-md p-2 w-full md:w-64 focus:border-gray-500 focus:outline-none'
                          placeholder='Enter your email'
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          type='email'
                        />
                        <span className="ml-2 text-green-500">Verified</span>
                      </div>
                    </div>

                    {/* Phone number field */}
                    <div className='mb-6'>
                      <h1 className='text-slate-500'>Phone Number</h1>
                      <input
                        className='border-[.5px] rounded-md p-2 w-full md:w-64 focus:border-gray-500 focus:outline-none'
                        placeholder='Add your phone number'
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        type='tel'
                      />
                    </div>

                    {/* Password field */}
                    <div className='mb-6'>
                      <h1 className='text-slate-500'>Password</h1>
                      <input
                        className='border-[.5px] rounded-md p-2 w-full md:w-64 focus:border-gray-500 focus:outline-none'
                        placeholder='Enter your new password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type='password'
                      />
                    </div>      
          
                </CardBody>
                <Button className='bg-color1 text-white hover:bg-color2' onPress={handleUpdateProfile}>Update Profile</Button>
              </Card>
            </Tab>

            {/* Liked Pages Tab */}
            <Tab key="likedPages" title="Liked Pages">
              <Card>
                <CardBody className='p-6 min-h-[700px]'>
                  <h1 className='text-4xl font-bold mb-3'>Liked Pages</h1>
                  <div className='bg-gray-300 w-full h-[1px] mb-8'></div>

                  {/* Sample activities data */}
                  {likedPages.length === 0 && (
                    setLikedPages([
                      {
                        name: 'Beautiful Beach',
                        description: 'Relax and enjoy the scenic beach view.',
                        image: 'https://via.placeholder.com/150', // Placeholder image
                        category: 'Relaxation',
                        rating: 5,
                        destination: 'Donsol',
                        budget: '500-2000',
                      },
                      {
                        name: 'Mountain Adventure',
                        description: 'Hike through the mountains and enjoy nature.',
                        image: 'https://via.placeholder.com/150',
                        category: 'Adventure',
                        rating: 4,
                        destination: 'Bulusan',
                        budget: '250-3000',
                      },
                      {
                        name: 'Mountain Adventure',
                        description: 'Hike through the mountains and enjoy nature.',
                        image: 'https://via.placeholder.com/150',
                        category: 'Adventure',
                        rating: 4,
                        destination: 'Bulusan',
                        budget: '250-3000',
                      },
                      {
                        name: 'Mountain Adventure',
                        description: 'Hike through the mountains and enjoy nature.',
                        image: 'https://via.placeholder.com/150',
                        category: 'Adventure',
                        rating: 4,
                        destination: 'Bulusan',
                        budget: '250-3000',
                      },
                    ])
                  )}

                  <div className='overflow-y-auto max-h-[600px] scrollbar-custom flex flex-col items-center'>
                    {likedPages.length === 0 ? (
                      <p className='text-slate-500'>You haven't liked any pages yet.</p>
                    ) : (
                      likedPages.map((activity, index) => (
                        <div key={index} className='bg-white max-w-[800px]  w-full rounded-lg shadow-lg hover:shadow-slate-500  duration-300 mb-4'>
                          <img
                            src={activity.image}
                            alt={activity.name}
                            className='w-full h-48 object-cover rounded-t-lg'
                          />
                          <div className='p-4'>
                            <div className='flex items-center justify-between gap-2'>
                              <div className='mb-2'>
                                <span className='inline-block bg-color2 text-white text-xs px-2 py-1 rounded-full'>
                                  {activity.category}
                                </span>
                              </div>
                              <div className='flex items-center gap-2'>
                                <div className='flex items-center gap-1'>
                                  <span className='text-black text-[12px]'>{activity.rating}</span>
                                  <span className='text-yellow-500'>
                                    {'★'.repeat(activity.rating)}{'☆'.repeat(5 - activity.rating)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <h3 className='font-semibold text-lg text-color1'>{activity.name}</h3>
                            <div className='text-xs text-gray-500 mb-2 flex items-center'>
                              <GiPositionMarker /> {activity.destination}
                            </div>
                            <p className='text-sm text-gray-600 mb-2'>{activity.description}</p>
                            <p className='font-semibold text-md mb-2'>₱{activity.budget}</p>
                            <div className=' flex items-center justify-between'>
                            <Link to="/business">  
                            <Button className='bg-color1 text-white hover:bg-color2'>Visit</Button>  
                            </Link> 
                            <Button 
                              className='h-9 px-3 bg-color2 text-white' 
                              onClick={() => handleUnlikePage(index)}
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

export default UserProfile;
