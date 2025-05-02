import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import axios from "axios";

// Memoized BusBlock component to prevent unnecessary re-renders
const BusBlock = React.memo(({ 
  block, 
  isSelected, 
  isScheduledChange, 
  onSelect, 
  onRemove 
}) => {
  return (
    <div
      className={`w-full mx-1 px-2 py-1 text-white text-center rounded-md shadow-sm text-sm relative ${
        isSelected
          ? 'bg-blue-700 ring-2 ring-blue-300'
          : isScheduledChange === 'added'
            ? 'bg-green-600 hover:bg-green-700'
            : isScheduledChange === 'removed'
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-blue-500 hover:bg-blue-600'
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(block);
      }}
    >
      <div className="font-medium truncate">{block.id}</div>
      <div className="text-xs opacity-90">{block.originalTime || block.time}</div>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onRemove(block);
        }}
        className="absolute top-0 right-0 p-1 text-white opacity-50 hover:opacity-100 text-xs"
        title="Remove Bus"
      >
        ✕
      </button>
    </div>
  );
});

// Memoized RouteRow component
const RouteRow = React.memo(({ 
  route, 
  busCount, 
  routeDemands, 
  showFrequencyOptimization, 
  frequencyData 
}) => {
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center">
      <div className="flex-1 flex items-center px-4">
        <div className="flex flex-col">
          <span className="text-gray-800 font-medium">Route {route}</span>
          <span className="text-xs text-gray-500">ID: {route}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <span className="font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                {busCount}
              </span>
              {routeDemands[route] && (
                <span 
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    routeDemands[route].demandClassification === 'Low' ? 'bg-green-100 text-green-800' :
                    routeDemands[route].demandClassification === 'Stable' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}
                >
                  {routeDemands[route].demandClassification}
                </span>
              )}
            </div>
            {showFrequencyOptimization && 
              frequencyData.frequencyChange !== 0 && 
              frequencyData.demandClassification !== 'Stable' && (
                <span 
                  className={`mt-1 text-xs font-medium ${
                    frequencyData.frequencyChange > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {frequencyData.frequencyChange > 0 ? '+' : ''}{frequencyData.frequencyChange} buses
                </span>
              )}
          </div>
        </div>
      </div>
    </div>
  );
});

function Platform() {
  const [blocks, setBlocks] = useState({});
  const [routes, setRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [routeDemands, setRouteDemands] = useState({});
  
  const [isSelectionOpen, setIsSelectionOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBlock, setSelectedBlock] = useState(null);
  
  // Time display controls
  const [minutesPerSlot, setMinutesPerSlot] = useState(5);
  const [visibleHours, setVisibleHours] = useState(24);
  const [startHour, setStartHour] = useState(0);
  
  // New state for frequency optimization
  const [showFrequencyOptimization, setShowFrequencyOptimization] = useState(false);
  const [frequencyChanges, setFrequencyChanges] = useState({});
  const [busChangeCount, setBusChangeCount] = useState({});
  const [scheduledChanges, setScheduledChanges] = useState({});
  
  // State to track all available buses
  const [allAvailableBuses, setAllAvailableBuses] = useState([]);
  
  const scrollContainerRef = useRef(null);
  const visibleColumns = Math.ceil((visibleHours * 60) / minutesPerSlot);
  const columnWidth = 60;
  const routeColumnWidth = 180;

  // Memoized classifyDemand function
  const classifyDemand = useCallback((demandValue) => {
    if (demandValue <= 0.001) return 'Low';
    if (demandValue <= 0.003) return 'Stable';
    return 'High';
  }, []);

  // Optimized fetchData with request caching
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Use Promise.all to fetch data in parallel
      const [stopTimesResponse, predictionsResponse] = await Promise.all([
        axios.get('http://localhost:3001/api/stop-times', {
          params: { limit: 1000 }, // Limit initial load
          headers: { 'Cache-Control': 'max-age=300' } // 5 minute cache
        }),
        axios.get("http://127.0.0.1:8000/predict_realtime/", {
          headers: { 'Cache-Control': 'max-age=300' }
        })
      ]);

      const stopTimesData = stopTimesResponse.data.data || [];
      const predictionsData = predictionsResponse.data;

      // Create demand map
      const demandMap = {};
      predictionsData.forEach(prediction => {
        const routeId = prediction["Route ID"].toString();
        demandMap[routeId] = {
          predictedDemand: prediction["Predicted Demand"],
          demandClassification: classifyDemand(prediction["Predicted Demand"]),
          originalClassification: classifyDemand(prediction["Predicted Demand"])
        };
      });
      
      setRouteDemands(demandMap);
      
      // Initialize counters
      const initialBusChangeCount = {};
      const initialScheduledChanges = {};
      Object.keys(demandMap).forEach(route => {
        initialBusChangeCount[route] = 0;
        initialScheduledChanges[route] = {};
      });
      setBusChangeCount(initialBusChangeCount);
      setScheduledChanges(initialScheduledChanges);
      
      // Process stop times data
      const routesMap = {};
      const busesMap = {};
      
      stopTimesData.forEach(stopTime => {
        const routeId = stopTime.route_id.toString();
        if (!routesMap[routeId]) {
          routesMap[routeId] = [];
        }
        
        const bus = {
          id: stopTime.trip_id,
          route: routeId,
          time: stopTime.departure_time,
          stopId: stopTime.stop_id
        };
        
        routesMap[routeId].push(bus);
        busesMap[stopTime.trip_id] = bus;
      });
      
      const uniqueRoutes = Object.keys(routesMap);
      setRoutes(uniqueRoutes);
      
      // Initialize blocks structure
      const initialBlocks = {};
      uniqueRoutes.forEach(route => {
        initialBlocks[route] = [];
      });
      
      // Process buses
      Object.values(busesMap).forEach(bus => {
        const timeComponents = bus.time.split(':');
        const hours = parseInt(timeComponents[0], 10);
        const minutes = parseInt(timeComponents[1], 10);
        
        const originalTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        const roundedMinutes = Math.round(minutes / minutesPerSlot) * minutesPerSlot;
        const adjustedHours = hours + Math.floor(roundedMinutes / 60);
        const normalizedMinutes = roundedMinutes % 60;
        const normalizedTime = `${adjustedHours.toString().padStart(2, '0')}:${normalizedMinutes.toString().padStart(2, '0')}`;
        
        if (initialBlocks[bus.route]) {
          initialBlocks[bus.route].push({
            ...bus,
            time: normalizedTime,
            originalTime
          });
        }
      });
      
      setBlocks(initialBlocks);
      setAllAvailableBuses(generateAvailableBuses(uniqueRoutes));
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoading(false);
    }
  }, [minutesPerSlot, classifyDemand]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Memoized generateAvailableBuses function
  const generateAvailableBuses = useCallback((routeList) => {
    const placedBuses = new Set();
    Object.values(blocks).forEach(routeBuses => {
      routeBuses.forEach(bus => placedBuses.add(bus.id));
    });
    
    const availableBuses = [];
    const routeCount = routeList.length;
    
    for (let i = 1; i <= 930; i++) {
      const route = routeList[(i-1) % routeCount];
      const bus = { 
        id: `BUS-${route}-${i.toString().padStart(3, '0')}`, 
        route 
      };
      availableBuses.push(bus);
    }
    
    return availableBuses.filter(bus => !placedBuses.has(bus.id));
  }, [blocks]);

  // Memoized getBusCount function
  const getBusCount = useCallback((route) => {
    return blocks[route]?.length || 0;
  }, [blocks]);

  // Memoized filtered routes
  const filteredRoutes = useMemo(() => {
    return routes.filter((route) =>
      route.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [routes, searchQuery]);

  
  // Memoized formatTime function
  const formatTime = useCallback((hour, minute) => {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;
  }, []);

  // Memoized time slots generation
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let i = 0; i < visibleColumns; i++) {
      const totalMinutes = (startHour * 60) + (i * minutesPerSlot);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      
      let shouldShowLabel = false;
      if (minutesPerSlot >= 30) {
        shouldShowLabel = true;
      } else if (minutesPerSlot >= 15) {
        shouldShowLabel = minutes % 30 === 0;
      } else if (minutesPerSlot >= 5) {
        shouldShowLabel = minutes % 15 === 0;
      } else {
        shouldShowLabel = minutes % 5 === 0;
      }
      
      slots.push({
        time: formatTime(hours, minutes),
        normalizedTime: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
        showLabel: shouldShowLabel,
        isHour: minutes === 0,
      });
    }
    return slots;
  }, [visibleColumns, startHour, minutesPerSlot]);

  // Memoized available buses
  const availableBuses = useMemo(() => {
    const placedBuses = new Set();
    Object.values(blocks).forEach(routeBuses => {
      routeBuses.forEach(bus => placedBuses.add(bus.id));
    });
    return allAvailableBuses.filter(bus => !placedBuses.has(bus.id));
  }, [blocks, allAvailableBuses]);

  

  // Memoized calculateFrequencyOptimization
  const calculateFrequencyOptimization = useCallback(() => {
    const optimizationResults = {};
    
    routes.forEach(route => {
      const busCount = getBusCount(route);
      const routeDemand = routeDemands[route]?.demandClassification || 'Stable';
      const currentFrequencyChange = frequencyChanges[route] || 0;
      
      let frequencyChange = currentFrequencyChange;
      
      switch(routeDemand) {
        case 'Low':
          frequencyChange = busCount > 1 ? -1 : 0;
          break;
        case 'High':
          frequencyChange = busCount < 5 ? 2 : 1;
          break;
        case 'Stable':
        default:
          frequencyChange = busCount > 3 ? -1 : (busCount < 3 ? 1 : 0);
          break;
      }
      
      optimizationResults[route] = {
        currentBuses: busCount,
        demandClassification: routeDemand,
        frequencyChange
      };
    });
    
    return optimizationResults;
  }, [routes, getBusCount, routeDemands, frequencyChanges]);

  // Memoized frequency optimization results
  const frequencyOptimizationResults = useMemo(() => {
    return calculateFrequencyOptimization();
  }, [calculateFrequencyOptimization]);

  // Memoized time presets
  const timePresets = useMemo(() => [
    { label: "Morning", hour: 6 },
    { label: "Noon", hour: 12 },
    { label: "Evening", hour: 18 },
    { label: "Night", hour: 22 }
  ], []);

  // Optimized handlers
  const handleBlockSelect = useCallback((block) => {
    setSelectedBlock(block);
  }, []);

  const handlePositionSelect = useCallback((route, time) => {
    if (!selectedBlock) return;
    const bus = { ...selectedBlock, time };
    handleBusPlacement(route, bus);
    setSelectedBlock(null);
  }, [selectedBlock]);

  const handleRemoveBusBlock = useCallback((route, block) => {
    setAllAvailableBuses(prev => [...prev, { id: block.id, route: block.route }]);
    handleBusRemoval(route, block);
  }, []);

 

  const handleTimeIntervalChange = useCallback((value) => {
    setMinutesPerSlot(parseInt(value, 10));
  }, []);

  const handleStartHourChange = useCallback((value) => {
    setStartHour(parseInt(value, 10));
  }, []);

  const handleVisibleHoursChange = useCallback((value) => {
    setVisibleHours(parseInt(value, 10));
  }, []);

  const scrollToHour = useCallback((hour) => {
    if (scrollContainerRef.current) {
      const hourIndex = Math.floor((hour - startHour) * 60 / minutesPerSlot);
      const scrollPosition = hourIndex * columnWidth;
      scrollContainerRef.current.scrollLeft = scrollPosition;
    }
  }, [startHour, minutesPerSlot]);

  const handleFrequencyOptimization = useCallback(() => {
    setShowFrequencyOptimization(!showFrequencyOptimization);
  }, [showFrequencyOptimization]);

  const updateRouteDemand = (route, currentDemand, busChangeCount) => {
    // Only update if the route is currently stable or was previously high/low but changed to stable
    if (currentDemand === 'Stable' || 
        (routeDemands[route]?.originalClassification !== 'Stable' && currentDemand === 'Stable')) {
      
      if (busChangeCount > 2) {
        // More than 2 buses added - change to Low demand
        setRouteDemands(prev => ({
          ...prev,
          [route]: {
            ...prev[route],
            demandClassification: 'Low'
          }
        }));
        setBusChangeCount(prev => ({ ...prev, [route]: 0 })); // Reset counter
      } else if (busChangeCount < -2) {
        // More than 2 buses removed - change to High demand
        setRouteDemands(prev => ({
          ...prev,
          [route]: {
            ...prev[route],
            demandClassification: 'High'
          }
        }));
        setBusChangeCount(prev => ({ ...prev, [route]: 0 })); // Reset counter
      }
    }
  };

  const handleBusPlacement = (route, bus) => {
    setBlocks(prev => {
      const newBlocks = { ...prev };
      
      // Place the bus
      if (!newBlocks[route]) {
        newBlocks[route] = [];
      }
      newBlocks[route].push(bus);
      
      // Update bus change count (increment)
      setBusChangeCount(prev => {
        const newCount = { ...prev, [route]: (prev[route] || 0) + 1 };
        
        // Check if we need to update demand classification
        const currentDemand = routeDemands[route]?.demandClassification || 'Stable';
        updateRouteDemand(route, currentDemand, newCount[route]);
        
        return newCount;
      });
      
      // Update frequency changes for high demand routes
      setFrequencyChanges(prev => {
        const newFrequencyChanges = { ...prev };
        const currentDemand = routeDemands[route]?.demandClassification;
        
        if (currentDemand === 'High') {
          const currentChange = newFrequencyChanges[route] || 2;
          const updatedChange = Math.max(0, currentChange - 1);
          
          // If change reaches zero, update route demand to stable
          if (updatedChange === 0) {
            setRouteDemands(prevDemands => ({
              ...prevDemands,
              [route]: {
                ...prevDemands[route],
                demandClassification: 'Stable',
                originalClassification: prevDemands[route].originalClassification // Preserve original
              }
            }));
          }
          
          newFrequencyChanges[route] = updatedChange;
        }
        
        return newFrequencyChanges;
      });
      
      return newBlocks;
    });
  };

  const handleBusRemoval = (route, bus) => {
    setBlocks(prev => {
      const newBlocks = { ...prev };
      
      // Remove the bus
      newBlocks[route] = newBlocks[route].filter(b => b.id !== bus.id);
      
      // Update bus change count (decrement)
      setBusChangeCount(prev => {
        const newCount = { ...prev, [route]: (prev[route] || 0) - 1 };
        
        // Check if we need to update demand classification
        const currentDemand = routeDemands[route]?.demandClassification || 'Stable';
        updateRouteDemand(route, currentDemand, newCount[route]);
        
        return newCount;
      });
      
      // Update frequency changes for low demand routes
      setFrequencyChanges(prev => {
        const newFrequencyChanges = { ...prev };
        const currentDemand = routeDemands[route]?.demandClassification;
        
        if (currentDemand === 'Low') {
          const currentChange = newFrequencyChanges[route] || -1;
          const updatedChange = Math.min(0, currentChange + 1);
          
          // If change reaches zero, update route demand to stable
          if (updatedChange === 0) {
            setRouteDemands(prevDemands => ({
              ...prevDemands,
              [route]: {
                ...prevDemands[route],
                demandClassification: 'Stable',
                originalClassification: prevDemands[route].originalClassification // Preserve original
              }
            }));
          }
          
          newFrequencyChanges[route] = updatedChange;
        }
        
        return newFrequencyChanges;
      });
      
      return newBlocks;
    });
  };


  // Function to handle automatic scheduling
  const handleAutomaticScheduling = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Round to nearest time slot
    const roundedMinutes = Math.round(currentMinute / minutesPerSlot) * minutesPerSlot;
    const adjustedHours = currentHour + Math.floor(roundedMinutes / 60);
    const normalizedMinutes = roundedMinutes % 60;
    const currentTime = `${adjustedHours.toString().padStart(2, '0')}:${normalizedMinutes.toString().padStart(2, '0')}`;
    
    // Get current time index
    const currentTimeIndex = timeSlots.findIndex(slot => slot.normalizedTime === currentTime);
    
    // Scroll to current time
    scrollToHour(currentHour);
    
    // Process each route
    routes.forEach(route => {
      const demand = routeDemands[route]?.demandClassification || 'Stable';
      
      if (demand === 'High') {
        // Try to add a bus
        const availableBuses = getAvailableBuses().filter(bus => bus.route === route);
        if (availableBuses.length > 0) {
          // Find the next available time slot after current time
          let targetTimeIndex = currentTimeIndex;
          let targetTime = currentTime;
          
          // Find the next empty slot
          while (targetTimeIndex < timeSlots.length - 1) {
            targetTimeIndex++;
            targetTime = timeSlots[targetTimeIndex].normalizedTime;
            
            // Check if this time slot is empty for this route
            const existingBus = blocks[route]?.find(bus => bus.time === targetTime);
            if (!existingBus) break;
          }
          
          if (targetTimeIndex < timeSlots.length) {
            const busToAdd = availableBuses[0];
            const newBus = {
              ...busToAdd,
              time: targetTime
            };
            
            // Mark this as a scheduled change
            setScheduledChanges(prev => ({
              ...prev,
              [route]: {
                ...prev[route],
                [newBus.id]: 'added'
              }
            }));
            
            handleBusPlacement(route, newBus);
          }
        }
      } else if (demand === 'Low') {
        // Try to remove a bus
        const routeBuses = blocks[route] || [];
        if (routeBuses.length > 0) {
          // Find the first bus at or after current time
          let busToRemove = routeBuses.find(bus => bus.time >= currentTime);
          
          // If no bus found at or after current time, take the first bus
          if (!busToRemove && routeBuses.length > 0) {
            busToRemove = routeBuses[0];
          }
          
          if (busToRemove) {
            // Mark this as a scheduled change
            setScheduledChanges(prev => ({
              ...prev,
              [route]: {
                ...prev[route],
                [busToRemove.id]: 'removed'
              }
            }));
            
            handleRemoveBusBlock(route, busToRemove);
          }
        }
      }
    });
  };

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading route data...</div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-4 bg-gray-50">
      {/* Header and controls section - remove pagination buttons */}
      <div className="mb-6 bg-white rounded-lg shadow-md p-4">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">Route Scheduler</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Routes</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter route number or name..."
              className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Interval</label>
            <div className="flex items-center gap-2">
              <select 
                value={minutesPerSlot}
                onChange={(e) => handleTimeIntervalChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="1">1 minute</option>
                <option value="5">5 minutes</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
            <div className="flex gap-2">
              <select 
                value={startHour}
                onChange={(e) => handleStartHourChange(e.target.value)}
                className="w-1/2 p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>{i}:00</option>
                ))}
              </select>
              <select 
                value={visibleHours}
                onChange={(e) => handleVisibleHoursChange(e.target.value)}
                className="w-1/2 p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="6">6 hours</option>
                <option value="12">12 hours</option>
                <option value="18">18 hours</option>
                <option value="24">24 hours</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            {timePresets.map(preset => (
              <button
                key={preset.label}
                onClick={() => scrollToHour(preset.hour)}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-sm transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
          
          {/* Remove pagination controls */}
          <div className="text-gray-700 text-sm">
            Showing all {filteredRoutes.length} routes
          </div>
        </div>
      </div>

      {/* Main schedule grid - modify to show all routes */}
      <div className="relative bg-white rounded-lg shadow-md">
        <div
          className="absolute left-0 top-0 bottom-0 bg-white z-10 border-r border-gray-200 overflow-y-auto"
          style={{ width: `${routeColumnWidth}px`, marginTop: '0' }}
        >
          <div className="h-12 flex items-center justify-between px-4 text-gray-700 font-semibold border-b border-gray-200 bg-gray-100 rounded-tl-lg sticky top-0">
            <span>Routes</span>
            <span>Buses</span>
          </div>
          {filteredRoutes.map((route) => (
            <RouteRow 
              key={route}
              route={route}
              busCount={getBusCount(route)}
              routeDemands={routeDemands}
              showFrequencyOptimization={showFrequencyOptimization}
              frequencyData={frequencyOptimizationResults[route] || {}}
            />
          ))}
        </div>

        <div ref={scrollContainerRef} className="overflow-x-auto">
          <div style={{ 
            width: `${columnWidth * visibleColumns + routeColumnWidth}px`,
            marginLeft: `${routeColumnWidth}px`
          }}>
            <div className="flex">
              <div
                className="grid w-full"
                style={{ gridTemplateColumns: `repeat(${visibleColumns}, ${columnWidth}px)` }}
              >
                {timeSlots.map((slot, index) => (
                  <div 
                    key={index} 
                    className={`text-center border-l ${slot.isHour ? 'border-gray-400' : 'border-gray-200'}`}
                  >
                    <div className={`py-2 text-sm ${slot.isHour ? 'font-semibold text-gray-700' : 'text-gray-500'}`}>
                      {slot.showLabel ? slot.time : ""}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              {filteredRoutes.map((route) => (
                <div key={route} className="mt-1 first:mt-0">
                  <div
                    className="grid bg-white border-b border-gray-200 relative"
                    style={{
                      gridTemplateColumns: `repeat(${visibleColumns}, ${columnWidth}px)`,
                    }}
                  >
                    {timeSlots.map((slot, index) => {
                      const block = blocks[route]?.find((block) => block.time === slot.normalizedTime);
                      const isScheduledChange = scheduledChanges[route]?.[block?.id];
                      return (
                        <div
                          key={index}
                          className={`min-h-[4rem] flex items-center justify-center border-l ${
                            slot.isHour ? 'border-gray-400 bg-gray-50' : 'border-gray-200'
                          } ${selectedBlock ? 'cursor-pointer hover:bg-blue-50' : ''}`}
                          onClick={() => handlePositionSelect(route, slot.normalizedTime)}
                        >
                          {block && (
                            <BusBlock
                              block={block}
                              isSelected={block.id === selectedBlock?.id}
                              isScheduledChange={isScheduledChange}
                              onSelect={handleBlockSelect}
                              onRemove={(b) => handleRemoveBusBlock(route, b)}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-2 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div
            className="w-full py-3 px-4 text-gray-700 hover:bg-gray-50 flex items-center justify-between gap-2 rounded-t-lg cursor-pointer"
            onClick={() => setIsSelectionOpen(!isSelectionOpen)}
          >
            <span className="font-medium">Available Buses</span>
            <span className="text-gray-500">{isSelectionOpen ? '▼' : '▲'}</span>
          </div>
          
          {isSelectionOpen && (
            <div className="p-4 bg-white border-t border-gray-200 rounded-b-lg">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-gray-500">Select a bus to place on the schedule</span>
                {selectedBlock && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Selected:</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">{selectedBlock.id}</span>
                    <button 
                      onClick={() => setSelectedBlock(null)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 max-h-64 overflow-y-auto">
                {availableBuses.map((block) => (
                  <div
                    key={block.id}
                    onClick={() => handleBlockSelect(block)}
                    className={`p-2 rounded-md cursor-pointer text-center transition-all ${
                      block.id === selectedBlock?.id
                        ? 'bg-blue-700 text-white ring-2 ring-blue-300'
                        : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                    }`}
                  >
                    <div className="font-medium text-sm">{block.id}</div>
                    <div className="text-xs opacity-75">Route {block.route}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="col-span-1 bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Tools</h3>
          <div className="flex flex-col gap-3">
            <button 
              onClick={handleFrequencyOptimization}
              className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 shadow-sm flex items-center justify-center gap-2 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              Frequency Optimizer
            </button>
            
            <button 
              onClick={handleAutomaticScheduling}
              className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 shadow-sm flex items-center justify-center gap-2 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Automatic Scheduler
            </button>
          </div>
        </div>
      </div>
      
      {selectedBlock && (
        <div className="fixed bottom-4 right-4 bg-blue-800 text-white px-4 py-2 rounded-md shadow-lg flex items-center gap-2 animate-pulse">
          <span>Selected: {selectedBlock.id}</span>
          <span className="text-sm">Click on grid to place</span>
        </div>
      )}
    </div>
  );
}

export default Platform;