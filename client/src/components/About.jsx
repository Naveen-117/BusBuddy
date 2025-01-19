import React, { useEffect, useState } from 'react';
import { Bus, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
const AboutPage = () => {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY;
      setScrollPosition(position);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const services = [
    {
      title: "Planning",
      description: [
        "Design and manage bus routes effortlessly through an intuitive map-based interface",
        "Add and store critical route details such as stops, distances, and timings",
        "Enhance route planning with comprehensive integration of passenger demand data"
      ]
    },
    {
      title: "Scheduling",
      description: [
        "Automate scheduling using real-time data from our advanced machine learning models",
        "Manually assign bus schedules to address specific needs or emergency situations",
        "Ensure adherence to optimized schedules for improved efficiency"
      ]
    },
    {
      title: "Operations",
      description: [
        "Get a clear overview of your fleet with real-time tracking of buses",
        "Monitor bus operations and resolve issues promptly with actionable insights",
        "Maintain seamless communication between operators and agencies"
      ]
    },
    {
      title: "Statistics",
      description: [
        "Gain valuable insights into your network and passenger trends",
        "Access analytics dashboards for route-wise statistics",
        "Drive informed decisions with robust data on your agency's assets"
      ]
    }
  ];

  // Calculate bus position based on scroll percentage
  const busPosition = Math.min((scrollPosition / (document.body.scrollHeight - window.innerHeight)) * 100, 100);

  return (
    <div className="min-h-screen bg-teal-700 text-white relative">
      {/* Animated Road Navigation Bar */}
      <div className="sticky top-0 w-full h-16 bg-teal-800 shadow-lg z-50">
        <div className="relative w-full h-full">
          {/* Road Design */}
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-2 bg-gray-600">
              {/* Dashed Lines */}
              <div className="h-0.5 w-full bg-gradient-to-r from-white via-white to-white bg-[length:20px_1px] bg-repeat-x" />
            </div>
          </div>
          
          {/* Animated Bus */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 transition-all duration-300"
            style={{ 
              left: `${busPosition}%`,
              transform: `translate(-50%, -50%) scaleX(1)`
            }}
          >
            <Bus size={32} className="text-white" />
          </div>

          {/* Navigation Points */}
          <div className="absolute inset-0 flex justify-between items-center px-8">
            {['About', 'Core Models', 'Services', 'Team'].map((item, idx) => (
              <div 
                key={idx}
                className={`h-3 w-3 rounded-full bg-white ${
                  busPosition >= (idx * 33.3) ? 'bg-opacity-100' : 'bg-opacity-50'
                } transition-all duration-300`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="mb-16 space-y-6">
          <h1 className="text-5xl font-bold mb-8 animate-fade-in">About BusBuddy</h1>
          <p className="text-xl leading-relaxed">
            Welcome to BusBuddy, your comprehensive solution for modernizing urban public transportation management.
          </p>
        </div>

        {/* Core Models Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-semibold mb-8">Our Core Models</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {['Passenger Demand Forecasting', 'Frequency Optimization', 'Scheduling Optimization'].map((model, idx) => (
              <div key={idx} className="bg-teal-600/30 backdrop-blur-sm p-6 rounded-lg hover:transform hover:scale-105 transition-all">
                <h3 className="text-xl font-semibold mb-4">{model} Model</h3>
                <div className="h-1 w-20 bg-white mb-4" />
              </div>
            ))}
          </div>
        </div>

        {/* Services Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-semibold mb-8">Our Services</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, idx) => (
              <div key={idx} className="bg-teal-600/30 backdrop-blur-sm p-6 rounded-lg group hover:bg-teal-600/40 transition-all">
                <h3 className="text-2xl font-semibold mb-4">{service.title}</h3>
                <ul className="space-y-3 mb-6">
                  {service.description.map((item, i) => (
                    <li key={i} className="flex items-start">
                      <ChevronRight className="mt-1 mr-2 flex-shrink-0" size={16} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <button className="bg-white text-teal-700 px-6 py-2 rounded-full font-semibold 
                                 hover:bg-teal-100 transition-all flex items-center group">
                  Learn More 
                  <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Who We Are Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-semibold mb-8">Who We Are</h2>
          <div className="bg-teal-600/30 backdrop-blur-sm p-8 rounded-lg">
            <p className="text-lg leading-relaxed mb-6">
              At BusBuddy, we are a passionate team of transportation enthusiasts, data scientists, and engineers, 
              dedicated to transforming urban mobility. Our mission is to simplify public transit management by offering 
              state-of-the-art tools and technologies tailored to the unique challenges of urban environments.
            </p>
            <p className="text-lg leading-relaxed">
              With BusBuddy, public transportation becomes more efficient, sustainable, and user-friendly. Whether you're 
              a transit agency, a city planner, or a commuter-focused organization, BusBuddy is here to help you make 
              the most of your resources and deliver exceptional services to your passengers.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <Link to='/home'>
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Let's drive the future of public transportation together!</h2>
          <button className="bg-white text-teal-700 px-8 py-3 rounded-full font-semibold text-lg
                           hover:bg-teal-100 transition-all inline-flex items-center group">
            Get Started 
            <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        </Link>
      </div>
    </div>
  );
};

export default AboutPage;