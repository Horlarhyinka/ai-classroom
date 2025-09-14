'use client'

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Square, 
  SkipForward, 
  SkipBack,
  Settings,
  Volume2,
  VolumeX,
  Loader2,
  BookOpen,
  Eye,
  EyeOff
} from 'lucide-react';
import Button from './Button';
import { Card, CardContent } from './Card';
import { ttsService, getSpeechStatus } from '../../utils/textToSpeech';

interface AutoReadModeProps {
  content: string[];
  titles?: string[];
  persona?: 'teacher' | 'student' | 'narrator';
  autoStart?: boolean;
  onSectionChange?: (index: number) => void;
  onComplete?: () => void;
  className?: string;
}

const AutoReadMode: React.FC<AutoReadModeProps> = ({
  content,
  titles = [],
  persona = 'narrator',
  autoStart = false,
  onSectionChange,
  onComplete,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showVisualHighlight, setShowVisualHighlight] = useState(true);
  const [readingSpeed, setReadingSpeed] = useState(1.0);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [highlightedText, setHighlightedText] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout>();
  const wordsRef = useRef<string[]>([]);

  // Initialize words for current content
  useEffect(() => {
    if (content[currentIndex]) {
      wordsRef.current = content[currentIndex].split(/\s+/);
      setCurrentWordIndex(0);
    }
  }, [currentIndex, content]);

  // Auto-start effect
  useEffect(() => {
    if (autoStart && content.length > 0) {
      handlePlay();
    }
  }, [autoStart, content]);

  // Monitor TTS status
  useEffect(() => {
    const interval = setInterval(() => {
      const status = getSpeechStatus();
      setIsPlaying(status.isPlaying);
      setIsLoading(status.isProcessing);
      
      // Update visual highlighting based on playback progress
      if (status.isPlaying && status.duration > 0 && showVisualHighlight) {
        const progress = status.currentTime / status.duration;
        const wordIndex = Math.floor(progress * wordsRef.current.length);
        setCurrentWordIndex(Math.min(wordIndex, wordsRef.current.length - 1));
      }
    }, 100);

    return () => clearInterval(interval);
  }, [showVisualHighlight]);

  // Update highlighted text
  useEffect(() => {
    if (showVisualHighlight && wordsRef.current.length > 0) {
      const words = wordsRef.current;
      const highlighted = words.map((word, index) => {
        if (index === currentWordIndex) {
          return `<mark class="bg-yellow-200 px-1 rounded">${word}</mark>`;
        } else if (index < currentWordIndex) {
          return `<span class="text-gray-500">${word}</span>`;
        }
        return word;
      }).join(' ');
      
      setHighlightedText(highlighted);
    } else {
      setHighlightedText(content[currentIndex] || '');
    }
  }, [currentWordIndex, currentIndex, content, showVisualHighlight]);

  const handlePlay = async () => {
    if (isPaused) {
      ttsService.resumeAudio();
      setIsPaused(false);
      return;
    }

    if (currentIndex >= content.length) {
      onComplete?.();
      return;
    }

    try {
      setIsLoading(true);
      onSectionChange?.(currentIndex);
      
      // Auto-advance to next section
      if (autoAdvance && currentIndex < content.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setCurrentWordIndex(0);
        // Continue playing next section
        setTimeout(() => handlePlay(), 500);
      } else if (currentIndex >= content.length - 1) {
        onComplete?.();
      }
      
    } catch (error) {
      console.error('Auto-read error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePause = () => {
    ttsService.pauseAudio();
    setIsPaused(true);
  };

  const handleStop = () => {
    ttsService.stopAudio();
    setIsPaused(false);
    setCurrentWordIndex(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleNext = () => {
    if (currentIndex < content.length - 1) {
      handleStop();
      setCurrentIndex(currentIndex + 1);
      setCurrentWordIndex(0);
      if (isPlaying) {
        setTimeout(() => handlePlay(), 100);
      }
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      handleStop();
      setCurrentIndex(currentIndex - 1);
      setCurrentWordIndex(0);
      if (isPlaying) {
        setTimeout(() => handlePlay(), 100);
      }
    }
  };

  const handleSectionSelect = (index: number) => {
    handleStop();
    setCurrentIndex(index);
    setCurrentWordIndex(0);
    onSectionChange?.(index);
  };

  return (
    <Card className={`${className}`}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-100 p-2 rounded-lg">
              <BookOpen className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Auto-Read Mode</h3>
              <p className="text-sm text-gray-500">
                Section {currentIndex + 1} of {content.length}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            icon={<Settings className="h-4 w-4" />}
          />
        </div>

        {/* Current Section Title */}
        {titles[currentIndex] && (
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            {titles[currentIndex]}
          </h4>
        )}

        {/* Content Display */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4 min-h-[200px] max-h-[400px] overflow-y-auto">
          <div 
            className="text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: highlightedText }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          {/* Playback Controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              icon={<SkipBack className="h-4 w-4" />}
            />

            <Button
              variant="primary"
              size="sm"
              onClick={isPlaying && !isPaused ? handlePause : handlePlay}
              disabled={isLoading}
              className="w-12 h-10"
              icon={
                isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isPlaying && !isPaused ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )
              }
            />

            <Button
              variant="outline"
              size="sm"
              onClick={handleStop}
              disabled={!isPlaying && !isPaused}
              icon={<Square className="h-4 w-4" />}
            />

            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentIndex === content.length - 1}
              icon={<SkipForward className="h-4 w-4" />}
            />
          </div>

          {/* Section Navigation */}
          <div className="flex items-center space-x-1">
            {content.map((_, index) => (
              <button
                key={index}
                onClick={() => handleSectionSelect(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex
                    ? 'bg-primary-500'
                    : index < currentIndex
                    ? 'bg-primary-300'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Visual Highlight Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowVisualHighlight(!showVisualHighlight)}
            icon={showVisualHighlight ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          />
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Reading Speed */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reading Speed: {readingSpeed.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={readingSpeed}
                    onChange={(e) => setReadingSpeed(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Auto-advance Toggle */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Auto-advance sections
                  </label>
                  <button
                    onClick={() => setAutoAdvance(!autoAdvance)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      autoAdvance ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        autoAdvance ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Status Info */}
              <div className="mt-4 text-xs text-gray-500 space-y-1">
                <div>Voice: {persona.charAt(0).toUpperCase() + persona.slice(1)}</div>
                <div>Progress: {currentIndex + 1}/{content.length} sections</div>
                {isPlaying && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>Currently reading</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default AutoReadMode;