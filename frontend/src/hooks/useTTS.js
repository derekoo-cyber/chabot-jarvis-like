import { useCallback } from 'react';
import { speakWithBrowser } from '../services/tts';

export function useTTS() {
  const speakClient = useCallback((text) => {
    speakWithBrowser(text);
  }, []);

  return { speakClient };
}
