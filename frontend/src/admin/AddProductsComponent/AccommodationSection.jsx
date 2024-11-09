import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@nextui-org/react';
import { Input, Button, Checkbox } from '@nextui-org/react';
import Slider from 'react-slick';
import { addProduct, handleUpdateAccommodation, deleteAccommodations, fetchBusinessProducts } from '@/redux/accomodationSlice';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaSearch, FaChevronLeft, FaChevronRight, FaImage } from 'react-icons/fa';

const AccommodationSection = () => {
  // State Management
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingAccommodationId, setEditingAccommodationId] = useState(null);
  const [accommodationName, setAccommodationName] = useState('');
  const [pricing, setPricing] = useState('');
  const [pricingUnit, setPricingUnit] = useState('');
  const [description, setDescription] = useState('');
  const [hasBooking, setHasBooking] = useState(false);
  const [inclusions, setInclusions] = useState('');
  const [inclusionList, setInclusionList] = useState([]);
  const [images, setImages] = useState([]); // Updated to store objects with url and title
  const [selectedAccommodations, setSelectedAccommodations] = useState([]);
  const [accommodationType, setAccommodationType] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [termsAndConditions, setTermsAndConditions] = useState([]);
  const [termsList, setTermsList] = useState([]); // New state for terms list

  const dispatch = useDispatch();
  const accommodations = useSelector((state) => state.accommodations.accommodations);
  const status = useSelector((state) => state.accommodations.status);
  const error = useSelector((state) => state.accommodations.error);
  const sliderRefs = useRef({});

  useEffect(() => {
    // console.log('Fetching business products...');
    dispatch(fetchBusinessProducts());
  }, [dispatch]);

  // useEffect(() => {
  //   console.log('Accommodations from Redux state:', accommodations);
  // }, [accommodations]);

  if (status === 'loading') {
    return <div>Loading accommodations...</div>;
  }

  if (status === 'failed') {
    return <div>Error: {error}</div>;
  }

  // Handlers for Inclusions
  const handleAddInclusion = () => {
    if (typeof inclusions === 'string' && inclusions.trim()) {
      // Create a new inclusion object
      const newInclusion = {
        id: Date.now(), // or generate a unique ID as appropriate
        item: inclusions.trim()
      };
      // Add the new inclusion to the inclusion list
      setInclusionList([...inclusionList, newInclusion]);
      // Clear the input
      setInclusions('');
    }
  };

  const handleRemoveInclusion = (id) => {
    const updatedInclusionList = inclusionList.filter((inclusion) => inclusion.id !== id);
    setInclusionList(updatedInclusionList);
  };  

  // Handlers for Terms and Conditions
  const handleAddTerm = () => {
    // Check if termsAndConditions is a string and not empty after trimming
    if (typeof termsAndConditions === 'string' && termsAndConditions.trim()) {
      // Create a new term object
      const newTerm = {
        id: Date.now(), // or generate a unique ID as appropriate
        item: termsAndConditions.trim()
      };
      // Add the new term to the terms list
      setTermsList([...termsList, newTerm]);
      // Clear the input
      setTermsAndConditions('');
    } else {
      console.error("termsAndConditions is not a valid string:", termsAndConditions);
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

  // Handlers for Deleting Selected Accommodations
  const handleDeleteSelected = async () => {
    if (selectedAccommodations.length > 0) {
      try {
        // Create a request to delete selected accommodations
        const response = await fetch('http://localhost:5000/delete-product', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ selectedProduct: selectedAccommodations }), // Pass selected accommodations here
        });
  
        const data = await response.json();
  
        if (data.success) {
          // Dispatch Redux action to remove accommodations from the state
          dispatch(deleteAccommodations(selectedAccommodations));
          
          // Optionally reset the selection
          setSelectedAccommodations([]);
        } else {
          console.error('Failed to delete products:', data.message);
        }
      } catch (error) {
        console.error('Error deleting products:', error);
      }
    } else {
      console.log('No accommodations selected for deletion.');
    }
  };

  // Handlers for Checkbox Changes
  const handleCheckboxChange = (id, isChecked) => {
    if (isChecked) {
      setSelectedAccommodations((prev) => [...prev, id]);
    } else {
      setSelectedAccommodations((prev) => prev.filter((accommodationId) => accommodationId !== id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
  
    // Check that all required fields are filled
    if (accommodationName && pricing && pricingUnit && accommodationType) {
      // Construct the new accommodation object
      const newAccommodation = {
        category: 'accommodation',
        type: accommodationType,
        name: accommodationName,
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
            const response = await fetch('http://localhost:5000/upload-image-product', {
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

      // Assign preparedImages to newAccommodation.images
      newAccommodation.images = preparedImages;
  
      // Create FormData for the accommodation and image upload
      const formData = new FormData();
      if (isEditing) {
        formData.append('product_id', editingAccommodationId); // Add the product_id for editing
      }
      formData.append('category', newAccommodation.category);
      formData.append('type', newAccommodation.type);
      formData.append('name', newAccommodation.name);
      formData.append('price', newAccommodation.price);
      formData.append('pricing_unit', newAccommodation.pricing_unit);
      formData.append('description', newAccommodation.description);
      formData.append('booking_operation', newAccommodation.booking_operation.toString());
  
      // Append inclusions
      if (Array.isArray(newAccommodation.inclusions)) {
        newAccommodation.inclusions.forEach((inclusion) => {
          formData.append('inclusions[]', JSON.stringify({
            id: inclusion.id || '', // Ensure id is assigned or default to ''
            item: inclusion.item // Assuming item is a property of inclusion object
          })); // Append as JSON string
        });
      }

      //Append terms and condition
      if (Array.isArray(newAccommodation.termsAndConditions)) {
        newAccommodation.termsAndConditions.forEach((term) => {
          formData.append('termsAndConditions[]', JSON.stringify({
            id: term.id || '', // Ensure id is assigned or default to ''
            item: term.item // Assuming item is a property of term object
          })); // Append as JSON string
        });
      }

      if (Array.isArray(newAccommodation.images)) {
        newAccommodation.images.forEach((image) => {
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
            `http://localhost:5000/get-product-images/${editingAccommodationId}`
          );
          const data = await response.json();
          existingImages = data.images || [];
        } catch (error) {
          console.error('Error fetching existing images:', error);
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
        // Check if we are in editing mode or adding a new accommodation
        if (isEditing) {
          result = dispatch(handleUpdateAccommodation(formData));
          console.log('Accommodation updated successfully:', result);
        } else {
          result = dispatch(addProduct(formData));
          // console.log('Accommodation added successfully:', result.payload);
        }
  
        // Close modal and reset form after successful submission
        setModalOpen(false);
        resetForm();
      } catch (error) {
        // console.error('Failed to submit accommodation:', error);
        alert('An error occurred while saving the accommodation. Please try again.');
      }
    } else {
      alert('Please fill in all required fields.'); // Alert if required fields are missing
    }
  };  
  
  // Reset Form Fields
  const resetForm = () => {
    setAccommodationName('');
    setPricing('');
    setPricingUnit('');
    setDescription('');
    setInclusionList([]);
    setImages([]);
    setHasBooking(false);
    setIsEditing(false);
    setEditingAccommodationId(null);
    setAccommodationType('');
    setTermsAndConditions('');
    setTermsList([]); // Reset terms list
  };

  // Handler for Editing an Accommodation
  const handleEdit = (accommodation) => {
    setAccommodationName(accommodation.accommodationName);
    setPricing(accommodation.pricing);
    setPricingUnit(accommodation.pricingUnit);
    setDescription(accommodation.description);
    setInclusionList(accommodation.inclusions);
    setImages(accommodation.images || []);
    setHasBooking(accommodation.hasBooking);
    setEditingAccommodationId(accommodation.id);
    setIsEditing(true);
    setModalOpen(true);
    setAccommodationType(accommodation.accommodationType);
    setTermsList(accommodation.termsAndConditions || []); // Set terms list
  };

  // Slider Settings for Image Carousel
  const getSliderSettings = (numImages) => ({
    infinite: numImages > 1,
    slidesToShow: 1,
    slidesToScroll: 1,
    speed: 500,
    arrows: numImages > 1,
  });

  // Get Unique Accommodation Types for Tabs
  const uniqueAccommodationTypes = [...new Set(accommodations.map((accommodation) => accommodation.accommodationType))];

  return (
    <div className="max-h-[620px] p-3 w-full h-full rounded-xl shadow-gray-400 shadow-lg bg-white">
      {/* Header Section */}
      <div className="flex justify-between p-3 items-center">
        <div className="font-semibold text-xl mb-3 p-3 items-center gap-4 flex">
          <h1>Accommodations</h1>
          <div className='relative'>
            <Input
              placeholder='Search ...'
              className='w-72 pl-10 placeholder:text-gray-400 placeholder:italic focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            />
            <FaSearch className='absolute top-2 left-3 text-gray-500' />
          </div>
        </div>
        <div className="flex space-x-3">
          <Button
            color="danger"
            onClick={handleDeleteSelected}
            disabled={!selectedAccommodations.length}
          >
            Delete Selected
          </Button>
          <Button
            color="primary"
            className="text-white hover:bg-color2"
            onPress={() => setModalOpen(true)}
          >
            Add
          </Button>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="tabs flex justify-start gap-3 mb-4">
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
        {uniqueAccommodationTypes.map((type, index) => (
          <Button
          key={`${type}-${index}`}
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

      {/* Accommodations List */}
      <div className="border-2 max-h-[430px] h-full flex flex-wrap overflow-auto p-4 gap-4">
        {accommodations
          .filter((accommodation) => !selectedType || accommodation.accommodationType === selectedType)
          .map((accommodation) => (
            <div
              key={accommodation.id}
              className="mb-4 p-3 border rounded-lg shadow-md w-60 h-auto bg-white transition duration-300 hover:shadow-lg"
            >
              {/* Accommodation Header */}
              <div className="flex mb-3 items-center gap-2 justify-between">
                <Button size="sm" color="success" onClick={() => handleEdit(accommodation)}>
                  Edit
                </Button>
                <Checkbox
                  checked={selectedAccommodations.includes(accommodation.id)}
                  onChange={(e) => handleCheckboxChange(accommodation.id, e.target.checked)}
                />
              </div>

              {/* Accommodation Details */}
              <h2 className="text-sm font-bold">Accommodation Name: {accommodation.accommodationName}</h2>
              <p className="text-sm">
                <strong>Price:</strong> ₱{accommodation.pricing} {accommodation.pricingUnit}
              </p>
              <p className="text-sm">
                <strong>Description:</strong> {accommodation.description}
              </p>
              <p className="text-sm">
                <strong>Booking Option:</strong> {accommodation.hasBooking ? 'Yes' : 'No'}
              </p>

              {/* Inclusions */}
              <h3 className="text-sm font-semibold">Inclusions or Details:</h3>
              <ul className="list-disc overflow-auto max-h-24 pl-4 text-xs">
                {accommodation.inclusions && Array.isArray(accommodation.inclusions) && accommodation.inclusions.map((inclusion) => (
                  <li key={inclusion.id}>{inclusion.item}</li> // Accessing item property of the inclusion object
                ))}
              </ul>

              {/* Terms and Conditions */}
              {Array.isArray(accommodation.termsAndConditions) && accommodation.termsAndConditions.length > 0 ? (
                <>
                  <h3 className="text-sm font-semibold">Terms and Conditions:</h3>
                  <ul className="list-disc overflow-auto max-h-24 pl-4 text-xs">
                    {accommodation.termsAndConditions.map((term) => (
                      <li key={term.id}>{term.item}</li> // Accessing item property of the term object
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-sm italic text-gray-500">No terms and conditions provided</p>
              )}

              {/* Image Carousel */}
              {accommodation.images && Array.isArray(accommodation.images) && accommodation.images.length > 0 && (
              <div className="relative mt-4">
                {accommodation.images.length === 1 ? (
                  // Render a single image without the slider
                  <div className="relative">
                    <img
                      src={`http://localhost:5000/${accommodation.images[0].path}`} // Base URL to the image
                      alt={`Accommodation ${accommodation.accommodationName} Image`}
                      className="w-full h-32 object-cover rounded-lg mt-2"
                      onError={(e) => {
                        // e.target.src = '/path/to/fallback/image.png'; // Fallback image
                        e.target.onerror = null; // Prevents looping
                      }}
                    />
                    <p className="text-xs text-center mt-1">{accommodation.images.title}</p>
                  </div>
                ) : (
                  // Render the slider if there are multiple images
                  <Slider ref={(slider) => (sliderRefs.current[accommodation.id] = slider)} {...getSliderSettings}>
                    {accommodation.images.map((image) => (
                      <div key={`${image.id}`} className="relative">
                        <img
                          src={`http://localhost:5000/${image.path}`}  // Apply the base URL to the image
                          alt={`Accommodation ${accommodation.accommodationName} Image ${image.id}`}
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
                
                {/* Next and Previous buttons */}
                {accommodation.images.length > 1 && (
                  <>
                    <button
                      className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow"
                      onClick={() => sliderRefs.current[accommodation.id].slickPrev()}
                      aria-label="Previous image"
                    >
                      <FaChevronLeft />
                    </button>
                    <button
                      className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow"
                      onClick={() => sliderRefs.current[accommodation.id].slickNext()}
                      aria-label="Next image"
                    >
                      <FaChevronRight />
                    </button>
                  </>
                )}
              </div>
            )}
            </div>
          ))}
      </div>

      {/* Modal for Adding/Editing Accommodations */}
      <Modal isOpen={modalOpen} onOpenChange={setModalOpen} size="2xl">
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {isEditing ? 'Update Accommodation' : 'Add Your Accommodation'}
              </ModalHeader>
              <ModalBody>
                {/* Add/Edit Accommodation Form */}
                <form className="space-y-4" onSubmit={handleSubmit}>
                  {/* Accommodation Type */}
                  <div className="mb-4">
                    <Input
                      label="Accommodation Type"
                      placeholder="Enter the type of accommodation"
                      value={accommodationType}
                      onChange={(e) => setAccommodationType(e.target.value)}
                      fullWidth
                      required
                    />
                  </div>

                  {/* Accommodation Name */}
                  <div className="mb-4">
                    <Input
                      label="Accommodation Name"
                      placeholder="Enter the name of the accommodation"
                      value={accommodationName}
                      onChange={(e) => setAccommodationName(e.target.value)}
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
                      placeholder="Enter Accommodation description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      fullWidth
                    />
                  </div>

                  {/* Booking Option */}
                  <div className="mb-4">
                    <Checkbox
                      isSelected={hasBooking}
                      onChange={(e) => setHasBooking(e.target.checked)}
                    >
                      Accommodation has booking option
                    </Checkbox>
                  </div>

                  {/* Terms and Conditions */}
                  {hasBooking && (
                    <div className="mb-4">
                      <Input
                        label="Terms and Conditions"
                        placeholder="Enter a term or condition"
                        value={termsAndConditions}
                        onChange={(e) => setTermsAndConditions(e.target.value)}
                        fullWidth
                      />
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
                        {Array.isArray(termsList) && termsList.length > 0 ? (
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
                      placeholder="Enter an inclusion or details about the accommodation"
                      value={inclusions}
                      onChange={(e) => setInclusions(e.target.value)}
                      fullWidth
                    />
                    <Button
                      type="button"
                      color="primary"
                      className="mt-2 hover:bg-color2"
                      onClick={handleAddInclusion}
                    >
                      Add Inclusions or Details
                    </Button>

                    {/* Inclusions List */}
                    <ul className="mt-3 flex items-center flex-wrap gap-3 pl-5 text-sm">
                      {Array.isArray(inclusionList) && inclusionList.length > 0 ? (
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
                                ? `http://localhost:5000/${image.path}`
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
                  <Button type="submit" color='primary' className="w-full hover:bg-color2">
                    {isEditing ? 'Update Accommodation' : 'Add Accommodation'}
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

export default AccommodationSection;