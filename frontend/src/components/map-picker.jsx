import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix marker icon issues with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const LocationMarker = ({ setLatLng, setLatitude, setLongitude }) => {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition(e.latlng);
      setLatLng(e.latlng);
      setLatitude(lat);
      setLongitude(lng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
};

const MapPicker = ({ setLatitude, setLongitude }) => {
  const [latLng, setLatLng] = useState({ lat: null, lng: null });

  return (
    <div>
      <h2>Select a Location</h2>
      <MapContainer
        center={[13, 124]}
        zoom={11}
        style={{ height: '400px', width: '100%' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationMarker setLatLng={setLatLng} setLatitude={setLatitude} setLongitude={setLongitude} />
      </MapContainer>
    </div>
  );
};

export default MapPicker;
