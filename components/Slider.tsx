"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

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

  // 1. Function to handle manual dot clicks
  const scrollToVideo = (index: number) => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.offsetWidth * 0.9;
    scrollRef.current.scrollTo({
      left: index * cardWidth,
      behavior: 'smooth'
    });
  };

  // 2. Listener to update dots on scroll
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const cardWidth = scrollRef.current.offsetWidth * 0.9;
    const newIndex = Math.round(scrollLeft / cardWidth);
    if (newIndex !== activeIndex) setActiveIndex(newIndex);
  };

  useEffect(() => {
    if (!scrollRef.current || videos.length <= 1) return;

    const interval = setInterval(() => {
      const container = scrollRef.current;
      if (!container) return;

      const cardWidth = container.offsetWidth * 0.9;
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
    <div className="w-full bg-black pb-2 pt-2">
      <div 
        ref={scrollRef}
        onScroll={handleScroll} // Detects scroll position
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-3 px-4"
      >
        {videos.map((video) => (
          <div key={video.id} className="min-w-[90%] snap-center">
            <Link href={`/video/${video.id}`} className="block relative group">
              <div className="aspect-video w-full bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-white/5">
                <img 
                  src={video.slider_url || video.thumbnail_url} 
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-700"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-5">
                  <div className="flex items-center gap-2">
                    <span className="bg-pink-600 text-[10px] text-white font-bold px-2 py-0.5 rounded-sm uppercase">
                      Destacado
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* 3. Navigation Dots */}
      <div className="flex justify-center items-center gap-2 mt-4 pb-2">
        {videos.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToVideo(index)} // Jump to video
            className={`transition-all duration-300 rounded-full ${
              activeIndex === index 
                ? 'w-2 h-2 bg-white' // Active dot
                : 'w-1.5 h-1.5 bg-zinc-600' // Inactive dots
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}