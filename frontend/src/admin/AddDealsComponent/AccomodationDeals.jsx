import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import { Select, SelectSection, SelectItem } from "@nextui-org/select";
import { Input } from "@nextui-org/input";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";
import { addAccommodationDeals, updateAccommodationDeals, deleteDeal, fetchDeals } from '@/redux/accommodationDealsSlice';
import { fetchBusinessProducts } from '@/redux/accomodationSlice';
import axios from 'axios';
// Use the environment variable for the base URL
const BASE_URL = import.meta.env.VITE_BASE_URL; 

const AccomodationDeals = () => {
  const dispatch = useDispatch();
  const accommodations = useSelector((state) => state.accommodations.accommodations);
  const status = useSelector((state) => state.accommodations.status);
  const error = useSelector((state) => state.accommodations.error);
  // Extract all deals from Redux state
  const deals = useSelector((state) => state.accommodationDeals.deals);

  // Filter active and expired deals based on the expiration date
  const currentDate = Date.now();
  const activeDeals = deals.filter((deal) => deal.expirationDate > currentDate);
  const expiredDeals = deals.filter((deal) => deal.expirationDate <= currentDate);

  const [selectedAccommodation, setSelectedAccommodation] = useState('');
  const [originalPrice, setOriginalPrice] = useState(0);
  const [discount, setDiscount] = useState('');
  const [expirationDate, setExpirationDate] = useState('');

  const [selectedEditAccommodation, setSelectedEditAccommodation] = useState('');

  const [editingDeal, setEditingDeal] = useState(null);

  // New state variables for editing
  const [editDiscount, setEditDiscount] = useState(''); // For editing deals
  const [editExpirationDate, setEditExpirationDate] = useState(''); // For editing deals

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(true);
  const [showSelect, setShowSelect] = useState(true);

  useEffect(() => {
    dispatch(fetchBusinessProducts()).then(() => setLoading(false));
    dispatch(fetchDeals()).then(() => setLoading(false));
  }, [dispatch]);

  if (loading) {
    return <div>Loading activities...</div>;
  }

  if (status === 'loading') {
    return <div>Loading activities...</div>;
  }

  if (status === 'failed') {
    return <div>Error: {error}</div>;
  }

  const showAlert = (message) => {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      confirmButtonColor:'#0BDA51',
      text: message,
    });
  };

  const handleAccommodationChange = (event) => {
    const value = event.target.value;
    
    if (!accommodations.length) {
        console.warn("Accommodation data not loaded yet.");
        return;
    }
    
    setSelectedAccommodation(value);
    const accommodation = accommodations.find(accommodation => accommodation.id === parseInt(value));
    
    if (accommodation && accommodation.pricing) {
        setOriginalPrice(parseFloat(accommodation.pricing) || 0);
    } else {
        console.warn("Accommodation not found or has no pricing value.");
        setOriginalPrice(0);
    }
  };

  const handleAddDeal = () => {
    // If editing an existing deal
    if (editingDeal) {
      if (!selectedEditAccommodation || !editDiscount || !editExpirationDate) {
        showAlert("Please fill all fields");
        return;
      }
    
      const discountValue = parseFloat(editDiscount);
      if (isNaN(discountValue) || discountValue <= 0 || discountValue >= 100) {
        showAlert("Please enter a valid discount percentage (0-100)");
        return;
      }
    
      const expiration = new Date(editExpirationDate);
      if (isNaN(expiration.getTime())) {
        showAlert("Please enter a valid expiration date");
        return;
      }

      // Create JSON payload
      const dealData = {
        dealId: editingDeal.id,
        discount: discountValue,
        expirationDate: editExpirationDate,
      }
       
      dispatch(updateAccommodationDeals(dealData));
      setEditingDeal(null);
      Swal.fire({
        title: 'Success!',
        text: 'Deal updated successfully!',
        icon: 'success',
        confirmButtonColor: '#0BDA51',
      });
      
      // Reset state after updating
      resetForm();
    } else {
      if (!selectedAccommodation || !discount || !expirationDate) {
        showAlert("Please fill all fields");
        return;
      }
      
      const discountValue = parseFloat(discount);
      if (isNaN(discountValue) || discountValue <= 0 || discountValue >= 100) {
        showAlert("Please enter a valid discount percentage (0-100)");
        return;
      }
      
      const expiration = new Date(expirationDate);
      if (isNaN(expiration.getTime())) {
        showAlert("Please enter a valid expiration date");
        return;
      }
      
      // Create JSON payload 
      const dealData = {
        category: 'accommodation', 
        productId: selectedAccommodation,
        discount: discountValue,
        expirationDate: expirationDate,
      };

      // Dispatch the action with JSON data
      dispatch(addAccommodationDeals(dealData));
      
      // Clear selectedAccommodation and price values
      // console.log("Before Reset:", selectedAccommodation);
      resetForm();
      
      Swal.fire({
        title: 'Success!',
        text: 'Deal added successfully!',
        icon: 'success',
        confirmButtonColor: '#0BDA51',
      });      
    }
  };

  const handleEditDeal = (deal, isExpired) => {
    setEditingDeal({ ...deal, isExpired });
    
    // Update selectedAccommodation to the accommodation related to this deal
    setSelectedEditAccommodation(deal.productId);
    
    // Set the editing-specific values
    setEditDiscount(deal.discount.toString()); // Set the discount for editing
    setEditExpirationDate(new Date(deal.expirationDate).toISOString().split('T')[0]); // Set the expiration date for editing
  
    // Find the accommodation and set the original price
    const accommodation = accommodations.find(accommodation => accommodation.id === parseInt(deal.productId));
    if (accommodation && accommodation.pricing) {
      setOriginalPrice(parseFloat(accommodation.pricing) || 0);
    } else {
      setOriginalPrice(0);
    }
  
    // Open the modal
    onOpen();
  };

  // Function to reset form states
  const resetForm = () => {
    setShowSelect(false); // Temporarily hide the Select component
    setTimeout(() => {
      setShowSelect(true); // Show Select component again
      setSelectedAccommodation(''); // Clear selection
      setOriginalPrice(0);
      setDiscount('');
      setExpirationDate('');
    }, 0); // Short delay to ensure Select unmounts
  };

  const handleDeleteDeal = (dealId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#0BDA51',
      cancelButtonColor: '#D33736',
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`${BASE_URL}/delete-deals/${dealId}`, {
          withCredentials: true,
        })
        .then(() => {
          dispatch(deleteDeal(dealId)); // Pass an array with one dealId for consistency
          Swal.fire({
            title: 'Deleted!',
            text: 'The deal has been deleted.',
            icon: 'success',
            confirmButtonColor: '#0BDA51',
          });
        })
        .catch((error) => {
          console.error("Error deleting deal:", error);
          Swal.fire({
            title: 'Error!',
            text: 'There was an issue deleting the deal.',
            icon: 'error',
            confirmButtonColor: '#D33736',
          });
        });
      }
    });
  };

  const discountedPrice = originalPrice && discount ? (originalPrice - (originalPrice * (parseFloat(discount) / 100))).toFixed(2) : originalPrice;

  return (
    <div className="p-4 sm:p-8  w-full">
      <div className="grid grid-cols-1  gap-8 max-w-7xl mx-auto">
        <div className="shadow-lg rounded-lg p-6 bg-white">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Manage Accommodation Deals</h2>
          {showSelect && (
            <Select
              placeholder="Select Accommodation"
              aria-label="Select Accommodation"
              value={selectedAccommodation}
              onChange={(event) => handleAccommodationChange(event)}
              className="w-full mb-4"
            >
              <SelectSection title="Accommodation">
                {accommodations.map((accommodation) => (
                  <SelectItem key={accommodation.id} value={accommodation.id}>
                    {accommodation.accommodationName}
                  </SelectItem>
                ))}
              </SelectSection>
            </Select>
          )}
          {selectedAccommodation && (
            <div className="mb-4 text-center">
               <p>
                Original Price: <span className="font-semibold text-green-600">₱{originalPrice}</span>
              </p>
              <p>
                Discounted Price: <span className="font-semibold text-red-600">₱{discountedPrice}</span>
              </p>
            </div>
          )}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
          <Input
              placeholder="Discount (%)"
              aria-label="Discount percentage"
              value={discount} // For adding deals
              onChange={(e) => setDiscount(e.target.value)}
              className="flex-1"
            />
            <Input
              type="date"
              aria-label="Expiration date"
              value={expirationDate} // For adding deals
              onChange={(e) => setExpirationDate(e.target.value)}
              className="flex-1"
            />
          </div>
          <Button onClick={handleAddDeal} className="mb-6 rounded-md bg-color1 hover:bg-color2 text-white w-full">
            Add Deal
          </Button>

          {/*  Active Deals */}
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Active Deals</h3>
          <div className="grid grid-cols-1 gap-4 max-h-80 overflow-y-auto">
            {activeDeals.map(deal => {
              const accommodation = accommodations.find(accommodation => accommodation.id === parseInt(deal.productId));
              return (
                <div key={`${deal.id}-${deal.productId}`} className="bg-white shadow-md rounded-lg p-4 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-lg">{accommodation?.accommodationName}</h4>
                    <div className="flex space-x-2">
                      <Button onClick={() => handleEditDeal(deal, false)} className="rounded-md bg-color2 hover:bg-color3 text-white">Edit</Button>
                      <Button onClick={() => handleDeleteDeal(deal.id)} className="rounded-md bg-red-500 hover:bg-red-600 text-white">Delete</Button>
                    </div>
                  </div>
                  <p>Discount: {deal.discount}%</p>
                  <p>Expiration: {new Date(deal.expirationDate).toLocaleDateString()}</p>
                </div>
              );
            })}
          </div>

          {/* Expired Deals */}
          <h3 className="text-xl font-semibold mt-8 mb-4 text-gray-700">Expired Deals</h3>
          <div className="grid grid-cols-1 gap-4 max-h-80 overflow-y-auto">
            {expiredDeals.map(deal => {
              const accommodation = accommodations.find(accommodation => accommodation.id === parseInt(deal.productId));
              return (
                <div key={`${deal.id}-${deal.productId}`} className="bg-white shadow-md rounded-lg p-4 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-lg">{accommodation?.accommodationName}</h4>
                    <div className="flex space-x-2">
                      <Button onClick={() => handleEditDeal(deal, true)} className="rounded-md bg-color2 hover:bg-color3 text-white">Edit</Button>
                      <Button onClick={() => handleDeleteDeal(deal.id)} className="rounded-md bg-red-500 hover:bg-red-600 text-white">Delete</Button>
                    </div>
                  </div>
                  <p>Discount: {deal.discount}%</p>
                  <p>Expiration: {new Date(deal.expirationDate).toLocaleDateString()}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Edit Deal Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>
            <h2 className="text-2xl font-semibold">{editingDeal ? 'Edit Deal' : 'Add Deal'}</h2>
          </ModalHeader>
          <ModalBody>
            <div className="mb-4">
              <p className="font-semibold">Accommodation Name: {accommodations.find(accommodation => accommodation.id === parseInt(editingDeal?.productId))?.accommodationName}</p>
              <div className="mb-4 text-center">
                <p>Original Price: ₱{originalPrice}</p>
                <p>Discounted Price: ₱{(originalPrice - (originalPrice * (parseFloat(editDiscount) / 100))).toFixed(2)}</p>
              </div>
             
              <Input
                placeholder="Discount (%)"
                value={editingDeal ? editDiscount : discount} // Use editDiscount for editing
                onChange={(e) => editingDeal ? setEditDiscount(e.target.value) : setDiscount(e.target.value)}
                className="flex-1 mb-4"
              />
              <Input
                type="date"
                value={editingDeal ? editExpirationDate : expirationDate} // Use editExpirationDate for editing
                onChange={(e) => editingDeal ? setEditExpirationDate(e.target.value) : setExpirationDate(e.target.value)}
                className="flex-1"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleAddDeal} className="rounded-md bg-color1 hover:bg-color2 text-white w-full">
              {editingDeal ? 'Update Deal' : 'Add Deal'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default AccomodationDeals;