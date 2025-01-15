import React, { useEffect, useState } from "react";

const TripsStats = () => {
    const [tripStats, setTripStats] = useState([]);

    useEffect(() => {
        const fetchTripsStats = async () => {
            try {
                const response = await fetch("http://localhost:3001/api/dashboard/trips-stats");
                const data = await response.json();
                setTripStats(data);
            } catch (error) {
                console.error("Error fetching trips statistics:", error);
            }
        };
        fetchTripsStats();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-red-600 mb-6">Trips Statistics</h1>
                <div className="overflow-x-auto bg-white shadow-md rounded-lg p-6">
                    <table className="table-auto w-full border-collapse border border-gray-200">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2">Route ID</th>
                                <th className="border border-gray-300 px-4 py-2">Trip Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tripStats.map((stat, index) => (
                                <tr key={index}>
                                    <td className="border border-gray-300 px-4 py-2">{stat._id}</td>
                                    <td className="border border-gray-300 px-4 py-2">{stat.count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TripsStats;
