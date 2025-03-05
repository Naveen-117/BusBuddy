import React from 'react';
import { Award, CheckCircle2, Calendar, ArrowRight, Clock } from 'lucide-react';

const TimelinePhase = ({ phase, isLast }) => (
  <div className="min-w-[280px] relative">
    <div className="mx-3 transform transition-all duration-300 hover:scale-105">
      {/* Card */}
      <div className="bg-white p-5 rounded-xl shadow-lg border-t-4" style={{ borderTopColor: phase.color }}>
        {/* Date */}
        <div className="flex items-center mb-3">
          <Calendar className="w-4 h-4 mr-2" style={{ color: phase.color }} />
          <span className="text-sm font-medium text-gray-600">{phase.date}</span>
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-bold mb-3 text-gray-800">{phase.title}</h3>
        
        {/* Tasks */}
        <div className="space-y-2">
          {phase.tasks.map((task, idx) => (
            <div key={idx} className="flex items-start">
              <CheckCircle2 className="w-4 h-4 mr-2 mt-1 flex-shrink-0" style={{ color: phase.color }} />
              <span className="text-sm text-gray-600">{task}</span>
            </div>
          ))}
        </div>

        {/* Milestone if exists */}
        {phase.milestone && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-dashed" style={{ borderColor: phase.color }}>
            <div className="flex items-center">
              <Award className="w-5 h-5 mr-2" style={{ color: phase.color }} />
              <span className="text-sm font-medium" style={{ color: phase.color }}>
                {phase.milestone}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Connector */}
      {!isLast && (
        <div className="absolute top-1/2 -right-2 transform -translate-y-1/2">
          <ArrowRight className="w-4 h-4 text-gray-400" />
        </div>
      )}
    </div>
  </div>
);

const Tm = () => {
  const phases = [
    {
      date: "09-12-24 to 11-12-24",
      title: "Project Initialization",
      color: "#2563EB",
      tasks: [
        "System analysis & requirements gathering",
        "Team role assignments",
        "Project scope definition"
      ],
      milestone: "Project Vision & Requirements Finalized"
    },
    {
      date: "12-12-24 to 14-12-24",
      title: "Setup Phase",
      color: "#7C3AED",
      tasks: [
        "Wireframe design completion",
        "Development environment setup",
        "Version control implementation"
      ],
      milestone: "Development Environment Ready"
    },
    {
      date: "19-12-24 to 21-12-24",
      title: "Core Development",
      color: "#059669",
      tasks: [
        "GTFS data integration",
        "Authentication system",
        "Basic frontend functionality"
      ],
      milestone: "Core Features Implementation Complete"
    },
    {
      date: "26-12-24 to 28-12-24",
      title: "Data Streaming",
      color: "#DC2626",
      tasks: [
        "Kafka infrastructure setup",
        "Real-time data processing",
        "Data pipeline implementation"
      ],
      milestone: "Real-time Data Processing Active"
    },
    {
      date: "02-01-25 to 04-01-25",
      title: "System Enhancement",
      color: "#0891B2",
      tasks: [
        "Performance optimization",
        "Error handling implementation",
        "System testing & validation"
      ],
      milestone: "System Stability Achieved"
    },
    {
      date: "09-01-25 to 11-01-25",
      title: "Historical Data",
      color: "#9333EA",
      tasks: [
        "Historical data integration",
        "Analytics implementation",
        "Reporting system setup"
      ],
      milestone: "Data Analytics Framework Complete"
    },
    {
      date: "16-01-25 to 18-01-25",
      title: "Map Integration",
      color: "#0D9488",
      tasks: [
        "Map visualization implementation",
        "Real-time tracking setup",
        "UI/UX refinements"
      ],
      milestone: "Interactive Map Features Deployed"
    }
  ];

  return (
    <div className="w-full bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold mb-2 text-center text-gray-800">BusBuddy Timeline</h1>
      <p className="text-center text-gray-600 mb-8">Development Progress & Milestones</p>
      
      {/* Current Status Badge */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full">
          <Clock className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">Project In Progress</span>
        </div>
      </div>
      
      <div className="relative">
        {/* Main timeline container */}
        <div className="flex overflow-x-auto pb-8 pt-4 px-4">
          {phases.map((phase, index) => (
            <TimelinePhase 
              key={index} 
              phase={phase} 
              isLast={index === phases.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tm;