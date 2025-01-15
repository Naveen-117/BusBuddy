// Import necessary libraries
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pie, Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

const StatisticsPage = () => {
    const [routeData, setRouteData] = useState({});
    const [stopData, setStopData] = useState({});
    const [tripData, setTripData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch average data from the backend
                const routesResponse = await axios.get('http://localhost:3001/api/statistics/routes');
                const stopsResponse = await axios.get('http://localhost:3001/api/statistics/stops');
                const tripsResponse = await axios.get('http://localhost:3001/api/statistics/trips');

                setRouteData(routesResponse.data);
                setStopData(stopsResponse.data);
                setTripData(tripsResponse.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching statistics:', error);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Agency Statistics Dashboard</h1>
            <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
                <div style={{ width: '45%' }}>
                    <h2>Routes Statistics</h2>
                    <Pie
                        data={{
                            labels: routeData.agencyNames,
                            datasets: [
                                {
                                    label: 'Number of Routes per Agency',
                                    data: routeData.routeCounts,
                                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
                                },
                            ],
                        }}
                    />
                </div>

                <div style={{ width: '45%' }}>
                    <h2>Stop Statistics</h2>
                    <Bar
                        data={{
                            labels: stopData.stopNames,
                            datasets: [
                                {
                                    label: 'Stop Frequencies',
                                    data: stopData.stopFrequencies,
                                    backgroundColor: '#36A2EB',
                                },
                            ],
                        }}
                        options={{
                            plugins: {
                                legend: { display: true },
                            },
                            responsive: true,
                        }}
                    />
                </div>
            </div>

            <div style={{ marginTop: '30px' }}>
                <h2>Trip Statistics</h2>
                <Bar
                    data={{
                        labels: tripData.routeNames,
                        datasets: [
                            {
                                label: 'Trips per Route',
                                data: tripData.tripCounts,
                                backgroundColor: '#FF6384',
                            },
                        ],
                    }}
                    options={{
                        plugins: {
                            legend: { display: true },
                        },
                        responsive: true,
                    }}
                />
            </div>

            <div style={{ marginTop: '50px', textAlign: 'center' }}>
                <p>Click on charts to explore more detailed statistics</p>
            </div>
        </div>
    );
};

export default StatisticsPage;
