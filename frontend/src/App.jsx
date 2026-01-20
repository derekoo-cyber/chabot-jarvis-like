import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Welcome from './components/Welcome'
import Message from './components/Message'
import ChatInput from './components/Chatinput';
import TypingIndicator from './components/TypingIndicator';
import {SliderToggle} from './components/ui/SliderToggle';
import {Background} from './components/ui/Background';
import { useChat } from './hooks/useChat';
import { useTheme } from './hooks/useTheme';
import { useTTS } from './hooks/useTTS';
import { useWelcome } from './hooks/useWelcome';

export default function App() {
  const { showWelcome, fetchInitialGreeting } = useWelcome();
  const { messages, isTyping, messagesEndRef, handleSendMessage, pushBot } = useChat();
  const { theme, setTheme } = useTheme();
  const { speakClient } = useTTS();
  const greetingFetchedRef = useRef(false);

  useEffect(() => {
    if (!showWelcome && !greetingFetchedRef.current) {
      greetingFetchedRef.current = true;
      setTimeout(() => {
        fetchInitialGreeting(pushBot, speakClient);
      }, 500);
    }
  }, [showWelcome]); // Only depend on showWelcome since functions are memoized

  return (
    <div className="fixed inset-0 overflow-hidden bg-app">

      {/* Animated Background for Dark Mode */}
      {theme === 'dark' && (
        <div className='absolute inset-0 z-0'>
          <Background/>
        </div>
      )}
      
      <AnimatePresence mode="wait">
        {showWelcome ? (
          <Welcome key="welcome" />
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex flex-col h-full"
          >

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="flex-shrink-0 p-6 border-b border-border bg-card/60 backdrop-blur-sm"
            >
              <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-light tracking-tight text-card-foreground">
                  Polar
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Always here to help
                </p>
              </div>
              {/* Right Side: Theme Toggle */}
              <SliderToggle selected={theme} setSelected={setTheme} />
          
            </motion.div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-8">
              <div className="max-w-4xl mx-auto">
                {messages.map((message) => (
                  <Message
                    key={message.id}
                    message={message}
                    isUser={message.isUser}
                  />
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <ChatInput onSend={handleSendMessage} disabled={isTyping} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
