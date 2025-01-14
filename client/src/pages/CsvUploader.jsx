import React, { useState } from "react";
import axios from "axios";

const CsvUploader = () => {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [csvType, setCsvType] = useState("stops"); // Default type is 'stops'

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle CSV type change
  const handleCsvTypeChange = (e) => {
    setCsvType(e.target.value);
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      setUploadStatus("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadStatus("Uploading...");
      const response = await axios.post(
        `http://localhost:3001/${csvType}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setUploadStatus(response.data.message || "Upload successful!");
    } catch (error) {
      setUploadStatus("Upload failed. Please try again.");
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">
          Upload CSV to MongoDB
        </h2>

        <label htmlFor="csvType" className="block text-gray-700 mb-2">
          Select CSV Type:
        </label>
        <select
          id="csvType"
          onChange={handleCsvTypeChange}
          value={csvType}
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="stops">Stops</option>
          <option value="stop_times">Stop Times</option>
          <option value="fare_attributes">Fare Attributes</option>
          <option value="fare_rules">Fare Rules</option>
          <option value="routes">Routes</option>
          <option value="trips">Trips</option>
        </select>

        <label htmlFor="fileUpload" className="block text-gray-700 mb-2">
          Upload CSV File:
        </label>
        <input
          id="fileUpload"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleUpload}
          disabled={!file}
          className={`w-full px-4 py-2 text-white font-bold rounded-lg ${
            file
              ? "bg-blue-500 hover:bg-blue-600 focus:ring-4 focus:ring-blue-300"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Upload
        </button>

        {uploadStatus && (
          <p
            className={`mt-4 text-center font-semibold ${
              uploadStatus.includes("successful")
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {uploadStatus}
          </p>
        )}
      </div>
    </div>
  );
};

export default CsvUploader;
