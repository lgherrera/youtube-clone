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

  const scrollToVideo = (index: number) => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.offsetWidth * 0.9;
    scrollRef.current.scrollTo({
      left: index * cardWidth,
      behavior: 'smooth'
    });
  };

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
    /* mb-10 ensures a generous, equal gap between dots and the main feed */
    <div className="w-full bg-black pt-2 mb-10 block">
      
      {/* 1. Standardized 16:9 Slider Thumbnails */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-3 px-4"
      >
        {videos.map((video) => (
          <div key={video.id} className="min-w-[90%] snap-center flex-shrink-0">
            <Link href={`/video/${video.id}`} className="block relative group">
              {/* aspect-video (16:9) matches your ThumbCards perfectly */}
              <div className="aspect-video w-full bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-white/5">
                <img 
                  src={video.slider_url || video.thumbnail_url} 
                  alt={video.title}
                  className="w-full h-full object-cover"
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

      {/* 2. Navigation Dots - Forced circle shape and wider spacing */}
      <div className="flex justify-center items-center gap-5 mt-10">
        {videos.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToVideo(index)}
            /* flex-none and aspect-square prevents stretching into dashes */
            className={`flex-none w-2.5 h-2.5 aspect-square rounded-full transition-all duration-300 ${
              activeIndex === index 
                ? 'bg-white scale-125' 
                : 'bg-zinc-700'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}