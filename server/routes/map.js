const express = require('express');
const router = express.Router();
const mapController = require('../controllers/maps.controller');

// Routes
router.get('/stops_', mapController.getStopsData);
router.get('/routes/:routeId', mapController.getRouteStops);
router.post('/custom-route', mapController.saveCustomRoute);
router.delete('/route/:routeId', mapController.deleteRoute);

module.exports = router;