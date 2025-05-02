const express = require('express');
const router = express.Router();
const stopTimesController = require('../controllers/stoptimes.controller');

// Get all stop times
router.get('/stop-times', stopTimesController.getAllStopTimes);

// Get stop times by route ID
router.get('/stop-times/route/:routeId', stopTimesController.getStopTimesByRoute);

// Get stop times by trip ID
router.get('/stop-times/trip/:tripId', stopTimesController.getStopTimesByTrip);

// Create a new stop time
router.post('/stop-times', stopTimesController.createStopTime);

// Update a stop time
router.put('/stop-times/:id', stopTimesController.updateStopTime);

// Delete a stop time
router.delete('/stop-times/:id', stopTimesController.deleteStopTime);

// Bulk update stop times (for schedule updates)
router.post('/update-schedule', stopTimesController.updateSchedule);

module.exports = router;