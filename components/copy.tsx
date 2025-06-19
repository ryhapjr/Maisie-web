'use client';

import { useState } from 'react';
import { ClipboardCopy, Check } from 'lucide-react';

interface CopyProps {
  textToCopy: string;
  tooltipMessage?: string;
}

export const Copy = ({
  textToCopy,
  tooltipMessage = 'Copy to clipboard',
}: CopyProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className='relative group'>
      <button
        onClick={handleCopy}
        className='p-1 hover:bg-gray-100 rounded-md transition-colors'
        aria-label={tooltipMessage}
      >
        {copied ? (
          <Check className='w-5 h-5 text-green-500' />
        ) : (
          <ClipboardCopy className='w-5 h-5 text-gray-500' />
        )}
      </button>

      <div className='absolute invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap'>
        {tooltipMessage}
      </div>
    </div>
  );
};
