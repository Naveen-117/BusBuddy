import React, { useState } from 'react';
import Slide from '../components/Slide';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const [hovered, setHovered] = useState(null); // State to track which button is hovered

  const handleMouseEnter = (button) => {
    setHovered(button); // Set the hovered button
  };

  const handleMouseLeave = () => {
    setHovered(null); // Reset when mouse leaves
  };

  // Image mapping for each button
  const imageMap = {
    platform: '/Platform.png',
    planning: '/images/planning-image.jpg',
    scheduling: '/images/scheduling-image.jpg',
    operations: '/images/operations-image.jpg',
    map: '/images/map-image.jpg',
  };

  return (
    <div className="container text-center mt-5">
      <div className="d-flex align-items-center justify-content-center" style={{ height: '100vh' }}>
        <div>
          <h1
            className="text-6xl font-extrabold text-primary"
            style={{
              textShadow: '2px 2px 8px rgba(0, 0, 0, 0.2)',
              letterSpacing: '2px',
            }}
          >
            BusBuddy
          </h1>
          <p className="mt-3 lead text-secondary">
            Your Smart Public Transportation Companion
          </p>
          <Slide />
          
          {/* Image Box Above the Buttons with Smooth Transition */}
          <div
            className="relative"
            style={{ marginTop: '100px', transition: 'opacity 0.3s ease-in-out', opacity: hovered ? 1 : 0 }}
          >
            {hovered && (
              <div
                className="absolute top-0 left-1/2 transform -translate-x-1/2 w-80 h-48 bg-gray-800 rounded-lg opacity-100"
                style={{ width: '900px', height: '400px' }}
              >
                <img
                  src={imageMap[hovered]} // Dynamically set image source based on the hovered button
                  alt={hovered}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            )}
          </div>
          
          {/* Button Group Below the Image Box */}
          <div className="flex justify-center" style={{ marginTop: '700px', gap: '50px' }}>
            <div
              className="group relative"
              onMouseEnter={() => handleMouseEnter('platform')}
              onMouseLeave={handleMouseLeave}
            >
              <button className="btn bg-blue-600 text-white py-2 px-4 rounded-full border-2 hover:bg-white border-blue-600 hover:text-blue-600 transition-all duration-300 ease-in-out font-semibold">
                PLATFORM
              </button>
            </div>

            <div
              className="group relative"
              onMouseEnter={() => handleMouseEnter('planning')}
              onMouseLeave={handleMouseLeave}
            >
              <button className="btn bg-blue-600 text-white py-2 px-4 rounded-full border-2 hover:bg-white border-blue-600 hover:text-blue-600 transition-all duration-300 ease-in-out font-semibold">
                PLANNING
              </button>
            </div>

            <div
              className="group relative"
              onMouseEnter={() => handleMouseEnter('scheduling')}
              onMouseLeave={handleMouseLeave}
            >
              <button className="btn bg-blue-600 text-white py-2 px-4 rounded-full border-2 hover:bg-white border-blue-600 hover:text-blue-600 transition-all duration-300 ease-in-out font-semibold">
                SCHEDULING
              </button>
            </div>

            <div
              className="group relative"
              onMouseEnter={() => handleMouseEnter('operations')}
              onMouseLeave={handleMouseLeave}
            >
              <Link to='/real'>
              <button className="btn bg-blue-600 text-white py-2 px-4 rounded-full border-2 hover:bg-white border-blue-600 hover:text-blue-600 transition-all duration-300 ease-in-out font-semibold">
                OPERATIONS
              </button>
              </Link>
            </div>

            <div
              className="group relative"
              onMouseEnter={() => handleMouseEnter('map')}
              onMouseLeave={handleMouseLeave}
            >
              <Link to='/map'>
              <button className="btn bg-blue-600 text-white py-2 px-4 rounded-full border-2 hover:bg-white border-blue-600 hover:text-blue-600 transition-all duration-300 ease-in-out font-semibold">
                MAP
              </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
