import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone,
  Calendar,
  Camera,
  Settings,
  Plus,
  Upload,
  LogOut,
  Trash2
} from 'lucide-react';
import axios from 'axios';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingImageFile, setPendingImageFile] = useState(null);
  const [pendingImagePreview, setPendingImagePreview] = useState(null);
  const [shouldDeleteImage, setShouldDeleteImage] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    createdAt: "",
    avatar: "/api/placeholder/200/200"
  });

  const [editedData, setEditedData] = useState(profileData);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const response = await axios.get(`http://localhost:3001/api/profile/${userId}`);
      const userData = response.data;

      const profileInfo = {
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        createdAt: new Date(userData.createdAt).toLocaleDateString('en-US', { 
          month: 'long',
          year: 'numeric',
          day: 'numeric'
        }),
        avatar: userData.avatar ? `http://localhost:3001${userData.avatar}` : "/api/placeholder/200/200"
      };

      setProfileData(profileInfo);
      setEditedData(profileInfo);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to load profile data');
      setIsLoading(false);
      showNotification('Failed to load profile data', 'error');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData(profileData);
    setPendingImageFile(null);
    setPendingImagePreview(null);
    setShouldDeleteImage(false);
  };

  const handleSave = async () => {
    try {
        const userId = localStorage.getItem('userId');

        // First update the profile data
        const response = await axios.put(`http://localhost:3001/api/profile/${userId}`, editedData);

        let updatedAvatarUrl = editedData.avatar;

        // Handle image changes if any
        if (shouldDeleteImage) {
            await axios.delete(`http://localhost:3001/api/profile/${userId}/avatar`);
            updatedAvatarUrl = "/api/placeholder/200/200";
        } else if (pendingImageFile) {
            const formData = new FormData();
            formData.append('avatar', pendingImageFile);
            const imageResponse = await axios.post(`http://localhost:3001/api/profile/${userId}/avatar`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            updatedAvatarUrl = imageResponse.data.avatar;
        }

        // Update localStorage with new data
        const updatedUserData = {
            ...JSON.parse(localStorage.getItem('userData')),
            ...editedData,
            avatar: updatedAvatarUrl
        };
        localStorage.setItem('userData', JSON.stringify(updatedUserData));

        setProfileData({
            ...editedData,
            avatar: updatedAvatarUrl
        });
        setIsEditing(false);
        setPendingImageFile(null);
        setPendingImagePreview(null);
        setShouldDeleteImage(false);
        showNotification("Profile updated successfully!", "success");

        // Force a reload of the page to update the navbar
        window.location.reload();
    } catch (err) {
        console.error('Error updating profile:', err);
        showNotification("Failed to update profile", "error");
    }
};

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(profileData);
    setPendingImageFile(null);
    setPendingImagePreview(null);
    setShouldDeleteImage(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPendingImageFile(file);
      setPendingImagePreview(URL.createObjectURL(file));
      setShouldDeleteImage(false);
    }
  };

  const handleDeleteAvatar = () => {
    setShouldDeleteImage(true);
    setPendingImageFile(null);
    setPendingImagePreview(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-800 to-teal-900 p-8">
      <div className="max-w-6xl mx-auto">
        {notification && (
          <div className={`mb-4 p-4 rounded-lg ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
            {notification.message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="md:col-span-1 bg-teal-800/50 backdrop-blur-sm border border-teal-600/20 rounded-lg">
            <div className="p-6">
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <img
                    src={
                      isEditing
                        ? (shouldDeleteImage
                          ? "/api/placeholder/200/200"
                          : (pendingImagePreview || profileData.avatar))
                        : profileData.avatar
                    }
                    alt=""
                    className="w-32 h-32 rounded-full object-cover border-4 border-teal-500"
                  />
                  {isEditing && (
                    <div className="absolute -bottom-2 right-0 flex gap-2">
                      <label className="bg-teal-500 p-2 rounded-full cursor-pointer hover:bg-teal-400 transition-colors">
                        <Camera className="w-5 h-5 text-white" />
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </label>
                      {(profileData.avatar !== "/api/placeholder/200/200" || pendingImagePreview) && !shouldDeleteImage && (
                        <button 
                          onClick={handleDeleteAvatar}
                          className="bg-red-500 p-2 rounded-full cursor-pointer hover:bg-red-400 transition-colors"
                        >
                          <Trash2 className="w-5 h-5 text-white" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <h2 className="mt-4 text-2xl font-bold text-white">{profileData.name}</h2>
                <div className="mt-6 w-full space-y-4">
                  <div className="flex items-center text-white">
                    <Mail className="w-5 h-5 mr-3 text-teal-400" />
                    <span>{profileData.email}</span>
                  </div>
                  <div className="flex items-center text-white">
                    <Phone className="w-5 h-5 mr-3 text-teal-400" />
                    <span>{profileData.phone}</span>
                  </div>
                  <div className="flex items-center text-white">
                    <Calendar className="w-5 h-5 mr-3 text-teal-400" />
                    <span>Joined {profileData.createdAt}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Edit Form */}
            <div className="bg-teal-800/50 backdrop-blur-sm border border-teal-600/20 rounded-lg">
              <div className="p-6">
                <div className="flex flex-row items-center justify-between mb-6">
                  <h3 className="text-xl text-white font-semibold">Profile Information</h3>
                  {!isEditing ? (
                    <button
                      onClick={handleEdit}
                      className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-400 transition-colors"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <div className="space-x-2">
                      <button
                        onClick={handleSave}
                        className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-400 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
                <div className="space-y-6">
                  {isEditing ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={editedData.name}
                        onChange={(e) => setEditedData({...editedData, name: e.target.value})}
                        className="w-full bg-teal-700/50 text-white p-3 rounded-md"
                        placeholder="Name"
                      />
                      <input
                        type="email"
                        value={editedData.email}
                        onChange={(e) => setEditedData({...editedData, email: e.target.value})}
                        className="w-full bg-teal-700/50 text-white p-3 rounded-md"
                        placeholder="Email"
                      />
                      <input
                        type="tel"
                        value={editedData.phone}
                        onChange={(e) => setEditedData({...editedData, phone: e.target.value})}
                        className="w-full bg-teal-700/50 text-white p-3 rounded-md"
                        placeholder="Phone"
                      />
                    </div>
                  ) : (
                    <div className="text-white">
                      <p className="mb-2"><span className="font-semibold">Name:</span> {profileData.name}</p>
                      <p className="mb-2"><span className="font-semibold">Email:</span> {profileData.email}</p>
                      <p className="mb-2"><span className="font-semibold">Phone:</span> {profileData.phone}</p>
                      <p><span className="font-semibold">Member since:</span> {profileData.createdAt}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              

              <div className="bg-teal-800/50 backdrop-blur-sm border border-teal-600/20 rounded-lg hover:bg-teal-700/50 transition-colors cursor-pointer">
                <div className="p-6 flex items-center space-x-4">
                  <Plus className="w-8 h-8 text-teal-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Add Data</h3>
                    <p className="text-sm text-teal-300">Manual Data Adding</p>
                  </div>
                </div>
              </div>

              <div className="bg-teal-800/50 backdrop-blur-sm border border-teal-600/20 rounded-lg hover:bg-teal-700/50 transition-colors cursor-pointer">
                <div className="p-6 flex items-center space-x-4">
                  <Upload className="w-8 h-8 text-teal-400" />
                  <div>
                    <Link to='/data'>
                      <h3 className="text-lg font-semibold text-white">Upload Data</h3>
                      <p className="text-sm text-teal-300">Upload CSV</p>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-8 flex justify-end">
          <button 
            onClick={() => {
              localStorage.removeItem('userId');
              window.location.href = '/';
            }}
            className="flex items-center space-x-2 bg-red-500 text-white px-6 py-3 rounded-md hover:bg-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;