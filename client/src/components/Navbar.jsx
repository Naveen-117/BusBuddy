import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <header className="bg-teal-700 shadow-[0_8px_15px_-3px_rgba(0,0,0,0.4)] relative z-50">
      <div className="flex items-center justify-between max-w-6xl mx-auto p-4 h-[100px]"> {/* Increased height */}
        {/* Left Section: Logo and App Name */}
        <div className="flex items-center">
          <img
            src="./logo.png"
            alt="logo"
            className="h-[110px] w-[120px] object-contain drop-shadow-[0_4px_4px_rgba(0,0,0,0.4)]" // Increased from 50px to 70px
          />
          <span className="text-white text-4xl font-bold ml-6 drop-shadow-[0_4px_4px_rgba(0,0,0,0.4)]">BusBuddy</span> {/* Increased text size and margin */}
        </div>

        {/* Search Bar */}
        <div className="flex-grow mx-6"> {/* Increased margin */}
          <input
            type="text"
            placeholder="Search"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-[0_4px_8px_-2px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_12px_-2px_rgba(0,0,0,0.4)] transition-shadow duration-300"
          />
        </div>

        {/* Right Section: Navigation and Actions */}
        <ul className="flex items-center gap-8 ml-auto"> {/* Increased gap */}
          <Link to="/home">
            <li className="text-white font-semibold text-base px-3 py-2 hover:text-teal-300 transition-colors duration-200 drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]"> {/* Increased text size */}
              Home
            </li>
          </Link>
          <Link to="/about">
            <li className="text-white font-semibold text-base px-3 py-2 hover:text-teal-300 transition-colors duration-200 drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]"> {/* Increased text size */}
              About
            </li>
          </Link>
          <Link to="/">
            <li>
              <button className="bg-white text-teal-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-200 shadow-[0_4px_8px_-2px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_15px_-3px_rgba(0,0,0,0.5)] transition-all duration-300 text-base"> {/* Increased padding and text size */}
                Sign In
              </button>
            </li>
          </Link>
        </ul>
      </div>
    </header>
  );
};

export default Navbar;