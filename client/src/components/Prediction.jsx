import React, { useState, useEffect } from "react";
import axios from "axios";

const Prediction = () => {
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get("http://127.0.0.1:8000/predict_realtime/")
            .then((response) => {
                console.log("API Response:", response.data);  // Debugging log
                if (Array.isArray(response.data)) {
                    setPredictions(response.data);
                } else {
                    console.error("Unexpected API response:", response.data);
                    setError("Invalid data format from server");
                }
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching predictions:", error);
                setError("Failed to load data");
                setLoading(false);
            });
    }, []);

    if (loading) return <p className="text-center text-gray-600">Loading...</p>;
    if (error) return <p className="text-center text-red-600">{error}</p>;

    const predictedDemands = predictions.map(row => row["Predicted Demand"]);
    const minDemand = Math.min(...predictedDemands);
    const maxDemand = Math.max(...predictedDemands);

    return (
        <div className="max-w-7xl mx-auto p-6">
            <h2 className="text-2xl font-semibold mb-4 text-center">🚌 Predicted Passenger Demand</h2>
            {predictions.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300 shadow-lg rounded-lg">
                        <thead className="bg-gray-800 text-white">
                            <tr>
                                <th className="px-4 py-2 border">Route ID</th>
                                <th className="px-4 py-2 border">Predicted Demand</th>
                                <th className="px-4 py-2 border">Vehicle ID</th>
                                <th className="px-4 py-2 border">Latitude</th>
                                <th className="px-4 py-2 border">Longitude</th>
                                <th className="px-4 py-2 border">Last Updated</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {predictions.map((row, index) => (
                                <tr key={index} className="text-center border-b hover:bg-gray-100">
                                    <td className="px-4 py-2">{row["Route ID"]}</td>
                                    <td className="px-4 py-2">{row["Predicted Demand"]}</td>
                                    <td className="px-4 py-2">{row["Vehicle ID"]}</td>
                                    <td className="px-4 py-2">{row["Latitude"].toFixed(6)}</td>
                                    <td className="px-4 py-2">{row["Longitude"].toFixed(6)}</td>
                                    <td className="px-4 py-2">{row["Last Updated"]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="mt-4 text-center font-semibold">
                        <p>Predicted Demand Range: {minDemand} - {maxDemand}</p>
                    </div>
                </div>
            ) : (
                <p className="text-center text-gray-500">No prediction data available.</p>
            )}
        </div>
    );
};

export default Prediction;
