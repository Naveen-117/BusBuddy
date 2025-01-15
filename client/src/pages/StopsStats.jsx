import React, { useEffect, useState } from "react";

const StopsStats = () => {
    const [stopStats, setStopStats] = useState([]);
    const [stopDetails, setStopDetails] = useState([]);

    useEffect(() => {
        const fetchStopsStats = async () => {
            try {
                const response = await fetch("http://localhost:3001/api/dashboard/stops-stats");
                const data = await response.json();
                setStopStats(data.stopStats);
                setStopDetails(data.stopDetails);
            } catch (error) {
                console.error("Error fetching stops statistics:", error);
            }
        };
        fetchStopsStats();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-green-600 mb-6">Stops Statistics</h1>
                <div className="overflow-x-auto bg-white shadow-md rounded-lg p-6">
                    <table className="table-auto w-full border-collapse border border-gray-200">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2">Stop ID</th>
                                <th className="border border-gray-300 px-4 py-2">Count</th>
                                <th className="border border-gray-300 px-4 py-2">Stop Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stopStats.map((stat, index) => (
                                <tr key={index}>
                                    <td className="border border-gray-300 px-4 py-2">{stat._id}</td>
                                    <td className="border border-gray-300 px-4 py-2">{stat.count}</td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        {stopDetails.find((detail) => detail.stop_id === stat._id)?.stop_name || "N/A"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StopsStats;
