import React from 'react';

export default function BackgroundEffect() {
  return (
    <div className="fixed inset-0 min-h-screen bg-[#020617] overflow-hidden -z-10">
      {/* Dynamic Radial Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#3b82f6]/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#0ea5e9]/10 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-[#10b981]/5 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '5s' }} />

      {/* SVG Radial Waves */}
      <svg
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] opacity-20 pointer-events-none"
        viewBox="0 0 1000 1000"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="500" cy="500" r="100" stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="10 20" className="animate-[spin_20s_linear_infinite]" />
        <circle cx="500" cy="500" r="200" stroke="#0ea5e9" strokeWidth="0.5" strokeDasharray="5 15" className="animate-[spin_30s_linear_infinite_reverse]" />
        <circle cx="500" cy="500" r="300" stroke="#10b981" strokeWidth="1" strokeDasharray="2 10" className="animate-[spin_40s_linear_infinite]" />
        <circle cx="500" cy="500" r="400" stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="50 100" className="animate-[spin_50s_linear_infinite_reverse]" />
        <circle cx="500" cy="500" r="500" stroke="#6366f1" strokeWidth="0.5" strokeDasharray="1 30" className="animate-[spin_60s_linear_infinite]" />
        
        {/* Animated Digital Arcs */}
        <path
          d="M 500 200 A 300 300 0 0 1 800 500"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeLinecap="round"
          className="animate-pulse"
        />
        <path
          d="M 200 500 A 300 300 0 0 1 500 200"
          stroke="#0ea5e9"
          strokeWidth="1"
          strokeLinecap="round"
          className="animate-pulse"
          style={{ animationDelay: '1s' }}
        />
        <path
          d="M 500 800 A 300 300 0 0 1 200 500"
          stroke="#10b981"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="animate-pulse"
          style={{ animationDelay: '2s' }}
        />
      </svg>

      {/* Subtle Digital Grid */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Finishing Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#020617] via-transparent to-transparent opacity-60" />
    </div>
  );
}
