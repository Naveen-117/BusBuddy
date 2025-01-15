const express = require('express');
const router = express.Router();
const { getRouteStatistics, getStopStatistics, getTripStatistics } = require('../controllers/statisticsController');

// Define routes
router.get('/routes', getRouteStatistics);
router.get('/stops', getStopStatistics);
router.get('/trips', getTripStatistics);

module.exports = router;
