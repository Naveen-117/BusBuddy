const mongoose=require("mongoose")
const cors=require("cors")
const express=require("express")
const userModel= require("./model/User")
const axios = require('axios');
const router = express.Router();
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');


const StopModel=require('./model/Stops')
const Fair_AttributesModel = require("./model/Fare_Attributes");
const Stop_TimesModel = require("./model/Stop_Times");
const Fair_RulesModel = require("./model/Fair_Rules");
const RoutesModel = require("./model/Routes");
const TripsModel = require("./model/Trips");
const bcryptjs = require('bcryptjs');

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


let points = [];

app.get('/api/points', (req, res) => {
  res.json(points);
});

app.post('/api/points', (req, res) => {
  points = req.body;
  res.status(200).send('Points updated');
});

  

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


app.listen(3001,()=>{
    console.log("server is running")
})


module.exports = router;
