/**
 * useSpeechRecognition Hook
 * 
 * This custom hook handles the speech recognition functionality,
 * abstracting away the Web Speech API details.
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

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
  // Additional events that might be available in some browsers
  onspeechstart?: () => void;
  onspeechend?: () => void;
  onnomatch?: () => void;
  onaudiostart?: () => void;
  onaudioend?: () => void;
  onsoundstart?: () => void;
  onsoundend?: () => void;
}

// Declare global types
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

interface UseSpeechRecognitionOptions {
  onTranscript: (transcript: string) => void;
  silenceTimeout?: number;
  language?: string;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  error: string | null;
  isSupported: boolean;
}

export function useSpeechRecognition({
  onTranscript,
  silenceTimeout = 5000,
  language = 'en-US'
}: UseSpeechRecognitionOptions): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Function to create and configure a new recognition instance
  const createRecognitionInstance = useCallback(() => {
    // Check if browser supports SpeechRecognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser.');
      setIsSupported(false);
      return null;
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setError('Speech recognition is not supported in this browser.');
      setIsSupported(false);
      return null;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language;
    
    // Note: maxSilenceTime is not a standard property
    try {
      // Use type assertion to avoid TypeScript errors
      (recognition as any).maxSilenceTime = silenceTimeout;
      console.log(`Set silence timeout: ${silenceTimeout}ms`);
    } catch (e) {
      // If setting the property fails, we'll handle it with our manual timer
      console.log(`Using manual silence timeout: ${silenceTimeout}ms`);
    }
    
    // Set up event handlers
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // Clear any silence timer when we get a result
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      
      const transcript = event.results[0][0].transcript;
      console.log('Speech recognized:', transcript);
      onTranscript(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error', event.error);
      setError(`Error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      setIsListening(false);
    };
    
    // Add speech detection event to reset the silence timer
    try {
      // Use type assertion since this event is not standardized
      (recognition as any).onspeechstart = () => {
        console.log('Speech started');
        // Clear the silence timer when speech is detected
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
      };
    } catch (e) {
      // Ignore if not supported
      console.log('onspeechstart event not supported');
    }
    
    return recognition;
  }, [language, silenceTimeout, onTranscript]);

  // Initialize recognition on component mount
  useEffect(() => {
    // Initial setup
    if (!recognitionRef.current) {
      recognitionRef.current = createRecognitionInstance();
    }
    
    return () => {
      // Clean up
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors when stopping
        }
      }
      
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    };
  }, [createRecognitionInstance]);

  // Update recognition instance when silenceTimeout changes
  useEffect(() => {
    if (recognitionRef.current) {
      try {
        (recognitionRef.current as any).maxSilenceTime = silenceTimeout;
      } catch (e) {
        // Ignore if not supported
      }
    }
  }, [silenceTimeout]);

  // Start listening function
  const startListening = useCallback(() => {
    if (!isSupported) {
      return;
    }
    
    try {
      // Create a new instance each time to avoid state issues
      recognitionRef.current = createRecognitionInstance();
      
      if (!recognitionRef.current) {
        throw new Error('Failed to create speech recognition instance');
      }
      
      // Start listening
      recognitionRef.current.start();
      setIsListening(true);
      
      // Set a manual timeout as a fallback
      silenceTimerRef.current = setTimeout(() => {
        console.log(`Silence timeout (${silenceTimeout}ms) reached`);
        if (isListening && recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (e) {
            // Ignore errors when stopping
          }
        }
      }, silenceTimeout);
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  }, [createRecognitionInstance, isListening, isSupported, silenceTimeout]);

  // Stop listening function
  const stopListening = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    
    try {
      recognitionRef.current?.stop();
    } catch (err) {
      console.error('Error stopping recognition:', err);
    }
    
    setIsListening(false);
  }, []);

  return {
    isListening,
    startListening,
    stopListening,
    error,
    isSupported
  };
}
