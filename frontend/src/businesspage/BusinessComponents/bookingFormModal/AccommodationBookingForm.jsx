import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Checkbox,
  RangeCalendar
} from '@nextui-org/react';
import Swal from 'sweetalert2';
import { FaUserPen } from "react-icons/fa6";
import { MdEditCalendar } from "react-icons/md";
import { CgNotes } from "react-icons/cg";
// Use the environment variable for the base URL
const BASE_URL = import.meta.env.VITE_BASE_URL; 

const AccommodationBookingForm = ({ isOpen, onClose, product = {} }) => {
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    business_id: product.business_id || null,
    user_id: null,
    product_id: product.product_id || null,
    firstName: '',
    lastName: '',
    productName: product.title || '',
    email: '',
    phone: '',
    checkInOutDates: null,
    originalPrice: Number(product.price) || 0,
    discount: Number(product.discount) || 0,
    discountedPrice: product.discount ? 
      Number(product.price) - (Number(product.price) * Number(product.discount) / 100) : 
      Number(product.price) || 0,
    type: product.type || '',
    agreeToTerms: false,
    specialRequests: '',
    numberOfGuests: 1,
  });

  // Fetching user data
  const fetchUserData = async () => {
    try {
      const response = await fetch(`${BASE_URL}/get-userData`, {
        method: 'GET',
        credentials: 'include' // Include cookies
      });
      const data = await response.json();
      setUserId(data.userData?.user_id || null);
      setUserData(data.userData || null);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Update formData.user_id after userId is fetched
  useEffect(() => {
    if (userId) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        user_id: parseInt(userId),
        firstName: userData.Fname || '',
        lastName: userData.Lname || '',
        email: userData.email || '',
        phone: userData.contact || '',
      }));
    }
  }, [userId]);

  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      business_id: product.business_id || null,
      productName: product.name || '',
      originalPrice: Number(product.price) || 0,
      discount: Number(product.discount) || 0,
      discountedPrice: product.discount ? 
        Number(product.price) - (Number(product.price) * Number(product.discount) / 100) : 
        Number(product.price) || 0,
      type: product.type || '',
    }));
  }, [product]);

  const [isPolicyModalOpen, setPolicyModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handleSubmit = async () => {
    // console.log('Submit fromData: ', formData);
    if (!formData.agreeToTerms) {
      Swal.fire({
        title: 'Terms Not Agreed',
        text: 'Please agree to the terms and conditions before booking.',
        icon: 'warning',
        confirmButtonColor: '#0BDA51'
      });
      return;
    }
    try {
      const response = await fetch(`${BASE_URL}/book-accommodation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create booking');
      }

      const responseData = await response.json();
      const bookingId = responseData.booking_id;

      // Construct the message object
      const message = {
        sender_id: userId, // Assuming formData contains userId
        sender_account: 'user', // Assuming formData contains userAccount
        receiver_id: product.user_id, // Assuming formData contains businessId
        receiver_account: 'business', // Assuming formData contains businessAccount
        text: `You have successfully reserved: ${product.name} for ₱${Number(formData.discountedPrice).toFixed(2)}.`,
        formType: 'accommodationBooking',
        form_details: JSON.stringify({
          booking_id: bookingId,
          email: formData.email,
          phone: formData.phone,
          amount: `${Number(formData.discountedPrice).toFixed(2)}`,
          checkInOutDates: formData.checkInOutDates,
          productName: product.name,
          numberOfGuests: formData.numberOfGuests,
          specialRequests: formData.specialRequests
        })
      };

      // Send the message
      const messageResponse = await fetch(`${BASE_URL}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!messageResponse.ok) {
        throw new Error('Failed to send message');
      }

      Swal.fire({
        title: 'Reservation Confirmed!',
        text: `You have successfully reserved: ${product.name} for ₱${Number(formData.discountedPrice).toFixed(2)}.`,
        icon: 'success',
        confirmButtonColor: '#0BDA51'
      }).then(() => {
        onClose();
      });
    } catch (error) {
      console.error('Error submitting reservation:', error);
      Swal.fire({
        title: 'Reservation Failed',
        text: 'There was an issue completing your reservation. Please try again later.',
        icon: 'error',
        confirmButtonColor: '#0BDA51'
      });
    }
  };

  const handleCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    setFormData({ ...formData, agreeToTerms: isChecked });
    if (isChecked) {
      setPolicyModalOpen(true);
    }
  };

  const steps = [
    
    <div key="step1" className="space-y-4">
    <h1 className='p-1 text-lg border-b flex gap-2 items-center'><FaUserPen/>Personl Details</h1>
      <Input 
        label="First Name" 
        required 
        fullWidth 
        placeholder="Enter your first name" 
        value={formData.firstName} 
        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} 
      />
      <Input 
        label="Last Name" 
        required 
        fullWidth 
        placeholder="Enter your last name" 
        value={formData.lastName} 
        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} 
      />
      <Input 
        type="tel" 
        label="Phone Number" 
        required 
        fullWidth 
        placeholder="Enter your phone number" 
        value={formData.phone} 
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
      />
      <Input 
        type="email" 
        label="Email Address" 
        required 
        fullWidth 
        placeholder="Enter your email" 
        value={formData.email} 
        onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
      />
    </div>,
    <div key="step2" className="space-y-4">
       <h1 className='p-1 text-lg border-b flex gap-2 items-center '><MdEditCalendar/>Select Check-in/Check-out Dates   </h1>
      <div className='flex justify-center'>
      <RangeCalendar
        aria-label="Select Check-in and Check-out Dates"
        visibleMonths={2}
        onChange={(dates) => setFormData({ ...formData, checkInOutDates: dates })}
      />
      </div>
        <Input
        type="number"
        label="Number of Guests"
        required
        fullWidth
        min={1}
        value={formData.numberOfGuests}
        onChange={(e) => setFormData({ ...formData, numberOfGuests: e.target.value })}
      />
      <Input
        label="Special Requests"
        fullWidth
        placeholder="Enter any special requests"
        value={formData.specialRequests || ''}
        onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
      />
    </div>,
    <div key="step3" className="space-y-4">
      <div className="mt-4">
      <h1 className='p-1 text-lg border-b flex gap-2 items-center'> <CgNotes/> Booking Summary</h1>
        <p><strong>First Name:</strong> {formData.firstName}</p>
        <p><strong>Last Name:</strong> {formData.lastName}</p>
        <p><strong>Phone Number:</strong> {formData.phone}</p>
        <p><strong>Email Address:</strong> {formData.email}</p>
        {formData.checkInOutDates && (
          <>
            <p><strong>Check-in Date:</strong> {formData.checkInOutDates.start.toString()}</p>
            <p><strong>Check-out Date:</strong> {formData.checkInOutDates.end.toString()}</p>
          </>
        )}
        <p><strong>Number of Guests:</strong> {formData.numberOfGuests}</p>
        <p><strong>Special Requests:</strong> {formData.specialRequests || 'None'}</p>  
        {/* Price details section */}
        <div className="mt-3  bg-gray-100 p-2 rounded-lg">
          <h4 className="font-bold text-lg mb-2">Price Details</h4>
          <div className="space-y-1 ">
            <p className='font-semibold'>
              <strong>Original Price: </strong>
              <span className={Number(formData.discount) > 0 ? "line-through text-gray-500 ml-2" : "ml-2"}>
                ₱{Number(formData.originalPrice).toFixed(2)}
              </span>
            </p>
            {Number(formData.discount) > 0 && (
              <>
                <p className="text-green-600">
                  <strong>Discount:</strong> 
                  <span className="ml-2">{Number(formData.discount).toFixed(0)}% OFF</span>
                </p>
                <p className="font-bold text-lg">
                  <strong>Final Price:</strong> 
                  <span className="ml-2 text-green-600">₱{Number(formData.discountedPrice).toFixed(2)}</span>
                </p>
              </>
            )}
          </div>
          
        </div>
        <Checkbox
        checked={formData.agreeToTerms}
        onChange={handleCheckboxChange}
        className="mt-4"
      >
        I agree to the <span className="text-blue-500 cursor-pointer" onClick={() => setPolicyModalOpen(true)}>Terms & Conditions</span>
      </Checkbox>
      </div>
    </div>
  ];

  return (
    <>
      <Modal hideCloseButton isOpen={isOpen} onClose={() => {}} className="max-w-2xl p-3 bg-white rounded-lg shadow-2xl">
        <ModalContent className="rounded-lg">
          <ModalHeader className="text-xl flex justify-center font-bold bg-light  text-black ">
          Accommodation Booking
          </ModalHeader>
          <ModalBody className="space-y-6">
            {steps[currentStep]}
            <div className="flex justify-between  mt-4">
              <div className='flex flex-wrap gap-3'>
                <Button auto flat color="danger" onClick={onClose} className="mr-2">
                  Cancel
                </Button>
                {currentStep > 0 && <Button auto flat color='primary' onClick={prevStep}>Back</Button>}
              </div>
              {currentStep < steps.length - 1 ? (
                <Button auto color='primary' className='text-white' onClick={nextStep}>Next</Button>
              ) : (
                <Button auto color="success" className='text-white' onClick={handleSubmit}>Submit</Button>
              )}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Policy Modal */}
      <Modal isOpen={isPolicyModalOpen} onClose={() => setPolicyModalOpen(false)} className="max-w-lg p-6 bg-white rounded-lg shadow-2xl">
        <ModalContent className="rounded-lg">
          <ModalHeader className="text-2xl font-bold text-gray-800 border-b pb-4">
            Terms & Conditions
          </ModalHeader>
          <ModalBody className="space-y-4">
            <p>By making a reservation, you agree to the following terms and conditions:</p>
            <ul className="list-disc pl-5">
              <li>All reservations are subject to availability.</li>
              <li>Cancellations must be made 24 hours in advance.</li>
              <li>Payment is required at the time of booking.</li>
            </ul>
          </ModalBody>
          <ModalFooter>
            <Button auto color='danger'  onClick={() => setPolicyModalOpen(false)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AccommodationBookingForm;
