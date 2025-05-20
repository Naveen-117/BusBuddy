import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from 'react-leaflet-cluster';
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import L from "leaflet";

// Fix for Leaflet default icon issues
delete L.Icon.Default.prototype._getIconUrl;

// Define a custom icon for the stops
const customIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

// Optimize cluster options
const clusterOptions = {
  chunkedLoading: true,
  maxClusterRadius: 100,
  spiderfyOnMaxZoom: false,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  disableClusteringAtZoom: 16,
  removeOutsideVisibleBounds: true
};

// Map Error Boundary component
class MapErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-500">
          <h2 className="text-lg font-semibold">Map Loading Error</h2>
          <p>Please try refreshing the page.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const GeospatialView = () => {
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState([28.614614, 76.978024]);
  const [mapZoom, setMapZoom] = useState(12);

  useEffect(() => {
    const fetchStops = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:3001/api/stops?limit=10000");
        if (!response.ok) {
          throw new Error("Failed to fetch stop data");
        }
        
        const data = await response.json();
        console.log("Fetched stops:", data.stops.length);
        
        // Process the stops data
        const validStops = data.stops.filter(stop => 
          stop && 
          typeof stop.stop_lat === 'number' && 
          typeof stop.stop_lon === 'number' &&
          !isNaN(stop.stop_lat) && 
          !isNaN(stop.stop_lon)
        );
        
        setStops(validStops);
        
        // Set map center to the first valid stop if available
        if (validStops.length > 0) {
          setMapCenter([validStops[0].stop_lat, validStops[0].stop_lon]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching stops:", error);
        setError("Failed to load stop data: " + error.message);
        setLoading(false);
      }
    };

    fetchStops();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-center text-2xl font-bold text-gray-800 mb-4">Transit Stops Map</h2>

      {loading && <p className="text-center text-blue-500 mb-2">Loading stops...</p>}
      {error && <p className="text-center text-red-500 mb-2">{error}</p>}

      <MapErrorBoundary>
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
          <MapContainer 
            center={mapCenter} 
            zoom={mapZoom} 
            className="h-[600px] w-full" 
            preferCanvas={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            
            <MarkerClusterGroup {...clusterOptions}>
              {stops.map((stop) => (
                <Marker 
                  key={stop._id || `${stop.stop_lat}-${stop.stop_lon}`}
                  position={[stop.stop_lat, stop.stop_lon]} 
                  icon={customIcon}
                >
                  <Popup>
                    <div className="font-semibold">{stop.stop_name || "Unnamed Stop"}</div>
                    {stop.route_long_name && (
                      <div>Route: {stop.route_long_name}</div>
                    )}
                    {stop.arrival_time && (
                      <div>Arrival: {stop.arrival_time}</div>
                    )}
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          </MapContainer>
        </div>
      </MapErrorBoundary>
    </div>
  );
};

export default GeospatialView;