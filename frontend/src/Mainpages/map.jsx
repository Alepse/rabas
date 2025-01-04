import React, { useState } from 'react';
import MapPicker from '../components/mapsection.jsx'; // Adjust the path as per your project structure

function App() {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [name, setName] = useState(''); // Add state for location name

  return (
    <div>

      {/* Other content of your website */}

      <div>
        <h2>Map Picker Section</h2>
        
        {/* Pass setName along with setLatitude and setLongitude */}
        <MapPicker setLatitude={setLatitude} setLongitude={setLongitude} setName={setName} />
        
        <p>Selected Location Name: {name}</p>
        <p>Selected Latitude: {latitude}</p>
        <p>Selected Longitude: {longitude}</p>
      </div>
    </div>
  );
}

export default App;
