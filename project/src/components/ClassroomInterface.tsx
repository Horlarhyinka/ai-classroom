'use client'

import React, { useState, useEffect, useRef, useCallback, RefObject } from 'react';
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
  ChevronDown,
  Loader2,
  Headphones,
  Speech
} from 'lucide-react';
import Button from './ui/Button';
import { Card, CardContent } from './ui/Card';
import TTSControls from './ui/TTSControls';
import AudioIndicator from './ui/AudioIndicator';
import { documentAPI } from '../lib/api';
import { useParams } from 'next/navigation';
import { io, Socket } from "socket.io-client";
import { useSession } from '../utils/hooks/useSession';
import { stopSpeaking, clearSpeechQueue, isTTSAvailable } from '../utils/textToSpeech';
import toast from 'react-hot-toast';
import { TextNode } from '../utils/tts';
import { useTtsChat } from '../utils/hooks/useTts';
import { DiscussionMessageCard } from './ui/DiscussionMessageCard';

const ReactMarkdown = React.lazy(() =>import('react-markdown'))

interface Chapter {
  _id: string;
  docId: string;
  title: string;
  index: number;
  discussion: { _id: string } | string;
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
  const [currentMode, setCurrentMode] = useState<'reading' | 'discussion'>('reading');

  // Reading mode states
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [autoReadMode, setAutoReadMode] = useState(true);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const { session } = useSession()

  const { id: docId } = useParams<{ id: string }>();

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
  const { session: sessionData, } = useSession();
  const [user, setUser] = useState<any>();
  const [nowPlaying, setNowPlaying] = useState<string>()
  const [discussionAutoplay, setDiscussionAutoPlay] = useState<boolean>(true)
  const [discussionCurrentNode, setDiscussionCurrentNode] = useState<TextNode | null>(null)
  const [reconnect, setReconnect] = useState(false)

  const chatEndRef = useRef<HTMLDivElement>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const messageTimeoutRef = useRef<NodeJS.Timeout>();

  const [messageNodes, setMessageNodes] = useState<TextNode[]>([])
  const [sectionNode, setSectionNode] = useState<TextNode>()
  const discussionMessageAudioRef = useRef() as RefObject<HTMLAudioElement>;
  const sectionAudioRef = useRef() as RefObject<HTMLAudioElement>;
  useEffect(() => {
    console.log('Start discussion loading changed:', startDiscussionLoading)
  }, [startDiscussionLoading])

  const onPlaystart = useCallback((node: TextNode) => {
    setDiscussionCurrentNode(node)
    console.log('Called Play start witj::', node)
  }, [discussionAutoplay])

  const onPlaystop = useCallback((node: TextNode) => {
    setDiscussionCurrentNode(node)
  }, [discussionAutoplay])

  const onFetchstart = useCallback((node: TextNode) => {
    setDiscussionCurrentNode(node)
    // console.log('On Fetch Start:', node)
  }, [discussionAutoplay])

  const onFetchstop = useCallback((node: TextNode) => {
    setDiscussionCurrentNode(node)
    // console.log('On Fetch Stop:', node)
  }, [discussionAutoplay])
  const randId = (n = 8) => Math.floor(Math.random() * 10 ** n)
  useEffect(() => {
    if (currentSection) {
      setSectionNode(undefined)
      const sectNode = new TextNode(currentSection._id, currentSection.body, {
        _id: session?._id,
        id: randId().toString(),
        name: `${session?.firstName} ${session?.lastName}`,
        role: "student",
        isUser: true,
      }, new Date(), sectionAudioRef)
      sectNode.fetch()
        .then(() => {
          setSectionNode(sectNode)
        })
    }
  }, [currentSection])



  const {
    nodes: discussionNodes,
    addNode: addDiscussionNode,
    startAutoplay,
    playNode,
    stopPlay
  } = useTtsChat({ messages, audioRef: discussionMessageAudioRef, autoplay: discussionAutoplay, onPlaystart, onPlaystop, onFetchstart, onFetchstop });


  function handleDiscussionPlay(node: TextNode) {
    setDiscussionCurrentNode(node)
    playNode(node)
  }

  function handleDiscussionPause() {
    setDiscussionCurrentNode(null)
    stopPlay()
  }

  useEffect(() => {
    if (discussionNodes?.length) {
      setMessageNodes(discussionNodes)
    }
  }, [discussionNodes])

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
    const timeoutId = setTimeout(scrollToBottom, 100)
    return () => clearTimeout(timeoutId);
  }, [messages, scrollToBottom]);

  useEffect(() => {
    console.log('node changed:', discussionCurrentNode)
  }, [discussionCurrentNode])



  useEffect(() => {
    console.log({ discussionAutoplay, nowPlaying, discussionCurrentNode, }, 'be')
    if (discussionAutoplay && !nowPlaying) {
      if (discussionCurrentNode) {
        setNowPlaying(discussionCurrentNode.id)
      } else {
        if (messageNodes.length) {
          const firstUnplayed = messageNodes.find(dn => !dn.played)
          console.log({ firstUnplayed })
          if (firstUnplayed) {
            // setNowPlaying(firstUnplayed.id)
            setDiscussionCurrentNode(firstUnplayed)
            console.log('first unplayed node set')
            startAutoplay()
              .then(() => {
                console.log('autoplay done')

              })
              .catch(err => {
                console.log('Autoplay Error:', err)
              })

          }
        }
      }

    }

  }, [discussionAutoplay, messageNodes])
  useEffect(() => {
    console.log('Channel ID changed')
  })

  // Enhanced socket connection with reconnection logic
  useEffect(() => {
    console.log("Will init socket?", sessionData?.user?._id && channelId && !globalSocket)
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
        socket.emit('join_discussion', { channel: channelId });

        // Process any queued messages
        if (messageQueue.length > 0) {
          messageQueue.forEach(msg => {
            socket.emit('user_message', { channel: channelId, body: msg });
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
        // Clear start discussion loading if it was active
        setStartDiscussionLoading(false);
        // Clear typing indicator
        setIsTyping(false);

        // Add message and remove any optimistic messages
        if (payload?.data?.data) {
          const newMessage = payload.data.data;
          if (newMessage.persona?.isUser) return
          if (selectedChapterForDiscussion && !selectedChapterForDiscussion?.discussionStarted) {
            setSelectedChapterForDiscussion({ ...selectedChapterForDiscussion, discussionStarted: true })
            setDiscussionStarted(true)
          }
          addDiscussionNode(newMessage as Message)
          // Auto-play audio for AI messages if audio is enabled and voice ID is available
          // IMPORTANT: Only play audio for NON-USER messages (AI personas)
          if (audioEnabled &&
            newMessage.persona &&
            !newMessage.persona.isUser && // This is the key check - don't play user messages
            newMessage.persona.voice?.id &&
            isTTSAvailable()) {

            // Small delay to ensure message is rendered
            setTimeout(() => {
              // handleMessageAudioPlay(newMessage._id);
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
  }, [sessionData?.user?._id, channelId, reconnect]);

  useEffect(() => {
    if (connectionStatus == 'disconnected' || !globalSocket) {
      console.log('Selected channel for discussion...', selectedChapterForDiscussion)
      setReconnect(!reconnect)
    }
    if (connectionStatus == "connected" && globalSocket && channelId) {
      // Always emit join_discussion when connected and channelId is available
      // The server will handle duplicate joins gracefully
      globalSocket.emit('join_discussion', { channel: channelId });
    }

  }, [connectionStatus, channelId])

  useEffect(() => {
    if (sessionData?.user) {
      setUser(sessionData.user);
    }
  }, [sessionData]);


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
        if (!apiRes?._id) {
          setMessages([]);
        } else {
          console.log({ channelId, ap_id: apiRes?._id })
          console.log('Lets update channel ID to:', apiRes?._id)
          setChannelId(apiRes?._id) //marker_2

          if (apiRes.messages?.length) {
            setMessages(apiRes.messages);
            if (!playingMessageId) {
              const sp = apiRes?.messages?.find((m: Message) => !m?.persona?.isUser)
              if (sp) {
                setTimeout(() => {
                  // handleMessageAudioPlay(sp?._id);
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
  }, [selectedChapterForDiscussion]);

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


  //marker_1

  // Enhanced start discussion with better UX
  const handleStartDiscussion = useCallback(async () => {
    if (!selectedChapterForDiscussion) {
      toast.error('Please select a chapter first');
      return;
    }
    console.log('True setter 1...')
    setStartDiscussionLoading(true);
    const newDiscussion = await documentAPI.createDiscussion(docId, selectedChapterForDiscussion?._id)
    console.log("New discussion generated...")
    if (newDiscussion?._id) {
      setChannelId(newDiscussion?._id)
    }
    console.log('discussion updated')
    try {
      // Wait for socket connection with proper timeout
      await new Promise((resolve, reject) => {
        const maxWaitTime = 15000; // 15 seconds max wait
        const checkInterval = 1000; // Check every 1 second
        let elapsed = 0;

        const intrvl = setInterval(() => {
          elapsed += checkInterval;

          if (globalSocket && connectionStatus === 'connected') {
            clearInterval(intrvl);
            resolve(true);
            return;
          }

          if (elapsed >= maxWaitTime) {
            console.log('Socket connection timeout');
            clearInterval(intrvl);
            reject(new Error('Socket connection timeout'));
            return;
          }

          console.log(`Waiting for socket connection... ${elapsed}ms elapsed`);
        }, checkInterval);
      });
    } catch (err: unknown) {
      setStartDiscussionLoading(false)
      toast.error('Connection timeout')
      console.log(`Connection error: ${err}`)
    }

    try {
      if (globalSocket && connectionStatus === 'connected') {
        console.log('Emmitting start_discussion')
        globalSocket.emit('start_discussion', {
          docId,
          chapter: selectedChapterForDiscussion._id,
          channel: channelId,
        });

      }
    } catch (error) {
      console.error('Error starting discussion:', error);
      toast.error('Failed to start discussion');
      setStartDiscussionLoading(false);
    }
  }, [globalSocket, connectionStatus, selectedChapterForDiscussion, docId]);

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
      console.log('Found global socket, hence, emmiting message...', { channel: channelId, body: messageText })
      globalSocket.emit('user_message', { channel: channelId, body: messageText });
      setIsTyping(true);

      // Clear typing indicator after a reasonable time
      setTimeout(() => setIsTyping(false), 3000);
    } else {
      // Queue message if not connected and remove optimistic message
      setMessageQueue(prev => [...prev, messageText]);
      setMessages(prev => prev.filter(msg => msg.tempId !== tempId));
      toast.error('Message queued. Reconnecting...');
    }
  }, [userInput, globalSocket, connectionStatus, channelId, user]);


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
    console.log('Failed to generate speech:', error)
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

  useEffect(() => {
    console.log('I am running...', playingMessageId)
    if (audioEnabled) {


      const nextTarget = messages.find((m) => !m.persona.isUser)
      console.log('Playing next:', nextTarget)
      if (nextTarget) {
        setPlayingMessageId(nextTarget?._id)
      }


    }
  }, [audioEnabled,])

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
              className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${currentMode === 'reading'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Reading</span>
            </button>
            <button
              onClick={() => setCurrentMode('discussion')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${currentMode === 'discussion'
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
                  <div className='sm:max-w-[40%]' >
                    <h2 className="text-xl font-semibold text-gray-900 truncate hidden sm:block">{selectedChapterForReading?.title}</h2>
                    {/* Mobile: Select dropdown */}
                    <div className="sm:hidden">
                      <select
                        value={selectedChapterForReading?.index || ''}
                        onChange={(e) => goToChapter(parseInt(e.target.value))}
                        className="w-full px-3 bg-white py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        {chapters?.map((chapter, i) => (
                          <option key={chapter._id} value={chapter.index}>
                            Chapter {i + 1}: {chapter.title}
                          </option>
                        ))}
                      </select>
                    </div >
                    <p className="text-gray-600">
                      Section {currentSectionIndex + 1} of {sections?.length}: {currentSection?.title}
                    </p>
                  </div>
                  {/* Chapter Navigation */}


                  {/* Desktop: Scrollable buttons */}
                  <div className="hidden sm:block sm:max-w-[55%]">
                    <div className="flex items-center space-x-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pb-2">
                      {chapters?.map((chapter, i) => (
                        <button
                          key={chapter._id}
                          onClick={() => goToChapter(chapter.index)}
                          className={`flex-shrink-0 px-3 py-1 rounded-md text-sm font-medium transition-colors ${chapter.index === selectedChapterForReading?.index
                            ? 'bg-primary-100 text-primary-700'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                        >
                          Ch {i + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Reading Mode Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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
              <div className="flex-1 overflow-y-auto p-2 sm:p-6">
                <Card className="max-w-4xl mx-auto w-full">
                  <CardContent className="p-4 sm:p-8">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">{currentSection?.title}</h3>
                    <div className="prose max-w-none mb-4 sm:mb-6">
                      <div className="text-gray-800 leading-relaxed text-base sm:text-lg">
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
                        node={sectionNode ?? undefined}
                        className="mt-4 sm:mt-6"
                        autoPlay={autoReadMode}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Reading Navigation */}
              <div className="bg-white border-t border-gray-200 p-4">
                {(
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
                            className={`w-3 h-3 rounded-full transition-colors ${index === currentSectionIndex
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
              </div>
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
                        value={selectedChapterForDiscussion?._id || ''}
                        onChange={(e) => {
                          const target = chapters?.find(c => c._id === e.target.value);
                          if (target) {
                            setSelectedChapterForDiscussion(target);
                          }
                        }}
                        className="w-full sm:w-auto appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        {chapters?.map((chapter) => (
                          <option key={chapter._id} value={chapter._id}>
                            {chapter.title}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>

                    {!messages.length && (
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
                          onClick={() => setDiscussionAutoPlay(!discussionAutoplay)}
                          icon={
                            discussionAutoplay ? (
                              <div className="rounded-full bg-blue-100 text-blue-600">
                                <Speech className="h-4 w-4" />
                              </div>
                            ) : (
                              <Speech className="h-4 w-4 text-gray-600" />
                            )
                          }
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

              {!selectedChapterForDiscussion?.discussionStarted ? (
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

                      {connectionStatus === 'disconnected' && !selectedChapterForDiscussion?.discussionStarted && (
                        <div>
                          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                              Connection lost. Start discussion to reconnect
                            </p>
                          </div>
                          {/*<Button
                            onClick={handleStartDiscussion}
                            loading={startDiscussionLoading}
                            icon={startDiscussionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                            className="w-full bg-gradient-to-r from-primary-600 to-accent-600 mt-4"
                          >
                            Start discussion
                          </Button>*/}
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
                      {
                        messageNodes.map((messageNode) => {
                          return (
                            <DiscussionMessageCard handlePlay={handleDiscussionPlay} handlePause={handleDiscussionPause} currentNode={discussionCurrentNode} node={messageNode} key={messageNode.id} />
                          )
                          // return <h2>Message Here????</h2>
                        })}
                      <audio className='hidden' ref={discussionMessageAudioRef} ></audio>
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