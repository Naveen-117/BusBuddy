/*const RoutesModel = require('../model/Routes');
const StopsModel = require('../model/Stops');
const TripsModel = require('../model/Trips');
const StopTimesModel = require('../model/Stop_Times');

// Fetch summary data
exports.getSummary = async (req, res) => {
    try {
        const routesCount = await RoutesModel.countDocuments();
        const stopsCount = await StopsModel.countDocuments();
        const tripsCount = await TripsModel.countDocuments();
        const stopTimesCount = await StopTimesModel.countDocuments();

        // Additional details for each model
        const routeDetails = await RoutesModel.find({}, 'route_id agency_id').limit(5);
        const stopDetails = await StopsModel.find({}, 'stop_name stop_lat stop_lon').limit(5);
        const tripDetails = await TripsModel.find({}, 'route_id trip_id').limit(5);
        const stopTimeDetails = await StopTimesModel.find({}, 'arrival_time departure_time stop_sequence').limit(5);

        const summary = [
            {
                model: 'Routes',
                count: routesCount,
                details: routeDetails.map((r) => `Agency: ${r.agency_id}, Route: ${r.route_id}`),
            },
            {
                model: 'Stops',
                count: stopsCount,
                details: stopDetails.map(
                    (s) => `Name: ${s.stop_name}, Lat: ${s.stop_lat}, Lon: ${s.stop_lon}`
                ),
            },
            {
                model: 'Trips',
                count: tripsCount,
                details: tripDetails.map((t) => `Route: ${t.route_id}, Trip: ${t.trip_id}`),
            },
            {
                model: 'Stop Times',
                count: stopTimesCount,
                details: stopTimeDetails.map(
                    (st) =>
                        `Arrival: ${st.arrival_time}, Departure: ${st.departure_time}, Sequence: ${st.stop_sequence}`
                ),
            },
        ];

        res.json(summary);
    } catch (error) {
        console.error('Error fetching summary data:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Fetch route statistics
exports.getRouteStats = async (req, res) => {
    try {
        const routeStats = await RoutesModel.aggregate([
            { $group: { _id: '$agency_id', count: { $sum: 1 } } },
        ]);
        res.json(routeStats);
    } catch (error) {
        console.error('Error fetching route statistics:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Fetch stop statistics
exports.getStopStats = async (req, res) => {
    try {
        const stopStats = await StopTimesModel.aggregate([
            { $group: { _id: '$stop_id', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
        ]);

        const stopDetails = await StopsModel.find({
            stop_id: { $in: stopStats.map((s) => s._id.toString()) },
        });

        res.json({ stopStats, stopDetails });
    } catch (error) {
        console.error('Error fetching stop statistics:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Fetch trip statistics
exports.getTripStats = async (req, res) => {
    try {
        const tripStats = await TripsModel.aggregate([
            { $group: { _id: '$route_id', count: { $sum: 1 } } },
        ]);
        res.json(tripStats);
    } catch (error) {
        console.error('Error fetching trip statistics:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getRoutesStats = async (req, res) => {
    try {
        const routesStats = await RoutesModel.aggregate([
            { $group: { _id: "$agency_id", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.json(routesStats);
    } catch (error) {
        console.error("Error fetching routes statistics:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/*exports.getStopsStats = async (req, res) => {
    try {
        const stopStats = await StopTimesModel.aggregate([
            { $group: { _id: "$stop_id", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const stopDetails = await StopsModel.find(
            { stop_id: { $in: stopStats.map((s) => s._id.toString()) } },
            "stop_id stop_name"
        );

        res.json({ stopStats, stopDetails });
    } catch (error) {
        console.error("Error fetching stops statistics:", error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getTripsStats = async (req, res) => {
    try {
        const tripStats = await TripsModel.aggregate([
            { $group: { _id: "$route_id", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.json(tripStats);
    } catch (error) {
        console.error("Error fetching trips statistics:", error);
        res.status(500).json({ message: "Server error" });
    }
};
*/