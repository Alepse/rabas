import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addChatMessage, markBookingAsCompleted, markBookingAsActive, updateWalkInCustomerStatus, addWalkInCustomer, markWalkInAsCompleted, fetchBookings } from '@/redux/bookingSlice';
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
import axios from 'axios';
import { Skeleton } from "@nextui-org/skeleton";

// Use the environment variable for the base URL
const BASE_URL = import.meta.env.VITE_BASE_URL; 

// Add the formatDate helper function at the top of your file
const formatDate = (date) => {
  if (!date) return '';
  if (typeof date === 'object' && date.year && date.month && date.day) {
    return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
  }
  return date.toString();
};

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
const BookingCard = ({ booking, onOpenChatModal, onMarkAsCompleted, onAcceptBooking, refreshBookings }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleShowPaymentModal = () => {
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async (bookingId) => {
    if (bookingId) {
      try {
        const status = 1;
        const response = await fetch(`${BASE_URL}/update-payment-status/${bookingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        });
    
        const data = await response.json();
    
        if (response.ok) {
          // Show success message
          showSuccessAlert(data.message || 'Payment status updated successfully.');
          handleClosePaymentModal();
        } else {
          // Handle error response
          showErrorAlert(data.message || 'Failed to update payment status.');
          handleClosePaymentModal();
        }
      } catch (error) {
        console.error('Error confirming payment:', error);
        showErrorAlert('An error occurred while confirming payment. Please try again later.');
        handleClosePaymentModal();
      }
    }
    refreshBookings();
  };
  

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
  };

  return (
    <div className="p-3 bg-white shadow-md rounded-lg flex flex-col w-full gap-2 transition-shadow duration-300 ease-in-out hover:shadow-2xl">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">{booking.customerName}</h2>
        <div className="flex gap-2 cursor-pointer" onClick={onOpenChatModal}>
          <Badge content="1" color="danger">
            <PiChatCircleText className="text-2xl cursor-pointer hover:text-color2" />
          </Badge>
        </div>
      </div>

      <p className="text-gray-500">
        <strong>Booking ID:</strong> {booking.booked_id}
      </p>
      <p className="text-gray-500">
        <strong>Product:</strong> {booking.productName || 'Product Name not Found'}
      </p>
      <p className="text-gray-500">
        <MdPeople className="inline-block text-lg" />
        <strong> Guests:</strong> {booking.numberOfGuests || '2'}
      </p>
      <p className="text-gray-500">
        <MdEmail className="inline-block text-lg" />
        <strong> Email:</strong> {booking.email || 'john.doe@example.com'}
      </p>
      <p className="text-gray-500">
        <MdPhone className="inline-block text-lg" />
        <strong> Phone:</strong> {booking.phone || '123-456-7890'}
      </p>

      {booking.type === 'Accommodation' && (
        <>
          <p className="text-gray-500">
            <MdDateRange className="inline-block text-lg" />
            <strong> Check-in:</strong> {booking.checkInDate}
          </p>
          <p className="text-gray-500">
            <MdDateRange className="inline-block text-lg" />
            <strong> Check-out:</strong> {booking.checkOutDate}
          </p>
        </>
      )}
      {booking.type === 'Table Reservation' && (
        <>
          <p className="text-gray-500">
            <MdDateRange className="inline-block text-lg" />
            <strong> Reservation Date:</strong> {booking.reservationDate}
          </p>
          <p className="text-gray-500">
            <strong>Reservation Time:</strong> {booking.reservationTime}
          </p>
        </>
      )}
      {booking.type === 'Attraction' && (
        <>
          <p className="text-gray-500">
            <MdDateRange className="inline-block text-lg" />
            <strong> Activity Date:</strong> {booking.visitDate}
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
      <Badge color={booking.payment === 'Pending' ? 'warning' : booking.payment === 'Paid' ? 'success' : 'default'}>
        <p className="text-gray-500">
          <strong>Payment Status: </strong>{booking.payment}
        </p>
      </Badge>

      <Badge color={booking.status === 'Pending' ? 'warning' : booking.status === 'Paid' ? 'success' : 'default'}>
        <p className="text-gray-500">
          <strong>Booking Status:</strong> {booking.status}
        </p>
      </Badge>

      <div className="flex justify-between items-center">
      {booking.payment === 'Processing' && (
          <>
            <Button
              onClick={handleShowPaymentModal}
              style={{ padding: '8px 16px', color: 'white', border: 'none', cursor: 'pointer' }}
              className="bg-color1 hover:bg-color2"
            >
              Check Payment Status
            </Button>

            <Modal isOpen={showPaymentModal} isDismissable={false} onClose={handleClosePaymentModal}>
              <ModalContent 
                style={{ 
                  borderRadius: '8px', 
                  padding: '1rem', 
                  backgroundColor: '#f9f9f9',
                  margin: '0 auto',
                  height: '90vh',
                  overflowY: 'auto'
                }}
              >
                <ModalHeader>
                  <h3
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      color: '#333',
                      textAlign: 'center',
                      marginBottom: '0.5rem',
                    }}
                  >
                    Check Payment
                  </h3>
                </ModalHeader>

                <ModalBody style={{ padding: '1.5rem', color: '#555' }}>
                  {booking.paymentDetails ? (
                    <>
                      <p><strong>Booking ID:</strong> {booking.booked_id}</p>
                      <p><strong>Account Name:</strong> {booking.paymentDetails.accountName}</p>
                      <p><strong>Account Number:</strong> {booking.paymentDetails.accountNumber}</p>
                      <p><strong>Reference Number:</strong> {booking.paymentDetails.referenceNumber}</p>
                      <div
                        style={{
                          marginTop: '1.5rem',
                          textAlign: 'center',
                          padding: '1rem',
                          backgroundColor: '#fff',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        }}
                      >
                        <img
                          src={`${BASE_URL}/${booking.paymentDetails.picture}`}
                          alt="Payment image"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            borderRadius: '8px',
                            objectFit: 'contain',
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <p>No payment details available.</p>
                  )}
                </ModalBody>

                <ModalFooter style={{ justifyContent: 'space-between', marginTop: '1rem' }}>
                  <Button
                    auto
                    flat
                    color="error"
                    style={{
                      backgroundColor: '#ff6b6b',
                      color: '#fff',
                      padding: '0.5rem 1.25rem',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                    }}
                    onClick={handleClosePaymentModal}
                  >
                    Close
                  </Button>
                  <Button
                    auto
                    flat
                    color="success"
                    style={{
                      backgroundColor: '#51cf66',
                      color: '#fff',
                      padding: '0.5rem 1.25rem',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                    }}
                    onClick={() => handleConfirmPayment(booking.id)} // Pass a function
                  >
                    Confirm
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </>
        )}
      </div>

      <div className="flex justify-between items-center">
        {booking.status === 'Pending' ? (
          <>
            {/* No action for Pending */}
          </>
        ) : booking.status === 'Active' && (
          <Button
            auto
            color="success"
            onClick={() => onMarkAsCompleted(booking.id)}
            className="px-4 text-white"
          >
            <div className="flex items-center gap-2">
              Mark as Completed
            </div>
          </Button>
        )}
      </div>
    </div>
  );
};

// Form component
const BookingForm = ({ isOpen, onClose, title, products, onSubmit, type }) => {
  // Product selection states
  const dispatch = useDispatch();
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
  const [reservationDate, setReservationDate] = useState(null);
  const [reservationTime, setReservationTime] = useState('18:00'); // Default time
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
    setReservationDate(null);
    setReservationTime('18:00');
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
        business_id: selectedProduct.business_id,
        user_id: 0,// use random user id
        product_id: selectedProduct.product_id,
        firstName,
        lastName,
        email,
        phone,
        numberOfGuests: parseInt(guests),
        specialRequests,
        originalPrice: parseFloat(amount),
        discountedPrice: parseFloat(totalAmount),
        status: 1, // For walk-in bookings
        type: selectedProduct.type, // Add type from selected product
        productName: selectedProduct.name // Add product name
      };

      // Add date/time fields based on booking type
      if (type === 'Accommodation') {

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

        formData.reservationDate = reservationDate;
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

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        dispatch(fetchBookings());
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

  const totalAmount = amount * guests;

  return (
    <Modal 
    disableAnimation
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
                        setAmount(product.price); // Update the amount with the product price
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
          {selectedProduct && (
            <div className="total-amount">
              <div className="amount-display">
                Price: ₱{amount}
              </div>
            </div>
          )}
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
              <DatePicker
                aria-label="Select Reservation Date"
                value={reservationDate}
                onChange={(date) => setReservationDate(date)}
              />
              <Input 
                type="time" 
                label="Reservation Time" 
                required 
                value={reservationTime}
                onChange={(e) => {
                  const selectedTime = e.target.value;
                  setReservationTime(selectedTime);
                }}
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
         <div className="total-amount">
            <label>Total Amount</label>
            <div className="amount-display">
              ₱{totalAmount}
            </div>
          </div>
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
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  // Function to check login status
  const checkLoginStatus = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/check-login`, {
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
  const bookingIsLoading = useSelector(state => state.bookings.loading);
  const pendingBookings = useSelector(state => state.bookings.pendingBookings);
  const activeBookings = useSelector(state => state.bookings.activeBookings);
  const declinedBookings = useSelector(state => state.bookings.declinedBookings);
  // console.log("delined bookingssssssss: ", declinedBookings);
  const bookingHistory = useSelector(state => state.bookings.bookingHistory);
  const chatMessages = useSelector(state => state.bookings.chatMessages);
  const walkInCustomers = useSelector(state => state.bookings.activeWalkInCustomers);
  // log the walkInCustomers
  // console.log('Walk-In Customers:', walkInCustomers);
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
  const [walkInAccommodationSearchQuery, setWalkInAccommodationSearchQuery] = useState('');
  const [walkInTableReservationSearchQuery, setWalkInTableReservationSearchQuery] = useState('');
  const [walkInActivitiesSearchQuery, setWalkInActivitiesSearchQuery] = useState('');
  const walkInHistory = useSelector(state => state.bookings.walkInHistory);
  const [businessType, setBusinessType] = useState([]);

  useEffect(() => {
    const fetchBusinessType = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/get-businessData`, {
          withCredentials: true,
        });
        if (response.status === 200 && response.data) {
          const type = response.data.businessData[0].businessType; // Adjust based on API structure
          setBusinessType(type);
        }
      } catch (error) {
        console.error('Error fetching business data:', error);
      } 
    };

    fetchBusinessType();
  }, []);
  // console.log('walkinhistoryyyyy', walkInHistory);
  // Title Tab
  useEffect(() => {
    document.title = 'BusinessName | Admin booking';
  });
    
  // log the fetchBookings
  useEffect(() => {
    // console.log('Fetching bookings...');
    dispatch(fetchBookings());
  }, [dispatch]);

  const refreshBookings = () => {
    dispatch(fetchBookings());
  };

  const openChatModal = (booking) => {
    setCurrentBookingDetails(booking);
    setChatModalVisible(true);
  };

  const closeChatModal = () => {
    setCurrentBookingDetails(null)
   setChatModalVisible(false)
  };

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
    customer.customerName.toLowerCase().includes(walkInSearchQuery.toLowerCase()) ||
    customer.productName.toLowerCase().includes(walkInSearchQuery.toLowerCase())
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
  
      // Fetch user data to get the user_id
      const userResponse = await axios.get(`${BASE_URL}/get-userData`, { withCredentials: true });
      const userId = userResponse.data.userData.user_id;
  
      const response = await fetch(`${BASE_URL}/update-booking-status/${bookingId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 1 }) // Set status to 'Active'
      });
  
      const data = await response.json();
      // console.log('response:', data);
      if (!data.success) {
        throw new Error(data.message || 'Failed to accept booking');
      }
  
      // Send a message after accepting the booking
      const messageData = {
        sender_id: userId, // Use the fetched user_id
        sender_account: 'business',
        receiver_id: data.receiver_id, // Assuming the receiver_id is part of the response
        receiver_account: 'user',
        text: `Booking for ${data.title} has been accepted.`,
        formType: 'bookingAccepted',
        form_details: JSON.stringify({ bookingId }) // Include any additional details if necessary
      };
  
      const messageResponse = await fetch(`${BASE_URL}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      });
  
      const messageResult = await messageResponse.json();
      if (!messageResult.success) {
        throw new Error('Failed to send acceptance message');
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
      const response = await fetch(`${BASE_URL}/update-booking-status/${bookingId}`, {
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
    const fetchProducts = () => {
      // Fetch user_id from the endpoint
      axios.get(`${BASE_URL}/get-userData`, { withCredentials: true })
        .then(response => {
          const userId = response.data.userData.user_id;

          axios.get(`${BASE_URL}/getAllBusinessProduct`)
            .then(({ data }) => {
              if (data.success) {
                const products = data.businessProducts;
                // Filter products by category and userId
                setAccommodations(products.filter(p => p.product_category === 'accommodation' && p.user_id === userId));
                setRestaurants(products.filter(p => p.product_category === 'restaurant' && p.user_id === userId));
                setActivities(products.filter(p => p.product_category === 'activity' && p.user_id === userId));
              } else {
                console.error('Failed to fetch products:', data.message);
              }
            })
            .catch(error => {
              console.error('Error fetching products:', error.response ? error.response.data.message : 'An unknown error occurred');
            });
        })
        .catch(error => {
          // Handle error in fetching user_id
          showErrorAlert('Error fetching user data:', error.response ? error.response.data.message : 'An unknown error occurred');
        });
    };
  
    fetchProducts();
  }, []);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 relative">
      <Sidebar />

      <div className="flex-1 px-8 py-4 md:p-8 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Bookings and Reservations</h1>
          <div>  <button
         disableAnimation
          className="  bg-color1 text-white p-4 rounded-full shadow-lg hover:bg-color2 focus:outline-none z-50"
          onClick={() => setChatModalVisible(true)}
        >
          <PiChatCircleText  size={20} />
        </button></div>
        </div>

        {bookingIsLoading ?
        (
          <div className="py-8">
              <Skeleton className="rounded-lg mb-4 p-4 w-[40%]" />
              <Skeleton className="rounded-lg mb-4 p-4 w-[60%]" />
            <div className="max-h-[820px] w-full h-full rounded-xl shadow-gray-400 shadow-lg bg-white">
              <Skeleton className="w-full h-[480px] md:h-[600] rounded-t-lg overflow-hidden" />
            </div>
          </div>
        ) : (
        <>
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
                  refreshBookings={refreshBookings}
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
                  refreshBookings={refreshBookings}
                />
              </Tab>

              <Tab title="Declined Bookings" className="flex-1 min-w-[150px]">
                <BookingSection
                  title="Declined Bookings"
                  bookings={declinedBookings}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  openChatModal={openChatModal}
                  onMarkAsCompleted={handleMarkAsCompleted}
                  filteredBookingsByType={filteredBookingsByType}
                  refreshBookings={refreshBookings}
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
                {walkInHistory && (
                  <>
                  {businessType === 'accommodation' &&(
                    <WalkInHistorySection
                      title="Walk-In Accommodation History"
                      history={walkInHistory}
                      type="Accommodation"
                      searchQuery={walkInSearchQuery}
                    />
                  )}
                  {businessType === 'restaurant' &&(
                    <WalkInHistorySection
                      title="Walk-In Table Reservation History"
                      history={walkInHistory}
                      type="Table Reservation"
                      searchQuery={walkInSearchQuery}
                    />
                  )}
                  {businessType === 'attraction' &&(
                    <WalkInHistorySection
                      title="Walk-In Attraction History"
                      history={walkInHistory}
                      type="Attraction"
                      searchQuery={walkInSearchQuery}
                    />
                  )}
                  </>
                )}
              </Tab>

              <Tab title="Walk In Customers" className="flex-1 min-w-[150px]">
                <WalkInCustomersSection
                  setAccommodationFormOpen={setAccommodationFormOpen}
                  setTableReservationFormOpen={setTableReservationFormOpen}
                  setAttractionActivitiesFormOpen={setAttractionActivitiesFormOpen}
                />
              </Tab>
            </Tabs>
            
          </div>
        </>
        )}
        <ChatModal
        disableAnimation
          isOpen={isChatModalVisible}
          onClose={closeChatModal}
          selectedBooking={currentBookingDetails}
          chatMessages={chatMessages}
          selectedUserId={currentBookingDetails?.userId}
        />

        {/* Booking Forms */}
        <BookingForm
        disableAnimation
          isOpen={isAccommodationFormOpen}
          onClose={() => setAccommodationFormOpen(false)}
          title="Accommodation"
          products={accommodations}
          onSubmit={() => handleSubmit('Accommodation')}
          type="Accommodation"
        />
        <BookingForm
        disableAnimation
          isOpen={isTableReservationFormOpen}
          onClose={() => setTableReservationFormOpen(false)}
          title="Table Reservation"
          products={restaurants}
          onSubmit={() => handleSubmit('Table Reservation')}
          type="Table Reservation"
        />
        <BookingForm
        disableAnimation
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
const BookingSection = ({ title, bookings, openChatModal, onMarkAsCompleted, onAcceptBooking, refreshBookings }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [businessType, setBusinessType] = useState('');

  // Mapping businessType values to user-friendly labels
  const typeMapping = {
    accommodation: 'Accommodation',
    restaurant: 'Table Reservation',
    attraction: 'Attraction',
  };

  useEffect(() => {
    const fetchBusinessType = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/get-businessData`, {
          withCredentials: true,
        });
        if (response.status === 200 && response.data) {
          const type = response.data.businessData[0].businessType; // Backend value
          setBusinessType(type || ''); // Ensure type is set or default to empty string
        }
      } catch (error) {
        console.error('Error fetching business data:', error);
      }
    };

    fetchBusinessType();
  }, []);

  // Determine the label for the current business type
  const businessLabel = typeMapping[businessType] || '';

  return (
    <div>
      <div className="text-xl font-bold mb-4 text-gray-700">{title}</div>
      <div className="p-4 mt-3 gap-4">
        {businessLabel && (
          <BookingTypeSection
            key={businessType}
            type={businessLabel} // Pass the label to BookingTypeSection
            bookings={bookings}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            openChatModal={openChatModal}
            onMarkAsCompleted={onMarkAsCompleted}
            onAcceptBooking={onAcceptBooking}
            refreshBookings={refreshBookings}
          />
        )}
      </div>
    </div>
  );
};

// Booking type section component
const BookingTypeSection = ({ type, bookings, searchQuery, setSearchQuery, openChatModal, onMarkAsCompleted, onAcceptBooking, refreshBookings }) => {
  // console.log(`${type} Section - Received bookings:`, bookings);

  // Map API types to display types
  const typeMapping = {
    'Accommodation': 'accommodation',
    'Table Reservation': 'restaurant',
    'Attraction': 'activity'
  };

  const filteredBookings = bookings.filter(booking => {
    const allowedTypes = typeMapping[type] || [];
    const typeMatch = allowedTypes.includes(booking.reservationType);
    const searchMatch = !searchQuery || 
      booking.customerName.toLowerCase().includes(searchQuery.toLowerCase())||
      booking.productName.toLowerCase().includes(searchQuery.toLowerCase() 
    );
    
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
              refreshBookings={() => refreshBookings()}
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
  setAccommodationFormOpen,
  setTableReservationFormOpen,
  setAttractionActivitiesFormOpen
}) => {
  const [walkInSearchQuery, setWalkInSearchQuery] = useState('');
  const activeWalkInCustomers = useSelector(state => state.bookings.activeWalkInCustomers);
  // console.log('walkInCustomerssssssssss', activeWalkInCustomers);
  const [businessType, setBusinessType] = useState('');

  // Mapping businessType values to user-friendly labels
  const typeMapping = {
    accommodation: 'Accommodation',
    restaurant: 'Table Reservation',
    attraction: 'Attraction',
  };

  useEffect(() => {
    const fetchBusinessType = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/get-businessData`, {
          withCredentials: true,
        });
        if (response.status === 200 && response.data) {
          const type = response.data.businessData[0].businessType; // Backend value
          setBusinessType(type || ''); // Ensure type is set or default to empty string
        }
      } catch (error) {
        console.error('Error fetching business data:', error);
      }
    };

    fetchBusinessType();
  }, []);

  // Determine the label for the current business type
  const businessLabel = typeMapping[businessType] || '';

  return (
    <div className="w-full space-y-4">
      <div className="text-xl font-bold mb-4 text-gray-700">Walk In Customers</div>

      {/* Form Buttons */}
      <div className="flex flex-wrap gap-4 mb-4 items-center font-medium text-color2">
        <h1>Book Walk In Customers:</h1>
        {businessType === 'accommodation' &&(
          <Button color="primary" onClick={() => setAccommodationFormOpen(true)}>
            Book Accommodation <span className="ml-2">📝</span>
          </Button>
        )}
        {businessType === 'restaurant' &&(
          <Button color="primary" onClick={() => setTableReservationFormOpen(true)}>
            Reserve Table <span className="ml-2">📝</span>
          </Button>
        )}
        {businessType === 'attraction' &&(
          <Button color="primary" onClick={() => setAttractionActivitiesFormOpen(true)}>
            Book Activity <span className="ml-2">📝</span>
          </Button>
        )}
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

      {businessLabel && (
        <WalkInTypeSection
          key={businessLabel}
          type={businessLabel}
          customers={activeWalkInCustomers}
          searchQuery={walkInSearchQuery}
        />
      )}
    </div>
  );
};

// Walk-in type section component
const WalkInTypeSection = ({ type, customers, searchQuery }) => {
  const dispatch = useDispatch();
  const iconMap = {
    'Accommodation': <MdHotel className="text-xl text-color1" />,
    'Table Reservation': <MdRestaurant className="text-xl text-color1" />,
    'Attraction': <MdDirectionsRun className="text-xl text-color1" />
  };

  // Define a mapping from type to reservationType
  const typeToReservationTypeMap = {
    'Accommodation': 'accommodation',
    'Table Reservation': 'restaurant',
    'Attraction': 'activity'
  };

  // Filter customers by type and search query
  const filteredCustomers = customers.filter(customer => {
    const searchTermLower = searchQuery?.toLowerCase() || '';
    const reservationType = typeToReservationTypeMap[type]; // Get the corresponding reservationType

    return (
      customer?.reservationType === reservationType && 
      (searchTermLower === '' || // Return all if searchTermLower is empty
        (customer?.customerName?.toLowerCase() || '').includes(searchTermLower) ||
        (customer?.email?.toLowerCase() || '').includes(searchTermLower) ||
        (customer?.phone?.toLowerCase() || '').includes(searchTermLower) ||
        (customer?.details?.toLowerCase() || '').includes(searchTermLower))
    );
  });

  const handleMarkAsComplete = async (customerId) => {
    try {
      // setIsLoading(true);
      const response = await fetch(`${BASE_URL}/update-booking-status/${customerId}`, {
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

      dispatch(markWalkInAsCompleted(customerId));
      showSuccessAlert('Booking marked as completed!');
    } catch (error) {
      console.error('Error marking booking as completed:', error);
      showErrorAlert(error.message || 'Failed to mark booking as completed');
    }
  };

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
        {iconMap[type]} {type}
      </h3>
      <div className="bg-white max-h-[600px] flex flex-col gap-4 overflow-y-auto rounded-lg p-4 shadow-inner">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => (
            <div key={customer.id} className="p-4 bg-white rounded-lg shadow-md border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{customer.customerName}</h2>
              <p className="text-gray-600"><strong>Email:</strong> {customer.email || 'Not provided'}</p>
              <p className="text-gray-600"><strong>Phone:</strong> {customer.phone || 'Not provided'}</p>
              <p className="text-gray-600"><strong>Product Name:</strong> {customer.productName || 'Not provided'}</p>
              <p className="text-gray-600">
              <strong>Schedule:</strong>{' '}
                {customer.dateIn 
                  ? new Date(customer.dateIn).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    }) 
                  : 'Not provided'}
              </p>
              <p className="text-gray-600"><strong>Special Requests:</strong> {customer.specialRequests || 'None'}</p>
              <p className="text-gray-600"><strong>Product Price:</strong> ₱{customer.originalPrice || '0'}</p>
              <p className="text-gray-600"><strong>Discount:</strong> {customer.discount}%</p>
              <p className="text-gray-600"><strong>Total Amount:</strong> ₱{customer.amount || '0'}</p>
              <p className="text-gray-600"><strong>Additional Notes:</strong> {customer.additionalNotes || 'None'}</p>
              <div className="flex justify-end items-center mt-4">
                <Button auto color="success" onClick={() => handleMarkAsComplete(customer.id)}>
                  Mark as Complete
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-gray-500">
            {searchQuery 
              ? `No ${type.toLowerCase()} walk-in bookings found matching "${searchQuery}"`
              : `No ${type.toLowerCase()} walk-in bookings available`
            }
          </div>
        )}
      </div>
    </div>
  );
};

// New component for walk-in history sections
const WalkInHistorySection = ({ title, history = [], type, searchQuery }) => {
  const typeToReservationTypeMap = {
    'Accommodation': 'accommodation',
    'Table Reservation': 'restaurant',
    'Attraction': 'activity'
  };
  const reservationType = typeToReservationTypeMap[type]; // Get the corresponding reservationType
  
  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-lg mt-4">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <div className="bg-white max-h-[600px] flex flex-col gap-3 overflow-y-auto rounded-lg p-4 shadow-inner">
        {history.filter(booking => 
          booking.reservationType === reservationType && 
          (booking.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
          booking.productName?.toLowerCase().includes(searchQuery.toLowerCase()))
        ).length > 0 ? (
          history.filter(booking => 
            booking.reservationType === reservationType && 
            (booking.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
            booking.productName?.toLowerCase().includes(searchQuery.toLowerCase()))
          ).map((booking) => (
            <div key={booking.id} className="p-4 bg-gray-200 rounded-lg">
              <h2 className="text-lg font-semibold">{booking.customerName}</h2>
              <p>Email: {booking.email}</p>
              <h2 className="text-lg">Details:</h2>
              <p>Product Name: {booking.productName}</p>
              <p>Number of Guests: {booking.numberOfGuests}</p>
              <p>Date: {new Date(booking.dateIn).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })}
              </p>
              <p>Product Price: ₱{booking.originalPrice}</p>
              <p>Discount: {booking.discount}%</p>
              <p>Total Amount: ₱{booking.amount}</p>
            </div>
          ))
        ) : (
          <div className="p-4 text-gray-500">No walk-in {type.toLowerCase()} history available</div>
        )}
      </div>
    </div>
  );
};

export default BusinessBooking;
