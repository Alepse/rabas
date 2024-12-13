import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { updateBusinessData } from '@/redux/businessSlice'; 
import { Tabs, Tab, Card, CardBody, Textarea, Button, Avatar } from "@nextui-org/react";
import { businessIcons } from './businessIcons';
import DOMPurify from 'dompurify';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { FaFacebook, FaInstagram, FaPhone, FaWifi, FaCheckCircle, FaPlus, FaClipboardList } from 'react-icons/fa';


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

const ReviewCard = ({ name, rating, comment, avatar }) => (
  <Card className="w-full">
    <CardBody className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
      <Avatar src={avatar} size="lg" />
      <div className="flex-grow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
          <h3 className="text-lg font-semibold flex items-center gap-3">{name}</h3>
          <StarRating rating={rating} onRatingChange={() => {}} />
        </div>
        <div className="text-gray-600" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(comment || '') }} />
      </div>
    </CardBody>
  </Card>
);

const formatTime = (time) => {
  if (time === "Closed") return "Closed";
  
  const [hour, minute] = time.split(':');
  const hourInt = parseInt(hour, 10);
  const ampm = hourInt >= 12 ? 'PM' : 'AM';
  const formattedHour = hourInt % 12 || 12; // Convert 0 to 12 for midnight
  return `${formattedHour}:${minute} ${ampm}`;
};

const BusinessInfo = () => {
  const { businessId: encryptedBusinessId } = useParams();
  const [businessData, setBusinessData] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentZoom, setCurrentZoom] = useState(10);

  // Function to decrypt the business_id
  const decryptId = (encryptedId) => {
    const secretKey = import.meta.env.VITE_SECRET_KEY;
    const bytes = CryptoJS.AES.decrypt(decodeURIComponent(encryptedId), secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        setLoading(true);
        const decryptedBusinessId = decryptId(encryptedBusinessId);
        const response = await axios.get(`http://localhost:5000/getAllBusinesses`);
        const business = response.data.businesses.find(b => b.business_id === parseInt(decryptedBusinessId));
        setBusinessData(business);
        // console.log('Encrypted ID:', encryptedBusinessId);
        // console.log('Decrypted ID:', decryptedBusinessId);
      } catch (error) {
        console.error('Error fetching business data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, [encryptedBusinessId]);

  // log the business data
  // console.log('Business Data:', businessData);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!businessData) {
    return <div>No data available</div>;
  }

  const handleSubmitReview = (e) => {
    e.preventDefault();
    const newReview = {
      id: Date.now(),
      name: "Current User",
      rating,
      comment: review,
      avatar: "https://i.pravatar.cc/150?u=currentuser"
    };
    dispatch(updateBusinessData({ reviews: [newReview, ...(businessData.reviews || [])] }));
    setRating(0);
    setReview("");
  };

  const renderIcon = (iconName) => {
    const IconComponent = businessIcons.find(icon => icon.name === iconName)?.icon;
    return IconComponent ? <IconComponent className="inline-block mr-2" /> : null;
  };

  const sanitizeHtml = (html) => ({
    __html: DOMPurify.sanitize(html)
  });

  const { pin_location } = businessData;
  const initialCenter = pin_location ? [pin_location.latitude, pin_location.longitude] : [12.9738, 123.9807];

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
          tabList: "gap-6 w-full p-4 container",
          tab: "max-w-fit px-0 h-12",
          tabContent: "text-color1"
        }}
      >
        <Tab key="about-location" title="About Us">
          <Card>
            <CardBody>
              <div className="flex flex-col lg:flex-row h-auto lg:h-[47em] overflow-y-auto scrollbar-custom gap-8">
                <div className="flex-1 p-4">
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">About Our Business</h2>
                  <div className='max-w-full lg:max-w-[40rem] w-full flex flex-col justify-center items-start'>
                    <div className="text-black mb-6 break-words whitespace-normal">
                      <h1 className="text-md font-normal">
                        {businessData.aboutUs}
                      </h1>
                    </div>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold flex items-center gap-3 mb-2">Contact Information</h3>
                    <ul className="space-y-2">
                      {businessData.contactInfo && businessData.contactInfo.length > 0 ? (
                        businessData.contactInfo.map((info, index) => (
                          <li key={`${info.label}-${index}`} className="flex items-center gap-2">
                            {renderIcon(info.icon)}
                            <span>
                              {info.label}{info.value ? `: ${info.value}` : ''}
                            </span>
                          </li>
                        ))
                      ) : (
                        <li className="italic text-gray-500 p-4 bg-gray-100 rounded-md">
                          No contact information available
                        </li>
                      )}
                    </ul>
                  </div>
                  <Card>
                    <CardBody>
                      <h3 className="text-xl font-semibold flex items-center gap-3 mb-3">Opening Hours</h3>
                      <ul className="space-y-2">
                        {businessData.openingHours && businessData.openingHours.length > 0 ? (
                          businessData.openingHours.map((hours, index) => (
                            <li key={index} className="flex justify-between items-center py-2 border-b">
                              <span className="font-medium">{hours.day}</span>
                              <span className="text-gray-600">
                                {hours.open === "Closed" && hours.close === "Closed" ? "Closed" : `${formatTime(hours.open)} - ${formatTime(hours.close)}`}
                              </span>
                            </li>
                          ))
                        ) : (
                          <li className="italic text-gray-500 p-4 bg-gray-100 rounded-md">
                            No opening hours available
                          </li>
                        )}
                      </ul>
                    </CardBody>
                  </Card>
                </div>
                <div className="flex-1 p-4 z-0 ">
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">Location</h2>
                  <p className="mb-4 text-gray-600">{businessData.destination}</p>
                  <MapContainer center={initialCenter} zoom={currentZoom} className="w-full h-96">
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <MapEvents setCurrentZoom={setCurrentZoom} />
                    {pin_location ? (
                      (() => {
                        const { businessName, businessLogo } = businessData;
                        const position = [pin_location.latitude, pin_location.longitude];
                        const showLogo = currentZoom >= 10; // Set zoom level to show/hide logo

                        // Adjust font size based on zoom level
                        const fontSize = currentZoom >= 12 ? '1rem' : '0.85rem';

                        const customDivIcon = L.divIcon({
                          className: 'custom-icon',
                          html: `
                            <div class="custom-popup flex items-center whitespace-nowrap font-bold text-color1 " style="font-size: ${fontSize};">
                              ${showLogo ? `<div class="pin-container">
                                <div class="pin-head">
                                  <img src="http://localhost:5000/${businessLogo}" alt="${businessName}" class="pin-logo" />
                                </div>
                                <div class="pin-point"></div>
                              </div><span>${businessName}</span>` : `<div class="business-name">${businessName}</div>`}
                              
                            </div>
                          `,
                          iconSize: [50, 70], 
                          iconAnchor: [25, 70] 
                        });     

                        return <Marker key={businessData.business_id} position={position} icon={customDivIcon} />;
                      })()
                    ) : (
                      <div>No business data available</div>
                    )}
                  </MapContainer>
                  <Button color="primary" className="w-full mb-6 hover:bg-color2/90" onClick={handleGetDirections}>
                    Get Directions
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </Tab>
        <Tab key="facilities" title="Facilities & Amenities">
          <Card>
            <CardBody>
              <h2 className="text-2xl font-bold mb-4">Our Facilities & Amenities</h2>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {businessData.facilities && businessData.facilities.length > 0 ? (
              businessData.facilities.map((facility, index) => (
                <div key={index} className="flex flex-col items-center w-full h-auto p-4 bg-white shadow-md rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {React.createElement(
                      businessIcons.find(icon => icon.name === facility.icon)?.icon || FaCheckCircle,
                      { size: 20 }
                    )}
                    <p className="font-medium text-md">{facility.name}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="italic text-gray-500 p-4 bg-gray-100 rounded-md">No facilities available</div>
            )}
          </div>
            </CardBody>
          </Card>
        </Tab>
        <Tab key="reviews" title="Reviews">
          <Card>
            <CardBody>
              <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
              <div className="space-y-4 mb-8">
                {businessData.reviews && businessData.reviews.map((review, index) => (
                  <ReviewCard
                    key={`${review.id}-${index}`}
                    name={review.name}
                    rating={review.rating}
                    comment={review.comment}
                    avatar={review.avatar}
                  />
                ))}
              </div>
              <Card className="bg-gray-50">
                <CardBody>
                  <h3 className="text-xl font-bold mb-4">Leave a Review</h3>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="mb-2 font-semibold flex items-center gap-3">Your Rating</label>
                      <StarRating rating={rating} onRatingChange={setRating} size="lg" />
                    </div>
                    <Textarea
                      label="Your Review"
                      placeholder="Tell us about your experience..."
                      value={review}
                      onValueChange={setReview}
                      minRows={3}
                      className="w-full"
                      required
                    />
                    <Button
                      type="submit"
                      color="primary"
                      disabled={rating === 0 || !review}
                      className="w-full"
                    >
                      Submit Review
                    </Button>
                  </form>
                </CardBody>
              </Card>
            </CardBody>
          </Card>
        </Tab>
        <Tab key="policies" title="Policies">
          <Card>
            <CardBody>
              <h2 className="text-2xl font-bold mb-4">Our Policies</h2>
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
