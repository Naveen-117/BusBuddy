const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String
  },
  company: {
    type: String
  },
  location: {
    type: String
  },
  joinDate: {
    type: String
  },
  role: {
    type: String
  },
  bio: {
    type: String
  },
  avatar: {
    type: String,
    default: '/api/placeholder/200/200'
  }
}, {
  timestamps: true
});

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;