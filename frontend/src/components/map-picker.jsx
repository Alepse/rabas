import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix marker icon issues with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Component to handle user interaction for setting a marker by clicking on the map
const LocationMarker = ({ setLatLng, setLatitude, setLongitude, position }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setLatLng({ lat, lng });
      setLatitude(lat);
      setLongitude(lng);
    },
  });

  return position ? <Marker position={position} /> : null;
};

// Main MapPicker component
const MapPicker = ({ setLatitude, setLongitude }) => {
  const [latLng, setLatLng] = useState(null);

  // Function to get the user's geolocation
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      const geoOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      };

      const geoSuccess = (position) => {
        const { latitude, longitude } = position.coords;
        const newLatLng = { lat: latitude, lng: longitude };
        setLatLng(newLatLng);
        setLatitude(latitude);
        setLongitude(longitude);
      };

      const geoError = (error) => {
        console.error('Error getting location: ', error);
      };

      navigator.geolocation.getCurrentPosition(geoSuccess, geoError, geoOptions);
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const MapAutoCenter = () => {
    const map = useMap();
    useEffect(() => {
      if (latLng) {
        map.setView([latLng.lat, latLng.lng], map.getZoom());
      }
    }, [latLng, map]);

    return null;
  };

  return (
    <div style={{ position: 'relative' }}>
      <MapContainer
        center={latLng || [13, 124]} // Default map center without a marker
        zoom={11}
        style={{ height: '400px', width: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapAutoCenter />
        <LocationMarker
          setLatLng={setLatLng}
          setLatitude={setLatitude}
          setLongitude={setLongitude}
          position={latLng}
        />
      </MapContainer>
      {/* Button Overlayed at Bottom Center of the Map */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000
      }}>
        <button
          className='bg-color1 hover:bg-color2'
          onClick={handleGetLocation}
          style={{
            padding: '10px 20px',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Get My Location
        </button>
      </div>
    </div>
  );
};

export default MapPicker;
