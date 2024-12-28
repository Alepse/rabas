import React, {useEffect, useState} from 'react';
import { Tabs, Tab } from '@nextui-org/react';
import ActivitiesTab from './businessSectionContents/ActivitiesTab';
import AccommodationsTab from './businessSectionContents/AccommodationsTab';
import FoodPlacesTab from './businessSectionContents/FoodPlacesTab';
import ShopsTab from './businessSectionContents/ShopsTab';
import wave from '@/assets/wave.webp'
const BASE_URL = import.meta.env.VITE_BASE_URL; 
const BusinessSection = () => {
  const [businessData, setBusinessData] = useState({
    activities: [],
    accommodations: [],
    restaurant: [],
    shop: []
  });
  // console.log(businessData);
  const [loading, setLoading] = useState(true);
  const businesscategories = ['activity', 'accommodation', 'restaurant', 'shop'];
  // Fetch businesses from the backend
  useEffect(() => {
    const fetchBusinesses = async (businessType) => {
      try {
        const response = await fetch(`${BASE_URL}/getAllBusinesses?businessType=${businessType}`);
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          if (data.success) {
            const filteredBusinesses = data.businesses.filter((business) => {
              return business.businessType === businessType || (businessType === 'activity' && business.businessType === 'attraction');
            });

            const businessTypeKey = businessType === 'activity' || businessType === 'attraction' ? 'activities' :
              businessType === 'accommodation' ? 'accommodations' :
              businessType === 'restaurant' ? 'restaurant' : 'shop';

            setBusinessData((prevData) => ({
              ...prevData,
              [businessTypeKey]: filteredBusinesses,
            }));
          } else {
            console.error(`Failed to fetch ${businessType} data:`, data.message);
          }
        } else {
          console.error(`Unexpected response format for ${businessType}:`, response);
        }
      } catch (error) {
        console.error(`Error fetching ${businessType}:`, error);
      }
    };

    const fetchAllBusinesses = async () => {
      await Promise.all(businesscategories.map(fetchBusinesses));
      setLoading(false); // Only set loading to false after all fetches complete
    };

    fetchAllBusinesses();
  }, []);

  return (
   <div 
     className="mx-auto p-6 "
     style={{  
      backgroundImage: `url(${wave})`,  
      backgroundSize: '140% 100%', // adjust the size to make the background smaller  
      backgroundRepeat: 'no-repeat', // prevents the image from repeating  
      backgroundPosition: 'center', // centers the image in the container  
    }} 
   >
   
      <div className="text-center mb-10 ">
        <h1 className="text-3xl md:text-5xl font-bold text-color1">
        Sorsogon's Hidden Gems
        </h1>
        <p className="text-md md:text-lg text-gray-500 mt-3">
        Your Guide to Unforgettable Visits, Comfy Stays, and Delicious Meals.
        </p>
      </div>
      
      <Tabs 
        aria-label="Sorsogon Exploration Options"
        variant="underlined"
        classNames={{
          base: "w-full overflow-x-auto rounded-full",
          tabList: "gap-6 w-full  p-4  container ",
          tab: "max-w-fit px-0 h-12 ",
          tabContent: " text-color1  ",
          cursor: "w-full bg-color1",
        
        }}
      >
        <Tab 
          key="activities" 
          title={
            <div className="flex items-center space-x-2">
              <span>Activities</span>
            </div>
          }
        >
          <ActivitiesTab activitiesData={businessData.activities} loading={loading} />
        </Tab>
        <Tab 
          key="accommodations" 
          title={
            <div className="flex items-center space-x-2">
              <span>Accommodations</span>
            </div>
          }
        >
          <AccommodationsTab accommodationsData={businessData.accommodations} loading={loading} />
        </Tab>
        <Tab 
          key="food-places" 
          title={
            <div className="flex items-center space-x-2">
              <span>Food Places</span>
            </div>
          }
        >
          <FoodPlacesTab foodPlacesData={businessData.restaurant} loading={loading} />
        </Tab>
        <Tab 
          key="shops" 
          title={
            <div className="flex items-center space-x-2">
              <span>Shops</span>
            </div>
          }
        >
          <ShopsTab shopsData={businessData.shop} loading={loading} />
        </Tab>
      </Tabs>
    </div>
  );
}

export default BusinessSection;