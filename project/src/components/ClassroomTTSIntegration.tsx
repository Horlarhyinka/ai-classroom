import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Headphones, HeadphonesIcon } from 'lucide-react';
import ClassroomTTSPlayer from './ui/ClassroomTTSPlayer';
import Button from './ui/Button';
import { Card, CardContent } from './ui/Card';

interface ClassroomTTSIntegrationProps {
  // Discussion mode props
  messages?: Array<{
    _id: string;
    body: string;
    persona: {
      name: string;
      voice?: { id: string };
      isUser: boolean;
    };
  }>;
  
  // Reading mode props
  currentSection?: {
    title: string;
    body: string;
  };
  
  // Common props
  mode: 'reading' | 'discussion';
  defaultVoiceId?: string;
  className?: string;
}

const ClassroomTTSIntegration: React.FC<ClassroomTTSIntegrationProps> = ({
  messages = [],
  currentSection,
  mode,
  defaultVoiceId = 'default-voice-id',
  className = ''
}) => {
  const [showTTSPlayer, setShowTTSPlayer] = useState(false);
  const [ttsSettings, setTTSSettings] = useState({
    autoplay: false,
    voiceId: defaultVoiceId,
    enabled: false
  });

  // Auto-show TTS player when there's content
  useEffect(() => {
    if (mode === 'discussion' && messages.length > 0) {
      setShowTTSPlayer(true);
    } else if (mode === 'reading' && currentSection) {
      setShowTTSPlayer(true);
    }
  }, [mode, messages.length, currentSection]);

  const handleTTSToggle = () => {
    setTTSSettings(prev => ({
      ...prev,
      enabled: !prev.enabled
    }));
  };

  const handleAutoplayToggle = () => {
    setTTSSettings(prev => ({
      ...prev,
      autoplay: !prev.autoplay
    }));
  };

  const handlePlayStart = () => {
    console.log('TTS playback started');
  };

  const handlePlayEnd = () => {
    console.log('TTS playback ended');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* TTS Controls Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Headphones className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Audio Playback</h3>
                <p className="text-sm text-gray-600">
                  {mode === 'discussion' 
                    ? 'Listen to AI responses in discussions' 
                    : 'Listen to section content while reading'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={ttsSettings.autoplay ? "primary" : "outline"}
                size="sm"
                onClick={handleAutoplayToggle}
                disabled={!ttsSettings.enabled}
              >
                Auto-play
              </Button>
              
              <Button
                variant={showTTSPlayer ? "secondary" : "outline"}
                size="sm"
                onClick={() => setShowTTSPlayer(!showTTSPlayer)}
                icon={<Settings className="h-4 w-4" />}
              >
                {showTTSPlayer ? 'Hide Player' : 'Show Player'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TTS Player */}
      <AnimatePresence>
        {showTTSPlayer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ClassroomTTSPlayer
              messages={messages}
              currentSection={currentSection}
              mode={mode}
              voiceId={ttsSettings.voiceId}
              autoplay={ttsSettings.autoplay}
              onPlayStart={handlePlayStart}
              onPlayEnd={handlePlayEnd}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Stats */}
      {showTTSPlayer && (
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <span>Mode: <span className="font-medium capitalize">{mode}</span></span>
                {mode === 'discussion' && (
                  <span>Messages: <span className="font-medium">{messages.length}</span></span>
                )}
                {mode === 'reading' && currentSection && (
                  <span>Section: <span className="font-medium">{currentSection.title}</span></span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  ttsSettings.enabled ? 'bg-green-500' : 'bg-gray-400'
                }`} />
                <span className="text-xs">
                  {ttsSettings.enabled ? 'Audio Ready' : 'Audio Disabled'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClassroomTTSIntegration;