import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addChatMessage, markBookingAsCompleted, updateWalkInCustomerStatus, markWalkInAsCompleted, fetchBookings } from '@/redux/bookingSlice';
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
import { MdPeople, MdEmail, MdPhone, MdDateRange, MdHotel, MdRestaurant, MdDirectionsRun } from 'react-icons/md';
import Swal from 'sweetalert2';

// Mock data similar to BusinessAllproducts.jsx
const mockData = {
  accommodations: [
    { title: 'Luxury Mountain Cabin', type: 'Cabins' },
    { title: 'Beachfront Resort', type: 'Resorts' },
  ],
  restaurant: [
    { title: 'Mountain View Dining', type: 'Fine Dining' },
    { title: 'Coastal Seafood Feast', type: 'Buffet' },
  ],
  activities: [
    { title: 'Hiking Adventure', type: 'Hiking' },
    { title: 'Water Sports Fun', type: 'Water Sports' },
  ],
  shop: [
    { title: 'Local Handicrafts', type: 'Local Crafts' },
    { title: 'Souvenir Shop', type: 'Souvenirs' },
  ],
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
const BookingCard = ({ booking, onOpenChatModal, onMarkAsCompleted }) => (
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
      {booking.status === 'Active' && (
        <Button
          auto
          color="success"
          onClick={() => onMarkAsCompleted(booking.id)}
        >
          Mark as Completed
        </Button>
      )}
    </div>
  </div>
);

// Form component
const BookingForm = ({ isOpen, onClose, title, products, onSubmit, type }) => (
  <Modal isOpen={isOpen} onClose={onClose} size='full'>
    <ModalContent className='max-h-screen overflow-auto '>
      <ModalHeader>{title}</ModalHeader>
      <ModalBody className="space-y-4 ">
        <Select label={`Select ${title}`} placeholder="Choose a product" required className="w-full">
          {products.map((product) => (
            <SelectItem key={product.title} value={product.title}>
              {product.title}
            </SelectItem>
          ))}
        </Select>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="First Name" fullWidth required />
          <Input label="Last Name" fullWidth required />
        </div>
        <Input label="Email" type="email" fullWidth required />
        <Input label="Phone" type="tel" fullWidth required />
        
        {type === 'Accommodation' && (
          <>
            <h1 className='text-center'>Choose Check-in and Check-out Date</h1>
            <div className='flex justify-center'>
            <RangeCalendar aria-label="Select Dates" visibleMonths={2} required  />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input type="time" label="Check-in Time" required />
              <Input type="time" label="Check-out Time" required />
            </div>
          </>
        )}
        
        {type === 'Table Reservation' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input type="date" label="Reservation Date" required />
            <Input type="time" label="Reservation Time" required />
          </div>
        )}
        
        {type === 'Activity' && (
          <>
            <Input type="date" label="Activity Date" required />
            <Input type="time" label="Starting Time" required />
          </>
        )}
        
        <Input label="Number of Guests" type="number" fullWidth min={1} required />
        <Input label="Special Requests" fullWidth multiline />
        <Input label="Total Amount" type="number" fullWidth min={0} required />
        <Input label="Payment Method" fullWidth />
        <Input label="Additional Notes" fullWidth multiline />
      </ModalBody>
      <ModalFooter className="flex justify-end space-x-4">
        <Button auto flat color="danger" onClick={onClose}>Cancel</Button>
        <Button auto color="success" onClick={onSubmit}>Submit</Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);

// Main business booking component
const BusinessBooking = () => {
  const dispatch = useDispatch();
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
              />
            </Tab>

            <Tab title="Active Bookings" className="flex-1 min-w-[150px]">
              <BookingSection
                title="Current Bookings"
                bookings={activeBookings}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                openChatModal={openChatModal}
                onMarkAsCompleted={markAsCompleted}
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
          products={mockData.accommodations}
          onSubmit={() => handleSubmit('Accommodation')}
          type="Accommodation"
        />
        <BookingForm
          isOpen={isTableReservationFormOpen}
          onClose={() => setTableReservationFormOpen(false)}
          title="Table Reservation"
          products={mockData.restaurant}
          onSubmit={() => handleSubmit('Table Reservation')}
          type="Table Reservation"
        />
        <BookingForm
          isOpen={isAttractionActivitiesFormOpen}
          onClose={() => setAttractionActivitiesFormOpen(false)}
          title="Activity"
          products={mockData.activities}
          onSubmit={() => handleSubmit('Activity')}
          type="Activity"
        />
      </div>
    </div>
  );
};

// Booking section component
const BookingSection = ({ title, bookings, openChatModal, onMarkAsCompleted }) => {
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
          />
        ))}
      </div>
    </div>
  );
};

// Booking type section component
const BookingTypeSection = ({ type, bookings, searchQuery, setSearchQuery, openChatModal, onMarkAsCompleted }) => {
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
            />
          ))
        ) : (
          <div className="p-4 text-gray-500">No {type.toLowerCase()} bookings available</div>
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
