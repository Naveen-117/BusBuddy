import React, { useState, useEffect } from "react";

const Overview = () => {
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [totalTrips, setTotalTrips] = useState(0);
  const [totalAgencies, setTotalAgencies] = useState(0);
  const [vehiclePositions, setVehiclePositions] = useState([]);

  useEffect(() => {
    const backendUrl = "http://localhost:3001";

    fetch(`${backendUrl}/api/routes`)
      .then((res) => res.json())
      .then((data) => setRoutes(data || []))
      .catch(() => setRoutes([]));

      fetch(`${backendUrl}/api/stops`)
      .then((res) => res.json())
      .then((data) => setStops(data.stops || []));

    fetch(`${backendUrl}/api/trips`)
      .then((res) => res.json())
      .then((data) => setTotalTrips(data ? data.length : 0))
      .catch(() => setTotalTrips(0));

    fetch(`${backendUrl}/api/agencies`)
      .then((res) => res.json())
      .then((data) => setTotalAgencies(data ? data.length : 0))
      .catch(() => setTotalAgencies(0));
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800">Transit Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="bg-white p-4 shadow rounded-lg">
          <h2 className="text-xl font-semibold">Total Routes</h2>
          <p className="text-gray-700">{(routes.length || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 shadow rounded-lg">
          <h2 className="text-xl font-semibold">Total Stops</h2>
          <p className="text-gray-700">{(stops.length || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 shadow rounded-lg">
          <h2 className="text-xl font-semibold">Total Trips</h2>
          <p className="text-gray-700">{(totalTrips || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 shadow rounded-lg">
          <h2 className="text-xl font-semibold">Total Agencies</h2>
          <p className="text-gray-700">{(totalAgencies || 0).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default Overview;
