const mongoose=require('mongoose')
const DataSchema = new mongoose.Schema({}, { strict: false })
const TripsModel = mongoose.model('trips', DataSchema)

module.exports=TripsModel;