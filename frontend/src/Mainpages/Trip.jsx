import React, { useState, useEffect, useCallback } from 'react';
import Nav from '@/components/nav';
import Search from '@/components/Search';
import Footer from '@/components/Footer';
import { FaPlus, FaTimes,FaWalking,FaBed,FaUtensils,FaShoppingBag } from 'react-icons/fa';
import { Select, Switch, SelectItem } from "@nextui-org/react";
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
  Tabs, 
  Tab,
  Card, 
  CardBody,
  DatePicker,
  Textarea

} from "@nextui-org/react";
import { motion } from 'framer-motion';
import MapFeature from '@/LeafletMap/MapFeature'; 
import {today, getLocalTimeZone} from "@internationalized/date";
import Planner from '@/Mainpages/PlanATripComponents/SchedulesPlan'; // Ensure this path is correct
import SidePanel from '@/Mainpages/PlanATripComponents/SidePanel'; // Ensure this path is correct
import AddItemModal from '@/Mainpages/PlanATripComponents/AddItemModal';
import WantToDoSection from '@/Mainpages/PlanATripComponents/WantToDoSection';
import Swal from 'sweetalert2';
import TripDetailsModal from './PlanATripComponents/TripDetailsModal';
import wave from '@/assets/wave2.webp'
import axios from 'axios';
import { MdOutlineKeyboardArrowRight } from 'react-icons/md';
import TripMapSection from '@/Mainpages/PlanATripComponents/TripMapSection'; 

import { Link } from 'react-router-dom';

import PlanATripSearch from './PlanATripComponents/PlanATripSearch';
import { GiPositionMarker } from 'react-icons/gi';


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

const municipalities = [
  "Barcelona", "Bulan", "Bulusan", "Casiguran", "Castilla", "Donsol",
  "Gubat", "Irosin", "Juban", "Magallanes", "Matnog", "Pilar",
  "Prieto Diaz", "Sta. Magdalena", "Sorsogon City"
];

const Trip = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(20);
  const totalSteps = 5;
  const [currentLocation, setCurrentLocation] = useState(null);
  const [currentZoom, setCurrentZoom] = useState(10); //for maps
  
  const [loading, setLoading] = useState(true);
  const [showButton, setShowButton] = useState(false); // State to show/hide button
  const [trips, setTrips] = useState([]); // Initialize with an empty array
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track login status

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);
  

  const [time, setTime] = useState("");

  const [tripName, setTripName] = useState('');
  // console.log("Trip name:\n", tripName);

  const [tripDate, setTripDate] = useState(null);
  // console.log("Starting and end date\n", tripDate);

  const formatTripDate = (date) => {
    if (date && date.calendar) {
      const { day, month, year } = date;
      return new Date(year, month - 1, day); // Create a Date object
    }
    return null; 
  };

  const startDate = tripDate?.start ? formatTripDate(tripDate.start) : null;
  const endDate = tripDate?.end ? formatTripDate(tripDate.end) : null;

  const totalDays = startDate && endDate 
    ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) 
    : 0;

    // console.log(`Trip Date: Start: ${startDate?.toLocaleDateString()} - End: ${endDate?.toLocaleDateString()}`);
    // console.log(`Total Days: ${totalDays}`)

  // third variable destination name
  const [destinationName, setDestinationName] = useState('');
  // console.log("Destination name:\n", destinationName);

  // 4th variable iteneraryo
  const [itinerary, setItinerary] = useState({});
  // console.log("Itinerary asdasdsasdasda:\n", itinerary)

  // Helper function to count items by type
  const countItemsByType = (type) => {
    return Object.values(itinerary).reduce((count, dayItems) => {
      return count + dayItems.filter((item) => item.type === type).length;
    }, 0);
  };

  const accommodationsCount = countItemsByType("accommodation");
  const attractionsCount = countItemsByType("attraction");
  const foodPlacesCount = countItemsByType("restaurant");
  const shopsCount = countItemsByType("shop");
  const municipalitiesCount = new Set(
    Object.values(itinerary).flatMap((dayItems) => dayItems.map((item) => item.location))
  ).size;
  const totalVisits = accommodationsCount + attractionsCount + foodPlacesCount + shopsCount;


  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const [isSideUIVisible, setIsSideUIVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleAdd = (date) => {
    onAddOpen();
    setCurrentDate(date);
    setSelectedItem(null);
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
          startDate: tripDate.start.toString(),
          endDate: tripDate.end.toString(),
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
    setTripDate(null);
    setTripName('');
    setDestinationName('')
    setIsDetailsOpen(false);
    setSelectedTrip(null);
    setItinerary({});
  }

  const clearState = () => {
    // setSelectedTrip(null);
    setItinerary({});  // Clear itinerary
    setIsDetailsOpen(false);
  };

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
    if (newItinerary){
      setItinerary(newItinerary);
    }
    console.log("Updated itinerary:", newItinerary);
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
              <Link to="/" className="hover:text-color1 truncate">Home</Link>
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

      <div className="container mx-auto p-4 md:p-9 bg-white max-h-screen  mb-2 border rounded-lg shadow-md">
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

      <Modal scrollBehavior='inside' size='full' disableAnimation isDismissable={false} hideCloseButton isOpen={isOpen} onClose={handleClose} className=" z-40 rounded-lg shadow-lg mx-auto p-2 max-h-screen ">
      
        <ModalContent className="rounded-lg overflow-y-auto  scrollbar-custom">
          <ModalHeader className="bg-color2 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h2 className="text-2xl font-bold">Let's create your trip in Sorsogon</h2>
              <button 
                  aria-label="Close" 
                  className='text-white hover:text-gray-300 transition-colors duration-200'
                  onClick={handleClose}
              >
                  <FaTimes />
              </button>
          </ModalHeader>
          <ModalBody className="bg-gray-50 w-full  p-2">
            <Progress  value={progress} size="xs" classNames={{ indicator: "bg-color1",}} />

            <MotionBox
              key={step}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={slideVariant}
              transition={{ duration: 0.5 }}
              className="p-4 "
            >

            {step === 1 && (
              <>
              {/* <div className="grid grid-cols-1 gap-4 p-5 bg-gray-100"> */}
              {/* <SidePanel 
                tripName={tripName} 
                tripDate={tripDate} 
                firstDestination={destinationName} 
                itinerary={itinerary}
                onItineraryChange={handleItineraryChange}
              /> */}
             
                <div className="flex flex-col bg-white p-8 justify-start h-full items-center rounded-lg">
                  <h1 className="md:text-4xl text-2xl font-medium text-primary">Enter Your trip Name</h1>
                  <p className="text-gray-500 text-sm mt-1">Make it memorable with a personalized name!</p>
                    <Input
                      placeholder="e.g., Summer Adventure 2025"
                      value={tripName}
                      onChange={(e) => setTripName(e.target.value)}
                      className="mt-4 max-w-md rounded-2xl  border-2 border-gray-300 text-center"
                      style={{ fontSize: '12px' }}
                    />
                </div>
              {/* </div> */}
              </>
            )}

            {step === 2 && (
              <>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_3fr] gap-4 p-5 bg-gray-100">
                <SidePanel 
                  tripName={tripName} 
                  tripDate={tripDate} 
                  firstDestination={destinationName} 
                  itinerary={itinerary}
                  onItineraryChange={handleItineraryChange}
                />
                <div className="flex flex-col justify-start p-8 items-center bg-white rounded-lg">
                  <h1 className="md:text-4xl text-2xl font-medium text-primary">Where Do you want To Go?</h1>
                  <p className="text-gray-500 text-sm mt-1">Select your first destination</p>
                    <Select
                      label="Destination Name"
                      placeholder="Select your destination"
                      className="mt-4 max-w-md rounded-2xl  border-2 border-gray-300 text-center"
                      selectedKeys={new Set([destinationName])} // Use `selectedKeys` for controlled selection
                      onSelectionChange={(key) => setDestinationName(key.currentKey)} // Update state with the selected key
                    >
                      {municipalities.map((municipality) => (
                        <SelectItem key={municipality} value={municipality}>
                          {municipality}
                        </SelectItem>
                      ))}
                    </Select>
                    <h1 onClick={nextStep} className='underline cursor-pointer mt-6 hover:text-color2'>prefer not to say</h1>
                </div>
              </div>
              </>
            )}

             {step === 3 && (
              <>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_3fr] gap-4 p-5 bg-gray-100">
                <SidePanel 
                  tripName={tripName} 
                  tripDate={tripDate} 
                  firstDestination={destinationName} 
                  itinerary={itinerary}
                  onItineraryChange={handleItineraryChange}
                />
                <div className="h-full flex flex-col items-center justify-start bg-white rounded-lg p-8 ">
                  <h1 className=" text-xl md:text-4xl font-semibold text-primary text-center mb-3">How Many Days Is Your Trip?</h1>
                  <p className="text-center text-sm font-small text-gray-500 mb-4">Select your start and end trip dates below:</p>
                  <div className="flex justify-center overflow-x-auto w-full p-1 ">
                    <RangeCalendar
                      visibleMonths={3}
                      aria-label="Select trip dates"
                      value={tripDate}
                      minValue={today(getLocalTimeZone()).add({ days: 1 })}
                      onChange={(newValue) => {
                        setTripDate(newValue);
                        // console.log('Selected Dates:', newValue); // Log the selected dates
                      }}
                    />
                  </div>

                 <div className='flex  items-center mt-6 gap-3'>
                  <h1>Not Sure? Customize Your Plan</h1>
                  <Button onClick={nextStep} size='sm' className='bg-color2 text-white hover:bg-color1 '>Here ⇢ </Button>
                 </div>
                </div>
              </div>
              </>
            )}

            
            {step === 4 && (
              <>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_4fr] gap-4 p-5 bg-gray-100">
                <SidePanel 
                  tripName={tripName} 
                  tripDate={tripDate} 
                  firstDestination={destinationName} 
                  itinerary={itinerary}
                  onItineraryChange={handleItineraryChange}
                />
                <div className="flex flex-col justify-start bg-white rounded-lg items-center p-8 ">
                  <h1 className="md:text-4xl text-2xl font-medium text-primary py-4">What Do You Want To Do?</h1>
                  {/* <PlanATripSearch/>  */}
                  {/* <DatePicker   className=" max-w-md rounded-2xl  border-1 border-gray-300 "/>   */}
                    
                
                  {/* <WantToDoSection /> */}
                </div>  
              </div>
              </>
            )}
            {step === 5 && (
              <>
                <div className="bg-gray-100 flex items-center h-full justify-center py-10">
                  <div className="bg-white shadow-md rounded-lg p-6 w-full ">
                    {/* Header */}
                    <h1 className="text-2xl font-bold mb-4 text-gray-800">Trip Details : Review & Submit</h1>
                      <div className="grid grid-cols-1 md:grid-cols-2 items-center p-4 border-b">
                    {/* Trip Details */}
                    <div className="mb-6">
                      <p className="text-gray-700">
                        <strong>Trip Name:</strong> {tripName}
                      </p>
                      <p className="text-gray-700">
                        <strong>Trip Date:</strong> Start: {startDate ? startDate.toLocaleDateString() : "N/A"} - End: {endDate ? endDate.toLocaleDateString() : "N/A"}
                      </p>
                      <p className="text-gray-700">
                        <strong>Total Days:</strong> {totalDays}
                      </p>
                    </div>

                      {/* Budget & Travel Time */}
                      {/* <div className="mb-6">
                        <p className="text-gray-600">
                          <strong>Budget Estimation per person:</strong> 5,000-10,000
                        </p>
                        <p className="text-gray-600">
                          <strong>Travel Time Total:</strong> 3hrs 22mins
                        </p>
                      </div> */}
                    </div>

                    {/* Highlights Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 items-center p-4 border-b">
                      <div>
                        <p className="text-gray-600">
                          <strong>Accommodations to Visit:</strong> {accommodationsCount}
                        </p>
                        <p className="text-gray-600">
                          <strong>Attractions to Visit:</strong> {attractionsCount}
                        </p>
                        <p className="text-gray-600">
                          <strong>Food Places to Visit:</strong> {foodPlacesCount}
                        </p>
                        <p className="text-gray-600">
                          <strong>Shops to Visit:</strong> {shopsCount}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">
                          <strong>Municipalities to Travel:</strong> {municipalitiesCount}
                        </p>
                        <p className="text-gray-600">
                          <strong>To Visits:</strong> {totalVisits}
                        </p>
                      </div>
                    </div>

                    {/* Map Section */}
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-800 mb-2">Map Overview</h2>
                      {/* Right Side: Map Section */}
                      <TripMapSection 
                        itinerary={itinerary}  
                        currentZoom={currentZoom}
                        setCurrentZoom={setCurrentZoom}
                      />
                    </div>


                  
                  </div>
                </div>
                          
              </>
            )}
            {step === 7 && (
              <>
              
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
                    Finish
                  </Button>
                )}
              </div>
              
            </div>
          </ModalFooter>
        </ModalContent>
          {/* Drawer */}
          {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black bg-opacity-50">
          <div className="w-full max-w-2xl lg:max-w-3xl xl:max-w-4xl h-full  bg-white shadow-lg flex flex-col rounded-lg overflow-hidden">
            
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">Add to Itinerary</h2>
              <Button auto color="danger" flat onClick={closeDrawer}>
                Close
              </Button>
            </div>

            {/* Body */}
            <div className="p-4 flex-1 overflow-y-auto">
              {/* Image Section */}
              <div className="w-full h-[200px] sm:h-[250px] lg:h-[300px] mb-3">
                <img
                  src="https://via.placeholder.com/460x328" // Replace with actual image
                  alt="Example Activity"
                  className="w-full h-full object-cover rounded-md"
                />
              </div>

              {/* Details */}
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  {/* Title */}
                  <h1 className="text-lg font-semibold">Business Name</h1>

                  {/* Rating Section */}
                  <div className="flex items-center text-sm gap-1">
                    <span>4.5</span>
                    <span className="text-yellow-500">★★★★☆</span>
                  </div>
                </div>

                {/* Location & Price */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2">
                  <div className="text-sm text-gray-500 flex items-center">
                    <GiPositionMarker className="mr-1" />
                    Sorsogon
                  </div>
                  <p className="text-md font-semibold">₱300-1000</p>
                </div>
              </div>

              {/* Select Time */}
              <div className="mt-4">
                <label className="font-medium text-gray-700">Select Time:</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="border p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Notes */}
              <div className="mt-4">
                <Textarea label="Notes" placeholder="Enter any notes here..." fullWidth />
              </div>

            
              {/* Product or Services Section */}
              <div className="mt-4 max-h-[250px] overflow-y-auto scrollbar-custom">
                <div className="flex bg-white shadow-md rounded-lg border p-3 flex-col sm:flex-row gap-3">
                  
                  {/* Left: Image */}
                  <div className="w-full sm:w-1/4 min-h-[100px] flex-shrink-0">
                    <img
                      src="https://via.placeholder.com/180"
                      alt="Trip Image"
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>

                  {/* Right: Content */}
                  <div className="w-full sm:w-3/4 flex flex-col justify-between">
                    <h2 className="text-md font-semibold">BarilanSaBulan</h2>
                    <p className="bg-gray-100 p-2 rounded-md text-gray-600 text-xs mt-2">
                      Experience the thrill of precision and focus with our firing range activities.
                    </p>
                    <p className="text-md font-bold mt-2">₱499/head</p>

                    {/* Buttons & Ratings */}
                    <div className="flex justify-between items-center mt-3">
                      {/* Rating */}
                      <div className="flex items-center text-xs gap-1">
                        <span>4.5</span>
                        <span className="text-yellow-500">★★★★☆</span>
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-2">
                        <button className="bg-gray-900 text-white px-3 py-1 text-xs rounded-md hover:bg-gray-700">
                          Inquire
                        </button>
                        <button className="bg-green-500 text-white px-3 py-1 text-xs rounded-md hover:bg-green-600">
                          Book
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 border-t flex flex-col sm:flex-row justify-end gap-2">
              <Button color="primary" className="px-4 py-2 rounded-md" onClick={closeDrawer}>
                Add To Itinerary
              </Button>
              <Button color="primary" className="px-4 py-2 rounded-md" onClick={closeDrawer}>
                Visit Business Page
              </Button>
            </div>
          </div>
        </div>
      )}
      </Modal>
     

      {isDetailsOpen && selectedTrip && (
        <TripDetailsModal
            disableAnimation
            isOpen={isDetailsOpen}
            onClose={clearState}
            trip={selectedTrip}
            onUpdateTrip={updateTripDetails}
            itinerary={itinerary}
        />
      )}
    </div>
  );
};

export default Trip;