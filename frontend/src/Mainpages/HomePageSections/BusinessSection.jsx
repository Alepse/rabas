import React from 'react';
import { Tabs, Tab } from '@nextui-org/react';
import ActivitiesTab from './businessSectionContents/ActivitiesTab';
import AccommodationsTab from './businessSectionContents/AccommodationsTab';
import FoodPlacesTab from './businessSectionContents/FoodPlacesTab';
import ShopsTab from './businessSectionContents/ShopsTab';

const BusinessSection = () => {
  return (
    <div className="container mx-auto p-4 md:p-8 bg-white  mb-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-5xl font-bold text-[#092635]">
          Explore Sorsogon
        </h1>
        <p className="text-lg md:text-xl text-[#4A5568] mt-3">Discover the best places to visit, stay, and dine.</p>
      </div>
      
      <Tabs 
        variant="underlined"
        classNames={{
          tab: "text-[14px] md:text-[15px] font-semibold transition-colors duration-200 px-4 md:px-5 py-2 md:py-3 rounded-md",
          tabContent: "group-data-[selected=true]:text-[#092635] text-[#4A5568]",
          tabPanel: "mt-8"
        }}
        className='overflow-x-auto max-w-full'
      >
        <Tab title="Activities">
          <ActivitiesTab />
        </Tab>
        <Tab title="Accommodations">
          <AccommodationsTab />
        </Tab>
        <Tab title="Food Places">
          <FoodPlacesTab />
        </Tab>
        <Tab title="Shops">
          <ShopsTab />
        </Tab>
      </Tabs>
    </div>
  );
}

export default BusinessSection;