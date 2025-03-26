/**
 * VoiceAssistant Component
 * 
 * This is the main component that integrates all the other components.
 * It uses custom hooks for API communication and manages the overall UI.
 */

'use client';

import { useState, useEffect } from 'react';
import MicrophoneButton from './MicrophoneButton';
import ConversationDisplay from './ConversationDisplay';
import TextToSpeech from './TextToSpeech';
import AssistantHeader from './AssistantHeader';
import { useAssistantApi } from '@/hooks/useAssistantApi';

// For development/testing, we can use a mock API response
const useMockApi = process.env.NODE_ENV === 'development' && false; // Set to true to use mock API

const VoiceAssistant = () => {
  // State for the silence timeout
  const [silenceTimeout, setSilenceTimeout] = useState<number>(5000);
  
  // State for speech recognition
  const [isListening, setIsListening] = useState(false);
  
  // State for text-to-speech voices
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  
  // Use our custom hook for API communication
  const {
    messages,
    isLoading,
    latestAssistantResponse,
    sendMessage
  } = useAssistantApi({
    mockMode: useMockApi
  });

  // Handle speech recognition result
  const handleTranscript = async (transcript: string) => {
    if (!transcript.trim()) return;
    await sendMessage(transcript);
  };

  // Load available voices for text-to-speech
  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      console.error('Text-to-speech is not supported in this browser.');
      return;
    }

    // Function to get and set the preferred voice
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      
      // Try to find a good voice - prefer a female voice if available
      const preferredVoice = voices.find(
        (voice) => 
          voice.lang.includes('en-US') && 
          voice.name.toLowerCase().includes('female')
      ) || 
      // Fallback to any English voice
      voices.find((voice) => voice.lang.includes('en')) || 
      // Last resort: use the first available voice
      voices[0];
      
      if (preferredVoice) {
        setSelectedVoice(preferredVoice);
      }
    };

    // Load voices immediately if available
    loadVoices();
    
    // Chrome loads voices asynchronously, so we need this event
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  return (
    <div className="flex flex-col h-full max-w-md mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
      {/* Header with silence timeout slider */}
      <AssistantHeader 
        silenceTimeout={silenceTimeout}
        onSilenceTimeoutChange={setSilenceTimeout}
      />
      
      {/* Conversation display */}
      <div className="flex-1 overflow-hidden">
        <ConversationDisplay messages={messages} isLoading={isLoading} />
      </div>
      
      {/* Microphone button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <MicrophoneButton
            onTranscript={handleTranscript}
            isListening={isListening}
            setIsListening={setIsListening}
            silenceTimeout={silenceTimeout}
          />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {isListening ? 'Listening...' : 'Tap to speak'}
          </p>
        </div>
      </div>
      
      {/* Text-to-speech component (invisible) */}
      <TextToSpeech
        text={latestAssistantResponse}
        voice={selectedVoice}
        autoPlay={true}
      />
    </div>
  );
};

export default VoiceAssistant;
