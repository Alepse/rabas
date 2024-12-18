import React from 'react';
import { Tabs, Tab } from '@nextui-org/react';
import ActivitiesTab from './businessSectionContents/ActivitiesTab';
import AccommodationsTab from './businessSectionContents/AccommodationsTab';
import FoodPlacesTab from './businessSectionContents/FoodPlacesTab';
import ShopsTab from './businessSectionContents/ShopsTab';
import wave from '@/assets/wave.webp'

const BusinessSection = () => {
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
          <ActivitiesTab />
        </Tab>
        <Tab 
          key="accommodations" 
          title={
            <div className="flex items-center space-x-2">
              <span>Accommodations</span>
            </div>
          }
        >
          <AccommodationsTab />
        </Tab>
        <Tab 
          key="food-places" 
          title={
            <div className="flex items-center space-x-2">
              <span>Food Places</span>
            </div>
          }
        >
          <FoodPlacesTab />
        </Tab>
        <Tab 
          key="shops" 
          title={
            <div className="flex items-center space-x-2">
              <span>Shops</span>
            </div>
          }
        >
          <ShopsTab />
        </Tab>
      </Tabs>
    </div>
  );
}

export default BusinessSection;