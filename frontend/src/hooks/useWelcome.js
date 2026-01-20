import { useState, useEffect, useCallback } from 'react';
import { getGreeting } from '../services/api';

export function useWelcome() {
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const fetchInitialGreeting = useCallback(async (pushBot, speakClient) => {
    try {
      const reply = await getGreeting();
      if (reply) {
        pushBot(reply);
        speakClient(reply);
      } else {
        pushBot("Hi there! I'm here to help, How can I assist you today?");
      }
    } catch (err) {
      console.error('Greeting fetch error', err);
      pushBot("Hi there! I'm here to help, How can I assist you today?");
    }
  }, []);

  return { showWelcome, fetchInitialGreeting };
}
