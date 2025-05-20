// models/fdimts.model.js
const mongoose = require('mongoose');

/**
 * Schema for FDIMTS collection
 * Stores transit information including route, trip, stop and location data
 */
const fdimtsSchema = new mongoose.Schema({
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
    default: null
  }
}, {
  timestamps: true,
  collection: 'FDIMTS'
});
// Create compound index for common queries
fdimtsSchema.index({ route_id: 1, trip_id: 1, stop_sequence: 1 });
// Geospatial index for location-based queries
fdimtsSchema.index({ stop_lat: 1, stop_lon: 1 });

const FDIMTS = mongoose.model('FDIMTS', fdimtsSchema);

module.exports = FDIMTS;