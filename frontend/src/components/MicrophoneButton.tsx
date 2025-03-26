/**
 * MicrophoneButton Component
 * 
 * This component renders a microphone button that handles voice recording.
 * It uses the Web Speech API for speech recognition and provides visual feedback
 * during recording.
 */

'use client';

import { useState, useEffect, useRef } from 'react';

// Define types for the Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

// Declare global types
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

interface MicrophoneButtonProps {
  onTranscript: (transcript: string) => void;
  isListening: boolean;
  setIsListening: (isListening: boolean) => void;
  silenceTimeout?: number; // Time in milliseconds before stopping after silence
}

const MicrophoneButton = ({ 
  onTranscript, 
  isListening, 
  setIsListening,
  silenceTimeout = 2000 // Default 2 seconds
}: MicrophoneButtonProps) => {
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports SpeechRecognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    // Initialize speech recognition
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }
    
    // Create and configure the recognition instance
    const initRecognition = () => {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      // Note: maxSilenceTime is not a standard property, but we're adding it
      // as a custom property for documentation purposes
      try {
        // Use type assertion to avoid TypeScript errors
        (recognition as any).maxSilenceTime = silenceTimeout;
        console.log(`Set silence timeout: ${silenceTimeout}ms`);
      } catch (e) {
        // If setting the property fails, we'll handle it with our manual timer
        console.log(`Using manual silence timeout: ${silenceTimeout}ms`);
      }
      
      return recognition;
    };
    
    recognitionRef.current = initRecognition();

    // Set up event handlers
    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
      setIsListening(false);
    };

    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error', event.error);
      setError(`Error: ${event.error}`);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    return () => {
      // Clean up
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript, setIsListening, silenceTimeout]);

  // Timer reference for manual silence detection
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const toggleListening = () => {
    if (error) {
      alert(error);
      return;
    }

    if (isListening) {
      // Stop listening
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        // Start listening
        recognitionRef.current?.start();
        setIsListening(true);
        
        // Set a manual timeout as a fallback
        // The Web Speech API doesn't have a standard way to set silence timeout
        silenceTimerRef.current = setTimeout(() => {
          console.log(`Silence timeout (${silenceTimeout}ms) reached`);
          if (isListening && recognitionRef.current) {
            recognitionRef.current.stop();
          }
        }, silenceTimeout);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  return (
    <button
      onClick={toggleListening}
      className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
        isListening 
          ? 'bg-red-500 scale-110' 
          : 'bg-blue-500 hover:bg-blue-600'
      }`}
      aria-label={isListening ? 'Stop listening' : 'Start listening'}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="white" 
        className="w-8 h-8"
      >
        <path d="M12 16c2.206 0 4-1.794 4-4V6c0-2.217-1.785-4.021-3.979-4.021a.933.933 0 0 0-.209.025A4.006 4.006 0 0 0 8 6v6c0 2.206 1.794 4 4 4z" />
        <path d="M11 19.931V22h2v-2.069c3.939-.495 7-3.858 7-7.931h-2c0 3.309-2.691 6-6 6s-6-2.691-6-6H4c0 4.072 3.061 7.436 7 7.931z" />
      </svg>
    </button>
  );
};

export default MicrophoneButton;
