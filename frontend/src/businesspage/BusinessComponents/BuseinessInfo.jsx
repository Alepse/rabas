import React, { useState, useEffect } from 'react';
import { updateBusinessData } from '@/redux/businessSlice'; 
import { Tabs, Tab, Card, CardBody, Textarea, Button, Avatar } from "@nextui-org/react";
import { businessIcons } from './businessIcons';
import DOMPurify from 'dompurify';
import MapSection from '@/components/mapsection';
import { FaClipboardList, FaInfoCircle, FaConciergeBell, FaStar, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import { AiOutlineEdit } from "react-icons/ai";
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

const ReviewCard = ({ reviewId, name, rating, comment, avatar, date, isMyReview, refreshReview }) => {
  const [editRating, setEditRating] = useState(rating);
  const [editComment, setEditComment] = useState(comment);
  const [isEditing, setIsEditing] = useState(false);

  const handleEditReview = async () => {
    // Validate the input
    if (!reviewId || !editRating) {
      Swal.fire('Error', 'Rating ID and Rating are required', 'error');
      return;
    }

    try {
      // Make a PUT request to the backend
      const response = await axios.put(`${BASE_URL}/business-editReviewAndRating`, {
        ratings_id: reviewId,
        rating: editRating,
        comment: editComment, // Optional, can be empty
      });

      // Handle the response
      if (response.data.success) {
        Swal.fire('Success', 'Review and rating updated successfully', 'success');
        setIsEditing(false);
        refreshReview();
      } else {
        Swal.fire('Error', response.data.message || 'Failed to update review and rating', 'error');
      }
    } catch (error) {
      console.error('Error updating review and rating:', error);
      Swal.fire('Error', 'Internal server error. Please try again later.', 'error');
    }
  };

  return (
    <div className="h-full">
      <Card className="w-full px-2 relative">
        {isMyReview && (
          <AiOutlineEdit
            className="absolute top-2 right-2 z-40 cursor-pointer text-gray-600 text-2xl"
            onClick={() => setIsEditing(true)}
          />
        )}
        <CardBody className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-grow">
            <div className="flex mb-2 p-1">
              <div className="h-16 w-16 sm:h-24 sm:w-24 gap-5">
                <img
                  src={
                    avatar
                      ? `${BASE_URL}/${avatar}`
                      : `https://ui-avatars.com/api/?name=${name?.charAt(0).toUpperCase()}`
                  }
                  className="w-full h-full rounded-full object-cover shadow-gray-400 p-1 lg:p-4"
                  alt="avatar"
                />
              </div>
              <div className="flex items-center max-w-[70%]">
                <h3 className="text-sm md:text-lg lg:text-lg font-semibold flex items-center px-2 gap-3 break-all">
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
            <div
              className="text-gray-600 py-4"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(comment || ''),
              }}
            />
          </div>
        </CardBody>
      </Card>

      {isEditing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Edit Review</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Rating</label>
              <StarRating rating={editRating} onRatingChange={setEditRating} />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Comment</label>
              <textarea
                className="w-full p-2 border rounded"
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={handleEditReview}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
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
  const [myReview, setMyReview] = useState('');
  if (loading) {
    return <div>Loading...</div>;
  };

  if (!businessData) {
    return <div>No data available</div>;
  };

  const clearReview = () => {
    setNewReview('');
    setNewRating(0);
  };
  
  const fetchReviewsAndRatings = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/business-getAllReviewsAndRatings`);
      
      if (response.data.success) {
        // console.log(response.data.reviewsAndRatings);
        const reviews = response.data.reviewsAndRatings.filter(review => review.user_id !== parseInt(userData.user_id) && review.business_id === parseInt(businessData.business_id));
        // console.log('Filtered Reviews:', reviews);

        const myReview = response.data.reviewsAndRatings.filter(review => review.user_id === parseInt(userData.user_id) && review.business_id === parseInt(businessData.business_id));
        // console.log('Is reviewed:', is_reviewed);
        setMyReview(myReview);
        setIsReviewed(myReview.length > 0);
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


  const handleEditReview = async (ratings_id, rating, comment) => {
    // Validate the input
    if (!ratings_id || !rating) {
      Swal.fire('Error', 'Rating ID and Rating are required', 'error');
      return;
    }

    try {
      // Make a PUT request to the backend
      const response = await axios.put(`${BASE_URL}/business-editReviewAndRating`, {
        ratings_id,
        rating,
        comment, // Optional, can be empty
      });

      // Handle the response
      if (response.data.success) {
        Swal.fire('Success', 'Review and rating updated successfully', 'success');
      } else {
        Swal.fire('Error', response.data.message || 'Failed to update review and rating', 'error');
      }
    } catch (error) {
      console.error('Error updating review and rating:', error);
      Swal.fire('Error', 'Internal server error. Please try again later.', 'error');
    }
  };

  const renderIcon = (iconName) => {
    const IconComponent = businessIcons.find(icon => icon.name === iconName)?.icon;
    return IconComponent ? <IconComponent className="inline-block mr-2" /> : null;
  };
  
  const handleGetDirections = () => {
    if (businessData.pin_location) {
      const { latitude, longitude } = businessData.pin_location;
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
      window.open(googleMapsUrl, '_blank');
    } else {
      showErrorAlert('Location not available');
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
              <div className="space-y-8 h-auto overflow-y-auto scrollbar-custom">
                {/* About Us Section */}
                <div className='border  max-h-[12rem] overflow-y-auto scrollbar-custom border-gray-200 rounded-md shadow-sm p-4'>
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
                    <MapSection 
                      businesses={[businessData]} 
                      currentZoom={16} 
                      setCurrentZoom={setCurrentZoom} 
                      initialCenter={[businessData.pin_location.latitude - 0.002, businessData.pin_location.longitude]} 
                    />
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

        {/* Reviews */}
        <Tab key="reviews" title={<><FaStar className="mr-2" />Reviews</>}>
          <Card>
            <CardBody>
              <h2 className="text-2xl font-bold py-4 px-8 mb-6">Ratings and reviews</h2>
              {myReview.length == 0 && reviews.length == 0 ? (
                <div className="w-full h-full flex items-center justify-center rounded-t-lg text-gray-500">
                  <p className="text-slate-500 px-8">No reviews available.</p>
                </div>
              ) : (
                <>
                <div className="space-y-4 px-4 mb-8">  
                  {Array.isArray(myReview) && (
                    myReview.map((review, index) => (
                      <ReviewCard
                        key={`${review.ratings_id}-${index}`}
                        reviewId={review.ratings_id}
                        name={review.username || "Deleted account"}
                        rating={review.ratings}
                        comment={review.comment}
                        avatar={review.image_path || review.image}
                        date={(review.create_at)} 
                        isMyReview={true}
                        refreshReview={() => fetchReviewsAndRatings()}
                      />
                    ))
                  )}
                </div>
                <div className="space-y-4 px-4 mb-8">
                  {Array.isArray(reviews) && (
                    reviews.map((review, index) => (
                      <ReviewCard
                        key={`${review.ratings_id}-${index}`}
                        reviewId={review.ratings_id}
                        name={review.username || "Deleted account"}
                        rating={review.ratings}
                        comment={review.comment}
                        avatar={review.image_path || review.image}
                        date={(review.create_at)} 
                        isMyReview={false}
                        refreshReview={() => fetchReviewsAndRatings()}
                      />
                    ))
                  )}
                </div>
                </>
              )}
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


export default BusinessInfo;
