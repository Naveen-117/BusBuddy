const StopsModel = require('../model/Routes');

// Helper function to round coordinates to a fixed precision
const roundCoordinate = (coord, precision = 5) => {
    return Number(coord.toFixed(precision));
};

// Helper to group stops by route
const groupStopsByRoute = (stops) => {
    const routes = new Map();
    const routeNames = new Map(); // To store route_long_name for each route_id
    
    stops.sort((a, b) => {
        if (a.route_id !== b.route_id) return a.route_id - b.route_id;
        return a.stop_seq - b.stop_seq;
    });
    
    stops.forEach(stop => {
        if (!routes.has(stop.route_id)) {
            routes.set(stop.route_id, []);
            // Store the route_long_name if available
            if (stop.route_long_name) {
                routeNames.set(stop.route_id, stop.route_long_name);
            }
        }
        routes.get(stop.route_id).push(stop);
    });
    
    return Array.from(routes.entries()).map(([routeId, stops]) => ({
        route_id: routeId,
        route_long_name: routeNames.get(routeId) || '', // Include route_long_name in the result
        stops: stops.map(stop => ({
            stop_id: stop.stop_id,
            stop_seq: stop.stop_seq,
            stop_name: stop.stop_name,
            stop_lat: roundCoordinate(stop.stop_lat),
            stop_lon: roundCoordinate(stop.stop_lon)
        }))
    }));
};

exports.getStopsData = async (req, res) => {
    try {
        const allStops = await StopsModel.find({});
        const routes = groupStopsByRoute(allStops);
        res.json(routes);
    } catch (err) {
        console.error('Routes processing error:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.saveCustomRoute = async (req, res) => {
    try {
      const { routeData } = req.body;
      
      // Validate input data
      if (!routeData || !Array.isArray(routeData.stops) || routeData.stops.length < 2) {
        return res.status(400).json({ error: 'Invalid route data. At least 2 stops are required.' });
      }
      
      // Generate a unique route_id (you might want to implement a better strategy)
      const lastRoute = await StopsModel.findOne().sort({ route_id: -1 });
      const newRouteId = lastRoute ? lastRoute.route_id + 1 : 50000; // Start custom routes from 50000
      
      // Create route_long_name based on first and last stop
      const routeLongName = `${routeData.stops[0].stop_name} to ${routeData.stops[routeData.stops.length-1].stop_name}`;
      
      // Process stops with sequential stop_seq
      const stops = routeData.stops.map((stop, index) => ({
        route_id: newRouteId,
        route_long_name: routeLongName,
        stop_id: stop.stop_id || Math.floor(Math.random() * 10000) + newRouteId * 100,
        stop_seq: index,
        stop_code: stop.stop_code || `U${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`,
        stop_name: stop.stop_name,
        stop_lat: roundCoordinate(stop.stop_lat),
        stop_lon: roundCoordinate(stop.stop_lon)
      }));
      
      // Save to database
      await StopsModel.insertMany(stops);
      
      res.status(201).json({ 
        success: true, 
        message: 'Custom route saved successfully',
        route_id: newRouteId,
        route_long_name: routeLongName
      });
    } catch (err) {
      console.error('Save custom route error:', err);
      res.status(500).json({ error: err.message });
    }
  };

exports.getRouteStops = async (req, res) => {
    try {
        const { routeId } = req.params;
        const routeStops = await StopsModel.find({ route_id: routeId })
            .sort({ stop_seq: 1 });
            
        const processedStops = routeStops.map(stop => ({
            stop_id: stop.stop_id,
            stop_seq: stop.stop_seq,
            stop_name: stop.stop_name,
            stop_lat: roundCoordinate(stop.stop_lat),
            stop_lon: roundCoordinate(stop.stop_lon)
        }));
        
        res.json(processedStops);
    } catch (err) {
        console.error('Route stops fetch error:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.deleteRoute = async (req, res) => {
    try {
        const { routeId } = req.params;
        
        // Validate route ID
        if (!routeId) {
            return res.status(400).json({ error: 'Route ID is required' });
        }
        
        // Check if route exists
        const existingRoute = await StopsModel.findOne({ route_id: Number(routeId) });

        if (!existingRoute) {
            return res.status(404).json({ error: 'Route not found' });
        }
        
        // Delete all stops associated with this route
        const deleteResult = await StopsModel.deleteMany({ route_id: routeId });
        
        res.json({ 
            success: true, 
            message: 'Route deleted successfully',
            deletedCount: deleteResult.deletedCount 
        });
    } catch (err) {
        console.error('Route deletion error:', err);
        res.status(500).json({ error: err.message });
    }
};