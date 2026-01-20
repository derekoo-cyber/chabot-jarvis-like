import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';

export default function Message({ message, isUser }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`flex gap-3 mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary/10 to-primary flex items-center justify-center border border-primary/20">
          <Bot className="w-5 h-5 text-primary" />
        </div>
      )}
      
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[75%] md:max-w-[60%]`}>
        <div
          className={`rounded-3xl px-6 py-4 ${
            isUser
              ? 'bg-gradient-to-br from-primary to-primary text-primary-foreground'
              : 'bg-card/60 backdrop-blur-sm text-card-foreground border border-border'
          }`}
        >
          <p className="text-[15px] leading-relaxed">{message.text}</p>
        </div>
        <span className="text-xs text-muted-foreground mt-2 px-2">
          {new Date(message.timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-secondary flex items-center justify-center border border-secondary">
          <User className="w-5 h-5 text-secondary-foreground" />
        </div>
      )}
    </motion.div>
  );
}
