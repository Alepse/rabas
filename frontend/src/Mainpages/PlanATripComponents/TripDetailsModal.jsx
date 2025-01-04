import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Accordion, AccordionItem, Input, Checkbox, Textarea } from "@nextui-org/react";
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';
import { FaPlus } from 'react-icons/fa';
import AddItemModal from './AddItemModal';
import { Link } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
// Use the environment variable for the base URL
const BASE_URL = import.meta.env.VITE_BASE_URL; 

const formatTime = (time) => {
  if (!time || time.trim() === '') return 'None';
  const [hour, minute] = time.split(':');
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minute || '00'} ${ampm}`;
};

// Function to encrypt the business_id
const encryptId = (id) => {
  const secretKey = import.meta.env.VITE_SECRET_KEY;
  if (!secretKey) {
    console.error('Secret key is not defined');
    return null;
  }
  const ciphertext = CryptoJS.AES.encrypt(id.toString(), secretKey).toString();
  return encodeURIComponent(ciphertext);
};

const TripDetailsModal = ({ isOpen, onClose, trip = {}, onUpdateTrip = () => {}, itinerary }) => {
  if (!trip) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [editTripDetails, setEditTripDetails] = useState(trip);
  const [originalTripDetails, setOriginalTripDetails] = useState(trip);
  const [originalItinerary, setOriginalItinerary] = useState(itinerary); // Store original itinerary

  const [currentLocation, setCurrentLocation] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editItemIndex, setEditItemIndex] = useState(null);
  const [editItemDetails, setEditItemDetails] = useState({ title: '', time: '', isBooked: false, notes: '' });
  
  const [currentZoom, setCurrentZoom] = useState(10);
  const [selectedLocation, setSelectedLocation] = useState(null); // State to hold the selected location details

  let destinationOrder = 0;

  const handleMarkerClick = (item) => {
    setSelectedLocation(item); // Store clicked location details
  };

  const handleEditToggle = () => {
    if (!isEditing) {
      setOriginalTripDetails(editTripDetails);
      setOriginalItinerary(itinerary); // Store original itinerary when editing starts
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditTripDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
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
        // Function to format the date to 'YYYY-MM-DD'
        const formatDate = (dateString) => {
          if (!dateString) return ''; // Prevent errors if no date is provided
          const date = new Date(dateString);
          return date.toISOString().split('T')[0]; // 'YYYY-MM-DD'
        };
  
        // Extract values from the itinerary and set defaults to prevent undefined errors
        const firstItineraryItem = Object.values(originalItinerary).flat()[0] || {};
        const { imageUrl, location} = firstItineraryItem; // Provide default empty strings if undefined
        const updatedTrip = {
          ...trip,
          ...editTripDetails,
          imageUrl: imageUrl, // Ensure imageUrl is a string
          destination: location, // Ensure destination is a string
          startDate: formatDate(editTripDetails.startDate),
          endDate: formatDate(editTripDetails.endDate),
        };
  
        // Send updated trip details to the backend
        axios.put(`${BASE_URL}/update-trip/${trip.tripId}`, updatedTrip, { withCredentials: true })
          .then(response => {
            const data = response.data; // Directly access response.data
            if (data.success) {
              Swal.fire({
                title: 'Updated!',
                text: 'Your trip details have been updated.',
                icon: 'success',
                confirmButtonColor: '#0BDA51',
              });
              onUpdateTrip(updatedTrip); // Update parent component with the new data
              setIsEditing(false); // Switch editing mode off
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
    setEditTripDetails(originalTripDetails);
    setOriginalItinerary(itinerary); // Restore original itinerary
    setIsEditing(false);
  };

  const handleAdd = (date) => {
    setCurrentDate(date);
    setSelectedItem(null);
    setIsAddOpen(true);
  };

  const handleEdit = (date, index) => {
    const item = itinerary[date][index];
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

  const handleShowDirection = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;

          // Collect all pin locations (destinations)
          const destinations = [];
          Object.keys(itinerary || {}).forEach(date => {
            itinerary[date].forEach(item => {
              const { pin_location } = item;
              if (pin_location) {
                destinations.push(`${pin_location.latitude},${pin_location.longitude}`);
              }
            });
          });

          // Prepare the directions URL for Google Maps with multiple destinations
          const origin = `${userLat},${userLng}`;
          const route = [origin, ...destinations].join('/'); // Join the origin and destinations with "/"
          
          const directionsUrl = `https://www.google.com/maps/dir/${route}/@${userLat},${userLng},11z/data=!3e9`;

          // Open the directions URL in a new tab
          window.open(directionsUrl, '_blank');
        },
        (error) => {
          alert("Error getting current location: " + error.message);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const getOrdinalSuffix = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };
  

  return (
    <Modal disableAnimation isOpen={isOpen} onClose={onClose} isDismissable={false} hideCloseButton className="rounded-lg shadow-lg mx-auto p-3 max-h-screen max-w-[1200px]">
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
                      value={editTripDetails.startDate ? editTripDetails.startDate.split('T')[0] : ''}
                      onChange={handleInputChange}
                      fullWidth
                    />
                    <Input
                      label="End Date"
                      name="endDate"
                      type="date"
                      value={editTripDetails.endDate ? editTripDetails.endDate.split('T')[0] : ''}
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
                      const { pin_location, title, imageUrl, id } = item;
                      console.log("itemsss", item);
                      if (pin_location) {
                        destinationOrder += 1;  // Count the destinations
                        const position = [pin_location.latitude, pin_location.longitude];
                        const locationName = title;
                        const showName = currentZoom >= 10;
                        const fontSize = currentZoom >= 12 ? '1rem' : '0.85rem';

                        const customDivIcon = L.divIcon({
                          className: 'custom-icon',
                          html: `
                            <div class="custom-popup flex items-center whitespace-nowrap font-bold text-color1" style="font-size: ${fontSize};">
                              ${showName ? `
                                <div class="pin-container">
                                  <div class="pin-head">
                                    <img src="${BASE_URL}/${imageUrl}" alt="${title}" class="pin-logo" />
                                  </div>
                                  <div class="pin-point"></div>
                                </div><span>${locationName}${index+1}</span>
                              ` : `<div class="pin-container">
                                  <div class="pin-head">
                                    <img src="${BASE_URL}/${imageUrl}" alt="${title}" class="pin-logo" />
                                  </div>
                                  <div class="pin-point"></div>`}
                            </div>
                          `,
                          iconSize: [50, 70],
                          iconAnchor: [25, 70],
                        });

                        return (
                          <Marker
                            key={`${date}-${index}`}
                            position={position}
                            icon={customDivIcon}
                            className="custom-marker-class"
                          >
                            <Popup closeButton={false}>
                              {/* Enhanced details inside the popup */}
                              <div className="popup-content relative bg-white rounded-lg p-4 w-72 ">
                                {/* Destination order badge */}
                                <span className="absolute top-2 left-2 text-white text-sm font-bold bg-color2 -translate-x-[45px] -translate-y-[15px] rounded-full px-3 py-1 z-10">
                                  {`${destinationOrder}${getOrdinalSuffix(destinationOrder)}`}
                                </span>
                                <div className="mb-2 text-gray-500 text-xs">{date}</div>
                                <div className="flex gap-4">
                                  <div className="flex-1">
                                    <img 
                                      src={`${BASE_URL}/${imageUrl}`} 
                                      alt={title} 
                                      className="h-full w-full rounded-md object-cover border border-gray-200"
                                    />
                                  </div>
                                  <div className="flex flex-col justify-center items-center">
                                    <h3 className="font-bold text-base text-gray-800 mb-4">{title}</h3>
                                    <Link to={`/business/${encryptId(id)}`}>
                                      <Button className="w-full bg-color1 text-color3 rounded-md hover:bg-color2">
                                        Visit page
                                      </Button>
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </Popup>
                          </Marker>
                        );
                      }
                      return null;
                    })
                  )}
                  {/* Button to show directions for all pins */}
                  <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1000,
                  }}>
                    <button
                      className="bg-color1 hover:bg-color2"
                      onClick={handleShowDirection}
                      style={{
                        padding: '10px 20px',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '16px',
                      }}
                    >
                      Show direction
                    </button>
                  </div>
                </MapContainer>
              </div>
            </AccordionItem>
            <AccordionItem title="Itinerary">
              <div className="p-2">
                <Accordion selectionMode="multiple">
                  {Object.keys(itinerary || {}).map(date => (
                    <AccordionItem 
                      className='max-h-[700px] p-2 h-full overflow-auto scrollbar-custom'
                      key={date} 
                      title={date}
                    >

                    <div className='flex justify-end mb-4'>
                    {isEditing && (
                            <Button className='border-1 m-2 border-color1 rounded-full text-lg p-3 hover:bg-color2 bg-white hover:text-white duration-300 min-w-11' onClick={() => handleAdd(date)}>
                                <FaPlus/> Add Trip
                            </Button>
                        )}

                        </div>
                      <div className="mb-6 p-2">
                        {itinerary[date].map((item, index) => (
                          <div key={index} className="flex flex-col sm:flex-row items-start mb-6 border bg-white p-4 rounded-lg shadow-lg w-full sm:w-3/4 lg:w-2/3 mx-auto">
                            <div className="flex-shrink-0 w-12 text-center">
                              <div className="bg-color1 text-white rounded-full w-10 h-10 flex items-center justify-center mb-2">
                                {index + 1}
                              </div>
                              <div className="h-full border-l-2 border-gray-300"></div>
                            </div>
                            <div className="ml-0 sm:ml-6 w-full">
                              {editItemIndex === index ? (
                                <div className="space-y-4">
                                  <input type="time" name="time" value={editItemDetails.time} onChange={handleEditInputChange} className="w-full p-2 border rounded-md" />
                                  <Checkbox
                                    isSelected={editItemDetails.isBooked}
                                    onChange={() => setEditItemDetails(prevDetails => ({ ...prevDetails, isBooked: !prevDetails.isBooked }))}
                                    color="primary"
                                  >
                                    Yes, I have booked this
                                  </Checkbox>
                                  <Textarea
                                    name="notes"
                                    value={editItemDetails.notes}
                                    onChange={handleEditInputChange}
                                    placeholder="Enter any notes here..."
                                    fullWidth
                                  />
                                  <div className="flex space-x-2">
                                    <Button size="sm" onClick={() => handleUpdate(date)} className="bg-green-500 text-white">Update</Button>
                                    <Button size="sm" onClick={handleCancelEdit} className="bg-red-500 text-white">Cancel</Button>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                                    <h3 className="font-semibold text-xl">{item.title}</h3>
                                    <span className="text-sm text-gray-500"> <span className='text-black font-medium'>Time of Visit:</span> {formatTime(item.time)}</span>
                                  </div>
                                  <img src={`${BASE_URL}/${item.imageUrl}` || 'https://via.placeholder.com/300'} alt={item.title} className="w-full h-56 object-cover rounded-md mb-4" />
                                  <p className="text-sm mb-2"><strong>Booked:</strong> {item.isBooked ? 'Yes' : 'No'}</p>
                                  <p className="text-sm mb-4"><strong>Notes:</strong> {item.notes}</p>
                                  {isEditing && (
                                    <div className="flex space-x-2">
                                      <Button size="sm" color="danger" onClick={() => handleDelete(date, index)}>Delete</Button>
                                      <Button size="sm" color='primary' onClick={() => handleEdit(date, index)}>Edit</Button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                       
                      </div>
                    </AccordionItem>
                  ))}
                </Accordion>
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
          <Button onClick={() => { onClose(); setIsAddOpen(false); }} className="bg-red-500 text-white">Close</Button>
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