// app/(gf)/gf/components/IntroVideoMessage.tsx

'use client';

import React, { useRef, useState } from 'react';
import styles from './IntroVideoMessage.module.css';

interface IntroVideoMessageProps {
  videoUrl: string;
  onVideoEnd?: () => void;
}

export default function IntroVideoMessage({ 
  videoUrl, 
  onVideoEnd 
}: IntroVideoMessageProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showPlayButton, setShowPlayButton] = useState(true);

  const handlePlayClick = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setShowPlayButton(false);
    }
  };

  const handlePlay = () => {
    setShowPlayButton(false);
  };

  const handlePause = () => {
    setShowPlayButton(true);
  };

  return (
    <div className={styles.videoWrapper}>
      <video
        ref={videoRef}
        className={styles.video}
        src={videoUrl}
        onEnded={onVideoEnd}
        onPlay={handlePlay}
        onPause={handlePause}
        controls
        playsInline
        preload="metadata"
      >
        Your browser does not support the video tag.
      </video>
      
      {showPlayButton && (
        <button 
          className={styles.playButton}
          onClick={handlePlayClick}
          aria-label="Play video"
        >
          <svg 
            width="64" 
            height="64" 
            viewBox="0 0 24 24" 
            fill="white"
          >
            <path d="M8 5v14l11-7z"/>
          </svg>
        </button>
      )}
    </div>
  );
}