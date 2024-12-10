import React, { useState, useRef, useEffect } from 'react';
import { ModalContent, ModalHeader, ModalBody, ModalFooter, Modal } from "@nextui-org/modal";
import { Button, Avatar, Textarea } from '@nextui-org/react';
import { FiSend, FiDownload, FiImage } from "react-icons/fi";
import { RangeCalendar, TimeInput } from "@nextui-org/react";
import { Time } from "@internationalized/date";
import { today, isWeekend, getLocalTimeZone } from "@internationalized/date";
import { useLocale } from "@react-aria/i18n";
import { toast } from 'react-toastify';
import { MdDateRange, MdPeople, MdEmail, MdPhone } from "react-icons/md";
import axios from "axios";
import Swal from 'sweetalert2';
import { useSelector, useDispatch } from 'react-redux';
import { markBookingAsActive } from '@/redux/bookingSlice';

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
const BookingDetailsCard = ({ message, onCheckAvailability, isSenderYou }) => {
  return (
    <div className={`bg-white shadow-md text-black p-4 rounded-lg border border-gray-200 ${isSenderYou ? 'ml-auto' : 'mr-auto'} max-w-full sm:max-w-sm break-words`}>
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
              <li>
                <MdDateRange className="inline-block text-lg" /> 
                <strong> Check-in: </strong> 
                {`${message.formDetails?.checkInOutDates?.start?.day}-${message.formDetails?.checkInOutDates?.start?.month}-${message.formDetails?.checkInOutDates?.start?.year}`}
              </li>
              <li>
                <MdDateRange className="inline-block text-lg" /> 
                <strong> Check-out: </strong> 
                {`${message.formDetails?.checkInOutDates?.end?.day}-${message.formDetails?.checkInOutDates?.end?.month}-${message.formDetails?.checkInOutDates?.end?.year}`}
              </li>
            </>
          )}
          
          {message.formType === 'tableReservation' && (
            <>
              <li><MdDateRange className="inline-block text-lg" /> 
              <strong> Reservation Date:</strong> {`${message.formDetails?.reservationDate?.day}-${message.formDetails?.reservationDate?.month}-${message.formDetails?.reservationDate?.year}`}</li>
              <li><strong>Reservation Time:</strong> {new Date(`1970-01-01T${message.formDetails?.reservationTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</li>
            </>
          )}
          
          {message.formType === 'activityBooking' && (
            <>
              <li>
                <MdDateRange className="inline-block text-lg" /> 
                <strong> Activity Date: </strong> 
                {`${message.formDetails?.visitDate?.day}-${message.formDetails?.visitDate?.month}-${message.formDetails?.visitDate?.year}`}
              </li>
              <li>
                <strong>Activity Time:</strong> 
                {new Date(`1970-01-01T${message.formDetails?.activityTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
              </li>
            </>
          )}

          {message.formType === 'bookingAccepted' && (
            <>
              
              {message.formDetails?.checkInOutDates ? (
                <>
                  <li>
                    <MdDateRange className="inline-block text-lg" /> 
                    <strong> Check-in: </strong>
                    {`${message.formDetails?.checkInOutDates?.start?.day}-${message.formDetails?.checkInOutDates?.start?.month}-${message.formDetails?.checkInOutDates?.start?.year}`}
                  </li>
                  <li>
                    <MdDateRange className="inline-block text-lg" /> 
                    <strong> Check-out: </strong>
                    {`${message.formDetails?.checkInOutDates?.end?.day}-${message.formDetails?.checkInOutDates?.end?.month}-${message.formDetails?.checkInOutDates?.end?.year}`}
                  </li>
                </>
              ) : message.formDetails?.reservationDate ? (
                <>
                  <li>
                    <MdDateRange className="inline-block text-lg" /> 
                    <strong> Reservation Date: </strong>
                    {`${message.formDetails?.reservationDate?.day}-${message.formDetails?.reservationDate?.month}-${message.formDetails?.reservationDate?.year}`}
                  </li>
                  <li>
                    <strong> Reservation Time: </strong>
                    {new Date(`1970-01-01T${message.formDetails?.reservationTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </li>
                </>
              ) : message.formDetails?.visitDate ? (
                <>
                  <li>
                    <MdDateRange className="inline-block text-lg" /> 
                    <strong> Activity Date: </strong>
                    {`${message.formDetails?.visitDate?.day}-${message.formDetails?.visitDate?.month}-${message.formDetails?.visitDate?.year}`}
                  </li>
                  <li>
                    <strong> Activity Time: </strong>
                    {new Date(`1970-01-01T${message.formDetails?.activityTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </li>
                </>
              ) : null}
             
            </>
          )}
          
          <li><strong>Special Requests:</strong> {message.formDetails?.specialRequests || 'None'}</li>
          <li><strong>Total Amount:</strong> ₱{message.formDetails?.amount || '0'}</li>
        </ul>

        {message.formType !== 'bookingAccepted' && (
          <Button auto color="primary" onClick={() => onCheckAvailability(message)} className="mt-2">
            Check Availability
          </Button>
        )}
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
const ChatModal = ({ isOpen, onClose, selectedBooking, selectedUserId }) => {
  const [selectedBookingDetails, setSelectedBookingDetails] = useState(selectedBooking);
  // console.log('selectedBooking', selectedBookingDetails);
  const [selectedUser, setSelectedUser] = useState(selectedUserId);
  // console.log('selectedUser', selectedUser);
  const [messages, setMessages] = useState({});
  const [user_id, setUser_id] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState({ 1: 3, 2: 2, 3: 1 }); // Keep track of unread message counts
  const [messageInput, setMessageInput] = useState('');
  const [activeChatUser, setActiveChatUser] = useState(null);
  const messageEndRef = useRef(null);
  const [isAvailabilityModalOpen, setAvailabilityModalOpen] = useState(false);
  const [currentBookingDetails, setCurrentBookingDetails] = useState(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [users, setUsers] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isOpen) {
      setSelectedUser(selectedUserId);
      // Flatten the users array if it contains nested arrays
      const flattenedUsers = users.flat();
      
      // Find the selected user
      const selectedUser = flattenedUsers.find(user => user.user_id === selectedUserId);
      
      // Check if the user was found before accessing properties
      if (selectedUser) {
        setActiveChatUser(selectedUser);
        // console.log('activeChatUser', selectedUser);
      } else {
        // console.error(`User with ID ${selectedUserId} not found.`);
      }
      
      // Reset unread messages for the selected user using a functional update
      setUnreadMessages(prevUnreadMessages => ({
        ...prevUnreadMessages,
        [selectedUserId]: 0,
      }));
    }
  }, [isOpen, selectedUserId, users]);

  useEffect(() => {
    axios.get('http://localhost:5000/check-login', { withCredentials: true })
      .then(response => {
        if (response.data.isLoggedIn) {  // Check if the user is logged in
          // If logged in, fetch user data
          axios.get('http://localhost:5000/get-userData', { withCredentials: true })
            .then(userResponse => {
              const userId = userResponse.data.userData.user_id;
              setUser_id(userId);
              // console.log('Logged-in user ID:', userId);
            })
            .catch(error => {
              console.error('Error fetching user data:', error.response ? error.response.data.message : 'An unknown error occurred');
              toast.error('Failed to fetch user data');
            });
        } else {
          // console.log('User is not logged in');
          // toast.warning('Please log in to access this feature');
        }
      })
      .catch(error => {
        console.error('Error checking login status:', error.response ? error.response.data.message : 'An unknown error occurred');
        toast.error('Failed to check login status');
      });
  }, []);
  
  useEffect(() => {
    const fetchMessages = async () => {
      if (user_id) {
        try {
          // console.log('userId', user_id);
          const { data } = await axios.get(`http://localhost:5000/businessMessages/${user_id}`);
          // console.log('data', data);
          const fetchedMessages = data.reduce((acc, { userId, messages }) => {
            acc[userId] = messages;
            return acc;
          }, {});
          setMessages(fetchedMessages);
          // console.log('fetchedMessages', fetchedMessages);
          // Extract unique user IDs and fetch users based on them
          const uniqueUserIds = [...new Set(data.map(({ userId }) => userId))];
          // console.log('uniqueUserIds', uniqueUserIds);
          fetchUsers(uniqueUserIds);
        } catch (error) {
          console.error('Error fetching messages:', error.response ? error.response.data.message : 'An unknown error occurred');
          toast.error('Failed to load messages');
        }
      }
    };

    const fetchUsers = async (userIds) => {
      try {
        // Create an array of API requests
        const userRequests = userIds.map(id =>
          axios.get(`http://localhost:5000/usersInChat/${id}`)
        );

        // Resolve all requests concurrently
        const responses = await Promise.all(userRequests);
        const usersData = responses.map(response => response.data);

        setUsers(usersData);
        // console.log('users', usersData);
      } catch (error) {
        console.error('Error fetching users:', error.response ? error.response.data.message : 'An unknown error occurred');
        toast.error('Failed to load users');
      }
    };

    fetchMessages();
  }, [user_id]);

  // Scroll chat to the bottom when new messages arrive
  useEffect(() => {
    // Delay the scroll to ensure the DOM updates
    const scrollTimeout = setTimeout(() => {
      if (messageEndRef.current) {
        messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100); // Adjust the delay as needed
  
    return () => clearTimeout(scrollTimeout); // Cleanup timeout on unmount
  }, [messages, selectedUser]);

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

  // Function to handle image click for preview
  const handleImageClick = (imageUrl) => {
    window.open(imageUrl, '_blank');
  };

  // Function to download the image
  const handleImageDownload = async (imagePath) => {
    try {
      if (imagePath.startsWith('blob:')) {
        // Create a download link directly for the blob URL
        const link = document.createElement('a');
        link.href = imagePath;
        link.download = 'downloaded-image.jpg';  // Default name or customize as needed
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Handle regular server image paths
        const downloadUrl = imagePath.startsWith('http')
          ? imagePath
          : `http://localhost:5000/${imagePath.replace(/\\/g, '/')}`;
        
        // Fetch the image as a blob from the server
        const response = await fetch(downloadUrl);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const blob = await response.blob();
    
        // Create a download link with the fetched blob
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = imagePath.split('/').pop();  // Extract filename from the path
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Failed to download image:', error);
    }
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
  const handleSendMessage = async () => {
    if ((messageInput.trim() !== '' || image) && selectedUser !== null) {
      const formData = new FormData();
      formData.append('sender_id', user_id);
      formData.append('sender_account', 'business');
      formData.append('receiver_id', selectedUser);
      formData.append('receiver_account', 'user');
      formData.append('text', messageInput);
      // formData.append('form_details', ''); // Add any additional form details if needed
      // formData.append('additionalInfo', ''); // Add any additional info if needed
      // formData.append('messageNote', ''); // Add any message note if needed
  
      if (image) {
        formData.append('photo', image); // Append the image file
      }
  
      try {
        const response = await fetch('http://localhost:5000/sendMessage', {
          method: 'POST',
          body: formData,
        });
  
        if (!response.ok) {
          throw new Error('Failed to send message');
        }
  
        const result = await response.json();
        if (result.success) {
          const currentMessages = messages[selectedUser] || [];
          const newMessage = {
            id: result.messageId, // Use the messageId returned from the server
            sender: 'You',
            senderId: user_id,
            senderAccount: 'business',
            receiverId: selectedUser,
            receiverAccount: 'user',
            text: messageInput,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            image: imagePreview
          };

          // console.log('new message', newMessage);
  
          setMessages({
            ...messages,
            [selectedUser]: [...currentMessages, newMessage]
          });
          setMessageInput('');
          setImage(null);
          setImagePreview(null);
          toast.success('Message sent!');
        } else {
          toast.error('Failed to send message');
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('An error occurred while sending the message');
      }
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
    // console.log('users:', userId);
    
    // Flatten the users array if it contains nested arrays
    const flattenedUsers = users.flat();
    
    // Find the selected user
    const selectedUser = flattenedUsers.find(user => user.user_id === userId);
    
    // Check if the user was found before accessing properties
    if (selectedUser) {
      setActiveChatUser(selectedUser);
      // console.log('activeChatUser', selectedUser.name);
    } else {
      // console.error(`User with ID ${userId} not found.`);
    }
    
    // Reset unread messages for the selected user
    setUnreadMessages({
      ...unreadMessages,
      [userId]: 0,
    });
  };  

  // Handle accepting a booking
  const handleAcceptBooking = async (bookingDetails, customMessage) => {
    const baseMessage = `Booking for ${bookingDetails.formDetails.productName} has been accepted.`;
  
    // console.log('customMessage', customMessage);
    // console.log('Booking details', bookingDetails);
  
    const formData = new FormData();
    formData.append('sender_id', user_id);
    formData.append('sender_account', 'business');
    formData.append('receiver_id', selectedUser);
    formData.append('receiver_account', 'user');
    formData.append('text', baseMessage);
    formData.append('formType', 'bookingAccepted');
    formData.append('form_details', JSON.stringify(bookingDetails.formDetails));
  
    try {
      // Update booking status
      const updateResponse = await fetch(`http://localhost:5000/update-booking-status/${bookingDetails?.formDetails?.booking_id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 1 }) // Set status to 'Active'
      });
  
      const updateData = await updateResponse.json();
      if (!updateData.success) {
        throw new Error(updateData.message || 'Failed to accept booking');
      }

      dispatch(markBookingAsActive(bookingDetails?.formDetails?.booking_id));
  
      // Send message after successful booking status update
      const messageResponse = await fetch('http://localhost:5000/sendMessage', {
        method: 'POST',
        body: formData,
      });
  
      if (!messageResponse.ok) {
        throw new Error('Failed to send message');
      }
  
      const result = await messageResponse.json();
      if (result.success) {
        const currentMessages = messages[selectedUser] || [];
        const newMessage = {
          id: result.messageId, // Use the messageId returned from the server
          sender: 'You',
          senderId: user_id,
          senderAccount: 'business',
          receiverId: selectedUser,
          receiverAccount: 'user',
          text: baseMessage, // Store the JSX element directly
          time: formatTime(new Date()),
          formType: 'bookingAccepted',
          formDetails: bookingDetails.formDetails
        };
  
        setMessages({
          ...messages,
          [selectedUser]: [...currentMessages, newMessage]
        });
        toast.success('Booking accepted and message sent!');
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while sending the message');
    }
  };  

  const renderUserList = () => {
    // Flatten the nested array structure
    const flattenedUsers = users.flat();  // Merge nested arrays into a single array
    // console.log('flattenedUsers', flattenedUsers);
    return flattenedUsers.map((user) => (
      <li key={user.user_id}
        className={`p-3 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-300 bg-white ${
          user.user_id === selectedUser ? 'bg-blue-100' : '' // Highlight active user
        }`}
        onClick={() => handleUserClick(user.user_id)}>
        <div className="relative flex items-center gap-3">
          <div className="relative">
            <Avatar 
              radius="md" 
              src={user.image_path 
                ? `http://localhost:5000/${user.image_path}` 
                : user.image 
                  ? user.image 
                  : `https://ui-avatars.com/api/?name=${user.name}`} 
              alt={user.name} 
            />
            <UnreadBadge count={unreadMessages[user.user_id] || 0} />  {/* Handle missing counts */}
          </div>
          <span className="text-black">{user.name}</span>
        </div>
        <span className={`w-3 h-3 rounded-full ${user?.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
      </li>
    ));
  };

  const renderMessages = (messages) => {
    let lastMessageTime = null;
  
    return messages?.map((message, index) => {
      const isSenderYou = ((message.senderId === user_id) && (message.senderAccount === 'business'));
      const imageUrl = message.image
        ? message.image.startsWith('blob:')
          ? message.image
          : `http://localhost:5000/${message.image.replace(/\\/g, '/')}`
        : null;
  
      const messageTime = new Date(message.time);
      const now = new Date();
      const isToday = messageTime.toDateString() === now.toDateString();
      const showTime = index === 0 || (lastMessageTime && (messageTime - lastMessageTime) > 600000);
      lastMessageTime = messageTime;
  
      return (
        <div key={message.id}>
          {showTime && (
            <div className="text-center text-xs text-gray-500 mb-2">
              {isToday
                ? messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
                : messageTime.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
            </div>
          )}
          <div className={`flex ${isSenderYou ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`p-4 rounded-lg max-w-[70%] ${isSenderYou ? 'bg-gray-200 text-black' : 'bg-blue-600 text-white'} shadow-md`}>
              {message.formType ? (
                <BookingDetailsCard
                  message={message}
                  onCheckAvailability={handleCheckAvailability}
                  isSenderYou={isSenderYou}
                />
              ) : (
                <>
                  {message.text && <p className="break-words mb-2">{message.text}</p>}
                  {imageUrl && (
                    <div className="relative">
                      <img
                        src={imageUrl}
                        alt="Sent"
                        className="mt-2 rounded-md max-w-full cursor-pointer"
                        style={{ maxHeight: '400px', objectFit: 'cover' }}
                        onClick={() => handleImageClick(imageUrl)}
                      />
                      <button
                        onClick={() => handleImageDownload(imageUrl)}
                        className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-md"
                      >
                        <FiDownload size={16} className="text-black" />
                      </button>
                    </div>
                  )}
                  {message.additionalInfo && (
                    <p className="text-sm text-gray-300 mb-2">{message.additionalInfo}</p>
                  )}
                  {message.messageNote && (
                    <p className="text-sm text-gray-300 mb-2">
                      <strong>Message:</strong> {message.messageNote}
                    </p>
                  )}
                  {message.formDetails &&
                    Object.keys(message.formDetails).some((key) => message.formDetails[key] !== null) && (
                      <BookingDetailsCard
                        message={message}
                        isSender={isSenderYou}
                        onCheckAvailability={handleCheckAvailability}
                      />
                    )}
                </>
              )}
            </div>
          </div>
        </div>
      );
    });
  };

  const handleClose = () => {
    setSelectedUser(null); // Set selectedUser to null
    setSelectedBookingDetails(null);
    onClose(); // Call the original onClose function
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} hideCloseButton={true} size="full"
      className="bg-white transition-colors duration-300 w-full h-full">
      <ModalContent className="w-full h-full">
        <ModalHeader className="flex justify-between items-center px-6 py-4">
          <h2 className="text-2xl font-bold text-black">Chat</h2>
          <div className="flex items-center space-x-4">
            <Button auto onClick={handleClose} className="bg-color1 text-white">
              Close
            </Button>
          </div>
        </ModalHeader>

        <ModalBody className="flex flex-col lg:flex-row gap-4 overflow-y-auto max-h-screen p-6 bg-gray-100 text-black">
          {/* Sidebar for user list */}
          <div className="w-full lg:w-1/4 bg-gray-200 p-4 rounded-lg">
            <h3 className="font-semibold mb-4">Available Users</h3>
            <ul className="space-y-3">
              {renderUserList()}
            </ul>
          </div>

          {/* Main chat area */}
          <div className="flex flex-col justify-between w-full lg:w-3/4 h-full bg-white rounded-md p-4">
            {selectedUser ? (
              <>
                <div className="flex items-center space-x-3 p-3 bg-blue-900 text-white rounded-t-lg">
                  <img
                    src={activeChatUser.image_path 
                      ? `http://localhost:5000/${activeChatUser.image_path}` 
                      : activeChatUser.image 
                        ? activeChatUser.image 
                        : `https://ui-avatars.com/api/?name=${activeChatUser.name}`} 
                    alt="User Avatar"
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex flex-col">
                    <span className="font-semibold">{activeChatUser.name}</span>
                    <span className="text-sm text-green-400">Active now</span>
                  </div>
                </div>

                {/* Render messages */}
                <div className="flex-grow overflow-y-auto">
                  {renderMessages(messages[selectedUser])}
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
                  <Button onClick={handleSendMessage} color="primary" className="rounded-lg h-full max-w-[100px] w-full">
                    <FiSend />
                  </Button>
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
