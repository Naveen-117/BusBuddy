const mongoose=require('mongoose')
const DataSchema = new mongoose.Schema({}, { strict: false })
const RoutesModel = mongoose.model('routes', DataSchema)

module.exports=RoutesModel;