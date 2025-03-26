/**
 * Home Page
 * 
 * This is the main page of the application that renders the VoiceAssistant component.
 * It provides a full-height container for the assistant interface.
 */

import dynamic from 'next/dynamic';

// Use dynamic import with SSR disabled for components that use browser APIs
const VoiceAssistant = dynamic(
  () => import('@/components/VoiceAssistant'),
  { ssr: false }
);

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full h-[90vh] max-w-md">
        <VoiceAssistant />
      </div>
    </div>
  );
}
