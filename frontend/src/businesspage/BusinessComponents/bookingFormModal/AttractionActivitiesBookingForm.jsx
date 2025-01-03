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
  DatePicker // Import DatePicker
} from '@nextui-org/react';
import Swal from 'sweetalert2';
import { today, isWeekend, getLocalTimeZone } from '@internationalized/date';
import { useLocale } from '@react-aria/i18n';
import { FaUserPen } from "react-icons/fa6";
import { MdEditCalendar } from "react-icons/md";
import { CgNotes } from "react-icons/cg";
// Use the environment variable for the base URL
const BASE_URL = import.meta.env.VITE_BASE_URL; 

const formatDate = (date) => {
  if (!date) return '';
  if (typeof date === 'object' && date.year && date.month && date.day) {
    return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
  }
  return date.toString();
};

const AttractionActivitiesBookingForm = ({ isOpen, onClose, product = {} }) => {
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    business_id: product.business_id || null,
    user_id: null,
    product_id: product.product_id || null,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    visitDate: null, // Change to store a single date
    activityTime: '10:00', // Default to 10:00 AM
    originalPrice: Number(product.price) || 0,
    discount: Number(product.discount) || 0,
    discountedPrice: product.discount ? 
      Number(product.price) - (Number(product.price) * Number(product.discount) / 100) : 
      Number(product.price) || 0,
    amountToPay: 0,
    type: product.type || '',
    agreeToTerms: false,
    specialRequests: '',
    numberOfGuests: 1, // Default to 1 guest
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
    const discountedPrice = product.discount
      ? Number(product.price) - (Number(product.price) * Number(product.discount) / 100)
      : Number(product.price) || 0;
  
    setFormData((prevFormData) => ({
      ...prevFormData,
      business_id: product.business_id || null,
      product_id: product.product_id || null,
      originalPrice: Number(product.price) || 0,
      discount: Number(product.discount) || 0,
      discountedPrice: discountedPrice,
      amountToPay: discountedPrice * Number(formData.numberOfGuests) || 0, // Make sure formData.numberOfGuests is also handled correctly
      type: product.type || '',
    }));
  }, [product, formData.numberOfGuests]);  // Depend on formData.numberOfGuests to recalculate amountToPay when it changes
  
  const [isPolicyModalOpen, setPolicyModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  let now = today(getLocalTimeZone());
  let disabledRanges = [
    [now, now.add({ days: 5 })],
    [now.add({ days: 14 }), now.add({ days: 16 })],
    [now.add({ days: 23 }), now.add({ days: 24 })],
  ];
  let { locale } = useLocale();

  let isDateUnavailable = (date) =>
    isWeekend(date, locale) ||
    disabledRanges.some(
      (interval) => date.compare(interval[0]) >= 0 && date.compare(interval[1]) <= 0,
    );

  // Define unavailable times
  const unavailableTimes = ['12:00', '15:00', '20:00'];

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handleTimeChange = (e) => {
    const selectedTime = e.target.value;
    setFormData({ ...formData, activityTime: selectedTime });

    if (unavailableTimes.includes(selectedTime)) {
      Swal.fire({
        title: 'Time Unavailable',
        text: 'The selected activity time is unavailable. Please choose a different time.',
        icon: 'error',
        confirmButtonColor: '#0BDA51'
      }).then(() => {
        // Reset the time to a default or previous valid time
        setFormData((prevData) => ({ ...prevData, activityTime: '10:00' }));
      });
    }
  };

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || 
        !formData.phone || !formData.visitDate || !formData.activityTime) {
      Swal.fire({
        title: 'Missing Information',
        text: 'Please fill in all required fields.',
        icon: 'warning',
        confirmButtonColor: '#0BDA51'
      });
      return;
    }

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
      console.log('Sending booking data:', {
        ...formData,
        originalPrice: Number(formData.originalPrice),
        discount: Number(formData.discount),
        discountedPrice: Number(formData.discountedPrice)
      });

      const response = await fetch(`${BASE_URL}/book-activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          originalPrice: Number(formData.originalPrice),
          discount: Number(formData.discount),
          discountedPrice: Number(formData.discountedPrice),
          productName: product.name // Make sure product name is included
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create booking');
      }

      const responseData = await response.json(); // Parse the response to get the data
      const bookingId = responseData.booking_id; // Assuming the server returns the booking ID as 'booking_id'

      const message = {
        sender_id: userId, // Assuming formData contains userId
        sender_account: 'user', // Assuming formData contains userAccount
        receiver_id: product.user_id, // Assuming formData contains businessId
        receiver_account: 'business', // Assuming formData contains businessAccount
        text: `You have successfully reserved: ${product.name} for ₱${Number(formData.discountedPrice).toFixed(2)}.`,
        formType: 'activityBooking',
        form_details: JSON.stringify({
          booking_id: bookingId, // Use the extracted booking ID
          email: formData.email,
          phone: formData.phone,
          amount: `${Number(formData.discountedPrice).toFixed(2)}`,
          visitDate: formData.visitDate,
          activityTime: formData.activityTime,
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
        text: error.message || 'There was an issue completing your reservation. Please try again later.',
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
      <Input label="First Name" required fullWidth placeholder="Enter your first name" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
      <Input label="Last Name" required fullWidth placeholder="Enter your last name" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
      <Input type="tel" label="Phone Number" required fullWidth placeholder="Enter your phone number" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
      <Input type="email" label="Email Address" required fullWidth placeholder="Enter your email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
    </div>,
    <div key="step2" className="space-y-4">
      <h1 className='p-1 text-lg border-b flex gap-2 items-center '><MdEditCalendar/> Appointment Date/Time </h1>
      <div className='flex justify-center'>
        <DatePicker
          aria-label="Select Visit Date"
          isDateUnavailable={isDateUnavailable} // Use the isDateUnavailable function
          minValue={today(getLocalTimeZone())}
          value={formData.visitDate}
          onChange={(date) => setFormData({ ...formData, visitDate: date })}
        />
      </div>
      <div className="mb-4">
        <input
          type="time"
          id="activityTime"
          value={formData.activityTime}
          onChange={handleTimeChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-color1 focus:border-color1 sm:text-sm"
          style={{
            padding: '0.5rem',
            borderRadius: '0.375rem',
            borderColor: '#d1d5db',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
          }}
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
        {formData.visitDate && (
          <p><strong>Visit Date:</strong> {formatDate(formData.visitDate)}</p>
        )}
        <p><strong>Activity Time:</strong> {formData.activityTime}</p>
        <p><strong>Number of Guests:</strong> {formData.numberOfGuests}</p>
        <p><strong>Special Requests:</strong> {formData.specialRequests || 'None'}</p>
        
        {/* Price details section */}
        <div className="mt-3  bg-gray-100 p-2 rounded-lg">
          <h4 className="font-bold text-lg mb-2">Price Details</h4>
          <div className="space-y-1">
          <p className='font-semibold'>
              <strong>Original Price:</strong> 
              <span className={Number(formData.discount) > 0 ? "line-through text-gray-500 ml-2" : "ml-2"}>
                ₱{Number(formData.originalPrice).toFixed(2)}
              </span>
            </p>
            {Number(formData.discount) > 0 && (
              <>
              <p className='font-semibold'>
                  <strong>Discount:</strong> 
                  <span className="ml-2">{Number(formData.discount).toFixed(0)}% OFF</span>
                </p>
                <p className='font-semibold'>
                  <strong>Discounted Price:</strong> 
                  <span className="ml-2 text-green-600">₱{Number(formData.discountedPrice).toFixed(2)}</span>
                  <span className="ml-2 text-gray-500">(x{Number(formData.numberOfGuests).toFixed(0)})</span>
                </p>
              </>
            )}
            <p className="font-bold text-lg">
              <strong>Amount To Pay:</strong> 
              <span className="ml-2 text-green-600">₱{Number(formData.amountToPay).toFixed(2)}</span>
            </p>
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
      <Modal
      disableAnimation
      hideCloseButton
        isOpen={isOpen}
        onClose={() => {}}
        className="max-w-2xl p-3 bg-white rounded-lg shadow-2xl"
        closeOnOverlayClick={false} // Ensure the modal does not close on overlay click
      >
        <ModalContent className="rounded-lg">
          <ModalHeader className="text-xl flex justify-center font-bold bg-light  text-black ">
            Book an Appointment 
          </ModalHeader>
          <ModalBody className="space-y-6">
            {steps[currentStep]}
            <div className="flex justify-between mt-4">
            <div className='flex flex-wrap gap-3'>
                <Button auto flat color="danger" onClick={onClose} className="mr-2">
                  Cancel
                </Button>
                {currentStep > 0 && <Button auto flat color='primary' onClick={prevStep}>Back</Button>}
              </div>
              {currentStep < steps.length - 1 ? (
                <Button auto color='success' className='text-white' onClick={nextStep}>Next</Button>
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
          {product.termsAndConditions && (
            <>
              <p>By making a reservation, you agree to the following terms and conditions:</p>
              <ul className="list-disc pl-5">
                {/* Map through the terms and render each item */}
                {product.termsAndConditions.map((term, index) => (
                  <li key={term.id}>{term.item}</li>  // Render 'item' of each term
                ))}
              </ul>
            </>
          )}
          </ModalBody>
          <ModalFooter>
            <Button auto onClick={() => setPolicyModalOpen(false)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AttractionActivitiesBookingForm;
