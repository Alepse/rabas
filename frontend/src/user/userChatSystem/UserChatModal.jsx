import React, { useState, useRef, useEffect } from 'react';
import { ModalContent, ModalHeader, ModalBody, Modal } from "@nextui-org/modal";
import { Button, Input, Avatar } from '@nextui-org/react';
import { FiSend, FiImage, FiDownload } from "react-icons/fi";
import { toast } from 'react-toastify';
import { MdDateRange, MdPeople, MdEmail, MdPhone } from "react-icons/md";

// Component for rendering booking details
const BookingDetailsCard = ({ message, isSender }) => {
  return (
    <div className={`bg-white shadow-md text-black p-4 rounded-lg border border-gray-200 ${isSender ? 'ml-auto' : 'mr-auto'} max-w-full sm:max-w-sm`}>
      <div className="flex justify-between items-center mb-1">
        <strong className="text-lg">{message.sender}</strong>
        <span className="text-xs text-gray-500 ">{message.time}</span>
      </div>
      <p className="font-semibold mb-2 break-words ">{message.text}</p>
      {message.additionalInfo && (
        <p className="text-sm text-gray-700 mb-2 break-words ">{message.additionalInfo}</p>
      )}
      {message.messageNote && (
        <p className="text-sm text-gray-700 mb-2 break-words "><strong>Message:</strong> {message.messageNote}</p>
      )}

      {/* Image Placeholder */}
      <div className="my-2 bg-gray-200 flex items-center justify-center rounded-lg w-full h-44">
        <span>200 x 200</span>
      </div>

      <div className="p-3 mt-3 bg-gray-50 rounded-lg text-sm text-black border border-gray-200 break-words">
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
          {message.formDetails?.reservationDate && (
            <>
              <li><MdDateRange className="inline-block text-lg" /> <strong> Reservation Date:</strong> {message.formDetails.reservationDate}</li>
              <li><strong>Reservation Time:</strong> {message.formDetails.reservationTime}</li>
            </>
          )}
          <li><strong>Special Requests:</strong> {message.formDetails?.specialRequests || 'None'}</li>
          <li><strong>Total Amount:</strong> {message.formDetails?.amount || '₱0'}</li>
        </ul>
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
  const [unreadMessages, setUnreadMessages] = useState({ 1: 3, 2: 2, 3: 1 }); // Keep track of unread message counts
  const messageEndRef = useRef(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const businesses = [
    { id: 1, name: 'Business One', status: 'online', avatarUrl: 'https://i.pravatar.cc/150?u=business1' },
    { id: 2, name: 'Business Two', status: 'offline', avatarUrl: 'https://i.pravatar.cc/150?u=business2' },
    { id: 3, name: 'Business Three', status: 'online', avatarUrl: 'https://i.pravatar.cc/150?u=business3' },
  ];

  const initialMessages = {
    1: [
      { 
        id: 1, 
        sender: 'You', 
        text: 'Here are the details of your activity booking:', 
        time: '10:00 AM', 
        formDetails: {
          productName: 'Hiking Adventure', 
          numberOfGuests: 3, 
          email: 'bobjohnson@example.com', 
          phone: '321-654-9870', 
          visitDate: '2024-11-01', 
          activityTime: '10:00 AM', 
          specialRequests: 'Need a guide, bring extra snacks', 
          amount: '₱0'
        }
      },
      { 
        id: 2, 
        sender: 'Business One', 
        text: 'Booking for Hiking Adventure has been accepted.',
        additionalInfo: 'Activity Date: 2024-11-01\nActivity Time: 10:00 AM',
        messageNote: 'dad',
        time: '2:02 PM', 
        formDetails: {
          productName: 'Hiking Adventure', 
          numberOfGuests: 3, 
          email: 'bobjohnson@example.com', 
          phone: '321-654-9870', 
          visitDate: '2024-11-01', 
          activityTime: '10:00 AM', 
          specialRequests: 'Need a guide, bring extra snacks', 
          amount: '₱0'
        }
      },
      // Additional sample messages
      { 
        id: 3, 
        sender: 'You', 
        text: 'Is this still available?', 
        time: '3:00 PM',
        formDetails: {
          productName: 'Hiking Adventure', // Example product name
          price: 1500, // Example price
          imageUrl: 'https://via.placeholder.com/200' // Example image placeholder
        }
      },
      { 
        id: 4, 
        sender: 'Business One', 
        text: 'Sure, please let us know the new date.', 
        time: '3:05 PM'
      },
    ],
    2: [
      { 
        id: 1, 
        sender: 'You', 
        text: 'Here are the details of your accommodation booking:', 
        time: '10:15 AM', 
        formDetails: {
          productName: 'Luxury Suite', 
          numberOfGuests: 2, 
          email: 'alice.smith@example.com', 
          phone: '789-456-1230', 
          checkInOutDates: { start: '2024-10-20', end: '2024-10-22' }, 
          specialRequests: 'Late check-in', 
          amount: '₱5000'
        }
      },
      { 
        id: 2, 
        sender: 'Business Two', 
        text: 'Booking for Luxury Suite has been accepted.',
        additionalInfo: 'Check-in: 2024-10-20\nCheck-out: 2024-10-22',
        messageNote: 'dad',
        time: '2:15 PM', 
        formDetails: {
          productName: 'Luxury Suite', 
          numberOfGuests: 2, 
          email: 'alice.smith@example.com', 
          phone: '789-456-1230', 
          checkInOutDates: { start: '2024-10-20', end: '2024-10-22' }, 
          specialRequests: 'Late check-in', 
          amount: '₱5000'
        }
      },
      // Additional sample messages
      { 
        id: 3, 
        sender: 'You', 
        text: 'Is breakfast included?', 
        time: '3:30 PM'
      },
      { 
        id: 4, 
        sender: 'Business Two', 
        text: 'Yes, breakfast is included in your booking.', 
        time: '3:35 PM'
      },
    ],
    3: [
      { 
        id: 1, 
        sender: 'You', 
        text: 'Here are the details of your table reservation:', 
        time: '10:25 AM', 
        formDetails: {
          productName: 'Mountain View Dining', 
          numberOfGuests: 4, 
          email: 'janedoe@example.com', 
          phone: '123-456-7890', 
          reservationDate: '2024-10-15', 
          reservationTime: '6:00 PM', 
          specialRequests: 'Window seat', 
          amount: '₱2000'
        }
      },
      { 
        id: 2, 
        sender: 'Business Three', 
        text: 'Booking for Mountain View Dining has been accepted.',
        additionalInfo: 'Reservation Date: 2024-10-15\nReservation Time: 6:00 PM',
        messageNote: 'dad',
        time: '2:25 PM', 
        formDetails: {
          productName: 'Mountain View Dining', 
          numberOfGuests: 4, 
          email: 'janedoe@example.com', 
          phone: '123-456-7890', 
          reservationDate: '2024-10-15', 
          reservationTime: '6:00 PM', 
          specialRequests: 'Window seat', 
          amount: '₱2000'
        }
      },
      // Additional sample messages
      { 
        id: 3, 
        sender: 'You', 
        text: 'Can we add one more person to the reservation?', 
        time: '4:00 PM'
      },
      { 
        id: 4, 
        sender: 'Business Three', 
        text: 'Let me check the availability and get back to you.', 
        time: '4:05 PM'
      },
    ],
  };

  useEffect(() => {
    setMessages(initialMessages);
  }, []);

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
  const handleSendMessage = () => {
    if ((messageInput.trim() !== '' || image) && selectedBusiness !== null) {
      const currentMessages = messages[selectedBusiness] || [];
      const newMessage = {
        id: currentMessages.length + 1,
        sender: 'You',
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
              {businesses.map((business) => (
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
                  <h3 className="font-semibold mb-2 text-black">Chat with {businesses.find(b => b.id === selectedBusiness).name}</h3>
                  {messages[selectedBusiness].map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'You' ? 'justify-end' : 'justify-start '}`}
                    >
                      <div
                        className={`p-2 rounded-lg max-w-[70%] ${
                          message.sender === 'You' ? 'bg-gray-300 text-black' : 'bg-color1 text-white max-w-[70%]'
                        }`}
                      >
                        <p className="break-words ">{message.text}</p>
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
                        {message.id === 3 && message.formDetails && (
                          <ProductCard product={message.formDetails} />
                        )}
                        {message.id !== 3 && message.formDetails && (
                          <BookingDetailsCard message={message} isSender={message.sender === 'You'} />
                        )}
                      </div>
                    </div>
                  ))}
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
