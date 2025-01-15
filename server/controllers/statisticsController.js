const RoutesModel = require('../model/Routes');
const Stop_TimesModel = require('../model/Stop_Times');
const StopsModel = require('../model/Stops');
const TripsModel = require('../model/Trips');

// Route Statistics
exports.getRouteStatistics = async (req, res) => {
    try {
        const routeCounts = await RoutesModel.aggregate([
            { $group: { _id: "$agency_id", count: { $sum: 1 } } }
        ]);

        const response = {
            agencyNames: routeCounts.map(item => item._id),
            routeCounts: routeCounts.map(item => item.count),
        };

        res.json(response);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Stop Statistics
exports.getStopStatistics = async (req, res) => {
    try {
        const stopFrequencies = await Stop_TimesModel.aggregate([
            { $group: { _id: "$stop_id", count: { $sum: 1 } } },
            { $limit: 10 } // Limit to top 10 stops for simplicity
        ]);

        const stopDetails = await StopsModel.find({
            stop_id: { $in: stopFrequencies.map(item => item._id.toString()) },
        });

        const response = {
            stopNames: stopDetails.map(stop => stop.stop_name),
            stopFrequencies: stopFrequencies.map(item => item.count),
        };

        res.json(response);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Trip Statistics
exports.getTripStatistics = async (req, res) => {
    try {
        const tripCounts = await TripsModel.aggregate([
            { $group: { _id: "$route_id", count: { $sum: 1 } } }
        ]);

        const routeDetails = await RoutesModel.find({
            route_id: { $in: tripCounts.map(item => item._id) },
        });

        const response = {
            routeNames: routeDetails.map(route => route.route_long_name),
            tripCounts: tripCounts.map(item => item.count),
        };

        res.json(response);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
