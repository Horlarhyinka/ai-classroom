import toast from 'react-hot-toast';
import axios from 'axios';
import {setupCache} from 'axios-cache-adapter';

interface TTSOptions {
  voice?: string;
  model?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  useSpeakerBoost?: boolean;
}

interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

interface QueueItem {
  text: string;
  options?: TTSOptions;
  resolve: Function;
  reject: Function;
  id: string;
}

class TextToSpeechService {
  private apiKey: string;
  private baseUrl: string = 'https://api.elevenlabs.io/v1';
  private murfApiUrl: string = 'https://api.murf.ai/v1/speech/generate';
  private murfApiKey: string = process.env.NEXT_PUBLIC_MURF_API_KEY!;
  private currentAudio: HTMLAudioElement | null = null;
  private isPlaying: boolean = false;
  private queue: QueueItem[] = [];
  private isProcessing: boolean = false;
  private currentQueueId: string | null = null;
  private api = axios.create({adapter: setupCache({
    maxAge: 3 * 60 * 60 * 1000,

  }).adapter
})

  // Default voices for different personas (fallback)
  private defaultVoices = {
    teacher: 'EXAVITQu4vr4xnSDxMaL', // Bella - Professional female voice
    student: 'pNInz6obpgDQGcFmaJgB', // Adam - Young male voice
    narrator: '21m00Tcm4TlvDq8ikWAM', // Rachel - Clear female voice
  };

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || '';
    if (!this.apiKey) {
      console.warn('ElevenLabs API key not found. TTS functionality will be limited.');
    }
  }



  async fetchVoiceAudioBuffer(text: string, voiceId: string){
    console.log(`Fetching audio buffer for: \n${text} \nVoice ID: ${voiceId}`)
    const apiResponse = await this.api({
      url: this.murfApiUrl,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.murfApiKey}`
      },
      data: {
        text: text,
        voiceId: voiceId
      }
    })
    
    return apiResponse.data;
  }

  /**
   * Convert text to speech using ElevenLabs API
   */
  async textToSpeech(
    text: string, 
    options: TTSOptions = {}
  ): Promise<ArrayBuffer> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key is required');
    }

    if (!text.trim()) {
      throw new Error('Text cannot be empty');
    }

    const {
      voice = this.defaultVoices.narrator,
      model = 'eleven_monolingual_v1',
      stability = 0.5,
      similarityBoost = 0.75,
      style = 0,
      useSpeakerBoost = true,
    } = options;

    const voiceSettings: VoiceSettings = {
      stability,
      similarity_boost: similarityBoost,
      style,
      use_speaker_boost: useSpeakerBoost,
    };

    try {
      const response = await fetch(`${this.baseUrl}/text-to-speech/${voice}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify({
          text: this.cleanTextForTTS(text.trim()),
          model_id: model,
          voice_settings: voiceSettings,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`TTS API error: ${response.status} - ${errorText}`);
      }

      return await response.arrayBuffer();
    } catch (error) {
      console.error('Text-to-speech error:', error);
      throw error;
    }
  }

  /**
   * Play audio from ArrayBuffer
   */
  async playAudio(audioBuffer: ArrayBuffer, queueId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Check if this queue item is still valid
        if (this.currentQueueId !== queueId) {
          resolve(); // Silently resolve if queue item was cancelled
          return;
        }

        const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(blob);
        
        // Stop current audio if playing
        this.stopAudio();
        
        this.currentAudio = new Audio(audioUrl);
        this.currentAudio.preload = 'auto';
        
        this.currentAudio.onloadeddata = () => {
          console.log('Audio loaded successfully');
        };
        
        this.currentAudio.onplay = () => {
          this.isPlaying = true;
        };
        
        this.currentAudio.onended = () => {
          this.isPlaying = false;
          this.currentQueueId = null;
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        
        this.currentAudio.onerror = (error) => {
          this.isPlaying = false;
          this.currentQueueId = null;
          URL.revokeObjectURL(audioUrl);
          console.error('Audio playback error:', error);
          reject(new Error('Audio playback failed'));
        };
        
        this.currentAudio.onpause = () => {
          this.isPlaying = false;
        };
        
        // Start playback
        this.currentAudio.play().catch(reject);
        
      } catch (error) {
        console.error('Error creating audio:', error);
        this.currentQueueId = null;
        reject(error);
      }
    });
  }

  /**
   * Speak text with options
   */
  async speak(text: string, options: TTSOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      const queueItem: QueueItem = {
        text,
        options,
        resolve,
        reject,
        id: `tts-${Date.now()}-${Math.random()}`
      };
      
      this.queue.push(queueItem);
      console.log('Audio queued:', this.queue)
      this.processQueue();
    });
  }

  /**
   * Speak with specific voice ID (for discussion messages)
   */
  async speakWithVoiceId(text: string, voiceId: string, options: Partial<TTSOptions> = {}): Promise<void> {
    const voiceOptions: TTSOptions = {
      voice: voiceId,
      stability: 0.6,
      similarityBoost: 0.75,
      style: 0.2,
      useSpeakerBoost: true,
      ...options,
    };
    console.log('called speakWithVoiceId()')
    return this.speak(text, voiceOptions);
  }

  /**
   * Process the TTS queue
   */
  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const queueItem = this.queue.shift()!;
      const { text, options, resolve, reject, id } = queueItem;

      try {
        this.currentQueueId = id;

        // Show loading toast for longer texts
        let loadingToast: string | undefined;
        if (text.length > 100) {
          loadingToast = toast.loading('Generating speech...', {
            duration: 5000,
          });
        }

        const audioBuffer = await this.textToSpeech(text, options);
        
        if (loadingToast) {
          toast.dismiss(loadingToast);
        }

        // Check if this queue item is still valid before playing
        if (this.currentQueueId === id) {
          await this.playAudio(audioBuffer, id);
        }
        
        resolve();
      } catch (error) {
        console.error('TTS processing error:', error);
        
        // Only show error toast if this was the current item
        if (this.currentQueueId === id) {
          toast.error('Speech generation failed');
        }
        
        this.currentQueueId = null;
        reject(error);
      }
    }

    this.isProcessing = false;
  }

  /**
   * Stop current audio playback and clear queue
   */
  stopAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.isPlaying = false;
    }
    this.currentQueueId = null;
  }

  /**
   * Pause current audio playback
   */
  pauseAudio(): void {
    if (this.currentAudio && this.isPlaying) {
      this.currentAudio.pause();
    }
  }

  /**
   * Resume current audio playback
   */
  resumeAudio(): void {
    if (this.currentAudio && !this.isPlaying) {
      this.currentAudio.play().catch(console.error);
    }
  }

  /**
   * Clear the TTS queue
   */
  clearQueue(): void {
    this.queue.forEach(({ reject }) => {
      reject(new Error('Queue cleared'));
    });
    this.queue = [];
    this.currentQueueId = null;
    this.stopAudio();
  }

  /**
   * Get current playback status
   */
  getStatus() {
    return {
      isPlaying: this.isPlaying,
      queueLength: this.queue.length,
      isProcessing: this.isProcessing,
      currentTime: this.currentAudio?.currentTime || 0,
      duration: this.currentAudio?.duration || 0,
    };
  }

  /**
   * Speak text with persona-specific voice
   */

  /**
   * Utility method to clean text for better TTS
   */
  private cleanTextForTTS(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
      .replace(/\*(.*?)\*/g, '$1') // Remove markdown italic
      .replace(/`(.*?)`/g, '$1') // Remove code blocks
      .replace(/#{1,6}\s/g, '') // Remove markdown headers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
      .replace(/\n{2,}/g, '. ') // Replace multiple newlines with periods
      .replace(/\n/g, ' ') // Replace single newlines with spaces
      .replace(/\s{2,}/g, ' ') // Replace multiple spaces with single space
      .replace(/[^\w\s.,!?;:'"()-]/g, '') // Remove special characters that might cause issues
      .trim();
  }

  /**
   * Speak cleaned text
   */
  async speakCleaned(text: string, options: TTSOptions = {}): Promise<void> {
    const cleanedText = this.cleanTextForTTS(text);
    return this.speak(cleanedText, options);
  }

  /**
   * Break long text into chunks and speak them
   */
  async speakLongText(
    text: string, 
    options: TTSOptions = {},
    maxChunkLength: number = 500
  ): Promise<void> {
    const cleanedText = this.cleanTextForTTS(text);
    
    if (cleanedText.length <= maxChunkLength) {
      return this.speak(cleanedText, options);
    }

    // Split text into sentences
    const sentences = cleanedText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (currentChunk.length + trimmedSentence.length + 1 <= maxChunkLength) {
        currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk + '.');
        }
        currentChunk = trimmedSentence;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk + '.');
    }

    // Speak each chunk sequentially
    for (const chunk of chunks) {
      await this.speak(chunk, options);
    }
  }

  /**
   * Check if TTS is available
   */
  isAvailable(): boolean {
    return !!this.apiKey;
  }
}

// Create singleton instance
export const ttsService = new TextToSpeechService();

// Export utility functions
export const speakText = (text: string, options?: TTSOptions) => 
  ttsService.speakCleaned(text, options);


export const speakWithVoiceId = (text: string, voiceId: string, options?: Partial<TTSOptions>) =>
  ttsService.speakWithVoiceId(text, voiceId, options);

export const speakLongContent = (text: string, options?: TTSOptions) => 
  ttsService.speakLongText(text, options);

export const stopSpeaking = () => ttsService.stopAudio();
export const pauseSpeaking = () => ttsService.pauseAudio();
export const resumeSpeaking = () => ttsService.resumeAudio();
export const clearSpeechQueue = () => ttsService.clearQueue();
export const getSpeechStatus = () => ttsService.getStatus();
export const isTTSAvailable = () => ttsService.isAvailable();

export default ttsService;