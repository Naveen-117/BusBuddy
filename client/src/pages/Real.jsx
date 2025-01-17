import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Real = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/vehicle-positions');
        setVehicles(response.data.vehicles || []);
        setLastUpdate(new Date().toLocaleTimeString());
        setError(null);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchVehicles();
    const interval = setInterval(fetchVehicles, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-xl font-semibold">Loading vehicle positions...</div>
    </div>
  );

  if (error) return (
    <div className="p-4 m-4 bg-red-100 border border-red-400 text-red-700 rounded">
      <h2 className="font-bold mb-2">Error Loading Data</h2>
      <p>{error}</p>
    </div>
  );

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Delhi Transit Vehicle Positions</h1>
        {lastUpdate && (
          <div className="text-sm text-gray-600">
            Last updated: {lastUpdate}
          </div>
        )}
      </div>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((vehicle, index) => (
          <div key={index} className="p-4 bg-white border rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-lg font-bold text-blue-600">{vehicle.vehicle_id}</h2>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                {vehicle.speed} km/h
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600">
                <span className="font-semibold">Trip:</span> {vehicle.trip_id}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Location:</span>
                <br />
                {vehicle.latitude.toFixed(4)}°N, {vehicle.longitude.toFixed(4)}°E
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Bearing:</span> {vehicle.bearing}°
              </p>
              <p className="text-gray-500 text-xs">
                {new Date(vehicle.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Real;