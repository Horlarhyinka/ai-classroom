'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Loader2,
} from 'lucide-react';
import { getSpeechStatus } from '../../utils/textToSpeech';
import { Player } from '../Player';
import { TextNode } from '../../utils/tts';

interface TTSControlsProps {
  node: TextNode | undefined;
  text?: string;
  persona?: 'teacher' | 'student' | 'narrator';
  autoPlay?: boolean;
  className?: string;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
  onError?: (error: Error) => void;
}

const TTSControls: React.FC<TTSControlsProps> = ({
  text,
  persona = 'narrator',
  autoPlay,
  className = '',
  onPlayStart,
  onPlayEnd,
  onError,
  node
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Update status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const status = getSpeechStatus();
      setIsPlaying(status.isPlaying);
      setIsLoading(status.isProcessing);
      setCurrentTime(status.currentTime);
      setDuration(status.duration);
      
      if (status.duration > 0) {
        setProgress((status.currentTime / status.duration) * 100);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Auto-play effect
  useEffect(() => {
    if (autoPlay && text && !isPlaying && !isLoading) {
      handlePlay();
    }
  }, [autoPlay, text]);

  const handlePlay = async () => {
    console.log('Play clicked...', text)
    if (!text) return;

    try {
      setIsLoading(true);
      onPlayStart?.();      
      onPlayEnd?.();
    } catch (error) {
      console.error('TTS Error:', error);
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg border border-gray-200 p-4 shadow-sm ${className}`}
    >
      {/* Main Controls */}
      <div className="flex items-center space-x-3">
        <Player href={node?.data ?? undefined} autoplay={!!autoPlay} />
        {/* Play/Pause Button */}
        {/* <Button
          variant="primary"
          size="sm"
          onClick={isPlaying ? handlePause : (isLoading ? undefined : handlePlay)}
          disabled={!text || isLoading}
          className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
          icon={
            isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 ml-0.5" />
            )
          }
        /> */}

        {/* Stop Button */}
        {/* <Button
          variant="outline"
          size="sm"
          onClick={handleStop}
          disabled={!isPlaying && !isLoading}
          className="rounded-full w-8 h-8 p-0 flex items-center justify-center"
          icon={<Square className="h-3 w-3" />}
        /> */}

        {/* Skip Button */}
        {/* <Button
          variant="ghost"
          size="sm"
          onClick={handleSkip}
          disabled={!isPlaying && !isLoading}
          className="rounded-full w-8 h-8 p-0 flex items-center justify-center"
          icon={<SkipForward className="h-3 w-3" />}
        /> */}

        {/* Progress Bar */}
        {/* <div className="flex-1 mx-4"> */}
          {/* <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div> */}
          {/* <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div> */}
        {/* </div> */}

        {/* Volume Control */}
        {/* <Button
          variant="ghost"
          size="sm"
          onClick={toggleMute}
          className="rounded-full w-8 h-8 p-0 flex items-center justify-center"
          icon={isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        /> */}

        {/* Settings */}
        {/* <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className="rounded-full w-8 h-8 p-0 flex items-center justify-center"
          icon={<Settings className="h-4 w-4" />}
        /> */}
      </div>

      {/* Status Indicator */}
      {(isPlaying || isLoading) && (
        <div className="mt-2 flex items-center justify-center">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            {isLoading && (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Generating speech...</span>
              </>
            )}
            {isPlaying && !isLoading && (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Playing as {persona}</span>
              </>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default TTSControls;