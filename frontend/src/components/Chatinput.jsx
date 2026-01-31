import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import io from 'socket.io-client';

// Connect to your backend
const socket = io('http://localhost:5000');

export default function ChatInput({ onSend, disabled }) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);

  useEffect(() => {
    // Listen for AI replies sent via Socket.io
    socket.on('ai-reply', (data) => {
      console.log('Received AI reply:', data);
      
      // IMPORTANT: First add the user's transcribed message
      onSend(data.user_text, 'user');
      
      // Then add the AI's reply
      onSend(data.reply, 'assistant'); 
      
      // Automatically play the voice response
      const audio = new Audio(`http://localhost:5000/stream-voice?text=${encodeURIComponent(data.reply)}`);
      audio.play().catch(err => console.error('Audio playback error:', err));
    });

    socket.on('ai-error', (data) => {
      console.error("AI Error:", data.error);
      alert(`Voice input error: ${data.error}`);
      setIsRecording(false);
    });

    return () => {
      socket.off('ai-reply');
      socket.off('ai-error');
    };
  }, [onSend]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message, 'user');
      setMessage('');
    }
  };

  const handleVoiceInput = async () => {
    if (isRecording) {
      // STOP RECORDING
      console.log('Stopping recording...');
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      
      setIsRecording(false);
      
    } else {
      // START RECORDING
      try {
        console.log('Starting recording...');
        
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
        
        // Try to use the best supported format
        let mimeType = 'audio/webm';
        const preferredTypes = [
          'audio/webm;codecs=opus',
          'audio/webm',
          'audio/ogg;codecs=opus',
          'audio/mp4'
        ];
        
        for (const type of preferredTypes) {
          if (MediaRecorder.isTypeSupported(type)) {
            mimeType = type;
            console.log('Using MIME type:', mimeType);
            break;
          }
        }
        
        const recorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = recorder;

        const audioChunks = [];

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            console.log(`Chunk received: ${event.data.size} bytes`);
            audioChunks.push(event.data);
          }
        };

        recorder.onstop = async () => {
          console.log('Recording stopped, processing audio...');
          
          // Combine all chunks into ONE complete blob
          const completeAudioBlob = new Blob(audioChunks, { type: mimeType });
          
          console.log(`Complete audio size: ${completeAudioBlob.size} bytes`);
          
          // Validate audio size
          if (completeAudioBlob.size < 1000) {
            console.error('Audio too short:', completeAudioBlob.size, 'bytes');
            alert('Recording too short. Please speak for at least 1 second.');
            stream.getTracks().forEach(track => track.stop());
            return;
          }
          
          // Convert to ArrayBuffer
          const arrayBuffer = await completeAudioBlob.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          
          console.log(`Sending ${bytes.length} bytes to server...`);
          
          // Send complete audio file
          socket.emit('stream-audio', bytes);
          
          // Stop tracks to release microphone
          stream.getTracks().forEach(track => {
            track.stop();
            console.log('Stopped track:', track.kind);
          });
        };

        recorder.onerror = (event) => {
          console.error('MediaRecorder error:', event.error);
          alert('Recording error: ' + event.error.message);
          setIsRecording(false);
          stream.getTracks().forEach(track => track.stop());
        };

        // Start recording (don't specify interval - record continuously)
        recorder.start();
        setIsRecording(true);
        console.log('Recording started');
        
      } catch (err) {
        console.error("Microphone access denied:", err);
        alert('Microphone access denied. Please allow microphone access and try again.');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="sticky bottom-0 p-6 bg-gradient-to-t from-background via-background to-transparent"
    >
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="relative flex items-center gap-3 bg-card/80 backdrop-blur-sm rounded-full border border-border shadow-lg shadow-primary/5 p-2 transition-all duration-300 focus-within:shadow-xl focus-within:shadow-primary/10 focus-within:border-primary">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={isRecording ? "Listening..." : "Type your message..."}
            disabled={disabled || isRecording}
            className="flex-1 px-6 py-3 bg-transparent outline-none text-card-foreground placeholder:text-muted-foreground text-[15px]"
          />
          
          <Button
            type="button"
            onClick={handleVoiceInput}
            disabled={disabled}
            size="icon"
            variant="ghost"
            className={`rounded-full w-11 h-11 flex-shrink-0 transition-all duration-300 ${
              isRecording
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : 'hover:bg-accent text-primary'
            }`}
          >
            <Mic className={`w-5 h-5 ${isRecording ? 'animate-pulse' : ''}`} />
          </Button>
          
          <Button
            type="submit"
            disabled={!message.trim() || disabled || isRecording}
            size="icon"
            className="rounded-full w-11 h-11 flex-shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30 disabled:opacity-50 disabled:shadow-none transition-all duration-300"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </form>
    </motion.div>
  );
}