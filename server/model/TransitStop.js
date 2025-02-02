// models/TransitStop.js
const mongoose = require('mongoose');

const transitStopSchema = new mongoose.Schema({
  route_id: {
    type: Number,
    required: true
  },
  trip_id: {
    type: String,
    required: true
  },
  agency_id: {
    type: String,
    required: true
  },
  route_long_name: {
    type: String,
    required: true
  },
  arrival_time: {
    type: String,
    required: true
  },
  stop_id: {
    type: Number,
    required: true
  },
  stop_sequence: {
    type: Number,
    required: true
  },
  stop_code: {
    type: String,
    required: true
  },
  stop_lat: {
    type: Number,
    required: true
  },
  stop_lon: {
    type: Number,
    required: true
  },
  stop_name: {
    type: String,
    required: true
  },
  zone: {
    type: String,
    required: true
  },
  distance_to_next_stop: {
    type: Number,
    required: true
  }
}, {
  timestamps: true,
  collection: 'FDIMTS'
});

const TransitStop = mongoose.model('TransitStop', transitStopSchema, 'FDIMTS');
module.exports = TransitStop;