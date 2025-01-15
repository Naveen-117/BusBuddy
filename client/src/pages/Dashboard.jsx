import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [summary, setSummary] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/dashboard/summary');
                const data = await response.json();
                setSummary(data);
            } catch (error) {
                console.error('Error fetching summary:', error);
            }
        };
        fetchSummary();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-blue-600 mb-6">Dashboard</h1>

                <div className="overflow-x-auto bg-white shadow-md rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Data Summary</h2>
                    <table className="table-auto w-full border-collapse border border-gray-200 text-left">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2">Model</th>
                                <th className="border border-gray-300 px-4 py-2">Total Count</th>
                                <th className="border border-gray-300 px-4 py-2">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {summary.map((item, index) => (
                                <tr key={index}>
                                    <td className="border border-gray-300 px-4 py-2 font-medium">
                                        {item.model}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">{item.count}</td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        {item.details?.map((detail, idx) => (
                                            <div key={idx} className="text-sm text-gray-700">
                                                {detail}
                                            </div>
                                        ))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                    <button
                        className="bg-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
                        onClick={() => navigate('/routes-stats')}
                    >
                        View Routes Statistics
                    </button>
                    <button
                        className="bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
                        onClick={() => navigate('/stops-stats')}
                    >
                        View Stops Statistics
                    </button>
                    <button
                        className="bg-red-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
                        onClick={() => navigate('/trips-stats')}
                    >
                        View Trips Statistics
                    </button>

                    {/* New Buttons */}
                    <button
                        className="bg-yellow-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75"
                        onClick={() => navigate('/graph')}
                    >
                        Time Visualization
                    </button>
                    <button
                        className="bg-purple-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75"
                        onClick={() => navigate('/statistics')}
                    >
                        Chart Visualization
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
