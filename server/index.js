const mongoose=require("mongoose")
const cors=require("cors")
const express=require("express")
const userModel= require("./model/User")
const axios = require('axios');
const router = express.Router();
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const path = require('path');




const StopModel=require('./model/Stops')
const TransitStop = require('./model/TransitStop');
const bcryptjs = require('bcryptjs');
const dashboardRoutes = require('./routes/dashboard');
const upload = multer({ dest: 'uploads/' });
const profileRoutes = require('./routes/profileRoutes');



const app=express()
app.use(express.json())
app.use(cors())
app.use('/', router);
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



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
              if (validPW) {
                  res.json({
                      status: "success",
                      userId: user.id,
                      user: {
                          name: user.name,
                          email: user.email,
                          phone: user.phone,
                          createdAt: user.createdAt,
                          avatar: user.avatar  // Include avatar in response
                      }
                  });
              } else {
                  res.json({ status: "error", message: "Password incorrect" });
              }
          } else {
              res.json({ status: "error", message: "No record exist" });
          }
      });
});

app.use(router); // Register router with express app


let points = [];

app.get('/api/points', (req, res) => {
  res.json(points);
});

app.post('/api/points', (req, res) => {
  points = req.body;
  res.status(200).send('Points updated');
});

  

  /*app.post('/stops', upload.single('file'), (req, res) => {
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
*/

app.get('/api/transit-stops', async (req, res) => {
  try {
    const transitStops = await TransitStop.find();
    res.json(transitStops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/transit-stops', async (req, res) => {
  try {
    const newTransitStop = new TransitStop(req.body);
    const savedTransitStop = await newTransitStop.save();
    res.status(201).json(savedTransitStop);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
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
  
  
  
  /*const statisticsRoutes = require('./routes/statistics'); 
  app.use('/api/statistics', statisticsRoutes);
  app.use('/api/dashboard', dashboardRoutes);*/
  
  const { execFile } = require("child_process");
  


  // In index.js, modify the /api/vehicle-positions endpoint:
  app.get('/api/vehicle-positions', (req, res) => {
    console.log("Fetching vehicle positions using Python script...");
  
    // Call the Python script
    execFile("python3", ["vehicle_positions.py"], (error, stdout, stderr) => {
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
        res.json(data); // Send the data to the frontend
      } catch (parseError) {
        console.error("Error parsing Python script output:", parseError.message);
        res.status(500).json({ error: "Internal Server Error", details: parseError.message });
      }
    });
  });
  
  app.use('/api/profile', profileRoutes);
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Placeholder image endpoint
app.get('/api/placeholder/:width/:height', (req, res) => {
  const { width, height } = req.params;
  // This is a simple placeholder. In production, you might want to use a service like Placeholder.com
  res.sendFile(path.join(__dirname, 'assets', 'default-avatar.png'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});
  
  
  
  



app.listen(3001,()=>{
    console.log("server is running")
})


module.exports = router;
