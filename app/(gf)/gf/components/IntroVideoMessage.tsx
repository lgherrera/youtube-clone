// app/(gf)/gf/components/IntroVideoMessage.tsx

'use client';

import React, { useRef, useState } from 'react';
import styles from './IntroVideoMessage.module.css';

interface IntroVideoMessageProps {
  videoUrl: string;
  posterUrl?: string;
  onVideoEnd?: () => void;
}

export default function IntroVideoMessage({ 
  videoUrl,
  posterUrl,
  onVideoEnd 
}: IntroVideoMessageProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPoster, setShowPoster] = useState(true);

  const handlePlayClick = async () => {
    if (videoRef.current) {
      try {
        // Start playing - the video will load and play
        await videoRef.current.play();
        // Only hide poster AFTER play succeeds (video is actually playing)
        setShowPoster(false);
        setIsPlaying(true);
      } catch (error) {
        console.log('Play failed:', error);
      }
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    setShowPoster(false);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setShowPoster(true);
    onVideoEnd?.();
  };

  return (
    <div className={styles.videoWrapper}>
      {/* Video element - always present but hidden behind poster until playing */}
      <video
        ref={videoRef}
        className={styles.video}
        src={videoUrl}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        controls
        playsInline
        preload="auto"
        style={{ 
          opacity: showPoster ? 0 : 1,
          pointerEvents: showPoster ? 'none' : 'auto'
        }}
      >
        Your browser does not support the video tag.
      </video>
      
      {/* Poster overlay - shown until video is actually playing */}
      {showPoster && (
        <div className={styles.posterOverlay}>
          {posterUrl && (
            <img 
              src={posterUrl} 
              alt="Video thumbnail" 
              className={styles.posterImage}
            />
          )}
          <button 
            className={styles.playButton}
            onClick={handlePlayClick}
            aria-label="Play video"
          >
            <svg 
              width="32" 
              height="32" 
              viewBox="0 0 24 24" 
              fill="white"
            >
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}