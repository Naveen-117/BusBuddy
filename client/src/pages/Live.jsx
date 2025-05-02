import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

// Custom hook for fetching real-time vehicle positions
// In Live.jsx
const useVehiclePositions = (selectedRoute) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchVehiclePositions = useCallback(async () => {
    if (!selectedRoute) {
      setVehicles([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/vehicle-positions');
      
      // Filter vehicles for the selected route
      const filteredVehicles = response.data.filter(vehicle => 
        vehicle.route_id === selectedRoute
      );
      
      setVehicles(filteredVehicles);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching vehicle positions:', err);
      setError('Failed to load vehicle positions');
    } finally {
      setLoading(false);
    }
  }, [selectedRoute]);

  // Fetch vehicle positions initially and set up interval for updates
  useEffect(() => {
    fetchVehiclePositions();
    
    // Set up polling interval (every 5 seconds)
    const intervalId = setInterval(fetchVehiclePositions, 1000);
    
    // Clean up interval on unmount or when selectedRoute changes
    return () => clearInterval(intervalId);
  }, [fetchVehiclePositions, selectedRoute]);

  return { vehicles, loading, error, lastUpdated };
};

// Create a custom bus icon
const busIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2Y1OTcwMCIgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIj48cGF0aCBkPSJNNCAxNlYyMGEyIDIgMCAwIDAgMiAyaDEyYTIgMiAwIDAgMCAyLTJ2LTRNNCAyYTIgMiAwIDAgMC0yIDJ2MTBhMiAyIDAgMCAwIDIgMmgxNmEyIDIgMCAwIDAgMi0yVjRhMiAyIDAgMCAwLTItMkg0eiIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxjaXJjbGUgY3g9IjcuNSIgY3k9IjE3LjUiIHI9IjEuNSIgZmlsbD0iIzAwMCIvPjxjaXJjbGUgY3g9IjE2LjUiIGN5PSIxNy41IiByPSIxLjUiIGZpbGw9IiMwMDAiLz48L3N2Zz4=',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

// Component to display vehicle markers
// In Live.jsx - Update the VehicleMarkers component
const VehicleMarkers = ({ selectedRoute }) => {
  const { vehicles, loading, error, lastUpdated } = useVehiclePositions(selectedRoute);
  const [prevPositions, setPrevPositions] = useState({});
  
  // Store previous positions for animation
  useEffect(() => {
    if (vehicles && vehicles.length > 0) {
      const newPositions = {};
      vehicles.forEach(vehicle => {
        const id = vehicle.vehicle_id || vehicle.entity_id;
        if (id) {
          newPositions[id] = { lat: vehicle.latitude, lng: vehicle.longitude };
        }
      });
      setPrevPositions(newPositions);
    }
  }, [vehicles]);

  if (loading && !vehicles.length) {
    return <div className="absolute top-2 right-2 bg-white p-2 rounded shadow z-50">Loading vehicles...</div>;
  }

  if (error) {
    return <div className="absolute top-2 right-2 bg-white p-2 rounded shadow z-50 text-red-500">{error}</div>;
  }

  return (
    <>
      {vehicles.map(vehicle => {
        const id = vehicle.vehicle_id || vehicle.entity_id;
        return (
          vehicle.latitude && vehicle.longitude ? (
            <Marker
              key={id}
              position={[vehicle.latitude, vehicle.longitude]}
              icon={busIcon}
            >
              <Popup>
                <div className="font-semibold">Bus {vehicle.vehicle_id || "Unknown"}</div>
                <div>Route: {vehicle.route_id}</div>
                <div>Trip: {vehicle.trip_id}</div>
                {vehicle.speed && <div>Speed: {Math.round(vehicle.speed * 3.6)} km/h</div>}
                <div>Last updated: {new Date(vehicle.timestamp * 1000).toLocaleTimeString()}</div>
              </Popup>
            </Marker>
          ) : null
        );
      })}
      {lastUpdated && (
        <div className="absolute bottom-4 right-4 bg-white px-3 py-2 rounded shadow z-50 text-sm">
          <div className="font-medium">Last updated: {lastUpdated.toLocaleTimeString()}</div>
        </div>
      )}
    </>
  );
};

// Map Controller component to handle map view updates
const MapController = ({ center, zoom, focusedMarker }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center && zoom) {
      map.setView(center, zoom);
    }
  }, [map, center, zoom]);

  useEffect(() => {
    if (focusedMarker) {
      map.setView(focusedMarker.position, 16);
    }
  }, [map, focusedMarker]);
  
  return null;
};

// Error Boundary component for graceful error handling
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
          <p>Please try refreshing the page or selecting a different route.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Fix for Leaflet default icon issues
delete L.Icon.Default.prototype._getIconUrl;

// Define custom icons for different types of stops
const icons = {
  default: new L.Icon.Default(),
  start: new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzIyYzU1ZSIgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIj48cGF0aCBkPSJNMTIgMEM3LjYgMCA0IDMuNiA0IDhjMCA1LjQgOCAxNiA4IDE2czgtMTAuNiA4LTE2YzAtNC40LTMuNi04LTgtOHoiLz48L3N2Zz4=',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),
  end: new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2VmNDQ0NCIgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIj48cGF0aCBkPSJNMTIgMEM3LjYgMCA0IDMuNiA0IDhjMCA1LjQgOCAxNiA4IDE2czgtMTAuNiA4LTE2YzAtNC40LTMuNi04LTgtOHoiLz48L3N2Zz4=',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),
  stop: new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzNiODJmNiIgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIj48cGF0aCBkPSJNMTIgMEM3LjYgMCA0IDMuNiA0IDhjMCA1LjQgOCAxNiA4IDE2czgtMTAuNiA4LTE2YzAtNC40LTMuNi04LTgtOHoiLz48L3N2Zz4=',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  })
};

// New component for combined search and select
const SearchableRouteSelect = ({ routes, onRouteSelect, isLoading, disabled }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [selectedRouteName, setSelectedRouteName] = useState('');

  // Filter routes based on search query
  const filteredRoutes = useMemo(() => {
    if (!searchQuery) return routes;
    
    const query = searchQuery.toLowerCase();
    return routes.filter(route => {
      // Search by route ID
      if (route.route_id.toString().includes(query)) return true;
      
      // Search by route name
      if (route.route_long_name && route.route_long_name.toLowerCase().includes(query)) return true;
      
      // Search by first or last stop name
      const firstStop = route.stops?.[0]?.stop_name;
      const lastStop = route.stops?.[route.stops.length-1]?.stop_name;
      
      return (firstStop && firstStop.toLowerCase().includes(query)) || 
             (lastStop && lastStop.toLowerCase().includes(query));
    });
  }, [routes, searchQuery]);

  const handleRouteSelect = (route) => {
    setSelectedRouteId(route.route_id);
    
    // Format display text for the selected route
    const displayText = `Route ${route.route_id}${route.route_long_name ? ` - ${route.route_long_name}` : ''}`;
    setSelectedRouteName(displayText);
    
    // Update the parent component
    onRouteSelect(route.route_id.toString());
    
    // Close the dropdown
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedRouteId(null);
    setSelectedRouteName('');
    setSearchQuery('');
    onRouteSelect(null);
  };

  return (
    <div className="relative">
      <div className="flex">
        <input
          type="text"
          className="w-full p-2 border rounded-l-md"
          placeholder="Search or select a route..."
          value={selectedRouteId ? selectedRouteName : searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setSelectedRouteId(null);
            setSelectedRouteName('');
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          disabled={disabled || isLoading}
        />
        <button 
          className="bg-gray-200 px-3 rounded-r-md border-y border-r flex items-center"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled || isLoading}
        >
          {isOpen ? "▲" : "▼"}
        </button>
        {(selectedRouteId || searchQuery) && (
          <button 
            className="absolute right-10 top-2 text-gray-500 hover:text-gray-700"
            onClick={handleClear}
          >
            ✕
          </button>
        )}
      </div>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 max-h-60 overflow-auto bg-white shadow-lg rounded-md border">
          {isLoading ? (
            <div className="p-3 text-gray-500">Loading...</div>
          ) : filteredRoutes.length === 0 ? (
            <div className="p-3 text-gray-500">No routes found</div>
          ) : (
            filteredRoutes.map(route => (
              <div
                key={route.route_id}
                className="p-2 hover:bg-gray-100 flex justify-between items-center border-b"
              >
                <div 
                  onClick={() => handleRouteSelect(route)}
                  className="cursor-pointer flex-1"
                >
                  <div className="font-medium">Route {route.route_id} {route.route_long_name && `- ${route.route_long_name}`}</div>
                  <div className="text-sm text-gray-600">
                    {route.stops?.[0]?.stop_name} → {route.stops?.[route.stops.length-1]?.stop_name}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const Planning = () => {
  // State management
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [routeStops, setRouteStops] = useState([]);
  const [routePath, setRoutePath] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]); // Default center
  const [mapZoom, setMapZoom] = useState(12);
  // Add a state to track if initial view has been set
  const [initialViewSet, setInitialViewSet] = useState(false);
  // Add states for focused marker
  const [focusedMarker, setFocusedMarker] = useState(null);
  // Ref for storing marker references
  const markerRefs = useRef({});

  // Validate and process route stop data
  const processRoutesData = useCallback((routesData) => {
    console.log('Validating routes data:', routesData);
    
    if (!Array.isArray(routesData)) {
      console.log('Failed: Data is not an array');
      throw new Error('Invalid routes data format');
    }
  
    return routesData.filter(route => {
      console.log('Validating route:', route);
      
      // Check route structure
      if (!route) {
        console.log('Failed: Route is null or undefined');
        return false;
      }
      if (typeof route.route_id !== 'number') {
        console.log('Failed: route_id is not a number:', typeof route.route_id);
        return false;
      }
      if (!Array.isArray(route.stops)) {
        console.log('Failed: stops is not an array');
        return false;
      }
  
      // Validate stops data
      const hasValidStops = route.stops.every((stop, index) => {
        const isValid = stop &&
          typeof stop.stop_lat === 'number' && 
          typeof stop.stop_lon === 'number' &&
          !isNaN(stop.stop_lat) && 
          !isNaN(stop.stop_lon) &&
          ('stop_seq' in stop ? typeof stop.stop_seq === 'number' : true);
        
        if (!isValid) {
          console.log(`Failed: Invalid stop data at index ${index}:`, stop);
        }
        return isValid;
      });
  
      return hasValidStops && route.stops.length > 0;
    });
  }, []);

  const fetchAvailableRoutes = async () => {
    try {
      // Fetch vehicle positions to get currently active routes
      const response = await axios.get('http://localhost:3001/api/vehicle-positions');
      
      if (!Array.isArray(response.data)) {
        throw new Error('Invalid response format');
      }
      
      // Extract unique route IDs from vehicle positions
      const activeRouteIds = [...new Set(
        response.data
          .filter(vehicle => vehicle.route_id)
          .map(vehicle => vehicle.route_id)
      )];
      
      console.log('Active routes from real-time API:', activeRouteIds);
      return activeRouteIds;
    } catch (error) {
      console.error('Error fetching available routes:', error);
      return [];
    }
  };
  
  // Update the fetchData function in the useEffect hook
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch all routes
        const response = await axios.get('http://localhost:3001/api/map/stops_');
        console.log('Raw response data:', response.data);
        
        // Fetch active routes from real-time API
        const activeRouteIds = await fetchAvailableRoutes();
        
        // Filter routes to only include those available in real-time API
        const allRoutes = processRoutesData(response.data);
        const activeRoutes = allRoutes.filter(route => 
          activeRouteIds.includes(route.route_id.toString())
        );
        
        console.log('Filtered active routes:', activeRoutes);
        setRoutes(activeRoutes);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(
          error.response?.data?.error || 
          'Failed to fetch data. Please try again later.'
        );
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, [processRoutesData]);

  // Handle predefined route selection and path calculation
  useEffect(() => {
    const updateSelectedRoute = async () => {
      if (!selectedRoute) {
        return;
      }

      const route = routes.find(r => r.route_id === parseInt(selectedRoute));
      if (!route) return;

      setIsLoading(true);
      try {
        setRouteStops(route.stops);

        // Calculate route path for routes with at least 2 stops
        if (route.stops.length >= 2) {
          try {
            const coordinates = route.stops
              .map(stop => `${stop.stop_lon},${stop.stop_lat}`)
              .join(';');

            const response = await fetch(
              `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`
            );
            
            if (!response.ok) {
              throw new Error('Route calculation failed');
            }

            const data = await response.json();
            
            if (data.routes?.[0]?.geometry?.coordinates) {
              const path = data.routes[0].geometry.coordinates.map(coord => 
                [coord[1], coord[0]]
              );
              setRoutePath(path);

              // Calculate bounds to show entire route
              const bounds = L.latLngBounds(route.stops.map(stop => 
                [stop.stop_lat, stop.stop_lon]
              ));
              setMapCenter(bounds.getCenter());
              setMapZoom(13);
              setInitialViewSet(true);
            }
          } catch (error) {
            console.error('Error calculating route path:', error);
            // Fallback to direct lines between stops
            setRoutePath(route.stops.map(stop => [
              stop.stop_lat,
              stop.stop_lon
            ]));
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    updateSelectedRoute();
  }, [selectedRoute, routes]);

  // Get appropriate icon based on stop position
  const getMarkerIcon = useCallback((stop) => {
    if (routeStops.length > 0) {
      const routeStop = routeStops.find(s => 
        s.stop_lat === stop.stop_lat && s.stop_lon === stop.stop_lon
      );
      
      if (routeStop) {
        if (routeStop.stop_seq === 0) return icons.start;
        if (routeStop.stop_seq === routeStops.length - 1) return icons.end;
        return icons.stop;
      }
    }
    
    return icons.default;
  }, [routeStops]);

  // Handle sidebar stop item click
  const handleSidebarStopClick = (stop) => {
    // Focus the map on the stop
    setFocusedMarker({
      position: [stop.stop_lat, stop.stop_lon],
      id: stop.locationKey || stop.stop_id || `${stop.stop_lat}-${stop.stop_lon}`
    });
    
    // Open the popup for this marker
    setTimeout(() => {
      const markerId = stop.locationKey || stop.stop_id || `${stop.stop_lat}-${stop.stop_lon}`;
      const marker = markerRefs.current[markerId];
      if (marker) {
        marker.openPopup();
      }
    }, 200);
  };

  // Memoize markers to prevent unnecessary rerenders
  const markers = useMemo(() => {
    const allStops = routeStops;
    
    return allStops
      .filter(stop => 
        typeof stop.stop_lat === 'number' && 
        typeof stop.stop_lon === 'number' &&
        !isNaN(stop.stop_lat) && 
        !isNaN(stop.stop_lon)
      )
      .map(stop => {
        const markerId = stop.locationKey || stop.stop_id || `${stop.stop_lat}-${stop.stop_lon}`;
        return (
          <Marker 
            key={markerId}
            position={[stop.stop_lat, stop.stop_lon]}
            icon={getMarkerIcon(stop)}
            ref={(ref) => {
              if (ref) {
                markerRefs.current[markerId] = ref;
              }
            }}
          >
            <Popup>
              <div className="font-semibold">
                {stop.stop_seq !== undefined ? `Stop ${stop.stop_seq + 1}` : 'Stop'}
              </div>
              <div>{stop.stop_name}</div>
            </Popup>
          </Marker>
        );
      });
  }, [routeStops, getMarkerIcon]);

  // Handle route selection from the combined component
  const handleRouteSelection = (routeId) => {
    setSelectedRoute(routeId);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 p-4 flex flex-col shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Route Viewer</h2>
          {selectedRoute && (
        <div className="mt-4 p-2 bg-yellow-100 rounded">
          <h3 className="font-medium">Live Updates Active</h3>
          <p className="text-sm">Bus positions update every 10 seconds</p>
        </div>
      )}
        </div>

        <div className="mb-4">
          <h3 className="text-md font-medium mb-2">Predefined Routes</h3>
          
          <SearchableRouteSelect 
            routes={routes}
            onRouteSelect={handleRouteSelection}
            isLoading={isLoading}
          />
          
          {error && (
            <div className="mt-2 text-red-500 text-sm">{error}</div>
          )}
        </div>

        {/* Stops list */}
        <div className="flex-1 overflow-auto">
          {routeStops.map((stop, index) => (
            <div
              key={stop.stop_id || `${stop.stop_lat}-${stop.stop_lon}`}
              className={`p-3 mb-2 rounded-lg shadow-md cursor-pointer hover:bg-gray-200 ${
                index === 0 
                  ? 'bg-green-100 border-l-4 border-green-500'
                  : index === routeStops.length - 1
                    ? 'bg-red-100 border-l-4 border-red-500'
                    : 'bg-blue-100 border-l-4 border-blue-500'
              }`}
              onClick={() => handleSidebarStopClick(stop)}
            >
              <div className="font-semibold">Stop {index + 1}</div>
              <div className="text-sm">{stop.stop_name}</div>
            </div>
          ))}
          {isLoading && (
            <div className="text-center p-4 text-gray-500">
              Loading...
            </div>
          )}
        </div>
      </div>

      {/* Map */}
    <div className="flex-1">
      <MapErrorBoundary>
        <MapContainer 
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100vh', width: '100%' }}
          preferCanvas={true}
        >
          <TileLayer 
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapController 
            center={mapCenter} 
            zoom={mapZoom} 
            focusedMarker={focusedMarker}
          />
          
          {/* Display route path */}
          {routePath.length > 0 && (
            <Polyline 
              positions={routePath}
              color="#3f83f8"
              weight={4}
              opacity={0.7}
            />
          )}
          
          {/* Display stops as markers */}
          {markers}
          
          {/* Add vehicle markers */}
          {selectedRoute && <VehicleMarkers selectedRoute={selectedRoute} />}
        </MapContainer>
      </MapErrorBoundary>
    </div>
  </div>
);
};

export default Planning;