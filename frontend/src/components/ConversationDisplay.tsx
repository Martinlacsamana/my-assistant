/**
 * ConversationDisplay Component
 * 
 * This component displays the conversation history between the user and the assistant.
 * It shows messages in a chat-like interface with different styling for user and assistant messages.
 */

'use client';

import { useRef, useEffect } from 'react';
import { Message } from '@/hooks/useAssistantApi';

interface ConversationDisplayProps {
  messages: Message[];
  isLoading: boolean;
}

const ConversationDisplay = ({ messages, isLoading }: ConversationDisplayProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.sender === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={`max-w-[80%] p-3 rounded-lg ${
              message.sender === 'user'
                ? 'bg-blue-500 text-white rounded-tr-none'
                : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-tl-none'
            }`}
          >
            <p className="text-sm">{message.text}</p>
            <p className="text-xs opacity-70 mt-1">
              {message.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      ))}
      
      {isLoading && (
        <div className="flex justify-start">
          <div className="max-w-[80%] p-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-tl-none">
            <div className="flex space-x-2">
              <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ConversationDisplay;
