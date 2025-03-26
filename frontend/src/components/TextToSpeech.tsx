/**
 * TextToSpeech Component
 * 
 * This component provides text-to-speech functionality using the Web Speech API.
 * It converts the assistant's text responses to speech.
 */

'use client';

import { useEffect, useRef } from 'react';

interface TextToSpeechProps {
  text: string | null;
  onSpeechEnd?: () => void;
  autoPlay?: boolean;
  voice?: SpeechSynthesisVoice | null;
}

const TextToSpeech = ({
  text,
  onSpeechEnd,
  autoPlay = true,
  voice = null,
}: TextToSpeechProps) => {
  const isSpeakingRef = useRef(false);
  const previousTextRef = useRef<string | null>(null);

  useEffect(() => {
    // Check if speech synthesis is supported
    if (!('speechSynthesis' in window)) {
      console.error('Text-to-speech is not supported in this browser.');
      return;
    }

    // Only speak if the text has changed and is not null
    if (text && text !== previousTextRef.current && autoPlay) {
      speakText(text);
      previousTextRef.current = text;
    }

    return () => {
      // Cancel any ongoing speech when component unmounts
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [text, autoPlay, voice]);

  const speakText = (textToSpeak: string) => {
    // Don't start a new speech if already speaking
    if (isSpeakingRef.current) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    // Set voice if provided
    if (voice) {
      utterance.voice = voice;
    }
    
    // Configure speech parameters
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Set up event handlers
    utterance.onstart = () => {
      isSpeakingRef.current = true;
    };
    
    utterance.onend = () => {
      isSpeakingRef.current = false;
      if (onSpeechEnd) {
        onSpeechEnd();
      }
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      isSpeakingRef.current = false;
    };
    
    // Start speaking
    window.speechSynthesis.speak(utterance);
  };

  // This component doesn't render anything visible
  return null;
};

export default TextToSpeech;
