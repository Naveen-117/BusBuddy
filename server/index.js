const mongoose=require("mongoose")
const cors=require("cors")
const express=require("express")
const userModel= require("./model/User")
const axios = require('axios');
const router = express.Router();
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');




const FDIMTS = require('./model/fdimts.model');
const StopModel=require('./model/Stops')
const Fair_AttributesModel = require("./model/Fare_Attributes");
const Stop_TimesModel = require("./model/Stop_Times");
const Fair_RulesModel = require("./model/Fair_Rules");
const RoutesModel = require("./model/Routes");
const TripsModel = require("./model/Trips");
const bcryptjs = require('bcryptjs');
const dashboardRoutes = require('./routes/dashboard');
const map = require('./routes/map');
const stoptimes = require('./routes/stoptimes');
const upload = multer({ dest: 'uploads/' });



const app=express()
app.use(express.json())
app.use(cors())
app.use('/', router);



mongoose.connect("mongodb+srv://58rahulkr:yq209a9CJIss7TQf@cluster0.88cou.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

app.post('/register', (req, res) => {
    userModel.create(req.body)
        .then(user => res.json(user))
        .catch(err => res.json(err));
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    userModel.findOne({ email: email })
        .then(user => {
            if (user) {
                const validPW = bcryptjs.compareSync(password, user.password);
                if (validPW)
                    res.json("success");
                else
                    res.json("Password incorrect");
            } else {
                res.json("No record exist");
            }
        });
});


app.use(router); // Register router with express app




  

  app.post('/stops', upload.single('file'), (req, res) => {
    const filePath = req.file.path;
  
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          await StopModel.insertMany(results);
          fs.unlinkSync(filePath); // Clean up the uploaded file
          res.status(200).json({ message: 'Data successfully uploaded!' });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Error uploading data' });
        }
      });
  });

  


  app.post('/stop_times', upload.single('file'), (req, res) => {
    const filePath = req.file.path;
  
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          await Stop_TimesModel.insertMany(results);
          fs.unlinkSync(filePath); // Clean up the uploaded file
          res.status(200).json({ message: 'Data successfully uploaded!' });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Error uploading data' });
        }
      });
  });


  app.post('/fair_attributes', upload.single('file'), (req, res) => {
    const filePath = req.file.path;
  
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          await Fair_AttributesModel.insertMany(results);
          fs.unlinkSync(filePath); // Clean up the uploaded file
          res.status(200).json({ message: 'Data successfully uploaded!' });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Error uploading data' });
        }
      });
  });

  app.post('/fair_rules', upload.single('file'), (req, res) => {
    const filePath = req.file.path;
  
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          await Fair_RulesModel.insertMany(results);
          fs.unlinkSync(filePath); // Clean up the uploaded file
          res.status(200).json({ message: 'Data successfully uploaded!' });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Error uploading data' });
        }
      });
  });

  app.post('/routes', upload.single('file'), (req, res) => {
    const filePath = req.file.path;
  
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          await RoutesModel.insertMany(results);
          fs.unlinkSync(filePath); // Clean up the uploaded file
          res.status(200).json({ message: 'Data successfully uploaded!' });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Error uploading data' });
        }
      });
  });

  app.post('/trips', upload.single('file'), (req, res) => {
    const filePath = req.file.path;
  
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          await TripsModel.insertMany(results);
          fs.unlinkSync(filePath); // Clean up the uploaded file
          res.status(200).json({ message: 'Data successfully uploaded!' });
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Error uploading data' });
        }
      });
  });

  app.get('/graph', async (req, res) => {
    console.log("Received request for /graph");
  
    try {
      const summary = await Stop_TimesModel.aggregate([
        {
          $group: {
            _id: "$stop_id",
            tripCount: { $sum: 1 },
            avgArrivalTime: {
              $avg: {
                $add: [
                  { $multiply: [{ $toInt: { $substr: ["$arrival_time", 0, 2] } }, 60] },
                  { $toInt: { $substr: ["$arrival_time", 3, 2] } }
                ]
              }
            },
            avgDepartureTime: {
              $avg: {
                $add: [
                  { $multiply: [{ $toInt: { $substr: ["$departure_time", 0, 2] } }, 60] },
                  { $toInt: { $substr: ["$departure_time", 3, 2] } }
                ]
              }
            }
          }
        },
        { $sort: { tripCount: -1 } },
        { $limit: 10 }
      ]);
  
      console.log('Aggregated Data:', summary);
      res.json(summary);
    } catch (error) {
      console.error('Error fetching graph data:', error);
      res.status(500).json({ error: 'Error fetching stop times data' });
    }
  });
  
  
  
  const statisticsRoutes = require('./routes/statistics'); 
  app.use('/api/statistics', statisticsRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/map', map);
  app.use('/api', stoptimes);
  
  const { execFile } = require("child_process");
  


  // In index.js, modify the /api/vehicle-positions endpoint:
  // In index.js - Improve vehicle positions endpoint
app.get('/api/vehicle-positions', (req, res) => {
  console.log("Fetching vehicle positions using Python script...");

  // Call the Python script with increased timeout
  execFile("python", ["vehicle_positions.py"], { timeout: 15000 }, (error, stdout, stderr) => {
    if (error) {
      console.error("Error executing Python script:", error.message);
      res.status(500).json({ error: "Internal Server Error", details: error.message });
      return;
    }
    if (stderr) {
      console.error("Python script error output:", stderr);
    }

    try {
      const data = JSON.parse(stdout); // Parse JSON output from the script
      
      // Add server timestamp to know when the data was fetched
      const responseData = Array.isArray(data) ? data.map(vehicle => ({
        ...vehicle,
        server_fetch_time: Math.floor(Date.now() / 1000)
      })) : data;
      
      res.json(responseData); // Send the data to the frontend
    } catch (parseError) {
      console.error("Error parsing Python script output:", parseError.message);
      res.status(500).json({ error: "Internal Server Error", details: parseError.message });
    }
  });
});
  
  app.get('/api/stats/overview', async (req, res) => {
    try {
      const totalRoutes = await FDIMTS.distinct('route_id').countDocuments();
      const totalStops = await FDIMTS.distinct('stop_id').countDocuments();
      const agencies = await FDIMTS.distinct('agency_id');
      const avgDistance = await FDIMTS.aggregate([
        { $group: { _id: null, avg: { $avg: "$distance_to_next_stop" } } }
      ]);
  
      res.json({
        totalRoutes,
        totalStops,
        totalAgencies: agencies.length,
        avgDistance: avgDistance[0]?.avg?.toFixed(2) || 0
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  
  app.get('/api/stats/routes', async (req, res) => {
    try {
      const routesByAgency = await FDIMTS.aggregate([
        { $group: { _id: "$agency_id", count: { $sum: 1 } } }
      ]);
  
      const stopsByZone = await FDIMTS.aggregate([
        { $group: { _id: "$zone", count: { $sum: 1 } } }
      ]);
  
      res.json({ routesByAgency, stopsByZone });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  
  
  app.get('/api/stats/times', async (req, res) => {
    try {
      // Log sample arrival_time values for debugging
      const times = await FDIMTS.find({}, { arrival_time: 1, _id: 0 }).limit(10);
      console.log('Sample arrival_time values:', times);
  
      const timeDistribution = await FDIMTS.aggregate([
        {
          $addFields: {
            // Fix invalid times (e.g., 24:02:04 -> 00:02:04)
            fixedArrivalTime: {
              $let: {
                vars: {
                  hours: { $toInt: { $substr: ["$arrival_time", 0, 2] } },
                  minutes: { $substr: ["$arrival_time", 3, 2] },
                  seconds: { $substr: ["$arrival_time", 6, 2] }
                },
                in: {
                  $cond: {
                    if: { $gte: ["$$hours", 24] }, // Check if hours >= 24
                    then: { $concat: ["00", ":", "$$minutes", ":", "$$seconds"] }, // Convert to 00:MM:SS
                    else: "$arrival_time" // Use as-is if valid
                  }
                }
              }
            }
          }
        },
        {
          $project: {
            hour: {
              $hour: {
                $dateFromString: {
                  dateString: {
                    $concat: ["1970-01-01 ", "$fixedArrivalTime"] // Add a dummy date
                  },
                  format: "%Y-%m-%d %H:%M:%S"
                }
              }
            }
          }
        },
        {
          $group: {
            _id: "$hour",
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);
  
      // Handle empty results
      const formattedResults = timeDistribution.length > 0 
        ? timeDistribution 
        : Array.from({ length: 24 }, (_, i) => ({ _id: i, count: 0 }));
  
      res.json(formattedResults);
    } catch (err) {
      console.error('Error in /api/stats/times:', err);
      res.status(500).json({ 
        error: 'Failed to fetch time data',
        details: err.message
      });
    }
  });
  
  app.get('/api/stops', async (req, res) => {
    try {
      const { limit = 5000 } = req.query; // Default: return 5000 stops to prevent overload
      const stops = await FDIMTS.find({}, { 
        stop_name: 1, stop_lat: 1, stop_lon: 1, route_long_name: 1, arrival_time: 1 
      }).limit(parseInt(limit));
  
      res.json({ stops });
    } catch (error) {
      console.error("Error fetching stops:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  
  
  app.get("/api/routes", async (req, res) => {
    try {
      const routes = await FDIMTS.distinct("route_id");
      res.json(routes);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  app.get("/api/stops", async (req, res) => {
    try {
      const stops = await FDIMTS.distinct("stop_id");
      res.json(stops);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  app.get("/api/trips", async (req, res) => {
    try {
      const trips = await FDIMTS.distinct("trip_id");
      res.json(trips);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  app.get("/api/agencies", async (req, res) => {
    try {
      const agencies = await FDIMTS.distinct("agency_id");
      res.json(agencies);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  
  



app.listen(3001,()=>{
    console.log("server is running")
})


module.exports = router;
