import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/sidebar';
import { Switch } from "@nextui-org/react";
import ActivitySections from './AddProductsComponent/ActivitySections';
import AccommodationSection from './AddProductsComponent/AccommodationSection';
import RestaurantServicesSection from './AddProductsComponent/RestaurantServicesSection';
import ShopSections from './AddProductsComponent/ShopSections';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Skeleton } from "@nextui-org/skeleton";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const BusinessProducts = () => {
  const [loading, setLoading] = useState(true);
  const [showActivities, setShowActivities] = useState(false);
  const [showAccommodation, setShowAccommodation] = useState(false);
  const [showRestaurantServices, setShowRestaurantServices] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [businessType, setBusinessType] = useState(null);

  const checkLoginStatus = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/check-login`, {
        method: 'GET',
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setIsLoggedIn(data.isLoggedIn);
        if (!data.isLoggedIn) window.location.href = '/';
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

            // Automatically enable the section for the business type
            if (type === 'attraction') setShowActivities(true);
            if (type === 'accommodation') setShowAccommodation(true);
            if (type === 'restaurant') setShowRestaurantServices(true);
            if (type === 'shop') setShowShop(true);
          }
        } catch (error) {
          console.error('Error fetching business data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchBusinessType();
  }, [isLoggedIn]);

  useEffect(() => {
    document.title = 'BusinessName | Admin products';
  });

  const renderSwitches = () => {
    switch (businessType) {
      case 'attraction':
        return (
          <Switch
            color="success"
            isSelected={showActivities}
            onChange={(e) => setShowActivities(e.target.checked)}
          >
            <span className="font-semibold text-md">Activities</span>
          </Switch>
        );
      case 'accommodation':
        return (
          <Switch
            color="success"
            isSelected={showAccommodation}
            onChange={(e) => setShowAccommodation(e.target.checked)}
          >
            <span className="font-semibold text-md">Accommodation</span>
          </Switch>
        );
      case 'restaurant':
        return (
          <Switch
            color="success"
            isSelected={showRestaurantServices}
            onChange={(e) => setShowRestaurantServices(e.target.checked)}
          >
            <span className="font-semibold text-md">Restaurant Services</span>
          </Switch>
        );
      case 'shop':
        return (
          <Switch
            color="success"
            isSelected={showShop}
            onChange={(e) => setShowShop(e.target.checked)}
          >
            <span className="font-semibold text-md">Shop</span>
          </Switch>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row bg-light font-sans min-h-screen">
      <Sidebar />
      <div className="flex-1 px-8 py-4 md:p-6 lg:p-8 max-h-screen overflow-y-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4 md:mb-0">
            Manage Products and Services
          </h1>
        </div>

        {loading ? (
          <div className="py-8">
            <Skeleton className="rounded-lg mb-4 p-4 w-[40%]" />
            <Skeleton className="rounded-lg mb-4 p-4 w-[60%]" />
            <div className="max-h-[820px] w-full h-full rounded-xl shadow-gray-400 shadow-lg bg-white">
              <Skeleton className="w-full h-[480px] md:h-[600] rounded-t-lg overflow-hidden" />
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
          
              <div className="flex flex-col sm:flex-row gap-4">
                {renderSwitches()}
              </div>
            </div>
            <div className="w-full flex flex-wrap gap-6">
              {showActivities && <ActivitySections />}
              {showAccommodation && <AccommodationSection />}
              {showRestaurantServices && <RestaurantServicesSection />}
              {showShop && <ShopSections />}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BusinessProducts;
