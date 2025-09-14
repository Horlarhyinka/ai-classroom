
import axios from 'axios';
import { setupCache } from 'axios-cache-adapter';
import { useState, useCallback, useRef, RefObject } from 'react';
import { Message, Persona } from './types';
import { DEFAULT_VOICE_ID } from './constants';

export class TextNode {
    constructor(
        public readonly id: string,
        public readonly text: string,
        public readonly persona: Persona,
        public readonly timestamp: Date,
        public audioRef: RefObject<HTMLAudioElement>,
        private next: TextNode | null = null,
        public loading: boolean = false,
        public playing: boolean = false,
        public fetched: boolean = false,
        public data: string | null = null,
        public played: boolean = false,
        private murfApiUrl: string = 'https://api.murf.ai/v1/speech/generate',
        private murfApiKey: string = process.env.NEXT_PUBLIC_MURF_API_KEY!,

    ) { }

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

    async fetchVoiceAudioBuffer() {
        console.log(`Fetching audio buffer for: \n${this.text} \nVoice ID: ${this.persona.voice?.id}`)
        this.loading = true
        try{

        const apiResponse = await fetch(this.murfApiUrl, {
            method: 'POST',
            headers: {
                'api-key': this.murfApiKey,
                'Content-Type': 'Application/json'
            },
            body: JSON.stringify({
                text: this.cleanTextForTTS(this.text),
                voiceId: this.persona.voice?.id ?? DEFAULT_VOICE_ID
            }),
            cache: 'force-cache',
        })
        if(!apiResponse.status.toString().startsWith('2'))throw Error('Error fetching audio buffer')
        const resData = await apiResponse.json()
        this.loading = false
        return resData?.audioFile;
        }catch(err){
            this.loading = false
            throw Error(`Error fetching audio buffer: ${err}`)
        }
    }

    async play() {
        try {
          this.playing = true;
      
          if (!this.fetched || !this.data) {
            await this.fetch();
          }
          console.log('After fetch in play:', this.loading)
          if(this.loading)return false
          
          if (this.audioRef.current && this.data) {

            this.audioRef.current.src = this.data;
      
            // Play audio
            await this.audioRef.current.play();
      
            // Wait for playback to finish
            await new Promise<void>((resolve, reject) => {
              const audio = this.audioRef.current!;
              audio.onended = null;
              audio.onerror = null;
              
      
              const onEnded = () => {
                cleanup();
                resolve();
              };
      
              const onError = (err: Event) => {
                cleanup();
                reject(err);
              };
      
              const cleanup = () => {
                audio.removeEventListener("ended", onEnded);
                audio.removeEventListener("error", onError);
              };
      
              audio.addEventListener("ended", onEnded);
              audio.addEventListener("error", onError);
            });
      
            this.played = true;
            this.playing = false;
            return true;
          }
      
          return false;
        } catch (err) {
          console.log(`Error while playing audio: ${err}`);
          this.playing = false;
          return false;
        }
      }
      

    async fetch() {
        const audioDataRes = await this.fetchVoiceAudioBuffer()
        if (audioDataRes) {
            this.data = audioDataRes
            this.fetched = true
        }
    }

    pause() {
        this.audioRef.current?.pause()
        this.played = true
        this.playing = false
    }

    setNext(next: TextNode) {
        this.next = next
    }

    getNext() {
        return this.next
    }


}


export class TTS {

    constructor(
        private data: Message[] = [],
        private current: TextNode | null = null,
        public readonly queue: TextNode[] = [],
        public readonly audioRef: RefObject<HTMLAudioElement>,
        public autoplayon: boolean = true,

    ) {
        this.data.map((d) => {
            const timestamp = new Date(d.createdAt)
            return this.enqueue({ ...(d ?? {}), data: d.body, persona: d.persona, timestamp, })
        })
    }


    async autoplay() {
        if (!this.autoplayon || !this.queue.length) return false
        this.current = this.queue[0]
        await this.current.play()
        const next = this.current.getNext()
        while (this.autoplayon && next) {
            await next.play()
        }
    }

    async playNode(node: TextNode) {
        await node.play()
    }

    stopPlay() {
        const current = this.current;
        this.audioRef.current?.pause()
        if(current){
            this.current?.pause()
            this.current = null
            return current
        }
        return
    }



    enqueue(d: { _id: string, data: string, persona: Persona, timestamp: Date }): TextNode {
        const textNode = new TextNode(d._id, d.data, d.persona, d.timestamp, this.audioRef)
        this.queue.push(textNode)
        if (this.queue.length > 1) {
            const prevNode = this.queue[this.queue.length - 2]
            prevNode.setNext(textNode)
        }
        return textNode
    }

    dequeue() {
        return this.queue.pop()
    }

    seek(node: TextNode) {
        this.current = node
    }

}
