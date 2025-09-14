'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Play,
  Users,
  Send,
  Hand,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  Loader2,
  Headphones,
  Settings
} from 'lucide-react';
import Button from './ui/Button';
import { Card, CardContent } from './ui/Card';
import TTSControls from './ui/TTSControls';
import AutoReadMode from './ui/AutoReadMode';
import MessageAudioControls from './ui/MessageAudioControls';
import AudioIndicator from './ui/AudioIndicator';
import { documentAPI } from '../lib/api';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { io, Socket } from "socket.io-client";
import { useSession } from '../utils/hooks/useSession';
import { speakWithVoiceId, stopSpeaking, clearSpeechQueue, isTTSAvailable } from '../utils/textToSpeech';
import toast from 'react-hot-toast';

interface Chapter {
  _id: string;
  docId: string;
  title: string;
  index: number;
  discussion: {_id: string} | string;
  discussionStarted: boolean;
}

interface Section {
  _id: string;
  title: string;
  body: string;
  index: number;
  docId: string;
  chapter: number;
}

interface Voice {
  id: string;
  name: string;
  category: string;
}

interface Persona {
  id: string;
  _id: string;
  name: string;
  role: 'teacher' | 'student';
  isUser: boolean;
  voice?: Voice;
}

interface Message {
  _id: string;
  body: string;
  persona: Persona;
  sent: boolean;
  createdAt: string;
  isOptimistic?: boolean;
  tempId?: string;
}

interface ClassroomInterfaceProps {
  section: {
    id: string;
    title: string;
    content: string;
    duration?: number;
  };
  onSectionComplete?: () => void;
}

const ClassroomInterface: React.FC<ClassroomInterfaceProps> = () => {
  // Mode state
  const [currentMode, setCurrentMode] = useState<'reading'|'discussion'>('reading');
  
  // Reading mode states
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [autoReadMode, setAutoReadMode] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);

  const {id: docId} = useParams<{id: string}>();
  
  // Discussion mode states
  const [selectedChapterForDiscussion, setSelectedChapterForDiscussion] = useState<Chapter>();
  const [selectedChapterForReading, setSelectedChapterForReading] = useState<Chapter>();
  const [discussionStarted, setDiscussionStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userMicActive, setUserMicActive] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [chapters, setChapters] = useState<Chapter[]>();
  const [sections, setSections] = useState<Section[]>();
  const [currentSection, setCurrentSection] = useState<Section>();
  const [globalSocket, setGlobalSocket] = useState<Socket | null>(null);
  const [channelId, setChannelId] = useState<string>();
  const [startDiscussionLoading, setStartDiscussionLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [messageQueue, setMessageQueue] = useState<string[]>([]);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [quiet, setQuiet] = useState(true)
  const {session: sessionData, loading} = useSession();
  const [user, setUser] = useState<any>();
  const [lastPlayed, setLastPlayed] = useState<string>()
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const messageTimeoutRef = useRef<NodeJS.Timeout>();

  // Smooth auto-scroll with debouncing
  const scrollToBottom = useCallback(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'end',
        inline: 'nearest'
      });
    }
  }, []);

  // Debounced scroll effect
  useEffect(() => {
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, scrollToBottom]);

  // Enhanced socket connection with reconnection logic
  useEffect(() => {
    if (sessionData?.user?._id && channelId && !globalSocket) {
      setConnectionStatus('connecting');
      
      const socket = io(process.env.NEXT_PUBLIC_API_BASE_URL!, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        setConnectionStatus('connected');
        setGlobalSocket(socket);
        
        // Join discussion channel
        socket.emit('join_discussion', {channel: channelId});
        
        // Process any queued messages
        if (messageQueue.length > 0) {
          messageQueue.forEach(msg => {
            socket.emit('user_message', {channel: channelId, body: msg});
          });
          setMessageQueue([]);
        }
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnectionStatus('disconnected');
        setGlobalSocket(null);
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnectionStatus('disconnected');
        toast.error('Connection error. Retrying...');
      });

      socket.on('message', (payload) => {
        console.log('Received message:', payload);
        
        // Clear typing indicator
        setIsTyping(false);
        
        // Clear start discussion loading if it was active
        if (startDiscussionLoading) {
          setStartDiscussionLoading(false);
        }

        // Add message and remove any optimistic messages
        if (payload?.data?.data) {
          const newMessage = payload.data.data;
          
          setMessages(prevMessages => {
            // Remove optimistic messages that match this response
            const filteredMessages = prevMessages.filter(msg => {
              // Keep non-optimistic messages
              if (!msg.isOptimistic) return true;
              
              // Remove optimistic messages from the same user with similar content
              if (msg.persona?.isUser && 
                  msg.body.toLowerCase().trim() === newMessage.body.toLowerCase().trim()) {
                return false;
              }
              
              return true;
            });
            
            return [...filteredMessages, newMessage];
          });

          // Auto-play audio for AI messages if audio is enabled and voice ID is available
          // IMPORTANT: Only play audio for NON-USER messages (AI personas)
          if (audioEnabled && 
              newMessage.persona && 
              !newMessage.persona.isUser && // This is the key check - don't play user messages
              newMessage.persona.voice?.id &&
              isTTSAvailable()) {
            
            // Small delay to ensure message is rendered
            setTimeout(() => {
              handleMessageAudioPlay(newMessage._id);
            }, 500);
          }
        }
      });

      // Cleanup on unmount
      return () => {
        socket.disconnect();
        setGlobalSocket(null);
        setConnectionStatus('disconnected');
      };
    }
  }, [sessionData?.user?._id, channelId, selectedChapterForDiscussion, ]);

  useEffect(() => {
    if (sessionData?.user) {
      setUser(sessionData.user);
    }
  }, [sessionData]);

  useEffect(() => {
    if (selectedChapterForDiscussion?.discussionStarted && !discussionStarted) {
      setDiscussionStarted(true);
    }
  }, [selectedChapterForDiscussion, discussionStarted]);

  // Handle message audio playback with proper state management
  const handleMessageAudioPlay = useCallback((messageId: string) => {
    // Stop any currently playing audio first
    setPlayingMessageId(messageId)
    if (playingMessageId && playingMessageId !== messageId) {
      stopSpeaking();
      clearSpeechQueue();
      setPlayingMessageId(messageId);
    }
    setQuiet(false)
  }, [playingMessageId]);

  const playMessage = async (messageId: string) =>{
    const target = messages.find((m)=>m._id == messageId)
    if(target){
      const voiceOptions = {
        stability: target.persona?.role === 'teacher' ? 0.7 : 0.6,
        similarityBoost: target.persona?.role === 'teacher' ? 0.8 : 0.7,
        style: target.persona?.role === 'teacher' ? 0.2 : 0.4,
        useSpeakerBoost: true,
      };
      clearSpeechQueue()
      await speakWithVoiceId(target.body, target.persona?.voice?.id!, voiceOptions)
      
    }
  }

  const handleMessageAudioEnd = useCallback((messageId: string) => {
    // Only clear if this message was actually playing
    if (playingMessageId === messageId) {
    setLastPlayed(messageId)
      setPlayingMessageId(null);
    }

    setQuiet(true)
  }, [playingMessageId]);

  // Stop all audio when audio is disabled
  useEffect(() => {

    if (!audioEnabled) {
      stopSpeaking();
      clearSpeechQueue();
      setPlayingMessageId(null);
    }
  }, [audioEnabled]);

  // CRITICAL FIX: Reset audio state when chapter changes
  useEffect(() => {
    // Stop all audio when chapter changes
    stopSpeaking();
    clearSpeechQueue();
    setPlayingMessageId(null);
    
    // Reset discussion state
    setMessages([]);
    setDiscussionStarted(false);
    setChannelId(undefined);
    
    // Disconnect socket if connected
    if (globalSocket) {
      globalSocket.disconnect();
      setGlobalSocket(null);
      setConnectionStatus('disconnected');
    }
  }, [selectedChapterForDiscussion?._id]); // Reset when chapter changes

  // Also reset audio when switching between modes
  useEffect(() => {
    stopSpeaking();
    clearSpeechQueue();
    setPlayingMessageId(null);
  }, [currentMode]);

  // Fetch chapters with error handling
  const fetchChapters = useCallback(async () => {
    try {
      const chaptersData = await documentAPI.getChapters(docId);
      if (chaptersData) {
        setChapters(chaptersData);
        if (!selectedChapterForReading) {
          setSelectedChapterForReading(chaptersData[0]);
        }
        if (!selectedChapterForDiscussion) {
          setSelectedChapterForDiscussion(chaptersData[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching chapters:', error);
      toast.error('Failed to load chapters');
    }
  }, [docId, selectedChapterForReading, selectedChapterForDiscussion]);

  // Fetch sections with error handling
  const fetchSections = useCallback(async () => {
    const chapter = selectedChapterForReading;
    if (chapter) {
      try {
        const sectionsData = await documentAPI.getSections(docId, chapter.index);
        if (sectionsData) {
          setSections(sectionsData);
          if (!currentSection || currentSection.chapter !== selectedChapterForReading.index) {
            setCurrentSection(sectionsData[0]);
            setCurrentSectionIndex(0);
          }
        }
      } catch (error) {
        console.error('Error fetching sections:', error);
        toast.error('Failed to load sections');
      }
    }
  }, [docId, selectedChapterForReading, currentSection]);

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  // Enhanced discussion fetching
  const fetchDiscussion = useCallback(async () => {
    if (selectedChapterForDiscussion) {
      try {
        const apiRes = await documentAPI.getDiscussions(docId, selectedChapterForDiscussion._id);
        console.log('Discussion API response:', apiRes);
        
        if (!apiRes?._id) {
          setDiscussionStarted(false);
          setMessages([]);
          setChannelId(undefined);
        } else {
          setDiscussionStarted(true);
          setChannelId(apiRes._id);
          
          if (apiRes.messages?.length) {
            setMessages(apiRes.messages);
            if(!playingMessageId){
              const sp = apiRes?.messages?.find((m: Message)=>!m?.persona?.isUser)
              if(sp){
                setTimeout(() => {
              handleMessageAudioPlay(sp?._id);
            }, 500);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching discussion:', error);
        toast.error('Failed to load discussion');
      }
    }
  }, [docId, selectedChapterForDiscussion]);

  useEffect(() => {
    if (currentMode === 'discussion') {
      fetchDiscussion();
    }
  }, [currentMode, fetchDiscussion]);

  // Reading Mode Functions
  const goToNextSection = useCallback(() => {
    if (sections?.length) {
      const nextSection = sections[currentSectionIndex + 1];
      if (nextSection) {
        setCurrentSection(nextSection);
        setCurrentSectionIndex(currentSectionIndex + 1);
      }
    }
  }, [sections, currentSectionIndex]);

  const goToPrevSection = useCallback(() => {
    if (sections?.length) {
      const prevSection = sections[currentSectionIndex - 1];
      if (prevSection) {
        setCurrentSection(prevSection);
        setCurrentSectionIndex(currentSectionIndex - 1);
      }
    }
  }, [sections, currentSectionIndex]);

  const goToChapter = useCallback((chapterIndex: number) => {
    const targetChapter = chapters?.find(c => c.index === chapterIndex);
    if (targetChapter) {
      if (currentMode === 'reading') {
        setSelectedChapterForReading(targetChapter);
      } else {
        setSelectedChapterForDiscussion(targetChapter);
      }
    }
  }, [chapters, currentMode]);

  // Enhanced start discussion with better UX
  const handleStartDiscussion = useCallback(async () => {
    if (!selectedChapterForDiscussion) {
      toast.error('Please select a chapter first');
      return;
    }

    setStartDiscussionLoading(true);
    
    try {
      if (globalSocket && connectionStatus === 'connected') {
        globalSocket.emit('start_discussion', {
          docId, 
          chapter: selectedChapterForDiscussion._id
        });
        
        // Show immediate feedback
        toast.success('Starting discussion...');
        
        // Set a timeout to handle cases where the server doesn't respond
        messageTimeoutRef.current = setTimeout(() => {
          if (startDiscussionLoading) {
            setStartDiscussionLoading(false);
            toast.error('Discussion start timeout. Please try again.');
          }
        }, 15000);
        
      } else {
        toast.error('Connection not ready. Please wait and try again.');
        setStartDiscussionLoading(false);
      }
    } catch (error) {
      console.error('Error starting discussion:', error);
      toast.error('Failed to start discussion');
      setStartDiscussionLoading(false);
    }
  }, [globalSocket, connectionStatus, selectedChapterForDiscussion, docId, startDiscussionLoading]);

  // Enhanced message handling with optimistic updates
  const handleUserMessage = useCallback(() => {
    if (!userInput.trim()) return;

    const messageText = userInput.trim();
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    setUserInput('');

    // Create optimistic message with proper structure
    const optimisticMessage: Message = {
      _id: tempId,
      body: messageText,
      persona: {
        id: user?._id || '',
        _id: user?._id || '',
        name: `${user?.firstName} ${user?.lastName}` || 'You',
        role: 'student',
        isUser: true // This ensures user messages won't be played
      },
      sent: false,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
      tempId: tempId
    };

    // Add optimistic message immediately
    setMessages(prev => [...prev, optimisticMessage]);

    if (globalSocket) {
      globalSocket.emit('user_message', {channel: channelId, body: messageText});
      setIsTyping(true);
      
      // Clear typing indicator after a reasonable time
      setTimeout(() => setIsTyping(false), 10000);
    } else {
      // Queue message if not connected and remove optimistic message
      setMessageQueue(prev => [...prev, messageText]);
      setMessages(prev => prev.filter(msg => msg.tempId !== tempId));
      toast.error('Message queued. Reconnecting...');
    }
  }, [userInput, globalSocket, connectionStatus, channelId, user]);

  // Auto-read mode handlers
  const handleAutoReadSectionChange = useCallback((index: number) => {
    if (sections && sections[index]) {
      setCurrentSection(sections[index]);
      setCurrentSectionIndex(index);
    }
  }, [sections]);

  const handleAutoReadComplete = useCallback(() => {
    toast.success('Auto-read completed!');
    setAutoReadMode(false);
  }, []);

  // TTS handlers for reading mode
  const handleTTSPlayStart = useCallback(() => {
    setTtsEnabled(true);
  }, []);

  const handleTTSPlayEnd = useCallback(() => {
    setTtsEnabled(false);
  }, []);

  const handleTTSError = useCallback((error: Error) => {
    toast.error('Speech generation failed');
    setTtsEnabled(false);
  }, []);

  // Audio control handlers
  const handleGlobalAudioToggle = useCallback(() => {
    setAudioEnabled(!audioEnabled);
    if (!audioEnabled) {
      // Show info about TTS availability
      if (!isTTSAvailable()) {
        toast.error('Text-to-speech is not available. Please check your API configuration.');
      } else {
        toast.success('Audio enabled for discussions');
      }
    } else {
      stopSpeaking();
      clearSpeechQueue();
      setPlayingMessageId(null);
      toast.success('Audio disabled');
    }
  }, [audioEnabled]);

  useEffect(()=>{
    console.log('I am running...', playingMessageId)
    if(audioEnabled && quiet && lastPlayed ){

    const msgIndex = messages?.findIndex(m=>m?._id == lastPlayed)
      if(msgIndex !== -1){
        const nextTarget = messages.slice(msgIndex + 1, messages.length).find((m)=>!m.persona.isUser)
        console.log('Playing next:', nextTarget)
        if(nextTarget){
          setPlayingMessageId(nextTarget?._id)
        }
      }

    }
  },[audioEnabled, quiet, lastPlayed])

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
      // Stop any ongoing speech when component unmounts
      stopSpeaking();
      clearSpeechQueue();
    };
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Title */}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">AI Classroom</h1>
            <p className="text-sm sm:text-base text-gray-600">Interactive Learning Experience</p>
          </div>

          {/* Mode Toggle */}
          <div className="flex flex-wrap sm:flex-nowrap items-center space-x-0 sm:space-x-2 space-y-2 sm:space-y-0 bg-gray-100 rounded-lg p-1 w-full sm:w-auto">
            <button
              onClick={() => setCurrentMode('reading')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                currentMode === 'reading'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Reading</span>
            </button>
            <button
              onClick={() => setCurrentMode('discussion')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                currentMode === 'discussion'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageCircle className="h-4 w-4" />
              <span>Discussion</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {currentMode === 'reading' && (
            <motion.div
              key="reading"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="h-full flex flex-col"
            >
              {/* Reading Header */}
              <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedChapterForReading?.title}</h2>
                    <p className="text-gray-600">Section {currentSectionIndex + 1} of {sections?.length}: {currentSection?.title}</p>
                  </div>
                  
                  {/* Chapter Navigation */}
                  <div className="flex items-center space-x-2">
                    {chapters?.map((chapter) => (
                      <button
                        key={chapter._id}
                        onClick={() => goToChapter(chapter.index)}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          chapter.index === selectedChapterForReading?.index
                            ? 'bg-primary-100 text-primary-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        Ch {chapter.index}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reading Mode Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Button
                      variant={autoReadMode ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setAutoReadMode(!autoReadMode)}
                      icon={<Headphones className="h-4 w-4" />}
                    >
                      {autoReadMode ? 'Exit Auto-Read' : 'Auto-Read Mode'}
                    </Button>

                    {!autoReadMode && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleGlobalAudioToggle}
                        icon={audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                      >
                        {audioEnabled ? 'Audio On' : 'Audio Off'}
                      </Button>
                    )}

                    {!isTTSAvailable() && (
                      <div className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                        TTS not configured
                      </div>
                    )}
                  </div>

                  {ttsEnabled && (
                    <AudioIndicator
                      isPlaying={true}
                      isLoading={false}
                      isMuted={false}
                      size="md"
                      showWaveform={true}
                      color="primary"
                    />
                  )}
                </div>
              </div>

              {/* Reading Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {autoReadMode && sections ? (
                  <AutoReadMode
                    content={sections.map(s => s.body)}
                    titles={sections.map(s => s.title)}
                    persona="narrator"
                    autoStart={false}
                    onSectionChange={handleAutoReadSectionChange}
                    onComplete={handleAutoReadComplete}
                    className="max-w-4xl mx-auto"
                  />
                ) : (
                  <Card className="max-w-4xl mx-auto">
                    <CardContent className="p-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">{currentSection?.title}</h3>
                      <div className="prose max-w-none mb-6">
                        <div className="text-gray-800 leading-relaxed text-lg">
                          <ReactMarkdown>{currentSection?.body || ''}</ReactMarkdown>
                        </div>
                      </div>

                      {/* TTS Controls for current section */}
                      {audioEnabled && currentSection && isTTSAvailable() && (
                        <TTSControls
                          text={currentSection.body}
                          persona="narrator"
                          onPlayStart={handleTTSPlayStart}
                          onPlayEnd={handleTTSPlayEnd}
                          onError={handleTTSError}
                          className="mt-6"
                        />
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Reading Navigation */}
              {!autoReadMode && (
                <div className="bg-white border-t border-gray-200 p-4">
                  <div className="flex items-center justify-between max-w-4xl mx-auto">
                    <Button
                      variant="outline"
                      onClick={goToPrevSection}
                      disabled={currentSectionIndex === 0}
                      icon={<ChevronLeft className="h-4 w-4" />}
                    >
                      Previous
                    </Button>
                    
                    <div className="flex items-center space-x-2">
                      {sections?.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setCurrentSection(sections[index]);
                            setCurrentSectionIndex(index);
                          }}
                          className={`w-3 h-3 rounded-full transition-colors ${
                            index === currentSectionIndex
                              ? 'bg-primary-500'
                              : index < currentSectionIndex
                              ? 'bg-primary-300'
                              : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    
                    <Button
                      onClick={goToNextSection}
                      disabled={!sections?.length || currentSectionIndex === sections.length - 1}
                      icon={<ChevronRight className="h-4 w-4" />}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {currentMode === 'discussion' && (
            <motion.div
              key="discussion"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="h-full flex flex-col"
            >
              {/* Discussion Header */}
              <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Left Section */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-2 sm:gap-0">
                    <div className="bg-primary-100 p-2 rounded-lg self-start sm:self-auto">
                      <Users className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Live Discussion</h2>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm sm:text-base text-gray-600">Interactive AI Classroom</p>
                        {connectionStatus === 'connected' && (
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-xs text-green-600">Connected</span>
                          </div>
                        )}
                        {connectionStatus === 'connecting' && (
                          <div className="flex items-center space-x-1">
                            <Loader2 className="w-3 h-3 animate-spin text-yellow-500" />
                            <span className="text-xs text-yellow-600">Connecting...</span>
                          </div>
                        )}
                        {connectionStatus === 'disconnected' && (
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                            <span className="text-xs text-red-600">Disconnected</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Section */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                    {/* Chapter Selector */}
                    <div className="relative w-full sm:w-auto">
                      <select
                        value={selectedChapterForDiscussion?.index || ''}
                        onChange={(e) => {
                          const target = chapters?.find(c => c.index === parseInt(e.target.value));
                          if (target) {
                            setSelectedChapterForDiscussion(target);
                          }
                        }}
                        className="w-full sm:w-auto appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        {chapters?.map((chapter) => (
                          <option key={chapter.index} value={chapter.index}>
                            {chapter.title}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>

                    {!discussionStarted && (
                      <Button
                        onClick={handleStartDiscussion}
                        disabled={startDiscussionLoading || connectionStatus !== 'connected'}
                        loading={startDiscussionLoading}
                        icon={startDiscussionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                        className="w-full sm:w-auto bg-gradient-to-r from-primary-600 to-accent-600"
                      >
                        {startDiscussionLoading ? 'Starting...' : 'Start Discussion'}
                      </Button>
                    )}

                    {discussionStarted && (
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleGlobalAudioToggle}
                          icon={audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                        />
                        
                        {!isTTSAvailable() && audioEnabled && (
                          <div className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                            TTS not configured
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-xs text-gray-500">Live</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {!discussionStarted ? (
                <div className="flex-1 flex items-center justify-center p-6">
                  <Card className="max-w-md mx-auto">
                    <CardContent className="p-8 text-center">
                      <div className="bg-primary-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="h-8 w-8 text-primary-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Discuss?</h3>
                      <p className="text-gray-600 mb-6">
                        Select a chapter above and click "Start Discussion" to begin an interactive AI classroom session.
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Current chapter: <span className="font-medium">{selectedChapterForDiscussion?.title}</span>
                      </p>
                      
                      {startDiscussionLoading && (
                        <div className="flex flex-col items-center justify-center mt-6">
                          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-3" />
                          <p className="text-primary-600 font-medium">Preparing discussion...</p>
                          <p className="text-xs text-gray-500 mt-1">This may take a few moments</p>
                        </div>
                      )}
                      
                      {connectionStatus === 'disconnected' && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            Connection lost. Attempting to reconnect...
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <AnimatePresence initial={false}>
                      {messages.map((message, index) => {
                        return (
                        <motion.div
                          key={message._id}
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ 
                            opacity: message.isOptimistic ? 0.7 : 1, 
                            y: 0, 
                            scale: 1 
                          }}
                          exit={{ opacity: 0, y: -20, scale: 0.95 }}
                          transition={{ 
                            duration: 0.3,
                            delay: index * 0.05,
                            ease: "easeOut"
                          }}
                          className={`flex items-start space-x-3 ${
                            message?.persona?.isUser ? 'flex-row-reverse space-x-reverse' : ''
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg overflow-hidden ${
                            message?.persona?.role === 'teacher' ? 'bg-primary-100' :
                            message?.persona?.role === 'student' ? 'bg-secondary-100' : 'bg-accent-100'
                          }`}>
                            <img
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(message?.persona?.name || '')}&background=random&size=40`}
                              alt={message?.persona?.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          
                          <div className="flex-1 max-w-md">
                            <div className={`rounded-lg p-3 ${
                              message?.persona?.isUser
                                ? 'bg-primary-500 text-white'
                                : message?.persona?.role === 'teacher'
                                ? 'bg-gray-100'
                                : 'bg-secondary-50'
                            } ${message.isOptimistic ? 'opacity-70 border-2 border-dashed border-primary-300' : ''}`}>
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-xs font-medium ${
                                  message?.persona?.isUser ? 'text-primary-100' : 'text-gray-600'
                                }`}>
                                  {message?.persona?.name}
                                </span>
                                {message.isOptimistic && (
                                  <div className="flex items-center space-x-1">
                                    <Loader2 className="h-3 w-3 animate-spin text-current opacity-50" />
                                    <span className="text-xs opacity-50">Sending...</span>
                                  </div>
                                )}
                              </div>
                              <p className="text-sm leading-relaxed">{message?.body}</p>
                            </div>
                            
                            {/* Audio Controls for AI messages ONLY - exclude user messages */}
                            {!message?.persona?.isUser && 
                             message?.persona?.voice?.id && 
                             !message.isOptimistic && (
                              <div className="mt-2">
                                <MessageAudioControls
                                  messageId={message._id}
                                  text={message.body}
                                  voiceId={message.persona.voice.id}
                                  personaRole={message.persona.role}
                                  autoPlay={audioEnabled}
                                  isGlobalAudioEnabled={audioEnabled}
                                  onPlayStart={async(msgId?: string)=>{
                                    const id = msgId ?? playingMessageId
                                    if(id){
                                      handleMessageAudioPlay(id)
                                      await playMessage(id)
                                    }
                                  }}
                                  onPlayEnd={handleMessageAudioEnd}
                                  isCurrentlyPlaying={playingMessageId === message._id}
                                  onError={(error) => {
                                    console.error('Message audio error:', error);
                                    setPlayingMessageId(null);
                                  }}
                                  playingMessageId = {playingMessageId}
                                />
                              </div>
                            )}
                            
                            <p className={`text-xs mt-1 ${
                              message?.persona?.isUser ? 'text-right text-gray-400' : 'text-gray-500'
                            }`}>
                              {message.isOptimistic ? 'Sending...' : new Date(message.createdAt).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                        </motion.div>
                      )})}
                    </AnimatePresence>
                    
                    {/* Enhanced Typing Indicator */}
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center space-x-3"
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-gray-300 animate-pulse" />
                        </div>
                        <div className="bg-gray-100 rounded-lg p-3 flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                          <span className="text-sm text-gray-500">Someone is typing...</span>
                        </div>
                      </motion.div>
                    )}
                    
                    <div ref={chatEndRef} />
                  </div>

                  {/* Enhanced Input Area */}
                  <div className="border-t border-gray-200 p-4 bg-white">
                    <div className="flex items-center space-x-2 mb-3">
                      <Button
                        variant={handRaised ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setHandRaised(!handRaised)}
                        icon={<Hand className="h-4 w-4" />}
                      >
                        {handRaised ? 'Hand Raised' : 'Raise Hand'}
                      </Button>
                      
                      <Button
                        variant={userMicActive ? "danger" : "outline"}
                        size="sm"
                        onClick={() => setUserMicActive(!userMicActive)}
                        icon={userMicActive ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      >
                        {userMicActive ? 'Mute' : 'Unmute'}
                      </Button>
                      
                      {messageQueue.length > 0 && (
                        <div className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                          {messageQueue.length} message(s) queued
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder={connectionStatus === 'connected' ? "Join the discussion..." : "Connecting..."}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleUserMessage();
                          }
                        }}
                        disabled={connectionStatus !== 'connected'}
                        maxLength={500}
                      />
                      <Button
                        size="sm"
                        onClick={handleUserMessage}
                        disabled={!userInput.trim() || connectionStatus !== 'connected'}
                        icon={<Send className="h-4 w-4" />}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>
                          {connectionStatus === 'connected' && 'Connected to live discussion'}
                          {connectionStatus === 'connecting' && 'Connecting to discussion...'}
                          {connectionStatus === 'disconnected' && 'Disconnected - messages will be queued'}
                        </span>
                        
                        {audioEnabled && isTTSAvailable() && (
                          <div className="flex items-center space-x-1">
                            <Volume2 className="h-3 w-3 text-green-500" />
                            <span className="text-green-600">Audio enabled</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        {userInput.length}/500
                      </p>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ClassroomInterface;