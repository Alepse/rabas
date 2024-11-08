import React, { useState, useEffect } from 'react';
import Nav from '@/components/nav';
import Search from '@/components/Search';
import Footer from '@/components/Footer';
import { FaPlus } from 'react-icons/fa';
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

const MotionBox = motion.div;

const Trip = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(10);
  const totalSteps = 5;
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [tripName, setTripName] = useState('');
  const [loading, setLoading] = useState(true);
  const [showButton, setShowButton] = useState(false); // State to show/hide button
  const [trips, setTrips] = useState([
    {
      tripName: "Sample Trip to Sorsogon",
      currentLocation: "Bulusan",
      destination: "Sorsogon City",
      startDate: "2023-10-15",
      endDate: "2023-10-22",
      itinerary: {
        "Tuesday, Oct 15": [
          { title: "Visit Bulusan Lake", time: "09:00", isBooked: true, notes: "Bring a camera" },
          { title: "Lunch at Local Restaurant", time: "12:00", isBooked: false, notes: "Try the local delicacies" }
        ],
        "Wednesday, Oct 16": [
          { title: "Explore Sorsogon City", time: "10:00", isBooked: true, notes: "Visit the museum" }
        ]
      }
    }
  ]); // State to store submitted trips

    // Title Tab
  useEffect(() => {
    document.title = 'RabaSorsogon | Trip';
  });

  const [selectedLocations, setSelectedLocations] = useState({
    "Tuesday, Oct 15": 'Set Location',
    "Wednesday, Oct 16": 'Set Location'
  });


  let [value, setValue] = useState({
    start: today(getLocalTimeZone()),
    end: today(getLocalTimeZone()).add({ weeks: 1 }),
  });
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);

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
    const newTrip = {
      tripName,
      currentLocation: selectedLocations["Tuesday, Oct 15"], // Use selected location
      destination: selectedLocations["Wednesday, Oct 16"], // Use selected location
      startDate: value.start.toString(),
      endDate: value.end.toString(),
    };
    setTrips([...trips, newTrip]); // Add the new trip to the list
    onClose();
  };

  const deleteTrip = (index) => {
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
        setTrips(trips.filter((_, i) => i !== index));
        Swal.fire({
          title: 'Deleted!',
          text: 'Your trip has been deleted.',
          icon: 'success',
          confirmButtonColor: '#0BDA51' // Updated success alert confirm button color
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
    setSelectedTrip({
      ...trip,
      itinerary: trip.itinerary || {} // Ensure itinerary is an object
    });
    setIsDetailsOpen(true);
  };

  const updateTripDetails = (updatedTrip) => {
    setTrips((prevTrips) =>
      prevTrips.map((trip) =>
        trip.tripName === selectedTrip.tripName ? { ...trip, ...updatedTrip } : trip
      )
    );
    setSelectedTrip(updatedTrip); // Update the selected trip to reflect changes in the modal
  };

  return (
    <div className="mx-auto bg-gray-100 min-h-screen font-sans flex flex-col">
      <Nav />
      <div className="mt-[7rem] flex justify-center w-full px-4">
        <Search />
      </div>

      <div className="container mx-auto flex justify-center bg-color1 p-4 mb-4 items-center shadow-lg md:rounded-xl shadow-color1 m-4">
        <h1 className="text-white text-center font-semibold text-2xl md:text-4xl hover:tracking-wider duration-500">
          Plan Your Trip In Sorsogon
        </h1>
      </div>

      <div className="container mx-auto p-4 md:p-9 bg-white max-h-screen mb-2 border rounded-lg shadow-md">
        <div className='flex justify-between items-center mb-2'>
          <h1 className='text-2xl md:text-4xl font-semibold mb-4'>My Trips</h1>
          <Button onClick={onOpen} className='bg-light hover:border-color2 text-black border-2 border-color1 text-lg md:text-xl flex gap-3 text-center'>
            <FaPlus className='text-xl md:text-2xl'/>
            Plan a Trip
          </Button>
        </div>
        <div className='border p-4'>
          {trips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trips.map((trip, index) => (
                <div key={index} className="flex flex-col md:flex-row border rounded-lg shadow-md overflow-hidden">
                  <img src="https://via.placeholder.com/150" alt="Trip" className="w-full md:w-1/3 object-cover" />
                  <div className="p-4 flex flex-col justify-between w-full md:w-2/3">
                    <div>
                      <h2 className="text-xl font-semibold">{trip.tripName}</h2>
                      <p className="text-gray-600">{trip.startDate} - {trip.endDate}</p>
                      <p className="text-gray-600">From: {trip.currentLocation}</p>
                      <p className="text-gray-600">To: {trip.destination}</p>
                    </div>
                    <div className="flex justify-between mt-4">
                      <Button onClick={() => openDetailsModal(trip)} className="bg-primary text-white rounded-lg py-2 px-4">
                        View Details
                      </Button>
                      <Button onClick={() => deleteTrip(index)} className="bg-red-500 text-white rounded-lg py-2 px-4">
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

      <Modal hideCloseButton isOpen={isOpen} onClose={() => {}} className="rounded-lg shadow-lg mx-auto p-3 max-h-screen max-w-[1200px]">
        <ModalContent className="rounded-lg overflow-y-auto scrollbar-custom">
          <ModalHeader className="bg-primary text-white p-4 rounded-t-lg">
            <h2 className="text-2xl font-bold">Let's create your trip in Sorsogon</h2>
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
                  <h2 className="text-2xl font-semibold text-primary">Current Location</h2>
                  <p className="text-gray-600 mt-2">Click on the map to set your current location.</p>
                  <MapFeature
                    currentLocation={currentLocation}
                    setCurrentLocation={setCurrentLocation}
                    destination={destination}
                    setDestination={setDestination}
                  />
                </>
              )}
              {step === 3 && (
                <>
                  <h1 className="text-2xl font-semibold text-primary mb-4">How Many Days Is Your Trip?</h1>
                  <h1 className='text-center text-lg font-medium mb-2'>Choose Your Trip Dates</h1>
                  
                  <div className='flex justify-center' >
                  <RangeCalendar 
                  visibleMonths={2} 
                    aria-label="Date (Controlled)" 
                    value={value} 
                    onChange={setValue}
                  />
                  </div>
                </>
              )}
              {step === 4 && (
                <>
                <h1 className="text-2xl font-semibold text-primary mb-4">Plan Your Trip</h1>
                <h1 className='text-center text-lg font-medium mb-2'>Set Up Your Itinerary for Each Date</h1>
                <Planner
                  selectedLocations={selectedLocations}
                  setSelectedLocations={setSelectedLocations}
                />
                </>
              )}
              {step === 5 && (
                <>
                  <h2 className="text-xl font-semibold text-primary">Review & Submit</h2>
                  <p className="text-gray-600 mt-2">Review your answers and submit:</p>
                  <Accordion selectionMode="multiple" className="mt-4">
                    <AccordionItem title="Trip Details">
                      <div className="p-4">
                        <h3 className="font-semibold">Trip Name:</h3>
                        <p>{tripName}</p>
                        <h3 className="font-semibold mt-2">Trip Dates:</h3>
                        <p>Start: {value.start.toString()}</p>
                        <p>End: {value.end.toString()}</p>
                      </div>
                    </AccordionItem>
                    <AccordionItem title="Locations">
                      <div className="p-4">
                        <h3 className="font-semibold">Locations Navigation</h3>

         
                        <MapFeature
                          currentLocation={currentLocation}
                          destination={destination}
                          setCurrentLocation={setCurrentLocation}
                          setDestination={setDestination}
                        />
                      </div>
                    </AccordionItem>
                    <AccordionItem title="Itinerary">
                      <div className='p-4'>
                        <Planner />
                      </div>
                    </AccordionItem>
                  </Accordion>
                </>
              )}
            </MotionBox>
          </ModalBody>
          <ModalFooter className="bg-gray-100 p-4 z-50 sticky bottom-[-10px] rounded-b-lg">
            <div className='flex justify-between w-full'>
              <div className='flex gap-3'>
                {step > 1 && (
                  <Button onClick={prevStep} className="bg-gray-300 hover:bg-gray-400 text-black rounded-lg py-2 px-4 transition-all">
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
              <Button onClick={onClose} className="bg-red-500 hover:bg-red-600 text-white rounded-lg py-2 px-4 transition-all">
                Close
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <TripDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        trip={selectedTrip}
        onUpdateTrip={updateTripDetails}
      />
    </div>
  );
};

export default Trip;