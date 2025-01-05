import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, ModalContent, ModalHeader, ModalBody, Select, SelectItem  } from '@nextui-org/react';
import { Input, Button, Checkbox } from '@nextui-org/react';
import Slider from 'react-slick';
import { addProduct, handleUpdateRestaurant, deleteRestaurants, fetchBusinessProducts } from '@/redux/restaurantServicesSlice';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaSearch, FaChevronLeft, FaChevronRight, FaImage } from 'react-icons/fa';
import { FaPlus } from "react-icons/fa";
import Swal from 'sweetalert2';
// Use the environment variable for the base URL
const BASE_URL = import.meta.env.VITE_BASE_URL; 

const showSuccessAlert = (message) => {
  Swal.fire({
    title: 'Success!',
    text: message,
    icon: 'success',
    confirmButtonText: 'OK',
    confirmButtonColor: '#0BDA51',
    cancelButtonColor: '#D33736',
  });
};

const showErrorAlert = (message) => {
  Swal.fire({
    title: 'Error!',
    text: message,
    icon: 'error',
    confirmButtonText: 'Try Again',
    confirmButtonColor: '#0BDA51',
    cancelButtonText: 'Close',
    cancelButtonColor: '#D33736',
  });
};

const RestaurantSection = () => {
  // State Management
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRestaurantId, setEditingRestaurantId] = useState(null);
  const [restaurantName, setRestaurantName] = useState('');
  const [pricing, setPricing] = useState('');
  const [pricingUnit, setPricingUnit] = useState('');
  const [description, setDescription] = useState('');
  const [hasBooking, setHasBooking] = useState(false);
  const [inclusions, setInclusions] = useState('');
  const [inclusionList, setInclusionList] = useState([]);
  const [images, setImages] = useState([]); // Updated to store objects with url and title
  const [selectedRestaurants, setSelectedRestaurants] = useState([]);
  const [restaurantType, setRestaurantType] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [termsAndConditions, setTermsAndConditions] = useState([]);
  const [termsList, setTermsList] = useState([]); // New state for terms list
  const [loadingSpinning, setLoadingSpinning] = useState(false);


  const dispatch = useDispatch();
  const restaurants = useSelector((state) => state.restaurantServices.restaurants);
  const status = useSelector((state) => state.restaurantServices.status);
  const error = useSelector((state) => state.restaurantServices.error);
  const [errorText, setErrorText] = useState(""); // State for validation messages
  const [errorTextTerms, setErrorTextTerms] = useState("");
  const [errorTextInclusions, setErrorTextInclusions] = useState("");
  const sliderRefs = useRef({});

  const [options, setOptions] = useState([
    { value: 'buffet', label: 'Buffet' },
    { value: 'custom', label: 'Custom' },
  ]);
  const [newOption, setNewOption] = useState("");

  // Sync restaurants with options and remove duplicates
  useEffect(() => {
  
    // Normalize restaurant types to lowercase and remove duplicates
    const resturantTypes = restaurants
      .map((acc) => acc.restaurantType?.toLowerCase())
      .filter((type, index, self) => type && self.indexOf(type) === index);
  
    // Filter types not already in options
    const newOptions = resturantTypes
      .filter((type) => !options.some((option) => option.value === type))
      .map((type) => ({ value: type, label: type.charAt(0).toUpperCase() + type.slice(1) }));
  
    // Add new options to the state if any
    if (newOptions.length > 0) {
      setOptions((prevOptions) => {
        // Filter to avoid duplicates in the combined options list
        const updatedOptions = [
          ...prevOptions,
          ...newOptions.filter(
            (newOption) =>
              !prevOptions.some(
                (existingOption) =>
                  existingOption.value.toLowerCase() === newOption.value.toLowerCase()
              )
          ),
        ];
  
        // Ensure 'custom' is always the last option
        const customOption = updatedOptions.find(option => option.value === 'custom');
        const optionsWithoutCustom = updatedOptions.filter(option => option.value !== 'custom');
        const finalOptions = [...optionsWithoutCustom, customOption];
  
        return finalOptions;
      });
    }
  }, [restaurants, options]);

  const handleAddOption = () => {
    const normalizedOption = newOption.trim().toLowerCase();
  
    if (!newOption.trim()) {
      setErrorText("Please enter a valid option."); // Show error for empty input
      return;
    }
  
    // Prevent adding duplicate options
    if (options.some((opt) => opt.value === normalizedOption)) {
      setErrorText(`The option "${newOption.trim()}" already exists.`); // Show error for duplicate
      return;
    }
  
    // If the selected type is 'custom', update the label of the 'custom' option
    if (restaurantType === "custom") {
      const newOptionObj = { value: normalizedOption, label: newOption.trim() };
  
      // Add the new option to the list of options
      setOptions((prevOptions) => {
        const updatedOptions = [
          ...prevOptions,
          newOptionObj,
        ];
  
        // Ensure 'custom' is always the last option
        const customOption = updatedOptions.find(option => option.value === 'custom');
        const optionsWithoutCustom = updatedOptions.filter(option => option.value !== 'custom');
        const finalOptions = [...optionsWithoutCustom, customOption];
  
        return finalOptions;
      });
  
      // Set the restaurantType to the new custom option
      setRestaurantType(normalizedOption); // Set the selected custom type as the restaurant type
    }
  
    setNewOption(""); // Clear input after adding
    setErrorText(""); // Clear error after successful addition
  };  

  useEffect(() => {
    // console.log('Fetching business products...');
    dispatch(fetchBusinessProducts());
  }, [dispatch]);

  if (status === 'failed') {
    return <div>Error: {error}</div>;
  }

  // Handlers for Inclusions
  const handleAddInclusion = () => {
    const inclusion = inclusions.trim();
    
    if (!inclusion) {
      setErrorTextInclusions("Please enter a valid inclusion.");
      return;
    }
  
    if (inclusionList.some((i) => i.item === inclusion)) {
      setErrorTextInclusions("This inclusion already exists.");
      return;
    }
  
    // Add the new inclusion to the inclusion list
    const newInclusion = { id: Date.now(), item: inclusion };
    setInclusionList([...inclusionList, newInclusion]);
  
    // Clear the input and error text
    setInclusions("");
    setErrorTextInclusions("");
  };  

  const handleRemoveInclusion = (id) => {
    const updatedInclusionList = inclusionList.filter((inclusion) => inclusion.id !== id);
    setInclusionList(updatedInclusionList);
  };  

  // Handlers for Terms and Conditions
  const handleAddTerm = () => {
    if (typeof termsAndConditions === "string") {
      const term = termsAndConditions.trim();
      
      if (!term) {
        setErrorTextTerms("Please enter a valid term or condition.");
        return;
      }
    
      if (termsList.some((t) => t.item === term)) {
        setErrorTextTerms("This term already exists.");
        return;
      }
    
      // Add the new term to the terms list
      const newTerm = { id: Date.now(), item: term };
      setTermsList([...termsList, newTerm]);
    
      // Clear the input and error text
      setTermsAndConditions("");
      setErrorTextTerms(""); 
    } else {
      setErrorTextTerms("Please enter a valid term or condition.");
      return;
    }
  };  

  const handleRemoveTerm = (id) => {
    const updatedTermsList = termsList.filter((terms) => terms.id !==id);
    setTermsList(updatedTermsList);
  };

  // Handler for Image Upload with limit check
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    // Map each file into an object with the necessary properties
    const newImages = files.map((file) => ({
      id: "", 
      path: "",
      title: "", 
      fileUrl: URL.createObjectURL(file), 
      file: file 
    }));

    // Set a maximum image limit (5 images in this case)
    setImages((prevImages) => {
      const updatedImages = [...prevImages, ...newImages];
      return updatedImages.slice(0, 5); // Limit to 5 images
    });
    e.target.value = null;
  };

  // Handler for updating image title
  const handleImageTitleChange = (index, newTitle) => {
    setImages((prevImages) =>
      prevImages.map((img, idx) =>
        idx === index ? { ...img, title: newTitle } : img
      )
    );
  };

  const handleRemoveImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
  };

  // Handlers for Deleting Selected Restaurants
  const handleDeleteSelected = async () => {
    if (selectedRestaurants.length > 0) {
      setLoadingSpinning(true);
      try {
        // Create a request to delete selected restaurants
        const response = await fetch(`${BASE_URL}/delete-product`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ selectedProduct: selectedRestaurants }), // Pass selected restaurants here
        });
  
        const data = await response.json();
  
        if (data.success) {
          setLoadingSpinning(false);
          // Dispatch Redux action to remove restaurants from the state
          dispatch(deleteRestaurants(selectedRestaurants));
          showSuccessAlert('Selected Products Delete Successfully')
          // Optionally reset the selection
          setSelectedRestaurants([]);
        } else {
          setLoadingSpinning(false);
          showErrorAlert('Failed to delete products:', data.message);
        }
      } catch (error) {
        showErrorAlert('Error deleting products:', error);
      }
    } else {
      // console.log('No restaurants selected for deletion.');
    }
  };

  // Handlers for Checkbox Changes
  const handleCheckboxChange = (id, isChecked) => {
    if (isChecked) {
      setSelectedRestaurants((prev) => [...prev, id]);
    } else {
      setSelectedRestaurants((prev) => prev.filter((restaurantId) => restaurantId !== id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
  
    // Check that all required fields are filled
    if (restaurantName && pricing && pricingUnit && restaurantType) {
      setLoadingSpinning(true);
      // Construct the new restaurant object
      const newRestaurant = {
        category: 'restaurant',
        type: restaurantType,
        name: restaurantName,
        price: pricing,
        pricing_unit: pricingUnit,
        description: description,
        booking_operation: hasBooking ? 1 : 0,
        inclusions: inclusionList,
        termsAndConditions: termsList,
        images: Array.isArray(images) ? images : [],
      };

      const uploadedImagesPromises = images.map(async (file) => {
        if (file.file instanceof File){
          const imageFormData = new FormData();
          imageFormData.append('productImage', file.file);
          imageFormData.append('title', file.title || '');
          try {
            const response = await fetch(`${BASE_URL}/upload-image-product`, {
              method: 'PUT',
              body: imageFormData,
            });
            const result = await response.json();
  
            // Return the image object with id, path, and title
            return result.image; // Assuming your API responds with the image object
          } catch (error) {
            console.error('Image upload failed:', error);
            return null; // Handle error as needed
          }
        } else {
          // console.log('existing imagesssssssssssssss: ', file);
          return file // Already an object with id, path, title
        }
      });

      // Wait for all uploads to complete
      const preparedImages = await Promise.all(uploadedImagesPromises);

      // console.log('prepared images: ', preparedImages);

      // Assign preparedImages to newRestaurant.images
      newRestaurant.images = preparedImages;
  
      // Create FormData for the restaurant and image upload
      const formData = new FormData();
      if (isEditing) {
        formData.append('product_id', editingRestaurantId); // Add the product_id for editing
      }
      formData.append('category', newRestaurant.category);
      formData.append('type', newRestaurant.type);
      formData.append('name', newRestaurant.name);
      formData.append('price', newRestaurant.price);
      formData.append('pricing_unit', newRestaurant.pricing_unit);
      formData.append('description', newRestaurant.description);
      formData.append('booking_operation', newRestaurant.booking_operation.toString());
  
      // Append inclusions
      if (Array.isArray(newRestaurant.inclusions)) {
        newRestaurant.inclusions.forEach((inclusion) => {
          formData.append('inclusions[]', JSON.stringify({
            id: inclusion.id || '', // Ensure id is assigned or default to ''
            item: inclusion.item // Assuming item is a property of inclusion object
          })); // Append as JSON string
        });
      }

      //Append terms and condition
      if (Array.isArray(newRestaurant.termsAndConditions)) {
        newRestaurant.termsAndConditions.forEach((term) => {
          formData.append('termsAndConditions[]', JSON.stringify({
            id: term.id || '', // Ensure id is assigned or default to ''
            item: term.item // Assuming item is a property of term object
          })); // Append as JSON string
        });
      }

      if (Array.isArray(newRestaurant.images)) {
        newRestaurant.images.forEach((image) => {
          formData.append('images[]', JSON.stringify({
            id: image.id || '',
            path: image.path,
            title: image.title || ''
          }));
        });
      }
  
      // Fetch existing images if editing
      let existingImages = [];
      if (isEditing) {
        try {
          const response = await fetch(
            `${BASE_URL}/get-product-images/${editingRestaurantId}`
          );
          const data = await response.json();
          existingImages = data.images || [];
        } catch (error) {
          showErrorAlert('Error fetching existing images:', error);
        }
      }    
      
      // Removed images array to pass to backend
      const removedImages = existingImages.filter(existingImage => 
        !images.some(newImage => newImage.path === existingImage.path)
      );

      formData.append('removedImages', JSON.stringify(removedImages)); // Send removed images

      // console.log('existing images: ', existingImages);
      // console.log('FormData: ', formData);
      
      try {
        let result;
        // Check if we are in editing mode or adding a new restaurant
        if (isEditing) {
          setLoadingSpinning(false);
          result = dispatch(handleUpdateRestaurant(formData));
          showSuccessAlert('Product updated successfully:', result);
        } else {
          setLoadingSpinning(false);
          result = dispatch(addProduct(formData));
          showSuccessAlert('Product added successfully:', result.payload);
        }
  
        // Close modal and reset form after successful submission
        setModalOpen(false);
        resetForm();
      } catch (error) {
        setLoadingSpinning(false);
        // console.error('Failed to submit restaurant:', error);
        showErrorAlert('An error occurred while saving the restaurant. Please try again.');
      }
    } else {
      setLoadingSpinning(false);
      showErrorAlert('Please fill in all required fields.'); // Alert if required fields are missing
    }
  }; 

  // Reset Form Fields
  const resetForm = () => {
    setRestaurantName('');
    setPricing('');
    setPricingUnit('');
    setDescription('');
    setInclusionList([]);
    setImages([]);
    setHasBooking(false);
    setIsEditing(false);
    setEditingRestaurantId(null);
    setRestaurantType('');
    setTermsAndConditions('');
    setTermsList([]); // Reset terms list
  };

  // Handler for Editing an Restaurant
  const handleEdit = (restaurant) => {
    setRestaurantName(restaurant.restaurantName);
    setPricing(restaurant.pricing);
    setPricingUnit(restaurant.pricingUnit);
    setDescription(restaurant.description);
    setInclusionList(restaurant.inclusions);
    setImages(restaurant.images || []);
    setHasBooking(restaurant.hasBooking);
    setEditingRestaurantId(restaurant.id);
    setIsEditing(true);
    setModalOpen(true);
    setRestaurantType(restaurant.restaurantType);
    setTermsList(restaurant.termsAndConditions || []); // Set terms list
  };

  // Slider Settings for Image Carousel
  const getSliderSettings = (numImages) => ({
    infinite: numImages > 1,
    slidesToShow: 1,
    slidesToScroll: 1,
    speed: 500,
    arrows: numImages > 1,
  });

  // Get Unique Restaurant Types for Tabs
  const uniqueRestaurantTypes = [...new Set(restaurants.map((restaurant) => restaurant.restaurantType))];

  return (
    <div className="max-h-[720px] p-3 w-full h-full rounded-xl shadow-gray-400 shadow-lg bg-white">
      {/* Header Section */}
      <div className="flex flex-wrap justify-between p-3 items-center gap-4">
        <div className="w-full sm:w-auto flex flex-wrap items-center gap-4">
          <h1>Restaurant Services</h1>
          <div className="relative flex-grow sm:flex-grow-0 w-full sm:w-auto">
            <Input
              placeholder='Search ...'
              className="w-full sm:w-72 pl-10 placeholder:text-gray-400 placeholder:italic focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <FaSearch className='absolute top-2 left-3 text-gray-500' />
          </div>
        </div>
        <div className="flex flex-wrap justify-start sm:justify-end gap-3 w-full sm:w-auto">
          {selectedRestaurants.length > 0 && (
            <Button
              color="danger"
              onClick={handleDeleteSelected}
              disabled={!selectedRestaurants.length}
              className="w-32 px-4 py-2 text-sm sm:text-base text-center"
            >
              Delete Selected
            </Button>
          )}
          <Button
            color="primary"
            className="w-32 px-4 py-2 text-sm sm:text-base text-white hover:bg-color2 text-center"
            onPress={() => setModalOpen(true)}
          >
            Add
          </Button>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="tabs flex flex-wrap justify-start gap-3 mb-4 p-3">
        <Button
          onClick={() => setSelectedType('')}
          className={`border p-2 rounded-md transition duration-300 ease-in-out ${
            selectedType === ''
              ? 'bg-color1 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-color2 hover:text-white'
          }`}
        >
          All
        </Button>
        {uniqueRestaurantTypes.map((type) => (
          <Button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`border p-2 rounded-md transition duration-300 ease-in-out ${
              selectedType === type
                ? 'bg-color1 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-color2 hover:text-white'
            }`}
          >
            {type}
          </Button>
        ))}
      </div>

      {/* Restaurant Services List */}
      <div className="border-2 max-h-[430px] h-full flex flex-wrap overflow-auto p-4 gap-4">
        {restaurants
          .filter((restaurant) => !selectedType || restaurant.restaurantType === selectedType)
          .map((restaurant) => (
            <div
              key={restaurant.id}
              className="mb-4 p-3 border rounded-lg shadow-md w-60 h-auto bg-white transition duration-300 hover:shadow-lg"
            >
              {/* Restaurant Service Header */}
              <div className="flex mb-3 items-center gap-2 justify-between">
                <Button size="sm" color="success" onClick={() => handleEdit(restaurant)}>
                  Edit
                </Button>
                <Checkbox
                  checked={selectedRestaurants.includes(restaurant.id)}
                  onChange={(e) => handleCheckboxChange(restaurant.id, e.target.checked)}
                />
              </div>

              {/* Restaurant Service Details */}
              <h2 className="text-sm max-h-[100px] overflow-y-auto scrollbar-custom"><strong>Restaurant Service Name: </strong>{restaurant.restaurantName}</h2>
              <p className="text-sm max-h-[100px] overflow-y-auto scrollbar-custom">
                <strong>Price:</strong> ₱{restaurant.pricing} {restaurant.pricingUnit}
              </p>
              <p className="text-sm max-h-[100px] overflow-y-auto scrollbar-custom">
                <strong>Description:</strong> {restaurant.description}
              </p>
              <p className="text-sm max-h-[100px] overflow-y-auto scrollbar-custom">
                <strong>Booking Option:</strong> {restaurant.hasBooking ? 'Yes' : 'No'}
              </p>

              {/* Inclusions */}
              <h1 className='text-sm font-semibold '>Inclusions or Details:</h1>
              <ul className="list-disc max-h-[50px] overflow-y-auto scrollbar-custom pl-4 p-2 text-xs">
                {restaurant.inclusions && Array.isArray(restaurant.inclusions) && restaurant.inclusions.map((inclusion) => (
                  <li key={inclusion.id}>{inclusion.item}</li> // Accessing item property of the inclusion object
                ))}
              </ul>

              {/* Terms and Conditions */}
              {Array.isArray(restaurant.termsAndConditions) && restaurant.termsAndConditions.length > 0 ? (
                <>
                  <h3 className="text-sm font-semibold">Terms and Conditions:</h3>
                  <ul className="list-disc max-h-[50px] overflow-y-auto scrollbar-custom pl-4 text-xs">
                    {restaurant.termsAndConditions.map((term) => (
                      <li key={term.id}>{term.item}</li> // Accessing item property of the term object
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-sm italic text-gray-500">No terms and conditions provided</p>
              )}

              {/* Image Carousel */}
              {restaurant.images && Array.isArray(restaurant.images) && restaurant.images.length > 0 && (
              <div className="relative mt-4">
                {restaurant.images.length === 1 ? (
                  // Render a single image without the slider
                  <div className="relative">
                    <img
                      src={`${BASE_URL}/${restaurant.images[0].path}`} // Base URL to the image
                      alt={`Restaurant ${restaurant.restaurantName} Image`}
                      className="w-full h-32 object-cover rounded-lg mt-2"
                      onError={(e) => {
                        // e.target.src = '/path/to/fallback/image.png'; // Fallback image
                        e.target.onerror = null; // Prevents looping
                      }}
                    />
                    <p className="text-xs text-center mt-1">{restaurant.images.title}</p>
                  </div>
                ) : (
                  // Render the slider if there are multiple images
                  <Slider ref={(slider) => (sliderRefs.current[restaurant.id] = slider)} {...getSliderSettings}>
                    {restaurant.images.map((image) => (
                      <div key={`${image.id}`} className="relative">
                        <img
                          src={`${BASE_URL}/${image.path}`}  // Apply the base URL to the image
                          alt={`Activity ${restaurant.restaurantName} Image ${image.id}`}
                          className="w-full h-32 object-cover rounded-lg mt-2"
                          onError={(e) => {
                            e.target.onerror = null; // Prevents looping
                            // e.target.src = '/path/to/fallback/image.png'; // Fallback image
                          }}
                        />
                        <p className="text-xs text-center mt-1">{image.title}</p>
                      </div>
                    ))}
                  </Slider>
                )}
                
                </div>
              )}
            </div>
          ))}
      </div>

      {/* Modal for Adding/Editing Restaurant Services */}
      <Modal
       disableAnimation
        scrollBehavior="inside"
        isOpen={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) {
            resetForm(); // Reset state when modal is closed
          }
        }}
        size="2xl"
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {isEditing ? 'Update Restaurant Service' : 'Add Your Restaurant Service'}
              </ModalHeader>
              <ModalBody>
                {/* Add/Edit Restaurant Form */}
                <form className="space-y-4" onSubmit={handleSubmit}>
                  {/* Restaurant Type */}
                  <div className="flex items-start gap-4 max-w-3xl mx-auto">
                    {/* Dropdown Select */}
                    <div className="flex-1 mb-4">
                      <Select
                        label="Select Type"
                        placeholder={restaurantType ? restaurantType : "Select or add an item"}
                        selectedKeys={new Set([restaurantType.toLowerCase()])} // Use selectedKey to reflect the selected value
                        onSelectionChange={(key) => {
                          const selectedKey = key instanceof Set ? Array.from(key)[0] : key;
                          const selectedOption = options.find(option => option.value === selectedKey);
                          if (selectedOption) {
                            setRestaurantType(selectedOption.value); // Set only the value
                          }
                        }}
                      >
                        {options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </Select>

                      {/* Add Custom Type */}
                      {restaurantType === 'custom' && (
                        <div className="flex flex-col mt-4">
                          <Input
                            clearable
                            bordered
                            fullWidth
                            placeholder="Enter custom type (default value is custom)"
                            value={newOption}
                            onChange={(e) => {
                              setNewOption(e.target.value);
                              setErrorText(''); // Clear error when the user starts typing
                            }}
                          />

                          {errorText && (
                            <div className="text-red-500 text-sm mt-1">{errorText}</div> // Display error message
                          )}
                          <Button
                            auto
                            icon={<FaPlus />}
                            onClick={handleAddOption}
                            color="primary"
                            className="mt-2"
                          >
                            Add Item
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Restaurant Name */}
                  <div className="mb-4">
                    <Input
                      label="Restaurant Service Name"
                      placeholder="Enter the name of the restaurant service"
                      value={restaurantName}
                      onChange={(e) => setRestaurantName(e.target.value)}
                      fullWidth
                      required
                    />
                  </div>

                  {/* Pricing with Unit */}
                  <div className="mb-4 flex space-x-2">
                    <div className="w-1/2">
                      <Input
                        label="Pricing"
                        placeholder="e.g. 300"
                        type="number"
                        value={pricing}
                        onChange={(e) => setPricing(e.target.value)}
                        fullWidth
                        required
                        min="0"
                      />
                    </div>
                    <div className="w-1/2">
                      <Input
                        label="Pricing Unit"
                        placeholder="per pax, per person, etc."
                        value={pricingUnit}
                        onChange={(e) => setPricingUnit(e.target.value)}
                        fullWidth
                        required
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <Input
                      label="Description"
                      placeholder="Enter Restaurant service description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      fullWidth
                    />
                  </div>

                  {/* Booking Option */}
                  <div className="mb-4">
                    <Checkbox
                      checked={hasBooking}
                      onChange={(e) => setHasBooking(e.target.checked)}
                    >
                      Restaurant Service has booking option
                    </Checkbox>
                  </div>

                  {/* Terms and Conditions */}
                  {hasBooking && (
                    <div className="mb-4">
                      <Input
                        label="Terms and Conditions"
                        placeholder="Enter a term or condition"
                        value={termsAndConditions}
                        onChange={(e) => {
                          setTermsAndConditions(e.target.value);
                          setErrorTextTerms("");
                        }}
                        fullWidth
                      />
                      {errorTextTerms && (
                        <div className="text-red-500 text-sm mt-1">{errorTextTerms}</div>
                      )}
                      <Button
                        type="button"
                        color="primary"
                        className="mt-2 hover:bg-color2"
                        onClick={handleAddTerm}
                      >
                        Add Term or Condition
                      </Button>
                    
                      {/* Terms List */}
                      <ul className="mt-3 flex items-center flex-wrap gap-3 pl-5 text-sm">
                        {termsList.length > 0 ? (
                          termsList.map((term) => (
                            <li key={term.id} className="flex gap-3 items-center bg-light p-2 rounded-md">
                              {term.item}
                              <Button
                                auto
                                color="danger"
                                size="sm"
                                onClick={() => handleRemoveTerm(term.id)}
                              >
                                Remove
                              </Button>
                            </li>
                          ))
                        ) : (
                          <li>No terms added.</li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Inclusions */}
                  <div className="mb-4">
                    <Input
                      label="Inclusions"
                      placeholder="Enter an inclusion"
                      value={inclusions}
                      onChange={(e) => {
                        setInclusions(e.target.value)
                        setErrorTextInclusions("");
                      }}
                      fullWidth
                    />
                    {errorTextInclusions && (
                      <div className="text-red-500 text-sm mt-1">{errorTextInclusions}</div>
                    )}
                    <Button
                      type="button"
                      color="primary"
                      className="mt-2 hover:bg-color2"
                      onClick={handleAddInclusion}
                    >
                      Add Inclusion
                    </Button>

                    {/* Inclusion List */}
                    <ul className="mt-3 flex items-center flex-wrap gap-3 pl-5 text-sm">
                      {inclusionList.length > 0 ? (
                        inclusionList.map((inclusion) => (
                          <li key={inclusion.id} className="flex gap-3 items-center bg-light p-2 rounded-md">
                            {inclusion.item}
                            <Button
                              auto
                              color="danger"
                              size="sm"
                              onClick={() => handleRemoveInclusion(inclusion.id)}
                            >
                              Remove
                            </Button>
                          </li>
                        ))
                      ) : (
                        <li>No inclusions added.</li>
                      )}
                    </ul>
                  </div>

                  {/* Image Upload */}
                  <div className="mb-4">
                    {/* Hidden input field */}
                    <input
                      id="imageUpload"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />

                    {/* Label with FaImage icon to trigger the file input */}
                    <label
                      htmlFor="imageUpload"
                      className="flex items-center justify-center gap-2 cursor-pointer p-3 border border-gray-300 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <FaImage className="text-2xl text-gray-600" />
                      <span className="text-sm font-semibold text-gray-600">Upload Images</span>
                    </label>

                    {/* Text below the input */}
                    <p className="text-sm font-semibold mt-2 text-gray-500">
                      You can upload up to 5 images.
                    </p>
                  </div>

                  {/* Uploaded Images Preview with Title Input and Remove Option */}
                  <div className="mb-4 flex flex-wrap gap-3">
                    {images && Array.isArray(images) && images.length > 0 ? (
                      images.map((image, index) => (
                        <div key={`${image}-${index}`} className="flex flex-col gap-2 mb-2">
                          <img
                            src={
                              image.path
                                ? `${BASE_URL}/${image.path}`
                                : image.fileUrl || ''
                            }
                            alt={`Uploaded ${index + 1}`}
                            className="h-16 w-16 object-cover rounded-lg"
                          />
                          <Input
                            placeholder="Enter image title"
                            value={image.title || ''}
                            onChange={(e) => handleImageTitleChange(index, e.target.value)}
                            fullWidth
                          />
                          <Button
                            auto
                            color="danger"
                            size="xs"
                            onClick={() => handleRemoveImage(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p>No images to display</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button type="submit" color="primary" className="w-full hover:bg-color2">
                    {isEditing ? 'Update Restaurant Services' : 'Add Restaurant Services'}
                  </Button>
                </form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default RestaurantSection;
