const express = require('express');
const router = express.Router();
const userModel = require('../model/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/avatars/') // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, `avatar-${req.params.userId}-${Date.now()}${path.extname(file.originalname)}`)
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Get profile
router.get('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await userModel.findOne({ id: userId });
    
    if (!user) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    const userData = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
      avatar: user.avatar
    };
    
    res.json(userData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

// Update profile
router.put('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const updates = req.body;
    delete updates.password;
    
    const user = await userModel.findOneAndUpdate(
      { id: userId },
      { $set: updates },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    const userData = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
      avatar: user.avatar
    };
    
    res.json(userData);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// Upload avatar
// In the avatar upload route
router.post('/:userId/avatar', upload.single('avatar'), async (req, res) => {
  try {
      const userId = req.params.userId;
      
      if (!req.file) {
          return res.status(400).json({ message: 'No file uploaded' });
      }

      // Get the user to check if they have an existing avatar
      const user = await userModel.findOne({ id: userId });
      if (user && user.avatar && user.avatar !== "/api/placeholder/200/200") {
          // Delete the old avatar file if it exists
          const oldAvatarPath = path.join(__dirname, '..', user.avatar);
          if (fs.existsSync(oldAvatarPath)) {
              fs.unlinkSync(oldAvatarPath);
          }
      }

      // Create the avatar URL
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;

      // Update user with new avatar URL
      const updatedUser = await userModel.findOneAndUpdate(
          { id: userId },
          { $set: { avatar: avatarUrl } },
          { new: true }
      );

      if (!updatedUser) {
          return res.status(404).json({ message: 'User not found' });
      }

      res.json({
          message: 'Avatar uploaded successfully',
          avatar: avatarUrl
      });
  } catch (error) {
      console.error('Error uploading avatar:', error);
      res.status(500).json({ message: 'Error uploading avatar', error: error.message });
  }
});

// Delete avatar
router.delete('/:userId/avatar', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Find user and get current avatar path
    const user = await userModel.findOne({ id: userId });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.avatar) {
      // Get the full path of the avatar file
      const avatarPath = path.join(__dirname, '..', user.avatar);
      
      // Delete the file if it exists
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
      
      // Update user document to remove avatar reference
      await userModel.findOneAndUpdate(
        { id: userId },
        { $set: { avatar: null } }
      );

      res.json({ message: 'Avatar deleted successfully' });
    } else {
      res.status(404).json({ message: 'No avatar found' });
    }
  } catch (error) {
    console.error('Error deleting avatar:', error);
    res.status(500).json({ message: 'Error deleting avatar', error: error.message });
  }
});

module.exports = router;