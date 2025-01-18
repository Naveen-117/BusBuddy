// src/components/DownloadComponent.js

import React from 'react';
import axios from 'axios';

const DownloadComponent = () => {
  const handleDownload = async () => {
    try {
      // Trigger the backend endpoint to fetch and upload the .pb file
      await axios.post('http://localhost:3001/upload-pb');
      alert('File downloaded and sent to backend successfully!');
    } catch (error) {
      console.error('Error downloading the file', error);
    }
  };

  return (
    <div>
      <button onClick={handleDownload}>Download and Upload .pb File</button>
    </div>
  );
};

export default DownloadComponent;
