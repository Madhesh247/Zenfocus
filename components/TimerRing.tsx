import React from 'react';
import { motion } from 'framer-motion';

interface TimerRingProps {
  radius: number;
  stroke: number;
  progress: number; // 0 to 100
  colorClass: string;
}

const TimerRing: React.FC<TimerRingProps> = ({ radius, stroke, progress, colorClass }) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  // Extract the color name (e.g., 'stroke-indigo-400') to use for the shadow/glow
  const isComplete = progress >= 100;

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer Glow Blur Layer */}
      <motion.div 
        className={`absolute inset-0 rounded-full blur-xl opacity-20 ${colorClass.replace('stroke-', 'bg-')}`}
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />

      <svg
        height={radius * 2}
        width={radius * 2}
        className="rotate-[-90deg] transition-all duration-500 relative z-10"
      >
        {/* Background Ring */}
        <circle
          stroke="currentColor"
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="text-slate-800/50"
        />
        {/* Progress Ring */}
        <motion.circle
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className={`${colorClass} drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]`}
          style={{ strokeDasharray: circumference + ' ' + circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: "linear" }}
        />
      </svg>
    </div>
  );
};

export default TimerRing;