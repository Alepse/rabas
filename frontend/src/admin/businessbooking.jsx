import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addChatMessage, markBookingAsCompleted, markBookingAsActive, updateWalkInCustomerStatus, markWalkInAsCompleted, fetchBookings } from '@/redux/bookingSlice';
import {
  Button,
  Badge,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  DatePicker,
  RangeCalendar,
  Select,
  SelectItem
} from '@nextui-org/react';
import Sidebar from '../components/sidebar';
import { PiChatCircleText } from "react-icons/pi";
import { Tabs, Tab } from "@nextui-org/tabs";
import { FaSearch } from 'react-icons/fa';
import ChatModal from './ChatSystem/ChatModal';
import { today, getLocalTimeZone } from '@internationalized/date';
import { MdPeople, MdEmail, MdPhone, MdDateRange, MdHotel, MdRestaurant, MdDirectionsRun, MdCheck, MdDone, MdClose } from 'react-icons/md';
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
    cancelButtonColor: '#D33736',  // Red color for cancellation
  });
};

// Booking card component for displaying individual bookings
const BookingCard = ({ booking, onOpenChatModal, onMarkAsCompleted, onAcceptBooking }) => (
  <div className="p-3 bg-white shadow-md rounded-lg flex flex-col w-full gap-2 transition-shadow duration-300 ease-in-out hover:shadow-2xl">
    <div className='flex justify-between items-center'>
      <h2 className="text-lg font-semibold text-gray-800">{booking.customerName}</h2>
      <div className='flex gap-2 cursor-pointer' onClick={onOpenChatModal}>
        <Badge content="1" color="danger">
          <PiChatCircleText className='text-2xl cursor-pointer hover:text-color2' />
        </Badge>
      </div>
    </div>

    <p className="text-gray-500">
      <strong>Product:</strong> {booking.productName || 'Sample Product'}
    </p>
    <p className="text-gray-500">
      <MdPeople className="inline-block text-lg" /><strong> Guests:</strong> {booking.numberOfGuests || '2'}
    </p>
    <p className="text-gray-500">
      <MdEmail className="inline-block text-lg" /><strong> Email:</strong> {booking.email || 'john.doe@example.com'}
    </p>
    <p className="text-gray-500">
      <MdPhone className="inline-block text-lg" /><strong> Phone:</strong> {booking.phone || '123-456-7890'}
    </p>

    {booking.type === 'Accommodation' && (
      <>
        <p className="text-gray-500">
          <MdDateRange className="inline-block text-lg" /><strong> Check-in:</strong> {booking.checkInDate}
        </p>
        <p className="text-gray-500">
          <MdDateRange className="inline-block text-lg" /><strong> Check-out:</strong> {booking.checkOutDate}
        </p>
      </>
    )}
    {booking.type === 'Table Reservation' && (
      <>
        <p className="text-gray-500">
          <MdDateRange className="inline-block text-lg" /><strong> Reservation Date:</strong> {booking.reservationDate}
        </p>
        <p className="text-gray-500">
          <strong>Reservation Time:</strong> {booking.reservationTime}
        </p>
      </>
    )}
    {booking.type === 'Attraction' && (
      <>
        <p className="text-gray-500">
          <MdDateRange className="inline-block text-lg" /><strong> Activity Date:</strong> {booking.visitDate}
        </p>
        <p className="text-gray-500">
          <strong>Activities:</strong> {booking.activities.join(', ')}
        </p>
      </>
    )}

    <p className="text-gray-500">
      <strong>Special Requests:</strong> {booking.specialRequests || 'None'}
    </p>
    <p className="text-gray-500">
      <strong>Total Amount:</strong> ₱{booking.amount || '0'}
    </p>

    <div className="flex justify-between items-center">
      <Badge color={booking.status === 'Pending' ? 'warning' : booking.status === 'Active' ? 'success' : 'default'}>
        {booking.status}
      </Badge>
      
      {booking.status === 'Pending' ? (
        <Button
          auto
          color="success"
          onClick={() => onAcceptBooking(booking.id)}
          className="px-4"
        >
          <div className="flex items-center gap-2">
            <MdCheck className="text-lg" />
            Accept Booking
          </div>
        </Button>
      ) : booking.status === 'Active' && (
        <Button
          auto
          color="success"
          onClick={() => onMarkAsCompleted(booking.id)}
          className="px-4"
        >
          <div className="flex items-center gap-2">
            <MdDone className="text-lg" />
            Mark as Completed
          </div>
        </Button>
      )}
    </div>
  </div>
);

// Form component
const BookingForm = ({ isOpen, onClose, title, products, onSubmit, type }) => {
  // Product selection states
  const [searchValue, setSearchValue] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form field states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [guests, setGuests] = useState('');
  const [amount, setAmount] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  
  // Date/Time states
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [reservationDate, setReservationDate] = useState('');
  const [reservationTime, setReservationTime] = useState('');
  const [activityDate, setActivityDate] = useState('');
  const [startingTime, setStartingTime] = useState('');

  // Reset function
  const handleClose = () => {
    // Reset product selection
    setSearchValue('');
    setSelectedProduct(null);
    setShowSuggestions(false);

    // Reset form fields
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setGuests('');
    setAmount('');
    setSpecialRequests('');

    // Reset dates/times
    setCheckInDate(null);
    setCheckOutDate(null);
    setCheckInTime('');
    setCheckOutTime('');
    setReservationDate('');
    setReservationTime('');
    setActivityDate('');
    setStartingTime('');

    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedProduct) {
      showErrorAlert('Please select a product');
      return;
    }

    try {
      setIsLoading(true);

      const formData = {
        businessId: selectedProduct.business_id,
        user_id: 0,// use random user id
        productId: selectedProduct.product_id,
        firstName,
        lastName,
        email,
        phone,
        numberOfGuests: parseInt(guests),
        specialRequests,
        amount: parseFloat(amount),
        status: 'Active', // For walk-in bookings
        type: selectedProduct.type, // Add type from selected product
        productName: selectedProduct.name // Add product name
      };

      // Add date/time fields based on booking type
      if (type === 'Accommodation') {
        // Log the dates to debug
        console.log('Check-in date:', checkInDate);
        console.log('Check-out date:', checkOutDate);
        console.log('Check-in time:', checkInTime);
        console.log('Check-out time:', checkOutTime);

        if (!checkInDate || !checkOutDate || !checkInTime || !checkOutTime) {
          showErrorAlert('Please select both dates and times');
          return;
        }

        formData.checkInOutDates = {
          start: {
            year: checkInDate.year,
            month: checkInDate.month,
            day: checkInDate.day,
            time: checkInTime
          },
          end: {
            year: checkOutDate.year,
            month: checkOutDate.month,
            day: checkOutDate.day,
            time: checkOutTime
          }
        };
      } else if (type === 'Table Reservation') {
        if (!reservationDate) {
          showErrorAlert('Please select a reservation date');
          return;
        }

        formData.reservationDate = {
          year: new Date(reservationDate).getFullYear(),
          month: new Date(reservationDate).getMonth() + 1,
          day: new Date(reservationDate).getDate()
        };
        formData.reservationTime = reservationTime;
      } else if (type === 'Activity') {
        if (!activityDate) {
          showErrorAlert('Please select an activity date');
          return;
        }

        formData.visitDate = {
          year: new Date(activityDate).getFullYear(),
          month: new Date(activityDate).getMonth() + 1,
          day: new Date(activityDate).getDate()
        };
        formData.activityTime = startingTime;
      }

      let endpoint = '';
      switch (type) {
        case 'Accommodation':
          endpoint = '/book-accommodation';
          break;
        case 'Table Reservation':
          endpoint = '/book-table';
          break;
        case 'Activity':
          endpoint = '/book-activity';
          break;
        default:
          throw new Error('Invalid booking type');
      }

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        showSuccessAlert('Booking created successfully!');
        handleClose(); // Close and reset form
      } else {
        throw new Error(data.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      showErrorAlert(error.message || 'Failed to create booking');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      size='3xl'
      scrollBehavior="inside"
    >
      <ModalContent className='max-h-[90vh]'>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody className="space-y-4">
          <div className="relative">
            <Input
              label={`Select ${title}`}
              placeholder="Type to search..."
              required
              className="w-full"
              startContent={<FaSearch className="text-default-400 text-sm" />}
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => {
                setTimeout(() => setShowSuggestions(false), 200);
              }}
            />
            
            {/* Dropdown Suggestions */}
            {showSuggestions && (
              <div 
                className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-auto"
                style={{ backgroundColor: 'white' }}
              >
                {products
                  .filter(product =>
                    searchValue === '' ? true :
                    (product.name.toLowerCase().includes(searchValue.toLowerCase()) || product.type.toLowerCase().includes(searchValue.toLowerCase()))
                  )
                  .map((product) => (
                    <div
                      key={product.product_id}
                      className="p-2 hover:bg-gray-100 cursor-pointer bg-white"
                      onClick={() => {
                        setSearchValue(product.name);
                        setSelectedProduct(product);
                        setShowSuggestions(false);
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-gray-900">{product.name}</span>
                        {product.description && (
                          <span className="text-xs text-gray-600">
                            {product.description}
                          </span>
                        )}
                        {product.price && (
                          <span className="text-xs text-gray-600">
                            ₱{product.price}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                
                {/* No results message */}
                {products.filter(product =>
                  searchValue === '' ? true :
                  (product.name.toLowerCase().includes(searchValue.toLowerCase()) || product.type.toLowerCase().includes(searchValue.toLowerCase()))
                ).length === 0 && (
                  <div className="p-4 text-center text-gray-500 bg-white">
                    No matches found for "{searchValue}"
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="First Name" 
              fullWidth 
              required 
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input 
              label="Last Name" 
              fullWidth 
              required 
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <Input 
            label="Email" 
            type="email" 
            fullWidth 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input 
            label="Phone" 
            type="tel" 
            fullWidth 
            required 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          
          {type === 'Accommodation' && (
            <>
              <h1 className='text-center'>Choose Check-in and Check-out Date</h1>
              <div className='flex justify-center'>
                <RangeCalendar 
                  aria-label="Select Dates" 
                  visibleMonths={1}
                  required
                  onChange={dates => {
                    setCheckInDate(dates.start);
                    setCheckOutDate(dates.end);
                  }}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  type="time" 
                  label="Check-in Time" 
                  required 
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                />
                <Input 
                  type="time" 
                  label="Check-out Time" 
                  required 
                  value={checkOutTime}
                  onChange={(e) => setCheckOutTime(e.target.value)}
                />
              </div>
            </>
          )}
          
          {type === 'Table Reservation' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                type="date" 
                label="Reservation Date" 
                required 
                value={reservationDate}
                onChange={(e) => setReservationDate(e.target.value)}
              />
              <Input 
                type="time" 
                label="Reservation Time" 
                required 
                value={reservationTime}
                onChange={(e) => setReservationTime(e.target.value)}
              />
            </div>
          )}
          
          {type === 'Activity' && (
            <>
              <Input 
                type="date" 
                label="Activity Date" 
                required 
                value={activityDate}
                onChange={(e) => setActivityDate(e.target.value)}
              />
              <Input 
                type="time" 
                label="Starting Time" 
                required 
                value={startingTime}
                onChange={(e) => setStartingTime(e.target.value)}
              />
            </>
          )}
          
          <Input 
            label="Number of Guests" 
            type="number" 
            fullWidth 
            min={1} 
            required 
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
          />
          <Input 
            label="Special Requests" 
            fullWidth 
            multiline 
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
          />
          <Input 
            label="Total Amount" 
            type="number" 
            fullWidth 
            min={0} 
            required 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </ModalBody>
        <ModalFooter className="flex justify-end space-x-4">
          <Button 
            auto 
            flat 
            color="danger" 
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            auto 
            color="success" 
            onClick={handleSubmit}
            isLoading={isLoading}
          >
            Submit
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// Main business booking component
const BusinessBooking = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
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
  
  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);

  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  // log the state 
  console.log('State:', useSelector(state => state));
  const pendingBookings = useSelector(state => state.bookings.pendingBookings);
  const activeBookings = useSelector(state => state.bookings.activeBookings);
  const bookingHistory = useSelector(state => state.bookings.bookingHistory);
  const chatMessages = useSelector(state => state.bookings.chatMessages);
  const walkInCustomers = useSelector(state => state.bookings.walkInCustomers);
  const [isChatModalVisible, setChatModalVisible] = useState(false);
  const [currentBookingDetails, setCurrentBookingDetails] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAccommodationFormOpen, setAccommodationFormOpen] = useState(false);
  const [isTableReservationFormOpen, setTableReservationFormOpen] = useState(false);
  const [isAttractionActivitiesFormOpen, setAttractionActivitiesFormOpen] = useState(false);
  const [accommodationSearchQuery, setAccommodationSearchQuery] = useState('');
  const [tableReservationSearchQuery, setTableReservationSearchQuery] = useState('');
  const [activitySearchQuery, setActivitySearchQuery] = useState('');
  const [walkInSearchQuery, setWalkInSearchQuery] = useState('');
  const [walkInBookings, setWalkInBookings] = useState([]);
  const [walkInHistory, setWalkInHistory] = useState([]);
  const [walkInAccommodationSearchQuery, setWalkInAccommodationSearchQuery] = useState('');
  const [walkInTableReservationSearchQuery, setWalkInTableReservationSearchQuery] = useState('');
  const [walkInActivitiesSearchQuery, setWalkInActivitiesSearchQuery] = useState('');

  // Title Tab
  useEffect(() => {
    document.title = 'BusinessName | Admin booking';
  });
    
  // log the fetchBookings
  useEffect(() => {
    // console.log('Fetching bookings...');
    dispatch(fetchBookings());
  }, [dispatch]);

  const openChatModal = (booking) => {
    setCurrentBookingDetails(booking);
    setChatModalVisible(true);
  };

  const closeChatModal = () => setChatModalVisible(false);

  const handleSendMessage = (message) => {
    if (message.trim()) {
      dispatch(addChatMessage({ sender: 'Customer', message }));
    }
  };

  const filteredBookingsByType = (bookings, type, query) => 
    bookings.filter(b => 
      b.type === type && 
      (b.customerName.toLowerCase().includes(query.toLowerCase()) || 
       b.type.toLowerCase().includes(query.toLowerCase()))
    );

  const handleSubmit = (formType) => {
    // Example validation logic
    const isValid = true; // Replace with actual validation logic
    if (!isValid) {
      showErrorAlert('Please fill in all required fields!');
      return;
    }
    // Submit logic here
    if (formType === 'Accommodation') setAccommodationFormOpen(false);
    if (formType === 'Table Reservation') setTableReservationFormOpen(false);
    if (formType === 'Activity') setAttractionActivitiesFormOpen(false);
    showSuccessAlert(`${formType} booking submitted successfully!`);
  };

  const markAsCompleted = (bookingId) => {
    console.log('Attempting to mark booking as completed:', bookingId);
    const bookingExists = activeBookings.some(b => b.id === bookingId);
    if (!bookingExists) {
      console.error('Booking ID not found in active bookings:', bookingId);
      return;
    }

    try {
      dispatch(markBookingAsCompleted(bookingId));
      showSuccessAlert('Booking marked as completed!');
    } catch (error) {
      showErrorAlert(error.message || 'An error occurred while completing the booking.');
    }
  };

  const filteredWalkInCustomers = walkInCustomers.filter(customer =>
    customer.name.toLowerCase().includes(walkInSearchQuery.toLowerCase()) ||
    customer.details.toLowerCase().includes(walkInSearchQuery.toLowerCase())
  );

  const addWalkInBooking = (booking) => {
    setWalkInBookings([...walkInBookings, booking]);
  };

  const markWalkInAsCompleted = (bookingId) => {
    const completedBooking = walkInBookings.find(b => b.id === bookingId);
    setWalkInBookings(walkInBookings.filter(b => b.id !== bookingId));
    setWalkInHistory([...walkInHistory, completedBooking]);
  };

  const handleAcceptBooking = async (bookingId) => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/update-booking-status/${bookingId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 1 }) // Set status to 'Active'
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to accept booking');
      }

      dispatch(markBookingAsActive(bookingId));
      showSuccessAlert('Booking accepted successfully!');
    } catch (error) {
      console.error('Error accepting booking:', error);
      showErrorAlert(error.message || 'Failed to accept booking');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsCompleted = async (bookingId) => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/update-booking-status/${bookingId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 2 }) // Set status to 'Completed'
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to mark booking as completed');
      }

      dispatch(markBookingAsCompleted(bookingId));
      showSuccessAlert('Booking marked as completed!');
    } catch (error) {
      console.error('Error marking booking as completed:', error);
      showErrorAlert(error.message || 'Failed to mark booking as completed');
    } finally {
      setIsLoading(false);
    }
  };

  // Add state for real data
  const [accommodations, setAccommodations] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [activities, setActivities] = useState([]);

  // Add useEffect to fetch real data
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/getAllBusinessProduct');
        const data = await response.json();
        
        if (data.success) {
          const products = data.businessProducts;
          // Log to see available categories
          console.log('Available product categories:', [...new Set(products.map(p => p.product_category))]);
          
          setAccommodations(products.filter(p => p.product_category === 'accommodation'));
          setRestaurants(products.filter(p => p.product_category === 'restaurant'));
          setActivities(products.filter(p => p.product_category === 'activity'));
        } else {
          console.error('Failed to fetch products:', data.message);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 relative">
      <Sidebar />

      <div className="flex-1 p-6 md:p-8 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Bookings and Reservations</h1>
        </div>

        <div className="overflow-x-auto scrollbar-custom">
          <Tabs keepMounted variant="solid" className="sticky top-0 z-10 bg-gray-50 flex flex-wrap">
            <Tab title="Pending Bookings" className="flex-1 min-w-[150px]">
              <BookingSection
                title="New Bookings"
                bookings={pendingBookings}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                openChatModal={openChatModal}
                filteredBookingsByType={filteredBookingsByType}
                onAcceptBooking={handleAcceptBooking}
              />
            </Tab>

            <Tab title="Active Bookings" className="flex-1 min-w-[150px]">
              <BookingSection
                title="Current Bookings"
                bookings={activeBookings}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                openChatModal={openChatModal}
                onMarkAsCompleted={handleMarkAsCompleted}
                filteredBookingsByType={filteredBookingsByType}
              />
            </Tab>

            <Tab title="Booking History" className="flex-1 min-w-[150px]">
              <BookingSection
                title="Completed Bookings"
                bookings={bookingHistory}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                openChatModal={openChatModal}
                filteredBookingsByType={filteredBookingsByType}
              />
              <WalkInHistorySection
                title="Walk-In Accommodation History"
                history={walkInHistory}
                type="Accommodation"
                searchQuery={walkInSearchQuery}
              />
              <WalkInHistorySection
                title="Walk-In Table Reservation History"
                history={walkInHistory}
                type="Table Reservation"
                searchQuery={walkInSearchQuery}
              />
              <WalkInHistorySection
                title="Walk-In Attraction History"
                history={walkInHistory}
                type="Attraction"
                searchQuery={walkInSearchQuery}
              />
            </Tab>

            <Tab title="Walk In Customers" className="flex-1 min-w-[150px]">
              <WalkInCustomersSection
                walkInCustomers={filteredWalkInCustomers}
                walkInSearchQuery={walkInSearchQuery}
                setWalkInSearchQuery={setWalkInSearchQuery}
                setAccommodationFormOpen={setAccommodationFormOpen}
                setTableReservationFormOpen={setTableReservationFormOpen}
                setAttractionActivitiesFormOpen={setAttractionActivitiesFormOpen}
              />
            </Tab>
          </Tabs>
        </div>

        {/* Floating chat button */}
        <button
          className="fixed bottom-4 right-4 bg-color1 text-white p-4 rounded-full shadow-lg hover:bg-color2 focus:outline-none z-50"
          onClick={() => setChatModalVisible(true)}
        >
          <PiChatCircleText size={24} />
        </button>

        <ChatModal
          isOpen={isChatModalVisible}
          onClose={closeChatModal}
          chatMessages={chatMessages}
          handleSendMessage={handleSendMessage}
          currentBookingDetails={currentBookingDetails}
        />

        {/* Booking Forms */}
        <BookingForm
          isOpen={isAccommodationFormOpen}
          onClose={() => setAccommodationFormOpen(false)}
          title="Accommodation"
          products={accommodations}
          onSubmit={() => handleSubmit('Accommodation')}
          type="Accommodation"
        />
        <BookingForm
          isOpen={isTableReservationFormOpen}
          onClose={() => setTableReservationFormOpen(false)}
          title="Table Reservation"
          products={restaurants}
          onSubmit={() => handleSubmit('Table Reservation')}
          type="Table Reservation"
        />
        <BookingForm
          isOpen={isAttractionActivitiesFormOpen}
          onClose={() => setAttractionActivitiesFormOpen(false)}
          title="Activity"
          products={activities}
          onSubmit={() => handleSubmit('Activity')}
          type="Activity"
        />
      </div>
    </div>
  );
};

// Booking section component
const BookingSection = ({ title, bookings, openChatModal, onMarkAsCompleted, onAcceptBooking }) => {
  // Create separate search states for each type
  const [accommodationSearch, setAccommodationSearch] = useState('');
  const [tableSearch, setTableSearch] = useState('');
  const [attractionSearch, setAttractionSearch] = useState('');

  // Map of type to its search state and setter
  const searchStates = {
    'Accommodation': {
      value: accommodationSearch,
      setter: setAccommodationSearch
    },
    'Table Reservation': {
      value: tableSearch,
      setter: setTableSearch
    },
    'Attraction': {
      value: attractionSearch,
      setter: setAttractionSearch
    }
  };

  return (
    <div>
      <div className="text-xl font-bold mb-4 text-gray-700">{title}</div>
      <div className="p-4 grid lg:grid-cols-2 xl:grid-cols-3 md:grid-cols-1 mt-3 gap-4">
        {['Accommodation', 'Table Reservation', 'Attraction'].map((type) => (
          <BookingTypeSection
            key={type}
            type={type}
            bookings={bookings}
            searchQuery={searchStates[type].value}
            setSearchQuery={searchStates[type].setter}
            openChatModal={openChatModal}
            onMarkAsCompleted={onMarkAsCompleted}
            onAcceptBooking={onAcceptBooking}
          />
        ))}
      </div>
    </div>
  );
};

// Booking type section component
const BookingTypeSection = ({ type, bookings, searchQuery, setSearchQuery, openChatModal, onMarkAsCompleted, onAcceptBooking }) => {
  // console.log(`${type} Section - Received bookings:`, bookings);

  // Map API types to display types
  const typeMapping = {
    'Accommodation': ['Cabins'],
    'Table Reservation': ['Buffet', 'Resorts'],
    'Attraction': ['Hiking', 'Water Sports']
  };

  const filteredBookings = bookings.filter(booking => {
    // console.log('Checking booking:', booking.type, 'against type:', type);
    // Check if the booking type is in the allowed types for this section
    const allowedTypes = typeMapping[type] || [];
    const typeMatch = allowedTypes.includes(booking.type);
    const searchMatch = !searchQuery || 
      booking.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // console.log('Type match:', typeMatch, 'Search match:', searchMatch);
    return typeMatch && searchMatch;
  });

  // console.log(`${type} Section - Filtered bookings:`, filteredBookings);

  const iconMap = {
    'Accommodation': <MdHotel className="text-xl text-color1" />,
    'Table Reservation': <MdRestaurant className="text-xl text-color1" />,
    'Attraction': <MdDirectionsRun className="text-xl text-color1" />
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        {iconMap[type]} {type}
      </h3>
      <div className="relative mt-2 mb-4">
        <Input
          clearable
          placeholder={`Search ${type.toLowerCase()}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          width="100%"
          className="pl-10"
        />
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
      <div className="bg-white max-h-[600px] w-full flex flex-col gap-3 overflow-y-auto rounded-lg p-4 shadow-inner">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onOpenChatModal={() => openChatModal(booking)}
              onMarkAsCompleted={() => onMarkAsCompleted(booking.id)}
              onAcceptBooking={() => onAcceptBooking(booking.id)}
            />
          ))
        ) : (
          <div className="p-4 text-gray-500">
            {searchQuery 
              ? `No ${type.toLowerCase()} bookings found matching "${searchQuery}"`
              : `No ${type.toLowerCase()} bookings available`
            }
          </div>
        )}
      </div>
    </div>
  );
};

// Walk-in customers section component
const WalkInCustomersSection = ({
  walkInCustomers,
  walkInSearchQuery,
  setWalkInSearchQuery,
  setAccommodationFormOpen,
  setTableReservationFormOpen,
  setAttractionActivitiesFormOpen
}) => (
  <div className="w-full space-y-4">
    <div className="text-xl font-bold mb-4 text-gray-700">Walk In Customers</div>

    {/* Form Buttons */}
    <div className="flex flex-wrap gap-4 mb-4 items-center font-medium text-color2">
      <h1>Select Forms for Walk In Customers:</h1>
      <Button color="primary" onClick={() => setAccommodationFormOpen(true)}>
        Book Accommodation <span className="ml-2">📝</span>
      </Button>
      <Button color="primary" onClick={() => setTableReservationFormOpen(true)}>
        Reserve Table <span className="ml-2">📝</span>
      </Button>
      <Button color="primary" onClick={() => setAttractionActivitiesFormOpen(true)}>
        Book Activity <span className="ml-2">📝</span>
      </Button>
    </div>

    {/* Search Bar */}
    <Input
      clearable
      placeholder="Search walk-in customers..."
      value={walkInSearchQuery}
      onChange={(e) => setWalkInSearchQuery(e.target.value)}
      width="100%"
      className="mb-4"
    />

    {['Accommodation', 'Table Reservation', 'Attraction'].map((type) => (
      <WalkInTypeSection
        key={type}
        type={type}
        customers={walkInCustomers}
        searchQuery={walkInSearchQuery}
      />
    ))}
  </div>
);

// Walk-in type section component
const WalkInTypeSection = ({ type, customers, searchQuery }) => {
  const dispatch = useDispatch();
  const iconMap = {
    'Accommodation': <MdHotel className="text-xl text-color1" />,
    'Table Reservation': <MdRestaurant className="text-xl text-color1" />,
    'Attraction': <MdDirectionsRun className="text-xl text-color1" />
  };

  const sampleData = {
    'Accommodation': [
      {
        id: 'sample1',
        customerName: 'Sample John',
        email: 'john.doe@example.com',
        phone: '123-456-7890',
        details: 'Sample Luxury Cabin, 2 guests, Check-in: 2023-12-01, Check-out: 2023-12-05',
        specialRequests: 'None',
        amount: '5000',
        paymentMethod: 'Credit Card',
        additionalNotes: 'N/A'
      }
    ],
    'Table Reservation': [
      {
        id: 'sample2',
        customerName: 'Sample Jane',
        email: 'jane.doe@example.com',
        phone: '098-765-4321',
        details: 'Sample Dining, Reservation Date: 2023-12-10, Time: 19:00',
        specialRequests: 'Window seat',
        amount: '2000',
        paymentMethod: 'Cash',
        additionalNotes: 'N/A'
      }
    ],
    'Attraction': [
      {
        id: 'sample3',
        customerName: 'Sample Alice',
        email: 'alice@example.com',
        phone: '555-555-5555',
        details: 'Sample Hiking Adventure, Activity Date: 2023-12-15',
        specialRequests: 'Vegetarian meal',
        amount: '1500',
        paymentMethod: 'Debit Card',
        additionalNotes: 'N/A'
      }
    ]
  };

  const filteredCustomers = customers.filter(customer => 
    customer.type === type && 
    (customer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     customer.details.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleMarkAsComplete = (customerId) => {
    dispatch(markWalkInAsCompleted(customerId));
    Swal.fire({
      title: 'Booking Completed',
      text: 'Customer booking marked as complete',
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#0BDA51', // Green color for confirmation
      cancelButtonColor: '#D33736',  // Red color for cancellation
    });
  };

  const hasBookings = filteredCustomers.length > 0 || sampleData[type].length > 0;

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
        {iconMap[type]} {type}
      </h3>
      <div className="bg-white max-h-[600px] flex flex-col gap-4 overflow-y-auto rounded-lg p-4 shadow-inner">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="p-4 bg-white rounded-lg shadow-md border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">{customer.customerName}</h2>
            <p className="text-gray-600"><strong>Email:</strong> {customer.email || 'Not provided'}</p>
            <p className="text-gray-600"><strong>Phone:</strong> {customer.phone || 'Not provided'}</p>
            <p className="text-gray-600"><strong>Details:</strong> {customer.details}</p>
            <p className="text-gray-600"><strong>Special Requests:</strong> {customer.specialRequests || 'None'}</p>
            <p className="text-gray-600"><strong>Total Amount:</strong> ₱{customer.amount || '0'}</p>
            <p className="text-gray-600"><strong>Payment Method:</strong> {customer.paymentMethod || 'Not specified'}</p>
            <p className="text-gray-600"><strong>Additional Notes:</strong> {customer.additionalNotes || 'None'}</p>
            <div className="flex justify-end items-center mt-4">
              <Button auto color="success" onClick={() => handleMarkAsComplete(customer.id)}>
                Mark as Complete
              </Button>
            </div>
          </div>
        ))}

        {filteredCustomers.length === 0 && sampleData[type].map((sample) => (
          <div key={sample.id} className="p-4 bg-white rounded-lg shadow-md border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">{sample.customerName}</h2>
            <p className="text-gray-600"><strong>Email:</strong> {sample.email}</p>
            <p className="text-gray-600"><strong>Phone:</strong> {sample.phone}</p>
            <p className="text-gray-600"><strong>Details:</strong> {sample.details}</p>
            <p className="text-gray-600"><strong>Special Requests:</strong> {sample.specialRequests}</p>
            <p className="text-gray-600"><strong>Total Amount:</strong> ₱{sample.amount}</p>
            <p className="text-gray-600"><strong>Payment Method:</strong> {sample.paymentMethod}</p>
            <p className="text-gray-600"><strong>Additional Notes:</strong> {sample.additionalNotes}</p>
            <div className="flex justify-end items-center mt-4">
              <Button auto color="success" onClick={() => handleMarkAsComplete(sample.id)}>
                Mark as Complete
              </Button>
            </div>
          </div>
        ))}

        {!hasBookings && (
          <div className="p-4 text-gray-500">No walk-in {type.toLowerCase()} bookings available</div>
        )}
      </div>
    </div>
  );
};

// New component for walk-in history sections
const WalkInHistorySection = ({ title, history, type, searchQuery }) => (
  <div className="bg-gray-100 p-4 rounded-lg shadow-lg mt-4">
    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    <div className="bg-white max-h-[600px] flex flex-col gap-3 overflow-y-auto rounded-lg p-4 shadow-inner">
      {history.filter(booking => booking.type === type && 
        (booking.firstName.toLowerCase().includes(searchQuery.toLowerCase()) || 
         booking.lastName.toLowerCase().includes(searchQuery.toLowerCase()))).length > 0 ? (
        history.filter(booking => booking.type === type && 
          (booking.firstName.toLowerCase().includes(searchQuery.toLowerCase()) || 
           booking.lastName.toLowerCase().includes(searchQuery.toLowerCase()))).map((booking) => (
          <div key={booking.id} className="p-4 bg-gray-200 rounded-lg">
            <h2 className="text-lg font-semibold">{booking.firstName} {booking.lastName}</h2>
            <p>Details: {booking.productTitle}</p>
          </div>
        ))
      ) : (
        <div className="p-4 text-gray-500">No walk-in {type.toLowerCase()} history available</div>
      )}
    </div>
  </div>
);

export default BusinessBooking;
