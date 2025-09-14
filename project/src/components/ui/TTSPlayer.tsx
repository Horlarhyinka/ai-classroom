import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Square, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX,
  Loader2,
  List,
  X
} from 'lucide-react';
import Button from './Button';
import { Card, CardContent } from './Card';
import { useTTS } from '../../utils/hooks/useTts';

interface TTSPlayerProps {
  voiceId?: string;
  autoplay?: boolean;
  className?: string;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
  onError?: (error: Error) => void;
}

interface QueueItem {
  id: string;
  text: string;
  status: 'pending' | 'loading' | 'ready' | 'playing' | 'played';
}

const TTSPlayer: React.FC<TTSPlayerProps> = ({
  voiceId,
  autoplay = false,
  className = '',
  onPlayStart,
  onPlayEnd,
  onError
}) => {
  const [showQueue, setShowQueue] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const {
    isPlaying,
    isLoading,
    currentNodeId,
    queueLength,
    addToQueue,
    play,
    pause,
    stop,
    clear,
    seekToNode,
    removeFromQueue,
    getQueueItems
  } = useTTS({
    voiceId,
    autoplay,
    onNodePlay: (nodeId) => {
      onPlayStart?.();
    },
    onNodeEnd: (nodeId) => {
      onPlayEnd?.();
    },
    onError
  });

  const queueItems = getQueueItems();
  const currentIndex = queueItems.findIndex(item => item.id === currentNodeId);

  // Add text to queue (exposed method)
  const addText = (text: string, id?: string) => {
    return addToQueue(text, id);
  };

  // Navigation controls
  const playNext = () => {
    if (currentIndex >= 0 && currentIndex < queueItems.length - 1) {
      const nextItem = queueItems[currentIndex + 1];
      seekToNode(nextItem.id);
    }
  };

  const playPrevious = () => {
    if (currentIndex > 0) {
      const prevItem = queueItems[currentIndex - 1];
      seekToNode(prevItem.id);
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Note: Volume control would need to be implemented in the audio playback
  };

  const formatText = (text: string, maxLength: number = 50) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const getStatusColor = (status: QueueItem['status']) => {
    switch (status) {
      case 'playing': return 'text-blue-600 bg-blue-100';
      case 'played': return 'text-green-600 bg-green-100';
      case 'loading': return 'text-yellow-600 bg-yellow-100';
      case 'ready': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: QueueItem['status']) => {
    switch (status) {
      case 'playing': return <Play className="h-3 w-3" />;
      case 'played': return <div className="w-3 h-3 rounded-full bg-green-500" />;
      case 'loading': return <Loader2 className="h-3 w-3 animate-spin" />;
      case 'ready': return <div className="w-3 h-3 rounded-full bg-purple-500" />;
      default: return <div className="w-3 h-3 rounded-full bg-gray-400" />;
    }
  };

  // Expose addText method to parent components
  React.useImperativeHandle(React.forwardRef(() => null), () => ({
    addText,
    clear,
    play,
    pause,
    stop
  }));

  if (queueLength === 0) {
    return null;
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Main Player Controls */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={playPrevious}
              disabled={currentIndex <= 0}
              icon={<SkipBack className="h-4 w-4" />}
            />
            
            <Button
              variant={isPlaying ? "secondary" : "primary"}
              size="sm"
              onClick={togglePlayPause}
              disabled={isLoading}
              icon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 
                    isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={playNext}
              disabled={currentIndex >= queueItems.length - 1}
              icon={<SkipForward className="h-4 w-4" />}
            />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={stop}
              disabled={!isPlaying && !currentNodeId}
              icon={<Square className="h-4 w-4" />}
            />
          </div>

          {/* Center Info */}
          <div className="flex-1 mx-4 text-center">
            {currentNodeId && (
              <div className="text-sm">
                <div className="font-medium text-gray-900">
                  {currentIndex + 1} of {queueLength}
                </div>
                <div className="text-gray-600 truncate">
                  {formatText(queueItems[currentIndex]?.text || '')}
                </div>
              </div>
            )}
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              icon={isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQueue(!showQueue)}
              icon={<List className="h-4 w-4" />}
            >
              Queue ({queueLength})
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={clear}
              icon={<X className="h-4 w-4" />}
            />
          </div>
        </div>

        {/* Progress Bar */}
        {queueLength > 1 && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${((currentIndex + (isPlaying ? 0.5 : 0)) / queueLength) * 100}%` 
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Start</span>
              <span>End</span>
            </div>
          </div>
        )}
      </div>

      {/* Queue Panel */}
      <AnimatePresence>
        {showQueue && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-200 overflow-hidden"
          >
            <div className="p-4 max-h-64 overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Playback Queue</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowQueue(false)}
                  icon={<X className="h-4 w-4" />}
                />
              </div>
              
              <div className="space-y-2">
                {queueItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      item.id === currentNodeId 
                        ? 'border-primary-300 bg-primary-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => seekToNode(item.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className={`p-1 rounded-full ${getStatusColor(item.status)}`}>
                          {getStatusIcon(item.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            Item {index + 1}
                          </div>
                          <div className="text-xs text-gray-600 truncate">
                            {formatText(item.text, 80)}
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromQueue(item.id);
                        }}
                        icon={<X className="h-3 w-3" />}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Export both the component and a ref type for imperative usage
export type TTSPlayerRef = {
  addText: (text: string, id?: string) => string;
  clear: () => void;
  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
};

export default TTSPlayer;