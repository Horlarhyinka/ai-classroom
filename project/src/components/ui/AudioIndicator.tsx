'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import AudioWaveform from './AudioWaveform';

interface AudioIndicatorProps {
  isPlaying: boolean;
  isLoading: boolean;
  isMuted: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showWaveform?: boolean;
  color?: 'green' | 'blue' | 'primary';
}

const AudioIndicator: React.FC<AudioIndicatorProps> = ({
  isPlaying,
  isLoading,
  isMuted,
  className = '',
  size = 'sm',
  showWaveform = true,
  color = 'green'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Loader2 className={`${sizeClasses[size]} animate-spin text-primary-500`} />
        {showWaveform && (
          <AudioWaveform
            isPlaying={false}
            isLoading={true}
            size={size}
            color={color}
          />
        )}
        <span className="text-xs text-gray-500">Loading...</span>
      </div>
    );
  }

  if (isMuted) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <VolumeX className={`${sizeClasses[size]} text-gray-400`} />
        <span className="text-xs text-gray-400">Muted</span>
      </div>
    );
  }

  if (isPlaying) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Volume2 className={`${sizeClasses[size]} text-green-500`} />
        {showWaveform && (
          <AudioWaveform
            isPlaying={true}
            isLoading={false}
            size={size}
            color={color}
          />
        )}
        <span className="text-xs text-green-600">Playing</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Volume2 className={`${sizeClasses[size]} text-gray-400`} />
      <span className="text-xs text-gray-400">Ready</span>
    </div>
  );
};

export default AudioIndicator;