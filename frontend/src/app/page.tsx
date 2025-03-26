/**
 * Home Page
 * 
 * This is the main page of the application that renders the VoiceAssistant component.
 * It provides a full-height container for the assistant interface.
 */

'use client';

import { Suspense, lazy } from 'react';

// Lazy load the VoiceAssistant component
const VoiceAssistant = lazy(() => import('@/components/VoiceAssistant'));

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full h-[90vh] max-w-md">
        <Suspense fallback={
          <div className="flex flex-col h-full max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden items-center justify-center">
            <div className="text-xl font-bold mb-4">Loading Assistant...</div>
            <div className="animate-pulse flex space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            </div>
          </div>
        }>
          <VoiceAssistant />
        </Suspense>
      </div>
    </div>
  );
}
