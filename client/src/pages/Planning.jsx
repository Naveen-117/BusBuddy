import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { Trash2 } from 'lucide-react'; 

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

// Optimize cluster options
const clusterOptions = {
  chunkedLoading: true,
  maxClusterRadius: 100,
  spiderfyOnMaxZoom: false,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  disableClusteringAtZoom: 17,
  removeOutsideVisibleBounds: true
};

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, routeName }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]" 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        zIndex: 10000 
      }}
    >
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Confirm Route Deletion</h2>
        <p className="mb-4">Are you sure you want to delete the route {routeName}?</p>
        <p className="text-sm text-red-500 mb-4">This action cannot be undone.</p>
        <div className="flex justify-end space-x-2">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Delete Route
          </button>
        </div>
      </div>
    </div>
  );
};
// New component for combined search and select
const SearchableRouteSelect = ({ routes, onRouteSelect, isLoading, disabled, onRouteDelete }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [selectedRouteName, setSelectedRouteName] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState(null);

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

    
  },
   [routes, searchQuery]);

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

  const handleRouteDelete = (route) => {
    setRouteToDelete(route);
    setDeleteModalOpen(true);
  };

  const confirmRouteDelete = async () => {
    if (routeToDelete) {
      try {
        await onRouteDelete(routeToDelete.route_id);
        setDeleteModalOpen(false);
        setRouteToDelete(null);
      } catch (error) {
        console.error('Route deletion error:', error);
        alert('Failed to delete route');
      }
    }
  };

  return (
    <div className="relative">
      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmRouteDelete}
        routeName={`Route ${routeToDelete?.route_id}`}
      />
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
                {/* Delete Route Button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRouteDelete(route);
                  }}
                  className="text-red-500 hover:bg-red-100 p-2 rounded-full"
                  title="Delete Route"
                >
                  <Trash2 size={18} />
                </button>
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
  const [stops, setStops] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [routeStops, setRouteStops] = useState([]);
  const [routePath, setRoutePath] = useState([]);
  const [isRouteMode, setIsRouteMode] = useState(false);
  const [customRouteStops, setCustomRouteStops] = useState([]);
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

  // Memoized fetch function for route between points
  const fetchRoute = useCallback(async (start, end) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start.stop_lon},${start.stop_lat};${end.stop_lon},${end.stop_lat}?overview=full&geometries=geojson`
      );
      const data = await response.json();
      return data.routes[0]?.geometry.coordinates.map(coord => [coord[1], coord[0]]) || 
             [[start.stop_lat, start.stop_lon], [end.stop_lat, end.stop_lon]];
    } catch (error) {
      console.error('Error fetching route:', error);
      return [[start.stop_lat, start.stop_lon], [end.stop_lat, end.stop_lon]];
    }
  }, []);

  // Fetch routes and stops data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get('http://localhost:3001/api/map/stops_');
        console.log('Raw response data:', response.data);
        
        // Process routes
        const processedRoutes = processRoutesData(response.data);
        console.log('Processed routes:', processedRoutes);
        setRoutes(processedRoutes);
        
        // Process stops for custom route planning
        const processStops = () => {
          const uniqueStops = new Map();
          
          response.data.forEach(route => {
            if (Array.isArray(route.stops)) {
              route.stops.forEach(stop => {
                if (stop && typeof stop.stop_lat === 'number' && typeof stop.stop_lon === 'number') {
                  const locationKey = `${stop.stop_lat}-${stop.stop_lon}`;
                  if (uniqueStops.has(locationKey)) {
                    const existing = uniqueStops.get(locationKey);
                    const existingNames = new Set(existing.stop_name ? existing.stop_name.split(' OR ') : []);
                    if (stop.stop_name && !existingNames.has(stop.stop_name)) {
                      existing.stop_name = Array.from(existingNames).concat(stop.stop_name).join(' OR ');
                    }
                  } else {
                    uniqueStops.set(locationKey, { ...stop, locationKey });
                  }
                }
              });
            }
          });
          
          setStops(Array.from(uniqueStops.values()));
        };

        // Use requestIdleCallback for processing if available
        if ('requestIdleCallback' in window) {
          window.requestIdleCallback(processStops);
        } else {
          processStops();
        }
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
      if (!selectedRoute || isRouteMode) {
        return;
      }

      const route = routes.find(r => r.route_id === parseInt(selectedRoute));
      if (!route) return;

      setIsLoading(true);
      try {
        setRouteStops(route.stops);
        setCustomRouteStops([]);

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
  }, [selectedRoute, routes, isRouteMode]);

  // Update custom route path efficiently with modified zoom behavior
  useEffect(() => {
    let isMounted = true;

    const updateCustomRoutePath = async () => {
      if (!isRouteMode || customRouteStops.length < 2) {
        if (isRouteMode) {
          setRoutePath([]);
        }
        return;
      }

      setIsLoading(true);
      try {
        const newPath = [];
        for (let i = 0; i < customRouteStops.length - 1; i++) {
          if (!isMounted) return;
          const segmentPath = await fetchRoute(customRouteStops[i], customRouteStops[i + 1]);
          newPath.push(...segmentPath);
        }
        if (isMounted) {
          setRoutePath(newPath);
          
          // Only set initial map view if this is the first time we're creating a route
          if (!initialViewSet && customRouteStops.length === 2) {
            const bounds = L.latLngBounds(customRouteStops.map(stop => 
              [stop.stop_lat, stop.stop_lon]
            ));
            setMapCenter(bounds.getCenter());
            setMapZoom(20);
            setInitialViewSet(true);
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    updateCustomRoutePath();
    return () => {
      isMounted = false;
    };
  }, [customRouteStops, fetchRoute, isRouteMode, initialViewSet]);

  // Get appropriate icon based on stop position
  const getMarkerIcon = useCallback((stop) => {
    // For predefined route mode
    if (!isRouteMode && routeStops.length > 0) {
      const routeStop = routeStops.find(s => 
        s.stop_lat === stop.stop_lat && s.stop_lon === stop.stop_lon
      );
      
      if (routeStop) {
        if (routeStop.stop_seq === 0) return icons.start;
        if (routeStop.stop_seq === routeStops.length - 1) return icons.end;
        return icons.stop;
      }
    }
    
    // For custom route planning mode
    if (isRouteMode) {
      const locationKey = stop.locationKey || `${stop.stop_lat}-${stop.stop_lon}`;
      const index = customRouteStops.findIndex(s => 
        (s.locationKey && s.locationKey === locationKey) || 
        (s.stop_lat === stop.stop_lat && s.stop_lon === stop.stop_lon)
      );
      
      if (index === 0) return icons.start;
      if (index === customRouteStops.length - 1 && index > 0) return icons.end;
      if (index > 0) return icons.stop;
    }
    
    return icons.default;
  }, [routeStops, customRouteStops, isRouteMode]);

  // Custom route stop click handler
  const handleStopClick = useCallback((stop) => {
    if (!isRouteMode) return;
    
    setCustomRouteStops(prev => {
      const locationKey = stop.locationKey || `${stop.stop_lat}-${stop.stop_lon}`;
      const exists = prev.find(s => 
        (s.locationKey && s.locationKey === locationKey) || 
        (s.stop_lat === stop.stop_lat && s.stop_lon === stop.stop_lon)
      );
      
      return exists ? 
        prev.filter(s => !((s.locationKey && s.locationKey === locationKey) || 
                           (s.stop_lat === stop.stop_lat && s.stop_lon === stop.stop_lon))) :
        [...prev, stop];
    });
  }, [isRouteMode]);

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
    const allStops = isRouteMode ? stops : routeStops;
    
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
            eventHandlers={{ 
              click: () => handleStopClick(stop) 
            }}
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
  }, [routeStops, stops, getMarkerIcon, handleStopClick, isRouteMode]);

  // Toggle route mode handler with reset for initialViewSet
  const toggleRouteMode = () => {
    if (isRouteMode) {
      // Exiting route mode
      setIsRouteMode(false);
      setCustomRouteStops([]);
      setInitialViewSet(false);
      
      // Restore selected route if any
      if (selectedRoute) {
        const route = routes.find(r => r.route_id === parseInt(selectedRoute));
        if (route) {
          setRouteStops(route.stops);
        }
      } else {
        setRouteStops([]);
        setRoutePath([]);
      }
    } else {
      // Entering route mode
      setIsRouteMode(true);
      setSelectedRoute(null);
      setRouteStops([]);
      setRoutePath([]);
      setInitialViewSet(false);
    }
  };

  // Handle route selection from the combined component
  const handleRouteSelection = (routeId) => {
    setSelectedRoute(routeId);
  };
  
  // Save custom route to database
  const saveCustomRoute = async () => {
    if (!isRouteMode || customRouteStops.length < 2) {
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/api/map/custom-route', {
        routeData: {
          stops: customRouteStops.map(stop => ({
            stop_id: stop.stop_id,
            stop_name: stop.stop_name || 'Unnamed Stop',
            stop_lat: stop.stop_lat,
            stop_lon: stop.stop_lon,
            stop_code: stop.stop_code
          }))
        }
      });
      
      // Show success message
      alert(`Route saved successfully! Route ID: ${response.data.route_id}`);
      
      // Exit route mode and refresh routes
      toggleRouteMode();
      
      // Refresh routes data
      const refreshResponse = await axios.get('http://localhost:3001/api/map/stops_');
      const processedRoutes = processRoutesData(refreshResponse.data);
      setRoutes(processedRoutes);
      
      // Select the new route
      setSelectedRoute(response.data.route_id.toString());
    } catch (error) {
      console.error('Error saving custom route:', error);
      alert('Failed to save route: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRouteDelete = async (routeId) => {
    setIsLoading(true);
    try {
      // Call backend to delete route
      await axios.delete(`http://localhost:3001/api/map/route/${routeId}`);
      
      // Remove route from local state
      setRoutes(prevRoutes => prevRoutes.filter(route => route.route_id !== routeId));
      
      // Reset selected route if it was the deleted route
      if (selectedRoute === routeId.toString()) {
        setSelectedRoute(null);
        setRouteStops([]);
        setRoutePath([]);
      }
      
      // Optional: Show success message
      alert(`Route ${routeId} deleted successfully`);
    } catch (error) {
      console.error('Route deletion error:', error);
      alert('Failed to delete route');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 p-4 flex flex-col shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Route Planner</h2>
          <button 
            onClick={toggleRouteMode} 
            className={`px-4 py-2 rounded-md ${
              isRouteMode ? 'bg-red-500' : 'bg-blue-500'
            } text-white`}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : isRouteMode ? 'Exit Planning' : 'Plan Custom Route'}
          </button>
        </div>

        {!isRouteMode && (
        <div className="mb-4">
          <h3 className="text-md font-medium mb-2">Predefined Routes</h3>
          
          <SearchableRouteSelect 
            routes={routes}
            onRouteSelect={handleRouteSelection}
            onRouteDelete={handleRouteDelete}
            isLoading={isLoading}
            disabled={isRouteMode}
          />
          
          {error && (
            <div className="mt-2 text-red-500 text-sm">{error}</div>
          )}
        </div>
      )}

        {/* Stops list */}
        <div className="flex-1 overflow-auto">
          {isRouteMode && customRouteStops.length >= 2 && (
            <div className="mt-4">
              <button 
                onClick={saveCustomRoute} 
                className="w-full py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Custom Route'}
              </button>
            </div>
          )}
          {isRouteMode ? (
            <>
              {customRouteStops.length === 0 && (
                <div className="text-gray-500 text-center p-4">
                  Click on the map to select stops for your custom route
                </div>
              )}
              {customRouteStops.map((stop, index) => (
                <div
                  key={stop.locationKey || stop.stop_id || `${stop.stop_lat}-${stop.stop_lon}`}
                  className={`p-3 mb-2 rounded-lg shadow-md cursor-pointer hover:bg-gray-200 ${
                    index === 0 
                      ? 'bg-green-100 border-l-4 border-green-500'
                      : index === customRouteStops.length - 1
                        ? 'bg-red-100 border-l-4 border-red-500'
                        : 'bg-blue-100 border-l-4 border-blue-500'
                  }`}
                  onClick={() => handleSidebarStopClick(stop)}
                >
                  <div className="font-semibold">
                    {index === 0 ? '🏁 Start' : index === customRouteStops.length - 1 ? '🎯 End' : `Stop ${index}`}
                  </div>
                  <div className="text-sm">{stop.stop_name}</div>
                </div>
              ))}
            </>
          ) : (
            <>
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
            </>
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
            {isRouteMode ? (
              <MarkerClusterGroup {...clusterOptions}>
                {markers}
              </MarkerClusterGroup>
            ) : (
              markers
            )}
          </MapContainer>
        </MapErrorBoundary>
      </div>
    </div>
  );
};

export default Planning;