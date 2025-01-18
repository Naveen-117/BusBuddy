import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Slide from '../components/Slide';

const HomePage = () => {
  const [hovered, setHovered] = useState(null);

  const handleMouseEnter = (button) => {
    setHovered(button);
  };

  const handleMouseLeave = () => {
    setHovered(null);
  };

  const imageMap = {
    platform: '/Platform.png',
    planning: '/images/planning-image.jpg',
    scheduling: '/images/scheduling-image.jpg',
    operations: '/images/operations-image.jpg',
    map: '/images/map-image.jpg',
  };

  const renderButton = (item) => {
    const button = (
      <button className="btn bg-teal-600 text-white py-3 px-8 rounded-full border-2 hover:bg-white hover:text-teal-600 border-teal-600 transition-all duration-300 ease-in-out font-semibold text-lg">
        {item.toUpperCase()}
      </button>
    );

    if (item === 'operations') {
      return <Link to="/real">{button}</Link>;
    } else if (item === 'map') {
      return <Link to="/map">{button}</Link>;
    }
    return button;
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center bg-teal-800 relative"
      style={{
        overflowY: 'auto',
      }}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(/bgimage.jpg)',
          opacity: 0.7,
          zIndex: -1,
        }}
      ></div>

      {/* Introduction Section */}
      <div className="w-full bg-teal-700 text-white py-12 px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">
          Making Public Transportation Better. Together.
        </h1>
        <p className="text-xl max-w-2xl mx-auto">
          An end-to-end transportation management software for more equitable, sustainable, and efficient transportation services for agencies, operators, cities, drivers, and passengers.
        </p>
      </div>

      {/* Slide Component */}
      <Slide />

      {/* Image Container - Always present */}
      <div
        className="relative flex justify-center items-center mt-8"
        style={{
          width: '900px',
          height: '400px',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
        }}
      >
        {hovered && (
          <img
            src={imageMap[hovered]}
            alt={hovered}
            className="w-full h-full object-cover rounded-lg shadow-lg"
            style={{
              transition: 'opacity 0.3s ease-in-out',
            }}
          />
        )}
      </div>

      {/* Button Group */}
      <div className="flex justify-center flex-wrap mt-10 gap-8 pb-10">
        {['platform', 'planning', 'scheduling', 'operations', 'map'].map((item) => (
          <div
            key={item}
            className="group relative"
            onMouseEnter={() => handleMouseEnter(item)}
            onMouseLeave={handleMouseLeave}
          >
            {renderButton(item)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;