import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Bus from '../components/Slide';
import { TrendingUp, Clock, MapPin, Shield } from 'lucide-react';

const HomePage = () => {
  const [hovered, setHovered] = useState('statistics');
  
  const handleMouseEnter = (button) => {
    setHovered(button);
  };

  const handleMouseLeave = () => {
    setHovered('statistics');
  };

  const quotes = [
    {
      text: "Making public transportation better isn't just about moving people—it's about moving communities forward.",
      highlight: "moving communities forward"
    },
    {
      text: "Every bus route optimized, every schedule refined, and every passenger journey enhanced represents our commitment to sustainable urban mobility.",
      highlight: "sustainable urban mobility"
    },
    {
      text: "When we improve public transportation, we're not just building better transit systems—we're building more equitable cities.",
      highlight: "building more equitable cities"
    }
  ];

  const features = [
    {
      icon: <TrendingUp className="w-12 h-12 text-teal-300" />,
      title: "Real-Time Analytics",
      description: "Monitor fleet performance, passenger trends, and service efficiency with advanced analytics dashboards.",
      color: "from-teal-500/20 to-emerald-500/20"
    },
    {
      icon: <Clock className="w-12 h-12 text-teal-300" />,
      title: "Smart Scheduling",
      description: "Optimize routes and timetables automatically based on historical data and real-time conditions.",
      color: "from-teal-500/20 to-cyan-500/20"
    },
    {
      icon: <MapPin className="w-12 h-12 text-teal-300" />,
      title: "Dynamic Route Planning",
      description: "Adapt routes intelligently to meet changing passenger demands and traffic patterns.",
      color: "from-emerald-500/20 to-teal-500/20"
    },
    {
      icon: <Shield className="w-12 h-12 text-teal-300" />,
      title: "Reliable Operations",
      description: "Ensure consistent service delivery with advanced monitoring and instant incident response.",
      color: "from-cyan-500/20 to-teal-500/20"
    }
  ];

  const imageMap = {
    statistics: '/statistics.png',
    planning: '/planning.png',
    scheduling: '/platform.png',
    operations: '/operation.png',
    map: '/images/map-image.jpg',
  };

  const renderButton = (item) => {
    const isHovered = hovered === item;
    const buttonClasses = `btn ${
      isHovered 
        ? 'bg-white text-teal-600' 
        : 'bg-teal-600 text-white'
    } py-3 px-8 rounded-full border-2 hover:bg-white hover:text-teal-600 border-teal-600 transition-all duration-300 ease-in-out font-semibold text-lg`;

    const button = (
      <button className={buttonClasses}>
        {item.toUpperCase()}
      </button>
    );

    if (item === 'operations') {
      return <Link to="/driver">{button}</Link>;
    } else if (item === 'planning') {
      return <Link to="/map">{button}</Link>;
    } else if (item === 'statistics') {
      return <Link to="/Dash">{button}</Link>;
    } else if (item === 'scheduling') {
      return <Link to="/platform">{button}</Link>;
    }
    return button;
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-gradient-to-b from-teal-800 to-teal-900 relative">
      {/* Introduction Section */}
      <div className="w-full bg-teal-700 text-white py-16 px-4 text-center shadow-lg">
        <h1 className="text-5xl font-bold mb-6 animate-fade-in">
          Making Public Transportation Better. Together.
        </h1>
        <p className="text-xl max-w-3xl mx-auto leading-relaxed">
          An end-to-end transportation management software for more equitable, sustainable, and efficient transportation services for agencies, operators, cities, drivers, and passengers.
        </p>
      </div>

      {/* Quotes Section */}
      <div className="w-full max-w-6xl mx-auto py-12 px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {quotes.map((quote, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-xl transform hover:scale-105 transition-all duration-300">
              <p className="text-white text-lg leading-relaxed">
                {quote.text.split(quote.highlight).map((part, i, arr) => (
                  <React.Fragment key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <span className="text-teal-300 font-semibold">{quote.highlight}</span>
                    )}
                  </React.Fragment>
                ))}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Slide Component */}
      <Bus />

      {/* Features Section */}
      <div className="w-full max-w-7xl mx-auto py-16 px-4">
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          Transforming Public Transit
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="relative group"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-2xl blur opacity-50 group-hover:opacity-100 transition-opacity duration-300`}></div>
              <div className="relative bg-teal-900/50 backdrop-blur-sm rounded-2xl p-6 h-full border border-teal-500/20 hover:border-teal-400/40 transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex flex-col items-center text-center space-y-4">
                  {feature.icon}
                  <h3 className="text-xl font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="text-teal-100/80">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Image Container */}
      <div
        className="relative flex justify-center items-center mt-8"
        style={{
          width: '900px',
          height: '400px',
          opacity: 1,
          transition: 'opacity 0.3s ease-in-out',
        }}
      >
        <img
          src={imageMap[hovered]}
          alt={hovered}
          className="w-full h-full object-cover rounded-lg shadow-lg"
          style={{
            transition: 'opacity 0.3s ease-in-out',
          }}
        />
      </div>

      {/* Button Group */}
      <div className="flex justify-center flex-wrap mt-10 gap-8 pb-16">
        {['statistics', 'planning', 'scheduling', 'operations'].map((item) => (
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