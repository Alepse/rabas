import React, { useState, useRef, useEffect } from 'react';
import { ModalContent, ModalHeader, ModalBody, Modal } from "@nextui-org/modal";
import { Button, Input, Avatar, Textarea } from '@nextui-org/react';
import { FiSend, FiImage, FiDownload, FiArrowDown } from "react-icons/fi";
import { toast } from 'react-toastify';
import { MdDateRange, MdPeople, MdEmail, MdPhone, MdClose } from "react-icons/md";
import axios from 'axios';
// Use the environment variable for the base URL
const BASE_URL = import.meta.env.VITE_BASE_URL; 

// Component for rendering booking details
const BookingDetailsCard = ({ message, isSender }) => {
  return (
    <div className={`bg-white shadow-md text-black p-4 rounded-lg border border-gray-200 mt-2`}>
      <h4 className="font-semibold mb-2">Booking Details:</h4>
      <ul className="space-y-1">
        <li><strong>Product:</strong> {message.formDetails?.productName || 'No product provided'}</li>
        <li><MdPeople className="inline-block text-lg" /> <strong> Guests:</strong> {message.formDetails?.numberOfGuests || 'No guests provided'}</li>
        <li><MdEmail className="inline-block text-lg" /> <strong> Email:</strong> {message.formDetails?.email || 'No email provided'}</li>
        <li><MdPhone className="inline-block text-lg" /> <strong> Phone:</strong> {message.formDetails?.phone || 'No number provided'}</li>
         
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
            <li><MdDateRange className="inline-block text-lg" /> <strong> Reservation Date:</strong> {`${message.formDetails?.reservationDate?.day}-${message.formDetails?.reservationDate?.month}-${message.formDetails?.reservationDate?.year}`}</li>
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
              <strong>Activity Time: </strong> 
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
        <li><strong>Total Amount:</strong> {message.formDetails?.amount || '₱0'}</li>
      </ul>
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

// Add a new component for the product card
const ProductCard = ({ product }) => (
  <div className="flex flex-col sm:flex-row items-center p-4 bg-white shadow-md rounded-lg border border-gray-200">
    <img 
      src={product.imageUrl} 
      alt={product.productName} 
      className="w-full sm:w-32 h-32 rounded-md mb-4 sm:mb-0 sm:mr-4 object-cover" 
    />
    <div className="text-center sm:text-left">
      <h4 className="font-bold text-lg">{product.productName}</h4>
      <p className="text-gray-700">₱{product.price}</p>
    </div>
  </div>
);

// User Chat Modal Component
const UserChatModal = ({ isOpen, onClose }) => {
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState({});
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState({ 1: 3, 2: 2, 3: 1 });
  const messageEndRef = useRef(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [user_id, setUser_id] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false); // State for arrow visibility

  useEffect(() => {
    axios.get(`${BASE_URL}/check-login`, { withCredentials: true })
      .then(response => {
        if (response.data.isLoggedIn) {  // Check if the user is logged in
          // If logged in, fetch user data
          axios.get(`${BASE_URL}/get-userData`, { withCredentials: true })
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
    // Only run if user_id is not null
    if (user_id) {
      const fetchMessages = async () => {
        try {
          const { data } = await axios.get(`${BASE_URL}/userMessages/${user_id}`);
          // console.log('data', data);
  
          // Reduce messages into a dictionary keyed by businessId
          const fetchedMessages = data.reduce((acc, { businessId, messages }) => {
            acc[businessId] = messages;
            return acc;
          }, {});
          setMessages(fetchedMessages);
  
          // Extract unique business IDs and sort them based on the latest message timestamp
          const uniqueBusinessIds = [...new Set(data.map(({ businessId }) => businessId))];
          const sortedBusinessIds = uniqueBusinessIds.sort((a, b) => {
            // Get the latest message timestamp for each business
            const latestMessageA = data.find(({ businessId }) => businessId === a)?.messages.at(-1)?.time;
            const latestMessageB = data.find(({ businessId }) => businessId === b)?.messages.at(-1)?.time;
  
            // Sort by time in descending order (latest first)
            return new Date(latestMessageB) - new Date(latestMessageA);
          });
  
          // console.log('sortedBusinessIds', sortedBusinessIds);
  
          // Fetch businesses based on the sorted business IDs
          fetchBusinesses(sortedBusinessIds);
        } catch (error) {
          setMessages({});
          console.error('Error fetching messages:', error.response ? error.response.data.message : 'An unknown error occurred');
          toast.error('Failed to load messages');
        }
      };
  
      const fetchBusinesses = async (businessIds) => {
        try {
          const businessRequests = businessIds.map((id) =>
            axios.get(`${BASE_URL}/businessesInChat/${id}`)
          );
          const responses = await Promise.all(businessRequests);
          const businessesData = responses.map((response) => response.data);
          setBusinesses(businessesData);
          console.log('businesses', businessesData);
        } catch (error) {
          console.error('Error fetching businesses:', error.response ? error.response.data.message : 'An unknown error occurred');
          toast.error('Failed to load businesses');
        }
      };
  
      fetchMessages();
    }
  }, [user_id]); // Dependency array ensures it re-runs only when user_id changes
  
  
  useEffect(() => {
    // Polling function to fetch new messages
    const fetchNewMessages = async () => {
      try {
        const { data } = await axios.get(`${BASE_URL}/userMessages/${user_id}`);
        // console.log('data', data);
  
        // Reduce messages into a dictionary keyed by businessId
        const fetchedMessages = data.reduce((acc, { businessId, messages }) => {
          acc[businessId] = messages;
          return acc;
        }, {});
        
        // Check if there are new messages
        if (JSON.stringify(fetchedMessages) !== JSON.stringify(messages)) {
          scrollToBottom();
          setMessages(fetchedMessages);
        }
  
        // Extract unique business IDs and sort them based on the latest message timestamp
        const uniqueBusinessIds = [...new Set(data.map(({ businessId }) => businessId))];
        const sortedBusinessIds = uniqueBusinessIds.sort((a, b) => {
          // Get the latest message timestamp for each business
          const latestMessageA = data.find(({ businessId }) => businessId === a)?.messages.at(-1)?.time;
          const latestMessageB = data.find(({ businessId }) => businessId === b)?.messages.at(-1)?.time;
  
          // Sort by time in descending order (latest first)
          return new Date(latestMessageB) - new Date(latestMessageA);
        });
  
        // console.log('sortedBusinessIds', sortedBusinessIds);
  
        // Fetch businesses based on the sorted business IDs
        fetchBusinesses(sortedBusinessIds);
      } catch (error) {
        console.error('Error fetching messages:', error.response ? error.response.data.message : 'An unknown error occurred');
        toast.error('Failed to load messages');
      }
    };
  
    const fetchBusinesses = async (businessIds) => {
      try {
        const businessRequests = businessIds.map((id) =>
          axios.get(`${BASE_URL}/businessesInChat/${id}`)
        );
        const responses = await Promise.all(businessRequests);
        const businessesData = responses.map((response) => response.data);
        setBusinesses(businessesData);
      } catch (error) {
        console.error('Error fetching businesses:', error.response ? error.response.data.message : 'An unknown error occurred');
        toast.error('Failed to load businesses');
      }
    };
  
    // Set an interval to fetch new messages every 5 seconds
    const intervalId = setInterval(fetchNewMessages, 5000);
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [messages]); // Dependency array ensures it re-runs when messages change  

  // Scroll chat to the bottom when new messages arrive
  const scrollToBottom = () => {
    const chatContainer = messageEndRef.current?.parentNode; // Get the parent node of the ref
    if (chatContainer) {
      const isAtBottom = chatContainer.scrollHeight - chatContainer.scrollTop <= chatContainer.clientHeight + 1; // Check if at the bottom
      if (isAtBottom) {
        // Delay the scroll to ensure the DOM updates
        const scrollTimeout = setTimeout(() => {
          messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }, 100); // Adjust the delay as needed

        return () => clearTimeout(scrollTimeout); // Cleanup timeout on unmount
      }
    }
  };

  const sudoToBottom = () => {
    const scrollTimeout = setTimeout(() => {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }, 100); // Adjust the delay as needed

    return () => clearTimeout(scrollTimeout); // Cleanup timeout on unmount
  };

  // Function to handle scrolling to the bottom
  const handleScrollToBottom = () => {
    sudoToBottom();
  };
  

  // Check scroll position to show/hide the arrow
  const handleScroll = () => {
    const chatContainer = messageEndRef.current?.parentNode; 
    if (chatContainer) {
      const isAtBottom = chatContainer.scrollHeight - chatContainer.scrollTop <= chatContainer.clientHeight + 1;
      const threshold = 1000; // Adjust this value to set how far from the bottom the button should appear

      // Show arrow if not at the bottom and the scroll position is greater than the threshold
      setShowScrollToBottom(!isAtBottom && (chatContainer.scrollHeight - chatContainer.scrollTop > threshold));
    }
  };

  useEffect(() => {
    // Attach scroll event listener
    const chatContainer = messageEndRef.current?.parentNode; 
    if (chatContainer) {
      chatContainer.addEventListener('scroll', handleScroll);
    }

    // Cleanup event listener on unmount
    return () => {
      if (chatContainer) {
        chatContainer.removeEventListener('scroll', handleScroll);
      }
    };
  });

  // Handle image selection
  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Add a function to handle image removal
  const handleImageRemove = () => {
    setImage(null);
    setImagePreview(null);
  };

  // Handle sending messages
  const handleSendMessage = async () => {
    if ((messageInput.trim() !== '' || image) && selectedBusiness !== null) {
      const formData = new FormData();
      formData.append('sender_id', user_id);
      formData.append('sender_account', 'user');
      formData.append('receiver_id', selectedBusiness);
      formData.append('receiver_account', 'business');
      formData.append('text', messageInput);
  
      if (image) {
        formData.append('photo', image); // Append the image file
      }
  
      // Create a new message object
      const newMessage = {
        id: Date.now(), // Temporary ID until we get the response
        sender: 'You',
        senderId: user_id,
        senderAccount: 'user',
        receiverId: selectedBusiness,
        receiverAccount: 'business',
        text: messageInput,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        image: imagePreview,
        status: 'sending', // Indicate the initial status as 'sending'
      };
  
      // Scroll to the bottom
      scrollToBottom();
  
      // Update messages state immediately
      const currentMessages = messages[selectedBusiness] || [];
      setMessages({
        ...messages,
        [selectedBusiness]: [...currentMessages, newMessage],
      });
  
      setMessageInput('');
      setImage(null);
      setImagePreview(null);
  
      try {
        const response = await fetch(`${BASE_URL}/sendMessage`, {
          method: 'POST',
          body: formData,
        });
  
        if (!response.ok) {
          throw new Error('Failed to send message');
        }
  
        const result = await response.json();
        if (result.success) {
          // Update the message with the actual ID from the server and set status to 'sent'
          setMessages(prevMessages => ({
            ...prevMessages,
            [selectedBusiness]: prevMessages[selectedBusiness].map(msg =>
              msg.id === newMessage.id ? { ...msg, id: result.messageId, status: 'sent' } : msg
            ),
          }));
          toast.success('Message sent!');
        } else {
          throw new Error('Failed to send message');
        }
      } catch (error) {
        console.error('Error:', error);
  
        // Mark the message as 'failed'
        setMessages(prevMessages => ({
          ...prevMessages,
          [selectedBusiness]: prevMessages[selectedBusiness].map(msg =>
            msg.id === newMessage.id ? { ...msg, status: 'failed' } : msg
          ),
        }));
  
        toast.error('An error occurred while sending the message');
      }
    }
  };

  const resendMessage = async (failedMessage) => {
    const { id, senderId, senderAccount, receiverId, receiverAccount, text, image } = failedMessage;
  
    const formData = new FormData();
    formData.append('sender_id', senderId);
    formData.append('sender_account', senderAccount);
    formData.append('receiver_id', receiverId);
    formData.append('receiver_account', receiverAccount);
    formData.append('text', text);
  
    if (image) {
      formData.append('photo', image); // Append the image file
    }
  
    // Update the status of the message to 'resending'
    setMessages(prevMessages => ({
      ...prevMessages,
      [receiverId]: prevMessages[receiverId].map(msg =>
        msg.id === id ? { ...msg, status: 'resending' } : msg
      ),
    }));
  
    try {
      const response = await fetch(`${BASE_URL}/sendMessage`, {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error('Failed to resend message');
      }
  
      const result = await response.json();
      if (result.success) {
        // Update the message with the actual ID from the server and set status to 'sent'
        setMessages(prevMessages => ({
          ...prevMessages,
          [receiverId]: prevMessages[receiverId].map(msg =>
            msg.id === id ? { ...msg, id: result.messageId, status: 'sent' } : msg
          ),
        }));
        toast.success('Message resent successfully!');
      } else {
        throw new Error('Failed to resend message');
      }
    } catch (error) {
      console.error('Error:', error);
  
      // Revert the status back to 'failed'
      setMessages(prevMessages => ({
        ...prevMessages,
        [receiverId]: prevMessages[receiverId].map(msg =>
          msg.id === id ? { ...msg, status: 'failed' } : msg
        ),
      }));
  
      toast.error('An error occurred while resending the message');
    }
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
          : `${BASE_URL}/${imagePath.replace(/\\/g, '/')}`;
        
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
  
  // Handle key press in the input field
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent the default behavior of adding a newlin 
      handleSendMessage();
    }
  };

  // Handle business selection from list
  const handleBusinessClick = (businessId) => {
    setSelectedBusiness(businessId);
    
    // Flatten the businesses array
    const flattenedBusinesses = businesses.flat();
    
    // Find the selected business
    const selectedBusiness = flattenedBusinesses.find(business => business.user_id === businessId);

    // Check if the business was found
    if (selectedBusiness) {
      setActiveChatUser(selectedBusiness);
      // console.log('active chat user: ', activeChatUser);
    } else {
      // console.error(`Business with ID ${businessId} not found.`);
    }
    
    // Reset unread messages for the selected business
    setUnreadMessages({
      ...unreadMessages,
      [businessId]: 0,
    });
    sudoToBottom();
  };
  
  // Function to get business by ID
  const getBusinessById = (businessId) => {
    return businesses.find(business => business.id === businessId);
  };

  // Function to render messages
  const renderMessages = (messages) => {
    let lastMessageTime = null;
    const lastMessage = messages && messages[messages.length - 1]; // Get the last message

    return messages.map((message, index) => {
      const isSenderYou = ((message.senderId === user_id) && (message.senderAccount === 'user'));
      const imageUrl = message.image
        ? message.image.startsWith('blob:')
          ? message.image
          : `${BASE_URL}/${message.image.replace(/\\/g, '/')}`
        : null;

      const messageTime = new Date(message.time);
      const now = new Date();
      const isToday = messageTime.toDateString() === now.toDateString();
      const showTime = index === 0 || (lastMessageTime && (messageTime - lastMessageTime) > 600000);
      lastMessageTime = messageTime;

      return (
        <div key={message.id}>
          {/* Time Display */}
          {showTime && (
            <div className="text-center text-xs text-gray-500 mb-2">
              {isToday
                ? messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
                : messageTime.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
            </div>
          )}

          {/* Message Content */}
          <div className={`flex ${isSenderYou ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`p-4 rounded-lg max-w-[70%] ${isSenderYou ? 'bg-gray-200 text-black' : 'bg-color1 text-white'} shadow-md`}>
              {/* Message Text */}
              {message.text && <p className="break-words mb-2">{message.text}</p>}

              {/* Image Handling */}
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

              {/* Additional Information */}
              {message.additionalInfo && (
                <p className="text-sm text-gray-300 mb-2">{message.additionalInfo}</p>
              )}

              {/* Message Note */}
              {message.messageNote && (
                <p className="text-sm text-gray-300 mb-2">
                  <strong>Message:</strong> {message.messageNote}
                </p>
              )}

              {/* Form Details Rendering */}
              {message.formDetails &&
                Object.keys(message.formDetails).some((key) => message.formDetails[key] !== null) && (
                  <BookingDetailsCard message={message} isSender={isSenderYou} />
                )}
            </div>
          </div>

          {/* Message Status */}
          {isSenderYou && (
            <div className="flex justify-end">
              {message.status === 'sending' && (
                <span className="text-sm text-gray-500">Sending...</span>
              )}
              {(message.status === 'sent' || (!message.status && message === lastMessage)) && (
                <span className="text-sm text-gray-500">Sent</span>
              )}
              {message.status === 'failed' && (
                <div className="text-sm text-red-500 flex items-center gap-2">
                  Failed
                  <button
                    onClick={() => resendMessage(message)}
                    className="text-blue-500 underline text-sm"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      );
    });
  };

  // Function to render business list
  const renderBusinessList = () => {
    // Flatten the nested array structure
    const flattenedBusinesses = businesses.flat();  // Merge nested arrays into a single array
    // console.log('flattenedBusinesses', flattenedBusinesses);
    // console.log('selectedBusienss: ', selectedBusiness);
    return flattenedBusinesses.map((business) => (
      <li key={business.id}
        className={`p-3 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-300 ${
          selectedBusiness == business.user_id ? 'bg-gray-300' : 'bg-white' // Highlight active business
        }`}
        onClick={() => handleBusinessClick(business.user_id)}>
        <div className="relative flex items-center gap-3">
          <div className="relative">
            <Avatar radius="md" src={`${BASE_URL}/${business.avatarUrl}`} alt={business.name} />
            <UnreadBadge count={unreadMessages[business.id] || 0} />  {/* Handle missing counts */}
          </div>
          <span className="text-black">{business.name}</span>
        </div>
        <span className={`w-3 h-3 rounded-full ${business?.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
      </li>
    ));
  };

  const handleClose = () => {
    setSelectedBusiness(null); // Set selectedBusiness to null
    onClose(); // Call the original onClose function
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} hideCloseButton={true} size="full"
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
          {/* Sidebar for business list */}
          <div className="w-full lg:w-1/4 bg-gray-200 p-4 rounded-lg">
            <h3 className="font-semibold mb-4">Available Businesses</h3>
            <ul className="space-y-3">
              {renderBusinessList()}
            </ul>
          </div>

          {/* Main chat area */}
          <div className="flex flex-col justify-between w-full lg:w-3/4 h-full bg-white rounded-md p-4 relative">
            {selectedBusiness ? (
              <>
                <div className="flex items-center space-x-3 p-3 bg-color1 text-white rounded-t-lg">
                  <img
                    src={activeChatUser.avatarUrl 
                      ? `${BASE_URL}/${activeChatUser.avatarUrl}` 
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
                <div className="flex-grow overflow-y-auto relative">
                  {renderMessages(messages[selectedBusiness])}
                  <div ref={messageEndRef}></div>
                </div>

                 {/* Scroll to bottom arrow */}
                 {showScrollToBottom && (
                    <div className={`absolute bottom-24 left-1/2 transform -translate-x-1/2 z-10 scroll-button ${showScrollToBottom ? 'visible animate' : 'hidden'}`}>
                      <button onClick={handleScrollToBottom} className="bg-gray-200 p-2 rounded-full shadow-md">
                        <FiArrowDown size={24} className="text-black" />
                      </button>
                    </div>
                  )}

                <div className="flex items-center space-x-2 mt-4 justify-between">
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
                     <MdClose className='text-red-500 text-xl'></MdClose>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-grow items-center justify-center text-gray-500">
                <p>Select a business to start a conversation</p>
              </div>
            )}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default UserChatModal;
