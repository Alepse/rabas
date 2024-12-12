import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Sidebar from '../components/sidebar';
import { Switch } from "@nextui-org/react";
import { FaUpload, FaSave, FaPlus, FaTrash } from 'react-icons/fa';
import { Tabs, Tab, Card, CardBody, Input, Button, Modal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/react";
import { businessIcons } from '../businesspage/BusinessComponents/businessIcons';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { AiOutlineEdit, AiOutlineCheck, AiOutlineClose } from "react-icons/ai";
import {
  updateBusinessData,
  addFacility,
  updateFacility,
  removeFacility,
  updateFacilityIcon,
  addPolicy,
  updatePolicy,
  removePolicy,
  addPolicyItem,
  updatePolicyItem,
  removePolicyItem,
  addContactInfo,
  updateContactInfo,
  removeContactInfo,
  updateContactIcon,
  updateBusinessCard,
  updateHeroImageTitle,
  removeHeroImage
} from '../redux/businessSlice';

const BusinessProfile = () => {
  const dispatch = useDispatch();
  const businessData = useSelector((state) => state.business);
  const businessCard = useSelector((state) => state.business.businessCard);

  // Title Tab
  useEffect(() => {
    document.title = 'BusinessName | Admin profile';
  });


  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
  const [currentEditingField, setCurrentEditingField] = useState(null);

  //business card states
  const [cardImage, setCardImage] = useState(businessCard.cardImage);
  const [description, setDescription] = useState(businessCard.description);
  const [location, setLocation] = useState(businessCard.location);
  const [priceRange, setPriceRange] = useState(businessCard.priceRange);

  const [isEditingName, setIsEditingName] = useState(false); // Edit mode state
  const [tempBusinessName, setTempBusinessName] = useState(businessData.businessName); // Temporary name for editing

  const [editingImageTitles, setEditingImageTitles] = useState({}); // Stores editing states for each image
  const [tempImageTitles, setTempImageTitles] = useState({}); // Temporary titles for hero images

  const [isEditingAboutUs, setIsEditingAboutUs] = useState(false);
  const [tempAboutUs, setTempAboutUs] = useState(businessData.aboutUs);

  const [isEditingHours, setIsEditingHours] = useState(false);
  const [tempOpeningHours, setTempOpeningHours] = useState(businessData.openingHours);

  const MySwal = withReactContent(Swal);
  const fileInputRef = useRef(null);
  const heroImagesInputRef = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Function to check login status
  const checkLoginStatus = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/check-login', {
        method: 'GET',
        credentials: 'include' // Include cookies
      });
      if (response.ok) {
        const data = await response.json();
        setIsLoggedIn(data.isLoggedIn); // Set login status

        if (!data.isLoggedIn) {
          window.location.href = '/';
        }
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    }
  }, []);
  
  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);

  // Fetching business data from the backend and updating Redux
  const fetchBusinessData = async () => {
    try {
      const response = await fetch('http://localhost:5000/get-businessData', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success && data.businessData.length > 0) {
        dispatch(updateBusinessData(data.businessData[0])); // Update Redux store with fetched business data
      }
    } catch (error) {
      console.error('Error fetching business data:', error);
    }
  };

  useEffect(() => {
    fetchBusinessData(); // Fetch business data on component mount
  }, []);

  // Fetch business data and set initial state
  useEffect(() => {
    setTempBusinessName(businessData.businessName);
    setTempAboutUs(businessData.aboutUs);
  }, [businessData]);

  // Handle editing business name
  const handleEditName = () => setIsEditingName(true);

  // Handle saving the edited name
  const handleSaveName = async () => {
    if (!tempBusinessName) {
      MySwal.fire({
        title: 'Error',
        text: 'Business name cannot be empty.',
        icon: 'error',
        confirmButtonColor: '#0BDA51',
      });
      return;
    }

    try {
      // Send PUT request to update business name
      const response = await fetch(`http://localhost:5000/updateBusinessName/${businessData.business_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ businessName: tempBusinessName }),
      });

      const data = await response.json();

      if (data.success) {
        dispatch(updateBusinessData({ businessName: tempBusinessName })); // Update Redux state with the new name
        setIsEditingName(false); // Exit editing mode

        MySwal.fire({
          title: 'Success',
          text: 'Business name updated successfully!',
          icon: 'success',
          confirmButtonColor: '#0BDA51',
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error updating business name:', error);
      MySwal.fire({
        title: 'Error',
        text: 'Failed to update business name.',
        icon: 'error',
        confirmButtonColor: '#0BDA51',
      });
    }
  };

  // Handle canceling the edit
  const handleCancelEdit = () => {
    setTempBusinessName(businessData.businessName); // Revert changes
    setIsEditingName(false);
  };

  // Handle editing business name
  const handleEditAboutUs = () => setIsEditingAboutUs(true);

  // Handle saving the edited about us
  const handleSaveAboutUs = async () => {
    if (!tempAboutUs) {
      MySwal.fire({
        title: 'Error',
        text: 'Field cannot be empty.',
        icon: 'error',
        confirmButtonColor: '#0BDA51',
      });
      return;
    }

    try {
      // Send PUT request to update business name
      const response = await fetch(`http://localhost:5000/updateBusinessAboutUs/${businessData.business_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ aboutUs: tempAboutUs }),
      });

      const data = await response.json();

      if (data.success) {
        dispatch(updateBusinessData({ aboutUs: tempAboutUs })); // Update Redux state with the new about us
        setIsEditingAboutUs(false); // Exit editing mode

        MySwal.fire({
          title: 'Success',
          text: 'About Us updated successfully!',
          icon: 'success',
          confirmButtonColor: '#0BDA51',
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error updating about us:', error);
      MySwal.fire({
        title: 'Error',
        text: 'Failed to update about us.',
        icon: 'error',
        confirmButtonColor: '#0BDA51',
      });
    }
  };

  const handleCancelEditAboutUs = () => {
    setTempAboutUs(businessData.aboutUs);
    setIsEditingAboutUs(false);
  };

  // Synchronize local state with Redux state
  useEffect(() => {
    setCardImage(businessCard.cardImage || '');
    setDescription(businessCard.description || '');
    setLocation(businessCard.location || '');
    setPriceRange(businessCard.priceRange || '');
  }, [businessCard]);

  // Handle updating the business card
  const handleUpdate = () => {

    if (!cardImage || !description || !location || !priceRange) {
      MySwal.fire({
        title: 'Error',
        text: 'Please fill in all fields for the business card.',
        icon: 'error',
        confirmButtonColor: '#0BDA51',
      });
      return;
    }

    const formData = new FormData();
    formData.append('description', description);
    formData.append('location', location);
    formData.append('priceRange', priceRange);

    // Make an API call to update the business details
    fetch(`http://localhost:5000/updateBusinessDetails/${businessData.business_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description,
        location,
        priceRange,
      }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Assuming there's a function to fetch and update the business data in state
          fetchBusinessData(); // Update local state with new business details
          dispatch(updateBusinessCard({ description, location, priceRange })); // Update Redux state with the new details

          MySwal.fire({
            title: 'Success',
            text: 'Business card updated successfully!',
            icon: 'success',
            confirmButtonColor: '#0BDA51',
          });

        }
      })
      .catch(error => console.error('Error updating business details:', error));
  };

  // Function to handle image upload and confirmation
  const handleCardImageUpload = (event) => {
    const file = event.target.files[0];
    const businessId = businessData.business_id; // Get the business ID from your state

    if (file) {
      const reader = new FileReader();

      // Read the file as Data URL for preview
      reader.onloadend = () => {
        const previewImage = reader.result; // Store the preview image

        // SweetAlert2 confirmation
        Swal.fire({
          title: 'Confirm Upload',
          text: '',
          html: `<div style="display: flex; flex-direction: column; align-items: center;">
                   <img src="${previewImage}" alt="Logo Preview" style="width: 600px; height: auto; border-radius: 8px; margin-top: 10px;" />
                 </div>`, // Center the image and text
          showCancelButton: true,
          confirmButtonText: 'Upload',
          cancelButtonText: 'Cancel',
        }).then((result) => {
          if (result.isConfirmed) {
            const formData = new FormData();
            formData.append('businessCardImage', file); // Append the file to FormData

            // Make an API call to upload the logo
            fetch(`http://localhost:5000/updateBusinessCardImage/${businessId}`, {
              method: 'PUT',
              body: formData,
            })
              .then(response => response.json())
              .then(data => {
                if (data.success) {
                  fetchBusinessData(); // Fetch the updated business data
                  dispatch(updateBusinessData({ cardImage: data.updatedBusinessCard.cardImage })); // Update Redux state with the new card image
                  Swal.fire('Uploaded!', 'Your image has been uploaded.', 'success'); // Success message
                } else {
                  Swal.fire('Error!', data.message, 'error'); // Error message
                }
              })
              .catch(error => Swal.fire('Error!', 'Failed to upload the image.', 'error')); // Catch any errors
          }
        });
      };

      reader.readAsDataURL(file); // Read the file
    }
  };

  // Function to handle removing the image
  const handleRemoveCardImage = () => {
    MySwal.fire({
      title: 'Are you sure?',
      text: 'This will remove the card image.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0BDA51',
      cancelButtonColor: '#D33736',
      confirmButtonText: 'Yes, remove it!',
    }).then((result) => {
      if (result.isConfirmed) {
        // Make API call to delete the card image on the server
        fetch(`http://localhost:5000/businessCardImage/${businessData.business_id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imagePath: cardImage }), // Pass the current card image path
        })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            setCardImage(null); // Clear local state
            dispatch(updateBusinessCard({ cardImage: null })); // Update Redux state to remove the image
            MySwal.fire({
              title: 'Removed!',
              text: 'The card image has been removed.',
              icon: 'success',
              confirmButtonColor: '#0BDA51',
            });
          } else {
            MySwal.fire({
              title: 'Error!',
              text: data.message,
              icon: 'error',
              confirmButtonColor: '#D33736',
            });
          }
        })
        .catch((error) => {
          console.error('Error deleting card image:', error);
          MySwal.fire({
            title: 'Error!',
            text: 'Failed to remove the card image.',
            icon: 'error',
            confirmButtonColor: '#D33736',
          });
        });
      }
    });
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    const businessId = businessData.business_id; // Get the business ID from your state

    if (file) {
      const reader = new FileReader();

      // Read the file as a data URL to display a preview
      reader.onloadend = () => {
        const imageUrl = reader.result; // This will be the base64 image data

        // Show confirmation dialog with image preview using SweetAlert2
        Swal.fire({
          title: 'Confirm Upload',
          text: "",
          html: `<div style="display: flex; flex-direction: column; align-items: center;">
                   <img src="${imageUrl}" alt="Logo Preview" style="width: 600px; height: auto; border-radius: 8px; margin-top: 10px;" />
                 </div>`, // Center the image and text
          showCancelButton: true,
          confirmButtonText: 'Upload',
          cancelButtonText: 'Cancel',
        }).then((result) => {
          if (result.isConfirmed) {
            const formData = new FormData();
            formData.append('businessLogo', file); // Append the logo file

            // Make an API call to upload the logo
            fetch(`http://localhost:5000/updateBusinessLogo/${businessId}`, {
              method: 'PUT',
              body: formData,
            })
              .then(response => response.json())
              .then(data => {
                if (data.success) {
                  fetchBusinessData(); // Fetch the updated business data
                  dispatch(updateBusinessData({ businessLogo: data.updatedLogoPath })); // Update Redux state with the logo path
                  Swal.fire('Uploaded!', '', 'success'); // Success message
                } else {
                  console.error('Error updating logo:', data.message);
                  Swal.fire('Error!', data.message, 'error'); // Error message
                }
              })
              .catch(error => {
                console.error('Error uploading logo:', error);
                Swal.fire('Error!', 'There was an error uploading the logo.', 'error'); // General error message
              });
          } else {
            // Swal.fire('Cancelled', 'Your logo upload was cancelled.', 'info'); // Cancel message
          }
        });
      };

      reader.readAsDataURL(file); // Read the file as a data URL
    }
  };

  // Handle file upload for hero images
  const handleHeroImagesUpload = (event) => {
    const files = Array.from(event.target.files);

    if (files.length === 0) return; // Exit if no files are selected

    const formData = new FormData();

    // Append each selected file to the formData object (use the correct field name: 'heroImages')
    files.forEach((file) => {
      formData.append('heroImages', file);
      formData.append('imageTitle', '');
    });

    // Make API call to upload the hero images
    fetch(`http://localhost:5000/updateBusinessCover/${businessData.business_id}`, {
      method: 'PUT',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Update Redux store with the new hero images and initialize titles
          dispatch(updateBusinessData({
            heroImages: data.updatedHeroImages
          }));

          MySwal.fire({
            title: 'Success',
            text: 'Hero images updated successfully!',
            icon: 'success',
            confirmButtonColor: '#0BDA51',
          });
        } else {
          console.error('Error updating hero images:', data.message);
          MySwal.fire({
            title: 'Error',
            text: 'Failed to update hero images.',
            icon: 'error',
            confirmButtonColor: '#D33736',
          });
        }
      })
      .catch((error) => {
        console.error('Error uploading hero images:', error);
        MySwal.fire({
          title: 'Error',
          text: 'An error occurred while uploading hero images.',
          icon: 'error',
          confirmButtonColor: '#D33736',
        });
      });
  };

  // Handle removing a hero image
  const handleRemoveHeroImage = (id, path) => {
    const imagePath = path; // Get the image path to be removed

    MySwal.fire({
      title: 'Are you sure?',
      text: 'This will remove the hero image.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0BDA51',
      cancelButtonColor: '#D33736',
      confirmButtonText: 'Yes, remove it!',
    }).then((result) => {
      if (result.isConfirmed) {
        // Make DELETE request to remove the image from the backend
        fetch(`http://localhost:5000/businessCoverPhoto/${businessData.business_id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imagePath }), // Pass the image path to be deleted
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              // Remove the image from Redux store after successful deletion
              dispatch(removeHeroImage({ id }));

              MySwal.fire({
                title: 'Removed!',
                text: 'The image has been removed successfully.',
                icon: 'success',
                confirmButtonColor: '#0BDA51',
              });
            } else {
              console.error('Error removing image:', data.message);
              MySwal.fire({
                title: 'Error',
                text: 'Failed to remove the image.',
                icon: 'error',
                confirmButtonColor: '#D33736',
              });
            }
          })
          .catch((error) => {
            console.error('Error:', error);
            MySwal.fire({
              title: 'Error',
              text: 'An error occurred while removing the image.',
              icon: 'error',
              confirmButtonColor: '#D33736',
            });
          });
      }
    });
  };

  // Handle editing each hero image title by image ID
  const handleEditImageTitle = (imageId) => {
    setEditingImageTitles((prev) => ({ ...prev, [imageId]: true }));
  };

  // Save edited title for a hero image
  const handleSaveImageTitle = async (imageId) => {
    try {
      const response = await fetch(`http://localhost:5000/updateBusinessCoverImagesTitle/${businessData.business_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageId,
          title: tempImageTitles[imageId],
        }),
      });
  
      const data = await response.json();
  
      if (data.success) {
        dispatch(updateHeroImageTitle({ id: imageId, title: tempImageTitles[imageId] }));
        setEditingImageTitles((prev) => ({ ...prev, [imageId]: false }));
  
        MySwal.fire({
          title: 'Success',
          text: 'Image title updated successfully!',
          icon: 'success',
          confirmButtonColor: '#0BDA51',
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error updating image title:', error);
      MySwal.fire({
        title: 'Error',
        text: 'Failed to update image title.',
        icon: 'error',
        confirmButtonColor: '#0BDA51',
      });
    }
  };
  
  // Cancel editing for a hero image
  const handleCancelImageTitleEdit = (imageId) => {
    const originalTitle = businessData.heroImages.find((img) => img.id === imageId)?.title || '';
    setTempImageTitles((prev) => ({ ...prev, [imageId]: originalTitle }));
    setEditingImageTitles((prev) => ({ ...prev, [imageId]: false }));
  };

  const handleSaveContact = async () => {
    try {
      // Send PUT request to update contact info in the backend
      const response = await fetch(`http://localhost:5000/updateBusinessContactInfo/${businessData.business_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contactInfo: businessData.contactInfo }), // Pass the updated contact info array
      });

      const data = await response.json();

      if (data.success) {
        MySwal.fire({
          title: 'Success',
          text: 'Contact information updated successfully!',
          icon: 'success',
          confirmButtonColor: '#0BDA51',
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error updating contact info:', error);
      MySwal.fire({
        title: 'Error',
        text: 'Failed to update contact information.',
        icon: 'error',
        confirmButtonColor: '#0BDA51',
      });
    }
  };

  // Handle removing a contact info
  const handleRemoveContactInfo = (id) => {
    MySwal.fire({
      title: 'Are you sure?',
      text: 'This will remove the contact info.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0BDA51',
      cancelButtonColor: '#D33736',
      confirmButtonText: 'Yes, remove it!',
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(removeContactInfo({ id }));
        MySwal.fire({
          title: 'Removed!',
          text: 'The contact info has been removed.',
          icon: 'success',
          confirmButtonColor: '#0BDA51',
        });
      }
    });
  };

  const handleEditHours = () => {
    setIsEditingHours(true);
    setTempOpeningHours(businessData.openingHours.map(hours => ({ ...hours }))); // Create a copy of the hours
  };

  const handleSaveHours = async () => {
    try {
      const response = await fetch(`http://localhost:5000/update-opening-hours/${businessData.business_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ openingHours: tempOpeningHours }), // Send updated hours
      });

      console.log('Response:', response);

      const data = await response.json();

      if (data.success) {
        // Optionally update your Redux state here with new data
        dispatch(updateBusinessData({ openingHours: tempOpeningHours }));

        // Show success alert
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Opening hours saved successfully.',
          confirmButtonText: 'Okay',
        });

        // Exit editing mode
        setIsEditingHours(false);
      } else {
        console.error('Error saving opening hours:', data.message);
        // Show error alert
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: data.message || 'Failed to save opening hours.',
          confirmButtonText: 'Okay',
        });
      }
    } catch (error) {
      console.error('Error while saving opening hours:', error);
      // Show error alert
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'An error occurred while saving opening hours.',
        confirmButtonText: 'Okay',
      });
    }
  };

  const handleCancelEditHours = () => {
    setIsEditingHours(false);
    setTempOpeningHours(businessData.openingHours); // Reset to original
  };

  const handleTimeChange = (index, field, value) => {
    setTempOpeningHours(prevHours =>
      prevHours.map((hours, i) => i === index ? { ...hours, [field]: value } : hours)
    );
  };

  const handleSaveFacilities = async () => {
    try {
      const response = await fetch(`http://localhost:5000/updateBusinessFacilities/${businessData.business_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ facilities: businessData.facilities }), // Pass the updated facilities array
      });

      const data = await response.json();

      if (data.success) {
        MySwal.fire({
          title: 'Success',
          text: 'Facilities updated successfully!',
          icon: 'success',
          confirmButtonColor: '#0BDA51',
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error updating facilities:', error);
      MySwal.fire({
        title: 'Error',
        text: 'Failed to update facilities.',
        icon: 'error',
        confirmButtonColor: '#0BDA51',
      });
    }
  };

  // Handle removing a facility
  const handleRemoveFacility = (index) => {
    MySwal.fire({
      title: 'Are you sure?',
      text: 'This will remove the facility.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0BDA51',
      cancelButtonColor: '#D33736',
      confirmButtonText: 'Yes, remove it!',
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(removeFacility({ index }));
        MySwal.fire({
          title: 'Removed!',
          text: 'The facility has been removed.',
          icon: 'success',
          confirmButtonColor: '#0BDA51',
        });
      }
    });
  };

  // Function to handle saving policies
  const handleSavePolicies = async () => {
    try {
      const response = await fetch(`http://localhost:5000/updateBusinessPolicies/${businessData.business_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ policies: businessData.policies }), // Pass the updated policies array
      });

      const data = await response.json();

      if (data.success) {
        MySwal.fire({
          title: 'Success',
          text: 'Policies updated successfully!',
          icon: 'success',
          confirmButtonColor: '#0BDA51',
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error updating policies:', error);
      MySwal.fire({
        title: 'Error',
        text: 'Failed to update policies.',
        icon: 'error',
        confirmButtonColor: '#0BDA51',
      });
    }
  };

  // Handle opening the icon picker modal
  const openIconModal = (field) => {
    setCurrentEditingField(field);
    setIsIconModalOpen(true);
  };

  // Handle icon selection
  const handleIconSelect = (iconName) => {
    if (currentEditingField.startsWith('contact-')) {
      const id = parseInt(currentEditingField.split('-')[1]);
      dispatch(updateContactIcon({ id, icon: iconName }));
    } else if (currentEditingField.startsWith('facility-')) {
      const index = parseInt(currentEditingField.split('-')[1]);
      dispatch(updateFacilityIcon({ index, icon: iconName }));
    }
    setIsIconModalOpen(false);
  };

  // Handle saving the entire profile
  const handleSave = () => {
    MySwal.fire({
      title: 'Are you sure?',
      text: 'Do you want to save the business profile?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0BDA51',
      cancelButtonColor: '#D33736',
      confirmButtonText: 'Yes, save it!',
    }).then((result) => {
      if (result.isConfirmed) {
        // Implement API call or save logic
        console.log('Saving business profile...', businessData);
        MySwal.fire({
          title: 'Saved!',
          text: 'Your business profile has been saved.',
          icon: 'success',
          confirmButtonColor: '#0BDA51',
        });
      }
    });
  };

  // Example of dispatching removePolicy
  const handleRemovePolicy = (policyIndex) => {
    dispatch(removePolicy({ policyIndex }));
  };

  // Example of dispatching removePolicyItem
  const handleRemovePolicyItem = (policyIndex, itemIndex) => {
    dispatch(removePolicyItem({ policyIndex, itemIndex }));
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen mx-auto bg-gray-100 font-sans">
      <Sidebar />

      <div className="flex-1 p-4 lg:p-8 max-h-screen overflow-y-auto">
        <div className='flex justify-between items-center mb-3'>
          <h1 className="text-2xl lg:text-3xl font-semibold text-gray-800">Business Profile</h1>
          <Button
            onClick={handleSave}
            className='bg-green-500 text-white hover:bg-green-600 transition flex items-center'
          >
            <FaSave className='mr-2' />
            Save Profile
          </Button>
        </div>

        <Tabs aria-label="Business Profile Sections" className="w-full">
          <Tab key="general" title="General Info">
            <Card>
              <CardBody>
                <h3 className="text-lg font-bold mb-4 p-5">Update Business Logo and Name</h3>
                <div className='flex flex-col lg:flex-row items-center mb-6 shadow-lg p-3 rounded-sm shadow-slate-400'>
                  <div className='relative w-24 h-24 lg:mr-6 mb-4 lg:mb-0'>

                    {businessData.businessLogo ? (
                      <img
                        src={businessData.businessLogo.startsWith('uploads')
                          ? `http://localhost:5000/${businessData.businessLogo}`
                          : businessData.businessLogo
                        }
                        alt="Business Logo"
                        className='w-full h-full object-cover rounded-full'
                      />
                    ) : (
                      <div className='w-full h-full bg-gray-200 rounded-full flex items-center justify-center'>
                        <FaUpload className='text-gray-400 text-2xl' />
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleLogoUpload}
                      className='hidden'
                      accept='image/*'
                    />
                    <button
                      onClick={() => fileInputRef.current.click()}
                      className='absolute bottom-0 right-0 bg-color1 text-white p-2 rounded-full hover:bg-color2'
                    >
                      <FaUpload />
                    </button>
                  </div>
                  {isEditingName ? (
                    // Editing mode
                    <>
                      <Input
                        type="text"
                        value={tempBusinessName}
                        onChange={(e) => setTempBusinessName(e.target.value)}
                        placeholder="Enter Business Name"
                        className="text-xl lg:text-2xl font-semibold w-full"
                      />
                      <AiOutlineCheck
                        onClick={handleSaveName}
                        className="cursor-pointer text-green-600 ml-2 text-md text-2xl"
                      />
                      <AiOutlineClose
                        onClick={handleCancelEdit}
                        className="cursor-pointer text-red-600 ml-2 text-2xl"
                      />
                    </>
                  ) : (
                    // Viewing mode
                    <>
                      <p className="text-xl lg:text-2xl font-semibold w-full">
                        {businessData.businessName || 'No Business Name'}
                      </p>
                      <AiOutlineEdit
                        onClick={handleEditName}
                        className="cursor-pointer text-gray-600 ml-2 text-2xl"
                      />
                    </>
                  )}
                </div>

                <div className="mb-6 shadow-md rounded-md p-6 shadow-slate-400 ">
                  <h3 className="text-lg font-bold mb-4">Update Business Card</h3>
                  <div className="space-y-4">
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Card Image</label>

                      {/* Display the uploaded image preview if available */}
                      {cardImage ? (
                        <div className="relative w-full h-48 mb-3">
                          <img
                            src={`http://localhost:5000/${cardImage}`
                            }
                            alt="Card Preview"
                            className="w-full h-full object-cover rounded-md shadow-md"
                          />
                          <button
                            onClick={() => handleRemoveCardImage()}  // Updated function to remove the image
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-md p-4 flex justify-center items-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleCardImageUpload}
                            className="hidden"
                            id="cardImageUpload"
                          />
                          <label
                            htmlFor="cardImageUpload"
                            className="cursor-pointer bg-color1 text-white px-4 py-2 rounded-md hover:bg-color2 transition"
                          >
                            <FaUpload className="inline mr-2" />
                            Upload Image
                          </label>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={description || ''}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter description"
                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-color1"
                        rows="3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        value={location || ''}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Enter location"
                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-color1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Budget Range</label>
                      <input
                        type="text"
                        value={priceRange || ''}
                        onChange={(e) => setPriceRange(e.target.value)}
                        placeholder="Enter budget range"
                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-color1"
                      />
                    </div>
                    <button
                      onClick={handleUpdate}
                      className="mt-4 w-full bg-color1 text-white p-2 rounded-md hover:bg-color2 transition"
                    >
                      Update Business Card
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-4">Business Card Preview</h3>
                  <div className="border border-gray-300 rounded-md p-4">
                    {cardImage && (
                      <img
                        src={cardImage.startsWith('uploads')
                          ? `http://localhost:5000/${cardImage}`
                          : cardImage
                        }
                        alt="Business Card"
                        className="w-full h-48 object-cover rounded-md mb-4"
                      />
                    )}
                    <p><strong>Business Name:</strong> {businessData.businessName}</p>
                    <p><strong>Description:</strong> {description}</p>
                    <p><strong>Location:</strong> {location}</p>
                    <p><strong>Price Range:</strong> {priceRange}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Tab>

          <Tab key="hero" title="Cover Photo">
            <Card>
              <CardBody>
                <h2 className="text-lg lg:text-xl font-semibold mb-4 text-gray-700">Cover Photo</h2>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4'>
                  {/* Rendering the hero images with delete button */}
                  {businessData.heroImages && Array.isArray(businessData.heroImages) && businessData.heroImages.map((image) => (
                    <div key={image.id} className="relative">
                      <img
                        src={`http://localhost:5000/${image.path}`}  // Apply the base URL to the image
                        alt={`Cover Photo ${image.title}`}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <div className='flex flex-col lg:flex-row items-center mt-2'>
                      {editingImageTitles[image.id] ? (
                        <>
                          <Input
                            type="text"
                            value={tempImageTitles[image.id] || ''}
                            onChange={(e) => setTempImageTitles((prev) => ({ ...prev, [image.id]: e.target.value }))}
                            placeholder="Enter image title"
                            className="mt-2"
                          />
                          <AiOutlineCheck
                            onClick={() => handleSaveImageTitle(image.id)}
                            className="cursor-pointer text-green-600 ml-2 text-2xl"
                          />
                          <AiOutlineClose
                            onClick={() => handleCancelImageTitleEdit(image.id)}
                            className="cursor-pointer text-red-600 ml-2 text-2xl"
                          />
                        </>
                      ) : (
                        <>
                          <Input 
                            type="text"
                            value = {image.title || 'No Title'}
                            className="mt-2"
                            disabled
                          />
                          <AiOutlineEdit
                            onClick={() => handleEditImageTitle(image.id)}
                            className="cursor-pointer text-gray-600 ml-2 text-2xl"
                          />
                        </>
                      )}
                      </div>
                      <Button
                        onClick={() => handleRemoveHeroImage(image.id, image.path)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                      >
                        <FaTrash size={12} />
                      </Button>
                    </div>
                  ))}
                </div>
                <input
                  type="file"
                  ref={heroImagesInputRef}
                  onChange={handleHeroImagesUpload}
                  className='hidden'
                  accept='image/*'
                  multiple
                />
                <Button
                  onClick={() => heroImagesInputRef.current.click()}
                  className='bg-color1 text-white hover:bg-color2 transition'
                >
                  Upload Images
                </Button>
              </CardBody>
            </Card>
          </Tab>

          <Tab key="about" title="About Us">
            <Card>
              <CardBody className='overflow-x-auto'>
                <h2 className="text-lg lg:text-xl font-semibold mb-4 text-gray-700">About Us</h2>
                <div className='flex flex-col lg:flex-row items-center mb-6 shadow-lg p-3 rounded-sm shadow-slate-400'>
                  {isEditingAboutUs ? (
                    <>
                      <textarea
                        value={tempAboutUs}
                        onChange={(e) => setTempAboutUs(e.target.value)}
                        placeholder="Enter information about your business"
                        className="w-full p-2 border border-gray-300 rounded-lg mb-4"
                      />
                      <AiOutlineCheck
                        onClick={handleSaveAboutUs}
                        className="cursor-pointer text-green-600 ml-2 text-md text-2xl"
                      />
                      <AiOutlineClose
                        onClick={handleCancelEditAboutUs}
                        className="cursor-pointer text-red-600 ml-2 text-2xl"
                      />
                    </>
                  ) : (
                    // Viewing mode
                    <>
                      <p className="w-full p-2 border border-gray-300 rounded-lg mb-4">
                        {businessData.aboutUs || 'No information provided'}
                      </p>
                      <AiOutlineEdit
                        onClick={handleEditAboutUs}
                        className="cursor-pointer text-gray-600 ml-2 text-2xl"
                      />
                    </>
                  )}
                </div>

                <h3 className="text-md lg:text-lg font-semibold mt-4 mb-2 flex items-center justify-between">
                  <span>Contact Information</span>
                  <AiOutlineCheck
                    onClick={handleSaveContact}
                    className="cursor-pointer text-green-600 mr-2 text-2xl"
                  />
                </h3>
                {businessData.contactInfo && Array.isArray(businessData.contactInfo) && businessData.contactInfo.map((info) => (
                  <div key={info.id} className='flex flex-col lg:flex-row items-center gap-2 mb-2'>
                    <Button onClick={() => openIconModal(`contact-${info.id}`)} className="min-w-[40px] h-[40px] p-0">
                      {React.createElement(businessIcons.find(icon => icon.name === info.icon)?.icon || FaPlus, { size: 20 })}
                    </Button>
                    <Input
                      type="text"
                      value={info.label}
                      onChange={(e) => dispatch(updateContactInfo({ id: info.id, field: 'label', value: e.target.value }))} // Update label
                      placeholder="Label (e.g. Email, Phone, Facebook)"
                      className='flex-grow'
                    />
                    <Input
                      type="text"
                      value={info.value}
                      onChange={(e) => dispatch(updateContactInfo({ id: info.id, field: 'value', value: e.target.value }))} // Update value
                      placeholder="Url if needed"
                      className='flex-grow'
                    />
                    <Button onClick={() => handleRemoveContactInfo(info.id)} className="bg-red-500 text-white p-2">
                      <FaTrash size={16} />
                    </Button>
                  </div>
                ))}

                <Button onClick={() => dispatch(addContactInfo())} className="mt-2 bg-color1 text-white hover:bg-color2 transition">
                  Add Contact Info
                </Button>

                <h3 className="text-md lg:text-lg font-semibold mt-4 mb-2 flex items-center justify-between">
                  <span>Opening Hours</span>
                  {!isEditingHours && (
                    <AiOutlineEdit
                      onClick={handleEditHours}
                      className="cursor-pointer text-gray-600 ml-2 text-2xl"
                    />
                  )}
                  {isEditingHours && (
                    <div className="flex items-center">
                      <AiOutlineCheck
                        onClick={handleSaveHours}
                        className="cursor-pointer text-green-600 mr-2 text-2xl"
                      />
                      <AiOutlineClose
                        onClick={handleCancelEditHours}
                        className="cursor-pointer text-red-600 text-2xl"
                      />
                    </div>
                  )}
                </h3>

                {isEditingHours ? (
                  tempOpeningHours.map((hours, index) => (
                    <div key={index} className='flex flex-col lg:flex-row items-center gap-2 mb-2'>
                      <Input
                        type="text"
                        value={hours.day}
                        readOnly
                        className='w-full lg:w-1/4'
                      />

                      <Input
                        type="time"
                        value={hours.open}
                        onChange={(e) => handleTimeChange(index, 'open', e.target.value)}
                        disabled={hours.open === "Closed"}
                        className='w-full lg:w-1/4'
                      />

                      <Input
                        type="time"
                        value={hours.close}
                        onChange={(e) => handleTimeChange(index, 'close', e.target.value)}
                        disabled={hours.close === "Closed"}
                        className='w-full lg:w-1/4'
                      />

                      <Switch
                        color='success'
                        isSelected={hours.open !== "Closed"}
                        onChange={(e) => {
                          const newOpenTime = e.target.checked ? "08:00" : "Closed";
                          const newCloseTime = e.target.checked ? "17:00" : "Closed";
                          handleTimeChange(index, 'open', newOpenTime);
                          handleTimeChange(index, 'close', newCloseTime);
                        }}
                      >
                        <span className='font-semibold text-md'>{hours.open === "Closed" ? "Closed" : "Open"}</span>
                      </Switch>
                    </div>
                  ))
                ) : (
                  <>
                    {businessData.openingHours && Array.isArray(businessData.openingHours) && businessData.openingHours.map((hours, index) => (
                      <div key={index} className='flex flex-col lg:flex-row items-center gap-2 mb-2'>
                        <Input
                          type="text"
                          value={hours.day}
                          readOnly
                          className='w-full lg:w-1/4'
                        />

                        <Input
                          type="time"
                          value={hours.open}
                          readOnly
                          className='w-full lg:w-1/4'
                        />

                        <Input
                          type="time"
                          value={hours.close}
                          readOnly
                          className='w-full lg:w-1/4'
                        />

                        <span className='font-semibold text-md'>{hours.open === "Closed" ? "Closed" : "Open"}</span>
                      </div>
                    ))}
                  </>
                )}
              </CardBody>
            </Card>
          </Tab>

          <Tab key="facilities" title="Facilities & Amenities">
            <Card>
              <CardBody className='h-[300px] overflow-x-auto scrollbar-hide'>
                <h2 className="text-lg lg:text-xl font-semibold mb-4 text-gray-700">Facilities & Amenities</h2>
                <div className='flex justify-start flex-wrap gap-3'>
                  {businessData.facilities && Array.isArray(businessData.facilities) && businessData.facilities && businessData.facilities.map((facility, index) => (
                    <div key={index} className='flex lg:flex-row items-center gap-2 mb-2'>
                      <Button onClick={() => openIconModal(`facility-${index}`)} className="min-w-[40px] h-[40px] p-0">
                        {facility.icon ? React.createElement(businessIcons.find(icon => icon.name === facility.icon)?.icon, { size: 20 }) : <FaPlus size={20} />}
                      </Button>
                      <Input
                        type="text"
                        value={facility.name}
                        onChange={(e) => dispatch(updateFacility({ index, field: 'name', value: e.target.value }))}
                        placeholder="Facility name"
                        className='w-[15rem]'
                      />
                      <Button onClick={() => handleRemoveFacility(index)} className="bg-red-500 text-white p-2">
                        <FaTrash size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
            <div className='flex gap-2'>
            <Button onClick={() => dispatch(addFacility())} className="mt-2 bg-color1 text-white hover:bg-color2 transition">Add Facility</Button>
            <Button onClick={() => handleSaveFacilities()} className="mt-2 bg-color1 text-white hover:bg-color2 transition">
              Save
            </Button>
            </div>
          </Tab>

          <Tab key="policies" title="Policies">
            <Card>
              <CardBody>
                <h2 className="text-lg lg:text-xl font-semibold mb-4 text-gray-700">Policies</h2>
                {businessData.policies && Array.isArray(businessData.policies) && businessData.policies.map((policy, policyIndex) => (
                  <div key={policyIndex} className='mb-4'>
                    <Input
                      type="text"
                      value={policy.title}
                      onChange={(e) => dispatch(updatePolicy({ index: policyIndex, field: 'title', value: e.target.value }))}
                      placeholder="Policy title"
                      className='mb-2'
                    />
                    {policy.items.map((item, itemIndex) => (
                      <div key={itemIndex} className='flex flex-col lg:flex-row items-center gap-2 mb-2'>
                        <Input
                          type="text"
                          value={item}
                          onChange={(e) => dispatch(updatePolicyItem({ policyIndex, itemIndex, value: e.target.value }))}
                          placeholder="Policy item"
                          className='flex-grow'
                        />
                        <Button onClick={() => handleRemovePolicyItem(policyIndex, itemIndex)} className="bg-red-500 text-white p-2">
                          <FaTrash size={16} />
                        </Button>
                      </div>
                    ))}
                    <Button onClick={() => dispatch(addPolicyItem({ policyIndex }))} className="mr-2">Add Item</Button>
                    <Button onClick={() => handleRemovePolicy(policyIndex)} className="bg-red-500 text-white">Remove Policy</Button>
                  </div>
                ))}
                <Button onClick={() => dispatch(addPolicy())} className="mt-2 bg-color1 text-white hover:bg-color2 transition">Add Policy</Button>
                <Button onClick={() => handleSavePolicies()} className="mt-2 bg-color1 text-white hover:bg-color2 transition">
                  Save
                </Button>
              </CardBody>
            </Card>
          </Tab>

          <Tab key="Location" title="Location">
            <Card>
              <CardBody>
                <div className="flex flex-col gap-4">
                  <h2 className="text-lg lg:text-xl font-semibold text-gray-700">Business Location</h2>
                  
                  {/* Map Container */}
                  <div className="w-full h-[400px] bg-gray-200 rounded-lg flex items-center justify-center">
                    {/* Placeholder for the actual map implementation */}
                    <p className="text-gray-500">Map will be displayed here</p>
                  </div>

                  {/* Location Controls */}
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-3">
                      <Input
                        type="text"
                        label="Latitude"
                        placeholder="Enter latitude"
                        className="flex-1"
                      />
                      <Input
                        type="text"
                        label="Longitude"
                        placeholder="Enter longitude"
                        className="flex-1"
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        className="flex-1 bg-color1 text-white hover:bg-color2 transition"
                        onClick={() => {
                          // Add logic to get current pin location
                          console.log('Getting pin location...');
                        }}
                      >
                        Get Pin Current Location
                      </Button>
                      
                      <Button 
                        className="flex-1 bg-green-500 text-white hover:bg-green-600 transition"
                        onClick={() => {
                          // Add logic to save location
                          console.log('Saving location...');
                        }}
                      >
                        Save Location
                      </Button>
                    </div>
                  </div>

                  {/* Location Preview */}
                  <div className="mt-4">
                    <h3 className="text-md font-semibold mb-2">Current Location</h3>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        No location set. Place a pin on the map or enter coordinates manually.
                      </p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Tab>
        </Tabs>
      </div>

      <Modal 
        isOpen={isIconModalOpen} 
        onClose={() => setIsIconModalOpen(false)}
        scrollBehavior="inside"  // Enable internal scrolling
      >
        <ModalContent>
          <ModalHeader>Select an Icon</ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-4 gap-4">
              {businessIcons.map(({ name, icon: Icon }) => (
                <Button
                  key={name}
                  onClick={() => handleIconSelect(name)}
                  className="p-2 hover:bg-gray-100 flex items-center justify-center"
                >
                  <Icon size={24} />
                </Button>
              ))}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default BusinessProfile;