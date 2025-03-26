/**
 * VoiceAssistant Component
 * 
 * This is the main component that integrates all the other components and handles
 * the core functionality of the personal assistant. It manages the conversation state,
 * handles API calls to the backend, and coordinates the speech-to-text and text-to-speech
 * functionality.
 */

'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import MicrophoneButton from './MicrophoneButton';
import ConversationDisplay, { Message } from './ConversationDisplay';
import TextToSpeech from './TextToSpeech';

// For development/testing, we can use a mock API response
const useMockApi = process.env.NODE_ENV === 'development' && false; // Set to true to use mock API

const VoiceAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      text: "Hello! I'm your personal assistant. How can I help you today?",
      sender: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [latestAssistantResponse, setLatestAssistantResponse] = useState<string | null>(null);

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

  // Handle speech recognition result
  const handleTranscript = async (transcript: string) => {
    if (!transcript.trim()) return;
    
    // Add user message to conversation
    const userMessage: Message = {
      id: uuidv4(),
      text: transcript,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    
    // Process the user's message
    await processUserMessage(transcript);
  };

  // Store the thread ID for conversation continuity
  const [threadId, setThreadId] = useState<string | null>(null);
  // Generate a unique user ID for this session
  const [userId] = useState<string>(`user-${uuidv4()}`);

  // Process user message and get assistant response
  const processUserMessage = async (message: string) => {
    setIsLoading(true);
    
    try {
      let assistantResponse: string;
      
      if (useMockApi) {
        // Mock API response for development/testing
        await new Promise((resolve) => setTimeout(resolve, 1000));
        assistantResponse = `This is a mock response to: "${message}"`;
      } else {
        // Real API call to backend
        const response = await fetch('http://localhost:3001/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            userId,
            threadId, // Include threadId if we have one
          }),
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        assistantResponse = data.response;
        
        // Store the thread ID for future messages
        if (data.threadId && !threadId) {
          setThreadId(data.threadId);
          console.log(`Thread established with ID: ${data.threadId}`);
        }
      }
      
      // Add assistant response to conversation
      const assistantMessage: Message = {
        id: uuidv4(),
        text: assistantResponse,
        sender: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      
      // Set the latest assistant response for text-to-speech
      setLatestAssistantResponse(assistantResponse);
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Add error message to conversation
      const errorMessage: Message = {
        id: uuidv4(),
        text: 'Sorry, I encountered an error processing your request. Please try again.',
        sender: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      setLatestAssistantResponse(errorMessage.text);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
      <div className="bg-blue-600 dark:bg-blue-800 p-4 text-white">
        <h1 className="text-xl font-bold">Personal Assistant</h1>
        <p className="text-sm opacity-80">Ask me anything</p>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <ConversationDisplay messages={messages} isLoading={isLoading} />
      </div>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <MicrophoneButton
            onTranscript={handleTranscript}
            isListening={isListening}
            setIsListening={setIsListening}
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
