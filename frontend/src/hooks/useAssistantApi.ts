/**
 * useAssistantApi Hook
 * 
 * This custom hook handles the communication with the backend API
 * for the personal assistant functionality.
 */

'use client';

import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface UseAssistantApiOptions {
  mockMode?: boolean;
  apiUrl?: string;
}

interface UseAssistantApiReturn {
  messages: Message[];
  isLoading: boolean;
  threadId: string | null;
  userId: string;
  latestAssistantResponse: string | null;
  sendMessage: (message: string) => Promise<void>;
  addMessage: (message: Message) => void;
}

export function useAssistantApi({
  mockMode = false,
  apiUrl = 'http://localhost:3001/api/chat'
}: UseAssistantApiOptions = {}): UseAssistantApiReturn {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      text: "Hello! I'm your personal assistant. How can I help you today?",
      sender: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [userId] = useState<string>(`user-${uuidv4()}`);
  const [latestAssistantResponse, setLatestAssistantResponse] = useState<string | null>(null);

  // Add a message to the conversation
  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  // Send a message to the assistant and get a response
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;
    
    // Add user message to conversation
    const userMessage: Message = {
      id: uuidv4(),
      text: message,
      sender: 'user',
      timestamp: new Date(),
    };
    
    addMessage(userMessage);
    setIsLoading(true);
    
    try {
      let assistantResponse: string;
      
      if (mockMode) {
        // Mock API response for development/testing
        await new Promise((resolve) => setTimeout(resolve, 1000));
        assistantResponse = `This is a mock response to: "${message}"`;
      } else {
        // Real API call to backend
        const response = await fetch(apiUrl, {
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
      
      addMessage(assistantMessage);
      
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
      
      addMessage(errorMessage);
      setLatestAssistantResponse(errorMessage.text);
    } finally {
      setIsLoading(false);
    }
  }, [addMessage, apiUrl, mockMode, threadId, userId]);

  return {
    messages,
    isLoading,
    threadId,
    userId,
    latestAssistantResponse,
    sendMessage,
    addMessage
  };
}
