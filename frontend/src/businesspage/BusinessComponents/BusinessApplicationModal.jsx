import React, { useState } from "react";
import { Modal, ModalContent } from "@nextui-org/modal";
import { ModalHeader, ModalBody, ModalFooter } from "@nextui-org/modal";
import { Input, Button, Progress, CheckboxGroup, Checkbox,Select, SelectItem } from "@nextui-org/react";
import { FaCheck, FaPlus, FaTimes } from "react-icons/fa";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import MapPicker from '../../components/map-picker';
// Use the environment variable for the base URL
const BASE_URL = import.meta.env.VITE_BASE_URL; 

const MySwal = withReactContent(Swal);

const municipalities = [
  "Barcelona", "Bulan", "Bulusan", "Casiguran", "Castilla", "Donsol",
  "Gubat", "Irosin", "Juban", "Magallanes", "Matnog", "Pilar",
  "Prieto Diaz", "Sta. Magdalena", "Sorsogon City"
];

const BusinessApplicationModal = ({ isBusinessOpen, onBusinessOpenChange, userData }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    businessName: "",
    businessTerritory: "",
    certificateNo: "",
    businessScope: "",
    businessType: "",
    category: [""],
    customCategory: "",
    completeAddress: "",
    latitude: null,
    longitude: null,
  });

  const [categoryOptions, setCategoryOptions] = useState({
    attraction: [
      { label: "Adventure", value: "adventure" },
      { label: "Tour", value: "tour" },
      { label: "Relaxation", value: "relaxation" },
      { label: "Water Sports", value: "water_sports" },
      { label: "Nature", value: "nature" },
      { label: "Add Category", value: "others" },
    ],
    accommodation: [
      { label: "Hotel", value: "hotel" },
      { label: "Inn", value: "inn" },
      { label: "Lodge", value: "lodge" },
      { label: "Resort", value: "resort" },
      { label: "Condominium", value: "condominium" },
      { label: "Add Category", value: "others" },
    ],
    food: [
      { label: "Restaurant", value: "restaurant" },
      { label: "Bar", value: "bar" },
      { label: "Café", value: "cafe" },
      { label: "Add Category", value: "others" },
    ],
    shop: [
      { label: "Souvenir Shop", value: "souvenir_shop" },
      { label: "Clothing Shop", value: "clothing_shop" },
      { label: "Add Category", value: "others" },
    ],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleBusinessTypeChange = (value) => {
    setFormData({ ...formData, businessType: value, category: [], customCategory: "" });
  };

  const handleCategoryChange = (selectedValues) => {
    setFormData({ ...formData, category: selectedValues });
  };

  const businessTypeOptions = [
    { label: "Activities", value: "attraction" },
    { label: "Accommodations", value: "accommodation" },
    { label: "Food Places", value: "restaurant" },
    { label: "Shops", value: "shop" },
  ];

  const addCustomCategory = () => {
    if (formData.customCategory && formData.businessType) {
      const newCategory = {
        label: formData.customCategory,
        value: formData.customCategory.toLowerCase().replace(/\s+/g, '_'),
      };
      setCategoryOptions(prevOptions => ({
        ...prevOptions,
        [formData.businessType]: [
          ...prevOptions[formData.businessType].filter(cat => cat.value !== "others"),
          newCategory,
          { label: "Others", value: "others" },
        ],
      }));
      setFormData(prevData => ({
        ...prevData,
        category: [...prevData.category, newCategory.value],
        customCategory: "",
      }));
    }
  };

  const handleLatitudeChange = (lat) => {
    // console.log('Latitude:', lat);
    setFormData((prevData) => ({
      ...prevData,
      latitude: lat
    }));
  };

  const handleLongitudeChange = (lng) => {
    // console.log('Longitude:', lng);
    setFormData((prevData) => ({
      ...prevData,
      longitude: lng
    }));
  };

  const validateStep = (currentStep) => {
    switch (currentStep) {
      case 1:
        return formData.firstName && formData.lastName && formData.businessName && formData.certificateNo && formData.businessScope;
      case 2:
        return formData.businessType && formData.category;
      case 3:
        return formData.location !== "";
      default:
        return true;
    }
  };

  const getBusinessTypeLabel = (value) => {
    const option = businessTypeOptions.find(option => option.value === value);
    return option ? option.label : "Not provided";
  };

  const getCategoryLabels = (values) => {
    return values.map(value => {
      const category = Object.values(categoryOptions).flat().find(cat => cat.value === value);
      return category ? category.label : value;
    }).join(', ');
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h3 className="text-xl font-bold mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                clearable
                bordered
                fullWidth
                label={<span className="font-bold">First Name</span>}
                name="firstName"
                placeholder="Enter First Name"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
              <Input
                clearable
                bordered
                fullWidth
                label={<span className="font-bold">Last Name</span>}
                name="lastName"
                placeholder="Enter Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
            <Input
              clearable
              bordered
              fullWidth
              label={<span className="font-bold">Business Name</span>}
              name="businessName"
              placeholder="Enter Business Name"
              value={formData.businessName}
              onChange={handleInputChange}
              className="mt-4"
              required
            />
            <Input
              clearable
              bordered
              fullWidth
              label={<span className="font-bold">Certificate No. / BNN</span>}
              name="certificateNo"
              placeholder="Enter Certificate No. / BNN"
              value={formData.certificateNo}
              onChange={handleInputChange}
              className="mt-4"
              required
            />
            <Select 
              label={<span className="font-bold">Business Scope (City/Municipality)</span>}
              placeholder="Select Business Scope"
              value={formData.businessScope}
              onChange={(e) => setFormData({ ...formData, businessScope: e.target.value })}
              className="mt-4 "
              required
              style={{ maxHeight: '150px', overflowY: 'auto' }}
            >
              {municipalities.map((municipality) => (
                <SelectItem  key={municipality} value={municipality}>
                  {municipality}
                </SelectItem>
              ))}
            </Select>
          </>
        );
      case 2:
        return (
          <>
            <h3 className="text-xl font-bold mb-4">Business Details</h3>
            <Select
              label={<span className="font-bold">Type of Business</span>}
              placeholder="Select business type"
              className="mt-4"
              onChange={(e) => handleBusinessTypeChange(e.target.value)}
              required
            >
              {businessTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
            {formData.businessType && (
              <CheckboxGroup
                label={<span className="font-bold">{formData.businessType === "accommodations" ? "Property Type" : 
                       formData.businessType === "food" ? "Restaurant Type" :
                       formData.businessType === "shops" ? "Shop Type" : "Category"}</span>}
                value={formData.category}
                onChange={handleCategoryChange}
                className="mt-4"
              >
                {categoryOptions[formData.businessType]
                  .filter(option => option.value !== "others")
                  .map((option) => (
                    <Checkbox key={option.value} value={option.value}>
                      {option.label}
                    </Checkbox>
                  ))}
              </CheckboxGroup>
            )}
            {formData.businessType && (
              <div className="mt-4 flex items-center">
                <Input
                  clearable
                  bordered
                  fullWidth
                  label={<span className="font-bold">Custom Category</span>}
                  name="customCategory"
                  placeholder="Enter Custom Category"
                  value={formData.customCategory}
                  onChange={handleInputChange}
                />
                <Button
                  auto
                  icon={<FaPlus />}
                  onClick={addCustomCategory}
                  className="ml-2"
                  color="primary"
                >
                  Add
                </Button>
              </div>
            )}
          </>
        );
      case 3:
        return (
          <div className="mt-4">
            <h3 className="text-xl font-bold mb-4">Business Location</h3>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
              Pin Your Business Location
            </h2>
            <MapPicker
              setLatitude={handleLatitudeChange}
              setLongitude={handleLongitudeChange}
            />
            <Input
              clearable
              bordered
              fullWidth
              label={<span className="font-bold">Complete Address</span>}
              name="completeAddress"
              placeholder="e.g., 123 Main St, Sorsogon City"
              value={formData.completeAddress}
              onChange={handleInputChange}
              className="mt-4"
              required
            />
          </div>
        );
      case 4:
        return (
          <div className="mt-4">
            <h3 className="text-xl font-semibold mb-4">Application Summary</h3>
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(formData).map(([key, value]) => {
                // Skip rendering the customCategory, latitude, and longitude fields
                if (key === 'customCategory' || key === 'latitude' || key === 'longitude') return null;

                // Use label for businessType and separate categories by comma
                const displayValue = key === 'businessType' ? getBusinessTypeLabel(value) :
                                     key === 'category' ? getCategoryLabels(value) : value;

                return (
                  <div key={key} className="mb-4 last:mb-0">
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="text-base text-gray-900">{displayValue || "Not provided"}</p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const handleNext = async () => {
    if (validateStep(step)) {
      if (step < 3) {
        setStep(step + 1);
      } else if (step === 3) {
        setStep(4);
      } else if (step === 4) {
        try {
          const response = await fetch(`${BASE_URL}/submitBusinessApplication`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...formData,
              user_id: userData.user_id,
            }),
          });
  
          const data = await response.json(); // Parse the response JSON
  
          if (!response.ok) {
            console.error('Server Error:', data);  // Log the server response for errors
            throw new Error('Failed to submit application');
          }
  
          MySwal.fire({
            icon: 'success',
            title: 'Application Sent!',
            text: `Application ID: ${data.application_id}. We will get back to you via your business email or phone number.`,
            confirmButtonColor:'#0BDA51',
            confirmButtonText: 'OK',
          }).then(() => {
            onBusinessOpenChange(false); // Close the modal
            window.location.reload();
          });
  
        } catch (error) {
          console.error('Error:', error);
          MySwal.fire({
            icon: 'error',
            title: 'Submission Failed',
            text: 'There was an error submitting your application. Please try again.',
            confirmButtonColor:'#0BDA51',
          });
        }
      }
    } else {
      MySwal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please fill in all required fields before proceeding.',
        confirmButtonColor:'#0BDA51',
      });
    }
  };
  

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const showApplicationSentDialog = () => {
    MySwal.fire({
      icon: 'success',
      title: 'Application Sent!',
      text: 'We will get back to you via your business email or phone number.',
      confirmButtonColor:'#0BDA51',
      confirmButtonText: 'OK'
    }).then(() => {
      onBusinessOpenChange(false);
    });
  };

  const handleCloseModal = () => {
    MySwal.fire({
      title: 'Are you sure?',
      text: "You will lose all entered data if you close this form.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor:'#0BDA51',
      cancelButtonColor: '#D33736',
      confirmButtonText: 'Yes, close it!'
    }).then((result) => {
      if (result.isConfirmed) {
        onBusinessOpenChange(false);
      }
    });
  };

  return (
<Modal  
  size="xl"  
  isOpen={isBusinessOpen}  
  hideCloseButton={true}  
  aria-labelledby="modal-title"  
>  
  <ModalContent className=" sm:max-w-md md:max-w-lg lg:max-w-2xl overflow-auto flex justify-center">  
    <ModalHeader className="flex justify-between items-center bg-color1">  
      <h2 id="modal-title" className="text-2xl text-white font-bold">  
        Apply for Business Account  
      </h2>  
      <button 
        aria-label="Close" 
        className='text-white hover:text-gray-300 transition-colors duration-200 absolute right-2 top-2'
        onClick={handleCloseModal}
      >
        <FaTimes />
      </button>
    </ModalHeader>  
    <ModalBody className="p-4 overflow-y-auto max-h-[80vh] ">  
      <Progress value={(step / 4) * 100}  classNames={{ indicator: "bg-color2",}} />  
      {renderStep()}  
    </ModalBody>  
    <ModalFooter className="flex justify-between">  
      {step === 1 ? (
        <Button auto flat color="danger" onClick={handleCloseModal}>
          Cancel
        </Button>
      ) : (
        <Button auto color="primary" onClick={handleBack}>
          Back
        </Button>
      )}
      <Button auto color={step === 4 ? "success" : "primary"} className='text-white' onClick={handleNext}>  
        {step === 4 ? (  
          <>  
            <FaCheck className="mr-2" />  
            Submit Application  
          </>  
        ) : (  
          "Next"  
        )}  
      </Button>  
    </ModalFooter>  
  </ModalContent>  
</Modal>

  );
};

export default BusinessApplicationModal; 
