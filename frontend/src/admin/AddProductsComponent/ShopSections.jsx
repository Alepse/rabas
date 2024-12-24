import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@nextui-org/react';
import { Input, Button, Checkbox } from '@nextui-org/react';
import Slider from 'react-slick';
import { addProduct, handleUpdateShopProduct, deleteShopProducts, fetchBusinessProducts } from '@/redux/shopSlice';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaSearch, FaChevronLeft, FaChevronRight, FaImage } from 'react-icons/fa';
// Use the environment variable for the base URL
const BASE_URL = import.meta.env.VITE_BASE_URL; 

const ShopSections = () => {
  // State Management
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productName, setProductName] = useState('');
  const [pricing, setPricing] = useState('');
  const [pricingUnit, setPricingUnit] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]); // Updated to store objects with url and title
  const [selectedShopProducts, setSelectedShopProducts] = useState([]);
  const [productType, setProductType] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const dispatch = useDispatch();
  const products = useSelector((state) => state.shop.shopProducts);
  const status = useSelector((state) => state.shop.status);
  const error = useSelector((state) => state.shop.error);
  const sliderRefs = useRef({});

  useEffect(() => {
    // console.log('Fetching business products...');
    dispatch(fetchBusinessProducts());
  }, [dispatch]);

  // useEffect(() => {
    // console.log('Products from Redux state:', shopProducts);
  // }, [shopProducts]);

  if (status === 'loading') {
    return <div>Loading shop products...</div>;
  }

  if (status === 'failed') {
    return <div>Error: {error}</div>;
  }

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

  // Handlers for Deleting Selected Products
  const handleDeleteSelected = async () => {
    if (selectedShopProducts.length > 0) {
      try {
        // Create a request to delete selected products
        const response = await fetch(`${BASE_URL}/delete-product`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ selectedProduct: selectedShopProducts }), // Pass selected products here
        });

        const data = await response.json();

        if (data.success) {
          // Dispatch Redux action to remove products from the state
          dispatch(deleteShopProducts(selectedShopProducts));
          
          // Optionally reset the selection
          setSelectedShopProducts([]);
        } else {
          console.error('Failed to delete products:', data.message);
        }
      } catch (error) {
        console.error('Error deleting products:', error);
      }
    } else {
      console.log('No products selected for deletion.');
    }
  };

  // Handlers for Checkbox Changes
  const handleCheckboxChange = (id, isChecked) => {
    if (isChecked) {
      setSelectedShopProducts((prev) => [...prev, id]);
    } else {
      setSelectedShopProducts((prev) => prev.filter((productId) => productId !== id));
    }
  };

  // Handler for Form Submission (Add/Edit Product)
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
  
    // Check that all required fields are filled
    if (productName && pricing && pricingUnit && productType) {
      // Construct the new shopProducts object
      const newShopProduct = {
        category: 'shop',
        type: productType,
        name: productName,
        price: pricing,
        pricing_unit: pricingUnit,
        description: description,
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
            return result.image; // responds with the image object
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

      // Assign preparedImages to newShopProduct.images
      newShopProduct.images = preparedImages;

      // Create FormData for the product and image upload
      const formData = new FormData();
      if (isEditing) {
        formData.append('product_id', editingProductId); // Add the product_id for editing
      }
      formData.append('category', newShopProduct.category);
      formData.append('type', newShopProduct.type);
      formData.append('name', newShopProduct.name);
      formData.append('price', newShopProduct.price);
      formData.append('pricing_unit', newShopProduct.pricing_unit);
      formData.append('description', newShopProduct.description);

      if (Array.isArray(newShopProduct.images)) {
        newShopProduct.images.forEach((image) => {
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
            `${BASE_URL}/get-product-images/${editingProductId}`
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
        // Check if we are in editing mode or adding a new product
        if (isEditing) {
          result = dispatch(handleUpdateShopProduct(formData));
          console.log('Product updated successfully:', result);
        } else {
          result = dispatch(addProduct(formData));
          // console.log('Product added successfully:', result.payload);
        }
  
        // Close modal and reset form after successful submission
        setModalOpen(false);
        resetForm();
      } catch (error) {
        // console.error('Failed to submit product:', error);
        alert('An error occurred while saving the product. Please try again.');
      }
    } else {
      alert('Please fill in all required fields.'); // Alert if required fields are missing
    }
  };  

  // Reset Form Fields
  const resetForm = () => {
    setProductName('');
    setPricing('');
    setPricingUnit('');
    setProductType('');
    setDescription('');
    setImages([]);
    setIsEditing(false);
    setEditingProductId(null);
  };

  // Handler for Editing a Product
  const handleEdit = (product) => {
    setProductName(product.productName);
    setPricing(product.pricing);
    setPricingUnit(product.pricingUnit);
    setProductType(product.productType);
    setDescription(product.description);
    setImages(product.images);
    setEditingProductId(product.id);
    setIsEditing(true);
    setModalOpen(true);
  };

  // Slider Settings for Image Carousel
  const getSliderSettings = (numImages) => ({
    infinite: numImages > 1,
    slidesToShow: 1,
    slidesToScroll: 1,
    speed: 500,
    arrows: numImages > 1,
  });


  // Get Unique Shop Product Type for Tabs
  const uniqueShopProductTypes = [...new Set(products.map((product) => product.productType))];

  return (
    <div className="max-h-[620px] p-3 w-full h-full rounded-xl shadow-gray-400 shadow-lg bg-white">
      {/* Header Section */}
      <div className="flex justify-between p-3 items-center">
        <div className="font-semibold text-xl mb-3 p-3 items-center gap-4 flex">
          <h1>Products</h1>
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
            disabled={!selectedShopProducts.length} // Disable delete button if no products are selected
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
        {uniqueShopProductTypes.map((type, index) => (
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

    {/* Products List */}
    <div className="border-2 max-h-[430px] h-full flex flex-wrap overflow-auto p-4 gap-4">
        {products
          .filter((product) => !selectedType || product.productType === selectedType)
          .map((product) => (
            <div
              key={product.id}
              className="mb-4 p-3 border rounded-lg shadow-md w-60 h-auto bg-white transition duration-300 hover:shadow-lg"
            >
              {/* Product Header */}
              <div className="flex mb-3 items-center gap-2 justify-between">
                <Button size="sm" color="success" onClick={() => handleEdit(product)}>
                  Edit
                </Button>
                <Checkbox
                  checked={selectedShopProducts.includes(product.id)}
                  onChange={(e) => handleCheckboxChange(product.id, e.target.checked)}
                />
              </div>

              {/* Product Details */}
              <h2 className="text-sm font-bold">Product Name: {product.productName}</h2>
              <p className="text-sm">
                <strong>Price:</strong> ₱{product.pricing} {product.pricingUnit}
              </p>
              <p className="text-sm">
                <strong>Description:</strong> {product.description}
              </p>

              {/* Image Carousel */}
              {product.images && Array.isArray(product.images) && product.images.length > 0 && (
              <div className="relative mt-4">
                {product.images.length === 1 ? (
                  // Render a single image without the slider
                  <div className="relative">
                    <img
                      src={`${BASE_URL}/${product.images[0].path}`} // Base URL to the image
                      alt={`Product ${product.productName} Image`}
                      className="w-full h-32 object-cover rounded-lg mt-2"
                      onError={(e) => {
                        // e.target.src = '/path/to/fallback/image.png'; // Fallback image
                        e.target.onerror = null; // Prevents looping
                      }}
                    />
                    <p className="text-xs text-center mt-1">{product.images.title}</p>
                  </div>
                ) : (
                  // Render the slider if there are multiple images
                  <Slider ref={(slider) => (sliderRefs.current[product.id] = slider)} {...getSliderSettings}>
                    {product.images.map((image) => (
                      <div key={`${image.id}`} className="relative">
                        <img
                          src={`${BASE_URL}/${image.path}`}  // Apply the base URL to the image
                          alt={`Product ${product.productName} Image ${image.id}`}
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

      {/* Modal for Adding/Editing Products */}
      <Modal scrollBehavior='inside' isOpen={modalOpen} onOpenChange={setModalOpen} size="2xl">
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {isEditing ? 'Update Product' : 'Add Your Product'}
              </ModalHeader>
              <ModalBody>
                {/* Add/Edit Product Form */}
                <form className="space-y-4" onSubmit={handleSubmit}>
                  {/* Type */}
                  <div className="mb-4">
                    <Input
                      label="Type"
                      placeholder="Enter the type of product"
                      value={productType}
                      onChange={(e) => setProductType(e.target.value)}
                      fullWidth
                      required
                    />
                  </div>

                  {/* Product Name */}
                  <div className="mb-4">
                    <Input
                      label="Product Name"
                      placeholder="Enter the name of the product"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
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
                      placeholder="Enter product description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      fullWidth
                    />
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
                  <Button type="submit" color='primary' className="w-full hover:bg-color2">
                    {isEditing ? 'Update Product' : 'Add Product'}
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

export default ShopSections;
