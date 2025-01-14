const mongoose=require('mongoose')
const DataSchema = new mongoose.Schema({}, { strict: false })
const StopModel = mongoose.model('stop', DataSchema)

module.exports=StopModel;