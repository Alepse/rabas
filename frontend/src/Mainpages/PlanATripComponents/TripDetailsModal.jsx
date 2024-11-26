import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Accordion, AccordionItem, Input } from "@nextui-org/react";
import MapFeature from '../../LeafletMap/MapFeature';
import SchedulesPlan from './SchedulesPlan';
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';

const TripDetailsModal = ({ isOpen, onClose, trip, onUpdateTrip }) => {
  if (!trip) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [editTripDetails, setEditTripDetails] = useState(trip);

  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState(null);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditTripDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
    console.log('Edit Trip Details:', editTripDetails);
  };

  const handleSave = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to save these changes?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0BDA51',
      cancelButtonColor: '#D33736',
      confirmButtonText: 'Yes, save it!',
    }).then((result) => {
      if (result.isConfirmed) {
        if (typeof onUpdateTrip === 'function') {
          onUpdateTrip({
            ...trip,
            ...editTripDetails,
          });
        }
        Swal.fire({
          title: 'Updated!',
          text: 'Your trip details have been updated.',
          icon: 'success',
          confirmButtonColor: '#0BDA51',
        });
        setIsEditing(false);
      }
    });
  };

  const handleCancelEdit = () => {
    Swal.fire({
      title: 'Cancel changes?',
      text: "Your changes will not be saved.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#D33736',
      cancelButtonColor: '#0BDA51',
      confirmButtonText: 'Yes, cancel it!',
    }).then((result) => {
      if (result.isConfirmed) {
        setEditTripDetails(trip); // Revert changes
        setIsEditing(false);
      }
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isDismissable={false} hideCloseButton className="rounded-lg shadow-lg mx-auto p-3 max-h-screen max-w-[1200px]">
      <ModalContent>
        <ModalHeader className="bg-primary text-white p-4 rounded-t-lg">
          <h2 className="text-2xl font-bold">{isEditing ? 'Edit Trip Details' : trip.tripName}</h2>
        </ModalHeader>
        <ModalBody className="bg-gray-50 p-4 max-h-screen overflow-auto">
          <Accordion selectionMode="multiple" className="mt-4">
            <AccordionItem title="Trip Details">
              <div className="p-4">
                {isEditing ? (
                  <>
                    <Input
                      label="Trip Name"
                      name="tripName"
                      value={editTripDetails.tripName}
                      onChange={handleInputChange}
                      fullWidth
                    />
                    <Input
                      label="Start Date"
                      name="startDate"
                      type="date"
                      value={editTripDetails.startDate}
                      onChange={handleInputChange}
                      fullWidth
                    />
                    <Input
                      label="End Date"
                      name="endDate"
                      type="date"
                      value={editTripDetails.endDate}
                      onChange={handleInputChange}
                      fullWidth
                    />
                  </>
                ) : (
                  <>
                    <h3 className="font-semibold">Trip Name:</h3>
                    <p>{trip.tripName}</p>
                    <h3 className="font-semibold mt-2">Trip Dates:</h3>
                    <p>Start: {trip.startDate}</p>
                    <p>End: {trip.endDate}</p>
                  </>
                )}
              </div>
            </AccordionItem>
            <AccordionItem title="Selected Destinations">
              <div className="p-4">
                <h3 className="font-semibold text-lg">Locations Navigation:</h3>
                <li>Donsol, Sorsogon : Business Name</li>
                <li>Gubat, Sorsogon : Business Name</li>
                <MapFeature
                  currentLocation={currentLocation}
                  destination={destination}
                  setCurrentLocation={setCurrentLocation}
                  setDestination={setDestination}
                />
              </div>
            </AccordionItem>
            <AccordionItem title="Itinerary">
              <div className="p-4">
                <SchedulesPlan itineraryItems={trip.itinerary} />
              </div>
            </AccordionItem>
          </Accordion>
        </ModalBody>
        <ModalFooter className="bg-gray-100 p-4 rounded-b-lg flex justify-between">
          {isEditing ? (
            <div className='flex gap-2'>
              <Button onClick={handleSave} className="bg-green-500 text-white">Save</Button>
              <Button onClick={handleCancelEdit} className="bg-red-500 text-white">Cancel</Button>
            </div>
          ) : (
            <Button onClick={handleEditToggle} className="bg-color1 text-white">Edit</Button>
          )}
          <Button onClick={onClose} className="bg-red-500 text-white">Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

TripDetailsModal.defaultProps = {
  onUpdateTrip: () => {},
};

TripDetailsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  trip: PropTypes.object.isRequired,
  onUpdateTrip: PropTypes.func,
};

export default TripDetailsModal;