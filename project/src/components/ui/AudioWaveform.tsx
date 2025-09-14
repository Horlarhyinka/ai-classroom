'use client'

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface AudioWaveformProps {
  isPlaying: boolean;
  isLoading?: boolean;
  className?: string;
  color?: 'green' | 'blue' | 'primary';
  size?: 'sm' | 'md' | 'lg';
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({ 
  isPlaying, 
  isLoading = false,
  className = '',
  color = 'green',
  size = 'sm'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const dimensions = {
    sm: { width: 60, height: 20, bars: 12 },
    md: { width: 80, height: 24, bars: 16 },
    lg: { width: 100, height: 30, bars: 20 }
  };

  const colors = {
    green: ['#10B981', '#059669'],
    blue: ['#3B82F6', '#2563EB'],
    primary: ['#6366F1', '#4F46E5']
  };

  const { width, height, bars } = dimensions[size];
  const [lightColor, darkColor] = colors[color];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    const barWidth = width / bars;
    let dataArray = new Array(bars).fill(0).map(() => Math.random() * 0.5 + 0.2);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, lightColor);
      gradient.addColorStop(1, darkColor);
      
      ctx.fillStyle = gradient;

      for (let i = 0; i < bars; i++) {
        if (isPlaying && !isLoading) {
          // Animate bars when playing - more dynamic movement
          const baseHeight = 0.3;
          const variation = Math.sin(Date.now() * 0.01 + i * 0.5) * 0.4 + 0.4;
          dataArray[i] = baseHeight + variation * 0.7;
        } else if (isLoading) {
          // Gentle pulse when loading
          const pulse = Math.sin(Date.now() * 0.005 + i * 0.3) * 0.2 + 0.4;
          dataArray[i] = pulse;
        } else {
          // Gradually reduce to baseline when stopped
          dataArray[i] = Math.max(dataArray[i] * 0.95, 0.1);
        }
        
        const barHeight = dataArray[i] * height;
        const x = i * barWidth;
        const y = height - barHeight;
        
        // Add some spacing between bars
        const actualBarWidth = barWidth - 1;
        ctx.fillRect(x, y, actualBarWidth, barHeight);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, isLoading, width, height, bars, lightColor, darkColor]);

  if (isPlaying) {
    return (
      <div className={`flex items-center space-x-1 ${className}`}>
        <div className="flex space-x-0.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={`w-1 bg-gray-400 rounded-full`}
              animate={{
                height: [4, 12, 4],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.canvas
      ref={canvasRef}
      className={`rounded ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      style={{ width, height }}
    />
  );
};

export default AudioWaveform;