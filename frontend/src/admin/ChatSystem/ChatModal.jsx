import React, { useState, useRef, useEffect } from 'react';
import { ModalContent, ModalHeader, ModalBody, ModalFooter, Modal } from "@nextui-org/modal";
import { Button, Avatar, Textarea } from '@nextui-org/react';
import { FiSend, FiDownload, FiImage } from "react-icons/fi";
import { RangeCalendar, TimeInput } from "@nextui-org/react";
import { Time } from "@internationalized/date";
import { today, isWeekend, getLocalTimeZone } from "@internationalized/date";
import { useLocale } from "@react-aria/i18n";
import { MdDateRange, MdPeople, MdEmail, MdPhone } from "react-icons/md";

// Function to determine unavailable dates
const useUnavailableDates = () => {
  let now = today(getLocalTimeZone());
  let { locale } = useLocale();

  let disabledRanges = [
    [now, now.add({ days: 5 })],
    [now.add({ days: 14 }), now.add({ days: 16 })],
    [now.add({ days: 23 }), now.add({ days: 24 })],
  ];

  return (date) =>
    isWeekend(date, locale) ||
    disabledRanges.some(
      (interval) => date.compare(interval[0]) >= 0 && date.compare(interval[1]) <= 0
    );
};

// AvailabilityModal for table reservation
const AvailabilityModalTable = ({ isOpen, onClose, currentBookingDetails, onAcceptBooking }) => {
  const isDateUnavailable = useUnavailableDates();
  const [acceptMessage, setAcceptMessage] = useState('');

  if (!currentBookingDetails) return null;

  const handleAccept = () => {
    onAcceptBooking(currentBookingDetails, acceptMessage);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl p-8 bg-white rounded-lg shadow-2xl">
      <ModalContent className="rounded-lg">
        <ModalHeader className="text-2xl font-bold text-gray-800 border-b pb-4">
          Check Availability for {currentBookingDetails.formDetails.productName}
        </ModalHeader>
        <ModalBody className="space-y-4">
          <RangeCalendar
            aria-label="Date (Visible Month)"
            visibleMonths={2}
            isReadOnly
            isDateUnavailable={isDateUnavailable}
          />
          <Textarea
            placeholder="Add your acceptance message"
            value={acceptMessage}
            onChange={(e) => setAcceptMessage(e.target.value)}
          />
        </ModalBody>
        <ModalFooter className="flex justify-between">
          <Button auto onClick={onClose} color="error">Decline</Button>
          <Button auto onClick={handleAccept} color="success">Accept</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// AvailabilityModal for accommodation booking
const AvailabilityModalAccommodation = ({ isOpen, onClose, currentBookingDetails, onAcceptBooking }) => {
  const isDateUnavailable = useUnavailableDates();
  const [checkInTime, setCheckInTime] = useState(new Time(14, 0));
  const [checkOutTime, setCheckOutTime] = useState(new Time(11, 0));
  const [acceptMessage, setAcceptMessage] = useState('');

  if (!currentBookingDetails) return null;

  const handleAccept = () => {
    onAcceptBooking(currentBookingDetails, acceptMessage);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl p-8 bg-white rounded-lg shadow-2xl">
      <ModalContent className="rounded-lg">
        <ModalHeader className="text-2xl font-bold text-gray-800 border-b pb-4">
          Check Availability for {currentBookingDetails.formDetails.productName}
        </ModalHeader>
        <ModalBody className="space-y-4">
          <RangeCalendar
            aria-label="Date (Visible Month)"
            visibleMonths={2}
            isReadOnly
            isDateUnavailable={isDateUnavailable}
          />
          <div className="flex space-x-4">
            <TimeInput label="Check-in Time" value={checkInTime} onChange={setCheckInTime} />
            <TimeInput label="Check-out Time" value={checkOutTime} onChange={setCheckOutTime} />
          </div>
          <Textarea
            placeholder="Add your acceptance message"
            value={acceptMessage}
            onChange={(e) => setAcceptMessage(e.target.value)}
          />
        </ModalBody>
        <ModalFooter className="flex justify-between">
          <Button auto onClick={onClose} color="error">Decline</Button>
          <Button auto onClick={handleAccept} color="success">Accept</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// AvailabilityModal for activity booking
const AvailabilityModalActivity = ({ isOpen, onClose, currentBookingDetails, onAcceptBooking }) => {
  const isDateUnavailable = useUnavailableDates();
  const [acceptMessage, setAcceptMessage] = useState('');

  if (!currentBookingDetails) return null;

  const handleAccept = () => {
    onAcceptBooking(currentBookingDetails, acceptMessage);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl p-8 bg-white rounded-lg shadow-2xl">
      <ModalContent className="rounded-lg">
        <ModalHeader className="text-2xl font-bold text-gray-800 border-b pb-4">
          Check Availability for {currentBookingDetails.formDetails.productName}
        </ModalHeader>
        <ModalBody className="space-y-4">
          <RangeCalendar
            aria-label="Date (Visible Month)"
            visibleMonths={2}
            isReadOnly
            isDateUnavailable={isDateUnavailable}
          />
          <Textarea
            placeholder="Add your acceptance message"
            value={acceptMessage}
            onChange={(e) => setAcceptMessage(e.target.value)}
          />
        </ModalBody>
        <ModalFooter className="flex justify-between">
          <Button auto onClick={onClose} color="error">Decline</Button>
          <Button auto onClick={handleAccept} color="success">Accept</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// Component for rendering booking details
const BookingDetailsCard = ({ message, onCheckAvailability }) => {
  return (
    <div className={`bg-white shadow-md text-black p-4 rounded-lg border border-gray-200 ${message.sender === 'You' ? 'ml-auto' : 'mr-auto'} max-w-full sm:max-w-sm break-words`}>
      <div className="flex justify-between items-center mb-1">
        <strong className="text-lg">{message.sender}</strong>
        <span className="text-xs text-gray-500">{message.time}</span>
      </div>
      <p className="font-semibold mb-2 break-words">{message.text}</p>
      {message.formDetails?.imageUrl && (
        <img
          src={message.formDetails.imageUrl}
          alt={message.formDetails.productName}
          className="w-full h-auto mt-2 rounded-lg max-h-40 object-cover"
        />
      )}
      <div className="p-3 mt-3 bg-gray-50 rounded-lg text-sm text-black border border-gray-200 break-words">
        <h4 className="font-semibold mb-2">Booking Details:</h4>
        <ul className="space-y-1">
          <li><strong>Product:</strong> {message.formDetails?.productName || 'Sample Product'}</li>
          <li><MdPeople className="inline-block text-lg" /> <strong> Guests:</strong> {message.formDetails?.numberOfGuests || '2'}</li>
          <li><MdEmail className="inline-block text-lg" /> <strong> Email:</strong> {message.formDetails?.email || 'john.doe@example.com'}</li>
          <li><MdPhone className="inline-block text-lg" /> <strong> Phone:</strong> {message.formDetails?.phone || '123-456-7890'}</li>
          {message.formType === 'accommodationBooking' && (
            <>
              <li><MdDateRange className="inline-block text-lg" /> <strong> Check-in:</strong> {message.formDetails?.checkInOutDates?.start || '2024-10-20'}</li>
              <li><MdDateRange className="inline-block text-lg" /> <strong> Check-out:</strong> {message.formDetails?.checkInOutDates?.end || '2024-10-22'}</li>
            </>
          )}
          {message.formType === 'tableReservation' && (
            <>
              <li><MdDateRange className="inline-block text-lg" /> <strong> Reservation Date:</strong> {message.formDetails?.reservationDate || '2024-10-15'}</li>
              <li><strong>Reservation Time:</strong> {message.formDetails?.reservationTime || '6:00 PM'}</li>
            </>
          )}
          {message.formType === 'activityBooking' && (
            <>
              <li><MdDateRange className="inline-block text-lg" /> <strong> Activity Date:</strong> {message.formDetails?.visitDate || '2024-11-01'}</li>
              <li><strong>Activity Time:</strong> {message.formDetails?.activityTime || '10:00 AM'}</li>
            </>
          )}
          <li><strong>Special Requests:</strong> {message.formDetails?.specialRequests || 'None'}</li>
          <li><strong>Total Amount:</strong> ₱{message.formDetails?.amount || '0'}</li>
        </ul>
        <Button auto color="primary" onClick={() => onCheckAvailability(message)} className="mt-2">
          Check Availability
        </Button>
      </div>
    </div>
  );
};

// Custom red badge for unread messages positioned inside the avatar
const UnreadBadge = ({ count }) => (
  count > 0 ? (
    <span className="absolute bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full top-0 right-0">
      {count}
    </span>
  ) : null
);

// Chat Modal Component with dynamic check availability logic
const ChatModal = ({ isOpen, onClose }) => {
  const [selectedUser, setSelectedUser] = useState(null);

  const users = [
    { id: 1, name: 'John Doe 1', status: 'online', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026701d' },
    { id: 2, name: 'John Doe 2', status: 'offline', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026702d' },
    { id: 3, name: 'John Doe 3', status: 'online', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026703d' },
  ];

  const initialMessages = {
    1: [
      { 
        id: 1, 
        sender: 1, 
        text: 'Here are the details of your activity booking:', 
        time: '10:00 AM', 
        formType: 'activityBooking', 
        formDetails: {
          productName: 'Hiking Adventure', 
          numberOfGuests: 3, 
          email: 'bobjohnson@example.com', 
          phone: '321-654-9870', 
          visitDate: '2024-11-01', 
          activityTime: '10:00 AM', 
          specialRequests: 'Need a guide, bring extra snacks',
          amount: '₱0',
          imageUrl: 'https://via.placeholder.com/200'
        }
      },
    ],
    2: [
        { 
        id: 2, 
        sender: 'John Doe 2', 
        text: 'Here are the details of your accommodation booking:', 
        time: '10:15 AM', 
        formType: 'accommodationBooking', 
        formDetails: {
          firstName: 'Alice', 
          lastName: 'Smith', 
          email: 'alice.smith@example.com', 
          phone: '789-456-1230', 
          checkInOutDates: { start: 'Oct 20, 2024', end: 'Oct 22, 2024' }, 
          amount: '₱5000', 
          specialRequests: 'Late check-in, vegetarian meal', 
          numberOfGuests: 2, 
          productName: 'Luxury Mountain Cabin', 
          imageUrl: 'https://via.placeholder.com/200'
        }
      }
    ],
    3: [
      { 
        id: 3, 
        sender: 'John Doe 3', 
        text: 'Here are the details of your table reservation:', 
        time: '10:25 AM', 
        formType: 'tableReservation', 
        formDetails: {
          firstName: 'Jane', 
          lastName: 'Doe', 
          email: 'janedoe@example.com', 
          phone: '123-456-7890', 
          reservationDate: '2024-10-15', 
          reservationTime: '6:00 PM', 
          numberOfGuests: 4, 
          productName: 'Mountain View Dining', 
          imageUrl: 'https://via.placeholder.com/200'
        }
      }
    ],
  };

  const [messages, setMessages] = useState(initialMessages);
  const [unreadMessages, setUnreadMessages] = useState({ 1: 3, 2: 2, 3: 1 }); // Keep track of unread message counts
  const [messageInput, setMessageInput] = useState('');
  const [activeChatUser, setActiveChatUser] = useState('John Doe 1');
  const messageEndRef = useRef(null);
  const [isAvailabilityModalOpen, setAvailabilityModalOpen] = useState(false);
  const [currentBookingDetails, setCurrentBookingDetails] = useState(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Handle image selection
  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle image removal
  const handleImageRemove = () => {
    setImage(null);
    setImagePreview(null);
  };

  // Function to download the image
  const handleImageDownload = (imageUrl) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'downloaded-image.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Scroll chat to the bottom when new messages arrive
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Opens the availability modal with booking-specific details
  const handleCheckAvailability = (booking) => {
    setCurrentBookingDetails(booking);
    setAvailabilityModalOpen(true);
  };

  // Formats the time in AM/PM format
  const formatTime = (date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;
  };

  // Handle sending messages
  const handleSendMessage = () => {
    if ((messageInput.trim() !== '' || image) && selectedUser !== null) {
      const currentMessages = messages[selectedUser] || [];
      const newMessage = {
        id: currentMessages.length + 1,
        sender: 'You',
        text: messageInput,
        time: formatTime(new Date()),
        image: imagePreview
      };
      setMessages({
        ...messages,
        [selectedUser]: [...currentMessages, newMessage]
      });
      setMessageInput('');
      setImage(null);
      setImagePreview(null);
    }
  };

  // Handle key press in the input field
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Handle user selection from list
  const handleUserClick = (userId) => {
    setSelectedUser(userId);
    setActiveChatUser(users.find(user => user.id === userId).name);
    setUnreadMessages({
      ...unreadMessages,
      [userId]: 0, // Reset unread messages for the selected user
    });
  };

  // Handle accepting a booking
  const handleAcceptBooking = (bookingDetails, customMessage) => {
    const baseMessage = (
      <div className="p-4 bg-green-100 rounded-lg">
        <p className="font-bold ">
          Booking for {bookingDetails.formDetails.productName} ha been accepted.
        </p>
        <div className="mt-2">
          {bookingDetails.formType === 'accommodationBooking' && (
            <>
              <p>Check-in Date: {bookingDetails.formDetails.checkInOutDates.start}</p>
              <p>Check-out Date: {bookingDetails.formDetails.checkInOutDates.end}</p>
            </>
          )}
          {bookingDetails.formType === 'tableReservation' && (
            <>
              <p>Reservation Date: {bookingDetails.formDetails.reservationDate}</p>
              <p>Reservation Time: {bookingDetails.formDetails.reservationTime}</p>
            </>
          )}
          {bookingDetails.formType === 'activityBooking' && (
            <>
              <p>Activity Date: {bookingDetails.formDetails.visitDate}</p>
              <p>Activity Time: {bookingDetails.formDetails.activityTime}</p>
            </>
          )}
        </div>
        {customMessage && (
          <p className="mt-4">
            Message: {customMessage}
          </p>
        )}
      </div>
    );

    const newMessage = {
      id: messages[selectedUser].length + 1,
      sender: 'You',
      text: baseMessage, // Store the JSX element directly
      time: formatTime(new Date()),
      formType: 'bookingAccepted',
      formDetails: bookingDetails.formDetails
    };

    setMessages({
      ...messages,
      [selectedUser]: [...messages[selectedUser], newMessage]
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} hideCloseButton={true} size="full"
      className="bg-white transition-colors duration-300 w-full h-full">
      <ModalContent className="w-full h-full">
        <ModalHeader className="flex justify-between items-center px-6 py-4">
          <h2 className="text-2xl font-bold text-black">Chat</h2>
          <div className="flex items-center space-x-4">
            <Button auto onClick={onClose} className="bg-color1 text-white">
              Close
            </Button>
          </div>
        </ModalHeader>

        <ModalBody className="flex flex-col lg:flex-row gap-4 overflow-y-auto max-h-screen p-6 bg-gray-100 text-black">
          {/* Sidebar for user list */}
          <div className="w-full lg:w-1/4 bg-gray-200 p-4 rounded-lg">
            <h3 className="font-semibold mb-4">Available Users</h3>
            <ul className="space-y-3">
              {users.map((user, i) => (
                <li key={i}
                  className="p-3 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-300 bg-white"
                  onClick={() => handleUserClick(user.id)}>
                  <div className="relative flex items-center gap-3">
                    <div className="relative">
                      <Avatar radius="md" src={user.avatarUrl} alt={user.name} />
                      <UnreadBadge count={unreadMessages[user.id]} />
                    </div>
                    <span className="text-black">{user.name}</span>
                  </div>
                  <span className={`w-3 h-3 rounded-full ${user.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                </li>
              ))}
            </ul>
          </div>

          {/* Main chat area */}
          <div className="flex flex-col justify-between w-full lg:w-3/4 h-full bg-white rounded-md p-4">
            {selectedUser ? (
              <>
                <div className="flex flex-col space-y-3 overflow-y-auto scrollbar-custom">
                  <h3 className="font-semibold mb-4 text-black">Chat with {activeChatUser}</h3>
                  {messages[selectedUser].map((message) => (
                    <div key={message.id} className={`p-3 rounded-lg ${message.sender === 'You' ? 'bg-color1 text-white ml-auto' : 'bg-gray-300 text-black'}  sm:max-w-sm break-words max-w-[70%]`}  >
                      {message.formType ? (
                        <BookingDetailsCard message={message} onCheckAvailability={handleCheckAvailability} />
                      ) : (
                        <>
                          <div className="  flex justify-between items-center mb-1">
                            <strong>{message.sender}</strong>
                            <span className="text-xs text-gray-500 ml-2">{message.time}</span>
                          </div>
                          <p className="break-words">{message.text}</p>
                          {message.image && (
                            <div className="relative">
                              <img
                                src={message.image}
                                alt="Sent"
                                className="mt-2 rounded-md max-w-full cursor-pointer"
                                style={{ maxHeight: '400px', objectFit: 'cover' }}
                                onClick={() => handleImageClick(message.image)}
                              />
                              <button
                                onClick={() => handleImageDownload(message.image)}
                                className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-md"
                              >
                                <FiDownload size={16} className="text-black" />
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                  <div ref={messageEndRef}></div>
                </div>

                {/* Input to send messages */}
                <div className="flex items-center space-x-2 mt-4">
                  <Textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type a message..."
                    className="w-full bg-white text-black rounded-lg border border-gray-300 focus:border-black focus:ring resize-none p-2"
                    rows="2"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <FiImage size={24} className="text-gray-500 hover:text-black" />
                  </label>
                  <Button onClick={handleSendMessage} color="primary" className="rounded-lg h-full max-w-[100px] w-full"><FiSend /></Button>
                </div>
                {imagePreview && (
                  <div className="mt-2 relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="rounded-md max-w-full"
                      style={{ maxHeight: '200px', objectFit: 'cover' }}
                    />
                    <button
                      onClick={handleImageRemove}
                      className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-md"
                    >
                      <span className="text-black">✖</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-grow items-center justify-center text-gray-500">
                <p>Select a user to start a conversation</p>
              </div>
            )}
          </div>
        </ModalBody>
      </ModalContent>

      {/* Insert AvailabilityModals */}
      {currentBookingDetails?.formType === 'tableReservation' && (
        <AvailabilityModalTable
          isOpen={isAvailabilityModalOpen}
          onClose={() => setAvailabilityModalOpen(false)}
          currentBookingDetails={currentBookingDetails}
          onAcceptBooking={handleAcceptBooking}
        />
      )}
      {currentBookingDetails?.formType === 'accommodationBooking' && (
        <AvailabilityModalAccommodation
          isOpen={isAvailabilityModalOpen}
          onClose={() => setAvailabilityModalOpen(false)}
          currentBookingDetails={currentBookingDetails}
          onAcceptBooking={handleAcceptBooking}
        />
      )}
      {currentBookingDetails?.formType === 'activityBooking' && (
        <AvailabilityModalActivity
          isOpen={isAvailabilityModalOpen}
          onClose={() => setAvailabilityModalOpen(false)}
          currentBookingDetails={currentBookingDetails}
          onAcceptBooking={handleAcceptBooking}
        />
      )}
    </Modal>
  );
};

export default ChatModal;
