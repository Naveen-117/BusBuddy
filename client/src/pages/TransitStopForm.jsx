import React, { useState } from 'react';
import axios from 'axios';

const TransitStopForm = () => {
  const [formData, setFormData] = useState({
    route_id: '',
    trip_id: '',
    agency_id: '',
    route_long_name: '',
    arrival_time: '',
    stop_id: '',
    stop_sequence: '',
    stop_code: '',
    stop_lat: '',
    stop_lon: '',
    stop_name: '',
    zone: '',
    distance_to_next_stop: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (data) => {
    // Check if all required fields are present and not empty
    const requiredFields = Object.keys(data);
    for (const field of requiredFields) {
      if (!data[field] && data[field] !== 0) {
        throw new Error(`${field.replace('_', ' ')} is required`);
      }
    }
  };

  const parseFormData = (data) => {
    try {
      return {
        route_id: data.route_id ? parseInt(data.route_id) : null,
        trip_id: data.trip_id,
        agency_id: data.agency_id,
        route_long_name: data.route_long_name,
        arrival_time: data.arrival_time,
        stop_id: data.stop_id ? parseInt(data.stop_id) : null,
        stop_sequence: data.stop_sequence ? parseInt(data.stop_sequence) : null,
        stop_code: data.stop_code,
        stop_lat: data.stop_lat ? parseFloat(data.stop_lat) : null,
        stop_lon: data.stop_lon ? parseFloat(data.stop_lon) : null,
        stop_name: data.stop_name,
        zone: data.zone,
        distance_to_next_stop: data.distance_to_next_stop ? parseFloat(data.distance_to_next_stop) : null
      };
    } catch (error) {
      throw new Error('Error parsing form data: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    
    try {
      // Validate form data
      validateForm(formData);
      
      // Parse form data
      const formattedData = parseFormData(formData);
    
      // Make API request
      const response = await axios.post('http://localhost:3001/api/transit-stops', formattedData);
      
      if (response.status === 201) {
        setSubmitMessage('Transit stop data saved successfully!');
        // Reset form
        setFormData({
          route_id: '',
          trip_id: '',
          agency_id: '',
          route_long_name: '',
          arrival_time: '',
          stop_id: '',
          stop_sequence: '',
          stop_code: '',
          stop_lat: '',
          stop_lon: '',
          stop_name: '',
          zone: '',
          distance_to_next_stop: ''
        });
      }
    } catch (error) {
      let errorMessage = 'Error saving transit stop data: ';
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Unknown error occurred';
      }
      setSubmitMessage(errorMessage);
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-teal-700 px-6 py-4">
          <h2 className="text-2xl font-bold text-white">Transit Stop Information</h2>
        </div>
        
        {submitMessage && (
          <div className={`p-4 ${submitMessage.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {submitMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="route_id" className="block text-sm font-medium text-gray-700">
                Route ID
              </label>
              <input
                id="route_id"
                name="route_id"
                type="number"
                required
                value={formData.route_id}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
                placeholder="Enter route ID"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="trip_id" className="block text-sm font-medium text-gray-700">
                Trip ID
              </label>
              <input
                id="trip_id"
                name="trip_id"
                type="text"
                required
                value={formData.trip_id}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
                placeholder="Enter trip ID"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="agency_id" className="block text-sm font-medium text-gray-700">
                Agency ID
              </label>
              <input
                id="agency_id"
                name="agency_id"
                type="text"
                required
                value={formData.agency_id}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
                placeholder="Enter agency ID"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="route_long_name" className="block text-sm font-medium text-gray-700">
                Route Long Name
              </label>
              <input
                id="route_long_name"
                name="route_long_name"
                type="text"
                required
                value={formData.route_long_name}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
                placeholder="Enter route long name"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="arrival_time" className="block text-sm font-medium text-gray-700">
                Arrival Time
              </label>
              <input
                id="arrival_time"
                name="arrival_time"
                type="time"
                required
                value={formData.arrival_time}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="stop_id" className="block text-sm font-medium text-gray-700">
                Stop ID
              </label>
              <input
                id="stop_id"
                name="stop_id"
                type="number"
                required
                value={formData.stop_id}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
                placeholder="Enter stop ID"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="stop_sequence" className="block text-sm font-medium text-gray-700">
                Stop Sequence
              </label>
              <input
                id="stop_sequence"
                name="stop_sequence"
                type="number"
                required
                value={formData.stop_sequence}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
                placeholder="Enter stop sequence"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="stop_code" className="block text-sm font-medium text-gray-700">
                Stop Code
              </label>
              <input
                id="stop_code"
                name="stop_code"
                type="text"
                required
                value={formData.stop_code}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
                placeholder="Enter stop code"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="stop_lat" className="block text-sm font-medium text-gray-700">
                Stop Latitude
              </label>
              <input
                id="stop_lat"
                name="stop_lat"
                type="number"
                step="any"
                required
                value={formData.stop_lat}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
                placeholder="Enter latitude"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="stop_lon" className="block text-sm font-medium text-gray-700">
                Stop Longitude
              </label>
              <input
                id="stop_lon"
                name="stop_lon"
                type="number"
                step="any"
                required
                value={formData.stop_lon}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
                placeholder="Enter longitude"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="stop_name" className="block text-sm font-medium text-gray-700">
                Stop Name
              </label>
              <input
                id="stop_name"
                name="stop_name"
                type="text"
                required
                value={formData.stop_name}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
                placeholder="Enter stop name"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="zone" className="block text-sm font-medium text-gray-700">
                Zone
              </label>
              <input
                id="zone"
                name="zone"
                type="text"
                required
                value={formData.zone}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
                placeholder="Enter zone"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="distance_to_next_stop" className="block text-sm font-medium text-gray-700">
                Distance to Next Stop
              </label>
              <input
                id="distance_to_next_stop"
                name="distance_to_next_stop"
                type="number"
                step="any"
                required
                value={formData.distance_to_next_stop}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
                placeholder="Enter distance"
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-teal-700 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Saving...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransitStopForm;