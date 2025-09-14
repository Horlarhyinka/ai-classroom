import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, BookOpen, Volume2, VolumeX } from 'lucide-react';
import TTSPlayer, { TTSPlayerRef } from './TTSPlayer';
import Button from './Button';

interface ClassroomTTSPlayerProps {
  messages?: Array<{
    _id: string;
    body: string;
    persona: {
      name: string;
      voice?: { id: string };
      isUser: boolean;
    };
  }>;
  currentSection?: {
    title: string;
    body: string;
  };
  mode: 'reading' | 'discussion';
  voiceId?: string;
  autoplay?: boolean;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
  className?: string;
}

const ClassroomTTSPlayer: React.FC<ClassroomTTSPlayerProps> = ({
  messages = [],
  currentSection,
  mode,
  voiceId,
  autoplay = false,
  onPlayStart,
  onPlayEnd,
  className = ''
}) => {
  const ttsPlayerRef = useRef<TTSPlayerRef>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [lastProcessedMessageId, setLastProcessedMessageId] = useState<string>('');
  const [lastProcessedSection, setLastProcessedSection] = useState<string>('');

  // Process messages for discussion mode
  useEffect(() => {
    if (mode === 'discussion' && isEnabled && messages.length > 0) {
      const newMessages = messages.filter(msg => 
        !msg.persona.isUser && 
        msg._id !== lastProcessedMessageId
      );

      if (newMessages.length > 0) {
        const latestMessage = newMessages[newMessages.length - 1];
        
        // Add to TTS queue
        if (ttsPlayerRef.current && latestMessage.persona.voice?.id) {
          const nodeId = ttsPlayerRef.current.addText(
            latestMessage.body, 
            latestMessage._id
          );
          setLastProcessedMessageId(latestMessage._id);
          
          // Auto-play if enabled
          if (autoplay) {
            ttsPlayerRef.current.play();
          }
        }
      }
    }
  }, [messages, mode, isEnabled, lastProcessedMessageId, autoplay]);

  // Process section content for reading mode
  useEffect(() => {
    if (mode === 'reading' && isEnabled && currentSection) {
      const sectionKey = `${currentSection.title}-${currentSection.body.substring(0, 50)}`;
      
      if (sectionKey !== lastProcessedSection) {
        if (ttsPlayerRef.current) {
          // Clear previous content
          ttsPlayerRef.current.clear();
          
          // Add section title and body
          ttsPlayerRef.current.addText(
            `${currentSection.title}. ${currentSection.body}`,
            `section-${Date.now()}`
          );
          
          setLastProcessedSection(sectionKey);
          
          // Auto-play if enabled
          if (autoplay) {
            ttsPlayerRef.current.play();
          }
        }
      }
    }
  }, [currentSection, mode, isEnabled, lastProcessedSection, autoplay]);

  // Clear queue when mode changes
  useEffect(() => {
    if (ttsPlayerRef.current) {
      ttsPlayerRef.current.clear();
    }
    setLastProcessedMessageId('');
    setLastProcessedSection('');
  }, [mode]);

  const toggleTTS = () => {
    setIsEnabled(!isEnabled);
    if (isEnabled && ttsPlayerRef.current) {
      ttsPlayerRef.current.stop();
      ttsPlayerRef.current.clear();
    }
  };

  const addAllMessages = () => {
    if (!ttsPlayerRef.current || !isEnabled) return;
    
    ttsPlayerRef.current.clear();
    
    if (mode === 'discussion') {
      // Add all non-user messages to queue
      const aiMessages = messages.filter(msg => !msg.persona.isUser);
      aiMessages.forEach(msg => {
        if (msg.persona.voice?.id) {
          ttsPlayerRef.current!.addText(
            `${msg.persona.name}: ${msg.body}`,
            msg._id
          );
        }
      });
    } else if (mode === 'reading' && currentSection) {
      // Add current section
      ttsPlayerRef.current.addText(
        `${currentSection.title}. ${currentSection.body}`,
        `section-${Date.now()}`
      );
    }
  };

  const getModeIcon = () => {
    return mode === 'discussion' ? 
      <MessageCircle className="h-4 w-4" /> : 
      <BookOpen className="h-4 w-4" />;
  };

  const getModeLabel = () => {
    return mode === 'discussion' ? 'Discussion Audio' : 'Reading Audio';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}
    >
      {/* Header */}
      <div className="p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getModeIcon()}
            <span className="text-sm font-medium text-gray-700">
              {getModeLabel()}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {isEnabled && (mode === 'discussion' ? messages.length : currentSection) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={addAllMessages}
                className="text-xs"
              >
                Queue All
              </Button>
            )}
            
            <Button
              variant={isEnabled ? "secondary" : "outline"}
              size="sm"
              onClick={toggleTTS}
              icon={isEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            >
              {isEnabled ? 'On' : 'Off'}
            </Button>
          </div>
        </div>
      </div>

      {/* TTS Player */}
      {isEnabled && (
        <TTSPlayer
          ref={ttsPlayerRef}
          voiceId={voiceId}
          autoplay={autoplay}
          onPlayStart={onPlayStart}
          onPlayEnd={onPlayEnd}
          className="border-0 shadow-none rounded-none"
        />
      )}

      {/* Status */}
      {!isEnabled && (
        <div className="p-4 text-center text-gray-500 text-sm">
          Enable audio to hear {mode === 'discussion' ? 'AI responses' : 'section content'}
        </div>
      )}
    </motion.div>
  );
};

export default ClassroomTTSPlayer;