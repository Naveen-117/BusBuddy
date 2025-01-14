const mongoose=require('mongoose')
const DataSchema = new mongoose.Schema({}, { strict: false })
const Fair_RulesModel = mongoose.model('fair_rules', DataSchema)

module.exports=Fair_RulesModel;