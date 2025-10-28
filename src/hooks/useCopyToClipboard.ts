import { useState, useCallback } from 'react';

interface UseCopyToClipboardReturn {
  isCopied: boolean;
  copy: (text: string) => Promise<boolean>;
  reset: () => void;
}

/**
 * Custom hook for copying text to clipboard with state management
 */
export const useCopyToClipboard = (resetDelay = 2000): UseCopyToClipboardReturn => {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const copy = useCallback(async (text: string): Promise<boolean> => {
    try {
      // Modern clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        
        // Auto reset after delay
        setTimeout(() => setIsCopied(false), resetDelay);
        return true;
      }
      
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), resetDelay);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to copy text to clipboard:', error);
      return false;
    }
  }, [resetDelay]);

  const reset = useCallback(() => {
    setIsCopied(false);
  }, []);

  return { isCopied, copy, reset };
};