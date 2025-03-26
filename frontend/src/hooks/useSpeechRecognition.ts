/**
 * useSpeechRecognition Hook - Basic Version
 * 
 * This is a very basic implementation of speech recognition
 * using the Web Speech API.
 */

'use client';

import { useState, useEffect, useRef } from 'react';

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  error: string | null;
  isSupported: boolean;
  interimTranscript: string;
}

export function useSpeechRecognition({
  onTranscript,
  onInterimTranscript
}: {
  onTranscript: (text: string) => void;
  onInterimTranscript?: (text: string) => void;
}): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [interimTranscript, setInterimTranscript] = useState('');
  
  // Reference to the recognition instance
  const recognitionRef = useRef<any>(null);
  
  // Check if speech recognition is supported
  useEffect(() => {
    if (!(window as any).webkitSpeechRecognition) {
      setIsSupported(false);
      setError('Speech recognition is not supported in this browser');
    }
  }, []);
  
  // Start listening function
  const startListening = () => {
    if (!isSupported) return;
    
    try {
      // Create a new recognition instance
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      // Basic configuration
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.interimResults = true;
      
      // Handle results
      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        
        console.log('Speech result:', transcript, event.results[0].isFinal);
        
        if (event.results[0].isFinal) {
          // Final result
          onTranscript(transcript);
          setInterimTranscript('');
        } else {
          // Interim result
          setInterimTranscript(transcript);
          if (onInterimTranscript) {
            onInterimTranscript(transcript);
          }
        }
      };
      
      // Handle errors
      recognitionRef.current.onerror = (event: any) => {
        console.log('Speech recognition error:', event);
        if (event.error !== 'no-speech') {
          setError(`Speech recognition error: ${event.error}`);
        }
      };
      
      // Handle end
      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
      };
      
      // Start recognition
      recognitionRef.current.start();
      setIsListening(true);
      setError(null);
      console.log('Speech recognition started');
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setError('Failed to start speech recognition');
      setIsListening(false);
    }
  };
  
  // Stop listening function
  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error('Error stopping recognition:', err);
      }
    }
    setIsListening(false);
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors
        }
      }
    };
  }, []);
  
  return {
    isListening,
    startListening,
    stopListening,
    error,
    isSupported,
    interimTranscript
  };
}
