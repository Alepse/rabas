import React, { useState, useRef, useEffect } from 'react';
import { ModalContent, ModalHeader, ModalBody, Modal } from "@nextui-org/modal";
import { Button, Input, Avatar } from '@nextui-org/react';
import { FiSend, FiImage, FiDownload } from "react-icons/fi";
import { toast } from 'react-toastify';
import { MdDateRange, MdPeople, MdEmail, MdPhone } from "react-icons/md";
import axios from 'axios';

// Sample data for businesses
const sampleBusinesses = [
  { id: 1, name: 'Business One', status: 'online', avatarUrl: 'https://i.pravatar.cc/150?u=business1' },
  { id: 2, name: 'Business Two', status: 'offline', avatarUrl: 'https://i.pravatar.cc/150?u=business2' },
  { id: 3, name: 'Business Three', status: 'online', avatarUrl: 'https://i.pravatar.cc/150?u=business3' },
];

// Component for rendering booking details
const BookingDetailsCard = ({ message, isSender }) => {
  return (
    <div className={`bg-white shadow-md text-black p-4 rounded-lg border border-gray-200 mt-2`}>
      <h4 className="font-semibold mb-2">Booking Details:</h4>
      <ul className="space-y-1">
        <li><strong>Product:</strong> {message.formDetails?.productName || 'Sample Product'}</li>
        <li><MdPeople className="inline-block text-lg" /> <strong> Guests:</strong> {message.formDetails?.numberOfGuests || '2'}</li>
        <li><MdEmail className="inline-block text-lg" /> <strong> Email:</strong> {message.formDetails?.email || 'john.doe@example.com'}</li>
        <li><MdPhone className="inline-block text-lg" /> <strong> Phone:</strong> {message.formDetails?.phone || '123-456-7890'}</li>
        {message.formDetails?.visitDate && (
          <>
            <li><MdDateRange className="inline-block text-lg" /> <strong> Activity Date:</strong> {message.formDetails.visitDate}</li>
            <li><strong>Activity Time:</strong> {message.formDetails.activityTime}</li>
          </>
        )}
        {message.formDetails?.checkInOutDates && (
          <>
            <li><MdDateRange className="inline-block text-lg" /> <strong> Check-in:</strong> {message.formDetails.checkInOutDates.start}</li>
            <li><MdDateRange className="inline-block text-lg" /> <strong> Check-out:</strong> {message.formDetails.checkInOutDates.end}</li>
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
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState({});
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState({ 1: 3, 2: 2, 3: 1 });
  const messageEndRef = useRef(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const user_id = 101;

  useEffect(() => {
    // Fetch messages from the server
    const fetchMessages = () => {
      axios.get(`http://localhost:5000/userMessages/${user_id}`)
        .then(({ data }) => {
          const fetchedMessages = data.reduce((acc, { businessId, messages }) => {
            acc[businessId] = messages;
            return acc;
          }, {});
          setMessages(fetchedMessages);
        })
        .catch(error => {
          console.error('Error fetching messages:', error.response ? error.response.data.message : 'An unknown error occurred');
          toast.error('Failed to load messages');
        });
    };
  
    fetchMessages();
  }, [user_id]);

  // Scroll chat to the bottom when new messages arrive
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedBusiness]);

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
      formData.append('receiver_id', selectedBusiness);
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
          const currentMessages = messages[selectedBusiness] || [];
          const newMessage = {
            id: result.messageId, // Use the messageId returned from the server
            sender: 'You',
            senderId: user_id,
            receiverId: selectedBusiness,
            text: messageInput,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            image: imagePreview
          };
  
          setMessages({
            ...messages,
            [selectedBusiness]: [...currentMessages, newMessage]
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

  // Function to handle image click for preview
  const handleImageClick = (imageUrl) => {
    window.open(imageUrl, '_blank');
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

  // Handle key press in the input field
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Handle business selection from list
  const handleBusinessClick = (businessId) => {
    setSelectedBusiness(businessId);
    setUnreadMessages({
      ...unreadMessages,
      [businessId]: 0, // Reset unread messages for the selected business
    });
  };

  // Function to render messages
  const renderMessages = (messages) => {
    return messages.map((message) => {
      const isSenderYou = message.senderId === user_id;
      return (
        <div
          key={message.id}
          className={`flex ${isSenderYou ? 'justify-end' : 'justify-start'} mb-4`}
        >
          <div
            className={`p-4 rounded-lg max-w-[70%] ${
              isSenderYou ? 'bg-gray-200 text-black' : 'bg-blue-600 text-white'
            } shadow-md`}
          >
            <p className="break-words mb-2">{message.text}</p>
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
            {message.additionalInfo && (
              <p className="text-sm text-gray-300 mb-2">{message.additionalInfo}</p>
            )}
            {message.messageNote && (
              <p className="text-sm text-gray-300 mb-2"><strong>Message:</strong> {message.messageNote}</p>
            )}
            {message.formDetails && Object.keys(message.formDetails).some(key => message.formDetails[key] !== null) && (
              <BookingDetailsCard message={message} isSender={isSenderYou} />
            )}
          </div>
        </div>
      );
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
          {/* Sidebar for business list */}
          <div className="w-full lg:w-1/4 bg-gray-200 p-4 rounded-lg">
            <h3 className="font-semibold mb-4">Available Businesses</h3>
            <ul className="space-y-3">
              {sampleBusinesses.map((business) => (
                <li key={business.id}
                  className="p-3 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-300 bg-white"
                  onClick={() => handleBusinessClick(business.id)}>
                  <div className="relative flex items-center gap-3">
                    <div className="relative">
                      <Avatar radius="md" src={business.avatarUrl} alt={business.name} />
                      <UnreadBadge count={unreadMessages[business.id]} />
                    </div>
                    <span className="text-black">{business.name}</span>
                  </div>
                  <span className={`w-3 h-3 rounded-full ${business.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                </li>
              ))}
            </ul>
          </div>

          {/* Main chat area */}
          <div className="flex flex-col justify-between w-full lg:w-3/4 h-full bg-white rounded-md p-4">
            {selectedBusiness ? (
              <>
                <div className="flex flex-col space-y-3 overflow-y-auto scrollbar-custom">
                  <h3 className="font-semibold mb-2 text-black">
                    Chat with {sampleBusinesses.find(b => b.id === selectedBusiness).name}
                  </h3>
                  {renderMessages(messages[selectedBusiness])}
                  <div ref={messageEndRef}></div>
                </div>

                <div className="flex items-center space-x-2 mt-4 justify-between ">
                  <textarea
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
