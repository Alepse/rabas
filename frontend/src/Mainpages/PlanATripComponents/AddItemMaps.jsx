import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import { Button } from "@nextui-org/react";
import L from 'leaflet';
import { Link } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import { useState, useEffect } from 'react';
import * as turf from '@turf/turf';

const BASE_URL = import.meta.env.VITE_BASE_URL;

const encryptId = (id) => {
  const secretKey = import.meta.env.VITE_SECRET_KEY;
  if (!secretKey) {
    console.error('Secret key is not defined');
    return null;
  }
  const ciphertext = CryptoJS.AES.encrypt(id.toString(), secretKey).toString();
  return encodeURIComponent(ciphertext);
};

const MapSection = ({ businesses, initialCenter, currentZoom, setCurrentZoom, handleAddItemClick }) => {
  const [lines, setLines] = useState([]);
  const [distances, setDistances] = useState([]);

  useEffect(() => {
    const businessLocations = businesses.map(business => {
      const { pin_location } = business;
      if (pin_location) {
        return [pin_location.longitude, pin_location.latitude]; // Note: Turf uses [lng, lat]
      }
      return null;
    }).filter(location => location !== null);

    const lineSegments = [];
    const calculatedDistances = [];
    for (let i = 0; i < businessLocations.length - 1; i++) {
      const start = businessLocations[i];
      const end = businessLocations[i + 1];
      lineSegments.push([start, end]);

      const startPoint = turf.point(start);
      const endPoint = turf.point(end);
      const distance = turf.distance(startPoint, endPoint, { units: 'kilometers' });
      calculatedDistances.push(distance.toFixed(2)); // Round to 2 decimal places
    }

    setLines(lineSegments);
    setDistances(calculatedDistances);
  }, [businesses]);

  return (
    <div className="z-10 bg-color1 rounded-lg shadow-md p-1 w-full bg-gradient-to-r from-color1 to-color2">
      <MapContainer center={initialCenter} zoom={currentZoom} style={{ zIndex: 0 }}  className="w-full h-96 lg:h-[600px] z-0">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapEvents setCurrentZoom={setCurrentZoom} />
{/* 
        {lines.map((line, index) => (
          <Polyline key={index} positions={line.map(([lng, lat]) => [lat, lng])} color="blue">
            <Popup>
              <span>{`Distance: ${distances[index]} km`}</span>
            </Popup>
          </Polyline>
        ))} */}

        {businesses.map((business, index) => {
          const { pin_location } = business;
          if (pin_location) {
            const position = [pin_location.latitude, pin_location.longitude];
            const name = business.name || business.businessName;
            const logo = business.image || business.businessLogo || business.cardImage;
            const showName = currentZoom >= 13;
            const fontSize = currentZoom >= 12 ? '1rem' : '0.85rem';
            const customDivIcon = L.divIcon({
              className: 'custom-icon',
              html: `
                <div class="custom-popup flex items-center whitespace-nowrap font-bold text-color1" style="font-size: ${fontSize};">
                  <div class="pin-container">
                    <div class="pin-head">
                      <img src="${
                        logo ? `${BASE_URL}/${logo}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(name.charAt(0).toUpperCase())}`
                      }" alt="${name}" class="pin-logo" />
                    </div>
                    <div class="pin-point"></div>
                  </div>
                  ${showName ? `<span>${name}</span>` : ''}
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
                    <div className="flex flex-wrap gap-2 sm:gap-2">
                      <div className="w-full sm:w-auto flex-shrink-0">
                        <img 
                          src={logo ? `${BASE_URL}/${logo}` : `https://ui-avatars.com/api/?name=${name.charAt(0).toUpperCase()}`} 
                          alt={name} 
                          className="w-full sm:w-16 md:w-20 h-full md:h-full rounded-md object-cover border border-gray-200"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <h3 className="font-bold text-xs md:text-sm text-gray-800 mb-1 sm:mb-1 text-center sm:text-left">
                          {name}
                        </h3>
                        <p className="font-bold text-xs text-gray-500">
                            {business?.destination || "Location"} | {business?.businessType || "Business Category"}
                        </p>
                        <div className="flex flex-col justify-center sm:justify-start gap-2">
                          <Link to={`/business/${encryptId(business.business_id)}`}>
                            <Button className="w-full bg-color1 text-color3 text-xs py-1 rounded-md hover:bg-color2 transition">
                              Visit Page
                            </Button>
                          </Link>
                          <Button 
                            onClick={() => handleAddItemClick(business)}
                            className="w-full bg-color1 text-color3 text-xs py-1 rounded-md hover:bg-color2 transition"
                          >
                              Add
                          </Button>
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

const MapEvents = ({ setCurrentZoom }) => {
  useMapEvents({
    zoomend: (e) => {
      setCurrentZoom(e.target.getZoom());
    },
  });
  return null;
};

export default MapSection;
