"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import styles from './Slider.module.css';

interface SliderProps {
  videos: {
    id: string;
    thumbnail_url: string;
    slider_url?: string;
    title: string;
  }[];
}

export default function Slider({ videos }: SliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToVideo = (index: number) => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.offsetWidth; 
    scrollRef.current.scrollTo({
      left: index * cardWidth,
      behavior: 'smooth'
    });
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const cardWidth = scrollRef.current.offsetWidth;
    const newIndex = Math.round(scrollLeft / cardWidth);
    if (newIndex !== activeIndex) setActiveIndex(newIndex);
  };

  useEffect(() => {
    if (!scrollRef.current || videos.length <= 1) return;
    const interval = setInterval(() => {
      const container = scrollRef.current;
      if (!container) return;
      const cardWidth = container.offsetWidth;
      const currentScroll = container.scrollLeft;
      const maxScroll = container.scrollWidth - container.clientWidth;

      if (currentScroll >= maxScroll - 10) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [videos, activeIndex]);

  if (!videos || videos.length === 0) return null;

  return (
    <div className={styles.sliderWrapper}>
      {/* Slider Scroll Container */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className={styles.scrollContainer}
      >
        {videos.map((video) => (
          <div key={video.id} className={styles.slideItem}>
            <Link href={`/video/${video.id}`} className={styles.thumbnailLink}>
              <div className={styles.thumbnailContainer}>
                <img 
                  src={video.slider_url || video.thumbnail_url} 
                  alt={video.title}
                  className={styles.thumbnail}
                />
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Navigation Dots */}
      <div className={styles.dotsContainer}>
        {videos.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToVideo(index)}
            className={`${styles.dot} ${activeIndex === index ? styles.dotActive : styles.dotInactive}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}