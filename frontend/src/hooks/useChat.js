import { useState, useEffect, useRef, useCallback } from 'react';
import { sendMessage, getVoiceStream } from '../services/api';

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const pushUser = useCallback((text) => {
    const m = { id: Date.now(), text, isUser: true, timestamp: new Date() };
    setMessages((prev) => [...prev, m]);
    return m;
  }, []);

  const pushBot = useCallback((text) => {
    const m = { id: Date.now() + Math.floor(Math.random() * 100), text, isUser: false, timestamp: new Date() };
    setMessages((prev) => [...prev, m]);
    return m;
  }, []);

  const handleSendMessage = async (text) => {
    if (!text || !text.trim()) return;

    // Push user message immediately
    pushUser(text);

    // Set typing while waiting for backend
    setIsTyping(true);
    try {
      const reply = await sendMessage(text);
      pushBot(reply);

      // Elevenlabs response through the voice
      getVoiceStream(reply);
    } catch (error) {
      console.error('Send message error: ', error);
      pushBot("Sorry — something went wrong while contacting the assistant.");
    } finally {
      setIsTyping(false);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return {
    messages,
    isTyping,
    messagesEndRef,
    pushUser,
    pushBot,
    handleSendMessage,
  };
}
