const Stop_TimesModel = require('../model/Stop_Times');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // 5 minute cache

// Helper function for pagination
const getPaginationOptions = (req) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  return { page, limit };
};

// Get all stop times with pagination
exports.getAllStopTimes = async (req, res) => {
  try {
    const cacheKey = `allStopTimes_${req.query.page || 1}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    const { page, limit } = getPaginationOptions(req);
    const skip = (page - 1) * limit;

    const [stopTimes, total] = await Promise.all([
      Stop_TimesModel.find({}).skip(skip).limit(limit).lean(),
      Stop_TimesModel.countDocuments()
    ]);

    const response = {
      data: stopTimes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };

    cache.set(cacheKey, response);
    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching stop times:', error);
    res.status(500).json({ 
      message: 'Failed to fetch stop times data', 
      error: error.message 
    });
  }
};

// Get stop times by route ID with pagination
exports.getStopTimesByRoute = async (req, res) => {
  try {
    const { routeId } = req.params;
    if (!routeId) {
      return res.status(400).json({ message: 'Route ID is required' });
    }

    const cacheKey = `stopTimesByRoute_${routeId}_${req.query.page || 1}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    const { page, limit } = getPaginationOptions(req);
    const skip = (page - 1) * limit;

    const [stopTimes, total] = await Promise.all([
      Stop_TimesModel.find({ route_id: routeId })
        .skip(skip)
        .limit(limit)
        .lean(),
      Stop_TimesModel.countDocuments({ route_id: routeId })
    ]);

    const response = {
      data: stopTimes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };

    cache.set(cacheKey, response);
    res.status(200).json(response);
  } catch (error) {
    console.error(`Error fetching stop times for route ${req.params.routeId}:`, error);
    res.status(500).json({ 
      message: 'Failed to fetch route stop times', 
      error: error.message 
    });
  }
};

// Get stop times by trip ID with pagination
exports.getStopTimesByTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    if (!tripId) {
      return res.status(400).json({ message: 'Trip ID is required' });
    }

    const cacheKey = `stopTimesByTrip_${tripId}_${req.query.page || 1}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    const { page, limit } = getPaginationOptions(req);
    const skip = (page - 1) * limit;

    const [stopTimes, total] = await Promise.all([
      Stop_TimesModel.find({ trip_id: tripId })
        .skip(skip)
        .limit(limit)
        .lean(),
      Stop_TimesModel.countDocuments({ trip_id: tripId })
    ]);

    const response = {
      data: stopTimes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };

    cache.set(cacheKey, response);
    res.status(200).json(response);
  } catch (error) {
    console.error(`Error fetching stop times for trip ${req.params.tripId}:`, error);
    res.status(500).json({ 
      message: 'Failed to fetch trip stop times', 
      error: error.message 
    });
  }
};

// Create a new stop time
exports.createStopTime = async (req, res) => {
  try {
    const requiredFields = ['trip_id', 'route_id', 'stop_id', 'departure_time'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        missingFields 
      });
    }

    const newStopTime = new Stop_TimesModel(req.body);
    const savedStopTime = await newStopTime.save();
    
    // Clear relevant caches
    cache.del(`allStopTimes_*`);
    cache.del(`stopTimesByRoute_${savedStopTime.route_id}_*`);
    cache.del(`stopTimesByTrip_${savedStopTime.trip_id}_*`);
    
    res.status(201).json(savedStopTime);
  } catch (error) {
    console.error('Error creating stop time:', error);
    res.status(500).json({ 
      message: 'Failed to create stop time', 
      error: error.message 
    });
  }
};

// Update a stop time
exports.updateStopTime = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'ID is required' });
    }

    const updatedStopTime = await Stop_TimesModel.findByIdAndUpdate(
      id,
      req.body,
      { new: true, lean: true }
    );
    
    if (!updatedStopTime) {
      return res.status(404).json({ message: 'Stop time not found' });
    }
    
    // Clear relevant caches
    cache.del(`allStopTimes_*`);
    cache.del(`stopTimesByRoute_${updatedStopTime.route_id}_*`);
    cache.del(`stopTimesByTrip_${updatedStopTime.trip_id}_*`);
    
    res.status(200).json(updatedStopTime);
  } catch (error) {
    console.error(`Error updating stop time ${req.params.id}:`, error);
    res.status(500).json({ 
      message: 'Failed to update stop time', 
      error: error.message 
    });
  }
};

// Delete a stop time
exports.deleteStopTime = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'ID is required' });
    }

    const deletedStopTime = await Stop_TimesModel.findByIdAndDelete(id).lean();
    
    if (!deletedStopTime) {
      return res.status(404).json({ message: 'Stop time not found' });
    }
    
    // Clear relevant caches
    cache.del(`allStopTimes_*`);
    cache.del(`stopTimesByRoute_${deletedStopTime.route_id}_*`);
    cache.del(`stopTimesByTrip_${deletedStopTime.trip_id}_*`);
    
    res.status(200).json({ message: 'Stop time deleted successfully' });
  } catch (error) {
    console.error(`Error deleting stop time ${req.params.id}:`, error);
    res.status(500).json({ 
      message: 'Failed to delete stop time', 
      error: error.message 
    });
  }
};

// Bulk update stop times
exports.updateSchedule = async (req, res) => {
  try {
    const { stopTimes } = req.body;
    
    if (!Array.isArray(stopTimes)) {
      return res.status(400).json({ 
        message: 'Invalid data format. Expected an array of stop times.' 
      });
    }
    
    // Validate each stop time
    const invalidItems = stopTimes.filter(item => 
      !item.trip_id || !item.route_id || !item.stop_id || !item.departure_time
    );
    
    if (invalidItems.length > 0) {
      return res.status(400).json({ 
        message: 'Some items are missing required fields', 
        invalidItems 
      });
    }

    const updatePromises = stopTimes.map(async (stopTime) => {
      if (stopTime._id) {
        return Stop_TimesModel.findByIdAndUpdate(
          stopTime._id,
          stopTime,
          { new: true, lean: true }
        );
      } else {
        const newStopTime = new Stop_TimesModel(stopTime);
        return newStopTime.save();
      }
    });
    
    const results = await Promise.all(updatePromises);
    
    // Clear all relevant caches
    cache.flushAll();
    
    res.status(200).json({ 
      message: 'Schedule updated successfully', 
      results 
    });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ 
      message: 'Failed to update schedule', 
      error: error.message 
    });
  }
};