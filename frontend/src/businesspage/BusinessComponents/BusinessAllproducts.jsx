import React, { useState, useEffect } from 'react';
import {
  Tabs,
  Tab,
  Card,
  CardBody,
  Select,
  SelectItem,
  Slider,
  Button,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  Spinner,
  useDisclosure,
} from '@nextui-org/react';
import { MdRateReview } from 'react-icons/md';
import { AiFillStar } from 'react-icons/ai';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import AccommodationBookingForm from './bookingFormModal/AccommodationBookingForm';
import TableReservationForm from './bookingFormModal/TableReservationForm';
import AttractionActivitiesBookingForm from './bookingFormModal/AttractionActivitiesBookingForm';

// Mock Data for each tab with amenities
const mockData = {
  activities: [
    {
      product_id: 1,
      business_id: 2,
      title: 'Hiking Adventure',
      description: 'Explore scenic mountain trails. Guide and equipment included.',
      price: 1500,
      discount: 10, // 10% discount
      imageUrl: 'https://via.placeholder.com/200',
      rating: 4,
      type: 'Hiking',
      images: ['https://via.placeholder.com/600', 'https://via.placeholder.com/601', 'https://via.placeholder.com/602', 'https://via.placeholder.com/603'],
      expiration: '10/4/2024', // Added expiration date
    },
    {
      product_id: 2,
      business_id: 2,
      title: 'Snorkeling Tour',
      description: 'Discover the underwater world with a guided snorkeling tour.',
      price: 1200,
      discount: 5, // 5% discount
      imageUrl: 'https://via.placeholder.com/200',
      rating: 3,
      type: 'Water Sports',
      images: ['https://via.placeholder.com/600', 'https://via.placeholder.com/601', 'https://via.placeholder.com/602', 'https://via.placeholder.com/603'],
      expiration: '10/4/2024', // Added expiration date
    },
  ],
  accommodations: [
    {
      product_id: 1,
      business_id: 2,
      product_category: 'accommodation',
      title: 'Luxury Mountain Cabin',
      description: 'Stay in a cozy cabin with scenic views and modern amenities.',
      price: 5000,
      discount: 10, // 10% discount
      imageUrl: 'https://via.placeholder.com/200',
      rating: 5,
      type: 'Cabins',
      images: ['https://via.placeholder.com/600', 'https://via.placeholder.com/601', 'https://via.placeholder.com/602', 'https://via.placeholder.com/603'],
      expiration: '12/31/2024', // Added expiration date
    },
    {
      product_id: 2,
      business_id: 2,
      product_category: 'accommodation',
      title: 'Beachfront Resort',
      description: 'Relax in a luxury resort right on the beach.',
      price: 8000,
      discount: 5, // 5% discount
      imageUrl: 'https://via.placeholder.com/200',
      rating: 4,
      type: 'Resorts',
      images: ['https://via.placeholder.com/600', 'https://via.placeholder.com/601', 'https://via.placeholder.com/602', 'https://via.placeholder.com/603'],
      expiration: '12/31/2024', // Added expiration date
    },
  ],
  restaurant: [
    {
      product_id: 1,
      business_id: 2,
      title: 'Mountain View Dining',
      description: 'Experience local cuisine with a view of the mountains.',
      price: 1000,
      discount: 10, // 10% discount
      imageUrl: 'https://via.placeholder.com/200',
      rating: 2,
      type: 'Fine Dining',
      images: ['https://via.placeholder.com/600', 'https://via.placeholder.com/601', 'https://via.placeholder.com/602', 'https://via.placeholder.com/603'],
      expiration: '10/4/2024', // Added expiration date
    },
    {
      product_id: 2,
      business_id: 2,
      title: 'Coastal Seafood Feast',
      description: 'Indulge in fresh seafood dishes by the shore.',
      price: 1500,
      discount: 5, // 5% discount
      imageUrl: 'https://via.placeholder.com/200',
      rating: 4,
      type: 'Buffet',
      images: ['https://via.placeholder.com/600', 'https://via.placeholder.com/601', 'https://via.placeholder.com/602', 'https://via.placeholder.com/603'],
      expiration: '10/4/2024', // Added expiration date
    },
  ],
  shop: [
    {
      title: 'Local Handicrafts',
      description: 'Shop unique handmade items from local artisans.',
      price: 500,
      discount: 10, // 10% discount
      imageUrl: 'https://via.placeholder.com/200',
      rating: 3,
      type: 'Local Crafts',
      images: ['https://via.placeholder.com/600', 'https://via.placeholder.com/601', 'https://via.placeholder.com/602', 'https://via.placeholder.com/603'],
      expiration: '10/4/2024', // Added expiration date
    },
    {
      title: 'Souvenir Shop',
      description: 'Get your souvenirs and take home memories of the trip.',
      price: 700,
      discount: 5, // 5% discount
      imageUrl: 'https://via.placeholder.com/200',
      rating: 2,
      type: 'Souvenirs',
      images: ['https://via.placeholder.com/600', 'https://via.placeholder.com/601', 'https://via.placeholder.com/602', 'https://via.placeholder.com/603'],
      expiration: '10/4/2024', // Added expiration date
    },
  ],
};

const allProducts = [
  ...mockData.activities,
  ...mockData.accommodations,
  ...mockData.restaurant,
  ...mockData.shop,
];

// Review Modal Component
const ReviewModal = ({ isOpen, onClose, product }) => {
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [reviews, setReviews] = useState([
    { user: 'John Doe', rating: 4, comment: 'Great experience! Highly recommend this.' },
    { user: 'Jane Smith', rating: 5, comment: 'Amazing service, I loved it!' },
  ]);

  const handleReviewSubmit = () => {
    if (newReview && newRating > 0) {
      const review = { user: 'Anonymous', rating: newRating, comment: newReview };
      setReviews([...reviews, review]);
      setNewReview('');
      setNewRating(0);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-full md:max-w-2xl">
      <ModalContent className="p-4">
        <ModalHeader>
          <h2 className="text-xl font-semibold">Write a Review for {product.title}</h2>
        </ModalHeader>
        <ModalBody className="py-4">
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="font-bold mb-2">Your Rating</h3>
              <div className="flex gap-2 text-2xl">
                {[1, 2, 3, 4, 5].map((num) => (
                  <AiFillStar
                    key={num}
                    className={num <= newRating ? 'text-yellow-500' : 'text-gray-300'}
                    onClick={() => setNewRating(num)}
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-2">Your Review</h3>
              <Textarea
                placeholder="Write your review here..."
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                fullWidth
              />
            </div>
          </div>
          <div className="mt-6">
            <h3 className="font-bold mb-2">Reviews</h3>
            <div className="space-y-4">
              {reviews.map((review, index) => (
                <div key={index} className="bg-gray-100 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="font-bold">{review.user}</div>
                    <div className="flex ml-2">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <AiFillStar key={i} className="text-yellow-500" />
                      ))}
                    </div>
                  </div>
                  <div>{review.comment}</div>
                </div>
              ))}
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="flex justify-end">
          <Button onClick={handleReviewSubmit} color="primary" disabled={!newReview || newRating === 0}>
            Submit Review
          </Button>
          <Button color="danger" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// Product Card Component
const ProductCard = ({ product, openBookingModal, onOpen }) => {
  const [isReviewModalOpen, setReviewModalOpen] = useState(false);

  const openReviewModal = () => setReviewModalOpen(true);
  const closeReviewModal = () => setReviewModalOpen(false);

  const discountedPrice = product.price - (product.price * (product.discount || 0) / 100);

  return (
    <Card variant="shadow" className="border-0 rounded-lg mb-4 overflow-hidden  ">
      <CardBody className="flex flex-col ">
        <div className="relative w-full h-[250px] md:h-[300px]">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="object-cover w-full h-full rounded-t-lg"
          />
          {product.discount > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              {product.discount}% OFF
            </div>
          )}
          <Button size="sm" className="absolute bottom-2 right-2 text-white bg-color1" onClick={onOpen}>
            View Images
          </Button>
        </div>
        <div className="p-4 flex flex-col justify-between flex-grow">
          <div>
            <div className="font-bold text-lg mb-1">{product.title}</div>
            <div className="flex items-center gap-1 mb-2">
              <span className="text-black font-semibold">{product.rating}</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <AiFillStar
                    key={star}
                    className={star <= product.rating ? 'text-yellow-500' : 'text-gray-300'}
                  />
                ))}
              </div>
              <Tooltip content="Write a Review">
                <Button size="sm" className="bg-transparent" onClick={openReviewModal}>
                  <MdRateReview className="text-lg cursor-pointer" />
                </Button>
              </Tooltip>
            </div>
            <div className="text-gray-700 mb-4">{product.description}</div>
          </div>
          <div className="flex justify-between items-center mt-auto">
            <div className="text-lg font-semibold">
              {product.discount ? (
                <>
                  <span className="line-through text-gray-500">₱{product.price}</span>
                  <span className="text-red-500 ml-2">₱{discountedPrice}</span>
                </>
              ) : (
                `₱${product.price}`
              )}
              {product.expiration && (
              <p className="text-xs text-red-500 mt-1">Discount expires on: {product.expiration}</p>
            )}
              <div className="flex mt-4 gap-2">
                <Button color="primary">Inquire</Button>
                <Button color="success" className="text-white" onClick={() => openBookingModal(product)}>
                  Book
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardBody>
      <ReviewModal isOpen={isReviewModalOpen} onClose={closeReviewModal} product={product} />
    </Card>
  );
};

// Filter Component
const Filters = ({ activeTab, setSelectedType, setRatingFilter, budgetRange, setBudgetRange, ratingFilter }) => {
  const handleRatingClick = (rating) => {
    if (rating === 'All') {
      setRatingFilter([]); // Clear all ratings
    } else {
      setRatingFilter((prev) =>
        prev.includes(rating) ? prev.filter((r) => r !== rating) : [...prev, rating]
      );
    }
  };

  let filterOptions = [];

  switch (activeTab) {
    case 'activities':
      filterOptions = ['All', 'Hiking', 'Water Sports', 'Sightseeing'];
      break;
    case 'accommodations':
      filterOptions = ['All', 'Cabins', 'Hotel Rooms', 'Resorts'];
      break;
    case 'restaurant':
      filterOptions = ['All', 'Local Cuisine', 'Buffet', 'Fine Dining'];
      break;
    case 'shop':
      filterOptions = ['All', 'Souvenirs', 'Local Crafts', 'Clothing'];
      break;
    case 'all':
    default:
      filterOptions = ['All', 'Hiking', 'Water Sports', 'Sightseeing', 'Cabins', 'Resorts', 'Local Cuisine', 'Fine Dining', 'Souvenirs', 'Local Crafts'];
      break;
  }

  return (
    <>
      <div className="font-bold text-lg text-gray-700 mb-4">Filter by Type</div>
      <Select
        placeholder="Select Type"
        onChange={(e) => setSelectedType(e.target.value)}
        defaultValue="All"
        className="mb-4"
      >
        {filterOptions.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </Select>

      {/* Ratings Filter */}
      <div className="font-bold text-lg text-gray-700 mb-4">Ratings</div>
      <div className="space-y-2">
        <label className="flex items-center">
          <input
            type="checkbox"
            onChange={() => handleRatingClick('All')}
            checked={ratingFilter.length === 0}
            className="form-checkbox text-color2"
          />
          <span className="ml-2 text-sm">All Ratings</span>
        </label>
        {[5, 4, 3, 2, 1].map((star) => (
          <label key={star} className="flex items-center">
            <input
              type="checkbox"
              onChange={() => handleRatingClick(star)}
              checked={ratingFilter.includes(star)}
              className="form-checkbox text-color2"
            />
            <span className="ml-2 text-sm flex items-center">
              {'★'.repeat(star)}{'☆'.repeat(5 - star)}
              <span className="ml-1">{star} Star{star > 1 ? 's' : ''}</span>
            </span>
          </label>
        ))}
      </div>

      <div className="font-bold text-lg text-gray-700 mb-4">Filter by Budget</div>
      <Slider
        label="Price Range"
        step={100}
        minValue={0}
        maxValue={10000}
        value={budgetRange}
        onChange={setBudgetRange}
        formatOptions={{ style: 'currency', currency: 'PHP' }}
        className="max-w-md"
      />
      <p>Selected Budget: ₱{budgetRange[0]} - {budgetRange[1] === 10000 ? '₱10,000+' : `₱${budgetRange[1]}`}</p>
    </>
  );
};

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-full">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
  </div>
);

// Add the images array from BusinessHero
const images = [
  { url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&h=900&q=80', title: 'Sunset Over the Hills' },
  { url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&h=900&q=80', title: 'Mountain Range' },
  { url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&h=900&q=80', title: 'City Skyline' },
  { url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&h=900&q=80', title: 'Forest Path' },
  { url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&h=900&q=80', title: 'Ocean Waves' },
  { url: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1600&h=900&q=80', title: 'Desert Dunes' },
];

// Main Business All Products Component
const BusinessAllproducts = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedType, setSelectedType] = useState('All');
  const [ratingFilter, setRatingFilter] = useState([]);
  const [budgetRange, setBudgetRange] = useState([0, 10000]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImages, setModalImages] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewIndex, setPreviewIndex] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure(); // Ensure this is included

  const openBookingModal = (product) => {
    if (product.type === 'Cabins' || product.type === 'Resorts') {
      setActiveModal({ type: 'accommodation', product });
    } else if (product.type === 'Fine Dining' || product.type === 'Buffet') {
      setActiveModal({ type: 'restaurant', product });
    } else if (product.type === 'Hiking' || product.type === 'Water Sports') {
      setActiveModal({ type: 'activities', product });
    }
  };

  const closeBookingModal = () => setActiveModal(null);

  useEffect(() => {
    setLoading(true);
    let data;
    switch (activeTab) {
      case 'activities':
        data = mockData.activities;
        break;
      case 'accommodations':
        data = mockData.accommodations;
        break;
      case 'restaurant':
        data = mockData.restaurant;
        break;
      case 'shop':
        data = mockData.shop;
        break;
      default:
        data = allProducts;
    }

    // Apply Type Filter
    if (selectedType !== 'All') {
      data = data.filter((item) => item.type === selectedType);
    }

    // Apply Rating Filter
    if (ratingFilter.length > 0) {
      data = data.filter((item) => ratingFilter.includes(item.rating));
    }

    // Apply Budget Filter
    data = data.filter((item) =>
      budgetRange[1] === 10000 ? item.price >= budgetRange[0] : item.price >= budgetRange[0] && item.price <= budgetRange[1]
    );

    // Sort by Price from Highest to Lowest
    data = data.sort((a, b) => b.price - a.price);

    setFilteredData(data);
    setLoading(false);
  }, [activeTab, selectedType, ratingFilter, budgetRange]);

  useEffect(() => {
    // Simulate data fetching
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const handleThumbnailClick = (index) => {
    setPreviewImage(images[index].url);
    setPreviewIndex(index);
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setPreviewImage(null);
    setPreviewIndex(null);
    setIsPreviewOpen(false);
  };

  const goToPrevImage = () => {
    if (previewIndex > 0) {
      setPreviewIndex(previewIndex - 1);
      setPreviewImage(images[previewIndex - 1].url);
    }
  };

  const goToNextImage = () => {
    if (previewIndex < images.length - 1) {
      setPreviewIndex(previewIndex + 1);
      setPreviewImage(images[previewIndex + 1].url);
    }
  };

  if (loading) {
    return <Spinner className='flex justify-center items-center h-screen' size='lg' label="Loading..." color="primary" />;
  }

  return (
    <div className="min-h-screen container mx-auto p-4 bg-white  rounded-md shadow-md mb-4">
      <div className="text-3xl font-semibold mb-6 text-gray-800">What We Offer</div>

      <div className="flex flex-col lg:flex-row gap-2">
        {/* Filter Section */}
        <div className="w-full lg:w-1/4 bg-white p-6 rounded-lg shadow-md">
          <Filters
            activeTab={activeTab}
            setSelectedType={setSelectedType}
            setRatingFilter={setRatingFilter}
            budgetRange={budgetRange}
            setBudgetRange={setBudgetRange}
            ratingFilter={ratingFilter}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col w-full bg-white  p-5 rounded-lg shadow-md">
          {/* Tabs */}
          <Tabs
            aria-label="Business Offerings"
            variant="underlined"
            className="mb-4"
            onSelectionChange={(key) => setActiveTab(key)}
            selectedKey={activeTab}
          >
            <Tab key="all" title="All Products" />
            <Tab key="activities" title="Activities" />
            <Tab key="accommodations" title="Accommodations" />
            <Tab key="restaurant" title="Restaurant Service" />
            <Tab key="shop" title="Shop" />
          </Tabs>

          {/* Content */}
          <div className="p-2 max-h-[800px] overflow-y-auto  scrollbar-custom">
            {loading ? (
              <LoadingSpinner />
            ) : filteredData.length > 0 ? (
              filteredData.map((product, index) => (
                <ProductCard key={index} product={product} openBookingModal={openBookingModal} onOpen={onOpen} />
              ))
            ) : (
              <div className="text-center text-gray-500">No results found</div>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        scrollBehavior="inside"
        size="5xl"
        className='max-h-[100%]'
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Image Gallery</ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 cursor-pointer">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className="relative group overflow-hidden rounded-lg shadow-md"
                      onClick={() => handleThumbnailClick(index)}
                    >
                      <img
                        src={image.url}
                        alt={`Gallery image ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300"></div>
                    </div>
                  ))}
                </div>
              
              </ModalBody>
              <ModalFooter>
                <Button onPress={onClose} color='danger'>Close</Button>
              </ModalFooter>

               {/* Single Image Preview Modal */}
      <Modal 
        isOpen={isPreviewOpen} 
        onOpenChange={setIsPreviewOpen}
        hideCloseButton
        size="full"
        className='z-50 bg-black bg-opacity-75 flex justify-center items-center'
      >
        <ModalContent className="relative flex justify-center items-center">
          <ModalBody className="relative max-w-full h-full flex justify-center items-center bg-white">
            <img
              src={previewImage}
              alt="Preview"
              className="w-auto h-auto object-contain rounded-md shadow-lg"
            />
            {previewIndex !== null && images[previewIndex] && (
              <div className="absolute bottom-4 left-0 right-0 text-center text-black text-2xl font-semibold py-2">
                {images[previewIndex].title}
              </div>
            )}
            <button
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-70 hover:bg-opacity-90 rounded-full p-3 transition-all duration-300"
              onClick={goToPrevImage}
              aria-label="Previous image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-70 hover:bg-opacity-90 rounded-full p-3 transition-all duration-300"
              onClick={goToNextImage}
              aria-label="Next image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              className="absolute top-4 right-4 bg-red-500  bg-opacity-70 hover:bg-opacity-90 rounded-full p-2 transition-all duration-300"
              onClick={closePreview}
              aria-label="Close preview"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </ModalBody>
        </ModalContent>
      </Modal>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Conditionally Render Modals */}
      {activeModal?.type === 'accommodation' && <AccommodationBookingForm isOpen={true} onClose={closeBookingModal} product={activeModal.product} />}
      {activeModal?.type === 'restaurant' && <TableReservationForm isOpen={true} onClose={closeBookingModal} product={activeModal.product} />}
      {activeModal?.type === 'activities' && <AttractionActivitiesBookingForm isOpen={true} onClose={closeBookingModal} product={activeModal.product} />}
    </div>
  );
};

export default BusinessAllproducts;
