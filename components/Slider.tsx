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
    /* We use pb-8 and mb-4 to ensure a clear gap before the ThumbCards start */
    <div className="w-full bg-black pt-2 pb-8 mb-4 border-b border-white/5">
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

      {/* Navigation Dots - Explicit h/w for circular shape */}
      <div className="flex justify-center items-center gap-3 mt-6">
        {videos.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToVideo(index)}
            /* Forced 8px by 8px for perfect circles */
            className={`transition-all duration-300 rounded-full`}
            style={{ 
              width: '8px', 
              height: '8px', 
              backgroundColor: activeIndex === index ? 'white' : '#3f3f46' 
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}