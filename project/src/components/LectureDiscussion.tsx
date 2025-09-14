'use client'

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  ThumbsUp, 
  ThumbsDown, 
  Users,
  Mic,
  MicOff,
  Hand,
  Volume2,
  VolumeX
} from 'lucide-react';
import Button from './ui/Button';
import { Card, CardContent } from './ui/Card';
import VoiceIndicator from './ui/VoiceIndicator';

interface DiscussionMessage {
  id: string;
  role: 'teacher' | 'student' | 'user';
  content: string;
  timestamp: string;
  avatar: string;
  name: string;
  isTyping?: boolean;
  reactions?: { likes: number; dislikes: number; };
}

interface LectureDiscussionProps {
  section: {
    id: string;
    title: string;
    content: string;
  };
  isActive: boolean;
}

const LectureDiscussion: React.FC<LectureDiscussionProps> = ({ section, isActive }) => {
  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<'teacher' | 'student' | 'user' | null>(null);
  const [userMicActive, setUserMicActive] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [discussionPhase, setDiscussionPhase] = useState<'intro' | 'discussion' | 'qa' | 'summary'>('intro');
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const discussionTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize discussion when section becomes active
  useEffect(() => {
    if (isActive) {
      initializeDiscussion();
    } else {
      // Clear any ongoing timeouts when section becomes inactive
      if (discussionTimeoutRef.current) {
        clearTimeout(discussionTimeoutRef.current);
      }
    }
  }, [isActive, section]);

  const initializeDiscussion = async () => {
    setMessages([]);
    setDiscussionPhase('intro');
    
    // Teacher introduction
    setTimeout(() => {
      addMessage({
        role: 'teacher',
        content: `Welcome everyone! Today we're exploring "${section.title}". This is a fascinating topic that builds on our previous discussions. Let me start by giving you an overview.`,
        name: 'Dr. Sarah Chen',
        avatar: '👩‍🏫'
      });
    }, 1000);

    // Teacher explains the content
    setTimeout(() => {
      addMessage({
        role: 'teacher',
        content: generateTeacherExplanation(section.content),
        name: 'Dr. Sarah Chen',
        avatar: '👩‍🏫'
      });
      setDiscussionPhase('discussion');
    }, 3000);

    // AI Student responds
    setTimeout(() => {
      addMessage({
        role: 'student',
        content: generateStudentResponse(section.content),
        name: 'Alex Kim',
        avatar: '👨‍🎓'
      });
    }, 6000);

    // Continue the discussion
    setTimeout(() => {
      continueDiscussion();
    }, 9000);
  };

  const addMessage = (messageData: Partial<DiscussionMessage>) => {
    const message: DiscussionMessage = {
      id: Date.now().toString() + Math.random(),
      timestamp: new Date().toISOString(),
      reactions: { likes: 0, dislikes: 0 },
      ...messageData
    } as DiscussionMessage;

    setCurrentSpeaker(message.role as 'teacher' | 'student' | 'user');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      setMessages(prev => [...prev, message]);
      setIsTyping(false);
      setCurrentSpeaker(null);
    }, 1500 + Math.random() * 1000);
  };

  const continueDiscussion = () => {
    const discussionPoints = [
      {
        role: 'teacher' as const,
        content: generateFollowUpQuestion(section.content),
        name: 'Dr. Sarah Chen',
        avatar: '👩‍🏫'
      },
      {
        role: 'student' as const,
        content: generateStudentQuestion(section.content),
        name: 'Alex Kim',
        avatar: '👨‍🎓'
      },
      {
        role: 'teacher' as const,
        content: generateTeacherAnswer(section.content),
        name: 'Dr. Sarah Chen',
        avatar: '👩‍🏫'
      }
    ];

    discussionPoints.forEach((point, index) => {
      discussionTimeoutRef.current = setTimeout(() => {
        addMessage(point);
        
        // After the last message, transition to Q&A phase
        if (index === discussionPoints.length - 1) {
          setTimeout(() => {
            setDiscussionPhase('qa');
            addMessage({
              role: 'teacher',
              content: 'Great discussion so far! Now I\'d love to hear your thoughts and questions. Feel free to jump in anytime.',
              name: 'Dr. Sarah Chen',
              avatar: '👩‍🏫'
            });
          }, 3000);
        }
      }, (index + 1) * 4000);
    });
  };

  const handleUserMessage = () => {
    if (!userInput.trim()) return;

    const userMessage: DiscussionMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput,
      timestamp: new Date().toISOString(),
      name: 'You',
      avatar: '🙋‍♂️',
      reactions: { likes: 0, dislikes: 0 }
    };

    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setHandRaised(false);

    // Generate teacher response to user
    setTimeout(() => {
      addMessage({
        role: 'teacher',
        content: generateTeacherResponseToUser(userInput, section.content),
        name: 'Dr. Sarah Chen',
        avatar: '👩‍🏫'
      });
    }, 2000);

    // Sometimes AI student also responds
    if (Math.random() > 0.6) {
      setTimeout(() => {
        addMessage({
          role: 'student',
          content: generateStudentResponseToUser(userInput),
          name: 'Alex Kim',
          avatar: '👨‍🎓'
        });
      }, 4000);
    }
  };

  const toggleHandRaise = () => {
    setHandRaised(!handRaised);
    if (!handRaised) {
      setTimeout(() => {
        addMessage({
          role: 'teacher',
          content: 'I see you have something to share! Please go ahead with your question or comment.',
          name: 'Dr. Sarah Chen',
          avatar: '👩‍🏫'
        });
      }, 1000);
    }
  };

  const reactToMessage = (messageId: string, reaction: 'like' | 'dislike') => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const newReactions = { ...(msg.reactions ?? {likes: 0, dislikes: 0}) };
        if (reaction === 'like') {
          newReactions.likes = (newReactions.likes || 0) + 1;
        } else {
          newReactions.dislikes = (newReactions.dislikes || 0) + 1;
        }
        return { ...msg, reactions: newReactions };
      }
      return msg;
    }));
  };

  // AI Content Generation Functions
  const generateTeacherExplanation = (content: string) => {
    const explanations = [
      `Let me break this down for you. ${content.substring(0, 150)}... This concept is fundamental because it helps us understand the broader implications in our field.`,
      `This is a really important topic. ${content.substring(0, 120)}... I want you to think about how this connects to what we discussed last week.`,
      `Pay close attention to this part. ${content.substring(0, 140)}... This will be crucial for your understanding of the upcoming material.`
    ];
    return explanations[Math.floor(Math.random() * explanations.length)];
  };

  const generateStudentResponse = (content: string) => {
    const responses = [
      "That's really interesting, Professor! I can see how this relates to the practical applications we discussed earlier.",
      "This makes a lot of sense now. I was wondering about this exact concept when I was doing the reading.",
      "Could you elaborate on how this principle applies in real-world scenarios? I'm trying to connect the theory to practice.",
      "I think I understand the basic concept, but I'm curious about the edge cases or exceptions to this rule."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const generateFollowUpQuestion = (content: string) => {
    const questions = [
      "Now, here's something I want you to think about: How might this principle change as technology evolves?",
      "Let's dive deeper. What do you think would happen if we applied this concept in a different context?",
      "This raises an interesting question: Can anyone think of a situation where this might not apply?",
      "Building on this idea, how do you think this relates to current industry trends?"
    ];
    return questions[Math.floor(Math.random() * questions.length)];
  };

  const generateStudentQuestion = (content: string) => {
    const questions = [
      "Professor, I'm curious about the historical development of this concept. How did researchers first discover this?",
      "This is fascinating! Are there any common misconceptions about this topic that we should be aware of?",
      "I'm wondering about the practical implications. How is this being used in industry right now?",
      "Could you give us an example of how this might be implemented in a real project?"
    ];
    return questions[Math.floor(Math.random() * questions.length)];
  };

  const generateTeacherAnswer = (content: string) => {
    const answers = [
      "Excellent question! Let me explain this with a concrete example that will make it clearer...",
      "I'm glad you asked that. This is actually a common point of confusion, so let me clarify...",
      "That's exactly the kind of critical thinking I want to see! Here's how we can approach this...",
      "Great observation! This connects to several important principles we need to understand..."
    ];
    return answers[Math.floor(Math.random() * answers.length)];
  };

  const generateTeacherResponseToUser = (userInput: string, content: string) => {
    if (userInput.toLowerCase().includes('how')) {
      return "That's a great 'how' question! Let me walk you through the process step by step...";
    } else if (userInput.toLowerCase().includes('why')) {
      return "Excellent 'why' question! The reasoning behind this is quite fascinating...";
    } else if (userInput.toLowerCase().includes('example')) {
      return "I love that you're asking for examples! Let me give you a real-world scenario...";
    } else {
      return "That's a thoughtful contribution! You're touching on something really important here...";
    }
  };

  const generateStudentResponseToUser = (userInput: string) => {
    const responses = [
      "That's a really good point! I hadn't thought about it from that angle.",
      "I was wondering the same thing! Thanks for bringing that up.",
      "Interesting perspective! That actually helps clarify something I was confused about.",
      "Great question! I'm curious to hear the professor's take on this too."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  if (!isActive) {
    return (
      <Card className="h-full opacity-50">
        <CardContent className="p-6 flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Discussion will start when you begin this section</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-100 p-2 rounded-lg">
              <Users className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Live Discussion</h3>
              <p className="text-sm text-gray-500 capitalize">{discussionPhase} phase</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAudioEnabled(!audioEnabled)}
              icon={audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            />
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-gray-500">Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex items-start space-x-3 ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                message.role === 'teacher' ? 'bg-primary-100' :
                message.role === 'student' ? 'bg-secondary-100' : 'bg-accent-100'
              }`}>
                {message.avatar}
              </div>
              
              <div className="flex-1 max-w-md">
                <div className={`rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary-500 text-white'
                    : message.role === 'teacher'
                    ? 'bg-gray-100'
                    : 'bg-secondary-50'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium ${
                      message.role === 'user' ? 'text-primary-100' : 'text-gray-600'
                    }`}>
                      {message.name}
                    </span>
                    {currentSpeaker === message.role && (
                      <VoiceIndicator 
                        isActive={true} 
                        role={message.role} 
                        className="ml-2"
                      />
                    )}
                  </div>
                  <p className="text-sm">{message.content}</p>
                  
                  {/* Reactions */}
                  {message.role !== 'user' && (
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        onClick={() => reactToMessage(message.id, 'like')}
                        className={`flex items-center space-x-1 text-xs px-2 py-1 rounded ${
                          (message.role as 'user' | 'teacher' | 'student') === 'user' ? 'text-primary-100 hover:bg-primary-400' : 'text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        <ThumbsUp className="h-3 w-3" />
                        <span>{message.reactions?.likes || 0}</span>
                      </button>
                      <button
                        onClick={() => reactToMessage(message.id, 'dislike')}
                        className={`flex items-center space-x-1 text-xs px-2 py-1 rounded ${
                          (message.role as 'user' | 'teacher' | 'student') ? 'text-primary-100 hover:bg-primary-400' : 'text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        <ThumbsDown className="h-3 w-3" />
                        <span>{message.reactions?.dislikes || 0}</span>
                      </button>
                    </div>
                  )}
                </div>
                
                <p className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-right text-gray-400' : 'text-gray-500'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Typing Indicator */}
        {isTyping && currentSpeaker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-3"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              currentSpeaker === 'teacher' ? 'bg-primary-100' : 'bg-secondary-100'
            }`}>
              {currentSpeaker === 'teacher' ? '👩‍🏫' : '👨‍🎓'}
            </div>
            <div className="bg-gray-100 rounded-lg p-3 flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" ></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} ></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} ></div>
              </div>
              <span className="text-sm text-gray-500">
                {currentSpeaker === 'teacher' ? 'Dr. Chen' : 'Alex'} is typing...
              </span>
              <VoiceIndicator isActive={true} role={currentSpeaker} />
            </div>
          </motion.div>
        )}
        
        <div ref={chatEndRef}> </div>
      
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Button
            variant={handRaised ? "primary" : "outline"}
            size="sm"
            onClick={toggleHandRaise}
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
          
          {userMicActive && (
            <VoiceIndicator isActive={true} role="user" />
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={discussionPhase === 'qa' ? "Ask a question or share your thoughts..." : "Join the discussion..."}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            onKeyPress={(e) => e.key === 'Enter' && handleUserMessage()}
          />
          <Button
            size="sm"
            onClick={handleUserMessage}
            disabled={!userInput.trim()}
            icon={<Send className="h-4 w-4" />}
          />
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          {discussionPhase === 'intro' && "The professor is introducing the topic..."}
          {discussionPhase === 'discussion' && "Active discussion in progress"}
          {discussionPhase === 'qa' && "Q&A session - feel free to participate!"}
          {discussionPhase === 'summary' && "Wrapping up the discussion"}
        </p>
      </div>
    </Card>
  );
};

export default LectureDiscussion;