import React, { useState, useRef } from 'react';
import { useTTS } from '../utils/hooks/useTts';
import TTSPlayer, { TTSPlayerRef } from '../components/ui/TTSPlayer';
import ClassroomTTSPlayer from '../components/ui/ClassroomTTSPlayer';
import Button from '../components/ui/Button';

/**
 * Example showing different ways to integrate TTS with your classroom interface
 */
const TTSIntegrationExample: React.FC = () => {
  const [mode, setMode] = useState<'reading' | 'discussion'>('reading');
  
  // Example 1: Using the useTTS hook directly
  const {
    isPlaying,
    isLoading,
    addToQueue,
    play,
    pause,
    stop,
    clear,
    getQueueItems
  } = useTTS({
    voiceId: 'your-voice-id',
    autoplay: false,
    onNodePlay: (nodeId) => console.log('Playing:', nodeId),
    onNodeEnd: (nodeId) => console.log('Finished:', nodeId),
    onError: (error) => console.error('TTS Error:', error)
  });

  // Example 2: Using TTSPlayer component with ref
  const ttsPlayerRef = useRef<TTSPlayerRef>(null);

  // Example data
  const sampleMessages = [
    {
      _id: '1',
      body: 'Welcome to our machine learning discussion!',
      persona: {
        name: 'AI Teacher',
        voice: { id: 'teacher-voice' },
        isUser: false
      }
    },
    {
      _id: '2',
      body: 'Today we will explore supervised learning algorithms.',
      persona: {
        name: 'AI Teacher', 
        voice: { id: 'teacher-voice' },
        isUser: false
      }
    }
  ];

  const sampleSection = {
    title: 'Introduction to Neural Networks',
    body: 'Neural networks are computing systems inspired by biological neural networks. They consist of interconnected nodes that process information using a connectionist approach to computation.'
  };

  // Example functions
  const handleAddText = () => {
    const sampleTexts = [
      'This is the first text to be spoken.',
      'Here is the second piece of content.',
      'And finally, this is the third text segment.'
    ];
    
    sampleTexts.forEach(text => {
      addToQueue(text);
    });
  };

  const handleAddToPlayer = () => {
    if (ttsPlayerRef.current) {
      ttsPlayerRef.current.addText('This text was added via the player ref!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          TTS Integration Examples
        </h1>
        <p className="text-gray-600">
          Different ways to integrate text-to-speech in your classroom interface
        </p>
      </div>

      {/* Example 1: Direct Hook Usage */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          1. Direct useTTS Hook Usage
        </h2>
        <p className="text-gray-600 mb-4">
          Use the hook directly for maximum control over TTS functionality.
        </p>
        
        <div className="flex items-center space-x-2 mb-4">
          <Button onClick={handleAddText}>Add Sample Texts</Button>
          <Button onClick={play} disabled={isLoading}>
            {isPlaying ? 'Playing...' : 'Play'}
          </Button>
          <Button onClick={pause} disabled={!isPlaying}>Pause</Button>
          <Button onClick={stop}>Stop</Button>
          <Button onClick={clear} variant="outline">Clear Queue</Button>
        </div>
        
        <div className="text-sm text-gray-600">
          Queue items: {getQueueItems().length} | 
          Status: {isLoading ? 'Loading' : isPlaying ? 'Playing' : 'Ready'}
        </div>
      </div>

      {/* Example 2: TTSPlayer Component */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          2. TTSPlayer Component
        </h2>
        <p className="text-gray-600 mb-4">
          Use the TTSPlayer component for a complete UI experience.
        </p>
        
        <div className="mb-4">
          <Button onClick={handleAddToPlayer}>Add Text to Player</Button>
        </div>
        
        <TTSPlayer
          ref={ttsPlayerRef}
          voiceId="your-voice-id"
          autoplay={false}
          onPlayStart={() => console.log('Player started')}
          onPlayEnd={() => console.log('Player ended')}
        />
      </div>

      {/* Example 3: Classroom Integration */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          3. Classroom TTS Integration
        </h2>
        <p className="text-gray-600 mb-4">
          Complete integration for classroom interface with mode switching.
        </p>
        
        <div className="flex items-center space-x-2 mb-4">
          <Button
            variant={mode === 'reading' ? 'primary' : 'outline'}
            onClick={() => setMode('reading')}
          >
            Reading Mode
          </Button>
          <Button
            variant={mode === 'discussion' ? 'primary' : 'outline'}
            onClick={() => setMode('discussion')}
          >
            Discussion Mode
          </Button>
        </div>
        
        <ClassroomTTSPlayer
          messages={mode === 'discussion' ? sampleMessages : []}
          currentSection={mode === 'reading' ? sampleSection : undefined}
          mode={mode}
          voiceId="your-voice-id"
          autoplay={false}
          onPlayStart={() => console.log('Classroom TTS started')}
          onPlayEnd={() => console.log('Classroom TTS ended')}
        />
      </div>

      {/* Integration Code Examples */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Integration Code Examples
        </h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Basic Hook Usage:</h3>
            <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`const { addToQueue, play, pause, stop } = useTTS({
  voiceId: 'your-voice-id',
  autoplay: false,
  onNodePlay: (nodeId) => console.log('Playing:', nodeId),
  onError: (error) => console.error('TTS Error:', error)
});

// Add text to queue
const textId = addToQueue('Hello, this is a test message');

// Control playback
await play();
pause();
stop();`}
            </pre>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Component Integration:</h3>
            <pre className="bg-gray-800 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`// In your ClassroomInterface component
import ClassroomTTSPlayer from './ui/ClassroomTTSPlayer';

<ClassroomTTSPlayer
  messages={messages}
  currentSection={currentSection}
  mode={currentMode}
  voiceId="your-voice-id"
  autoplay={true}
  onPlayStart={() => setIsPlaying(true)}
  onPlayEnd={() => setIsPlaying(false)}
/>`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TTSIntegrationExample;