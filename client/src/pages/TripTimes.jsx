// src/pages/TripTimes.jsx
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Spinner from '../components/Spinner';

const formatHour = (hour) => {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour} ${period}`;
};

const TripTimes = () => {
  const [timeData, setTimeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTimeData = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/stats/times');
        if (!response.ok) throw new Error('Failed to fetch time data');
        const data = await response.json();
        
        const formattedData = data.map(item => ({
          hour: formatHour(item._id),
          trips: item.count
        }));
        
        setTimeData(formattedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTimeData();
  }, []);

  if (loading) return <div className="text-center py-8"><Spinner size="xl" /></div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold mb-4">Arrival Time Distribution</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={timeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="trips" 
              stroke="#4F46E5" 
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TripTimes;