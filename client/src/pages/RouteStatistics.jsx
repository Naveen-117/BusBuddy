// src/pages/RouteStatistics.jsx
import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import Spinner from '../components/Spinner';

const RouteStatistics = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Added the COLORS array that was referenced but not defined in the original code
  const COLORS = ['#4F46E5', '#60A5FA', '#34D399'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/stats/routes');
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        
        setChartData({
          agencies: data.routesByAgency,
          zones: data.stopsByZone
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-8"><Spinner size="xl" /></div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">Routes per Agency</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData.agencies}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="count"
                nameKey="_id"
              >
                {chartData.agencies.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">Stop Distribution</h2>
        <div className="space-y-4">
          {chartData.zones.map((zone, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm">{zone._id || 'Unknown Zone'}</span>
              <span className="font-medium">{zone.count.toLocaleString()} stops</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RouteStatistics;