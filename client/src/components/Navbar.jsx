import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user data from localStorage on component mount
    const storedData = localStorage.getItem('userData');
    if (storedData) {
        setUserData(JSON.parse(storedData));
    }

    // Add event listener for localStorage changes
    const handleStorageChange = () => {
        const updatedData = localStorage.getItem('userData');
        if (updatedData) {
            setUserData(JSON.parse(updatedData));
        }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
}, []);

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '';
  };

  const handleAvatarClick = () => {
    if (userData) {
      navigate('/profile');
    } else {
      navigate('/');
    }
  };

  return (
    <header className="bg-teal-700 shadow-[0_8px_15px_-3px_rgba(0,0,0,0.4)] relative z-50">
      <div className="flex items-center justify-between max-w-6xl mx-auto p-4 h-[100px]">
        {/* Left Section: Logo and App Name */}
        <div className="flex items-center">
          <img
            src="./logo.png"
            alt="logo"
            className="h-[110px] w-[120px] object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.4)]"
          />
          <span className="text-white text-4xl font-bold ml-6 drop-shadow-[0_4px_4px_rgba(0,0,0,0.4)]">
            BusBuddy
          </span>
        </div>

        {/* Search Bar */}
        <div className="flex-grow mx-6">
          <input
            type="text"
            placeholder="Search"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-[0_4px_8px_-2px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_12px_-2px_rgba(0,0,0,0.4)] transition-shadow duration-300"
          />
        </div>

        {/* Right Section: Navigation and Avatar/Sign In */}
        <ul className="flex items-center gap-8 ml-auto">
          <Link to="/home">
            <li className="text-white font-semibold text-base px-3 py-2 hover:text-teal-300 transition-colors duration-200 drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
              Home
            </li>
          </Link>
          <Link to="/about">
            <li className="text-white font-semibold text-base px-3 py-2 hover:text-teal-300 transition-colors duration-200 drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
              About
            </li>
          </Link>
          <li>
            {userData ? (
              <button
                onClick={handleAvatarClick}
                className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {userData.avatar && userData.avatar !== "/api/placeholder/200/200" ? (
    <img
        src={userData.avatar.startsWith('http') 
            ? userData.avatar 
            : `http://localhost:3001${userData.avatar}`}
        alt="Profile"
        className="w-full h-full object-cover"
    />
) : (
    <div className="w-full h-full bg-teal-500 flex items-center justify-center text-white font-semibold text-lg">
        {getInitial(userData.name)}
    </div>
)}
              </button>
            ) : (
              <Link to="/">
                <button className="bg-white text-teal-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-200 shadow-[0_4px_8px_-2px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_15px_-3px_rgba(0,0,0,0.5)] transition-all duration-300 text-base">
                  Sign In
                </button>
              </Link>
            )}
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Navbar;