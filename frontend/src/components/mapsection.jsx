import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Button } from "@nextui-org/react";
import L from 'leaflet';
import { Link } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import { useState, useEffect } from 'react';

// Use the environment variable for the base URL
const BASE_URL = import.meta.env.VITE_BASE_URL; 

// Function to encrypt the business_id
const encryptId = (id) => {
  const secretKey = import.meta.env.VITE_SECRET_KEY;
  if (!secretKey) {
    console.error('Secret key is not defined');
    return null;
  }
  const ciphertext = CryptoJS.AES.encrypt(id.toString(), secretKey).toString();
  return encodeURIComponent(ciphertext);
};

const MapSection = ({ businesses, initialCenter, currentZoom, setCurrentZoom }) => {
    // console.log(businesses);
  return (
    <div className="mt-8 z-10 bg-color1 rounded-lg shadow-md p-1 w-full bg-gradient-to-r from-color1 to-color2">
      <MapContainer center={initialCenter} zoom={currentZoom} className="w-full h-96 lg:h-[600px]">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapEvents setCurrentZoom={setCurrentZoom} />
        {businesses.map((business, index) => {
          const { pin_location } = business;
          if (pin_location) { // Adjust zoom level as needed
            const position = [pin_location.latitude, pin_location.longitude];
            const name = business.name || business.businessName;
            const logo = business.image || business.businessLogo || business.cardImage;
            const showName = currentZoom >= 13; // Set zoom level to show/hide logo
            const fontSize = currentZoom >= 12 ? '1rem' : '0.85rem';
            const customDivIcon = L.divIcon({
              className: 'custom-icon',
              html: `
                <div class="custom-popup flex items-center whitespace-nowrap font-bold text-color1" style="font-size: ${fontSize};">
                  ${
                    showName
                      ? `
                      <div class="pin-container">
                        <div class="pin-head">
                          <img src="${
                            logo ? `${BASE_URL}/${logo}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(name.charAt(0).toUpperCase())}`
                          }" alt="${name}" class="pin-logo" />
                        </div>
                        <div class="pin-point"></div>
                      </div><span>${name}</span>
                      `
                      : `
                      <div class="pin-container">
                        <div class="pin-head">
                          <img src="${
                            logo ? `${BASE_URL}/${logo}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(name.charAt(0).toUpperCase())}`
                          }" alt="${name}" class="pin-logo" />
                        </div>
                        <div class="pin-point"></div>
                      </div>
                      `
                  }
                </div>
              `,
              iconSize: [50, 70],
              iconAnchor: [25, 70],
            });            
            return (
                <Marker
                  key={`${index}`}
                  position={position}
                  icon={customDivIcon}
                  className="custom-marker-class"
                >
                    <Popup closeButton={false}>
                        <div className="popup-content relative bg-white rounded-lg py-4 sm:py-3 w-full sm:w-56 md:w-64">
                            <div className="flex flex-wrap gap-2 sm:gap-3">
                            {/* Image Section */}
                            <div className="w-full sm:w-auto flex-shrink-0">
                                <img 
                                src={logo ? `${BASE_URL}/${logo}` : `https://ui-avatars.com/api/?name=${name.charAt(0).toUpperCase()}`} 
                                alt={name} 
                                className="w-full sm:w-16 md:w-20 h-16 md:h-24 rounded-md object-cover border border-gray-200"
                                />
                            </div>
                            
                            {/* Details Section */}
                            <div className="flex-1 flex flex-col justify-between">
                                <h3 className="font-bold text-xs md:text-sm text-gray-800 mb-1 sm:mb-2 text-center sm:text-left">
                                {name}
                                </h3>
                                <div className="flex justify-center sm:justify-start">
                                <Link to={`/business/${encryptId(business.business_id)}`}>
                                    <Button className="w-full bg-color1 text-color3 text-xs py-1 rounded-md hover:bg-color2 transition">
                                    Visit Page
                                    </Button>
                                </Link>
                                </div>
                            </div>
                            </div>
                        </div>
                    </Popup>
                </Marker>
              );
          }
          return null;
        })}
      </MapContainer>
    </div>
  );
};

// Component to handle map events
const MapEvents = ({ setCurrentZoom }) => {
  useMapEvents({
    zoomend: (e) => {
      setCurrentZoom(e.target.getZoom());
    },
  });
  return null;
};

export default MapSection;
