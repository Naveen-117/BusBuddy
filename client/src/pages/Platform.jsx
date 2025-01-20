import React, { useState, useRef } from "react";

function Platform() {
  const [blocks, setBlocks] = useState({
    route1: [], route2: [], route3: [], route4: [],
    route5: [], route6: [], route7: [], route8: []
  });
  
  const [availableBlocks] = useState([
    // Route 1 buses
    { id: "Bus 1", route: "route1" }, { id: "Bus 2", route: "route1" },
    { id: "Bus 9", route: "route1" }, { id: "Bus 10", route: "route1" },
    { id: "Bus 11", route: "route1" }, { id: "Bus 12", route: "route1" },
    // Route 2 buses
    { id: "Bus 3", route: "route2" }, { id: "Bus 4", route: "route2" },
    { id: "Bus 13", route: "route2" }, { id: "Bus 14", route: "route2" },
    { id: "Bus 15", route: "route2" }, { id: "Bus 16", route: "route2" },
    // Add other buses similarly...
    // Route 8 buses
    { id: "Bus 43", route: "route8" }, { id: "Bus 44", route: "route8" },
    { id: "Bus 45", route: "route8" }, { id: "Bus 46", route: "route8" },
    { id: "Bus 47", route: "route8" }, { id: "Bus 48", route: "route8" }
  ]);

  const [isSelectionOpen, setIsSelectionOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const routesPerPage = 5;
  
  const scrollContainerRef = useRef(null);
  const visibleColumns = 288;
  const minutesPerSlot = 5;
  const columnWidth = 60;
  const routeColumnWidth = 160;

  const getBusCount = (route) => {
    return blocks[route]?.length || 0;
  };

  const handleBlockSelect = (block) => {
    setSelectedBlock(block);
  };

  const handlePositionSelect = (route, time) => {
    if (!selectedBlock) return;
    
    setBlocks(prev => {
      const newBlocks = { ...prev };
      
      // Find if there's an existing block at the selected location
      const existingBlock = newBlocks[route]?.find(b => b.time === time);
      
      // Remove the selected block from its current location (if it's in the grid)
      Object.keys(newBlocks).forEach(r => {
        newBlocks[r] = newBlocks[r].filter(b => b.id !== selectedBlock.id);
      });
      
      // If there was an existing block, we need to make it available
      if (existingBlock) {
        // Remove the existing block from its current position
        newBlocks[route] = newBlocks[route].filter(b => b.id !== existingBlock.id);
      }
      
      // Place the selected block in the grid
      if (!newBlocks[route]) {
        newBlocks[route] = [];
      }
      newBlocks[route].push({ ...selectedBlock, time });
      
      return newBlocks;
    });
    
    // Clear the selection after placing the block
    setSelectedBlock(null);
  };

  const filteredRoutes = Object.keys(blocks).filter((route) =>
    route.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedRoutes = filteredRoutes.slice(
    currentPage * routesPerPage,
    (currentPage + 1) * routesPerPage
  );

  const handleNextPage = () => {
    if ((currentPage + 1) * routesPerPage < filteredRoutes.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const formatTime = (hour, minute) => {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let i = 0; i < visibleColumns; i++) {
      const totalMinutes = i * minutesPerSlot;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const shouldShowLabel = minutes % 15 === 0;
      slots.push({
        time: formatTime(hours, minutes),
        showLabel: shouldShowLabel,
      });
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const convertTo24Hour = (timeStr) => {
    const [time, period] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };

  const getPlacedBuses = () => {
    const placedBuses = new Set();
    Object.values(blocks).forEach(routeBuses => {
      routeBuses.forEach(bus => placedBuses.add(bus.id));
    });
    return placedBuses;
  };

  const placedBuses = getPlacedBuses();

  return (
    <div className="w-full mx-auto p-4">
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search routes..."
          className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
        />
      </div>

      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 0}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Previous
        </button>
        <span className="text-gray-700">
          Showing routes {currentPage * routesPerPage + 1} to{" "}
          {Math.min((currentPage + 1) * routesPerPage, filteredRoutes.length)} of{" "}
          {filteredRoutes.length}
        </span>
        <button
          onClick={handleNextPage}
          disabled={(currentPage + 1) * routesPerPage >= filteredRoutes.length}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Next
        </button>
      </div>

      <div className="relative">
        <div
          className="absolute left-0 top-0 bottom-0 bg-white z-10"
          style={{
            width: `${routeColumnWidth}px`,
            marginTop: '-10px',
          }}
        >
          <div className="h-12 flex items-center justify-center text-gray-600 font-medium border-b border-gray-200">
            Routes
          </div>
          {paginatedRoutes.map((route) => (
            <div key={route} className="mt-2">
              <div className="h-16 bg-gray-50 border border-gray-200 flex items-center">
                <div className="flex-1 flex items-center px-4">
                  <span className="text-gray-600 font-medium">{route}</span>
                  <span className="ml-auto font-medium border-l border-gray-300 pl-3">
                    {getBusCount(route)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div ref={scrollContainerRef} className="overflow-x-auto">
          <div
            style={{
              width: `${columnWidth * visibleColumns + routeColumnWidth}px`,
              marginLeft: `${routeColumnWidth}px`,
            }}
          >
            <div className="flex">
              <div
                className="grid w-full"
                style={{ gridTemplateColumns: `repeat(${visibleColumns}, ${columnWidth}px)` }}
              >
                {timeSlots.map((slot, index) => (
                  <div key={index} className="text-center border-l border-gray-200">
                    <div className="py-2 text-sm">{slot.showLabel ? slot.time : ""}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              {paginatedRoutes.map((route) => (
                <div key={route} className="mt-2">
                  <div
                    className="grid bg-gray-50 border border-gray-200"
                    style={{
                      gridTemplateColumns: `repeat(${visibleColumns}, ${columnWidth}px)`,
                    }}
                  >
                    {timeSlots.map((slot, index) => {
                      const normalizedTime = convertTo24Hour(slot.time);
                      const block = blocks[route]?.find((block) => block.time === normalizedTime);
                      return (
                        <div
                          key={index}
                          className={`min-h-[4rem] flex items-center justify-center border-l border-gray-200 ${
                            selectedBlock ? 'cursor-pointer hover:bg-gray-100' : ''
                          }`}
                          onClick={() => handlePositionSelect(route, normalizedTime)}
                        >
                          {block && (
                            <div
                              className={`w-full mx-1 px-2 py-1 text-white text-center rounded shadow text-sm ${
                                block.id === selectedBlock?.id
                                  ? 'bg-blue-700'
                                  : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBlockSelect(block);
                              }}
                            >
                              {block.id}
                            </div>
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

      <div className="mt-8 flex justify-between gap-4">
        <div className="w-1/2 bg-white border border-gray-200 rounded-lg shadow-md">
          <button
            className="w-full py-2 px-4 text-gray-700 hover:bg-gray-100 flex items-center justify-center gap-2 rounded-t-lg"
            onClick={() => setIsSelectionOpen(!isSelectionOpen)}
          >
            <span>Available Buses</span>
            <span className="text-xl">{isSelectionOpen ? '▼' : '▲'}</span>
          </button>
          
          {isSelectionOpen && (
            <div className="p-3 bg-white border-t border-gray-200 grid grid-cols-8 gap-2 max-h-64 overflow-y-auto rounded-b-lg">
              {availableBlocks
                .filter(block => !placedBuses.has(block.id))
                .map((block) => (
                  <div
                    key={block.id}
                    onClick={() => handleBlockSelect(block)}
                    className={`p-1 text-white rounded cursor-pointer text-center text-sm ${
                      block.id === selectedBlock?.id
                        ? 'bg-blue-700'
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    {block.id}
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="w-1/2 flex items-start w-96 gap-4">
          <button className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Frequency optimizer
          </button>
          <button className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Scheduler
          </button>
        </div>
      </div>
    </div>
  );
}

export default Platform;