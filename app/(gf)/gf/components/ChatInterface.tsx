// app/(gf)/gf/components/ChatInterface.tsx

'use client';

import React, { useState } from 'react';
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
  hello_url?: string;
}

interface Message {
  id: number;
  type: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  girlfriend: Girlfriend;
}

export default function ChatInterface({ girlfriend }: ChatInterfaceProps) {
  const [showIntroVideo, setShowIntroVideo] = useState(
    !!girlfriend.hello_url
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');

  const handleVideoEnd = () => {
    setShowIntroVideo(false);
    // Add initial greeting after video
    setMessages([{
      id: 1,
      type: 'ai',
      text: `Hi! I'm ${girlfriend.name}. What's on your mind?`,
      timestamp: new Date()
    }]);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages([...messages, newMessage]);
    setInputValue('');

    // TODO: Add AI response logic here
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
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

        <h1 className={styles.headerTitle}>{girlfriend.name}</h1>

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
        {showIntroVideo && (
          <IntroVideoMessage
            videoUrl={girlfriend.hello_url!}
            onVideoEnd={handleVideoEnd}
          />
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={
              message.type === 'ai' 
                ? styles.messageBubbleLeft 
                : styles.messageBubbleRight
            }
          >
            {message.text}
          </div>
        ))}
      </div>

      {/* Input Footer */}
      <div className={styles.inputContainer}>
        <input
          type="text"
          placeholder="Message"
          className={styles.inputField}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button 
          className={styles.sendButton}
          onClick={handleSendMessage}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}