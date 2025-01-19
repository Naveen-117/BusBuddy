import React from 'react';

const Bus = () => {
  return (
    <div className="w-screen relative">
      <div className="relative w-full h-[300px] bg-gradient-to-br from-teal-50/10 to-teal-100/10 overflow-hidden backdrop-blur-sm">
        <svg 
          viewBox="0 0 2000 300" 
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="trackDepth" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#115e59' }} />
              <stop offset="100%" style={{ stopColor: '#134e4a' }} />
            </linearGradient>
            
            <path
              id="motionPath"
              d="M0 200 Q 1000 50 2000 200"
              fill="none"
              stroke="none"
            />
          </defs>

          {/* Track shadow */}
          <path
            d="M0 205 Q 1000 55 2000 205"
            className="stroke-[45] stroke-teal-900/20 blur-sm"
            strokeLinecap="round"
            fill="none"
          />

          {/* Track depth bottom layer */}
          <path
            d="M0 203 Q 1000 53 2000 203"
            className="stroke-[40]"
            style={{ stroke: 'url(#trackDepth)' }}
            strokeLinecap="round"
            fill="none"
          />

          {/* Main track surface */}
          <path
            d="M0 200 Q 1000 50 2000 200"
            className="stroke-[35] stroke-teal-600"
            strokeLinecap="round"
            fill="none"
          />

          {/* Track highlight */}
          <path
            d="M0 198 Q 1000 48 2000 198"
            className="stroke-[30] stroke-teal-500"
            strokeLinecap="round"
            fill="none"
          />

          {/* Track top shine */}
          <path
            d="M0 196 Q 1000 46 2000 196"
            className="stroke-[25] stroke-teal-400/50"
            strokeLinecap="round"
            fill="none"
          />

          {/* Moving highlight */}
          <path
            d="M0 195 Q 1000 45 2000 195"
            className="stroke-[20]"
            strokeLinecap="round"
            fill="none"
          >
            <animate
              attributeName="stroke"
              values="#f97316;#fb923c;#f97316"
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="stroke-dasharray"
              values="0 3000;100 3000"
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="stroke-dashoffset"
              values="3000;-3000"
              dur="6s"
              repeatCount="indefinite"
            />
          </path>

          {/* Animated bus */}
          <g>
            <animateMotion
              dur="6s"
              repeatCount="indefinite"
              rotate="auto"
            >
              <mpath href="#motionPath" />
            </animateMotion>
            
            <g transform="translate(-20, -15)">
              {/* Bus shadow */}
              <rect 
                x="2"
                y="20"
                width="36" 
                height="4" 
                rx="2"
                className="fill-teal-900/20 blur-sm"
              />
              {/* Bus body */}
              <rect 
                width="40" 
                height="20" 
                rx="4"
                className="fill-teal-600"
              />
              {/* Windows */}
              <rect 
                x="4"
                y="4"
                width="25" 
                height="8" 
                rx="2"
                className="fill-teal-100"
              />
              {/* Wheels */}
              <circle 
                cx="10" 
                cy="20" 
                r="3" 
                className="fill-teal-900"
              />
              <circle 
                cx="30" 
                cy="20" 
                r="3" 
                className="fill-teal-900"
              />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
};

export default Bus;