import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from 'chart.js';

// Register required Chart.js components
ChartJS.register(Title, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

// Utility function to convert minutes to hh:mm format
const formatTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

const Statistics = () => {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/graph')
      .then((response) => response.json())
      .then((data) => {
        console.log(data); // Debugging: log the data received from the backend
        if (Array.isArray(data)) {
          setSummary(data);
        } else {
          console.error('Invalid data format', data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  // Ensure summary is an array before mapping
  if (!Array.isArray(summary)) {
    return <p>Error: Invalid data format received from the backend.</p>;
  }

  // Prepare data for the chart
  const chartData = {
    labels: summary.map((item) => `Stop ${item._id}`),
    datasets: [
      {
        label: 'Number of Trips',
        data: summary.map((item) => item.tripCount),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: false,
        yAxisID: 'y1', // Use y1 for the primary y-axis
      },
      {
        label: 'Average Arrival Time (hh:mm)',
        data: summary.map((item) => item.avgArrivalTime),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: false,
        yAxisID: 'y2', // Use y2 for the secondary y-axis
      },
      {
        label: 'Average Departure Time (hh:mm)',
        data: summary.map((item) => item.avgDepartureTime),
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        fill: false,
        yAxisID: 'y2',
      },
    ],
  };

  const chartOptions = {
    scales: {
      y1: {
        type: 'linear',
        position: 'left',
        title: { display: true, text: 'Number of Trips' },
      },
      y2: {
        type: 'linear',
        position: 'right',
        title: { display: true, text: 'Time (hh:mm)' },
        ticks: {
          callback: (value) => formatTime(value), // Format y-axis ticks
        },
        grid: {
          drawOnChartArea: false, // Prevents grid lines from appearing over the chart
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            if (context.dataset.label.includes('Time')) {
              return `${context.dataset.label}: ${formatTime(context.raw)}`;
            }
            return `${context.dataset.label}: ${context.raw}`;
          },
        },
      },
    },
  };

  return (
    <div>
      <h2>Stop Times Summary</h2>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default Statistics;
