import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/sidebar';
import { Switch } from "@nextui-org/react";
import ActivitySections from './AddProductsComponent/ActivitySections';
import AccommodationSection from './AddProductsComponent/AccommodationSection';
import RestaurantServicesSection from './AddProductsComponent/RestaurantServicesSection';
import ShopSections from './AddProductsComponent/ShopSections';
import axios from 'axios';
import Swal from 'sweetalert2';

// Use the environment variable for the base URL
const BASE_URL = import.meta.env.VITE_BASE_URL;

const BusinessProducts = () => {
  const [showActivities, setShowActivities] = useState(false);
  const [showAccommodation, setShowAccommodation] = useState(false);
  const [showRestaurantServices, setShowRestaurantServices] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [businessType, setBusinessType] = useState(null);

  // Function to show admin request popup
  const showRequestPopup = (dealType) => {
    Swal.fire({
      title: 'Request Access',
      text: `You need admin approval to enable ${dealType} deals.`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Request Approval',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        // Handle request approval logic here
        Swal.fire('Request Sent', 'Your request has been sent to the admin.', 'success');
      }
    });
  };

  // Function to check login status
  const checkLoginStatus = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/check-login`, {
        method: 'GET',
        credentials: 'include', // Include cookies
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

  useEffect(() => {
    const fetchBusinessType = async () => {
      if (isLoggedIn) {
        try {
          const response = await axios.get(`${BASE_URL}/get-businessData`, {
            withCredentials: true,
          });
          if (response.status === 200 && response.data) {
            const type = response.data.businessData[0].businessType; // Adjust based on API structure
            setBusinessType(type);

            // Enable the corresponding deal section based on businessType
            setShowActivities(type === 'attraction');
            setShowAccommodation(type === 'accommodation');
            setShowRestaurantServices(type === 'restaurant');
            setShowShop(type === 'shop');
          }
        } catch (error) {
          console.error('Error fetching business data:', error);
        }
      }
    };

    fetchBusinessType();
  }, [isLoggedIn]);

  // Title Tab
  useEffect(() => {
    document.title = 'BusinessName | Admin products';
  });

  const isBusinessType = (type) => businessType === type.toLowerCase();

  return (
    <div className="flex flex-col lg:flex-row bg-light font-sans min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 p-4 md:p-6 lg:p-8 max-h-screen overflow-y-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4 md:mb-0">
            Manage Products and Services
          </h1>
        </div>

        {/* Sections Toggle */}
        <div className="mb-6">
          <h2 className="text-md font-semibold text-gray-700 mb-4">Switch on Sections to Add Products and Services:</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <Switch
              color="success"
              isSelected={showActivities}
              onChange={(e) =>
                businessType === 'attraction'
                  ? setShowActivities(e.target.checked)
                  : showRequestPopup('Activity')
              }
            >
              <span className="font-semibold text-md">Activities</span>
            </Switch>

            <Switch
              color='success'
              isSelected={showAccommodation}
              onChange={(e) =>
                businessType === 'accommodation'
                  ? setShowAccommodation(e.target.checked)
                  : showRequestPopup('Accommodation')
              }
            >
              <span className="font-semibold text-md">Accommodation</span>
            </Switch>

            <Switch
              color='success'
              isSelected={showRestaurantServices}
              onChange={(e) =>
                businessType === 'restaurant'
                  ? setShowRestaurantServices(e.target.checked)
                  : showRequestPopup('Restaurant')
              }
            >
              <span className="font-semibold text-md">Restaurant Services</span>
            </Switch>

            <Switch
              color='success'
              isSelected={showShop}
              onChange={(e) =>
                businessType === 'shop'
                  ? setShowShop(e.target.checked)
                  : showRequestPopup('Shop')
              }
            >
              <span className="font-semibold text-md">Shop</span>
            </Switch>
          </div>
        </div>

        {/* Sections of business products and services */}
        <div className="w-full flex flex-wrap gap-6">
          {showActivities && <ActivitySections />}
          {showAccommodation && <AccommodationSection />}
          {showRestaurantServices && <RestaurantServicesSection />}
          {showShop && <ShopSections />}
        </div>
      </div>
    </div>
  );
};

export default BusinessProducts;
