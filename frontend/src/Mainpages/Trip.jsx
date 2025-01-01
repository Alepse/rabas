import React, { useState, useEffect, useCallback } from 'react';
import Nav from '@/components/nav';
import Search from '@/components/Search';
import Footer from '@/components/Footer';
import { FaPlus, FaTimes } from 'react-icons/fa';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Progress,
  Input,
  RangeCalendar,
  Spinner,
  Accordion,
  AccordionItem
} from "@nextui-org/react";
import { motion } from 'framer-motion';
import MapFeature from '@/LeafletMap/MapFeature'; 
import {today, getLocalTimeZone} from "@internationalized/date";
import Planner from '@/Mainpages/PlanATripComponents/SchedulesPlan'; // Ensure this path is correct
import Swal from 'sweetalert2';
import TripDetailsModal from './PlanATripComponents/TripDetailsModal';
import wave from '@/assets/wave2.webp'
import axios from 'axios';
import { MdOutlineKeyboardArrowRight } from 'react-icons/md';
import { Link } from 'react-router-dom';

// Use the environment variable for the base URL
const BASE_URL = import.meta.env.VITE_BASE_URL; 

const MotionBox = motion.div;

// Function to show success alerts
const showSuccessAlert = (title, message) => {
  Swal.fire({
    icon: 'success',
    title: title,
    text: message,
    confirmButtonColor: '#0BDA51'
  });
};

// Function to show error alerts
const showErrorAlert = (title, message) => {
  Swal.fire({
    icon: 'error',
    title: title,
    text: message
  });
};

const Trip = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(10);
  const totalSteps = 4;
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [tripName, setTripName] = useState('');
  const [loading, setLoading] = useState(true);
  const [showButton, setShowButton] = useState(false); // State to show/hide button
  const [trips, setTrips] = useState([]); // Initialize with an empty array
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [itinerary, setItinerary] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track login status

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
          // Show alert before redirecting
          Swal.fire({
            icon: 'warning',
            title: 'Not Logged In',
            text: 'You need to log in to access this page.',
            confirmButtonText: 'OK'
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.href = '/'; // Redirect to home if not logged in after pressing OK
            }
          });
        }
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    }
  }, []);

  useEffect(() => {
    checkLoginStatus(); // Check login status on component mount
  }, [checkLoginStatus]);

  useEffect(() => {
    if (isLoggedIn) {
      // Fetch trips only if the user is logged in
      axios.get(`${BASE_URL}/trips`, { withCredentials: true })
        .then(response => {
          setTrips(response.data.trips); // Set the fetched trips to state
        })
        .catch(error => {
          console.error('Error fetching trips:', error);
          showErrorAlert('Error fetching trips:', error.response ? error.response.data.message : 'An unknown error occurred');
        })
        .finally(() => {
          setLoading(false); // Set loading to false after fetching
        });
    }
  }, [isLoggedIn]); // Fetch trips when isLoggedIn changes

  // Title Tab
  useEffect(() => {
    document.title = 'RabaSorsogon | Trip';
  });

  const [selectedLocations, setSelectedLocations] = useState('');


  let [value, setValue] = useState({
    start: today(getLocalTimeZone()),
    end: today(getLocalTimeZone()).add({ days: 0 }),
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


  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location: ", error);
        }
      );
    }
  }, []);

  if (loading) {
    return <Spinner className='flex justify-center items-center h-screen' size='lg' label="Loading..." color="primary" />;
  }

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
      setProgress((prevProgress) => prevProgress + (100 / totalSteps));
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      setProgress((prevProgress) => prevProgress - (100 / totalSteps));
    }
  };

  const submitTrip = () => {
    // Fetch user_id from the endpoint
    axios.get(`${BASE_URL}/get-userData`, { withCredentials: true })
      .then(response => {
        // console.log('response', response);
        const userId = response.data.userData.user_id;
        // console.log('userId', userId);
        const firstItineraryItem = Object.values(itinerary).flat()[0] || {};
        const { imageUrl, location } = firstItineraryItem;
      
        const newTrip = {
          tripName,
          imageUrl: imageUrl,
          destination: location,
          startDate: value.start.toString(),
          endDate: value.end.toString(),
          itinerary,
          userId, // Include user_id in the newTrip object
        };
      
        axios.post(`${BASE_URL}/add-trip`, newTrip)
        .then(response => {
          const { tripId } = response.data; // Extract tripId from the response
          const tripWithId = { ...newTrip, tripId }; // Add tripId to the newTrip object

          // Update the trips state with the new trip including its ID
          setTrips([...trips, tripWithId]);
          onClose();

          // Show success message
          showSuccessAlert('Trip added successfully', 'Your trip has been added to your trips list.');

          // Clear the form
          resetForm();
        })
        .catch(error => {
          // Show message if error
          showErrorAlert('Error adding trip:', error.response ? error.response.data.message : 'An unknown error occurred');
        });
      })
      .catch(error => {
        // Handle error in fetching user_id
        showErrorAlert('Error fetching user data:', error.response ? error.response.data.message : 'An unknown error occurred');
      });
  };

  const resetForm = () => {
    setStep(1);
    setProgress(10);
    setTripName('');
    setIsDetailsOpen(false);
    setSelectedTrip(null);
    setItinerary({});
    setValue({ start: today(getLocalTimeZone()), end: today(getLocalTimeZone()).add({ days: 0 }) });
  }

  const deleteTrip = (index, tripId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0BDA51', // Updated confirm button color
      cancelButtonColor: '#D33736', // Updated cancel button color
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        // console.log('tripId', tripId);
        axios.delete(`${BASE_URL}/delete-trip/${tripId}`, { withCredentials: true })
          .then(() => {
            setTrips(trips.filter((_, i) => i !== index));
            Swal.fire({
              title: 'Deleted!',
              text: 'Your trip has been deleted.',
              icon: 'success',
              confirmButtonColor: '#0BDA51' // Updated success alert confirm button color
            });
          })
          .catch(error => {
            showErrorAlert('Error deleting trip:', error.response ? error.response.data.message : 'An unknown error occurred');
          });
      }
    });
  };

  const slideVariant = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  const openDetailsModal = (trip) => {
    setSelectedTrip(trip);
    setItinerary(trip.itinerary || {});
    setIsDetailsOpen(true);
  };

  const updateTripDetails = (updatedTrip) => {
    setTrips((prevTrips) =>
      prevTrips.map((trip) =>
        trip.tripId === updatedTrip.tripId ? updatedTrip : trip
      )
    );
    setSelectedTrip(updatedTrip);
  };

  const handleItineraryChange = (newItinerary) => {
    setItinerary(newItinerary);
  };

  const formatTime = (time) => {
    if (!time || time.trim() === '') return 'None';
    const [hour, minute] = time.split(':');
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minute || '00'} ${ampm}`;
  };

  const handleClose = () => {
    resetForm();
    onClose();
  }

  return (
    <div className="mx-auto  bg-gray-100 min-h-screen font-sans flex flex-col" style={{ backgroundImage: `url(${wave})`, backgroundSize: 'auto', backgroundRepeat: 'repeat', backgroundPosition: 'center' }}>
      <Nav />
      <div className="mt-[3rem] flex justify-center w-full px-4">
        <Search />
      </div>
        <div className="container w-full flex justify-start mx-auto overflow-x-auto scrollbar-custom scrollbar-hide mb-4">
        <nav className="text-sm text-gray-500 whitespace-nowrap">
          <ol className="list-none p-0 inline-flex">
            <li className="flex items-center">
              <Link to="/home" className="hover:text-color1 truncate">Home</Link>
              <span className="mx-2"><MdOutlineKeyboardArrowRight /></span>
            </li>
            <li className="flex items-center">
              <Link to="/activities" className="hover:text-color1 truncate">Activities</Link>
              <span className="mx-2"><MdOutlineKeyboardArrowRight /></span>
            </li>
            <li className="flex items-center">
              <Link to="/accommodations" className="hover:text-color1 truncate">Accommodations</Link>
              <span className="mx-2"><MdOutlineKeyboardArrowRight /></span>
            </li>
            <li className="flex items-center">
              <Link to="/foodplaces" className="hover:text-color1 truncate">Food Places</Link>
              <span className="mx-2"><MdOutlineKeyboardArrowRight /></span>
            </li>
            <li className="flex items-center">
              <Link to="/shops" className="hover:text-color1 truncate">Shops</Link>
              <span className="mx-2"><MdOutlineKeyboardArrowRight /></span>
            </li>
            <li className="flex items-center">
              <Link to="/discover" className="hover:text-color1 truncate">Discover</Link>
              <span className="mx-2"><MdOutlineKeyboardArrowRight /></span>
            </li>
            <li className="flex items-center text-gray-700 truncate">
              <p className="truncate">Trip</p>
            </li>
          </ol>
        </nav>
      </div>
      <div className='p-6'>
      <div className="container mx-auto flex justify-center bg-color1 p-4 mb-4 items-center shadow-lg rounded-xl shadow-color1 m-4">
        <h1 className="text-white text-center font-semibold text-2xl md:text-4xl hover:tracking-wider duration-500">
          Plan Your Trip In Sorsogon
        </h1>
      </div>
      </div>

      <div className="container mx-auto p-4 md:p-9 bg-white max-h-screen mb-2 border rounded-lg shadow-md">
        <div className='flex justify-between items-center mb-2'>
          <h1 className='text-2xl md:text-4xl font-semibold mb-4'>My Trips</h1>
          <Button onClick={onOpen} className='bg-light hover:border-color2 text-black border-2 border-color1 text-lg md:text-xl flex gap-3 text-center'>
            <FaPlus className='text-xl md:text-2xl'/>
            Plan a Trip
          </Button>
        </div>
        <div className='border p-4 overflow-y-auto scrollbar-custom max-h-[500px]'>
          {trips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trips.map((trip, index) => (
                <div key={index} className="flex items-center flex-col md:flex-row border rounded-lg shadow-md overflow-hidden p-2">
                  <div className="flex h-full w-[12rem] md:w-1/3 p-2">
                    <img src={`${BASE_URL}/${trip.imageUrl}`} alt="Trip" className="w-full h-full object-cover rounded-lg" />
                  </div>
                  <div className="p-2 flex flex-col justify-between w-full md:w-2/3">
                    <div>
                      <h2 className="text-xl font-semibold">{trip.tripName}</h2>
                      <p className="text-gray-600">{new Date(trip.startDate).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })} - {new Date(trip.endDate).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}</p>
                      <p className="text-gray-600">To: {trip.destination}</p>
                    </div>
                    <div className="flex justify-between mt-4">
                      <Button onClick={() => openDetailsModal(trip)} className="bg-primary text-white rounded-lg py-2 px-4">
                        View Details
                      </Button>
                      <Button onClick={() => deleteTrip(index, trip.tripId)} className="bg-red-500 text-white rounded-lg py-2 px-4">
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No trips planned yet. Start by clicking "Plan a Trip".</p>
          )}
        </div>
      </div>

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

      <Modal disableAnimation hideCloseButton isOpen={isOpen} onClose={handleClose} className="rounded-lg shadow-lg mx-auto p-3 max-h-screen max-w-[1200px]">
        <ModalContent className="rounded-lg overflow-y-auto scrollbar-custom">
          <ModalHeader className="bg-primary text-white p-4 rounded-t-lg flex justify-between items-center">
            <h2 className="text-2xl font-bold">Let's create your trip in Sorsogon</h2>
              <button 
                  aria-label="Close" 
                  className='text-white hover:text-gray-300 transition-colors duration-200'
                  onClick={handleClose}
              >
                  <FaTimes />
              </button>
          </ModalHeader>
          <ModalBody className="bg-gray-50 p-2">
            <Progress value={progress} size="xs" classNames={{ indicator: "bg-color2",}} />

            <MotionBox
              key={step}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={slideVariant}
              transition={{ duration: 0.5 }}
              className="p-4 bg-white rounded-lg shadow-md border border-gray-200"
            >
              {step === 1 && (
                <>
                  <h2 className="text-2xl font-semibold text-primary">Introduction</h2>
                  <p className="text-gray-600 mt-2">Let’s start planning your trip! Answer a few questions to help us tailor the best experience for you.</p>
                  <div className='flex justify-center flex-col items-center mt-3 '>
                    <h1 className='text-lg font-medium'>Trip Name</h1>
                    <Input
                      placeholder="Name your trip"
                      value={tripName}
                      onChange={(e) => setTripName(e.target.value)}
                      className="mt-4 max-w-[200px]"
                      style={{ textAlign: 'center', fontSize: '14px',}}
                    />
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  <h1 className="text-2xl font-semibold text-primary mb-4">How Many Days Is Your Trip?</h1>
                  <h1 className='text-center text-lg font-medium mb-2'>Choose Your Start and End Trip Dates</h1>
                  
                  <div className='flex justify-center'>
                    <RangeCalendar
                      visibleMonths={2}
                      aria-label="Date (Controlled)"
                      value={value}
                      onChange={(newValue) => {
                        setValue(newValue);
                        console.log('Selected Dates:', newValue); // Log the selected dates
                      }}
                    />
                  </div>
                </>
              )}
              {step === 3 && (
                <>
                  <h1 className="text-2xl font-semibold text-primary mb-4">Plan Your Trip</h1>
                  <h1 className='text-center text-lg font-medium mb-2'>Set Up Your Itinerary for Each Date</h1>
                  <Planner
                    startDate={value.start}
                    endDate={value.end}
                    itinerary={itinerary}
                    setItinerary={setItinerary}
                    onItineraryChange={handleItineraryChange}
                  />
                  {/* {console.log('Planner Dates:', value.start, value.end)} */}
                </>
              )}
              {step === 4 && (
                <>
                  <h2 className="text-xl font-semibold text-primary">Review & Submit</h2>
                  <p className="text-gray-600 mt-2">Review your answers and submit:</p>
                  <Accordion selectionMode="multiple" className="mt-4">
                    <AccordionItem title="Trip Details">
                      <div className="p-4">
                        <div className='flex gap-2'>
                          <h3 className="font-semibold">Trip Name:</h3>
                          <p>{tripName}</p>
                        </div>
                        <h3 className="font-semibold mt-2">Trip Dates:</h3>
                        <p>Start: {value.start.toString()}</p>
                        <p>End: {value.end.toString()}</p>
                      </div>
                    </AccordionItem>
                    <AccordionItem title="Itinerary">
                      <div className='p-4'>
                        {Object.keys(itinerary || {}).map(date => (
                          <div key={date} className="mb-6">
                            <h4 className="font-semibold text-lg mb-2">{date}</h4>
                            {itinerary[date].map((item, index) => (
                              <div key={index} className="flex flex-col sm:flex-row items-start mb-6 bg-white p-4 rounded-lg shadow-lg w-full sm:w-3/4 lg:w-2/3 mx-auto">
                                <div className="flex-shrink-0 w-12 text-center">
                                  <div className="bg-color1 text-white rounded-full w-10 h-10 flex items-center justify-center mb-2">
                                    {index + 1}
                                  </div>
                                  <div className="h-full border-l-2 border-gray-300"></div>
                                </div>
                                <div className="ml-0 sm:ml-6 w-full">
                                  <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                                    <h3 className="font-semibold text-xl">{item.title}</h3>
                                    <span className="text-sm text-gray-500"> <span className='text-black font-medium'>Time of Visit:</span> {formatTime(item.time)}</span>
                                  </div>
                                  {item.imageUrl ? (
                                    <img src={`${BASE_URL}/${item.imageUrl}` || 'https://via.placeholder.com/300'} alt={item.title} className="w-full h-56 object-cover rounded-md mb-4" />
                                  ) : (
                                    <div className="w-full h-56 object-cover rounded-md mb-4">
                                      <div className="w-full h-full flex items-center justify-center text-gray-500 bg-gray-200 rounded-lg">
                                        No images available
                                      </div>
                                    </div>                                                          )}
                                  <p className="text-sm mb-2"><strong>Booked:</strong> {item.isBooked ? 'Yes' : 'No'}</p>
                                  <p className="text-sm mb-4"><strong>Notes:</strong> {item.notes}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </AccordionItem>
                  </Accordion>
                </>
              )}
            </MotionBox>
          </ModalBody>
          <ModalFooter className="bg-gray-100 p-4 z-50 sticky bottom-[-10px] rounded-b-lg">
            <div className='flex justify-between w-full'>
            <Button onClick={handleClose} className="bg-red-500 hover:bg-red-600 text-white rounded-lg py-2 px-4 transition-all">
                Close
              </Button>
              <div className='flex gap-3'>
                {step > 1 && (
                  <Button onClick={prevStep} className="bg-primary hover:bg-primary-dark text-white rounded-lg py-2 px-4 transition-all">
                    Back
                  </Button>
                )}
                {step < totalSteps ? (
                  <Button onClick={nextStep} className="bg-primary text-white hover:bg-primary-dark transition-all rounded-lg py-2 px-4">
                    Next
                  </Button>
                ) : (
                  <Button onClick={submitTrip} className="bg-success text-white hover:bg-success-dark transition-all rounded-lg py-2 px-4">
                    Submit
                  </Button>
                )}
              </div>
              
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {isDetailsOpen && selectedTrip && (
          <TripDetailsModal
              disableAnimation
              isOpen={isDetailsOpen}
              onClose={() => setIsDetailsOpen(false)}
              trip={selectedTrip}
              onUpdateTrip={updateTripDetails}
              itinerary={itinerary}
          />
      )}
    </div>
  );
};

export default Trip;