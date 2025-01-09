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

const MapSection = ({ itinerary, currentZoom, setCurrentZoom }) => {

    let destinationOrder = 0;
    const handleShowDirection = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;

          // Collect all pin locations (destinations)
          const destinations = [];
          Object.keys(itinerary || {}).forEach(date => {
            itinerary[date].forEach(item => {
              const { pin_location } = item;
              if (pin_location) {
                destinations.push(`${pin_location.latitude},${pin_location.longitude}`);
              }
            });
          });

          // Prepare the directions URL for Google Maps with multiple destinations
          const origin = `${userLat},${userLng}`;
          const route = [origin, ...destinations].join('/'); // Join the origin and destinations with "/"
          
          const directionsUrl = `https://www.google.com/maps/dir/${route}/@${userLat},${userLng},11z/data=!3e9`;

          // Open the directions URL in a new tab
          window.open(directionsUrl, '_blank');
        },
        (error) => {
          alert("Error getting current location: " + error.message);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const getOrdinalSuffix = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  return (
    <div className="z-10 bg-color1 rounded-lg shadow-md p-1 w-full bg-gradient-to-r from-color1 to-color2">
      <MapContainer center={[12.9738, 123.9807]} zoom={10} className="w-full h-96">
        <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapEvents setCurrentZoom={setCurrentZoom} />
        {Object.keys(itinerary || {}).map((date) => {
            const stops = [...(itinerary[date] || [])]; // Clone the array to avoid mutation

            // Sort stops by time
            stops.sort((a, b) => {
                if (!a.time) return 1; // Items without time come last
                if (!b.time) return -1;
                const [hourA, minuteA] = a.time.split(':').map(Number);
                const [hourB, minuteB] = b.time.split(':').map(Number);
                return hourA * 60 + minuteA - (hourB * 60 + minuteB); // Compare in minutes
            });

            return stops.map((item, index) => {
                const { pin_location, title, imageUrl, id } = item;

                if (pin_location) {
                    destinationOrder += 1; // Count the destinations
                    const position = [pin_location.latitude, pin_location.longitude];
                    const locationName = title;
                    const showName = currentZoom >= 10;
                    const fontSize = currentZoom >= 12 ? '1rem' : '0.85rem';

                    const customDivIcon = L.divIcon({
                        className: 'custom-icon',
                        html: `
                            <div class="custom-popup flex items-center whitespace-nowrap font-bold text-color1" style="font-size: ${fontSize};">
                            ${showName ? `
                                <div class="pin-container">
                                <div class="pin-head">
                                    <img src="${BASE_URL}/${imageUrl}" alt="${title}" class="pin-logo" />
                                </div>
                                <div class="pin-point"></div>
                                </div><span>${locationName}</span>
                            ` : `<div class="pin-container">
                                <div class="pin-head">
                                    <img src="${BASE_URL}/${imageUrl}" alt="${title}" class="pin-logo" />
                                </div>
                                <div class="pin-point"></div>`}
                            </div>
                        `,
                        iconSize: [50, 70],
                        iconAnchor: [25, 70],
                    });

                    return (
                        <Marker
                            key={`${date}-${index}`}
                            position={position}
                            icon={customDivIcon}
                            className="custom-marker-class"
                        >
                            <Popup closeButton={false}>
                                <div className="popup-content relative bg-white rounded-lg py-4 w-full sm:w-64 md:w-72 max-w-xs">
                                    <span className="absolute top-2 left-2 text-white text-sm font-bold bg-color2 -translate-x-[45px] -translate-y-[15px] rounded-full px-3 py-1 z-10">
                                        {`${destinationOrder}${getOrdinalSuffix(destinationOrder)}`}
                                    </span>
                                    <div className="mb-2 text-gray-500 text-xs text-center sm:text-left">{date}</div>
                                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                                        <div className="flex-shrink-0">
                                            <img
                                                src={`${BASE_URL}/${imageUrl}`}
                                                alt={title}
                                                className="w-32 max-h-32 md:max-h-40 rounded-md object-cover border border-gray-200"
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between items-center sm:items-start text-center sm:text-left">
                                            <h3 className="font-bold text-sm md:text-base text-gray-800 mb-2">{title}</h3>
                                            <Link to={`/business/${encryptId(id)}`}>
                                                <Button className="w-full bg-color1 text-color3 text-xs md:text-sm py-2 rounded-md hover:bg-color2 transition">
                                                    Visit page
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                }
                return null;
            });
        })}

        {/* Button to show directions for all pins */}
        <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
        }}>
            <button
            className="bg-color1 hover:bg-color2"
            onClick={handleShowDirection}
            style={{
                padding: '10px 20px',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px',
            }}
            >
            Show direction
            </button>
        </div>
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
