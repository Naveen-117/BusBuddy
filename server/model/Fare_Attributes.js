const mongoose=require('mongoose')
const DataSchema = new mongoose.Schema({}, { strict: false })
const Fair_AttributesModel = mongoose.model('fair_attributes', DataSchema)

module.exports=Fair_AttributesModel;