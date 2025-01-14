import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';


const Passenger = () => {
  const [points, setPoints] = useState([]);
  const [isAddingRoute, setIsAddingRoute] = useState(false);
  const [connected, setConnected] = useState(false);

  const handleAddRoute = () => {
    setIsAddingRoute(true);
    setConnected(false);
    setPoints([]);
  };

  const handleConnect = () => {
    setConnected(true);
    setIsAddingRoute(false);
  };

  const fetchLocationName = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      return data.display_name || `Unknown Location (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
    } catch (error) {
      console.error("Error fetching location name:", error);
      return `Unknown Location (${lat.toFixed(3)}, ${lng.toFixed(3)})`;
    }
  };

  const MapClickHandler = () => {
    useMapEvents({
      click: async (e) => {
        if (isAddingRoute) {
          const { lat, lng } = e.latlng;
          const locationName = await fetchLocationName(lat, lng);
          const newPoint = { lat, lng, name: locationName };
          setPoints([...points, newPoint]);
        }
      },
    });
    return null;
  };

  return (
    <div className="flex h-screen">
      {/* Side Menu */}
      <div className="w-1/4 bg-gray-100 p-4 overflow-auto">
        <h2 className="text-xl font-bold mb-4">Added Points</h2>
        {points.map((point, index) => (
          <p key={index} className="mb-2">{`Point ${index + 1}: ${point.name}`}</p>
        ))}
      </div>

      {/* Main Map Area */}
      <div className="w-3/4 flex flex-col">
        <nav className="bg-blue-500 text-white px-4 py-2 flex justify-between">
          <button className="bg-white text-blue-500 px-4 py-2 rounded shadow" onClick={handleAddRoute}>Add Route</button>
          <button className="bg-white text-blue-500 px-4 py-2 rounded shadow" onClick={handleConnect}>Connect</button>
        </nav>

        <div className="flex-grow">
          <MapContainer center={[28.6139, 77.2090]} zoom={13} className="w-full h-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapClickHandler />

            {points.map((point, index) => (
              <Marker key={index} position={[point.lat, point.lng]} />
            ))}

            {connected && points.length > 1 && (
              <Polyline positions={points.map((point) => [point.lat, point.lng])} color="blue" />
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default Passenger;
