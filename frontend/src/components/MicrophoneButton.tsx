/**
 * MicrophoneButton Component
 * 
 * This component renders a microphone button that handles voice recording.
 * It uses the useSpeechRecognition hook for speech recognition functionality
 * and provides visual feedback during recording.
 */

'use client';

import { useEffect } from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

interface MicrophoneButtonProps {
  onTranscript: (transcript: string) => void;
  onInterimTranscript?: (transcript: string) => void;
  isListening: boolean;
  setIsListening: (isListening: boolean) => void;
}

const MicrophoneButton = ({ 
  onTranscript, 
  onInterimTranscript,
  isListening, 
  setIsListening
}: MicrophoneButtonProps) => {
  // Use our custom hook for speech recognition
  const {
    isListening: hookIsListening,
    startListening,
    stopListening,
    error,
    isSupported,
    interimTranscript
  } = useSpeechRecognition({
    onTranscript,
    onInterimTranscript
  });

  // Sync the parent component's isListening state with our hook's state
  useEffect(() => {
    setIsListening(hookIsListening);
  }, [hookIsListening, setIsListening]);

  const toggleListening = () => {
    if (error) {
      alert(error);
      return;
    }

    if (!isSupported) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <button
      onClick={toggleListening}
      className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
        isListening 
          ? 'bg-red-500 scale-110 animate-pulse' 
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
