const mongoose=require('mongoose')
const DataSchema = new mongoose.Schema({}, { strict: false })
const Stop_TimesModel = mongoose.model('stop_times', DataSchema)

module.exports=Stop_TimesModel;