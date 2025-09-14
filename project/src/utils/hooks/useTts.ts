'use client'

import { useState, useRef, useCallback, useEffect } from "react";
import { Message } from "../types";
import { DEFAULT_VOICE_ID } from "../constants";
import { TTS, TextNode } from "../tts";
import { RefObject } from "react";

type TTXProp = {
    messages: Message[];
    audioRef: RefObject<HTMLAudioElement>;
    autoplay: boolean;
    // nowPlaying: string;
    // setNowplaying: (v: string)=>void;
    onPlaystart: Function;
    onPlaystop: Function;
    onFetchstart: Function;
    onFetchstop: Function;
};
//{ _id: string; data: string; voice: { id: string; }; }': data, voic
export function useTtsChat({ autoplay = true, messages, audioRef, onPlaystop, onPlaystart, onFetchstart, onFetchstop }: TTXProp){
    const [currentNode, setCurrentNode] = useState<TextNode | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const ttsRef = useRef<TTS>(new TTS(messages.map((m) => ({ ...m })), null, [], audioRef));
    const [nodes, setNodes] = useState<TextNode[]>([])
    useEffect(()=>{
        setNodes(ttsRef.current!.queue)
    },[ttsRef.current!.queue])
    // enqueue a new message
    const addNode = useCallback(
        (message: Message) => {
            const timestamp = new Date(message.createdAt)
            const node = ttsRef.current.enqueue({...message, data: message.body, timestamp });
            return node;
        },
        []
    );

    useEffect(()=>{
        ttsRef.current = new TTS(messages.map((m) => ({...m })), null, [], audioRef, autoplay)
    }, [messages])


    // play a specific node
    const playNode = useCallback(async (node: TextNode) => {
        setCurrentNode(node);
        setIsPlaying(true);

        if (!node.fetched) {
            node.loading = true
            onFetchstart(node)
            await node.fetch();
            node.loading = false
            onFetchstop(node)
        }

        if (node.data && audioRef.current) {
            audioRef.current.src = node.data;
            node.playing = true
            onPlaystart(node)
            await audioRef.current.play();
            node.played = true;
        }
        onPlaystop(node)
        
    }, []);

    // start autoplay sequence
    const startAutoplay = useCallback(async () => {
        const nodes = ttsRef.current.queue
        if(!nodes.length)return
        let node: TextNode | null = nodes[0];
        while (node) {
            console.log({node, autoplay})
            console.log('Playing node (auto-mode):', node)
            await playNode(node);
            // wait for audio end
            await new Promise<void>((resolve) => {
                if (!audioRef.current) return resolve();
                audioRef.current.onended = () => resolve();
            });
            const n = node.getNext()
            if (n) {
                node = n
            }else{
                node = null
            }
        }
        setIsPlaying(false);
    }, [playNode]);

    // stop playback
    const stopPlay = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setIsPlaying(false);
        const wasPlayingNode = ttsRef.current.stopPlay();
        if(wasPlayingNode){ //call onStop on the previously playing node...
            onPlaystop(wasPlayingNode)
        }
    }, []);

    // Handle autoplay in useEffect
    useEffect(() => {
        if (autoplay) {
            ttsRef.current.autoplay();
        }
    }, [autoplay]);

    return {
        nodes,
        currentNode,
        isPlaying,
        addNode,
        playNode,
        startAutoplay,
        stopPlay,
        audioRef,
    };
};