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
    /* Main wrapper with mb-8 to create the space between dots and main feed */
    <div className="w-full bg-black pt-2 mb-8">
      
      {/* 1. Thumbnail Scroll Area */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-3 px-4"
      >
        {videos.map((video) => (
          <div key={video.id} className="min-w-[90%] snap-center">
            <Link href={`/video/${video.id}`} className="block relative group">
              <div className="aspect-video w-full bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-white/5">
                <img 
                  src={video.slider_url || video.thumbnail_url} 
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                {/* Visual "Destacado" badge from reference */}
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

      {/* 2. Navigation Dots - Separated with mt-8 to create space from thumbnail */}
      <div className="flex justify-center items-center gap-3 mt-8">
        {videos.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToVideo(index)}
            /* Forced h-2 w-2 with flex-none prevents the "dash" stretching */
            className={`flex-none h-2 w-2 rounded-full transition-all duration-300 ${
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