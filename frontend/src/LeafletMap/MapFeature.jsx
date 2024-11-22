import React, { useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
// import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';
// import 'leaflet-routing-machine';

// Define the MapComponent within the same file
const MapComponent = ({ currentLocation, destination, setCurrentLocation, setDestination }) => {
  const mapRef = useRef();
  const [userLocation, setUserLocation] = useState(null);

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 2000,
      };

      navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const map = mapRef.current;
          if (map) {
            map.setView([latitude, longitude], 13);
            setUserLocation({ lat: latitude, lng: longitude });
            setCurrentLocation({ lat: latitude, lng: longitude });
          }
        },
        (error) => {
          if (error.code === 1) {
            alert("Please allow geolocation access");
          } else {
            alert("Cannot get current location");
          }
        },
        options
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setCurrentLocation(e.latlng);
      },
    });
    return currentLocation ? (
      <Marker position={currentLocation}>
        <Popup>Your pinned location</Popup>
      </Marker>
    ) : null;
  };

  const DestinationMarker = () => {
    useMapEvents({
      click(e) {
        setDestination(e.latlng);
      },
    });
    return destination ? (
      <Marker position={destination}>
        <Popup>Your destination</Popup>
      </Marker>
    ) : null;
  };

  return (
    <div>
      <button onClick={handleLocateMe} style={{ marginBottom: '10px' }}>
        Go to My Current Location
      </button>
      <MapContainer
        center={currentLocation || [51.505, -0.09]} // Default to London if location is not available
        zoom={13}
        style={{ height: '400px', width: '100%' }}
        whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {userLocation && (
          <Marker position={userLocation}>
            <Popup>You are here</Popup>
          </Marker>
        )}
        <LocationMarker />
        <DestinationMarker />
      </MapContainer>
    </div>
  );
};

// Use the MapComponent in your MapFeature component
const MapFeature = ({ currentLocation, destination, setCurrentLocation, setDestination }) => {
  return (
    <div>
      <h2>Map Feature</h2>
      <MapComponent
        currentLocation={currentLocation}
        destination={destination}
        setCurrentLocation={setCurrentLocation}
        setDestination={setDestination}
      />
    </div>
  );
};

export default MapFeature;
