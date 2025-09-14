'use client'

import React from 'react';
import { motion } from 'framer-motion';

interface VoiceIndicatorProps {
  isActive: boolean;
  role: 'teacher' | 'student' | 'user';
  className?: string;
}

const VoiceIndicator: React.FC<VoiceIndicatorProps> = ({ 
  isActive, 
  role, 
  className = '' 
}) => {
  const getColor = () => {
    switch (role) {
      case 'teacher': return '#3B82F6';
      case 'student': return '#14B8A6';
      case 'user': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1 bg-current rounded-full"
          style={{ color: getColor() }}
          animate={{
            height: isActive ? [4, 16, 4] : 4,
            opacity: isActive ? [0.4, 1, 0.4] : 0.3,
          }}
          transition={{
            duration: 0.8,
            repeat: isActive ? Infinity : 0,
            delay: i * 0.1,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

export default VoiceIndicator;