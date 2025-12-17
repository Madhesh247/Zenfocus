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

  return (
    <div className="relative flex items-center justify-center">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="rotate-[-90deg] transition-all duration-500"
      >
        {/* Background Ring */}
        <circle
          stroke="currentColor"
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="text-slate-800"
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
          className={colorClass}
          style={{ strokeDasharray: circumference + ' ' + circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: "linear" }}
        />
      </svg>
    </div>
  );
};

export default TimerRing;