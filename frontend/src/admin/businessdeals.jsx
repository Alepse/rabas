import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/sidebar';
import { Switch } from '@nextui-org/react';
import ActivityDeals from '@/admin/AddDealsComponent/ActivityDeals';
import AccommodationDeals from '@/admin/AddDealsComponent/AccomodationDeals';
import RestaurantDeals from '@/admin/AddDealsComponent/RestaurantDeals';
import ShopDeals from '@/admin/AddDealsComponent/ShopDeals';

const BusinessDeals = () => {
  const [showActivities, setShowActivities] = useState(false);
  const [showAccommodation, setShowAccommodation] = useState(false);
  const [showRestaurantServices, setShowRestaurantServices] = useState(false);
  const [showShop, setShowShop] = useState(false);
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
  
  // Title Tab
  useEffect(() => {
    document.title = 'BusinessName | Admin deals';
  });

  return (
    <div className="flex flex-col lg:flex-row bg-light font-sans min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 p-4 md:p-6 lg:p-8 max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4 md:mb-0">
            Manage Deals
          </h1>
        </div>

        {/* Deals Toggle */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Switch on Deals to Add Your Deals:</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Activity Deals Switch */}
            <Switch
              color="success"
              isSelected={showActivities}
              onChange={(e) => setShowActivities(e.target.checked)}
            >
              <span className="font-semibold text-md">Activity Deals</span>
            </Switch>

            {/* Accommodation Deals Switch */}
            <Switch
              color="success"
              isSelected={showAccommodation}
              onChange={(e) => setShowAccommodation(e.target.checked)}
            >
              <span className="font-semibold text-md">Accommodation Deals</span>
            </Switch>

            {/* Restaurant Deals Switch */}
            <Switch
              color="success"
              isSelected={showRestaurantServices}
              onChange={(e) => setShowRestaurantServices(e.target.checked)}
            >
              <span className="font-semibold text-md">Restaurant Deals</span>
            </Switch>

            {/* Shop Deals Switch */}
            <Switch
              color="success"
              isSelected={showShop}
              onChange={(e) => setShowShop(e.target.checked)}
            >
              <span className="font-semibold text-md">Shop Deals</span>
            </Switch>
          </div>
        </div>

        {/* Deals of business products and services */}
        <div className="w-full flex flex-wrap gap-6 ">
          {/* Conditionally render deal components based on toggle states */}
          {showActivities && <ActivityDeals />}
          {showAccommodation && <AccommodationDeals />}
          {showRestaurantServices && <RestaurantDeals />}
          {showShop && <ShopDeals />}
        </div>
      </div>
    </div>
  );
};

export default BusinessDeals;
