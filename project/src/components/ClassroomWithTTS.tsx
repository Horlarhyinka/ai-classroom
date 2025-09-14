import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, MessageCircle, Volume2, VolumeX } from 'lucide-react';
import ClassroomInterface from './ClassroomInterface';
import ClassroomTTSIntegration from './ClassroomTTSIntegration';
import Button from './ui/Button';

interface ClassroomWithTTSProps {
  // Props that would come from your existing classroom page
  docId: string;
}

const ClassroomWithTTS: React.FC<ClassroomWithTTSProps> = ({ docId }) => {
  const [currentMode, setCurrentMode] = useState<'reading' | 'discussion'>('reading');
  const [showTTSPanel, setShowTTSPanel] = useState(false);
  
  // Mock data - replace with your actual data from ClassroomInterface
  const [messages, setMessages] = useState([
    {
      _id: '1',
      body: 'Welcome to our discussion about machine learning fundamentals.',
      persona: {
        name: 'AI Teacher',
        voice: { id: 'teacher-voice-id' },
        isUser: false
      }
    },
    {
      _id: '2', 
      body: 'What are the main types of machine learning?',
      persona: {
        name: 'Student',
        isUser: true
      }
    },
    {
      _id: '3',
      body: 'Great question! There are three main types: supervised learning, unsupervised learning, and reinforcement learning. Let me explain each one.',
      persona: {
        name: 'AI Teacher',
        voice: { id: 'teacher-voice-id' },
        isUser: false
      }
    }
  ]);

  const [currentSection, setCurrentSection] = useState({
    title: 'Introduction to Machine Learning',
    body: `Machine learning is a subset of artificial intelligence that provides systems the ability to automatically learn and improve from experience without being explicitly programmed. 

In this comprehensive introduction, we'll explore the fundamental concepts that make machine learning such a powerful tool in today's technology landscape.`
  });

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header with TTS Toggle */}
      <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Classroom with TTS</h1>
            <p className="text-gray-600">Interactive Learning with Audio Playback</p>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Mode Toggle */}
            <div className="flex items-center space-x-0 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setCurrentMode('reading')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
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
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                  currentMode === 'discussion'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MessageCircle className="h-4 w-4" />
                <span>Discussion</span>
              </button>
            </div>
            
            {/* TTS Panel Toggle */}
            <Button
              variant={showTTSPanel ? "primary" : "outline"}
              onClick={() => setShowTTSPanel(!showTTSPanel)}
              icon={showTTSPanel ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            >
              Audio Panel
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Classroom Interface */}
        <div className={`flex-1 ${showTTSPanel ? 'mr-80' : ''} transition-all duration-300`}>
          {/* Your existing ClassroomInterface component would go here */}
          <div className="h-full p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              {currentMode === 'reading' ? (
                <div className="bg-white rounded-lg shadow-sm p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {currentSection.title}
                  </h2>
                  <div className="prose max-w-none text-gray-800 leading-relaxed">
                    {currentSection.body}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Discussion</h2>
                  <div className="space-y-4 mb-6">
                    {messages.map((message) => (
                      <div
                        key={message._id}
                        className={`flex ${message.persona.isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.persona.isUser
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <div className="text-xs font-medium mb-1">
                            {message.persona.name}
                          </div>
                          <div className="text-sm">{message.body}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <Button>Send</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TTS Panel */}
        <AnimatePresence>
          {showTTSPanel && (
            <motion.div
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-80 bg-white border-l border-gray-200 flex-shrink-0 overflow-y-auto"
            >
              <div className="p-4">
                <ClassroomTTSIntegration
                  messages={currentMode === 'discussion' ? messages : []}
                  currentSection={currentMode === 'reading' ? currentSection : undefined}
                  mode={currentMode}
                  defaultVoiceId="default-voice-id"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ClassroomWithTTS;