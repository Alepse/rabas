import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/sidebar';
import { Switch } from '@nextui-org/react';
import ActivityDeals from '@/admin/AddDealsComponent/ActivityDeals';
import AccommodationDeals from '@/admin/AddDealsComponent/AccomodationDeals';
import RestaurantDeals from '@/admin/AddDealsComponent/RestaurantDeals';
import ShopDeals from '@/admin/AddDealsComponent/ShopDeals';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Skeleton } from "@nextui-org/skeleton";

// Use the environment variable for the base URL
const BASE_URL = import.meta.env.VITE_BASE_URL;

const BusinessDeals = () => {
  const [loading, setLoading] = useState(true);
  const [showDeals, setShowDeals] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [businessType, setBusinessType] = useState(null);

  // Function to check login status
  const checkLoginStatus = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/check-login`, {
        method: 'GET',
        credentials: 'include', // Include cookies
      });
      if (response.ok) {
        const data = await response.json();
        setIsLoggedIn(data.isLoggedIn);

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
            setBusinessType(type.toLowerCase());
            setShowDeals(true);
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
    document.title = 'BusinessName | Admin deals';
  });

  const renderDealSwitch = () => {
    switch (businessType) {
      case 'attraction':
        return (
          <Switch
            color="success"
            isSelected={showDeals}
            onChange={(e) => setShowDeals(e.target.checked)}
          >
            <span className="font-semibold text-md">Activity Deals</span>
          </Switch>
        );
      case 'accommodation':
        return (
          <Switch
            color="success"
            isSelected={showDeals}
            onChange={(e) => setShowDeals(e.target.checked)}
          >
            <span className="font-semibold text-md">Accommodation Deals</span>
          </Switch>
        );
      case 'restaurant':
        return (
          <Switch
            color="success"
            isSelected={showDeals}
            onChange={(e) => setShowDeals(e.target.checked)}
          >
            <span className="font-semibold text-md">Restaurant Deals</span>
          </Switch>
        );
      case 'shop':
        return (
          <Switch
            color="success"
            isSelected={showDeals}
            onChange={(e) => setShowDeals(e.target.checked)}
          >
            <span className="font-semibold text-md">Shop Deals</span>
          </Switch>
        );
      default:
        return null;
    }
  };

  const renderDealComponent = () => {
    if (!showDeals) return null;

    switch (businessType) {
      case 'attraction':
        return <ActivityDeals />;
      case 'accommodation':
        return <AccommodationDeals />;
      case 'restaurant':
        return <RestaurantDeals />;
      case 'shop':
        return <ShopDeals />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row bg-light font-sans min-h-screen">
      <Sidebar />

      <div className="flex-1 p-2 md:p-6 lg:p-8 max-h-screen overflow-y-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4 md:mb-0">
            Manage Deals
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
            <div className="mb-6  items-center">
           
              <div className="mt-4">{renderDealSwitch()}</div>
            </div>

            <div className="w-full flex flex-wrap gap-6">
              {renderDealComponent()}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BusinessDeals;
