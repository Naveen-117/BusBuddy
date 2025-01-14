import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

const BusMap = () => {
  const [buses, setBuses] = useState([]);

  useEffect(() => {
    const fetchBusData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/buses'); // Backend route
        console.log(response.data);
        setBuses(response.data);
      } catch (error) {
        console.error('Error fetching bus data:', error.message);
      }
    };

    fetchBusData();
    const interval = setInterval(fetchBusData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <MapContainer
      center={[28.6139, 77.2090]} // Centered at Delhi
      zoom={12}
      style={{ height: '500px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {buses.map((bus, index) => (
        <Marker key={index} position={[bus.latitude, bus.longitude]}>
          <Popup>
            <strong>Bus Number:</strong> {bus.busNumber} <br />
            <strong>Route:</strong> {bus.route}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default BusMap;
