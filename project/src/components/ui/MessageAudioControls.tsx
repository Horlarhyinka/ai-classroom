'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react';
import Button from './Button';
import AudioWaveform from './AudioWaveform';
import { speakWithVoiceId, stopSpeaking, isTTSAvailable } from '../../utils/textToSpeech';

interface MessageAudioControlsProps {
  messageId: string;
  text: string;
  voiceId?: string;
  personaRole?: 'teacher' | 'student';
  autoPlay?: boolean;
  isGlobalAudioEnabled?: boolean;
  className?: string;
  onPlayStart?: (messageId: string) => void;
  onPlayEnd?: (messageId: string) => void;
  onError?: (error: Error) => void;
  isCurrentlyPlaying?: boolean;
  playingMessageId: string | null;

}

const MessageAudioControls: React.FC<MessageAudioControlsProps> = ({
  messageId,
  text,
  voiceId,
  personaRole = 'student',
  autoPlay = false,
  isGlobalAudioEnabled = true,
  className = '',
  onPlayStart,
  onPlayEnd,
  onError,
  playingMessageId,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasBeenPlayed, setHasBeenPlayed] = useState(false);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  const playbackRef = useRef<boolean>(false);
  const isCurrentlyPlaying = playingMessageId == messageId
  // console.log('Params:',   messageId,
  // text,
  // voiceId,
  // personaRole,
  // autoPlay,
  // isGlobalAudioEnabled,
  // className,
  // isCurrentlyPlaying)

  // ✅ Auto-play effect — runs once
  useEffect(() => {
    if(isCurrentlyPlaying){
      console.log('Will I let it play?', isCurrentlyPlaying &&
      autoPlay &&
      // !hasAutoPlayed &&
      isGlobalAudioEnabled &&
      isTTSAvailable() &&
      !!voiceId &&
      text,
      {isCurrentlyPlaying,
      autoPlay,
      // !hasAutoPlayed &&
      isGlobalAudioEnabled,
      ttsAv: isTTSAvailable(),
      vid: !!voiceId ,
      text
    }
    )
    }
    if (
      isCurrentlyPlaying &&
      autoPlay &&
      isGlobalAudioEnabled &&
      isTTSAvailable() &&
      !!voiceId &&
      text
    ) {
      const timer = setTimeout(() => {
        handlePlay();
        setHasAutoPlayed(true);
      }, 300); // Slight delay for better UX

      return () => clearTimeout(timer);
    }
  }, [
    autoPlay,
    isGlobalAudioEnabled,
    voiceId,
    text,
    playingMessageId,
    // isLoading
  ]);

  const handlePlay = async () => {
    if(playbackRef.current){
      playbackRef.current = false
    }

    try {
      setIsLoading(true);
      playbackRef.current = true;
      setHasBeenPlayed(true);
      await onPlayStart?.(messageId);

      const voiceOptions = {
        stability: personaRole === 'teacher' ? 0.7 : 0.6,
        similarityBoost: personaRole === 'teacher' ? 0.8 : 0.7,
        style: personaRole === 'teacher' ? 0.2 : 0.4,
        useSpeakerBoost: true,
      };
      console.log('This is where I speak...')
    } catch (error) {
      console.error('Message audio error:', error);
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
      playbackRef.current = false;
      onPlayEnd?.(messageId);
    }
  };

  const handleStop = () => {
    stopSpeaking();
    setIsLoading(false);
    playbackRef.current = false;
    onPlayEnd?.(messageId);
  };

  // 🔒 Skip rendering if not playable
  if (!isTTSAvailable() || !voiceId) return null;

  if (!isGlobalAudioEnabled) {
    return (
      <div className={`flex items-center space-x-2 opacity-50 ${className}`}>
        <VolumeX className="h-3 w-3 text-gray-400" />
        <span className="text-xs text-gray-400">Audio disabled</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={isCurrentlyPlaying ? handleStop : handlePlay}
        disabled={isLoading}
        className="w-6 h-6 p-0 rounded-full hover:bg-gray-100 flex items-center justify-center"
        icon={
          isCurrentlyPlaying && isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin text-primary-500" />
          ) : isCurrentlyPlaying ? (
            <Pause className="h-3 w-3 text-green-600" />
          ) : (
            <Play className="h-3 w-3 text-gray-600" />
          )
        }
      />

      {isCurrentlyPlaying && (
        <AudioWaveform
          isPlaying={true}
          color="green"
          size="sm"
          className="ml-1"
        />
      )}

      {!isCurrentlyPlaying && !isLoading && (
        <div className="flex items-center space-x-1">
          <Volume2 className="h-3 w-3 text-gray-400" />
          <span className="text-xs text-gray-400 capitalize">{personaRole}</span>
          {hasBeenPlayed && (
            <span className="text-xs text-green-500">✓</span>
          )}
        </div>
      )}

      {isLoading && isCurrentlyPlaying && (
        <span className="text-xs text-primary-500">Generating...</span>
      )}
    </div>
  );
};

export default MessageAudioControls;
