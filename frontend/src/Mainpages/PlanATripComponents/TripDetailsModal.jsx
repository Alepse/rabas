import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Accordion, AccordionItem, Input, Checkbox, Textarea } from "@nextui-org/react";
import MapFeature from '../../LeafletMap/MapFeature';
import SchedulesPlan from './SchedulesPlan';
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';
import { FaPlus } from 'react-icons/fa';
import AddItemModal from './AddItemModal';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';

const formatTime = (time) => {
  if (!time || time.trim() === '') return 'None';
  const [hour, minute] = time.split(':');
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minute || '00'} ${ampm}`;
};

const TripDetailsModal = ({ isOpen, onClose, trip = {}, onUpdateTrip = () => {}, itinerary }) => {
  if (!trip) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [editTripDetails, setEditTripDetails] = useState(trip);

  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState(null);

  const [isEditingItinerary, setIsEditingItinerary] = useState(false);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editItemIndex, setEditItemIndex] = useState(null);
  const [editItemDetails, setEditItemDetails] = useState({ title: '', time: '', isBooked: false, notes: '' });

  const [currentZoom, setCurrentZoom] = useState(10);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setIsEditingItinerary(!isEditing);
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
        const formatDate = (dateString) => {
          const date = new Date(dateString);
          return date.toISOString().split('T')[0]; // 'YYYY-MM-DD'
        };
  
        const updatedTrip = {
          ...trip,
          ...editTripDetails,
          startDate: formatDate(editTripDetails.startDate),
          endDate: formatDate(editTripDetails.endDate),
        };
  
        axios.put(`http://localhost:5000/update-trip/${trip.tripId}`, updatedTrip, { withCredentials: true })
        .then(response => {
          const data = response.data; // Directly access response.data
          if (data.success) {
            Swal.fire({
              title: 'Updated!',
              text: 'Your trip details have been updated.',
              icon: 'success',
              confirmButtonColor: '#0BDA51',
            });
            onUpdateTrip(updatedTrip);
            setIsEditing(false);
          } else {
            Swal.fire({
              title: 'Error!',
              text: data.message,
              icon: 'error',
              confirmButtonColor: '#D33736',
            });
          }
        })
        .catch(error => {
          console.error('Error updating trip:', error);
          Swal.fire({
            title: 'Error!',
            text: 'Failed to update trip.',
            icon: 'error',
            confirmButtonColor: '#D33736',
          });
        });
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

  const handleItineraryChange = (newItinerary) => {
    // Update the trip details with the new itinerary
    setEditTripDetails((prevDetails) => ({
      ...prevDetails,
      itinerary: newItinerary,
    }));
  };

  const handleAdd = (date) => {
    setCurrentDate(date);
    setSelectedItem(null);
    setIsAddOpen(true);
  };

  const handleEdit = (date, index) => {
    const item = itinerary[date][index];
    setCurrentDate(date);
    setSelectedItem(item);
    setEditItemIndex(index);
    setEditItemDetails(item);
  };

  const handleDelete = (date, index) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to delete this item?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0BDA51',
      cancelButtonColor: '#D33736',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedItinerary = { ...itinerary };
        updatedItinerary[date].splice(index, 1);
        onUpdateTrip({ ...trip, itinerary: updatedItinerary });
        Swal.fire({
          title: 'Deleted!',
          text: 'Your item has been deleted.',
          icon: 'success',
          confirmButtonColor: '#0BDA51'
        });
      }
    });
  };

  const handleUpdate = (date) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to update this item?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0BDA51',
      cancelButtonColor: '#D33736',
      confirmButtonText: 'Yes, update it!'
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedItinerary = { ...itinerary };
        updatedItinerary[date][editItemIndex] = editItemDetails;
        onUpdateTrip({ ...trip, itinerary: updatedItinerary });
        setEditItemIndex(null);
        Swal.fire({
          title: 'Updated!',
          text: 'Your item has been updated.',
          icon: 'success',
          confirmButtonColor: '#0BDA51'
        });
      }
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditItemDetails(prevDetails => ({
      ...prevDetails,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // console.log('Itinerary Items:', trip.itinerary);

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
                     <div className='flex gap-2'>
                    <h3 className="font-semibold">Trip Name:</h3>
                    <p>{trip.tripName}</p>
                    </div>
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
                <MapContainer center={[12.9738, 123.9807]} zoom={10} className="w-full h-96">
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <MapEvents setCurrentZoom={setCurrentZoom} />
                  {Object.keys(itinerary || {}).map(date =>
                    itinerary[date].map((item, index) => {
                      const { pin_location, title, imageUrl } = item;
                      if (pin_location && currentZoom >= 7) {
                        const position = [pin_location.latitude, pin_location.longitude];
                        const locationName = title;
                        const showLogo = currentZoom >= 10;
                        const fontSize = currentZoom >= 12 ? '1rem' : '0.85rem';

                        const customDivIcon = L.divIcon({
                          className: 'custom-icon',
                          html: `
                            <div class="custom-popup flex items-center whitespace-nowrap font-bold text-pink-600" style="font-size: ${fontSize};">
                              ${showLogo ? `
                                <div class="pin-container">
                                  <div class="pin-head">
                                    <img src="http://localhost:5000/${imageUrl}" alt="${title}" class="pin-logo" />
                                  </div>
                                  <div class="pin-point"></div>
                                </div><span>${locationName}</span>
                              ` : `<div class="business-name">${locationName}</div>`}
                            </div>
                          `,
                          iconSize: [50, 70],
                          iconAnchor: [25, 70]
                        });

                        // Click handler to redirect to Google Maps
                        const handleMarkerClick = () => {
                          const destination = `${pin_location.latitude},${pin_location.longitude}`;
                          window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank');
                        };

                        return (
                          <Marker
                            key={`${date}-${index}`}
                            position={position}
                            icon={customDivIcon}
                            eventHandlers={{
                              click: handleMarkerClick, // Attach click handler
                            }}
                          />
                        );
                      }
                      return null;
                    })
                  )}
                </MapContainer>
              </div>
            </AccordionItem>
            <AccordionItem title="Itinerary">
              <div className="p-4">
                {Object.keys(itinerary || {}).map(date => (
                  <div key={date} className="mb-6">
                    <h4 className="font-semibold text-lg mb-2">{date}</h4>
                    {itinerary[date].map((item, index) => (
                      <div key={index} className="flex flex-col sm:flex-row items-start mb-6 bg-white p-4 rounded-lg shadow-lg w-full sm:w-3/4 lg:w-2/3 mx-auto">
                        <div className="flex-shrink-0 w-12 text-center">
                          <div className="bg-color1 text-white rounded-full w-10 h-10 flex items-center justify-center mb-2">
                            {index + 1}
                          </div>
                          <div className="h-full border-l-2 border-gray-300"></div>
                        </div>
                        <div className="ml-0 sm:ml-6 w-full">
                          <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                            <h3 className="font-semibold text-xl">{item.title}</h3>
                            <span className="text-sm text-gray-500"> <span className='text-black font-medium'>Time of Visit:</span> {formatTime(item.time)}</span>
                          </div>
                          <img src={`http://localhost:5000/${item.imageUrl}` || 'https://via.placeholder.com/300'} alt={item.title} className="w-full h-56 object-cover rounded-md mb-4" />
                          <p className="text-sm mb-2"><strong>Booked:</strong> {item.isBooked ? 'Yes' : 'No'}</p>
                          <p className="text-sm mb-4"><strong>Notes:</strong> {item.notes}</p>
                          {isEditing && (
                            <div className="flex space-x-2">
                              <Button size="sm" color="danger" onClick={() => handleDelete(date, index)}>Delete</Button>
                              <Button size="sm" onClick={() => handleEdit(date, index)}>Edit</Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {isEditing && (
                      <Button className='border-1 m-2 border-color1 rounded-full text-lg p-3 hover:bg-color2 bg-white hover:text-white duration-300 min-w-11' onClick={() => handleAdd(date)}>
                        <FaPlus/> Add
                      </Button>
                    )}
                  </div>
                ))}
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
            <div className='flex gap-2'>
              <Button onClick={handleEditToggle} className="bg-color1 text-white">Edit</Button>
            </div>
          )}
          <Button onClick={onClose} className="bg-red-500 text-white">Close</Button>
        </ModalFooter>
      </ModalContent>
      <AddItemModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAddItem={(item) => {
          const updatedItinerary = { ...itinerary };
          if (!updatedItinerary[currentDate]) {
            updatedItinerary[currentDate] = [];
          }
          updatedItinerary[currentDate].push(item);
          onUpdateTrip({ ...trip, itinerary: updatedItinerary });
          setIsAddOpen(false);
        }}
      />
    </Modal>
  );
};

TripDetailsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  trip: PropTypes.object.isRequired,
  onUpdateTrip: PropTypes.func,
};

// Component to handle map events
const MapEvents = ({ setCurrentZoom }) => {
  useMapEvents({
    zoomend: (e) => {
      setCurrentZoom(e.target.getZoom());
    },
  });
  return null;
};

export default TripDetailsModal;