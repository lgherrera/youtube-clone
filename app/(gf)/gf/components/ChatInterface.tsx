// app/(gf)/gf/components/ChatInterface.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import IntroVideoMessage from './IntroVideoMessage';
import styles from './ChatInterface.module.css';

interface Girlfriend {
  id: string;
  slug: string;
  name: string;
  age?: number;
  description?: string;
  image_url?: string;
  avatar?: string;
  hello_url?: string;
  hello_poster_url?: string;
  default_scenario?: string;
  opening_question?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  girlfriend: Girlfriend;
}

export default function ChatInterface({ girlfriend }: ChatInterfaceProps) {
  const [showIntroVideo, setShowIntroVideo] = useState(!!girlfriend.hello_url);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const generateMessageId = () => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Build opening messages from scenario + question (as separate messages)
  const buildOpeningMessages = (): Message[] => {
    const messages: Message[] = [];
    
    if (girlfriend.default_scenario) {
      messages.push({
        id: 'scenario_' + generateMessageId(),
        role: 'assistant',
        content: girlfriend.default_scenario,
        timestamp: new Date()
      });
    }
    
    if (girlfriend.opening_question) {
      messages.push({
        id: generateMessageId(),
        role: 'assistant',
        content: girlfriend.opening_question,
        timestamp: new Date()
      });
    }
    
    return messages;
  };

  // Show opening message on mount if no video
  useEffect(() => {
    if (!girlfriend.hello_url) {
      const openingMessages = buildOpeningMessages();
      if (openingMessages.length > 0) {
        setMessages(openingMessages);
      }
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input after video ends or on mount if no video
  useEffect(() => {
    if (!showIntroVideo) {
      inputRef.current?.focus();
    }
  }, [showIntroVideo]);

  const handleVideoEnd = () => {
    setShowIntroVideo(false);
    const openingMessages = buildOpeningMessages();
    if (openingMessages.length > 0) {
      setMessages(openingMessages);
    }
  };

  const handleVideoError = () => {
    console.error('Video failed to load:', girlfriend.hello_url);
    setShowIntroVideo(false);
    const openingMessages = buildOpeningMessages();
    if (openingMessages.length > 0) {
      setMessages(openingMessages);
    }
  };

  const handleSendMessage = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isLoading) return;

    setError(null);

    // Add user message immediately
    const userMessage: Message = {
      id: generateMessageId(),
      role: 'user',
      content: trimmedInput,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Prepare conversation history for API
      const conversationHistory = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          girlfriendId: girlfriend.id,
          messages: conversationHistory,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Error ${response.status}: Failed to get response`);
      }

      if (!data.message) {
        throw new Error('No message received from AI');
      }

      // Add assistant response
      const assistantMessage: Message = {
        id: generateMessageId(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format message content with actions in *asterisks*
  const formatMessageContent = (content: string) => {
    const parts = content.split(/(\*[^*]+\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <span key={index} className={styles.actionText}>
            {part.slice(1, -1)}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <Link href="/gf" className={styles.iconButton}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </Link>

        <div className={styles.headerCenter}>
          {girlfriend.avatar && (
            <img src={girlfriend.avatar} alt={girlfriend.name} className={styles.avatar} />
          )}
          <h1 className={styles.headerTitle}>{girlfriend.name}</h1>
        </div>

        <button className={styles.iconButton}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </header>

      {/* Chat Area */}
      <div className={styles.chatArea}>
        {showIntroVideo && girlfriend.hello_url && (
          <IntroVideoMessage
            videoUrl={girlfriend.hello_url}
            posterUrl={girlfriend.hello_poster_url || girlfriend.image_url}
            onVideoEnd={handleVideoEnd}
            onVideoError={handleVideoError}
          />
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={
              message.role === 'user' 
                ? styles.messageBubbleRight 
                : message.id.startsWith('scenario_')
                  ? styles.messageBubbleScenario
                  : styles.messageBubbleLeft
            }
          >
            {formatMessageContent(message.content)}
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className={styles.messageBubbleLeft}>
            <div className={styles.typingIndicator}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className={styles.errorMessage}>
            {error}
            <button 
              onClick={() => setError(null)}
              className={styles.dismissError}
            >
              ×
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Footer */}
      <div className={styles.inputContainer}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Message"
          className={styles.inputField}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading || showIntroVideo}
        />
        <button 
          className={styles.sendButton}
          onClick={handleSendMessage}
          disabled={isLoading || !inputValue.trim() || showIntroVideo}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}