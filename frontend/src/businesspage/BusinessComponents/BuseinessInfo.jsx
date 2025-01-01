import React, { useState, useEffect } from 'react';
import { updateBusinessData } from '@/redux/businessSlice'; 
import { Tabs, Tab, Card, CardBody, Textarea, Button, Avatar } from "@nextui-org/react";
import { businessIcons } from './businessIcons';
import DOMPurify from 'dompurify';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { FaClipboardList, FaInfoCircle, FaConciergeBell, FaStar, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axios from 'axios';
// Use the environment variable for the base URL
const BASE_URL = import.meta.env.VITE_BASE_URL; 

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
    cancelButtonText: 'Close',
    cancelButtonColor: '#D33736',  // Red color for cancellation
  });
};

const StarRating = ({ rating, onRatingChange, size = "md" }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const starSize = size === "lg" ? "text-2xl md:text-3xl" : "text-lg md:text-xl";

  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`cursor-pointer ${starSize} ${star <= (hoverRating || rating) ? "text-yellow-400" : "text-gray-300"}`}
          onClick={() => onRatingChange(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const ReviewCard = ({ name, rating, comment, avatar, date }) => {
//  console.log(name, rating, comment, avatar);
  return (
    <div className="h-full">
      <Card className="w-full px-2">
        <CardBody className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-grow">
            <div className="flex mb-2 p-1">
              <div className="h-16 w-16 sm:h-24 sm:w-24 gap-5">
                <img
                  src={avatar ? `${BASE_URL}/${avatar}` : `https://ui-avatars.com/api/?name=${name?.charAt(0).toUpperCase()}`}
                  className="w-full h-full rounded-full object-cover shadow-gray-400 p-1 lg:p-4"
                  alt="avatar"
                />
              </div>
              <div className="flex items-center max-w-[70%]">
                <h3 className="sm:text-sm md:text-lg lg:text-lg font-semibold flex items-center px-2 gap-3 break-all">
                  {name}
                </h3>
              </div>
            </div>
            <div className="flex mb-2 p-1">
              <StarRating rating={rating} onRatingChange={() => {}} />
              <p className="text-sm flex items-center px-4">
              {new Date(date).toLocaleString('en-US', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
              })}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
              
            </div>
            <div className="text-gray-600 py-4" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(comment || '') }} />
          </div>
        </CardBody>
      </Card>
    </div>
  )
};

const formatTime = (time) => {
  if (time === "Closed") return "Closed";
  
  const [hour, minute] = time.split(':');
  const hourInt = parseInt(hour, 10);
  const ampm = hourInt >= 12 ? 'PM' : 'AM';
  const formattedHour = hourInt % 12 || 12; // Convert 0 to 12 for midnight
  return `${formattedHour}:${minute} ${ampm}`;
};

const BusinessInfo = ({businessData, loading, userData, isLoggedIn}) => {
  const [reviews, setReviews] = useState("");
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [currentZoom, setCurrentZoom] = useState(10);
  const [isReviewed, setIsReviewed] = useState(false);
  if (loading) {
    return <div>Loading...</div>;
  }

  if (!businessData) {
    return <div>No data available</div>;
  }

  // console.log(isReviewed);


  const fetchReviewsAndRatings = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/business-getAllReviewsAndRatings`);
      
      if (response.data.success) {
        // console.log(response.data.reviewsAndRatings);
        const reviews = response.data.reviewsAndRatings.filter(review => review.business_id === parseInt(businessData.business_id));
        // console.log('Filtered Reviews:', reviews);

        const is_reviewed = response.data.reviewsAndRatings.filter(review => review.user_id === parseInt(userData.user_id) && review.business_id === parseInt(businessData.business_id));
        // console.log('Is reviewed:', is_reviewed);
        setIsReviewed(is_reviewed.length > 0);
        setReviews(reviews);
      } else {
        console.error('Failed to fetch reviews and ratings:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching reviews and ratings:', error);
    }
  };
  useEffect(() => {
    if (businessData && userData) {
      fetchReviewsAndRatings();
    }
  }, [businessData, userData]);

  const handleReviewSubmit = async () => {
    if (newRating > 0) {
      try {
        const response = await fetch(`${BASE_URL}/business-addReviewsAndRatings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userData.user_id,
            business_id: businessData.business_id,
            rating: newRating,
            comment: newReview
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Add the new review to the existing list of reviews
          setReviews([...reviews, {
            username: userData.username, // Or fetch the username from session if available
            ratings: newRating,
            comment: newReview
          }]);
    fetchReviewsAndRatings();

          // Refresh products in the parent component
          // refreshProducts();
          showSuccessAlert("Review added successfully");
          clearReview();
        } else {
          showErrorAlert('Failed to submit review:', data.message);
          console.error('Failed to submit review:', data.message);
        }
      } catch (error) {
        showErrorAlert('Error submitting review:', error);
        console.error('Error submitting review:', error);
      }
    }
  };

  const clearReview = () => {
    setNewReview('');
    setNewRating(0);
  };

  const renderIcon = (iconName) => {
    const IconComponent = businessIcons.find(icon => icon.name === iconName)?.icon;
    return IconComponent ? <IconComponent className="inline-block mr-2" /> : null;
  };

  const { pin_location } = businessData;
  const initialCenter = pin_location ? [pin_location.latitude, pin_location.longitude] : [12.9738, 123.9807];
  const defaultCenter = [12.9738, 123.9807]; // Fallback location if data is invalid

  const handleGetDirections = () => {
    if (businessData.pin_location) {
      const { latitude, longitude } = businessData.pin_location;
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
      window.open(googleMapsUrl, '_blank');
    } else {
      alert('Location not available');
    }
  };

  return (
    <div className='container mx-auto mt-4 px-4'>
         <Tabs 
        aria-label="Business Information" 
        className="max-w-full overflow-x-auto" 
        variant="underlined"  
        classNames={{
          base: "w-full overflow-x-auto mb-4",
          tabList: "gap-6 w-full p-2 container",
          tab: "max-w-fit px-0 h-12",
          tabContent: "text-color1 flex items-center"
        }}
      >
        <Tab key="about-location" title={<><FaInfoCircle className="mr-2" />About Us</>}>
  <Card className="p-4">
    <CardBody>
      <div className="space-y-8 h-auto lg:h-[47em] overflow-y-auto scrollbar-custom">
        {/* About Us Section */}
        <div className='border border-gray-200 rounded-md shadow-sm p-4'>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">About Our Business</h2>
          <div className="text-gray-700 mb-6 break-words whitespace-normal">
            <p className="text-md font-normal">{businessData.aboutUs}</p>
          </div>
        </div>

        {/* Contact Information and Opening Hours */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div className="p-4 border border-gray-200 rounded-md shadow-sm">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
               Contact Information
            </h3>
            <ul className="space-y-3">
              {businessData.contactInfo && businessData.contactInfo.length > 0 ? (
                businessData.contactInfo.map((info, index) => (
                  <li
                    key={`${info.label}-${index}`}
                    className="text-gray-700 flex items-center gap-3"
                  >
                    {renderIcon(info.icon)}
                    <span>
                      {info.label}
                      {info.value ? `: ${info.value}` : ''}
                    </span>
                  </li>
                ))
              ) : (
                <li className="italic text-gray-500">
                  No contact information available
                </li>
              )}
            </ul>
          </div>

          {/* Opening Hours */}
          <div className="p-4 border border-gray-200 rounded-md shadow-sm">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaClock /> Opening Hours
            </h3>
            <ul className="space-y-2">
              {businessData.openingHours && businessData.openingHours.length > 0 ? (
                businessData.openingHours.map((hours, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center py-1 border-b last:border-none text-gray-700"
                  >
                    <span>{hours.day}</span>
                    <span>
                      {hours.open === "Closed" && hours.close === "Closed"
                        ? "Closed"
                        : `${formatTime(hours.open)} - ${formatTime(hours.close)}`}
                    </span>
                  </li>
                ))
              ) : (
                <li className="italic text-gray-500">
                  No opening hours available
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Location Section */}
<div className="relative">
  <h2 className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-2">
    <FaMapMarkerAlt /> Location
  </h2>
  <p className="mb-4 text-gray-600">{businessData.completeAddress}</p>
  <div className="w-full h-96 rounded-md shadow-lg overflow-hidden relative z-10">
    <MapContainer
      center={
        initialCenter && initialCenter.lat != null && initialCenter.lng != null
          ? [initialCenter.lat, initialCenter.lng]
          : defaultCenter
      }
      zoom={currentZoom}
      className="w-full h-full"
      style={{ zIndex: 0 }} // Ensures the map stays at the correct level
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MapEvents setCurrentZoom={setCurrentZoom} />

      {pin_location && pin_location.latitude != null && pin_location.longitude != null ? (
        (() => {
          const { businessName, businessLogo } = businessData;
          const position = [pin_location.latitude, pin_location.longitude];
          const showLogo = currentZoom >= 10; // Set zoom level to show/hide logo

          const customDivIcon = L.divIcon({
            className: 'custom-icon',
            html: `
              <div class="custom-popup flex items-center whitespace-nowrap font-bold text-color1">
                ${showLogo ? `
                  <div class="pin-container">
                    <div class="pin-head">
                      <img src="${BASE_URL}/${businessLogo}" alt="${businessName}" class="pin-logo" />
                    </div>
                    <div class="pin-point"></div>
                  </div>
                  <span>${businessName}</span>
                ` : `<div class="business-name">${businessName}</div>`}
              </div>
            `,
            iconSize: [50, 70],
            iconAnchor: [25, 70],
          });

          return <Marker key={businessData.business_id} position={position} icon={customDivIcon} />;
        })()
      ) : (
        <div className="text-center text-gray-500 mt-4">No valid pin location available for this business.</div>
      )}
    </MapContainer>
  </div>
  <Button
    color="primary"
    className="w-full mt-6 hover:bg-color2/90 relative z-10"
    onClick={handleGetDirections}
  >
    Get Directions
  </Button>
</div>

      </div>
    </CardBody>
  </Card>
</Tab>

        <Tab key="facilities" title={<><FaConciergeBell className="mr-2" />Facilities & Amenities</>}>
          <Card>
            <CardBody>
              <h2 className="text-2xl font-bold mb-4">Our Facilities & Amenities</h2>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {businessData.facilities && businessData.facilities.length > 0 ? (
                  businessData.facilities.map((facility, index) => (
                    <div key={index} className="flex flex-col items-start w-full h-auto p-4 bg-white shadow-md rounded-lg">
                      <div className="mb-2">
                        <p className="font-medium text-md">{facility.name}</p>
                      </div>
                      <ul className="pl-5 space-y-1">
                        {facility.items && facility.items.length > 0 ? (
                          facility.items.map((item, itemIndex) => (
                            <li key={itemIndex} className="font-normal text-sm list-disc flex items-center gap-2">
                              {item.icon && React.createElement(businessIcons.find(icon => icon.name === item.icon)?.icon, { size: 16 })}
                              <span>{item.name}</span>
                            </li>
                          ))
                        ) : (
                          <li className="italic text-gray-500">No items available</li>
                        )}
                      </ul>
                    </div>
                  ))
                ) : (
                  <div className="italic text-gray-500 p-4 bg-gray-100 rounded-md">No facilities available</div>
                )}
              </div>
            </CardBody>
          </Card>
        </Tab>
        <Tab key="reviews" title={<><FaStar className="mr-2" />Reviews</>}>
          <Card>
            <CardBody>
              <h2 className="text-2xl font-bold py-4 px-8 mb-6">Ratings and reviews</h2>
              <div className="space-y-4 px-4 mb-8">
                {Array.isArray(reviews) && reviews.length > 0 ? (
                  reviews.map((review, index) => (
                    <ReviewCard
                      key={`${review.ratings_id}-${index}`}
                      name={review.username || "Deleted account"}
                      rating={review.ratings}
                      comment={review.comment || "No comment provided."}
                      avatar={review.image_path || review.image}
                      date={(review.create_at)} 
                    />
                  ))
                ) : (
                  <p className="text-slate-500">No reviews available.</p>
                )}
              </div>
              <div className="py-4 px-8">
                {!isReviewed && (
                  <Card className="bg-gray-50">
                    <CardBody>
                      <h3 className="text-xl font-bold mb-4">Leave a Review</h3>
                      {/* <form onSubmit={handleReviewSubmit} className="space-y-4"> */}
                        <div>
                          <label className="mb-2 font-semibold flex items-center gap-3">Your Rating</label>
                          <StarRating rating={newRating} onRatingChange={setNewRating} size="lg" />
                        </div>
                        <Textarea
                          label="Your Review"
                          placeholder="Tell us about your experience..."
                          value={newReview}
                          onValueChange={setNewReview}
                          minRows={3}
                          className="w-full"
                        />
                        <Button
                          type="submit"
                          color="primary"
                          onClick={() => {
                            if (isLoggedIn) {
                              handleReviewSubmit();
                            } else {
                              showErrorAlert('Please log in to submit a review.');
                            }
                          }} 
                          disabled={newRating === 0}
                          className="w-full"
                        >
                          Submit Review
                        </Button>
                      {/* </form> */}
                    </CardBody>
                  </Card> 
                )}
              </div>
            </CardBody>
          </Card>
        </Tab>
        <Tab key="policies" title={<><FaClipboardList className="mr-2" />Policies</>}>
          <Card>
            <CardBody>
              <h2 className="text-2xl font-bold mb-4">Our Policies</h2>
              <p className="mb-4 text-gray-600">Please review our policies carefully to ensure a smooth experience.</p>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {businessData.policies && businessData.policies.length > 0 ? (
                  businessData.policies.map((policy, index) => (
                    <div key={index} className="flex flex-col items-start w-full h-auto p-4 bg-white shadow-md rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FaClipboardList size={20} />
                        <p className="font-semibold text-lg">{policy.title}</p>
                      </div>
                      <ul className="pl-5 space-y-1">
                        {policy.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="font-normal text-sm list-disc">
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  <div className="italic text-gray-500 p-4 bg-gray-100 rounded-md">No policies available</div>
                )}
              </div>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>
  )
}

// Component to handle map events
const MapEvents = ({ setCurrentZoom }) => {
  useMapEvents({
    zoomend: (e) => {
      setCurrentZoom(e.target.getZoom());
    },
  });
  return null;
};


export default BusinessInfo;
