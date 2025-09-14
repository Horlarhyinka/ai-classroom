'use client'

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, MessageCircle } from 'lucide-react';
import Button from './ui/Button';
import { LectureSection } from '../types';

interface LectureContentProps {
  section: LectureSection;
  onAskQuestion: (sectionId: string) => void;
}

const LectureContent: React.FC<LectureContentProps> = ({ section, onAskQuestion }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Simulate speech playback
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 0.5;
          if (newProgress >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return newProgress;
        });
        
        // Simulate text highlighting/scrolling during playback
        if (contentRef.current) {
          const totalLength = section.content.length;
          const newPosition = Math.floor((progress / 100) * totalLength);
          setCurrentPosition(newPosition);
          
          // Auto-scroll as content is read
          const highlightedText = contentRef.current.querySelector('.highlighted-text');
          if (highlightedText) {
            highlightedText.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 100);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, progress, section.content]);
  
  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  const renderHighlightedContent = () => {
    if (currentPosition === 0) return section.content;
    
    const beforeHighlight = section.content.substring(0, currentPosition);
    const highlighted = section.content.substring(currentPosition, currentPosition + 30);
    const afterHighlight = section.content.substring(currentPosition + 30);
    
    return (
      <>
        {beforeHighlight}
        <span className="highlighted-text bg-primary-100 font-medium">{highlighted}</span>
        {afterHighlight}
      </>
    );
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-apple-sm border border-gray-100 overflow-hidden"
    >
      <div className="border-b border-gray-100 p-4">
        <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
      </div>
      
      <div className="p-6" ref={contentRef}>
        <p className="text-gray-800 leading-relaxed">
          {renderHighlightedContent()}
        </p>
      </div>
      
      <div className="border-t border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              size="sm"
              variant="ghost"
              className="rounded-full h-10 w-10 p-0 flex items-center justify-center"
              onClick={togglePlayback}
              icon={isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            />
            <Button
              size="sm"
              variant="ghost"
              className="rounded-full h-10 w-10 p-0 flex items-center justify-center"
              onClick={toggleMute}
              icon={isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            />
          </div>
          
          <div className="flex-1 mx-4">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAskQuestion(section.id)}
            icon={<MessageCircle className="h-4 w-4" />}
          >
            Ask
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default LectureContent;