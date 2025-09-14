# TTS Integration for AI Classroom

This document explains how to integrate the Text-to-Speech (TTS) system with your classroom interface using the provided components and hooks.

## Overview

The TTS integration consists of several layers:

1. **Core TTS Class** (`utils/tts.ts`) - Your original queue-based TTS implementation
2. **React Hook** (`utils/hooks/useTTS.ts`) - React wrapper for the TTS class
3. **UI Components** - Pre-built components for different use cases
4. **Integration Components** - Complete solutions for classroom interface

## Quick Start

### 1. Basic Hook Usage

```tsx
import { useTTS } from '../utils/hooks/useTTS';

const MyComponent = () => {
  const { addToQueue, play, pause, stop, isPlaying } = useTTS({
    voiceId: 'your-voice-id',
    autoplay: false,
    onNodePlay: (nodeId) => console.log('Playing:', nodeId),
    onError: (error) => console.error('TTS Error:', error)
  });

  const handleAddText = () => {
    addToQueue('Hello, this will be spoken!');
    play();
  };

  return (
    <div>
      <button onClick={handleAddText}>Speak Text</button>
      <button onClick={pause} disabled={!isPlaying}>Pause</button>
      <button onClick={stop}>Stop</button>
    </div>
  );
};
```

### 2. Using TTSPlayer Component

```tsx
import TTSPlayer, { TTSPlayerRef } from '../components/ui/TTSPlayer';

const MyComponent = () => {
  const ttsPlayerRef = useRef<TTSPlayerRef>(null);

  const addTextToPlayer = () => {
    if (ttsPlayerRef.current) {
      ttsPlayerRef.current.addText('This text will be added to the queue');
    }
  };

  return (
    <div>
      <button onClick={addTextToPlayer}>Add Text</button>
      <TTSPlayer
        ref={ttsPlayerRef}
        voiceId="your-voice-id"
        autoplay={false}
        onPlayStart={() => console.log('Started playing')}
        onPlayEnd={() => console.log('Finished playing')}
      />
    </div>
  );
};
```

### 3. Classroom Integration

```tsx
import ClassroomTTSPlayer from '../components/ui/ClassroomTTSPlayer';

const ClassroomInterface = () => {
  const [currentMode, setCurrentMode] = useState<'reading' | 'discussion'>('reading');
  const [messages, setMessages] = useState([...]);
  const [currentSection, setCurrentSection] = useState({...});

  return (
    <div>
      {/* Your existing classroom interface */}
      
      {/* Add TTS Player */}
      <ClassroomTTSPlayer
        messages={currentMode === 'discussion' ? messages : []}
        currentSection={currentMode === 'reading' ? currentSection : undefined}
        mode={currentMode}
        voiceId="your-voice-id"
        autoplay={true}
        onPlayStart={() => console.log('TTS started')}
        onPlayEnd={() => console.log('TTS ended')}
      />
    </div>
  );
};
```

## Components

### useTTS Hook

**Purpose**: React hook wrapper for the TTS class with state management.

**Props**:
- `voiceId?: string` - Voice ID for Murf.ai API
- `autoplay?: boolean` - Auto-play next items in queue
- `onNodePlay?: (nodeId: string) => void` - Callback when playback starts
- `onNodeEnd?: (nodeId: string) => void` - Callback when playback ends
- `onQueueComplete?: () => void` - Callback when queue is finished
- `onError?: (error: Error) => void` - Error callback

**Returns**:
- `isPlaying: boolean` - Current playback state
- `isLoading: boolean` - Loading state
- `currentNodeId: string | null` - Currently playing item ID
- `queueLength: number` - Number of items in queue
- `addToQueue: (text: string, id?: string) => string` - Add text to queue
- `play: () => Promise<void>` - Start/resume playback
- `pause: () => void` - Pause playback
- `stop: () => void` - Stop playback
- `clear: () => void` - Clear queue
- `seekToNode: (nodeId: string) => void` - Jump to specific item
- `removeFromQueue: (nodeId: string) => void` - Remove item from queue
- `getQueueItems: () => QueueItem[]` - Get queue status

### TTSPlayer Component

**Purpose**: Complete TTS player UI with controls and queue management.

**Props**:
- `voiceId?: string` - Voice ID for API
- `autoplay?: boolean` - Auto-play mode
- `className?: string` - CSS classes
- `onPlayStart?: () => void` - Play start callback
- `onPlayEnd?: () => void` - Play end callback
- `onError?: (error: Error) => void` - Error callback

**Ref Methods**:
- `addText: (text: string, id?: string) => string` - Add text to queue
- `clear: () => void` - Clear queue
- `play: () => Promise<void>` - Start playback
- `pause: () => void` - Pause playback
- `stop: () => void` - Stop playback

### ClassroomTTSPlayer Component

**Purpose**: Specialized TTS player for classroom interface with automatic content processing.

**Props**:
- `messages?: Message[]` - Discussion messages (for discussion mode)
- `currentSection?: Section` - Current reading section (for reading mode)
- `mode: 'reading' | 'discussion'` - Current classroom mode
- `voiceId?: string` - Voice ID
- `autoplay?: boolean` - Auto-play mode
- `onPlayStart?: () => void` - Play start callback
- `onPlayEnd?: () => void` - Play end callback
- `className?: string` - CSS classes

**Features**:
- Automatically processes new messages in discussion mode
- Automatically processes section changes in reading mode
- Mode-aware content filtering
- Queue management for different content types

## Integration Patterns

### Pattern 1: Side Panel Integration

Add TTS as a collapsible side panel:

```tsx
const [showTTSPanel, setShowTTSPanel] = useState(false);

return (
  <div className="flex h-screen">
    <div className={`flex-1 ${showTTSPanel ? 'mr-80' : ''}`}>
      {/* Main content */}
    </div>
    
    {showTTSPanel && (
      <div className="w-80 bg-white border-l">
        <ClassroomTTSPlayer {...props} />
      </div>
    )}
  </div>
);
```

### Pattern 2: Floating Player

Add TTS as a floating player at the bottom:

```tsx
return (
  <div className="relative h-screen">
    {/* Main content */}
    
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <ClassroomTTSPlayer {...props} />
    </div>
  </div>
);
```

### Pattern 3: Integrated Controls

Embed TTS controls directly in your interface:

```tsx
const { addToQueue, play, pause, isPlaying } = useTTS({...});

// In your message rendering
{messages.map(message => (
  <div key={message._id}>
    {message.body}
    {!message.persona.isUser && (
      <button onClick={() => {
        addToQueue(message.body, message._id);
        play();
      }}>
        🔊 Play
      </button>
    )}
  </div>
))}
```

## Configuration

### Environment Variables

Make sure you have the Murf.ai API key configured:

```env
NEXT_PUBLIC_MURF_API_KEY=your_murf_api_key_here
```

### Voice Configuration

Configure different voices for different personas:

```tsx
const voiceConfig = {
  teacher: 'teacher-voice-id',
  student: 'student-voice-id',
  narrator: 'narrator-voice-id'
};

// Use in components
<ClassroomTTSPlayer
  voiceId={voiceConfig[persona.role]}
  {...otherProps}
/>
```

## Error Handling

The TTS system includes comprehensive error handling:

```tsx
const { addToQueue, play } = useTTS({
  onError: (error) => {
    console.error('TTS Error:', error);
    toast.error('Speech generation failed');
  }
});
```

Common errors:
- API key not configured
- Network connectivity issues
- Invalid voice ID
- Audio context initialization failures

## Performance Considerations

1. **Caching**: The TTS system uses axios-cache-adapter for API response caching
2. **Queue Management**: Large queues are handled efficiently with lazy loading
3. **Memory Management**: Audio buffers are cleaned up automatically
4. **Debouncing**: Rapid content changes are debounced to prevent excessive API calls

## Customization

### Custom Styling

All components accept `className` props for custom styling:

```tsx
<ClassroomTTSPlayer
  className="custom-tts-player shadow-lg rounded-xl"
  {...props}
/>
```

### Custom Voice Processing

Override the text cleaning function:

```tsx
// In TextNode class
private cleanTextForTTS(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
    .replace(/\*(.*?)\*/g, '$1') // Remove markdown italic
    // Add your custom processing here
    .trim();
}
```

## Troubleshooting

### Common Issues

1. **No audio playback**: Check browser audio permissions and Web Audio API support
2. **API errors**: Verify Murf.ai API key and network connectivity
3. **Queue not updating**: Ensure proper React state management and re-renders
4. **Memory leaks**: Components automatically clean up on unmount

### Debug Mode

Enable debug logging:

```tsx
const { addToQueue } = useTTS({
  onNodePlay: (nodeId) => console.log('Playing:', nodeId),
  onNodeEnd: (nodeId) => console.log('Finished:', nodeId),
  onError: (error) => console.error('TTS Error:', error)
});
```

## Examples

See `examples/TTSIntegrationExample.tsx` for complete working examples of all integration patterns.