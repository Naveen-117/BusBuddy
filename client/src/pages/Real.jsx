import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Define the base URL for the API
const API_BASE_URL = 'http://localhost:3001';

function Real() {
  const [vehiclePositions, setVehiclePositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`${API_BASE_URL}/api/vehicle-positions`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        console.log('Raw response data:', response.data);

        // Check if response.data exists and is an array
        if (response.data && Array.isArray(response.data)) {
          setVehiclePositions(response.data);
        } else {
          throw new Error('Invalid data format received');
        }
      } catch (error) {
        console.error('Error fetching vehicle positions:', error);
        setError(error.message || 'Failed to fetch vehicle positions');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Set up polling every 30 seconds
    const intervalId = setInterval(fetchData, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Vehicle Positions</h1>
        <p>Loading vehicle positions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Vehicle Positions</h1>
        <p className="text-red-600">Error: {error}</p>
        <p>Please try refreshing the page</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Vehicle Positions</h1>
      {vehiclePositions.length === 0 ? (
        <p>No vehicle positions available</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">Entity ID</th>
                <th className="px-4 py-2 border">Vehicle ID</th>
                <th className="px-4 py-2 border">Trip ID</th>
                <th className="px-4 py-2 border">Route ID</th>
                <th className="px-4 py-2 border">Start Time</th>
                <th className="px-4 py-2 border">Start Date</th>
                <th className="px-4 py-2 border">Schedule Relationship</th>
                <th className="px-4 py-2 border">Latitude</th>
                <th className="px-4 py-2 border">Longitude</th>
                <th className="px-4 py-2 border">Speed</th>
                <th className="px-4 py-2 border">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {vehiclePositions.map((position, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{position.entity_id}</td>
                  <td className="px-4 py-2 border">{position.vehicle_id}</td>
                  <td className="px-4 py-2 border">{position.trip_id}</td>
                  <td className="px-4 py-2 border">{position.route_id}</td>
                  <td className="px-4 py-2 border">{position.start_time}</td>
                  <td className="px-4 py-2 border">{position.start_date}</td>
                  <td className="px-4 py-2 border">{position.schedule_relationship}</td>
                  <td className="px-4 py-2 border">{position.latitude}</td>
                  <td className="px-4 py-2 border">{position.longitude}</td>
                  <td className="px-4 py-2 border">{position.speed}</td>
                  <td className="px-4 py-2 border">{position.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Real;