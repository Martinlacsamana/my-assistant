/**
 * AssistantHeader Component
 * 
 * This component displays the header of the personal assistant,
 * including the title and silence timeout slider.
 */

'use client';

import { ChangeEvent } from 'react';

interface AssistantHeaderProps {
  silenceTimeout: number;
  onSilenceTimeoutChange: (timeout: number) => void;
}

const AssistantHeader = ({
  silenceTimeout,
  onSilenceTimeoutChange
}: AssistantHeaderProps) => {
  const handleSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSilenceTimeoutChange(Number(e.target.value));
  };

  return (
    <div className="bg-blue-600 dark:bg-blue-800 p-4 text-white">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Personal Assistant</h1>
          <p className="text-sm opacity-80">Ask me anything</p>
        </div>
        <div className="flex flex-col items-end">
          <label htmlFor="silence-timeout" className="text-xs mb-1">
            Silence timeout: {silenceTimeout/1000}s
          </label>
          <input
            id="silence-timeout"
            type="range"
            min="2000"
            max="10000"
            step="1000"
            value={silenceTimeout}
            onChange={handleSliderChange}
            className="w-24 h-2 bg-blue-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default AssistantHeader;
